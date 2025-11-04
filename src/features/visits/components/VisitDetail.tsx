import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';

interface VisitDetailProps {
  onBack: () => void;
}

export default function VisitDetail({ onBack }: VisitDetailProps) {
  return (
    <div>
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-primary mb-4 text-lg"
      >
        <Icon name="arrowLeft" size="sm" /> Retour à la liste
      </button>

      <Card className="p-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Épicerie Marcory</h2>
        <p className="text-lg text-gray-600 mb-3">123 Rue de Marcory, Abidjan</p>
        <Badge variant="warning">En cours</Badge>
      </Card>

      {/* Photos merchandising */}
      <Card className="p-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="camera" size="md" variant="primary" />
          Photos merchandising
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <Icon name="camera" size="2xl" variant="grey" />
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" fullWidth>
          <Icon name="plus" size="sm" className="mr-2" />
          Ajouter une photo
        </Button>
      </Card>

      {/* Checklist Perfect Store */}
      <Card className="p-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="checkCircle" size="md" variant="green" />
          Checklist Perfect Store
        </h3>
        <div className="space-y-2">
          {[
            'Produits bien disposés',
            'Prix affichés',
            'PLV en place',
            'Stock suffisant',
            'Propreté du rayon'
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
              <input type="checkbox" className="w-5 h-5 text-primary rounded" />
              <span className="text-lg text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Gestion stock */}
      <Card className="p-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="package" size="md" variant="primary" />
          Gestion stock
        </h3>
        <Button variant="outline" size="sm" fullWidth>
          <Icon name="warning" size="sm" className="mr-2" />
          Signaler une rupture
        </Button>
      </Card>

      {/* Prendre commande */}
      <Card className="p-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="cart" size="md" variant="primary" />
          Commande
        </h3>
        <Button variant="primary" size="sm" fullWidth>
          <Icon name="plus" size="sm" className="mr-2" />
          Prendre une commande
        </Button>
      </Card>

      {/* Notes */}
      <Card className="p-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="note" size="md" variant="primary" />
          Notes
        </h3>
        <textarea 
          className="w-full border border-gray-300 rounded-lg p-3 text-lg"
          rows={4}
          placeholder="Ajouter des notes sur cette visite..."
        />
      </Card>

      {/* Bouton CHECK-OUT */}
      <Button 
        variant="danger" 
        size="lg" 
        fullWidth
        onClick={() => {
          if (confirm('Terminer cette visite ?')) {
            onBack();
            alert('Visite terminée!');
          }
        }}
      >
        <Icon name="flag" size="md" className="mr-2" />
        CHECK-OUT
      </Button>
    </div>
  );
}
