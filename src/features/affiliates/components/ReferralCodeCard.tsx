import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface ReferralCodeCardProps {
  referralLink: string;
}

export function ReferralCodeCard({ referralLink }: ReferralCodeCardProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy referral link");
    }
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader>
        <CardTitle>Your Referral Link</CardTitle>
        <CardDescription>Share this link with your friends</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded bg-muted p-3 font-mono text-sm">
            {referralLink}
          </code>
          <Button size="icon" variant="outline" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Get 5% for Deposits, and 10% on each trade placed.
        </p>
      </CardContent>
    </Card>
  );
}
