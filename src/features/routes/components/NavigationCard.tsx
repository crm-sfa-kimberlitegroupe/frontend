import { Icon } from '../../../core/ui/Icon';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';

interface NavigationCardProps {
  nextStop?: {
    name: string;
    distance: string;
    time: string;
    estimatedArrival: string;
  };
  onStartNavigation?: () => void;
  onSkipStop?: () => void;
}

export default function NavigationCard({ nextStop, onStartNavigation, onSkipStop }: NavigationCardProps) {
  if (!nextStop) {
    return (
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="checkCircle" size="2xl" variant="green" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Route terminée !</h3>
          <p className="text-sm text-gray-600">Tous les arrêts ont été visités</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Icon name="locationMarker" size="lg" variant="white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-blue-600 mb-1">Prochain arrêt</p>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{nextStop.name}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Icon name="truck" size="sm" variant="grey" />
              <div>
                <p className="text-xs text-gray-500">Distance</p>
                <p className="text-sm font-semibold text-gray-900">{nextStop.distance}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="clock" size="sm" variant="grey" />
              <div>
                <p className="text-xs text-gray-500">Durée estimée</p>
                <p className="text-sm font-semibold text-gray-900">{nextStop.time}</p>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Icon name="calendar" size="sm" variant="grey" />
            <p className="text-xs text-gray-600">Arrivée prévue : {nextStop.estimatedArrival}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="primary" 
          fullWidth 
          onClick={onStartNavigation}
          className="flex items-center justify-center gap-2"
        >
          <Icon name="map" size="sm" variant="white" />
          Démarrer la navigation
        </Button>
        {onSkipStop && (
          <Button 
            variant="outline" 
            onClick={onSkipStop}
            className="px-4"
          >
            <Icon name="arrowRight" size="sm" />
          </Button>
        )}
      </div>
    </Card>
  );
}
