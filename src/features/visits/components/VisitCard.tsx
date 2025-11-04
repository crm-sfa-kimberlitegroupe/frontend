import type { Visit } from '../types/pdv.types';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import { getStatusColor, getStatusLabel } from '../utils/visit.utils';

interface VisitCardProps {
  visit: Visit;
  onSelect: (id: string) => void;
}

export default function VisitCard({ visit, onSelect }: VisitCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{visit.pdvName}</h3>
          <div className="flex items-center gap-3 text-base text-gray-600">
            <span className="flex items-center gap-1">
              <Icon name="clock" size="sm" variant="grey" />
              {visit.scheduledTime}
            </span>
            {visit.checkInTime && (
              <span className="flex items-center gap-1">
                <Icon name="check" size="sm" variant="green" />
                Check-in: {visit.checkInTime}
              </span>
            )}
          </div>
        </div>
        <Badge variant={getStatusColor(visit.status)} size="sm">
          {getStatusLabel(visit.status)}
        </Badge>
      </div>

      {visit.status === 'PLANNED' && (
        <Button 
          variant="success" 
          size="sm" 
          fullWidth
          onClick={() => onSelect(visit.id)}
        >
          <Icon name="locationMarker" size="sm" className="mr-2" />
          CHECK-IN
        </Button>
      )}

      {visit.status === 'IN_PROGRESS' && (
        <Button 
          variant="warning" 
          size="sm" 
          fullWidth
          onClick={() => onSelect(visit.id)}
        >
          Continuer la visite
        </Button>
      )}

      {visit.status === 'COMPLETED' && (
        <Button 
          variant="outline" 
          size="sm" 
          fullWidth
          onClick={() => onSelect(visit.id)}
        >
          Voir détails
        </Button>
      )}
    </Card>
  );
}
