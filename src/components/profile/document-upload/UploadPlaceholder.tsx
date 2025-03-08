
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadPlaceholderProps {
  isUploading: boolean;
  onSelectFile: () => void;
}

export const UploadPlaceholder = ({ isUploading, onSelectFile }: UploadPlaceholderProps) => {
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Upload your identification document here
        </p>
        <p className="text-xs text-muted-foreground">
          Accepted formats: JPG, JPEG, PNG, PDF (Max size: 10MB)
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onSelectFile}
        disabled={isUploading}
        className="mt-4"
      >
        {isUploading ? 'Uploading...' : 'Select File'}
      </Button>
    </>
  );
};
