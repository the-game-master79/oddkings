
import { UserCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileImageDetailProps {
  imageUrl: string;
  imageLoaded: boolean;
  handleImageLoad: () => void;
  handleUploadClick: () => void;
  isUploading: boolean;
}

export const ProfileImageDetail = ({
  imageUrl,
  imageLoaded,
  handleImageLoad,
  handleUploadClick,
  isUploading
}: ProfileImageDetailProps) => {
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Profile Photo</SheetTitle>
      </SheetHeader>
      <div className="py-6 space-y-4">
        <div className="relative rounded-lg overflow-hidden aspect-square">
          <Avatar className="w-full h-full">
            <AvatarImage
              src={imageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E";
              }}
            />
            <AvatarFallback>
              <UserCircle className="w-20 h-20 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex gap-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            <Upload className="mr-2" />
            Change Photo
          </Button>
        </div>
      </div>
    </SheetContent>
  );
};
