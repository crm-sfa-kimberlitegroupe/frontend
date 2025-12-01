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
    const response = await api.post('/visits/complete', data);
    
    // Le backend peut retourner soit { statusCode, message, data } soit directement la visite
    const visit = response.data.data || response.data;
    
    // Verifier si c'est bien un objet visite (doit avoir un id)
    if (!visit || !visit.id) {
      throw new Error('La reponse de l\'API ne contient pas de visite valide');
    }
    
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
    
    // Essayer differentes structures de reponse
    let visit = response.data.data;
    if (!visit && response.data) {
      visit = response.data;
    }
    
    if (!visit || !visit.id) {
      throw new Error('Reponse API invalide - pas de visite retournee');
    }
    
    return visit;
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
      const visit = response.data?.data || response.data;
      return !!(visit && visit.id);
    } catch {
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
   * Récupérer une visite par ID avec ses relations (orders, merchChecks)
   */
  async getVisitById(id: string): Promise<Visit> {
    const response = await api.get(`/visits/${id}`);
    const visit = response.data?.data || response.data;
    return visit;
  }

  /**
   * Récupérer la dernière visite d'un PDV par outletId
   */
  async getLatestVisitByOutlet(outletId: string): Promise<Visit> {
    const response = await api.get(`/visits/outlet/${outletId}/latest`);
    const visit = response.data?.data || response.data;
    return visit;
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
    } catch {
      return null;
    }
  }

  /**
   * Mettre à jour les ventes d'une visite
   */
  async updateVisitOrders(visitId: string, orderIds: string[]): Promise<Visit> {
    const response = await api.put(`/visits/${visitId}/orders`, { orderIds });
    return response.data.data;
  }

  /**
   * Ajouter une vente à une visite
   */
  async addOrderToVisit(visitId: string, orderId: string): Promise<Visit> {
    const response = await api.post(`/visits/${visitId}/orders/${orderId}`);
    return response.data.data;
  }

  /**
   * Supprimer une vente d'une visite
   */
  async removeOrderFromVisit(visitId: string, orderId: string): Promise<Visit> {
    const response = await api.delete(`/visits/${visitId}/orders/${orderId}`);
    return response.data.data;
  }

  /**
   * Mettre à jour les merchandising d'une visite
   */
  async updateVisitMerchandising(visitId: string, merchIds: string[]): Promise<Visit> {
    const response = await api.put(`/visits/${visitId}/merchandising`, { merchIds });
    return response.data.data;
  }

  /**
   * Ajouter un merchandising à une visite
   */
  async addMerchandisingToVisit(visitId: string, merchId: string): Promise<Visit> {
    const response = await api.post(`/visits/${visitId}/merchandising/${merchId}`);
    return response.data.data;
  }

  /**
   * Supprimer un merchandising d'une visite
   */
  async removeMerchandisingFromVisit(visitId: string, merchId: string): Promise<Visit> {
    const response = await api.delete(`/visits/${visitId}/merchandising/${merchId}`);
    return response.data.data;
  }
}

export const visitsService = new VisitsService();
