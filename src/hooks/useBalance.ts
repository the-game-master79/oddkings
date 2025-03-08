import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBalance = () => {
  return useQuery({
    queryKey: ['user-balance'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('user_balances')
        .select('total_usd_value')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      return data?.total_usd_value || 0;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};
