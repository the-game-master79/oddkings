import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManagementDialog({
  open,
  onOpenChange,
}: CategoryManagementDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('question_categories')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const handleAddCategory = () => {
    // Add a temporary ID for new categories
    setCategories([...categories, { id: `new-${Date.now()}`, name: "" }]);
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = { ...newCategories[index], name: value };
    setCategories(newCategories);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Filter out empty categories and get unique names
      const validCategories = Array.from(new Set(
        categories
          .map(cat => cat.name.trim())
          .filter(name => name.length > 0)
      )).map(name => ({ name }));

      if (validCategories.length === 0) {
        toast.error("Please add at least one category");
        return;
      }

      // First delete all existing categories
      const { error: deleteError } = await supabase
        .from('question_categories')
        .delete()
        .not('id', 'is', null); // This ensures we only delete valid records

      if (deleteError) throw deleteError;

      // Then insert new categories
      const { error: insertError } = await supabase
        .from('question_categories')
        .insert(validCategories);

      if (insertError) {
        if (insertError.code === '23505') {
          toast.error("Duplicate category names are not allowed");
          return;
        }
        throw insertError;
      }

      await fetchCategories(); // Refresh the list
      toast.success("Categories updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating categories:', error);
      toast.error("Failed to update categories");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage News Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {categories.map((category, index) => (
            <div key={category.id} className="flex items-center gap-2">
              <Input
                value={category.name}
                onChange={(e) => handleCategoryChange(index, e.target.value)}
                placeholder="Enter category name"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveCategory(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddCategory}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Categories"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
