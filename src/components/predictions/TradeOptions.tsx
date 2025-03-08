import { Button } from "@/components/ui/button";

interface TradeOptionsProps {
  yesPercentage: number;
  noPercentage: number;
  selectedOption: "yes" | "no" | null;
  setSelectedOption: (option: "yes" | "no" | null) => void;
  tradeAmount: string;
}

export const TradeOptions = ({
  yesPercentage,
  noPercentage,
  selectedOption,
  setSelectedOption,
  tradeAmount,
}: TradeOptionsProps) => {
  const calculatePayout = () => {
    if (!selectedOption || !tradeAmount) return "0.00";
    
    const amount = parseFloat(tradeAmount) || 0;
    const percentage = selectedOption === "yes" ? yesPercentage : noPercentage;
    const totalPayout = amount + (amount * (percentage / 100));
    return totalPayout.toFixed(2);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Select Your Prediction</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={selectedOption === "yes" ? "default" : "outline"}
            className="w-full"
            onClick={() => setSelectedOption("yes")}
          >
            Yes ({yesPercentage}%)
          </Button>
          <Button
            variant={selectedOption === "no" ? "default" : "outline"}
            className="w-full"
            onClick={() => setSelectedOption("no")}
          >
            No ({noPercentage}%)
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Potential Payout</h3>
        <p className="text-muted-foreground">
          {selectedOption ? (
            <>
              Trade Amount + {selectedOption === "yes" ? yesPercentage : noPercentage}% = 
              <span className="font-semibold text-green-600 ml-2">
                ${calculatePayout()}
              </span>
            </>
          ) : (
            "Select Yes/No to see potential payout"
          )}
        </p>
      </div>
    </div>
  );
};
