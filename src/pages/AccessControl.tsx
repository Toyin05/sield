import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, UserMinus, File, ExternalLink, Clock, Eye, CheckCircle, AlertTriangle, Settings, Key, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getDocuments, getGrantByKey, revokeGrant } from "@/lib/mockServices";

const AccessControl = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState("");
  const [bulkAddresses, setBulkAddresses] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [grants, setGrants] = useState<any[]>([]);

  useEffect(() => {
    const docs = getDocuments();
    setDocuments(docs);

    const allGrants = JSON.parse(localStorage.getItem('sield_grants') || '[]');
    setGrants(allGrants);
  }, []);

  // Generate files data from actual documents and grants
  const files = documents.map(doc => {
    const docGrants = grants.filter(g => g.docId === doc.docId);
    const sharedAddresses = docGrants.map(g => g.viewerAddress).filter(Boolean);
    return {
      id: doc.docId,
      name: doc.fileName,
      shared: sharedAddresses,
      grants: docGrants
    };
  });

  const handleGrantAccess = () => {
    if (!selectedFile || !newAddress) {
      toast({
        title: "Missing Information",
        description: "Please select a file and enter a wallet address",
        variant: "destructive",
      });
      return;
    }

    // Here would be the smart contract call to grant access
    toast({
      title: "Access Granted",
      description: `Access granted to ${newAddress.substring(0, 6)}...${newAddress.substring(newAddress.length - 4)}`,
    });
    setNewAddress("");
  };

  const handleBulkGrantAccess = () => {
    if (!selectedFile || !bulkAddresses.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a file and enter wallet addresses",
        variant: "destructive",
      });
      return;
    }

    const addresses = bulkAddresses.split('\n').map(addr => addr.trim()).filter(addr => addr);
    const validAddresses = addresses.filter(addr => /^0x[a-fA-F0-9]{40}$/.test(addr));

    if (validAddresses.length === 0) {
      toast({
        title: "No Valid Addresses",
        description: "Please enter valid Ethereum addresses (one per line)",
        variant: "destructive",
      });
      return;
    }

    // Here would be the smart contract calls to grant access to multiple addresses
    toast({
      title: "Bulk Access Granted",
      description: `Access granted to ${validAddresses.length} wallet address${validAddresses.length > 1 ? 'es' : ''}`,
    });
    setBulkAddresses("");
  };

  const handleRevokeAccess = (address: string) => {
    console.log(`[accessControl] revoking access for address: ${address} on file: ${selectedFile}`);

    // Find and revoke the grant
    const grantToRevoke = grants.find(g =>
      g.docId === selectedFile &&
      g.viewerAddress === address &&
      !g.used &&
      Date.now() <= g.expiresAt
    );

    if (grantToRevoke) {
      revokeGrant(grantToRevoke.accessKey);
      console.log(`[accessControl] successfully revoked grant: ${grantToRevoke.accessKey}`);

      // Refresh grants
      const allGrants = JSON.parse(localStorage.getItem('sield_grants') || '[]');
      setGrants(allGrants);

      toast({
        title: "Access Revoked",
        description: `Access revoked for ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      });
    } else {
      console.log(`[accessControl] no active grant found for address: ${address}`);
      toast({
        title: "No Active Grant",
        description: "No active access grant found for this address",
        variant: "destructive",
      });
    }
  };

  const selectedFileData = files.find(f => f.id === selectedFile);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Access Control</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage who can view and access your documents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* File Selection */}
          <Card className="p-4 sm:p-6 bg-gradient-card border-border">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <File className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Select Document</h2>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file.id)}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all ${
                    selectedFile === file.id
                      ? "border-secondary bg-secondary/5"
                      : "border-border hover:border-secondary/50 bg-background"
                  }`}
                >
                  <p className="font-medium text-foreground mb-1 text-sm sm:text-base truncate">{file.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Shared with {file.shared.length} {file.shared.length === 1 ? "user" : "users"}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Grant Access */}
          <Card className="p-4 sm:p-6 bg-gradient-card border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Grant Access</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
              >
                <Settings className="w-4 h-4 mr-1" />
                {showAdvanced ? 'Simple' : 'Advanced'}
              </Button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {!showAdvanced ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Wallet Address
                    </label>
                    <Input
                      placeholder="0x..."
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      disabled={!selectedFile}
                      className="font-mono text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleGrantAccess}
                    disabled={!selectedFile || !newAddress}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Grant Access
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Wallet Addresses (one per line)
                    </label>
                    <textarea
                      placeholder="0x742d35Cc6634C0532925a3b844Bc454e4438f44e&#10;0x1234567890123456789012345678901234567890"
                      value={bulkAddresses}
                      onChange={(e) => setBulkAddresses(e.target.value)}
                      disabled={!selectedFile}
                      className="w-full h-24 sm:h-32 p-3 border border-input rounded-md bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>

                  <Button
                    onClick={handleBulkGrantAccess}
                    disabled={!selectedFile || !bulkAddresses.trim()}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Grant Bulk Access
                  </Button>
                </>
              )}

              {!selectedFile && (
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Select a document to grant access
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Current Access List */}
        {selectedFileData && (
          <Card className="p-4 sm:p-6 bg-gradient-card border-border">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                  Access Permissions
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {selectedFileData.name}
                </p>
              </div>
            </div>

            {selectedFileData.shared.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {selectedFileData.grants
                  .filter(grant => grant.viewerAddress) // Only show grants with addresses
                  .map((grant, index) => {
                    const isActive = !grant.used && Date.now() <= grant.expiresAt;
                    const isExpired = Date.now() > grant.expiresAt;
                    const isUsed = grant.used;

                    let statusBadge;
                    let statusColor = "text-muted-foreground";

                    if (isActive) {
                      statusBadge = <Badge variant="default" className="text-xs">Active</Badge>;
                      statusColor = "text-green-600";
                    } else if (isUsed) {
                      statusBadge = <Badge variant="secondary" className="text-xs">Used</Badge>;
                      statusColor = "text-blue-600";
                    } else if (isExpired) {
                      statusBadge = <Badge variant="destructive" className="text-xs">Expired</Badge>;
                      statusColor = "text-red-600";
                    }

                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-background rounded-lg border border-border gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isActive ? 'bg-green-100' : isUsed ? 'bg-blue-100' : 'bg-red-100'
                          }`}>
                            {isActive ? (
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            ) : isUsed ? (
                              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            ) : (
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <p className="font-mono text-xs sm:text-sm text-foreground truncate">{grant.viewerAddress}</p>
                              {statusBadge}
                            </div>
                            <p className={`text-xs ${statusColor}`}>
                              {isActive ? 'Active access' : isUsed ? 'Access used' : 'Access expired'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Expires: {new Date(grant.expiresAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeAccess(grant.viewerAddress)}
                            className="text-destructive hover:text-destructive border-destructive/20 hover:border-destructive w-full sm:w-auto"
                          >
                            <UserMinus className="w-4 h-4 mr-1" />
                            Revoke Access
                          </Button>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No Access Granted</h3>
                <p className="text-sm sm:text-base text-muted-foreground px-4">
                  This document hasn't been shared with any wallet addresses yet.
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Advanced Features */}
        <Card className="p-4 sm:p-6 bg-gradient-card border-border">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Key className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Advanced Access Control</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Enterprise-grade security features</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-background rounded-lg border border-border">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-secondary mb-2" />
              <h3 className="font-medium text-foreground mb-1 text-sm sm:text-base">Role-Based Access</h3>
              <p className="text-xs text-muted-foreground">Assign different permission levels to users</p>
            </div>
            <div className="p-3 sm:p-4 bg-background rounded-lg border border-border">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-accent mb-2" />
              <h3 className="font-medium text-foreground mb-1 text-sm sm:text-base">Time-Limited Grants</h3>
              <p className="text-xs text-muted-foreground">Set automatic expiration for access rights</p>
            </div>
            <div className="p-3 sm:p-4 bg-background rounded-lg border border-border">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive mb-2" />
              <h3 className="font-medium text-foreground mb-1 text-sm sm:text-base">Emergency Revoke</h3>
              <p className="text-xs text-muted-foreground">Instantly revoke access in case of compromise</p>
            </div>
          </div>
        </Card>

        {/* Info */}
        <Card className="p-4 sm:p-6 bg-muted/50 border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Access Control</h3>
            <Button onClick={() => navigate('/audit-log')} variant="outline" size="sm" className="w-full sm:w-auto">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Audit Log
            </Button>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li>• Grant access to specific wallet addresses or bulk import multiple users</li>
            <li>• All access changes are recorded on the blockchain for complete transparency</li>
            <li>• Users need the correct wallet to decrypt and view files securely</li>
            <li>• Advanced features include role-based access and emergency revocation</li>
            <li>• You can revoke access at any time with immediate effect</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccessControl;

