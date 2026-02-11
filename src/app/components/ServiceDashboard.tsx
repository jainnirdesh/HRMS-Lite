import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, Server, Database, Globe, Clock } from 'lucide-react';
import { checkServiceHealth } from '../services/serviceWakeup';

interface HealthStatus {
  service: 'online' | 'offline' | 'checking';
  responseTime?: number;
  lastCheck: Date;
  error?: string;
}

export function ServiceDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    service: 'checking',
    lastCheck: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const result = await checkServiceHealth();
      setHealthStatus({
        service: result.success ? 'online' : 'offline',
        responseTime: result.responseTime,
        lastCheck: new Date(),
        error: result.success ? undefined : result.message
      });
    } catch (error) {
      setHealthStatus({
        service: 'offline',
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(checkHealth, 120000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (healthStatus.service) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'checking': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (healthStatus.service) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Server className="h-5 w-5" />
            Service Status
          </CardTitle>
          <CardDescription>
            Monitor your HRMS backend service health
          </CardDescription>
        </div>
        <Button
          onClick={checkHealth}
          disabled={isChecking}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Service Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Backend API</span>
            </div>
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>

          {/* Response Time */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Response Time</span>
            </div>
            <span className="text-sm font-semibold">
              {healthStatus.responseTime ? `${healthStatus.responseTime}ms` : 'N/A'}
            </span>
          </div>

          {/* Database */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <Badge className={healthStatus.service === 'online' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
              {healthStatus.service === 'online' ? 'Connected' : 'Unknown'}
            </Badge>
          </div>
        </div>

        {/* Additional Details */}
        <div className="pt-3 border-t">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Last checked: {healthStatus.lastCheck.toLocaleString()}</div>
            {healthStatus.error && (
              <div className="text-red-600">Error: {healthStatus.error}</div>
            )}
            <div className="text-xs text-gray-400 mt-2">
              💡 Free tier services on Render may sleep after 15 minutes of inactivity and take 10-30 seconds to wake up.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
