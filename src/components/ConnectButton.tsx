import React from 'react';
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWallet } from '../contexts/WalletProvider';

export const ConnectButton: React.FC = () => {
  const { account, isConnected, connect } = useWallet();

  if (isConnected && account) {
    // Show connected wallet address
    const shortAddress = `${account.substring(0, 6)}...${account.substring(38)}`;
    return (
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
        <span className="text-sm font-mono text-foreground">{shortAddress}</span>
      </div>
    );
  }

  return (
    <Button
      onClick={connect}
      className="bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-glow-cyan font-semibold"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
};
