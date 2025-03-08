
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SportQuestion } from "@/types/sports";

interface TradePlacementProps {
  question: SportQuestion | null;
  selectedOption: "yes" | "no" | null;
  userBalance: number;
  onSuccess: () => void;
  closeTradeSheet: () => void;
}

export const useTradePlacement = ({
  question,
  selectedOption,
  userBalance,
  onSuccess,
  closeTradeSheet
}: TradePlacementProps) => {
  const [tradeAmount, setTradeAmount] = useState("");
  const queryClient = useQueryClient();
  
  const handleTradeAmountChange = (value: string) => {
    // Allow only numeric values and decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setTradeAmount(value);
    }
  };
  
  const isTradeAmountValid = () => {
    const amount = parseFloat(tradeAmount);
    return !isNaN(amount) && amount > 0 && amount <= userBalance;
  };
  
  const placeTrade = useMutation({
    mutationFn: async () => {
      if (!question || !selectedOption || !tradeAmount) {
        throw new Error("Missing required trade information");
      }
      
      const amount = parseFloat(tradeAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid trade amount");
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      
      // Calculate potential payout
      const percentage = selectedOption === "yes" ? question.yes_value : question.no_value;
      const potentialPayout = amount + (amount * percentage / 100);
      
      console.log(`Placing trade for question: ${question.id}, option: ${selectedOption}, amount: ${amount}`);
      
      try {
        // Generate a uuid for the trade id
        const tradeId = crypto.randomUUID();
        
        // Insert directly into sport_trades table to ensure the trade is properly recorded
        const { data: sportTradeData, error: sportTradeError } = await supabase
          .from('sport_trades')
          .insert({
            id: tradeId,
            user_id: session.user.id,
            sport_question_id: question.id,
            amount: amount,
            prediction: selectedOption,
            payout: potentialPayout,
            status: 'pending'
          })
          .select()
          .single();
          
        if (sportTradeError) {
          console.error("Error creating sport trade:", sportTradeError);
          throw sportTradeError;
        }
        
        console.log("Sport trade created:", sportTradeData);
        
        // Create transaction record with improved description
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .insert({
            user_id: session.user.id,
            amount: amount,
            type: 'trade_placement',
            description: `SPORT_TRADE:${question.id} - Sports Trade of $${amount.toFixed(2)} on ${selectedOption}`,
            trade_id: tradeId,
            status: 'pending'
          })
          .select()
          .single();
          
        if (txError) {
          console.error("Error creating transaction:", txError);
          throw txError;
        }
        
        console.log("Transaction created:", txData);
        
        // Update question's yes/no values to reflect user choice
        const field = selectedOption === 'yes' ? 'yes_value' : 'no_value';
        const { data: questionData, error: questionError } = await supabase
          .from('sport_questions')
          .select(field)
          .eq('id', question.id)
          .single();
        
        if (!questionError && questionData) {
          const currentValue = questionData[field];
          
          // Increment the value
          await supabase
            .from('sport_questions')
            .update({ [field]: currentValue + 1 })
            .eq('id', question.id);
        }
        
        // Update user balance directly
        const { error: balanceError } = await supabase
          .from('user_balances')
          .update({ total_usd_value: userBalance - amount })
          .eq('user_id', session.user.id);
          
        if (balanceError) {
          console.error("Error updating user balance:", balanceError);
          throw balanceError;
        }
        
        return { tradeId };
      } catch (error: any) {
        console.error("Error in trade placement:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Trade placed successfully");
      queryClient.invalidateQueries({ queryKey: ['sport-questions'] });
      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
      setTradeAmount("");
      onSuccess();
      closeTradeSheet();
    },
    onError: (error: Error) => {
      console.error("Trade error:", error);
      toast.error(error.message || "Failed to place trade");
    }
  });
  
  const handleSubmitTrade = () => {
    if (!isTradeAmountValid()) {
      toast.error("Invalid trade amount");
      return;
    }
    
    if (!selectedOption) {
      toast.error("Please select Yes or No option");
      return;
    }
    
    placeTrade.mutate();
  };

  return {
    tradeAmount,
    handleTradeAmountChange,
    isTradeAmountValid,
    placeTrade,
    handleSubmitTrade
  };
};
