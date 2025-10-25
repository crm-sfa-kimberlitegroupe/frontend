/**
 * Service pour faire du clustering géographique des PDV
 */

interface Outlet {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface Cluster {
  id: number;
  name: string;
  outlets: Outlet[];
  center: [number, number];
  geometry: any;
}

export class ClusteringService {
  /**
   * K-means clustering pour regrouper les PDV
   */
  static clusterOutlets(outlets: Outlet[], numberOfClusters: number): Cluster[] {
    if (outlets.length === 0) return [];
    if (numberOfClusters <= 0) numberOfClusters = 1;
    if (numberOfClusters > outlets.length) numberOfClusters = outlets.length;

    // Initialiser les centres aléatoirement
    let centers = this.initializeCenters(outlets, numberOfClusters);

    // Itérations K-means
    for (let iter = 0; iter < 100; iter++) {
      // Assigner chaque PDV au cluster le plus proche
      const assignments = outlets.map(outlet =>
        this.findNearestCenter(outlet, centers)
      );

      // Recalculer les centres
      const newCenters = this.recalculateCenters(outlets, assignments, numberOfClusters);

      // Vérifier la convergence
      if (this.centersEqual(centers, newCenters)) {
        break;
      }

      centers = newCenters;
    }

    // Créer les clusters finaux
    return this.createClusters(outlets, centers);
  }

  /**
   * Initialiser les centres avec K-means++
   */
  private static initializeCenters(outlets: Outlet[], k: number): [number, number][] {
    const centers: [number, number][] = [];

    // Premier centre aléatoire
    const firstOutlet = outlets[Math.floor(Math.random() * outlets.length)];
    centers.push([firstOutlet.lat, firstOutlet.lng]);

    // Centres suivants : choisir les points les plus éloignés
    for (let i = 1; i < k; i++) {
      const distances = outlets.map(outlet => {
        const minDist = Math.min(...centers.map(center =>
          this.distance([outlet.lat, outlet.lng], center)
        ));
        return minDist;
      });

      // Choisir le point avec la distance maximale
      const maxIndex = distances.indexOf(Math.max(...distances));
      centers.push([outlets[maxIndex].lat, outlets[maxIndex].lng]);
    }

    return centers;
  }

  /**
   * Trouver le centre le plus proche d'un point
   */
  private static findNearestCenter(
    outlet: Outlet,
    centers: [number, number][]
  ): number {
    let minDist = Infinity;
    let nearestIndex = 0;

    centers.forEach((center, index) => {
      const dist = this.distance([outlet.lat, outlet.lng], center);
      if (dist < minDist) {
        minDist = dist;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }

  /**
   * Recalculer les centres après assignation
   */
  private static recalculateCenters(
    outlets: Outlet[],
    assignments: number[],
    k: number
  ): [number, number][] {
    const newCenters: [number, number][] = [];

    for (let i = 0; i < k; i++) {
      const clusterOutlets = outlets.filter((_, index) => assignments[index] === i);

      if (clusterOutlets.length === 0) {
        // Si aucun PDV assigné, garder l'ancien centre
        newCenters.push([0, 0]);
      } else {
        const avgLat = clusterOutlets.reduce((sum, o) => sum + o.lat, 0) / clusterOutlets.length;
        const avgLng = clusterOutlets.reduce((sum, o) => sum + o.lng, 0) / clusterOutlets.length;
        newCenters.push([avgLat, avgLng]);
      }
    }

    return newCenters;
  }

  /**
   * Vérifier si les centres ont convergé
   */
  private static centersEqual(
    centers1: [number, number][],
    centers2: [number, number][]
  ): boolean {
    if (centers1.length !== centers2.length) return false;

    return centers1.every((center, i) =>
      Math.abs(center[0] - centers2[i][0]) < 0.0001 &&
      Math.abs(center[1] - centers2[i][1]) < 0.0001
    );
  }

  /**
   * Créer les clusters finaux avec géométries
   */
  private static createClusters(
    outlets: Outlet[],
    centers: [number, number][]
  ): Cluster[] {
    const clusters: Cluster[] = [];

    centers.forEach((center, index) => {
      const clusterOutlets = outlets.filter(outlet =>
        this.findNearestCenter(outlet, centers) === index
      );

      if (clusterOutlets.length === 0) return;

      // Créer un polygone convexe autour des PDV du cluster
      const geometry = this.createConvexHull(clusterOutlets);

      clusters.push({
        id: index,
        name: `Secteur ${String.fromCharCode(65 + index)}`, // A, B, C...
        outlets: clusterOutlets,
        center: center,
        geometry: geometry
      });
    });

    return clusters;
  }

  /**
   * Créer une enveloppe convexe autour des points
   */
  private static createConvexHull(outlets: Outlet[]): any {
    if (outlets.length < 3) {
      // Pas assez de points pour un polygone, créer un buffer autour du centre
      const center = outlets.length > 0 ? outlets[0] : { lat: 0, lng: 0 };
      const radius = 0.01; // ~1km de rayon

      const points = 16;
      const coordinates: number[][] = [];

      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        coordinates.push([
          center.lng + radius * Math.cos(angle),
          center.lat + radius * Math.sin(angle)
        ]);
      }

      return {
        type: 'Polygon',
        coordinates: [coordinates]
      };
    }

    // Algorithme de Graham Scan pour l'enveloppe convexe
    const points = outlets.map(o => [o.lng, o.lat]);
    const hull = this.grahamScan(points);

    return {
      type: 'Polygon',
      coordinates: [hull]
    };
  }

  /**
   * Algorithme de Graham Scan (simplifié)
   */
  private static grahamScan(points: number[][]): number[][] {
    // Trier les points par longitude puis latitude
    const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    // Construire l'enveloppe inférieure et supérieure
    const lower: number[][] = [];
    for (const point of sorted) {
      while (lower.length >= 2 && this.cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }
      lower.push(point);
    }

    const upper: number[][] = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const point = sorted[i];
      while (upper.length >= 2 && this.cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
      }
      upper.push(point);
    }

    // Retirer les derniers points qui sont dupliqués
    lower.pop();
    upper.pop();

    // Fermer le polygone
    const hull = [...lower, ...upper];
    hull.push(hull[0]);

    return hull;
  }

  /**
   * Produit vectoriel pour l'orientation
   */
  private static cross(o: number[], a: number[], b: number[]): number {
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  }

  /**
   * Distance euclidienne entre deux points
   */
  private static distance(p1: [number, number], p2: [number, number]): number {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }
}

export default ClusteringService;
