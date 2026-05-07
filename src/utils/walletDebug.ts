// Debug utilities for wallet connection (development only)
export const getWalletDebugInfo = () => {
  if (typeof window === 'undefined') return null

  const ethereum = (window as any).ethereum
  const hasInjected = !!(ethereum && ethereum.request)
  const isMetaMask = !!(ethereum && ethereum.isMetaMask)
  const chainId = ethereum ? ethereum.chainId : null
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

  return {
    hasInjectedProvider: hasInjected,
    isMetaMask,
    injectedChainId: chainId,
    projectIdConfigured: !!projectId,
    projectId: projectId,
    userAgent: navigator.userAgent,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
}

export const logWalletDebugInfo = () => {
  const info = getWalletDebugInfo()
  console.info('[wallet-debug] Environment info:', info)
  return info
}