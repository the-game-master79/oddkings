import { useEffect, useState, useMemo } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { PredictionCard } from "@/components/predictions/PredictionCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MultiTradeSidebar } from "@/components/predictions/MultiTradeSidebar";
import { useTradeBuilderVisibility } from "@/hooks/useTradeBuilderVisibility";
import { CategorySelector } from "@/components/news/CategorySelector";
import { useQuestionsList } from "@/hooks/useQuestionsList";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const {
    isSidebarOpen,
    isSidebarMinimized,
    handleClose,
    handleMinimize,
    handleMaximize
  } = useTradeBuilderVisibility();

  const {
    filteredQuestions,
    searchQuery,
    selectedCategory,
    handleCategoryChange,
    handleSearchChange,
    isLoading,
    isError,
    activeQuestions
  } = useQuestionsList(isAuthenticated);

  useEffect(() => {
    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Simplify memoized props to only include what's needed
  const categorySelectorProps = useMemo(() => ({
    selectedCategory,
    onCategoryChange: handleCategoryChange
  }), [selectedCategory, handleCategoryChange]);

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

  // Move loading state inside the authenticated view
  return (
    <div className="min-h-screen flex flex-col">
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <CategorySelector {...categorySelectorProps} />

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex min-h-[40vh] items-center justify-center text-red-500">
            Error loading questions. Please try refreshing the page.
          </div>
        ) : filteredQuestions.length > 0 ? (
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
