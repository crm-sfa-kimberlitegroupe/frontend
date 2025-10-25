/**
 * Service pour récupérer les frontières administratives depuis OpenStreetMap
 */

interface OSMBoundary {
  name: string;
  adminLevel: string;
  geometry: any;
  bbox: [number, number, number, number];
}

export class GeoService {
  /**
   * Récupérer les frontières administratives d'une ville/région
   */
  static async getAdministrativeBoundaries(
    cityName: string,
    adminLevel: number = 9 // 8=commune, 9=quartier, 10=sous-quartier
  ): Promise<OSMBoundary[]> {
    try {
      // Requête Overpass API
      const query = `
        [out:json][timeout:25];
        area["name"="${cityName}"]["boundary"="administrative"]->.searchArea;
        (
          relation["boundary"="administrative"]["admin_level"="${adminLevel}"](area.searchArea);
        );
        out geom;
      `;

      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données OSM');
      }

      const data = await response.json();

      // Convertir les éléments OSM en format utilisable
      return data.elements.map((element: any) => ({
        name: element.tags?.name || `Zone ${element.id}`,
        adminLevel: element.tags?.admin_level,
        geometry: this.convertOSMToGeoJSON(element),
        bbox: this.calculateBBox(element)
      }));
    } catch (error) {
      console.error('Erreur getAdministrativeBoundaries:', error);
      throw error;
    }
  }

  /**
   * Découpage automatique hiérarchique
   * Exemple: "Région Centre, Cameroun" → récupère toutes les villes
   */
  static async autoDivideByHierarchy(
    parentName: string,
    subdivisionType: 'villes' | 'communes' | 'quartiers'
  ): Promise<OSMBoundary[]> {
    try {
      // Niveaux hiérarchiques OpenStreetMap
      const hierarchyMap = {
        'villes': { parent: 4, child: 8 },        // Région → Villes/Communes  
        'communes': { parent: 6, child: 8 },      // Département → Communes
        'quartiers': { parent: 8, child: 9 }      // Commune → Quartiers
      };

      const levels = hierarchyMap[subdivisionType];
      
      // Requête pour récupérer toutes les subdivisions
      const query = `
        [out:json][timeout:25];
        area["name"="${parentName}"]["boundary"="administrative"]->.parentArea;
        (
          relation["boundary"="administrative"]["admin_level"="${levels.child}"](area.parentArea);
        );
        out geom;
      `;

      console.log(`🔍 Découpage automatique de "${parentName}" par ${subdivisionType}...`);

      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Erreur API OpenStreetMap');
      }

      const data = await response.json();

      console.log(`✅ ${data.elements.length} ${subdivisionType} trouvées`);

      if (data.elements.length === 0) {
        throw new Error(`Aucune subdivision trouvée pour "${parentName}"`);
      }

      // Convertir en secteurs
      return data.elements.map((element: any, index: number) => ({
        name: element.tags?.name || `Secteur ${index + 1}`,
        adminLevel: element.tags?.admin_level,
        geometry: this.convertOSMToGeoJSON(element),
        bbox: this.calculateBBox(element)
      }));
    } catch (error) {
      console.error('Erreur autoDivideByHierarchy:', error);
      throw error;
    }
  }

  /**
   * Rechercher une ville/région pour obtenir ses coordonnées
   */
  static async geocodeCity(cityName: string): Promise<{
    lat: number;
    lng: number;
    displayName: string;
  } | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
      );

      const data = await response.json();

      if (data.length === 0) return null;

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    } catch (error) {
      console.error('Erreur geocodeCity:', error);
      return null;
    }
  }

  /**
   * Convertir les données OSM en GeoJSON
   */
  private static convertOSMToGeoJSON(element: any): any {
    if (element.type === 'relation') {
      // Extraire les coordonnées de TOUS les membres "outer"
      const coordinates: number[][][] = [];

      element.members?.forEach((member: any) => {
        if (member.role === 'outer' && member.geometry) {
          const ring = member.geometry.map((node: any) => [node.lon, node.lat]);
          coordinates.push(ring);
        }
      });

      return {
        type: 'Polygon',
        coordinates: coordinates.length > 0 ? coordinates : [[]]
      };
    }

    return null;
  }

  /**
   * Calculer la bounding box d'un élément OSM
   */
  private static calculateBBox(element: any): [number, number, number, number] {
    let minLat = Infinity, minLon = Infinity;
    let maxLat = -Infinity, maxLon = -Infinity;

    element.members?.forEach((member: any) => {
      member.geometry?.forEach((node: any) => {
        minLat = Math.min(minLat, node.lat);
        minLon = Math.min(minLon, node.lon);
        maxLat = Math.max(maxLat, node.lat);
        maxLon = Math.max(maxLon, node.lon);
      });
    });

    return [minLon, minLat, maxLon, maxLat];
  }

  /**
   * Découpage en grille régulière
   */
  static divideIntoGrid(
    bbox: [number, number, number, number],
    rows: number,
    cols: number
  ): Array<{
    name: string;
    geometry: any;
  }> {
    const [minLng, minLat, maxLng, maxLat] = bbox;
    const width = (maxLng - minLng) / cols;
    const height = (maxLat - minLat) / rows;

    const sectors = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cellBbox: [number, number, number, number] = [
          minLng + j * width,
          minLat + i * height,
          minLng + (j + 1) * width,
          minLat + (i + 1) * height
        ];

        sectors.push({
          name: `Secteur ${String.fromCharCode(65 + i)}${j + 1}`, // A1, A2, B1, B2...
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [cellBbox[0], cellBbox[1]],
              [cellBbox[2], cellBbox[1]],
              [cellBbox[2], cellBbox[3]],
              [cellBbox[0], cellBbox[3]],
              [cellBbox[0], cellBbox[1]]
            ]]
          }
        });
      }
    }

    return sectors;
  }
}

export default GeoService;
