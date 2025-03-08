
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SportQuestion } from "@/types/sports";
import { useTradePlacement } from "./trade-sheet/useTradePlacement";
import { TradeSheetContent } from "./trade-sheet/TradeSheetContent";

interface TradeSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  question: SportQuestion | null;
  selectedOption: "yes" | "no" | null;
  setSelectedOption: (option: "yes" | "no" | null) => void;
  userBalance: number;
  onSuccess: () => void;
}

export const TradeSheet = ({
  isOpen,
  onOpenChange,
  question,
  selectedOption,
  setSelectedOption,
  userBalance,
  onSuccess,
}: TradeSheetProps) => {
  const closeTradeSheet = () => {
    onOpenChange(false);
    setSelectedOption(null);
  };
  
  const {
    tradeAmount,
    handleTradeAmountChange,
    isTradeAmountValid,
    placeTrade,
    handleSubmitTrade
  } = useTradePlacement({
    question,
    selectedOption,
    userBalance,
    onSuccess,
    closeTradeSheet
  });

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Place Trade</SheetTitle>
        </SheetHeader>
        
        {question && (
          <TradeSheetContent
            question={question}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            userBalance={userBalance}
            tradeAmount={tradeAmount}
            handleTradeAmountChange={handleTradeAmountChange}
            isTradeAmountValid={isTradeAmountValid}
            handleSubmitTrade={handleSubmitTrade}
            closeTradeSheet={closeTradeSheet}
            isProcessing={placeTrade.isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
