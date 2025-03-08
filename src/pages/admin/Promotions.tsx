
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Image as ImageIcon, Link as LinkIcon, ExternalLink } from "lucide-react";

interface Promotion {
  id: string;
  title: string;
  image_url: string;
  link: string;
  created_at: string;
}

const Promotions = () => {
  const [newPromotion, setNewPromotion] = useState({
    title: "",
    link: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();
  
  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Promotion[];
    }
  });
  
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");
      if (!newPromotion.title.trim()) throw new Error("Title is required");
      
      // 1. Upload the image to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      // Check if promotions bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const promotionsBucket = buckets?.find(b => b.name === 'promotions');
      
      if (!promotionsBucket) {
        console.log("Creating promotions bucket");
        try {
          // Since bucket creation might be restricted by RLS, we'll warn the user
          toast.warning("Promotions storage bucket needs to be created in Supabase dashboard");
        } catch (error) {
          console.error("Error creating bucket:", error);
          throw new Error("Storage bucket 'promotions' does not exist.");
        }
      }
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('promotions')
        .upload(`banners/${fileName}`, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('promotions')
        .getPublicUrl(`banners/${fileName}`);
      
      // 2. Create the promotion record
      const { data: promotion, error: insertError } = await supabase
        .from('promotions')
        .insert({
          title: newPromotion.title,
          image_url: publicUrlData.publicUrl,
          link: newPromotion.link || "#"
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      return promotion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setNewPromotion({ title: "", link: "" });
      setSelectedFile(null);
      setUploadProgress(0);
      toast.success("Promotion added successfully");
    },
    onError: (error) => {
      console.error("Error adding promotion:", error);
      toast.error(`Failed to add promotion: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First get the promotion to get the image URL
      const { data: promotion } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', id)
        .single();
      
      // Delete the promotion record
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Try to delete the image from storage
      if (promotion && promotion.image_url) {
        try {
          // Extract filename from URL
          const url = new URL(promotion.image_url);
          const pathParts = url.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          
          if (fileName) {
            await supabase.storage
              .from('promotions')
              .remove([`banners/${fileName}`]);
          }
        } catch (error) {
          console.error("Failed to delete image file:", error);
          // Continue since the record is already deleted
        }
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success("Promotion deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete promotion: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 5MB.");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed");
        return;
      }
      
      setSelectedFile(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }
    
    if (!newPromotion.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    
    uploadMutation.mutate();
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Manage Promotional Banners</h1>
      
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add New Promotion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newPromotion.title}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter promotion title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link">Link (optional)</Label>
                <Input
                  id="link"
                  value={newPromotion.link}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://example.com/promo"
                  type="url"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Banner Image (16:5 ratio recommended)</Label>
                <div className="border rounded-md p-4 bg-muted/20">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label htmlFor="image" className="w-full cursor-pointer">
                    {selectedFile ? (
                      <div className="flex items-center justify-center">
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                          className="max-h-40 max-w-full object-contain rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 p-6 text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <span>Click to select an image</span>
                        <span className="text-xs">Max size: 5MB</span>
                      </div>
                    )}
                  </Label>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={uploadMutation.isPending || !selectedFile}
              >
                {uploadMutation.isPending ? "Uploading..." : "Add Promotion"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p>Loading promotions...</p>
              ) : promotions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No promotions available</p>
              ) : (
                promotions.map(promotion => (
                  <div key={promotion.id} className="border rounded-md overflow-hidden bg-card">
                    <div className="aspect-[16/5] relative">
                      <img
                        src={promotion.image_url}
                        alt={promotion.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{promotion.title}</h3>
                          {promotion.link && promotion.link !== "#" && (
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              <a 
                                href={promotion.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="truncate max-w-[250px] hover:underline flex items-center"
                              >
                                {promotion.link}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteMutation.mutate(promotion.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Promotions;
