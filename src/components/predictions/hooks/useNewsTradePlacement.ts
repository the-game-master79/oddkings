import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  isValidTradeAmountFormat, 
  isTradeAmountValid, 
  getBalanceAfterDeduction 
} from "./utils/tradePlacementValidation";

interface UseNewsTradePlacementProps {
  questionId: string;
  question: string;
  category: string;
  selectedOption: "yes" | "no" | null;
  userBalance: number;
  yesPercentage: number;
  noPercentage: number;
  onClose: () => void;
}

export const useNewsTradePlacement = ({
  questionId,
  question,
  category,
  selectedOption,
  userBalance,
  yesPercentage,
  noPercentage,
  onClose,
}: UseNewsTradePlacementProps) => {
  const [tradeAmount, setTradeAmount] = useState("");
  const queryClient = useQueryClient();
  
  const handleTradeAmountChange = (value: string) => {
    // Allow only numeric values and decimal point
    if (isValidTradeAmountFormat(value)) {
      setTradeAmount(value);
    }
  };
  
  const placeTrade = useMutation({
    mutationFn: async () => {
      if (!questionId || !selectedOption || !tradeAmount) {
        throw new Error("Missing required trade information");
      }
      
      const amount = parseFloat(tradeAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid trade amount");
      }
      
      // Calculate potential payout (trade amount + bonus)
      const percentage = selectedOption === "yes" ? yesPercentage : noPercentage;
      const potentialPayout = amount + (amount * (percentage / 100));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      
      console.log("Placing news trade for question:", questionId, selectedOption, amount);
      
      try {
        // Get current trade count first
        const { data: currentTrades, error: countError } = await supabase
          .from('news_trades')
          .select('prediction', { count: 'exact' })
          .eq('question_id', questionId)
          .eq('prediction', selectedOption);
        
        if (countError) throw countError;

        // Using handle_trade_placement RPC function to place the trade correctly
        const { data: tradeData, error: tradeError } = await supabase.rpc(
          'handle_trade_placement',
          {
            p_user_id: session.user.id,
            p_question_id: questionId,
            p_amount: amount,
            p_prediction: selectedOption,
            p_payout: potentialPayout
          }
        );
        
        if (tradeError) {
          console.error("Error placing trade:", tradeError);
          throw new Error(tradeError.message || "Failed to place trade");
        }
        
        console.log("Trade placed successfully:", tradeData);
        
        // Also update question's yes/no values to reflect user choice
        const updateField = selectedOption === 'yes' ? 'yes_value' : 'no_value';
        
        // First get the current value
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .select(updateField)
          .eq('id', questionId)
          .maybeSingle();
        
        if (questionError) {
          console.error("Error fetching question data:", questionError);
        } else if (questionData) {
          // Then update with new value
          const newValue = (questionData[updateField] || 0) + amount;
          const { error: updateError } = await supabase
            .from('questions')
            .update({ [updateField]: newValue })
            .eq('id', questionId);
          
          if (updateError) {
            console.error("Error updating question values:", updateError);
          } else {
            console.log(`Updated question ${updateField} to ${newValue}`);
          }
        }
        
        // Also invalidate participation stats
        queryClient.invalidateQueries({ queryKey: ['question-participation'] });

        return { tradeId: tradeData };
      } catch (error: any) {
        console.error("Error in trade placement:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Trade placed successfully");
      // Force update all relevant data
      queryClient.invalidateQueries({ queryKey: ['trade-history'] });
      queryClient.invalidateQueries({ queryKey: ['news-trades'] });
      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
      queryClient.invalidateQueries({ queryKey: ['active-questions'] });
      onClose();
    },
    onError: (error: Error) => {
      console.error("Trade error:", error);
      toast.error(error.message || "Failed to place trade");
    }
  });
  
  const handleSubmitTrade = () => {
    if (!isTradeAmountValid(tradeAmount, userBalance)) {
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
    isTradeAmountValid: () => isTradeAmountValid(tradeAmount, userBalance),
    getBalanceAfterDeduction: () => getBalanceAfterDeduction(tradeAmount, userBalance),
    placeTrade,
    handleSubmitTrade
  };
};
