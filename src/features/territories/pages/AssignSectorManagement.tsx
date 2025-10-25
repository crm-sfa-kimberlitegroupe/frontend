import { useState, useEffect } from 'react';
import { Icon } from '../../../core/ui/Icon';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import Modal from '../../../core/ui/feedback/Modal';
import territoriesService, { type Territory, type Outlet, type User } from '../services/territoriesService';
import outletsService from '../../pdv/services/outletsService';
import usersService from '../../users/services/usersService';
// Système de notification simple
const showSuccess = (message: string) => alert(message);
const showError = (message: string) => alert(`Erreur: ${message}`);

export default function AssignSectorManagement() {
  const [activeTab, setActiveTab] = useState<'outlets' | 'vendors'>('outlets');
  const [sectors, setSectors] = useState<Territory[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [vendors, setVendors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // État pour assignation PDV
  const [showAssignOutletsModal, setShowAssignOutletsModal] = useState(false);
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [selectedSectorForOutlets, setSelectedSectorForOutlets] = useState<string>('');
  
  // État pour assignation vendeur
  const [showAssignVendorModal, setShowAssignVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [selectedSectorForVendor, setSelectedSectorForVendor] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sectorsData, outletsData, usersData] = await Promise.all([
        territoriesService.getAllSectors({ level: 'SECTEUR' }),
        outletsService.getAll({ status: 'APPROVED' }),
        usersService.getAll(),
      ]);
      
      setSectors(sectorsData);
      setOutlets(outletsData);
      setVendors(usersData.filter(u => u.role === 'REP' && u.status === 'ACTIVE'));
    } catch (error) {
      console.error('Erreur chargement données:', error);
      showError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOutlets = async () => {
    if (selectedOutlets.length === 0) {
      showError('Veuillez sélectionner au moins un point de vente');
      return;
    }
    if (!selectedSectorForOutlets) {
      showError('Veuillez sélectionner un secteur');
      return;
    }

    try {
      setLoading(true);
      await territoriesService.assignOutletsToSector({
        sectorId: selectedSectorForOutlets,
        outletIds: selectedOutlets,
      });
      showSuccess(`${selectedOutlets.length} PDV assignés avec succès`);
      setShowAssignOutletsModal(false);
      setSelectedOutlets([]);
      setSelectedSectorForOutlets('');
      loadData();
    } catch (error: any) {
      console.error('Erreur assignation PDV:', error);
      showError(error?.response?.data?.message || 'Erreur lors de l\'assignation');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignVendor = async () => {
    if (!selectedVendor) {
      showError('Veuillez sélectionner un vendeur');
      return;
    }
    if (!selectedSectorForVendor) {
      showError('Veuillez sélectionner un secteur');
      return;
    }

    try {
      setLoading(true);
      await territoriesService.assignSectorToVendor({
        vendorId: selectedVendor,
        sectorId: selectedSectorForVendor,
      });
      showSuccess('Vendeur assigné avec succès');
      setShowAssignVendorModal(false);
      setSelectedVendor('');
      setSelectedSectorForVendor('');
      loadData();
    } catch (error: any) {
      console.error('Erreur assignation vendeur:', error);
      showError(error?.response?.data?.message || 'Erreur lors de l\'assignation');
    } finally {
      setLoading(false);
    }
  };

  const toggleOutletSelection = (outletId: string) => {
    setSelectedOutlets(prev =>
      prev.includes(outletId)
        ? prev.filter(id => id !== outletId)
        : [...prev, outletId]
    );
  };

  const filteredOutlets = outlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outlet.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = vendors.filter(vendor =>
    `${vendor.firstName} ${vendor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignation des Secteurs</h1>
        <p className="text-sm text-gray-600 mt-1">
          Assignez des points de vente et des vendeurs aux secteurs
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('outlets')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'outlets'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon name="map" size="sm" className="inline mr-2" />
            Points de Vente
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'vendors'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon name="user" size="sm" className="inline mr-2" />
            Vendeurs
          </button>
        </nav>
      </div>

      {/* Onglet Points de Vente */}
      {activeTab === 'outlets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Icon
                name="search"
                size="sm"
                variant="grey"
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Rechercher un PDV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button
              variant="primary"
              onClick={() => setShowAssignOutletsModal(true)}
              disabled={selectedOutlets.length === 0}
            >
              <Icon name="check" size="sm" className="mr-2" />
              Assigner {selectedOutlets.length > 0 && `(${selectedOutlets.length})`}
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="refresh" size="lg" variant="primary" className="animate-spin" />
                <span className="ml-3 text-gray-600">Chargement...</span>
              </div>
            ) : filteredOutlets.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="map" size="lg" variant="grey" className="mb-3" />
                <p className="text-gray-600">Aucun point de vente trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedOutlets.length === filteredOutlets.length}
                          onChange={(e) =>
                            setSelectedOutlets(
                              e.target.checked ? filteredOutlets.map(o => o.id) : []
                            )
                          }
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Point de Vente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Adresse
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Secteur Actuel
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOutlets.map((outlet) => (
                      <tr
                        key={outlet.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedOutlets.includes(outlet.id) ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => toggleOutletSelection(outlet.id)}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedOutlets.includes(outlet.id)}
                            onChange={() => {}}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{outlet.name}</div>
                            <div className="text-sm text-gray-500">{outlet.code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {outlet.address || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {(outlet as any).sector ? (
                            <Badge variant="primary" size="sm">
                              {(outlet as any).sector.name}
                            </Badge>
                          ) : (
                            <Badge variant="gray" size="sm">
                              Non assigné
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onglet Vendeurs */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Icon
                name="search"
                size="sm"
                variant="grey"
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Rechercher un vendeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Icon name="refresh" size="lg" variant="primary" className="animate-spin" />
                <span className="ml-3 text-gray-600">Chargement...</span>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Icon name="user" size="lg" variant="grey" className="mb-3" />
                <p className="text-gray-600">Aucun vendeur trouvé</p>
              </div>
            ) : (
              filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="user" size="lg" variant="primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {vendor.firstName} {vendor.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{vendor.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    {(vendor as any).assignedSector ? (
                      <div>
                        <span className="text-xs text-gray-500">Secteur assigné:</span>
                        <Badge variant="success" size="sm" className="mt-1">
                          {(vendor as any).assignedSector.name}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="gray" size="sm">
                        Aucun secteur assigné
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setSelectedVendor(vendor.id);
                      setShowAssignVendorModal(true);
                    }}
                  >
                    <Icon name="map" size="sm" className="mr-2" />
                    Assigner un Secteur
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Assignation PDV */}
      <Modal
        isOpen={showAssignOutletsModal}
        onClose={() => setShowAssignOutletsModal(false)}
        title="Assigner des Points de Vente"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Vous allez assigner <strong>{selectedOutlets.length} point(s) de vente</strong> à un secteur.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un Secteur *
            </label>
            <select
              value={selectedSectorForOutlets}
              onChange={(e) => setSelectedSectorForOutlets(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Choisir un secteur</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name} ({sector.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAssignOutletsModal(false)}
              fullWidth
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignOutlets}
              fullWidth
              disabled={loading || !selectedSectorForOutlets}
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

      {/* Modal Assignation Vendeur */}
      <Modal
        isOpen={showAssignVendorModal}
        onClose={() => setShowAssignVendorModal(false)}
        title="Assigner un Secteur au Vendeur"
      >
        <div className="space-y-4">
          {selectedVendor && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Vendeur:</strong>{' '}
                {vendors.find(v => v.id === selectedVendor)?.firstName}{' '}
                {vendors.find(v => v.id === selectedVendor)?.lastName}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un Secteur *
            </label>
            <select
              value={selectedSectorForVendor}
              onChange={(e) => setSelectedSectorForVendor(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Choisir un secteur</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name} - {sector.parent?.name || 'Sans parent'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAssignVendorModal(false)}
              fullWidth
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignVendor}
              fullWidth
              disabled={loading || !selectedSectorForVendor}
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
    </div>
  );
}
