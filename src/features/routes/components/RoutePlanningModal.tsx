import { useState, useEffect } from 'react';
import Modal from '../../../core/ui/feedback/Modal';
import Button from '../../../core/ui/Button';
import { Icon } from '../../../core/ui/Icon';
import Badge from '../../../core/ui/Badge';
import usersService, { type User } from '../../users/services/usersService';
import outletsService, { type Outlet } from '../../pdv/services/outletsService';
import routesService from '../services/routesService';

interface RoutePlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RoutePlanningModal({ isOpen, onClose, onSuccess }: RoutePlanningModalProps) {
  const [step, setStep] = useState<'rep' | 'date' | 'outlets' | 'order'>('rep');
  const [selectedRep, setSelectedRep] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [orderedOutlets, setOrderedOutlets] = useState<string[]>([]);
  
  const [reps, setReps] = useState<User[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les REPs
  useEffect(() => {
    if (isOpen && step === 'rep') {
      loadReps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step]);

  // Charger les outlets quand un REP est sélectionné
  useEffect(() => {
    if (selectedRep && step === 'outlets') {
      loadOutlets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRep, step]);

  const loadReps = async () => {
    try {
      setLoading(true);
      setError(null);
      const allUsers = await usersService.getAll();
      
      const repUsers = allUsers.filter(u => u.role === 'REP' && u.status === 'ACTIVE');
      
      setReps(repUsers);
      
      if (repUsers.length === 0) {
        setError('Aucun représentant actif trouvé. Vérifiez que des utilisateurs avec le rôle REP existent et sont actifs.');
      }
    } catch {
      setError('Impossible de charger les représentants');
    } finally {
      setLoading(false);
    }
  };

  const loadOutlets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier si le REP a un territoire
      if (!selectedRep?.territory) {
        // Si pas de territoire, on charge tous les points de vente
        const allOutlets = await outletsService.getAll({
          status: 'APPROVED'
        });
        setOutlets(allOutlets);
        return;
      }
      
      // Si le REP a un territoire, on charge les points de vente de ce territoire
      const allOutlets = await outletsService.getAll({
        territoryId: selectedRep.territory,
        status: 'APPROVED'
      });
      
      setOutlets(allOutlets);
    } catch (err) {
      setError('Impossible de charger les points de vente. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  const handleRepSelect = (rep: User) => {
    setSelectedRep(rep);
    setStep('date');
  };

  const handleDateConfirm = () => {
    if (!selectedDate) {
      setError('Veuillez sélectionner une date');
      return;
    }
    setStep('outlets');
  };

  const toggleOutletSelection = (outletId: string) => {
    setSelectedOutlets(prev => {
      if (prev.includes(outletId)) {
        return prev.filter(id => id !== outletId);
      } else {
        return [...prev, outletId];
      }
    });
  };

  const handleOutletsConfirm = () => {
    if (selectedOutlets.length === 0) {
      setError('Veuillez sélectionner au moins un point de vente');
      return;
    }
    setOrderedOutlets([...selectedOutlets]);
    setStep('order');
  };

  const moveOutlet = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...orderedOutlets];
    if (direction === 'up' && index > 0) {
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    }
    setOrderedOutlets(newOrder);
  };

  const handleCreateRoute = async () => {
    if (!selectedRep || !selectedDate || orderedOutlets.length === 0) {
      setError('Informations manquantes');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await routesService.create({
        userId: selectedRep.id,
        date: selectedDate,
        outletIds: orderedOutlets
      });

      // Réinitialiser et fermer
      resetModal();
      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la création de la route';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('rep');
    setSelectedRep(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedOutlets([]);
    setOrderedOutlets([]);
    setSearchTerm('');
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getOutletById = (id: string) => outlets.find(o => o.id === id);

  const filteredReps = reps.filter(rep => 
    `${rep.firstName} ${rep.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOutlets = outlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outlet.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Planifier une route">
      <div className="space-y-4">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-6">
          {[
            { key: 'rep', label: 'REP', icon: 'user' },
            { key: 'date', label: 'Date', icon: 'calendar' },
            { key: 'outlets', label: 'PDV', icon: 'map' },
            { key: 'order', label: 'Ordre', icon: 'list' }
          ].map((s, idx) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step === s.key ? 'bg-primary text-white' :
                ['rep', 'date', 'outlets', 'order'].indexOf(step) > idx ? 'bg-success text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                <Icon name={s.icon as any} size="sm" />
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">{s.label}</span>
              {idx < 3 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <Icon name="warning" size="sm" variant="red" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Étape 1: Sélection du REP */}
        {step === 'rep' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un représentant
              </label>
              <div className="relative">
                <Icon name="search" size="sm" variant="grey" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un REP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <Icon name="refresh" size="lg" variant="primary" className="animate-spin mb-2" />
                  <p className="text-sm text-gray-600">Chargement...</p>
                </div>
              ) : filteredReps.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="user" size="lg" variant="grey" className="mb-2" />
                  <p className="text-sm text-gray-600">Aucun représentant trouvé</p>
                </div>
              ) : (
                filteredReps.map(rep => (
                  <button
                    key={rep.id}
                    onClick={() => handleRepSelect(rep)}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="user" size="lg" variant="primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {rep.firstName} {rep.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{rep.email}</p>
                        {rep.territory && (
                          <Badge variant="gray" size="sm" className="mt-1">
                            {rep.territoryName || rep.territory}
                          </Badge>
                        )}
                      </div>
                      <Icon name="chevronRight" size="sm" variant="grey" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Étape 2: Sélection de la date */}
        {step === 'date' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="user" size="lg" variant="primary" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedRep?.firstName} {selectedRep?.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">{selectedRep?.email}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de la route
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('rep')} fullWidth>
                <Icon name="chevronLeft" size="sm" className="mr-2" />
                Retour
              </Button>
              <Button variant="primary" onClick={handleDateConfirm} fullWidth>
                Suivant
                <Icon name="chevronRight" size="sm" className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Étape 3: Sélection des PDV */}
        {step === 'outlets' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  <strong>{selectedRep?.firstName} {selectedRep?.lastName}</strong>
                </span>
                <span className="text-gray-600">
                  {new Date(selectedDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Sélectionner les points de vente
                </label>
                <Badge variant="primary" size="sm">
                  {selectedOutlets.length} sélectionné(s)
                </Badge>
              </div>
              <div className="relative">
                <Icon name="search" size="sm" variant="grey" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un PDV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <Icon name="refresh" size="lg" variant="primary" className="animate-spin mb-2" />
                  <p className="text-sm text-gray-600">Chargement...</p>
                </div>
              ) : filteredOutlets.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="map" size="lg" variant="grey" className="mb-2" />
                  <p className="text-sm text-gray-600">Aucun point de vente trouvé</p>
                </div>
              ) : (
                filteredOutlets.map(outlet => (
                  <button
                    key={outlet.id}
                    onClick={() => toggleOutletSelection(outlet.id)}
                    className={`w-full p-3 border rounded-lg transition-all text-left ${
                      selectedOutlets.includes(outlet.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedOutlets.includes(outlet.id)
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}>
                        {selectedOutlets.includes(outlet.id) && (
                          <Icon name="check" size="xs" className="text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{outlet.name}</h4>
                        <p className="text-xs text-gray-600">{outlet.code}</p>
                        {outlet.address && (
                          <p className="text-xs text-gray-500 mt-1">{outlet.address}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('date')} fullWidth>
                <Icon name="chevronLeft" size="sm" className="mr-2" />
                Retour
              </Button>
              <Button 
                variant="primary" 
                onClick={handleOutletsConfirm} 
                fullWidth
                disabled={selectedOutlets.length === 0}
              >
                Suivant
                <Icon name="chevronRight" size="sm" className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Étape 4: Ordre des visites */}
        {step === 'order' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  <strong>{selectedRep?.firstName} {selectedRep?.lastName}</strong>
                </span>
                <span className="text-gray-600">
                  {new Date(selectedDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Définir l'ordre des visites ({orderedOutlets.length} PDV)
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Utilisez les flèches pour réorganiser l'ordre des visites
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {orderedOutlets.map((outletId, index) => {
                const outlet = getOutletById(outletId);
                if (!outlet) return null;

                return (
                  <div
                    key={outletId}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveOutlet(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Icon name="chevronUp" size="xs" variant="grey" />
                      </button>
                      <button
                        onClick={() => moveOutlet(index, 'down')}
                        disabled={index === orderedOutlets.length - 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Icon name="chevronDown" size="xs" variant="grey" />
                      </button>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{outlet.name}</h4>
                      <p className="text-xs text-gray-600">{outlet.code}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('outlets')} fullWidth>
                <Icon name="chevronLeft" size="sm" className="mr-2" />
                Retour
              </Button>
              <Button 
                variant="success" 
                onClick={handleCreateRoute} 
                fullWidth
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="refresh" size="sm" className="mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Icon name="check" size="sm" className="mr-2" />
                    Créer la route
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
