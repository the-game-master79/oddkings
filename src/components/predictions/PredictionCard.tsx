import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
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

export const PredictionCard = ({ 
  question, 
  id, 
  category,
  yesPercentage,
  noPercentage,
  volume,
  chancePercent 
}: PredictionCardProps) => {
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [participants, setParticipants] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addTrade } = useTradeBuilder();

  useEffect(() => {
    const generateMockData = async () => {
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
        const creationTime = new Date(endTime - (7 * 24 * 60 * 60 * 1000)).getTime(); // Assume 7 days before end time
        
        // Calculate progress factor (0 to 1) based on time elapsed
        progressFactor = Math.min(1, Math.max(0, (currentTime - creationTime) / (endTime - creationTime)));
      }
      
      // Min volume: $75K, Max volume: $1.6M
      const minVolume = 75000;
      const maxVolume = 1600000;
      const volumeRange = maxVolume - minVolume;
      
      // Base volume is the minimum plus a pseudo-random component based on id hash
      const baseVolume = minVolume + (hash % volumeRange * 0.25);
      
      // Adjust volume based on progress factor (gradually increases)
      const calculatedVolume = Math.floor(baseVolume + (volumeRange * 0.75 * progressFactor));
      
      // Min participants: 100, Max participants: 7K
      const minParticipants = 100;
      const maxParticipants = 7000;
      const participantsRange = maxParticipants - minParticipants;
      
      // Base participants with some randomness
      const baseParticipants = minParticipants + (hash % participantsRange * 0.25);
      
      // Adjust participants based on progress factor (gradually increases)
      const calculatedParticipants = Math.floor(baseParticipants + (participantsRange * 0.75 * progressFactor));
      
      setCurrentVolume(calculatedVolume);
      setParticipants(calculatedParticipants);
    };

    generateMockData();
  }, [id, volume]);

  const handleOptionClick = (option: "yes" | "no", e: React.MouseEvent) => {
    e.stopPropagation();
    addTrade({
      questionId: id,
      question,
      category,
      option,
      payout: option === "yes" ? yesPercentage : noPercentage
    });
    toast.success(`Added ${option.toUpperCase()} prediction to trade builder`);
  };

  // Add category color mapping
  const getCategoryStyle = (category: QuestionCategory) => {
    const styles = {
      Politics: "bg-blue-500/10 text-blue-700 border-blue-200",
      News: "bg-purple-500/10 text-purple-700 border-purple-200",
      India: "bg-orange-500/10 text-orange-700 border-orange-200",
      USA: "bg-red-500/10 text-red-700 border-red-200",
      Crypto: "bg-green-500/10 text-green-700 border-green-200",
      Space: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
      Technology: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
      Others: "bg-gray-500/10 text-gray-700 border-gray-200"
    };
    return styles[category] || styles.Others;
  };

  return (
    <>
      <Card className="glass-card animate-fade-in h-full flex flex-col">
        <CardHeader className="flex-none pb-2 text-left">
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`shrink-0 font-medium whitespace-nowrap ${getCategoryStyle(category)}`}
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
};
