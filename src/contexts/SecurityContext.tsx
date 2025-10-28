import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface SecurityContextType {
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) throw new Error("useSecurity must be used within a SecurityProvider");
  return context;
};

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Add startup console log to confirm provider attachment
  useEffect(() => {
    console.log("✅ SecurityProvider context attached successfully");
  }, []);

  // Handle account changes from MetaMask
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected from MetaMask
      disconnectWallet();
    } else if (accounts[0] !== walletAddress) {
      // Account switched
      setWalletAddress(accounts[0]);
    }
  }, [walletAddress]);

  // Check for existing connection on mount (read-only, no popup)
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            // Register listener for account changes
            window.ethereum.on("accountsChanged", handleAccountsChanged);
          }
        }
      } catch (error) {
        console.warn("Error checking existing connection:", error);
      }
    };

    checkExistingConnection();

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [handleAccountsChanged]);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: "MetaMask Required",
          description: "Please install MetaMask extension or open this page in MetaMask mobile app.",
          variant: "destructive",
        });
        return;
      }

      // Force popup by calling eth_requestAccounts on user click
      const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        setIsConnected(true);

        // Register listener for account changes
        window.ethereum.on("accountsChanged", handleAccountsChanged);

        // Show success toast
        const shortAddress = `${address.substring(0, 6)}...${address.substring(38)}`;
        toast({
          title: "Wallet Connected",
          description: `Connected to ${shortAddress}`,
        });

        // Navigate to dashboard
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.warn("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to MetaMask. Please try again.",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = useCallback(() => {
    // Remove listener
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    }

    // Clear state
    setWalletAddress(null);
    setIsConnected(false);

    // Clear any stored wallet data
    localStorage.removeItem("wallet-address");
    sessionStorage.removeItem("wallet-session");

    // Show disconnect toast
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });

    // Navigate to home
    navigate("/");
  }, [handleAccountsChanged, navigate, toast]);

  const value: SecurityContextType = {
    isConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
