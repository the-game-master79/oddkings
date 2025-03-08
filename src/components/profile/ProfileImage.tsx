
import { useProfileImage } from "./hooks/useProfileImage";
import { UserCircle } from "lucide-react";
import { ProfileImageThumbnail } from "./ProfileImageThumbnail";

export const ProfileImage = () => {
  const {
    profile,
    isLoading,
    isUploading,
    imageLoaded,
    handleFileSelect,
    handleImageLoad,
    resetImageLoaded
  } = useProfileImage();

  const handleUploadClick = () => {
    document.getElementById('profile-image-input')?.click();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
          <UserCircle className="w-20 h-20 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <ProfileImageThumbnail
        imageUrl={profile?.profile_image_url}
        imageLoaded={imageLoaded}
        handleImageLoad={handleImageLoad}
        resetImageLoaded={resetImageLoaded}
        handleUploadClick={handleUploadClick}
        isUploading={isUploading}
      />
      
      <input
        id="profile-image-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};
