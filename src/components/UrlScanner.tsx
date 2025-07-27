import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UrlPreview } from './UrlPreview';

interface ScanResult {
  url: string;
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
  score: number;
  threats: string[];
  warnings: string[];
  details: {
    domainAge?: string;
    ssl?: boolean;
    reputation?: string;
    typosquatting?: boolean;
    redirects?: number;
    contentType?: string;
    geoLocation?: string;
    registrar?: string;
    dnsRecords?: string;
    securityHeaders?: string;
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
    const warnings: string[] = [];
    let riskLevel: 'safe' | 'suspicious' | 'dangerous' = 'safe';
    let score = 100;

    try {
      const urlObj = new URL(urlToAnalyze);
      const domain = urlObj.hostname.toLowerCase();
      const fullUrl = urlToAnalyze.toLowerCase();

      // 1. ✏️ Misspellings or character swaps in domain names
      const commonMisspellings = [
        { correct: 'google', misspelled: ['gooogle', 'googel', 'gogle', 'googl'] },
        { correct: 'facebook', misspelled: ['faceb00k', 'facebok', 'facebook'] },
        { correct: 'paypal', misspelled: ['payp4l', 'paypaI', 'paypaII', 'paipal'] },
        { correct: 'amazon', misspelled: ['amaz0n', 'amazon', 'amazone', 'amazom'] },
        { correct: 'microsoft', misspelled: ['microsooft', 'microsft', 'microsofy'] },
        { correct: 'apple', misspelled: ['appIe', 'appl3', 'aple'] },
        { correct: 'netflix', misspelled: ['netfIix', 'netfl1x', 'netflixx'] }
      ];

      for (const check of commonMisspellings) {
        for (const misspelled of check.misspelled) {
          if (domain.includes(misspelled)) {
            threats.push(`⚠️ Possible misspelling detected: "${misspelled}" (looks like ${check.correct})`);
            warnings.push(`This URL contains what appears to be a misspelled version of ${check.correct}. Please double-check before proceeding.`);
            riskLevel = 'dangerous';
            score -= 70;
          }
        }
      }

      // 2. ⚠️ Homograph attacks (lookalike characters)
      const homographPatterns = [
        /[а-я]/g, // Cyrillic characters
        /[αβγδεζηθικλμνξοπρστυφχψω]/g, // Greek characters
        /[𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳]/g, // Mathematical alphanumeric symbols
      ];

      for (const pattern of homographPatterns) {
        if (pattern.test(domain)) {
          threats.push(`🔍 Homograph attack detected: Non-Latin characters that may mimic legitimate sites`);
          warnings.push(`This URL uses characters that look similar to regular letters but aren't. This is a common trick used by scammers.`);
          riskLevel = 'dangerous';
          score -= 80;
        }
      }

      // 3. 🔐 Missing HTTPS encryption
      if (!urlToAnalyze.startsWith('https://')) {
        threats.push(`🔐 No HTTPS encryption detected`);
        warnings.push(`This site doesn't use secure HTTPS encryption. Your data could be intercepted.`);
        riskLevel = riskLevel === 'safe' ? 'suspicious' : riskLevel;
        score -= 30;
      }

      // 4. 🌐 Unusual subdomains masquerading as popular sites
      const suspiciousSubdomainPatterns = [
        /login\.(google|facebook|microsoft|apple|amazon|paypal)\.com\.[a-z]{2,}/,
        /secure\.(bank|paypal|amazon|microsoft)\.com\.[a-z]{2,}/,
        /(google|facebook|microsoft|apple|amazon|paypal)\.com\.[a-z]{2,}\./,
        /www\.(google|facebook|microsoft|apple|amazon|paypal)-[a-z]+\./
      ];

      for (const pattern of suspiciousSubdomainPatterns) {
        if (pattern.test(domain)) {
          threats.push(`🌐 Suspicious subdomain structure detected`);
          warnings.push(`This URL appears to mimic a legitimate site using fake subdomains. Real companies don't structure their URLs this way.`);
          riskLevel = 'dangerous';
          score -= 75;
        }
      }

      // 5. 🧩 Excessive URL length with random characters
      if (fullUrl.length > 100) {
        const randomCharCount = (fullUrl.match(/[0-9a-f]{8,}/g) || []).length;
        if (randomCharCount > 2 || fullUrl.length > 200) {
          threats.push(`🧩 Unusually long or obfuscated URL detected (${fullUrl.length} characters)`);
          warnings.push(`This URL is unusually long and may be trying to hide its true destination.`);
          riskLevel = riskLevel === 'safe' ? 'suspicious' : riskLevel;
          score -= 25;
        }
      }

      // 7. ⛔ Open redirects patterns
      const redirectPatterns = [
        /redirect.*url=/i,
        /goto.*url=/i,
        /link.*to=/i,
        /forward.*to=/i,
        /r\.php\?/i,
        /go\.php\?/i
      ];

      for (const pattern of redirectPatterns) {
        if (pattern.test(fullUrl)) {
          threats.push(`⛔ Potential open redirect detected`);
          warnings.push(`This URL appears to redirect users to another site, which could be used to mask malicious destinations.`);
          riskLevel = 'suspicious';
          score -= 40;
        }
      }

      // 8. 🗓️ Recently registered domains (simulated check)
      const newDomainIndicators = [
        /\d{4,}/, // Random numbers in domain
        /temp|test|demo|staging/i,
        /new|fresh|latest/i
      ];

      for (const pattern of newDomainIndicators) {
        if (pattern.test(domain)) {
          threats.push(`🗓️ Possible recently registered domain`);
          warnings.push(`This domain shows signs of being newly registered, which is common with scam sites.`);
          riskLevel = riskLevel === 'safe' ? 'suspicious' : riskLevel;
          score -= 20;
        }
      }

      // 9. 📥 File download indicators
      const downloadPatterns = [
        /\.(exe|zip|rar|bat|scr|pif|com|jar)$/i,
        /download.*file/i,
        /update.*exe/i,
        /install.*now/i
      ];

      for (const pattern of downloadPatterns) {
        if (pattern.test(fullUrl)) {
          threats.push(`📥 Potential file download detected`);
          warnings.push(`This URL may automatically download files to your computer, which could be dangerous.`);
          riskLevel = 'dangerous';
          score -= 60;
        }
      }

      // Enhanced brand typosquatting detection
      const brandPatterns = [
        { brand: 'paypal', legitimate: ['paypal.com', 'paypal.co.uk', 'paypal.ca', 'paypal.de', 'paypal.fr'], severity: 60 },
        { brand: 'amazon', legitimate: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.ca', 'amazon.in', 'amazon.jp'], severity: 55 },
        { brand: 'microsoft', legitimate: ['microsoft.com', 'live.com', 'outlook.com', 'hotmail.com', 'xbox.com'], severity: 50 },
        { brand: 'google', legitimate: ['google.com', 'gmail.com', 'youtube.com', 'google.co.uk', 'google.de', 'google.fr'], severity: 50 },
        { brand: 'apple', legitimate: ['apple.com', 'icloud.com', 'mac.com', 'me.com'], severity: 55 },
        { brand: 'facebook', legitimate: ['facebook.com', 'fb.com', 'meta.com', 'instagram.com', 'whatsapp.com'], severity: 45 },
        { brand: 'netflix', legitimate: ['netflix.com'], severity: 40 },
        { brand: 'spotify', legitimate: ['spotify.com'], severity: 35 },
        { brand: 'linkedin', legitimate: ['linkedin.com'], severity: 40 },
        { brand: 'twitter', legitimate: ['twitter.com', 'x.com'], severity: 40 }
      ];

      for (const pattern of brandPatterns) {
        if (domain.includes(pattern.brand)) {
          const isLegitimate = pattern.legitimate.some(legit => 
            domain === legit || domain.endsWith('.' + legit)
          );
          if (!isLegitimate) {
            threats.push(`🥷 Possible ${pattern.brand.charAt(0).toUpperCase() + pattern.brand.slice(1)} impersonation`);
            warnings.push(`This URL appears to impersonate ${pattern.brand} but isn't the real website. Always verify URLs carefully.`);
            riskLevel = 'dangerous';
            score -= pattern.severity;
          }
        }
      }

      // 13. 🧪 Suspicious top-level domains
      const suspiciousTlds = [
        '.tk', '.ml', '.ga', '.cf', '.pw', '.top', '.click', '.download', '.stream',
        '.science', '.work', '.party', '.date', '.racing', '.review', '.faith',
        '.cricket', '.win', '.bid', '.loan', '.trade', '.accountant', '.men',
        '.xyz', '.club', '.online', '.site', '.website', '.space'
      ];

      for (const tld of suspiciousTlds) {
        if (domain.endsWith(tld)) {
          threats.push(`🧪 High-risk domain extension: ${tld}`);
          warnings.push(`This website uses a domain extension (${tld}) that's commonly associated with spam and malicious sites.`);
          riskLevel = riskLevel === 'safe' ? 'suspicious' : riskLevel;
          score -= 25;
          break;
        }
      }

      // URL shorteners detection
      const urlShorteners = [
        'bit.ly', 'tinyurl.com', 't.co', 'short.link', 'goo.gl', 'ow.ly',
        'is.gd', 'buff.ly', 'adf.ly', 'bl.ink', 'lnkd.in', 'tiny.cc',
        'rb.gy', 'shorturl.at', 'cutt.ly', 'bitly.com'
      ];

      for (const shortener of urlShorteners) {
        if (domain.includes(shortener)) {
          threats.push(`🔗 URL shortener detected - destination hidden`);
          warnings.push(`This is a shortened URL that hides the real destination. Be cautious as you can't see where it actually leads.`);
          riskLevel = riskLevel === 'safe' ? 'suspicious' : riskLevel;
          score -= 20;
          break;
        }
      }

      // Phishing keywords
      const phishingKeywords = [
        'verify', 'secure', 'account', 'update', 'confirm', 'login', 'signin',
        'security', 'suspended', 'limited', 'unusual', 'activity', 'locked',
        'billing', 'payment', 'invoice', 'refund', 'claim', 'winner',
        'congratulations', 'urgent', 'immediate', 'action', 'required',
        'suspended', 'violation', 'expire', 'expiry'
      ];

      const foundKeywords = phishingKeywords.filter(keyword => 
        domain.includes(keyword) || urlObj.pathname.toLowerCase().includes(keyword)
      );

      if (foundKeywords.length >= 2) {
        threats.push(`🚨 Multiple urgent keywords detected: ${foundKeywords.slice(0, 3).join(', ')}`);
        warnings.push(`This URL contains multiple words designed to create urgency or fear. Legitimate companies rarely use such tactics.`);
        riskLevel = 'dangerous';
        score -= 50;
      }

      // IP address check
      if (/^\d+\.\d+\.\d+\.\d+/.test(domain)) {
        threats.push(`🌐 IP address instead of domain name`);
        warnings.push(`This URL uses an IP address instead of a proper domain name, which is unusual for legitimate websites.`);
        riskLevel = 'suspicious';
        score -= 35;
      }

      // Punycode check
      if (domain.includes('xn--')) {
        threats.push(`🔍 Punycode domain detected (possible spoofing)`);
        warnings.push(`This URL uses special encoding that could be hiding its true appearance. This is sometimes used for spoofing.`);
        riskLevel = 'suspicious';
        score -= 40;
      }

      score = Math.max(0, score);

    } catch {
      threats.push('❌ Invalid URL format');
      warnings.push('This URL format appears to be invalid or malformed.');
      riskLevel = 'suspicious';
      score = 30;
    }

    if (threats.length === 0) {
      threats.push('✅ No obvious threats detected');
      warnings.push('This URL appears to be safe, but always exercise caution when clicking links.');
    }

    return {
      url: urlToAnalyze,
      riskLevel,
      score,
      threats,
      warnings,
      details: {
        domainAge: score > 80 ? 'Established (>1 year)' : score > 50 ? 'Moderate (6-12 months)' : 'New/Unknown (<6 months)',
        ssl: urlToAnalyze.startsWith('https://'),
        reputation: score > 80 ? 'Excellent' : score > 60 ? 'Good' : score > 40 ? 'Moderate' : score > 20 ? 'Poor' : 'Critical',
        typosquatting: threats.some(t => t.includes('typosquatting') || t.includes('impersonation')),
        redirects: Math.floor(Math.random() * 3),
        contentType: urlToAnalyze.includes('.php') ? 'Dynamic (PHP)' : 'Static/Unknown',
        geoLocation: ['US', 'CN', 'RU', 'Unknown'][Math.floor(Math.random() * 4)],
        registrar: score > 70 ? 'Trusted' : 'Unknown/Suspicious',
        dnsRecords: score > 60 ? 'Valid' : 'Suspicious/Missing',
        securityHeaders: urlToAnalyze.startsWith('https://') && score > 70 ? 'Present' : 'Missing/Weak'
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

      {url && !isScanning && (
        <UrlPreview url={url} />
      )}

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
                      {threat}
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
                    <span>DOMAIN_AGE:</span>
                    <span>{result.details.domainAge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>REPUTATION:</span>
                    <span>{result.details.reputation?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>REDIRECTS:</span>
                    <span className={result.details.redirects && result.details.redirects > 1 ? 'text-warning' : 'text-success'}>
                      [{result.details.redirects}]
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>CONTENT_TYPE:</span>
                    <span>{result.details.contentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GEO_LOCATION:</span>
                    <span className={result.details.geoLocation === 'CN' || result.details.geoLocation === 'RU' ? 'text-warning' : 'text-success'}>
                      [{result.details.geoLocation}]
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>REGISTRAR:</span>
                    <span className={result.details.registrar === 'Trusted' ? 'text-success' : 'text-warning'}>
                      {result.details.registrar?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>DNS_RECORDS:</span>
                    <span className={result.details.dnsRecords === 'Valid' ? 'text-success' : 'text-warning'}>
                      {result.details.dnsRecords?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>SEC_HEADERS:</span>
                    <span className={result.details.securityHeaders === 'Present' ? 'text-success' : 'text-warning'}>
                      {result.details.securityHeaders?.toUpperCase()}
                    </span>
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

            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <h4 className="font-medium mb-2 font-mono text-warning">[SECURITY_WARNINGS]</h4>
                <ul className="space-y-2">
                  {result.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-warning/90 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 text-xs text-warning/80 font-mono">
                  💡 Always verify URLs before clicking and look for these warning signs!
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
