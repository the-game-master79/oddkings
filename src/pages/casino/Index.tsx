import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gamepad2, Dice5, PlayCircle, TrendingUp, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface GameCard {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'slots' | 'table' | 'live' | 'crash' | 'special';
  comingSoon?: boolean;
  featured?: boolean;
  minimumBet?: number;
}

const games: GameCard[] = [
  {
    id: 'plinko',
    title: 'Plinko',
    description: 'Drop the ball and watch it bounce for multiplied winnings!',
    image: 'https://oddkings-assets.s3.amazonaws.com/game-images/plinko.jpg',
    type: 'special',
    featured: true,
    minimumBet: 0.1
  },
  {
    id: 'mines',
    title: 'Mines',
    description: 'Find the gems and avoid the mines to win big!',
    image: 'https://oddkings-assets.s3.amazonaws.com/game-images/mines.jpg',
    type: 'special',
    featured: true,
    minimumBet: 0.1
  },
  {
    id: 'crash-kings',
    title: 'Crash Kings',
    description: 'Watch the multiplier rise and cash out before it crashes!',
    image: 'https://oddkings-assets.s3.amazonaws.com/game-images/crash.jpg',
    type: 'crash',
    featured: true,
    minimumBet: 1
  },
  {
    id: 'roulette',
    title: 'Kings Roulette',
    description: 'Classic casino roulette with multiple betting options',
    image: '/games/roulette.jpg',
    type: 'table',
    minimumBet: 0.5
  },
  {
    id: 'blackjack',
    title: 'Blackjack',
    description: 'Get as close to 21 as you can without going over',
    image: '/games/blackjack.jpg',
    type: 'table',
    minimumBet: 1
  },
  {
    id: 'dice',
    title: 'Dice Roll',
    description: 'Predict whether the next roll will be higher or lower',
    image: '/games/dice.jpg',
    type: 'special',
    minimumBet: 0.5
  },
  {
    id: 'slots',
    title: 'Lucky Slots',
    description: 'Classic slot machine with multiple paylines',
    image: '/games/slots.jpg',
    type: 'slots',
    comingSoon: true
  },
  {
    id: 'live-poker',
    title: 'Live Poker',
    description: 'Play poker with live dealers and other players',
    image: '/games/poker.jpg',
    type: 'live',
    comingSoon: true
  }
];

const typeIcons = {
  slots: Gamepad2,
  table: Dice5,
  live: PlayCircle,
  crash: TrendingUp,
  special: Crown
};

export default function Casino() {
  const navigate = useNavigate();
  const { data: activeGames } = useQuery({
    queryKey: ["casino-games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casino_games")
        .select("*")
        .eq("is_active", true)
        .order("title");
      
      if (error) throw error;
      return data;
    },
  });

  const filteredGames = games.filter(game => 
    activeGames?.some(activeGame => activeGame.id === game.id)
  );

  const handleGameClick = (game: GameCard) => {
    if (game.comingSoon) return;
    navigate(`/casino/${game.id}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        Casino Games
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => {
          const Icon = typeIcons[game.type];
          
          return (
            <Card 
              key={game.id} 
              className={`overflow-hidden transition-all duration-300 cursor-pointer ${
                game.comingSoon ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1'
              }`}
              onClick={() => handleGameClick(game)}
            >
              <div className="relative h-48">
                {game.featured && (
                  <Badge 
                    className="absolute top-2 right-2 z-10 bg-primary text-white"
                  >
                    Featured
                  </Badge>
                )}
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{game.title}</span>
                  {game.minimumBet && (
                    <Badge variant="outline">
                      Min: ${game.minimumBet}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {game.description}
                </p>
                
                <Button 
                  className="w-full"
                  disabled={game.comingSoon}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click when clicking button
                    handleGameClick(game);
                  }}
                >
                  {game.comingSoon ? 'Coming Soon' : 'Play Now'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
