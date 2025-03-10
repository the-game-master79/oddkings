import { useState, useMemo, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Question, QuestionCategory } from '@/types/questions';

const getActiveQuestions = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Not authenticated");
  }

  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_category_mapping!inner(custom_category)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  
  if (error) throw error;

  return questions.map(question => ({
    ...question,
    category: question.question_category_mapping?.[0]?.custom_category || question.category,
    chance_percent: question.chance_percent || 0
  })) as Question[];
};

export function useQuestionsList(isAuthenticated: boolean | null) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const initialFetchDone = useRef(false);

  const { data: activeQuestions = [], isLoading, isError } = useQuery({
    queryKey: ['questions'],
    queryFn: getActiveQuestions,
    enabled: isAuthenticated === true && !initialFetchDone.current,
    staleTime: 60 * 1000, // Data fresh for 1 minute
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 60 * 1000, // Refetch every minute instead of 30 seconds
    onSuccess: () => {
      initialFetchDone.current = true;
    }
  });

  const filteredQuestions = useMemo(() => {
    return activeQuestions.filter(question => {
      const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeQuestions, selectedCategory, searchQuery]);

  const handleCategoryChange = useCallback((category: QuestionCategory | 'all') => {
    setSelectedCategory(category);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    filteredQuestions,
    searchQuery,
    selectedCategory,
    handleCategoryChange,
    handleSearchChange,
    isLoading,
    isError,
    activeQuestions
  };
}
