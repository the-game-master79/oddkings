
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { WithdrawalRequest } from "../types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface WithdrawalHistoryProps {
  withdrawals: WithdrawalRequest[];
}

export const WithdrawalHistory = ({ withdrawals }: WithdrawalHistoryProps) => {
  const [visibleLimit, setVisibleLimit] = useState(10);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const visibleWithdrawals = withdrawals.slice(0, visibleLimit);
  const hasMoreItems = withdrawals.length > visibleLimit;
  
  const renderMobileView = () => (
    <div className="space-y-4">
      {visibleWithdrawals.map((withdrawal) => (
        <div 
          key={withdrawal.id} 
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
        >
          <div className="flex justify-between items-center mb-3">
            <Badge
              className={
                withdrawal.status === "approved"
                  ? "bg-green-500"
                  : withdrawal.status === "rejected"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }
            >
              {withdrawal.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(new Date(withdrawal.created_at), "MMM dd, yyyy HH:mm")}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount:</span>
              <span className="font-medium">${withdrawal.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Token:</span>
              <span>{withdrawal.token}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Network:</span>
              <span>{withdrawal.network}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  const renderDesktopView = () => (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[600px]">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-4 text-left whitespace-nowrap">Date & Time</th>
            <th className="p-4 text-left whitespace-nowrap">Amount</th>
            <th className="p-4 text-left whitespace-nowrap">Token</th>
            <th className="p-4 text-left whitespace-nowrap">Network</th>
            <th className="p-4 text-left whitespace-nowrap">Status</th>
          </tr>
        </thead>
        <tbody>
          {visibleWithdrawals.map((withdrawal) => (
            <tr key={withdrawal.id} className="border-t">
              <td className="p-4 whitespace-nowrap">
                {format(new Date(withdrawal.created_at), "MMM dd, yyyy HH:mm")}
              </td>
              <td className="p-4 whitespace-nowrap">${withdrawal.amount.toFixed(2)}</td>
              <td className="p-4 whitespace-nowrap">{withdrawal.token}</td>
              <td className="p-4 whitespace-nowrap">{withdrawal.network}</td>
              <td className="p-4 whitespace-nowrap">
                <Badge
                  className={
                    withdrawal.status === "approved"
                      ? "bg-green-500"
                      : withdrawal.status === "rejected"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }
                >
                  {withdrawal.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">Withdrawal Requests</h2>
      
      {isMobile ? renderMobileView() : renderDesktopView()}
      
      {hasMoreItems && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline"
            onClick={() => setVisibleLimit(prev => prev + 10)}
            className="flex items-center gap-2"
          >
            Show More
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
