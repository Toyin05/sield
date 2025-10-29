# Wallet Integration Guide

This document explains how Sield's universal wallet connection system works and how to test it across different platforms.

## Overview

Sield uses Web3Modal (by WalletConnect) to provide a seamless wallet connection experience that works on:

- **Desktop browsers** with MetaMask extension
- **MetaMask mobile app** (in-app browser)
- **Regular mobile browsers** (Chrome/Safari) with WalletConnect deep linking

## Architecture

### Core Components

- `WalletProvider` - React context that manages wallet state and connections
- `ConnectWallet` - UI component that displays connection status and actions
- `chains.ts` - BlockDAG network configuration
- Web3Modal - Handles wallet selection and connection modal

### Connection Flow

1. **Desktop with MetaMask**: Direct injection via `window.ethereum`
2. **Mobile MetaMask**: In-app browser with MetaMask's wallet interface
3. **Mobile browsers**: WalletConnect modal → QR code or deep linking to wallet apps

## Setup

### 1. Get WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID
4. Add to your `.env` file:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 2. Environment Variables

```env
# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# BlockDAG Network
VITE_BLOCKDAG_RPC_URL=https://rpc.blockdag.network
VITE_BLOCKDAG_CHAIN_ID=2025
```

## Testing Guide

### Desktop Testing (Chrome/Firefox + MetaMask)

1. **Install MetaMask extension**
2. **Open Sield app**: `npm run dev`
3. **Click "Connect Wallet"**
4. **MetaMask popup appears** - approve connection
5. **Verify BlockDAG network** - app should prompt to switch/add network
6. **Check address display** - should show truncated address
7. **Test disconnect** - dropdown menu should work

### MetaMask Mobile In-App Browser

1. **Open MetaMask mobile app**
2. **Tap browser icon** (bottom navigation)
3. **Enter Sield URL**: `http://localhost:5173` (or production URL)
4. **Click "Connect Wallet"**
5. **MetaMask handles connection** - no WalletConnect modal needed
6. **Verify connection** - address should display

### Mobile Browser (Chrome/Safari) + WalletConnect

1. **Open mobile browser** (Chrome/Safari)
2. **Navigate to Sield app**
3. **Click "Connect Wallet"**
4. **WalletConnect modal opens**
5. **Choose wallet** (MetaMask, Trust Wallet, Rainbow, etc.)
6. **Scan QR code** or **tap "Open in [Wallet]"**
7. **Approve in wallet app**
8. **Return to browser** - connection should be established

## Troubleshooting

### Common Issues & Solutions

#### "MetaMask extension not found" Error
- **Symptom**: Console shows "Failed to connect to MetaMask → Error: MetaMask extension not found"
- **Cause**: MetaMask extension not installed, disabled, or not detected
- **Solution**:
  - Install MetaMask extension from chrome.google.com
  - Enable extension in browser settings
  - Refresh the page after installation
  - The app will automatically fall back to Web3Modal

#### No injected provider (window.ethereum)
- **Symptom**: Web3Modal opens instead of direct MetaMask connection
- **Cause**: No browser wallet extension installed
- **Solution**: Install MetaMask or use WalletConnect flow with mobile wallet

#### User rejected connection
- **Symptom**: "Connection rejected by user" error
- **Cause**: User clicked "Cancel" in wallet popup
- **Solution**: Retry connection, ensure wallet is unlocked

#### Unsupported chain / Network switching failed
- **Symptom**: "Please switch to BlockDAG network" message
- **Cause**: Wallet connected to different network
- **Solution**: Wallet should automatically prompt to switch/add BlockDAG network

#### WalletConnect timeout
- **Symptom**: Connection hangs or times out after 60 seconds
- **Cause**: Network issues, wallet app not responding, or QR code expired
- **Solution**: Check internet connection, restart wallet app, try again

#### Deep linking not working
- **Symptom**: "Open in [Wallet]" doesn't launch wallet app
- **Cause**: Wallet app not installed or deep linking disabled
- **Solution**: Install wallet app, enable deep linking in app settings

#### window.ethereum.on is not a function crash
- **Symptom**: App shows blank page with console error "TypeError: window.ethereum.on is not a function"
- **Cause**: Code assumed all providers implement EIP-1193 event API, but some providers or ethers wrappers don't expose .on() method
- **Solution**: The app now uses safe event binding that detects the correct API (.on(), .addListener(), or underlying provider methods) and gracefully handles providers without event support

#### Provider event binding failures
- **Symptom**: Console warnings about "provider does not support event listeners"
- **Cause**: Provider doesn't implement standard event APIs
- **Solution**: App continues to work but may not auto-update on account/network changes - user can refresh manually

#### MutationObserver errors in console
- **Symptom**: Console shows "MutationObserver error" from web-client-content-script.js
- **Cause**: Browser extension conflict (not from our app)
- **Solution**: Ignore - this is from another extension and doesn't affect functionality

#### Web3Modal not initialized
- **Symptom**: Console shows "Web3Modal not initialized - missing project ID"
- **Cause**: VITE_WALLETCONNECT_PROJECT_ID not set in .env.local
- **Solution**: Get project ID from WalletConnect Cloud and add to environment

### Debug Information

When in development mode (`npm run dev`), a debug panel appears in the bottom-right corner showing:
- Injected provider detection
- MetaMask presence
- Current chain ID
- Project ID configuration
- Mobile detection

Use this information to diagnose connection issues.

### Testing Checklist

#### Desktop Testing
- [ ] MetaMask extension installed and enabled
- [ ] Click Connect → MetaMask popup appears
- [ ] Approve connection → address displays
- [ ] Network switches to BlockDAG automatically
- [ ] Disconnect works properly

#### Mobile Testing
- [ ] MetaMask mobile in-app browser works
- [ ] Regular mobile browser opens Web3Modal
- [ ] QR code scanning works
- [ ] Deep linking launches wallet app
- [ ] Connection returns to browser successfully

#### Fallback Testing
- [ ] Disable MetaMask extension → Web3Modal opens
- [ ] No wallet installed → graceful error handling
- [ ] Network switching failures handled properly

## API Reference

### useWallet Hook

```typescript
const {
  connect,        // () => Promise<void>
  disconnect,     // () => Promise<void>
  account,        // string | null
  chainId,        // number | null
  provider,       // ethers.BrowserProvider | null
  signer,         // ethers.Signer | null
  isConnected,    // boolean
  isConnecting,   // boolean
  error           // string | null
} = useWallet()
```

### Usage Examples

```typescript
// Get network info
const network = await provider.getNetwork()

// Sign a transaction
const tx = await signer.sendTransaction({
  to: "0x...",
  value: ethers.parseEther("0.1")
})

// Call smart contract
const contract = new ethers.Contract(address, abi, signer)
const result = await contract.someFunction()
```

## Supported Wallets

- MetaMask (recommended)
- Trust Wallet
- Rainbow
- Coinbase Wallet
- WalletConnect-compatible wallets

## Security Considerations

- Always verify contract addresses before interactions
- Never share private keys or seed phrases
- Use hardware wallets for large amounts
- Keep wallet software updated
- Enable 2FA when available

## Troubleshooting

### Build Issues
- Ensure all environment variables are set
- Check that WalletConnect Project ID is valid
- Verify BlockDAG RPC URL is accessible

### Runtime Issues
- Clear browser cache and cookies
- Restart wallet extensions/apps
- Check network connectivity
- Verify wallet has sufficient funds for gas

### Development Tips
- Use browser dev tools to inspect `window.ethereum`
- Check console for Web3Modal debug messages
- Test on multiple devices/browsers
- Monitor network requests in dev tools
