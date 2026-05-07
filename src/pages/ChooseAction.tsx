import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChooseAction: React.FC = () => {
  const navigate = useNavigate();

  const handleSend = () => {
    console.log('[ui] navigate choice -> send');
    navigate('/dashboard');
  };

  const handleView = () => {
    console.log('[ui] navigate choice -> view');
    navigate('/viewer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/95 via-primary/80 to-secondary/70 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">What would you like to do?</h1>
          <p className="text-lg text-primary-foreground/90 max-w-md mx-auto">
            Choose your action to get started with Sield's secure document management
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Send Document */}
          <Card className="p-8 bg-card/95 backdrop-blur-sm border-secondary/20 shadow-2xl hover:shadow-glow-cyan transition-all duration-300 hover:scale-105 cursor-pointer group" onClick={handleSend}>
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/10 rounded-2xl group-hover:bg-secondary/20 transition-colors">
                <FileText className="w-10 h-10 text-secondary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Send Document</h2>
                <p className="text-muted-foreground mb-6">
                  Upload and share documents securely with blockchain-powered encryption and access control.
                </p>
              </div>
              <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-glow-cyan group-hover:shadow-glow-cyan-hover transition-all">
                Send Document
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>

          {/* View Document */}
          <Card className="p-8 bg-card/95 backdrop-blur-sm border-secondary/20 shadow-2xl hover:shadow-glow-accent transition-all duration-300 hover:scale-105 cursor-pointer group" onClick={handleView}>
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-2xl group-hover:bg-accent/20 transition-colors">
                <Eye className="w-10 h-10 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3">View Document</h2>
                <p className="text-muted-foreground mb-6">
                  Access and view documents that have been shared with you through secure one-time grants.
                </p>
              </div>
              <Button className="w-full bg-accent hover:bg-accent/80 text-accent-foreground shadow-glow-accent group-hover:shadow-glow-accent-hover transition-all">
                View Document
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-base text-primary-foreground/80">
            Sield — secure one-time viewing, powered by BlockDAG. This is a demo mode; blockchain enforcement is coming.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChooseAction;