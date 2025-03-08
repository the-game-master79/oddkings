import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTradeBuilder } from "@/context/TradeBuilderContext";

interface Trade {
  questionId: string;
  question: string;
  category: string; // Only for UI display
  option: 'yes' | 'no';
  amount?: number;
  payout: number;
}

export const useMultiTradePlacement = () => {
  const queryClient = useQueryClient();
  const { clearTrades } = useTradeBuilder();

  return useMutation({
    mutationFn: async (trades: Trade[]) => {
      try {
        if (!trades.length) {
          throw new Error("No trades to submit");
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const totalAmount = trades.reduce((sum, trade) => sum + (trade.amount || 0), 0);

        // Check user balance
        const { data: balanceData } = await supabase
          .from('user_balances')
          .select('total_usd_value')
          .eq('user_id', session.user.id)
          .single();

        if (!balanceData || balanceData.total_usd_value < totalAmount) {
          throw new Error("Insufficient balance");
        }

        // Separate sports and news trades
        const sportsTrades = trades.filter(trade => trade.questionId.startsWith('sport_'));
        const newsTrades = trades.filter(trade => !trade.questionId.startsWith('sport_'));

        // Process sports trades
        for (const trade of sportsTrades) {
          const { error: sportTradeError } = await supabase
            .from('sport_trades')
            .insert({
              user_id: session.user.id,
              sport_question_id: trade.questionId.replace('sport_', ''), // Remove prefix for sports trades
              amount: trade.amount,
              prediction: trade.option,
              payout: trade.amount! * (1 + trade.payout / 100),
              status: 'pending'
            });

          if (sportTradeError) throw sportTradeError;
        }

        // Process news trades
        for (const trade of newsTrades) {
          const { error: newsTradeError } = await supabase
            .from('news_trades')
            .insert({
              user_id: session.user.id,
              question_id: trade.questionId,
              amount: trade.amount,
              prediction: trade.option,
              payout: trade.amount! * (1 + trade.payout / 100),
              status: 'pending'
            });

          if (newsTradeError) throw newsTradeError;
        }

        // Update user balance
        const { error: balanceError } = await supabase
          .from('user_balances')
          .update({ 
            total_usd_value: balanceData.total_usd_value - totalAmount 
          })
          .eq('user_id', session.user.id);

        if (balanceError) throw balanceError;

        // Record transaction
        const { error: txError } = await supabase
          .from('transactions')
          .insert({
            user_id: session.user.id,
            amount: -totalAmount,
            type: 'trade_placement',
            description: `Multiple trades placed: ${trades.length} trades`,
            status: 'completed'
          });

        if (txError) throw txError;

        return true;
      } catch (error) {
        console.error('Trade placement error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("All trades placed successfully");
      clearTrades();
      queryClient.invalidateQueries({ queryKey: ['active-questions'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
      queryClient.invalidateQueries({ queryKey: ['trade-history'] });
    },
    onError: (error: Error) => {
      console.error("Failed to place trades:", error);
      toast.error(error.message || "Failed to place trades");
    }
  });
};
