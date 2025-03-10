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
      const { data, error } = await supabase
        .from('question_category_mapping')
        .select(`
          custom_category,
          questions!inner(status)
        `)
        .eq('questions.status', 'active');

      if (error) throw error;

      const uniqueCategories = Array.from(new Set(
        data.map(item => item.custom_category)
      )).sort();

      return uniqueCategories.map(category => ({
        label: category,
        value: category
      }));
    },
    staleTime: Infinity, // Never consider data stale automatically
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
}
