
/**
 * Utility functions for validating news trade placement
 */

/**
 * Validate if a trade amount string is a valid number format
 */
export const isValidTradeAmountFormat = (value: string): boolean => {
  return /^\d*\.?\d*$/.test(value) || value === '';
};

/**
 * Check if the trade amount is valid (positive number within user's balance)
 */
export const isTradeAmountValid = (tradeAmount: string, userBalance: number): boolean => {
  const amount = parseFloat(tradeAmount);
  return !isNaN(amount) && amount > 0 && amount <= userBalance;
};

/**
 * Calculate the user's balance after deducting a trade amount
 */
export const getBalanceAfterDeduction = (tradeAmount: string, userBalance: number): string => {
  const amount = parseFloat(tradeAmount) || 0;
  return Math.max(0, userBalance - amount).toFixed(2);
};
