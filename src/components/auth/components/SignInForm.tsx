
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SignInFormProps {
  referralCode?: string | null;
}

export const SignInForm = ({ referralCode }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const { isLoading, signIn, resendVerificationEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn(email, password, referralCode || undefined);
    if (result?.needsEmailVerification) {
      setShowVerificationAlert(true);
    }
  };

  const handleResendVerification = async () => {
    if (email) {
      await resendVerificationEmail(email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showVerificationAlert && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertDescription className="flex flex-col gap-3">
            <p>Please verify your email to continue using the website.</p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="w-full mt-1"
              onClick={handleResendVerification}
            >
              <Mail className="h-4 w-4 mr-2" />
              Resend Verification Email
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
            autoComplete="current-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};
