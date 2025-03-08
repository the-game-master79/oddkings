
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { SportQuestion as SportQuestionType } from "@/types/sports";
import { SportQuestion } from "./types/match-details";
import { MatchDetails } from "./components/MatchDetails";
import { TradeSheet } from "./components/TradeSheet";
import { LoadingState } from "./components/LoadingState";
import { PageHeader } from "./components/PageHeader";
import { QuestionsSection } from "./components/QuestionsSection";
import { useMatchQuestionsData } from "./hooks/useMatchQuestionsData";

const SportQuestionsPage = () => {
  // Use location to extract match info
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract matchId from URL path
  const pathParts = location.pathname.split('/');
  const matchIdFromPath = pathParts[pathParts.length - 1];
  const matchIdFromState = location.state?.matchId;
  
  // Use the first available ID source
  const matchId = matchIdFromPath || matchIdFromState;
  const matchTitle = location.state?.matchTitle || "Match Details";
  
  // Log for debugging
  console.log("Questions page - Match ID from path:", matchIdFromPath);
  console.log("Questions page - Match ID from state:", matchIdFromState);
  console.log("Questions page - Final matchId used:", matchId);
  
  // State for trade sidebar
  const [isTradeSheetOpen, setIsTradeSheetOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<SportQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<"yes" | "no" | null>(null);
  
  // Use our custom hook to fetch all data
  const { 
    match, 
    convertedMatchData, 
    questions, 
    userBalance, 
    isLoading,
    refreshBalance
  } = useMatchQuestionsData();
  
  // Handle errors and navigation
  if (!matchId && !isLoading) {
    toast.error('Match ID is required');
    navigate('/sports');
    return null;
  }
  
  const handleQuestionClick = (question: SportQuestion) => {
    setSelectedQuestion(question);
    setIsTradeSheetOpen(true);
  };
  
  // Convert SportQuestion to SportQuestionType for TradeSheet
  const convertedSelectedQuestion = selectedQuestion ? {
    ...selectedQuestion,
    category: selectedQuestion.category as SportQuestionType["category"]
  } : null;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader title={matchTitle || match?.title || "Match Details"} />
      
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">
          {match && <MatchDetails match={match} />}
          
          <QuestionsSection 
            questions={questions} 
            matchData={convertedMatchData}
            onQuestionClick={handleQuestionClick} 
          />
          
          <TradeSheet
            isOpen={isTradeSheetOpen}
            onOpenChange={setIsTradeSheetOpen}
            question={convertedSelectedQuestion as SportQuestionType}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            userBalance={userBalance}
            onSuccess={refreshBalance}
          />
        </div>
      )}
    </div>
  );
};

export default SportQuestionsPage;
