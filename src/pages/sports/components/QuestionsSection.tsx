
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SportQuestion } from "../types/match-details";
import { MatchDetails } from "../types/match-details";
import QuestionsList from "./QuestionsList";

interface QuestionsSectionProps {
  questions: SportQuestion[];
  matchData: MatchDetails | undefined;
  onQuestionClick: (question: SportQuestion) => void;
}

export const QuestionsSection = ({ 
  questions, 
  matchData, 
  onQuestionClick 
}: QuestionsSectionProps) => {
  if (questions.length === 0) {
    return (
      <>
        <h2 className="text-xl font-bold mt-8 mb-4">Available Questions</h2>
        <Alert>
          <AlertDescription>
            No active questions available for this match at the moment.
          </AlertDescription>
        </Alert>
      </>
    );
  }

  return (
    <>
      <h2 className="text-xl font-bold mt-8 mb-4">Available Questions</h2>
      <QuestionsList 
        questions={questions} 
        isError={false}
        matchData={matchData}
        onQuestionClick={onQuestionClick} 
      />
    </>
  );
};
