import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "@/components/admin/UsersTable";
import { UserStatsCard } from "@/components/admin/UserStatsCard";
import { supabase } from "@/integrations/supabase/client";

const Users = () => {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      try {
        // Get total registered users
        const { count: registeredUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Get today's active users (users who participated in questions today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count: activeUsers } = await supabase
          .from("trades")
          .select("user_id", { count: "exact", head: true })
          .gte("created_at", today.toISOString())
          .not("user_id", "eq", null);

        return {
          registeredUsers: registeredUsers || 0,
          activeUsers: activeUsers || 0,
        };
      } catch (error) {
        console.error("Error fetching user stats:", error);
        return { registeredUsers: 0, activeUsers: 0 };
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Users Administration</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <UserStatsCard 
          title="Registered Users"
          value={isLoadingStats ? "-" : stats?.registeredUsers.toString() || "0"}
          type="registered"
        />
        <UserStatsCard 
          title="Active Users Today"
          value={isLoadingStats ? "-" : stats?.activeUsers.toString() || "0"}
          type="active"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
