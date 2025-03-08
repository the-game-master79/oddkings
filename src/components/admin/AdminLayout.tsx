import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/context/admin/AdminAuthContext';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { logout, isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Add pathname check to prevent infinite redirects
    if (!isLoading && !isAuthenticated && location.pathname !== '/admin/auth') {
      navigate('/admin/auth', { 
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [isLoading, isAuthenticated, navigate, location]);

  // Prevent flash of unauthorized content
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex space-x-8">
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `${isActive ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `${isActive ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`
                }
              >
                Manage Users
              </NavLink>
              <NavLink
                to="/admin/questions"
                className={({ isActive }) =>
                  `${isActive ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`
                }
              >
                Manage News
              </NavLink>
              <NavLink
                to="/admin/sports"
                className={({ isActive }) =>
                  `${isActive ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`
                }
              >
                Manage Sports
              </NavLink>
              <NavLink
                to="/admin/deposits"
                className={({ isActive }) =>
                  `${isActive ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`
                }
              >
                Manage Deposits
              </NavLink>
              <NavLink
                to="/admin/withdrawals"
                className={({ isActive }) =>
                  `${isActive ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`
                }
              >
                Manage Withdrawals
              </NavLink>
            </div>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
