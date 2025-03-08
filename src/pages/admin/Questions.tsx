import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Question } from "@/types/questions";
import { QuestionsTable } from "@/components/questions/QuestionsTable";
import { QuestionSheet } from "@/components/questions/QuestionSheet";
import { useQuestions } from "@/hooks/useQuestions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StatsCard } from "@/components/admin/StatsCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryManagementDialog } from "@/components/admin/news/CategoryManagementDialog";

// Update the database question category type to match exactly what's in Supabase
type DatabaseQuestionCategory = "News";  // Simplify to always use "News" for all custom categories

interface NewsMetrics {
  totalQuestions: number;
  activeQuestions: number;
  resolvedYes: number;
  resolvedNo: number;
}

export default function Questions() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>();
  const { questions, stats, resolveQuestion } = useQuestions();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"none" | "volume" | "endTime">("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const { data: newsMetrics } = useQuery<NewsMetrics>({
    queryKey: ['news-metrics'],
    queryFn: async () => {
      // Get all questions and their statuses
      const { data: questions, error } = await supabase
        .from('questions')
        .select('status');

      if (error) throw error;

      // Calculate metrics
      const metrics = (questions || []).reduce((acc, question) => {
        acc.totalQuestions++;
        
        switch(question.status) {
          case 'active':
            acc.activeQuestions++;
            break;
          case 'resolved_yes':
            acc.resolvedYes++;
            break;
          case 'resolved_no':
            acc.resolvedNo++;
            break;
        }
        
        return acc;
      }, {
        totalQuestions: 0,
        activeQuestions: 0,
        resolvedYes: 0,
        resolvedNo: 0
      });

      return metrics;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingQuestion(undefined);
  };

  const updateQuestion = useMutation({
    mutationFn: async (data: {
      question: string;
      category: Question['category'];
      dateString: string;
      time: string;
      yesValue: string;
      noValue: string;
      id: string;
    }) => {
      const { dateString, time, id } = data;
      const [day, month] = dateString.split('-').map(num => parseInt(num));
      const [hours, minutes] = time.split(':');
      
      if (!day || !month || day < 1 || day > 31 || month < 1 || month > 12) {
        throw new Error('Invalid date format. Please use DD-MM format');
      }

      // Convert "Others" to a valid database category if needed
      const databaseCategory: DatabaseQuestionCategory = data.category === "Others" ? "News" : data.category as DatabaseQuestionCategory;

      const endDateTime = new Date(2025, month - 1, day, parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from('questions')
        .update({
          question: data.question,
          category: databaseCategory,
          end_datetime: endDateTime.toISOString(),
          yes_value: parseInt(data.yesValue),
          no_value: parseInt(data.noValue),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      handleClose();
      toast.success("Question updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating question: ${error.message}`);
    }
  });

  const createQuestion = useMutation({
    mutationFn: async (data: {
      question: string;
      category: Question['category'];
      dateString: string;
      time: string;
      yesValue: string;
      noValue: string;
    }) => {
      const { dateString, time } = data;
      const [day, month] = dateString.split('-').map(num => parseInt(num));
      const [hours, minutes] = time.split(':');
      
      if (!day || !month || day < 1 || day > 31 || month < 1 || month > 12) {
        throw new Error('Invalid date format. Please use DD-MM format');
      }

      // Always use "News" as the database category
      const databaseCategory: DatabaseQuestionCategory = "News";

      const endDateTime = new Date(2025, month - 1, day, parseInt(hours), parseInt(minutes));

      // Create the question with the fixed database category
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert({
          question: data.question,
          category: databaseCategory,
          end_datetime: endDateTime.toISOString(),
          yes_value: parseInt(data.yesValue),
          no_value: parseInt(data.noValue),
          created_by: (await supabase.auth.getSession()).data.session?.user.id,
          status: 'active'
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Create category mapping immediately with the question ID
      if (questionData) {
        const { error: mappingError } = await supabase
          .from('question_category_mapping')
          .insert({
            question_id: questionData.id,
            custom_category: data.category
          });

        if (mappingError) {
          console.error('Error creating category mapping:', mappingError);
          throw mappingError;
        }
      }

      return questionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      handleClose();
      toast.success("Question created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating question: ${error.message}`);
    }
  });

  const handleSubmit = (data: any) => {
    if (editingQuestion) {
      updateQuestion.mutate({ ...data, id: editingQuestion.id });
    } else {
      createQuestion.mutate(data);
    }
  };

  // Filter and sort questions
  const filteredAndSortedQuestions = questions
    .filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "endTime") {
        return sortOrder === "asc" 
          ? new Date(a.end_datetime).getTime() - new Date(b.end_datetime).getTime()
          : new Date(b.end_datetime).getTime() - new Date(a.end_datetime).getTime();
      }
      return 0;
    });

  return (
    <div className="p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total News"
          value={newsMetrics?.totalQuestions || 0}
          description="Total questions in database"
          type="total"
        />
        <StatsCard
          title="Active News"
          value={newsMetrics?.activeQuestions || 0}
          description="Currently active questions"
          type="active"
        />
        <StatsCard
          title="Resolved Yes"
          value={newsMetrics?.resolvedYes || 0}
          description="Questions resolved as Yes"
          type="success"
          route="/admin/resolved-questions?status=yes"
        />
        <StatsCard
          title="Resolved No"
          value={newsMetrics?.resolvedNo || 0}
          description="Questions resolved as No"
          type="error"
          route="/admin/resolved-questions?status=no"
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">News Questions</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsCategoryDialogOpen(true)}>
            Add Category
          </Button>
          <Button onClick={() => setIsOpen(true)}>Create Question</Button>
        </div>
      </div>
      
      <CategoryManagementDialog 
        open={isCategoryDialogOpen} 
        onOpenChange={setIsCategoryDialogOpen}
      />

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No sorting</SelectItem>
            <SelectItem value="volume">Trading Volume</SelectItem>
            <SelectItem value="endTime">End Time</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort order..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <QuestionsTable 
        questions={filteredAndSortedQuestions}
        onResolveYes={(id) => resolveQuestion.mutate({ id, resolution: 'yes' })}
        onResolveNo={(id) => resolveQuestion.mutate({ id, resolution: 'no' })}
        onEdit={handleEdit}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />

      <QuestionSheet
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isSubmitting={createQuestion.isPending || updateQuestion.isPending}
        editingQuestion={editingQuestion}
      />
    </div>
  );
}
