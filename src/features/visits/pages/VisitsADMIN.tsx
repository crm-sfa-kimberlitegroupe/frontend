import { useState, useEffect } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import { outletsService, OutletStatusEnum, type Outlet } from '@/features/pdv/services';
import PDVDetailModal from '@/features/pdv/components/PDVDetailModal';

export default function VisitsADMIN() {
  const [selectedView, setSelectedView] = useState<'list' | 'validation'>('validation');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [pendingPDV, setPendingPDV] = useState<Outlet[]>([]);
  const [approvedPDV, setApprovedPDV] = useState<Outlet[]>([]); // PDV valides pour l'onglet "Points de vente"
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPDV, setSelectedPDV] = useState<Outlet | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les PDV selon la recherche
  const filteredApprovedPDV = approvedPDV.filter((pdv) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      pdv.name.toLowerCase().includes(query) ||
      pdv.code.toLowerCase().includes(query) ||
      pdv.channel.toLowerCase().includes(query) ||
      (pdv.address && pdv.address.toLowerCase().includes(query)) ||
      (pdv.segment && pdv.segment.toLowerCase().includes(query)) ||
      (pdv.proposer && `${pdv.proposer.firstName} ${pdv.proposer.lastName}`.toLowerCase().includes(query))
    );
  });

  const filteredPendingPDV = pendingPDV.filter((pdv) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      pdv.name.toLowerCase().includes(query) ||
      pdv.code.toLowerCase().includes(query) ||
      pdv.channel.toLowerCase().includes(query) ||
      (pdv.address && pdv.address.toLowerCase().includes(query)) ||
      (pdv.segment && pdv.segment.toLowerCase().includes(query)) ||
      (pdv.proposer && `${pdv.proposer.firstName} ${pdv.proposer.lastName}`.toLowerCase().includes(query))
    );
  });

  // Charger les PDV depuis l'API
  useEffect(() => {
    loadAllPDV();
  }, []);

  const loadAllPDV = async () => {
    try {
      setIsLoading(true);
      
      console.log('[loadAllPDV] Chargement de tous les PDV...');
      
      // Charger les deux listes en parallele
      const [approvedData, pendingData] = await Promise.all([
        outletsService.getMyTerritoryOutlets({ status: OutletStatusEnum.APPROVED }),
        outletsService.getMyTerritoryOutlets({ status: OutletStatusEnum.PENDING }),
      ]);
      
      console.log('PDV APPROVED:', approvedData?.length || 0);
      console.log('PDV PENDING:', pendingData?.length || 0);
      
      setApprovedPDV(approvedData || []);
      setPendingPDV(pendingData || []);
    } catch (error) {
      console.error('[loadAllPDV] Erreur lors du chargement:', error);
      setApprovedPDV([]);
      setPendingPDV([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Valider le PDV "${name}" ?`)) return;
    
    try {
      await outletsService.approve(id);
      // Recharger toutes les listes
      await loadAllPDV();
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
      
      // Recharger toutes les listes
      await loadAllPDV();
    } catch {
      alert('Erreur lors du rejet du PDV');
    }
  };

  const handleViewDetails = (pdv: Outlet) => {
    setSelectedPDV(pdv);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPDV(null);
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
              {approvedPDV && approvedPDV.length > 0 && (
                <Badge variant="success" size="sm">{approvedPDV.length}</Badge>
              )}
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

      {/* Barre de recherche */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="relative">
          <Icon 
            name="search" 
            size="sm" 
            variant="grey" 
            className="absolute left-3 top-1/2 -translate-y-1/2" 
          />
          <input
            type="text"
            placeholder="Rechercher un point de vente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Icon name="x" size="sm" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-gray-500 mt-2">
            {selectedView === 'list' 
              ? `${filteredApprovedPDV.length} resultat(s) sur ${approvedPDV.length} PDV valides`
              : `${filteredPendingPDV.length} resultat(s) sur ${pendingPDV.length} PDV en attente`
            }
          </p>
        )}
      </div>

      <div className="p-4">
        {/* Vue Points de vente */}
        {selectedView === 'list' && (
          <>
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600">Chargement des points de vente...</p>
              </Card>
            ) : filteredApprovedPDV.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex justify-center mb-3">
                  <Icon name="store" size="2xl" variant="grey" />
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {searchQuery ? 'Aucun resultat' : 'Aucun point de vente valide'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {searchQuery 
                    ? `Aucun PDV ne correspond a "${searchQuery}"`
                    : 'Aucun PDV valide trouve pour votre territoire.'
                  }
                </p>
                {!searchQuery && (
                  <p className="text-xs text-gray-500 mt-2">
                    Les points de vente proposes par vos vendeurs apparaitront dans l'onglet "A valider"
                  </p>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApprovedPDV.map((pdv) => (
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

                    {/* Bouton Voir details */}
                    <div className="mt-4">
                      <Button 
                        variant="primary" 
                        size="md" 
                        fullWidth
                        onClick={() => handleViewDetails(pdv)}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Icon name="eye" size="sm" variant="white" />
                          <span>Voir details</span>
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
            ) : filteredPendingPDV.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex justify-center mb-3">
                  <Icon name={searchQuery ? "search" : "checkCircle"} size="2xl" variant={searchQuery ? "grey" : "green"} />
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {searchQuery ? 'Aucun resultat' : 'Aucun PDV en attente'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {searchQuery 
                    ? `Aucun PDV ne correspond a "${searchQuery}"`
                    : 'Tous les PDV de votre territoire ont ete traites'
                  }
                </p>
                {!searchQuery && (
                  <p className="text-xs text-gray-500 mt-2">
                    Les nouveaux PDV proposes par vos vendeurs apparaitront ici
                  </p>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPendingPDV.map((pdv) => (
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

      {/* Modal de details du PDV */}
      <PDVDetailModal
        pdv={selectedPDV}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
