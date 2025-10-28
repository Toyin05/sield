import { ReactNode, useState } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { DisconnectButton } from "@/components/DisconnectButton";
import { useNavigate, useLocation } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { Home, Upload, Shield, FileText, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Add defensive guard for missing wallet context
  let wallet;
  try {
    wallet = useWallet();
  } catch (err) {
    // Provider missing - show fallback UI instead of throwing
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-6">
          <Shield className="w-16 h-16 text-secondary mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">App Loading...</h2>
          <p className="text-muted-foreground max-w-md">
            Wallet provider not ready. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  const { isConnected } = wallet;
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
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button 
                onClick={() => navigate("/")}
                className="text-2xl font-bold text-secondary hover:text-secondary/80 transition-colors"
              >
                Sield
              </button>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isActive 
                          ? "bg-secondary/10 text-secondary font-medium" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Desktop Wallet */}
            <div className="hidden md:block">
              <div className="flex items-center gap-3">
                <ConnectButton />
                {isConnected && <DisconnectButton />}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2 animate-slide-in">
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
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                      isActive 
                        ? "bg-secondary/10 text-secondary font-medium" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-4">
                <div className="flex items-center gap-3">
                  <ConnectButton />
                  {isConnected && <DisconnectButton />}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Shield className="w-16 h-16 text-secondary mx-auto" />
              <h2 className="text-2xl font-bold text-foreground">Connect Your Wallet</h2>
              <p className="text-muted-foreground max-w-md">
                Please connect your wallet to access Sield features and manage your documents.
              </p>
              <div className="pt-4">
                <div className="flex items-center gap-3">
                  <ConnectButton />
                  {isConnected && <DisconnectButton />}
                </div>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};
