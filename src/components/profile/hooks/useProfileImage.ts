
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useProfileImage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const queryClient = useQueryClient();

  // Query for fetching the profile image
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('profile_image_url')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      console.log("Fetched profile image:", profile?.profile_image_url);
      return profile;
    }
  });

  // Mutation for uploading a profile image
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Don't attempt to create the bucket - use existing bucket or assume it's created
      // Just try to upload directly
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      try {
        // First, upload the file to storage
        const { error: uploadError, data } = await supabase.storage
          .from('profile_images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw uploadError;
        }

        // Then, get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile_images')
          .getPublicUrl(filePath);

        console.log("Uploaded image, public URL:", publicUrl);

        // Finally, update the profile with the new URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ profile_image_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        return publicUrl;
      } catch (error) {
        console.error("Error during profile image upload:", error);
        throw error;
      }
    },
    onSuccess: (publicUrl) => {
      console.log("Upload mutation succeeded, URL:", publicUrl);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile image updated successfully');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again later.');
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    uploadMutation.mutate(file);
  };

  // Handle image load event
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Reset image loaded state when profile changes
  const resetImageLoaded = () => {
    setImageLoaded(false);
  };

  return {
    profile,
    isLoading,
    isUploading,
    imageLoaded,
    handleFileSelect,
    handleImageLoad,
    resetImageLoaded
  };
};
