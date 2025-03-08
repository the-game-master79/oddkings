import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { DataTable } from '@/components/ui/data-table';
import { useDeposits } from './deposits/useDeposits';
import { useDepositColumns } from './deposits/useDepositColumns';
import { DepositsFilter } from './deposits/DepositsFilter';
import { DepositMetrics } from '@/components/admin/deposits/DepositMetrics';

export default function Deposits() {
  const [activeTab, setActiveTab] = useState<string>("pending");
  const { deposits, isLoading, processingIds, handleApprove, handleReject } = useDeposits();
  
  const columns = useDepositColumns({
    processingIds,
    onApprove: handleApprove,
    onReject: handleReject,
  });

  // Filter deposits based on the active tab
  const filteredDeposits = React.useMemo(() => {
    if (!deposits) return [];
    if (activeTab === 'all') return deposits;
    return deposits.filter(deposit => deposit.status === activeTab);
  }, [deposits, activeTab]);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Deposits</h1>
      </div>

      {deposits && <DepositMetrics deposits={deposits} />}

      <Card>
        <CardHeader>
          <CardTitle>User Deposits</CardTitle>
          <CardDescription>
            Review and manage all user deposit requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DepositsFilter activeTab={activeTab} onTabChange={setActiveTab}>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DataTable
                data={filteredDeposits}
                columns={columns}
                defaultSort={{ key: 'created_at', direction: 'desc' }}
              />
            )}
          </DepositsFilter>
        </CardContent>
      </Card>
    </div>
  );
}
