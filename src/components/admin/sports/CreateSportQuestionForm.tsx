
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { SPORT_CATEGORIES, SportCategory } from "@/types/sports";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  category: z.string().min(1, "Please select a sport category"),
  event_id: z.string().min(1, "Please select an event"),
  match_id: z.string().min(1, "Please select a match"),
  yes_value: z.coerce.number().int().min(1, "Yes value must be at least 1"),
  no_value: z.coerce.number().int().min(1, "No value must be at least 1"),
});

interface Event {
  id: string;
  title: string;
  sport: SportCategory;
}

interface Match {
  id: string;
  title: string;
  event_id: string;
  trade_start_time: string;
  trade_end_time: string;
}

export function CreateSportQuestionForm({ 
  onQuestionCreated 
}: { 
  onQuestionCreated: () => void 
}) {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [selectedSport, setSelectedSport] = useState<SportCategory | ''>('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      category: "",
      event_id: "",
      match_id: "",
      yes_value: 25,
      no_value: 75,
    },
  });

  // Fetch events and matches every time the form is opened
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch events
        const { data: eventsData, error: eventsError } = await supabase
          .from('sport_events')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (eventsError) {
          console.error('Error fetching events:', eventsError);
        } else {
          // Cast each event's sport field to SportCategory
          const typedEvents = (eventsData || []).map(event => ({
            ...event,
            sport: event.sport as SportCategory
          }));
          setEvents(typedEvents);
        }
        
        // Fetch matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('sport_matches')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (matchesError) {
          console.error('Error fetching matches:', matchesError);
        } else {
          setMatches(matchesData as Match[] || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter events by sport
  const filteredEvents = selectedSport 
    ? events.filter(event => event.sport === selectedSport)
    : events;

  // Update filtered matches when event changes
  useEffect(() => {
    setFilteredMatches(
      matches.filter(match => !selectedEvent || match.event_id === selectedEvent)
    );
  }, [selectedEvent, matches]);

  // Handle sport change
  const handleSportChange = (sport: string) => {
    setSelectedSport(sport as SportCategory);
    form.setValue('category', sport);
    form.setValue('event_id', '');
    form.setValue('match_id', '');
    setSelectedEvent('');
    setSelectedMatch(null);
  };

  // Handle event change
  const handleEventChange = (eventId: string) => {
    setSelectedEvent(eventId);
    form.setValue('event_id', eventId);
    form.setValue('match_id', '');
    setSelectedMatch(null);
  };

  // Handle match change
  const handleMatchChange = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      form.setValue('match_id', matchId);
    }
  };

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    
    try {
      if (!selectedMatch) {
        console.error('No match selected');
        setLoading(false);
        return;
      }

      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        setLoading(false);
        return;
      }
      
      // Insert the question, using the match's trade_end_time as the end_datetime
      const { data, error } = await supabase
        .from('sport_questions')
        .insert({
          question: values.question,
          category: values.category as SportCategory,
          match_id: values.match_id,
          yes_value: values.yes_value,
          no_value: values.no_value,
          end_datetime: selectedMatch.trade_end_time, // Use match's trade end time
          created_by: user.id,
          status: 'active'
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating question:', error);
        return;
      }
      
      onQuestionCreated();
      form.reset();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sport</FormLabel>
              <Select 
                onValueChange={(value) => handleSportChange(value)} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SPORT_CATEGORIES.map((category) => (
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

        <FormField
          control={form.control}
          name="event_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event</FormLabel>
              <Select 
                onValueChange={(value) => handleEventChange(value)} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <div className="flex justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-events" disabled>
                      No events available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="match_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Match</FormLabel>
              <Select 
                onValueChange={(value) => handleMatchChange(value)} 
                defaultValue={field.value}
                disabled={!selectedEvent}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a match" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <div className="flex justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : filteredMatches.length > 0 ? (
                    filteredMatches.map((match) => (
                      <SelectItem key={match.id} value={match.id}>
                        {match.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-matches" disabled>
                      No matches available for this event
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedMatch && (
          <Alert className="bg-muted/50 border border-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Question will be automatically resolved at the match trade end time: 
              <strong> {new Date(selectedMatch.trade_end_time).toLocaleString()}</strong>
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder="Enter the question" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="yes_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yes Value</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
                <FormLabel>No Value</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Question
          </Button>
        </div>
      </form>
    </Form>
  );
}
