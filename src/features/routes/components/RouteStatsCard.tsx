import { Icon } from '../../../core/ui/Icon';
import Card from '../../../core/ui/Card';

interface RouteStatsCardProps {
  totalStops: number;
  completed: number;
  remaining: number;
  totalDistance: string;
  estimatedTime: string;
  currentTime?: string;
}

export default function RouteStatsCard({
  totalStops,
  completed,
  remaining,
  totalDistance,
  estimatedTime,
  currentTime,
}: RouteStatsCardProps) {
  const progress = (completed / totalStops) * 100;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Progression de la journée</h3>
        {currentTime && (
          <span className="text-xs text-gray-500">{currentTime}</span>
        )}
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">
            {completed} / {totalStops} arrêts
          </span>
          <span className="text-xs font-semibold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Icon name="checkCircle" size="sm" variant="green" />
          </div>
          <p className="text-lg font-bold text-gray-900">{completed}</p>
          <p className="text-xs text-gray-600">Visités</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Icon name="clock" size="sm" variant="yellow" />
          </div>
          <p className="text-lg font-bold text-gray-900">{remaining}</p>
          <p className="text-xs text-gray-600">Restants</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Icon name="truck" size="sm" variant="grey" />
          </div>
          <p className="text-lg font-bold text-gray-900">{totalDistance}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
      </div>

      {/* Temps estimé */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Temps estimé restant</span>
          <span className="text-sm font-semibold text-gray-900">{estimatedTime}</span>
        </div>
      </div>
    </Card>
  );
}
