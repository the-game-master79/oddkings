import { useEffect, useState, useMemo, useCallback } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { PredictionCard } from "@/components/predictions/PredictionCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Question, QuestionCategory } from "@/types/questions";
import { Loader2, Search, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MultiTradeSidebar } from "@/components/predictions/MultiTradeSidebar";
import { useTradeBuilderVisibility } from "@/hooks/useTradeBuilderVisibility";
import { CategorySelector } from "@/components/news/CategorySelector";

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
    chance_percent: question.chance_percent || 0 // Provide a default value for chance_percent
  })) as Question[];
};

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');

  const handleCategoryChange = useCallback((category: QuestionCategory | 'all') => {
    // Wrapping setState in setTimeout to avoid render cycle issues
    setTimeout(() => {
      setSelectedCategory(category);
    }, 0);
  }, []);

  const {
    isSidebarOpen,
    isSidebarMinimized,
    handleClose,
    handleMinimize,
    handleMaximize
  } = useTradeBuilderVisibility();

  useEffect(() => {
    console.log("[Index] Setting up auth listener");
    
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[Index] Initial session check:", session ? "Authenticated" : "Not authenticated");
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Index] Auth state changed:", event, session ? "Session exists" : "No session");
      setIsAuthenticated(!!session);
    });

    return () => {
      console.log("[Index] Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, []);

  const { data: activeQuestions = [], isLoading, isError } = useQuery({
    queryKey: ['questions'],
    queryFn: getActiveQuestions,
    enabled: isAuthenticated === true,
    staleTime: 30000, // Cache results for 30 seconds
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
    cacheTime: 5 * 60 * 1000 // 5 minutes cache
  });

  // Memoize filtered questions to prevent unnecessary recalculations
  const filteredQuestions = useMemo(() => {
    return activeQuestions.filter(question => {
      const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeQuestions, selectedCategory, searchQuery]);

  // Memoize CategorySelector props
  const categorySelectorProps = useMemo(() => ({
    selectedCategory,
    onCategoryChange: handleCategoryChange,
    questions: activeQuestions
  }), [selectedCategory, handleCategoryChange, activeQuestions]);

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        Error loading questions. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col ">
      <div className="flex-1">
        <div className="text-left mb-6 mt-3 sm:mb-8 sm:mt-4 pt-8">
          <h2 className="text-3xl sm:text-3xl font-bold sm:mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Predict News, Win Rewards!
          </h2>
        </div>
        
        <div className="w-full sm:max-w-md mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search Markets"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <CategorySelector {...categorySelectorProps} />

        {filteredQuestions.length > 0 ? (
          <div className="grid gap-3 
            grid-cols-1 
            sm:grid-cols-2 
            md:grid-cols-3
            auto-rows-fr mb-8"
          >
            {filteredQuestions.map((question) => {
              const totalVotes = question.yes_value + question.no_value;
              const yesPercentage = totalVotes > 0 
                ? Math.round((question.yes_value / totalVotes) * 100)
                : 0;
              const noPercentage = totalVotes > 0 
                ? Math.round((question.no_value / totalVotes) * 100)
                : 0;

              return (
                <div key={question.id} className="h-full">
                  <PredictionCard
                    id={question.id}
                    question={question.question}
                    category={question.category}
                    trend={yesPercentage >= noPercentage ? "up" : "down"}
                    trendPercentage={Math.max(yesPercentage, noPercentage)}
                    yesPercentage={yesPercentage}
                    noPercentage={noPercentage}
                    volume={question.yes_value + question.no_value}
                    chancePercent={question.chance_percent || 75} // Add this line with a default fallback
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[40vh] items-center justify-start">
            <p className="text-lg sm:text-xl text-gray-500">
              {searchQuery ? "No matching questions found." : "No Questions Available. Come back later!"}
            </p>
          </div>
        )}
      </div>

      <MultiTradeSidebar 
        isOpen={isSidebarOpen}
        isMinimized={isSidebarMinimized}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
      />
    </div>
  );
};

export default Index;
