import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReferralStats } from '../types';
import { TrendingUp, Users } from "lucide-react";

interface StatsCardProps {
  stats: ReferralStats;
}

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-card animate-fade-in">
      <CardHeader className="relative z-10">
        <CardTitle className="text-2xl font-heading">Statistics</CardTitle>
        <CardDescription>Your referral program performance</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <p className="text-sm text-muted-foreground">Total Earnings</p>
          </div>
          <p className="text-2xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Total Users Referred</p>
          </div>
          <p className="text-2xl font-bold text-primary">{stats.totalReferred}</p>
        </div>
      </CardContent>
    </Card>
  );
}
