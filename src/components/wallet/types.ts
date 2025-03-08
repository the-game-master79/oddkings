export interface CryptoPrice {
  BTC: number;
  ETH: number;
  LTC: number;
  USDT: number;
  SOL: number;
  DOGE: number;
  BCH: number;
  XRP: number;
  TRX: number;
  EOS: number;
  BNB: number;
  USDC: number;
  ADA: number;
  SHIB: number;
}

export interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
