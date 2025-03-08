
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TradeAmountInputProps {
  tradeAmount: string;
  handleTradeAmountChange: (value: string) => void;
  isTradeAmountValid: () => boolean;
}

export const TradeAmountInput = ({
  tradeAmount,
  handleTradeAmountChange,
  isTradeAmountValid
}: TradeAmountInputProps) => {
  return (
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
  );
};
