import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/core/ui';
import { useToggle } from '@/core/hooks';
import { useAuthStore } from '@/core/auth';
import { visitsService, type Visit } from '../services/visits.service';
import routesService from '../../routes/services/routesService';
import { useVisitsStore, type VisitData } from '../stores/visitsStore';
import { useRoutesStore } from '../../routes/stores/routesStore';
import VisitsHeader from '../components/VisitsHeader';
import PDVFormWizard from '../components/PDVFormWizard';
import VisitCard from '../components/VisitCard';
import VisitInitializationModal from '../components/VisitInitializationModal';

export default function VisitsREP() {
  const navigate = useNavigate();
  // Hook réutilisable pour le toggle
  const [showPDVForm, , setShowPDVForm] = useToggle(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Utiliser les stores préchargés
  const user = useAuthStore((state) => state.user);
  const { startVisit } = useVisitsStore();
  const { todayRoute, updateRouteStopStatusLocally } = useRoutesStore();


  
  // États pour la modale d'initialisation
  const [showInitModal, setShowInitModal] = useState(false);
  const [initPdvName, setInitPdvName] = useState('');




const handleVisitSelect = async (visit: { id: string; pdvName: string; outletId: string; address?: string; status: string; scheduledTime?: string; sequence?: number }) => {
  let createdVisit: Visit | null = null;
  
  try {
    // ========================================
    // CAS 1: Visite TERMINÉE - Juste consulter
    // ========================================
    if (visit.status === 'COMPLETED') {
      const params = new URLSearchParams({
        outletId: visit.outletId,
        pdvName: encodeURIComponent(visit.pdvName),
        address: encodeURIComponent(visit.address || ''),
        status: 'COMPLETED',
        routePlanId: todayRoute?.id || ''
      });
      navigate(`/dashboard/visits/detail/${visit.id}?${params.toString()}`);
      return;
    }
    
    // ========================================
    // CAS 2: Visite EN COURS
    // ========================================
    if (visit.status === 'IN_PROGRESS') {
      const storeState = useVisitsStore.getState();
      const activeVisits = storeState.activeVisits;
      const visitFromStore = activeVisits[visit.outletId];
      
      if (visitFromStore && visitFromStore.visitId) {
        const params = new URLSearchParams({
          outletId: visit.outletId,
          pdvName: encodeURIComponent(visit.pdvName),
          address: encodeURIComponent(visit.address || ''),
          status: 'IN_PROGRESS',
          routePlanId: todayRoute?.id || ''
        });
        navigate(`/dashboard/visits/detail/${visitFromStore.visitId}?${params.toString()}`);
        return;
      } else {
        const params = new URLSearchParams({
          outletId: visit.outletId,
          pdvName: encodeURIComponent(visit.pdvName),
          address: encodeURIComponent(visit.address || ''),
          status: visit.status,
          routePlanId: todayRoute?.id || ''
        });
        navigate(`/dashboard/visits/detail/${visit.id}?${params.toString()}`);
        return;
      }
    }
    
    // ========================================
    // CAS 3: Visite PLANIFIÉE - Faire check-in
    // ========================================
    if (visit.status === 'PLANNED') {
      setInitPdvName(visit.pdvName);
      setShowInitModal(true);
      
      // ====================================================================
      // AVANT CHECK-IN: Données du RouteStop (ID local, pas encore de visite)
      // ====================================================================
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════════╗');
      console.log('║           AVANT CHECK-IN - DONNÉES DU ROUTESTOP           ║');
      console.log('╠══════════════════════════════════════════════════════════════╣');
      console.log('║ ID RouteStop (local):', visit.id);
      console.log('║ PDV:', visit.pdvName);
      console.log('║ OutletId:', visit.outletId);
      console.log('║ Status:', visit.status);
      console.log('╚══════════════════════════════════════════════════════════════╝');
      console.log('');
      
      // Récupérer les coordonnées GPS
      let lat: number | undefined;
      let lng: number | undefined;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch {
          // GPS non disponible
        }
      }

      try {
        const newVisit = await visitsService.checkIn(visit.outletId, lat, lng);
        createdVisit = newVisit;
        
        if (!newVisit || !newVisit.id) {
          throw new Error('Service checkIn n\'a pas retourné de visite valide');
        }
        
        // ====================================================================
        // ✅ APRÈS CHECK-IN: Réponse du Backend (NOUVEAU ID généré!)
        // ====================================================================
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║        ✅ APRÈS CHECK-IN - RÉPONSE DU BACKEND                ║');
        console.log('╠══════════════════════════════════════════════════════════════╣');
        console.log('║ 🆔 ID VISITE (BACKEND):', newVisit.id);
        console.log('║ UserId:', newVisit.userId);
        console.log('║ OutletId:', newVisit.outletId);
        console.log('║ CheckinAt:', newVisit.checkinAt);
        console.log('║ CheckinLat:', newVisit.checkinLat);
        console.log('║ CheckinLng:', newVisit.checkinLng);
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log('');
        
      } catch (checkInError) {
        console.error('Erreur lors du check-in:', checkInError);
        throw checkInError;
      }

      if (createdVisit?.id) {
        const visitData: VisitData = {
          outletId: visit.outletId,
          visitId: createdVisit.id,
          routeStopId: visit.id,
          userId: createdVisit.userId,
          pdvName: visit.pdvName,
          address: visit.address,
          checkinAt: createdVisit.checkinAt,
          scheduledTime: visit.scheduledTime,
          checkinLat: createdVisit.checkinLat,
          checkinLng: createdVisit.checkinLng,
          sequence: visit.sequence || 0,
          routePlanId: todayRoute?.id,
          notes: createdVisit.notes,
        };
        
        startVisit(visitData);
        
        // ====================================================================
        // 💾 STOCKÉ DANS LE STORE: Comparaison des IDs
        // ====================================================================
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║           💾 STOCKÉ DANS LE STORE - COMPARAISON              ║');
        console.log('╠══════════════════════════════════════════════════════════════╣');
        console.log('║ ❌ routeStopId (ancien ID local):', visit.id);
        console.log('║ ✅ visitId (NOUVEAU ID BACKEND):', createdVisit.id);
        console.log('║');
        console.log('║ 👉 L\'ID utilisé pour les opérations sera:', createdVisit.id);
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log('');
      }

      // Mettre à jour le statut du routeStop
      if (todayRoute?.id) {
        await routesService.updateRouteStopStatus(todayRoute.id, visit.outletId, 'IN_PROGRESS');
        updateRouteStopStatusLocally(visit.outletId, 'IN_PROGRESS');
      }
      
      setShowInitModal(false);
    }
    
    // Naviguer vers la page de détail
    setTimeout(() => {
      const visitIdToUse = visit.status === 'PLANNED' && createdVisit?.id ? createdVisit.id : visit.id;
      
      const params = new URLSearchParams({
        outletId: visit.outletId,
        pdvName: encodeURIComponent(visit.pdvName),
        address: encodeURIComponent(visit.address || ''),
        status: visit.status === 'PLANNED' ? 'IN_PROGRESS' : visit.status,
        routePlanId: todayRoute?.id || ''
      });
      
      navigate(`/dashboard/visits/detail/${visitIdToUse}?${params.toString()}`);
    }, visit.status === 'PLANNED' ? 1500 : 0);
    
  } catch {
    setShowInitModal(false);
    alert('Erreur lors du démarrage de la visite. Veuillez réessayer.');
  }
};


  // Construire les visites depuis les données préchargées
  const visits = todayRoute?.routeStops?.map(stop => {
    // L'outlet est déjà inclus dans stop.outlet, pas besoin de chercher dans le store
    const outlet = stop.outlet;
    
    let visitStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' = 'PLANNED';
    
    // Mapper directement les statuts du routeStop
    if (stop.status === 'VISITED') {
      visitStatus = 'COMPLETED';
    } else if (stop.status === 'IN_PROGRESS') {
      visitStatus = 'IN_PROGRESS';
    } else if (stop.status === 'PLANNED') {
      visitStatus = 'PLANNED';
    }
    
    console.log(`[VisitsREP] Stop ${outlet?.name}: ${stop.status} → ${visitStatus}`);
    
    return {
      id: stop.id,
      pdvName: outlet?.name || 'PDV Inconnu',
      outletId: stop.outletId,
      routeStopId: stop.id,
      status: visitStatus,
      scheduledTime: stop.eta ? new Date(stop.eta).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : `${8 + stop.seq}:00`,
      sequence: stop.seq,
      address: outlet?.address || '',
      checkInTime: undefined,
      checkOutTime: undefined,
    };
  }) || [];

  // Log des visites construites uniquement si elles changent
  useEffect(() => {
    console.log("VisitsREP - visits construites:", visits.length, visits);
  }, [visits.length]);

  
  // Récupérer le secteur depuis l'utilisateur (simuler pour le développement)
  const sector = user ? {
    id: 'sector-1',
    code: 'SEC001',
    name: 'Secteur Centre-Ville'
  } : null;
  
  // Simuler un temps de chargement pour les données des stores
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 seconde de chargement
    
    return () => clearTimeout(timer);
  }, []);
  
  // État de chargement
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement de vos visites</h2>
            <p className="text-gray-600 mb-4">Récupération de votre planning du jour...</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>Synchronisation des données</span>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }





  const completedCount = visits.filter(v => v.status === 'COMPLETED').length;
  const inProgressCount = 0; // visits.filter(v => v.status === 'IN_PROGRESS').length;
  const plannedCount = visits.filter(v => v.status === 'PLANNED').length;

  // Plus besoin de gestion d'erreur car les données sont préchargées

  // Pas de secteur assigné (seulement après le chargement)
  if (!sector && !isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-900 mb-2">Aucun secteur assigné</p>
            <p className="text-base text-gray-600">Contactez votre manager pour vous assigner un secteur.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <VisitsHeader 
        completedCount={completedCount}
        inProgressCount={inProgressCount}
        plannedCount={plannedCount}
      />

      <div className="p-4">
        {/* Informations du secteur */}
        {sector && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-blue-900">Votre secteur</h3>
            </div>
            <p className="text-lg text-blue-800">
              <strong>{sector.name}</strong> ({sector.code})
            </p>
            <p className="text-base text-blue-600 mt-1">
              {visits.length} PDV dans votre route
            </p>
          </div>
        )}


        

        {/* Formulaire d'enregistrement de PDV */}
        {showPDVForm && (
          <PDVFormWizard onClose={() => setShowPDVForm(false)} userRole="REP" />
        )}

        {/* Liste des visites */}
        {!showPDVForm && (
          <div className="space-y-3">
            {visits.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-2xl font-semibold text-gray-900 mb-2">Aucun PDV dans votre secteur</p>
                <p className="text-lg text-gray-600">Contactez votre manager pour ajouter des PDV à votre secteur.</p>
              </div>
            ) : (
              visits.map((visit) => (
                <VisitCard 
                  key={visit.id}
                  visit={visit}
                  onSelect={async (visitId) => {
                    const visit = visits.find(v => v.id === visitId);
                    if (visit) {
                      await handleVisitSelect(visit);
                    }
                  }}
                />
              ))
            )}
          </div>
        )}


        {/* Modale d'initialisation de visite */}
        <VisitInitializationModal 
          isOpen={showInitModal}
          pdvName={initPdvName}
        />
      </div>
    </PageLayout>
  );
}
