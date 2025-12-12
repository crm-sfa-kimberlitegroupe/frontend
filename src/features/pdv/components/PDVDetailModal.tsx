import { Icon } from '@/core/ui/Icon';
import Badge from '@/core/ui/Badge';
import Button from '@/core/ui/Button';
import type { Outlet } from '../services/outletsService';

interface PDVDetailModalProps {
  pdv: Outlet | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PDVDetailModal({ pdv, isOpen, onClose }: PDVDetailModalProps) {
  if (!isOpen || !pdv) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non renseigne';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success" size="md">Valide</Badge>;
      case 'PENDING':
        return <Badge variant="warning" size="md">En attente</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" size="md">Rejete</Badge>;
      case 'INACTIVE':
        return <Badge variant="gray" size="md">Inactif</Badge>;
      default:
        return <Badge variant="gray" size="md">{status}</Badge>;
    }
  };

  const openInMaps = () => {
    if (pdv.lat && pdv.lng) {
      window.open(`https://www.google.com/maps?q=${pdv.lat},${pdv.lng}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon name="store" size="2xl" variant="white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{pdv.name}</h2>
                <p className="text-sky-100 text-sm mt-1">Code: {pdv.code}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Icon name="x" size="md" variant="white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Statut */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-gray-600">Statut:</span>
            {getStatusBadge(pdv.status)}
          </div>

          {/* Informations generales */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="store" size="sm" variant="primary" />
              Informations generales
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Icon name="flag" size="sm" variant="grey" className="mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Canal</p>
                  <p className="text-sm font-medium text-gray-900">{pdv.channel}</p>
                </div>
              </div>
              {pdv.segment && (
                <div className="flex items-start gap-3">
                  <Icon name="chartBar" size="sm" variant="grey" className="mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Segment</p>
                    <p className="text-sm font-medium text-gray-900">{pdv.segment}</p>
                  </div>
                </div>
              )}
              {pdv.territory && (
                <div className="flex items-start gap-3">
                  <Icon name="map" size="sm" variant="grey" className="mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Territoire</p>
                    <p className="text-sm font-medium text-gray-900">
                      {pdv.territory.name} ({pdv.territory.code})
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Localisation */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="locationMarker" size="sm" variant="primary" />
              Localisation
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {pdv.address && (
                <div className="flex items-start gap-3">
                  <Icon name="home" size="sm" variant="grey" className="mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Adresse</p>
                    <p className="text-sm font-medium text-gray-900">{pdv.address}</p>
                  </div>
                </div>
              )}
              {pdv.lat && pdv.lng && (
                <div className="flex items-start gap-3">
                  <Icon name="map" size="sm" variant="grey" className="mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Coordonnees GPS</p>
                    <p className="text-sm font-medium text-gray-900">
                      {Number(pdv.lat).toFixed(6)}, {Number(pdv.lng).toFixed(6)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openInMaps}
                    className="shrink-0"
                  >
                    <Icon name="eye" size="xs" />
                    <span className="ml-1">Maps</span>
                  </Button>
                </div>
              )}
              {!pdv.address && !pdv.lat && !pdv.lng && (
                <p className="text-sm text-gray-500 italic">Aucune localisation renseignee</p>
              )}
            </div>
          </div>

          {/* Horaires d'ouverture */}
          {pdv.openHours && Object.keys(pdv.openHours).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="clock" size="sm" variant="primary" />
                Horaires d'ouverture
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {pdv.openHours.days && pdv.openHours.days.length > 0 && (
                  <div className="flex items-start gap-3 mb-2">
                    <Icon name="calendar" size="sm" variant="grey" className="mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Jours</p>
                      <p className="text-sm font-medium text-gray-900">
                        {pdv.openHours.days.join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                {(pdv.openHours.opening || pdv.openHours.closing) && (
                  <div className="flex items-start gap-3">
                    <Icon name="clock" size="sm" variant="grey" className="mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Heures</p>
                      <p className="text-sm font-medium text-gray-900">
                        {pdv.openHours.opening || '--:--'} - {pdv.openHours.closing || '--:--'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Historique */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="clock" size="sm" variant="primary" />
              Historique
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {pdv.proposer && (
                <div className="flex items-start gap-3">
                  <Icon name="user" size="sm" variant="grey" className="mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Propose par</p>
                    <p className="text-sm font-medium text-gray-900">
                      {pdv.proposer.firstName} {pdv.proposer.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{pdv.proposer.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Icon name="calendar" size="sm" variant="grey" className="mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Date de creation</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(pdv.createdAt)}</p>
                </div>
              </div>
              {pdv.validator && (
                <div className="flex items-start gap-3">
                  <Icon name="checkCircle" size="sm" variant="green" className="mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Valide par</p>
                    <p className="text-sm font-medium text-gray-900">
                      {pdv.validator.firstName} {pdv.validator.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{pdv.validator.email}</p>
                  </div>
                </div>
              )}
              {pdv.validatedAt && (
                <div className="flex items-start gap-3">
                  <Icon name="calendar" size="sm" variant="grey" className="mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Date de validation</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(pdv.validatedAt)}</p>
                  </div>
                </div>
              )}
              {pdv.validationComment && (
                <div className="flex items-start gap-3">
                  <Icon name="note" size="sm" variant="grey" className="mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Commentaire de validation</p>
                    <p className="text-sm font-medium text-gray-900">{pdv.validationComment}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Donnees OSM */}
          {pdv.osmPlaceId && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="map" size="sm" variant="primary" />
                Donnees OpenStreetMap
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="fingerprint" size="sm" variant="grey" className="mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Place ID</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">{pdv.osmPlaceId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <Button variant="outline" fullWidth onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
