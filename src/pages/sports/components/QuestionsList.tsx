import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SportQuestion, MatchDetails } from "../types/match-details";
import { calculateTimeRemaining } from "../utils/date-utils";

interface QuestionsListProps {
  questions: SportQuestion[];
  isError: boolean;
  matchData: MatchDetails | undefined;
  onQuestionClick: (question: SportQuestion, option: 'yes' | 'no') => void;
}

const QuestionsList = ({ questions, isError, matchData, onQuestionClick }: QuestionsListProps) => {
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load questions. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (questions.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No active questions available for this match at the moment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4">
      {questions.map(question => (
        <Card 
          key={question.id} 
          className="overflow-hidden border-l-4 border-l-primary"
        >
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">{question.question}</h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {calculateTimeRemaining(question.end_datetime)}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="flex-1 sm:flex-none min-w-[100px] bg-green-500/5 hover:bg-green-500/10 text-green-700 border-green-200 hover:border-green-300"
                  onClick={() => onQuestionClick(question, 'yes')}
                >
                  <span>Yes</span>
                  <span className="ml-2 text-sm opacity-70">{question.yes_value}%</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex-1 sm:flex-none min-w-[100px] bg-red-500/5 hover:bg-red-500/10 text-red-700 border-red-200 hover:border-red-300"
                  onClick={() => onQuestionClick(question, 'no')}
                >
                  <span>No</span>
                  <span className="ml-2 text-sm opacity-70">{question.no_value}%</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuestionsList;
