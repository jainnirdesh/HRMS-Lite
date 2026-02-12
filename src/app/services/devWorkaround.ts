/**
 * Development CORS workaround
 * This provides a temporary solution for CORS issues during development
 */

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';

// Simple proxy function for development
export async function devAPICall(endpoint: string, options: RequestInit = {}) {
  // In development, we can try multiple approaches
  const isDevelopment = (import.meta as any).env.DEV;
  
  if (isDevelopment && endpoint.includes('/employees')) {
    console.log('🔧 Development mode: Using fallback API approach');
    
    try {
      // First try normal fetch
      const response = await fetch(API_BASE_URL + endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          ...options.headers,
        },
        cache: 'no-cache',
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('🔧 Primary API call failed, using local backend fallback...');
      
      // Try local backend as fallback
      try {
        const localResponse = await fetch('http://localhost:5001/api' + endpoint, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        
        if (localResponse.ok) {
          console.log('✅ Local backend fallback successful!');
          return await localResponse.json();
        }
      } catch (localError) {
        console.log('⚠️ Local backend also unavailable');
      }
    }
  }
  
  // If all else fails, return null and let the main error handling take over
  return null;
}

// Check if we should use the development workaround
export function shouldUseDevelopmentWorkaround(): boolean {
  const isDevelopment = (import.meta as any).env.DEV;
  const hasLocalBackend = window.location.hostname === 'localhost';
  
  return isDevelopment && hasLocalBackend;
}
