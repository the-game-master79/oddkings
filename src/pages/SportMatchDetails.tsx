import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMatchDetails } from "./sports/hooks/useMatchDetails";
import { useSportQuestions } from "./sports/hooks/useSportQuestions";
import MatchDetailsCard from "./sports/components/MatchDetailsCard";
import DebugInfoCard from "./sports/components/DebugInfoCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SportQuestion } from "./sports/types/match-details";
import { MultiTradeSidebar } from "@/components/predictions/MultiTradeSidebar";
import { useTradeBuilder } from "@/context/TradeBuilderContext";
import { useTradeBuilderVisibility } from "@/hooks/useTradeBuilderVisibility";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// Add this utility function at the top
const groupQuestionsByCategory = (questions: SportQuestion[]) => {
  return questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<string, SportQuestion[]>);
};

const SportMatchDetails = () => {
  // Extract match ID directly from the URL path
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract matchId from URL path
  const pathParts = location.pathname.split('/');
  const matchId = pathParts[pathParts.length - 1];
  
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("SportMatchDetails - Component mounted");
    console.log("SportMatchDetails - Current match ID from path:", matchId);
    console.log("SportMatchDetails - Current location:", location);
    console.log("SportMatchDetails - Current pathname:", location.pathname);
    console.log("SportMatchDetails - Current state:", location.state);
  }, [matchId, location]);
  
  // Fetch match details with improved error handling
  const { 
    data: matchData, 
    isLoading: isLoadingMatch, 
    error: matchError,
    refetch: refetchMatch
  } = useMatchDetails(matchId, setDebugInfo);
  
  // Fetch questions for this match
  const { 
    data: questions = [], 
    isLoading: isLoadingQuestions, 
    error: questionsError,
    refetch: refetchQuestions
  } = useSportQuestions();

  // Fetch user balance
  const { 
    data: userBalance = 0, 
    isLoading: isLoadingBalance,
    refetch: refetchBalance
  } = useQuery({
    queryKey: ['user-balance'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No active session found");
          return 0;
        }
        
        console.log("Fetching balance for user:", session.user.id);
        const { data, error } = await supabase
          .from('user_balances')
          .select('total_usd_value')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching user balance:', error);
          return 0;
        }
        
        console.log("User balance fetched:", data?.total_usd_value);
        return data?.total_usd_value || 0;
      } catch (error) {
        console.error("Error in userBalance query:", error);
        return 0;
      }
    },
    retry: 2
  });
  
  // Handle manual retry for data fetching
  const handleRetry = () => {
    console.log("Manual retry initiated");
    refetchMatch();
    refetchQuestions();
    toast.info("Retrying data fetch...");
  };
  
  const { addTrade, trades } = useTradeBuilder(); // Add addTrade from context
  const {
    isSidebarOpen,
    isSidebarMinimized,
    handleClose,
    handleMinimize,
    handleMaximize
  } = useTradeBuilderVisibility();
  
  const handleQuestionClick = (question: SportQuestion, option: 'yes' | 'no') => {
    if (!option) return; // Guard clause to prevent undefined option
    
    const payout = option === 'yes' ? question.yes_value : question.no_value;
    
    addTrade({
      questionId: `sport_${question.id}`,
      question: question.question,
      category: question.category || 'Sports', // Provide default category
      option: option,
      payout: payout || 0 // Provide default payout
    });
    
    toast.success(`Added ${option.toUpperCase()} prediction to trade builder`);
  };

  const renderQuestionButtons = (question: SportQuestion) => {
    if (question.status === 'resolved_yes' || question.status === 'resolved_no') {
      const outcome = question.status === 'resolved_yes' ? 'Yes' : 'No';
      return (
        <Badge variant={question.status === 'resolved_yes' ? 'success' : 'destructive'}>
          Resolved: {outcome}
        </Badge>
      );
    }

    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => handleQuestionClick(question, 'yes')}
        >
          Yes ({question.yes_value}%)
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => handleQuestionClick(question, 'no')}
        >
          No ({question.no_value}%)
        </Button>
      </div>
    );
  };

  const isLoading = isLoadingMatch || isLoadingQuestions || isLoadingBalance;
  
  useEffect(() => {
    if (matchError) {
      console.error('Match error details:', matchError);
      toast.error("Failed to load match details. Please try again.");
    }
    
    if (questionsError) {
      console.error('Questions error details:', questionsError);
    }
  }, [matchError, questionsError]);

  // Function to update user balance after successful trade
  const handleTradeSuccess = () => {
    console.log("Trade successful, updating balance...");
    // Refetch the user balance to get the latest value
    refetchBalance();
  };
  
  const totalTrade = trades.reduce((sum, trade) => sum + (trade.amount || 0), 0);
  const estimatedPayout = totalTrade * 1.5; // Example calculation
  
  const cn = (...classes: string[]): string => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-sm border rounded-md px-4 py-2">
          <Button 
            variant="link" 
            className="p-0 h-auto text-muted-foreground hover:text-primary"
            onClick={() => navigate('/sports')}
          >
            Sports
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">
            {location.state?.matchTitle || matchData?.title || "Match Details"}
          </span>
        </nav>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : matchError ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load match details. Please try again.
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleRetry} variant="outline" className="w-full">
              Retry
            </Button>
            
            <DebugInfoCard debugInfo={debugInfo} />
            
            <div className="mt-4 p-4 bg-gray-50 rounded-md border">
              <h3 className="text-lg font-medium mb-2">Debug Information</h3>
              <p className="text-sm text-gray-600 mb-2">Match ID: {matchId || "Not available"}</p>
              <p className="text-sm text-gray-600 mb-2">Current Path: {location.pathname}</p>
              <p className="text-sm text-gray-600">Error: {String(matchError)}</p>
            </div>
          </div>
        ) : matchData ? (
          <div className="space-y-6">
            <MatchDetailsCard matchData={matchData} />
            {questions.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No active questions available for this match at the moment.
                </AlertDescription>
              </Alert>
            ) : (
              <Accordion type="single" collapsible className="w-full space-y-4">
                {Object.entries(groupQuestionsByCategory(questions)).map(([category, categoryQuestions]) => (
                  <AccordionItem key={category} value={category} className="bg-card rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{category}</span>
                        <Badge variant="secondary">
                          {categoryQuestions.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {categoryQuestions.map((question) => (
                          <div 
                            key={question.id} 
                            className={cn(
                              "rounded-lg border bg-card p-4 transition-colors",
                              question.status?.startsWith('resolved') 
                                ? "bg-muted" 
                                : "hover:bg-accent/50"
                            )}
                          >
                            <p className="font-medium mb-3">{question.question}</p>
                            {renderQuestionButtons(question)}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No match data available. Please try again or select a different match.
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleRetry} className="w-full">
              Retry
            </Button>
            
            <Button onClick={() => navigate('/sports')} variant="outline" className="w-full mt-2">
              Back to Sports
            </Button>
            
            <DebugInfoCard debugInfo={debugInfo} />
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

export default SportMatchDetails;
