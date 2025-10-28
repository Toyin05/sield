import React from 'react';
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWallet } from '../contexts/WalletContext';

export const ConnectButton: React.FC = () => {
  const { walletAddress, isConnected, connectWallet } = useWallet();

  if (isConnected && walletAddress) {
    // Show connected wallet address
    const shortAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
    return (
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
        <span className="text-sm font-mono text-foreground">{shortAddress}</span>
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-glow-cyan"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
};