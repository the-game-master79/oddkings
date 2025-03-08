import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CryptoIcon } from "@/components/shared/CryptoIcon";
import { CryptoPrice } from "../types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CryptoSelectorProps {
  selectedCrypto: string;
  prices: CryptoPrice;
  onSelect: (value: string) => void;
  selectedNetwork?: string;
}

export const CryptoSelector = ({ selectedCrypto, prices, onSelect }: CryptoSelectorProps) => {
  const { data: cryptoOptions, isLoading } = useQuery({
    queryKey: ['crypto-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deposit_methods')
        .select('crypto')
        .eq('is_active', true);

      if (error) throw error;

      // Get unique crypto values
      const uniqueCryptos = [...new Set(data.map(item => item.crypto))];
      return uniqueCryptos.map(crypto => ({
        code: crypto,
        name: crypto // You can add a mapping here if needed
      }));
    }
  });

  return (
    <div className="space-y-2 text-left">
      <label className="text-sm font-medium">Select Cryptocurrency</label>
      <Select value={selectedCrypto} onValueChange={onSelect}>
        <SelectTrigger className="w-full text-left">
          <SelectValue placeholder="Select a cryptocurrency">
            {selectedCrypto && (
              <div className="flex items-center gap-2">
                <CryptoIcon symbol={selectedCrypto} size={20} />
                <span>{selectedCrypto}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : cryptoOptions?.map((crypto) => (
            <SelectItem 
              key={crypto.code} 
              value={crypto.code}
              className="flex items-center justify-between py-2 pr-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CryptoIcon symbol={crypto.code} size={20} />
                <span className="truncate">{crypto.name}</span>
              </div>
              {prices[crypto.code as keyof CryptoPrice] !== undefined && (
                <span className="text-muted-foreground text-sm font-medium ml-4">
                  ${prices[crypto.code as keyof CryptoPrice]?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6
                  })}
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
