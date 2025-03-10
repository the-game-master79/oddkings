import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import "@/styles/crash.css";
import { useGameStore } from '@/store/gameStore';

interface CrashPoint {
  x: number;
  y: number;
  multiplier: number;
}

const GAME_TICK = 50; // Update every 50ms
const MULTIPLIER_INCREASE = 0.05; // How much multiplier increases per tick
const CRASH_PROBABILITY = 0.005; // Probability of crash per tick

export function Crash() {
  const [betAmount, setBetAmount] = useState("1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [isCashed, setIsCashed] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [points, setPoints] = useState<CrashPoint[]>([]);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const { isRigged, incrementWinStreak, resetWinStreak, updateRiggedGames } = useGameStore();

  const startGame = () => {
    if (parseFloat(betAmount) <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    setIsPlaying(true);
    setIsCashed(false);
    setCurrentMultiplier(1);
    setPoints([{ x: 0, y: 0, multiplier: 1 }]);

    if (isRigged) {
      updateRiggedGames();
    }

    gameInterval.current = setInterval(() => {
      setCurrentMultiplier(prev => {
        const newMultiplier = prev + MULTIPLIER_INCREASE;
        
        // Add new point to graph
        setPoints(currentPoints => [
          ...currentPoints,
          {
            x: currentPoints.length,
            y: newMultiplier,
            multiplier: newMultiplier
          }
        ]);

        // Check for crash
        const shouldCrash = isRigged ? newMultiplier > 1.5 : Math.random() < CRASH_PROBABILITY;
        if (shouldCrash) {
          handleCrash();
          return prev;
        }

        return newMultiplier;
      });
    }, GAME_TICK);
  };

  const handleCrash = () => {
    if (gameInterval.current) {
      clearInterval(gameInterval.current);
    }
    setIsPlaying(false);
    setHistory(prev => [currentMultiplier, ...prev.slice(0, 9)]);
    if (!isCashed) {
      toast.error(`Crashed at ${currentMultiplier.toFixed(2)}x`);
      resetWinStreak();
    }
  };

  const cashOut = () => {
    if (!isPlaying || isCashed) return;
    
    const winAmount = parseFloat(betAmount) * currentMultiplier;
    setIsCashed(true);
    incrementWinStreak();
    toast.success(`Cashed out ${winAmount.toFixed(2)}! (${currentMultiplier.toFixed(2)}x)`);
  };

  useEffect(() => {
    return () => {
      if (gameInterval.current) {
        clearInterval(gameInterval.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 crash-container">
      <Card className="lg:w-[280px] w-full lg:sticky lg:top-[80px] lg:self-start order-2 lg:order-1">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bet Amount</label>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={isPlaying}
            />
          </div>

          <Button 
            onClick={startGame}
            disabled={isPlaying}
            className="w-full"
          >
            Start Game
          </Button>

          <Button 
            onClick={cashOut}
            disabled={!isPlaying || isCashed}
            variant="secondary"
            className="w-full"
          >
            Cash Out (${(parseFloat(betAmount) * currentMultiplier).toFixed(2)})
          </Button>
        </div>
      </Card>

      <div className="flex-1 order-1 lg:order-2">
        <div className="crash-graph">
          <div className={`crash-multiplier ${!isPlaying ? 'crashed' : ''}`}>
            {currentMultiplier.toFixed(2)}x
          </div>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              className="crash-line"
              d={points.map((point, i) => 
                `${i === 0 ? 'M' : 'L'} ${point.x} ${100 - point.y * 10}`
              ).join(' ')}
            />
          </svg>
        </div>

        <div className="crash-history">
          {history.map((multiplier, i) => (
            <div 
              key={i}
              className={`history-item ${multiplier >= 2 ? 'history-win' : 'history-loss'}`}
            >
              {multiplier.toFixed(2)}x
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Crash;
