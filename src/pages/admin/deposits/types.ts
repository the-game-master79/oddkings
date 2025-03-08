
export type Deposit = {
  id: string;
  user_id: string;
  amount: number;
  total_usd_value: number;
  crypto_type: string;
  deposit_address: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};
