import React from 'react'

export const WalletDebugPanel: React.FC = () => {
  if (!import.meta.env.DEV) return null

  const debugInfo = {
    hasWindow: typeof window !== 'undefined',
    hasEthereum: !!(typeof window !== 'undefined' && (window as any).ethereum),
    ethereumOn: typeof (window as any)?.ethereum?.on,
    ethereumRequest: typeof (window as any)?.ethereum?.request,
    isMetaMask: !!(typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask),
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    chainId: (window as any)?.ethereum?.chainId,
    userAgent: navigator?.userAgent?.substring(0, 50) + '...',
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator?.userAgent || '')
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50 font-mono">
      <h4 className="font-bold mb-2 text-yellow-400">Wallet Debug (DEV)</h4>
      <div className="space-y-1">
        <div>Window: {debugInfo.hasWindow ? '✅' : '❌'}</div>
        <div>Ethereum: {debugInfo.hasEthereum ? '✅' : '❌'}</div>
        <div>.on(): {debugInfo.ethereumOn === 'function' ? '✅' : debugInfo.ethereumOn || '❌'}</div>
        <div>.request(): {debugInfo.ethereumRequest === 'function' ? '✅' : '❌'}</div>
        <div>MetaMask: {debugInfo.isMetaMask ? '✅' : '❌'}</div>
        <div>Chain ID: {debugInfo.chainId || 'none'}</div>
        <div>Project ID: {debugInfo.projectId ? '✅' : '❌'}</div>
        <div>Mobile: {debugInfo.isMobile ? '✅' : '❌'}</div>
        <div className="text-gray-400 mt-2">UA: {debugInfo.userAgent}</div>
      </div>
    </div>
  )
}