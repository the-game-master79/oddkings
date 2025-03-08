
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { verifyAndCreateReferral } from '../utils/referralApi';

export function useReferralVerification(onSuccess: () => void) {
  const [inputCode, setInputCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyReferralCode = async () => {
    try {
      setIsVerifying(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login first");
        return;
      }

      await verifyAndCreateReferral(session.user.id, inputCode);
      
      toast.success("Referral code verified successfully!");
      onSuccess();
      setInputCode('');
    } catch (error) {
      console.error("Error in verifyReferralCode:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  return { inputCode, setInputCode, isVerifying, verifyReferralCode };
}
