import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTradeBuilder } from "@/context/TradeBuilderContext";

export function useTradeValidation() {
  const { trades, removeTrade } = useTradeBuilder();

  return useQuery({
    queryKey: ['validate-trades', trades.map(t => t.questionId)],
    queryFn: async () => {
      const sportQuestions = trades
        .filter(t => t.questionId.startsWith('sport_'))
        .map(t => t.questionId.replace('sport_', ''));

      const newsQuestions = trades
        .filter(t => !t.questionId.startsWith('sport_'))
        .map(t => t.questionId);

      // Validate sport questions
      if (sportQuestions.length > 0) {
        const { data: sportData } = await supabase
          .from('sport_questions')
          .select('id, status')
          .in('id', sportQuestions);

        const validSportIds = new Set(sportData?.map(q => `sport_${q.id}`) || []);
        const activeSportIds = new Set(
          sportData
            ?.filter(q => !q.status?.startsWith('resolved_'))
            .map(q => `sport_${q.id}`) || []
        );

        trades
          .filter(t => t.questionId.startsWith('sport_'))
          .forEach(trade => {
            if (!validSportIds.has(trade.questionId)) {
              console.log(`Removing invalid sport question ${trade.questionId}`);
              removeTrade(trade.questionId);
            } else if (!activeSportIds.has(trade.questionId)) {
              console.log(`Removing resolved sport question ${trade.questionId}`);
              removeTrade(trade.questionId);
            }
          });
      }

      // Validate news questions
      if (newsQuestions.length > 0) {
        const { data: newsData } = await supabase
          .from('questions')
          .select('id, status')
          .in('id', newsQuestions);

        const validNewsIds = new Set(newsData?.map(q => q.id) || []);
        const activeNewsIds = new Set(
          newsData
            ?.filter(q => !q.status?.startsWith('resolved_'))
            .map(q => q.id) || []
        );

        trades
          .filter(t => !t.questionId.startsWith('sport_'))
          .forEach(trade => {
            if (!validNewsIds.has(trade.questionId)) {
              console.log(`Removing invalid news question ${trade.questionId}`);
              removeTrade(trade.questionId);
            } else if (!activeNewsIds.has(trade.questionId)) {
              console.log(`Removing resolved news question ${trade.questionId}`);
              removeTrade(trade.questionId);
            }
          });
      }

      return true;
    },
    refetchInterval: 30000, // Validate every 30 seconds
    enabled: trades.length > 0,
  });
}
