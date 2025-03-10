import { Button } from "@/components/ui/button";
import { useNewsCategories } from "@/hooks/useNewsCategories";
import { QuestionCategory } from "@/types/questions";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { memo, useCallback } from "react";

interface CategorySelectorProps {
  selectedCategory: QuestionCategory | 'all';
  onCategoryChange: (category: QuestionCategory | 'all') => void;
  questions: Array<{ category: string; status: string }>;
}

export const CategorySelector = memo(({ 
  selectedCategory, 
  onCategoryChange, 
  questions 
}: CategorySelectorProps) => {
  const { data: categories = [], isLoading } = useNewsCategories();

  const handleCategoryClick = useCallback((category: QuestionCategory | 'all') => {
    onCategoryChange(category);
  }, [onCategoryChange]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading categories...</span>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <Alert variant="default" className="bg-muted/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No active categories available at the moment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="py-2 overflow-x-auto scrollbar-none">
      <div className="flex gap-2 min-w-min">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleCategoryClick('all')}
          className="min-h-[44px] shrink-0"
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleCategoryClick(category.value)}
            className="min-h-[44px] shrink-0"
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
});

CategorySelector.displayName = "CategorySelector";
