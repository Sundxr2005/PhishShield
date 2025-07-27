import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Eye, Image, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UrlPreviewProps {
  url: string;
}

export const UrlPreview = ({ url }: UrlPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentService, setCurrentService] = useState(0);

  const screenshotServices = [
    {
      name: 'Screenshot API',
      generateUrl: (targetUrl: string) => 
        `https://shot.screenshotapi.net/screenshot?token=demo&url=${encodeURIComponent(targetUrl)}&width=1200&height=800&output=image&file_type=png&wait_for_event=load`
    },
    {
      name: 'Htmlcsstoimage',
      generateUrl: (targetUrl: string) => 
        `https://hcti.io/v1/image?url=${encodeURIComponent(targetUrl)}&viewport_width=1200&viewport_height=800`
    },
    {
      name: 'URL2PNG',
      generateUrl: (targetUrl: string) => 
        `https://api.url2png.com/v6/demo/demo/png/?url=${encodeURIComponent(targetUrl)}&viewport=1200x800&thumbnail_max_width=600`
    },
    {
      name: 'Webshot',
      generateUrl: (targetUrl: string) => 
        `https://api.apiflash.com/v1/urltoimage?access_key=demo&url=${encodeURIComponent(targetUrl)}&width=1200&height=800&delay=2&fresh=true`
    }
  ];

  const generatePreview = async (serviceIndex: number = 0) => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Format URL if needed
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      console.log(`Trying service ${serviceIndex}: ${screenshotServices[serviceIndex].name} for URL: ${targetUrl}`);
      
      const service = screenshotServices[serviceIndex];
      const screenshotUrl = service.generateUrl(targetUrl);
      
      // Test if the image loads
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          console.log(`Successfully loaded preview from service: ${service.name}`);
          resolve(true);
        };
        img.onerror = () => {
          console.error(`Failed to load from service: ${service.name}`);
          reject(new Error(`Service ${service.name} failed`));
        };
        img.src = screenshotUrl;
      });
      
      setPreviewUrl(screenshotUrl);
      setCurrentService(serviceIndex);
    } catch (err) {
      console.error(`Service ${serviceIndex} failed:`, err);
      
      // Try next service
      if (serviceIndex < screenshotServices.length - 1) {
        setTimeout(() => generatePreview(serviceIndex + 1), 500);
        return;
      }
      
      setError('All preview services failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!url) {
      setPreviewUrl(null);
      return;
    }

    const debounceTimer = setTimeout(() => {
      generatePreview(0);
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [url]);

  const retryPreview = () => {
    generatePreview(0);
  };

  if (!url) return null;

  return (
    <Card className="p-4 shadow-[var(--shadow-card)] border border-primary/30 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="font-medium font-mono">[URL_PREVIEW]</h3>
        </div>
        {error && (
          <Button
            variant="outline"
            size="sm"
            onClick={retryPreview}
            className="h-7 text-xs font-mono"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            RETRY
          </Button>
        )}
      </div>
      
      <div className="relative">
        {isLoading && (
          <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Image className="w-8 h-8 animate-pulse" />
              <span className="font-mono text-sm">[CAPTURING...]</span>
              <span className="font-mono text-xs opacity-60">
                Service: {screenshotServices[currentService]?.name || 'Unknown'}
              </span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-destructive">
              <AlertCircle className="w-8 h-8" />
              <span className="font-mono text-sm text-center"># {error}</span>
              <span className="font-mono text-xs opacity-60">
                Try checking if the URL is accessible
              </span>
            </div>
          </div>
        )}
        
        {previewUrl && !isLoading && !error && (
          <div className="relative">
            <img
              src={previewUrl}
              alt={`Preview of ${url}`}
              className="w-full aspect-video object-cover rounded-lg border border-primary/20"
              onError={() => setError('Failed to load preview image')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-lg pointer-events-none" />
            <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-muted-foreground">
              # Live Preview • {screenshotServices[currentService]?.name}
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
        # Target: {url}
      </p>
    </Card>
  );
};
