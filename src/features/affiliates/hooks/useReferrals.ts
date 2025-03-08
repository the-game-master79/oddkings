
import { useReferralCode } from './useReferralCode';
import { useReferralVerification } from './useReferralVerification';
import { useReferralStats } from './useReferralStats';

export function useReferrals() {
  const { referralCode, referralLink, referredBy } = useReferralCode();
  const { stats, referredUsers, refreshStats, isLoading } = useReferralStats();
  const { inputCode, setInputCode, isVerifying, verifyReferralCode } = useReferralVerification(refreshStats);

  return {
    // Referral code related
    referralCode,
    referralLink,
    referredBy,
    
    // Verification related
    inputCode,
    setInputCode,
    isVerifying,
    verifyReferralCode,
    
    // Stats related
    stats,
    referredUsers,
    isLoading,
    refreshStats,
  };
}
