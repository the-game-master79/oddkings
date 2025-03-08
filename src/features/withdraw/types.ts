
export interface WithdrawalRequest {
  id: string;
  created_at: string;
  amount: number;
  token: string;
  network: string;
  status: string;
  wallet_address?: string;
  user_id?: string;
}

export interface WithdrawalFormData {
  amount: string;
  token: "USDT" | "USDC";
  network: "TRC20" | "ERC20" | "BEP20";
  walletAddress: string;
}

export const networkOptions = {
  USDT: ["TRC20", "ERC20", "BEP20"],
  USDC: ["TRC20", "ERC20", "BEP20"],
} as const;

export interface AdminWithdrawalManagementProps {
  onApprove: (withdrawal: WithdrawalRequest) => Promise<void>;
  onReject: (withdrawal: WithdrawalRequest) => Promise<void>;
  withdrawals: WithdrawalRequest[];
  isLoading: boolean;
}
