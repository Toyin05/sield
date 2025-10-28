import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useWallet } from '../contexts/WalletContext';

export const DisconnectButton: React.FC = () => {
  const { disconnectWallet } = useWallet();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={disconnectWallet}
      className="text-destructive hover:text-destructive"
    >
      <LogOut className="w-4 h-4 mr-1" />
      Disconnect
    </Button>
  );
};