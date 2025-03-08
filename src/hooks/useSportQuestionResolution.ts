import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSportQuestionResolution() {
  const queryClient = useQueryClient();

  // Helper function to resolve related questions
  const resolveRelatedQuestions = async (questionId: string, outcome: 'yes' | 'no') => {
    try {
      // Get the match ID for this question
      const { data: mainQuestion, error: questionError } = await supabase
        .from('sport_questions')
        .select('match_id, category')
        .eq('id', questionId)
        .single();

      if (questionError) {
        console.error('Error fetching main question:', questionError);
        throw questionError;
      }

      // Only proceed if this is a Winner category question
      if (mainQuestion.category !== 'Winner') {
        console.log('Not a Winner category question, skipping related resolution');
        return;
      }

      // Get all related Winner category questions for this match
      const { data: relatedQuestions, error: relatedError } = await supabase
        .from('sport_questions')
        .select('*')
        .eq('match_id', mainQuestion.match_id)
        .eq('category', 'Winner')
        .neq('id', questionId) // Exclude the current question
        .eq('status', 'active'); // Only resolve active questions

      if (relatedError) {
        console.error('Error fetching related questions:', relatedError);
        throw relatedError;
      }

      console.log(`Found ${relatedQuestions?.length} related Winner questions to resolve`);

      // Resolve each related question with the opposite outcome
      for (const relatedQuestion of (relatedQuestions || [])) {
        const oppositeOutcome = outcome === 'yes' ? 'resolved_no' : 'resolved_yes';
        
        // Update the related question status
        const { error: updateError } = await supabase
          .from('sport_questions')
          .update({
            status: oppositeOutcome,
            resolved_at: new Date().toISOString(),
            resolved_by: (await supabase.auth.getSession()).data.session?.user.id
          })
          .eq('id', relatedQuestion.id);

        if (updateError) {
          console.error(`Error updating related question ${relatedQuestion.id}:`, updateError);
          continue;
        }

        // Process trades for the related question
        await processQuestionTrades(relatedQuestion.id, oppositeOutcome === 'resolved_yes');
      }
    } catch (error) {
      console.error('Error in resolveRelatedQuestions:', error);
    }
  };

  // Helper function to process trades for a question
  const processQuestionTrades = async (questionId: string, isYesOutcome: boolean) => {
    try {
      // Step 2: Get all trades for this question
      const { data: trades, error: tradesError } = await supabase
        .from('sport_trades')
        .select('*')
        .eq('sport_question_id', questionId);
        
      if (tradesError) {
        console.error('Error fetching trades:', tradesError);
        throw tradesError;
      }

      console.log(`Processing ${trades?.length || 0} trades for question ${questionId}`);
      
      // Step 3: Process each trade
      for (const trade of (trades || [])) {
        // Update the trade status based on prediction
        const isWinner = trade.prediction.toLowerCase() === (isYesOutcome ? 'yes' : 'no');
        const newStatus = isWinner ? 'completed' : 'failed';
        
        // Update the trade status
        const { error: tradeUpdateError } = await supabase
          .from('sport_trades')
          .update({ status: newStatus })
          .eq('id', trade.id);
          
        if (tradeUpdateError) {
          console.error(`Error updating trade ${trade.id} status:`, tradeUpdateError);
          continue; // Continue with other trades even if one fails
        }
        
        // If it's a winning trade, add payout to user balance
        if (isWinner) {
          console.log(`Processing winning trade ${trade.id} for user ${trade.user_id} with payout $${trade.payout}`);
          
          // Get current user balance
          const { data: balanceData, error: balanceError } = await supabase
            .from('user_balances')
            .select('total_usd_value')
            .eq('user_id', trade.user_id)
            .single();

          if (balanceError) {
            console.error('Error getting balance:', balanceError);
            throw balanceError;
          }

          // Update balance with trade payout
          const newBalance = (balanceData?.total_usd_value || 0) + trade.payout;
          const { error: updateError } = await supabase
            .from('user_balances')
            .update({ total_usd_value: newBalance })
            .eq('user_id', trade.user_id);

          if (updateError) {
            console.error('Error updating balance:', updateError);
            throw updateError;
          }

          // Create payout transaction record
          await supabase
            .from('transactions')
            .insert({
              user_id: trade.user_id,
              amount: trade.payout,
              type: 'trade_payout',
              description: `WON: Sport trade payout`,
              trade_id: trade.id,
              status: 'completed'
            });

          // Also mark trade placement transaction as completed
          const { error: placementTxError } = await supabase
            .from('transactions')
            .update({
              status: 'completed',
              description: `WON: ${questionId} - Trade placement`
            })
            .eq('trade_id', trade.id)
            .eq('type', 'trade_placement');
            
          if (placementTxError) {
            console.error(`Error updating placement transaction for trade ${trade.id}:`, placementTxError);
          }
        } else {
          // For losing trades, update the transaction status
          const { error: txUpdateError } = await supabase
            .from('transactions')
            .update({ 
              status: 'failed',
              description: `LOST: Sport trade on question ${questionId}`
            })
            .eq('trade_id', trade.id)
            .eq('type', 'trade_placement');
            
          if (txUpdateError) {
            console.error(`Error updating transaction for losing trade ${trade.id}:`, txUpdateError);
          }
        }
      }
    } catch (error) {
      console.error('Error processing trades:', error);
      throw error;
    }
  };

  const resolveYesMutation = useMutation({
    mutationFn: async (questionId: string) => {
      try {
        // Update main question first
        const result = await resolveMainQuestion(questionId, 'resolved_yes');
        
        // Then handle related questions
        await resolveRelatedQuestions(questionId, 'yes');
        
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Question successfully resolved as Yes');
      queryClient.invalidateQueries({ queryKey: ['sport-questions'] });
      queryClient.invalidateQueries({ queryKey: ['trade-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
    },
    onError: (error: any) => {
      console.error('Failed to resolve question:', error);
      toast.error('Failed to resolve question as Yes');
    }
  });

  const resolveNoMutation = useMutation({
    mutationFn: async (questionId: string) => {
      try {
        // Update main question first
        const result = await resolveMainQuestion(questionId, 'resolved_no');
        
        // Then handle related questions
        await resolveRelatedQuestions(questionId, 'no');
        
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Question successfully resolved as No');
      queryClient.invalidateQueries({ queryKey: ['sport-questions'] });
      queryClient.invalidateQueries({ queryKey: ['trade-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
    },
    onError: (error: any) => {
      console.error('Failed to resolve question:', error);
      toast.error('Failed to resolve question as No');
    }
  });

  // Helper function to resolve the main question
  const resolveMainQuestion = async (questionId: string, status: 'resolved_yes' | 'resolved_no') => {
    const { error: updateError } = await supabase
      .from('sport_questions')
      .update({
        status,
        resolved_at: new Date().toISOString(),
        resolved_by: (await supabase.auth.getSession()).data.session?.user.id
      })
      .eq('id', questionId);

    if (updateError) throw updateError;

    // Process trades for the main question
    await processQuestionTrades(questionId, status === 'resolved_yes');

    return { success: true, message: `Question resolved as ${status.split('_')[1].toUpperCase()}` };
  };

  return {
    resolveYes: resolveYesMutation.mutate,
    resolveNo: resolveNoMutation.mutate,
    isResolvingYes: resolveYesMutation.isPending,
    isResolvingNo: resolveNoMutation.isPending,
    error: resolveYesMutation.error || resolveNoMutation.error,
  };
}
