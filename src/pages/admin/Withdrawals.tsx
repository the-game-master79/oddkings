import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WithdrawalRequest } from "@/features/withdraw/types";
import { WithdrawalMetrics } from "@/components/admin/withdrawals/WithdrawalMetrics";

// Define the allowed tab values
type TabValue = "pending" | "approved" | "rejected" | "all";

interface WithdrawalWithEmail extends WithdrawalRequest {
  user_email?: string;
}

export default function Withdrawals() {
  const [activeTab, setActiveTab] = useState<TabValue>("pending");

  const { data: withdrawals = [], refetch, isLoading } = useQuery({
    queryKey: ['admin-withdrawals', activeTab],
    queryFn: async () => {
      // First, let's query the withdrawals
      let query = supabase
        .from('withdrawals')
        .select('*');
      
      if (activeTab !== "all") {
        query = query.eq('status', activeTab);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data: withdrawalsData, error } = await query;
      
      if (error) throw error;
      
      // Now, if we have withdrawals, let's get the user emails
      if (withdrawalsData && withdrawalsData.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(withdrawalsData.map(w => w.user_id))];
        
        // Get user information from user_statistics view
        const { data: usersData, error: usersError } = await supabase
          .from('user_statistics')
          .select('id, email')
          .in('id', userIds);
        
        if (usersError) throw usersError;
        
        // Create a map of user IDs to emails
        const userEmailMap = (usersData || []).reduce((map, user) => {
          map[user.id] = user.email;
          return map;
        }, {} as Record<string, string>);
        
        // Add email to withdrawals
        return withdrawalsData.map(withdrawal => ({
          ...withdrawal,
          user_email: userEmailMap[withdrawal.user_id] || 'Unknown'
        }));
      }
      
      return withdrawalsData as WithdrawalWithEmail[];
    }
  });

  const handleApprove = async (withdrawal: WithdrawalRequest) => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: 'approved' })
        .eq('id', withdrawal.id);

      if (error) throw error;
      
      toast.success("Withdrawal approved successfully");
      refetch();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast.error("Failed to approve withdrawal");
    }
  };

  const handleReject = async (withdrawal: WithdrawalRequest) => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', withdrawal.id);

      if (error) throw error;
      
      toast.success("Withdrawal rejected");
      refetch();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast.error("Failed to reject withdrawal");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
        <Button variant="outline" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {!isLoading && withdrawals && <WithdrawalMetrics withdrawals={withdrawals} />}

      <Tabs defaultValue="pending" onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <p>Loading withdrawals...</p>
          ) : withdrawals.length === 0 ? (
            <p>No {activeTab !== "all" ? activeTab : ""} withdrawal requests found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {withdrawals.map((withdrawal) => (
                <Card key={withdrawal.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {withdrawal.amount} {withdrawal.token}
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(withdrawal.created_at), "PPP p")}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={
                          withdrawal.status === "approved" 
                            ? "secondary" 
                            : withdrawal.status === "rejected"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">User:</span>
                        <span className="font-medium">
                          {(withdrawal as WithdrawalWithEmail).user_email || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Network:</span>
                        <span className="font-medium">{withdrawal.network}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Wallet:</span>
                        <span className="font-medium truncate max-w-[150px]" title={withdrawal.wallet_address}>
                          {withdrawal.wallet_address || 'Not provided'}
                        </span>
                      </div>
                      
                      {withdrawal.status === "pending" && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleApprove(withdrawal)}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleReject(withdrawal)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
