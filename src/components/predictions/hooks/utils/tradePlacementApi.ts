
import { supabase } from "@/integrations/supabase/client";

/**
 * API functions for news trade placement
 */

/**
 * Check if a user has sufficient balance for a trade
 */
export const checkUserBalance = async (userId: string, amount: number) => {
  const { data, error } = await supabase
    .from('user_balances')
    .select('total_usd_value')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error("Error checking balance:", error);
    throw new Error("Could not verify your balance");
  }
  
  if (data.total_usd_value < amount) {
    throw new Error(`Insufficient balance. Available: ${data.total_usd_value}, Required: ${amount}`);
  }
  
  return data;
};

/**
 * Verify that a question exists and is active
 */
export const verifyQuestionStatus = async (questionId: string) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single();
  
  if (error) {
    console.error("Error checking question:", error);
    throw new Error("Question not found");
  }
  
  if (!data) {
    throw new Error("Question not found");
  }
  
  if (data.status !== 'active') {
    throw new Error("Question is not active");
  }
  
  return data;
};

/**
 * Create a news trade record
 */
export const createNewsTradeRecord = async (
  tradeId: string,
  userId: string, 
  questionId: string,
  amount: number,
  prediction: "yes" | "no",
  payout: number
) => {
  const { data, error } = await supabase
    .from('news_trades')
    .insert({
      id: tradeId,
      user_id: userId,
      question_id: questionId,
      amount: amount,
      prediction: prediction,
      payout: payout,
      status: 'pending'
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating news trade:", error);
    throw new Error("Failed to create news trade: " + error.message);
  }
  
  console.log("News trade created successfully:", data);
  return data;
};

/**
 * Update user balance after trade placement
 */
export const updateUserBalanceAfterTrade = async (userId: string, currentBalance: number, tradeAmount: number) => {
  const { error } = await supabase
    .from('user_balances')
    .update({ total_usd_value: currentBalance - tradeAmount })
    .eq('user_id', userId);
  
  if (error) {
    throw new Error("Failed to update balance: " + error.message);
  }
};

/**
 * Create a transaction record for a trade
 */
export const createTradeTransaction = async (
  userId: string,
  amount: number,
  tradeId: string,
  question: string,
  category: string,
  selectedOption: "yes" | "no"
) => {
  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: amount,
      type: 'trade_placement',
      description: `Trade placement of $${amount} on ${selectedOption} for "${question}" (${category})`,
      trade_id: tradeId
    });
    
  if (error) {
    throw new Error("Failed to record transaction: " + error.message);
  }
};

/**
 * Handle cleaning up a failed trade
 */
export const cleanupFailedTrade = async (tradeId: string, userId: string, originalBalance: number) => {
  // Delete the trade record
  await supabase.from('news_trades').delete().eq('id', tradeId);
  
  // Restore user balance
  await supabase
    .from('user_balances')
    .update({ total_usd_value: originalBalance })
    .eq('user_id', userId);
};
