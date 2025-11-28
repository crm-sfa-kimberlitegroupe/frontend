import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/core/ui';
import { useToggle } from '@/core/hooks';
import { useAuthStore } from '@/core/auth';
import { visitsService } from '../services/visits.service';
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
  const { startVisit, findVisitByPdvName, getAllActiveVisits } = useVisitsStore();
  const { todayRoute, updateRouteStopStatusLocally } = useRoutesStore();


  // Logs uniquement si todayRoute change
  useEffect(() => {
    console.log("VisitsREP - todayRoute:", todayRoute);
    console.log("VisitsREP - routeStops:", todayRoute?.routeStops?.map(s => ({
      id: s.id,
      outletId: s.outletId,
      status: s.status,
      outletName: s.outlet?.name
    })));
  }, [todayRoute]);

  
  // États pour la modale d'initialisation
  const [showInitModal, setShowInitModal] = useState(false);
  const [initPdvName, setInitPdvName] = useState('');




const handleVisitSelect = async (visit: { id: string; pdvName: string; outletId: string; address?: string; status: string; scheduledTime?: string; sequence?: number }) => {
  let createdVisit: { id: string } | null = null;
  
  try {
    // Vérifier si une visite est déjà en cours pour éviter les doublons
    if (visit.status === 'IN_PROGRESS') {
      console.log('Visite déjà en cours pour:', visit.pdvName);
      
      // 🎯 RECHERCHER DANS LE STORE PAR NOM DE PDV
      console.log('🔍 Recherche dans le store pour:', visit.pdvName);
      console.log('📊 Toutes les visites actives dans le store:', getAllActiveVisits());
      
      const activeVisitFromStore = findVisitByPdvName(visit.pdvName);
      
      if (activeVisitFromStore) {
        
        console.log('✅ Visite trouvée dans le store:', activeVisitFromStore);
        console.log('✅ Visite trouvée dans le store:', activeVisitFromStore);
        console.log('✅ Visite trouvée dans le store:', activeVisitFromStore);
        console.log('✅ Visite trouvée dans le store:', activeVisitFromStore);
        console.log('✅ Visite trouvée dans le store:', activeVisitFromStore);
        console.log('✅ Visite trouvée dans le store:', activeVisitFromStore);
        console.log('✅ Visite trouvée dans le store:', activeVisitFromStore);
        console.log('✅ Visite trouvée dans le store:', activeVisitFromStore);
        console.log('✅ Visite trouvée dans le store:', activeVisitFromStore);
        console.log('✅ Visite trouvée dans le store:', activeVisitFromStore);

        
        // Utiliser les données du store (plus fiables)
        const params = new URLSearchParams({
          visitId: activeVisitFromStore.visitId,
          outletId: activeVisitFromStore.outletId,
          pdvName: encodeURIComponent(activeVisitFromStore.pdvName),
          address: encodeURIComponent(activeVisitFromStore.address || ''),
          status: activeVisitFromStore.status || '',
          routePlanId: activeVisitFromStore.routePlanId || todayRoute?.id || ''
        });
        
        // Utiliser le VRAI visitId du store
        navigate(`/dashboard/visits/detail/${activeVisitFromStore.visitId}?${params.toString()}`);
        return;
      } else {
        console.warn('⚠️ Visite EN_PROGRESS mais pas trouvée dans le store. Utilisation des données de route.');
        
        // Fallback : utiliser les données de la route
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
    
    if (visit.status === 'PLANNED') {
      setInitPdvName(visit.pdvName);
      setShowInitModal(true);
      
      console.log('Démarrage de la visite pour:', visit.pdvName);
      
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
        } catch (error) {
          console.log('Impossible de récupérer la position GPS:', error);
        }
      }

      try {
        const newVisit = await visitsService.checkIn(visit.outletId, lat, lng);
        createdVisit = newVisit;
        
        console.log('Visite créée avec check-in:', newVisit);
        
        if (!newVisit || !newVisit.id) {
          throw new Error('Service checkIn n\'a pas retourné de visite valide');
        }
        
      } catch (checkInError) {
        console.error('Erreur lors du check-in:', checkInError);
        throw checkInError;
      }

      if (createdVisit?.id) {
        const visitData: VisitData = {
          outletId: visit.outletId,
          visitId: createdVisit.id,
          routeStopId: visit.id,
          pdvName: visit.pdvName,
          address: visit.address,
          scheduledTime: visit.scheduledTime,
          sequence: visit.sequence || 0,
          routePlanId: todayRoute?.id,
        };
        
        startVisit(visitData);
        console.log('Visite complète stockée dans le store:', visitData);
      }

      // Mettre à jour le statut du routeStop à IN_PROGRESS
      if (todayRoute?.id) {
        console.log('Mise à jour du statut:', {
          routePlanId: todayRoute.id,
          outletId: visit.outletId,
          newStatus: 'IN_PROGRESS'
        });
        
        await routesService.updateRouteStopStatus(todayRoute.id, visit.outletId, 'IN_PROGRESS');
        console.log('Statut du stop de route mis à jour vers IN_PROGRESS');
        
        // Mettre à jour le store localement immédiatement
        updateRouteStopStatusLocally(visit.outletId, 'IN_PROGRESS');
        console.log('Store local mis à jour immédiatement');
      }
      
      // Fermer la modale
      setShowInitModal(false);
    }
    
    // Naviguer vers la page de détail de la visite (après la modale si c'était PLANNED)
    setTimeout(() => {
      // Utiliser l'ID de la vraie visite créée si disponible, sinon l'ID original
      const visitIdToUse = visit.status === 'PLANNED' && createdVisit?.id ? createdVisit.id : visit.id;
      console.log('ID utilisé pour ouvrir le détail:', visitIdToUse);
      console.log('Ancien ID (visit.id):', visit.id);
      console.log('Nouveau ID (createdVisit.id):', createdVisit?.id);
      
      // Navigation vers la page de détail avec tous les paramètres nécessaires
      const params = new URLSearchParams({
        outletId: visit.outletId,
        pdvName: encodeURIComponent(visit.pdvName),
        address: encodeURIComponent(visit.address || ''),
        status: visit.status === 'PLANNED' ? 'IN_PROGRESS' : visit.status,
        routePlanId: todayRoute?.id || ''
      });
      
      navigate(`/dashboard/visits/detail/${visitIdToUse}?${params.toString()}`);
    }, visit.status === 'PLANNED' ? 1500 : 0);
    
  } catch (error) {
    console.error('Erreur lors du démarrage de la visite:', error);
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
