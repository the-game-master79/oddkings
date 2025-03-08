import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SportQuestion } from "../types/match-details";
import { useParams, useLocation } from "react-router-dom";

export const useSportQuestions = () => {
  const location = useLocation();
  
  // Get matchId from URL path
  const pathParts = location.pathname.split('/');
  const matchIdFromPath = pathParts[pathParts.length - 1];
  
  // Fallback to state if available
  const matchIdFromState = location.state?.matchId;
  
  // Use path ID first, then state ID as fallback
  const matchId = matchIdFromPath || matchIdFromState;
  
  // Enhanced logging for debugging
  console.log("useSportQuestions - Getting match ID:");
  console.log("useSportQuestions - From pathname:", location.pathname);
  console.log("useSportQuestions - ID from path:", matchIdFromPath);
  console.log("useSportQuestions - ID from state:", matchIdFromState);
  console.log("useSportQuestions - Final matchId used:", matchId);
  
  return useQuery({
    queryKey: ['sport-questions', matchId],
    queryFn: async () => {
      if (!matchId) {
        console.error("Cannot fetch questions: Match ID is missing");
        return [];
      }
      
      try {
        console.log("Fetching sport questions for match ID:", matchId);
        
        // Direct query to sport_questions table
        const { data, error } = await supabase
          .from('sport_questions')
          .select('*')
          .eq('match_id', matchId)
          // Remove the .eq('status', 'active') filter to show all questions including resolved ones
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching sport questions:', error);
          return [];
        }
        
        console.log(`Retrieved ${data?.length || 0} sport questions for match ${matchId}`);
        
        if (data?.length === 0) {
          console.log("No active questions found for this match");
        } else {
          console.log("First question:", data[0]);
        }
        
        // Transform data to match the expected SportQuestion type
        const transformedData = data.map(question => ({
          id: question.id,
          match_id: question.match_id,
          question: question.question,
          category: question.category,
          yes_value: question.yes_value,
          no_value: question.no_value,
          status: question.status,
          end_datetime: question.end_datetime,
          created_at: question.created_at,
          created_by: question.created_by || "",
          resolved_by: question.resolved_by,
          resolved_at: question.resolved_at
        })) as SportQuestion[];
        
        return transformedData;
      } catch (error) {
        console.error('Error in sport questions query:', error);
        return [];
      }
    },
    enabled: !!matchId, // Only run when matchId is available
    staleTime: 10000,
    retry: 2
  });
};
