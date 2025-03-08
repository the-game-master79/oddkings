
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransactionFilters } from "../types";

interface TransactionFilterFormProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

export const TransactionFilterForm = ({
  filters,
  onFiltersChange,
}: TransactionFilterFormProps) => {
  const [searchValue, setSearchValue] = useState(filters.searchQuery);

  // Update local search value when filters change
  useEffect(() => {
    setSearchValue(filters.searchQuery);
  }, [filters.searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, searchQuery: searchValue });
  };

  const handleReset = () => {
    setSearchValue("");
    onFiltersChange({
      typeFilter: "all",
      sortOrder: "desc",
      searchQuery: "",
    });
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Transaction Type</label>
          <Select
            value={filters.typeFilter}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, typeFilter: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="trade_placement">All Trades</SelectItem>
              <SelectItem value="sports_trade">Sports Trades</SelectItem>
              <SelectItem value="news_trade">News Trades</SelectItem>
              <SelectItem value="trade_payout">Payouts</SelectItem>
              <SelectItem value="referral_commission">Referral Commissions</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Sort Order</label>
          <Select
            value={filters.sortOrder}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                sortOrder: value as "asc" | "desc",
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <form onSubmit={handleSearchSubmit}>
            <label className="text-sm font-medium mb-1 block">Search</label>
            <div className="flex gap-2">
              <Input
                placeholder="Search transactions..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" variant="outline">
                <Search size={16} />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleReset}
                title="Reset filters"
              >
                <RotateCcw size={16} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
