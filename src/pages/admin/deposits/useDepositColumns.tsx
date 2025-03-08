
import React from 'react';
import { format } from 'date-fns';
import { Column } from '@/components/ui/data-table/types';
import { Deposit } from './types';
import { StatusBadge } from './StatusBadge';
import { DepositActions } from './DepositActions';

type UseDepositColumnsProps = {
  processingIds: string[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export const useDepositColumns = ({ processingIds, onApprove, onReject }: UseDepositColumnsProps): Column[] => {
  return [
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (value) => format(new Date(value), 'yyyy-MM-dd HH:mm'),
    },
    {
      key: 'user_id',
      label: 'User ID',
      sortable: true,
    },
    {
      key: 'crypto_type',
      label: 'Crypto',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
    },
    {
      key: 'total_usd_value',
      label: 'USD Value',
      sortable: true,
      render: (value) => `$${value}`,
    },
    {
      key: 'deposit_address',
      label: 'Deposit Address',
      sortable: false,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row: Deposit) => (
        <DepositActions 
          deposit={row} 
          processingIds={processingIds} 
          onApprove={onApprove} 
          onReject={onReject} 
        />
      ),
    },
  ];
};
