/**
 * Browser cache and CORS debugging utilities
 */

export function clearBrowserCache(): void {
  // Clear all possible caches
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }

  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // Force reload without cache
  if (window.location.reload) {
    window.location.reload();
  }
}

export function debugCORS(url: string): Promise<void> {
  return new Promise((resolve) => {
    console.group('🔍 CORS Debug Information');
    console.log('Current URL:', window.location.href);
    console.log('Target API:', url);
    console.log('Browser:', navigator.userAgent);
    console.log('Time:', new Date().toISOString());
    
    // Test fetch with different approaches
    const testFetch = async () => {
      try {
        console.log('Testing direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          cache: 'no-cache',
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          const data = await response.json();
          console.log('Response data preview:', JSON.stringify(data).substring(0, 100) + '...');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        console.log('Error type:', error.constructor.name);
        console.log('Error message:', error.message);
      }
    };

    testFetch().finally(() => {
      console.groupEnd();
      resolve();
    });
  });
}

export function getNetworkInfo(): object {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    onLine: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled,
    currentUrl: window.location.href,
    origin: window.location.origin,
    timestamp: new Date().toISOString(),
  };
}

export async function testCORSPreflight(url: string, origin?: string): Promise<boolean> {
  try {
    const testOrigin = origin || window.location.origin;
    console.log(`🧪 Testing CORS preflight for ${testOrigin} -> ${url}`);
    
    // This will trigger a preflight request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Header': 'preflight-test',
      },
      cache: 'no-cache',
    });
    
    console.log('✅ CORS preflight succeeded:', response.status);
    return response.ok;
  } catch (error) {
    console.error('❌ CORS preflight failed:', error);
    return false;
  }
}
