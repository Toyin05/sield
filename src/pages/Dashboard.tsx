import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { FileText, Shield, Clock, Upload, Eye, UserPlus, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletProvider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthProvider";
import GrantModal from "@/components/GrantModal";
import { getDocuments, getGrantByKey, revokeGrant } from "@/lib/mockServices";
import { Document, Grant } from "@/lib/mockServices";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, isLoading: walletLoading } = useWallet();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);

  const hasAccess = isConnected || isAuthenticated;

  // Load documents and grants
  useEffect(() => {
    if (!hasAccess) return;
    console.log('[dashboard] loading documents and grants');
    const docs = getDocuments();
    console.log('[dashboard] loaded documents:', docs);
    setDocuments(docs);

    // Load all grants from localStorage
    const allGrants = JSON.parse(localStorage.getItem('sield_grants') || '[]');
    console.log('[dashboard] loaded grants:', allGrants);
    setGrants(allGrants);
  }, [hasAccess]);

  // Refresh documents when navigating back from upload
  useEffect(() => {
    const handleFocus = () => {
      if (hasAccess) {
        console.log('[dashboard] window focus - refreshing documents');
        const docs = getDocuments();
        setDocuments(docs);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [hasAccess]);

  // Auto-refresh grants every 5 seconds to show real-time updates
  useEffect(() => {
    console.log('[dashboard] setting up auto-refresh interval - hasAccess:', hasAccess);
    
    const interval = setInterval(() => {
      console.log('[dashboard] auto-refreshing grants');
      if (hasAccess) {
        const allGrants = JSON.parse(localStorage.getItem('sield_grants') || '[]');
        setGrants(allGrants);
      }
    }, 5000);

    return () => {
      console.log('[dashboard] clearing auto-refresh interval');
      clearInterval(interval);
    };
  }, [hasAccess]);

  // Show loading while checking access state
  if (walletLoading || authLoading) {
    console.log('[dashboard] showing loading screen - walletLoading/authLoading');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // DashboardLayout will render the correct "sign in / connect" screen.
  if (!hasAccess) return null;

  console.log('[dashboard] rendering dashboard content - all checks passed');
  console.log('[dashboard] documents count:', documents?.length || 0, 'documents:', documents);
  console.log('[dashboard] grants count:', grants?.length || 0, 'grants:', grants);
  console.log('[dashboard] isConnected:', isConnected, 'hasAccess:', hasAccess);

  const handleGrantAccess = (docId: string) => {
    console.log(`[dashboard] open GrantModal for docId: ${docId}`);
    setSelectedDocId(docId);
    setGrantModalOpen(true);
  };

  const handleGrantCreated = () => {
    console.log('[dashboard] grantCreated called - refreshing grants');
    // Refresh grants
    const allGrants = JSON.parse(localStorage.getItem('sield_grants') || '[]');
    setGrants(allGrants);
    console.log('[dashboard] grantCreated - refreshed grants list:', allGrants.length, 'grants');
  };

  console.log('[dashboard] about to render JSX - documents:', documents?.length || 0, 'grants:', grants?.length || 0);

  const getGrantsForDoc = (docId: string) => {
    return grants.filter(g => g.docId === docId);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getGrantStatus = (grant: Grant) => {
    if (grant.revoked) return { label: "Revoked", variant: "destructive" as const };
    if (Date.now() > grant.expiresAt) return { label: "Expired", variant: "destructive" as const };
    if (grant.used) return { label: "Viewing completed", variant: "default" as const };
    return { label: "Active", variant: "default" as const };
  };

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const diffMs = expiresAt - now;
    if (diffMs <= 0) return "Expired";

    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes % 60}m`;
    }
    return `${diffMinutes}m`;
  };

  const handleRevokeGrant = (accessKey: string) => {
    console.log(`[dashboard] revoking grant: ${accessKey}`);
    
    // Use localStorage directly to ensure proper data structure
    const allGrants = JSON.parse(localStorage.getItem('sield_grants') || '[]');
    const grantIndex = allGrants.findIndex((g: Grant) => g.accessKey === accessKey);
    
    if (grantIndex !== -1) {
      allGrants[grantIndex].revoked = true;
      allGrants[grantIndex].used = true; // Also mark as used to prevent further access
      localStorage.setItem('sield_grants', JSON.stringify(allGrants));
      
      // Update state immediately
      setGrants([...allGrants]);
      
      console.log(`[dashboard] grant revoked and state updated`);
      
      // Show success message
      toast({
        title: "Access Revoked",
        description: "The document access has been successfully revoked",
      });
    } else {
      console.log(`[dashboard] grant not found: ${accessKey}`);
    }
  };

  // Stats from actual data
  const stats = [
    { label: "Total Documents", value: documents.length.toString(), icon: FileText, color: "text-secondary" },
    { label: "Active Grants", value: grants.filter(g => !g.used && Date.now() <= g.expiresAt).length.toString(), icon: Shield, color: "text-accent" },
    { label: "Total Grants", value: grants.length.toString(), icon: Clock, color: "text-primary" },
  ];

  console.log('[dashboard] returning JSX now - final check');

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="bg-gradient-hero rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-primary-foreground">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Welcome to Sield</h1>
            <p className="text-sm sm:text-base lg:text-lg text-primary-foreground/80">Your secure blockchain-powered document management system</p>
            <Button
              onClick={() => navigate("/upload")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow-success w-full sm:w-auto"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload New Document
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4 sm:p-6 bg-gradient-card border-border hover:border-secondary/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground text-xs sm:text-sm mb-1">{stat.label}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Documents */}
        <Card className="p-4 sm:p-6 bg-gradient-card border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Your Documents</h2>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              View All
            </Button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {documents && documents.length > 0 ? (
              documents.map((doc, index) => {
                const docGrants = getGrantsForDoc(doc.docId);
                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-background rounded-lg border border-border hover:border-secondary/50 transition-all cursor-pointer group gap-3"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground group-hover:text-secondary transition-colors text-sm sm:text-base truncate">{doc.fileName}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {(doc.sizeBytes / 1024 / 1024).toFixed(1)} MB • {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-left sm:text-right">
                        <div className="inline-flex items-center gap-1.5 bg-accent/10 px-2 sm:px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span className="text-xs font-medium text-accent">Available</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{docGrants.length} grants</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGrantAccess(doc.docId);
                        }}
                        className="bg-background hover:bg-secondary text-foreground hover:text-secondary-foreground border-border hover:border-secondary transition-all flex-shrink-0"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Grant Access</span>
                        <span className="sm:hidden">Grant</span>
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 sm:py-12">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No Documents Yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
                  Upload your first document to get started with secure sharing.
                </p>
                <Button onClick={() => navigate("/upload")} className="w-full sm:w-auto">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Active Grants */}
        {grants.filter(g => !g.used && Date.now() <= g.expiresAt).length > 0 && (
          <Card className="p-4 sm:p-6 bg-gradient-card border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Active Grants</h2>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Real-time updates every 5 seconds
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {grants.filter(g => !g.used && Date.now() <= g.expiresAt).map((grant) => {
                const doc = documents.find(d => d.docId === grant.docId);
                return (
                  <div key={grant.accessKey} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-background rounded-lg border border-border gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm sm:text-base truncate">{doc?.fileName || 'Unknown'}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {grant.viewerAddress ? `${grant.viewerAddress.slice(0, 6)}...${grant.viewerAddress.slice(-4)}` : 'Any wallet'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-left sm:text-right">
                        <div className="inline-flex items-center gap-1.5 bg-accent/10 px-2 sm:px-3 py-1 rounded-full">
                          <Clock className="w-3 h-3 text-accent" />
                          <span className="text-xs font-medium text-accent">{getTimeRemaining(grant.expiresAt)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Active</p>
                      </div>
                      <div className="flex flex-col gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRevokeGrant(grant.accessKey)}
                          className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
                        >
                          <X className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Revoke Access</span>
                          <span className="sm:hidden">Revoke</span>
                        </Button>
                        <p className="text-xs text-muted-foreground text-center hidden sm:block">
                          ⚠️ Cannot revoke after viewing starts
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Recent Activity - First 5 items from audit log */}
        <Card className="p-4 sm:p-6 bg-gradient-card border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recent Activity</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/audit-log')} className="w-full sm:w-auto">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All Activity
            </Button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {(() => {
              // Generate audit events from actual data (same logic as AuditLog.tsx)
              const auditEvents = [
                // Upload events
                ...documents.map(doc => ({
                  type: "upload" as const,
                  file: doc.fileName,
                  actor: doc.owner,
                  timestamp: new Date(doc.uploadedAt).toLocaleString(),
                  txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
                })),
                // Grant events (including revoked ones)
                ...grants.map(grant => {
                  const doc = documents.find(d => d.docId === grant.docId);
                  let eventType: "grant" | "access" | "revoke" | "expired" = "grant";
                  let description = "";

                  if (grant.revoked) {
                    // Explicitly revoked access
                    eventType = "revoke";
                    description = "Access manually revoked by sender";
                  } else if (grant.used) {
                    // Document was accessed
                    if (Date.now() > grant.expiresAt) {
                      eventType = "expired";
                      description = "Access expired naturally";
                    } else {
                      eventType = "access";
                      description = "Document accessed and viewed";
                    }
                  } else {
                    // Grant created but not used or revoked yet
                    description = `Granted access to ${grant.viewerAddress || 'anyone'} for ${doc?.fileName || 'Unknown'}`;
                  }

                  return {
                    type: eventType,
                    file: doc?.fileName || 'Unknown',
                    actor: grant.viewerAddress || 'System',
                    target: grant.viewerAddress,
                    timestamp: new Date(grant.createdAt).toLocaleString(),
                    txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
                    description,
                  };
                }),
                // Security violations
                ...JSON.parse(localStorage.getItem('sield_security_violations') || '[]').map((violation: unknown) => {
                  const v = violation as { document?: string; grant?: string; timestamp?: number; violationType?: string; details?: string };
                  return {
                    type: "security_violation" as const,
                    file: v?.document || 'Unknown',
                    actor: 'System',
                    target: v?.grant || '',
                    timestamp: new Date(v?.timestamp || Date.now()).toLocaleString(),
                    txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
                    description: `Security violation: ${v?.violationType || 'Unknown'} (${v?.details || 'No details'})`,
                  };
                }),
              ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

              // Return first 5 items
              return auditEvents.slice(0, 5).map((event, index) => {
                let icon = Shield;
                let color = "text-accent";
                let activityType = "Activity";

                switch (event.type) {
                  case "upload":
                    icon = Upload;
                    color = "text-secondary";
                    activityType = `Uploaded ${event.file}`;
                    break;
                  case "grant":
                    icon = Shield;
                    color = "text-accent";
                    activityType = event.description || `Granted access to ${event.target || 'unknown'} for ${event.file}`;
                    break;
                  case "revoke":
                    icon = X;
                    color = "text-destructive";
                    activityType = `Revoked access from ${event.target || 'unknown'} for ${event.file}`;
                    break;
                  case "access":
                    icon = Eye;
                    color = "text-primary";
                    activityType = `Accessed ${event.file}`;
                    break;
                  case "expired":
                    icon = Clock;
                    color = "text-muted-foreground";
                    activityType = `Access to ${event.file} expired`;
                    break;
                  case "security_violation":
                    icon = Shield;
                    color = "text-destructive";
                    activityType = event.description || "Security violation detected";
                    break;
                }

                const IconComponent = icon;
                return (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-background rounded-lg border border-border gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 ${color}`}>
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm sm:text-base truncate">{activityType}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {event.actor} • {event.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <Badge variant="outline" className="text-xs">
                        {event.type.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground hidden sm:block">Tx: {event.txHash}</p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </Card>

        {/* Grant Modal */}
        <GrantModal
          isOpen={grantModalOpen}
          onClose={() => {
            setGrantModalOpen(false);
            handleGrantCreated();
          }}
          docId={selectedDocId}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
