
import { QuestionCategory } from "@/types/questions";

interface CategoryPickerProps {
  selectedCategory: QuestionCategory | 'all';
  onSelectCategory: (category: QuestionCategory | 'all') => void;
  activeCategories: QuestionCategory[];
}

export const CategoryPicker = () => {
  // This component is not needed anymore as we've moved categories to badges in each card
  return null;
};
