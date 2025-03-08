import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DepositMethod } from '@/types/deposit-methods';

export function useDepositMethods(crypto?: string, network?: string) {
  return useQuery({
    queryKey: ['deposit-methods', crypto, network],
    queryFn: async (): Promise<DepositMethod[]> => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No active session, returning empty list of deposit methods');
          return [];
        }

        // Query deposit methods directly without join
        let query = supabase
          .from('deposit_methods')
          .select('*')
          .eq('is_active', true);

        if (crypto) {
          query = query.eq('crypto', crypto);
        }

        if (network) {
          query = query.eq('network', network);
        }

        const { data, error } = await query
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group methods by crypto+network
        const groupedMethods = new Map<string, DepositMethod[]>();
        (data || []).forEach(method => {
          const key = `${method.crypto}:${method.network}`;
          if (!groupedMethods.has(key)) {
            groupedMethods.set(key, []);
          }
          groupedMethods.get(key)!.push(method);
        });

        // Select one method per group
        const result: DepositMethod[] = [];
        groupedMethods.forEach((methods) => {
          if (methods.length === 1) {
            result.push(methods[0]);
          } else if (methods.length > 1) {
            result.push(methods[Math.floor(Math.random() * methods.length)]);
          }
        });

        return result;
      } catch (error) {
        console.error('Exception in useDepositMethods:', error);
        return [];
      }
    },
    refetchInterval: 30000,
    retry: 3,
    refetchOnWindowFocus: false,
    enabled: !!crypto && !!network,
  });
}

// For admin panel use
export function useAllDepositMethods(groupByDeposit: boolean = false) {
  return useQuery({
    queryKey: ['all-deposit-methods', groupByDeposit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('deposit_methods')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group methods
        const groupedMethods: Record<string, DepositMethod[]> = {};
        data?.forEach(method => {
          const key = groupByDeposit && method.deposit_group_id 
            ? method.deposit_group_id 
            : `${method.crypto}:${method.network}`;

          if (!groupedMethods[key]) {
            groupedMethods[key] = [];
          }
          groupedMethods[key].push(method);
        });

        return {
          methods: data || [],
          groupedMethods
        };
      } catch (error) {
        console.error('Exception in useAllDepositMethods:', error);
        return { methods: [], groupedMethods: {} };
      }
    },
    retry: 3,
    refetchOnWindowFocus: false,
  });
}
