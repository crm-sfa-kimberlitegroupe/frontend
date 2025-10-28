import { useState, useEffect } from 'react';
import { UserPlus, Edit, Settings } from 'lucide-react';
import { Icon } from '../../../core/ui/Icon';
import Badge from '../../../core/ui/Badge';
import Button from '../../../core/ui/Button';
import Modal from '../../../core/ui/feedback/Modal';
import territoriesService, { type Territory } from '../services/territoriesService';
import usersService from '../../users/services/usersService';
import outletsService, { type Outlet } from '../../pdv/services/outletsService';

const showSuccess = (message: string) => alert(message);
const showError = (message: string) => alert(`Erreur: ${message}`);

interface Props {
  sectors: Territory[];
  loading: boolean;
  onDelete: () => void;
}

export default function SectorsListTab({ sectors, loading, onDelete }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<Territory | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // États pour la gestion des vendeurs
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [availableVendors, setAvailableVendors] = useState<any[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [loadingVendor, setLoadingVendor] = useState(false);
  
  // États pour la modification des PDV
  const [showEditModal, setShowEditModal] = useState(false);
  const [availableOutlets, setAvailableOutlets] = useState<Outlet[]>([]);
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [loadingEdit, setLoadingEdit] = useState(false);

  useEffect(() => {
    loadVendors();
    loadOutlets();
  }, []);

  const loadVendors = async () => {
    try {
      const users = await usersService.getAll();
      const vendors = users.filter((u: any) => u.role === 'REP' && u.status === 'ACTIVE');
      setAvailableVendors(vendors);
    } catch (error) {
      console.error('Erreur chargement vendeurs:', error);
    }
  };

  const loadOutlets = async () => {
    try {
      const outlets = await outletsService.getAll();
      setAvailableOutlets(outlets);
    } catch (error) {
      console.error('Erreur chargement PDV:', error);
    }
  };

  // Gestion des vendeurs
  const handleOpenVendorModal = (sector: Territory) => {
    setSelectedSector(sector);
    setSelectedVendorId(sector.assignedVendor?.id || '');
    setShowVendorModal(true);
  };

  const handleAssignVendor = async () => {
    if (!selectedSector || !selectedVendorId) return;

    try {
      setLoadingVendor(true);
      
      if (selectedSector.assignedVendorId) {
        // Réassigner
        await territoriesService.reassignSectorVendor(selectedSector.id, selectedVendorId);
        showSuccess('Vendeur changé avec succès !');
      } else {
        // Première assignation
        await territoriesService.assignSectorToVendor({
          vendorId: selectedVendorId,
          sectorId: selectedSector.id,
        });
        showSuccess('Vendeur assigné avec succès !');
      }

      onDelete(); // Recharger les données
      setShowVendorModal(false);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Erreur lors de l\'assignation');
    } finally {
      setLoadingVendor(false);
    }
  };

  const handleUnassignVendor = async (sectorId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désassigner ce vendeur ?')) return;

    try {
      setLoadingVendor(true);
      await territoriesService.unassignSectorVendor(sectorId);
      showSuccess('Vendeur désassigné avec succès');
      onDelete();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Erreur lors de la désassignation');
    } finally {
      setLoadingVendor(false);
    }
  };

  // Gestion des PDV
  const handleOpenEditModal = (sector: Territory) => {
    setSelectedSector(sector);
    const currentOutlets = sector.outletsSector?.map((o: any) => o.id) || [];
    setSelectedOutlets(currentOutlets);
    setShowEditModal(true);
  };

  const handleSaveOutlets = async () => {
    if (!selectedSector) return;

    try {
      setLoadingEdit(true);
      
      const currentOutlets = selectedSector.outletsSector?.map((o: any) => o.id) || [];
      const toAdd = selectedOutlets.filter(id => !currentOutlets.includes(id));
      const toRemove = currentOutlets.filter(id => !selectedOutlets.includes(id));

      // Ajouter les nouveaux PDV
      if (toAdd.length > 0) {
        await territoriesService.assignOutletsToSector({
          sectorId: selectedSector.id,
          outletIds: toAdd,
        });
      }

      // Retirer les PDV désélectionnés
      if (toRemove.length > 0) {
        await territoriesService.removeOutletsFromSector({
          sectorId: selectedSector.id,
          outletIds: toRemove,
        });
      }

      showSuccess('PDV mis à jour avec succès !');
      onDelete(); // Recharger les données
      setShowEditModal(false);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoadingEdit(false);
    }
  };

  const toggleOutletSelection = (outletId: string) => {
    setSelectedOutlets(prev =>
      prev.includes(outletId) ? prev.filter(id => id !== outletId) : [...prev, outletId]
    );
  };

  const handleDeleteSector = async (sectorId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce secteur ?')) return;

    try {
      setDeleting(true);
      await territoriesService.deleteSector(sectorId);
      showSuccess('Secteur supprimé avec succès');
      onDelete();
    } catch (error: any) {
      console.error('Erreur suppression secteur:', error);
      showError(error?.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const filteredSectors = sectors.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Icon name="search" size="sm" variant="grey" className="absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher un secteur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="refresh" size="lg" variant="primary" className="animate-spin" />
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        ) : filteredSectors.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="map" size="lg" variant="grey" className="mb-3" />
            <p className="text-gray-600">Aucun secteur trouvé</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Secteur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone Parent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PDV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendeurs</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSectors.map((sector) => (
                <tr key={sector.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{sector.name}</div>
                    <div className="text-sm text-gray-500">{sector.code}</div>
                  </td>
                  <td className="px-6 py-4">
                    {sector.parent ? (
                      <Badge variant="gray" size="sm">{sector.parent.name}</Badge>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="primary" size="sm">{sector.outletsSector?.length || 0} PDV</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {sector.assignedVendor ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="success" size="sm">
                          {sector.assignedVendor.firstName} {sector.assignedVendor.lastName}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="gray" size="sm">Aucun vendeur</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Bouton Gérer Vendeur */}
                      <button
                        onClick={() => handleOpenVendorModal(sector)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title={sector.assignedVendor ? "Changer vendeur" : "Assigner vendeur"}
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      
                      {/* Bouton Désassigner Vendeur */}
                      {sector.assignedVendor && (
                        <button
                          onClick={() => handleUnassignVendor(sector.id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Désassigner vendeur"
                        >
                          <Icon name="userMinus" size="sm" />
                        </button>
                      )}
                      
                      {/* Bouton Modifier PDV */}
                      <button
                        onClick={() => handleOpenEditModal(sector)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Modifier les PDV"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {/* Bouton Voir Détails */}
                      <button
                        onClick={() => {
                          setSelectedSector(sector);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Voir détails"
                      >
                        <Icon name="eye" size="sm" />
                      </button>
                      
                      {/* Bouton Supprimer */}
                      <button
                        onClick={() => handleDeleteSector(sector.id)}
                        disabled={deleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="Supprimer secteur"
                      >
                        <Icon name="trash" size="sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal détails */}
      {selectedSector && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`Détails : ${selectedSector.name}`}
        >
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Code:</span>
                  <span className="text-sm font-medium">{selectedSector.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Zone parent:</span>
                  <span className="text-sm font-medium">{selectedSector.parent?.name || '-'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Points de Vente ({selectedSector.outletsSector?.length || 0})
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                {selectedSector.outletsSector && selectedSector.outletsSector.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedSector.outletsSector.map((outlet: any) => (
                      <li key={outlet.id} className="text-sm">
                        <span className="font-medium">{outlet.name}</span>
                        <span className="text-gray-500"> - {outlet.code}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Aucun PDV</p>
                )}
              </div>
            </div>

            <Button variant="outline" onClick={() => setShowDetailsModal(false)} fullWidth>
              Fermer
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal Gestion Vendeur */}
      {selectedSector && (
        <Modal
          isOpen={showVendorModal}
          onClose={() => setShowVendorModal(false)}
          title={`Gérer le vendeur - ${selectedSector.name}`}
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Secteur sélectionné</h3>
              <p className="text-sm text-blue-800">
                <strong>{selectedSector.name}</strong> ({selectedSector.code})
              </p>
              {selectedSector.assignedVendor && (
                <p className="text-xs text-blue-600 mt-1">
                  Vendeur actuel: {selectedSector.assignedVendor.firstName} {selectedSector.assignedVendor.lastName}
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
                onClick={() => setShowVendorModal(false)}
                disabled={loadingVendor}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleAssignVendor}
                disabled={!selectedVendorId || loadingVendor}
                className="flex-1"
              >
                {loadingVendor ? (
                  <>
                    <Icon name="refresh" size="sm" className="mr-2 animate-spin" />
                    {selectedSector.assignedVendor ? 'Changement...' : 'Assignation...'}
                  </>
                ) : (
                  <>
                    <Icon name="check" size="sm" className="mr-2" />
                    {selectedSector.assignedVendor ? 'Changer' : 'Assigner'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Modification PDV */}
      {selectedSector && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Modifier les PDV - ${selectedSector.name}`}
        >
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Secteur sélectionné</h3>
              <p className="text-sm text-green-800">
                <strong>{selectedSector.name}</strong> ({selectedSector.code})
              </p>
              <p className="text-xs text-green-600 mt-1">
                PDV actuels: {selectedSector.outletsSector?.length || 0}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner les PDV ({selectedOutlets.length} sélectionnés)
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

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={loadingEdit}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveOutlets}
                disabled={loadingEdit}
                className="flex-1"
              >
                {loadingEdit ? (
                  <>
                    <Icon name="refresh" size="sm" className="mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Icon name="check" size="sm" className="mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
