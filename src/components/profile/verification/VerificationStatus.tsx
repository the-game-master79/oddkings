
import { Badge } from "@/components/ui/badge";

interface VerificationStatusProps {
  isVerified: boolean;
  isPending: boolean;
  isRejected?: boolean;
}

export const VerificationStatus = ({ isVerified, isPending, isRejected }: VerificationStatusProps) => {
  const getStatus = () => {
    if (isVerified) return { text: "Verified", variant: "default" as const };
    if (isPending) return { text: "Under Verification", variant: "secondary" as const };
    if (isRejected) return { text: "Rejected", variant: "destructive" as const };
    return { text: "Not Verified", variant: "destructive" as const };
  };

  const status = getStatus();

  return (
    <Badge 
      variant={status.variant}
      className={`ml-2 ${status.text === "Under Verification" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}`}
    >
      {status.text}
    </Badge>
  );
};
