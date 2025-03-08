import { Link, useLocation } from 'react-router-dom';
import { Newspaper, Trophy, Dice1 } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileNavigation = () => {
  const location = useLocation();
  
  const links = [
    {
      href: '/',
      label: 'News',
      icon: <Newspaper size={20} />,
    },
    {
      href: '/sports',
      label: 'Sports',
      icon: <Trophy size={20} />,
    },
    {
      href: '/casino',
      label: 'Casino',
      icon: <Dice1 size={20} />,
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-4 z-40">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const isActive = location.pathname === link.href || 
                         (link.href !== '/' && location.pathname.startsWith(link.href));
          return (
            <Link 
              key={link.href}
              to={link.href}
              className={cn(
                "flex flex-col items-center justify-center rounded-md p-2 transition-colors",
                isActive 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <div className={cn(
                "flex items-center justify-center",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {link.icon}
              </div>
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
