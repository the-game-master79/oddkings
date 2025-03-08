import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ADMIN_SESSION_KEY = 'admin_session_verified';

export function useAdminSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      // First check local storage for cached admin session
      if (localStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Verify that the user is still an admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile?.role === 'admin') {
            console.log('Using cached admin session');
            setIsAuthenticated(true);
            setIsLoading(false);
            return true;
          }
        }
      }

      // If no cached session or cache is invalid, check current session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log('No session found, redirecting to auth');
        setIsAuthenticated(false);
        localStorage.removeItem(ADMIN_SESSION_KEY);
        navigate('/', { replace: true });
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.role === 'admin') {
        console.log('Admin profile verified and cached');
        setIsAuthenticated(true);
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        return true;
      } else {
        console.log('Non-admin user, signing out');
        setIsAuthenticated(false);
        localStorage.removeItem(ADMIN_SESSION_KEY);
        await supabase.auth.signOut();
        navigate('/auth', { replace: true });
        toast.error('Access denied: Admin privileges required');
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      localStorage.removeItem(ADMIN_SESSION_KEY);
      navigate('/auth', { replace: true });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading,
    checkAuth
  };
}
