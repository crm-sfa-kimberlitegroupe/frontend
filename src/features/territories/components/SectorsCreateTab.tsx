import { useState } from 'react';
import { Icon } from '../../../core/ui/Icon';
import Button from '../../../core/ui/Button';
import { useAuthStore } from '@/core/auth';
import territoriesService, { type Territory, type CreateSectorDto, type Outlet, type TerritoryGeoInfo } from '../services/territoriesService';

const showSuccess = (message: string) => alert(message);
const showError = (message: string) => alert(`Erreur: ${message}`);

// Type étendu pour les outlets avec champs géographiques
interface OutletWithGeo extends Outlet {
  region?: string;
  commune?: string;
  ville?: string;
  quartier?: string;
  sectorId?: string;
}

interface Props {
  outlets: Outlet[];
  userTerritory: Territory | null;
  territoryGeoInfo: TerritoryGeoInfo | null;
  onSuccess: () => void;
}

export default function SectorsCreateTab({ outlets, userTerritory, territoryGeoInfo, onSuccess }: Props) {
  const currentUser = useAuthStore((s) => s.user); // 👤 Récupérer l'admin connecté
  const [loading, setLoading] = useState(false);
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🗺️ Filtres géographiques
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCommune, setSelectedCommune] = useState<string>('');
  const [selectedVille, setSelectedVille] = useState<string>('');
  const [selectedQuartier, setSelectedQuartier] = useState<string>('');
  
  const [formData, setFormData] = useState<CreateSectorDto>({
    code: '',
    name: '',
    level: 'SECTEUR',
    parentId: currentUser?.territoryId, // ✅ TerritoryId de l'admin (sa ZONE)
  });

  const handleCreateSector = async () => {
    if (selectedOutlets.length === 0) {
      showError('Veuillez sélectionner au moins un point de vente');
      return;
    }

    if (!formData.code || !formData.name) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      // Nettoyer les données avant envoi
      const cleanData: CreateSectorDto = {
        code: formData.code,
        name: formData.name,
        level: formData.level,
        ...(currentUser?.territoryId && { parentId: currentUser.territoryId }), // 🏛️ ZONE de l'admin
        ...(currentUser?.id && { createdBy: currentUser.id }), // 👤 ID de l'admin créateur
      };
      const newSector = await territoriesService.createSector(cleanData);
      await territoriesService.assignOutletsToSector({
        sectorId: newSector.id,
        outletIds: selectedOutlets,
      });
      
      showSuccess(`Secteur créé avec ${selectedOutlets.length} PDV`);
      setFormData({ code: '', name: '', level: 'SECTEUR', parentId: currentUser?.territoryId });
      setSelectedOutlets([]);
      onSuccess();
    } catch (error) {
      console.error('Erreur création secteur:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors de la création';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleOutletSelection = (outletId: string) => {
    setSelectedOutlets(prev =>
      prev.includes(outletId) ? prev.filter(id => id !== outletId) : [...prev, outletId]
    );
  };

  // 🗺️ Utiliser les données géographiques du territoire
  const outletWithGeo = outlets as OutletWithGeo[];
  const regions = territoryGeoInfo?.regions || [];
  const communes = territoryGeoInfo?.communes || [];
  const villes = territoryGeoInfo?.villes || [];
  const quartiers = territoryGeoInfo?.quartiers || [];

  // Filtrer les PDV disponibles (sans secteur)
  const availableOutlets = outletWithGeo.filter(o => !o.sectorId);
  
  // Appliquer tous les filtres
  const filteredOutlets = availableOutlets.filter(o => {
    const matchesSearch = o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = !selectedRegion || o.region === selectedRegion;
    const matchesCommune = !selectedCommune || o.commune === selectedCommune;
    const matchesVille = !selectedVille || o.ville === selectedVille;
    const matchesQuartier = !selectedQuartier || o.quartier === selectedQuartier;
    
    return matchesSearch && matchesRegion && matchesCommune && matchesVille && matchesQuartier;
  });

  return (
    <div className="space-y-4">
      {/* Sélection des PDV */}
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

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Icon name="search" size="sm" variant="grey" className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, code ou adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* 🗺️ Filtres géographiques */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="locationMarker" size="sm" variant="grey" />
            <h3 className="text-sm font-semibold text-gray-900">Filtres géographiques</h3>
            {(selectedRegion || selectedCommune || selectedVille || selectedQuartier) && (
              <button
                onClick={() => {
                  setSelectedRegion('');
                  setSelectedCommune('');
                  setSelectedVille('');
                  setSelectedQuartier('');
                }}
                className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Région */}
            {regions.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Région</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Toutes les régions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Commune */}
            {communes.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Commune</label>
                <select
                  value={selectedCommune}
                  onChange={(e) => setSelectedCommune(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Toutes les communes</option>
                  {communes.map(commune => (
                    <option key={commune} value={commune}>{commune}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Ville */}
            {villes.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ville</label>
                <select
                  value={selectedVille}
                  onChange={(e) => setSelectedVille(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Toutes les villes</option>
                  {villes.map(ville => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Quartier */}
            {quartiers.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quartier</label>
                <select
                  value={selectedQuartier}
                  onChange={(e) => setSelectedQuartier(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Tous les quartiers</option>
                  {quartiers.map(quartier => (
                    <option key={quartier} value={quartier}>{quartier}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Indicateur de résultats filtrés */}
          <p className="text-xs text-gray-600 mt-3">
            <strong>{filteredOutlets.length}</strong> PDV disponible(s) 
            {(selectedRegion || selectedCommune || selectedVille || selectedQuartier) && ' avec ces filtres'}
          </p>
        </div>

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
                    <p className="text-sm text-gray-500">
                      {outlet.code}
                      {outlet.quartier && ` • ${outlet.quartier}`}
                      {outlet.commune && ` • ${outlet.commune}`}
                    </p>
                    {outlet.address && (
                      <p className="text-xs text-gray-400 mt-0.5">{outlet.address}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Formulaire du secteur */}
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
                placeholder="Ex: SEC-NORD-01"
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
                placeholder="Ex: Secteur Nord"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone Parent
              </label>
              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                {userTerritory ? (
                  <span><strong>{userTerritory.name}</strong> ({userTerritory.code})</span>
                ) : (
                  <span className="text-gray-500">Chargement...</span>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleCreateSector}
              disabled={!formData.code || !formData.name || loading}
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
  );
}
