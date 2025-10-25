import type { ReactNode } from 'react';
import Card from '../Card';

export interface StatItem {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'gray';
}

export interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function StatsGrid({
  stats,
  columns = 3,
  className = '',
}: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const colorClasses = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    gray: 'text-gray-600',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3 ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index} className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.color ? colorClasses[stat.color] : 'text-gray-900'}`}>
                {stat.value}
              </div>
              {stat.trend && (
                <div
                  className={`text-xs mt-1 ${
                    stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.trend.isPositive ? '↑' : '↓'} {Math.abs(stat.trend.value)}%
                </div>
              )}
            </div>
            {stat.icon && (
              <div className={`${stat.color ? colorClasses[stat.color] : 'text-gray-400'}`}>
                {stat.icon}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
