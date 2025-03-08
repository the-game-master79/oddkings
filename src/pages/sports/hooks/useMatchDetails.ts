
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MatchDetails, MatchDataResponse } from "../types/match-details";

export const useMatchDetails = (matchId: string | undefined, setDebugInfo: (info: string) => void) => {
  return useQuery({
    queryKey: ['sport-match', matchId],
    queryFn: async () => {
      // Clear previous debug info
      setDebugInfo("");
      
      if (!matchId) {
        console.error("Match ID is missing");
        setDebugInfo("Match ID is undefined in URL params.");
        throw new Error("Match ID is required");
      }
      
      try {
        console.log("Fetching match data for ID:", matchId);
        
        // Get match details with full query - use simpler query without explicit join
        const { data: matchData, error: matchError } = await supabase
          .from('sport_matches')
          .select(`
            *,
            sport_events (*)
          `)
          .eq('id', matchId)
          .maybeSingle();
        
        if (matchError) {
          console.error('Error fetching match details:', matchError);
          setDebugInfo(`Error fetching match details: ${JSON.stringify(matchError, null, 2)}`);
          throw matchError;
        }
        
        if (!matchData) {
          console.error('Match details not found for ID:', matchId);
          setDebugInfo(`Match details with ID ${matchId} not found in database. This could indicate that the match has been deleted or the ID is incorrect.`);
          throw new Error(`Match details with ID ${matchId} not found`);
        }
        
        console.log("Retrieved match data:", matchData);
        
        // Handle potentially missing sport_events data gracefully
        const matchWithTypes = matchData as MatchDataResponse;
        const sportEvent = matchWithTypes.sport_events || {};
        
        // Transform the data to the expected format
        const transformedData: MatchDetails = {
          id: matchWithTypes.id,
          title: matchWithTypes.title,
          event_id: matchWithTypes.event_id,
          event_title: sportEvent.title || 'Unknown Event',
          sport: sportEvent.sport || 'Unknown Sport',
          country: sportEvent.country || 'Unknown',
          trade_start_time: matchWithTypes.trade_start_time,
          trade_end_time: matchWithTypes.trade_end_time,
          live_start_time: matchWithTypes.live_start_time,
        };
        
        console.log("Transformed match data:", transformedData);
        setDebugInfo(`Successfully fetched match data: ${JSON.stringify(transformedData, null, 2)}`);
        
        return transformedData;
      } catch (error) {
        console.error('Failed to fetch match details:', error);
        
        // Add detailed error for debugging
        if (error instanceof Error) {
          setDebugInfo(`Error: ${error.message}\nStack: ${error.stack}`);
        } else {
          setDebugInfo(`Unknown error: ${JSON.stringify(error)}`);
        }
        
        throw error;
      }
    },
    enabled: !!matchId,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * (2 ** attemptIndex), 10000), // Exponential backoff
    gcTime: 0,
    staleTime: 10000
  });
};
