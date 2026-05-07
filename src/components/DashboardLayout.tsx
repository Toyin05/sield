import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Upload, Shield, FileText, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Only use auth context - wallet connection is no longer required
  const { isAuthenticated, isLoading: authLoading, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: "/dashboard", label: "Overview", icon: Home },
    { path: "/upload", label: "Upload", icon: Upload },
    { path: "/access-control", label: "Access Control", icon: Shield },
    { path: "/audit-log", label: "Audit Log", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 h-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4 lg:gap-8">
              <button
                onClick={() => navigate("/")}
                className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary hover:text-secondary/80 transition-colors"
              >
                Sield
              </button>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-secondary/10 text-secondary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden xl:inline">{item.label}</span>
                      <span className="xl:hidden text-sm">{item.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Desktop Auth Controls */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-3">
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    title={user?.email ?? "Signed in"}
                    className="whitespace-nowrap min-w-max px-3"
                  >
                    <span className="truncate max-w-32">{user?.email}</span>
                    <span className="ml-2">Sign out</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Tablet/Mobile Menu Button */}
            <button
              className="lg:hidden text-foreground p-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-slide-in">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-secondary/10 text-secondary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-base">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-secondary">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.email || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">Authenticated</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-shrink-0"
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {authLoading ? (
          <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
            <div className="text-center space-y-4 p-4">
              <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : !isAuthenticated ? (
          <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
            <div className="text-center space-y-4 p-4 max-w-sm mx-auto">
              <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-secondary mx-auto" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Authentication Required</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Please sign in to access your secure document management dashboard.
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => navigate("/auth?mode=login")}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
