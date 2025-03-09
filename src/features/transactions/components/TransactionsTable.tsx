import { Badge } from "@/components/ui/badge";
import { Transaction } from "../types";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface TransactionsTableProps {
  transactions: Transaction[];
}

export const TransactionsTable = ({ transactions }: TransactionsTableProps) => {
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
  
  const visibleTransactions = transactions.slice(0, visibleLimit);
  const hasMoreItems = transactions.length > visibleLimit;

  const formatAmount = (transaction: Transaction) => {
    const amount = transaction.amount.toFixed(2);
    return ['deposit', 'trade_payout', 'referral_commission'].includes(transaction.type)
      ? `+$${amount}`
      : `-$${amount}`;
  };

  const getStatusBadge = (transaction: Transaction) => {
    const { status, type } = transaction;
    
    // Only show status badges for deposits and withdrawals
    if (type === 'deposit' || type === 'withdrawal') {
      switch (status) {
        case 'completed':
          return <Badge className="bg-green-500">Completed</Badge>;
        case 'pending':
          return <Badge variant="outline" className="text-yellow-600 border-yellow-400">Pending</Badge>;
        case 'failed':
          return <Badge variant="destructive">Failed</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    }
    
    // For trade placements, trade payouts, and referral commissions: Always show "Completed"
    if (type === 'trade_placement' || type === 'trade_payout' || type === 'referral_commission') {
      return <Badge className="bg-green-500">Completed</Badge>;
    }
    
    // Default case - don't show status badge
    return null;
  };

  const getTypeBadge = (type: string, description?: string | null) => {
    // Check for sports transactions first - Look for SPORT prefix in description
    if ((type === 'trade_placement' || type === 'trade_payout') && 
        description && 
        (description.startsWith('SPORT_QUESTION:') || 
         description.startsWith('SPORT_TRADE:') ||
         description.startsWith('WON: SPORT_') ||
         description.startsWith('LOST: SPORT_'))) {
      return type === 'trade_payout' 
        ? <Badge className="bg-green-600">Sports Payout</Badge>
        : <Badge className="bg-purple-500">Sports Trade</Badge>;
    }
    
    // Check for news transactions - any trade that doesn't have SPORT prefix
    if (type === 'trade_placement' || type === 'trade_payout') {
      return type === 'trade_payout'
        ? <Badge className="bg-green-600">News Payout</Badge>
        : <Badge className="bg-indigo-500">News Trade</Badge>;
    }
    
    switch (type) {
      case 'deposit':
        return <Badge className="bg-blue-500">Deposit</Badge>;
      case 'withdrawal':
        return <Badge className="bg-orange-500">Withdrawal</Badge>;
      case 'referral_commission':
        return <Badge className="bg-teal-500">Referral</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDescription = (value: string | null, transaction: Transaction) => {
    if (!value) return '-';
    
    // Handle different transaction types and formats
    const { type } = transaction;
    
    // Remove WON: and LOST: prefixes for cleaner display
    let cleanValue = value;
    if (value.startsWith('WON:')) {
      cleanValue = value.substring(5).trim();
    } else if (value.startsWith('LOST:')) {
      cleanValue = value.substring(6).trim();
    }
    
    // Sports Trade Placement
    if (type === 'trade_placement' && (value.startsWith('SPORT_QUESTION:') || value.startsWith('SPORT_TRADE:'))) {
      // Extract the amount and prediction (yes/no) from description
      const match = cleanValue.match(/Placed trade of \$([0-9.]+) on (yes|no)/i);
      if (match) {
        const [_, amount, prediction] = match;
        return `Sports Trade of $${amount} on ${prediction.charAt(0).toUpperCase() + prediction.slice(1)}`;
      }
      
      // If we couldn't extract the pattern, just return a cleaned version
      return cleanValue.replace(/SPORT_TRADE:|SPORT_QUESTION:/, '').trim();
    }
    
    // Sports Trade Payout
    if (type === 'trade_payout' && (value.includes('SPORT_') || value.includes('Sport'))) {
      // Extract the question from the description if possible
      let question = '';
      if (cleanValue.includes(' - ')) {
        question = cleanValue.split(' - ').pop() || '';
        if (question.includes('Received payout')) {
          question = question.split('Received payout')[0].trim();
        }
      } else {
        question = cleanValue;
      }
      return `${question}`;
    }
    
    // News Trade Placement
    if (type === 'trade_placement' && !value.includes('SPORT_')) {
      // Extract the amount and prediction (yes/no) from description
      const match = cleanValue.match(/Placed trade of \$([0-9.]+) on (yes|no)/i);
      if (match) {
        const [_, amount, prediction] = match;
        return `News Trade of $${amount} on ${prediction.charAt(0).toUpperCase() + prediction.slice(1)}`;
      }
      
      // If we can't extract, clean and return
      return cleanValue.replace(/NEWS_QUESTION:/, '').trim();
    }
    
    // News Trade Payout
    if (type === 'trade_payout' && !value.includes('SPORT_') && !value.includes('Sport')) {
      // Extract the question from the description if possible
      let question = '';
      if (cleanValue.includes(' - ')) {
        question = cleanValue.split(' - ').pop() || '';
        if (question.includes('Received payout')) {
          question = question.split('Received payout')[0].trim();
        }
      } else {
        question = cleanValue;
      }
      return `${question}`;
    }
    
    // Handle any other formats that don't fit the above patterns
    if (cleanValue.startsWith('SPORT_QUESTION:')) {
      const parts = cleanValue.split(':');
      if (parts.length >= 4) {
        return parts[3];
      }
    }
    
    if (cleanValue.startsWith('SPORT_TRADE:')) {
      return cleanValue.split(' - ')[1] || cleanValue;
    }
    
    if (cleanValue.startsWith('NEWS_QUESTION:')) {
      return cleanValue.split(' - ')[1] || cleanValue;
    }
    
    return cleanValue;
  };

  const columns = [
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy HH:mm'),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      render: (value: string, row: Transaction) => getTypeBadge(value, row.description),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      filterable: true,
      render: (value: string | null, row: Transaction) => formatDescription(value, row),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (_: number, row: Transaction) => (
        <span className={[
          'deposit', 'trade_payout', 'referral_commission'
        ].includes(row.type) ? 'text-green-600' : 'text-red-600'}>
          {formatAmount(row)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (_: string, row: Transaction) => getStatusBadge(row),
    }
  ];
  
  const renderMobileView = () => (
    <div className="space-y-4">
      {visibleTransactions.map((transaction) => (
        <div 
          key={`${transaction.id}-${transaction.created_at}`}  // More unique key combining id and timestamp
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
        >
          <div className="flex justify-between items-center mb-3">
            {getTypeBadge(transaction.type, transaction.description)}
            <span className="text-sm text-muted-foreground">
              {format(new Date(transaction.created_at), "MMM dd, yyyy HH:mm")}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description:</span>
              <span className="text-right text-sm max-w-[60%]">{formatDescription(transaction.description, transaction)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount:</span>
              <span className={[
                'deposit', 'trade_payout', 'referral_commission'
              ].includes(transaction.type) ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {formatAmount(transaction)}
              </span>
            </div>
            {getStatusBadge(transaction) && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                <span>{getStatusBadge(transaction)}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {isMobile ? (
        renderMobileView()
      ) : (
        <DataTable 
          data={visibleTransactions} 
          columns={columns}
          defaultSort={{ key: 'created_at', direction: 'desc' }} 
        />
      )}
      
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
