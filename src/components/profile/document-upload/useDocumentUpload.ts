import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseDocumentUploadProps {
  onUploadComplete: (url: string) => void;
}

export const useDocumentUpload = ({ onUploadComplete }: UseDocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileType, setUploadedFileType] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [bucketChecked, setBucketChecked] = useState(false);

  // Check if bucket exists on hook initialization
  useEffect(() => {
    checkKycBucket();
  }, []);

  const checkKycBucket = async (): Promise<boolean> => {
    try {
      // Try to upload a test file to see if the bucket exists
      const testFile = new Blob(['test'], { type: 'text/plain' });
      const testPath = 'test-' + Date.now() + '.txt';
      
      const { error } = await supabase.storage
        .from('kyc_documents')
        .upload(testPath, testFile, { upsert: true });
      
      // If there's no error or the error is permissions-related, the bucket exists
      if (!error || error.message.includes('storage permissions')) {
        console.log("KYC documents bucket exists");
        setBucketChecked(true);
        
        // Clean up the test file if it was uploaded
        if (!error) {
          await supabase.storage.from('kyc_documents').remove([testPath]);
        }
        
        return true;
      }
      
      // If we get a specific error about the bucket not existing
      if (error.message.includes('bucket does not exist')) {
        console.error("KYC documents bucket does not exist");
        toast.error("Document upload system unavailable. Please contact support.");
        setBucketChecked(false);
        return false;
      }
      
      // Other unknown error
      console.error("Error checking KYC bucket:", error);
      toast.error("Failed to check upload system. Please try again later.");
      setBucketChecked(false);
      return false;
    } catch (error) {
      console.error("Error in checkKycBucket:", error);
      toast.error("Document upload system unavailable. Please contact support.");
      setBucketChecked(false);
      return false;
    }
  };

  const handleDocumentUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const fileType = file.type.toLowerCase();
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(fileType)) {
      toast.error('Please upload only JPG, JPEG, PNG, or PDF files');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setIsUploadComplete(false);

    try {
      // Check bucket exists before uploading
      if (!bucketChecked) {
        const bucketExists = await checkKycBucket();
        if (!bucketExists) {
          setIsUploading(false);
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = file.name.split('.')[0];
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('kyc_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Document upload error details:', uploadError);
        if (uploadError.message.includes('storage permissions')) {
          toast.error('Permission error. Please ensure you are logged in.');
        } else if (uploadError.message.includes('bucket does not exist')) {
          toast.error('Storage not configured correctly. Please contact support.');
        } else {
          toast.error('Failed to upload document. Please try again later.');
        }
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kyc_documents')
        .getPublicUrl(filePath);

      console.log("Document uploaded successfully, public URL:", publicUrl);

      // Set upload as complete
      setIsUploadComplete(true);
      setUploadedFileName(fileName);
      setUploadedFileType(fileType);
      setUploadedFileUrl(publicUrl);
      toast.success('Document uploaded successfully');
      
      // Ensure onUploadComplete is called with the publicUrl
      console.log("Calling onUploadComplete with URL:", publicUrl);
      if (typeof onUploadComplete === 'function') {
        onUploadComplete(publicUrl);
      } else {
        console.error("onUploadComplete is not a function");
      }
    } catch (error) {
      console.error('Document upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetInput = () => {
    const input = document.getElementById('document-upload') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  return {
    isUploading,
    isUploadComplete,
    uploadedFileName,
    uploadedFileType,
    uploadedFileUrl,
    handleDocumentUpload,
    resetInput
  };
};
