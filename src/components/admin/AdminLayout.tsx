import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/context/admin/AdminAuthContext';
import { useEffect } from 'react';
import { AdminSidebar } from './layout/AdminSidebar';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { logout, isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('Redirecting to auth - Not authenticated');
      navigate('/admin/auth', { 
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [isLoading, isAuthenticated, navigate, location.pathname]);

  // Handle path restoration separately
  useEffect(() => {
    const handlePathRestoration = () => {
      const storedPath = sessionStorage.getItem('adminPath');
      if (storedPath && storedPath !== location.pathname) {
        sessionStorage.removeItem('adminPath');
        navigate(storedPath, { replace: true });
      }
    };

    // Only store path when it's a valid admin route
    const storePath = () => {
      if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/auth') {
        sessionStorage.setItem('adminPath', location.pathname);
      }
    };

    handlePathRestoration();
    storePath();
  }, []); // Run only once on mount

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  function cn(...classes: string[]): string {
    return classes.filter(Boolean).join(' ');
  }
  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <AdminSidebar onLogout={logout} />
        <main className={cn(
          "transition-all duration-300 min-h-screen",
          "pl-16 lg:pl-64 pt-4"
        )}>
          <div className="container mx-auto px-4 py-4">
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </ErrorBoundary>
    </div>
  );
}

// Add ErrorBoundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
