import { useState, useEffect } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import { outletsService, OutletStatusEnum, type Outlet } from '@/features/pdv/services';
import PDVDetailsModal from '../components/PDVDetailsModal';

export default function VisitsADMIN() {
  const [selectedView, setSelectedView] = useState<'list' | 'validation'>('validation');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [pendingPDV, setPendingPDV] = useState<Outlet[]>([]);
  const [approvedPDV, setApprovedPDV] = useState<Outlet[]>([]); // PDV validés pour l'onglet "Points de vente"
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPDV, setSelectedPDV] = useState<Outlet | null>(null);

  // Charger les PDV depuis l'API
  useEffect(() => {
    loadPDV();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedView]);

  const loadPDV = async () => {
    try {
      setIsLoading(true);
      
      if (selectedView === 'list') {
        const data = await outletsService.getMyTerritoryOutlets({ 
          status: OutletStatusEnum.APPROVED,
        });
        setApprovedPDV(data || []);
      } else {
        const data = await outletsService.getMyTerritoryOutlets({  
          status: OutletStatusEnum.PENDING,
        });
        setPendingPDV(data || []);
      }
    } catch {
      // En cas d'erreur, initialiser avec un tableau vide
      if (selectedView === 'list') {
        setApprovedPDV([]);
      } else {
        setPendingPDV([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Valider le PDV "${name}" ?`)) return;
    
    try {
      await outletsService.approve(id);
      // Recharger la liste actuelle
      await loadPDV();
    } catch {
      alert('Erreur lors de la validation du PDV');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Veuillez indiquer une raison de rejet');
      return;
    }
    
    try {
      await outletsService.reject(id, rejectionReason);
      setShowRejectModal(null);
      setRejectionReason('');
      
      // Recharger la liste actuelle
      await loadPDV();
    } catch {
      alert('Erreur lors du rejet du PDV');
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
              {pendingPDV && pendingPDV.length > 0 && (
                <Badge variant="warning" size="sm">{pendingPDV.length}</Badge>
              )}
            </div>
          </button>
        </div>

      </div>

      <div className="p-4">
        {/* Vue Points de vente */}
        {selectedView === 'list' && (
          <>
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600">Chargement des points de vente...</p>
              </Card>
            ) : !approvedPDV || approvedPDV.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex justify-center mb-3">
                  <Icon name="store" size="2xl" variant="grey" />
                </div>
                <p className="text-lg font-semibold text-gray-900">Aucun point de vente validé</p>
                <p className="text-sm text-gray-600 mt-1">
                  Aucun PDV validé trouvé pour votre territoire.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Les points de vente proposés par vos vendeurs apparaîtront dans l'onglet "À valider"
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvedPDV.map((pdv) => (
                  <Card key={pdv.id} className="p-4">
                    {/* En-tête PDV */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-success/20 to-primary/20 rounded-lg flex items-center justify-center">
                        <Icon name="store" size="2xl" variant="green" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{pdv.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{pdv.address || 'Adresse non renseignée'}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="gray" size="sm">{pdv.channel}</Badge>
                          {pdv.segment && <Badge variant="gray" size="sm">Segment {pdv.segment}</Badge>}
                          <Badge variant="success" size="sm">✓ Validé</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Informations détaillées */}
                    <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="store" size="sm" variant="grey" />
                        <span className="text-gray-900">Code: {pdv.code}</span>
                      </div>
                      {pdv.lat && pdv.lng && (
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="locationMarker" size="sm" variant="grey" />
                          <span className="text-gray-900">
                            {Number(pdv.lat).toFixed(6)}, {Number(pdv.lng).toFixed(6)}
                          </span>
                        </div>
                      )}
                      {pdv.proposer && (
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="user" size="sm" variant="grey" />
                          <span className="text-gray-900">
                            Proposé par {pdv.proposer.firstName} {pdv.proposer.lastName}
                          </span>
                        </div>
                      )}
                      {pdv.validator && (
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="checkCircle" size="sm" variant="green" />
                          <span className="text-gray-900">
                            Validé par {pdv.validator.firstName} {pdv.validator.lastName}
                          </span>
                        </div>
                      )}
                      {pdv.validatedAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="clock" size="sm" variant="grey" />
                          <span className="text-gray-900">
                            Validé le {new Date(pdv.validatedAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bouton Voir détails */}
                    <div className="mt-4">
                      <Button 
                        variant="primary" 
                        size="md" 
                        fullWidth
                        onClick={() => setSelectedPDV(pdv)}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Icon name="eye" size="sm" variant="white" />
                          <span>Voir détails & Modifier</span>
                        </span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Vue Validation */}
        {selectedView === 'validation' && (
          <>
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600">Chargement des PDV...</p>
              </Card>
            ) : !pendingPDV || pendingPDV.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex justify-center mb-3">
                  <Icon name="checkCircle" size="2xl" variant="green" />
                </div>
                <p className="text-lg font-semibold text-gray-900">Aucun PDV en attente</p>
                <p className="text-sm text-gray-600 mt-1">
                  Tous les PDV de votre territoire ont été traités
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Les nouveaux PDV proposés par vos vendeurs apparaîtront ici
                </p>
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
                    <Icon name="store" size="sm" variant="grey" />
                    <span className="text-gray-900">Code: {pdv.code}</span>
                  </div>
                  {pdv.lat && pdv.lng && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="locationMarker" size="sm" variant="grey" />
                      <span className="text-gray-900">
                        {Number(pdv.lat).toFixed(6)}, {Number(pdv.lng).toFixed(6)}
                      </span>
                    </div>
                  )}
                  {pdv.proposer && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="user" size="sm" variant="grey" />
                      <span className="text-gray-900">
                        Proposé par {pdv.proposer.firstName} {pdv.proposer.lastName}
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
                          onClick={() => handleReject(pdv.id)}
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

      {/* Modal de détails/édition */}
      <PDVDetailsModal 
        pdv={selectedPDV}
        onClose={() => setSelectedPDV(null)}
        onUpdate={loadPDV}
      />
    </div>
  );
}
