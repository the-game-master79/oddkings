
import { Transaction } from "../types";

// Define the TradeDetails interface to match what's being passed
interface TradeDetails {
  prediction: string;
  questionId: string;
  category?: string;
}

// Define the QuestionDetails interface to match what's being used
interface QuestionDetails {
  status: string;
  question: string;
}

export const processTradeTransactions = (
  transactions: any[],
  tradeStatusMap: Map<string, string>,
  tradeDetailsMap: Map<string, TradeDetails>, // Updated type to match what's being passed
  questionStatusMap: Map<string, QuestionDetails> // Updated type to match what's being used
): Transaction[] => {
  return transactions
    .map(transaction => {
      // Skip if not a trade-related transaction
      if (
        !transaction.trade_id ||
        (transaction.type !== 'trade_placement' && 
         transaction.type !== 'trade_payout')
      ) {
        return transaction as Transaction;
      }

      const tradeId = transaction.trade_id;
      const status = tradeStatusMap.get(tradeId) || 'pending';
      const details = tradeDetailsMap.get(tradeId);
      
      // Skip if we don't have the associated trade details
      if (!details) {
        return transaction as Transaction;
      }

      const questionId = details.questionId;
      const questionDetails = questionId ? questionStatusMap.get(questionId) : null;
      const questionStatus = questionDetails ? questionDetails.status : null;
      const prediction = details.prediction || 'unknown';
      const questionText = questionDetails ? questionDetails.question : 'Unknown Question';
      const category = details.category || 'Unknown';
      
      // Format description based on the transaction type
      let description = transaction.description;
      
      if (transaction.description.includes('SPORT_QUESTION:') || 
          transaction.description.includes('SPORT_TRADE:')) {
        // Sports trade
        if (transaction.type === 'trade_placement') {
          description = `Sports Trade of $${transaction.amount.toFixed(2)} on ${prediction}`;
        } else if (transaction.type === 'trade_payout') {
          description = `Trade Payout for ${questionText}`;
        }
      } else if (transaction.description.includes('NEWS_QUESTION:')) {
        // News trade
        if (transaction.type === 'trade_placement') {
          description = `News Trade of $${transaction.amount.toFixed(2)} on ${prediction}`;
        } else if (transaction.type === 'trade_payout') {
          description = `Trade Payout for ${questionText}`;
        }
      }

      return {
        ...transaction,
        description,
        trade_status: status,
        question_status: questionStatus,
        category: category // Add category to processed transaction
      } as Transaction;
    });
};
