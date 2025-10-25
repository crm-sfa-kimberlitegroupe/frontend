import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Icon } from '../../../core/ui/Icon';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import Modal from '../../../core/ui/feedback/Modal';
import { GoogleTerritoryMap } from '../components/GoogleTerritoryMap';
import GoogleMapsService from '../services/googleMapsService';
import territoriesService from '../services/territoriesService';
import type { Territory } from '../services/territoriesService';

const showSuccess = (message: string) => console.log('✅', message);
const showError = (message: string) => console.error('❌', message);

interface CreateTerritoryForm {
  code: string;
  name: string;
  level: 'ZONE';
  // Géographique
  region?: string;
  commune?: string;
  ville?: string;
  quartier?: string;
  codePostal?: string;
  lat?: number;
  lng?: number;
  // Démographique
  population?: number;
  superficie?: number;
  // Commercial
  potentielCommercial?: 'TRES_FAIBLE' | 'FAIBLE' | 'MOYEN' | 'FORT' | 'TRES_FORT';
  categorieMarche?: 'URBAIN' | 'RURAL' | 'SEMI_URBAIN';
  typeZone?: 'RESIDENTIEL' | 'COMMERCIAL' | 'INDUSTRIEL' | 'MIXTE';
  nombrePDVEstime?: number;
  tauxPenetration?: number;
  // Métadonnées
  notes?: string;
}

export default function TerritoriesManagement() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  const [formData, setFormData] = useState<CreateTerritoryForm>({
    code: '',
    name: '',
    level: 'ZONE',
  });

  // États pour la carte
  const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [searchTerritoryName, setSearchTerritoryName] = useState('');
  const [loadingBoundaries, setLoadingBoundaries] = useState(false);
  
  // Coordonnées par défaut: Abidjan, Côte d'Ivoire
  const defaultCenter: [number, number] = [5.3600, -4.0083];
  const defaultZoom = 11;

  useEffect(() => {
    loadTerritories();
  }, []);

  const loadTerritories = async () => {
    try {
      setLoading(true);
      const data = await territoriesService.getAll();
      // Filtrer uniquement les ZONES (pas les secteurs)
      const zones = data.filter(t => t.level === 'ZONE');
      setTerritories(zones);
    } catch (error) {
      console.error('Erreur chargement territoires:', error);
      showError('Impossible de charger les territoires');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTerritory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      showError('Le code et le nom sont obligatoires');
      return;
    }

    try {
      setLoading(true);
      await territoriesService.create(formData as any);
      
      // Recharger la liste des territoires
      await loadTerritories();
      
      // Réinitialiser le formulaire et changer d'onglet
      resetForm();
      setActiveTab('list');
      
      showSuccess('Territoire créé avec succès');
    } catch (error: any) {
      console.error('Erreur création territoire:', error);
      showError(error?.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTerritory = async (territoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce territoire ?')) return;

    try {
      setLoading(true);
      await territoriesService.delete(territoryId);
      showSuccess('Territoire supprimé avec succès');
      loadTerritories();
    } catch (error: any) {
      console.error('Erreur suppression territoire:', error);
      showError(error?.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      level: 'ZONE',
    });
    setDrawnGeometry(null);
    setShowMap(false);
  };

  const handlePolygonDrawn = (geojson: any, center: [number, number], area: number) => {
    setDrawnGeometry(geojson);
    setFormData(prev => ({
      ...prev,
      lat: center[0],
      lng: center[1],
      superficie: Math.round(area * 100) / 100
    }));
  };

  const handleSearchBoundaries = async () => {
    if (!searchTerritoryName.trim()) {
      console.warn('⚠️ Veuillez entrer le nom d\'une région, ville ou quartier');
      return;
    }

    setLoadingBoundaries(true);
    
    try {
      // Récupérer les frontières depuis Google Maps
      const boundary = await GoogleMapsService.searchBoundaries(searchTerritoryName);
      
      if (!boundary) {
        console.error('❌ Aucune frontière trouvée pour "' + searchTerritoryName + '"');
        return;
      }

      console.log('🗺️ Frontière Google Maps trouvée:', boundary);
      console.log('📐 Géométrie:', boundary.geometry);
      console.log('📦 Viewport:', boundary.viewport);
      
      // Mettre à jour la géométrie
      setDrawnGeometry(boundary.geometry);
      
      // Calculer le centre et la superficie
      const centerLat = (boundary.viewport.northeast.lat + boundary.viewport.southwest.lat) / 2;
      const centerLng = (boundary.viewport.northeast.lng + boundary.viewport.southwest.lng) / 2;
      const area = GoogleMapsService.calculateArea(boundary.viewport);
      
      setFormData(prev => ({
        ...prev,
        lat: centerLat,
        lng: centerLng,
        superficie: area
      }));
      
      setShowMap(true);
      console.log(`✅ Frontières de "${boundary.name}" chargées avec succès !`);
      
    } catch (error) {
      console.error('❌ Erreur recherche frontières:', error);
    } finally {
      setLoadingBoundaries(false);
    }
  };

  const filteredTerritories = territories.filter(
    (territory) =>
      territory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      territory.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      territory.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateDensity = (pop?: number, surf?: number) => {
    if (!pop || !surf || surf === 0) return 'N/A';
    return (pop / surf).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Territoires</h1>
        <p className="text-sm text-gray-600 mt-1">
          Créez et gérez les zones commerciales avec informations détaillées
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'list'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon name="map" size="sm" className="inline mr-2" />
            Territoires Existants ({territories.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon name="plus" size="sm" className="inline mr-2" />
            Créer un Territoire
          </button>
        </nav>
      </div>

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
              placeholder="Rechercher un territoire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTerritories.map((territory) => (
              <div
                key={territory.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{territory.name}</h3>
                    <p className="text-sm text-gray-500">{territory.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTerritory(territory)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Icon name="eye" size="sm" />
                    </button>
                    <button
                      onClick={() => handleDeleteTerritory(territory.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Icon name="trash" size="sm" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {territory.region && (
                    <div className="flex items-center gap-2">
                      <Icon name="locationMarker" size="sm" variant="grey" />
                      <span className="text-gray-700">
                        {territory.region} • {territory.commune || 'N/A'}
                      </span>
                    </div>
                  )}
                  
                  {territory.population && (
                    <div className="flex items-center gap-2">
                      <Icon name="user" size="sm" variant="grey" />
                      <span className="text-gray-700">
                        {territory.population.toLocaleString()} habitants
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {territory.potentielCommercial && (
                      <Badge variant="primary" size="sm">
                        {territory.potentielCommercial.replace('_', ' ')}
                      </Badge>
                    )}
                    {territory.categorieMarche && (
                      <Badge variant="gray" size="sm">{territory.categorieMarche}</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTerritories.length === 0 && (
            <div className="text-center py-12">
              <Icon name="map" size="lg" variant="grey" className="mb-3" />
              <p className="text-gray-600">Aucun territoire trouvé</p>
            </div>
          )}
        </div>
      )}

      {/* Onglet Créer */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateTerritory} className="space-y-6">
          {/* Informations de Base */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="flag" size="sm" variant="grey" />
              <h2 className="text-lg font-semibold text-gray-900">Informations de Base</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code du Territoire *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="Ex: PLATEAU_ZONE"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Territoire *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Plateau - Zone Centrale"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Informations Géographiques */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="locationMarker" size="sm" variant="grey" />
              <h2 className="text-lg font-semibold text-gray-900">Localisation</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
                <input
                  type="text"
                  value={formData.region || ''}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Ex: Abidjan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commune</label>
                <input
                  type="text"
                  value={formData.commune || ''}
                  onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                  placeholder="Ex: Plateau"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <input
                  type="text"
                  value={formData.ville || ''}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  placeholder="Ex: Abidjan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quartier</label>
                <input
                  type="text"
                  value={formData.quartier || ''}
                  onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                  placeholder="Ex: Plateau Dokui"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Postal
                </label>
                <input
                  type="text"
                  value={formData.codePostal || ''}
                  onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                  placeholder="Ex: 01 BP 1234"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.lat || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, lat: parseFloat(e.target.value) })
                    }
                    placeholder="5.3250"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.lng || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, lng: parseFloat(e.target.value) })
                    }
                    placeholder="-4.0200"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Carte Interactive */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="map" size="md" variant="primary" />
              <h2 className="text-lg font-semibold text-gray-900">Définir les Frontières du Territoire</h2>
            </div>

            {/* Option 1: Recherche automatique */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Icon name="search" size="sm" variant="primary" />
                Option 1 : Recherche Automatique
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Entrez le nom d'une région, ville ou commune pour récupérer automatiquement ses frontières
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Abidjan, Plateau, Cocody, Yopougon..."
                  value={searchTerritoryName}
                  onChange={(e) => setSearchTerritoryName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchBoundaries()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  disabled={loadingBoundaries}
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSearchBoundaries}
                  disabled={loadingBoundaries}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loadingBoundaries ? 'Recherche...' : 'Chercher'}
                </Button>
              </div>
            </div>

            {/* Option 2: Dessin manuel */}
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Icon name="edit" size="sm" variant="grey" />
                Option 2 : Dessin Manuel
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Dessinez vous-même les frontières sur la carte
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMap(!showMap)}
                fullWidth
              >
                {showMap ? 'Masquer la Carte' : 'Afficher la Carte'}
              </Button>
            </div>
            
            {showMap && (
              <div className="h-[500px] rounded-lg overflow-hidden border border-gray-300">
                <GoogleTerritoryMap
                  onPolygonDrawn={handlePolygonDrawn}
                  initialCenter={defaultCenter}
                  initialZoom={defaultZoom}
                  existingGeometry={drawnGeometry}
                />
              </div>
            )}

            {formData.lat && formData.lng && formData.superficie && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Icon name="chartBar" size="sm" variant="primary" />
                  Calculé Automatiquement
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">Latitude:</span> {formData.lat.toFixed(4)}°
                  </div>
                  <div>
                    <span className="font-medium">Longitude:</span> {formData.lng.toFixed(4)}°
                  </div>
                  <div>
                    <span className="font-medium">Superficie:</span> {formData.superficie} km²
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Informations Démographiques */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="chartBar" size="sm" variant="grey" />
              <h2 className="text-lg font-semibold text-gray-900">Informations Démographiques</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Population (habitants)
                </label>
                <input
                  type="number"
                  value={formData.population || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, population: parseInt(e.target.value) })
                  }
                  placeholder="Ex: 50000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Superficie (km²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.superficie || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, superficie: parseFloat(e.target.value) })
                  }
                  placeholder="Ex: 5.2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              {formData.population && formData.superficie && (
                <div className="col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Densité calculée :</strong>{' '}
                      {calculateDensity(formData.population, formData.superficie)} hab/km²
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations Commerciales */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="store" size="sm" variant="grey" />
              <h2 className="text-lg font-semibold text-gray-900">Informations Commerciales</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potentiel Commercial
                </label>
                <select
                  value={formData.potentielCommercial || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      potentielCommercial: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Sélectionnez</option>
                  <option value="TRES_FAIBLE">Très Faible</option>
                  <option value="FAIBLE">Faible</option>
                  <option value="MOYEN">Moyen</option>
                  <option value="FORT">Fort</option>
                  <option value="TRES_FORT">Très Fort</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie Marché
                </label>
                <select
                  value={formData.categorieMarche || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, categorieMarche: e.target.value as any })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Sélectionnez</option>
                  <option value="URBAIN">Urbain</option>
                  <option value="RURAL">Rural</option>
                  <option value="SEMI_URBAIN">Semi-Urbain</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de Zone
                </label>
                <select
                  value={formData.typeZone || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, typeZone: e.target.value as any })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Sélectionnez</option>
                  <option value="RESIDENTIEL">Résidentiel</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="INDUSTRIEL">Industriel</option>
                  <option value="MIXTE">Mixte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de PDV Estimé
                </label>
                <input
                  type="number"
                  value={formData.nombrePDVEstime || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, nombrePDVEstime: parseInt(e.target.value) })
                  }
                  placeholder="Ex: 150"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux de Pénétration (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tauxPenetration || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tauxPenetration: parseFloat(e.target.value) })
                  }
                  placeholder="Ex: 20.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="note" size="sm" variant="grey" />
              <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
            </div>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes additionnelles sur ce territoire..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Icon name="refresh" size="sm" className="mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Icon name="check" size="sm" className="mr-2" />
                  Créer le Territoire
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setActiveTab('list');
              }}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}

      {/* Modal Détails */}
      {selectedTerritory && (
        <Modal
          isOpen={!!selectedTerritory}
          onClose={() => setSelectedTerritory(null)}
          title={selectedTerritory.name}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Code et Badges */}
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm text-gray-500 font-mono">{selectedTerritory.code}</span>
              <div className="flex gap-2">
                {selectedTerritory.potentielCommercial && (
                  <Badge variant="primary" size="sm">
                    {selectedTerritory.potentielCommercial.replace('_', ' ')}
                  </Badge>
                )}
                {selectedTerritory.categorieMarche && (
                  <Badge variant="gray" size="sm">
                    {selectedTerritory.categorieMarche}
                  </Badge>
                )}
              </div>
            </div>

            {/* Localisation */}
            {(selectedTerritory.region || selectedTerritory.commune || selectedTerritory.ville) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="locationMarker" size="sm" variant="grey" />
                  <h3 className="text-sm font-semibold text-gray-900">Localisation</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {selectedTerritory.region && (
                      <>
                        <span className="text-gray-600">Région:</span>
                        <span className="font-medium text-gray-900">{selectedTerritory.region}</span>
                      </>
                    )}
                    {selectedTerritory.commune && (
                      <>
                        <span className="text-gray-600">Commune:</span>
                        <span className="font-medium text-gray-900">{selectedTerritory.commune}</span>
                      </>
                    )}
                    {selectedTerritory.ville && (
                      <>
                        <span className="text-gray-600">Ville:</span>
                        <span className="font-medium text-gray-900">{selectedTerritory.ville}</span>
                      </>
                    )}
                    {selectedTerritory.quartier && (
                      <>
                        <span className="text-gray-600">Quartier:</span>
                        <span className="font-medium text-gray-900">{selectedTerritory.quartier}</span>
                      </>
                    )}
                    {selectedTerritory.codePostal && (
                      <>
                        <span className="text-gray-600">Code Postal:</span>
                        <span className="font-medium text-gray-900">{selectedTerritory.codePostal}</span>
                      </>
                    )}
                    {selectedTerritory.lat && selectedTerritory.lng && (
                      <>
                        <span className="text-gray-600">GPS:</span>
                        <span className="font-medium text-gray-900">
                          {selectedTerritory.lat}, {selectedTerritory.lng}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Démographie */}
            {(selectedTerritory.population || selectedTerritory.superficie) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="chartBar" size="sm" variant="grey" />
                  <h3 className="text-sm font-semibold text-gray-900">Démographie</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {selectedTerritory.population && (
                      <>
                        <span className="text-gray-600">Population:</span>
                        <span className="font-medium text-gray-900">
                          {selectedTerritory.population.toLocaleString()} habitants
                        </span>
                      </>
                    )}
                    {selectedTerritory.superficie && (
                      <>
                        <span className="text-gray-600">Superficie:</span>
                        <span className="font-medium text-gray-900">{selectedTerritory.superficie} km²</span>
                      </>
                    )}
                    {selectedTerritory.densitePopulation && (
                      <>
                        <span className="text-gray-600">Densité:</span>
                        <span className="font-medium text-gray-900">
                          {Math.round(selectedTerritory.densitePopulation)} hab/km²
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Informations Commerciales */}
            {(selectedTerritory.potentielCommercial ||
              selectedTerritory.categorieMarche ||
              selectedTerritory.typeZone) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="store" size="sm" variant="grey" />
                  <h3 className="text-sm font-semibold text-gray-900">Informations Commerciales</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {selectedTerritory.potentielCommercial && (
                      <>
                        <span className="text-gray-600">Potentiel:</span>
                        <span className="font-medium text-gray-900">
                          {selectedTerritory.potentielCommercial.replace('_', ' ')}
                        </span>
                      </>
                    )}
                    {selectedTerritory.categorieMarche && (
                      <>
                        <span className="text-gray-600">Catégorie Marché:</span>
                        <span className="font-medium text-gray-900">
                          {selectedTerritory.categorieMarche}
                        </span>
                      </>
                    )}
                    {selectedTerritory.typeZone && (
                      <>
                        <span className="text-gray-600">Type de Zone:</span>
                        <span className="font-medium text-gray-900">{selectedTerritory.typeZone}</span>
                      </>
                    )}
                    {selectedTerritory.nombrePDVEstime && (
                      <>
                        <span className="text-gray-600">PDV Estimés:</span>
                        <span className="font-medium text-gray-900">
                          {selectedTerritory.nombrePDVEstime}
                        </span>
                      </>
                    )}
                    {selectedTerritory.tauxPenetration && (
                      <>
                        <span className="text-gray-600">Taux Pénétration:</span>
                        <span className="font-medium text-gray-900">
                          {selectedTerritory.tauxPenetration}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedTerritory.notes && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="note" size="sm" variant="grey" />
                  <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedTerritory.notes}</p>
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedTerritory(null)}
                fullWidth
              >
                Fermer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
