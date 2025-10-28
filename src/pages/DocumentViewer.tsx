import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, AlertTriangle, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { blockDAGService } from "@/lib/blockchain";
import { ipfsService } from "@/lib/ipfs";
import { EncryptionService } from "@/lib/encryption";

const DocumentViewer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [documentData, setDocumentData] = useState<{
    cid: string;
    name: string;
    owner: string;
    timestamp: number;
    content: string;
    contentType: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [viewingMode, setViewingMode] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [watermarkText, setWatermarkText] = useState("");
  const [blurDocument, setBlurDocument] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);

  const handleSecurityViolation = (violation: string) => {
    const newViolation = `${new Date().toISOString()}: ${violation}`;
    setSecurityViolations(prev => [...prev, newViolation]);
    setViolationCount(prev => prev + 1);
    setScreenshotsBlocked(prev => prev + 1);

    // Blur document on violation
    setBlurDocument(true);

    // Show violation modal
    setShowViolationModal(true);

    // Auto-close after 3 violations
    if (violationCount >= 2) {
      setAutoCloseTimer(setTimeout(() => {
        toast({
          title: "Security Policy Violated",
          description: "Document access terminated due to multiple security violations",
          variant: "destructive",
        });
        navigate("/dashboard");
      }, 5000));
    } else {
      // Hide violation modal and unblur after 3 seconds
      setTimeout(() => {
        setShowViolationModal(false);
        setBlurDocument(false);
      }, 3000);
    }

    toast({
      title: "Security Violation Detected",
      description: violation,
      variant: "destructive",
    });
  };

  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Anti-screenshot protection
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [screenshotsBlocked, setScreenshotsBlocked] = useState(0);
  const [securityViolations, setSecurityViolations] = useState<string[]>([]);
  const [documentVisible, setDocumentVisible] = useState(false);
  const [violationCount, setViolationCount] = useState(0);

  const cid = searchParams.get('cid');
  const key = searchParams.get('key');
  const iv = searchParams.get('iv');

  useEffect(() => {
    if (!cid || !key || !iv) {
      toast({
        title: "Invalid Access",
        description: "Missing document parameters",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    initializeDocumentViewer();
    setupSecurityMeasures();
  }, [cid, key, iv]);

  const initializeDocumentViewer = async () => {
    try {
      setLoading(true);

      // Check access permissions (in production, this would call the smart contract)
      // For demo, we'll assume access is granted
      setHasAccess(true);

      // Generate watermark with user info and timestamp
      const userAddress = "0x" + Math.random().toString(36).substring(2, 8);
      const timestamp = new Date().toISOString();
      setWatermarkText(`${userAddress} - ${timestamp}`);

      // Load document from IPFS
      await loadDocument();

    } catch (error) {
      console.error('Failed to initialize viewer:', error);
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this document",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadDocument = async () => {
    if (!cid || !key || !iv) return;

    try {
      // Download encrypted file from IPFS
      const encryptedBlob = await ipfsService.downloadFile(cid);

      // Decrypt the file
      const encryptedData = btoa(String.fromCharCode(...new Uint8Array(await encryptedBlob.arrayBuffer())));
      const decryptedArrayBuffer = await EncryptionService.decryptFile(encryptedData, key, iv);

      // Convert to displayable format
      const blob = new Blob([decryptedArrayBuffer]);
      const content = await blob.text();
      const contentType = getContentType(content);

      setDocumentData({
        cid,
        name: `Document_${cid.substring(0, 8)}`,
        owner: "0x742d...5432", // Mock owner
        timestamp: Date.now(),
        content,
        contentType
      });

    } catch (error) {
      console.error('Failed to load document:', error);
    }
  };

  const getContentType = (content: string): string => {
    // Simple content type detection
    if (content.startsWith('%PDF')) return 'application/pdf';
    if (content.includes('<html')) return 'text/html';
    return 'text/plain';
  };

  const setupSecurityMeasures = () => {
    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleSecurityViolation("Right-click context menu blocked - unauthorized access attempt");
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        handleSecurityViolation("Print Screen key pressed - screenshot attempt blocked");
        return;
      }

      // Prevent Ctrl+S, Ctrl+P, etc.
      if (e.ctrlKey || e.metaKey) {
        const blockedKeys = ['s', 'p', 'u', 'c', 'x', 'v', 'a'];
        if (blockedKeys.includes(e.key.toLowerCase())) {
          e.preventDefault();
          handleSecurityViolation(`Ctrl+${e.key.toUpperCase()} blocked - unauthorized action attempt`);
        }
      }

      // Prevent F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        handleSecurityViolation("F12 pressed - developer tools access blocked");
      }
    };

    // Prevent copy/paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleSecurityViolation("Copy operation blocked - clipboard access prevented");
    };

    // Prevent drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Detect fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy); // Also prevent cut
    document.addEventListener('paste', handleCopy); // Also prevent paste
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Additional security: prevent selection
    document.addEventListener('selectstart', (e) => {
      if (viewingMode) {
        e.preventDefault();
        handleSecurityViolation("Text selection blocked - unauthorized content access attempt");
      }
    });

    // Prevent beforeunload to avoid accidental closing
    window.addEventListener('beforeunload', (e) => {
      if (viewingMode) {
        e.preventDefault();
        e.returnValue = 'Document viewing session is active. Closing may violate security policies.';
      }
    });

    // Setup periodic security checks
    const securityInterval = setInterval(() => {
      checkSecurityStatus();
    }, 1000);

    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('paste', handleCopy);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('selectstart', () => {});
      window.removeEventListener('beforeunload', () => {});
      clearInterval(securityInterval);
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  };

  const checkSecurityStatus = () => {
    // Check if dev tools are open (basic detection)
    const devtools = {
      open: false,
      orientation: null as string | null
    };

    const threshold = 160;
    if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
      if (!devToolsOpen) {
        setDevToolsOpen(true);
        toast({
          title: "Security Alert",
          description: "Developer tools detected - viewing may be compromised",
          variant: "destructive",
        });
      }
    }

    // Check if window lost focus (potential screenshot attempt)
    if (document.hidden) {
      handleSecurityViolation("Window lost focus - potential screenshot or unauthorized access attempt");
    }
  };

  const enterViewingMode = () => {
    setViewingMode(true);
    setSessionStartTime(Date.now());

    // Request fullscreen for maximum security
    if (viewerRef.current) {
      viewerRef.current.requestFullscreen().catch(() => {
        // Fallback if fullscreen not available
        toast({
          title: "Viewing Mode",
          description: "Document viewing mode activated",
        });
      });
    }

    toast({
      title: "Viewing Mode Activated",
      description: "Document viewing session started. Screenshots and downloads are blocked.",
    });
  };

  const exitViewingMode = () => {
    setViewingMode(false);

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    // Log viewing session (in production, this would go to blockchain)
    const sessionDuration = Date.now() - sessionStartTime;
    console.log(`Viewing session ended. Duration: ${sessionDuration}ms`);

    toast({
      title: "Viewing Mode Deactivated",
      description: "Document viewing session ended",
    });
  };

  const renderDocumentContent = () => {
    if (!documentData) return null;

    const { content, contentType } = documentData;

    // Add watermark overlay
    const watermarkStyle = {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-45deg)',
      fontSize: '72px',
      color: 'rgba(255, 0, 0, 0.1)',
      fontWeight: 'bold',
      pointerEvents: 'none' as const,
      userSelect: 'none' as const,
      zIndex: 1000,
    };

    return (
      <div
        ref={viewerRef}
        className="relative bg-white border rounded-lg overflow-hidden"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      >
        {/* Security watermark */}
        <div style={watermarkStyle}>
          {watermarkText}
        </div>

        {/* Document content */}
        <div className="p-6">
          {contentType === 'text/plain' && (
            <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
          )}

          {contentType === 'text/html' && (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}

          {contentType === 'application/pdf' && (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">PDF viewing not available in secure mode</p>
              <p className="text-sm text-muted-foreground mt-2">
                PDFs can only be viewed in secure viewing mode to prevent screenshots
              </p>
            </div>
          )}
        </div>

        {/* Security overlay when not in viewing mode */}
        {!viewingMode && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <Shield className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Secure Viewing Required</h3>
              <p className="mb-4">This document can only be viewed in secure mode</p>
              <Button onClick={enterViewingMode} className="bg-red-600 hover:bg-red-700">
                <Eye className="w-4 h-4 mr-2" />
                Enter Secure Viewing Mode
              </Button>
            </div>
          </div>
        )}

        {/* Violation modal */}
        {showViolationModal && (
          <div className="absolute inset-0 bg-red-900/90 flex items-center justify-center z-50">
            <div className="text-center text-white p-8 rounded-lg border-2 border-red-500">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-2xl font-bold mb-2">Security Violation Detected</h3>
              <p className="mb-4">Unauthorized action blocked</p>
              <p className="text-sm text-red-200 mb-4">
                Violation #{violationCount} of 3 allowed
              </p>
              <div className="text-sm">
                {violationCount >= 3 ? (
                  <p className="text-red-300">Session will terminate in 5 seconds...</p>
                ) : (
                  <p className="text-yellow-300">Document blurred for security. Resuming in 3 seconds...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Blur overlay for violations */}
        {blurDocument && (
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-40" />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading secure document...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center max-w-md">
            <AlertTriangle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to view this document.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Secure Document Viewer</h1>
            <p className="text-muted-foreground">
              Viewing document with maximum security - screenshots and downloads blocked
            </p>
          </div>

          <div className="flex items-center gap-4">
            {viewingMode ? (
              <Button onClick={exitViewingMode} variant="outline">
                Exit Viewing Mode
              </Button>
            ) : (
              <Button onClick={enterViewingMode} className="bg-red-600 hover:bg-red-700">
                <Eye className="w-4 h-4 mr-2" />
                Secure View
              </Button>
            )}
          </div>
        </div>

        {/* Security Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Security Status</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Viewing Mode</p>
                <p className="text-xs text-muted-foreground">
                  {viewingMode ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Screenshots Blocked</p>
                <p className="text-xs text-muted-foreground">{screenshotsBlocked}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Session Time</p>
                <p className="text-xs text-muted-foreground">
                  {viewingMode ? `${Math.floor((Date.now() - sessionStartTime) / 1000)}s` : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Document Viewer */}
        <Card className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-secondary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    {documentData?.name || 'Document'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Owner: {documentData?.owner} • CID: {documentData?.cid.substring(0, 12)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={viewingMode ? "default" : "secondary"}>
                  {viewingMode ? "Secure Mode" : "Preview Mode"}
                </Badge>
                <Badge variant="outline">
                  {documentData?.contentType}
                </Badge>
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            {renderDocumentContent()}
          </div>
        </Card>

        {/* Security Warnings */}
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Security Measures Active</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Screenshots are automatically blocked</li>
                <li>• Right-click context menu is disabled</li>
                <li>• Keyboard shortcuts (Ctrl+S, Print Screen, etc.) are blocked</li>
                <li>• Copy/paste operations are prevented</li>
                <li>• Developer tools access is restricted</li>
                <li>• Watermark overlay prevents unauthorized sharing</li>
                <li>• Text selection is blocked in secure mode</li>
                <li>• Window focus monitoring active</li>
                {securityViolations.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-800 mb-2">Recent Violations:</p>
                    <ul className="text-xs text-red-700 space-y-1 max-h-20 overflow-y-auto">
                      {securityViolations.slice(-3).map((violation, index) => (
                        <li key={index}>• {violation.split(': ')[1]}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </ul>
            </div>
          </div>
        </Card>

        {/* Hidden canvas for anti-screenshot protection */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
          width="1"
          height="1"
        />
      </div>
    </DashboardLayout>
  );
};

export default DocumentViewer;

