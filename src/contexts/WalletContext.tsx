import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { requestWalletPopup } from '../lib/provider';

type WalletContextType = {
  walletAddress: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Add startup console log to confirm provider attachment
  useEffect(() => {
    console.log('✅ WalletProvider mounted');
  }, []);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (!accounts || accounts.length === 0) {
      // User disconnected - clear state and redirect
      setWalletAddress(null);
      navigate('/');
    } else {
      // Account switched - update address
      setWalletAddress(accounts[0]);
    }
  }, [navigate]);

  // Replace/connect implementation with user-facing toasts and console logs
  const connectWallet = async () => {
    console.log('connectWallet: invoked from user gesture');
    try {
      const accounts = await requestWalletPopup();
      console.log('connectWallet: requestWalletPopup returned', accounts);

      if (!accounts) {
        console.warn('connectWallet: no accounts returned — likely no provider or user dismissed install flow');
        toast({
          title: 'No Web3 Wallet Found',
          description: 'No MetaMask or injected wallet was detected. Please install MetaMask or use a compatible wallet.',
        });
        return;
      }

      if (accounts && accounts.length > 0) {
        const addr = accounts[0];
        setWalletAddress(addr);

        // Optionally set provider/signer if other parts of app rely on it
        const eth: any = (window as any).ethereum || (window as any).web3?.currentProvider;
        if (eth) {
          try {
            const ethersModule = await import('ethers');
            const BrowserProvider = (ethersModule as any).BrowserProvider || (ethersModule as any).providers?.Web3Provider;
            const provider = new (BrowserProvider as any)(eth);
            setProvider(provider as any);
            const signer = await provider.getSigner();
            setSigner(signer as any);
          } catch (e) {
            console.warn('could not instantiate ethers provider/signer', e);
          }

          // Attach accountsChanged listener so UI updates when user switches accounts
          try {
            if (eth.on) {
              eth.on('accountsChanged', handleAccountsChanged);
            }
          } catch (e) {
            // ignore
          }
        }

        // Show success toast and console message, then navigate to dashboard
        console.log('connectWallet: connected', addr);
        toast({
          title: 'Wallet Connected',
          description: `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`,
        });

        try {
          navigate('/dashboard');
        } catch (e) {
          // ignore navigation errors
        }
      }
    } catch (err: any) {
      // Provide user-friendly toasts for known errors and log all errors to console
      console.error('connectWallet failed', err);

      if (err && err.code === 4001) {
        // EIP-1193 userRejectedRequest
        console.warn('User rejected the connection request');
        toast({
          title: 'Connection Rejected',
          description: 'You cancelled the connection request. Please try again to connect your wallet.',
        });
        return;
      }

      if (err && err.code === -32002) {
        // Request already pending
        console.warn('Connection request already pending');
        toast({
          title: 'Connection Pending',
          description: 'A previous connection request is pending. Please check your MetaMask extension or mobile app and approve the request.',
        });
        // Attempt deep-link fallback for mobile
        try {
          const url = typeof window !== 'undefined' ? window.location.href : '';
          const encoded = encodeURIComponent(url);
          window.open(`https://metamask.app.link/dapp/${encoded}`, '_blank');
        } catch (e) {
          // ignore
        }
        return;
      }

      // Fallback generic error toast
      toast({
        title: 'Connection Error',
        description: err?.message || 'An unknown error occurred while connecting your wallet.',
      });
    }
  };

  const disconnectWallet = useCallback(() => {
    const eth = (window as any).ethereum;
    if (eth?.removeListener) {
      // Remove accountsChanged listener
      eth.removeListener('accountsChanged', handleAccountsChanged);
    }

    // Clear wallet state
    setWalletAddress(null);

    // Clear any stored wallet data
    localStorage.removeItem('wallet-address');
    sessionStorage.removeItem('wallet-session');

    // Show disconnect toast
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });

    // Navigate to home
    navigate('/');
  }, [handleAccountsChanged, navigate, toast]);

  // Listen for custom event dispatched by the provider helper when accounts are returned
  useEffect(() => {
    const handler = (ev: any) => {
      const addr = ev?.detail || (window as any).__sield_last_connected;
      if (addr) {
        setWalletAddress(addr);
      }
    };

    window.addEventListener('sield_wallet_connected', handler as EventListener);
    return () => window.removeEventListener('sield_wallet_connected', handler as EventListener);
  }, []);

  // Optional: Check for already-connected account for UI state only
  // This does NOT suppress the popup - popup still appears on connectWallet() call
  useEffect(() => {
    // Ensure we're in browser environment
    if (typeof window === 'undefined' || !window.ethereum) return;

    const eth = window.ethereum;
    let mounted = true;

    // Use eth_accounts for read-only check (does not trigger popup)
    eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (!mounted) return;
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    }).catch(() => {
      // Silently handle errors for existing connection check
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <WalletContext.Provider value={{
      walletAddress,
      isConnected: !!walletAddress,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
};
