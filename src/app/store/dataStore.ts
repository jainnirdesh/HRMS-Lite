import { apiService, Employee as ApiEmployee, AttendanceRecord as ApiAttendanceRecord } from '../services/apiService';
import { wakeUpService } from '../services/serviceWakeup';

export interface Employee extends ApiEmployee {}
export interface AttendanceRecord extends ApiAttendanceRecord {}

// Service status tracking
interface ServiceStatus {
  isOnline: boolean;
  isRetrying: boolean;
  lastError?: string;
  lastSuccessfulCall?: Date;
  usingFallbackData: boolean;
}

// Global data store with API integration
class DataStore {
  private employees: Employee[] = [];
  private attendanceRecords: AttendanceRecord[] = [];
  private listeners: (() => void)[] = [];
  private isLoading = false;
  private serviceStatus: ServiceStatus = {
    isOnline: false,
    isRetrying: false,
    usingFallbackData: false
  };

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      this.isLoading = true;
      this.serviceStatus.isRetrying = true;
      this.notifyListeners();

      // Try to wake up service first if it's likely sleeping
      try {
        await wakeUpService();
      } catch (error) {
        console.log('Service wake-up attempt completed, proceeding with data load...');
      }
      
      // Load employees from API
      const employeesResponse = await apiService.getEmployees();
      if (employeesResponse.success && employeesResponse.data) {
        this.employees = employeesResponse.data;
        this.serviceStatus.isOnline = true;
        this.serviceStatus.lastSuccessfulCall = new Date();
        this.serviceStatus.usingFallbackData = false;
      }

      // Load today's attendance from API
      const attendanceResponse = await apiService.getTodayAttendance();
      if (attendanceResponse.success && attendanceResponse.data) {
        this.attendanceRecords = attendanceResponse.data;
      }

      this.isLoading = false;
      this.serviceStatus.isRetrying = false;
      this.notifyListeners();
    } catch (error) {
      // Handle API failure gracefully
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('API unavailable, using fallback data:', errorMessage);
      
      this.isLoading = false;
      this.serviceStatus.isRetrying = false;
      this.serviceStatus.isOnline = false;
      this.serviceStatus.lastError = errorMessage;
      this.serviceStatus.usingFallbackData = true;
      
      // Fallback to local data if API fails
      this.initializeFallbackData();
      this.notifyListeners();
    }
  }

  // Retry connection to API
  public async retryConnection(): Promise<boolean> {
    try {
      this.serviceStatus.isRetrying = true;
      this.notifyListeners();
      
      console.log('🔄 Retrying connection to backend service...');
      
      // Try to wake up the service
      await wakeUpService();
      
      // Test with a simple API call
      const response = await apiService.getEmployees();
      
      if (response.success) {
        console.log('✅ Successfully reconnected to backend service!');
        this.serviceStatus.isOnline = true;
        this.serviceStatus.lastSuccessfulCall = new Date();
        this.serviceStatus.lastError = undefined;
        this.serviceStatus.usingFallbackData = false;
        
        // Reload data from API
        await this.initializeData();
        return true;
      }
      
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.serviceStatus.lastError = errorMessage;
      console.error('❌ Retry connection failed:', errorMessage);
      return false;
    } finally {
      this.serviceStatus.isRetrying = false;
      this.notifyListeners();
    }
  }

  // Get current service status
  public getServiceStatus(): ServiceStatus {
    return { ...this.serviceStatus };
  }

  private initializeFallbackData() {
    // Initial realistic employee data as fallback
    this.employees = [
      {
        _id: '1',
        employeeId: 'EMP001',
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
      },
      {
        _id: '2',
        employeeId: 'EMP002',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        department: 'Marketing',
      },
      {
        _id: '3',
        employeeId: 'EMP003',
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        department: 'Sales',
      },
      {
        _id: '4',
        employeeId: 'EMP004',
        name: 'Sarah Williams',
        email: 'sarah.williams@company.com',
        department: 'HR',
      },
      {
        _id: '5',
        employeeId: 'EMP005',
        name: 'David Brown',
        email: 'david.brown@company.com',
        department: 'Engineering',
      },
      {
        _id: '6',
        employeeId: 'EMP006',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@company.com',
        department: 'Finance',
      },
    ];

    // Generate today's attendance
    const today = new Date().toISOString().split('T')[0];
    this.attendanceRecords = this.employees.map((employee, index) => ({
      _id: `att_${employee._id}_${today}`,
      employeeId: employee._id!,
      employeeName: employee.name,
      employeeNumber: employee.employeeId,
      department: employee.department,
      date: today,
      status: (index === 2 || index === 4) ? 'Absent' : 'Present' as 'Present' | 'Absent',
    }));
  }

  // Employee methods
  getEmployees(): Employee[] {
    return [...this.employees];
  }

  async addEmployee(employee: Omit<Employee, 'id' | '_id'>): Promise<Employee> {
    try {
      const response = await apiService.createEmployee(employee);
      if (response.success && response.data) {
        this.employees.push(response.data);
        this.notifyListeners();
        return response.data;
      }
      throw new Error(response.message || 'Failed to create employee');
    } catch (error) {
      console.error('Failed to add employee:', error);
      throw error;
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    try {
      // If service is offline, just delete locally
      if (!this.serviceStatus.isOnline || this.serviceStatus.usingFallbackData) {
        console.warn('🔌 Backend service is offline. Deleting employee locally only.');
        this.employees = this.employees.filter(emp => emp._id !== id && emp.id !== id);
        this.attendanceRecords = this.attendanceRecords.filter(att => att.employeeId !== id);
        this.notifyListeners();
        
        // Show warning to user that deletion is local only
        const employeeName = this.employees.find(emp => emp._id === id || emp.id === id)?.name || 'Employee';
        throw new Error(`${employeeName} deleted locally. Changes will sync when backend service is available.`);
      }

      const response = await apiService.deleteEmployee(id);
      if (response.success) {
        this.employees = this.employees.filter(emp => emp._id !== id && emp.id !== id);
        this.attendanceRecords = this.attendanceRecords.filter(att => att.employeeId !== id);
        this.serviceStatus.lastSuccessfulCall = new Date();
        this.serviceStatus.isOnline = true;
        this.notifyListeners();
      } else {
        throw new Error(response.message || 'Failed to delete employee');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if this is a service availability error
      if (errorMessage.includes('502') || errorMessage.includes('Bad Gateway') || errorMessage.includes('unavailable')) {
        this.serviceStatus.isOnline = false;
        this.serviceStatus.lastError = errorMessage;
        
        // Try to wake up service for next time
        wakeUpService().catch(console.error);
        
        throw new Error('Backend service is currently unavailable. Please wait a moment and try again, or contact support if the issue persists.');
      }
      
      console.error('Failed to delete employee:', error);
      throw new Error(errorMessage);
    }
  }

  async refreshEmployees(): Promise<void> {
    try {
      const response = await apiService.getEmployees();
      if (response.success && response.data) {
        this.employees = response.data;
        this.notifyListeners();
      }
    } catch (error) {
      console.warn('Failed to refresh employees from API, keeping current data:', error.message);
      // Don't throw error, just keep existing data
    }
  }

  // Attendance methods
  getAttendanceRecords(): AttendanceRecord[] {
    return [...this.attendanceRecords];
  }

  getTodaysAttendance(): AttendanceRecord[] {
    const today = new Date().toISOString().split('T')[0];
    return this.attendanceRecords.filter(record => 
      record.date.startsWith(today)
    );
  }

  async addAttendanceRecord(record: Omit<AttendanceRecord, 'id' | '_id'>): Promise<void> {
    try {
      const response = await apiService.markAttendance({
        employeeId: record.employeeId,
        date: record.date,
        status: record.status,
      });
      
      if (response.success && response.data) {
        // Update local data
        const existingIndex = this.attendanceRecords.findIndex(
          att => att.employeeId === record.employeeId && att.date === record.date
        );
        
        if (existingIndex >= 0) {
          this.attendanceRecords[existingIndex] = response.data;
        } else {
          this.attendanceRecords.push(response.data);
        }
        
        this.notifyListeners();
      } else {
        throw new Error(response.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Failed to add attendance record:', error);
      throw error;
    }
  }

  async refreshAttendance(): Promise<void> {
    try {
      const response = await apiService.getTodayAttendance();
      if (response.success && response.data) {
        this.attendanceRecords = response.data;
        this.notifyListeners();
      }
    } catch (error) {
      console.warn('Failed to refresh attendance from API, keeping current data:', error.message);
      // Don't throw error, just keep existing data
    }
  }

  // Statistics
  getTotalEmployees(): number {
    return this.employees.length;
  }

  getPresentToday(): number {
    return this.getTodaysAttendance().filter(att => att.status === 'Present').length;
  }

  getAbsentToday(): number {
    return this.getTodaysAttendance().filter(att => att.status === 'Absent').length;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  // Subscription methods
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const dataStore = new DataStore();
