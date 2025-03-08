
import { UserCircle, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileImageThumbnailProps {
  imageUrl: string | undefined;
  imageLoaded: boolean;
  isUploading: boolean;
  handleImageLoad: () => void;
  resetImageLoaded: () => void;
  handleUploadClick: () => void;
}

export const ProfileImageThumbnail = ({ 
  imageUrl, 
  imageLoaded, 
  isUploading,
  handleImageLoad, 
  resetImageLoaded,
  handleUploadClick 
}: ProfileImageThumbnailProps) => {
  return (
    <div className="relative">
      <div 
        className="w-32 h-32 rounded-full bg-muted overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-200"
        onClick={handleUploadClick}
      >
        {imageUrl ? (
          <img
            src={imageUrl + "?t=" + new Date().getTime()} // Add timestamp to prevent caching
            alt="Profile"
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={resetImageLoaded}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserCircle className="w-20 h-20 text-muted-foreground" />
          </div>
        )}
        
        {/* Spinner while uploading */}
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
      </div>
      
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex items-center gap-1 rounded-full bg-white dark:bg-gray-800"
        onClick={handleUploadClick}
      >
        <Upload size={14} />
        <span className="text-xs">Upload</span>
      </Button>
    </div>
  );
};
