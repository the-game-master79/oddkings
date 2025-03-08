
import { BarChart2, Users } from "lucide-react";

interface QuestionStatsProps {
  volume: number;
  participants: number;
}

export const QuestionStats = ({ volume, participants }: QuestionStatsProps) => {
  // Format numbers to be more readable
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <BarChart2 className="h-4 w-4 text-primary" />
          <span className="font-medium">${formatNumber(volume)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-medium">{formatNumber(participants)}</span>
        </div>
      </div>
    </div>
  );
};
