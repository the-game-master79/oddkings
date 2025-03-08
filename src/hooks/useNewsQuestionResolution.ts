import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResolveNewsQuestionParams {
  questionId: string;
  winningPrediction: "yes" | "no";
}

export const useNewsQuestionResolution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, winningPrediction }: ResolveNewsQuestionParams) => {
      try {
        console.log(`Resolving news question ${questionId} with ${winningPrediction.toUpperCase()} outcome`);
        
        // Step 1: Update the question status
        const { error: updateError } = await supabase
          .from('questions')
          .update({ 
            status: `resolved_${winningPrediction}`,
            resolved_at: new Date().toISOString(),
            resolved_by: (await supabase.auth.getSession()).data.session?.user.id
          })
          .eq('id', questionId);
          
        if (updateError) {
          console.error('Error updating question status:', updateError);
          throw updateError;
        }

        // Step 2: Get all trades for this question
        const { data: trades, error: tradesError } = await supabase
          .from('news_trades')
          .select('*')
          .eq('question_id', questionId);
          
        if (tradesError) {
          console.error('Error fetching trades:', tradesError);
          throw tradesError;
        }

        console.log(`Processing ${trades?.length || 0} trades for question ${questionId}`);
        
        // Step 3: Process each trade
        for (const trade of (trades || [])) {
          // Update the trade status based on prediction
          const isWinner = trade.prediction === winningPrediction;
          const newStatus = isWinner ? 'completed' : 'failed';
          
          // Update the trade status
          const { error: tradeUpdateError } = await supabase
            .from('news_trades')
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
            const { error: updateBalanceError } = await supabase
              .from('user_balances')
              .update({ total_usd_value: newBalance })
              .eq('user_id', trade.user_id);

            if (updateBalanceError) {
              console.error('Error updating balance:', updateBalanceError);
              throw updateBalanceError;
            }

            // Create payout transaction record
            await supabase
              .from('transactions')
              .insert({
                user_id: trade.user_id,
                amount: trade.payout,
                type: 'trade_payout',
                description: `WON: News trade payout`,
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
                description: `LOST: News trade on question ${questionId}`
              })
              .eq('trade_id', trade.id)
              .eq('type', 'trade_placement');
              
            if (txUpdateError) {
              console.error(`Error updating transaction for losing trade ${trade.id}:`, txUpdateError);
            }
          }
        }
        
        return { success: true, message: `Question resolved as ${winningPrediction.toUpperCase()}` };
      } catch (error) {
        console.error(`Error resolving question as ${winningPrediction.toUpperCase()}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Question resolved successfully');
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['trade-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
    },
    onError: (error: any) => {
      console.error('Failed to resolve question:', error);
      toast.error('Failed to resolve question');
    }
  });
};
