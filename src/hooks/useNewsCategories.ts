import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  label: string;
  value: string;
}

export function useNewsCategories() {
  return useQuery<Category[]>({
    queryKey: ['news-categories'],
    queryFn: async () => {
      // Fetch categories from question_categories table
      const { data, error } = await supabase
        .from('question_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Transform to expected format
      return data.map(category => ({
        label: category.name,
        value: category.name
      }));
    },
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
