
import * as React from "react"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SortConfig, Column, DataTableProps } from "./types"

export function DataTable<T extends Record<string, any>>({ 
  data, 
  columns,
  defaultSort,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig | undefined>(defaultSort);
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [displayLimit, setDisplayLimit] = React.useState(10);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleFilter = (key: string, value: string) => {
    setFilters(current => ({
      ...current,
      [key]: value
    }));
  };

  const filteredData = React.useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = String(item[key]).toLowerCase();
        return itemValue.includes(value.toLowerCase());
      });
    });
  }, [data, filters]);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const displayedData = sortedData.slice(0, displayLimit);
  const hasMoreRows = sortedData.length > displayLimit;

  const loadMore = () => {
    setDisplayLimit(current => current + 10);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 mb-4">
        {columns.filter(col => col.filterable).map(column => (
          <div key={column.key} className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Filter ${column.label}...`}
              value={filters[column.key] || ''}
              onChange={e => handleFilter(column.key, e.target.value)}
              className="max-w-xs pl-9"
            />
          </div>
        ))}
      </div>
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              {columns.map(column => (
                <th key={column.key} className="h-12 px-4 text-left align-middle font-medium">
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSort(column.key)}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {displayedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {columns.map(column => (
                  <td key={column.key} className="p-4 align-middle">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMoreRows && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            className="w-full max-w-xs"
          >
            View More
          </Button>
        </div>
      )}
    </div>
  );
}
