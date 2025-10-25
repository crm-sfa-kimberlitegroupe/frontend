import { useState } from 'react';
import Button from '../../../core/ui/Button';
import { Icon } from '../../../core/ui/Icon';
import territoriesService, { type Territory, type Outlet } from '../services/territoriesService';

const showSuccess = (message: string) => alert(message);
const showError = (message: string) => alert(`Erreur: ${message}`);

type SubTab = 'outlets-to-sector' | 'vendor-to-sector' | 'outlets-to-vendor';

interface Props {
  sectors: Territory[];
  outlets: Outlet[];
  vendors: any[];
  onSuccess: () => void;
}

export default function SectorsAssignTab({ sectors, outlets, vendors, onSuccess }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('outlets-to-sector');
  const [loading, setLoading] = useState(false);
  
  // États pour assignations
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');

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

    try {
      setLoading(true);
      await territoriesService.assignOutletsToSector({
        sectorId: selectedSectorId,
        outletIds: selectedOutlets,
      });
      showSuccess(`${selectedOutlets.length} PDV assignés au secteur`);
      setSelectedOutlets([]);
      setSelectedSectorId('');
      onSuccess();
    } catch (error: any) {
      console.error('Erreur assignation PDV:', error);
      showError(error?.response?.data?.message || 'Erreur lors de l\'assignation');
    } finally {
      setLoading(false);
    }
  };

  // Assigner vendeur à un secteur
  const handleAssignVendorToSector = async () => {
    if (!selectedVendorId) {
      showError('Veuillez sélectionner un vendeur');
      return;
    }
    if (!selectedSectorId) {
      showError('Veuillez sélectionner un secteur');
      return;
    }

    try {
      setLoading(true);
      await territoriesService.assignSectorToVendor({
        vendorId: selectedVendorId,
        sectorId: selectedSectorId,
      });
      showSuccess('Vendeur assigné au secteur avec succès');
      setSelectedVendorId('');
      setSelectedSectorId('');
      onSuccess();
    } catch (error: any) {
      console.error('Erreur assignation vendeur:', error);
      showError(error?.response?.data?.message || 'Erreur lors de l\'assignation');
    } finally {
      setLoading(false);
    }
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

    try {
      setLoading(true);
      await territoriesService.assignOutletsToVendor({
        vendorId: selectedVendorId,
        outletIds: selectedOutlets,
      });
      showSuccess(`${selectedOutlets.length} PDV assignés au vendeur`);
      setSelectedOutlets([]);
      setSelectedVendorId('');
      onSuccess();
    } catch (error: any) {
      console.error('Erreur assignation PDV au vendeur:', error);
      showError(error?.response?.data?.message || 'Erreur lors de l\'assignation');
    } finally {
      setLoading(false);
    }
  };

  const toggleOutletSelection = (outletId: string) => {
    setSelectedOutlets(prev =>
      prev.includes(outletId) ? prev.filter(id => id !== outletId) : [...prev, outletId]
    );
  };

  // Filtrer les PDV disponibles (sans secteur)
  const availableOutlets = outlets.filter(o => !(o as any).sectorId);

  return (
    <div className="space-y-4">
      {/* Sous-navigation */}
      <div className="bg-gray-50 rounded-lg p-2 flex gap-2">
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

      {/* Contenu Vendeur → Secteur */}
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
    </div>
  );
}
