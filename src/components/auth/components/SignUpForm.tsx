import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SignUpFormProps {
  initialReferralCode?: string | null;
}

export const SignUpForm = ({ initialReferralCode }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState(initialReferralCode || "");
  const [isOpen, setIsOpen] = useState(!!initialReferralCode);
  const [referrerEmail, setReferrerEmail] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { isLoading, signUp } = useAuth();
  const location = useLocation();

  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return email;
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const [username, domain] = parts;
    
    if (username.length <= 2) {
      return `${username}@${domain}`;
    }
    
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  const validateReferralCode = async (code: string) => {
    if (code.length === 8) {
      try {
        const { data: referralData } = await supabase
          .from('referral_codes')
          .select('user_id')
          .eq('code', code)
          .maybeSingle();

        if (referralData) {
          // Get referrer's email
          const { data: userData } = await supabase
            .from('user_statistics')
            .select('email')
            .eq('id', referralData.user_id)
            .maybeSingle();

          if (userData?.email) {
            const maskedEmail = maskEmail(userData.email);
            setReferrerEmail(maskedEmail);
            toast.success("Valid referral code added!");
          } else {
            setReferrerEmail(null);
            toast.error("Could not find referrer information");
          }
        } else {
          setReferrerEmail(null);
          toast.error("Invalid referral code");
        }
      } catch (error) {
        console.error("Error validating referral code:", error);
        setReferrerEmail(null);
        toast.error("Error validating referral code");
      }
    } else {
      setReferrerEmail(null);
    }
  };

  useEffect(() => {
    // Get referral code from URL if present
    const searchParams = new URLSearchParams(location.search);
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      setIsOpen(true);
      validateReferralCode(ref);
    } else if (initialReferralCode) {
      validateReferralCode(initialReferralCode);
    }
  }, [location.search, initialReferralCode]);

  const handleReferralCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    if (code.length <= 8) {
      setReferralCode(code);
      validateReferralCode(code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast.error("Please accept the Terms & Conditions and Privacy Policy");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    const result = await signUp(email, password, referralCode);
    if (result?.success) {
      // We don't need to show another toast here since useAuth already shows one
      // The toast is now shown directly in the useAuth hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pr-10"
            required
            disabled={isLoading}
            minLength={6}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
          required
        />
        <label
          htmlFor="terms"
          className="text-sm text-muted-foreground"
        >
          I Agree to the{" "}
          <a
            href="https://maple-bird-67e.notion.site/Terms-of-Use-1a026b886ab280ef83c9fb1742d118c8"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Terms & Conditions
          </a>
          {" "}and{" "}
          <a
            href="https://maple-bird-67e.notion.site/Terms-of-Use-1a026b886ab280ef83c9fb1742d118c8"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Privacy Policy
          </a>
        </label>
      </div>
      
      <Collapsible open={isOpen || !!referralCode} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 w-full justify-between"
          >
            <span>Add Referral Code {referralCode ? `(${referralCode})` : '(Optional)'}</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter referral code (8 characters)"
              value={referralCode}
              onChange={handleReferralCodeChange}
              className="w-full"
              disabled={isLoading}
              maxLength={8}
            />
            {referrerEmail && (
              <p className="text-sm text-muted-foreground">
                Referrer: {referrerEmail}
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
};
