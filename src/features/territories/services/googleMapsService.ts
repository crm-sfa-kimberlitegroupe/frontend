/**
 * Service Google Maps pour la recherche de frontières
 */

interface GoogleBoundary {
  name: string;
  geometry: any;
  bounds: google.maps.LatLngBounds;
  viewport: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

export class GoogleMapsService {
  private static geocoder: google.maps.Geocoder | null = null;

  /**
   * Initialiser le geocoder
   */
  private static initGeocoder() {
    if (!this.geocoder && window.google) {
      this.geocoder = new google.maps.Geocoder();
    }
  }

  /**
   * Rechercher les frontières d'une zone
   */
  static async searchBoundaries(placeName: string): Promise<GoogleBoundary | null> {
    this.initGeocoder();

    if (!this.geocoder) {
      throw new Error('Google Maps n\'est pas encore chargé');
    }

    try {
      console.log(`🔍 Recherche Google Maps pour: "${placeName}"`);

      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        this.geocoder!.geocode(
          {
            address: placeName + ', Côte d\'Ivoire',
            componentRestrictions: {
              country: 'CI' // Côte d'Ivoire
            }
          },
          (results, status) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      if (result.length === 0) {
        console.warn('Aucun résultat trouvé');
        return null;
      }

      const place = result[0];
      console.log('✅ Résultat Google Maps:', place);

      // Créer un polygone rectangulaire basé sur le viewport
      const viewport = place.geometry.viewport;
      const ne = viewport.getNorthEast();
      const sw = viewport.getSouthWest();

      const rectangleCoordinates = [
        [sw.lng(), sw.lat()], // Sud-Ouest
        [ne.lng(), sw.lat()], // Sud-Est
        [ne.lng(), ne.lat()], // Nord-Est
        [sw.lng(), ne.lat()], // Nord-Ouest
        [sw.lng(), sw.lat()]  // Fermer le polygone
      ];

      return {
        name: place.formatted_address,
        geometry: {
          type: 'Polygon',
          coordinates: [rectangleCoordinates]
        },
        bounds: place.geometry.bounds || viewport,
        viewport: {
          northeast: { lat: ne.lat(), lng: ne.lng() },
          southwest: { lat: sw.lat(), lng: sw.lng() }
        }
      };

    } catch (error) {
      console.error('Erreur Google Maps:', error);
      throw error;
    }
  }

  /**
   * Calculer la superficie approximative en km²
   */
  static calculateArea(viewport: GoogleBoundary['viewport']): number {
    const { northeast, southwest } = viewport;
    
    // Calculer la distance en degrés
    const latDiff = northeast.lat - southwest.lat;
    const lngDiff = northeast.lng - southwest.lng;
    
    // Conversion approximative en km (1 degré ≈ 111 km)
    const area = Math.abs(latDiff * lngDiff) * 111 * 111;
    
    return Math.round(area * 100) / 100;
  }
}

export default GoogleMapsService;
