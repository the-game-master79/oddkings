import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SportEvent, SportMatch, SportQuestion } from "@/types/sports";
import { toast } from "sonner";

export function useSportsManagement() {
  const queryClient = useQueryClient();
  
  // Modify admin check to be more robust
  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found');
        return false;
      }

      console.log('Checking admin access for user:', session.user.id);

      // First check if the user exists in user_roles
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      // Return true if the user has admin role
      return data?.role === 'admin';
    } catch (error) {
      console.error('Error in checkAdminAccess:', error);
      return false;
    }
  };

  // Fetch events
  const { 
    data: events, 
    isLoading: isEventsLoading,
    error: eventsError,
    refetch: refetchEvents
  } = useQuery({
    queryKey: ['sport-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sport_events')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching sport events:', error);
        throw error;
      }
      
      return data as SportEvent[];
    },
  });
  
  // Fetch matches
  const { 
    data: matches, 
    isLoading: isMatchesLoading,
    error: matchesError,
    refetch: refetchMatches
  } = useQuery({
    queryKey: ['sport-matches'],
    queryFn: async () => {
      const { data: matchesData, error } = await supabase
        .from('sport_matches')
        .select(`
          *,
          sport_events(*),
          questions:sport_questions(
            id,
            status
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching sport matches:', error);
        throw error;
      }

      // Filter out matches where all questions are resolved
      const activeMatches = (matchesData || []).filter(match => {
        // If match has no questions, don't show it
        if (!match.questions || match.questions.length === 0) {
          return false;
        }
        // Keep match only if it has at least one unresolved question
        return match.questions.some(q => !q.status?.startsWith('resolved_'));
      });
      
      return activeMatches as SportMatch[];
    },
  });
  
  // Fetch questions
  const { 
    data: questions, 
    isLoading: isQuestionsLoading,
    error: questionsError,
    refetch: refetchQuestions
  } = useQuery({
    queryKey: ['sport-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sport_questions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching sport questions:', error);
        throw error;
      }
      
      return data as SportQuestion[];
    },
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: { sport: string; title: string; country: string }) => {
      const { data, error } = await supabase
        .from('sport_events')
        .insert([eventData])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating sport event:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sport-events'] });
    },
    onError: (error: any) => {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    }
  });
  
  // Create match mutation
  const createMatchMutation = useMutation({
    mutationFn: async (matchData: {
      title: string;
      event_id: string;
      trade_start_time: string;
      trade_end_time: string;
      live_start_time: string;
    }) => {
      const { data, error } = await supabase
        .from('sport_matches')
        .insert([matchData])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating sport match:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sport-matches'] });
    },
    onError: (error: any) => {
      console.error('Failed to create match:', error);
      toast.error('Failed to create match');
    }
  });
  
  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: {
      match_id: string;
      question: string;
      category: string;
      yes_value: number;
      no_value: number;
    }) => {
      try {
        // First, get the match details to use its trade_end_time as the question's end_datetime
        const { data: matchData, error: matchError } = await supabase
          .from('sport_matches')
          .select('trade_end_time')
          .eq('id', questionData.match_id)
          .single();
        
        if (matchError) {
          console.error('Error fetching match details:', matchError);
          throw matchError;
        }
        
        if (!matchData) {
          throw new Error('Match not found');
        }
        
        // Use the match's trade_end_time as the question's end_datetime
        const { data, error } = await supabase
          .from('sport_questions')
          .insert([{ 
            ...questionData,
            end_datetime: matchData.trade_end_time,
            status: 'active',
            created_by: (await supabase.auth.getSession()).data.session?.user.id
          }])
          .select()
          .single();
          
        if (error) {
          console.error('Error creating sport question:', error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error('Error in create question flow:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sport-questions'] });
    },
    onError: (error: any) => {
      console.error('Failed to create question:', error);
      toast.error('Failed to create question');
    }
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const isAdmin = await checkAdminAccess();
      if (!isAdmin) {
        throw new Error('Unauthorized - Admin access required');
      }

      try {
        // First delete all questions associated with matches in this event
        const { data: matches } = await supabase
          .from('sport_matches')
          .select('id')
          .eq('event_id', eventId);

        if (matches) {
          for (const match of matches) {
            // Delete questions for each match
            const { error: questionsError } = await supabase
              .from('sport_questions')
              .delete()
              .eq('match_id', match.id);

            if (questionsError) throw questionsError;
          }
        }

        // Then delete all matches in this event
        const { error: matchesError } = await supabase
          .from('sport_matches')
          .delete()
          .eq('event_id', eventId);

        if (matchesError) throw matchesError;

        // Finally delete the event
        const { error: eventError } = await supabase
          .from('sport_events')
          .delete()
          .eq('id', eventId);

        if (eventError) throw eventError;

        return eventId;
      } catch (error) {
        console.error('Error in deleteEventMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sport-events'] });
      queryClient.invalidateQueries({ queryKey: ['sport-metrics'] });
      toast.success('Event and all related matches/questions deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  });

  // Delete match mutation
  const deleteMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const isAdmin = await checkAdminAccess();
      if (!isAdmin) {
        throw new Error('Unauthorized - Only admins can delete matches');
      }

      try {
        // First delete all questions for this match
        const { error: questionsError } = await supabase
          .from('sport_questions')
          .delete()
          .eq('match_id', matchId);

        if (questionsError) throw questionsError;

        // Then delete the match
        const { error: matchError } = await supabase
          .from('sport_matches')
          .delete()
          .eq('id', matchId);

        if (matchError) throw matchError;

        return matchId;
      } catch (error) {
        console.error('Error in deleteMatchMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sport-matches'] });
      queryClient.invalidateQueries({ queryKey: ['sport-metrics'] });
      toast.success('Match and all related questions deleted successfully');
    },
    onError: (error: any) => {
      console.error('Failed to delete match:', error);
      toast.error(error.message || 'Failed to delete match');
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const isAdmin = await checkAdminAccess();
      if (!isAdmin) {
        throw new Error('Unauthorized - Admin access required');
      }

      try {
        const { error } = await supabase
          .from('sport_questions')
          .delete()
          .eq('id', questionId);

        if (error) throw error;
        return questionId;
      } catch (error) {
        console.error('Error in deleteQuestionMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sport-questions'] });
      queryClient.invalidateQueries({ queryKey: ['sport-metrics'] });
      toast.success('Question deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete question:', error);
      toast.error('Failed to delete question');
    }
  });
  
  // Combine loading states
  const isLoading = isEventsLoading || isMatchesLoading || isQuestionsLoading;
  
  // Combine errors
  const error = eventsError || matchesError || questionsError;
  
  // Handle refreshing all data
  const refreshAllData = () => {
    refetchEvents();
    refetchMatches();
    refetchQuestions();
  };
  
  // Exposed API
  return {
    events,
    matches,
    questions,
    isLoading,
    error,
    refreshData: refreshAllData,
    createEvent: createEventMutation.mutate,
    createMatch: createMatchMutation.mutate,
    createQuestion: createQuestionMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    deleteMatch: deleteMatchMutation.mutate,
    deleteQuestion: deleteQuestionMutation.mutate,
  };
}
