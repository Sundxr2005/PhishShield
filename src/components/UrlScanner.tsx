import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScanResult {
  url: string;
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
  score: number;
  threats: string[];
  details: {
    domainAge?: string;
    ssl?: boolean;
    reputation?: string;
    typosquatting?: boolean;
  };
}

export const UrlScanner = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const { toast } = useToast();

  const analyzeUrl = async (urlToAnalyze: string): Promise<ScanResult> => {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const threats: string[] = [];
    let riskLevel: 'safe' | 'suspicious' | 'dangerous' = 'safe';
    let score = 100;

    try {
      const urlObj = new URL(urlToAnalyze);
      const domain = urlObj.hostname.toLowerCase();

      // Check for suspicious patterns
      if (domain.includes('paypal') && !domain.includes('paypal.com')) {
        threats.push('Possible PayPal typosquatting');
        riskLevel = 'dangerous';
        score -= 50;
      }

      if (domain.includes('amazon') && !domain.includes('amazon.com') && !domain.includes('amazon.')) {
        threats.push('Possible Amazon typosquatting');
        riskLevel = 'dangerous';
        score -= 50;
      }

      if (domain.includes('microsoft') && !domain.includes('microsoft.com')) {
        threats.push('Possible Microsoft typosquatting');
        riskLevel = 'dangerous';
        score -= 40;
      }

      if (domain.includes('google') && !domain.includes('google.com') && !domain.includes('google.')) {
        threats.push('Possible Google typosquatting');
        riskLevel = 'dangerous';
        score -= 40;
      }

      // Check for suspicious TLDs
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf'];
      if (suspiciousTlds.some(tld => domain.endsWith(tld))) {
        threats.push('Suspicious top-level domain');
        riskLevel = riskLevel === 'safe' ? 'suspicious' : riskLevel;
        score -= 20;
      }

      // Check for URL shorteners
      const urlShorteners = ['bit.ly', 'tinyurl.com', 't.co', 'short.link'];
      if (urlShorteners.some(shortener => domain.includes(shortener))) {
        threats.push('URL shortener detected - verify destination');
        riskLevel = riskLevel === 'safe' ? 'suspicious' : riskLevel;
        score -= 15;
      }

      // Check for suspicious patterns
      if (domain.split('.').length > 4) {
        threats.push('Unusually long subdomain structure');
        riskLevel = riskLevel === 'safe' ? 'suspicious' : riskLevel;
        score -= 10;
      }

      if (domain.includes('-') && domain.split('-').length > 3) {
        threats.push('Excessive hyphens in domain name');
        riskLevel = riskLevel === 'safe' ? 'suspicious' : riskLevel;
        score -= 10;
      }

      // Check for mixed character sets or lookalike characters
      if (/[а-я]/.test(domain) || /[αβγδε]/.test(domain)) {
        threats.push('Non-Latin characters detected (possible spoofing)');
        riskLevel = 'dangerous';
        score -= 60;
      }

      score = Math.max(0, score);

    } catch {
      threats.push('Invalid URL format');
      riskLevel = 'suspicious';
      score = 30;
    }

    if (threats.length === 0) {
      threats.push('No obvious threats detected');
    }

    return {
      url: urlToAnalyze,
      riskLevel,
      score,
      threats,
      details: {
        domainAge: 'Unknown',
        ssl: urlToAnalyze.startsWith('https://'),
        reputation: score > 70 ? 'Good' : score > 40 ? 'Moderate' : 'Poor',
        typosquatting: threats.some(t => t.includes('typosquatting'))
      }
    };
  };

  const handleScan = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to scan",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setResult(null);

    try {
      let urlToAnalyze = url.trim();
      if (!urlToAnalyze.startsWith('http://') && !urlToAnalyze.startsWith('https://')) {
        urlToAnalyze = 'https://' + urlToAnalyze;
      }

      const scanResult = await analyzeUrl(urlToAnalyze);
      setResult(scanResult);

      toast({
        title: "Scan Complete",
        description: `URL analyzed with ${scanResult.score}% safety score`,
        variant: scanResult.riskLevel === 'dangerous' ? 'destructive' : 'default',
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to analyze the URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return <CheckCircle className="w-6 h-6 text-success" />;
      case 'suspicious': return <AlertTriangle className="w-6 h-6 text-warning" />;
      case 'dangerous': return <XCircle className="w-6 h-6 text-destructive" />;
      default: return <Shield className="w-6 h-6" />;
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'default';
      case 'suspicious': return 'secondary';
      case 'dangerous': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="p-6 shadow-[var(--shadow-card)] border border-primary/30 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold font-mono">[URL_SCANNER]</h2>
        </div>
        
        <div className="flex gap-3">
          <Input
            type="url"
            placeholder="# Enter target URL for analysis..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 font-mono bg-input/50 border-primary/30"
            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
          />
          <Button 
            onClick={handleScan} 
            disabled={isScanning}
            variant="security"
            className="min-w-[100px] font-mono"
          >
            {isScanning ? (
              <>
                <Search className="w-4 h-4 animate-spin" />
                [SCANNING...]
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                [SCAN]
              </>
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6 shadow-[var(--shadow-card)] border border-primary/30 bg-card/80 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getRiskIcon(result.riskLevel)}
                <div>
                  <h3 className="font-semibold text-lg font-mono">[SCAN_RESULTS]</h3>
                  <p className="text-sm text-muted-foreground break-all font-mono"># {result.url}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={getRiskBadgeVariant(result.riskLevel)} className="mb-2">
                  {result.riskLevel.toUpperCase()}
                </Badge>
                <p className="text-2xl font-bold font-mono">{result.score}%</p>
                <p className="text-sm text-muted-foreground font-mono">THREAT_SCORE</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 font-mono">[DETECTED_THREATS]</h4>
                <ul className="space-y-1">
                  {result.threats.map((threat, index) => (
                    <li key={index} className="text-sm flex items-start gap-2 font-mono">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      # {threat}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2 font-mono">[SYSTEM_ANALYSIS]</h4>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span>SSL_STATUS:</span>
                    <span className={result.details.ssl ? 'text-success' : 'text-destructive'}>
                      {result.details.ssl ? '[SECURED]' : '[UNSECURED]'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>REPUTATION:</span>
                    <span>{result.details.reputation?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TYPOSQUAT_RISK:</span>
                    <span className={result.details.typosquatting ? 'text-destructive' : 'text-success'}>
                      {result.details.typosquatting ? '[HIGH]' : '[LOW]'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};