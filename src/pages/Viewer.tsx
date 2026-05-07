import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, Clock, Eye, CheckCircle, FileText, Wallet, Link, ArrowRight, Lock, Home, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletProvider";
import { getGrantByKey, markGrantUsed, getDocumentById, revokeGrant, Grant } from "@/lib/mockServices";
import FullscreenDocumentViewer from "@/components/FullscreenDocumentViewer";
import DocxViewer from "@/components/DocxViewer";

// Note: VIEW_TIMEOUT_MS is now calculated dynamically based on grant expiry

type ViewingState = 'intro' | 'wallet-verification' | 'access-key' | 'pre-view' | 'viewing' | 'expired' | 'used' | 'invalid' | 'revoked' | 'complete' | 'timeout' | 'security-violation' | 'copy-violation';

const Viewer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, account, connect } = useWallet();
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const [accessKey, setAccessKey] = useState("");
  const [linkKey, setLinkKey] = useState("");
  const [viewerWalletAddress, setViewerWalletAddress] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [grant, setGrant] = useState<Grant | null>(null);
  const [document, setDocument] = useState<any>(null);
  const [viewingState, setViewingState] = useState<ViewingState>('intro');
  const [viewStartTime, setViewStartTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [viewingDuration, setViewingDuration] = useState<number>(0); // Track the actual viewing duration in seconds

  // Auto-extract key from URL and pre-fill inputs
  useEffect(() => {
    const urlKey = searchParams.get('key');
    if (urlKey) {
      const fullLink = `${window.location.origin}/viewer?key=${urlKey}`;
      setLinkKey(fullLink);
      setAccessKey(urlKey);
    }
  }, []);

  // Migration: Ensure all grants have durationMinutes field
  useEffect(() => {
    const grants = JSON.parse(localStorage.getItem('sield_grants') || '[]');
    let needsUpdate = false;
    
    const updatedGrants = grants.map((grant: any) => {
      if (!grant.durationMinutes) {
        // Calculate duration from expiresAt - createdAt
        const durationMs = grant.expiresAt - grant.createdAt;
        const durationMinutes = Math.round(durationMs / 60000);
        needsUpdate = true;
        return { ...grant, durationMinutes };
      }
      return grant;
    });
    
    if (needsUpdate) {
      localStorage.setItem('sield_grants', JSON.stringify(updatedGrants));
      console.log('[viewer] Migrated grants to include durationMinutes');
    }
  }, []);

  // Anti-screenshot/print detection - ACTIVE
  useEffect(() => {
    console.log('[viewer] Setting up security handlers for state:', viewingState);
    if (viewingState === 'viewing') {
      const timer = setTimeout(() => {
        console.log('[viewer] Security handlers setup complete');
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'PrintScreen' ||
              (e.ctrlKey && e.key === 'p') ||
              (e.ctrlKey && e.shiftKey && e.key === 'I') ||
              (e.ctrlKey && e.key === 'c') ||
              (e.ctrlKey && e.key === 'a') ||
              e.key === 'F12') {
            logSecurityViolation('keyboard_shortcut', e.key);
            setViewingState('security-violation');
            handleFinishViewing();
          }
        };

        const handleContextMenu = (e: MouseEvent) => {
          logSecurityViolation('right_click', 'context_menu');
          e.preventDefault();
          setViewingState('security-violation');
          handleFinishViewing();
        };

        const handleCopy = (e: ClipboardEvent) => {
          logSecurityViolation('clipboard', 'copy');
          e.preventDefault();
          setViewingState('copy-violation');
        };

        const handlePaste = (e: ClipboardEvent) => {
          logSecurityViolation('clipboard', 'paste');
          e.preventDefault();
          setViewingState('security-violation');
          handleFinishViewing();
        };

        const handlePrint = (e: Event) => {
          logSecurityViolation('print', 'print_dialog');
          e.preventDefault();
          setViewingState('security-violation');
          handleFinishViewing();
        };

        if (typeof document !== 'undefined' && document.addEventListener) {
          document.addEventListener('keydown', handleKeyDown);
          document.addEventListener('contextmenu', handleContextMenu);
          document.addEventListener('copy', handleCopy);
          document.addEventListener('paste', handlePaste);
        }
        if (typeof window !== 'undefined' && window.addEventListener) {
          window.addEventListener('beforeprint', handlePrint);
        }

        (window as any).__securityCleanup = () => {
          if (typeof document !== 'undefined' && document.removeEventListener) {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
          }
          if (typeof window !== 'undefined' && window.removeEventListener) {
            window.removeEventListener('beforeprint', handlePrint);
          }
        };
      }, 100);

      return () => {
        clearTimeout(timer);
        if ((window as any).__securityCleanup) {
          (window as any).__securityCleanup();
        }
      };
    }
  }, [viewingState]);

  // Timer for viewing timeout - STARTS WHEN VIEWER CLICKS "START SECURE VIEW"
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewingState === 'viewing' && grant && viewStartTime > 0) {
      console.log('[viewer] Timer started with viewingDuration:', viewingDuration);
      console.log('[viewer] Grant info:', {
        durationMinutes: grant.durationMinutes,
        accessKey: grant.accessKey
      });
      
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - viewStartTime) / 1000);
        
        // Use viewingDuration if set, otherwise use grant duration as fallback
        const grantDuration = grant.durationMinutes || 10; // Default to 10 minutes if not set
        const durationToUse = viewingDuration > 0 ? viewingDuration : (grantDuration * 60);
        const remaining = Math.max(0, durationToUse - elapsed);
        
        setTimeRemaining(remaining);

        console.log('[viewer] Timer tick:', {
          elapsed,
          durationToUse,
          remaining,
          viewingDuration
        });

        // Check if grant has been revoked
        const currentGrants = JSON.parse(localStorage.getItem('sield_grants') || '[]');
        const currentGrant = currentGrants.find((g: Grant) => g.accessKey === grant.accessKey);

        if (!currentGrant) {
          console.log('[viewer] Grant revoked, transitioning to revoked state');
          setViewingState('revoked');
          return;
        }

        // Grant expiration check (as additional safety)
        if (now > currentGrant.expiresAt) {
          console.log('[viewer] Grant expired, transitioning to expired state');
          setViewingState('expired');
          return;
        }

        // Timeout check - when viewing duration expires
        if (remaining <= 0) {
          console.log('[viewer] Timer expired, transitioning to timeout state');
          setViewingState('timeout');
          // Don't call handleFinishViewing here to avoid state conflicts
        } else if (remaining <= 30) {
          setShowTimeWarning(true);
        }
      }, 1000);
    }
    return () => {
      clearInterval(interval);
      setShowTimeWarning(false);
    };
  }, [viewingState, viewStartTime, grant, viewingDuration, showTimeWarning]);

  const logSecurityViolation = (violationType: string, details: string) => {
    const violation = {
      type: 'security_violation',
      violationType,
      details,
      timestamp: new Date().toISOString(),
      document: document?.fileName || 'Unknown',
      grant: grant?.accessKey || 'Unknown'
    };

    const violations = JSON.parse(localStorage.getItem('sield_security_violations') || '[]');
    violations.push(violation);
    localStorage.setItem('sield_security_violations', JSON.stringify(violations));
  };

  const handleValidate = async (keyToValidate?: string) => {
    const key = keyToValidate || accessKey || linkKey;
    if (!key) return;

    setIsValidating(true);

    try {
      const foundGrant = getGrantByKey(key);
      if (!foundGrant) {
        setViewingState('invalid');
        return;
      }

      if (Date.now() > foundGrant.expiresAt) {
        setViewingState('expired');
        setGrant(foundGrant);
        return;
      }

      // Check if revoked (manually revoked by owner)
      if (foundGrant.revoked) {
        setViewingState('revoked');
        setGrant(foundGrant);
        return;
      }

      setGrant(foundGrant);
      const doc = getDocumentById(foundGrant.docId);
      setDocument(doc);
      
      console.log('[viewer] Grant validated successfully:', {
        accessKey: foundGrant.accessKey,
        durationMinutes: foundGrant.durationMinutes,
        expiresAt: new Date(foundGrant.expiresAt).toISOString()
      });
      
      setViewingState('pre-view');

    } catch (error) {
      setViewingState('invalid');
    } finally {
      setIsValidating(false);
    }
  };

  const handleWalletValidation = () => {
    console.log('[viewer] handleWalletValidation called, viewerWalletAddress:', viewerWalletAddress);
    
    if (!viewerWalletAddress) {
      console.log('[viewer] no wallet address provided');
      toast({
        title: "Required Field",
        description: "Please enter your wallet address",
        variant: "destructive",
      });
      return;
    }

    if (!validateAddress(viewerWalletAddress)) {
      console.log('[viewer] invalid wallet address format');
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address (0x...)",
        variant: "destructive",
      });
      return;
    }

    // Move to access key input
    console.log('[viewer] wallet validation successful, transitioning to access-key state');
    setViewingState('access-key');
  };

  const handleKeyValidation = () => {
    const key = accessKey || linkKey;
    if (!key) {
      toast({
        title: "Required Field",
        description: "Please enter an access key or link",
        variant: "destructive",
      });
      return;
    }

    let actualKey = key;
    if (key.includes('?key=')) {
      try {
        const url = new URL(key);
        actualKey = url.searchParams.get('key') || key;
      } catch (e) {
        actualKey = key;
      }
    }

    handleValidate(actualKey);
  };

  const validateAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleStartViewing = () => {
    // TIMER STARTS HERE - when viewer clicks "Start Secure View"
    const startTime = Date.now();
    setViewStartTime(startTime);
    
    // Set the viewing duration to the grant's duration in seconds
    const durationSeconds = grant.durationMinutes * 60;
    setViewingDuration(durationSeconds);
    
    // Initialize timeRemaining immediately
    setTimeRemaining(durationSeconds);
    
    console.log('[viewer] Starting viewing session:', {
      grantDuration: grant.durationMinutes,
      durationSeconds,
      startTime: new Date(startTime).toISOString()
    });
    
    // Mark grant as used first
    markGrantUsed(grant.accessKey);
    
    // Small delay before transitioning to viewing state to avoid race conditions
    setTimeout(() => {
      console.log('[viewer] Transitioning to viewing state');
      setViewingState('viewing');
    }, 100);
  };

  // Reset viewing duration when leaving viewing state
  useEffect(() => {
    if (viewingState !== 'viewing') {
      setViewingDuration(0);
    }
  }, [viewingState]);

  const handleFinishViewing = () => {
    console.log('[viewer] handleFinishViewing called, current state:', viewingState);
    console.log('[viewer] Stack trace:', new Error().stack);
    if (viewingState !== 'timeout' && viewingState !== 'expired' && viewingState !== 'revoked') {
      console.log('[viewer] Transitioning to complete state');
      setViewingState('complete');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatExpiry = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext;
  };

  const renderFileContent = () => {
    if (!document || !document.fileName) {
      return (
        <div className="p-6 text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No document loaded</h3>
          <p className="text-muted-foreground">Document content could not be loaded</p>
        </div>
      );
    }

    const fileType = getFileType(document.fileName);

    switch (fileType) {
      case 'txt':
        return (
          <div className="bg-background p-6 rounded-lg border border-border max-h-96 overflow-y-auto">
            <pre className="text-foreground whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {document.fileName.replace('.txt', '')}

              {(() => {
                try {
                  const sampleContent = {
                    'Sield Secure Document Platform': `Sield Secure Document Platform
Comprehensive Technical Overview & Business Implementation Guide

EXECUTIVE SUMMARY

Sield represents a paradigm shift in secure document management, combining cutting-edge blockchain technology with enterprise-grade security protocols to create an immutable, transparent, and highly secure document sharing ecosystem. This comprehensive platform addresses the critical challenges faced by modern organizations in protecting sensitive information while maintaining operational efficiency and regulatory compliance.

The Sield platform leverages BlockDAG (Directed Acyclic Graph) technology to provide unprecedented security, transparency, and performance characteristics that traditional document management systems cannot match. By utilizing cryptographic verification and decentralized consensus mechanisms, Sield ensures that document access is controlled, monitored, and permanently auditable without relying on centralized authorities or single points of failure.`,
                    'Blockchain-Powered Access Control': `Blockchain-Powered Access Control
Advanced Technical Architecture & Implementation Guide

INTRODUCTION TO DECENTRALIZED ACCESS CONTROL

The evolution of access control systems has reached a critical juncture where traditional centralized models are proving inadequate for modern enterprise security requirements. Sield's blockchain-powered access control system represents a fundamental paradigm shift from conventional access management approaches, leveraging the immutable and transparent nature of BlockDAG technology to create an unprecedented level of security, accountability, and operational efficiency.`,
                    'One-Time Document Viewing Technology': `One-Time Document Viewing Technology

This document details Sield's innovative one-time document viewing technology, which represents a paradigm shift in how sensitive documents are shared and accessed securely.

Traditional document sharing methods rely on passwords or shared links that can be compromised or distributed unauthorizedly. Sield's one-time viewing technology ensures that each document can only be accessed once, with strict time limits and comprehensive security measures.

Technology Features:
• Single-use access keys with cryptographic security
• Automatic expiration with configurable time limits
• Screenshot prevention through advanced monitoring
• Copy/paste blocking with real-time detection`,
                    'Sield Enterprise Compliance Guide': `Sield Enterprise Compliance Guide

This comprehensive compliance guide outlines how Sield's secure document platform helps organizations meet regulatory requirements and maintain enterprise-grade security standards.

In today's regulatory environment, organizations must demonstrate compliance with various standards including SOC 2, GDPR, HIPAA, and other industry-specific requirements. Sield's blockchain-powered platform provides the tools and audit trails necessary to meet these compliance obligations.

Compliance Features:
• SOC 2 Type II compliance with automated audit trails
• GDPR compliance support with data protection controls
• HIPAA-ready security with patient data protection`,
                    'BlockDAG Integration Overview': `BlockDAG Integration Overview

This technical overview explains how Sield integrates with BlockDAG technology to provide unparalleled security, transparency, and performance in document management.

BlockDAG represents the next generation of blockchain technology, combining the security and immutability of traditional blockchains with significantly improved performance and scalability. Sield leverages these advantages to create a document management platform that can handle enterprise-scale workloads while maintaining cryptographic security.

Integration Benefits:
• Distributed ledger security with cryptographic verification
• High-performance transactions with BlockDAG's advanced consensus
• Scalable architecture supporting enterprise workloads`
                  };

                  const docName = document.fileName.replace('.txt', '');
                  return sampleContent[docName] || `Content for ${document.fileName}`;
                } catch (error) {
                  return `Error loading content for ${document.fileName}`;
                }
              })()}
            </pre>
          </div>
        );

      case 'docx':
        return (
          <div className="p-6">
            <DocxViewer
              fileUrl={`/mock-files/${document.fileName}`}
              documentName={document.fileName}
              className="w-full"
            />
          </div>
        );

      case 'pdf':
        return (
          <div className="p-6">
            <div className="text-center">
              <iframe
                src={`/mock-files/${document.fileName}`}
                className="w-full h-96 border border-border rounded-lg"
                title={document.fileName}
              />
              <p className="text-muted-foreground mt-4">File: {document.fileName}</p>
            </div>
          </div>
        );

      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="p-6 text-center">
            <img
              src={`/mock-files/${document.fileName}`}
              alt={document.fileName}
              className="max-w-full max-h-96 mx-auto rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const nextElement = target.nextElementSibling as HTMLElement;
                if (nextElement) nextElement.classList.remove('hidden');
              }}
            />
            <div className="hidden py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Image would be displayed here</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6 text-center">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{document.fileName}</h3>
            <p className="text-muted-foreground">This file type is supported in a real implementation</p>
            <div className="mt-4 bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-muted-foreground text-sm">
                File: {document.fileName}<br />
                Size: {(document.sizeBytes / 1024 / 1024).toFixed(1)} MB<br />
                Type: {document.fileType}
              </p>
            </div>
          </div>
        );
    }
  };

  // Introduction State - What it's about
  if (viewingState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground text-sm sm:text-base"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-6 sm:pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Eye className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Secure Document Access with <span className="text-secondary">Sield</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-2">
                Powered by BlockDAG Technology
              </p>
              <p className="text-sm sm:text-base text-muted-foreground">
                Experience enterprise-grade security with blockchain verification
              </p>
            </div>

            {/* What this is about */}
            <div className="bg-gradient-card border border-border rounded-2xl p-4 sm:p-6 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">What This Is About</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary/10 rounded-lg flex items-center justify-center mt-1 flex-shrink-0">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">One-Time Secure Access</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      This is a secure, time-limited document viewing session powered by <strong>Sield's</strong> blockchain technology. The document you're about to access is protected by BlockDAG verification and can only be viewed once.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary/10 rounded-lg flex items-center justify-center mt-1 flex-shrink-0">
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Enterprise Security</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Sield implements advanced security measures including screenshot prevention, copy/paste blocking, and real-time violation detection. All viewing activity is permanently recorded on the blockchain for complete auditability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary/10 rounded-lg flex items-center justify-center mt-1 flex-shrink-0">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Time-Limited Viewing</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Once you start viewing, you'll have limited time to review the document. After this time or when you finish reviewing, the access key becomes permanently invalid.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What you should know */}
            <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 sm:p-6 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">What You Should Know</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    What You Can Do
                  </h3>
                  <ul className="space-y-1 sm:space-y-2 text-muted-foreground text-xs sm:text-sm">
                    <li>• View documents within the specified time window</li>
                    <li>• Take notes while reviewing the content</li>
                    <li>• Request clarification from the document owner</li>
                    <li>• Access the document using authorized wallet address</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                    What You Shouldn't Do
                  </h3>
                  <ul className="space-y-1 sm:space-y-2 text-muted-foreground text-xs sm:text-sm">
                    <li>• Take screenshots or screen recordings</li>
                    <li>• Copy or paste document content</li>
                    <li>• Print the document</li>
                    <li>• Share the access key with others</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Security notice */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-3 sm:p-4 mb-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Important Security Notice</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    This viewing session is monitored by Sield's security system. Any attempt to capture, copy, or extract document content will be detected and logged on the BlockDAG blockchain. Security violations may result in immediate session termination and audit logging for compliance purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA to proceed */}
            <div className="text-center">
              <Button
                onClick={() => setViewingState('wallet-verification')}
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-glow-cyan animate-glow w-full sm:w-auto text-sm sm:text-lg px-6 sm:px-12 py-4 sm:py-6"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Proceed to Secure Access
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
              </Button>
              <p className="text-muted-foreground text-xs sm:text-sm mt-4">
                Powered by <strong>Sield</strong> • Secured by <strong>BlockDAG</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wallet verification (COMPULSORY FIRST STEP)
  if (viewingState === 'wallet-verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end mb-8">
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 bg-gradient-card border-border">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-secondary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-3">Wallet Verification Required</h1>
                <p className="text-muted-foreground mb-2">
                  To access this secure document, please verify your authorized wallet address.
                </p>
                <p className="text-sm text-muted-foreground">
                  This verification ensures only authorized viewers can access <strong>Sield's</strong> blockchain-secured documents.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="viewerAddress" className="text-base font-semibold text-foreground">Your Wallet Address *</Label>
                  <Input
                    id="viewerAddress"
                    placeholder="0xa1b2c3d4e5f6789012345678901234567890abcd"
                    value={viewerWalletAddress}
                    onChange={(e) => setViewerWalletAddress(e.target.value)}
                    className="mt-2 font-mono border-border focus:border-secondary"
                  />
                  {viewerWalletAddress && !validateAddress(viewerWalletAddress) && (
                    <p className="text-destructive text-sm mt-1">Invalid Ethereum address format</p>
                  )}
                </div>

                <div className="p-6 bg-secondary/5 border border-secondary/20 rounded-xl">
                  <div className="flex items-start gap-4">
                    <Shield className="w-6 h-6 text-secondary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">BlockDAG Authorization</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your wallet address will be verified against the BlockDAG blockchain to ensure you have authorized access to this document. Only addresses explicitly granted access by the document owner can proceed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleWalletValidation}
                    disabled={!viewerWalletAddress}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Wallet Address
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    onClick={() => setViewingState('intro')}
                    variant="outline"
                    className="flex-1"
                  >
                    ← Back to Info
                  </Button>
                </div>
              </div>
            </Card>

            <div className="text-center mt-8">
              <p className="text-muted-foreground text-sm">
                Secured by <span className="font-semibold text-secondary">Sield</span> on <span className="font-semibold text-secondary">BlockDAG</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Access key input (after wallet verification)
  if (viewingState === 'access-key') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end mb-8">
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 bg-gradient-card border-border">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-3">Wallet Verified</h1>
                <p className="text-muted-foreground mb-2">
                  Great! Your wallet address has been verified successfully.
                </p>
                <p className="text-sm text-muted-foreground">
                  Now enter your access key or paste the secure viewing link to access the document.
                </p>
              </div>

              <Tabs defaultValue="key" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                  <TabsTrigger value="link" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                    Access Link
                  </TabsTrigger>
                  <TabsTrigger value="key" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                    Access Key
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="link" className="space-y-6">
                  <div>
                    <Label htmlFor="linkInput" className="text-base font-semibold text-foreground">Access Link</Label>
                    <Input
                      id="linkInput"
                      placeholder="http://localhost:5173/viewer?key=sield-Wpif-Sw1n..."
                      value={linkKey}
                      onChange={(e) => setLinkKey(e.target.value)}
                      className="mt-2 border-border focus:border-secondary"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Paste the complete secure viewing link you received from the document sender
                    </p>
                  </div>
                  <Button
                    onClick={handleKeyValidation}
                    disabled={isValidating || !linkKey}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    variant="outline"
                  >
                    {isValidating ? "Validating..." : "Validate & Access Document"}
                  </Button>
                </TabsContent>

                <TabsContent value="key" className="space-y-6">
                  <div>
                    <Label htmlFor="keyInput" className="text-base font-semibold text-foreground">Access Key</Label>
                    <Input
                      id="keyInput"
                      placeholder="sield-ewDy-a6bS"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      className="mt-2 font-mono border-border focus:border-secondary bg-muted/30"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter the unique access key provided by the document sender
                    </p>
                  </div>
                  <Button
                    onClick={handleKeyValidation}
                    disabled={isValidating || !accessKey}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    variant="outline"
                  >
                    {isValidating ? "Validating..." : "Validate & Access Document"}
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="mt-6 p-6 bg-secondary/5 border border-secondary/20 rounded-xl">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-secondary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">BlockDAG Security</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your access key is cryptographically verified against the BlockDAG blockchain. Once validated, you'll have secure viewing access with real-time monitoring and automatic expiration.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => setViewingState('wallet-verification')}
                  variant="outline"
                  className="flex-1"
                >
                  ← Back to Wallet
                </Button>
                <Button
                  onClick={handleBackToHome}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Home
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Pre-view modal
  if (viewingState === 'pre-view') {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md p-4 bg-gradient-card border-border">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-lg font-bold text-foreground mb-2">One-Time Secure View</h1>
            <p className="text-xs text-muted-foreground">
              This secure access key grants you encrypted, time-limited viewing privileges. The session will automatically enter fullscreen mode with security monitoring. Timer starts immediately and cannot be paused or extended.
            </p>
          </div>

          <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-2 mb-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Document:</span>
                <span className="font-medium text-foreground">{document?.fileName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Owner:</span>
                <span className="font-mono text-foreground">
                  {grant.viewerAddress ? `${grant.viewerAddress.slice(0, 6)}...${grant.viewerAddress.slice(-4)}` : 'Any wallet'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Time:</span>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {grant.durationMinutes === 1 ? '1 min' : 
                   grant.durationMinutes === 60 ? '1 hour' : 
                   grant.durationMinutes === 1440 ? '24 hours' : 
                   `${grant.durationMinutes} min`}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Expires:</span>
                <span className="text-muted-foreground">{formatExpiry(grant.expiresAt)}</span>
              </div>
            </div>
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-xl p-2 mb-3">
            <div className="flex items-start gap-2">
              <Shield className="w-3 h-3 text-accent mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1 text-xs">What to Expect</h4>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• Fullscreen mode with security monitoring</li>
                  <li>• Timer starts immediately upon viewing</li>
                  <li>• Session cannot be paused or extended</li>
                  <li>• Violations logged on BlockDAG blockchain</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleStartViewing} 
              className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-sm"
            >
              <Shield className="w-4 h-4 mr-1" />
              Start Secure View
            </Button>
            <Button 
              onClick={() => setViewingState('access-key')} 
              variant="outline" 
              className="flex-1 text-sm"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Viewing state - Fullscreen Document Viewer
  if (viewingState === 'viewing') {
    return (
      <FullscreenDocumentViewer
        src={document?.filePath || '/mock-files/Sield Secure Document Platform.txt'}
        documentName={document?.fileName || 'Secure Document'}
        onClose={handleFinishViewing}
        onTimeExpired={() => setViewingState('timeout')}
        timeRemaining={timeRemaining}
        walletAddress={account || viewerWalletAddress}
      />
    );
  }

  // Timeout state - When timer expires
  if (viewingState === 'timeout') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="p-8 bg-gradient-card border-destructive/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">Time's Up</h1>
              <p className="text-muted-foreground">
                Your secure viewing session has ended. The access key has been permanently invalidated.
              </p>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Session Expired</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Viewing sessions are automatically limited to the selected duration</p>
                <p>• This ensures temporary access only and prevents unauthorized sharing</p>
                <p>• Contact the document owner if you need additional time</p>
              </div>
            </div>

            <Button
              onClick={handleBackToHome}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Sield
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Completion state - When user finishes viewing
  if (viewingState === 'complete') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="p-8 bg-gradient-card border-accent/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">Viewing Completed</h1>
              <p className="text-muted-foreground">
                You have successfully completed viewing this document. The access key has been consumed and cannot be used again.
              </p>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Session Completed Successfully</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Your secure viewing session has been completed</p>
                <p>• The access key has been properly consumed</p>
                <p>• This viewing session has been logged on BlockDAG for security</p>
                <p>• Contact the document owner if you need to view again</p>
              </div>
            </div>

            <Button
              onClick={handleBackToHome}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Sield
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Revoked access state
  if (viewingState === 'revoked') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="p-8 bg-gradient-card border-destructive/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">Access Revoked</h1>
              <p className="text-muted-foreground">
                This document access has been revoked by the sender. The viewing session has ended immediately.
              </p>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Access Revocation</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• The document owner has revoked access to this document</p>
                <p>• This could be due to security concerns or policy changes</p>
                <p>• The access key has been permanently invalidated</p>
                <p>• Contact the document owner for a new access grant</p>
              </div>
            </div>

            <Button
              onClick={handleBackToHome}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Sield
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Invalid access key state
  if (viewingState === 'invalid') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="p-8 bg-gradient-card border-destructive/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">Invalid Access Key</h1>
              <p className="text-muted-foreground">
                The access key you provided is not valid or does not exist.
              </p>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Common Issues</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• The access key may be malformed or incomplete</p>
                <p>• The link may have been copied incorrectly</p>
                <p>• The access key may have expired or been revoked</p>
              </div>
            </div>

            <Button
              onClick={() => setViewingState('access-key')}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              Try Another Key
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Expired access key state
  if (viewingState === 'expired') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="p-8 bg-gradient-card border-destructive/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">Access Key Expired</h1>
              <p className="text-muted-foreground">
                This access key expired at {formatExpiry(grant.expiresAt)}.
              </p>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Expired Access</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Access keys automatically expire at the specified time</p>
                <p>• Expired keys cannot be used for viewing documents</p>
                <p>• Contact the document owner for a new access key</p>
              </div>
            </div>

            <Button
              onClick={handleBackToHome}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              Request New Access
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Copy violation state
  if (viewingState === 'copy-violation') {
    return (
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md p-6 bg-gradient-card border-destructive/50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Copy Operation Blocked</h3>
            <p className="text-muted-foreground">
              Copying content is not allowed during secure document viewing. This action has been logged for security purposes.
            </p>
            <Button
              onClick={() => setViewingState('viewing')}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              Continue Viewing
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Security violation state
  if (viewingState === 'security-violation') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="p-8 bg-gradient-card border-destructive/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">Security Policy Violation</h1>
              <p className="text-muted-foreground">
                Your secure document viewing session has been immediately terminated due to a detected security policy violation.
              </p>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Violation Detected</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Sield's security monitoring system detected an attempt to capture, copy, print, or otherwise extract the document content.
              </p>
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-2">
                <p className="text-xs text-destructive font-medium">
                  ⚠️ Session terminated • Access key invalidated • Audit logged on BlockDAG
                </p>
              </div>
            </div>

            <Button
              onClick={handleBackToHome}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Sield
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default Viewer;
