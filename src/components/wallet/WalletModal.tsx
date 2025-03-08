import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CryptoSelector } from "./components/CryptoSelector";
import { NetworkSelector } from "./components/NetworkSelector";
import { DepositAddress } from "./components/DepositAddress";
import { useCryptoPrices } from "./hooks/useCryptoPrices";
import { WalletModalProps, CryptoPrice } from "./types";
import { useDepositMethods } from "./hooks/useDepositMethods";
import { Database } from "@/integrations/supabase/types";
import { useQueryClient } from "@tanstack/react-query";

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { prices, loading: isPriceLoading } = useCryptoPrices();
  const [selectedCrypto, setSelectedCrypto] = useState<keyof CryptoPrice>("ETH");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [quantity, setQuantity] = useState("");
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch deposit methods only when both crypto and network are selected
  const { data: depositMethods } = useDepositMethods(selectedCrypto, selectedNetwork);

  useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    setTotalValue(qty * (prices[selectedCrypto] || 0));
  }, [quantity, selectedCrypto, prices]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      setQuantity("");
      setTotalValue(0);
    }
  }, [open]);

  // Reset network when crypto changes
  useEffect(() => {
    setSelectedNetwork("");
  }, [selectedCrypto]);

  const handleSubmitDeposit = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to make a deposit");
        return;
      }

      const amount = parseFloat(quantity);
      if (!amount || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      // Get the deposit address for the selected crypto and network
      const depositMethod = depositMethods?.find(
        m => m.crypto === selectedCrypto && m.network === selectedNetwork
      );

      if (!depositMethod?.deposit_address) {
        toast.error("No deposit address available for the selected options");
        return;
      }

      // Make sure the data being sent matches the expected types for the deposits table
      const depositData: Database['public']['Tables']['deposits']['Insert'] = {
        user_id: session.user.id,
        amount: amount,
        crypto_type: selectedCrypto,
        deposit_address: depositMethod.deposit_address,
        total_usd_value: totalValue,
        status: 'pending'
      };

      console.log("Submitting deposit data:", depositData);

      const { error } = await supabase
        .from('deposits')
        .insert(depositData);

      if (error) {
        console.error('Error response:', error);
        throw error;
      }

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });

      toast.success("Deposit request submitted successfully");
      onOpenChange(false);
      setQuantity("");
    } catch (error) {
      console.error('Error submitting deposit:', error);
      toast.error("Failed to submit deposit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-[425px] max-h-[90vh] p-4 md:p-6 rounded-xl">
        <DialogHeader className="mb-3 md:mb-4">
          <DialogTitle className="text-lg md:text-xl">Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-3">
            <CryptoSelector
              selectedCrypto={selectedCrypto}
              prices={prices}
              onSelect={(value) => {
                setSelectedCrypto(value as keyof CryptoPrice);
                setSelectedNetwork("");  // Reset network when crypto changes
              }}
            />

            <NetworkSelector
              selectedNetwork={selectedNetwork}
              onSelect={setSelectedNetwork}
              selectedCrypto={selectedCrypto}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Deposit Amount</label>
            <div className="relative">
              <Input
                type="number"
                placeholder={`Enter ${selectedCrypto} amount`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="pr-28 h-9 md:h-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <div className="border-l h-full flex items-center px-2 md:px-3 text-xs md:text-sm text-gray-500">
                  ${totalValue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="py-1">
            <DepositAddress
              selectedCrypto={selectedCrypto}
              selectedNetwork={selectedNetwork}
              depositAmount={parseFloat(quantity)}
            />
          </div>

          <Button
            className="w-full h-9 md:h-10 mt-2"
            onClick={handleSubmitDeposit}
            disabled={isLoading || isPriceLoading}
          >
            Submit Deposit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
