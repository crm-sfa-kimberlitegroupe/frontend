import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import { Icon } from '../../../core/ui/Icon';

interface ActiveVisitCTAProps {
  pdvName: string;
  onContinue: () => void;
}

export default function ActiveVisitCTA({ pdvName, onContinue }: ActiveVisitCTAProps) {
  return (
    <Card className="p-5 mb-4 bg-gradient-to-br from-success to-secondary text-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-base opacity-90">Visite en cours</p>
          <p className="text-xl font-bold">{pdvName}</p>
        </div>
        <Icon name="locationMarker" size="2xl" variant="white" />
      </div>
      <Button 
        variant="outline" 
        fullWidth 
        className="bg-white text-success hover:bg-gray-50"
        onClick={onContinue}
      >
        Continuer la visite
      </Button>
    </Card>
  );
}
