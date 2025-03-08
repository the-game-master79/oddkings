
import { Button } from "@/components/ui/button";

interface TradeActionsProps {
  handleSubmitTrade: () => void;
  closeTradeSheet: () => void;
  isProcessing: boolean;
  isDisabled: boolean;
}

export const TradeActions = ({
  handleSubmitTrade,
  closeTradeSheet,
  isProcessing,
  isDisabled
}: TradeActionsProps) => {
  return (
    <div className="flex gap-4 mt-8">
      <Button 
        variant="outline" 
        className="flex-1"
        onClick={closeTradeSheet}
      >
        Cancel
      </Button>
      <Button 
        className="flex-1"
        onClick={handleSubmitTrade}
        disabled={isDisabled || isProcessing}
      >
        {isProcessing ? "Placing Trade..." : "Submit Trade"}
      </Button>
    </div>
  );
};
