/**
 * Utilitaires pour le calcul de distances et temps de route
 * Basé sur la formule de Haversine pour les calculs de distance GPS
 */

const EARTH_RADIUS_KM = 6371;
const AVERAGE_SPEED_KMH = 25; // Vitesse moyenne en ville (km/h)
const VISIT_DURATION_MIN = 15; // Durée moyenne d'une visite (minutes)

/**
 * Convertit des degrés en radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calcule la distance entre deux points GPS en utilisant la formule de Haversine
 * @returns Distance en kilometres
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (!lat1 || !lng1 || !lat2 || !lng2) {
    return 0;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Formate une distance en texte lisible
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 0.1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Calcule le temps de trajet estime en minutes
 */
export function calculateTravelTime(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  return Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60);
}

/**
 * Formate un temps en texte lisible
 */
export function formatTime(minutes: number): string {
  if (minutes < 1) {
    return '< 1 min';
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
}

interface RouteStop {
  latitude: number;
  longitude: number;
  status: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface RouteCalculationResult {
  totalDistanceKm: number;
  totalDistanceFormatted: string;
  estimatedTimeMinutes: number;
  estimatedTimeFormatted: string;
  remainingDistanceKm: number;
  remainingDistanceFormatted: string;
  remainingTimeMinutes: number;
  remainingTimeFormatted: string;
}

/**
 * Calcule les statistiques completes d'une route
 */
export function calculateRouteStats(
  stops: RouteStop[],
  userLocation: UserLocation | null
): RouteCalculationResult {
  if (!stops || stops.length === 0) {
    return {
      totalDistanceKm: 0,
      totalDistanceFormatted: '0 km',
      estimatedTimeMinutes: 0,
      estimatedTimeFormatted: '0 min',
      remainingDistanceKm: 0,
      remainingDistanceFormatted: '0 km',
      remainingTimeMinutes: 0,
      remainingTimeFormatted: '0 min',
    };
  }

  let totalDistanceKm = 0;
  let remainingDistanceKm = 0;
  const remainingStops = stops.filter((s) => s.status !== 'completed');

  // Calculer la distance totale entre tous les stops (dans l'ordre)
  for (let i = 0; i < stops.length - 1; i++) {
    const current = stops[i];
    const next = stops[i + 1];
    totalDistanceKm += calculateHaversineDistance(
      current.latitude,
      current.longitude,
      next.latitude,
      next.longitude
    );
  }

  // Calculer la distance restante depuis la position actuelle
  if (userLocation && remainingStops.length > 0) {
    // Distance jusqu'au premier stop non visite
    const firstRemaining = remainingStops[0];
    remainingDistanceKm = calculateHaversineDistance(
      userLocation.latitude,
      userLocation.longitude,
      firstRemaining.latitude,
      firstRemaining.longitude
    );

    // Ajouter les distances entre les stops restants
    for (let i = 0; i < remainingStops.length - 1; i++) {
      const current = remainingStops[i];
      const next = remainingStops[i + 1];
      remainingDistanceKm += calculateHaversineDistance(
        current.latitude,
        current.longitude,
        next.latitude,
        next.longitude
      );
    }
  } else if (remainingStops.length > 0) {
    // Sans position utilisateur, calculer juste la distance entre les stops restants
    for (let i = 0; i < remainingStops.length - 1; i++) {
      const current = remainingStops[i];
      const next = remainingStops[i + 1];
      remainingDistanceKm += calculateHaversineDistance(
        current.latitude,
        current.longitude,
        next.latitude,
        next.longitude
      );
    }
  }

  // Calculer les temps (trajet + duree des visites)
  const totalTravelTime = calculateTravelTime(totalDistanceKm);
  const totalVisitTime = stops.length * VISIT_DURATION_MIN;
  const totalTimeMinutes = totalTravelTime + totalVisitTime;

  const remainingTravelTime = calculateTravelTime(remainingDistanceKm);
  const remainingVisitTime = remainingStops.length * VISIT_DURATION_MIN;
  const remainingTimeMinutes = remainingTravelTime + remainingVisitTime;

  return {
    totalDistanceKm,
    totalDistanceFormatted: formatDistance(totalDistanceKm),
    estimatedTimeMinutes: totalTimeMinutes,
    estimatedTimeFormatted: formatTime(totalTimeMinutes),
    remainingDistanceKm,
    remainingDistanceFormatted: formatDistance(remainingDistanceKm),
    remainingTimeMinutes,
    remainingTimeFormatted: formatTime(remainingTimeMinutes),
  };
}

/**
 * Calcule la distance et le temps jusqu'a un point specifique
 */
export function calculateDistanceToStop(
  userLocation: UserLocation | null,
  stopLatitude: number,
  stopLongitude: number
): { distance: string; time: string } {
  if (!userLocation || !stopLatitude || !stopLongitude) {
    return { distance: '--', time: '--' };
  }

  const distanceKm = calculateHaversineDistance(
    userLocation.latitude,
    userLocation.longitude,
    stopLatitude,
    stopLongitude
  );

  const timeMinutes = calculateTravelTime(distanceKm);

  return {
    distance: formatDistance(distanceKm),
    time: formatTime(timeMinutes),
  };
}
