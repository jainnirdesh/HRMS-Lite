const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
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
