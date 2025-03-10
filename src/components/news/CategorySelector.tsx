import { Button } from "@/components/ui/button";
import { useNewsCategories } from "@/hooks/useNewsCategories";
import { QuestionCategory } from "@/types/questions";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { memo, useCallback, useMemo } from "react";

interface CategorySelectorProps {
  selectedCategory: QuestionCategory | 'all';
  onCategoryChange: (category: QuestionCategory | 'all') => void;
}

interface Category {
  label: string;
  value: string;
}

export const CategorySelector = memo(({ 
  selectedCategory, 
  onCategoryChange
}: CategorySelectorProps) => {
  const { data: categories = [] as Category[], isLoading } = useNewsCategories();

  const categoryButtons = useMemo(() => (
    <div className="flex gap-2 min-w-min">
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onCategoryChange('all')}
        className="min-h-[44px] shrink-0"
      >
        All Categories
      </Button>
      {(categories as Category[]).map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onCategoryChange(category.value)}
          className="min-h-[44px] shrink-0"
        >
          {category.label}
        </Button>
      ))}
    </div>
  ), [categories, selectedCategory, onCategoryChange]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading categories...</span>
      </div>
    );
  }

  if ((categories as Category[]).length === 0) {
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
      {categoryButtons}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.selectedCategory === nextProps.selectedCategory;
});

CategorySelector.displayName = "CategorySelector";
