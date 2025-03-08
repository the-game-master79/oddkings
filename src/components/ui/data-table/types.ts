
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row?: any) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column[];
  defaultSort?: SortConfig;
}
