import React from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDown, Copy, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { useWallet } from '@/contexts/WalletProvider'
import { useToast } from '@/hooks/use-toast'

export const ConnectWallet: React.FC = () => {
  const { connect, disconnect, account, isConnected, isConnecting, error } = useWallet()
  const { toast } = useToast()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account)
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      })
    }
  }

  const openExplorer = () => {
    if (account) {
      window.open(`https://explorer.blockdag.network/address/${account}`, '_blank')
    }
  }

  if (isConnecting) {
    return (
      <Button disabled className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    )
  }

  if (isConnected && account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            {formatAddress(account)}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openExplorer}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnect} className="text-destructive">
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex flex-col items-end">
      <Button
        onClick={connect}
        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        aria-label="Connect Wallet"
      >
        Connect Wallet
      </Button>
      {error && (
        <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}