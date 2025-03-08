
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DebugInfoCardProps {
  debugInfo: string | null;
}

const DebugInfoCard = ({ debugInfo }: DebugInfoCardProps) => {
  if (!debugInfo) return null;
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded overflow-auto max-h-[300px]">
          {debugInfo}
        </pre>
      </CardContent>
    </Card>
  );
};

export default DebugInfoCard;
