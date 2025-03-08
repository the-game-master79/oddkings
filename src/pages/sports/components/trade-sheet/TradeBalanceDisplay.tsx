
import { Wallet } from "lucide-react";

interface TradeBalanceDisplayProps {
  userBalance: number;
  getBalanceAfterDeduction: () => string;
  isTradeAmountValid: () => boolean;
  tradeAmount: string;
}

export const TradeBalanceDisplay = ({
  userBalance,
  getBalanceAfterDeduction,
  isTradeAmountValid,
  tradeAmount
}: TradeBalanceDisplayProps) => {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <h3 className="font-semibold">Available Balance</h3>
        </div>
        <p className="text-muted-foreground">${userBalance.toFixed(2)}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Balance After Trade</h3>
        <p className={`text-muted-foreground ${!isTradeAmountValid() && tradeAmount ? "text-red-500" : ""}`}>
          ${getBalanceAfterDeduction()}
        </p>
      </div>
    </>
  );
};
