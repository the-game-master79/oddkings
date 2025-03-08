
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Promotion {
  id: string;
  title: string;
  image_url: string;
  link: string | null;
  created_at: string | null;
}

export const PromotionalPanel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Promotion[];
    }
  });
  
  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (promotions.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [promotions.length]);
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? promotions.length - 1 : prev - 1
    );
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => 
      (prev + 1) % promotions.length
    );
  };
  
  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };
  
  if (isLoading) {
    return (
      <div className="w-full h-40 bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading promotions...</p>
      </div>
    );
  }
  
  if (!promotions || promotions.length === 0) {
    return (
      <div className="w-full h-40 bg-muted/10 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No promotions available</p>
      </div>
    );
  }
  
  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div className="aspect-[16/5] relative">
        {promotions.map((promotion, index) => (
          <div
            key={promotion.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <a href={promotion.link || "#"} target="_blank" rel="noopener noreferrer">
              <img
                src={promotion.image_url}
                alt={promotion.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </a>
          </div>
        ))}
        
        {/* Navigation buttons */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="secondary"
          size="icon" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Dots indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? "bg-white w-4" 
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
