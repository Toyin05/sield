export const BLOCKDAG_CHAIN = {
  id: Number(import.meta.env.VITE_BLOCKDAG_CHAIN_ID || 2025),
  name: 'BlockDAG Testnet',
  network: 'blockdag',
  nativeCurrency: { name: 'BDG', symbol: 'BDG', decimals: 18 },
  rpcUrls: { default: { http: [import.meta.env.VITE_BLOCKDAG_RPC_URL || 'https://rpc.blockdag.network'] } },
  blockExplorers: { default: { name: 'BlockDAG Explorer', url: 'https://explorer.blockdag.network' } },
  testnet: true,
  // Add missing properties for Web3Modal compatibility
  rpcUrl: import.meta.env.VITE_BLOCKDAG_RPC_URL || 'https://rpc.blockdag.network',
  explorerUrl: 'https://explorer.blockdag.network',
  currency: 'BDG',
  chainId: Number(import.meta.env.VITE_BLOCKDAG_CHAIN_ID || 2025)
}