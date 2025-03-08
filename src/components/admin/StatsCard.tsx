import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface StatsCardProps {
  title: string;
  value: number;
  description?: string;
  type?: 'total' | 'active' | 'success' | 'error';
  route?: string;
}

export function StatsCard({ title, value, description, type = 'total', route }: StatsCardProps) {
  const cardContent = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold break-all",
          type === 'success' && "text-green-600",
          type === 'error' && "text-red-600",
          type === 'active' && "text-blue-600",
          typeof value === 'string' && "text-base" // Make text smaller for long strings
        )}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (route) {
    return <Link to={route}>{cardContent}</Link>;
  }

  return cardContent;
}
function cn(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

