import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "../types";
import { fetchTradeStatuses, fetchQuestionStatuses } from "../utils/tradeUtils";
import { processTradeTransactions } from "../utils/processTradeTransactions";
import {
  fetchDepositsAndWithdrawals,
  processDepositTransactions,
  processWithdrawalTransactions
} from "../utils/transactionUtils";

export const useTransactions = () => {
  return useQuery({
    queryKey: ['user-transactions'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');
      
      const userId = session.user.id;
      console.log("[Transactions] Fetching transactions for user:", userId);
      
      // Fetch transactions from the transactions table
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (transactionsError) {
        console.error("[Transactions] Error fetching transactions:", transactionsError);
        throw transactionsError;
      }
      
      console.log("[Transactions] Fetched transactions:", transactionsData?.length);
      
      // Extract trade IDs to fetch their statuses
      const tradeIds = transactionsData
        ?.filter(t => t.trade_id)
        .map(t => t.trade_id) || [];
      
      // Get trade statuses (completed, failed, etc.)
      const { tradeStatusMap, tradeDetailsMap } = await fetchTradeStatuses(tradeIds);
      
      // Extract question IDs to fetch their statuses
      const questionIds = Array.from(tradeDetailsMap.values())
        .map(details => details.questionId)
        .filter(Boolean);
      
      // Get question statuses (resolved_yes, resolved_no, etc.)
      const questionStatusMap = await fetchQuestionStatuses(questionIds);
      
      // Process the transaction data
      const processedTransactions = processTradeTransactions(
        transactionsData || [],
        tradeStatusMap,
        tradeDetailsMap, // Pass the entire details map, the processing function will handle it
        questionStatusMap
      );
      
      console.log("[Transactions] Processed transactions:", processedTransactions.length);
      
      // Now also fetch deposits and withdrawals
      const { depositsData, withdrawalsData } = await fetchDepositsAndWithdrawals(userId);
      
      // Create transaction records for deposits
      const depositTransactions = processDepositTransactions(depositsData || [], processedTransactions);
      
      // Create transaction records for withdrawals
      const withdrawalTransactions = processWithdrawalTransactions(withdrawalsData || []);
      
      // Combine all transactions
      const allTransactions = [
        ...processedTransactions,
        ...depositTransactions,
        ...withdrawalTransactions
      ];
      
      // Sort by created_at descending
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      
      console.log("[Transactions] Total combined transactions:", allTransactions.length);
      return allTransactions;
    },
    refetchInterval: 5000 // Reduce interval to 5 seconds for more frequent updates
  });
};
