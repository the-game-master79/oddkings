
import React, { useState, useEffect } from "react";
import { SortConfig, Column, DataTableProps } from "./types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DataTable<T>({ data, columns, defaultSort }: DataTableProps<T>) {
  const [tableData, setTableData] = useState<T[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile based on window width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let sortedData = [...data];

    // Apply filters
    if (Object.keys(filters).length > 0) {
      sortedData = sortedData.filter(item => {
        return Object.entries(filters).every(([key, filterValue]) => {
          const itemValue = String((item as any)[key]).toLowerCase();
          return filterValue === 'all' || itemValue.includes(filterValue.toLowerCase());
        });
      });
    }

    // Apply sorting
    if (sortConfig) {
      sortedData.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setTableData(sortedData);
  }, [data, sortConfig, filters]);

  const handleSort = (key: string) => {
    if (sortConfig && sortConfig.key === key) {
      // Toggle direction if same key
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // Default to ascending for new sort key
      setSortConfig({
        key,
        direction: 'asc'
      });
    }
  };

  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getFilterOptions = (key: string) => {
    const uniqueValues = Array.from(new Set(data.map(item => String((item as any)[key]))));
    return ['all', ...uniqueValues];
  };

  // Collection of unique values for each filterable column
  const renderMobileView = () => (
    <div className="space-y-4">
      {tableData.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
        >
          {columns.map((column) => {
            const value = (row as any)[column.key];
            const displayValue = column.render ? column.render(value, row) : value;
            
            // Skip rendering empty or null values on mobile to save space
            if (value === null || value === undefined || value === '') {
              return null;
            }
            
            return (
              <div key={column.key} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{column.label}:</span>
                <div className="text-right">{displayValue}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  const renderDesktopView = () => (
    <div className="overflow-x-auto elegant-table-wrapper">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                className={cn(
                  "p-3 text-left text-xs font-medium uppercase tracking-wider",
                  column.sortable && "cursor-pointer select-none"
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && sortConfig?.key === column.key && (
                    sortConfig.direction === 'asc' 
                      ? <ChevronUp className="h-4 w-4" /> 
                      : <ChevronDown className="h-4 w-4" />
                  )}
                  
                  {column.filterable && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-1 p-0 h-7 w-7">
                          <Filter className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {getFilterOptions(column.key).map((value) => (
                          <DropdownMenuItem 
                            key={value}
                            onClick={() => handleFilter(column.key, value)}
                            className={cn(
                              "cursor-pointer text-xs",
                              filters[column.key] === value && "bg-muted font-medium"
                            )}
                          >
                            {value === 'all' ? 'All' : value}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-4 text-center text-sm text-muted-foreground">
                No data available
              </td>
            </tr>
          ) : (
            tableData.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                {columns.map((column) => {
                  const value = (row as any)[column.key];
                  return (
                    <td key={column.key} className="px-3 py-3 text-sm">
                      {column.render ? column.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full">
      {isMobile ? renderMobileView() : renderDesktopView()}
      {tableData.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}
