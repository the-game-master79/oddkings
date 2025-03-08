import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTradeBuilder } from "@/context/TradeBuilderContext";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TradeItemProps {
  questionId: string;
  question: string;
  category: string;
  option: "yes" | "no";
  payout: number;
  userBalance?: number;
  teams?: { team1: string; team2: string; }; // Add teams prop
}

export function TradeItem({ 
  questionId, 
  question, 
  option = 'yes', 
  category, 
  payout, 
  userBalance = 0,
  teams 
}: TradeItemProps) {
  const { removeTrade } = useTradeBuilder();
  const [amount, setAmount] = useState(() => {
    const savedTrades = localStorage.getItem('oddkings_pending_trades');
    if (savedTrades) {
      const trades = JSON.parse(savedTrades);
      const trade = trades.find((t: any) => t.questionId === questionId);
      return trade?.amount?.toString() || "";
    }
    return "";
  });
  const [error, setError] = useState("");

  // Add question existence check
  useQuery({
    queryKey: ['validate-question', questionId],
    queryFn: async () => {
      const isSportQuestion = questionId.startsWith('sport_');
      const actualQuestionId = isSportQuestion ? questionId.replace('sport_', '') : questionId;
      const table = isSportQuestion ? 'sport_questions' : 'questions';

      const { data, error } = await supabase
        .from(table)
        .select('id, status')
        .eq('id', actualQuestionId)
        .single();

      if (error || !data) {
        console.log(`Question ${questionId} no longer exists, removing from trade builder`);
        removeTrade(questionId);
        return null;
      }

      // Also remove if question is resolved
      if (data.status?.startsWith('resolved_')) {
        console.log(`Question ${questionId} is already resolved, removing from trade builder`);
        removeTrade(questionId);
        return null;
      }

      return data;
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  const { updateTradeAmount } = useTradeBuilder();

  const handleAmountChange = (value: string) => {
    setError("");
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
      const numValue = parseFloat(value);
      
      if (numValue <= 0) {
        setError("Enter amount greater than $0");
      } else if (numValue > userBalance) {
        setError("Trade cannot exceed your balance");
      } else {
        updateTradeAmount(questionId, numValue);
      }
    }
  };

  const handleRemove = () => {
    removeTrade(questionId);
  };

  function cn(...classes: string[]): string {
    return classes.filter(Boolean).join(' ');
  }

  const getTeamAbbreviation = (teamName: string) => {
    if (!teamName) return '';
    const words = teamName.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }
    return words.map(word => word[0]).join('').toUpperCase();
  };

  const getOptionDisplay = () => {
    // Check if it's a sports trade by checking the questionId prefix
    if (questionId.startsWith('sport_') && teams) {
      const teamName = option === 'yes' ? teams.team1 : teams.team2;
      return getTeamAbbreviation(teamName);
    }
    return option.toUpperCase();
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Top row with badges and close button */}
          <div className="flex items-center justify-between">
            {/* Left side - badges */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="text-black border-black/20 font-medium"
              >
                {category}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "capitalize font-medium",
                  option === "yes" ? "bg-green-500/10 text-green-700 border-green-200" : 
                  "bg-red-500/10 text-red-700 border-red-200"
                )}
              >
                {getOptionDisplay()}
              </Badge>
            </div>
            {/* Right side - close button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 -mr-2" 
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Question Text */}
          <h2 className="text-lg font-medium">{question}</h2>

          {/* Amount Input with Payout % */}
          <div className="relative">
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={cn(
                error ? "border-red-500" : "",
                "pr-16" // Make room for payout %
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              {payout}%
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
