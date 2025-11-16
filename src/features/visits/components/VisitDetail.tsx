import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import api from '../../../core/api/api';

interface VisitDetailProps {
  onBack: () => void;
  visitId: string;
  outletId: string;
  pdvName?: string;
  address?: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}

export default function VisitDetail({ onBack, visitId, outletId, pdvName = 'Épicerie Marcory', address = '123 Rue de Marcory, Abidjan', status = 'IN_PROGRESS' }: VisitDetailProps) {
  const navigate = useNavigate();
  const [isCreatingVisit, setIsCreatingVisit] = useState(false);
  const [lastVisit] = useState('15 Oct 2024'); // Mock data - à remplacer par vraie donnée
  return (
    <div>
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-primary mb-4 text-lg"
      >
        <Icon name="arrowLeft" size="sm" /> Retour à la liste
      </button>

      {/* Informations du point de vente */}
      <Card className="p-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{pdvName}</h2>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Icon name="locationMarker" size="sm" variant="grey" />
            <p className="text-gray-600">{address}</p>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="calendar" size="sm" variant="grey" />
            <p className="text-gray-600">Dernière visite: {lastVisit}</p>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="flag" size="sm" variant="grey" />
            <Badge variant={status === 'COMPLETED' ? 'success' : status === 'IN_PROGRESS' ? 'warning' : 'gray'}>
              {status === 'COMPLETED' ? 'Terminée' : status === 'IN_PROGRESS' ? 'En cours' : 'Planifiée'}
            </Badge>
          </div>
        </div>
        
        {/* Bouton d'action principal */}
        <div className="grid grid-cols-1 gap-3">
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth
            onClick={() => navigate(`/dashboard/merchandising?outletId=${outletId}&visitId=${visitId}&pdvName=${encodeURIComponent(pdvName || '')}`)}
            className="bg-sky-600 hover:bg-sky-700"
          >
            <Icon name="camera" size="md" className="mr-2" />
            Enregistrer merchandising
          </Button>
        </div>
      </Card>


      {/* Vendre */}
      <Card className="p-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="cart" size="md" variant="primary" />
          Vente
        </h3>
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth
          onClick={() => navigate(`/dashboard/orders/create?outletId=${outletId}&visitId=${visitId}`)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Icon name="cart" size="md" className="mr-2" />
          Enregistrer une vente
        </Button>
        <p className="text-sm text-gray-600 mt-2">
          Créez une nouvelle vente pour ce point de vente
        </p>
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

      {/* Bouton TERMINER */}
      <Button 
        variant="success" 
        size="lg" 
        fullWidth
        disabled={isCreatingVisit}
        onClick={async () => {
          if (confirm('Terminer cette visite et créer l\'enregistrement ?')) {
            try {
              setIsCreatingVisit(true);
              
              // Créer la visite dans la base de données
              const visitData = {
                outletId: outletId,
                status: 'COMPLETED',
                visitDate: new Date().toISOString(),
                notes: '', // À récupérer depuis le textarea si nécessaire
              };
              
              await api.post('/visits', visitData);
              
              alert('Visite terminée et enregistrée avec succès!');
              onBack();
            } catch (error) {
              console.error('Erreur lors de la création de la visite:', error);
              alert('Erreur lors de l\'enregistrement de la visite. Veuillez réessayer.');
            } finally {
              setIsCreatingVisit(false);
            }
          }
        }}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {isCreatingVisit ? (
          <>
            <Icon name="refresh" size="md" className="mr-2 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Icon name="checkCircle" size="md" className="mr-2" />
            TERMINER
          </>
        )}
      </Button>
    </div>
  );
}
