import Card from './Card';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: number;
  color?: string;
  onClick?: () => void;
}

export default function KPICard({
  label,
  value,
  unit = '',
  icon,
  trend,
  color = 'primary',
  onClick,
}: KPICardProps) {
  const colorClasses: Record<string, string> = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
  };

  return (
    <Card className="p-4" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={trend >= 0 ? 'text-success' : 'text-danger'}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              <span className="text-xs text-gray-500">vs mois dernier</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
