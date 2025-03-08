
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionFormValues, CATEGORIES, validateQuestion } from "@/types/questions";
import { Database } from "@/integrations/supabase/types";

interface CreateQuestionFormProps {
  onQuestionCreated?: () => void;
}

export function CreateQuestionForm({ onQuestionCreated }: CreateQuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const defaultValues = {
    question: "",
    category: "",
    dateString: "",
    time: "",
    yesValue: "50",
    noValue: "50",
  };

  const form = useForm<QuestionFormValues>({
    defaultValues,
  });

  const handleYesValueChange = (value: string) => {
    const yesVal = parseInt(value) || 0;
    form.setValue("yesValue", value);
    form.setValue("noValue", (100 - yesVal).toString());
  };

  const handleNoValueChange = (value: string) => {
    const noVal = parseInt(value) || 0;
    form.setValue("noValue", value);
    form.setValue("yesValue", (100 - noVal).toString());
  };

  const onSubmit = async (data: QuestionFormValues) => {
    try {
      // Validate the form data
      const validationErrors = validateQuestion(data);
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        for (const [key, value] of Object.entries(validationErrors)) {
          toast.error(value);
        }
        return;
      }

      setIsSubmitting(true);
      
      // Check if user is logged in
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("You must be logged in to create a question");
        return;
      }
      
      // Parse date and time into end_datetime
      const [day, month] = data.dateString.split('-').map(Number);
      const [hours, minutes] = data.time.split(':').map(Number);
      const endDate = new Date(2025, month - 1, day, hours, minutes);
      
      // Prepare the question data for insertion
      const questionData: Database['public']['Tables']['questions']['Insert'] = {
        question: data.question,
        category: data.category as Database['public']['Enums']['question_category'],
        end_datetime: endDate.toISOString(),
        yes_value: parseInt(data.yesValue),
        no_value: parseInt(data.noValue),
        created_by: session.session.user.id,
      };
      
      // Insert the question
      const { error } = await supabase
        .from('questions')
        .insert(questionData);
      
      if (error) {
        throw error;
      }
      
      toast.success("Question created successfully!");
      form.reset(defaultValues);
      
      if (onQuestionCreated) {
        onQuestionCreated();
      }
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder="Enter your question..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dateString"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date (DD-MM)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="DD-MM"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time (HH:MM)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="HH:MM"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="yesValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yes %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    {...field}
                    onChange={(e) => handleYesValueChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="noValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    {...field}
                    onChange={(e) => handleNoValueChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {formErrors.values && (
          <div className="text-red-500 text-sm">{formErrors.values}</div>
        )}
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Question"}
        </Button>
      </form>
    </Form>
  );
}
