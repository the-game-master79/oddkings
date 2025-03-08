import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Deposit } from "@/types/deposits";
import { formatCurrency } from "@/lib/utils";

interface MetricsProps {
  deposits: Deposit[];
}

export function DepositMetrics({ deposits }: MetricsProps) {
  const getMetrics = (status: Deposit['status']) => {
    const filtered = deposits.filter((d) => d.status === status);
    const totalVolume = filtered.reduce((sum, d) => sum + d.total_usd_value, 0);
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
      title: "Pending Deposits",
      value: formatCurrency(pending.volume),
      description: `${pending.count} deposits waiting for review`
    },
    {
      title: "Completed Deposits",
      value: formatCurrency(approved.volume),
      description: `${approved.count} deposits approved`
    },
    {
      title: "Rejected Deposits",
      value: formatCurrency(rejected.volume),
      description: `${rejected.count} deposits rejected`
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {metrics.map((metric) => (
        <Card key={metric.title}>
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
