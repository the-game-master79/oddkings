
import { supabase } from "@/integrations/supabase/client";

export interface TradeDetails {
  prediction: string;
  questionId: string;
  category?: string; // Added category to match what's used in processTradeTransactions
}

export interface QuestionDetails {
  status: string;
  question: string;
}

export const fetchTradeStatuses = async (tradeIds: string[]) => {
  const tradeStatusMap = new Map<string, string>();
  const tradeDetailsMap = new Map<string, TradeDetails>();

  if (tradeIds.length === 0) return { tradeStatusMap, tradeDetailsMap };

  // First check main trades table
  const { data: tradesData, error: tradesError } = await supabase
    .from('trades')
    .select('id, status, prediction, question_id, questions(category)')
    .in('id', tradeIds);
    
  if (tradesError) {
    console.error("[Transactions] Error fetching trades:", tradesError);
  } else if (tradesData) {
    console.log("[Transactions] Main trades statuses:", tradesData);
    tradesData.forEach(trade => {
      tradeStatusMap.set(trade.id, trade.status);
      tradeDetailsMap.set(trade.id, {
        prediction: trade.prediction,
        questionId: trade.question_id,
        category: trade.questions?.category || 'Unknown'
      });
    });
  }
  
  // Then check news trades table
  const { data: newsTradesData, error: newsTradesError } = await supabase
    .from('news_trades')
    .select('id, status, prediction, question_id, questions(category)')
    .in('id', tradeIds);
    
  if (newsTradesError) {
    console.error("[Transactions] Error fetching news trades:", newsTradesError);
  } else if (newsTradesData) {
    console.log("[Transactions] News trades statuses:", newsTradesData);
    newsTradesData.forEach(trade => {
      if (!tradeStatusMap.has(trade.id)) {
        tradeStatusMap.set(trade.id, trade.status);
        tradeDetailsMap.set(trade.id, {
          prediction: trade.prediction,
          questionId: trade.question_id,
          category: trade.questions?.category || 'Unknown'
        });
      }
    });
  }

  return { tradeStatusMap, tradeDetailsMap };
};

export const fetchQuestionStatuses = async (questionIds: string[]) => {
  const questionStatusMap = new Map<string, QuestionDetails>();
  
  if (questionIds.length === 0) return questionStatusMap;

  const { data: questionsData, error: questionsError } = await supabase
    .from('questions')
    .select('id, status, question, category')
    .in('id', questionIds);
    
  if (questionsError) {
    console.error("[Transactions] Error fetching question statuses:", questionsError);
  } else if (questionsData) {
    console.log("[Transactions] Question statuses:", questionsData);
    questionsData.forEach(question => {
      questionStatusMap.set(question.id, {
        status: question.status,
        question: question.question
      });
    });
  }

  return questionStatusMap;
};
