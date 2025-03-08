import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Maximize2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTradeBuilder } from "@/context/TradeBuilderContext";
import { TradeItem } from "./TradeItem";
import { useMultiTradePlacement } from "@/hooks/useMultiTradePlacement";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTradeValidation } from "@/hooks/useTradeValidation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

interface MultiTradeSidebarProps {
  isOpen: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  showTradeNotification?: boolean;
}

export function MultiTradeSidebar({ 
  isOpen, 
  isMinimized,
  onClose, 
  onMinimize,
  onMaximize,
  showTradeNotification = false
}: MultiTradeSidebarProps) {
  const isMobile = useIsMobile();
  
  // Add effect to handle mount behavior
  useEffect(() => {
    if (isOpen) {
      if (isMobile) {
        onMinimize(); // Always minimize on mobile
      } else {
        onMaximize(); // Always maximize on desktop
      }
    }
  }, [isOpen, isMobile]); // Only run when isOpen or device type changes

  // Add trade validation
  useTradeValidation();

  const { trades } = useTradeBuilder();
  const placeTrades = useMultiTradePlacement();

  // Fetch user balance
  const { data: userBalance = 0 } = useQuery({
    queryKey: ['user-balance'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return 0;
      
      const { data } = await supabase
        .from('user_balances')
        .select('total_usd_value')
        .eq('user_id', session.user.id)
        .single();
      
      return data?.total_usd_value || 0;
    }
  });

  // Calculate totals
  const totalTrade = trades.reduce((sum, trade) => sum + (trade.amount || 0), 0);
  const estimatedPayout = trades.reduce((sum, trade) => {
    const amount = trade.amount || 0;
    return sum + (amount * (1 + trade.payout / 100));
  }, 0);

  const hasInsufficientBalance = totalTrade > userBalance;

  const handleSubmitAllTrades = () => {
    const invalidTrades = trades.filter(trade => !trade.amount || trade.amount <= 0);
    
    if (invalidTrades.length > 0) {
      toast.error(
        "Please enter valid amounts for all trades",
        {
          description: "Amount must be greater than 0"
        }
      );
      return;
    }

    placeTrades.mutate(trades);
  };

  // Modified visibility logic
  if (!isOpen && !isMinimized) return null;

  // Handle minimized view for both mobile and desktop
  if (isMinimized) {
    return (
      <>
        {showTradeNotification && (
          <div className="fixed bottom-28 right-4 z-40 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm shadow-lg">
            Submit your trades here
          </div>
        )}
        <div 
          className={cn(
            "fixed right-4 cursor-pointer z-50 transition-transform duration-300",
            isMobile ? "bottom-20" : "bottom-4"
          )}
          onClick={onMaximize}
        >
          <Card className="flex items-center gap-3 px-4 py-4 shadow-lg hover:shadow-xl transition-shadow">
            <DollarSign className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Trade Builder</span>
              <span className="text-xs text-muted-foreground">
                ${totalTrade.toFixed(2)} • Est. ${estimatedPayout.toFixed(2)}
              </span>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // Main sidebar content
  return (
    <>
      <Card 
        className={cn(
          "fixed right-0 z-40 rounded-none border-r-0 border-t-0 transition-all duration-300",
          "w-[300px]",
          isMobile ? "top-20 bottom-[4.5rem]" : "top-16 bottom-0",
          !isOpen && "translate-x-[200%]" // Hide completely when closed
        )}
      >
        <Card className="w-full h-full rounded-none border-0 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className={cn(
                "text-lg transition-opacity duration-300",
                isMinimized && "opacity-0" // Hide text when minimized
              )}>
                Trade Builder
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose} // Changed to onClose instead of onMinimize
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={cn(
            "flex-1 overflow-y-auto transition-opacity duration-300",
            isMinimized && "opacity-0" // Hide content when minimized
          )}>
            {trades.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                Trade Builder Empty! Select any Sport or News to Add.
              </div>
            ) : (
              trades.map((trade) => (
                <TradeItem
                  key={trade.questionId}
                  questionId={trade.questionId}
                  question={trade.question}
                  category={trade.category}
                  option={trade.option}
                  payout={trade.payout}
                  userBalance={userBalance}
                  teams={trade.teams} // Pass teams prop
                />
              ))
            )}
          </CardContent>
          <div className={cn(
            "mt-auto border-t transition-opacity duration-300",
            isMinimized && "opacity-0" // Hide footer when minimized
          )}>
            <CardFooter className="flex flex-col gap-2 pt-4">
              <div className="flex justify-between w-full">
                <span className="text-sm text-muted-foreground">Total Trade</span>
                <span className="font-medium">${totalTrade.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full">
                <span className="text-sm text-muted-foreground">Est. Payout</span>
                <span className="font-medium text-green-600">${estimatedPayout.toFixed(2)}</span>
              </div>
              {hasInsufficientBalance && (
                <div className="text-red-500 text-sm mb-2">
                  Insufficient balance for current trades
                </div>
              )}
              <Button 
                className="w-full mt-2" 
                onClick={handleSubmitAllTrades}
                disabled={trades.length === 0 || hasInsufficientBalance || placeTrades.isPending}
              >
                {placeTrades.isPending ? "Placing Trades..." : "Submit All Trades"}
              </Button>
            </CardFooter>
          </div>
        </Card>
      </Card>
    </>
  );
}
