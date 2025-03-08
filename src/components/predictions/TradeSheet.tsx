
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionCategory } from "@/types/questions";
import { TradeDetails } from "./TradeDetails";
import { TradeOptions } from "./TradeOptions";
import { useNewsTradePlacement } from "./hooks/useNewsTradePlacement";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TradeSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  question: string;
  category: QuestionCategory;
  volume: number;
  participants: number;
  yesPercentage: number;
  noPercentage: number;
  selectedOption: "yes" | "no" | null;
  setSelectedOption: (option: "yes" | "no" | null) => void;
  userBalance: number;
  questionId: string;
  onClose: () => void;
}

export const TradeSheet = ({
  isOpen,
  onOpenChange,
  question,
  category,
  volume,
  participants,
  yesPercentage,
  noPercentage,
  selectedOption,
  setSelectedOption,
  userBalance,
  questionId,
  onClose,
}: TradeSheetProps) => {
  const {
    tradeAmount,
    handleTradeAmountChange,
    isTradeAmountValid,
    getBalanceAfterDeduction,
    placeTrade,
    handleSubmitTrade
  } = useNewsTradePlacement({
    questionId,
    question,
    category,
    selectedOption,
    userBalance,
    yesPercentage,
    noPercentage,
    onClose
  });

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Trade Details</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <TradeDetails
            question={question}
            category={category}
            volume={volume}
            participants={participants}
          />

          <div className="space-y-2">
            <h3 className="font-semibold">Available Balance</h3>
            <p className="text-muted-foreground">${userBalance.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Trade Amount</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={tradeAmount}
              onChange={(e) => handleTradeAmountChange(e.target.value)}
              className={!isTradeAmountValid() && tradeAmount ? "border-red-500" : ""}
            />
            {!isTradeAmountValid() && tradeAmount && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>
                  Trade amount must be between 0 and your available balance
                </AlertDescription>
              </Alert>
            )}
          </div>

          <TradeOptions
            yesPercentage={yesPercentage}
            noPercentage={noPercentage}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            tradeAmount={tradeAmount}
          />

          <div className="space-y-2">
            <h3 className="font-semibold">Balance After Trade</h3>
            <p className={`text-muted-foreground ${!isTradeAmountValid() && tradeAmount ? "text-red-500" : ""}`}>
              ${getBalanceAfterDeduction()}
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={handleSubmitTrade}
            disabled={!isTradeAmountValid() || !selectedOption || placeTrade.isPending}
          >
            {placeTrade.isPending ? "Placing Trade..." : "Submit Trade"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
