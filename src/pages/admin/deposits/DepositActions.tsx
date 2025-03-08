
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { Deposit } from './types';

type DepositActionsProps = {
  deposit: Deposit;
  processingIds: string[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export const DepositActions: React.FC<DepositActionsProps> = ({ 
  deposit, 
  processingIds, 
  onApprove, 
  onReject 
}) => {
  const isProcessing = processingIds.includes(deposit.id);

  if (deposit.status !== 'pending') {
    return null;
  }

  return (
    <div className="flex space-x-2">
      <Button 
        size="sm" 
        variant="outline"
        className="bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 border-green-200"
        onClick={() => onApprove(deposit.id)}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Check className="h-4 w-4 mr-1" />
        )}
        {isProcessing ? 'Processing...' : 'Approve'}
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border-red-200"
        onClick={() => onReject(deposit.id)}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <X className="h-4 w-4 mr-1" />
        )}
        {isProcessing ? 'Processing...' : 'Reject'}
      </Button>
    </div>
  );
};
