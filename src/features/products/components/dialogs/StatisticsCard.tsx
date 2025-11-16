import React from 'react';
import Card from '../../../../core/ui/Card';
import Badge from '../../../../core/ui/Badge';

interface StatisticsCardProps {
  title: string;
  value: number;
  active?: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  active,
  icon,
  color = 'primary'
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'primary': return 'text-blue-600 bg-blue-50';
      case 'secondary': return 'text-gray-600 bg-gray-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info': return 'text-cyan-600 bg-cyan-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const percentage = active !== undefined && value > 0 
    ? Math.round((active / value) * 100) 
    : 100;

  return (
    <Card className="h-full">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h6 className="text-sm font-medium text-gray-600 mb-2">
              {title}
            </h6>
            <div className="text-2xl font-bold text-gray-900">
              {value.toLocaleString()}
            </div>
            {active !== undefined && (
              <div className="text-sm text-gray-500 mt-1">
                {active} actifs
              </div>
            )}
          </div>
          <div className="text-right">
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${getColorClasses()}`}>
              {icon}
            </div>
            {active !== undefined && (
              <div className="mt-2">
                <Badge variant={percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'secondary'} className="text-xs">
                  {percentage}% actifs
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatisticsCard;
