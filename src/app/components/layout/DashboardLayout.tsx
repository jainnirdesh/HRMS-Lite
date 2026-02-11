import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { ServiceStatus } from '../ServiceStatus';

const pageNames: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Employee Management',
  '/attendance': 'Attendance Management',
};

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is authenticated (simple check)
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const pageTitle = pageNames[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      <motion.div
        initial={false}
        animate={{ marginLeft: isCollapsed ? '80px' : '240px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen"
      >
        <Navbar pageTitle={pageTitle} />

        <main className="p-8">
          <ServiceStatus className="mb-6" />
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}
