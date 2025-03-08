import { format } from "date-fns";
import { Check, X, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuestionStats } from "@/components/predictions/QuestionStats";
import { SportQuestion } from "@/types/sports";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ParticipationStats {
  questionId: string;
  total: number;
  yes: number; 
  no: number;
}

interface SportsQuestionsTableProps {
  questions: SportQuestion[];
  onResolveYes: (id: string) => void;
  onResolveNo: (id: string) => void;
  onEdit: (question: SportQuestion) => void;
  onViewMatch?: (matchId: string) => void;
  onDelete: (id: string) => void;
}

export function SportsQuestionsTable({
  questions,
  onResolveYes,
  onResolveNo,
  onEdit,
  onViewMatch,
  onDelete
}: SportsQuestionsTableProps) {
  const [participationStats, setParticipationStats] = useState<Record<string, ParticipationStats>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  const handleDelete = (questionId: string) => {
    onDelete(questionId);
    setDialogOpen(false);
    setQuestionToDelete(null);
  };
  
  useEffect(() => {
    const fetchParticipationStats = async () => {
      if (questions.length === 0) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Extract the question IDs - ensure they're valid UUIDs by filtering out any non-UUID values
        const questionIds = questions
          .map(q => q.id)
          .filter(id => {
            // Simple UUID format validation (basic check)
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return uuidPattern.test(id);
          });
        
        if (questionIds.length === 0) {
          console.log('No valid question IDs to query');
          setLoading(false);
          return;
        }
        
        // Fetch participant counts from sport_trades for each question
        const statsMap: Record<string, ParticipationStats> = {};
        
        // Initialize stats for each question with zeros
        questionIds.forEach(id => {
          statsMap[id] = {
            questionId: id,
            total: 0,
            yes: 0,
            no: 0
          };
        });
        
        // Get actual participant counts
        for (const questionId of questionIds) {
          // Get yes participant count
          const { count: yesCount, error: yesError } = await supabase
            .from('sport_trades')
            .select('*', { count: 'exact', head: true })
            .eq('sport_question_id', questionId)
            .eq('prediction', 'yes');
            
          if (!yesError && yesCount !== null) {
            statsMap[questionId].yes = yesCount;
            statsMap[questionId].total += yesCount;
          }
          
          // Get no participant count
          const { count: noCount, error: noError } = await supabase
            .from('sport_trades')
            .select('*', { count: 'exact', head: true })
            .eq('sport_question_id', questionId)
            .eq('prediction', 'no');
            
          if (!noError && noCount !== null) {
            statsMap[questionId].no = noCount;
            statsMap[questionId].total += noCount;
          }
        }
        
        setParticipationStats(statsMap);
      } catch (error) {
        console.error('Error fetching participation stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchParticipationStats();
  }, [questions]);
  
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-4 text-left">Question</th>
            <th className="p-4 text-left">Category</th>
            <th className="p-4 text-left">End Time & Date</th>
            <th className="p-4 text-center">Yes %</th>
            <th className="p-4 text-center">No %</th>
            <th className="p-4 text-center">Part. Yes</th>
            <th className="p-4 text-center">Part. No</th>
            <th className="p-4 text-center">Participants</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-4 text-center">
                No active questions found.
              </td>
            </tr>
          ) : (
            questions
              .filter(q => q.status === 'active')
              .map((question) => {
                const stats = participationStats[question.id] || { total: 0, yes: 0, no: 0 };
                
                return (
                  <tr key={question.id} className="border-b">
                    <td className="p-4">{question.question}</td>
                    <td className="p-4">{question.category}</td>
                    <td className="p-4">{format(new Date(question.end_datetime), "PPp")}</td>
                    <td className="p-4 text-center">{question.yes_value}%</td>
                    <td className="p-4 text-center">{question.no_value}%</td>
                    <td className="p-4 text-center">{stats.yes}</td>
                    <td className="p-4 text-center">{stats.no}</td>
                    <td className="p-4 text-center">
                      <QuestionStats volume={0} participants={stats.total} />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {question.match_id && onViewMatch && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onViewMatch(question.match_id!)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="default"
                          size="icon"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => onResolveYes(question.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="icon"
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => onResolveNo(question.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setQuestionToDelete(question.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Question</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete this question permanently. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                              <Button 
                                variant="destructive" 
                                onClick={() => questionToDelete && handleDelete(questionToDelete)}
                              >
                                Delete
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                );
              })
          )}
        </tbody>
      </table>
    </div>
  );
}
