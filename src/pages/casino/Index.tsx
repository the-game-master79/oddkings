import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface GameCard {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'slots' | 'table' | 'live' | 'crash' | 'special';
  comingSoon?: boolean;
  featured?: boolean;
  minimumBet?: number;
  path?: string;
}

// Keep the games array for reference but we won't display it
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
    id: 'crash',
    title: 'Crash Kings',
    description: 'Watch the multiplier rise and cash out before it crashes!',
    image: '/games/crash.jpg',
    type: 'crash',
    featured: true,
    minimumBet: 0.1,
    path: '/casino/games/crash'
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

export default function Casino() {
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});

  const handleImageLoad = (gameId: string) => {
    setLoadedImages(prev => ({ ...prev, [gameId]: true }));
  };

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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        Casino Games
      </h1>

      {/* Featured Games Row */}
      <div className="mb-8">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {activeGames?.map((game) => (
            <div
              key={game.id}
              className="group cursor-pointer flex-shrink-0 snap-start"
              onClick={() => navigate(`${game.path}`)}
            >
              <div className="relative w-[150px] h-[225px] overflow-hidden rounded-lg bg-muted">
                {game.image_url ? (
                  <img
                    src={game.image_url}
                    alt={game.title}
                    className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                      loadedImages[game.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(game.id)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement?.classList.add('bg-secondary');
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
