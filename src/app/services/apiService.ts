const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';

// Wake-up delay for free Render services (can take up to 50 seconds)
const RENDER_WAKEUP_DELAY = 5000; // 5 seconds
const MAX_RETRIES = 3;
const RETRY_DELAYS = [3000, 7000, 12000]; // Faster progressive delays: 3s, 7s, 12s

// Service status tracker
let isServiceWaking = false;
let lastWakeupAttempt = 0;

// API response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class ApiService {
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async wakeUpService(): Promise<void> {
    const now = Date.now();
    if (isServiceWaking || (now - lastWakeupAttempt < 60000)) {
      // Don't spam wake-up requests
      return;
    }

    isServiceWaking = true;
    lastWakeupAttempt = now;

    try {
      console.log('🔄 Attempting to wake up backend service...');
      
      // Try to ping the health endpoint to wake up the service
      const healthUrl = API_BASE_URL.replace('/api', '') + '/health';
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        console.log('✅ Backend service is awake!');
      } else {
        console.log('⏳ Backend service is starting up...');
      }
    } catch (error) {
      console.log('⏳ Backend service is starting up (connection failed as expected)...');
    } finally {
      isServiceWaking = false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, config);
        
        // Check for 502 Bad Gateway (sleeping Render service) or 500 (CORS/server errors)
        if (response.status === 502 || response.status === 500) {
          const errorType = response.status === 502 ? 'sleeping service' : 'server/CORS error';
          
          if (attempt === 0) {
            console.log(`🚫 Backend service appears to have ${errorType} (${response.status})`);
            await this.wakeUpService();
            console.log(`⏳ Waiting ${RETRY_DELAYS[0]/1000}s for service to recover...`);
          }
          
          if (attempt < MAX_RETRIES) {
            await this.sleep(RETRY_DELAYS[attempt]);
            console.log(`🔄 Retry attempt ${attempt + 1}/${MAX_RETRIES}...`);
            continue;
          }
          
          throw new Error(`Backend service is currently unavailable (${response.status}). Free tier services may need time to start up and configure properly.`);
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        // Reset wake-up tracking on successful response
        if (attempt > 0) {
          console.log('✅ Backend service is now responding!');
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        
        // Special handling for CORS preflight failures
        if (lastError.message.includes('access control checks') || 
            lastError.message.includes('Preflight response is not successful')) {
          console.log(`🔧 CORS preflight failed (attempt ${attempt + 1}), likely due to backend deployment/configuration`);
          
          if (attempt === 0) {
            await this.wakeUpService();
          }
          
          if (attempt < MAX_RETRIES) {
            // Longer delays for CORS issues as they may need backend restart
            await this.sleep(RETRY_DELAYS[attempt] * 1.5);
            console.log(`🔄 Retry attempt ${attempt + 1}/${MAX_RETRIES} (CORS configuration issue)...`);
            continue;
          }
        }
        
        // For network errors, 502s, or 500s, try to wake up the service and retry
        if (attempt === 0 && (
          lastError.message.includes('Failed to fetch') ||
          lastError.message.includes('502') ||
          lastError.message.includes('500') ||
          lastError.message.includes('Bad Gateway') ||
          lastError.message.includes('access control checks')
        )) {
          await this.wakeUpService();
          console.log(`⏳ Waiting ${RETRY_DELAYS[0]/1000}s for service to recover...`);
        }
        
        if (attempt < MAX_RETRIES) {
          await this.sleep(RETRY_DELAYS[attempt]);
          console.log(`🔄 Retry attempt ${attempt + 1}/${MAX_RETRIES}...`);
          continue;
        }
        
        console.error(`API Error (${endpoint}):`, lastError);
      }
    }

    // If all retries failed, throw the last error with helpful context
    const errorMessage = (lastError?.message.includes('502') || lastError?.message.includes('Bad Gateway'))
      ? 'Backend service is currently unavailable. This is likely because the free Render service is sleeping. Please wait 30-60 seconds and try again.'
      : (lastError?.message.includes('500') || lastError?.message.includes('access control'))
      ? 'Backend service is experiencing CORS configuration issues. The backend deployment may need to complete. Please wait 2-5 minutes and try again.'
      : lastError?.message || 'Unknown error occurred';
    
    throw new Error(errorMessage);
  }

  // Employee API methods
  async getEmployees(params?: {
    page?: number;
    limit?: number;
    department?: string;
    search?: string;
  }): Promise<ApiResponse<Employee[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.department) searchParams.append('department', params.department);
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    return this.request(`/employees${queryString ? `?${queryString}` : ''}`);
  }

  async getEmployee(id: string): Promise<ApiResponse<Employee>> {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(employee: Omit<Employee, 'id' | '_id'>): Promise<ApiResponse<Employee>> {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  }

  async updateEmployee(id: string, employee: Partial<Employee>): Promise<ApiResponse<Employee>> {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    });
  }

  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  async getEmployeeStats(): Promise<ApiResponse<{
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    departmentBreakdown: Array<{
      _id: string;
      count: number;
    }>;
  }>> {
    return this.request('/employees/stats');
  }

  // Attendance API methods
  async getAttendanceRecords(params?: {
    page?: number;
    limit?: number;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: 'Present' | 'Absent';
  }): Promise<ApiResponse<AttendanceRecord[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.employeeId) searchParams.append('employeeId', params.employeeId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    return this.request(`/attendance${queryString ? `?${queryString}` : ''}`);
  }

  async getTodayAttendance(): Promise<ApiResponse<AttendanceRecord[]>> {
    return this.request('/attendance/today');
  }

  async markAttendance(attendance: {
    employeeId: string;
    date: string;
    status: 'Present' | 'Absent';
  }): Promise<ApiResponse<AttendanceRecord>> {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendance),
    });
  }

  async updateAttendance(id: string, status: 'Present' | 'Absent'): Promise<ApiResponse<AttendanceRecord>> {
    return this.request(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteAttendance(id: string): Promise<ApiResponse<void>> {
    return this.request(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  async getAttendanceStats(params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
  }): Promise<ApiResponse<{
    overall: {
      Present: number;
      Absent: number;
      Total: number;
    };
    byEmployee: Array<{
      employeeId: string;
      name: string;
      department: string;
      attendance: Array<{
        status: string;
        count: number;
      }>;
      totalDays: number;
    }>;
  }>> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.employeeId) searchParams.append('employeeId', params.employeeId);

    const queryString = searchParams.toString();
    return this.request(`/attendance/stats${queryString ? `?${queryString}` : ''}`);
  }
}

// Employee interface matching backend
export interface Employee {
  _id?: string;
  id?: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  createdAt?: string;
  updatedAt?: string;
}

// Attendance record interface matching backend
export interface AttendanceRecord {
  _id?: string;
  id?: string;
  employeeId: string;
  employeeName: string;
  employeeNumber?: string;
  department?: string;
  date: string;
  status: 'Present' | 'Absent';
  markedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const apiService = new ApiService();
export default apiService;
