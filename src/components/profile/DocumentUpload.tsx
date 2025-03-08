
import { FormLabel } from "@/components/ui/form";
import { useDocumentUpload } from "./document-upload/useDocumentUpload";
import { UploadPlaceholder } from "./document-upload/UploadPlaceholder";
import { FilePreview } from "./document-upload/FilePreview";

interface DocumentUploadProps {
  onUploadComplete: (url: string) => void;
}

export const DocumentUpload = ({ onUploadComplete }: DocumentUploadProps) => {
  const {
    isUploading,
    isUploadComplete,
    uploadedFileName,
    uploadedFileType,
    uploadedFileUrl,
    handleDocumentUpload,
    resetInput
  } = useDocumentUpload({ onUploadComplete });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleDocumentUpload(file);
      resetInput();
    }
  };

  const handleSelectFile = () => {
    document.getElementById('document-upload')?.click();
  };

  return (
    <div className="space-y-4">
      <FormLabel>Upload Document</FormLabel>
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center space-y-4">
        {isUploadComplete ? (
          <FilePreview 
            fileName={uploadedFileName}
            fileType={uploadedFileType}
            fileUrl={uploadedFileUrl}
            onSelectFile={handleSelectFile}
          />
        ) : (
          <UploadPlaceholder 
            isUploading={isUploading}
            onSelectFile={handleSelectFile}
          />
        )}
      </div>
      <input
        id="document-upload"
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
