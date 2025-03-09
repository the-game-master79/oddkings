import { Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (isMobile && theme !== "system") {
      setTheme("system");
    }
  }, [isMobile, setTheme, theme]);

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-full"
      onClick={() => setTheme("light")}
    >
      <Sun className="h-4 w-4" />
      <span className="sr-only">Set light theme</span>
    </Button>
  );
}
