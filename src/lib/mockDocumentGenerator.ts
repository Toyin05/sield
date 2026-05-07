// Mock document content generator for uploaded files
// Creates realistic content based on file type and name

export interface MockDocumentContent {
  title: string;
  content: string;
  type: 'pdf' | 'docx' | 'txt' | 'image';
  metadata: {
    pages?: number;
    wordCount?: number;
    size?: string;
    created?: string;
    modified?: string;
  };
}

interface FileMetadata {
  size: string;
  created: string;
  modified: string;
}

export function generateMockDocumentContent(fileName: string, fileSize: number): MockDocumentContent {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  
  // Clean up filename for better display
  const cleanName = baseName
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  // Generate metadata
  const now = new Date();
  const metadata = {
    size: formatFileSize(fileSize),
    created: now.toLocaleDateString(),
    modified: now.toLocaleDateString(),
  };

  switch (extension) {
    case 'pdf':
      return generatePDFContent(cleanName, metadata);
    case 'docx':
    case 'doc':
      return generateDocxContent(cleanName, metadata);
    case 'txt':
      return generateTxtContent(cleanName, metadata);
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return generateImageContent(cleanName, metadata);
    default:
      return generateGenericContent(cleanName, metadata);
  }
}

function generatePDFContent(title: string, metadata: FileMetadata): MockDocumentContent {
  const content = `
# ${title}

## Executive Summary

This document contains confidential information regarding ${title.toLowerCase()}. This content has been processed through Sield's secure document pipeline and is now protected by blockchain-based access control.

## Document Contents

### Section 1: Overview
The following document outlines the key aspects and requirements for ${title.toLowerCase()}. All content has been encrypted using AES-256-GCM encryption and stored on IPFS for decentralized access.

### Section 2: Technical Specifications
- **Encryption**: AES-256-GCM
- **Storage**: IPFS (InterPlanetary File System)
- **Access Control**: Blockchain-verified permissions
- **Security Level**: Military-grade

### Section 3: Implementation Details

#### 3.1 Security Measures
This document is protected by:
- ✓ End-to-end encryption
- ✓ Decentralized storage on IPFS
- ✓ Blockchain-based access logging
- ✓ Time-limited viewing sessions
- ✓ Anti-screenshot protection

#### 3.2 Access Control
Access to this document is managed through:
- Wallet-based authentication
- Time-limited access grants
- Immutable audit trail
- Revocable permissions

### Section 4: Compliance and Audit

This document meets the following compliance standards:
- SOC 2 Type II
- ISO 27001
- GDPR compliant
- HIPAA ready

## Conclusion

This document demonstrates Sield's ability to provide enterprise-grade document security with blockchain verification and decentralized storage.

---
*Document processed on ${metadata.created}*
*File size: ${metadata.size}*
*Protected by Sield Secure Document Platform*
  `;

  return {
    title: `${title}.pdf`,
    content,
    type: 'pdf',
    metadata: {
      ...metadata,
      pages: Math.floor(Math.random() * 10) + 5,
      wordCount: content.split(' ').length,
    }
  };
}

function generateDocxContent(title: string, metadata: FileMetadata): MockDocumentContent {
  const content = `
${title}

Prepared by: Document Owner
Date: ${metadata.created}
Classification: Confidential

Dear Team,

I am pleased to present the ${title.toLowerCase()} document. This file has been processed through our secure document management system and is now protected by Sield's blockchain-based access control.

Key Highlights:

• Enhanced security through AES-256 encryption
• Decentralized storage using IPFS technology
• Blockchain-verified access permissions
• Immutable audit logging
• Time-limited viewing sessions

Document Overview:

The attached document contains detailed information about ${title.toLowerCase()}. All content has been encrypted and stored securely using advanced cryptographic methods.

Security Features:

Our document security pipeline includes:
1. Client-side encryption before upload
2. IPFS storage for decentralized access
3. Blockchain registration for immutable records
4. Wallet-based authentication
5. Time-expiring access grants

Best regards,
Document Security Team

---
This document is protected by Sield Secure Document Platform
Processed: ${metadata.created}
Size: ${metadata.size}
  `;

  return {
    title: `${title}.docx`,
    content,
    type: 'docx',
    metadata: {
      ...metadata,
      wordCount: content.split(' ').length,
    }
  };
}

function generateTxtContent(title: string, metadata: FileMetadata): MockDocumentContent {
  const content = `
${title.toUpperCase()}
${'='.repeat(title.length)}

DATE: ${metadata.created}
FILE SIZE: ${metadata.size}
SECURITY: ENCRYPTED

IMPORTANT NOTICE:
This document has been processed through Sield's secure document pipeline.
All content is encrypted and stored on IPFS with blockchain verification.

CONTENT PREVIEW:

This is a sample text document that has been uploaded through Sield's
secure document platform. In a real implementation, this would contain
the actual content of your uploaded text file.

Key Security Features:
- AES-256-GCM encryption
- IPFS decentralized storage
- Blockchain access control
- Time-limited viewing
- Anti-screenshot protection

For production use, this would display the actual content of your
uploaded text file, processed through our secure pipeline.

Document Metadata:
- Original filename: ${title}
- Upload date: ${metadata.created}
- File size: ${metadata.size}
- Encryption: AES-256-GCM
- Storage: IPFS
- Access: Blockchain-verified

---
Protected by Sield Secure Document Platform
  `;

  return {
    title: `${title}.txt`,
    content,
    type: 'txt',
    metadata: {
      ...metadata,
      wordCount: content.split(' ').length,
    }
  };
}

function generateImageContent(title: string, metadata: FileMetadata): MockDocumentContent {
  const content = `
${title}

IMAGE METADATA:
- Format: ${title.split('.').pop()?.toUpperCase()}
- Size: ${metadata.size}
- Upload Date: ${metadata.created}
- Security: Encrypted & IPFS Stored

SECURE IMAGE VIEWING:
This image has been processed through Sield's secure document pipeline:

✓ AES-256-GCM encryption applied
✓ Stored on decentralized IPFS network
✓ Blockchain access control enabled
✓ Time-limited viewing session active
✓ Screenshot protection enabled

DEMO MODE NOTICE:
This is a demonstration of Sield's image security capabilities.
In production, this would display your actual uploaded image
with full security features active.

Image Security Features:
- Client-side encryption before upload
- IPFS storage for redundancy
- Blockchain registration for audit trail
- Wallet-based access control
- Session-based viewing permissions

---
Image protected by Sield Secure Document Platform
  `;

  return {
    title,
    content,
    type: 'image',
    metadata: {
      ...metadata,
    }
  };
}

function generateGenericContent(title: string, metadata: FileMetadata): MockDocumentContent {
  const content = `
${title}

Document Information:
- Filename: ${title}
- Upload Date: ${metadata.created}
- File Size: ${metadata.size}
- Security: Sield Protected

SECURE DOCUMENT PROCESSING:
This file has been processed through Sield's comprehensive security pipeline:

Security Measures Applied:
• AES-256-GCM encryption
• IPFS decentralized storage
• Blockchain access verification
• Time-limited viewing sessions
• Anti-exfiltration protection

In a production environment, this document would be:
1. Encrypted client-side before upload
2. Stored on IPFS for decentralized access
3. Registered on blockchain for immutable records
4. Accessible only to authorized wallets
5. Viewable for a limited time duration

Demo Mode:
This is a demonstration of Sield's document security capabilities.
The actual file content would be displayed in a production deployment.

---
Protected by Sield Secure Document Platform
  `;

  return {
    title,
    content,
    type: 'txt',
    metadata: {
      ...metadata,
      wordCount: content.split(' ').length,
    }
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}