// Mock services for client-side only grant-based document access
// All data stored in localStorage for demo purposes

export interface Document {
  docId: string;
  fileName: string;
  filePath: string; // e.g. "/mock-files/mock-file.pdf"
  owner: string; // wallet address
  uploadedAt: number;
  sizeBytes: number;
}

export interface Grant {
  accessKey: string;
  docId: string;
  viewerAddress?: string | null;
  createdAt: number;
  expiresAt: number;
  durationMinutes: number; // Add duration for display purposes
  used: boolean;
  revoked?: boolean; // Add explicit revocation field
  viewCount: number;
}

const DOCUMENTS_KEY = 'sield_documents';
const GRANTS_KEY = 'sield_grants';

// Initialize mock store with sample documents
export function initMockStore(): void {
  const existingDocs = localStorage.getItem(DOCUMENTS_KEY);
  if (!existingDocs) {
    const mockOwner = '0xF2A9d3B8c7E6F5A4d3C2B1A0f9E8D7C6B5A493B';
    const documents: Document[] = [
      {
        docId: 'doc-001',
        fileName: 'Sield Secure Document Platform.txt',
        filePath: '/mock-files/Sield Secure Document Platform.txt',
        owner: mockOwner,
        uploadedAt: Date.now() - 86400000, // 1 day ago
        sizeBytes: 1024000,
      },
      {
        docId: 'doc-002',
        fileName: 'Blockchain-Powered Access Control.txt',
        filePath: '/mock-files/Blockchain-Powered Access Control.txt',
        owner: mockOwner,
        uploadedAt: Date.now() - 43200000, // 12 hours ago
        sizeBytes: 2048000,
      },
      {
        docId: 'doc-003',
        fileName: 'One-Time Document Viewing Technology.txt',
        filePath: '/mock-files/One-Time Document Viewing Technology.txt',
        owner: mockOwner,
        uploadedAt: Date.now() - 3600000, // 1 hour ago
        sizeBytes: 512000,
      },
      {
        docId: 'doc-004',
        fileName: 'Sield Enterprise Compliance Guide.txt',
        filePath: '/mock-files/Sield Enterprise Compliance Guide.txt',
        owner: mockOwner,
        uploadedAt: Date.now() - 7200000, // 2 hours ago
        sizeBytes: 1536000,
      },
      {
        docId: 'doc-005',
        fileName: 'BlockDAG Integration Overview.txt',
        filePath: '/mock-files/BlockDAG Integration Overview.txt',
        owner: mockOwner,
        uploadedAt: Date.now() - 1800000, // 30 minutes ago
        sizeBytes: 768000,
      },
      {
        docId: 'doc-006',
        fileName: 'hello.docx',
        filePath: '/mock-files/hello.docx',
        owner: mockOwner,
        uploadedAt: Date.now() - 900000, // 15 minutes ago
        sizeBytes: 256000,
      },
      {
        docId: 'doc-007',
        fileName: 'mock file.pdf',
        filePath: '/mock-files/mock file.pdf',
        owner: mockOwner,
        uploadedAt: Date.now() - 600000, // 10 minutes ago
        sizeBytes: 512000,
      }
    ];
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
    console.info('[mock] initMockStore -> seeded documents including DOCX and PDF');
  }

  const existingGrants = localStorage.getItem(GRANTS_KEY);
  if (!existingGrants) {
    localStorage.setItem(GRANTS_KEY, JSON.stringify([]));
    console.info('[mock] initMockStore -> initialized empty grants array');
  }
}

export function getDocuments(): Document[] {
  // Ensure mock store is initialized
  initMockStore();

  const docs = localStorage.getItem(DOCUMENTS_KEY);
  const documents = docs ? JSON.parse(docs) : [];
  console.log(`[mock] getDocuments -> count ${documents.length}`);
  return documents;
}

export function getDocumentById(docId: string): Document | null {
  const documents = getDocuments();
  const doc = documents.find(d => d.docId === docId);
  console.log(`[mock] getDocumentById -> docId ${docId} ${doc ? 'found' : 'NOT FOUND'}`);
  return doc || null;
}

export function createGrant(grantInput: {
  docId: string;
  viewerAddress?: string | null;
  durationMinutes: number;
}): Grant {
  const grants = JSON.parse(localStorage.getItem(GRANTS_KEY) || '[]');

  // Generate unique access key: sield-xxxx-xxxx
  const generateKey = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomChar = () => chars.charAt(Math.floor(Math.random() * chars.length));
    return `sield-${Array.from({length:4},randomChar).join('')}-${Array.from({length:4},randomChar).join('')}`;
  };

  let accessKey: string;
  do {
    accessKey = generateKey();
  } while (grants.some((g: Grant) => g.accessKey === accessKey));

  const now = Date.now();
  const grant: Grant = {
    accessKey,
    docId: grantInput.docId,
    viewerAddress: grantInput.viewerAddress || null,
    createdAt: now,
    expiresAt: now + (grantInput.durationMinutes * 60000),
    durationMinutes: grantInput.durationMinutes,
    used: false,
    revoked: false,
    viewCount: 0,
  };

  grants.push(grant);
  localStorage.setItem(GRANTS_KEY, JSON.stringify(grants));

  console.info(`[mock] createGrant -> key: ${accessKey} docId: ${grantInput.docId} viewer: ${grantInput.viewerAddress || 'null'} expiresAt: ${new Date(grant.expiresAt).toISOString()}`);
  return grant;
}

export function getGrantByKey(accessKey: string): Grant | null {
  const grants = JSON.parse(localStorage.getItem(GRANTS_KEY) || '[]');
  const grant = grants.find((g: Grant) => g.accessKey === accessKey);
  console.log(`[mock] getGrantByKey -> key: ${accessKey} ${grant ? 'found' : 'NOT FOUND'}`);
  return grant || null;
}

export function markGrantUsed(accessKey: string): void {
  const grants = JSON.parse(localStorage.getItem(GRANTS_KEY) || '[]');
  const grantIndex = grants.findIndex((g: Grant) => g.accessKey === accessKey);
  if (grantIndex !== -1) {
    grants[grantIndex].used = true;
    grants[grantIndex].viewCount += 1;
    localStorage.setItem(GRANTS_KEY, JSON.stringify(grants));
    console.log(`[mock] markGrantUsed -> key: ${accessKey} used:true`);
  }
}

export function revokeGrant(accessKey: string): void {
  const grants = JSON.parse(localStorage.getItem(GRANTS_KEY) || '[]');
  const grantIndex = grants.findIndex((g: Grant) => g.accessKey === accessKey);
  if (grantIndex !== -1) {
    grants[grantIndex].revoked = true; // Mark as revoked
    localStorage.setItem(GRANTS_KEY, JSON.stringify(grants));
    console.log(`[mock] revokeGrant -> key: ${accessKey} revoked`);
  }
}

export function uploadDocument(fileName: string, filePath: string, sizeBytes: number, owner: string): Document {
  const documents = getDocuments();

  // Generate unique docId
  let docId: string;
  do {
    docId = `doc-${Math.random().toString(36).substring(2, 8)}`;
  } while (documents.some(d => d.docId === docId));

  const newDoc: Document = {
    docId,
    fileName,
    filePath,
    owner,
    uploadedAt: Date.now(),
    sizeBytes,
  };

  documents.push(newDoc);
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));

  console.log(`[mock] uploadDocument -> docId: ${docId} fileName: ${fileName} owner: ${owner}`);
  return newDoc;
}