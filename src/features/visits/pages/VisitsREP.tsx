import { useState, useEffect } from 'react';
import { PageLayout } from '@/core/ui';
import { Icon } from '@/core/ui/Icon';
import { useToggle } from '@/core/hooks';
import { useAuthStore } from '@/core/auth';
import { visitsService } from '../services/visits.service';
import routesService from '../../routes/services/routesService';
import { useVisitsStore, type VisitData } from '../stores/visitsStore';
import { useRoutesStore } from '../../routes/stores/routesStore';
import { useOutletsStore } from '../../outlets/stores/outletsStore';
import VisitsHeader from '../components/VisitsHeader';
import PDVFormWizard from '../components/PDVFormWizard';
import VisitCard from '../components/VisitCard';
import VisitDetailNew from '../components/VisitDetailNew';
import VisitInitializationModal from '../components/VisitInitializationModal';

export default function VisitsREP() {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  // Hook réutilisable pour le toggle
  const [showPDVForm, , setShowPDVForm] = useToggle(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Utiliser les stores préchargés
  const user = useAuthStore((state) => state.user);
  const { startVisit, getActiveVisit, clearVisit } = useVisitsStore();
  const { todayRoute } = useRoutesStore();
  const { outlets } = useOutletsStore();
  
  // États pour la modale d'initialisation
  const [showInitModal, setShowInitModal] = useState(false);
  const [initPdvName, setInitPdvName] = useState('');







// Fonction pour nettoyer une visite terminée du store
const cleanupCompletedVisit = (outletId: string) => {
  clearVisit(outletId);
  console.log('🧹 Visite terminée nettoyée du store pour outlet:', outletId);
};

const handleVisitSelect = async (visit: any) => {
  let createdVisit: { id: string } | null = null;
  
  try {
    if (visit.status === 'PLANNED') {
      setInitPdvName(visit.pdvName);
      setShowInitModal(true);
      
      console.log('🚀 Démarrage de la visite pour:', visit.pdvName);
      
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
          console.log('⚠️ Impossible de récupérer la position GPS:', error);
        }
      }

      try {
        const newVisit = await visitsService.checkIn(visit.outletId, lat, lng);
        createdVisit = newVisit;
        
        console.log('✅ Visite créée avec check-in:', newVisit);
        
        if (!newVisit || !newVisit.id) {
          throw new Error('Service checkIn n\'a pas retourné de visite valide');
        }
        
      } catch (checkInError) {
        console.error('❌ Erreur lors du check-in:', checkInError);
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
          sequence: visit.sequence,
          routePlanId: todayRoute?.id,
        };
        
        startVisit(visitData);
        console.log('💾 Visite complète stockée dans le store:', visitData);
      }

      // Mettre à jour le statut du routeStop à IN_PROGRESS
      if (todayRoute?.id) {
        await routesService.updateRouteStopStatus(todayRoute.id, visit.outletId, 'IN_PROGRESS');
        console.log('Statut du stop de route mis à jour vers IN_PROGRESS');
      }
      
      // Fermer la modale
      setShowInitModal(false);
    }
    
    // Ouvrir le détail de la visite (après la modale si c'était PLANNED)
    setTimeout(() => {
      // Utiliser l'ID de la vraie visite créée si disponible, sinon l'ID original
      const visitIdToUse = visit.status === 'PLANNED' && createdVisit?.id ? createdVisit.id : visit.id;
      console.log('ID utilisé pour ouvrir le détail:', visitIdToUse);
      console.log('Ancien ID (visit.id):', visit.id);
      console.log('Nouveau ID (createdVisit.id):', createdVisit?.id);
      setSelectedVisit(visitIdToUse);
    }, visit.status === 'PLANNED' ? 1500 : 0);
    
  } catch (error) {
    console.error('Erreur lors du démarrage de la visite:', error);
    setShowInitModal(false);
    alert('Erreur lors du démarrage de la visite. Veuillez réessayer.');
  }
};


  // Construire les visites depuis les données préchargées
  const visits = todayRoute?.routeStops?.map(stop => {
    const outlet = outlets.find(o => o.id === stop.outletId);
    // Mapper les statuts de route vers les statuts de visite
    let visitStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
    switch (stop.status) {
      case 'VISITED':
        visitStatus = 'COMPLETED';
        break;
      case 'PLANNED':
        visitStatus = 'PLANNED';
        break;
      case 'SKIPPED':
        visitStatus = 'SKIPPED';
        break;
      default:
        visitStatus = 'PLANNED';
    }
    
    return {
      id: stop.id,
      pdvName: outlet?.name || 'PDV Inconnu',
      outletId: stop.outletId,
      routeStopId: stop.id,
      status: visitStatus,
      scheduledTime: new Date().toISOString(), // Valeur par défaut
      sequence: 1, // Valeur par défaut
      address: outlet?.address || '',
      checkInTime: undefined,
      checkOutTime: undefined,
    };
  }) || [];
  
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
              <Icon name="calendar" size="sm" variant="grey" />
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
            <p className="text-6xl mb-4">🏬</p>
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
            <h3 className="text-lg font-medium text-blue-900 mb-1">Votre secteur</h3>
            <p className="text-lg text-blue-800">
              <strong>{sector.name}</strong> ({sector.code})
            </p>
            <p className="text-base text-blue-600 mt-1">
              {visits.length} PDV dans votre route
            </p>
          </div>
        )}


        

        {/* Formulaire d'enregistrement de PDV */}
        {showPDVForm && !selectedVisit && (
          <PDVFormWizard onClose={() => setShowPDVForm(false)} userRole="REP" />
        )}

        {/* Liste des visites */}
        {!selectedVisit && !showPDVForm && (
          <div className="space-y-3">
            {visits.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-6xl mb-4">🏪</p>
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

        {/* Détail de visite */}
        {selectedVisit && !showPDVForm && (() => {
          // Chercher d'abord par ID de visite, puis par outletId si c'est un ID de visite créée
          let visit = visits.find(v => v.id === selectedVisit);
          
          // Si pas trouvé, c'est peut-être un ID de vraie visite, chercher par outletId
          if (!visit) {
            // Chercher dans le store Zustand
            visits.forEach(v => {
              const activeVisit = getActiveVisit(v.outletId);
              if (activeVisit?.visitId === selectedVisit) {
                visit = v;
              }
            });
          }
          
          if (!visit) return null;
          
          // Utiliser l'ID sélectionné s'il correspond à une vraie visite, sinon utiliser le mapping du store
          const activeVisit = getActiveVisit(visit.outletId);
          const realVisitId = activeVisit?.visitId === selectedVisit 
            ? selectedVisit 
            : (activeVisit?.visitId || visit.id);
          
          console.log('🔍 [DEBUG VisitsREP] outletId:', visit.outletId);
          console.log('🔍 [DEBUG VisitsREP] activeVisit:', activeVisit);
          console.log('🔍 [DEBUG VisitsREP] realVisitId passé:', realVisitId);
          
          return (
            <VisitDetailNew 
              onBack={() => {
                setSelectedVisit(null);
                // La liste se mettra à jour automatiquement via le hook
              }}
              onVisitCompleted={() => {
                // Nettoyer l'ID de la visite terminée du store
                if (visit) cleanupCompletedVisit(visit.outletId);
                // Recharger les données pour mettre à jour le statut
                // refetch();
              }}
              visitId={realVisitId}
              outletId={visit.outletId}
              pdvName={visit.pdvName}
              address={visit.address || ''}
              status={visit.status as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'}
              routePlanId={todayRoute?.id}
            />
          );
        })()}

        {/* Modale d'initialisation de visite */}
        <VisitInitializationModal 
          isOpen={showInitModal}
          pdvName={initPdvName}
        />
      </div>
    </PageLayout>
  );
}
