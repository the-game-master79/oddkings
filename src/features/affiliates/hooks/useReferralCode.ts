
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { fetchReferralCode, fetchReferrerDetails } from '../utils/referralApi';

export function useReferralCode() {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralLink, setReferralLink] = useState<string>('');
  const [referredBy, setReferredBy] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const referralData = await fetchReferralCode(session.user.id);
    if (referralData) {
      setReferralCode(referralData.code);
      setReferralLink(`${window.location.origin}/auth?ref=${referralData.code}`);
    }

    const referrerStats = await fetchReferrerDetails(session.user.id);
    if (referrerStats?.email) {
      setReferredBy(referrerStats.email);
    }
  };

  return { referralCode, referralLink, referredBy };
}
