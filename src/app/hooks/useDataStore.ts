import { useState, useEffect } from 'react';
import { dataStore, Employee, AttendanceRecord } from '../store/dataStore';
import { toast } from 'sonner';

export function useDataStore() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      forceUpdate({});
    });

    return unsubscribe;
  }, []);

  return {
    // Employee data
    employees: dataStore.getEmployees(),
    addEmployee: async (employee: Omit<Employee, 'id' | '_id'>) => {
      try {
        const newEmployee = await dataStore.addEmployee(employee);
        toast.success('Employee added successfully!');
        return newEmployee;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to add employee';
        toast.error(message);
        throw error;
      }
    },
    deleteEmployee: async (id: string) => {
      try {
        await dataStore.deleteEmployee(id);
        toast.success('Employee deleted successfully!');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete employee';
        toast.error(message);
        throw error;
      }
    },
    refreshEmployees: () => dataStore.refreshEmployees(),
    
    // Attendance data
    attendanceRecords: dataStore.getAttendanceRecords(),
    todaysAttendance: dataStore.getTodaysAttendance(),
    addAttendanceRecord: async (record: Omit<AttendanceRecord, 'id' | '_id'>) => {
      try {
        await dataStore.addAttendanceRecord(record);
        toast.success('Attendance recorded successfully!');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to record attendance';
        toast.error(message);
        throw error;
      }
    },
    refreshAttendance: () => dataStore.refreshAttendance(),
    
    // Statistics
    totalEmployees: dataStore.getTotalEmployees(),
    presentToday: dataStore.getPresentToday(),
    absentToday: dataStore.getAbsentToday(),
    isLoading: dataStore.getIsLoading(),
  };
}
