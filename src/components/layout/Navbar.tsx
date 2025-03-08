import { Wallet, MessageCircleQuestion, Download, Upload, Users, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { WalletModal } from "@/components/wallet/WalletModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/common/Logo";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userInitials, setUserInitials] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setUserId(session.user.id);
        fetchBalance(session.user.id);
        
        // Set initials from email
        if (session.user.email) {
          setUserInitials(session.user.email.charAt(0).toUpperCase());
        }
      } else {
        setUserId(null);
        setBalance(0);
        setUserInitials('');
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) {
        setUserId(session.user.id);
        fetchBalance(session.user.id);
        
        // Set initials from email
        if (session.user.email) {
          setUserInitials(session.user.email.charAt(0).toUpperCase());
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refetch balance periodically
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      fetchBalance(userId);
    }, 30000); // Refetch every 30 seconds
    
    return () => clearInterval(interval);
  }, [userId]);

  const fetchBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('total_usd_value')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error("Error fetching balance:", error);
        return;
      }

      if (data) {
        setBalance(data.total_usd_value || 0);
      } else {
        console.log("No balance data found for user:", userId);
        setBalance(0);
      }
    } catch (error) {
      console.error("Exception fetching balance:", error);
    }
  };

  const handleWalletClick = () => {
    if (!isAuthenticated) {
      toast.error("Please Sign Up / Log In first");
      navigate('/auth');
      return;
    }
    setWalletModalOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast.success('Logged out successfully');
    setSheetOpen(false);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setSheetOpen(false); // Close the sheet after clicking a menu item
  };

  // Safely get formatted balance with fallback
  const formattedBalance = typeof balance === 'number' ? balance.toFixed(2) : '0.00';

  const menuItems = [
    { label: "Profile", icon: <Users className="mr-2 h-4 w-4 text-primary" />, onClick: () => navigate("/profile") },
    { label: "Transactions", icon: <Download className="mr-2 h-4 w-4 text-primary" />, onClick: () => navigate("/transactions") },
    { label: "History", icon: <MessageCircleQuestion className="mr-2 h-4 w-4 text-primary" />, onClick: () => navigate("/trades/history") },
    { label: "Withdraw", icon: <Upload className="mr-2 h-4 w-4 text-primary" />, onClick: () => navigate("/withdraw") },
    { label: "Affiliates", icon: <Users className="mr-2 h-4 w-4 text-primary" />, onClick: () => navigate("/affiliates") },
    { label: "Log Out", icon: <LogOut className="mr-2 h-4 w-4 text-destructive" />, onClick: handleLogout },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass animate-fade-in">
      <div className="flex h-full items-center justify-between px-3 sm:px-6">
        <div className="flex items-center">
          <Logo 
            className="h-6 w-auto sm:h-8 cursor-pointer transition-transform hover:-translate-y-0.5" 
            onClick={() => navigate("/")} 
          />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleWalletClick}
              className="flex items-center gap-2 bg-white/50 border-gray-200 hover:bg-white transition-all duration-200 md:hidden"
            >
              <Wallet className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">${formattedBalance}</span>
            </Button>
          )}

          {/* Mobile menu button */}
          <div className="block md:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] max-w-xs p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold">Menu</h2>
                  </div>
                  <div className="p-4 space-y-3 flex-1">
                    {isAuthenticated ? (
                      <div className="space-y-1">
                        {menuItems.map((item) => (
                          <Button
                            key={item.label}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleMenuItemClick(item.onClick)}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-violet-600 hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-300"
                        onClick={() => {
                          navigate("/auth");
                          setSheetOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {isAuthenticated && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleWalletClick}
                className="hidden md:flex items-center gap-2 bg-white/50 border-gray-200 hover:bg-white transition-all duration-200"
              >
                <Wallet className="h-4 w-4 text-primary" />
                <span className="font-semibold">${formattedBalance}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden md:flex">
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-all duration-200 hover:ring-primary/50">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">{userInitials || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border border-gray-100 shadow-elegant animate-scale-in">
                  {menuItems.map((item) => (
                    <DropdownMenuItem 
                      key={item.label}
                      onClick={item.onClick} 
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer py-2"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          
          {!isAuthenticated && (
            <Button 
              size="sm" 
              onClick={() => navigate("/auth")}
              className="hidden md:flex bg-gradient-to-r from-primary to-violet-600 hover:from-violet-600 hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>
      <WalletModal 
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
      />
    </nav>
  );
};
