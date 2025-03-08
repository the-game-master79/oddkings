import { Badge } from "./badge";

interface TimelineProps {
  stages: {
    label: string;
    time: string;
    status: 'upcoming' | 'active' | 'completed';
  }[];
}

export function Timeline({ stages }: TimelineProps) {
    function cn(...classes: (string | false | undefined)[]): string {
        return classes.filter(Boolean).join(' ');
    }

  return (
    <div className="flex items-center space-x-2">
      {stages.map((stage, index) => (
        <div key={stage.label} className="flex items-center gap-1">
          <Badge 
            variant="outline" 
            className={cn(
              "text-sm py-1",
              stage.status === 'active' && "bg-green-500/10 text-green-600 border-green-200",
              stage.status === 'completed' && "bg-gray-100 text-gray-500",
              stage.status === 'upcoming' && "bg-gray-100/80 text-gray-500"
            )}
          >
            <span className={cn(
              "inline-block w-2 h-2 rounded-full mr-1.5",
              stage.status === 'active' && "bg-green-500",
              stage.status === 'completed' && "bg-gray-400",
              stage.status === 'upcoming' && "bg-gray-400"
            )}/>
            {stage.label}: {new Date(stage.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Badge>
          {index < stages.length - 1 && (
            <div className="h-[1px] w-3 bg-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
}
