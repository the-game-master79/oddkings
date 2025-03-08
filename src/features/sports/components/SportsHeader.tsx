import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface SportsHeaderProps {
  showCategories?: boolean;
}

export function SportsHeader({ showCategories = true }: SportsHeaderProps) {
  const categories = [
    "Cricket",
    "Football",
    "Basketball",
    "Tennis",
    "Baseball",
    "Hockey"
  ];

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Trade Sports</h1>
      </div>
      
      {showCategories && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/20 cursor-pointer"
            >
              {category}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
