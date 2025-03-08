
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WithdrawalForm } from "@/features/withdraw/components/WithdrawalForm";
import { WithdrawalHistory } from "@/features/withdraw/components/WithdrawalHistory";
import type { WithdrawalRequest } from "@/features/withdraw/types";

export default function Withdraw() {
  const { data: balance = 0, refetch: refetchBalance } = useQuery({
    queryKey: ["user-balance"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_balances")
        .select("total_usd_value")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;
      return data?.total_usd_value || 0;
    },
  });

  const { data: withdrawals = [], refetch: refetchWithdrawals } = useQuery({
    queryKey: ["user-withdrawals"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WithdrawalRequest[];
    },
  });

  const handleWithdrawalSuccess = () => {
    refetchWithdrawals();
    refetchBalance();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Withdraw Funds</h1>
        <p className="text-lg">Current Balance: ${balance.toFixed(2)}</p>
      </div>

      <WithdrawalForm balance={balance} onSuccess={handleWithdrawalSuccess} />
      <WithdrawalHistory withdrawals={withdrawals} />
    </div>
  );
}
