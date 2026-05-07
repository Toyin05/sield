import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Upload, Eye, Clock, X, ExternalLink, AlertTriangle } from "lucide-react";
import { getDocuments, getGrantByKey } from "@/lib/mockServices";
import { useNavigate } from "react-router-dom";

const AuditLog = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [grants, setGrants] = useState<any[]>([]);

  useEffect(() => {
    const docs = getDocuments();
    setDocuments(docs);

    const allGrants = JSON.parse(localStorage.getItem('sield_grants') || '[]');
    setGrants(allGrants);
  }, []);

  // Generate audit events from actual data
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
    ...JSON.parse(localStorage.getItem('sield_security_violations') || '[]').map((violation: any) => ({
      type: "security_violation" as const,
      file: violation.document,
      actor: 'System',
      target: violation.grant,
      timestamp: new Date(violation.timestamp).toLocaleString(),
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      description: `Security violation: ${violation.violationType} (${violation.details})`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  console.log('[auditLog] loaded', auditEvents.length, 'events from actual data');

  const getEventIcon = (type: string) => {
    switch (type) {
      case "upload":
        return Upload;
      case "grant":
      case "revoke":
        return Shield;
      case "access":
        return Eye;
      case "security_violation":
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "upload":
        return "text-secondary";
      case "grant":
        return "text-accent";
      case "revoke":
        return "text-destructive";
      case "access":
        return "text-primary";
      case "security_violation":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getEventDescription = (event: any) => {
    switch (event.type) {
      case "upload":
        return `Uploaded ${event.file}`;
      case "grant":
        return event.description || `Granted access to ${event.target || 'unknown'} for ${event.file}`;
      case "revoke":
        return `Revoked access from ${event.target || 'unknown'} for ${event.file}`;
      case "access":
        return `Accessed ${event.file}`;
      case "expired":
        return `Access to ${event.file} expired`;
      default:
        return "Unknown event";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Audit Log</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Complete history of all document activities on the blockchain
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Events", value: auditEvents.length, icon: Clock },
            { label: "Uploads", value: auditEvents.filter(e => e.type === "upload").length, icon: Upload },
            { label: "Access Grants", value: auditEvents.filter(e => e.type === "grant").length, icon: Shield },
            { label: "File Views", value: auditEvents.filter(e => e.type === "access").length, icon: Eye },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-3 sm:p-4 bg-gradient-card border-border">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary mb-2" />
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Timeline */}
        <Card className="p-4 sm:p-6 bg-gradient-card border-border">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">Activity Timeline</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {auditEvents.map((event, index) => {
              const Icon = getEventIcon(event.type);
              const color = getEventColor(event.type);
              
              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-background rounded-lg border border-border hover:border-secondary/50 transition-all"
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 self-start ${color}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground mb-2 text-sm sm:text-base">
                      {getEventDescription(event)}
                    </p>
                    <div className="space-y-1 sm:space-y-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.timestamp}
                        </span>
                        <span className="font-mono truncate">
                          Actor: {event.actor}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-secondary break-all">
                        Tx: {event.txHash}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0 self-start sm:self-center">
                    <div className="inline-flex items-center gap-1.5 bg-accent/10 px-2 sm:px-3 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full" />
                      <span className="text-xs font-medium text-accent">Verified</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Info */}
        <Card className="p-4 sm:p-6 bg-muted/50 border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">About Audit Logs</h3>
            <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm" className="w-full sm:w-auto">
              ← Back to Dashboard
            </Button>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li>• All events are permanently recorded on the BlockDAG blockchain</li>
            <li>• Logs cannot be modified or deleted, ensuring complete transparency</li>
            <li>• Click on transaction hashes to view details on the block explorer</li>
            <li>• Audit logs provide proof for legal compliance and accountability</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLog;

