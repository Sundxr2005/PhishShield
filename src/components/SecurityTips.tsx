import { Card } from '@/components/ui/card';
import { Shield, Eye, Link, Mail, CreditCard, Users } from 'lucide-react';

const tips = [
  {
    icon: Shield,
    title: "[URL_VERIFICATION]",
    description: "# Scan domain strings for malicious patterns and typosquatting attempts in target URLs"
  },
  {
    icon: Eye,
    title: "[SSL_ANALYSIS]",
    description: "# Verify HTTPS certificates - but remember: attackers can also obtain valid SSL certs"
  },
  {
    icon: Link,
    title: "[LINK_INSPECTION]",
    description: "# Hover over hyperlinks to reveal actual destination before executing click events"
  },
  {
    icon: Mail,
    title: "[SOCIAL_ENGINEERING]",
    description: "# Phishing campaigns exploit urgency psychology - verify through alternative channels"
  },
  {
    icon: CreditCard,
    title: "[DATA_PROTECTION]",
    description: "# Never input sensitive credentials on unverified domains - navigate directly to official sites"
  },
  {
    icon: Users,
    title: "[THREAT_INTEL]",
    description: "# Report phishing attempts to security organizations - contribute to community defense"
  }
];

export const SecurityTips = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 font-mono">[SECURITY_PROTOCOLS]</h2>
        <p className="text-muted-foreground font-mono"># Essential defensive measures against phishing attacks</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tips.map((tip, index) => (
          <Card key={index} className="p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow)] transition-all duration-200 border border-primary/30 bg-card/80 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/40">
                <tip.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1 font-mono">{tip.title}</h3>
                <p className="text-sm text-muted-foreground font-mono">{tip.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};