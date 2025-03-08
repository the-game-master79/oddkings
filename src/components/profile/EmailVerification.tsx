import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const EmailVerification = () => {
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

  const handleVerifyEmail = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: session?.user.email,
      options: {
        emailRedirectTo: 'https://oddkings-final.vercel.app'
      }
    });

    if (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email');
      return;
    }

    toast.success('Verification email sent successfully');
  };

  if (isLoading) {
    return <div className="flex items-center justify-start p-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {session?.user.email && !session?.user.email_confirmed_at && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="ml-2">
            <span className="font-medium">Your email is not verified.</span> Please verify your email to access all features of the website.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Input
          value={session?.user.email || ''}
          readOnly
          className="bg-muted"
        />
        {session?.user.email_confirmed_at ? (
          <div className="flex items-center text-green-500">
            <CheckCircle className="w-5 h-5 mr-2" />
            Verified
          </div>
        ) : (
          <Button
            onClick={handleVerifyEmail}
            variant="outline"
          >
            <Mail className="mr-2 h-4 w-4" />
            Verify Email
          </Button>
        )}
      </div>
    </div>
  );
};
