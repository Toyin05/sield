import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertCircle,
  CheckCircle,
  Smartphone,
  Monitor,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useWallet } from "@/contexts/WalletProvider";
import { useNavigate } from "react-router-dom";

const WalletConnect: React.FC = () => {
  const { connect, isConnected, isConnecting, error, account, isLoading } = useWallet();
  const navigate = useNavigate();

  console.log('[wallet-connect] component rendering, isConnected:', isConnected, 'isLoading:', isLoading, 'account:', account);

  // Redirect to dashboard only after successful connection (not on initial load)
  useEffect(() => {
    console.log('[wallet-connect] useEffect check - isConnected:', isConnected, 'account:', account);
    if (isConnected && account) {
      console.info('[wallet-connect] connection successful, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isConnected, account, navigate]);

  const handleMetaMaskConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('[wallet-connect] MetaMask connection failed:', err);
    }
  };

  const handleEmailAuth = () => {
    navigate("/auth?mode=login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/95 via-primary/80 to-secondary/70 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNiI+PHBhdGggZD0iTTQwIDQwYzQuNDE4IDAgOC0zLjU4MiA4LThzLTMuNTgyLTgtOC04LTggMy41ODItOCA4IDMuNTgyIDggMCA4em0wLTIyYzcuNzMyIDAgMTQgNi4yNjggMTQgMTRzLTYuMjY4IDE0LTE0IDE0LTE0LTYuMjY4LTE0LTE0IDYuMjY4LTE0IDE0LTE0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <div className="relative z-10 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-7xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-12 mt-4 sm:mt-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-card/20 backdrop-blur-sm border border-secondary/30 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
            </div>
            <div className="inline-flex items-center gap-2 bg-card/10 backdrop-blur-sm border border-secondary/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-5 mx-2 sm:mx-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
              <span className="text-xs sm:text-sm text-primary-foreground font-medium">
                Choose your preferred authentication method
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-3 px-2">
              Access <span className="text-secondary">Sield</span>
            </h1>
            <p className="text-base sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto px-4 sm:px-0 leading-relaxed">
              Secure access to your documents through blockchain verification or traditional email authentication.
              Both methods provide enterprise-grade security and seamless access to your dashboard.
            </p>
          </div>

          {/* Main Card */}
          <Card className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-card/95 backdrop-blur-sm border-secondary/20 shadow-2xl mx-1.5 sm:mx-0">
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
              {/* Wallet column */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                  <div className="mb-3 sm:mb-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Web3 Wallet Access</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                      Ideal for blockchain-based verification and audit trail functionality.
                    </p>
                  </div>
                  <div className="flex sm:hidden items-center gap-2 text-xs text-muted-foreground self-start">
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    Secure by design
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    Secure by design
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2.5 sm:p-4 rounded-xl bg-green-50 border border-green-200">
                    <div className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 bg-green-100 rounded-full mb-2 sm:mb-3">
                      <Monitor className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-700" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-green-900 leading-tight">Desktop MetaMask</p>
                    <p className="text-xs text-green-800/80 mt-0.5 sm:mt-1">Browser extension</p>
                  </div>
                  <div className="p-2.5 sm:p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 bg-blue-100 rounded-full mb-2 sm:mb-3">
                      <Smartphone className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-700" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-blue-900 leading-tight">MetaMask Mobile</p>
                    <p className="text-xs text-blue-800/80 mt-0.5 sm:mt-1">In-app browser</p>
                  </div>
                </div>

                <Button
                  onClick={handleMetaMaskConnect}
                  disabled={isConnecting || isLoading}
                  className="w-full bg-secondary hover:bg-secondary/85 text-secondary-foreground shadow-glow-cyan py-2.5 sm:py-4 px-3 sm:px-4 text-sm sm:text-base lg:text-lg font-semibold transition-all duration-200"
                  size="lg"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin mr-2 flex-shrink-0" />
                      <span className="truncate">Connecting Wallet...</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="truncate">Connect MetaMask Wallet</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 ml-2 flex-shrink-0" />
                    </>
                  )}
                </Button>
              </div>

              {/* Email column */}
              <div className="lg:border-l lg:border-border lg:pl-6 xl:pl-8">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Email Authentication</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Perfect for traditional workflows and team collaboration.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/5 to-accent/5 mb-4 sm:mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm sm:text-base">Secure login</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                        Enterprise-grade email/password authentication with advanced security protocols.
                      </p>
                      <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                          No wallet setup required
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                          Web3 integration available anytime
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                          Encrypted session management
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative my-4 sm:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 sm:px-4 bg-card text-muted-foreground font-medium">or</span>
                  </div>
                </div>

                <Button
                  onClick={handleEmailAuth}
                  disabled={isConnecting || isLoading}
                  className="w-full bg-secondary hover:bg-secondary/85 text-secondary-foreground shadow-glow-cyan py-2.5 sm:py-4 px-3 sm:px-4 text-sm sm:text-base lg:text-lg font-semibold transition-all duration-200"
                  size="lg"
                >
                  <Mail className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="truncate">Continue with Email & Password</span>
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 sm:mt-8 flex items-start gap-3 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* Trust / info */}
            <div className="mt-6 sm:mt-8 grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-lg bg-muted/40 border border-border">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">Wallet connection is secure and encrypted</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-lg bg-muted/40 border border-border">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">No personal data stored on our servers</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-lg bg-muted/40 border border-border sm:col-span-2 lg:col-span-1">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">Disconnect at any time</span>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 sm:mt-8 pb-6 sm:pb-8 lg:pb-10 px-4">
            <p className="text-sm sm:text-base text-primary-foreground/80 leading-relaxed">
              New to Web3?{" "}
              <a
                href="https://metamask.io/download.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-secondary/80 underline font-medium transition-colors"
              >
                Download MetaMask
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
