
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SportMatch } from "@/types/sports";
import { MatchDetails as MatchDetailsType } from "../types/match-details";
import { useSportQuestions } from "./useSportQuestions";
import { useLocation } from "react-router-dom";

export const useMatchQuestionsData = () => {
  const [userBalance, setUserBalance] = useState(0);
  const location = useLocation();
  
  // Extract ID from URL path
  const pathParts = location.pathname.split('/');
  const matchIdFromPath = pathParts[pathParts.length - 1];
  const matchIdFromState = location.state?.matchId;
  
  // Use the first available ID source
  const matchId = matchIdFromPath || matchIdFromState;
  
  // Enhanced logging for debugging
  console.log("useMatchQuestionsData hook - Match ID from path:", matchIdFromPath);
  console.log("useMatchQuestionsData hook - Match ID from state:", matchIdFromState);
  console.log("useMatchQuestionsData hook - Final matchId used:", matchId);
  
  // Fetch user balance
  useEffect(() => {
    const fetchUserBalance = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data, error } = await supabase
        .from('user_balances')
        .select('total_usd_value')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching balance:', error);
        return;
      }
      
      setUserBalance(data?.total_usd_value || 0);
    };

    fetchUserBalance();
  }, []);
  
  // Fetch match details
  const { 
    data: match, 
    isLoading: isLoadingMatch 
  } = useQuery({
    queryKey: ['sport-match', matchId],
    queryFn: async () => {
      if (!matchId) {
        console.error("Match ID is required but is undefined or empty");
        throw new Error("Match ID is required");
      }
      
      console.log("Fetching match data for ID:", matchId);
      
      const { data, error } = await supabase
        .from('sport_matches')
        .select(`
          *,
          sport_events (
            title,
            sport,
            country
          )
        `)
        .eq('id', matchId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching match:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No match found with ID:', matchId);
        throw new Error('Match not found');
      }
      
      console.log("Retrieved match data:", data);
      
      return data as SportMatch;
    },
    enabled: !!matchId, // Only run when matchId is available and non-empty
    retry: 1,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch match details:', error);
      }
    }
  });
  
  // Fetch questions using the existing hook
  const { 
    data: questions = [], 
    isLoading: isLoadingQuestions 
  } = useSportQuestions();
  
  // Convert match data to the format expected by QuestionsList
  const convertedMatchData: MatchDetailsType | undefined = match ? {
    id: match.id,
    title: match.title,
    event_id: match.event_id,
    event_title: match.sport_events?.title || 'Unknown Event',
    sport: match.sport_events?.sport || 'Unknown Sport',
    country: match.sport_events?.country || 'Unknown',
    trade_start_time: match.trade_start_time,
    trade_end_time: match.trade_end_time,
    live_start_time: match.live_start_time,
  } : undefined;
  
  return {
    match,
    convertedMatchData,
    questions,
    userBalance,
    isLoading: isLoadingMatch || isLoadingQuestions,
    refreshBalance: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data } = await supabase
        .from('user_balances')
        .select('total_usd_value')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (data) {
        setUserBalance(data.total_usd_value);
      }
    }
  };
};
