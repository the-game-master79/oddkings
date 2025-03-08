import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Question, QuestionStats } from "@/types/questions";
import { useToast } from "@/components/ui/use-toast";

export function useQuestions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          question_category_mapping!inner(custom_category)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Transform the data to use the custom category from mapping
      return data.map(question => ({
        ...question,
        // Use custom category from mapping if available, fallback to default category
        category: question.question_category_mapping?.[0]?.custom_category || 'News'
      })) as Question[];
    }
  });

  const { data: stats = { total: 0, active: 0, resolvedYes: 0, resolvedNo: 0 }, isLoading: isStatsLoading } = useQuery({
    queryKey: ['question-stats'],
    queryFn: async () => {
      console.log("[useQuestions] Calculating stats from questions:", questions?.length || 0);
      if (!questions || questions.length === 0) {
        // If no questions data yet, fetch directly
        const { data, error } = await supabase
          .from('questions')
          .select('status');
        
        if (error) {
          console.error("[useQuestions] Error fetching question stats:", error);
          throw error;
        }
        
        const questionsList = data as Question[] || [];
        const stats: QuestionStats = {
          total: questionsList.length,
          active: questionsList.filter(q => q.status === 'active').length,
          resolvedYes: questionsList.filter(q => q.status === 'resolved_yes').length,
          resolvedNo: questionsList.filter(q => q.status === 'resolved_no').length,
        };
        console.log("[useQuestions] Calculated stats from direct fetch:", stats);
        return stats;
      }
      
      const stats: QuestionStats = {
        total: questions.length,
        active: questions.filter(q => q.status === 'active').length,
        resolvedYes: questions.filter(q => q.status === 'resolved_yes').length,
        resolvedNo: questions.filter(q => q.status === 'resolved_no').length,
      };
      console.log("[useQuestions] Calculated stats:", stats);
      return stats;
    },
    enabled: true,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const resolveQuestion = useMutation({
    mutationFn: async ({ id, resolution }: { id: string, resolution: 'yes' | 'no' }) => {
      console.log("[useQuestions] Starting to resolve question:", { id, resolution });
      
      const { data: userData } = await supabase.auth.getUser();
      console.log("[useQuestions] Current user:", userData);
      
      const { error: questionError } = await supabase
        .from('questions')
        .update({
          status: resolution === 'yes' ? 'resolved_yes' : 'resolved_no',
          resolved_at: new Date().toISOString(),
          resolved_by: userData.user?.id
        })
        .eq('id', id);

      if (questionError) {
        console.error("[useQuestions] Error updating question:", questionError);
        throw questionError;
      }

      console.log("[useQuestions] Question updated successfully");

      const { error: tradeError } = await supabase
        .rpc('resolve_trades_for_question', {
          p_question_id: id,
          p_winning_prediction: resolution
        });

      if (tradeError) {
        console.error("[useQuestions] Error resolving trades:", tradeError);
        throw tradeError;
      }

      console.log("[useQuestions] Trades resolved successfully");
    },
    onSuccess: () => {
      console.log("[useQuestions] Resolution completed successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question-stats'] });
      queryClient.invalidateQueries({ queryKey: ['trade-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
      toast({
        title: "Success",
        description: "Question resolved successfully",
      });
    },
    onError: (error) => {
      console.error("[useQuestions] Resolution failed:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const isLoading = isQuestionsLoading || isStatsLoading;

  return {
    questions,
    stats,
    resolveQuestion,
    isLoading
  };
}
