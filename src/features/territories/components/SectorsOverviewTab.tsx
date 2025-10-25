import { useState, useEffect } from 'react';
import { Icon } from '../../../core/ui/Icon';
import Badge from '../../../core/ui/Badge';
import territoriesService, { type VendorWithSector } from '../services/territoriesService';

const showError = (message: string) => alert(`Erreur: ${message}`);

export default function SectorsOverviewTab() {
  const [vendors, setVendors] = useState<VendorWithSector[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVendorsWithSectors();
  }, []);

  const loadVendorsWithSectors = async () => {
    try {
      setLoading(true);
      const data = await territoriesService.getAllVendorsWithSectors();
      setVendors(data);
    } catch (error) {
      console.error('Erreur chargement vendeurs:', error);
      showError('Impossible de charger les vendeurs');
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v =>
    `${v.firstName} ${v.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.assignedSector?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques
  const totalVendors = vendors.length;
  const vendorsWithSector = vendors.filter(v => v.assignedSectorId).length;
  const vendorsWithoutSector = totalVendors - vendorsWithSector;
  const totalPDV = vendors.reduce((sum, v) => sum + (v.assignedSector?.outletsSector?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vendeurs</p>
              <p className="text-2xl font-bold text-gray-900">{totalVendors}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="user" size="lg" variant="primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avec Secteur</p>
              <p className="text-2xl font-bold text-green-600">{vendorsWithSector}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="check-circle" size="lg" variant="success" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sans Secteur</p>
              <p className="text-2xl font-bold text-orange-600">{vendorsWithoutSector}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon name="alert-circle" size="lg" variant="warning" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total PDV</p>
              <p className="text-2xl font-bold text-purple-600">{totalPDV}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="map-pin" size="lg" variant="primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Icon name="search" size="sm" variant="grey" className="absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher un vendeur ou secteur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="refresh" size="lg" variant="primary" className="animate-spin" />
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="user" size="lg" variant="grey" className="mb-3" />
            <p className="text-gray-600">Aucun vendeur trouvé</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendeur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Territoire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Secteur Assigné</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PDV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary font-semibold text-sm">
                          {vendor.firstName[0]}{vendor.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {vendor.firstName} {vendor.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{vendor.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {vendor.email}
                  </td>
                  <td className="px-6 py-4">
                    {vendor.territory ? (
                      <Badge variant="gray" size="sm">
                        {vendor.territory.name}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {vendor.assignedSector ? (
                      <Badge variant="primary" size="sm">
                        {vendor.assignedSector.name}
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        Non assigné
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {vendor.assignedSector?.outletsSector ? (
                      <div className="flex items-center gap-2">
                        <Icon name="map-pin" size="sm" variant="primary" />
                        <span className="font-medium text-gray-900">
                          {vendor.assignedSector.outletsSector.length}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {vendor.assignedSectorId ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <Icon name="check-circle" size="sm" variant="success" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-orange-600 text-sm">
                        <Icon name="alert-circle" size="sm" variant="warning" />
                        En attente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
