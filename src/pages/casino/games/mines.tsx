import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import styles from "@/styles/mines.module.css";
import { MINE_MULTIPLIERS, getMineConfig } from "@/config/minesConfig";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGameStore } from '@/store/gameStore';

interface Cell {
  revealed: boolean;
  isBomb: boolean;
  isSelected: boolean;
}

const Mines = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [betAmount, setBetAmount] = useState<string>("1");
  const [bombCount, setBombCount] = useState<number>(3);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [remainingGems, setRemainingGems] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(0);
  const [currentConfig, setCurrentConfig] = useState(getMineConfig(3)); // default 3 mines
  const [revealedGems, setRevealedGems] = useState<number>(0);
  const [showCashoutDialog, setShowCashoutDialog] = useState(false);
  const { isRigged, incrementWinStreak, resetWinStreak, updateRiggedGames } = useGameStore();

  const initializeGrid = useCallback(() => {
    // Create all possible positions
    const positions = Array.from({ length: 25 }, (_, i) => ({
      row: Math.floor(i / 5),
      col: i % 5
    }));

    // If rigged, force first position to be a bomb
    if (isRigged) {
      positions[0] = { row: 0, col: 0 };
    }

    // Fisher-Yates shuffle for remaining positions
    for (let i = isRigged ? 1 : positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Create empty grid
    const newGrid: Cell[][] = Array(5).fill(null).map(() =>
      Array(5).fill(null).map(() => ({
        revealed: false,
        isBomb: false,
        isSelected: false,
      }))
    );
    
    // Place bombs using the first bombCount shuffled positions
    const bombPositions = positions.slice(0, bombCount);
    bombPositions.forEach(({ row, col }) => {
      newGrid[row][col].isBomb = true;
    });
    
    setGrid(newGrid);
    setRemainingGems(25 - bombCount);
  }, [bombCount, isRigged]);

  // Add useEffect to initialize grid on mount
  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const handleCellClick = (row: number, col: number) => {
    if (!isGameActive || gameOver || grid[row][col].revealed) return;

    const newGrid = [...grid];
    newGrid[row][col].revealed = true;
    newGrid[row][col].isSelected = true;

    if (newGrid[row][col].isBomb) {
      setGameOver(true);
      setGrid(newGrid.map(row => row.map(cell => ({
        ...cell,
        revealed: cell.isBomb ? true : cell.revealed
      }))));
      setWinAmount(0);
      resetWinStreak(); // Reset streak on loss
    } else {
      const newRevealedGems = revealedGems + 1;
      setRevealedGems(newRevealedGems);
      
      // Get new multiplier based on number of revealed gems
      const newConfig = getMineConfig(bombCount, newRevealedGems);
      const newWinAmount = parseFloat(betAmount) * newConfig.multiplier;
      
      setWinAmount(newWinAmount);
      setCurrentMultiplier(newConfig.multiplier);
      setGrid(newGrid);
      setRemainingGems(prev => prev - 1);
      setCurrentConfig(newConfig);
    }
  };

  const startGame = () => {
    if (parseFloat(betAmount) <= 0) return;
    setIsGameActive(true);
    setGameOver(false);
    setWinAmount(0);
    setRevealedGems(0);
    setShowCashoutDialog(false); // Reset dialog visibility
    initializeGrid(); // Always reinitialize grid on game start
    if (isRigged) {
      updateRiggedGames();
    }
  };

  const cashOut = () => {
    setShowCashoutDialog(true);
    setIsGameActive(false);
    setGameOver(true); // Set game over to re-enable slider
    incrementWinStreak(); // Track successful cashouts
  };

  const handleBombCountChange = (value: number[]) => {
    const mines = value[0];
    setBombCount(mines);
    setCurrentConfig(getMineConfig(mines));  // This updates the multiplier/odds for the selected mine count
  };

  const handleDoubleBet = () => {
    const currentBet = parseFloat(betAmount);
    setBetAmount((currentBet * 2).toString());
  };

  const handleHalfBet = () => {
    const currentBet = parseFloat(betAmount);
    setBetAmount((currentBet / 2).toString());
  };

  return (
    <div className="flex flex-col lg:flex-row w-full gap-4 max-w-[900px] mx-auto">
      <Card className="lg:w-[240px] w-full lg:sticky lg:top-[80px] lg:self-start order-2 lg:order-1">
        <div className="p-4 space-y-4">
          {/* Modified bet amount section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bet Amount</label>
            <div className="relative">
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={isGameActive}
                className="pr-[120px]" // Make room for buttons
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleHalfBet}
                  disabled={isGameActive}
                  className="h-6 px-2"
                >
                  1/2X
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDoubleBet}
                  disabled={isGameActive}
                  className="h-6 px-2"
                >
                  2X
                </Button>
              </div>
            </div>
          </div>
          
          {/* Only show game info during active game */}
          {isGameActive && (
            <div className="space-y-2">
              <div className="text-sm font-medium mt-2">
                Multiplier ({currentConfig.multiplier.toFixed(2)}x)
              </div>
              <Input
                type="text"
                value={`$${(parseFloat(betAmount) * currentConfig.multiplier).toFixed(2)}`}
                readOnly
                className="bg-secondary font-medium text-green-500"
              />
              <div className="text-sm font-medium mt-2">Remaining Gems</div>
              <Input
                type="text"
                value={remainingGems}
                readOnly
                className="bg-secondary"
              />
            </div>
          )}

          {/* Only show mines slider when game is not active */}
          {!isGameActive && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Mines</label>
                <Badge variant="secondary">{bombCount}</Badge>
              </div>
              <Slider
                defaultValue={[bombCount]}
                max={24}
                min={1}
                step={1}
                onValueChange={handleBombCountChange}
                className="py-4"
              />
            </div>
          )}

          <Button 
            onClick={startGame}
            disabled={(isGameActive && !gameOver) || parseFloat(betAmount) <= 0}
            className="w-full"
          >
            {isGameActive && !gameOver ? "Game in Progress" : "Start Game"}
          </Button>

          <Button 
            onClick={cashOut}
            disabled={!isGameActive || gameOver}
            variant="secondary"
            className="w-full"
          >
            Cash Out (${winAmount.toFixed(2)})
          </Button>
        </div>
      </Card>

      <div className="flex-1 order-1 lg:order-2">
        <div className={styles.grid}>
          {grid.flatMap((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`${styles.cell} ${cell.revealed ? styles.revealed : ''} 
                          ${cell.revealed && cell.isBomb ? styles.bomb : ''}
                          ${cell.revealed && !cell.isBomb ? styles.gem : ''}
                          ${cell.isSelected ? styles.selected : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              />
            ))
          )}

          {/* Position dialog as direct child of grid */}
          {showCashoutDialog && (
            <div className={styles.dialogOverlay}>
              <div className={styles.dialogContent}>
                <h2 className="text-xl font-bold mb-4">Game Result</h2>
                <div className="text-2xl font-bold text-green-500 mb-2">
                  You won ${winAmount.toFixed(2)}!
                </div>
                <div className="text-sm text-muted-foreground">
                  Revealed {revealedGems} diamonds | Multiplier {currentMultiplier.toFixed(2)}x
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mines;
