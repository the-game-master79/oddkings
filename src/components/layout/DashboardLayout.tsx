import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";
import { Toaster } from "@/components/ui/sonner";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTradeBuilderWidth } from "@/hooks/useTradeBuilderWidth";

export const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const tradeBuilderWidth = useTradeBuilderWidth();

  // Check if current page is NotFound (404) page
  const isNotFoundPage = location.pathname === "*";

  // Subscribe to sidebar collapsed state changes using custom event
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    // Add event listener for sidebar toggle
    window.addEventListener('sidebar-toggle' as any, handleSidebarToggle as any);

    // Check for storage preference
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      setSidebarCollapsed(savedState === 'true');
    }
    
    // Auto-collapse sidebar on mobile
    if (isMobile) {
      setSidebarCollapsed(true);
    }

    return () => {
      window.removeEventListener('sidebar-toggle' as any, handleSidebarToggle as any);
    };
  }, [isMobile]);

  // For all pages, use the same layout structure but conditionally apply AuthGuard
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AuthGuard>
        <Navbar />
        <div className="flex flex-1 relative overflow-hidden">
          <div className="hidden md:block z-20">
            <Sidebar collapsed={sidebarCollapsed} />
          </div>
          <main 
            className={`flex-1 pt-16 transition-all duration-300 flex flex-col overflow-auto
              ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}
            style={{
              paddingRight: isMobile ? 0 : `${tradeBuilderWidth}px`
            }}
          >
            <div className="flex-1 w-full px-2 py-2 relative z-10 md:container md:mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background">
          <MobileNavigation />
        </div>
        <Toaster />
        <ScrollToTop />
      </AuthGuard>
    </div>
  );
};
