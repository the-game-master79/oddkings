import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SportsCardProps {
  team1: string;
  team2: string;
  date: string;
  mockData?: string;
  className?: string;
}

export function SportsCard({ team1, team2, date, mockData, className }: SportsCardProps) {
  return (
    <Card className={cn("relative mb-4 md:px-6", className)}>
      {/* Mock data positioned at top right */}
      {mockData && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground">
          {mockData}
        </div>
      )}
      
      <div className="p-4 md:p-6">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">
              <span>{team1}</span>
              <span className="mx-2 text-muted-foreground">V/s</span>
              <span>{team2}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {date}
          </div>
        </div>
      </div>
    </Card>
  );
}
