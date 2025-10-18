import { useState, useEffect } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import { outletsService, OutletStatusEnum, type Outlet } from '../../../services/outletsService';

export default function VisitsADMIN() {
  const [selectedView, setSelectedView] = useState<'list' | 'validation'>('validation');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [pendingPDV, setPendingPDV] = useState<Outlet[]>([]);
  const [allPDV, setAllPDV] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les PDV depuis l'API
  useEffect(() => {
    loadPDV();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter]);

  const loadPDV = async () => {
    try {
      setIsLoading(true);
      if (selectedFilter === 'pending') {
        const data = await outletsService.getAll({ status: OutletStatusEnum.PENDING });
        setPendingPDV(data);
      } else {
        const data = await outletsService.getAll();
        setAllPDV(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des PDV:', error);
      alert('Erreur lors du chargement des PDV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Valider le PDV "${name}" ?`)) return;
    
    try {
      await outletsService.approve(id);
      alert('✅ PDV validé avec succès!');
      loadPDV(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('❌ Erreur lors de la validation du PDV');
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!rejectionReason.trim()) {
      alert('Veuillez indiquer une raison de rejet');
      return;
    }
    
    try {
      await outletsService.reject(id, rejectionReason);
      alert(`✅ PDV "${name}" rejeté`);
      setShowRejectModal(null);
      setRejectionReason('');
      loadPDV(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('❌ Erreur lors du rejet du PDV');
    }
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête avec navigation */}
      <div className="bg-white border-b border-gray-200">
        {/* Navigation principale */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedView('list')}
            className={`flex-1 px-4 py-4 text-sm font-semibold transition-colors ${
              selectedView === 'list'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Icon name="store" size="sm" variant={selectedView === 'list' ? 'primary' : 'grey'} />
              <span>Points de vente</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedView('validation')}
            className={`flex-1 px-4 py-4 text-sm font-semibold transition-colors relative ${
              selectedView === 'validation'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Icon name="checkCircle" size="sm" variant={selectedView === 'validation' ? 'primary' : 'grey'} />
              <span>À valider</span>
              {pendingPDV.length > 0 && (
                <Badge variant="warning" size="sm">{pendingPDV.length}</Badge>
              )}
            </div>
          </button>
        </div>

        {/* Sous-navigation pour la vue validation */}
        {selectedView === 'validation' && (
          <div className="px-4 py-3">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'pending'
                    ? 'bg-warning text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                En attente ({pendingPDV.length})
              </button>
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Tous les PDV
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Vue Points de vente */}
        {selectedView === 'list' && (
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-3">
              <Icon name="store" size="2xl" variant="primary" />
            </div>
            <p className="text-lg font-semibold text-gray-900">Liste des Points de vente</p>
            <p className="text-sm text-gray-600 mt-1">Fonctionnalité en cours de développement</p>
          </Card>
        )}

        {/* Vue Validation */}
        {selectedView === 'validation' && (
          <>
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600">Chargement des PDV...</p>
              </Card>
            ) : pendingPDV.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-3">
              <Icon name="checkCircle" size="2xl" variant="green" />
            </div>
            <p className="text-lg font-semibold text-gray-900">Aucun PDV en attente</p>
            <p className="text-sm text-gray-600 mt-1">Tous les PDV ont été traités</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingPDV.map((pdv) => (
              <Card key={pdv.id} className="p-4">
                {/* En-tête PDV */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    <Icon name="store" size="2xl" variant="primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{pdv.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{pdv.address || 'Adresse non renseignée'}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="gray" size="sm">{pdv.channel}</Badge>
                      {pdv.segment && <Badge variant="gray" size="sm">Segment {pdv.segment}</Badge>}
                      <Badge variant="warning" size="sm">En attente</Badge>
                    </div>
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="space-y-2 mb-4 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="tag" size="sm" variant="grey" />
                    <span className="text-gray-900">Code: {pdv.code}</span>
                  </div>
                  {pdv.metadata?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="phone" size="sm" variant="grey" />
                      <span className="text-gray-900">{pdv.metadata.phone}</span>
                    </div>
                  )}
                  {pdv.lat && pdv.lng && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="locationMarker" size="sm" variant="grey" />
                      <span className="text-gray-900">
                        {pdv.lat.toFixed(6)}, {pdv.lng.toFixed(6)}
                      </span>
                    </div>
                  )}
                  {pdv.createdBy && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="user" size="sm" variant="grey" />
                      <span className="text-gray-900">
                        Proposé par {pdv.createdBy.firstName} {pdv.createdBy.lastName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="clock" size="sm" variant="grey" />
                    <span className="text-gray-900">
                      {new Date(pdv.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="success" 
                    size="md" 
                    fullWidth
                    onClick={() => handleApprove(pdv.id, pdv.name)}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Icon name="check" size="sm" variant="white" />
                      <span>Valider</span>
                    </span>
                  </Button>
                  <Button 
                    variant="danger" 
                    size="md" 
                    fullWidth
                    onClick={() => setShowRejectModal(pdv.id)}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Icon name="x" size="sm" variant="white" />
                      <span>Rejeter</span>
                    </span>
                  </Button>
                </div>

                {/* Modal de rejet */}
                {showRejectModal === pdv.id && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Rejeter le PDV
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Veuillez indiquer la raison du rejet (obligatoire)
                      </p>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4"
                        rows={4}
                        placeholder="Ex: Adresse incorrecte, doublon, etc."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          fullWidth
                          onClick={() => {
                            setShowRejectModal(null);
                            setRejectionReason('');
                          }}
                        >
                          Annuler
                        </Button>
                        <Button 
                          variant="danger" 
                          fullWidth
                          onClick={() => handleReject(pdv.id, pdv.name)}
                        >
                          Confirmer le rejet
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
