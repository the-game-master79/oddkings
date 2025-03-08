
import { supabase } from "@/integrations/supabase/client";

export async function fetchReferralCode(userId: string) {
  const { data: referralData } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('user_id', userId)
    .single();
  
  return referralData;
}

export async function fetchReferrerDetails(userId: string) {
  const { data: referralData } = await supabase
    .from('referral_relationships')
    .select('referrer_id')
    .eq('referred_id', userId)
    .maybeSingle();

  if (referralData?.referrer_id) {
    const { data: referrerStats } = await supabase
      .from('user_statistics')
      .select('email')
      .eq('id', referralData.referrer_id)
      .maybeSingle();
    
    return referrerStats;
  }
  
  return null;
}

export async function fetchReferralStats(userId: string) {
  // Get all referral commission transactions
  const { data: commissionsData, error: commissionsError } = await supabase
    .from('transactions')
    .select('amount, description, created_at')
    .eq('user_id', userId)
    .eq('type', 'referral_commission')
    .order('created_at', { ascending: false });

  if (commissionsError) {
    console.error("Error fetching commissions:", commissionsError);
    throw commissionsError;
  }

  return commissionsData;
}

export async function verifyAndCreateReferral(userId: string, referralCode: string) {
  // Check if user is trying to use their own referral code
  const { data: ownReferralCode } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('user_id', userId)
    .single();

  if (ownReferralCode && ownReferralCode.code === referralCode) {
    throw new Error("You cannot use your own referral code");
  }

  const { data: existingReferral } = await supabase
    .from('referral_relationships')
    .select()
    .eq('referred_id', userId)
    .maybeSingle();

  if (existingReferral) {
    throw new Error("You have already verified a referral code");
  }

  const { data: referrerData } = await supabase
    .from('referral_codes')
    .select('user_id')
    .eq('code', referralCode)
    .maybeSingle();

  if (!referrerData) {
    throw new Error("Invalid referral code");
  }

  const { error } = await supabase
    .from('referral_relationships')
    .insert({
      referrer_id: referrerData.user_id,
      referred_id: userId
    });

  if (error) {
    throw new Error("Failed to verify referral code");
  }
}

export async function fetchReferredUsers(userId: string) {
  const { data: relationships, error: relationshipsError } = await supabase
    .from('referral_relationships')
    .select('referred_id')
    .eq('referrer_id', userId);

  if (relationshipsError) {
    throw relationshipsError;
  }

  if (!relationships?.length) {
    return { userStats: [] };
  }

  const referredIds = relationships.map(r => r.referred_id);

  const { data: userStats, error: userStatsError } = await supabase
    .from('user_statistics')
    .select('id, email, balance, joined_at')
    .in('id', referredIds);

  if (userStatsError) {
    throw userStatsError;
  }

  // Get user emails from auth.users if needed
  for (let i = 0; i < (userStats?.length || 0); i++) {
    if (!userStats![i].email) {
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userStats![i].id)
        .single();
      
      if (userData) {
        userStats![i].email = `User-${userData.id.substring(0, 8)}`;
      }
    }
  }

  return { userStats };
}
