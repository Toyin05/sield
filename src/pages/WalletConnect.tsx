import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Wallet, AlertCircle, CheckCircle, Smartphone, Monitor } from "lucide-react";
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

  const handleWalletConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('[wallet-connect] WalletConnect failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/95 via-primary/80 to-secondary/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-card/20 backdrop-blur-sm border border-secondary/30 rounded-3xl mb-6">
            <Shield className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-3">Connect Your Wallet</h1>
          <p className="text-lg text-primary-foreground/90 max-w-sm mx-auto">
            Securely connect your wallet to access Sield's blockchain-powered document management platform
          </p>
        </div>

        {/* Connection Card */}
        <Card className="p-8 bg-card/95 backdrop-blur-sm border-secondary/20 shadow-2xl">
          <div className="space-y-6">
            {/* Supported Platforms */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-6">Choose Your Connection Method</h2>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                    <Monitor className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-green-800">Desktop MetaMask</p>
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto mt-2" />
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-blue-800">MetaMask Mobile</p>
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto mt-2" />
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
                    <Wallet className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-purple-800">WalletConnect</p>
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto mt-2" />
                </div>
              </div>
            </div>

            {/* Connection Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleMetaMaskConnect}
                disabled={isConnecting || isLoading}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-glow-cyan py-4 text-lg font-semibold"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin mr-3" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Monitor className="w-5 h-5 mr-3" />
                    Connect with MetaMask
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-secondary/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground font-medium">or</span>
                </div>
              </div>

              <Button
                onClick={handleWalletConnect}
                disabled={isConnecting || isLoading}
                variant="outline"
                className="w-full border-secondary/50 hover:bg-secondary/10 hover:border-secondary/70 py-4 text-lg font-semibold"
                size="lg"
              >
                <Wallet className="w-5 h-5 mr-3" />
                Connect with WalletConnect
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* Info */}
            <div className="text-sm text-muted-foreground space-y-2 bg-secondary/5 p-4 rounded-lg">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Your wallet connection is secure and encrypted
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No personal data is stored on our servers
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                You can disconnect at any time
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-base text-primary-foreground/80">
            New to Web3?{" "}
            <a
              href="https://metamask.io/download.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-secondary/80 underline font-medium"
            >
              Download MetaMask
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;

