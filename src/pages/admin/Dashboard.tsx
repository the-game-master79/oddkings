import { useEffect, useState } from "react";
import { StatsCard } from "@/components/admin/StatsCard";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalUsers: number;
  activeQuestions: number;
  resolvedYes: number;
  resolvedNo: number;
  totalDeposits: number;
  pendingDeposits: number;
  approvedDeposits: number;
  rejectedDeposits: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeQuestions: 0,
    resolvedYes: 0,
    resolvedNo: 0,
    totalDeposits: 0,
    pendingDeposits: 0,
    approvedDeposits: 0,
    rejectedDeposits: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch questions stats
        const { data: questions } = await supabase
          .from('questions')
          .select('status');

        // Fetch deposits stats
        const { data: deposits } = await supabase
          .from('deposits')
          .select('status');

        // Calculate stats
        const activeQuestions = questions?.filter(q => q.status === 'active').length || 0;
        const resolvedYes = questions?.filter(q => q.status === 'resolved_yes').length || 0;
        const resolvedNo = questions?.filter(q => q.status === 'resolved_no').length || 0;

        const totalDeposits = deposits?.length || 0;
        const pendingDeposits = deposits?.filter(d => d.status === 'pending').length || 0;
        const approvedDeposits = deposits?.filter(d => d.status === 'approved').length || 0;
        const rejectedDeposits = deposits?.filter(d => d.status === 'rejected').length || 0;

        setStats({
          totalUsers: usersCount || 0,
          activeQuestions,
          resolvedYes,
          resolvedNo,
          totalDeposits,
          pendingDeposits,
          approvedDeposits,
          rejectedDeposits,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();

    // Set up real-time subscription for changes
    const subscriptions = [
      supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats)
        .subscribe(),
      supabase
        .channel('public:questions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, fetchStats)
        .subscribe(),
      supabase
        .channel('public:deposits')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, fetchStats)
        .subscribe(),
    ];

    return () => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Registered Users"
          value={stats.totalUsers}
          route="/users"
        />
        <StatsCard
          title="Active Questions"
          value={stats.activeQuestions}
          route="/questions"
        />
        <StatsCard
          title="Resolved Yes"
          value={stats.resolvedYes}
          route="/questions"
        />
        <StatsCard
          title="Resolved No"
          value={stats.resolvedNo}
          route="/questions"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Deposits"
          value={stats.totalDeposits}
          route="/deposits"
        />
        <StatsCard
          title="Pending Deposits"
          value={stats.pendingDeposits}
          route="/deposits"
        />
        <StatsCard
          title="Approved Deposits"
          value={stats.approvedDeposits}
          route="/deposits"
        />
        <StatsCard
          title="Rejected Deposits"
          value={stats.rejectedDeposits}
          route="/deposits"
        />
      </div>
    </div>
  );
}
