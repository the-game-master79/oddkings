
import { Badge } from "@/components/ui/badge";
import { QuestionCategory } from "@/types/questions";

interface TradeDetailsProps {
  question: string;
  category: QuestionCategory;
  volume: number;
  participants: number;
}

export const TradeDetails = ({
  question,
  category,
  volume,
  participants
}: TradeDetailsProps) => {
  // Format volume with commas
  const formattedVolume = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(volume);

  // Format participants with commas
  const formattedParticipants = new Intl.NumberFormat('en-US').format(participants);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Question</h3>
        <div className="flex gap-2 items-start">
          <p className="text-base">{question}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className="bg-primary/5 text-primary border-primary/20 font-medium"
        >
          {category}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Volume</p>
          <p className="font-semibold">{formattedVolume}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Participants</p>
          <p className="font-semibold">{formattedParticipants}</p>
        </div>
      </div>
    </div>
  );
};
