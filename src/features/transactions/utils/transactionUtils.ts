import { supabase } from "@/integrations/supabase/client";
import type { Transaction } from "../types";

export const formatTransactionDescription = (description: string, amount: number, type: string): string => {
  if (type === 'deposit') {
    return `Deposit of $${amount}`;
  }

  if (type === 'trade_placement') {
    return `Trade placement: $${amount}`;
  }

  if (type === 'trade_payout') {
    return `Trade payout: $${amount}`;
  }

  if (type === 'withdrawal') {
    return `Withdrawal: $${amount}`;
  }

  if (type === 'referral_commission') {
    // Extract deposit amount from typical description format
    const match = description.match(/from deposit of \$([0-9.]+)/);
    if (match && match[1]) {
      const depositAmount = parseFloat(match[1]);
      return `Referral commission: $${amount} (5% of $${depositAmount})`;
    }
    return `Referral commission: $${amount}`;
  }

  return description;
};

// Fetch both deposits and transactions to ensure we have all deposit information
export const fetchDepositsAndWithdrawals = async (userId: string) => {
  console.log("[Transactions] Fetching deposits and withdrawals for user:", userId);
  
  // Fetch deposits
  const { data: depositsData, error: depositsError } = await supabase
    .from('deposits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (depositsError) {
    console.error("[Transactions] Error fetching deposits:", depositsError);
    throw depositsError;
  }
  
  // Fetch withdrawals
  const { data: withdrawalsData, error: withdrawalsError } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (withdrawalsError) {
    console.error("[Transactions] Error fetching withdrawals:", withdrawalsError);
    throw withdrawalsError;
  }
  
  console.log("[Transactions] Fetched deposits:", depositsData?.length);
  console.log("[Transactions] Fetched withdrawals:", withdrawalsData?.length);
  
  return { depositsData, withdrawalsData };
};

// Process deposit data into transaction records
export const processDepositTransactions = (
  depositsData: any[],
  existingTransactions: Transaction[]
): Transaction[] => {
  console.log("[Transactions] Processing deposit transactions:", depositsData?.length);
  
  // Map of existing deposit IDs to avoid duplicates
  const existingDepositsMap = new Map<string, boolean>();
  existingTransactions.forEach(t => {
    if (t.type === 'deposit' && t.id) {
      existingDepositsMap.set(t.id, true);
    }
  });
  
  // Create a map to store only the latest status for each deposit
  const latestDepositStatus = new Map<string, any>();
  
  // Process deposits to keep only the latest status for each deposit ID
  depositsData.forEach(deposit => {
    const currentDeposit = latestDepositStatus.get(deposit.id);
    
    // If we don't have this deposit yet, or this one is newer
    if (!currentDeposit || new Date(deposit.created_at) > new Date(currentDeposit.created_at)) {
      latestDepositStatus.set(deposit.id, deposit);
    }
    
    // If this deposit is approved, it should always override
    if (deposit.status === 'approved') {
      latestDepositStatus.set(deposit.id, deposit);
    }
  });

  // Convert the map values to transactions
  const depositTransactions: Transaction[] = Array.from(latestDepositStatus.values())
    .filter(deposit => !existingDepositsMap.has(deposit.id))
    .map(deposit => {
      const amount = deposit.total_usd_value || deposit.amount || 0;
      let status: 'pending' | 'completed' | 'failed' = 'pending';
      
      if (deposit.status === 'approved') {
        status = 'completed';
      } else if (deposit.status === 'rejected') {
        status = 'failed';
      }
      
      return {
        id: deposit.id,
        user_id: deposit.user_id,
        amount: amount,
        type: 'deposit',
        created_at: deposit.created_at,
        description: `Deposit of $${amount}`,
        status: status
      };
    });
  
  console.log("[Transactions] Created deposit transactions:", depositTransactions.length);
  return depositTransactions;
};

// Process withdrawal data into transaction records
export const processWithdrawalTransactions = (withdrawalsData: any[]): Transaction[] => {
  console.log("[Transactions] Processing withdrawal transactions:", withdrawalsData?.length);
  
  // Create transaction records for withdrawals
  const withdrawalTransactions = withdrawalsData.map(withdrawal => {
    const amount = withdrawal.amount || 0;
    let status: 'pending' | 'completed' | 'failed' = 'pending';
    
    if (withdrawal.status === 'approved') {
      status = 'completed';
    } else if (withdrawal.status === 'rejected') {
      status = 'failed';
    }
    
    return {
      id: withdrawal.id,
      user_id: withdrawal.user_id, // Add the user_id property here
      amount: amount,
      type: 'withdrawal' as const,
      created_at: withdrawal.created_at,
      description: `Withdrawal of $${amount} ${withdrawal.token} via ${withdrawal.network}`,
      status: status
    };
  });
  
  console.log("[Transactions] Created withdrawal transactions:", withdrawalTransactions.length);
  return withdrawalTransactions;
};
