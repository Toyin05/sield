import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useWallet } from '../contexts/WalletProvider';

export const DisconnectButton: React.FC = () => {
  const { disconnect } = useWallet();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={disconnect}
      className="text-destructive hover:text-destructive"
    >
      <LogOut className="w-4 h-4 mr-1" />
      Disconnect
    </Button>
  );
};