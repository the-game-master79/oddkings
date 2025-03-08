import { format } from "date-fns";
import { Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Question } from "@/types/questions";
import { QuestionStats } from "../predictions/QuestionStats";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

interface QuestionsTableProps {
  questions: Question[];
  onResolveYes: (id: string) => void;
  onResolveNo: (id: string) => void;
  onEdit: (question: Question) => void;
  sortBy: "none" | "volume" | "endTime";
  sortOrder: "asc" | "desc";
}

export function QuestionsTable({ 
  questions, 
  onResolveYes, 
  onResolveNo, 
  onEdit,
  sortBy,
  sortOrder 
}: QuestionsTableProps) {
  const { data: participationStats } = useQuery({
    queryKey: ['question-participation'],
    queryFn: async () => {
      if (questions.length === 0) return {};

      const questionIds = questions.map(q => q.id);
      
      // Updated query to fetch sum of amounts along with participant counts
      const { data, error } = await supabase
        .from('news_trades')
        .select('question_id, prediction, amount')
        .in('question_id', questionIds);

      if (error) {
        console.error('Error fetching participation:', error);
        return {};
      }

      // Process the data to calculate sums and counts
      return (data || []).reduce((acc: any, trade) => {
        if (!acc[trade.question_id]) {
          acc[trade.question_id] = {
            total: 0,
            yes: 0,
            no: 0,
            volume: 0
          };
        }
        
        // Add to total volume
        acc[trade.question_id].volume += Number(trade.amount);
        
        // Count participants
        if (trade.prediction === 'yes') {
          acc[trade.question_id].yes++;
        } else if (trade.prediction === 'no') {
          acc[trade.question_id].no++;
        }
        
        return acc;
      }, {});
    },
    enabled: questions.length > 0,
    refetchInterval: 5000
  });

  // Sort questions based on volume if needed
  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === "volume") {
      const volumeA = participationStats?.[a.id]?.volume || 0;
      const volumeB = participationStats?.[b.id]?.volume || 0;
      return sortOrder === "asc" ? volumeA - volumeB : volumeB - volumeA;
    }
    return 0;
  });

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-4 text-left">News</th>
            <th className="p-4 text-left">Category</th>
            <th className="p-4 text-left">End Clock</th>
            <th className="p-4 text-center">Yes/No %</th>
            <th className="p-4 text-center">Participants (Yes/No)</th>
            <th className="p-4 text-center">Trading Volume (₹)</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedQuestions
            .filter(q => q.status === 'active')
            .map((question) => {
              const stats = participationStats?.[question.id] || { total: 0, yes: 0, no: 0, volume: 0 };
              
              return (
                <tr key={question.id} className="border-b">
                  <td className="p-4">{question.question}</td>
                  <td className="p-4">{question.category}</td>
                  <td className="p-4">{format(new Date(question.end_datetime), "PPp")}</td>
                  <td className="p-4 text-center">{question.yes_value}% / {question.no_value}%</td>
                  <td className="p-4 text-center">{stats.yes} / {stats.no}</td>
                  <td className="p-4 text-center">${stats.volume.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
