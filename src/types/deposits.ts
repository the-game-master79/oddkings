
export type Deposit = {
  id: string;
  user_id: string;
  amount: number;
  crypto_type: string;
  deposit_address: string;
  total_usd_value: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};
