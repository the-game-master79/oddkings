export interface ReferralCode {
  code: string;
}

export interface ReferralStats {
  totalEarnings: number;
  totalReferred: number;
}

export interface ReferredUser {
  email: string;
  deposits: number;
  joinedAt: string;
  earnings: number;
  referredBy: string | null;
  balance: number;  // Add this field
}
