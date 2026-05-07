import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useWallet } from "@/contexts/WalletProvider";
import { useAuth } from "@/contexts/AuthProvider";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isConnected, isLoading: walletLoading } = useWallet();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (walletLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth?mode=login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <>{children}</>;
}

