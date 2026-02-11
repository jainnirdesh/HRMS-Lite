import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Users } from 'lucide-react';
import EmployeeModal from '../components/EmployeeModal';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { useDataStore } from '../hooks/useDataStore';
import { Employee } from '../store/dataStore';

export default function EmployeesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { 
    employees, 
    addEmployee, 
    deleteEmployee, 
    refreshEmployees,
    isLoading: dataLoading 
  } = useDataStore();

  // Simulate loading for UX
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id' | '_id'>) => {
    try {
      await addEmployee(employeeData);
      setIsModalOpen(false);
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error('Failed to add employee:', error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!id) return;
    
    try {
      setIsDeleting(id);
      await deleteEmployee(id);
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error('Failed to delete employee:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading || dataLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Employee Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your organization's employees
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Employee Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
        style={{
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        {employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description="Get started by adding your first employee to the system."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Employee ID</TableHead>
                  <TableHead className="font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Email</TableHead>
                  <TableHead className="font-semibold text-gray-700">Department</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow
                    key={employee._id || employee.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-800">
                      {employee.employeeId}
                    </TableCell>
                    <TableCell className="text-gray-800">{employee.name}</TableCell>
                    <TableCell className="text-gray-600">{employee.email}</TableCell>
                    <TableCell className="text-gray-600">{employee.department}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee._id || employee.id || '')}
                        disabled={isDeleting === (employee._id || employee.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {isDeleting === (employee._id || employee.id) ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddEmployee}
      />
    </div>
  );
}
