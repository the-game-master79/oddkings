
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, ChevronLeft, Newspaper, Goal, Calendar, Tag } from "lucide-react";

export const CollapsibleSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  
  const sidebarLinks = [
    {
      title: "News",
      icon: <Newspaper className="h-5 w-5" />,
      href: "/",
    },
    {
      title: "Sports",
      icon: <Goal className="h-5 w-5" />,
      href: "/sports",
    },
    {
      title: "Events",
      icon: <Calendar className="h-5 w-5" />,
      href: "/events",
    },
    {
      title: "Promotions",
      icon: <Tag className="h-5 w-5" />,
      href: "/promotions",
    },
  ];

  return (
    <div className={cn(
      "fixed left-0 top-[60px] bottom-0 z-30 flex flex-col transition-all duration-300 bg-card border-r h-[calc(100vh-60px)]",
      isOpen ? "w-[200px]" : "w-[60px]"
    )}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full h-full flex flex-col">
        <div className="flex items-center justify-end p-2 border-b">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
            >
              {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <div className="flex flex-col p-2 space-y-1 overflow-y-auto">
          <CollapsibleContent forceMount className={cn(
            "overflow-hidden transition-all flex-grow",
            isOpen ? "opacity-100" : "opacity-0 h-0"
          )}>
            {sidebarLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left",
                  location.pathname === link.href && "bg-muted"
                )}
              >
                <Link to={link.href}>
                  <span className="mr-2">{link.icon}</span>
                  {link.title}
                </Link>
              </Button>
            ))}
          </CollapsibleContent>
          
          {/* Icons-only view when collapsed */}
          {!isOpen && (
            <div className="flex flex-col space-y-1">
              {sidebarLinks.map((link) => (
                <Button
                  key={link.href}
                  asChild
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-10 h-10",
                    location.pathname === link.href && "bg-muted"
                  )}
                >
                  <Link to={link.href} title={link.title}>
                    {link.icon}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </Collapsible>
    </div>
  );
};
