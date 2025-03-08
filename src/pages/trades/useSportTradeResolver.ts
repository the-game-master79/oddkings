
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResolveSportTradeParams {
  tradeId: string;
  winningPrediction: "yes" | "no";
}

export function useSportTradeResolver() {
  const queryClient = useQueryClient();

  const resolveTradeMutation = useMutation({
    mutationFn: async ({ tradeId, winningPrediction }: ResolveSportTradeParams) => {
      try {
        // Get the trade details
        const { data: trade, error: tradeError } = await supabase
          .from('sport_trades')
          .select('*')
          .eq('id', tradeId)
          .single();

        if (tradeError) {
          console.error('Error fetching trade:', tradeError);
          throw tradeError;
        }

        if (!trade) {
          throw new Error('Trade not found');
        }

        // Check if the prediction matches
        const isWinner = trade.prediction.toLowerCase() === winningPrediction.toLowerCase();
        const newStatus = isWinner ? 'completed' : 'failed';

        // Update the trade status
        const { error: updateError } = await supabase
          .from('sport_trades')
          .update({ status: newStatus })
          .eq('id', tradeId);

        if (updateError) {
          console.error('Error updating trade status:', updateError);
          throw updateError;
        }

        // If it's a winning trade, add payout to user balance
        if (isWinner) {
          console.log(`Processing winning trade ${trade.id} with payout $${trade.payout}`);
          
          // Create a transaction record for the payout
          const { error: txError } = await supabase
            .from('transactions')
            .insert({
              user_id: trade.user_id,
              amount: trade.payout,
              type: 'trade_payout',
              description: `WON: Sport trade - Received payout of $${trade.payout}`,
              trade_id: tradeId,
              status: 'completed'
            });
          
          if (txError) {
            console.error('Error creating payout transaction:', txError);
            throw txError;
          }
          
          // Get current user balance
          const { data: balanceData, error: balanceQueryError } = await supabase
            .from('user_balances')
            .select('total_usd_value')
            .eq('user_id', trade.user_id)
            .single();
            
          if (balanceQueryError) {
            console.error(`Error getting balance for user ${trade.user_id}:`, balanceQueryError);
            throw balanceQueryError;
          }
          
          // Update user balance directly
          const currentBalance = balanceData?.total_usd_value || 0;
          const newBalance = currentBalance + trade.payout;
          
          const { error: balanceUpdateError } = await supabase
            .from('user_balances')
            .update({ total_usd_value: newBalance })
            .eq('user_id', trade.user_id);
            
          if (balanceUpdateError) {
            console.error('Error updating user balance:', balanceUpdateError);
            throw balanceUpdateError;
          }
          
          // Update existing trade placement transaction
          const { error: placementTxError } = await supabase
            .from('transactions')
            .update({
              status: 'completed',
              description: `WON: Trade placement`
            })
            .eq('trade_id', tradeId)
            .eq('type', 'trade_placement');
            
          if (placementTxError) {
            console.error('Error updating placement transaction:', placementTxError);
            // Don't throw here, it's not critical
          }
        } else {
          // For losing trades, mark transaction as failed
          const { error: txUpdateError } = await supabase
            .from('transactions')
            .update({ 
              status: 'failed',
              description: `LOST: Sport trade`
            })
            .eq('trade_id', tradeId)
            .eq('type', 'trade_placement');
            
          if (txUpdateError) {
            console.error('Error updating transaction for losing trade:', txUpdateError);
            // Don't throw here, it's not critical
          }
        }

        return { success: true, winner: isWinner };
      } catch (error) {
        console.error('Error resolving trade:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Trade successfully resolved');
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sport-trades'] });
      queryClient.invalidateQueries({ queryKey: ['trade-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
    },
    onError: (error: any) => {
      console.error('Failed to resolve trade:', error);
      toast.error('Failed to resolve trade');
    }
  });

  return {
    resolveTrade: resolveTradeMutation.mutate,
    isResolving: resolveTradeMutation.isPending,
    error: resolveTradeMutation.error
  };
}
