import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PredictionCard } from "@/components/predictions/PredictionCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTradeBuilder } from "@/context/TradeBuilderContext";
import { MultiTradeSidebar } from "@/components/predictions/MultiTradeSidebar";
import { useTradeBuilderVisibility } from "@/hooks/useTradeBuilderVisibility";
import { toast } from "sonner";
import ReactCountryFlag from "react-country-flag";
import { getMatchFlags } from "@/utils/matchFlags";
import { getLiveStatus } from "../utils/sportStatus"; // Add this import
import { cn } from "@/lib/utils"; // Add this import

export default function Dashboard() {
  const navigate = useNavigate();
  const { addTrade } = useTradeBuilder();

  const { data: recentNews, isLoading: isNewsLoading } = useQuery({
    queryKey: ['recent-news'],
    queryFn: async () => {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('status', 'active')  // Only get active questions
        .limit(5)
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const { data: recentSports, isLoading: isSportsLoading } = useQuery({
    queryKey: ['recent-sports'],
    queryFn: async () => {
      // Fetch matches with active questions
      const { data } = await supabase
        .from('sport_matches')
        .select(`
          *,
          questions:sport_questions!inner(
            id,
            yes_value,
            no_value,
            category,
            status
          )
        `)
        .eq('sport_questions.status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      return data || [];
    }
  });

  const { data: casinoGames } = useQuery({
    queryKey: ['active-casino-games'],
    queryFn: async () => {
      const { data } = await supabase
        .from('casino_games')
        .select('*')
        .eq('is_active', true)
        .limit(2)
        .order('title');
      return data || [];
    }
  });

  // Helper function to split match title into teams
  const splitMatchTitle = (title: string) => {
    const teams = title.split(/\s+[Vv][Ss]\s+/);
    return {
      team1: teams[0]?.trim() || '',
      team2: teams[1]?.trim() || '',
      hasValidFormat: teams.length === 2
    };
  };

  const handleMatchClick = (match: any) => {
    navigate(`/sports/match/${match.id}`, { 
      state: { 
        matchId: match.id,
        matchTitle: match.title
      } 
    });
  };

  const {
    isSidebarOpen,
    isSidebarMinimized,
    handleClose,
    handleMinimize,
    handleMaximize
  } = useTradeBuilderVisibility();

  // Handler for sports question clicks
  const handleQuestionClick = (question: any, teamOption: 'team1' | 'team2', team: string, matchTitle: string) => {
    const option = teamOption === 'team1' ? 'yes' : 'no';
    const payout = teamOption === 'team1' ? question.yes_value : question.no_value;
    
    // Get team names from match title
    const { team1, team2 } = splitMatchTitle(matchTitle);
    
    // Extract both team names for display in trade builder
    const teams = {
      team1,
      team2
    };
    
    addTrade({
      questionId: `sport_${question.id}`,
      question: `Will ${team} win?`,
      category: 'Winner',
      option,
      payout,
      teams
    });
    
    toast.success(`Added prediction for ${team} to trade builder`);
  };

  const getTeamAbbreviation = (teamName: string) => {
    if (!teamName) return '';
    
    // Clean up the team name
    const cleanName = teamName.trim();
    
    // Split into words
    const words = cleanName.split(' ');
    
    if (words.length === 1) {
      // For single word team names, take first 3 letters
      // Example: "India" -> "IND"
      return words[0].slice(0, 3).toUpperCase();
    } else {
      // For multi-word team names, take first letter of each word
      // Example: "Royal Challengers" -> "RC"
      // Example: "South Africa" -> "SA"
      return words.map(word => word[0].toUpperCase()).join('');
    }
  };

  return (
    <div className="container mx-auto px-0.5 pt-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* News Row */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent News</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isNewsLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin">
                <ArrowRight className="h-6 w-6" />
              </div>
            </div>
          ) : recentNews?.length === 0 ? (
            <div className="col-span-full">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No active news predictions available at the moment.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            recentNews?.map((news) => (
              <PredictionCard
                key={news.id}
                id={news.id}
                question={news.question}
                category={news.category || "News"}
                trend="up"
                trendPercentage={75}
                yesPercentage={news.yes_value || 50}
                noPercentage={news.no_value || 50}
                volume={1000}
                chancePercent={75}
              />
            ))
          )}
        </div>
      </div>

      {/* Sports Row */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Sports</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/sports')}>
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isSportsLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin">
                <ArrowRight className="h-6 w-6" />
              </div>
            </div>
          ) : recentSports?.length === 0 ? (
            <div className="col-span-full">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No active sports matches available at the moment.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            recentSports.map((match) => {
              const { team1, team2 } = splitMatchTitle(match.title);
              const flags = getMatchFlags(`${team1} vs ${team2}`);

              return (
                <div
                  key={match.id}
                  className="group rounded-lg border p-3 transition-all hover:bg-muted/50 cursor-pointer bg-white dark:bg-gray-800/50 shadow-sm"
                  onClick={() => handleMatchClick(match)}
                >
                  <div className="flex flex-col space-y-4 w-full">
                    {/* Match info and stats */}
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-gray-500 border-gray-300">
                        {match.questions.length} Questions
                      </Badge>
                      <Badge variant="outline" className="text-gray-500 border-gray-300">
                        <Users className="h-3 w-3 mr-1" />
                        {Math.floor(Math.random() * 1000)} Users
                      </Badge>
                    </div>
                    
                    {/* Match title */}
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-medium font-work-sans">{team1} vs {team2}</h3>
                    </div>

                    {/* Trading timeline */}
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

                    {/* Team betting buttons */}
                    <div className="flex gap-2 w-full">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 min-w-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          const winnerQuestion = match.questions.find(q => q.category === 'Winner');
                          if (winnerQuestion) {
                            handleQuestionClick(winnerQuestion, 'team1', team1, match.title);
                          }
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
                        {getTeamAbbreviation(team1)} ({match.questions[0]?.yes_value || 0}%)
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 min-w-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          const winnerQuestion = match.questions.find(q => q.category === 'Winner');
                          if (winnerQuestion) {
                            handleQuestionClick(winnerQuestion, 'team2', team2, match.title);
                          }
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
                        {getTeamAbbreviation(team2)} ({match.questions[0]?.no_value || 0}%)
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Casino Games Row */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Featured Games</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/casino')}>
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {casinoGames?.map((game) => (
            <Card key={game.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{game.title}</h3>
                    <Button
                      onClick={() => navigate(`/casino/${game.id}`)}
                      variant="default"
                    >
                      Play Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add MultiTradeSidebar */}
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
