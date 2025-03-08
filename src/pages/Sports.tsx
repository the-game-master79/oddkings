import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight, Trophy, AlertCircle, Globe, DollarSign, Users } from "lucide-react";
import { SportCategory, SPORT_CATEGORIES } from "@/types/sports";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { MultiTradeSidebar } from "@/components/predictions/MultiTradeSidebar";
import { useTradeBuilder } from "@/context/TradeBuilderContext";
import { useTradeBuilderVisibility } from "@/hooks/useTradeBuilderVisibility";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFootballBall, faBasketballBall, faBaseballBall, faVolleyball, faHorseHead, faHandFist, faMitten, faChessQueen, faCar, faGamepad, faBowlingBall, faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons';
import { Badge } from "@/components/ui/badge";
import countries from "@/lib/countries.json";
import ReactCountryFlag from "react-country-flag";
import { getTeamCountryCode, getCountryName } from "@/utils/countryUtils";
import { getMatchFlags } from "@/utils/matchFlags";

const getLiveStatus = (liveStartTime: string, tradeEndTime: string) => {
  const now = new Date();
  const liveStart = new Date(liveStartTime);
  const tradeEnd = new Date(tradeEndTime);
  
  if (now < liveStart) {
    return {
      text: "Upcoming",
      className: "bg-yellow-500/10 text-yellow-600 border-yellow-200"
    };
  } else if (now >= liveStart && now <= tradeEnd) {
    return {
      text: "Live Now",
      className: "bg-green-500/10 text-green-600 border-green-200"
    };
  } else {
    return {
      text: "Ended",
      className: "bg-gray-100/80 text-gray-500 border-gray-200"
    };
  }
};

interface SportEvent {
  id: string;
  title: string;
  sport: SportCategory;
  country: string;
  matches: SportMatch[];
  created_at: string;
}

interface SportMatch {
  id: string;
  title: string;
  event_id: string;
  trade_start_time: string;
  trade_end_time: string;
  live_start_time: string;
  created_at: string;
  created_by: string;
  questions: {
    id: string;
    yes_value: number;
    no_value: number;
    category: string;
    status?: string; // Add status field
  }[];
}

interface MatchStatsProps {
  volume: number;
  participants: number;
}

const MatchStats = ({ volume, participants }: MatchStatsProps) => (
  <div className="flex gap-2">
    <Badge variant="outline" className="text-gray-500 border-gray-300">
      ${volume.toLocaleString()}&nbsp;Vol.
    </Badge>
    <Badge variant="outline" className="text-gray-500 border-gray-300">
      <Users className="h-3 w-3 mr-1" />
      {participants} Users
    </Badge>
  </div>
);

const splitMatchTitle = (title: string) => {
  const teams = title.split(/\s+[Vv][Ss]\s+/);
  return {
    team1: teams[0] || '',
    team2: teams[1] || '',
    hasValidFormat: teams.length === 2
  };
};

const getTeamAbbreviation = (teamName: string) => {
  const words = teamName.trim().split(/\s+/);
  
  if (words.length === 1) {
    // For single words (e.g., "Afghanistan" -> "AFG")
    return teamName.slice(0, 3).toUpperCase();
  } else {
    // For multiple words (e.g., "New Zealand" -> "NZ", "South Africa" -> "SA")
    return words
      .map(word => word[0].toUpperCase())
      .join('');
  }
};

const getCountryCode = (teamName: string): string => {
  return getTeamCountryCode(teamName);
};

const splitTeamNames = (matchTitle: string): [string, string] => {
  const teams = matchTitle.split(/\s+[Vv]s\.?\s+/);
  return [teams[0]?.trim() || '', teams[1]?.trim() || ''];
};

const renderQuestionButtons = (question: any, team1: string, team2: string, addTrade: Function) => {
  // Get flags for the match
  const flags = getMatchFlags(`${team1} vs ${team2}`);
  
  if (question.status === 'resolved_yes' || question.status === 'resolved_no') {
    const winner = question.status === 'resolved_yes' ? team1 : team2;
    const winnerFlag = question.status === 'resolved_yes' ? flags.team1 : flags.team2;
    return (
      <Badge variant={question.status === 'resolved_yes' ? 'success' : 'destructive'}>
        {winnerFlag && (
          <ReactCountryFlag
            countryCode={winnerFlag}
            svg
            className="mr-1"
            style={{
              width: '14px',
              height: '14px',
              marginRight: '4px'
            }}
          />
        )}
        Winner: {winner}
      </Badge>
    );
  }

  const handleQuestionClick = (question: any, teamOption: 'team1' | 'team2', team: string) => {
    const option = teamOption === 'team1' ? 'yes' : 'no';
    const payout = teamOption === 'team1' ? question.yes_value : question.no_value;
    
    addTrade({
      questionId: `sport_${question.id}`,
      question: `Will ${team} win?`,
      category: 'Winner',
      option,
      payout
    });
    
    toast.success(`Added prediction for ${team} to trade builder`);
  };
  return (
    <div className="flex gap-2 w-full">
      <Button 
        size="sm" 
        variant="outline"
        className="flex-1 min-w-0"
        onClick={(e) => {
          e.stopPropagation();
          handleQuestionClick(question, 'team1', team1);
        }}
      >
        {flags.team1 && (
          <ReactCountryFlag
            countryCode={flags.team1}
            svg
            style={{
              width: '14px',
              height: '14px',
              marginRight: '4px'
            }}
          />
        )}
        {getTeamAbbreviation(team1)} ({question.yes_value}%)
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        className="flex-1 min-w-0"
        onClick={(e) => {
          e.stopPropagation();
          handleQuestionClick(question, 'team2', team2);
        }}
      >
        {flags.team2 && (
          <ReactCountryFlag
            countryCode={flags.team2}
            svg
            style={{
              width: '14px',
              height: '14px',
              marginRight: '4px'
            }}
          />
        )}
        {getTeamAbbreviation(team2)} ({question.no_value}%)
      </Button>
    </div>
  );
};

export default function Sports() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<SportCategory | "all">(
    // Initialize with category from navigation state, if available
    (location.state?.selectedCategory as SportCategory | "all") || "all"
  );
  
  // Clear navigation state after using it
  useEffect(() => {
    if (location.state?.selectedCategory) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const navigate = useNavigate();
  
  // Fetch sports data from Supabase
  const { data: sportEvents = [], isLoading } = useQuery({
    queryKey: ['sports-events', activeCategory],
    queryFn: async () => {
      try {
        console.log("Fetching sport events with category filter:", activeCategory);
        
        // First fetch all sport events based on the category filter
        const eventsQuery = supabase
          .from('sport_events')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (activeCategory !== "all") {
          eventsQuery.eq('sport', activeCategory);
        }
        
        const { data: events, error: eventsError } = await eventsQuery;
        
        if (eventsError) {
          console.error('Error fetching sport events:', eventsError);
          throw eventsError;
        }
        
        // For each event, get its matches regardless of questions
        const eventsWithMatches = await Promise.all(
          (events || []).map(async (event) => {
            const { data: matches, error: matchesError } = await supabase
              .from('sport_matches')
              .select(`
                *,
                questions:sport_questions(
                  id,
                  yes_value,
                  no_value,
                  category,
                  status
                )
              `)
              .eq('event_id', event.id)
              .eq('questions.show_in_list', true);
              
            if (matchesError) {
              console.error(`Error fetching matches for event ${event.id}:`, matchesError);
              return {
                ...event,
                sport: event.sport as SportCategory,
                matches: []
              };
            }

            // Filter out matches where all questions are resolved
            const activeMatches = (matches || []).filter(match => {
              // Check if the match has any questions
              if (!match.questions || match.questions.length === 0) {
                return false;
              }
              // Keep the match only if it has at least one unresolved question
              return match.questions.some(q => 
                !q.status?.startsWith('resolved_')
              );
            });
            
            return {
              ...event,
              sport: event.sport as SportCategory,
              matches: activeMatches
            };
          })
        );
        
        // Only return events that have matches with unresolved questions
        return eventsWithMatches.filter(event => event.matches.length > 0);
      } catch (error) {
        console.error("Error in sports query:", error);
        toast.error("Failed to load sports events");
        return [];
      }
    },
    refetchOnWindowFocus: false
  });
  
  const handleMatchClick = (match: SportMatch) => {
    navigate(`/sports/match/${match.id}`, { 
      state: { 
        matchId: match.id,
        matchTitle: match.title
      } 
    });
  };
  
  const formatTime = (isoTime: string) => {
    const date = new Date(isoTime);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getDaysToGo = (isoTime: string) => {
    const eventDate = new Date(isoTime);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days to go` : 'Live now';
  };

  // Filter to only show categories that have events with questions
  const availableSportCategories = [
    { label: "Popular", value: "all" as const },
    ...SPORT_CATEGORIES.filter(category => {
      if (isLoading) return true;
      return sportEvents.some(event => event.sport === category.value);
    }).map(category => ({
      ...category,
      icon: (
        <FontAwesomeIcon
          icon={
            (category.value as string) === 'Soccer' ? faFootballBall :
            (category.value as string) === 'Basketball' ? faBasketballBall :
            (category.value as string) === 'Baseball' ? faBaseballBall :
            (category.value as string) === 'Volleyball' ? faVolleyball :
            (category.value as string) === 'Martial Arts' ? faHandFist :
            (category.value as string) === 'Boxing' ? faMitten :
            (category.value as string) === 'Chess' ? faChessQueen :
            (category.value as string) === 'F1' ? faCar :
            (category.value as string) === 'ESports' ? faGamepad :
            (category.value as string) === 'Badminton' ? faScrewdriverWrench :
            (category.value as string) === 'Horse Racing' ? faHorseHead :
            (category.value as string) === 'Tennis' ? faBowlingBall :
            faBaseballBall // Default or other sports
          }
          className="h-4 w-4 mr-2"
        />
      )
    }))
  ];

  const { trades, addTrade } = useTradeBuilder();
  const {
    isSidebarOpen,
    isSidebarMinimized,
    handleClose,
    handleMinimize,
    handleMaximize
  } = useTradeBuilderVisibility();

  const totalTrade = trades.reduce((sum, trade) => sum + (trade.amount || 0), 0);
  // Calculate estimated payout based on your business logic
  const estimatedPayout = totalTrade * 1.5; // Example calculation

  const handleQuestionClick = (question: any, teamOption: 'team1' | 'team2', team: string) => {
    const option = teamOption === 'team1' ? 'yes' : 'no';
    const payout = teamOption === 'team1' ? question.yes_value : question.no_value;
    
    // Extract both team names
    const teams = {
      team1: getTeamNames(question.match_title || '')[0],
      team2: getTeamNames(question.match_title || '')[1]
    };
    
    addTrade({
      questionId: `sport_${question.id}`,
      question: `Will ${team} win?`,
      category: 'Winner',
      option,
      payout,
      teams // Add teams to the trade object
    });
    
    toast.success(`Added prediction for ${team} to trade builder`);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Trade Sports, Win Big!</h1>
        <div className="mb-6 -mx-3 px-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 overflow-x-auto pb-2 px-6 scrollbar-hide">
            {availableSportCategories.map((category) => (
              <Button
                key={category.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "transition-all duration-300 hover:bg-primary/10 whitespace-nowrap",
                  activeCategory === category.value && "bg-primary/20"
                )}
                onClick={() => setActiveCategory(category.value)}
              >
                {category.value === 'all' ? null : category.icon} {category.label}
              </Button>
            ))}
          </div>
        </div>
          
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : sportEvents.length === 0 ? (
            <Alert className="bg-muted">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No matches available for the selected sport category. Please check back later for upcoming events.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-8">
              {sportEvents.map((event) => (
                <Card key={event.id} className="mb-8">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      {event.country && (
                        <Badge variant="outline" className="capitalize">
                          {event.country}
                        </Badge>
                      )}
                      <h2 className="text-2xl font-semibold">{event.title}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {event.matches.map((match) => (
                        <div
                          key={match.id}
                          className="group rounded-lg border p-3 transition-all hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleMatchClick(match)}
                        >
                          <div className="flex flex-col space-y-4 w-full">
                            {/* Stats at the top */}
                            <MatchStats 
                              volume={Math.floor(Math.random() * 100000)} 
                              participants={Math.floor(Math.random() * 1000)}
                            />
                            
                            {/* Match title in Work Sans Medium */}
                            <div className="flex items-center space-x-2">
                              <h3 className="text-xl font-medium font-work-sans">{match.title}</h3>
                            </div>

                            {/* Betting buttons */}
                            <div className="w-full">
                              {match.questions?.filter((q, index) => index === 0).map(question => {
                                const { team1, team2, hasValidFormat } = splitMatchTitle(match.title);
                                return question.category === 'Winner' && (
                                  <div key={question.id} className="w-full">
                                    {renderQuestionButtons(question, team1, team2, addTrade)}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Replace Timeline section with Live Status */}
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "flex items-center gap-2",
                                  getLiveStatus(match.live_start_time, match.trade_end_time).className
                                )}
                              >
                                <span className={cn(
                                  "inline-block w-2 h-2 rounded-full",
                                  getLiveStatus(match.live_start_time, match.trade_end_time).text === "Live Now" ? "bg-green-500" :
                                  getLiveStatus(match.live_start_time, match.trade_end_time).text === "Upcoming" ? "bg-yellow-500" :
                                  "bg-gray-400"
                                )}/>
                                {getLiveStatus(match.live_start_time, match.trade_end_time).text}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="flex items-center gap-2 bg-gray-100/80 dark:bg-gray-800/80 text-gray-500 border-gray-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMatchClick(match);
                                }}
                              >
                                <span>{match.questions?.length || 0} Trades</span>
                                <ArrowRight className="h-4 w-4" />
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <MultiTradeSidebar 
        isOpen={isSidebarOpen}
        isMinimized={isSidebarMinimized}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
      />
    </div>
  );
}
const getTeamNames = (matchTitle: string): [string, string] => {
  const teams = matchTitle.split(/\s+[Vv][Ss]\s+/);
  return [teams[0]?.trim() || '', teams[1]?.trim() || ''];
};

