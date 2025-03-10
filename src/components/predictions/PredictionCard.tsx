import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useCallback, useRef, memo, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuestionCategory } from "@/types/questions";
import { useTradeBuilder } from "@/context/TradeBuilderContext";
import { toast } from "sonner";

interface PredictionCardProps {
  question: string;
  trend: "up" | "down";
  trendPercentage: number;
  id: string;
  category: QuestionCategory;
  yesPercentage: number;
  noPercentage: number;
  volume: number;
  chancePercent: number;  // Add this field
}

// Generate consistent color based on category name
const generateCategoryStyle = (category: string) => {
  // Create a simple hash of the category name
  const hash = category.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  // Use the hash to select from a predefined set of color combinations
  const colorSets = [
    { bg: "bg-blue-500/10", text: "text-blue-700", border: "border-blue-200" },
    { bg: "bg-purple-500/10", text: "text-purple-700", border: "border-purple-200" },
    { bg: "bg-green-500/10", text: "text-green-700", border: "border-green-200" },
    { bg: "bg-orange-500/10", text: "text-orange-700", border: "border-orange-200" },
    { bg: "bg-cyan-500/10", text: "text-cyan-700", border: "border-cyan-200" },
    { bg: "bg-indigo-500/10", text: "text-indigo-700", border: "border-indigo-200" },
    { bg: "bg-rose-500/10", text: "text-rose-700", border: "border-rose-200" },
    { bg: "bg-yellow-500/10", text: "text-yellow-700", border: "border-yellow-200" },
  ];

  const colorSet = colorSets[hash % colorSets.length];
  return `${colorSet.bg} ${colorSet.text} ${colorSet.border}`;
};

export const PredictionCard = memo(({ 
  question, 
  id, 
  category,
  yesPercentage,
  noPercentage,
  volume,
  chancePercent 
}: PredictionCardProps) => {
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [participants, setParticipants] = useState(() => Math.floor(volume * 0.7));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addTrade } = useTradeBuilder();

  // Move mock data generation to a memoized function
  const generateMockData = useCallback(async () => {
    // Create a hash from the id string to get consistent random-looking values
    const hash = id.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    // Get question's end date to calculate progress factor
    const { data: questionData } = await supabase
      .from('questions')
      .select('end_datetime')
      .eq('id', id)
      .single();
    
    let progressFactor = 0.5; // Default middle value if we can't calculate
    
    if (questionData) {
      const endTime = new Date(questionData.end_datetime).getTime();
      const currentTime = new Date().getTime();
      const creationTime = new Date(endTime - (7 * 24 * 60 * 60 * 1000)).getTime();
      progressFactor = Math.min(1, Math.max(0, (currentTime - creationTime) / (endTime - creationTime)));
    }
    
    // Calculate volume and participants
    const minVolume = 75000;
    const maxVolume = 1600000;
    const volumeRange = maxVolume - minVolume;
    const baseVolume = minVolume + (hash % volumeRange * 0.25);
    const newVolume = Math.floor(baseVolume + (volumeRange * 0.75 * progressFactor));
    
    const minParticipants = 100;
    const maxParticipants = 7000;
    const participantsRange = maxParticipants - minParticipants;
    const baseParticipants = minParticipants + (hash % participantsRange * 0.25);
    const newParticipants = Math.floor(baseParticipants + (participantsRange * 0.75 * progressFactor));
    
    return { volume: newVolume, participants: newParticipants };
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    
    generateMockData().then(({ volume: newVolume, participants: newParticipants }) => {
      if (isMounted) {
        setCurrentVolume(newVolume);
        setParticipants(newParticipants);
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, [generateMockData]);

  const handleOptionClick = useCallback((option: "yes" | "no", e: React.MouseEvent) => {
    e.stopPropagation();
    addTrade({
      questionId: id,
      question,
      category,
      option,
      payout: option === "yes" ? yesPercentage : noPercentage
    });
    toast.success(`Added ${option.toUpperCase()} prediction to trade builder`);
  }, [id, question, category, yesPercentage, noPercentage, addTrade]);

  // No need for useEffect or data fetching here
  const categoryStyle = useMemo(() => generateCategoryStyle(category), [category]);

  return (
    <>
      <Card className="glass-card animate-fade-in h-full flex flex-col">
        <CardHeader className="flex-none pb-2 text-left">
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`shrink-0 font-medium whitespace-nowrap ${categoryStyle}`}
            >
              {category}
            </Badge>
            <Badge 
              variant="outline" 
              className="shrink-0 font-medium whitespace-nowrap text-gray-800 border-gray-300 cursor-pointer hover:bg-gray-100"
              onClick={() => setIsDialogOpen(true)}
            >
              {chancePercent}% Chance
            </Badge>
          </div>
          <CardTitle className="text-lg leading-tight font-medium font-['Work Sans'] line-clamp-3">
            {question}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end mt-auto pt-4">
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="flex items-center justify-center p-2.5 rounded-md transition-all duration-300 
                bg-green-100 hover:bg-green-200 hover:-translate-y-0.5 border border-green-300"
              onClick={(e) => handleOptionClick("yes", e)}
            >
              <span className="text-sm font-medium text-green-800">Yes&nbsp;</span>
              <span className="text-sm font-medium text-green-600">- {yesPercentage}%</span>
            </button>
            <button 
              className="flex items-center justify-center p-2.5 rounded-md transition-all duration-300 
                bg-red-100 hover:bg-red-200 hover:-translate-y-0.5 border border-red-300"
              onClick={(e) => handleOptionClick("no", e)}
            >
              <span className="text-sm font-medium text-red-800">No&nbsp;</span>
              <span className="text-sm text-red-600"> - {noPercentage}%</span>
            </button>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>${currentVolume.toLocaleString()} Vol.</span>
            <span>{participants.toLocaleString()} Trades</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{chancePercent}% Chance</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This event has {chancePercent}% chance of occurring in the future.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}, (prevProps, nextProps) => {
  // Deep comparison for props to prevent unnecessary re-renders
  return (
    prevProps.id === nextProps.id &&
    prevProps.question === nextProps.question &&
    prevProps.category === nextProps.category &&
    prevProps.yesPercentage === nextProps.yesPercentage &&
    prevProps.noPercentage === nextProps.noPercentage &&
    prevProps.volume === nextProps.volume
  );
});

PredictionCard.displayName = "PredictionCard";
