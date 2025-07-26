import { Hero } from '@/components/Hero';
import { UrlScanner } from '@/components/UrlScanner';
import { SecurityTips } from '@/components/SecurityTips';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      
      <section id="url-scanner" className="py-16 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-mono">[THREAT_DETECTION_SYSTEM]</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-mono">
              # Enter target URL for comprehensive security analysis
            </p>
          </div>
          <UrlScanner />
        </div>
      </section>

      <section id="security-tips" className="py-16 bg-muted/10 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <SecurityTips />
        </div>
      </section>
    </div>
  );
};

export default Index;
