
import { DollarSign } from "lucide-react";

interface TradePayoutCalculatorProps {
  selectedOption: "yes" | "no" | null;
  yesValue: number;
  noValue: number;
  tradeAmount: string;
}

export const TradePayoutCalculator = ({
  selectedOption,
  yesValue,
  noValue,
  tradeAmount
}: TradePayoutCalculatorProps) => {
  const calculatePayout = () => {
    if (!selectedOption || !tradeAmount) return "0.00";
    
    const amount = parseFloat(tradeAmount) || 0;
    const percentage = selectedOption === "yes" ? yesValue : noValue;
    const payout = amount + (amount * percentage / 100);
    return payout.toFixed(2);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        <h3 className="font-semibold">Potential Payout</h3>
      </div>
      <p className="text-muted-foreground">
        {selectedOption ? (
          <>
            Trade Amount + {selectedOption === "yes" ? yesValue : noValue}% = 
            <span className="font-semibold text-green-600 ml-2">
              ${calculatePayout()}
            </span>
          </>
        ) : (
          "Select Yes/No to see potential payout"
        )}
      </p>
    </div>
  );
};
