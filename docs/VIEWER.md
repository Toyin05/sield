# Sield Viewer - Mock One-Time Access Flow

## Overview

The Viewer component implements a complete mock-only implementation of the grant-based document access flow. This allows senders to grant one-time view access to documents and viewers to access them securely exactly once.

## How It Works

### Grant Creation Flow
1. **Sender** opens Dashboard and clicks "Grant Access" on a document
2. **GrantModal** opens allowing configuration:
   - Optional viewer wallet address (0x...)
   - Duration selection (1 min to 24 hours)
   - Wallet verification requirement (recommended)
3. **Access key** is generated (format: `sield-xxxx-xxxx`)
4. **Success modal** shows the key with copy button and direct viewer link
5. **Grant stored** in localStorage with expiration and usage tracking

### Viewer Access Flow
1. **Viewer** navigates to `/viewer` or receives direct link `/viewer?key=sield-...`
2. **Input options**: Paste full link or just the access key
3. **Validation** checks:
   - Key exists
   - Not expired
   - Not already used
   - Wallet verification if required
4. **Pre-view modal** shows document details and security warnings
5. **Secure viewing** starts with:
   - Watermark overlay (wallet + timestamp)
   - 2-minute auto-timeout
   - Security measures (no copy/paste, right-click blocked)
6. **Completion** marks grant as used, shows success message

## Data Storage

All data is stored in localStorage for demo purposes:

- `sield_documents`: Array of Document objects
- `sield_grants`: Array of Grant objects

### Document Interface
```typescript
interface Document {
  docId: string;
  fileName: string;
  filePath: string; // e.g. "/mock-files/mock-file.pdf"
  owner: string; // wallet address
  uploadedAt: number;
  sizeBytes: number;
}
```

### Grant Interface
```typescript
interface Grant {
  accessKey: string;
  docId: string;
  viewerAddress?: string | null;
  createdAt: number;
  expiresAt: number;
  used: boolean;
  viewCount: number;
}
```

## Mock Files

Three placeholder files in `public/mock-files/`:
- `mock file.pdf` - Minimal PDF with text
- `mock-file (1).jpg` - Text placeholder
- `mock-file (2).docx` - Text placeholder

**Replace these with real files** for testing, keeping the same names.

## Console Logging

All operations include detailed console logs for debugging:

```
[mock] initMockStore -> seeded 3 documents
[mock] createGrant -> key: sield-1a2B-9kLm docId: doc-001 viewer: 0x742d...5432 expiresAt: 2025-10-30T01:15:28.633Z
[mock] getGrantByKey -> key: sield-1a2B-9kLm found
[mock] markGrantUsed -> key: sield-1a2B-9kLm used:true

[dashboard] open GrantModal for docId: doc-001
[grantModal] generating grant for doc doc-001 viewer 0x742d...5432 duration 10
[grantModal] created key sield-1a2B-9kLm

[viewer] starting validation for key: sield-1a2B-9kLm
[viewer] validation -> ok
[viewer] secure view started -> key: sield-1a2B-9kLm docId: doc-001
[viewer] markGrantUsed -> sield-1a2B-9kLm
[viewer] secure view ended -> duration ms: 45000
[viewer] finished viewing -> key: sield-1a2B-9kLm
```

## Testing Instructions

### Setup
1. Start the app: `npm run dev`
2. Navigate to `/choose-action`
3. Click "Send Document" → goes to `/dashboard`
4. If not connected, redirects to `/wallet-connect` → connect wallet

### Test Grant Creation
1. On Dashboard, click "Grant Access" on any document
2. Fill in optional viewer address (or leave blank)
3. Select duration (try 1 minute for quick testing)
4. Check "Require wallet verification"
5. Click "Generate Access Key"
6. Copy the generated key from the success modal
7. Click "Go to Viewer" or navigate manually to `/viewer`

### Test Viewer Flow - Happy Path
1. On `/viewer`, paste the access key or use the direct link
2. If wallet verification required, ensure correct wallet is connected
3. Click "Validate Key"
4. Should show pre-view modal with document details
5. Click "Start Secure View"
6. Should enter secure viewing mode with watermark and timer
7. Wait or click "Finish Viewing"
8. Should show completion message

### Test Edge Cases

#### Expired Key
1. Create grant with 1-minute duration
2. Wait >1 minute
3. Try to validate → should show "Access Key Expired"

#### Already Used Key
1. Complete a full viewing session
2. Try to validate the same key again → should show "Access Key Already Used"

#### Wrong Wallet
1. Create grant requiring specific wallet address
2. Connect different wallet (or none)
3. Try to validate → should show "Wallet Verification Required"

#### Invalid Key
1. Enter random string → should show "Invalid Access Key"

### Direct Link Testing
1. Create grant and get the access key
2. Navigate directly to `/viewer?key=sield-xxxx-xxxx`
3. Should auto-validate and proceed to pre-view modal

### Grant History
1. Create multiple grants
2. Check Dashboard "Grant History" table
3. Should show all grants with status (Active/Used/Expired)

## Security Features

- **One-time use**: Grants marked used immediately on viewing start
- **Expiration**: Time-based expiration prevents stale access
- **Wallet verification**: Optional wallet address matching
- **Watermarking**: Viewer wallet + timestamp overlay
- **Auto-timeout**: 2-minute viewing limit
- **No persistence**: All data in localStorage (resets on browser clear)

## URLs and Routes

- `/choose-action` - Initial choice between Send/View
- `/dashboard` - Document management and grant creation
- `/viewer` - Grant-based document viewing
- `/viewer?key=sield-xxxx-xxxx` - Direct access with key

## Debugging

If something fails, check:
1. **Console logs** - All operations logged with exact strings above
2. **localStorage** - Check `sield_documents` and `sield_grants` keys
3. **Network tab** - No external requests (all client-side)
4. **Wallet connection** - Ensure MetaMask/wallet connected when required

## Future Blockchain Integration

This is mock-only. Real implementation would:
- Store grants on blockchain
- Use smart contracts for access control
- IPFS for document storage
- Cryptographic proofs for one-time access
- Decentralized identity for wallet verification