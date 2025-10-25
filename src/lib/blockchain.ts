// Blockchain integration for BlockDAG
import { ethers } from 'ethers';

// BlockDAG Testnet Configuration
const BLOCKDAG_RPC_URL = 'https://rpc.blockdag.network'; // Placeholder - replace with actual BlockDAG RPC
const BLOCKDAG_CHAIN_ID = 2025; // Placeholder - replace with actual BlockDAG chain ID

// Smart Contract ABI (simplified for demo)
const DOCU_VAULT_ABI = [
  "function uploadFile(string cid, string encryptedKey) external",
  "function grantAccess(string cid, address user) external",
  "function revokeAccess(string cid, address user) external",
  "function hasAccess(string cid, address user) external view returns (bool)",
  "function getUserFiles(address owner) external view returns (string[] memory)",
  "event FileUploaded(string indexed cid, address indexed owner)",
  "event AccessGranted(string indexed cid, address indexed owner, address indexed user)",
  "event AccessRevoked(string indexed cid, address indexed owner, address indexed user)"
];

// Contract address (would be deployed on BlockDAG)
const DOCU_VAULT_ADDRESS = '0x1234567890123456789012345678901234567890'; // Placeholder

export class BlockDAGService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    await this.provider.send("eth_requestAccounts", []);
    this.signer = await this.provider.getSigner();

    // Switch to BlockDAG network
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BLOCKDAG_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Network not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${BLOCKDAG_CHAIN_ID.toString(16)}`,
            chainName: 'BlockDAG Testnet',
            nativeCurrency: { name: 'BDAG', symbol: 'BDAG', decimals: 18 },
            rpcUrls: [BLOCKDAG_RPC_URL],
            blockExplorerUrls: ['https://explorer.blockdag.network'] // Placeholder
          }],
        });
      }
    }

    this.contract = new ethers.Contract(DOCU_VAULT_ADDRESS, DOCU_VAULT_ABI, this.signer);
    return await this.signer.getAddress();
  }

  async uploadFile(cid: string, encryptedKey: string): Promise<string> {
    if (!this.contract) throw new Error('Not connected');

    const tx = await this.contract.uploadFile(cid, encryptedKey);
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  async grantAccess(cid: string, userAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Not connected');

    const tx = await this.contract.grantAccess(cid, userAddress);
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  async revokeAccess(cid: string, userAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Not connected');

    const tx = await this.contract.revokeAccess(cid, userAddress);
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  async hasAccess(cid: string, userAddress: string): Promise<boolean> {
    if (!this.contract) throw new Error('Not connected');

    return await this.contract.hasAccess(cid, userAddress);
  }

  async getUserFiles(ownerAddress: string): Promise<string[]> {
    if (!this.contract) throw new Error('Not connected');

    return await this.contract.getUserFiles(ownerAddress);
  }

  // Listen to events
  onFileUploaded(callback: (cid: string, owner: string) => void) {
    if (!this.contract) return;

    this.contract.on('FileUploaded', (cid, owner) => {
      callback(cid, owner);
    });
  }

  onAccessGranted(callback: (cid: string, owner: string, user: string) => void) {
    if (!this.contract) return;

    this.contract.on('AccessGranted', (cid, owner, user) => {
      callback(cid, owner, user);
    });
  }

  onAccessRevoked(callback: (cid: string, owner: string, user: string) => void) {
    if (!this.contract) return;

    this.contract.on('AccessRevoked', (cid, owner, user) => {
      callback(cid, owner, user);
    });
  }
}

export const blockDAGService = new BlockDAGService();
