
import { ArrowRight } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-700 py-4 px-4 sm:px-6 text-center text-sm text-muted-foreground mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-center sm:text-left">
          <p>&copy; 2024 oddKINGS. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-x-4 gap-y-2 mt-2 sm:mt-0">
          <a href="#" className="text-sm hover:text-primary transition-colors">Terms</a>
          <a href="#" className="text-sm hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="text-sm hover:text-primary transition-colors">Contact</a>
          <a 
            href="#" 
            className="hidden sm:flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            <span>Our Blog</span>
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};
