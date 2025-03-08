
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KYCDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  kycDetails: any;
}

export const KYCDetailsSheet = ({ isOpen, onClose, kycDetails }: KYCDetailsSheetProps) => {
  const queryClient = useQueryClient();

  const handleAction = async (level: number, approve: boolean) => {
    try {
      if (approve) {
        // Approve KYC
        await supabase.rpc('approve_kyc_level', {
          p_user_id: kycDetails.user_id,
          p_level: level
        });
        toast.success(`KYC Level ${level} approved successfully`);
      } else {
        // Reject KYC and delete the record for Level 1
        if (level === 1) {
          // First, mark as rejected so we can show it to the user
          const { error: updateError } = await supabase
            .from('kyc_verifications')
            .update({
              level_1_verified: false,
              level_1_approved_at: new Date().toISOString()
            })
            .eq('user_id', kycDetails.user_id);
          
          if (updateError) throw updateError;
        } else {
          // For Level 2, just mark as rejected
          const { error: updateError } = await supabase
            .from('kyc_verifications')
            .update({
              level_2_verified: false,
              level_2_approved_at: new Date().toISOString()
            })
            .eq('user_id', kycDetails.user_id);
          
          if (updateError) throw updateError;
        }
        
        toast.success(`KYC Level ${level} rejected`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast.error(`Failed to ${approve ? 'approve' : 'reject'} KYC: ${error.message}`);
    }
  };

  const handleDownload = (url: string) => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = url.split('/').pop() || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDocumentPreview = (url: string | null) => {
    if (!url) return null;

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <p className="font-medium">Document Preview:</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDownload(url)}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
        {url.toLowerCase().endsWith('.pdf') ? (
          <iframe src={url} className="w-full h-96 border rounded-lg" />
        ) : (
          <img src={url} alt="KYC Document" className="max-w-full h-auto rounded-lg" />
        )}
      </div>
    );
  };

  const getVerificationStatus = (level: number) => {
    const isVerified = level === 1 
      ? kycDetails.level_1_verified
      : kycDetails.level_2_verified;
    
    const isSubmitted = level === 1 
      ? kycDetails.level_1_submitted
      : kycDetails.level_2_submitted;
    
    // Not submitted yet
    if (!isSubmitted) {
      return { 
        label: "Not Submitted", 
        variant: "destructive" as const,
        icon: <XCircle className="w-4 h-4 mr-1" />
      };
    }
    
    // Already verified
    if (isVerified === true) {
      return { 
        label: "Approved", 
        variant: "default" as const,
        icon: <CheckCircle className="w-4 h-4 mr-1" />
      };
    }
    
    // Explicitly rejected
    if (isVerified === false) {
      return { 
        label: "Rejected", 
        variant: "destructive" as const,
        icon: <XCircle className="w-4 h-4 mr-1" />
      };
    }
    
    // Submitted but not reviewed yet
    return { 
      label: "Pending Review", 
      variant: "secondary" as const,
      icon: <AlertCircle className="w-4 h-4 mr-1" />
    };
  };

  const renderActionButtons = (level: number) => {
    const isSubmitted = level === 1 
      ? kycDetails.level_1_submitted 
      : kycDetails.level_2_submitted;
    const isVerified = level === 1
      ? kycDetails.level_1_verified
      : kycDetails.level_2_verified;
    
    if (!isSubmitted || isVerified !== null) return null;

    return (
      <div className="flex gap-2 mt-4">
        <Button
          variant="default"
          className="bg-green-500 hover:bg-green-600"
          onClick={() => handleAction(level, true)}
        >
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={() => handleAction(level, false)}
        >
          Reject
        </Button>
      </div>
    );
  };

  if (!kycDetails) return null;

  const level1Status = getVerificationStatus(1);
  const level2Status = getVerificationStatus(2);
  const isLevel1Submitted = !!kycDetails.level_1_submitted;
  const isLevel2Submitted = !!kycDetails.level_2_submitted;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>KYC Verification Details</SheetTitle>
          <SheetDescription>
            Review user's KYC submission details
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center justify-between">
              Level 1 Verification
              <Badge variant={level1Status.variant} className="flex items-center">
                {level1Status.icon} {level1Status.label}
              </Badge>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{kycDetails.full_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium">{kycDetails.country || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {kycDetails.date_of_birth 
                    ? format(new Date(kycDetails.date_of_birth), 'PPP')
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Occupation</p>
                <p className="font-medium">{kycDetails.occupation || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Residential Address</p>
                <p className="font-medium">{kycDetails.residential_address || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Document Type</p>
                <p className="font-medium">{kycDetails.document_type || 'Not provided'}</p>
              </div>
            </div>
            {renderDocumentPreview(kycDetails.document_url)}
            {renderActionButtons(1)}
          </div>

          {kycDetails.level_1_verified && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center justify-between">
                Level 2 Verification
                <Badge variant={level2Status.variant} className="flex items-center">
                  {level2Status.icon} {level2Status.label}
                </Badge>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Address Proof</p>
                  <p className="font-medium">{kycDetails.address_proof || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Funds Proof</p>
                  <p className="font-medium">{kycDetails.funds_proof || 'Not provided'}</p>
                </div>
              </div>
              {renderDocumentPreview(kycDetails.level_2_document_url)}
              {renderActionButtons(2)}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
