
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
}

export const PageHeader = ({ title }: PageHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-2 mb-6">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/sports')}
        className="p-0 h-9 w-9"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
};
