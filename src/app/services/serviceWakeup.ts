/**
 * Utility to wake up the backend service on Render
 * This is particularly useful for free tier services that sleep after 15 minutes of inactivity
 */

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';

export interface WakeUpResult {
  success: boolean;
  message: string;
  responseTime?: number;
  status?: number;
}

export async function wakeUpService(): Promise<WakeUpResult> {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Attempting to wake up backend service...');
    
    const healthUrl = API_BASE_URL.replace('/api', '') + '/health';
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      console.log('✅ Backend service is awake!');
      return {
        success: true,
        message: 'Backend service is online and responding.',
        responseTime,
        status: response.status
      };
    } else if (response.status === 502) {
      console.log('⏳ Backend service is starting up...');
      return {
        success: false,
        message: 'Backend service is starting up. This may take 30-60 seconds for free tier services.',
        responseTime,
        status: response.status
      };
    } else {
      return {
        success: false,
        message: `Backend service returned status ${response.status}`,
        responseTime,
        status: response.status
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log('⏳ Backend service is starting up (connection error as expected)...');
    
    return {
      success: false,
      message: 'Backend service appears to be sleeping and is now being woken up. Please wait 30-60 seconds.',
      responseTime
    };
  }
}

export async function checkServiceHealth(): Promise<WakeUpResult> {
  const startTime = Date.now();
  
  try {
    const healthUrl = API_BASE_URL.replace('/api', '') + '/health';
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        message: 'Backend service is healthy',
        responseTime,
        status: response.status
      };
    } else {
      return {
        success: false,
        message: `Backend service returned status ${response.status}`,
        responseTime,
        status: response.status
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    };
  }
}

export async function waitForService(maxAttempts = 6, delayMs = 10000): Promise<WakeUpResult> {
  console.log(`🔄 Waiting for service to come online (max ${maxAttempts} attempts, ${delayMs}ms delay)...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📍 Attempt ${attempt}/${maxAttempts}...`);
    
    const result = await checkServiceHealth();
    
    if (result.success) {
      console.log(`✅ Service is online after ${attempt} attempts!`);
      return result;
    }
    
    if (attempt < maxAttempts) {
      console.log(`⏳ Waiting ${delayMs}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return {
    success: false,
    message: `Service did not come online after ${maxAttempts} attempts. Please try again later or check Render dashboard.`
  };
}

// Auto-wake service when module loads (for production only)
if ((import.meta as any).env.PROD && (import.meta as any).env.VITE_API_URL?.includes('render')) {
  wakeUpService().catch(console.error);
}
