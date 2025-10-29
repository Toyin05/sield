import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { FileText, Shield, Clock, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletProvider";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, isLoading } = useWallet();

  console.log('[dashboard] component rendering, isConnected:', isConnected, 'isLoading:', isLoading);

  // Redirect to wallet connect if not connected
  useEffect(() => {
    console.log('[dashboard] useEffect check - isLoading:', isLoading, 'isConnected:', isConnected);
    if (!isLoading && !isConnected) {
      console.info('[dashboard] no wallet connected, redirecting to wallet-connect');
      navigate('/wallet-connect');
    } else if (!isLoading && isConnected) {
      console.info('[dashboard] wallet connected, staying on dashboard');
      console.log('[dashboard] rendering dashboard content');
    }
  }, [isConnected, isLoading, navigate]);

  // Show loading while checking wallet state
  if (isLoading) {
    console.log('[dashboard] showing loading screen - isLoading:', isLoading);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not connected
  if (!isConnected) {
    console.log('[dashboard] not connected, returning null - isConnected:', isConnected);
    return null;
  }

  console.log('[dashboard] rendering dashboard content - all checks passed');

  // Mock data - will be replaced with real blockchain data
  const stats = [
    { label: "Total Documents", value: "12", icon: FileText, color: "text-secondary" },
    { label: "Shared Access", value: "5", icon: Shield, color: "text-accent" },
    { label: "Recent Activity", value: "3", icon: Clock, color: "text-primary" },
  ];

  const recentFiles = [
    {
      name: "Contract_Agreement_2025.pdf",
      date: "2025-01-15",
      status: "Encrypted",
      size: "2.4 MB",
      shared: 2,
      cid: "bafy1234567890abcdef",
      key: "encrypted_key_1",
      iv: "iv_vector_1",
    },
    {
      name: "Legal_Brief_Case_442.docx",
      date: "2025-01-14",
      status: "Encrypted",
      size: "1.8 MB",
      shared: 1,
      cid: "bafy0987654321fedcba",
      key: "encrypted_key_2",
      iv: "iv_vector_2",
    },
    {
      name: "Evidence_Document_A.pdf",
      date: "2025-01-12",
      status: "Encrypted",
      size: "5.2 MB",
      shared: 3,
      cid: "bafyabcdef1234567890",
      key: "encrypted_key_3",
      iv: "iv_vector_3",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="bg-gradient-hero rounded-2xl p-8 text-primary-foreground">
          <h1 className="text-3xl font-bold mb-2">Welcome to Sield</h1>
          <p className="text-primary-foreground/80 mb-6">Your secure blockchain-powered document management system</p>
          <Button
            onClick={() => navigate("/upload")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow-success"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload New Document
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 bg-gradient-card border-border hover:border-secondary/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Files */}
        <Card className="p-6 bg-gradient-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Recent Documents</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-secondary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-secondary transition-colors">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{file.size} • {file.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 bg-accent/10 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      <span className="text-xs font-medium text-accent">{file.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Shared with {file.shared} users</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/viewer?cid=${file.cid}&key=${file.key}&iv=${file.iv}`);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Secure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

