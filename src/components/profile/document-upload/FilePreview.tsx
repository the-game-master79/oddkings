
import { CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileTypeIcon } from "./FileTypeIcon";

interface FilePreviewProps {
  fileName: string;
  fileType: string;
  fileUrl: string;
  onSelectFile: () => void;
}

export const FilePreview = ({ fileName, fileType, fileUrl, onSelectFile }: FilePreviewProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <CheckCircle className="h-12 w-12 text-green-500" />
      <p className="text-sm font-medium">Document uploaded successfully!</p>
      
      {/* File preview */}
      <div className="mt-4 p-4 border rounded-md w-full max-w-xs mx-auto">
        <div className="flex items-center gap-3">
          <FileTypeIcon fileType={fileType} />
          <div className="text-left overflow-hidden">
            <p className="text-sm font-medium truncate">
              {fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {fileType}
            </p>
          </div>
        </div>
        
        {/* Preview for images only */}
        {fileType.includes('image') && fileUrl && (
          <div className="mt-3 border rounded overflow-hidden">
            <img 
              src={fileUrl} 
              alt="Document preview" 
              className="w-full h-auto max-h-32 object-contain"
            />
          </div>
        )}
        
        {/* For PDFs, offer a link to view */}
        {fileType.includes('pdf') && fileUrl && (
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.open(fileUrl, '_blank')}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Document
            </Button>
          </div>
        )}
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={onSelectFile}
        className="mt-4"
      >
        Upload Another File
      </Button>
    </div>
  );
};
