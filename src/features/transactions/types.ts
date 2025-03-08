
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'trade_placement' | 'trade_payout' | 'referral_commission' | 'withdrawal';
  created_at: string;
  description: string | null;
  status?: 'pending' | 'completed' | 'failed';
}

export interface TransactionFilters {
  typeFilter: string; // Changed to string to support our custom types (sports_trade, news_trade)
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
}

export interface SportTrade {
  id: string;
  user_id: string;
  sport_question_id: string;
  amount: number;
  prediction: 'yes' | 'no';
  payout: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface NewsTrade {
  id: string;
  user_id: string;
  question_id: string;
  amount: number;
  prediction: 'yes' | 'no';
  payout: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}
