import { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface NetworkSelectorProps {
  selectedNetwork: string;
  onSelect: (network: string) => void;
  selectedCrypto: string;
}

export function NetworkSelector({ selectedNetwork, onSelect, selectedCrypto }: NetworkSelectorProps) {
  const { data: networks, isLoading } = useQuery({
    queryKey: ['network-options', selectedCrypto],
    queryFn: async () => {
      try {
        console.log('Fetching networks for crypto:', selectedCrypto);
        const { data, error } = await supabase
          .from('deposit_methods')
          .select('network')
          .eq('crypto', selectedCrypto)
          .eq('is_active', true);

        if (error) throw error;

        // Get unique networks and sort them
        const uniqueNetworks = [...new Set(data.map(item => item.network))];
        console.log('Available networks:', uniqueNetworks);
        return uniqueNetworks;
      } catch (error) {
        console.error('Error fetching networks:', error);
        return [];
      }
    },
    enabled: Boolean(selectedCrypto)
  });

  useEffect(() => {
    if (networks?.length) {
      console.log('Networks changed:', networks);
      // Auto-select network if only one available or if current selection is invalid
      if (networks.length === 1) {
        onSelect(networks[0]);
      } else if (!networks.includes(selectedNetwork)) {
        onSelect(networks[0]);
      }
    } else if (!networks?.length && selectedNetwork) {
      // Reset selection if no networks available
      onSelect('');
    }
  }, [networks, selectedNetwork, onSelect]);

  if (!selectedCrypto) return null;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Network</label>
      <Select value={selectedNetwork} onValueChange={onSelect}>
        <SelectTrigger className="h-9 md:h-10">
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : networks?.length ? (
            networks.map((network) => (
              <SelectItem key={network} value={network}>
                {network}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No networks available
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
