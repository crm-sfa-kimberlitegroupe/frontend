import { useState, useEffect } from 'react';
import { Icon, RefreshCw } from '../../../core/ui/Icon';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import Modal from '../../../core/ui/feedback/Modal';
import territoriesService, { type Territory, type CreateSectorDto } from '../services/territoriesService';
import { useAuthStore } from '@/core/auth';
import { useOutletsStore } from '@/features/outlets/store/outletsStore';
import { useSectorsStore } from '@/features/territories/store/sectorsStore';

const showSuccess = (message: string) => alert(message);
const showError = (message: string) => alert(`Erreur: ${message}`);

export default function SectorsManagement() {
  const user = useAuthStore((s) => s.user);
  const [userTerritory, setUserTerritory] = useState<Territory | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Utilisation des stores Zustand
  const validatedOutlets = useOutletsStore((state) => state.validatedOutlets);
  const allSectors = useSectorsStore((state) => state.sectors);
  const allTerritories = useSectorsStore((state) => state.territories);
  const loadingSectors = useSectorsStore((state) => state.loading);
  const refreshingSectors = useSectorsStore((state) => state.refreshing);
  const refreshSectors = useSectorsStore((state) => state.refreshSectors);

  // Filtrer les secteurs du territoire de l'utilisateur
  const sectors = userTerritory 
    ? allSectors.filter(s => s.parentId === userTerritory.id)
    : [];
  const [selectedSector, setSelectedSector] = useState<Territory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  
  // 🗺️ Filtres géographiques
  const [filterRegion, setFilterRegion] = useState<string>('');
  const [filterCommune, setFilterCommune] = useState<string>('');
  const [filterVille, setFilterVille] = useState<string>('');
  const [filterQuartier, setFilterQuartier] = useState<string>('');

  const [formData, setFormData] = useState<CreateSectorDto>({
    code: '',
    name: '',
    level: 'SECTEUR',
    parentId: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTerritories]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Vérifier si l'utilisateur a un territoire assigné
      if (!user?.territory) {
        showError('Aucun territoire assigné à votre compte');
        setLoading(false);
        return;
      }

      // Trouver le territoire de l'utilisateur (peut être un ID ou un nom)
      const myTerritory = allTerritories.find(
        t => t.id === user.territory || t.name === user.territory || t.code === user.territory
      );

      if (!myTerritory) {
        showError(`Territoire "${user.territory}" introuvable`);
        setLoading(false);
        return;
      }

      setUserTerritory(myTerritory);

      // Pré-remplir le territoire parent dans le formulaire
      setFormData(prev => ({ ...prev, parentId: myTerritory.id }));

    } catch {
      showError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSector = async () => {
    if (selectedOutlets.length === 0) {
      showError('Veuillez sélectionner au moins un point de vente pour créer le secteur');
      return;
    }

    try {
      setLoading(true);
      const newSector = await territoriesService.createSector(formData);
      await territoriesService.assignOutletsToSector({
        sectorId: newSector.id,
        outletIds: selectedOutlets,
      });
      
      showSuccess(`Secteur créé avec ${selectedOutlets.length} point(s) de vente`);
      setFormData({ code: '', name: '', level: 'SECTEUR', parentId: '' });
      setSelectedOutlets([]);
      refreshSectors();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSector = async (sectorId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce secteur ?')) return;

    try {
      setLoading(true);
      await territoriesService.delete(sectorId);
      showSuccess('Secteur supprimé avec succès');
      refreshSectors();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const toggleOutletSelection = (outletId: string) => {
    setSelectedOutlets((prev) =>
      prev.includes(outletId) ? prev.filter((id) => id !== outletId) : [...prev, outletId]
    );
  };

  const availableOutlets = validatedOutlets.filter((o) => !(o as any).sectorId);
  
  // 🗺️ Filtrage géographique optimisé
  const filteredOutlets = availableOutlets.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = !filterRegion || (o as any).region === filterRegion;
    const matchCommune = !filterCommune || (o as any).commune === filterCommune;
    const matchVille = !filterVille || (o as any).ville === filterVille;
    const matchQuartier = !filterQuartier || (o as any).quartier === filterQuartier;
    
    return matchSearch && matchRegion && matchCommune && matchVille && matchQuartier;
  });
  
  // Extraire les valeurs uniques pour les filtres
  const uniqueRegions = [...new Set(availableOutlets.map(o => (o as any).region).filter(Boolean))];
  const uniqueCommunes = [...new Set(availableOutlets.map(o => (o as any).commune).filter(Boolean))];
  const uniqueVilles = [...new Set(availableOutlets.map(o => (o as any).ville).filter(Boolean))];
  const uniqueQuartiers = [...new Set(availableOutlets.map(o => (o as any).quartier).filter(Boolean))];
  
  const filteredSectors = sectors.filter(
    (sector) =>
      sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sector.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Secteurs</h1>
            <p className="text-sm text-gray-600 mt-1">
              Sélectionnez des points de vente pour créer un secteur
            </p>
          </div>
          <div className="flex items-center gap-3">
            {refreshingSectors && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Mise à jour...
              </div>
            )}
            {userTerritory && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <p className="text-xs text-blue-600 font-medium">Votre zone</p>
                <p className="text-sm font-semibold text-blue-900">{userTerritory.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon name="plus" size="sm" className="inline mr-2" />
            Créer un Secteur
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'list'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon name="map" size="sm" className="inline mr-2" />
            Secteurs Existants ({sectors.length})
          </button>
        </nav>
      </div>

      {/* Onglet Créer */}
      {activeTab === 'create' && (
        <div className="space-y-4">
          {/* Étape 1: Sélection des PDV */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Étape 1 : Sélectionnez les Points de Vente
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedOutlets.length > 0 
                    ? `${selectedOutlets.length} PDV sélectionné(s)`
                    : 'Aucun PDV sélectionné'}
                </p>
              </div>
              {selectedOutlets.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setSelectedOutlets([])}>
                  Tout désélectionner
                </Button>
              )}
            </div>

            {/* 🗺️ Filtres géographiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Région</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">Toutes les régions</option>
                  {uniqueRegions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Commune</label>
                <select
                  value={filterCommune}
                  onChange={(e) => setFilterCommune(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">Toutes les communes</option>
                  {uniqueCommunes.map((commune) => (
                    <option key={commune} value={commune}>{commune}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ville</label>
                <select
                  value={filterVille}
                  onChange={(e) => setFilterVille(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">Toutes les villes</option>
                  {uniqueVilles.map((ville) => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quartier</label>
                <select
                  value={filterQuartier}
                  onChange={(e) => setFilterQuartier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">Tous les quartiers</option>
                  {uniqueQuartiers.map((quartier) => (
                    <option key={quartier} value={quartier}>{quartier}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Barre de recherche */}
            <div className="relative mb-4">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {/* Indicateur de filtres actifs */}
            {(filterRegion || filterCommune || filterVille || filterQuartier) && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-blue-900">🗺️ Filtres actifs:</span>
                    {filterRegion && <Badge variant="primary" size="sm">Région: {filterRegion}</Badge>}
                    {filterCommune && <Badge variant="primary" size="sm">Commune: {filterCommune}</Badge>}
                    {filterVille && <Badge variant="primary" size="sm">Ville: {filterVille}</Badge>}
                    {filterQuartier && <Badge variant="primary" size="sm">Quartier: {filterQuartier}</Badge>}
                  </div>
                  <button
                    onClick={() => {
                      setFilterRegion('');
                      setFilterCommune('');
                      setFilterVille('');
                      setFilterQuartier('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {filteredOutlets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun PDV disponible
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredOutlets.map((outlet) => (
                    <label
                      key={outlet.id}
                      className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedOutlets.includes(outlet.id)}
                        onChange={() => toggleOutletSelection(outlet.id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">{outlet.name}</p>
                        <p className="text-sm text-gray-500">{outlet.code} • {outlet.address}</p>
                        <div className="flex gap-2 mt-1">
                          {(outlet as any).region && <Badge variant="gray" size="sm">{(outlet as any).region}</Badge>}
                          {(outlet as any).commune && <Badge variant="gray" size="sm">{(outlet as any).commune}</Badge>}
                          {(outlet as any).quartier && <Badge variant="gray" size="sm">{(outlet as any).quartier}</Badge>}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Étape 2: Informations du Secteur */}
          {selectedOutlets.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Étape 2 : Informations du Secteur
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code du Secteur *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: PLATEAU_SEC_2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du Secteur *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Plateau - Secteur Nord"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zone Parent
                  </label>
                  <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {userTerritory ? (
                      <span>
                        <strong>{userTerritory.name}</strong> ({userTerritory.level || userTerritory.code})
                      </span>
                    ) : (
                      <span className="text-gray-500">Chargement...</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Votre secteur sera créé dans votre zone assignée
                  </p>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleCreateSector}
                  disabled={!formData.code || !formData.name || !formData.parentId || loading}
                >
                  {loading ? (
                    <>
                      <Icon name="refresh" size="sm" className="mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Icon name="check" size="sm" className="mr-2" />
                      Créer le Secteur avec {selectedOutlets.length} PDV
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onglet Liste */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="relative">
            <Icon
              name="search"
              size="sm"
              variant="grey"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Secteur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Zone Parent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      PDV
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vendeurs
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
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
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="primary" size="sm">
                          {sector.outletsSector?.length || 0} PDV
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="success" size="sm">
                          {sector.assignedUsers?.length || 0} vendeurs
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSector(sector)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Icon name="eye" size="sm" />
                          </button>
                          <button
                            onClick={() => handleDeleteSector(sector.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
        </div>
      )}

      {/* Modal détails */}
      {selectedSector && (
        <Modal
          isOpen={!!selectedSector}
          onClose={() => setSelectedSector(null)}
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
                    {selectedSector.outletsSector.map((outlet) => (
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

            <Button variant="outline" onClick={() => setSelectedSector(null)} fullWidth>
              Fermer
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
