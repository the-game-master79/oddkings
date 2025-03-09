import { useState, useEffect } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Newspaper, Trophy, ChevronLeft, ChevronRight, Dice1, LayoutDashboard } from "lucide-react";
import { 
  Collapsible, 
  CollapsibleContent
} from "@/components/ui/collapsible";

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar = ({ collapsed }: SidebarProps) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dispatch custom event when sidebar state changes
  useEffect(() => {
    const event = new CustomEvent('sidebar-toggle', { 
      detail: { collapsed: isCollapsed } 
    });
    window.dispatchEvent(event);
    
    // Store preference
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const mainLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      href: '/',
      label: 'Predict News',
      icon: <Newspaper size={18} />,
    },
    {
      href: '/sports',
      label: 'Trade Sports',
      icon: <Trophy size={18} />,
    },
    {
      href: '/casino',
      label: 'Casino',
      icon: <Dice1 size={18} />,
    }
  ];

  return (
    <aside 
      className={cn(
        "fixed top-0 left-0 bottom-0 glass border-r border-gray-100 dark:border-gray-700 pt-16 transition-all duration-300 z-30",
        isCollapsed ? "w-[60px]" : "w-[240px]"
      )}
      style={{ height: '100vh', maxHeight: `${windowHeight}px` }}
    >
      <div className="flex justify-end p-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 rounded-full hover:bg-primary/10"
        >
          {isCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </Button>
      </div>
      
      <Collapsible open={!isCollapsed} className="h-full">
        <nav className="px-2 py-3">
          <div className="space-y-4">
            <CollapsibleContent forceMount className="!block">
              <div className="space-y-1">
                {mainLinks.map((link, index) => {
                  const isActive = location.pathname === link.href || 
                                 (link.href !== '/' && location.pathname.startsWith(link.href));
                  return (
                    <Link 
                      key={`${link.href}-${index}`}  // More unique key
                      to={link.href}
                      className={cn(
                        "flex items-center py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                        isCollapsed ? "justify-center" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}>
                        {link.icon}
                      </div>
                      {!isCollapsed && (
                        <span className="ml-3">{link.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </CollapsibleContent>
          </div>
        </nav>
      </Collapsible>
    </aside>
  );
};
