import { motion } from 'motion/react';
import { Users, UserCheck, UserX } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { useDataStore } from '../hooks/useDataStore';

export default function DashboardPage() {
  const { 
    totalEmployees, 
    presentToday, 
    absentToday, 
    todaysAttendance,
    isLoading
  } = useDataStore();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Employees"
          value={totalEmployees}
          icon={Users}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />
        <StatsCard
          title="Present Today"
          value={presentToday}
          icon={UserCheck}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
        />
        <StatsCard
          title="Absent Today"
          value={absentToday}
          icon={UserX}
          iconColor="text-red-600"
          iconBgColor="bg-red-50"
        />
      </div>

      {/* Recent Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
        style={{
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Recent Attendance</h2>
          <p className="text-sm text-gray-500 mt-1">Today's attendance overview</p>
        </div>

        {todaysAttendance.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No attendance records"
            description="Attendance data will appear here once employees mark their attendance."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Employee Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todaysAttendance.map((record) => (
                  <TableRow
                    key={record.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-800">
                      {record.employeeName}
                    </TableCell>
                    <TableCell className="text-gray-600">{record.date}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : 'bg-red-100 text-red-700 hover:bg-red-100'
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
