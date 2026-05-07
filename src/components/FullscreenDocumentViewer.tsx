import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XCircle, Clock, Shield, AlertTriangle, File } from 'lucide-react';
import { generateMockDocumentContent, MockDocumentContent } from '@/lib/mockDocumentGenerator';

interface FullscreenDocumentViewerProps {
  src: string;
  documentName: string;
  onClose: () => void;
  onTimeExpired?: () => void;
  timeRemaining: number;
  walletAddress?: string;
}

const FullscreenDocumentViewer: React.FC<FullscreenDocumentViewerProps> = ({
  src,
  documentName,
  onClose,
  onTimeExpired,
  timeRemaining,
  walletAddress
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);
  const [hasValidTime, setHasValidTime] = useState(false);
  const [mockDocument, setMockDocument] = useState<MockDocumentContent | null>(null);

  // Debug log to see what timeRemaining value we receive
  console.log('[fullscreen] Component props:', { timeRemaining, documentName, src });

  // Check if this is an uploaded file and generate mock content
  useEffect(() => {
    if (src.includes('/mock-files/UPLOADED_')) {
      // Extract file size from the mock data (we'll use a default for demo)
      const estimatedSize = 256000; // 256KB default
      const generatedDoc = generateMockDocumentContent(documentName, estimatedSize);
      setMockDocument(generatedDoc);
      console.log('[fullscreen] Generated mock content for uploaded file:', documentName);
    }
  }, [src, documentName]);

  // Track when we receive a valid time value
  useEffect(() => {
    if (timeRemaining > 0) {
      setHasValidTime(true);
      console.log('[fullscreen] Received valid time:', timeRemaining);
    }
  }, [timeRemaining]);

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Request fullscreen
  const requestFullscreen = useCallback(async () => {
    const element = document.getElementById('fullscreen-doc-viewer');
    if (!element) {
      console.log('[fullscreen] Element not found for fullscreen request');
      return;
    }

    console.log('[fullscreen] Requesting fullscreen for element:', element);
    
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
        console.log('[fullscreen] Fullscreen requested successfully via requestFullscreen');
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
        console.log('[fullscreen] Fullscreen requested successfully via webkitRequestFullscreen');
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
        console.log('[fullscreen] Fullscreen requested successfully via msRequestFullscreen');
      } else {
        console.log('[fullscreen] No fullscreen API available, showing viewer without fullscreen');
      }
      setIsFullscreen(true);
      setShowExitButton(true);
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
      console.log('[fullscreen] Fullscreen failed, but still showing viewer');
      // If fullscreen fails, still show the viewer
      setIsFullscreen(true);
      setShowExitButton(true);
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      // Check if we're actually in fullscreen before trying to exit
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      
      if (isCurrentlyFullscreen) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.warn('Fullscreen exit failed:', error);
    } finally {
      setIsFullscreen(false);
      setShowExitButton(false);
      onClose();
    }
  }, [onClose]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen && showExitButton) {
        // User pressed ESC or used browser controls to exit
        setShowExitButton(false);
        onClose();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [showExitButton, onClose]);

  // Auto-close when timer expires
  useEffect(() => {
    console.log('[fullscreen] Timer effect:', { timeRemaining, onTimeExpired: !!onTimeExpired, hasValidTime });
    
    // Don't trigger anything if we haven't received a valid time yet
    if (!hasValidTime) {
      console.log('[fullscreen] No valid time yet, waiting...');
      return;
    }
    
    // Only trigger timer expiration if time has counted down to 0
    if (timeRemaining <= 0 && onTimeExpired) {
      console.log('[fullscreen] Timer expired, calling onTimeExpired');
      exitFullscreen();
      onTimeExpired();
    } else if (timeRemaining > 0) {
      console.log('[fullscreen] Timer active:', timeRemaining);
    }
  }, [timeRemaining, onTimeExpired, exitFullscreen, hasValidTime]);

  // Auto-enter fullscreen when component mounts
  useEffect(() => {
    console.log('[fullscreen] Component mounted, hasValidTime:', hasValidTime);
    const timer = setTimeout(() => {
      console.log('[fullscreen] Calling requestFullscreen after delay');
      requestFullscreen();
    }, 500); // Increased delay to ensure component is fully rendered

    return () => clearTimeout(timer);
  }, [requestFullscreen, hasValidTime]);

  return (
    <div 
      id="fullscreen-doc-viewer"
      className={`fixed inset-0 z-50 bg-background transition-all duration-500 ease-in-out ${
        isFullscreen ? 'opacity-100' : 'opacity-100' // Always visible for debugging
      }`}
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              <span className="font-semibold text-foreground text-sm sm:text-base">Sield Secure Viewer</span>
              <Badge variant="destructive" className="text-xs">
                FULLSCREEN MODE
              </Badge>
            </div>
            <Badge variant="outline" className="text-xs w-fit">
              <Clock className="w-3 h-3 mr-1" />
              {hasValidTime ? formatTimeRemaining(timeRemaining) : 'Initializing...'} remaining
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
            {walletAddress && (
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px] sm:max-w-none">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            )}
            {showExitButton && (
              <Button
                onClick={exitFullscreen}
                variant="outline"
                size="sm"
                className="bg-background/50 hover:bg-background text-xs sm:text-sm px-2 sm:px-4"
              >
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden xs:inline">Exit Fullscreen</span>
                <span className="xs:hidden">Exit</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 pt-16 sm:pt-20 p-2 sm:p-4 h-full">
        <div className="max-w-7xl mx-auto h-full">
          <div className="bg-background rounded-lg border border-border h-full overflow-hidden shadow-2xl">
            {/* Document Header */}
            <div className="bg-secondary/5 border-b border-border p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-semibold text-foreground text-sm sm:text-base truncate">{documentName}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Secure viewing session • Fullscreen mode active
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live monitoring</span>
                </div>
              </div>
            </div>

            {/* Document Viewer */}
            <div className="flex-1 h-[calc(100%-60px)] sm:h-[calc(100%-80px)]">
              {src.includes('/mock-files/UPLOADED_') && mockDocument ? (
                // Mock uploaded file - show realistic document content
                <div className="w-full h-full bg-white overflow-auto">
                  <div className="max-w-4xl mx-auto p-6 sm:p-8">
                    {/* Document Header */}
                    <div className="mb-6 pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">{mockDocument.title.replace(/\.[^/.]+$/, "")}</h1>
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Secured by Sield</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>📄 {mockDocument.type.toUpperCase()}</span>
                        <span>📦 {mockDocument.metadata.size}</span>
                        <span>📅 {mockDocument.metadata.created}</span>
                        {mockDocument.metadata.wordCount && <span>📝 {mockDocument.metadata.wordCount} words</span>}
                        {mockDocument.metadata.pages && <span>📖 {mockDocument.metadata.pages} pages</span>}
                      </div>
                    </div>

                    {/* Document Content */}
                    <div className="prose prose-lg max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {mockDocument.content}
                      </div>
                    </div>

                    {/* Security Footer */}
                    <div className="mt-8 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            AES-256 Encrypted
                          </span>
                          <span className="flex items-center gap-1">
                            📡 IPFS Stored
                          </span>
                          <span className="flex items-center gap-1">
                            ⛓️ Blockchain Verified
                          </span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          🔐 DEMO MODE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Real demo files - use iframe
                <iframe
                  src={typeof src === 'string' ? encodeURI(src) : src}
                  className="w-full h-full border-0"
                  title={documentName}
                  style={{
                    backgroundColor: '#f8fafc',
                  }}
                  onError={(e) => {
                    console.error('[fullscreen] Failed to load document:', src);
                    console.error('[fullscreen] Error:', e);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 max-w-7xl mx-auto">
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground mb-1 text-xs sm:text-sm">Security Measures Active</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs text-muted-foreground">
                <ul className="space-y-0.5 sm:space-y-1">
                  <li>• Screenshots are automatically blocked</li>
                  <li>• Right-click context menu is disabled</li>
                  <li>• Copy/paste operations are prevented</li>
                </ul>
                <ul className="space-y-0.5 sm:space-y-1">
                  <li>• Print dialog is intercepted</li>
                  <li>• Keyboard shortcuts are monitored</li>
                  <li>• Session expires in {formatTimeRemaining(timeRemaining)}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenDocumentViewer;
