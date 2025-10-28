import { Button } from "@/components/ui/button";
import { Shield, Lock, FileCheck, Server, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import { useWallet } from '@/contexts/WalletContext';
import { useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prefer the context's connectWallet, but guard in case the context isn't mounted
  let connectWalletFn: (() => Promise<void>) | undefined;
  try {
    const ctx = useWallet();
    connectWalletFn = ctx?.connectWallet;
  } catch (err) {
    connectWalletFn = undefined;
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const fallbackConnect = async () => {
    try {
      if (typeof window === 'undefined') return;
      let eth: any = (window as any).ethereum || (window as any).web3?.currentProvider;
      if (!eth) {
        // Open MetaMask install page in new tab as a friendly fallback
        window.open('https://metamask.io/download.html', '_blank');
        return;
      }
      if (Array.isArray(eth.providers)) {
        const mm = eth.providers.find((p: any) => p.isMetaMask);
        eth = mm || eth;
      }
      await eth.request({ method: 'eth_requestAccounts' });
    } catch (e) {
      console.error('fallbackConnect error', e);
    }
  };

  const handleConnectClick = async () => {
    if (connectWalletFn) {
      try {
        await connectWalletFn();
        return;
      } catch (e) {
        console.error('connectWalletFn failed', e);
      }
    }
    await fallbackConnect();
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => scrollToSection('home')}
                className="text-2xl font-bold text-secondary hover:text-secondary/80 transition-colors"
              >
                Sield
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('home')}
                className="text-foreground hover:text-secondary transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-foreground hover:text-secondary transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-foreground hover:text-secondary transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-foreground hover:text-secondary transition-colors"
              >
                Pricing
              </button>
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                Launch App
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground hover:text-secondary transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button
                  onClick={() => scrollToSection('home')}
                  className="block px-3 py-2 text-foreground hover:text-secondary transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="block px-3 py-2 text-foreground hover:text-secondary transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="block px-3 py-2 text-foreground hover:text-secondary transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="block px-3 py-2 text-foreground hover:text-secondary transition-colors"
                >
                  Pricing
                </button>
                <div className="px-3 py-2">
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    Launch App
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
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
            
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              <span className="text-secondary">Sield:</span> Secure Legal Documents<br />
              <span className="text-secondary">on Blockchain</span>
            </h1>
            
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              <strong>Sield</strong> brings enterprise-grade encryption and blockchain transparency together. Store, share, and audit sensitive legal documents with complete confidence using BlockDAG technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={handleConnectClick}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-glow-cyan animate-glow text-lg px-8 py-6"
              >
                Connect Wallet
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/20 text-lg px-8 py-6"
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

      {/* About Section */}
      <section id="about" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Our Solution
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
              Sield combines client-side AES-256 encryption, decentralized IPFS storage, and BlockDAG blockchain verification to give legal professionals complete control and auditability over sensitive documents. No more centralized vulnerabilities or opaque audit trails.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Client-Side Encryption</h3>
                <p className="text-muted-foreground">Your files are encrypted before leaving your device, ensuring privacy from the start.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Server className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Decentralized Storage</h3>
                <p className="text-muted-foreground">IPFS ensures your documents are permanently accessible without single points of failure.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Blockchain Verification</h3>
                <p className="text-muted-foreground">Every action is immutably recorded on BlockDAG for complete transparency and auditability.</p>
              </div>
            </div>
            <Button
              onClick={() => scrollToSection('pricing')}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              size="lg"
            >
              Explore Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose Sield?
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

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Flexible Plans for Every Legal Need
            </h2>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-6 font-semibold text-foreground border-b border-border">Features</th>
                    <th className="text-center p-6 font-semibold text-foreground border-b border-border">Free</th>
                    <th className="text-center p-6 font-semibold text-foreground border-b border-border relative">
                      <div className="flex flex-col items-center">
                        <span className="mb-2">Premium</span>
                        <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                          Most Popular
                        </span>
                      </div>
                    </th>
                    <th className="text-center p-6 font-semibold text-foreground border-b border-border">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-6 font-medium text-foreground">Pricing</td>
                    <td className="p-6 text-center">
                      <div className="text-2xl font-bold text-secondary">$0</div>
                      <div className="text-sm text-muted-foreground">Forever free</div>
                    </td>
                    <td className="p-6 text-center border-x-2 border-secondary/20">
                      <div className="text-2xl font-bold text-secondary">$49</div>
                      <div className="text-sm text-muted-foreground">per user/month</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="text-2xl font-bold text-secondary">Custom</div>
                      <div className="text-sm text-muted-foreground">Contact sales</div>
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-6 text-foreground">Secure Upload & Encryption</td>
                    <td className="p-6 text-center">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mx-auto">
                        <span className="text-accent-foreground text-xs">✓</span>
                      </div>
                    </td>
                    <td className="p-6 text-center border-x-2 border-secondary/20">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mx-auto">
                        <span className="text-accent-foreground text-xs">✓</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mx-auto">
                        <span className="text-accent-foreground text-xs">✓</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-6 text-foreground">Blockchain Verification</td>
                    <td className="p-6 text-center">
                      <div className="text-sm text-muted-foreground">Basic Hash</div>
                    </td>
                    <td className="p-6 text-center border-x-2 border-secondary/20">
                      <div className="text-sm font-medium text-foreground">Full Audit Trail</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="text-sm font-medium text-foreground">Private Node</div>
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-6 text-foreground">Team Wallets</td>
                    <td className="p-6 text-center">
                      <div className="text-sm text-muted-foreground">1</div>
                    </td>
                    <td className="p-6 text-center border-x-2 border-secondary/20">
                      <div className="text-sm font-medium text-foreground">Up to 10</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="text-sm font-medium text-foreground">Unlimited</div>
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-6 text-foreground">File Transfer Limit</td>
                    <td className="p-6 text-center">
                      <div className="text-sm text-muted-foreground">10/month</div>
                    </td>
                    <td className="p-6 text-center border-x-2 border-secondary/20">
                      <div className="text-sm font-medium text-foreground">Unlimited</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="text-sm font-medium text-foreground">Unlimited</div>
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-6 text-foreground">Storage</td>
                    <td className="p-6 text-center">
                      <div className="text-sm text-muted-foreground">1 GB</div>
                    </td>
                    <td className="p-6 text-center border-x-2 border-secondary/20">
                      <div className="text-sm font-medium text-foreground">100 GB</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="text-sm font-medium text-foreground">Custom</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6 text-foreground">Support</td>
                    <td className="p-6 text-center">
                      <div className="text-sm text-muted-foreground">Email</div>
                    </td>
                    <td className="p-6 text-center border-x-2 border-secondary/20">
                      <div className="text-sm font-medium text-foreground">Priority</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="text-sm font-medium text-foreground">Dedicated Manager</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6"></td>
                    <td className="p-6">
                      <Button className="w-full" variant="outline">
                        Get Started
                      </Button>
                    </td>
                    <td className="p-6 border-x-2 border-secondary/20">
                      <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                        Upgrade
                      </Button>
                    </td>
                    <td className="p-6">
                      <Button className="w-full" variant="outline">
                        Contact Sales
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNi0yLjY4Ni02LTYtNnoiIHN0cm9rZT0iIzAwQjhEOSIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Secure Your Documents with <span className="text-secondary">Sield</span>?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Join the future of legal document management. Start protecting your sensitive files with <strong>Sield</strong>'s blockchain technology today.
          </p>
          <Button
            size="lg"
            onClick={handleConnectClick}
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow-success text-lg px-8 py-6"
          >
            Connect Wallet & Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-secondary">Sield</h3>
              <p className="text-primary-foreground/70 text-sm mt-1">Secure. Transparent. Decentralized.</p>
            </div>
            <div className="text-primary-foreground/70 text-sm">
              © 2025 Sield. Powered by BlockDAG.
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


