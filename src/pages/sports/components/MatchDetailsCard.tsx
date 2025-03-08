import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchDetails } from "../types/match-details";
import { formatTime } from "../utils/date-utils";
import { Trophy, Globe, CalendarCheck } from "lucide-react"; // Add icons import

interface MatchDetailsCardProps {
  matchData: MatchDetails;
}

const MatchDetailsCard = ({ matchData }: MatchDetailsCardProps) => {
  const getTimeStatus = (time: string) => {
    const now = new Date();
    const timeDate = new Date(time);
    return timeDate <= now;
  };

  const isTradeStarted = getTimeStatus(matchData.trade_start_time);
  const isLive = getTimeStatus(matchData.live_start_time);

  const formatTimelineDate = (time: string) => {
    const date = new Date(time);
    return `${date.toLocaleString('en-US', { month: 'short' })} ${date.getDate()}`;
  };

  const getDaysToGo = (time: string) => {
    const eventDate = new Date(time);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days to go` : '';
  };

  const formatMatchStatus = (time: string, isLive: boolean) => {
    if (isLive) {
      return "Live Now";
    }
    const date = new Date(time);
    const formattedDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    const daysToGo = getDaysToGo(time);
    return `Match Starts on ${formattedDate}${daysToGo ? `, ${daysToGo}` : ''}`;
  };

  const formatPayoutStatus = (time: string) => {
    const date = new Date(time);
    const formattedDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    const daysToGo = getDaysToGo(time);
    return `${formattedDate}${daysToGo ? `, ${daysToGo}` : ''}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{matchData.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Match Info Section - Stack on mobile/tablet */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <CalendarCheck className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div className="ml-3 min-w-0">
                <span className="text-sm font-medium text-muted-foreground block">Sport</span>
                <p className="font-medium truncate">{matchData.sport}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Trophy className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div className="ml-3 min-w-0">
                <span className="text-sm font-medium text-muted-foreground block">Event</span>
                <p className="font-medium truncate">{matchData.event_title}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Globe className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div className="ml-3 min-w-0">
                <span className="text-sm font-medium text-muted-foreground block">Host Country</span>
                <p className="font-medium truncate">{matchData.country}</p>
              </div>
            </div>
          </div>

          {/* Timeline Section - Stack on mobile/tablet */}
          <div className="flex flex-col space-y-4">
            <div className="w-full">
              <Badge 
                variant="outline" 
                className={cn(
                  "w-full flex items-center",
                  isTradeStarted 
                    ? "bg-green-500/10 text-green-600 border-green-200" 
                    : "bg-gray-100/80 text-gray-500",
                  "pl-4"
                )}
              >
                <span className={cn(
                  "w-4 h-4 rounded-full border-2 border-white mr-2",
                  isTradeStarted ? "bg-green-500" : "bg-gray-300"
                )}/>
                Trading Live from {formatTimelineDate(matchData.trade_start_time)}
              </Badge>
            </div>

            <div className="w-full">
              <Badge 
                variant="outline" 
                className={cn(
                  "w-full flex items-center",
                  isLive
                    ? "bg-green-500/10 text-green-600 border-green-200"
                    : "bg-yellow-500/10 text-yellow-600 border-yellow-200",
                  "pl-4"
                )}
              >
                <span className={cn(
                  "w-4 h-4 rounded-full border-2 border-white mr-2",
                  isLive ? "bg-green-500" : "bg-yellow-500"
                )}/>
                {formatMatchStatus(matchData.live_start_time, isLive)}
              </Badge>
            </div>

            <div className="w-full">
              <Badge 
                variant="outline" 
                className={cn(
                  "w-full flex items-center",
                  "bg-red-500/10 text-red-600 border-red-200",
                  "pl-4"
                )}
              >
                <span className="w-4 h-4 rounded-full border-2 border-white bg-red-500 mr-2"/>
                Payout Distribution: {formatPayoutStatus(matchData.trade_end_time)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchDetailsCard;

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
