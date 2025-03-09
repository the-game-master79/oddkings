import "@/styles/plinko.css";
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// Game constants
const CANVAS_WIDTH = 568; // 600 - 2rem (32px) padding
const CANVAS_HEIGHT = 568; // Made square
const MIN_ROWS = 8;
const MAX_ROWS = 16;
const PIN_RADIUS = 4;
const BALL_RADIUS = 6;
const GRAVITY = 0.15;
const BOUNCE = 0.6;
const FRICTION = 0.99;
const BUCKET_HEIGHT = 40; // Add new constant for bucket detection
const PIN_SPACING = CANVAS_WIDTH / 12; // Dynamic spacing based on canvas width
const TOP_PADDING = 40; // Reduced from original
// Fixed row configuration
const ROWS = 8;
const PINS_PER_ROW = Array.from({ length: ROWS }, (_, i) => i + 3); // 3 pins at top, 10 at bottom

const VERTICAL_SPACING = (CANVAS_HEIGHT - 60) / (ROWS - 1);

// Add risk level type and multiplier configurations
type RiskLevel = 'low' | 'medium' | 'high';

const MULTIPLIER_VALUES: Record<RiskLevel, Record<number, number[]>> = {
  low: {
    8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    9: [5.6, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6],
    10: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
    11: [8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1.3, 1.9, 3, 8.4],
    12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    13: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1],
    14: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
    15: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
    16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16]
  },
  medium: {
    8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    9: [18, 4, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4, 18],
    10: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
    11: [22, 6, 3, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3, 6, 24],
    12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    13: [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 13, 43],
    14: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
    15: [88, 18, 11, 5, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 5, 11, 18, 88],
    16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110]
  },
  high: {
    8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    9: [43, 7, 2, 0.6, 0.2, 0.2, 0.6, 2, 7, 43],
    10: [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
    11: [120, 14, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14, 120],
    12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
    13: [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260],
    14: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
    15: [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620],
    16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
  }
};

const generateMultipliers = (numRows: number, riskLevel: RiskLevel): number[] => {
  // Ensure we're using the correct risk level multipliers
  const riskMultipliers = MULTIPLIER_VALUES[riskLevel];
  return riskMultipliers[numRows] || [];
};

// Update getMultipliers function to accept parameters
const getMultipliers = (pinsRef: React.RefObject<Pin[]>, rowCount: number, currentRisk: RiskLevel): number[] => {
  if (!pinsRef.current?.length) return [];
  // Get the multipliers for the current risk level and row count
  const multipliers = MULTIPLIER_VALUES[currentRisk][rowCount];
  return multipliers || [];
};

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  id: string;
}

interface Pin {
  x: number;
  y: number;
}

const riskLevelToSlider = (risk: RiskLevel): number => {
  switch (risk) {
    case 'low': return 0;
    case 'medium': return 50;
    case 'high': return 100;
  }
};

const sliderToRiskLevel = (value: number): RiskLevel => {
  if (value <= 33) return 'low';
  if (value <= 66) return 'medium';
  return 'high';
};

export function Plinko() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [betAmount, setBetAmount] = useState("1");
  const [isPlaying, setIsPlaying] = useState(false);
  const ballsRef = useRef<Ball[]>([]);
  const pinsRef = useRef<Pin[]>([]);
  const animationRef = useRef<number | null>(null);
  const [lastWin, setLastWin] = useState<{amount: number, multiplier: number} | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [activeMultiplierIndex, setActiveMultiplierIndex] = useState<number | null>(null);
  const [rowCount, setRowCount] = useState(8);

  // Add new ref for tracking wins
  const pendingWinRef = useRef<{span: number, amount: number, multiplier: number} | null>(null);

  // Update handleRiskLevelChange to properly handle state updates
  const handleRiskLevelChange = useCallback((value: number[]) => {
    const newRisk = sliderToRiskLevel(value[0]);
    setRiskLevel(newRisk);
  }, []);

  // Replace handleRowCountChange with slider handler
  const handleRowCountChange = (value: number[]) => {
    const newRowCount = value[0];
    if (MULTIPLIER_VALUES[riskLevel][newRowCount]) {
      setRowCount(newRowCount);
    }
  };

  // Add effect to handle multiplier highlighting
  useEffect(() => {
    if (activeMultiplierIndex !== null) {
      const buckets = document.querySelectorAll('.multiplier-item');
      buckets.forEach(b => b.classList.remove('active'));
      buckets[activeMultiplierIndex]?.classList.add('active');

      // Reset after animation
      const timer = setTimeout(() => {
        setActiveMultiplierIndex(null);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [activeMultiplierIndex]);

  // Initialize pins in triangle formation
  useEffect(() => {
    const pins: Pin[] = [];
    const centerX = CANVAS_WIDTH / 2;
    const availableHeight = CANVAS_HEIGHT - TOP_PADDING - BUCKET_HEIGHT;
    const dynamicSpacing = Math.min(
      CANVAS_WIDTH / (rowCount + 3),
      availableHeight / rowCount // Removed -1 to use full height
    );

    Array.from({ length: rowCount }, (_, row) => {
      const pinsInRow = row + 3; // Start with 3 pins, add one per row
      const rowWidth = (pinsInRow - 1) * dynamicSpacing;
      const startX = centerX - rowWidth / 2;
      const y = TOP_PADDING + (row * dynamicSpacing);

      for (let i = 0; i < pinsInRow; i++) {
        pins.push({
          x: startX + (i * dynamicSpacing),
          y: y
        });
      }
    });

    pinsRef.current = pins;
    requestAnimationFrame(() => {
      drawGame();
    });
  }, [rowCount, riskLevel]); // Both rowCount and riskLevel will trigger pin recalculation

  // Add effect to handle risk level changes
  useEffect(() => {
    if (pinsRef.current?.length) {
      drawGame();
    }
  }, [riskLevel]);

  const getBucketIndex = (x: number) => {
    // Get the last row of pins
    const lastRowPins = pinsRef.current
      .filter(pin => pin.y === Math.max(...pinsRef.current.map(p => p.y)));
    
    // Sort pins from left to right
    lastRowPins.sort((a, b) => a.x - b.x);
    
    // Find which span the ball is in by comparing with pin positions
    for (let i = 0; i < lastRowPins.length - 1; i++) {
      const leftPin = lastRowPins[i];
      const rightPin = lastRowPins[i + 1];
      const middleX = (leftPin.x + rightPin.x) / 2;
      
      if (x < middleX) return i;
    }
    
    // If we haven't returned yet, must be in the last span
    return lastRowPins.length - 1;
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw background
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#F5F7FE';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Get last row of pins for span visualization
    const lastRowPins = pinsRef.current
      .filter(pin => pin.y === Math.max(...pinsRef.current.map(p => p.y)))
      .sort((a, b) => a.x - b.x);

    // Draw buckets
    const bucketHeight = 40;
    const cornerRadius = 4; // Add radius for rounded corners
    const bucketMargin = 1.6; // 0.1rem = 1.6px at default scaling
    
    lastRowPins.forEach((pin, i) => {
      if (i === lastRowPins.length - 1) return;
      const nextPin = lastRowPins[i + 1];
      const bucketX = pin.x + bucketMargin;
      const bucketWidth = (nextPin.x - pin.x) - (bucketMargin * 2);
      const bucketY = pin.y + 35;

      // Draw rounded rectangle for bucket
      ctx.beginPath();
      ctx.moveTo(bucketX + cornerRadius, bucketY);
      ctx.lineTo(bucketX + bucketWidth - cornerRadius, bucketY);
      ctx.quadraticCurveTo(bucketX + bucketWidth, bucketY, bucketX + bucketWidth, bucketY + cornerRadius);
      ctx.lineTo(bucketX + bucketWidth, bucketY + bucketHeight - cornerRadius);
      ctx.quadraticCurveTo(bucketX + bucketWidth, bucketY + bucketHeight, bucketX + bucketWidth - cornerRadius, bucketY + bucketHeight);
      ctx.lineTo(bucketX + cornerRadius, bucketY + bucketHeight);
      ctx.quadraticCurveTo(bucketX, bucketY + bucketHeight, bucketX, bucketY + bucketHeight - cornerRadius);
      ctx.lineTo(bucketX, bucketY + cornerRadius);
      ctx.quadraticCurveTo(bucketX, bucketY, bucketX + cornerRadius, bucketY);
      ctx.closePath();

      // Fill bucket with color
      ctx.fillStyle = i % 2 === 0 ? '#1f2937' : '#111827';
      if (activeMultiplierIndex === i) {
        ctx.fillStyle = '#10b981';
      }
      ctx.fill();

      // Draw span number
      ctx.fillStyle = '#6b7280';
      ctx.font = `${lastRowPins.length > 12 ? '10px' : '12px'} "Work Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(
        `${i + 1}`,  // Changed back to i + 1 for 1-based display
        bucketX + bucketWidth / 2,
        bucketY - 4
      );

      // Draw multiplier text
      const currentMultipliers = MULTIPLIER_VALUES[riskLevel][rowCount];
      ctx.fillStyle = '#ffffff';
      ctx.font = `${lastRowPins.length > 12 ? '10px' : '12px'} "Work Sans", sans-serif`;
      ctx.textAlign = 'center';
      if (currentMultipliers && currentMultipliers[i] !== undefined) {
        const multiplierText = `${currentMultipliers[i]}X`;
        ctx.fillText(
          multiplierText,
          bucketX + bucketWidth / 2,
          bucketY + bucketHeight / 2 + 4
        );
      }
    });

    // Draw pins
    ctx.fillStyle = '#000';
    pinsRef.current.forEach(pin => {
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, PIN_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw balls
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1e40af';
    ballsRef.current.forEach(ball => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  };

  // Move animation logic to useEffect
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        updatePhysics();
        drawGame();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isPlaying]);

  // Handle pending wins in a separate effect
  useEffect(() => {
    if (pendingWinRef.current) {
      const { span, amount, multiplier } = pendingWinRef.current;
      setLastWin({ amount, multiplier });
      setActiveMultiplierIndex(span);
      toast.success(`Hit span ${span + 1}: Won $${amount.toFixed(2)}! (${multiplier}X)`); // span + 1 for display
      pendingWinRef.current = null;
    }
  });

  // Update updatePhysics to use pendingWinRef instead of direct state updates
  const updatePhysics = () => {
    const updatedBalls: Ball[] = [];
    const completedBalls: Ball[] = [];
    
    // Calculate the true bottom of the game area
    const lastPinY = Math.max(...pinsRef.current.map(pin => pin.y));
    const multiplierLineY = lastPinY + BUCKET_HEIGHT; // Update this to use bucket height
    const bottomY = CANVAS_HEIGHT + BALL_RADIUS * 2; // True bottom for ball removal

    ballsRef.current.forEach(ball => {
      const newBall = { ...ball };
      
      // Apply gravity and movement
      newBall.vy += GRAVITY;
      newBall.y += newBall.vy;
      newBall.x += newBall.vx;
      newBall.vx *= FRICTION;

      // Check pin collisions
      pinsRef.current.forEach(pin => {
        const dx = newBall.x - pin.x;
        const dy = newBall.y - pin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < BALL_RADIUS + PIN_RADIUS) {
          const angle = Math.atan2(dy, dx);
          const speed = Math.sqrt(newBall.vx * newBall.vx + newBall.vy * newBall.vy);
          newBall.vx = Math.cos(angle) * speed * BOUNCE + (Math.random() - 0.5);
          newBall.vy = Math.sin(angle) * speed * BOUNCE;
          newBall.x = pin.x + (BALL_RADIUS + PIN_RADIUS + 1) * Math.cos(angle);
          newBall.y = pin.y + (BALL_RADIUS + PIN_RADIUS + 1) * Math.sin(angle);
        }
      });

      // Split the completion logic:
      // 1. Calculate multiplier when ball reaches multiplier line
      if (newBall.y >= multiplierLineY && !newBall.id.includes('_scored')) {
        const exactSpan = getBucketIndex(newBall.x);
        const multiplier = getMultipliers(pinsRef, rowCount, riskLevel)[exactSpan];
        const amount = parseFloat(betAmount);
        
        if (!isNaN(amount)) {
          pendingWinRef.current = {
            span: exactSpan, // Keep this 0-based for array indexing
            amount: amount * multiplier,
            multiplier
          };
        }
        newBall.id = `${newBall.id}_scored`;
      }

      // 2. Only remove ball when it's completely off screen
      if (newBall.y > bottomY) {
        completedBalls.push(newBall);
      } else {
        updatedBalls.push(newBall);
      }
    });

    ballsRef.current = updatedBalls;
    if (updatedBalls.length === 0) {
      setIsPlaying(false);
    }
  };

  const dropBall = () => {
    if (isNaN(parseFloat(betAmount)) || parseFloat(betAmount) <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    setIsPlaying(true);
    const newBall: Ball = {
      x: CANVAS_WIDTH / 2,
      y: 20,
      vx: 0,
      vy: 0,
      id: Math.random().toString()
    };
    
    ballsRef.current.push(newBall);
  };

  // Add this helper function to calculate multiplier widths
  const getMultiplierStyle = () => {
    const defaultStyle = {
      containerStyle: {},
      itemStyle: {},
      textSizeClass: ''
    };
    if (!pinsRef.current?.length) return defaultStyle;
    
    const lastRowPins = pinsRef.current
      .filter(pin => pin.y === Math.max(...pinsRef.current.map(p => p.y)))
      .sort((a, b) => a.x - b.x);
  
    return {
      containerStyle: {
        width: `${CANVAS_WIDTH}px`,
        margin: '0 auto',
        position: 'absolute',
        bottom: '0',
        display: 'grid',
        gridTemplateColumns: `repeat(${lastRowPins.length - 1}, 1fr)`,
        gap: '0px',
        paddingLeft: `${lastRowPins[0].x}px`,
        paddingRight: `${CANVAS_WIDTH - lastRowPins[lastRowPins.length - 1].x}px`
      },
      itemStyle: {
        width: '100%',
        position: 'relative'
      },
      textSizeClass: lastRowPins.length > 12 ? 'multiplier-text-xs' : ''
    };
  };

  // Update the render section
  return (
    <div className="flex gap-4 plinko-game-container">
      <div className="w-[240px] sticky top-[80px] self-start">
        <Card className="p-4 space-y-4">
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Rows ({rowCount})</label>
            <Slider
              defaultValue={[rowCount]}
              max={MAX_ROWS}
              min={MIN_ROWS}
              step={1}
              onValueChange={handleRowCountChange}
              disabled={ballsRef.current.length > 0}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Risk Level ({riskLevel})</label>
            <Slider
              defaultValue={[riskLevelToSlider(riskLevel)]}
              max={100}
              step={1}
              onValueChange={handleRiskLevelChange}
              disabled={ballsRef.current.length > 0}
              className="py-4"
            />
          </div>

          <Button 
            onClick={dropBall}
            className="w-full"
          >
            Drop Ball
          </Button>
        </Card>
      </div>

      <div className="flex-1">
        <div className="flex flex-col items-center">
          <div className="relative w-full">
            <canvas 
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="plinko-canvas"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
