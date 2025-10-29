# 🛡️ Sield — Secure Legal Document Management on BlockDAG

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://sield-seven.vercel.app/)
[![BlockDAG Hackathon](https://img.shields.io/badge/BlockDAG-Hackathon%202025-blue?style=for-the-badge)](https://blockdag.network)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **🏆 Winner – PH BlockDAG Hackathon 2025**

A decentralized document management platform built for legal professionals — combining client-side encryption, IPFS decentralized storage, and blockchain-based verification for secure, auditable, and private legal document workflows.

---

## 🚀 Live Demo & Resources

- **🌐 Deployed App**: [https://sield-seven.vercel.app/](https://sield-seven.vercel.app/)
- **📊 Pitch Deck**: [View on Google Drive](https://drive.google.com/file/d/1dBtJrfV-S3iZ7KW1UEnmz1jHVC4-p35j/view?usp=drivesdk)
- **🎥 Demo Video**: [Watch on Google Drive](https://drive.google.com/file/d/1AToCL2ugOr6ME9DXyIwKvtwL6YQl1RMn/view?usp=drivesdk)
📄 **Business Proposal:** [View on Google Drive](https://drive.google.com/file/d/1u5rGRg17XhyEvK0E2jqDXpysBbU38jF2/view?usp=drivesdk)  
---

## 🧩 Overview

Sield is a decentralized document management platform that brings enterprise-grade privacy and transparency to the legal sector. It enables lawyers, agencies, and organizations to securely upload, encrypt, share, and verify legal documents — without depending on centralized servers.

Documents are encrypted client-side using AES-256-GCM, stored on IPFS for censorship-resistant accessibility, and verified on the blockchain, ensuring they remain tamper-proof, private, and fully auditable. The platform leverages BlockDAG's high-throughput DAG-based consensus to provide instant finality and scalable performance for mission-critical legal workflows.

**Built for**: Legal professionals, compliance teams, law firms, and institutions that demand data protection, accountability, and true ownership of digital assets.

---

## ✨ Key Features

### 🔐 Security & Encryption

- **AES-256-GCM Client-Side Encryption**: Files are encrypted in the browser before upload, ensuring zero exposure of plaintext data
- **Zero-Knowledge Architecture**: Backend and blockchain never receive unencrypted content
- **Session-Based Protection**: Auto-logout and restricted session control with real-time monitoring
- **Anti-Screenshot Mode**: Prevents screen captures on the dashboard for enhanced confidentiality
- **End-to-End Privacy**: Only authorized wallets can decrypt files using cryptographic key management

### 📁 Decentralized Storage

- **IPFS Storage**: Censorship-resistant, permanent file hosting on a distributed network
- **Content Addressing**: Every document is identified by its cryptographic CID (Content Identifier)
- **Global Redundancy**: No single point of failure, ensuring documents remain accessible worldwide
- **Web3.Storage Integration**: Reliable and performant decentralized storage infrastructure

### ⛓️ Blockchain Verification & Smart Contracts

- **Immutable Audit Trails**: Every upload, access, permission change, and ownership transfer is permanently recorded on-chain
- **Smart Contract Access Control**: Wallet-based authentication and granular permission management
- **Event Logging**: Comprehensive blockchain events for transparent recordkeeping and compliance
- **Instant Finality**: BlockDAG's DAG-based consensus ensures rapid transaction confirmation
- **Scalable Architecture**: High-throughput design supports enterprise-level document workflows

### 🧠 User Experience

- **Responsive UI**: Built with Tailwind CSS and shadcn/ui for seamless experiences across devices
- **Professional Workflow**: Tailored interface designed specifically for law firms and enterprise users
- **Real-Time Feedback**: Progress indicators, upload status, and transaction confirmations
- **Clean, Modern Interface**: Focused on usability, accessibility, and building trust with users

---

## 🏗️ System Architecture

```
┌──────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Frontend  │    │ Smart Contracts  │    │       IPFS       │
│  (TypeScript)    │◄──►│   (Blockchain)   │◄──►│ (Decentralized) │
│                  │    │                  │    │                 │
│ • AES-256-GCM    │    │ • Audit Logs     │    │ • File Storage  │
│ • Wallet Connect │    │ • Access Control │    │ • Content Hash  │
│ • IPFS Upload    │    │ • Verification   │    │ • Global Access │
└──────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow

1. **Client-Side Encryption**: Files are encrypted locally with AES-256-GCM using the Web Crypto API
2. **Decentralized Storage**: Encrypted files are uploaded to IPFS, returning a unique CID
3. **Blockchain Recording**: File metadata, encrypted keys, and access permissions are recorded immutably on-chain
4. **Permission Validation**: Smart contracts enforce granular access control based on wallet addresses
5. **Secure Retrieval**: Authorized users retrieve encrypted files from IPFS and decrypt them client-side
6. **Audit Trail Generation**: All actions generate immutable on-chain event logs for compliance and transparency

---

## 🛠️ Technology Stack

### Frontend

- **React 18** — Modern component-based architecture for building interactive UIs
- **TypeScript** — Type-safe development with enhanced code quality and maintainability
- **Vite** — Lightning-fast bundling, HMR (Hot Module Replacement), and local development server
- **Tailwind CSS** — Utility-first styling framework for rapid UI development
- **shadcn/ui** — Accessible, customizable React component library
- **Lucide Icons** — Clean, consistent SVG icon set

### Blockchain & Smart Contracts

- **BlockDAG Network** — DAG-based blockchain delivering high performance, instant finality, and scalability
- **Solidity (v0.8.19+)** — Smart contract development with modern security features
- **ethers.js** — Comprehensive JavaScript library for blockchain interaction and wallet integration
- **OpenZeppelin** — Industry-standard secure contract patterns and utilities

### Storage & Encryption

- **IPFS (Web3.Storage)** — Distributed file storage network with content addressing
- **Web Crypto API** — Browser-native AES-256-GCM encryption implementation
- **CryptoJS** — Additional cryptographic utilities for key derivation and hashing

### Deployment & Tooling

- **Vercel** — Cloud platform for seamless frontend hosting and continuous deployment
- **ESLint + Prettier** — Code linting, formatting, and style enforcement
- **MetaMask** — Wallet authentication and blockchain transaction signing

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js 18+** — JavaScript runtime environment
- **npm or yarn** — Package manager
- **MetaMask** — Browser extension wallet connected to BlockDAG testnet/mainnet
- **Web3.Storage API Token** (Optional) — For production IPFS deployments

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/Toyin05/sield.git
cd sield

# Install dependencies
npm install

# Start local development server
npm run dev

# Visit http://localhost:5173 in your browser
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview


---

### Environment Variables

Create a `.env` file in the project root:

```env
# BlockDAG Network Configuration
VITE_BLOCKDAG_RPC_URL=https://rpc.blockdag.network
VITE_BLOCKDAG_CHAIN_ID=2025

# IPFS Configuration (optional for production)
VITE_WEB3_STORAGE_TOKEN=your_web3_storage_token

# Smart Contract Address (after deployment)
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

---

## 📁 Project Structure

```
sield/
├── contracts/               # Solidity smart contracts
│   └── Sield.sol           # Main document management contract
├── public/                  # Static assets (images, icons, etc.)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui component library
│   │   ├── DashboardLayout.tsx
│   │   └── WalletConnect.tsx
│   ├── lib/                 # Core business logic
│   │   ├── blockchain.ts   # Blockchain interaction utilities
│   │   ├── encryption.ts   # AES-256-GCM encryption functions
│   │   └── ipfs.ts         # IPFS storage integration
│   ├── pages/               # Application pages
│   │   ├── Landing.tsx     # Landing page
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Upload.tsx      # Document upload interface
│   │   ├── AccessControl.tsx # Permission management
│   │   └── AuditLog.tsx    # Event history viewer
│   ├── hooks/               # Custom React hooks
│   └── assets/              # Images, icons, and media files
├── tailwind.config.ts       # Tailwind CSS configuration
├── vite.config.ts          # Vite build configuration
├── package.json            # Project dependencies
├── vercel.json             # Vercel deployment settings
└── README.md               # Project documentation
```

### Smart Contract Deployment

```bash
# Navigate to contracts directory
cd contracts

# Install Hardhat dependencies
npm install

# Compile smart contracts
npx hardhat compile

# Run test suite
npx hardhat test

# Deploy to BlockDAG testnet
npx hardhat run scripts/deploy.js --network blockdag-testnet

# Deploy to BlockDAG mainnet (production)
npx hardhat run scripts/deploy.js --network blockdag-mainnet
```

---

## 🔒 Security & Compliance

### Built-In Security Protections

- **AES-256-GCM Encryption**: Military-grade authenticated encryption with integrity verification
- **Zero-Knowledge Architecture**: Server infrastructure never has access to plaintext data
- **Anti-Screenshot + Session Monitoring**: Comprehensive capture prevention system with real-time violation detection
- **Wallet-Based Access Control**: Cryptographic identity verification tied to blockchain addresses
- **Enforced Auditability**: Immutable, transparent logs for all document interactions and permission changes

### Dashboard-Only Security Activation

Security features activate **exclusively within the Dashboard** after successful MetaMask wallet connection:

- **Landing Page & Connection Flow**: Operates normally with no security restrictions to ensure smooth onboarding
- **Automatic Activation**: Security suite engages immediately upon Dashboard entry
- **Comprehensive Protection**: Anti-screenshot measures, fullscreen enforcement, and continuous session monitoring
- **Instant Termination**: Browser session automatically closes on detection of security policy violations

### Compliance Standards

- **NIST AES-256 Implementation**: Cryptographic standards aligned with federal security requirements
- **ISO 27001 Principles**: Information security management framework with blockchain-backed immutability
- **GDPR-Ready by Design**: Privacy-first architecture supporting data protection regulations
- **Immutable Audit Logs**: Tamper-proof recordkeeping for regulatory compliance and legal discovery
- **Blockchain Transparency**: All document actions recorded with cryptographic proof and timestamps

---

## 📋 How It Works

### Document Upload Process

1. **File Selection**: User selects documents for upload through the web interface
2. **Client-Side Encryption**: Files are encrypted with AES-256-GCM using Web Crypto API (browser-native)
3. **IPFS Upload**: Encrypted ciphertext is uploaded to the IPFS network, receiving a unique CID
4. **Smart Contract Recording**: Document metadata, CID, and encrypted key are stored on-chain
5. **Permission Initialization**: Owner wallet address is set with full access rights
6. **Confirmation**: User receives transaction confirmation with document reference

### Document Access Process

1. **Authentication**: User connects wallet and requests document access
2. **Permission Verification**: Smart contract validates wallet address against access control list
3. **Secure Retrieval**: Encrypted file is fetched from IPFS using stored CID
4. **Client-Side Decryption**: Authorized user's browser decrypts file using cryptographic keys
5. **Protected Viewing**: Document is displayed with anti-screenshot protections enabled
6. **Audit Logging**: Access event is recorded on-chain with timestamp and user address

### Permission Management Workflow

1. **Owner Control**: Document owner can grant or revoke access to specific wallet addresses
2. **Granular Permissions**: Individual files can have unique access control lists
3. **Blockchain Enforcement**: All permission changes are validated by smart contracts
4. **Transparent History**: Every permission modification generates an immutable event log
5. **Real-Time Updates**: Access control changes take effect immediately on-chain

---

## 🚀 Roadmap

### Phase 1: MVP (Current) ✅

- [x] AES-256-GCM client-side encryption
- [x] IPFS decentralized storage integration
- [x] Smart contracts for file metadata and permissions
- [x] Anti-screenshot protection system
- [x] Basic document management (upload, view, share)
- [x] Wallet-based authentication
- [x] Immutable audit trail

### Phase 2: Enterprise Features

- [ ] **Multi-Signature Approvals**: Require multiple signers for sensitive document actions
- [ ] **Legal Database Integration**: Connect with LexisNexis, Westlaw, and case management systems
- [ ] **Advanced Audit Reporting**: Export compliance reports and analytics dashboards
- [ ] **Bulk Document Operations**: Upload, encrypt, and manage hundreds of files simultaneously
- [ ] **Custom Branding**: White-label solution for law firms with custom domains and styling
- [ ] **Role-Based Access Control (RBAC)**: Define organizational roles with hierarchical permissions
- [ ] **Document Templates**: Pre-configured document types with automated metadata

### Phase 3: Ecosystem Expansion

- [ ] **Mobile Wallet Integration**: Native iOS and Android apps with biometric authentication
- [ ] **Cross-Chain Document Portability**: Bridge documents across multiple blockchain networks
- [ ] **DeFi Document Escrow**: Smart contract-based escrow for legal transactions
- [ ] **NFT Document Certificates**: Tokenized authenticity certificates for critical legal documents
- [ ] **Advanced Collaboration Tools**: Real-time co-editing, version control, and commenting
- [ ] **Encrypted Metadata Search**: Privacy-preserving document discovery and indexing
- [ ] **API for Third-Party Integration**: RESTful and GraphQL APIs for external systems

### Phase 4: Advanced Security & AI

- [ ] **Hardware Security Module (HSM) Integration**: Enterprise key management with HSM support
- [ ] **Zero-Knowledge Proofs**: Enhanced privacy for sensitive document verification
- [ ] **Quantum-Resistant Encryption**: Future-proof cryptography against quantum computing threats
- [ ] **AI-Powered Document Analysis**: Automated clause detection, risk assessment, and compliance checking
- [ ] **Biometric Document Signing**: Integrate biometric signatures with blockchain verification
- [ ] **Automated Compliance Monitoring**: Real-time alerts for regulatory requirement violations

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, improving documentation, or proposing new features, your input is valuable.

### How to Contribute

1. **Fork the Repository**: Create your own copy of the project
2. **Clone Your Fork**: `git clone https://github.com/toyin05/sield.git`
3. **Create a Branch**: `git checkout -b feature/your-feature-name`
4. **Install Dependencies**: `npm install`
5. **Make Your Changes**: Follow the code style guidelines (ESLint + Prettier)
6. **Test Your Changes**: Ensure all existing tests pass and add new tests if needed
7. **Commit Your Changes**: `git commit -m "Add: Description of your changes"`
8. **Push to Your Fork**: `git push origin feature/your-feature-name`
9. **Submit a Pull Request**: Open a PR against the main repository with a clear description

### Code Style Guidelines

- Follow TypeScript best practices and type all variables
- Use functional components and React hooks
- Write clean, self-documenting code with meaningful variable names
- Add comments for complex logic
- Ensure all ESLint and Prettier rules pass
- Test smart contracts thoroughly before deployment

---

## 📞 Contact & Support

We're here to help! Reach out through any of these channels:

- **GitHub Issues**: [Report bugs or request features](https://github.com/Toyin05/sield/issues)
- **Email**: team@sield.app
- **Twitter**: [@sield_app](https://twitter.com/sield_app)
- **Discord**: [Join our community](https://discord.gg/sield)

---

## 🧾 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for full details.

---

## 🙏 Acknowledgments

- **BlockDAG Team**: For creating an innovative blockchain platform and hosting the 2025 Hackathon
- **IPFS & Web3.Storage**: For providing reliable decentralized storage infrastructure
- **OpenZeppelin**: For battle-tested smart contract libraries
- **shadcn/ui**: For beautiful, accessible React components
- **Our Community**: For feedback, testing, and continuous support

---

**Built with ❤️ for the BlockDAG Hackathon 2025**  
*Empowering legal professionals with blockchain-secured document management*
