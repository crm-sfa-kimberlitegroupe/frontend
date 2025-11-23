import { useState, useEffect } from 'react';
import { Button, PageLayout } from '@/core/ui';
import { Icon } from '@/core/ui/Icon';
import { useToggle } from '@/core/hooks';
import { useRouteVisits } from '../hooks/useRouteVisits';
import { visitsService } from '../services/visits.service';
import routesService from '../../routes/services/routesService';
import VisitsHeader from '../components/VisitsHeader';
import PDVFormWizard from '../components/PDVFormWizard';
import VisitCard from '../components/VisitCard';
import VisitDetailNew from '../components/VisitDetailNew';
import VisitInitializationModal from '../components/VisitInitializationModal';

export default function VisitsREP() {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  // Hook réutilisable pour le toggle
  const [showPDVForm, , setShowPDVForm] = useToggle(false);
  // Stocker les IDs des vraies visites créées (outletId -> realVisitId)
  const [createdVisits, setCreatedVisits] = useState<Record<string, string>>(() => {
    // Charger depuis localStorage au démarrage
    try {
      const saved = localStorage.getItem('createdVisits');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  // États pour la modale d'initialisation
  const [showInitModal, setShowInitModal] = useState(false);
  const [initPdvName, setInitPdvName] = useState('');







// Fonction pour nettoyer une visite terminée du localStorage
const cleanupCompletedVisit = (outletId: string) => {
  const newCreatedVisits = { ...createdVisits };
  delete newCreatedVisits[outletId];
  setCreatedVisits(newCreatedVisits);
  localStorage.setItem('createdVisits', JSON.stringify(newCreatedVisits));
  console.log('🧹 Visite terminée nettoyée du localStorage pour outlet:', outletId);
};

const handleVisitSelect = async (visit: typeof visits[0]) => {
  let createdVisit: { id: string } | null = null; // Déclarer la variable pour la visite créée
  
  try {
    // Si la visite est PLANNED, créer une visite avec check-in ET mettre à jour le routeStop
    if (visit.status === 'PLANNED') {
      // Afficher la modale d'initialisation
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

      // Créer la visite avec check-in
      console.log('📤 Envoi check-in pour outletId:', visit.outletId, 'lat:', lat, 'lng:', lng);
      
      try {
        const newVisit = await visitsService.checkIn(visit.outletId, lat, lng);
        createdVisit = newVisit; // Assigner à la variable externe
        
        console.log('📥 Réponse complète du check-in:', newVisit);
        console.log('📥 Type de la réponse:', typeof newVisit);
        console.log('📥 Clés de l\'objet:', newVisit ? Object.keys(newVisit) : 'null');
        console.log('✅ Visite créée avec check-in:', newVisit);
        console.log('🆔 ID de la nouvelle visite créée:', newVisit?.id);
        
        if (!newVisit || !newVisit.id) {
          throw new Error('Service checkIn n\'a pas retourné de visite valide');
        }
        
      } catch (checkInError) {
        console.error('❌ Erreur lors du check-in:', checkInError);
        throw checkInError; // Re-lancer l'erreur pour qu'elle soit gérée par le catch principal
      }

      // Stocker l'ID de la vraie visite créée
      if (createdVisit?.id) {
        const newCreatedVisits = {
          ...createdVisits,
          [visit.outletId]: createdVisit.id
        };
        setCreatedVisits(newCreatedVisits);
        
        // Persister dans localStorage
        localStorage.setItem('createdVisits', JSON.stringify(newCreatedVisits));
        
        console.log('💾 ID de la vraie visite stocké:', createdVisit.id, 'pour outlet:', visit.outletId);
      }

      // Mettre à jour le statut du routeStop à IN_PROGRESS
      if (routePlan?.id) {
        await routesService.updateRouteStopStatus(routePlan.id, visit.outletId, 'IN_PROGRESS');
        console.log('✅ Statut du stop de route mis à jour vers IN_PROGRESS');
      }
      
      // Recharger les données
      await refetch();
      
      // Fermer la modale
      setShowInitModal(false);
    }
    
    // Ouvrir le détail de la visite (après la modale si c'était PLANNED)
    setTimeout(() => {
      // Utiliser l'ID de la vraie visite créée si disponible, sinon l'ID original
      const visitIdToUse = visit.status === 'PLANNED' && createdVisit?.id ? createdVisit.id : visit.id;
      console.log('🎯 ID utilisé pour ouvrir le détail:', visitIdToUse);
      console.log('🎯 Ancien ID (visit.id):', visit.id);
      console.log('🎯 Nouveau ID (createdVisit.id):', createdVisit?.id);
      setSelectedVisit(visitIdToUse);
    }, visit.status === 'PLANNED' ? 1500 : 0);
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage de la visite:', error);
    setShowInitModal(false);
    alert('Erreur lors du démarrage de la visite. Veuillez réessayer.');
  }
};


  
  // Récupérer les visites depuis la route planifiée
  const { visits, sector, loading, error, refetch, routePlan } = useRouteVisits();

  // Nettoyer automatiquement les visites terminées du localStorage
  useEffect(() => {
    if (visits.length > 0) {
      const currentCreatedVisits = { ...createdVisits };
      let hasChanges = false;

      // Vérifier chaque visite stockée
      Object.keys(currentCreatedVisits).forEach(outletId => {
        const visit = visits.find(v => v.outletId === outletId);
        // Si la visite est terminée, la supprimer du localStorage
        if (visit && visit.status === 'COMPLETED') {
          delete currentCreatedVisits[outletId];
          hasChanges = true;
          console.log('🧹 Auto-nettoyage: visite terminée supprimée du localStorage pour outlet:', outletId);
        }
      });

      // Mettre à jour si des changements ont été faits
      if (hasChanges) {
        setCreatedVisits(currentCreatedVisits);
        localStorage.setItem('createdVisits', JSON.stringify(currentCreatedVisits));
      }
    }
  }, [visits, createdVisits]);


  console.log("visits",visits);
  console.log("visits",visits);
  console.log("visits",visits);
  console.log("visits",visits);
  console.log("visits",visits);
  console.log("visits",visits);



  const completedCount = visits.filter(v => v.status === 'COMPLETED').length;
  const inProgressCount = visits.filter(v => v.status === 'IN_PROGRESS').length;
  const plannedCount = visits.filter(v => v.status === 'PLANNED').length;

  // État de chargement
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Chargement de vos PDV...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // État d'erreur avec debug
  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-2xl">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            
            
            <Button 
              onClick={() => window.location.reload()} 
              variant="primary"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Pas de secteur assigné
  if (!sector) {
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

        {/* Bouton d'ajout de PDV */}
        {!selectedVisit && !showPDVForm && (
          <div className="mb-4">
            <Button 
              variant="primary" 
              size="md"
              onClick={() => setShowPDVForm(true)}
              fullWidth
            >
              <Icon name="plus" size="sm" className="mr-2" />
              Nouveau PDV
            </Button>
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
            // Chercher l'outletId correspondant à cet ID de visite
            const outletId = Object.keys(createdVisits).find(key => createdVisits[key] === selectedVisit);
            if (outletId) {
              visit = visits.find(v => v.outletId === outletId);
            }
          }
          
          if (!visit) return null;
          
          // Utiliser l'ID sélectionné s'il correspond à une vraie visite, sinon utiliser le mapping
          const realVisitId = Object.values(createdVisits).includes(selectedVisit) 
            ? selectedVisit 
            : (createdVisits[visit.outletId] || visit.id);
          
          console.log('🔍 [DEBUG VisitsREP] outletId:', visit.outletId);
          console.log('🔍 [DEBUG VisitsREP] createdVisits:', createdVisits);
          console.log('🔍 [DEBUG VisitsREP] realVisitId passé:', realVisitId);
          
          return (
            <VisitDetailNew 
              onBack={() => {
                setSelectedVisit(null);
                // La liste se mettra à jour automatiquement via le hook
              }}
              onVisitCompleted={() => {
                // Nettoyer l'ID de la visite terminée du localStorage
                cleanupCompletedVisit(visit.outletId);
                // Recharger les données pour mettre à jour le statut
                refetch();
              }}
              visitId={realVisitId}
              outletId={visit.outletId}
              pdvName={visit.pdvName}
              address={visit.address || ''}
              status={visit.status as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'}
              routePlanId={routePlan?.id}
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
