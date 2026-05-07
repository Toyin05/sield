import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, File, Lock, Server, CheckCircle2, ArrowRight, Shield, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { uploadDocument } from "@/lib/mockServices";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<{ docId: string; fileName: string } | null>(null);
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
      // Step 1: Simulate encryption
      setUploadStage("Encrypting file with AES-256-GCM...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Simulate IPFS upload
      setUploadStage("Uploading encrypted file to IPFS...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Simulate blockchain recording
      setUploadStage("Recording metadata on BlockDAG...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Add to mock documents
      setUploadStage("Adding to secure document vault...");
      const filePath = `/mock-files/UPLOADED_${selectedFile.name}`;
      // Use a mock account for authenticated users (no wallet required)
      const mockAccount = "authenticated-user";
      const uploadedDoc = uploadDocument(selectedFile.name, filePath, selectedFile.size, mockAccount);

      setUploadStage("Complete!");
      setUploadedFile({ docId: uploadedDoc.docId, fileName: selectedFile.name });

      toast({
        title: "Document Secured Successfully",
        description: "Your document has been encrypted and stored securely on the blockchain network.",
      });

      // Auto-redirect to dashboard after success
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
      setUploadStage("");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Upload Document</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Securely encrypt and store your legal documents on the blockchain
          </p>
        </div>

        <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-card border-border">

          {!selectedFile ? (
            <label className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] cursor-pointer border-2 border-dashed border-border hover:border-secondary/50 rounded-xl transition-all group">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
              />
              <div className="text-center space-y-3 sm:space-y-4 p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadIcon className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                    Choose a file to upload
                  </p>
                  <p className="text-muted-foreground text-xs sm:text-sm px-4">
                    Supports PDF, DOC, DOCX, TXT, PNG, JPG (Max 50MB)
                  </p>
                </div>
                <Button variant="outline" className="mt-4 w-full sm:w-auto" onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}>
                  Browse Files
                </Button>
              </div>
            </label>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* File Info */}
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-background rounded-lg border border-border">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <File className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm sm:text-base truncate">{selectedFile.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="flex-shrink-0"
                  >
                    Remove
                  </Button>
                )}
              </div>

              {/* Upload Process */}
              {uploading ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      { icon: Lock, text: "Encrypting file with AES-256...", stage: 1 },
                      { icon: Server, text: "Uploading to IPFS...", stage: 2 },
                      { icon: CheckCircle2, text: "Recording metadata on BlockDAG...", stage: 3 },
                    ].map((step, index) => {
                      const Icon = step.icon;
                      const stageText = step.text.split("...")[0];
                      const isActive = uploadStage.includes(stageText);
                      const currentStage = uploadStage === "Complete!"
                        ? 4
                        : uploadStage.includes('Encrypting')
                          ? 1
                          : uploadStage.includes('Uploading')
                            ? 2
                            : uploadStage.includes('Recording')
                              ? 3
                              : 0;
                      const isComplete = step.stage < currentStage || (uploadStage === "Complete!" && step.stage <= 3);
                      
                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg ${
                            isActive || isComplete ? "bg-secondary/10" : "bg-muted/50"
                          }`}
                        >
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                            isActive || isComplete ? "text-secondary" : "text-muted-foreground"
                          }`} />
                          <span className={`text-xs sm:text-sm ${
                            isActive || isComplete ? "text-foreground font-medium" : "text-muted-foreground"
                          }`}>
                            {step.text}
                          </span>
                          {isComplete && (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent ml-auto flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {uploadStage === "Complete!" && (
                    <div className="p-3 sm:p-4 bg-accent/10 border border-accent/30 rounded-lg">
                      <p className="text-accent font-medium text-center text-sm sm:text-base">
                        ✓ Upload successful! Your document is now secured on the blockchain.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <Button
                    onClick={handleUpload}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-glow-cyan"
                    size="lg"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Encrypt and Upload
                  </Button>

                  {uploadedFile && (
                    <div className="p-3 sm:p-4 bg-accent/10 border border-accent/30 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-accent font-medium text-sm sm:text-base">Upload Complete!</p>
                          <p className="text-xs text-sm text-muted-foreground">Document added to your dashboard</p>
                        </div>
                        <Button
                          onClick={() => navigate("/dashboard")}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
                        >
                          View Dashboard
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Security Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4">
                {[
                  { icon: Lock, title: "AES-256 Encryption", desc: "Military-grade security" },
                  { icon: Server, title: "IPFS Storage", desc: "Decentralized & permanent" },
                  { icon: CheckCircle2, title: "Blockchain Verified", desc: "Immutable proof" },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="text-center p-3 sm:p-4">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary mx-auto mb-2" />
                      <p className="text-xs text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Info Box */}
        <Card className="p-4 sm:p-6 bg-muted/50 border-border">
          <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">How It Works</h3>
          <ol className="space-y-2 text-xs sm:text-sm text-muted-foreground">
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
