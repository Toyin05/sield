import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Copy, CheckCircle, Clock, User, ArrowRight, Link, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createGrant, getDocumentById, revokeGrant } from "@/lib/mockServices";
import { useNavigate } from "react-router-dom";

interface GrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
}

const GrantModal: React.FC<GrantModalProps> = ({ isOpen, onClose, docId }) => {
  const [viewerAddress, setViewerAddress] = useState("");
  const [duration, setDuration] = useState("10");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGrant, setGeneratedGrant] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const durationOptions = [
    { value: "1", label: "1 minute", minutes: 1 },
    { value: "5", label: "5 minutes", minutes: 5 },
    { value: "10", label: "10 minutes", minutes: 10 },
    { value: "30", label: "30 minutes", minutes: 30 },
    { value: "60", label: "1 hour", minutes: 60 },
    { value: "1440", label: "24 hours", minutes: 1440 },
  ];

  const validateAddress = (address: string): boolean => {
    if (!address) return true; // Optional
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleGenerate = async () => {
    // Viewer address is optional - validate only if provided
    if (viewerAddress && !validateAddress(viewerAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address (0x...) or leave empty for general access",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    const durationMinutes = parseInt(duration);
    console.log(`[grantModal] generating grant for doc ${docId} viewer ${viewerAddress || 'general access'} duration ${duration} (${durationMinutes} minutes)`);

    try {
      const grant = createGrant({
        docId,
        viewerAddress: viewerAddress || null,
        durationMinutes,
      });

      setGeneratedGrant(grant);
      console.log(`[grantModal] created key ${grant.accessKey} for ${viewerAddress || 'general access'}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create access grant",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedGrant) {
      await navigator.clipboard.writeText(generatedGrant.accessKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Access key copied to clipboard",
      });
    }
  };

  const handleCopyLink = async () => {
    if (generatedGrant) {
      const link = `${window.location.origin}/viewer?key=${generatedGrant.accessKey}`;
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Viewer link copied to clipboard",
      });
    }
  };

  const handleGoToViewer = () => {
    navigate(`/viewer?key=${generatedGrant.accessKey}`);
    onClose();
  };

  const handleBackToDashboard = () => {
    // Refresh grants immediately
    console.log('[grantModal] refreshing grants after generation');
    const allGrants = JSON.parse(localStorage.getItem('sield_grants') || '[]');
    // Trigger a refresh by updating the grants in localStorage with current timestamp
    localStorage.setItem('sield_grants', JSON.stringify(allGrants));
    onClose();
    setGeneratedGrant(null);
    setViewerAddress("");
    setDuration("10");
  };

  const document = getDocumentById(docId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            Grant Access
          </DialogTitle>
        </DialogHeader>

        {!generatedGrant ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Document Info */}
            <div className="p-3 sm:p-4 bg-secondary/5 rounded-lg">
              <h3 className="font-medium text-xs sm:text-sm text-muted-foreground mb-1">Document</h3>
              <p className="font-medium text-sm sm:text-base truncate">{document?.fileName || 'Unknown'}</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono">ID: {docId}</p>
            </div>

            {/* Viewer Address */}
            <div className="space-y-2">
              <Label htmlFor="viewerAddress" className="text-sm">Input Viewer's Wallet Address</Label>
              <Input
                id="viewerAddress"
                placeholder="0x..."
                value={viewerAddress}
                onChange={(e) => setViewerAddress(e.target.value)}
                className={`text-sm ${!viewerAddress || validateAddress(viewerAddress) ? "" : "border-destructive"}`}
              />
              {viewerAddress && !validateAddress(viewerAddress) && (
                <p className="text-xs sm:text-sm text-destructive">Invalid Ethereum address format</p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-sm">Access Duration</Label>
              <Select value={duration} onValueChange={(value) => {
                console.log('[grantModal] duration changed to:', value, '->', durationOptions.find(d => d.value === value)?.label);
                setDuration(value);
              }}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-sm">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full text-sm sm:text-base"
            >
              {isGenerating ? "Generating..." : "Generate Access Key"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Success Header */}
            <div className="text-center">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-sm sm:text-base font-semibold">Access Key Generated!</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {generatedGrant.viewerAddress
                  ? `Restricted access: Only wallet ${generatedGrant.viewerAddress.slice(0, 6)}...${generatedGrant.viewerAddress.slice(-4)} can view`
                  : "General access: Any wallet address can view this document"
                }
              </p>
            </div>

            {/* Access Key Card */}
            <Card className="p-2 sm:p-3 bg-secondary/5">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Access Key</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="h-6 px-2"
                >
                  {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <div className="font-mono text-xs bg-background p-2 rounded border break-all">
                {generatedGrant.accessKey}
              </div>
            </Card>

            {/* Viewer Link Card */}
            <Card className="p-2 sm:p-3 bg-secondary/5">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Viewer Link</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyLink}
                  className="h-6 px-2"
                >
                  {linkCopied ? <CheckCircle className="w-3 h-3" /> : <Link className="w-3 h-3" />}
                </Button>
              </div>
              <div className="font-mono text-xs bg-background p-2 rounded border break-all leading-relaxed">
                {window.location.origin}/viewer?key={generatedGrant.accessKey}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button onClick={handleGoToViewer} className="w-full text-sm sm:text-base">
                Go to Viewer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={handleBackToDashboard} className="w-full text-sm sm:text-base">
                Back to Dashboard
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  revokeGrant(generatedGrant.accessKey);
                  setGeneratedGrant(null);
                  setViewerAddress("");
                  setDuration("10");
                  toast({
                    title: "Access Revoked",
                    description: "The access key has been revoked and is no longer valid",
                    variant: "destructive",
                  });
                }}
                className="w-full text-sm sm:text-base"
              >
                <X className="w-4 h-4 mr-2" />
                Revoke Access
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GrantModal;


