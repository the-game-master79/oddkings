
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/questions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ResolvedQuestions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status') as 'resolved_yes' | 'resolved_no';

  const { data: questions = [] } = useQuery({
    queryKey: ['resolved-questions', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('status', status)
        .order('resolved_at', { ascending: false });
      
      if (error) throw error;
      return data as Question[];
    }
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/admin/questions')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {status === 'resolved_yes' ? 'Resolved Yes' : 'Resolved No'} Questions
        </h1>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left">Question</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">End Time & Date</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id} className="border-b">
                <td className="p-4">{question.question}</td>
                <td className="p-4">{question.category}</td>
                <td className="p-4">{format(new Date(question.end_datetime), "PPp")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
