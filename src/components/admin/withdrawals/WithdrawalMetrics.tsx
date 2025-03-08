import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WithdrawalRequest } from "@/features/withdraw/types";
import { formatCurrency } from "@/lib/utils";

interface MetricsProps {
  withdrawals: WithdrawalRequest[];
}

export function WithdrawalMetrics({ withdrawals }: MetricsProps) {
  const getMetrics = (status: WithdrawalRequest['status']) => {
    const filtered = withdrawals.filter((w) => w.status === status);
    const totalVolume = filtered.reduce((sum, w) => sum + w.amount, 0);
    return {
      count: filtered.length,
      volume: totalVolume
    };
  };

  const pending = getMetrics('pending');
  const approved = getMetrics('approved');
  const rejected = getMetrics('rejected');

  const metrics = [
    {
      title: "Pending Withdrawals",
      value: formatCurrency(pending.volume),
      description: `${pending.count} withdrawals waiting for review`
    },
    {
      title: "Completed Withdrawals",
      value: formatCurrency(approved.volume),
      description: `${approved.count} withdrawals approved`
    },
    {
      title: "Rejected Withdrawals",
      value: formatCurrency(rejected.volume),
      description: `${rejected.count} withdrawals rejected`
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {metrics.map((metric, index) => (
        <Card key={`${metric.title}-${index}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
