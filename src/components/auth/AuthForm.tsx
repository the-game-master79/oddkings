import { useState, useEffect } from "react";
import { SignInForm } from "./components/SignInForm";
import { SignUpForm } from "./components/SignUpForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "@/components/common/Logo";

export const AuthForm = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const location = useLocation();

  // Extract referral code from URL if present
  const searchParams = new URLSearchParams(location.search);
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    // Check for auth errors in URL (e.g., after redirects)
    const errorFromURL = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (errorFromURL) {
      toast.error(`Authentication Error: ${errorDescription || errorFromURL}`);
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      
      // Store referral code in local storage before redirect
      if (referralCode) {
        localStorage.setItem('pendingReferralCode', referralCode);
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            // Pass referral code as a query param too (fallback)
            ...(referralCode ? { ref: referralCode } : {})
          }
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background p-4 sm:p-6 md:p-12">
      <div className="fixed top-4 right-4">
      </div>
      
      <div className="w-full max-w-md mx-auto self-start">
        <div
          className="cursor-pointer my-6 flex justify-center"
          onClick={() => window.location.href = "/"}
        >
          <Logo className="h-12 sm:h-16" />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-center p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant={activeTab === "signin" ? "default" : "ghost"}
                onClick={() => setActiveTab("signin")}
                className="w-full rounded-lg transition-all duration-200"
              >
                Login
              </Button>
              <Button
                variant={activeTab === "signup" ? "default" : "ghost"}
                onClick={() => setActiveTab("signup")}
                className="w-full rounded-lg transition-all duration-200"
              >
                Register
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-gray-300 dark:border-gray-600"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path
                      fill="#4285F4"
                      d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                    />
                  </g>
                </svg>
                {isGoogleLoading ? "Loading..." : "Continue with Google"}
              </Button>
            </div>
            
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
                  OR
                </span>
              </div>
            </div>
            
            {activeTab === "signin" ? (
              <SignInForm referralCode={referralCode} />
            ) : (
              <SignUpForm initialReferralCode={referralCode} />
            )}
          </div>
        </div>
        
        <p className="text-center mt-8 text-sm text-muted-foreground">
          By using oddKINGS, you accept our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
        </p>
      </div>
      
      <footer className="w-full text-center py-4 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} oddKINGS. All rights reserved.
      </footer>
    </div>
  );
};
