import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Level1FormFields } from "./Level1FormFields";
import { DocumentUpload } from "./DocumentUpload";
import { formSchema, FormData } from "./types";
import { CheckCircle } from "lucide-react";

export const Level1Form = () => {
  const queryClient = useQueryClient();
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      country: "",
      dateOfBirth: new Date(),
      residentialAddress: "",
      occupation: "",
      documentType: "passport"
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (values: FormData) => {
      console.log("Starting KYC submission with values:", values);
      
      if (!documentUrl) {
        throw new Error('Please upload required document before submitting');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user found');
      }

      // First, check if there's an existing KYC record
      const { data: existingKYC } = await supabase
        .from('kyc_verifications')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const formattedDate = values.dateOfBirth instanceof Date 
        ? values.dateOfBirth.toISOString().split('T')[0]
        : values.dateOfBirth;

      const kycData = {
        user_id: user.id,
        full_name: values.fullName,
        country: values.country,
        date_of_birth: formattedDate,
        residential_address: values.residentialAddress,
        occupation: values.occupation,
        document_type: values.documentType,
        document_url: documentUrl,
        level_1_submitted: true,
        level_1_verified: null,
        // Reset these fields when resubmitting
        level_1_approved_at: null,
        level_1_approved_by: null
      };

      let result;
      if (existingKYC) {
        // Update existing record
        result = await supabase
          .from('kyc_verifications')
          .update(kycData)
          .eq('id', existingKYC.id)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from('kyc_verifications')
          .insert([kycData])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      toast.success('KYC information submitted successfully');
      setFormSubmitted(true);
    },
    onError: (error: Error) => {
      console.error('KYC submission error:', error);
      toast.error(error.message || 'Failed to submit KYC information');
    }
  });

  const handleSubmit = (formData: FormData) => {
    if (!documentUrl) {
      toast.error('Please upload required document before submitting');
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleUploadComplete = (url: string) => {
    if (url && url.length > 0) {
      setDocumentUrl(url);
      toast.success('Document uploaded successfully');
    } else {
      toast.error('Failed to upload document');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Level1FormFields />
        
        <DocumentUpload onUploadComplete={handleUploadComplete} />

        {documentUrl && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Document uploaded successfully</span>
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg mt-6">
          <h4 className="font-semibold mb-2">Verification Benefits:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Higher betting limits up to $50M</li>
            <li>Enable withdrawal option</li>
            <li>Support response time to 6 hours</li>
            <li>No Withdrawal Limit</li>
          </ul>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={submitMutation.isPending || !documentUrl}
        >
          {submitMutation.isPending ? 'Submitting...' : 'Submit Verification'}
        </Button>
      </form>
    </Form>
  );
};
