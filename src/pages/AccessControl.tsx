import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, UserPlus, UserMinus, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AccessControl = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState("");
  const { toast } = useToast();

  // Mock data
  const files = [
    { 
      id: "1",
      name: "Contract_Agreement_2025.pdf", 
      shared: ["0x742d...5432", "0x123a...8765"]
    },
    { 
      id: "2",
      name: "Legal_Brief_Case_442.docx", 
      shared: ["0x742d...5432"]
    },
    { 
      id: "3",
      name: "Evidence_Document_A.pdf", 
      shared: ["0x742d...5432", "0x123a...8765", "0x456b...9876"]
    },
  ];

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

  const handleRevokeAccess = (address: string) => {
    // Here would be the smart contract call to revoke access
    toast({
      title: "Access Revoked",
      description: `Access revoked for ${address}`,
    });
  };

  const selectedFileData = files.find(f => f.id === selectedFile);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Access Control</h1>
          <p className="text-muted-foreground">
            Manage who can view and access your documents
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* File Selection */}
          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <File className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Select Document</h2>
            </div>

            <div className="space-y-3">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedFile === file.id
                      ? "border-secondary bg-secondary/5"
                      : "border-border hover:border-secondary/50 bg-background"
                  }`}
                >
                  <p className="font-medium text-foreground mb-1">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Shared with {file.shared.length} {file.shared.length === 1 ? "user" : "users"}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Grant Access */}
          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Grant Access</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Wallet Address
                </label>
                <Input
                  placeholder="0x..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  disabled={!selectedFile}
                  className="font-mono"
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

              {!selectedFile && (
                <p className="text-sm text-muted-foreground text-center">
                  Select a document to grant access
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Current Access List */}
        {selectedFileData && (
          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Access Permissions
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedFileData.name}
                </p>
              </div>
            </div>

            {selectedFileData.shared.length > 0 ? (
              <div className="space-y-3">
                {selectedFileData.shared.map((address, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-foreground">{address}</p>
                        <p className="text-xs text-muted-foreground">Read & Download Access</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeAccess(address)}
                      className="text-destructive hover:text-destructive"
                    >
                      <UserMinus className="w-4 h-4 mr-1" />
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No users have access to this document yet
              </div>
            )}
          </Card>
        )}

        {/* Info */}
        <Card className="p-6 bg-muted/50 border-border">
          <h3 className="font-semibold text-foreground mb-3">Access Control</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Grant access to specific wallet addresses</li>
            <li>• All access changes are recorded on the blockchain</li>
            <li>• Users need the correct wallet to decrypt and view files</li>
            <li>• You can revoke access at any time</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccessControl;
