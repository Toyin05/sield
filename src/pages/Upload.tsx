import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, File, Lock, Server, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { blockDAGService } from "@/lib/blockchain";
import { ipfsService } from "@/lib/ipfs";
import { EncryptionService } from "@/lib/encryption";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<{ cid: string; key: string } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 50MB for demo)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 50MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setUploadStage("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      // Step 1: Encrypt file
      setUploadStage("Encrypting file with AES-256...");
      const { encryptedData, key } = await EncryptionService.encryptFile(selectedFile);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Upload to IPFS
      setUploadStage("Uploading to IPFS...");
      const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });
      const cid = await ipfsService.uploadFile(encryptedBlob);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Record on blockchain (mock for demo)
      setUploadStage("Recording metadata on BlockDAG...");
      // For demo purposes, we'll simulate the blockchain transaction
      // In production, this would connect to actual BlockDAG network
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUploadStage("Complete!");
      setUploadedFile({ cid, key });

      toast({
        title: "Upload Successful",
        description: "Your document has been encrypted and stored securely.",
      });

      // Auto-redirect to access control after success
      setTimeout(() => {
        navigate("/access-control");
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
      setUploading(false);
      setUploadStage("");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Document</h1>
          <p className="text-muted-foreground">
            Securely encrypt and store your legal documents on the blockchain
          </p>
        </div>

        <Card className="p-8 bg-gradient-card border-border">
          {!selectedFile ? (
            <label className="flex flex-col items-center justify-center min-h-[400px] cursor-pointer border-2 border-dashed border-border hover:border-secondary/50 rounded-xl transition-all group">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
              />
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadIcon className="w-10 h-10 text-secondary" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground mb-2">
                    Choose a file to upload
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Supports PDF, DOC, DOCX, TXT, PNG, JPG (Max 50MB)
                  </p>
                </div>
                <Button variant="outline" className="mt-4">
                  Browse Files
                </Button>
              </div>
            </label>
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <File className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!uploading && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              {/* Upload Process */}
              {uploading ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { icon: Lock, text: "Encrypting file with AES-256...", stage: 1 },
                      { icon: Server, text: "Uploading to IPFS...", stage: 2 },
                      { icon: CheckCircle2, text: "Recording metadata on BlockDAG...", stage: 3 },
                    ].map((step, index) => {
                      const Icon = step.icon;
                      const isActive = uploadStage.includes(step.text.split("...")[0]);
                      const isComplete = uploadStage === "Complete!" && step.stage <= 3;
                      
                      return (
                        <div 
                          key={index}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isActive || isComplete ? "bg-secondary/10" : "bg-muted/50"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${
                            isActive || isComplete ? "text-secondary" : "text-muted-foreground"
                          }`} />
                          <span className={`text-sm ${
                            isActive || isComplete ? "text-foreground font-medium" : "text-muted-foreground"
                          }`}>
                            {step.text}
                          </span>
                          {isComplete && (
                            <CheckCircle2 className="w-5 h-5 text-accent ml-auto" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {uploadStage === "Complete!" && (
                    <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                      <p className="text-accent font-medium text-center">
                        ✓ Upload successful! Your document is now secured on the blockchain.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={handleUpload}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-glow-cyan"
                    size="lg"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Encrypt and Upload
                  </Button>

                  {uploadedFile && (
                    <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-accent font-medium">Upload Complete!</p>
                          <p className="text-sm text-muted-foreground">Ready to manage access permissions</p>
                        </div>
                        <Button
                          onClick={() => navigate("/access-control")}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          Manage Access
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Security Info */}
              <div className="grid md:grid-cols-3 gap-4 pt-4">
                {[
                  { icon: Lock, title: "AES-256 Encryption", desc: "Military-grade security" },
                  { icon: Server, title: "IPFS Storage", desc: "Decentralized & permanent" },
                  { icon: CheckCircle2, title: "Blockchain Verified", desc: "Immutable proof" },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="text-center p-4">
                      <Icon className="w-6 h-6 text-secondary mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Info Box */}
        <Card className="p-6 bg-muted/50 border-border">
          <h3 className="font-semibold text-foreground mb-3">How It Works</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Your file is encrypted client-side using AES-256 encryption</li>
            <li>2. The encrypted file is uploaded to IPFS for decentralized storage</li>
            <li>3. File metadata and access permissions are recorded on the BlockDAG blockchain</li>
            <li>4. Only you and authorized users can decrypt and access the file</li>
          </ol>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Upload;

