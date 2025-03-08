import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gamepad2, Dice5, PlayCircle, TrendingUp, Crown } from "lucide-react";

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
    image: '/games/plinko.jpg',
    type: 'special',
    featured: true,
    minimumBet: 0.1
  },
  {
    id: 'crash-kings',
    title: 'Crash Kings',
    description: 'Watch the multiplier rise and cash out before it crashes!',
    image: '/games/crash-game.jpg',
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
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        Casino Games
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const Icon = typeIcons[game.type];
          
          return (
            <Card 
              key={game.id} 
              className={`overflow-hidden transition-all duration-300 ${
                game.comingSoon ? 'opacity-75' : 'hover:shadow-lg'
              }`}
            >
              <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                {game.featured && (
                  <Badge 
                    className="absolute top-2 right-2 bg-primary text-white"
                  >
                    Featured
                  </Badge>
                )}
                {/* Placeholder for game image */}
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Icon className="w-16 h-16" />
                </div>
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
