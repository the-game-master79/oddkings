import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminLogin from '@/pages/admin/AdminLogin'
import Dashboard from '@/pages/admin/Dashboard'
import Questions from '@/pages/admin/Questions'
import ResolvedQuestions from '@/pages/admin/ResolvedQuestions'
import ResolvedQuestionStats from '@/pages/admin/ResolvedQuestionStats'
import Deposits from '@/pages/admin/Deposits'
import ManageDepositMethods from '@/pages/admin/ManageDepositMethods'
import Users from '@/pages/admin/Users'
import Withdrawals from '@/pages/admin/Withdrawals'
import Promotions from '@/pages/admin/Promotions'
import Sports from '@/pages/admin/Sports'
import Casino from '@/pages/admin/Casino'
import { AdminAuthProvider } from '@/context/admin/AdminAuthContext'
import '@/index.css'

// Utility to check if we're on admin domain/path
const isAdminContext = () => {
  const hostname = window.location.hostname;
  const path = window.location.pathname;
  
  // Check for admin subdomain or specific paths
  return hostname.startsWith('admin.') || 
         hostname === 'localhost' ||
         path.startsWith('/admin');
};

// Configure React Query with better caching and retries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 5000,
      gcTime: 300000, // Changed from cacheTime to gcTime (5 minutes)
    },
  },
});

// Configure Routes with proper admin handling
const router = createBrowserRouter([
  {
    path: "*",
    element: (
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AdminAuthProvider>
            <Outlet />
            <Toaster />
          </AdminAuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    ),
    children: [
      {
        path: "admin/auth",
        element: <AdminLogin />,
      },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            path: "",
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <Dashboard />
          },
          {
            path: 'questions',
            element: <Questions />
          },
          {
            path: 'users',
            element: <Users />
          },
          {
            path: 'deposits',
            element: <Deposits />
          },
          {
            path: 'deposit-methods',
            element: <ManageDepositMethods />
          },
          {
            path: 'withdrawals',
            element: <Withdrawals />
          },
          {
            path: 'sports',
            element: <Sports />
          },
          {
            path: 'casino',
            element: <Casino />
          }
        ],
      },
      {
        path: "*",
        element: <Navigate to="/admin/auth" replace />,
      },
    ],
  },
]);

// Initialize app with proper routing checks
const initializeApp = () => {
  if (!isAdminContext()) {
    window.location.href = '/';
    return;
  }

  const container = document.getElementById('root');
  if (!container) {
    console.error('Root element not found');
    return;
  }

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
};

// Call initialization
initializeApp();
