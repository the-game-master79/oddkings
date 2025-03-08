
import { Clock, Calendar, MapPin, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { SportMatch } from "@/types/sports";

interface MatchDetailsProps {
  match: SportMatch;
}

export const MatchDetails = ({ match }: MatchDetailsProps) => {
  const formatTime = (isoTime: string) => {
    if (!isoTime) return "Time not available";
    const date = new Date(isoTime);
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Match Date: {formatTime(match.live_start_time)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Trading Starts: {formatTime(match.trade_start_time)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Trading Ends: {formatTime(match.trade_end_time)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <div>Event: <span className="font-medium">{match.sport_events?.title || "Unknown"}</span></div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>Country: <span className="font-medium">{match.sport_events?.country || "Unknown"}</span></div>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.287 13.407A8.003 8.003 0 0 0 7.752 19.5c-.4.6-.1 1.188-.025 1.766M17.5 5.5v-1a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1ZM10.5 5.5v-1a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1ZM16.5 12.25a.75.75 0 0 0 1.5 0V9A1.5 1.5 0 0 0 16.5 7.5h-4a.75.75 0 0 0 0 1.5h4v3.25ZM5.5 10.5a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" />
              </svg>
              <div>Sport: <span className="font-medium">{match.sport_events?.sport || "Unknown"}</span></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
