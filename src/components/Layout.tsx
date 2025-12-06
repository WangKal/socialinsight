import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  History,
  Settings,
  CreditCard,
  TrendingUp,
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  ChevronDown,
  Bell,
  MessageCircle,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import {getUserProfile, getCredits} from "@/services/socialEcho"

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
{ name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Messages", href: "/messages", icon: MessageCircle},
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Mock auth state - replace with real auth later


export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("")
  const [credits, setCredits] =useState(0)
  const {user,signIn,signOut} = useAuth();

  const handleLogout = () => {

    // Handle logout logic
    signOut();
    navigate("/")
  };
  useEffect(() => {
    if (!user?.id) return;

    const loadUserInfo = async () => {
      try {
        const data = await getUserInfo(user.id);
        setUserName(data.full_name);
      } catch (error) {
        
      }
    };

    loadUserInfo();
  }, [user]);

    useEffect(() => {
    if (!user?.id) return;

    const loadUserInfo = async () => {
      try {
        const result = await getCredits(user.id);
        console.log(result.data)
        setCredits(result.data);
      } catch (error) {
        
      }
    };

    loadUserInfo();
  }, [user]);
  const NavLinks = ({ mobile = false, onLinkClick }: { mobile?: boolean; onLinkClick?: () => void }) => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              mobile && "text-base"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  const AccountSection = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("border-t border-border", mobile ? "pt-4 mt-4" : "p-4")}>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left",
              mobile && "text-base"
            )}>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          to="/auth"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            mobile && "text-base justify-center"
          )}
        >
          <LogIn className="w-5 h-5" />
          <span>Sign In / Sign Up</span>
        </Link>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">SocialInsight</h1>
              <p className="text-xs text-muted-foreground">Analytics Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-border">
          <div className="px-4 py-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Credits Remaining</p>
            <p className="text-2xl font-bold text-foreground">{credits.remaining_credits}</p>
          </div>
        </div>

        <AccountSection />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">SocialInsight</h1>
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-8 h-8 text-primary" />
                    <div>
                      <h1 className="text-xl font-bold text-foreground">Analytics</h1>
                      <p className="text-xs text-muted-foreground">Insight Platform</p>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                  <NavLinks mobile onLinkClick={() => setMobileMenuOpen(false)} />
                </nav>

                <div className="p-4 border-t border-border">
                  <div className="px-4 py-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Credits Remaining</p>
                    <p className="text-2xl font-bold text-foreground">{credits.remaining_credits}</p>
                  </div>
                </div>

                <AccountSection mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:pt-0 pt-16">
        {children}
      </main>
    </div>
  );
}
