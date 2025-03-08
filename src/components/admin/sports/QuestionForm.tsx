import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SportEvent, SportMatch } from "@/types/sports";
import { useState, useEffect } from "react";

const questionFormSchema = z.object({
  match_id: z.string().min(1, "Match is required"),
  question: z.string().min(5, "Question text must be at least 5 characters"),
  yes_value: z.coerce.number().int().min(1).max(99),
  no_value: z.coerce.number().int().min(1).max(99),
  category: z.string().min(1, "Category is required"),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

export interface QuestionFormProps {
  matches: SportMatch[];
  events: SportEvent[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: QuestionFormValues) => void;
  isLoading: boolean;
  editingQuestion?: SportQuestion | null; // Add this prop
}

export function QuestionForm({ matches, events, isOpen, onOpenChange, onSubmit, isLoading, editingQuestion }: QuestionFormProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filteredMatches, setFilteredMatches] = useState<SportMatch[]>(matches);
  
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      match_id: editingQuestion?.match_id || "",
      question: editingQuestion?.question || "",
      category: editingQuestion?.category || "",
      yes_value: editingQuestion?.yes_value || 50,
      no_value: editingQuestion?.no_value || 50,
    },
  });

  // Add useEffect to update form when editingQuestion changes
  useEffect(() => {
    if (editingQuestion) {
      const match = matches.find(m => m.id === editingQuestion.match_id);
      if (match) {
        setSelectedEventId(match.event_id);
      }

      form.reset({
        match_id: editingQuestion.match_id,
        question: editingQuestion.question,
        category: editingQuestion.category,
        yes_value: editingQuestion.yes_value,
        no_value: editingQuestion.no_value,
      });
    }
  }, [editingQuestion, matches, form]);

  // Filter matches when an event is selected
  useEffect(() => {
    if (selectedEventId) {
      setFilteredMatches(matches.filter(match => match.event_id === selectedEventId));
    } else {
      setFilteredMatches(matches);
    }
  }, [selectedEventId, matches]);

  const handleFormSubmit = (values: QuestionFormValues) => {
    onSubmit({
      ...values,
      yes_value: parseInt(values.yes_value.toString()),
      no_value: parseInt(values.no_value.toString()),
    });
    form.reset();
  };

  return (
    <div className="py-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-4">
            <FormItem>
              <FormLabel>Filter by Event (Optional)</FormLabel>
              <Select
                onValueChange={(value) => setSelectedEventId(value)}
                value={selectedEventId || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Matches" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="all">All Matches</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} ({event.sport})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
            
            <FormField
              control={form.control}
              name="match_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Match</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a match" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {filteredMatches.length === 0 ? (
                        <SelectItem value="no-matches">No matches available</SelectItem>
                      ) : (
                        filteredMatches.map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Will Team A win against Team B?"
                      {...field}
                      disabled={isLoading}
                    />
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
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Winner">Winner</SelectItem>
                      <SelectItem value="Score">Score</SelectItem>
                      <SelectItem value="Player">Player</SelectItem>
                      <SelectItem value="Special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="yes_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yes Probability (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="99"
                        step="1"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="no_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No Probability (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="99"
                        step="1"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" disabled={isLoading} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Question"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
