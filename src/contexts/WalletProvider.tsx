import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { BLOCKDAG_CHAIN } from '@/lib/chains'

// Get project ID from environment
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.error('[wallet] VITE_WALLETCONNECT_PROJECT_ID is missing - Web3Modal will not work')
}

// Web3Modal configuration
const metadata = {
  name: 'Sield',
  description: 'Secure Legal Document Management on BlockDAG',
  url: 'https://sield-seven.vercel.app',
  icons: ['https://sield-seven.vercel.app/favicon.ico']
}

const ethersConfig = defaultConfig({
  metadata,
  defaultChainId: BLOCKDAG_CHAIN.id,
  rpcUrl: BLOCKDAG_CHAIN.rpcUrls.default.http[0]
})

// Create Web3Modal instance
let web3Modal: any = null
if (projectId) {
  web3Modal = createWeb3Modal({
    ethersConfig,
    chains: [BLOCKDAG_CHAIN],
    projectId,
    enableAnalytics: false
  })
}

interface WalletContextType {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  account: string | null
  chainId: number | null
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  isConnected: boolean
  isConnecting: boolean
  isLoading: boolean
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Safe event binding helper for Ethers v6 compatibility
  function attachProviderListener(rawProvider: any, event: string, handler: (...args: any[]) => void) {
    if (!rawProvider || typeof handler !== 'function') {
      console.warn('[wallet] invalid provider or handler for event:', event)
      return false
    }

    try {
      // For MetaMask and other injected wallets, listen directly on the injected provider
      // The injected provider is typically available as rawProvider.provider or rawProvider itself
      const injectedProvider = rawProvider.provider ?? rawProvider._provider ?? rawProvider
      
      if (injectedProvider && typeof injectedProvider.on === 'function') {
        // Ensure we only use supported events for the provider type
        const supportedEvents = ['accountsChanged', 'chainChanged', 'disconnect', 'connect']
        if (!supportedEvents.includes(event)) {
          console.warn('[wallet] unsupported event type:', event)
          return false
        }
        
        injectedProvider.on(event, handler)
        return () => {
          try {
            if (typeof injectedProvider.removeListener === 'function') {
              injectedProvider.removeListener(event, handler)
            } else if (typeof injectedProvider.off === 'function') {
              injectedProvider.off(event, handler)
            }
          } catch (detachErr) {
            console.warn('[wallet] failed to detach listener for', event, detachErr)
          }
        }
      }

      console.warn('[wallet] provider does not support event listeners for', event, rawProvider)
      return false
    } catch (err) {
      console.error('[wallet] failed to attach listener for', event, err)
      return false
    }
  }

  // Initialize provider and check for existing connections
  useEffect(() => {
    const initProvider = async () => {
      try {
        console.info('[wallet] initializing provider')

        // Check if there's an injected provider (MetaMask)
        if (typeof window !== 'undefined' && (window as any).ethereum && (window as any).ethereum.request) {
          console.info('[wallet] found injected provider')
          const web3Provider = new ethers.BrowserProvider((window as any).ethereum)
          setProvider(web3Provider)

          // Check if already connected
          const accounts = await web3Provider.listAccounts()
          if (accounts.length > 0) {
            console.info('[wallet] found existing connection', accounts[0].address)
            const network = await web3Provider.getNetwork()
            const signer = await web3Provider.getSigner()

            setAccount(accounts[0].address)
            setChainId(Number(network.chainId))
            setSigner(signer)
            setIsConnected(true)
            console.log('[wallet] set isConnected to true - existing connection found')
          } else {
            console.info('[wallet] injected provider present but no accounts connected')
            console.log('[wallet] set isConnected to false - no accounts connected')
            setIsConnected(false)
          }
        } else {
          console.info('[wallet] no injected provider detected')
          console.log('[wallet] set isConnected to false - no provider detected')
          setIsConnected(false)
        }
      } catch (err) {
        console.error('[wallet] failed to initialize provider:', err)
        console.log('[wallet] set isConnected to false - initialization error')
        setIsConnected(false)
      } finally {
        setIsLoading(false)
        console.log('[wallet] initialization complete, isLoading set to false')
      }
    }

    initProvider()
  }, [])

  // Attach event listeners when provider changes
  useEffect(() => {
    if (!provider) return

    console.info('[wallet] attaching event listeners')

    // Try to get the underlying injected provider for event listening
    // This works for MetaMask and other injected wallets
    const injectedProvider = (provider as any)?.provider ?? (provider as any)?._provider ?? null

    const handleAccountsChanged = (accounts: string[] | string) => {
      console.info('[wallet] accounts changed', accounts)
      const accs = Array.isArray(accounts) ? accounts : [accounts]
      if (!accs || accs.length === 0) {
        disconnect()
      } else {
        setAccount(accs[0])
      }
    }

    const handleChainChanged = (chainId: number | string) => {
      console.info('[wallet] chain changed', chainId)
      const id = typeof chainId === 'string' && chainId.startsWith('0x')
        ? parseInt(chainId, 16)
        : Number(chainId)
      setChainId(id)
      // Note: MetaMask requires page reload on chain change
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }

    const handleDisconnect = (error: unknown) => {
      console.warn('[wallet] provider disconnected', error)
      disconnect()
    }

    // Only attach listeners if we have an injected provider
    // Web3Modal handles its own event management
    const detachFunctions: (() => void)[] = []
    
    if (injectedProvider) {
      const detachAccounts = attachProviderListener(injectedProvider, 'accountsChanged', handleAccountsChanged)
      const detachChain = attachProviderListener(injectedProvider, 'chainChanged', handleChainChanged)
      const detachDisconnect = attachProviderListener(injectedProvider, 'disconnect', handleDisconnect)
      
      if (detachAccounts) detachFunctions.push(detachAccounts)
      if (detachChain) detachFunctions.push(detachChain)
      if (detachDisconnect) detachFunctions.push(detachDisconnect)
    } else {
      console.info('[wallet] no injected provider found for event listening')
    }

    return () => {
      console.info('[wallet] detaching event listeners')
      detachFunctions.forEach(detach => {
        try {
          detach()
        } catch (err) {
          console.warn('[wallet] failed to detach listener', err)
        }
      })
    }
  }, [provider])

  const connect = async () => {
    try {
      setIsConnecting(true)
      setError(null)

      // Check for injected provider first (desktop MetaMask, mobile in-app browser)
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        console.info('[wallet] attempting injected provider connection')
        try {
          const injectedProvider = new ethers.BrowserProvider((window as any).ethereum)
          const accounts = await injectedProvider.send('eth_requestAccounts', [])
          const network = await injectedProvider.getNetwork()
          const signer = await injectedProvider.getSigner()

          setAccount(accounts[0])
          setChainId(Number(network.chainId))
          setProvider(injectedProvider)
          setSigner(signer)
          setIsConnected(true)

          console.info('[wallet] connected via injected provider', accounts[0])
          return
        } catch (injectedError: any) {
          console.warn('[wallet] injected provider failed, falling back to Web3Modal', injectedError)
          // Continue to Web3Modal fallback
        }
      }

      // Fallback to Web3Modal for WalletConnect (mobile browsers, other wallets)
      if (!web3Modal) {
        console.error('[wallet] Web3Modal not initialized - missing project ID')
        setError('Wallet connection not configured. Please check environment variables.')
        return
      }

      console.info('[wallet] opening Web3Modal')
      try {
        await web3Modal.open()
        console.info('[wallet] Web3Modal opened successfully')
      } catch (modalError: any) {
        console.error('[wallet] failed to open Web3Modal', modalError)
        setError('Failed to open wallet connection modal')
        return
      }

    } catch (err: any) {
      console.error('[wallet] connection failed:', err)
      if (err.code === 4001) {
        setError('Connection rejected by user')
      } else if (err.message?.includes('timeout')) {
        setError('Connection timed out. Please try again.')
      } else {
        setError('Failed to connect wallet. Please try again.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      console.info('[wallet] disconnecting')
      setAccount(null)
      setChainId(null)
      setProvider(null)
      setSigner(null)
      setIsConnected(false)
      setError(null)

      // Disconnect from Web3Modal if using it
      if (web3Modal) {
        await web3Modal.disconnect()
      }
    } catch (err) {
      console.error('[wallet] disconnect failed:', err)
    }
  }

  // Handle Web3Modal events
  useEffect(() => {
    if (!web3Modal) return

    const handleConnect = (event: any) => {
      console.info('[wallet] Web3Modal connected', event)
      // Web3Modal handles the provider setup internally
      // We need to get the connected account and update our state
      if (event.detail?.address) {
        setAccount(event.detail.address)
        setIsConnected(true)
      }
    }

    const handleDisconnect = () => {
      console.info('[wallet] Web3Modal disconnected')
      disconnect()
    }

    const handleError = (error: any) => {
      console.error('[wallet] Web3Modal error', error)
      setError('Wallet connection error')
    }

    web3Modal.subscribeEvents({
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onError: handleError
    })

    return () => {
      // Web3Modal handles cleanup internally
    }
  }, [])

  const value: WalletContextType = {
    connect,
    disconnect,
    account,
    chainId,
    provider,
    signer,
    isConnected,
    isConnecting,
    isLoading,
    error
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

