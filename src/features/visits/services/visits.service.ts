import api from '@/core/api/api';

export interface CreateVisitData {
  outletId: string;
  checkinLat?: number;
  checkinLng?: number;
  notes?: string;
  score?: number;
  merchCheck?: {
    checklist?: Record<string, unknown>;
    planogram?: Record<string, unknown>;
    score?: number;
    photos?: Array<{
      fileKey: string;
      lat?: number;
      lng?: number;
      meta?: Record<string, unknown>;
    }>;
  } | null;
  orderId?: string | null;
}

export interface CompleteVisitData {
  visitId: string;
  checkoutLat?: number;
  checkoutLng?: number;
  notes?: string;
  score?: number;
  merchCheck?: {
    checklist?: Record<string, unknown>;
    planogram?: Record<string, unknown>;
    score?: number;
    photos?: Array<{
      fileKey: string;
      lat?: number;
      lng?: number;
      meta?: Record<string, unknown>;
    }>;
  } | null;
  orderId?: string | null;
  merchId?: string | null;
}

export interface Visit {
  id: string;
  outletId: string;
  userId: string;
  checkinAt: string;
  checkinLat?: number;
  checkinLng?: number;
  checkoutAt?: string;
  checkoutLat?: number;
  checkoutLng?: number;
  durationMin?: number;
  notes?: string;
  score?: number;
  outlet?: any;
  user?: any;
  merchChecks?: any[];
  orders?: any[];
}

class VisitsService {
  /**
   * Créer une visite complète (check-in et check-out automatiques)
   * Utilisé quand le vendeur termine directement sa visite avec les actions
   */
  async createCompleteVisit(data: CreateVisitData): Promise<Visit> {
    console.log('📤 [visitsService] Envoi vers POST /visits/complete:', data);
    const response = await api.post('/visits/complete', data);
    console.log('📝 [visitsService] Réponse complète:', response);
    console.log('📝 [visitsService] response.data:', response.data);
    
    // Le backend peut retourner soit { statusCode, message, data } soit directement la visite
    const visit = response.data.data || response.data;
    
    // Vérifier si c'est bien un objet visite (doit avoir un id)
    if (!visit || !visit.id) {
      console.error('❌ [visitsService] Pas de visite valide dans la réponse');
      console.error('❌ [visitsService] Structure reçue:', JSON.stringify(response.data, null, 2));
      throw new Error('La réponse de l\'API ne contient pas de visite valide');
    }
    
    console.log('✅ [visitsService] Visite reçue avec ID:', visit.id);
    return visit;
  }

  /**
   * Met à jour le statut d'une visite
   */
  async updateVisitStatus(visitId: string, status: 'IN_PROGRESS' | 'COMPLETED'): Promise<Visit> {
    const response = await api.patch(`/visits/${visitId}/status`, { status });
    return response.data;
  }


  /**
   * Check-in : Début d'une visite
   */
  async checkIn(outletId: string, lat?: number, lng?: number, notes?: string): Promise<Visit> {
    const response = await api.post('/visits/check-in', {
      outletId,
      checkinLat: lat,
      checkinLng: lng,
      notes,
    });
    return response.data.data;
  }

  /**
   * Check-out : Fin d'une visite
   */
  async checkOut(visitId: string, lat?: number, lng?: number, notes?: string, score?: number): Promise<Visit> {
    const response = await api.post('/visits/check-out', {
      visitId,
      checkoutLat: lat,
      checkoutLng: lng,
      notes,
      score,
    });
    return response.data.data;
  }

  /**
   * Vérifier si une visite existe
   */
  async checkVisitExists(visitId: string): Promise<boolean> {
    try {
      const response = await api.get(`/visits/${visitId}`);
      return !!response.data.data;
    } catch (error) {
      console.log('Visite non trouvée:', visitId);
      return false;
    }
  }

  /**
   * Terminer une visite avec toutes les données
   */
  async completeVisit(data: CompleteVisitData): Promise<Visit> {
    const response = await api.put('/visits/complete', data);
    return response.data.data;
  }

  /**
   * Récupérer les visites de l'utilisateur
   */
  async getMyVisits(filters?: {
    startDate?: string;
    endDate?: string;
    outletId?: string;
  }): Promise<Visit[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.outletId) params.append('outletId', filters.outletId);

    const response = await api.get(`/visits/my-visits?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Récupérer une visite par ID
   */
  async getVisitById(id: string): Promise<Visit> {
    const response = await api.get(`/visits/${id}`);
    return response.data.data;
  }

  /**
   * Ajouter un merchandising à une visite
   */
  async addMerchCheck(visitId: string, merchCheck: any): Promise<any> {
    const response = await api.post(`/visits/${visitId}/merch-check`, merchCheck);
    return response.data.data;
  }

  /**
   * Lier une vente à une visite
   */
  async linkOrderToVisit(visitId: string, orderId: string): Promise<any> {
    const response = await api.put(`/visits/${visitId}/link-order/${orderId}`);
    return response.data.data;
  }

  /**
   * Récupérer la visite active (en cours) du vendeur
   */
  async getActiveVisit(): Promise<Visit | null> {
    try {
      const response = await api.get('/visits/active');
      return response.data.data || null;
    } catch (error) {
      console.log('Aucune visite active trouvée');
      return null;
    }
  }
}

export const visitsService = new VisitsService();
