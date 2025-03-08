
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface TradeOptionSelectorProps {
  selectedOption: "yes" | "no" | null;
  setSelectedOption: (option: "yes" | "no" | null) => void;
  yesValue: number;
  noValue: number;
}

export const TradeOptionSelector = ({
  selectedOption,
  setSelectedOption,
  yesValue,
  noValue
}: TradeOptionSelectorProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Select Your Prediction</h3>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={selectedOption === "yes" ? "default" : "outline"}
          className="w-full"
          onClick={() => setSelectedOption("yes")}
        >
          <CheckCircle className="mr-1 h-4 w-4" /> Yes ({yesValue}%)
        </Button>
        <Button
          variant={selectedOption === "no" ? "default" : "outline"}
          className="w-full"
          onClick={() => setSelectedOption("no")}
        >
          <XCircle className="mr-1 h-4 w-4" /> No ({noValue}%)
        </Button>
      </div>
    </div>
  );
};
