import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
// Import the CSS file for Plinko styling
import "@/styles/plinko.css";

// Adjust constants for configurable rows
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600; // Make it square
const BASE_CANVAS_HEIGHT = 600;
// Add a constant for bottom padding to ensure consistent end position
const BOTTOM_PADDING = 20; // Reduce bottom padding
const PIN_RADIUS = 4;
const BALL_RADIUS = 6;
const PIN_SPACING = 40; // Define PIN_SPACING with an appropriate value
const MIN_ROWS = 8;
const MAX_ROWS = 16;

// Define the exact number of dots per row (starting from row 0)
const DOTS_PER_ROW = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

// Multiplier configuration based on rows and risk level
interface MultiplierConfig {
  low: Record<number, number[]>;
  medium: Record<number, number[]>;
  high: Record<number, number[]>;
}

// Helper function to calculate multiplier count from rows
const getMultiplierCount = (rows: number): number => {
  // For 8 rows -> 7 multipliers, 18 rows -> 17 multipliers
  return rows - 1;
};

// Base multiplier configurations - you can modify these values
const BASE_MULTIPLIERS: MultiplierConfig = {
  low: {
    // Define some specific configurations for certain row counts
    8: [1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2],
    9: [1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2],
    10: [1.4, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.4],
    12: [1.5, 1.3, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.3, 1.5],
    14: [1.8, 1.4, 1.3, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.8],
    18: [2.0, 1.7, 1.5, 1.4, 1.3, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 2.0]
  },
  medium: {
    8: [2.6, 1.8, 1.3, 1.0, 1.3, 1.8, 2.6],
    10: [3.0, 2.1, 1.5, 1.3, 1.0, 1.3, 1.5, 2.1, 3.0],
    12: [3.5, 2.5, 1.8, 1.4, 1.2, 1.0, 1.2, 1.4, 1.8, 2.5, 3.5],
    14: [4.0, 2.8, 2.1, 1.6, 1.3, 1.1, 1.0, 1.1, 1.3, 1.6, 2.1, 2.8, 4.0],
    18: [5.0, 3.5, 2.6, 2.0, 1.7, 1.4, 1.2, 1.1, 1.0, 1.1, 1.2, 1.4, 1.7, 2.0, 2.6, 3.5, 5.0]
  },
  high: {
    8: [7.0, 3.0, 1.6, 0.7, 1.6, 3.0, 7.0],
    10: [9.0, 4.0, 2.0, 1.3, 0.6, 1.3, 2.0, 4.0, 9.0],
    12: [12.0, 5.0, 2.5, 1.7, 1.1, 0.5, 1.1, 1.7, 2.5, 5.0, 12.0],
    14: [16.0, 7.0, 3.5, 2.0, 1.4, 0.8, 0.5, 0.8, 1.4, 2.0, 3.5, 7.0, 16.0],
    18: [25.0, 12.0, 7.0, 4.0, 2.5, 1.8, 1.3, 0.9, 0.4, 0.9, 1.3, 1.8, 2.5, 4.0, 7.0, 12.0, 25.0]
  }
};

interface Ball {
  x: number;
  y: number;
  vy: number;
  vx: number;
  id: string; // Add unique identifier for each ball
}

interface Pin {
  x: number;
  y: number;
}

type RiskLevel = 'low' | 'medium' | 'high';

interface PlinkoConfig {
  rows: number;
  risk: RiskLevel;
}

// Generate multipliers based on row count and risk level
const generateMultipliers = (rows: number, risk: RiskLevel): number[] => {
  const multiplierCount = getMultiplierCount(rows);
  
  // Check if we have a predefined configuration for this row count
  if (BASE_MULTIPLIERS[risk][rows]) {
    return BASE_MULTIPLIERS[risk][rows];
  }
  
  // If not, interpolate between the closest defined configurations
  const definedRows = Object.keys(BASE_MULTIPLIERS[risk])
    .map(Number)
    .sort((a, b) => a - b);
  
  let lowerRow = definedRows.filter(r => r <= rows).pop() || definedRows[0];
  let upperRow = definedRows.filter(r => r >= rows).shift() || definedRows[definedRows.length - 1];
  
  if (lowerRow === upperRow) {
    // If we only found one match, we'll need to scale it
    const baseMultipliers = BASE_MULTIPLIERS[risk][lowerRow];
    const targetLength = multiplierCount;
    
    if (baseMultipliers.length === targetLength) {
      return baseMultipliers;
    }
    
    // Scale the multipliers to the target length
    return scaleMultipliers(baseMultipliers, targetLength);
  }
  
  // Interpolate between lower and upper row configurations
  const lowerMultipliers = BASE_MULTIPLIERS[risk][lowerRow];
  const upperMultipliers = BASE_MULTIPLIERS[risk][upperRow];
  
  // First make both arrays the same length
  const normalizedLower = scaleMultipliers(lowerMultipliers, multiplierCount);
  const normalizedUpper = scaleMultipliers(upperMultipliers, multiplierCount);
  
  // Then interpolate between them
  const factor = (rows - lowerRow) / (upperRow - lowerRow);
  return normalizedLower.map((val, idx) => {
    const interpolated = val + (normalizedUpper[idx] - val) * factor;
    return Math.round(interpolated * 100) / 100; // Round to 2 decimal places
  });
};

// Helper function to scale multipliers to a target length
const scaleMultipliers = (multipliers: number[], targetLength: number): number[] => {
  if (multipliers.length === targetLength) {
    return multipliers;
  }
  
  const result = new Array(targetLength).fill(0);
  const center = Math.floor(targetLength / 2);
  const sourceCenter = Math.floor(multipliers.length / 2);
  
  for (let i = 0; i < targetLength; i++) {
    const distance = Math.abs(i - center) / center; // 0 at center, 1 at edges
    const sourceIdx = Math.min(
      multipliers.length - 1,
      Math.round(sourceCenter + (i - center) * (multipliers.length / targetLength))
    );
    
    // Apply some scaling based on row count
    const scaleFactor = 1 + (targetLength - multipliers.length) * 0.03;
    
    // Scale edges more than center
    const edgeBoost = 1 + distance * 0.2;
    
    result[i] = Math.round(multipliers[sourceIdx] * scaleFactor * edgeBoost * 100) / 100;
  }
  
  return result;
};

// Dynamic multiplier row component that handles any number of multipliers
const MultiplierRow = ({ multipliers }: { multipliers: number[] }) => {
  return (
    <div className="w-full grid plinko-multipliers" style={{ 
      gridTemplateColumns: `repeat(${multipliers.length}, 1fr)`,
      gap: '0px' // Remove gap between multipliers
    }}>
      {multipliers.map((multiplier, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center justify-center h-10 multiplier-item",
            index % 2 === 0 ? "bg-gray-800" : "bg-gray-900",
            "text-sm md:text-base font-bold transition-all duration-300",
            "plinko-bucket"
          )}
        >
          <span className="multiplier-text">{multiplier}x</span>
        </div>
      ))}
    </div>
  );
};

export function Plinko() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [betAmount, setBetAmount] = useState("1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const animationFrameRef = useRef<number>();
  const [activeBalls, setActiveBalls] = useState<Ball[]>([]); // Replace ballRef with state
  const pinsRef = useRef<Pin[]>([]);
  const animationLoopRef = useRef<boolean>(false);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const animationRef = useRef<number | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const processedBallIdsRef = useRef<Set<string>>(new Set()); // Track processed ball IDs
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [config, setConfig] = useState<PlinkoConfig>({
    rows: 8,
    risk: 'medium'
  });
  const [multipliers, setMultipliers] = useState<number[]>([]);
  // Add ref to track canvas height
  const canvasHeightRef = useRef<number>(BASE_CANVAS_HEIGHT);
  // Add this new state to track wins for toast display
  const [lastWinAmount, setLastWinAmount] = useState<{amount: number, multiplier: number} | null>(null);
  // Add state to track multiplier hits history
  const [multiplierHits, setMultiplierHits] = useState<{multiplier: number, amount: number}[]>([]);

  // Generate multipliers when config changes
  useEffect(() => {
    const newMultipliers = generateMultipliers(config.rows, config.risk);
    setMultipliers(newMultipliers);
  }, [config.rows, config.risk]);

  // Re-initialize pins with exact dot counts per row
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear animation if running
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Reset balls
    ballsRef.current = [];
    processedBallIdsRef.current.clear();
    setActiveBalls([]);

    // Initialize pins with exact dot pattern
    const pins: Pin[] = [];
    const startY = 60;
    const centerX = CANVAS_WIDTH / 2;

    // Calculate maximum spacing to fit all rows in the canvas
    const maxDotsInRow = DOTS_PER_ROW[config.rows - 1]; // Last row has the most dots
    const effectiveSpacing = Math.min(40, (CANVAS_WIDTH * 0.8) / maxDotsInRow);

    // Create pins for each row with the exact number of dots
    for (let row = 0; row < config.rows; row++) {
      const dotsInRow = DOTS_PER_ROW[row];
      const rowWidth = (dotsInRow - 1) * effectiveSpacing;
      const startXForRow = centerX - rowWidth / 2;

      for (let col = 0; col < dotsInRow; col++) {
        pins.push({
          x: startXForRow + (col * effectiveSpacing),
          y: startY + (row * effectiveSpacing)
        });
      }
    }

    pinsRef.current = pins;
    
    // FIXED: Make sure canvas height is sufficient for full animation
    // Calculate the height based on rows plus extra padding for the ball to fall into buckets
    const height = (config.rows - 1) * effectiveSpacing;
    // Add extra padding to ensure the ball always completes its animation
    const calculatedHeight = startY + height + BOTTOM_PADDING + 200; // Increased from 100 to 200
    canvasHeightRef.current = calculatedHeight;
    
    // Update canvas height
    canvas.height = calculatedHeight;
    
    // Update CSS variable for calculations
    document.documentElement.style.setProperty('--plinko-current-rows', config.rows.toString());
    document.documentElement.style.setProperty('--plinko-pin-spacing', `${effectiveSpacing}px`);
    document.documentElement.style.setProperty('--plinko-top-offset', `${startY}px`);
    document.documentElement.style.setProperty('--plinko-canvas-height', `${calculatedHeight}px`);
    document.documentElement.style.setProperty('--plinko-canvas-width', `${CANVAS_WIDTH}px`);
    document.documentElement.style.setProperty('--plinko-bottom-padding', `${BOTTOM_PADDING}px`);
    
    // Add canvas class for styling
    canvas.classList.add('plinko-canvas');
    
    drawGame(ctx);

    // Restart animation loop
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config.rows, config.risk]);

  // Modify the re-initialize pins effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate effective spacing based on canvas size
    const maxDotsInRow = DOTS_PER_ROW[config.rows - 1];
    const effectiveSpacing = Math.min(CANVAS_WIDTH / maxDotsInRow, 40);
    
    // Adjust startY to spread pins across full canvas height
    const totalHeight = CANVAS_HEIGHT;
    const contentHeight = (config.rows - 1) * effectiveSpacing;
    const startY = (totalHeight - contentHeight) / 2;

    // Rest of pin initialization...
    const pins: Pin[] = [];
    const centerX = CANVAS_WIDTH / 2;

    for (let row = 0; row < config.rows; row++) {
      const dotsInRow = DOTS_PER_ROW[row];
      const rowWidth = (dotsInRow - 1) * effectiveSpacing;
      const startXForRow = centerX - rowWidth / 2;

      for (let col = 0; col < dotsInRow; col++) {
        pins.push({
          x: startXForRow + (col * effectiveSpacing),
          y: startY + (row * effectiveSpacing)
        });
      }
    }

    pinsRef.current = pins;
    canvas.height = CANVAS_HEIGHT; // Force square canvas
    canvas.width = CANVAS_WIDTH;
    
    // ...existing code...
  }, [config.rows, config.risk]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize pins in triangle formation
    const pins: Pin[] = [];
    const startY = 60; // Adjusted starting Y position
    const centerX = CANVAS_WIDTH / 2;

    // Start from second row (index 1) to remove first row
    for (let row = 1; row < config.rows; row++) {
      const pinsInRow = row + 1;
      const rowWidth = pinsInRow * PIN_SPACING;
      const startXForRow = centerX - (rowWidth / 2) + (PIN_SPACING / 2);

      for (let col = 0; col < pinsInRow; col++) {
        pins.push({
          x: startXForRow + (col * PIN_SPACING),
          y: startY + (row * PIN_SPACING)
        });
      }
    }

    pinsRef.current = pins;
    drawGame(ctx);

    // Start animation loop
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Only add new balls that haven't been processed yet
    const newBalls = activeBalls.filter(ball => !processedBallIdsRef.current.has(ball.id));
    
    // Mark these balls as processed
    newBalls.forEach(ball => processedBallIdsRef.current.add(ball.id));
    
    // Update our reference with only the new balls added to existing ones
    ballsRef.current = [...ballsRef.current, ...newBalls];
  }, [activeBalls]);

  const gameLoop = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update physics
    updateBalls();
    
    // Draw current game state
    drawGame(ctx);
    
    // Continue the loop
    animationRef.current = requestAnimationFrame(gameLoop);
  };

  // Fix the updateBalls function to correctly handle multipliers
  const updateBalls = () => {
    // Reduced gravity from 0.1 to 0.05 for much slower fall
    const gravity = 0.05;
    // Reduced bounce factor for gentler bounces
    const bounce = 0.5;
    // Added more friction to slow horizontal movement
    const friction = 0.98;
    
    // Calculate triangle boundaries based on dot pattern
    const centerX = CANVAS_WIDTH / 2;
    const topY = 60;
    
    // Calculate the maximum width based on the last row's dots
    const maxDotsInRow = DOTS_PER_ROW[config.rows - 1];
    const effectiveSpacing = Math.min(40, (CANVAS_WIDTH * 0.8) / maxDotsInRow);
    const maxWidth = (maxDotsInRow - 1) * effectiveSpacing;
    const height = (config.rows - 1) * effectiveSpacing;
    
    // Work with the ref directly for physics updates
    const updatedBalls: Ball[] = [];
    const completedBalls: Ball[] = [];
    
    for (const ball of ballsRef.current) {
      const newBall = { ...ball };
      
      // Apply physics
      newBall.vy += gravity;
      newBall.y += newBall.vy;
      newBall.x += newBall.vx;
      newBall.vx *= friction;
      
      // Calculate current width based on progress down the board
      const progress = Math.max(0, Math.min(1, (newBall.y - topY) / height));
      const firstRowWidth = (DOTS_PER_ROW[0] - 1) * effectiveSpacing;
      const widthRange = maxWidth - firstRowWidth;
      const currentWidth = firstRowWidth + (widthRange * progress);
      
      // Calculate boundaries with padding for the ball
      const leftBoundary = centerX - (currentWidth / 2) - BALL_RADIUS;
      const rightBoundary = centerX + (currentWidth / 2) + BALL_RADIUS;
      
      // Keep ball inside boundaries
      if (newBall.x < leftBoundary) {
        newBall.x = leftBoundary;
        newBall.vx *= -bounce;
      } else if (newBall.x > rightBoundary) {
        newBall.x = rightBoundary;
        newBall.vx *= -bounce;
      }
      
      // Check pin collisions
      pinsRef.current.forEach(pin => {
        const dx = newBall.x - pin.x;
        const dy = newBall.y - pin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < BALL_RADIUS + PIN_RADIUS) {
          const angle = Math.atan2(dy, dx);
          
          // Better collision response
          const speed = Math.sqrt(newBall.vx * newBall.vx + newBall.vy * newBall.vy);
          newBall.vx = Math.cos(angle) * speed * bounce + (Math.random() - 0.5);
          newBall.vy = Math.sin(angle) * speed * bounce;
          
          // Prevent sticking
          newBall.x = pin.x + (BALL_RADIUS + PIN_RADIUS + 1) * Math.cos(angle);
          newBall.y = pin.y + (BALL_RADIUS + PIN_RADIUS + 1) * Math.sin(angle);
        }
      });
      
      // FIXED: Calculate bottom position with extra padding to ensure ball completes animation
      const bottomY = topY + height + BOTTOM_PADDING;
      
      // FIXED: Only mark ball as complete when it has fully fallen into a bucket
      // This ensures we see the ball reach the multiplier section
      if (newBall.y > bottomY + 150) { // Increased padding
        completedBalls.push(newBall);
        processedBallIdsRef.current.delete(newBall.id);
      } else {
        updatedBalls.push(newBall);
      }
    }
    
    // Process completed balls and show results
    if (completedBalls.length > 0) {
      for (const ball of completedBalls) {
        try {
          // Parse bet amount and ensure it's a valid number
          const amount = parseFloat(betAmount);
          if (isNaN(amount) || amount <= 0) {
            console.error("Invalid bet amount:", betAmount);
            toast.error("Invalid bet amount");
            continue;
          }
          
          // Get appropriate multiplier
          if (!multipliers || multipliers.length === 0) {
            console.error("No multipliers available");
            continue;
          }
          
          // Calculate landing position correctly based on current config
          const bottomY = topY + height + effectiveSpacing;
          const maxDotsInLastRow = DOTS_PER_ROW[config.rows - 1];
          const triangleWidth = (maxDotsInLastRow - 1) * effectiveSpacing;
          const triangleLeft = centerX - triangleWidth / 2;
          
          // Calculate position relative to the triangle to find correct multiplier
          const relativePosition = (ball.x - triangleLeft) / triangleWidth;
          const clampedPosition = Math.max(0, Math.min(1, relativePosition));
          const multiplierIndex = Math.floor(clampedPosition * multipliers.length);
          
          // Ensure index is within bounds
          const safeIndex = Math.max(0, Math.min(multiplierIndex, multipliers.length - 1));
          const multiplier = multipliers[safeIndex];
          
          // Calculate and display winnings
          const winAmount = amount * multiplier;
          
          // FIXED: Set the lastWinAmount state to trigger toast render
          setLastWinAmount({ amount: winAmount, multiplier });
          
          // Add to multiplier hits history
          setMultiplierHits(prev => {
            const newHits = [{ multiplier, amount: winAmount }, ...prev];
            return newHits.slice(0, 10); // Keep only last 10 hits
          });
          
          // Create message outside of setTimeout
          const message = `Won $${winAmount.toFixed(2)}! (${multiplier}x)`;
          console.log(message, { 
            amount, 
            multiplier,
            position: clampedPosition,
            index: safeIndex,
            multiplierCount: multipliers.length 
          });
          
          // Use immediate toast to ensure it displays - FIXED to show properly
          toast.success(`Won $${winAmount.toFixed(2)}! (${multiplier}x)`, {
            id: `win-${ball.id}`, // Unique ID to prevent duplicates
            duration: 3000
          });
          
          // ADDED: Visual feedback by highlighting the bucket where the ball landed
          if (document) {
            const buckets = document.querySelectorAll('.multiplier-item');
            if (buckets && buckets[safeIndex]) {
              buckets[safeIndex].classList.add('active');
              setTimeout(() => {
                buckets[safeIndex].classList.remove('active');
              }, 1000);
            }
          }
        } catch (err) {
          console.error("Error processing win:", err);
          toast.error("Something went wrong calculating your win");
        }
      }
      
      // Update state less frequently - only when balls are completed
      setActiveBalls(updatedBalls);

      // If this is the last ball completing, re-enable the button
      if (updatedBalls.length === 0) {
        setIsButtonDisabled(false);
      }
    }
    
    // Update the ref without triggering re-renders
    ballsRef.current = updatedBalls;
  };

  // Modified drawGame to completely remove the bottom row
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, canvasHeightRef.current);
    
    // Draw background - changed to F5F7FE
    ctx.fillStyle = '#F5F7FE';
    ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeightRef.current);

    // Draw pins - keep black
    ctx.fillStyle = '#000000';
    pinsRef.current.forEach(pin => {
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, PIN_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw all active balls
    ballsRef.current.forEach(ball => {
      // Draw the ball without glow effect
      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  };

  // Ensure multipliers are initialized correctly when component mounts
  useEffect(() => {
    // Generate initial multipliers based on default config
    const initialMultipliers = generateMultipliers(config.rows, config.risk);
    setMultipliers(initialMultipliers);
  }, []);

  const dropBall = () => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    // Disable button during the animation
    setIsButtonDisabled(true);
    
    // Calculate starting position aligned with the first row
    const centerX = CANVAS_WIDTH / 2;
    const maxDotsInRow = DOTS_PER_ROW[config.rows - 1];
    const effectiveSpacing = Math.min(40, (CANVAS_WIDTH * 0.8) / maxDotsInRow);
    
    // Start ball above the center of the first row with a slight random offset
    const ballId = crypto.randomUUID();
    const newBall: Ball = {
      id: ballId,
      x: centerX + (Math.random() - 0.5) * (effectiveSpacing / 2),
      y: 30,
      vy: 0.5,
      vx: 0
    };

    // Reset previous win display
    setLastWinAmount(null);
    
    // Only add to state, the useEffect will handle adding to refs
    setActiveBalls(prev => [...prev, newBall]);
    
    // Ensure animation is running
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  };

  // Display win notification outside of updateBalls to ensure it renders
  useEffect(() => {
    if (lastWinAmount) {
      toast.success(
        `Won $${lastWinAmount.amount.toFixed(2)}! (${lastWinAmount.multiplier}x)`,
        { duration: 3000 }
      );
    }
  }, [lastWinAmount]);

  return (
    <div className="flex gap-4 plinko-game-container">
      {/* Sticky Sidebar */}
      <div className="w-[240px] sticky top-[80px] self-start">
        <Card className="p-4 space-y-4 plinko-controls">
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

          {/* Row selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Rows</label>
            <Select
              value={config.rows.toString()}
              onValueChange={(value) => setConfig(prev => ({ ...prev, rows: parseInt(value) }))}
              disabled={isButtonDisabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Rows" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: MAX_ROWS - MIN_ROWS + 1 }, (_, i) => MIN_ROWS + i).map(rows => (
                  <SelectItem key={rows} value={rows.toString()}>
                    {rows} Rows ({DOTS_PER_ROW.slice(0, rows).reduce((a, b) => a + b, 0)} dots)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Risk Level</label>
            <Select
              value={config.risk}
              onValueChange={(value: RiskLevel) => setConfig(prev => ({ ...prev, risk: value }))}
              disabled={isButtonDisabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={dropBall}
            disabled={isButtonDisabled}
            className="w-full"
          >
            Drop Ball
          </Button>
        </Card>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 space-y-4">
        {/* Added: Multiplier Hits Display on top of the canvas */}
        <div className="w-full flex justify-center mb-2">
          <div className="flex items-center gap-3 overflow-x-auto p-2 multiplier-hits-container">
            {multiplierHits.length > 0 ? (
              multiplierHits.map((hit, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${
                    hit.multiplier >= 2 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {hit.multiplier}x
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm">No hits yet</div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-center plinko-board-wrapper">
          <canvas 
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={canvasHeightRef.current}
            className="plinko-canvas"
          />
          
          <div className="w-[600px] multiplier-row">
            <MultiplierRow multipliers={multipliers} />
          </div>
        </div>
      </div>
      
      {/* Win notification */}
      {lastWinAmount && (
        <div className="win-notification absolute top-10 left-1/2 transform -translate-x-1/2 bg-green-600 px-4 py-2 rounded-full text-white font-bold shadow-lg">
          Won ${lastWinAmount.amount.toFixed(2)}! ({lastWinAmount.multiplier}x)
        </div>
      )}
    </div>
  );
}
