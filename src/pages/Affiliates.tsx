import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReferralCodeCard } from "@/features/affiliates/components/ReferralCodeCard";
import { StatsCard } from "@/features/affiliates/components/StatsCard";
import { ReferralTable } from "@/features/affiliates/components/ReferralTable";
import { useReferrals } from "@/features/affiliates/hooks/useReferrals";
import { CheckCircle } from "lucide-react";

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [username, domain] = parts;
  return `${username.slice(0, 4)}***@${domain}`;
}

export default function Affiliates() {
  const {
    referralLink,
    referredBy,
    inputCode,
    setInputCode,
    isVerifying,
    stats,
    referredUsers,
    verifyReferralCode,
    isLoading,
  } = useReferrals();

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Affiliates Program</h1>
      </div>
      
      <div className="flex flex-col gap-6">
        <ReferralCodeCard referralLink={referralLink} />
        <StatsCard stats={stats} />

        {!referredBy && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Referral Code</CardTitle>
              <CardDescription>Enter the referral code that was shared with you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Enter referral code"
                  className="flex-1"
                />
                <Button 
                  onClick={verifyReferralCode}
                  disabled={isVerifying || !inputCode}
                  className="w-full sm:w-auto"
                >
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {referredBy && (
          <Card>
            <CardHeader>
              <CardTitle>My Referrer</CardTitle>
              <CardDescription>Successfully verified referral from:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{maskEmail(referredBy)}</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Referred Users</CardTitle>
            <CardDescription>Users you have referred</CardDescription>
          </CardHeader>
          <CardContent>
            <ReferralTable users={referredUsers} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
