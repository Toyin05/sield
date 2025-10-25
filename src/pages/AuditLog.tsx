import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { FileText, Shield, Upload, Eye, Clock } from "lucide-react";

const AuditLog = () => {
  // Mock audit data - would come from blockchain events
  const auditEvents = [
    {
      type: "upload",
      file: "Contract_Agreement_2025.pdf",
      actor: "0x742d...5432",
      timestamp: "2025-01-15 14:32:00",
      txHash: "0xabcd...1234",
    },
    {
      type: "grant",
      file: "Contract_Agreement_2025.pdf",
      actor: "0x742d...5432",
      target: "0x123a...8765",
      timestamp: "2025-01-15 14:35:00",
      txHash: "0xabcd...5678",
    },
    {
      type: "access",
      file: "Legal_Brief_Case_442.docx",
      actor: "0x123a...8765",
      timestamp: "2025-01-14 16:20:00",
      txHash: "0xabcd...9012",
    },
    {
      type: "upload",
      file: "Legal_Brief_Case_442.docx",
      actor: "0x742d...5432",
      timestamp: "2025-01-14 10:15:00",
      txHash: "0xabcd...3456",
    },
    {
      type: "revoke",
      file: "Evidence_Document_A.pdf",
      actor: "0x742d...5432",
      target: "0x456b...9876",
      timestamp: "2025-01-13 09:45:00",
      txHash: "0xabcd...7890",
    },
    {
      type: "grant",
      file: "Evidence_Document_A.pdf",
      actor: "0x742d...5432",
      target: "0x123a...8765",
      timestamp: "2025-01-12 13:30:00",
      txHash: "0xabcd...2468",
    },
    {
      type: "upload",
      file: "Evidence_Document_A.pdf",
      actor: "0x742d...5432",
      timestamp: "2025-01-12 11:00:00",
      txHash: "0xabcd...1357",
    },
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case "upload":
        return Upload;
      case "grant":
      case "revoke":
        return Shield;
      case "access":
        return Eye;
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
      default:
        return "text-muted-foreground";
    }
  };

  const getEventDescription = (event: any) => {
    switch (event.type) {
      case "upload":
        return `Uploaded ${event.file}`;
      case "grant":
        return `Granted access to ${event.target} for ${event.file}`;
      case "revoke":
        return `Revoked access from ${event.target} for ${event.file}`;
      case "access":
        return `Accessed ${event.file}`;
      default:
        return "Unknown event";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Audit Log</h1>
          <p className="text-muted-foreground">
            Complete history of all document activities on the blockchain
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: auditEvents.length, icon: Clock },
            { label: "Uploads", value: auditEvents.filter(e => e.type === "upload").length, icon: Upload },
            { label: "Access Grants", value: auditEvents.filter(e => e.type === "grant").length, icon: Shield },
            { label: "File Views", value: auditEvents.filter(e => e.type === "access").length, icon: Eye },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4 bg-gradient-card border-border">
                <Icon className="w-5 h-5 text-secondary mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Timeline */}
        <Card className="p-6 bg-gradient-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">Activity Timeline</h2>
          
          <div className="space-y-4">
            {auditEvents.map((event, index) => {
              const Icon = getEventIcon(event.type);
              const color = getEventColor(event.type);
              
              return (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-background rounded-lg border border-border hover:border-secondary/50 transition-all"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground mb-1">
                      {getEventDescription(event)}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.timestamp}
                      </span>
                      <span className="font-mono">
                        Actor: {event.actor}
                      </span>
                      <span className="font-mono text-secondary cursor-pointer hover:underline">
                        Tx: {event.txHash}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center gap-1.5 bg-accent/10 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      <span className="text-xs font-medium text-accent">Verified</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Info */}
        <Card className="p-6 bg-muted/50 border-border">
          <h3 className="font-semibold text-foreground mb-3">About Audit Logs</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
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
