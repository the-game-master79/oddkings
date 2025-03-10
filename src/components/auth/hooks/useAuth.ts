import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setIsAdmin(profile?.role === 'admin');
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuthAndRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // When the auth state changes, check for pending referral code
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if there's a pending referral from OAuth
        const pendingReferralCode = localStorage.getItem('pendingReferralCode');
        if (pendingReferralCode) {
          try {
            // Process the referral connection
            await processReferralCode(session.user.id, pendingReferralCode);
            // Clear the pending referral
            localStorage.removeItem('pendingReferralCode');
          } catch (error) {
            console.error("Error processing referral after OAuth:", error);
          }
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getReferralChain = async (referrerId: string): Promise<string[]> => {
    // Start with the immediate referrer
    const chain: string[] = [referrerId];
    
    // Get all ancestors up to 3 levels (for a total of 4 levels including immediate referrer)
    const { data: relationships, error } = await supabase
      .from('referral_relationships')
      .select('referrer_id, referred_id')
      .eq('referred_id', referrerId);

    if (!error && relationships) {
      let currentId = referrerId;
      while (relationships.length > 0 && chain.length < 4) {
        const relation = relationships.find(r => r.referred_id === currentId);
        if (!relation) break;
        
        chain.push(relation.referrer_id);
        currentId = relation.referrer_id;
      }
    }
    
    // Reverse the chain so it goes from highest ancestor to immediate referrer
    return chain.reverse();
  };

  const waitForSession = async (maxAttempts = 10): Promise<boolean> => { // Increased attempts
    for (let i = 0; i < maxAttempts; i++) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        return true;
      }
      // Wait for 2 seconds before next attempt (increased wait time)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return false;
  };

  const createReferralRelationships = async (userId: string, referralChain: string[]) => {
    try {
      // Wait a bit before trying to create relationships
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ensure we have a valid session with retries
      const hasSession = await waitForSession();
      if (!hasSession) {
        throw new Error("Failed to establish session after multiple attempts");
      }

      // Create relationships one by one with error handling
      for (const referrerId of referralChain) {
        const { error: relationError } = await supabase
          .from('referral_relationships')
          .insert({
            referrer_id: referrerId,
            referred_id: userId
          })
          .select()
          .single();

        if (relationError) {
          if (relationError.code === '23505') { // Duplicate key error
            console.log("Relationship already exists, skipping...");
            continue;
          }
          throw relationError;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error in createReferralRelationships:", error);
      throw error;
    }
  };

  // Helper function to process a referral code
  const processReferralCode = async (userId: string, referralCode: string) => {
    if (!referralCode) return;
    
    try {
      // Validate referral code
      const { data: referralData, error: referralError } = await supabase
        .from('referral_codes')
        .select('code, user_id')
        .eq('code', referralCode)
        .maybeSingle();

      if (referralError || !referralData) {
        console.error("Invalid referral code or error validating it:", referralError);
        return;
      }

      // Check for self-referral
      if (referralData.user_id === userId) {
        console.error("Self-referral attempt detected");
        return;
      }

      // Get referral chain
      const referralChain = await getReferralChain(referralData.user_id);
      console.log("Referral chain found:", referralChain);

      // Create referral relationships with improved session handling
      await createReferralRelationships(userId, referralChain);
      
      return true;
    } catch (error) {
      console.error("Failed to process referral code:", error);
      return false;
    }
  };

  const signUp = async (email: string, password: string, referralCode: string) => {
    setIsLoading(true);

    try {
      if (referralCode) {
        // Validate referral code
        const { data: referralData, error: referralError } = await supabase
          .from('referral_codes')
          .select('code, user_id')
          .eq('code', referralCode)
          .maybeSingle();

        if (referralError || !referralData) {
          toast.error(referralError ? "Error validating referral code" : "Invalid referral code");
          return { success: false };
        }

        // Check for self-referral
        const { data: referrerData } = await supabase
          .from('user_statistics')
          .select('email')
          .eq('id', referralData.user_id)
          .single();

        if (referrerData?.email === email) {
          toast.error("You cannot refer yourself");
          return { success: false };
        }

        // Sign up the user first
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { referral_code: referralCode },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error || !data.user) {
          throw error || new Error("Signup failed - no user returned");
        }

        // Get referral chain and create relationships with retry logic
        const referralChain = await getReferralChain(referralData.user_id);
        console.log("Referral chain found:", referralChain);

        if (referralChain.length > 0) {
          console.log("Starting referral relationship creation...");
          try {
            await createReferralRelationships(data.user.id, referralChain);
            console.log("Referral relationships created successfully");
          } catch (relationshipError) {
            console.error("Failed to create referral relationships:", relationshipError);
            // Continue with signup even if referral creation fails
          }
        }
      } else {
        // Regular signup without referral
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error || !data.user) {
          throw error || new Error("Signup failed - no user returned");
        }
      }
      
      toast.success("Registration Successful, kindly verify your email before Login", {
        duration: 8000,
        position: "top-center",
        className: "font-medium",
      });
      return { success: true };
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.error_description || error.message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string, referralCode?: string) => {
    setIsLoading(true);

    try {
      // Store referral code in local storage to handle it after auth
      if (referralCode) {
        localStorage.setItem('pendingReferralCode', referralCode);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Check if the error is due to email not being verified
        if (error.message.includes('Email not confirmed')) {
          toast.error("Please verify your email before logging in");
          return { success: false, needsEmailVerification: true };
        }
        throw error;
      }

      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        toast.error("Please verify your email before logging in");
        return { success: false, needsEmailVerification: true };
      }

      toast.success("Successfully logged in!");
      navigate("/dashboard"); // Change from "/" to "/dashboard"
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.error_description || error.message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Verification email resent. Please check your inbox.");
      return { success: true };
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      toast.error(error.error_description || error.message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    signIn,
    signUp,
    resendVerificationEmail,
    isAdmin,
    loading
  };
};
