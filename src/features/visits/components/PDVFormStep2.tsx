import { MapPin, Navigation, Map as MapIcon } from 'lucide-react';
import Button from '../../../core/ui/Button';
import Map from '../../../core/components/desktop/Map';
import type { PDVFormData } from '../types/pdv.types';
import { useState } from 'react';
import type { UserRole } from '../../../core/types';

interface PDVFormStep2Props {
  formData: PDVFormData;
  onChange: (data: Partial<PDVFormData>) => void;
  userRole?: UserRole;
}

export default function PDVFormStep2({ formData, onChange, userRole = 'REP' }: PDVFormStep2Props) {
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [gpsAttempts, setGpsAttempts] = useState(0);
  const MAX_ACCURACY = 1000; // Précision maximale acceptée en mètres
  const DESIRED_ACCURACY = 20; // Précision idéale en mètres
  const MAX_WAIT_TIME = 30000; // Temps maximum d'attente (30 secondes)

  const handleGetCurrentPosition = () => {
    if (!navigator.geolocation) {
      alert('❌ Géolocalisation non supportée par votre appareil');
      return;
    }

    setIsCapturingGPS(true);
    setGpsAttempts(0);
    
    let bestAccuracy = Infinity;
    let bestPosition: GeolocationPosition | null = null;
    const startTime = Date.now();
    let watchId: number;

    const finishCapture = (position: GeolocationPosition, accuracy: number) => {
      navigator.geolocation.clearWatch(watchId);
      setIsCapturingGPS(false);
      setGpsAccuracy(accuracy);

      onChange({
        latitude: position.coords.latitude.toFixed(6),
        longitude: position.coords.longitude.toFixed(6),
      });

      const qualityEmoji = accuracy <= 10 ? '🎯' : accuracy <= 20 ? '✅' : accuracy <= 50 ? '👍' : '⚠️';
      const qualityText = accuracy <= 10 ? 'Excellente' : accuracy <= 20 ? 'Très bonne' : accuracy <= 50 ? 'Bonne' : 'Acceptable';
      
      alert(
        `${qualityEmoji} Position capturée avec succès!\n\n` +
        `Précision: ${accuracy.toFixed(1)}m\n` +
        `Qualité: ${qualityText}\n` +
        `Tentatives: ${gpsAttempts + 1}`
      );
    };

    // Utiliser watchPosition pour améliorer continuellement la précision
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        const elapsed = Date.now() - startTime;
        
        setGpsAttempts(prev => prev + 1);
        setGpsAccuracy(accuracy);

        // Garder la meilleure position
        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;
          bestPosition = position;
        }

        // Conditions d'arrêt:
        // 1. Précision excellente atteinte (< DESIRED_ACCURACY)
        if (accuracy <= DESIRED_ACCURACY) {
          finishCapture(position, accuracy);
          return;
        }

        // 2. Temps maximum écoulé - prendre la meilleure position obtenue
        if (elapsed >= MAX_WAIT_TIME) {
          if (bestPosition && bestAccuracy <= MAX_ACCURACY) {
            finishCapture(bestPosition, bestAccuracy);
          } else {
            navigator.geolocation.clearWatch(watchId);
            setIsCapturingGPS(false);
            alert(
              `⚠️ Précision GPS insuffisante après ${MAX_WAIT_TIME/1000}s\n\n` +
              `Meilleure précision obtenue: ${bestAccuracy.toFixed(0)}m\n` +
              `Précision requise: < ${MAX_ACCURACY}m\n\n` +
              `Conseils:\n` +
              `• Activez le GPS haute précision dans les paramètres\n` +
              `• Déplacez-vous en extérieur (loin des bâtiments)\n` +
              `• Vérifiez votre connexion internet (aide le A-GPS)\n` +
              `• Attendez que le GPS se stabilise\n` +
              `• Réessayez dans quelques instants`
            );
          }
          return;
        }

        // 3. Bonne précision après au moins 3 tentatives
        if (gpsAttempts >= 2 && accuracy <= 50) {
          finishCapture(position, accuracy);
          return;
        }
      },
      (error) => {
        navigator.geolocation.clearWatch(watchId);
        setIsCapturingGPS(false);
        
        let errorMessage = 'Erreur inconnue';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission de géolocalisation refusée.\nVeuillez autoriser l\'accès à votre position.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position indisponible.\nVérifiez que le GPS est activé.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai d\'attente dépassé.\nLe signal GPS est trop faible.';
            break;
        }
        
        alert(`❌ Impossible de récupérer la position\n\n${errorMessage}`);
      },
      {
        enableHighAccuracy: true,
        timeout: MAX_WAIT_TIME,
        maximumAge: 0
      }
    );
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Localisation
      </h2>
      <p className="text-sm text-gray-600 mb-4">Précisez l'adresse et la position GPS</p>
      
      <div className="space-y-4">
        {/* Adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse complète *
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => onChange({ address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            rows={2}
            placeholder="Ex: 123 Avenue Houphouët-Boigny, Plateau, Abidjan"
          />
        </div>

        {/* Position GPS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position GPS *
          </label>
          
          {/* Affichage des coordonnées capturées */}
          {formData.latitude && formData.longitude ? (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-green-900">Position capturée ✓</span>
                  <div className="text-green-700 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                  </div>
                  {gpsAccuracy && (
                    <div className="text-xs text-green-600 mt-1">
                      Précision: {gpsAccuracy.toFixed(0)}m
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGetCurrentPosition}
                >
                  Recapturer
                </Button>
              </div>
            </div>
          ) : isCapturingGPS ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div className="text-sm">
                  <div className="font-medium text-blue-900">Recherche du signal GPS...</div>
                  <div className="text-blue-700 mt-1">
                    {gpsAccuracy ? (
                      <>
                        Précision actuelle: <span className="font-semibold">{gpsAccuracy.toFixed(1)}m</span>
                        {gpsAccuracy > DESIRED_ACCURACY && (
                          <span className="text-xs ml-2">(amélioration en cours...)</span>
                        )}
                      </>
                    ) : (
                      'Initialisation...'
                    )}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Tentative {gpsAttempts} • Objectif: &lt;{DESIRED_ACCURACY}m
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              variant="primary" 
              size="md" 
              fullWidth
              onClick={handleGetCurrentPosition}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Capturer ma position actuelle
            </Button>
          )}

          {/* Carte interactive */}
          {formData.latitude && formData.longitude && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapIcon className="w-4 h-4" />
                Carte de localisation
              </label>
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <Map
                  latitude={parseFloat(formData.latitude)}
                  longitude={parseFloat(formData.longitude)}
                  height="300px"
                  zoom={16}
                  draggableMarker={userRole !== 'REP'}
                  onLocationChange={(lat, lng) => {
                    if (userRole !== 'REP') {
                      onChange({
                        latitude: lat.toFixed(6),
                        longitude: lng.toFixed(6),
                      });
                    }
                  }}
                  popupText={formData.name || 'Position du point de vente'}
                />
              </div>
              {userRole !== 'REP' && (
                <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                  <span className="text-blue-500">ℹ️</span>
                  Déplacez le marqueur sur la carte pour ajuster précisément la position
                </p>
              )}
            </div>
          )}
        </div>

        {/* Téléphone principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone du PDV
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="text-lg">🇨🇮</span>
                <span>+225</span>
              </div>
            </div>
            <input
              type="tel"
              value={formData.phone?.replace('+225 ', '') || ''}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '').substring(0, 10);
                const formatted = cleaned.match(/.{1,2}/g)?.join(' ') || cleaned;
                onChange({ phone: `+225 ${formatted}` });
              }}
              className="w-full pl-24 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
              placeholder="XX XX XX XX XX"
              maxLength={13}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
