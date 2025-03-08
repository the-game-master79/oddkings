
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CryptoPrice } from '../types';
import { CRYPTO_OPTIONS } from '@/types/deposit-methods';

// CoinGecko IDs mapping
const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  LTC: "litecoin",
  USDT: "tether",
  SOL: "solana",
  DOGE: "dogecoin",
  BCH: "bitcoin-cash",
  XRP: "ripple",
  TRX: "tron",
  EOS: "eos",
  BNB: "binancecoin",
  USDC: "usd-coin",
  ADA: "cardano",
  SHIB: "shiba-inu"
};

// Fallback prices in case API fails
const FALLBACK_PRICES: CryptoPrice = {
  BTC: 60000,
  ETH: 2000,
  LTC: 80,
  USDT: 1,
  SOL: 100,
  DOGE: 0.1,
  BCH: 300,
  XRP: 0.5,
  TRX: 0.05,
  EOS: 0.7,
  BNB: 300,
  USDC: 1,
  ADA: 0.3,
  SHIB: 0.00002
};

export const useCryptoPrices = (refreshInterval = 30000) => {
  const [prices, setPrices] = useState<CryptoPrice>(FALLBACK_PRICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrices = async () => {
    try {
      // Create a comma-separated string of coin IDs
      const coinIds = Object.values(COINGECKO_IDS).join(',');
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`,
        {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000) // 5 seconds timeout
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await response.json();
      
      // Map the response data back to our crypto codes
      const newPrices: Partial<CryptoPrice> = {};
      
      // For each entry in our COINGECKO_IDS mapping
      Object.entries(COINGECKO_IDS).forEach(([code, coinId]) => {
        if (data[coinId] && typeof data[coinId].usd === 'number') {
          newPrices[code as keyof CryptoPrice] = data[coinId].usd;
        }
      });

      // Merge with fallback prices to ensure all required keys exist
      setPrices({
        ...FALLBACK_PRICES,
        ...newPrices
      });
      
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      // Use fallback prices if API fails
      setPrices(FALLBACK_PRICES);
      
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Unknown error fetching prices'));
      }
      
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Refresh prices periodically
    const interval = setInterval(fetchPrices, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { prices, loading, error, refetch: fetchPrices };
};
