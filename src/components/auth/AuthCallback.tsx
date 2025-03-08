import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    if (!email) return;
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      toast.success("Verification email sent successfully");
    } catch (error: any) {
      console.error("Error resending verification:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get params from URL
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      const errorDescription = params.get('error_description');
      const isAdmin = window.location.pathname.startsWith('/admin');
      
      if (errorParam) {
        setError(errorDescription || errorParam);
        toast.error(`Authentication Error: ${errorDescription || errorParam}`);
        setTimeout(() => navigate(isAdmin ? '/admin/auth' : '/auth'), 5000);
        return;
      }

      try {
        // Get session and process referral if needed
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Check if email is confirmed
          if (!session.user.email_confirmed_at) {
            setEmail(session.user.email);
            setVerificationMessage("Please verify your email to continue using all features.");
            toast.info("Please verify your email before using all features");
            navigate('/');
          } else {
            toast.success("Authentication successful!");
            
            // Check for any pending referral code in localStorage
            const pendingReferralCode = localStorage.getItem('pendingReferralCode');
            if (pendingReferralCode) {
              try {
                // Process the referral - this should be done by useAuth's auth state change handler
                // We'll just clear it here to be safe
                localStorage.removeItem('pendingReferralCode');
              } catch (error) {
                console.error("Error processing referral after callback:", error);
              }
            }
            
            // Redirect to the appropriate page
            setTimeout(() => navigate(isAdmin ? '/admin' : '/'), 500);
          }
        } else {
          // No session found, redirect to auth page
          setError("Authentication session not found");
          setTimeout(() => navigate(isAdmin ? '/admin/auth' : '/auth'), 2000);
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setError(error.message);
        toast.error(`Authentication Error: ${error.message}`);
        setTimeout(() => navigate(isAdmin ? '/admin/auth' : '/auth'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Authentication</h2>
          {error ? (
            <div className="mt-4 rounded-md bg-destructive/20 p-4 text-destructive">
              <p>Error: {error}</p>
              <p className="mt-2 text-sm">Redirecting to authentication page...</p>
            </div>
          ) : verificationMessage ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="rounded-full bg-primary/20 p-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <p className="text-lg font-medium">{verificationMessage}</p>
                {email && (
                  <p className="text-sm text-muted-foreground">
                    A verification link has been sent to {email}
                  </p>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={handleResendVerification} 
                className="mt-4"
              >
                Resend Verification Email
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-muted-foreground">Processing your authentication...</p>
          )}
        </div>
      </div>
    </div>
  );
}
