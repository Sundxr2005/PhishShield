import { Shield, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hacker-hero.jpg';

export const Hero = () => {
  const scrollToScanner = () => {
    const scanner = document.getElementById('url-scanner');
    scanner?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[image:var(--gradient-matrix)] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6 shadow-[var(--shadow-glow)] border border-primary/50">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-10xl md:text-8xl font-bold mb-4 text-foreground font-mono">
              PHISH<span className="text-primary animate-pulse">SHIELD</span>
              <br />
            </h1>
            <h1 className="text-4xl md:text-4xl font-bold mb-4 text-foreground font-mono">
              <span className="text-primary/50">Your ultimate Phishing Detector</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={scrollToScanner}
              variant="security" 
              size="lg"
              className="text-lg px-8 py-3 font-mono"
            >
              <Zap className="w-5 h-5" />
              SCAN URL NOW
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-3 font-mono border-primary/50 hover:border-primary"
              onClick={() => {
                const tips = document.getElementById('security-tips');
                tips?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              [INFO] PROTOCOLS
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-card/20 backdrop-blur-sm shadow-[var(--shadow-matrix)] border border-primary/30">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1 font-mono">REALTIME PROTECTION</h3>
              <p className="text-sm text-muted-foreground font-mono">
                Instant URL threat analysis
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/20 backdrop-blur-sm shadow-[var(--shadow-matrix)] border border-primary/30">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1 font-mono">LIGHTNING SPEED</h3>
              <p className="text-sm text-muted-foreground font-mono">
                Security results in &lt;2s
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/20 backdrop-blur-sm shadow-[var(--shadow-matrix)] border border-primary/30">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1 font-mono">COMMUNITY INTEL</h3>
              <p className="text-sm text-muted-foreground font-mono">
                Shared threat database
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};