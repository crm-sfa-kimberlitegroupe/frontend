import { useState } from 'react';
import { Icon } from '../../../core/ui/Icon';
import Button from '../../../core/ui/Button';
import territoriesService, { type Territory, type CreateSectorDto, type Outlet } from '../services/territoriesService';

const showSuccess = (message: string) => alert(message);
const showError = (message: string) => alert(`Erreur: ${message}`);

interface Props {
  outlets: Outlet[];
  userTerritory: Territory | null;
  onSuccess: () => void;
}

export default function SectorsCreateTab({ outlets, userTerritory, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateSectorDto>({
    code: '',
    name: '',
    level: 'SECTEUR',
    parentId: userTerritory?.id || '',
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
      const newSector = await territoriesService.createSector(formData);
      await territoriesService.assignOutletsToSector({
        sectorId: newSector.id,
        outletIds: selectedOutlets,
      });
      
      showSuccess(`Secteur créé avec ${selectedOutlets.length} PDV`);
      setFormData({ code: '', name: '', level: 'SECTEUR', parentId: userTerritory?.id || '' });
      setSelectedOutlets([]);
      onSuccess();
    } catch (error: any) {
      console.error('Erreur création secteur:', error);
      console.error('Détail erreur:', error?.response?.data);
      const errorMsg = error?.response?.data?.message || error?.message || 'Erreur lors de la création';
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

  // Filtrer les PDV disponibles (sans secteur)
  const availableOutlets = outlets.filter(o => !(o as any).sectorId);
  const filteredOutlets = availableOutlets.filter(o =>
    o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <div className="relative mb-4">
          <Icon name="search" size="sm" variant="grey" className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un PDV..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          />
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
                    <p className="text-sm text-gray-500">{outlet.code} • {outlet.address}</p>
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
