import { useState } from 'react';
import { Icon } from '../../../core/ui/Icon';
import Badge from '../../../core/ui/Badge';
import Button from '../../../core/ui/Button';
import Modal from '../../../core/ui/feedback/Modal';
import territoriesService, { type Territory } from '../services/territoriesService';

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
                    <Badge variant="success" size="sm">{sector.assignedUsers?.length || 0} vendeurs</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedSector(sector);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Icon name="eye" size="sm" />
                      </button>
                      <button
                        onClick={() => handleDeleteSector(sector.id)}
                        disabled={deleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
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
    </div>
  );
}
