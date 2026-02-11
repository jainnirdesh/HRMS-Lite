import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { dataStore } from '../store/dataStore';

interface ServiceStatusProps {
  className?: string;
}

type ServiceStatus = 'checking' | 'online' | 'waking' | 'offline';

export function ServiceStatus({ className = '' }: ServiceStatusProps) {
  const [status, setStatus] = useState<ServiceStatus>('checking');
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const updateFromDataStore = () => {
    const serviceStatus = dataStore.getServiceStatus();
    
    if (serviceStatus.isRetrying) {
      setStatus('checking');
      setIsRetrying(true);
    } else if (serviceStatus.isOnline && !serviceStatus.usingFallbackData) {
      setStatus('online');
      setIsRetrying(false);
    } else if (serviceStatus.usingFallbackData || serviceStatus.lastError) {
      if (serviceStatus.lastError?.includes('502') || serviceStatus.lastError?.includes('unavailable')) {
        setStatus('waking');
        if (countdown === 0) {
          startCountdown();
        }
      } else {
        setStatus('offline');
      }
      setIsRetrying(false);
    }
  };

  const startCountdown = () => {
    setCountdown(20); // Reduced from 30 to 20 seconds
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          updateFromDataStore(); // Recheck after countdown
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    const success = await dataStore.retryConnection();
    setIsRetrying(false);
    
    if (success) {
      setStatus('online');
    }
  };

  useEffect(() => {
    // Initial check
    updateFromDataStore();
    
    // Subscribe to dataStore changes
    const unsubscribe = dataStore.subscribe(updateFromDataStore);
    
    // Check service status every 2 minutes
    const interval = setInterval(updateFromDataStore, 120000);
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircle2,
          variant: 'default' as const,
          title: 'Service Online',
          description: 'Backend services are running normally.',
          className: 'border-green-200 bg-green-50 text-green-800'
        };
      
      case 'waking':
        return {
          icon: Clock,
          variant: 'default' as const,
          title: 'Service Starting',
          description: countdown > 0 
            ? `Backend service is waking up... Estimated time: ${countdown}s`
            : 'Backend service is starting up. Free tier services typically take 10-30 seconds to wake up.',
          className: 'border-yellow-200 bg-yellow-50 text-yellow-800'
        };
      
      case 'checking':
        return {
          icon: RefreshCw,
          variant: 'default' as const,
          title: 'Checking Service',
          description: 'Verifying backend service status...',
          className: 'border-blue-200 bg-blue-50 text-blue-800'
        };
      
      default:
        return {
          icon: AlertCircle,
          variant: 'destructive' as const,
          title: 'Service Unavailable',
          description: 'Backend service is currently unavailable. Please try again in a few minutes.',
          className: 'border-red-200 bg-red-50 text-red-800'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  // Don't show if service is online
  if (status === 'online') {
    return null;
  }

  return (
    <Alert className={`${config.className} ${className}`} variant={config.variant}>
      <div className="flex items-start gap-3">
        <IconComponent 
          className={`h-5 w-5 mt-0.5 ${
            status === 'checking' || status === 'waking' ? 'animate-spin' : ''
          }`} 
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{config.title}</div>
          <AlertDescription className="mt-1">
            {config.description}
          </AlertDescription>
          
          {status === 'offline' && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isRetrying}
                className="h-8"
              >
                {isRetrying ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isRetrying ? 'Retrying...' : 'Retry Now'}
              </Button>
            </div>
          )}
          
          {status === 'waking' && countdown > 0 && (              <div className="mt-2">
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((20 - countdown) / 20) * 100}%` }}
                  />
                </div>
              </div>
          )}
        </div>
      </div>
    </Alert>
  );
}
