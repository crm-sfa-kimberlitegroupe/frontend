import { useState, useEffect } from 'react';
import { FileText, MapPin, Loader2 } from 'lucide-react';
import type { PDVFormData } from '../types/pdv.types';
import { territoriesService, type TerritoryGeoInfo } from '@/features/territories/services/territoriesService';
import { useAuthStore } from '@/core/auth';

interface PDVFormStep1Props {
  formData: PDVFormData;
  onChange: (data: Partial<PDVFormData>) => void;
}

export default function PDVFormStep1({ formData, onChange }: PDVFormStep1Props) {
  const user = useAuthStore((state) => state.user);
  const [geoData, setGeoData] = useState<TerritoryGeoInfo | null>(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Charger les données géographiques du territoire/secteur du vendeur
  useEffect(() => {
    const loadGeoData = async () => {
      // Récupérer le secteur assigné au vendeur (territoryId)
      const sectorId = user?.territoryId;
      
      if (!sectorId) {
        setGeoError('Aucun secteur assigné. Contactez votre administrateur.');
        return;
      }

      try {
        setIsLoadingGeo(true);
        setGeoError(null);
        const data = await territoriesService.getTerritoryGeoInfo(sectorId);
        setGeoData(data);
        
        // Mettre à jour le sectorId dans le formulaire
        onChange({ sectorId });
      } catch (error) {
        console.error('Erreur lors du chargement des données géographiques:', error);
        setGeoError('Impossible de charger les données géographiques');
      } finally {
        setIsLoadingGeo(false);
      }
    };

    loadGeoData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.territoryId]);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Informations de base
      </h2>
      <p className="text-sm text-gray-600 mb-4">Les champs marqués d'un * sont obligatoires</p>
      
      <div className="space-y-4">
        {/* Code PDV */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code PDV (auto-généré)
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => onChange({ code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
            placeholder="Sera généré automatiquement"
            disabled
          />
        </div>

        {/* Nom du PDV */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du point de vente *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: Supermarché Plateau"
          />
        </div>

        {/* Section Localisation Géographique */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-600" />
            Localisation géographique
          </h3>
          
          {isLoadingGeo ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Chargement des données géographiques...
            </div>
          ) : geoError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {geoError}
            </div>
          ) : geoData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Région */}
              {geoData.regions && geoData.regions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Région
                  </label>
                  <select
                    value={formData.region || ''}
                    onChange={(e) => onChange({ region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Sélectionner une région</option>
                    {geoData.regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Commune */}
              {geoData.communes && geoData.communes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commune
                  </label>
                  <select
                    value={formData.commune || ''}
                    onChange={(e) => onChange({ commune: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Sélectionner une commune</option>
                    {geoData.communes.map((commune) => (
                      <option key={commune} value={commune}>
                        {commune}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Ville */}
              {geoData.villes && geoData.villes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <select
                    value={formData.ville || ''}
                    onChange={(e) => onChange({ ville: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Sélectionner une ville</option>
                    {geoData.villes.map((ville) => (
                      <option key={ville} value={ville}>
                        {ville}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quartier */}
              {geoData.quartiers && geoData.quartiers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quartier
                  </label>
                  <select
                    value={formData.quartier || ''}
                    onChange={(e) => onChange({ quartier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Sélectionner un quartier</option>
                    {geoData.quartiers.map((quartier) => (
                      <option key={quartier} value={quartier}>
                        {quartier}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Code Postal */}
              {geoData.codesPostaux && geoData.codesPostaux.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code Postal
                  </label>
                  <select
                    value={formData.codePostal || ''}
                    onChange={(e) => onChange({ codePostal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Sélectionner un code postal</option>
                    {geoData.codesPostaux.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-4">
              Aucune donnée géographique disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
