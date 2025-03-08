
import React from 'react';

type StatusBadgeProps = {
  status: 'pending' | 'approved' | 'rejected';
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusClassName = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClassName()}`}>
      {status}
    </div>
  );
};
