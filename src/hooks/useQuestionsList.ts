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

  const { data: activeQuestions = [], isLoading, isError } = useQuery({
    queryKey: ['questions'],
    queryFn: getActiveQuestions,
    enabled: isAuthenticated === true, // Remove the initialFetchDone condition
    staleTime: 30 * 1000, // Reduce stale time to 30 seconds
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true, // Enable refetch on window focus
    refetchOnReconnect: true, // Enable refetch on reconnect
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3, // Add retry logic
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
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
