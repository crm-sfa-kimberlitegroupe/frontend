import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
}

const colorClasses = {
  primary: 'bg-blue-50 text-blue-600',
  success: 'bg-green-50 text-green-600',
  warning: 'bg-yellow-50 text-yellow-600',
  danger: 'bg-red-50 text-red-600',
  secondary: 'bg-purple-50 text-purple-600',
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = 'primary',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {trend && (
            <div className="flex items-center gap-1">
              {trend.value === 0 ? (
                <Minus className="w-4 h-4 text-gray-400" />
              ) : trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend.value === 0
                    ? 'text-gray-500'
                    : trend.isPositive
                    ? 'text-success'
                    : 'text-danger'
                }`}
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
              {subtitle && (
                <span className="text-sm text-gray-500 ml-1">{subtitle}</span>
              )}
            </div>
          )}
          
          {!trend && subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>

        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
