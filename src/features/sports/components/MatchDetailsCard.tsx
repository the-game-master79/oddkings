import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface MatchDetailsCardProps {
  startTime: string;
  endTime: string;
  // ...other props
}

export function MatchDetailsCard({ startTime, endTime, ...props }: MatchDetailsCardProps) {
  const now = new Date();
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  
  const progress = Math.min(
    100,
    Math.max(
      0,
      ((now.getTime() - startDate.getTime()) / 
       (endDate.getTime() - startDate.getTime())) * 100
    )
  );

  return (
    <Card>
      <CardHeader>
        {/* ...existing header content... */}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeline section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Match Timeline</span>
            </div>
            
            <div className="relative pt-2">
              {/* Timeline bar */}
              <div className="h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Timeline markers */}
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <div className="flex flex-col items-start">
                  <span>Start</span>
                  <span>{format(startDate, "MMM d, HH:mm")}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span>End</span>
                  <span>{format(endDate, "MMM d, HH:mm")}</span>
                </div>
              </div>
              
              {/* Live indicator */}
              {progress > 0 && progress < 100 && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-white"
                >
                  LIVE
                </Badge>
              )}
            </div>
          </div>
          
          {/* ...existing content... */}
        </div>
      </CardContent>
    </Card>
  );
}
