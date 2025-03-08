import { cn } from "@/lib/utils";
import { useImageCache } from "@/hooks/useImageCache";
import { useEffect, useState } from "react";

interface CryptoIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function CryptoIcon({ symbol, size = 20, className }: CryptoIconProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const formattedSymbol = symbol.toLowerCase();

  // Updated URLs with CORS-friendly sources
  const urls = [
    `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${formattedSymbol}.png`,
    `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${formattedSymbol}.svg`,
    `https://s2.coinmarketcap.com/static/img/coins/64x64/${getCoinMarketCapId(formattedSymbol)}.png`,
  ];

  const { cachedUrl, error } = useImageCache(urls, symbol);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  useEffect(() => {
    setImageLoaded(false);
  }, [cachedUrl]);

  // Fallback content when no image is available
  if (error || !cachedUrl) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted rounded-full",
          className
        )}
        style={{ width: size, height: size }}
      >
        <span className="text-xs font-bold text-muted-foreground">
          {symbol.slice(0, 2)}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative flex-shrink-0",
        className
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={cachedUrl}
        alt={`${symbol} icon`}
        onLoad={handleImageLoad}
        className={cn(
          "rounded-full w-full h-full object-contain transition-opacity duration-200",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-full">
          <span className="text-xs font-bold text-muted-foreground">
            {symbol.slice(0, 2)}
          </span>
        </div>
      )}
    </div>
  );
}

// Helper function to map crypto symbols to CoinMarketCap IDs
function getCoinMarketCapId(symbol: string): number {
  const idMap: { [key: string]: number } = {
    btc: 1,
    eth: 1027,
    usdt: 825,
    usdc: 3408,
    ltc: 2,
    bch: 1831,
    doge: 74,
    sol: 5426,
    trx: 1958,
    bnb: 1839,
    ada: 2010,
    xrp: 52,
    eos: 1765,
    shib: 5994
  };
  return idMap[symbol] || 1; // Default to BTC if symbol not found
}
