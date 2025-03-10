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
  FormDescription,
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
import { useEffect } from "react";
import * as React from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; // Fix import path
import { Switch } from "@/components/ui/switch";

const matchFormSchema = z.object({
  title: z.string().min(3, "Match title must be at least 3 characters"),
  event_id: z.string().min(1, "Event is required"),
  trade_start_time: z.string().min(1, "Trade start time is required"),
  trade_end_time: z.string().min(1, "Trade end time is required"),
  live_start_time: z.string().min(1, "Live start time is required"),
  yes_value: z.coerce
    .number()
    .min(1, "Yes value must be at least 1%")
    .max(300, "Yes value cannot exceed 300%"),
  no_value: z.coerce
    .number()
    .min(1, "No value must be at least 1%")
    .max(300, "No value cannot exceed 300%"),
  showInList: z.boolean().default(true), // Add this field
});

type MatchFormValues = z.infer<typeof matchFormSchema>;

export interface MatchFormProps {
  events: SportEvent[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MatchFormValues) => void;
  isLoading: boolean;
  editingMatch?: SportMatch | null; // Add this prop
}

const validateTeams = (title: string) => {
  const teams = title.split(/\s+[Vv][Ss]\s+/);
  return {
    isValid: teams.length === 2 && teams[0].length > 0 && teams[1].length > 0,
    team1: teams[0] || '',
    team2: teams[1] || '',
    message: teams.length !== 2 ? 
      "Title must contain two team names separated by 'Vs'" :
      !teams[0] ? "First team name is missing" :
      !teams[1] ? "Second team name is missing" : 
      "Valid match format"
  };
};

// Add this helper function at the top
const convertLocalToUTC = (localDateTime: string): string => {
  const date = new Date(localDateTime);
  return date.toISOString();
};

export function MatchForm({ events, isOpen, onOpenChange, onSubmit, isLoading, editingMatch }: MatchFormProps) {
  const [teamValidation, setTeamValidation] = React.useState({
    isValid: false,
    team1: '',
    team2: '',
    message: ''
  });

  // Helper function to format date for input
  const formatDateForInput = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  };

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      title: editingMatch?.title || "",
      event_id: editingMatch?.event_id || "",
      trade_start_time: editingMatch ? formatDateForInput(editingMatch.trade_start_time) : "",
      trade_end_time: editingMatch ? formatDateForInput(editingMatch.trade_end_time) : "",
      live_start_time: editingMatch ? formatDateForInput(editingMatch.live_start_time) : "",
      yes_value: 50,
      no_value: 50,
      showInList: true, // Add default value
    },
  });

  // Add useEffect to update form when editingMatch changes
  useEffect(() => {
    if (editingMatch) {
      form.reset({
        title: editingMatch.title,
        event_id: editingMatch.event_id,
        trade_start_time: formatDateForInput(editingMatch.trade_start_time),
        trade_end_time: formatDateForInput(editingMatch.trade_end_time),
        live_start_time: formatDateForInput(editingMatch.live_start_time),
      });
    }
  }, [editingMatch, form]);

  const handleFormSubmit = async (values: MatchFormValues) => {
    try {
      // Convert all times to UTC before saving
      const matchData = {
        title: values.title,
        event_id: values.event_id,
        trade_start_time: convertLocalToUTC(values.trade_start_time),
        trade_end_time: convertLocalToUTC(values.trade_end_time),
        live_start_time: convertLocalToUTC(values.live_start_time),
      };

      const { data: createdMatch, error: matchError } = await supabase
        .from('sport_matches')
        .insert([matchData])
        .select()
        .single();

      if (matchError) throw matchError;

      // Create both questions
      const questionsData = [
        // First question: Team1 vs Team2
        {
          match_id: createdMatch.id,
          question: `Will ${teamValidation.team1} win against ${teamValidation.team2}?`,
          category: 'Winner',
          yes_value: values.yes_value,
          no_value: values.no_value,
          end_datetime: values.trade_end_time,
          status: 'active',
          show_in_list: values.showInList,
          created_by: (await supabase.auth.getSession()).data.session?.user.id
        },
        // Second question: Team2 vs Team1 (inverse)
        {
          match_id: createdMatch.id,
          question: `Will ${teamValidation.team2} win against ${teamValidation.team1}?`,
          category: 'Winner',
          yes_value: values.no_value, // Swap the values
          no_value: values.yes_value, // Swap the values
          end_datetime: values.trade_end_time,
          status: 'active',
          show_in_list: values.showInList,
          created_by: (await supabase.auth.getSession()).data.session?.user.id
        }
      ];

      const { error: questionsError } = await supabase
        .from('sport_questions')
        .insert(questionsData);

      if (questionsError) throw questionsError;

      toast.success('Match and questions created successfully');
      onSubmit(values);
      form.reset();
    } catch (error) {
      console.error('Error creating match and questions:', error);
      toast.error('Failed to create match and questions');
    }
  };

  return (
    <div className="py-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="event_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {events.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No events available
                      </SelectItem>
                    ) : (
                      events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} ({event.sport})
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Match Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Team1 Vs Team2" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      setTeamValidation(validateTeams(e.target.value));
                    }}
                  />
                </FormControl>
                <div className={`text-sm mt-1 ${teamValidation.isValid ? 'text-green-500' : 'text-red-500'}`}>
                  {teamValidation.isValid ? (
                    <div className="flex flex-col space-y-1">
                      <span>✓ Valid match format</span>
                      <span className="text-muted-foreground">Team 1: {teamValidation.team1}</span>
                      <span className="text-muted-foreground">Team 2: {teamValidation.team2}</span>
                    </div>
                  ) : (
                    <span>{teamValidation.message}</span>
                  )}
                </div>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="yes_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yes Value (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={300}
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
                  <FormLabel>No Value (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={300}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="trade_start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trade Start Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
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
            name="trade_end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trade End Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
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
            name="live_start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Live Start Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
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
            name="showInList"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show in Match Questions</FormLabel>
                  <FormDescription>
                    Display this question in the match questions list for users
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" disabled={isLoading} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Match & Question"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
