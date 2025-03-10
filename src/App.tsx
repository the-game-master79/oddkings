import { BrowserRouter as Router, Routes, Route, RouterProvider, createBrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthForm } from "@/components/auth/AuthForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import Sports from "@/pages/Sports";
import SportQuestions from "@/pages/sports/Questions";
import SportMatchDetails from "@/pages/SportMatchDetails";
import NotFound from "@/pages/NotFound";
import Transactions from "@/pages/transactions/Index";
import TradeHistory from "@/pages/trades/History";
import Withdraw from "@/pages/Withdraw";
import Affiliates from "@/pages/Affiliates";
import { AuthCallback } from "@/components/auth/AuthCallback";
import { TradeBuilderProvider } from "@/context/TradeBuilderContext";
import TradeBuilderPage from "@/pages/trade-builder/Index";
import Casino from "@/pages/casino/Index";
import { Plinko } from "@/pages/casino/games/Plinko";
import Mines from "@/pages/casino/games/mines";
import { AdminGuard } from '@/components/auth/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout'
import { Toaster } from "sonner";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import { Crash } from "@/pages/casino/games/Crash";

// Create router with future flag
const router = createBrowserRouter([
  { path: "/auth", element: <AuthForm /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "profile", element: <Profile /> },
      {
        path: "sports",
        children: [
          { index: true, element: <Sports /> },
          { path: ":eventId/:matchId", element: <SportMatchDetails /> },
          { path: ":eventId/:matchId/questions", element: <SportQuestions /> },
        ],
      },
      {
        path: "casino",
        children: [
          { index: true, element: <Casino /> },
          { path: "plinko", element: <Plinko /> },
          { path: "mines", element: <Mines /> },
          { path: "crash", element: <Crash /> },
        ],
      },
      { path: "transactions", element: <Transactions /> },
      { path: "trades/history", element: <TradeHistory /> },
      { path: "withdraw", element: <Withdraw /> },
      { path: "affiliates", element: <Affiliates /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "/trade-builder", element: <TradeBuilderPage /> },
  {
    path: "/admin",
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      // ...your admin routes...
    ]
  }
], {
  future: {},
});

function App() {
  return (
    <>
      <TradeBuilderProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <RouterProvider router={router} />
        </ThemeProvider>
      </TradeBuilderProvider>
      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;
