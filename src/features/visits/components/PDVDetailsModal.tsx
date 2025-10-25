import { useState } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import { outletsService, type Outlet } from '@/features/pdv/services';

interface PDVDetailsModalProps {
  pdv: Outlet | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PDVDetailsModal({ pdv, onClose, onUpdate }: PDVDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPDV, setEditedPDV] = useState<Partial<Outlet>>(pdv || {});

  if (!pdv) return null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedPDV(pdv);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      await outletsService.update(pdv.id, {
        name: editedPDV.name,
        address: editedPDV.address,
        channel: editedPDV.channel,
        segment: editedPDV.segment,
        lat: editedPDV.lat,
        lng: editedPDV.lng,
      });
      
      alert('✅ PDV modifié avec succès!');
      setIsEditing(false);
      onUpdate(); // Recharger la liste
      onClose(); // Fermer le modal
    } catch (error) {
      console.error('❌ Erreur lors de la modification:', error);
      alert('❌ Erreur lors de la modification du PDV');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl my-8">
        <Card className="p-0 overflow-hidden">
          {/* En-tête du modal */}
          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon name="store" size="2xl" variant="white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {isEditing ? 'Modifier le point de vente' : 'Détails du point de vente'}
                  </h2>
                  <p className="text-white/80 text-sm">Code: {pdv.code}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <Icon name="x" size="lg" variant="white" />
              </button>
            </div>
          </div>

          {/* Contenu du modal */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Section Informations générales */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="store" size="md" variant="primary" />
                Informations générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du PDV *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPDV.name || ''}
                      onChange={(e) => setEditedPDV({ ...editedPDV, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{pdv.name}</p>
                  )}
                </div>

                {/* Canal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canal de distribution *
                  </label>
                  {isEditing ? (
                    <select
                      value={editedPDV.channel || ''}
                      onChange={(e) => setEditedPDV({ ...editedPDV, channel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="GT">GT (Grande Distribution)</option>
                      <option value="TT">TT (Trade Traditionnel)</option>
                      <option value="HORECA">HORECA</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium">{pdv.channel}</p>
                  )}
                </div>

                {/* Segment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segment
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPDV.segment || ''}
                      onChange={(e) => setEditedPDV({ ...editedPDV, segment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{pdv.segment || 'Non renseigné'}</p>
                  )}
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <Badge variant="success" size="md">✓ Validé</Badge>
                </div>
              </div>
            </div>

            {/* Section Localisation */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="locationMarker" size="md" variant="primary" />
                Localisation
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Adresse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedPDV.address || ''}
                      onChange={(e) => setEditedPDV({ ...editedPDV, address: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{pdv.address || 'Non renseignée'}</p>
                  )}
                </div>

                {/* Coordonnées GPS */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.000001"
                        value={editedPDV.lat || ''}
                        onChange={(e) => setEditedPDV({ ...editedPDV, lat: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{pdv.lat ? Number(pdv.lat).toFixed(6) : 'Non renseignée'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.000001"
                        value={editedPDV.lng || ''}
                        onChange={(e) => setEditedPDV({ ...editedPDV, lng: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{pdv.lng ? Number(pdv.lng).toFixed(6) : 'Non renseignée'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section Informations de validation */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="checkCircle" size="md" variant="green" />
                Informations de validation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pdv.proposer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proposé par
                    </label>
                    <p className="text-gray-900">
                      {pdv.proposer.firstName} {pdv.proposer.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{pdv.proposer.email}</p>
                  </div>
                )}
                {pdv.validator && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Validé par
                    </label>
                    <p className="text-gray-900">
                      {pdv.validator.firstName} {pdv.validator.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{pdv.validator.email}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de création
                  </label>
                  <p className="text-gray-900">
                    {new Date(pdv.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                {pdv.validatedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de validation
                    </label>
                    <p className="text-gray-900">
                      {new Date(pdv.validatedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pied du modal avec actions */}
          <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                >
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSaveEdit}
                >
                  <span className="flex items-center gap-2">
                    <Icon name="check" size="sm" variant="white" />
                    Enregistrer les modifications
                  </span>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                >
                  Fermer
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleEdit}
                >
                  <span className="flex items-center gap-2">
                    <Icon name="edit" size="sm" variant="white" />
                    Modifier
                  </span>
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
