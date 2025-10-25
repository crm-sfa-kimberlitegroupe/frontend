import { useState } from 'react';
import { TerritoryDrawMap } from '../components/TerritoryDrawMap';
import Button from '../../../core/ui/Button';

export default function CreateTerritoryWithMap() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    region: '',
    ville: '',
    potentielCommercial: 'MOYEN',
    nombrePDVEstime: 0,
    notes: ''
  });

  // Coordonnées par défaut: Abidjan, Côte d'Ivoire
  const defaultCenter: [number, number] = [5.3600, -4.0083];
  const defaultZoom = 11;

  const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
  const [centerCoords, setCenterCoords] = useState<[number, number] | null>(null);
  const [calculatedArea, setCalculatedArea] = useState<number>(0);

  const handlePolygonDrawn = (geojson: any, center: [number, number], area: number) => {
    setDrawnGeometry(geojson);
    setCenterCoords(center);
    setCalculatedArea(area);
    // Met à jour automatiquement
    setFormData(prev => ({
      ...prev,
      superficie: Math.round(area * 100) / 100
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!drawnGeometry) {
      alert('Veuillez dessiner le territoire sur la carte');
      return;
    }

    const territoryData = {
      ...formData,
      level: 'ZONE',
      lat: centerCoords?.[0],
      lng: centerCoords?.[1],
      geom: drawnGeometry,
      superficie: calculatedArea
    };

    console.log('Territoire à créer:', territoryData);
    alert('Territoire créé ! (Voir console pour les données)');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🗺️ Créer un Territoire avec Carte</h1>
          <p className="text-gray-600 mt-2">
            Dessinez le territoire sur la carte et remplissez les informations
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panneau Gauche: Formulaire */}
            <div className="space-y-6">
              {/* Informations de Base */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">📝 Informations</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="ZONE_YAOUNDE"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Zone Yaoundé"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Région
                    </label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="Centre"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      placeholder="Yaoundé"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Potentiel Commercial
                    </label>
                    <select
                      value={formData.potentielCommercial}
                      onChange={(e) => setFormData({ ...formData, potentielCommercial: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="TRES_FAIBLE">Très Faible</option>
                      <option value="FAIBLE">Faible</option>
                      <option value="MOYEN">Moyen</option>
                      <option value="FORT">Fort</option>
                      <option value="TRES_FORT">Très Fort</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de PDV Estimé
                    </label>
                    <input
                      type="number"
                      value={formData.nombrePDVEstime}
                      onChange={(e) => setFormData({ ...formData, nombrePDVEstime: Number(e.target.value) })}
                      placeholder="150"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Informations Calculées */}
              {drawnGeometry && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📊 Calculé Automatiquement</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>
                      <span className="font-medium">Superficie:</span> {calculatedArea.toFixed(2)} km²
                    </p>
                    {centerCoords && (
                      <p>
                        <span className="font-medium">Centre:</span>{' '}
                        {centerCoords[0].toFixed(4)}°N, {centerCoords[1].toFixed(4)}°E
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!drawnGeometry}
                  fullWidth
                >
                  ✅ Créer le Territoire
                </Button>
              </div>
            </div>

            {/* Panneau Droit: Carte */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-[800px]">
                <TerritoryDrawMap
                  onPolygonDrawn={handlePolygonDrawn}
                  initialCenter={defaultCenter}
                  initialZoom={defaultZoom}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
