import { useState } from 'react';
import { UserPlus, Users, MapPin, Search } from 'lucide-react';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import Modal from '../../../core/ui/feedback/Modal';
import { Icon } from '../../../core/ui/Icon';
import territoriesService, { type Territory, type Outlet } from '../services/territoriesService';
import { useAssignment } from '../hooks/useAssignment';

const showSuccess = (message: string) => alert(message);
const showError = (message: string) => alert(`Erreur: ${message}`);

type SubTab = 'vendor-assignment' | 'outlets-to-sector' | 'vendor-to-sector' | 'outlets-to-vendor';

interface Props {
  sectors: Territory[];
  outlets: Outlet[];
  vendors: any[];
  onSuccess: () => void;
}

interface AssignVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector: Territory | null;
  availableVendors: any[];
  onAssign: (vendorId: string) => void;
  loading: boolean;
}

function AssignVendorModal({ isOpen, onClose, sector, availableVendors, onAssign, loading }: AssignVendorModalProps) {
  const [selectedVendorId, setSelectedVendorId] = useState('');

  const handleAssign = () => {
    if (selectedVendorId) {
      onAssign(selectedVendorId);
    }
  };

  const handleClose = () => {
    setSelectedVendorId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assigner un Vendeur">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Secteur sélectionné</h3>
          <p className="text-sm text-blue-800">
            <strong>{sector?.name}</strong> ({sector?.code})
          </p>
          {sector?.parent && (
            <p className="text-xs text-blue-600 mt-1">
              Territoire: {sector.parent.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un Vendeur *
          </label>
          <select
            value={selectedVendorId}
            onChange={(e) => setSelectedVendorId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">Choisir un vendeur</option>
            {availableVendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.firstName} {vendor.lastName} ({vendor.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            disabled={!selectedVendorId || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Icon name="refresh" size="sm" className="mr-2 animate-spin" />
                Assignation...
              </>
            ) : (
              <>
                <Icon name="check" size="sm" className="mr-2" />
                Assigner
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function SectorsAssignTab({ sectors, outlets, vendors, onSuccess }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('vendor-to-sector');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hook pour gérer les assignations
  const { loading, executeAssignment } = useAssignment({ onSuccess });
  
  // États pour assignations
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  
  // Modal states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSectorForAssign, setSelectedSectorForAssign] = useState<Territory | null>(null);
  const [loadingAssign, setLoadingAssign] = useState(false);

  // Assigner PDV à un secteur
  const handleAssignOutletsToSector = async () => {
    if (selectedOutlets.length === 0) {
      showError('Veuillez sélectionner au moins un PDV');
      return;
    }
    if (!selectedSectorId) {
      showError('Veuillez sélectionner un secteur');
      return;
    }

    await executeAssignment(
      () => territoriesService.assignOutletsToSector({
        sectorId: selectedSectorId,
        outletIds: selectedOutlets,
      }),
      `${selectedOutlets.length} PDV assignés au secteur`,
      () => {
        setSelectedOutlets([]);
        setSelectedSectorId('');
      }
    );
  };

  // Nouvelles fonctions pour l'assignation des vendeurs
  const handleOpenAssignModal = (sector: Territory) => {
    setSelectedSectorForAssign(sector);
    setIsAssignModalOpen(true);
  };

  const handleAssignVendor = async (vendorId: string) => {
    if (!selectedSectorForAssign) return;

    try {
      setLoadingAssign(true);
      
      // Si le secteur a déjà un vendeur, on fait une réassignation
      if (selectedSectorForAssign.assignedVendorId) {
        await territoriesService.reassignSectorVendor(selectedSectorForAssign.id, vendorId);
        showSuccess('Vendeur changé avec succès !');
      } else {
        await territoriesService.assignSectorToVendor({
          vendorId,
          sectorId: selectedSectorForAssign.id,
        });
        showSuccess('Vendeur assigné avec succès !');
      }

      // Recharger les données
      onSuccess();
      
      // Fermer le modal
      setIsAssignModalOpen(false);
      setSelectedSectorForAssign(null);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Erreur lors de l\'assignation');
    } finally {
      setLoadingAssign(false);
    }
  };

  const handleUnassignVendor = async (sectorId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désassigner ce vendeur ?')) return;

    try {
      setLoadingAssign(true);
      await territoriesService.unassignSectorVendor(sectorId);
      showSuccess('Vendeur désassigné avec succès');
      onSuccess();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Erreur lors de la désassignation');
    } finally {
      setLoadingAssign(false);
    }
  };

  // Assigner vendeur à un secteur (ancienne méthode)
  const handleAssignVendorToSector = async () => {
    if (!selectedVendorId) {
      showError('Veuillez sélectionner un vendeur');
      return;
    }
    if (!selectedSectorId) {
      showError('Veuillez sélectionner un secteur');
      return;
    }

    await executeAssignment(
      () => territoriesService.assignSectorToVendor({
        vendorId: selectedVendorId,
        sectorId: selectedSectorId,
      }),
      'Vendeur assigné au secteur avec succès',
      () => {
        setSelectedVendorId('');
        setSelectedSectorId('');
      }
    );
  };

  // Assigner PDV directement à un vendeur
  const handleAssignOutletsToVendor = async () => {
    if (selectedOutlets.length === 0) {
      showError('Veuillez sélectionner au moins un PDV');
      return;
    }
    if (!selectedVendorId) {
      showError('Veuillez sélectionner un vendeur');
      return;
    }

    await executeAssignment(
      () => territoriesService.assignOutletsToVendor({
        vendorId: selectedVendorId,
        outletIds: selectedOutlets,
      }),
      `${selectedOutlets.length} PDV assignés au vendeur`,
      () => {
        setSelectedOutlets([]);
        setSelectedVendorId('');
      }
    );
  };

  const toggleOutletSelection = (outletId: string) => {
    setSelectedOutlets(prev =>
      prev.includes(outletId) ? prev.filter(id => id !== outletId) : [...prev, outletId]
    );
  };

  // Filtrer les données
  const availableOutlets = outlets.filter(o => !(o as any).sectorId);
  const availableVendors = vendors.filter((v: any) => !v.assignedSectorId);
  
  const filteredSectors = sectors.filter(
    (sector) =>
      sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sector.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sector.assignedVendor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sector.assignedVendor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const assignedSectors = filteredSectors.filter(s => s.assignedVendorId);
  const unassignedSectors = filteredSectors.filter(s => !s.assignedVendorId);

  return (
    <div className="space-y-6">
      {/* Sous-navigation */}
      <div className="bg-gray-50 rounded-lg p-2 flex gap-2">
        <button
          onClick={() => setActiveSubTab('vendor-assignment')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeSubTab === 'vendor-assignment'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          Assignation Vendeurs
        </button>
        <button
          onClick={() => setActiveSubTab('vendor-to-sector')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeSubTab === 'vendor-to-sector'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Vendeur → Secteur
        </button>
        <button
          onClick={() => setActiveSubTab('outlets-to-sector')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeSubTab === 'outlets-to-sector'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          PDV → Secteur
        </button>
        <button
          onClick={() => setActiveSubTab('outlets-to-vendor')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeSubTab === 'outlets-to-vendor'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          PDV → Vendeur
        </button>
      </div>

      {/* Onglet Assignation des Vendeurs */}
      {activeSubTab === 'vendor-assignment' && (
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Secteurs</p>
                  <p className="text-2xl font-bold text-gray-900">{sectors.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Secteurs Assignés</p>
                  <p className="text-2xl font-bold text-green-600">{assignedSectors.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sans Vendeur</p>
                  <p className="text-2xl font-bold text-orange-600">{unassignedSectors.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vendeurs Disponibles</p>
                  <p className="text-2xl font-bold text-purple-600">{availableVendors.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un secteur ou vendeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Liste des secteurs */}
          <div className="space-y-6">
            {/* Secteurs non assignés */}
            {unassignedSectors.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="warning" size="sm" variant="red" />
                  Secteurs sans Vendeur ({unassignedSectors.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {unassignedSectors.map((sector) => (
                    <div
                      key={sector.id}
                      className="bg-white rounded-lg shadow-sm border border-orange-200 p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{sector.name}</h3>
                          <p className="text-sm text-gray-500">{sector.code}</p>
                          {sector.parent && (
                            <p className="text-xs text-gray-400 mt-1">
                              Territoire: {sector.parent.name}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenAssignModal(sector)}
                            disabled={availableVendors.length === 0}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Assigner
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                          <Icon name="user" size="sm" variant="grey" />
                          <span className="text-xs text-gray-500 flex-1">Aucun vendeur assigné</span>
                          <Badge variant="warning" size="sm">Non assigné</Badge>
                        </div>

                        {sector.outletsCount !== undefined && (
                          <div className="flex items-center gap-2">
                            <Icon name="store" size="sm" variant="grey" />
                            <span className="text-gray-700">
                              {sector.outletsCount} PDV
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Secteurs assignés */}
            {assignedSectors.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="check" size="sm" variant="green" />
                  Secteurs Assignés ({assignedSectors.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {assignedSectors.map((sector) => (
                    <div
                      key={sector.id}
                      className="bg-white rounded-lg shadow-sm border border-green-200 p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{sector.name}</h3>
                          <p className="text-sm text-gray-500">{sector.code}</p>
                          {sector.parent && (
                            <p className="text-xs text-gray-400 mt-1">
                              Territoire: {sector.parent.name}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenAssignModal(sector)}
                          >
                            👤 Changer
                          </Button>
                          <button
                            onClick={() => handleUnassignVendor(sector.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Désassigner"
                          >
                            <Icon name="minus" size="sm" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {sector.assignedVendor ? (
                          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <Icon name="user" size="sm" variant="grey" />
                            <div className="flex-1">
                              <span className="text-xs text-gray-500">Vendeur:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {sector.assignedVendor.firstName} {sector.assignedVendor.lastName}
                              </span>
                            </div>
                            <Badge variant="success" size="sm">Assigné</Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <Icon name="user" size="sm" variant="grey" />
                            <span className="text-xs text-gray-500 flex-1">Vendeur non trouvé</span>
                            <Badge variant="gray" size="sm">Erreur</Badge>
                          </div>
                        )}

                        {sector.outletsCount !== undefined && (
                          <div className="flex items-center gap-2">
                            <Icon name="store" size="sm" variant="grey" />
                            <span className="text-gray-700">
                              {sector.outletsCount} PDV
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredSectors.length === 0 && (
              <div className="text-center py-12">
                <Icon name="map" size="lg" variant="grey" className="mb-3" />
                <p className="text-gray-600">Aucun secteur trouvé</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenu Vendeur → Secteur (Interface Simple) */}
      {activeSubTab === 'vendor-to-sector' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Assigner un Vendeur à un Secteur
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un Vendeur *
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Choisir un vendeur</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.firstName} {vendor.lastName} ({vendor.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un Secteur *
              </label>
              <select
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Choisir un secteur</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name} - {sector.parent?.name || 'Sans parent'}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleAssignVendorToSector}
              disabled={!selectedVendorId || !selectedSectorId || loading}
            >
              {loading ? (
                <>
                  <Icon name="refresh" size="sm" className="mr-2 animate-spin" />
                  Assignation...
                </>
              ) : (
                <>
                  <Icon name="check" size="sm" className="mr-2" />
                  Assigner au Secteur
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Contenu PDV → Secteur */}
      {activeSubTab === 'outlets-to-sector' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Assigner des PDV à un Secteur
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un Secteur *
              </label>
              <select
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Choisir un secteur</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name} ({sector.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner des PDV ({selectedOutlets.length} sélectionnés)
              </label>
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {availableOutlets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Aucun PDV disponible</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {availableOutlets.map((outlet) => (
                      <label key={outlet.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedOutlets.includes(outlet.id)}
                          onChange={() => toggleOutletSelection(outlet.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{outlet.name}</p>
                          <p className="text-xs text-gray-500">{outlet.code}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleAssignOutletsToSector}
              disabled={!selectedSectorId || selectedOutlets.length === 0 || loading}
            >
              {loading ? (
                <>
                  <Icon name="refresh" size="sm" className="mr-2 animate-spin" />
                  Assignation...
                </>
              ) : (
                <>
                  <Icon name="check" size="sm" className="mr-2" />
                  Assigner {selectedOutlets.length} PDV
                </>
              )}
            </Button>
          </div>
        </div>
      )}


      {/* Contenu PDV → Vendeur */}
      {activeSubTab === 'outlets-to-vendor' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Assigner des PDV directement à un Vendeur
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Le vendeur doit avoir un secteur assigné. Les PDV seront automatiquement ajoutés à son secteur.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un Vendeur *
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Choisir un vendeur</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.firstName} {vendor.lastName}
                    {(vendor as any).assignedSector && ` - ${(vendor as any).assignedSector.name}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner des PDV ({selectedOutlets.length} sélectionnés)
              </label>
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {availableOutlets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Aucun PDV disponible</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {availableOutlets.map((outlet) => (
                      <label key={outlet.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedOutlets.includes(outlet.id)}
                          onChange={() => toggleOutletSelection(outlet.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{outlet.name}</p>
                          <p className="text-xs text-gray-500">{outlet.code}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleAssignOutletsToVendor}
              disabled={!selectedVendorId || selectedOutlets.length === 0 || loading}
            >
              {loading ? (
                <>
                  <Icon name="refresh" size="sm" className="mr-2 animate-spin" />
                  Assignation...
                </>
              ) : (
                <>
                  <Icon name="check" size="sm" className="mr-2" />
                  Assigner {selectedOutlets.length} PDV au Vendeur
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Modal d'assignation */}
      <AssignVendorModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        sector={selectedSectorForAssign}
        availableVendors={availableVendors}
        onAssign={handleAssignVendor}
        loading={loadingAssign}
      />
    </div>
  );
}
