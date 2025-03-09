import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Newspaper,
  Gamepad2,
  Trophy,
  Wallet,
  Download,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  onLogout: () => void;
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  // Initialize from localStorage or default to false
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
    { icon: <Newspaper size={20} />, label: 'News', path: '/admin/questions' },
    { icon: <Gamepad2 size={20} />, label: 'Casino', path: '/admin/casino' },
    { icon: <Trophy size={20} />, label: 'Sports', path: '/admin/sports' },
    { icon: <Wallet size={20} />, label: 'Deposits', path: '/admin/deposits' },
    { icon: <Download size={20} />, label: 'Withdrawals', path: '/admin/withdrawals' }
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-background border-r transition-all duration-300 select-none",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center px-3 border-b">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="oddKINGS" 
                className="h-8 w-8"
              />
              <span className="font-bold text-lg">oddKINGS</span>
            </div>
          ) : (
            <img 
              src="/logo.png" 
              alt="oddKINGS" 
              className="h-8 w-8"
            />
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted",
                isCollapsed && "justify-center",
                "whitespace-nowrap"
              )}
            >
              <div className={cn(
                "min-w-[20px] transition-all",
                !isCollapsed && "mr-2"
              )}>
                {item.icon}
              </div>
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive",
              isCollapsed && "justify-center"
            )}
            onClick={onLogout}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
