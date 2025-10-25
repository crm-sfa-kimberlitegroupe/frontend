import { useState } from 'react';
import Modal from '../../../core/ui/feedback/Modal';
import Button from '../../../core/ui/Button';
import GeoService from '../services/geoService';
import ClusteringService from '../services/clusteringService';

interface AutoDivideModalProps {
  isOpen: boolean;
  onClose: () => void;
  zoneGeometry?: any;
  onSectorsGenerated: (sectors: Array<{ name: string; geometry: any }>) => void;
}

export const AutoDivideModal: React.FC<AutoDivideModalProps> = ({
  isOpen,
  onClose,
  zoneGeometry,
  onSectorsGenerated
}) => {
  const [method, setMethod] = useState<'hierarchy' | 'grid' | 'clusters'>('hierarchy');
  const [loading, setLoading] = useState(false);
  
  // Paramètres découpage hiérarchique
  const [regionName, setRegionName] = useState('Centre, Cameroun');
  const [subdivisionType, setSubdivisionType] = useState<'villes' | 'communes' | 'quartiers'>('villes');
  
  // Paramètres grille
  const [gridRows, setGridRows] = useState(3);
  const [gridCols, setGridCols] = useState(3);
  
  // Paramètres clustering
  const [clusterCount, setClusterCount] = useState(5);

  const handleGenerate = async () => {
    setLoading(true);
    
    try {
      let sectors: Array<{ name: string; geometry: any }> = [];

      if (method === 'hierarchy') {
        // Méthode Découpage Hiérarchique Automatique
        const boundaries = await GeoService.autoDivideByHierarchy(regionName, subdivisionType);
        sectors = boundaries.map(b => ({
          name: b.name,
          geometry: b.geometry
        }));
        
      } else if (method === 'grid' && zoneGeometry) {
        // Méthode Grille
        const bbox = calculateBBox(zoneGeometry);
        sectors = GeoService.divideIntoGrid(bbox, gridRows, gridCols);
        
      } else if (method === 'clusters') {
        // Méthode Clustering de PDV
        // Pour l'instant, simule des PDV (à remplacer par vrais PDV depuis l'API)
        const mockOutlets = await fetchOutlets();
        const clusters = ClusteringService.clusterOutlets(mockOutlets, clusterCount);
        sectors = clusters.map(c => ({
          name: c.name,
          geometry: c.geometry
        }));
      }

      if (sectors.length > 0) {
        onSectorsGenerated(sectors);
        alert(`✅ ${sectors.length} secteurs générés avec succès !`);
        onClose();
      } else {
        alert('❌ Aucun secteur n\'a pu être généré. Vérifiez les paramètres.');
      }
      
    } catch (error) {
      console.error('Erreur génération secteurs:', error);
      alert('❌ Erreur lors de la génération des secteurs');
    } finally {
      setLoading(false);
    }
  };

  // Calculer la bounding box d'une géométrie
  const calculateBBox = (geometry: any): [number, number, number, number] => {
    if (!geometry || !geometry.coordinates) return [0, 0, 0, 0];

    let minLng = Infinity, minLat = Infinity;
    let maxLng = -Infinity, maxLat = -Infinity;

    const processCoordinates = (coords: any) => {
      if (typeof coords[0] === 'number') {
        minLng = Math.min(minLng, coords[0]);
        maxLng = Math.max(maxLng, coords[0]);
        minLat = Math.min(minLat, coords[1]);
        maxLat = Math.max(maxLat, coords[1]);
      } else {
        coords.forEach(processCoordinates);
      }
    };

    processCoordinates(geometry.coordinates);
    return [minLng, minLat, maxLng, maxLat];
  };

  // Récupérer les PDV (à implémenter avec votre API)
  const fetchOutlets = async () => {
    // TODO: Appeler l'API pour récupérer les vrais PDV
    // Pour l'instant, retourne des données de test
    return [
      { id: '1', name: 'PDV 1', lat: 3.8667, lng: 11.5167 },
      { id: '2', name: 'PDV 2', lat: 3.8700, lng: 11.5200 },
      { id: '3', name: 'PDV 3', lat: 3.8650, lng: 11.5150 },
      { id: '4', name: 'PDV 4', lat: 3.8680, lng: 11.5180 },
      { id: '5', name: 'PDV 5', lat: 3.8720, lng: 11.5220 },
    ];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🤖 Découpage Automatique de Territoire">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Choisissez une méthode pour diviser automatiquement votre territoire en secteurs.
          </p>

          {/* Sélection de la méthode */}
          <div className="space-y-3">
            {/* Méthode Hiérarchique */}
            <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition border-primary bg-blue-50">
              <input
                type="radio"
                name="method"
                value="hierarchy"
                checked={method === 'hierarchy'}
                onChange={(e) => setMethod(e.target.value as any)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">✨ Découpage Automatique Hiérarchique (RECOMMANDÉ)</div>
                <p className="text-sm text-gray-600 mt-1">
                  Exemple: "Région Centre" → crée automatiquement un secteur par ville
                </p>
                
                {method === 'hierarchy' && (
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Nom de la région/zone parente</label>
                      <input
                        type="text"
                        placeholder="Ex: Centre, Cameroun"
                        value={regionName}
                        onChange={(e) => setRegionName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Découper en</label>
                      <select
                        value={subdivisionType}
                        onChange={(e) => setSubdivisionType(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="villes">Villes/Communes (1 secteur par ville)</option>
                        <option value="communes">Communes (1 secteur par commune)</option>
                        <option value="quartiers">Quartiers (1 secteur par quartier)</option>
                      </select>
                    </div>
                    <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
                      💡 Le système va récupérer automatiquement toutes les {subdivisionType} de "{regionName}" et créer un secteur pour chacune.
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* Méthode Grille */}
            <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="method"
                value="grid"
                checked={method === 'grid'}
                onChange={(e) => setMethod(e.target.value as any)}
                className="mt-1 mr-3"
                disabled={!zoneGeometry}
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">📐 Grille Régulière</div>
                <p className="text-sm text-gray-600 mt-1">
                  Divise la zone en grille de secteurs égaux
                </p>
                
                {method === 'grid' && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Lignes</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={gridRows}
                        onChange={(e) => setGridRows(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Colonnes</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={gridCols}
                        onChange={(e) => setGridCols(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                )}
                
                {!zoneGeometry && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ Dessinez d'abord une zone sur la carte
                  </p>
                )}
              </div>
            </label>

            {/* Méthode Clustering */}
            <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="method"
                value="clusters"
                checked={method === 'clusters'}
                onChange={(e) => setMethod(e.target.value as any)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">🎯 Clusters de PDV</div>
                <p className="text-sm text-gray-600 mt-1">
                  Regroupe les points de vente existants en secteurs optimisés
                </p>
                
                {method === 'clusters' && (
                  <div className="mt-3">
                    <label className="text-xs text-gray-600">Nombre de secteurs</label>
                    <input
                      type="number"
                      min="2"
                      max="20"
                      value={clusterCount}
                      onChange={(e) => setClusterCount(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            fullWidth
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            fullWidth
            disabled={loading || (method === 'grid' && !zoneGeometry)}
          >
            {loading ? '⏳ Génération...' : '✨ Générer les Secteurs'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
