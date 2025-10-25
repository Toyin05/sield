.sol# Sield — Secure Legal Document Management (BlockDAG)

Sield is a decentralized document management dApp that enables lawyers, agencies, and organizations to securely upload, encrypt, share, and verify legal documents. Files are encrypted client-side, stored on IPFS, and metadata/permissions are recorded immutably on the BlockDAG blockchain for tamper-evident auditability.

Quick highlights
- End-to-end client-side AES-256 encryption
- Decentralized storage (IPFS / Web3.Storage or Pinata)
- On-chain metadata & permissions stored on BlockDAG
- Wallet-based access control (MetaMask / EIP-1193 wallets)
- Audit logs derived from blockchain events

Why Sield
Sield solves real-world legal data problems — tampering, leaks, and lost trust — by combining proven cryptography, decentralized storage, and an auditable blockchain ledger. The wallet is the user identity: only authorized wallets can decrypt files.

How BlockDAG is integrated
- The frontend encrypts each file locally and uploads the ciphertext to IPFS.
- The IPFS CID, owner wallet address, and access control data (and optionally an encrypted symmetric key or its hash) are recorded on a smart contract deployed to the BlockDAG network.
- Grant/revoke and access events are emitted by the contract and serve as an immutable audit trail.
- When an authorized wallet requests a file, the dApp fetches the CID from the contract, downloads the ciphertext from IPFS, and decrypts the file locally.

Architecture (high level)
1. User (browser) — connects wallet, encrypts files, interacts with UI
2. IPFS (Web3.Storage / Pinata) — stores encrypted file payloads
3. BlockDAG Smart Contract — stores CID, owner, permissions, emits events
4. Frontend (React + TypeScript) — handles wallet, encryption, IPFS upload, contract calls

Core features
- Upload: AES-256 encrypt on client; upload ciphertext to IPFS; register CID on-chain
- Grant / Revoke: manage access via on-chain permissions
- View / Download: verify permission, fetch CID, decrypt locally
- Audit Log: real-time event feed from the BlockDAG contract

Tech stack
- Frontend: React + TypeScript (Vite)
- Styling: Tailwind CSS, shadcn-ui components
- Blockchain: ethers.js for BlockDAG interaction
- Smart Contracts: Solidity (Hardhat / Foundry recommended)
- Storage: IPFS (Web3.Storage or Pinata)
- Encryption: AES-256 (SubtleCrypto or a vetted JS library)

Getting started (development)
Prerequisites
- Node.js (16+ recommended)
- npm or pnpm
- MetaMask or compatible browser wallet
- (Optional) Web3.Storage API token

Clone and install
Open PowerShell and run:

```powershell
git clone <YOUR_REPO_URL>
cd sield
npm install
```

Environment variables
Create a `.env` file in the project root (Vite uses `VITE_` prefixes):

```
VITE_BLOCKDAG_RPC_URL=https://your-blockdag-rpc
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_WEB3STORAGE_TOKEN=your_web3_storage_api_token
```

Start the dev server

```powershell
npm run dev
# Open http://localhost:5173
```

Build for production

```powershell
npm run build
npm run preview
```

Smart contract (recommended workflow)
- Create a `contracts/` directory and develop using Hardhat or Foundry.
- Typical Hardhat commands:

```powershell
cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat run --network <blockdag-testnet> scripts/deploy.js
```

The contract should expose functions like:
- uploadFile(string cid)
- grantAccess(string cid, address user)
- revokeAccess(string cid, address user)
- hasAccess(string cid, address user)
And emit events for each action.

Security notes
- Symmetric keys must never be sent in plaintext to the backend or blockchain.
- Use client-side SubtleCrypto or a vetted crypto library for AES-256 operations.
- Optional: wrap the AES key with the recipient's public key (ECIES) and store only the wrapped key on-chain.

Encryption + IPFS flow (example)
1. Generate a random AES-256 key locally.
2. Encrypt the file with that key in the browser.
3. Upload the ciphertext to IPFS (Web3.Storage) and get the CID.
4. (Optional) Encrypt the AES key with the owner's public key or store its hash on-chain.
5. Call the smart contract `uploadFile(cid)` which records the CID and owner.

Connecting the frontend to BlockDAG
- Use ethers.js and the VITE_BLOCKDAG_RPC_URL provider.
- Load ABI and contract address (from `.env`) and call write/read functions via a signer from the connected wallet.

Testing and QA
- Unit test smart contracts locally with Hardhat and run integration tests using a local IPFS node or Web3.Storage's staging environment.
- Test wallet flows with MetaMask and ensure proper error handling for declined transactions.

Contributing
- Fork the repo, create a feature branch, open a PR with a clear description.
- Keep commits focused and include tests for contract logic where applicable.

Roadmap (suggested)
- Key wrapping per-user (ECIES) for secure key sharing
- Encrypted metadata search (secure indexing)
- Multi-signature workflows for corporate/legal approvals
- Enterprise admin panel and audit exports

License
Specify your preferred license in `LICENSE` (e.g. MIT). If no preference, add an MIT license.

Contact
- Repo: <YOUR_REPO_URL>
- Maintainer: Toyin

---
If you want, I can also:
- Add a short DEVELOPMENT.md describing the contract interfaces and folder layout, or
- Create a sample Hardhat contract template and deployment script in `contracts/`.
