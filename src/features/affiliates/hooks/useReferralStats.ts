import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { ReferralStats, ReferredUser } from '../types';

export function useReferralStats() {
  const [stats, setStats] = useState<ReferralStats>({ totalEarnings: 0, totalReferred: 0 });
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsLoading(false);
      return;
    }

    try {
      // Get referred users with their relationships
      const { data: relationships, error: relError } = await supabase
        .from('referral_relationships')
        .select(`
          referred_id,
          referred_user:user_statistics!referred_id(
            email,
            joined_at,
            balance
          )
        `)
        .eq('referrer_id', session.user.id);

      if (relError) throw relError;

      if (!relationships?.length) {
        setReferredUsers([]);
        setStats({ totalEarnings: 0, totalReferred: 0 });
        return;
      }

      const referredIds = relationships.map(r => r.referred_id);

      // Get all deposits with status and amount in a single query
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('user_id, total_usd_value, status')
        .in('user_id', referredIds)
        .eq('status', 'approved');

      if (depositsError) throw depositsError;

      // Get commission transactions
      const { data: commissions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('type', 'referral_commission');

      // Process user data with deposits lookup table for better performance
      const userDepositsMap = new Map();
      deposits?.forEach(deposit => {
        const userId = deposit.user_id;
        const amount = Number(deposit.total_usd_value) || 0;
        userDepositsMap.set(userId, (userDepositsMap.get(userId) || 0) + amount);
      });

      const processedUsers = relationships.map(rel => {
        const totalDeposits = userDepositsMap.get(rel.referred_id) || 0;
        const userCommissions = commissions?.filter(t => 
          t.description.includes(rel.referred_id)
        ) || [];
        const userEarnings = userCommissions.reduce((sum, t) => sum + Number(t.amount), 0);

        return {
          email: rel.referred_user?.email || `User-${rel.referred_id.substring(0, 8)}`,
          deposits: totalDeposits,
          joinedAt: rel.referred_user?.joined_at || new Date().toISOString(),
          earnings: userEarnings,
          referredBy: null,
          balance: rel.referred_user?.balance || 0
        };
      });

      const totalEarnings = commissions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      setReferredUsers(processedUsers);
      setStats({
        totalEarnings,
        totalReferred: processedUsers.length
      });

    } catch (error) {
      console.error("[Affiliates] Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up polling to refresh data
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { stats, referredUsers, refreshStats: fetchStats, isLoading };
}
