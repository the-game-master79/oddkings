import { useState, useEffect } from "react";
import { Copy, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDepositMethods } from "../hooks/useDepositMethods";

interface DepositAddressProps {
  selectedCrypto: string | null;
  selectedNetwork: string | null;
  depositAmount?: number;
}

export function DepositAddress({ selectedCrypto, selectedNetwork, depositAmount }: DepositAddressProps) {
  const [showQR, setShowQR] = useState(false);
  const [qrImageLoaded, setQrImageLoaded] = useState(false);
  const { data: depositMethods, isLoading } = useDepositMethods(selectedCrypto, selectedNetwork);

  const currentMethod = depositMethods?.[0];
  const depositAddress = currentMethod?.deposit_address || "";

  const getQRCodeUrl = () => {
    if (!depositAddress) return null;
    // Use the correct Supabase storage URL format
    return `https://qbwfitonbkorftjacqzp.supabase.co/storage/v1/object/public/deposit-qr-codes/${depositAddress}.png`;
  };

  // Reset QR image state when address changes
  useEffect(() => {
    setQrImageLoaded(false);
  }, [depositAddress]);

  const handleCopy = async () => {
    if (!depositAddress) {
      toast.error("No deposit address available");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(depositAddress);
      toast.success("Address copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy address");
      console.error("Copy error:", error);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading deposit address...</div>;
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Deposit Address</label>
      <div className="p-3 bg-muted rounded-lg space-y-2">
        {depositAddress ? (
          <>
            <div className="flex items-center gap-2">
              <Input
                value={depositAddress}
                readOnly
                className="text-xs md:text-sm h-8 md:h-9 font-mono"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 md:h-9 px-2 md:px-3 shrink-0"
                onClick={handleCopy}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 md:h-9 px-2 md:px-3 shrink-0"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode className="h-3.5 w-3.5" />
              </Button>
            </div>
            {showQR && (
              <div className="flex flex-col items-center justify-center mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="bg-white rounded-lg p-2 shadow-sm ring-1 ring-gray-200">
                  <div className="relative w-40 h-40 md:w-48 md:h-48">
                    {!qrImageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img 
                      src={getQRCodeUrl()}
                      alt={`QR Code for ${selectedCrypto} deposit`}
                      className={`w-full h-full transition-opacity duration-200 ${qrImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => setQrImageLoaded(true)}
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Scan to get the deposit address
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            {!selectedCrypto || !selectedNetwork 
              ? "Select crypto and network to view deposit address"
              : "No deposit address available for selected options"}
          </p>
        )}
      </div>
    </div>
  );
}
