
// Types for the deposit methods

export interface DepositMethod {
  id: string;
  crypto: string;
  network: string;
  deposit_address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  qr_code_url?: string | null;
  display_order?: number | null;
  deposit_group_id?: string | null;
}

export const CRYPTO_OPTIONS = [
  { code: "BTC", name: "Bitcoin (BTC)" },
  { code: "ETH", name: "Ethereum (ETH)" },
  { code: "LTC", name: "Litecoin (LTC)" },
  { code: "USDT", name: "Tether (USDT)" },
  { code: "SOL", name: "Solana (SOL)" },
  { code: "DOGE", name: "Dogecoin (DOGE)" },
  { code: "BCH", name: "Bitcoin Cash (BCH)" },
  { code: "XRP", name: "Ripple (XRP)" },
  { code: "TRX", name: "Tron (TRX)" },
  { code: "EOS", name: "EOS (EOS)" },
  { code: "BNB", name: "Binance Coin (BNB)" },
  { code: "USDC", name: "USD Coin (USDC)" },
  { code: "ADA", name: "Cardano (ADA)" },
  { code: "SHIB", name: "Shiba Inu (SHIB)" },
  { code: "MATIC", name: "Polygon (POL)" }
];

export const NETWORK_OPTIONS = [
  { code: "ERC20", name: "Ethereum (ERC20)" },
  { code: "BEP20", name: "Binance Smart Chain (BEP20)" },
  { code: "POL", name: "Polygon (POL)" },
  { code: "TRC20", name: "Tron (TRC20)" },
  { code: "SOL", name: "Solana" },
  { code: "CORE", name: "Core Network" }
];
