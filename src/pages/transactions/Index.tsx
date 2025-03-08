
import { useState } from "react";
import { TransactionFilterForm } from "@/features/transactions/components/TransactionFilters";
import { TransactionsTable } from "@/features/transactions/components/TransactionsTable";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import type { TransactionFilters } from "@/features/transactions/types";

export default function Transactions() {
  const [filters, setFilters] = useState<TransactionFilters>({
    typeFilter: 'all',
    sortOrder: 'desc',
    searchQuery: '',
  });

  const { data: transactions = [], isError, isLoading } = useTransactions();

  const filteredTransactions = transactions
    .filter((transaction) => {
      if (filters.typeFilter === 'all') return true;
      
      // Special handling for sports and news trades and payouts
      if (filters.typeFilter === 'sports_trade') {
        return (
          // Include both trades and payouts for sports
          ((transaction.type === 'trade_placement' || transaction.type === 'trade_payout') && 
           transaction.description && 
           (transaction.description.startsWith('SPORT_QUESTION:') || 
            transaction.description.startsWith('SPORT_TRADE:') ||
            transaction.description.startsWith('WON: SPORT_') ||
            transaction.description.startsWith('LOST: SPORT_')))
        );
      }
      
      if (filters.typeFilter === 'news_trade') {
        return (
          // Include both trades and payouts for news that don't have SPORT prefix
          ((transaction.type === 'trade_placement' || transaction.type === 'trade_payout') && 
           transaction.description && 
           !(transaction.description.startsWith('SPORT_QUESTION:') || 
             transaction.description.startsWith('SPORT_TRADE:') ||
             transaction.description.startsWith('WON: SPORT_') ||
             transaction.description.startsWith('LOST: SPORT_')))
        );
      }
      
      return transaction.type === filters.typeFilter;
    })
    .filter((transaction) => {
      if (!filters.searchQuery) return true;
      return transaction.description?.toLowerCase().includes(filters.searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-2 sm:px-4 lg:px-6">
        <div className="flex justify-start items-center min-h-[200px]">
          Loading transactions...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-10 px-2 sm:px-4 lg:px-6">
        <div className="flex justify-start items-center min-h-[200px] text-red-500">
          Error loading transactions. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6">
      <h1 className="text-2xl font-bold mb-6 text-left">My Transactions</h1>
      <TransactionFilterForm filters={filters} onFiltersChange={setFilters} />
      <TransactionsTable transactions={filteredTransactions} />
    </div>
  );
}
