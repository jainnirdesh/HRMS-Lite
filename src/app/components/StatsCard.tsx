import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
}: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-lg bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
      style={{
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.95)',
      }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-gray-50 opacity-50" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-gray-800">{value}</p>
        </div>

        <div
          className={`w-14 h-14 rounded-lg ${iconBgColor} flex items-center justify-center shadow-sm`}
        >
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  );
}
