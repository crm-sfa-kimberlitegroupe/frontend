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

      <div>
        <Button 
          variant={
            visit.status === 'COMPLETED' ? 'success' : 
            visit.status === 'IN_PROGRESS' ? 'warning' : 
            'primary'
          }
          size="md" 
          fullWidth
          onClick={() => onSelect(visit.id)}
          className={
            visit.status === 'COMPLETED' ? 'bg-emerald-600 hover:bg-emerald-700' :
            visit.status === 'IN_PROGRESS' ? 'bg-amber-600 hover:bg-amber-700' :
            ''
          }
        >
          <Icon 
            name={
              visit.status === 'COMPLETED' ? 'checkCircle' : 
              visit.status === 'IN_PROGRESS' ? 'clock' : 
              'locationMarker'
            } 
            size="md" 
            className="mr-2" 
          />
          {
            visit.status === 'COMPLETED' ? 'Visité ✓' : 
            visit.status === 'IN_PROGRESS' ? 'En cours...' : 
            'A visiter'
          }
        </Button>
      </div>
    </Card>
  );
}
