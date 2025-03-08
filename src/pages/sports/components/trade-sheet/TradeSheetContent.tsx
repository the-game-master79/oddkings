
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SportQuestion } from "@/types/sports";
import { Wallet, DollarSign, CheckCircle, XCircle } from "lucide-react";

interface TradeSheetContentProps {
  question: SportQuestion;
  selectedOption: "yes" | "no" | null;
  setSelectedOption: (option: "yes" | "no" | null) => void;
  userBalance: number;
  tradeAmount: string;
  handleTradeAmountChange: (value: string) => void;
  isTradeAmountValid: () => boolean;
  handleSubmitTrade: () => void;
  closeTradeSheet: () => void;
  isProcessing: boolean;
}

export const TradeSheetContent = ({
  question,
  selectedOption,
  setSelectedOption,
  userBalance,
  tradeAmount,
  handleTradeAmountChange,
  isTradeAmountValid,
  handleSubmitTrade,
  closeTradeSheet,
  isProcessing
}: TradeSheetContentProps) => {
  const calculatePayout = () => {
    if (!selectedOption || !tradeAmount) return "0.00";
    
    const amount = parseFloat(tradeAmount) || 0;
    const percentage = selectedOption === "yes" ? question.yes_value : question.no_value;
    const payout = amount + (amount * percentage / 100);
    return payout.toFixed(2);
  };

  const getBalanceAfterDeduction = () => {
    const amount = parseFloat(tradeAmount) || 0;
    return Math.max(0, userBalance - amount).toFixed(2);
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold">Question</h3>
        <p className="text-muted-foreground">{question.question}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Category</h3>
        <p className="text-muted-foreground">{question.category}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <h3 className="font-semibold">Available Balance</h3>
        </div>
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

      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Select Your Prediction</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedOption === "yes" ? "default" : "outline"}
              className="w-full"
              onClick={() => setSelectedOption("yes")}
            >
              <CheckCircle className="mr-1 h-4 w-4" /> Yes ({question.yes_value}%)
            </Button>
            <Button
              variant={selectedOption === "no" ? "default" : "outline"}
              className="w-full"
              onClick={() => setSelectedOption("no")}
            >
              <XCircle className="mr-1 h-4 w-4" /> No ({question.no_value}%)
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <h3 className="font-semibold">Potential Payout</h3>
          </div>
          <p className="text-muted-foreground">
            {selectedOption ? (
              <>
                Trade Amount + {selectedOption === "yes" ? question.yes_value : question.no_value}% = 
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

      <div className="space-y-2">
        <h3 className="font-semibold">Balance After Trade</h3>
        <p className={`text-muted-foreground ${!isTradeAmountValid() && tradeAmount ? "text-red-500" : ""}`}>
          ${getBalanceAfterDeduction()}
        </p>
      </div>

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
          disabled={!isTradeAmountValid() || !selectedOption || isProcessing}
        >
          {isProcessing ? "Placing Trade..." : "Submit Trade"}
        </Button>
      </div>
    </div>
  );
};
