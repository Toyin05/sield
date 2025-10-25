import { Button } from "@/components/ui/button";
import { Shield, Lock, FileCheck, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-secondary/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-card/10 backdrop-blur-sm border border-secondary/30 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-secondary" />
              <span className="text-sm text-primary-foreground font-medium">Secured by BlockDAG Technology</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Protect, Share, and Verify<br />
              <span className="text-secondary">Legal Documents Securely</span>
            </h1>
            
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Enterprise-grade encryption meets blockchain transparency. Store, share, and audit sensitive legal documents with complete confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/dashboard")}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-glow-cyan animate-glow text-lg px-8 py-6"
              >
                Launch App
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-secondary rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose DocuVault?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for lawyers, agencies, and organizations that demand the highest level of security and transparency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gradient-card rounded-2xl p-8 border border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-glow-cyan group"
              >
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNi0yLjY4Ni02LTYtNnoiIHN0cm9rZT0iIzAwQjhEOSIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Secure Your Documents?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Join the future of legal document management. Start protecting your sensitive files with blockchain technology today.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow-success text-lg px-8 py-6"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-secondary">DocuVault</h3>
              <p className="text-primary-foreground/70 text-sm mt-1">Secure. Transparent. Decentralized.</p>
            </div>
            <div className="text-primary-foreground/70 text-sm">
              © 2025 DocuVault. Powered by BlockDAG.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "AES-256 encryption ensures your documents remain private and secure at all times."
  },
  {
    icon: Server,
    title: "Decentralized Storage",
    description: "Files stored on IPFS mean no single point of failure and true data ownership."
  },
  {
    icon: FileCheck,
    title: "Blockchain Verification",
    description: "Every action is logged on-chain for complete auditability and tamper-proof records."
  },
  {
    icon: Shield,
    title: "Access Control",
    description: "Granular permissions let you control exactly who can view your documents."
  }
];

export default Landing;
