import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge } from '@/core/ui';
import { Icon } from '@/core/ui/Icon';
import { visitsService } from '../services/visits.service';
import routesService from '../../routes/services/routesService';
import { useVisitsStore } from '../stores/visitsStore';

interface VisitDetailProps {
  onBack: () => void;
  onVisitCompleted?: () => void;
  visitId: string;
  outletId: string;
  pdvName?: string;
  address?: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  routePlanId?: string; // Pour mettre à jour le statut du routeStop
}

export default function VisitDetailNew({ 
  onBack, 
  onVisitCompleted,
  visitId,
  outletId, 
  pdvName = 'Épicerie Marcory', 
  address = '123 Rue de Marcory, Abidjan', 
  status = 'IN_PROGRESS',
  routePlanId
}: VisitDetailProps) {
  
  // Utiliser le store Zustand au lieu de localStorage
  const { getVenteIds, getMerchIds } = useVisitsStore();
  const [isCreatingVisit, setIsCreatingVisit] = useState(false);
  const [notes, setNotes] = useState('');
  const [hasVente, setHasVente] = useState(false);
  const [ventesCount, setVentesCount] = useState(0);
  const [hasMerchandising, setHasMerchandising] = useState(false);
  const [merchCount, setMerchCount] = useState(0);
  const [merchData] = useState<{
    checklist?: Record<string, unknown>;
    planogram?: Record<string, unknown>;
    score?: number;
    photos?: Array<{
      fileKey: string;
      lat?: number;
      lng?: number;
      meta?: Record<string, unknown>;
    }>;
  } | null>(null);
  const [currentVisitId, setCurrentVisitId] = useState<string | null>(visitId);
  const [lastVisit] = useState('15 Oct 2024');
  const [currentStatus, setCurrentStatus] = useState<'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'>(status || 'IN_PROGRESS');
  const [venteId, setVenteId] = useState<string | null>(null);
  const [merchId, setMerchId] = useState<string | null>(null);



  console.log("visitIdvisitId",visitId)


  // Mettre à jour currentVisitId quand visitId change
  useEffect(() => {
    setCurrentVisitId(visitId);
  }, [visitId]);

  // Récupérer les données sauvegardées du store et utiliser le visitId passé en prop
  useEffect(() => {
    
    // Vérifier s'il y a des ventes (array)
    const venteIds = getVenteIds(outletId);
    if (venteIds.length > 0) {
      // Prendre la dernière vente ajoutée
      setVenteId(venteIds[venteIds.length - 1]);
      setHasVente(true);
      setVentesCount(venteIds.length);
    } else {
      setHasVente(false);
      setVentesCount(0);
    }
    
    // Vérifier s'il y a des merchandising (array)
    const merchIds = getMerchIds(outletId);
    if (merchIds.length > 0) {
      // Prendre le dernier merchandising ajouté
      setMerchId(merchIds[merchIds.length - 1]);
      setHasMerchandising(true);
      setMerchCount(merchIds.length);
    } else {
      setHasMerchandising(false);
      setMerchCount(0);
    }
    
    // Utiliser le visitId qui a été créé avant d'arriver ici
    if (visitId) {
      setCurrentVisitId(visitId);
      setCurrentStatus('IN_PROGRESS');
    }
  }, [visitId, outletId, getVenteIds, getMerchIds]);

  // Générer l'URL pour créer une vente
  const getVenteUrl = () => {
    const realVisitId = currentVisitId;
    
    // DEBUG: Vérifier l'état du store
    const storeState = useVisitsStore.getState();
    const allVisits = storeState.activeVisits;
    const visitInStore = Object.values(allVisits).find(v => v.visitId === realVisitId);
    
    console.log('🛒 [getVenteUrl] DEBUG:', {
      currentVisitId: realVisitId,
      outletId,
      toutesLesVisites: Object.keys(allVisits),
      visitesAvecIds: Object.values(allVisits).map(v => ({ outletId: v.outletId, visitId: v.visitId })),
      visiteCorrespondante: visitInStore ? 'TROUVÉE' : 'NON TROUVÉE'
    });
    
    if (realVisitId) {
      return `/dashboard/orders/create?outletId=${outletId}&visitId=${realVisitId}&fromVisit=true`;
    } else {
      return `/dashboard/orders/create?outletId=${outletId}&fromVisit=true`;
    }
  };

  // Générer l'URL pour créer un merchandising
  const getMerchandisingUrl = () => {
    const realVisitId = currentVisitId;
    console.log('Génération URL merchandising avec visitId:', realVisitId || 'sans visite');
    
    if (realVisitId) {
      return `/dashboard/merchandising?outletId=${outletId}&visitId=${realVisitId}&fromVisit=true&pdvName=${encodeURIComponent(pdvName || '')}`;
    } else {
      return `/dashboard/merchandising?outletId=${outletId}&fromVisit=true&pdvName=${encodeURIComponent(pdvName || '')}`;
    }
  };


  // Fonction pour terminer la visite et créer tout en une fois
  const handleTerminerVisite = async () => {
    if (!confirm('Êtes-vous sûr de vouloir terminer cette visite ?')) {
      return;
    }

    try {
      setIsCreatingVisit(true);

      // Récupérer les coordonnées GPS si disponibles
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

      // Si une vraie visite existe déjà (avec visitId), la compléter
      if (currentVisitId) {
        console.log(' [DEBUG] visitId prop:', visitId);
        console.log(' [DEBUG] currentVisitId state:', currentVisitId);
        
        // Vérifier d'abord si la visite existe
        const visitExists = await visitsService.checkVisitExists(currentVisitId);
        console.log(' [DEBUG] Visite existe?', visitExists);
        
        if (!visitExists) {
          console.warn(' Visite introuvable, nettoyage du store et création d\'une nouvelle visite');
          // Nettoyer le store et créer une nouvelle visite
          if (onVisitCompleted) {
            onVisitCompleted();
          }
          // Continuer vers la création d'une nouvelle visite
        } else {
          const completeData = {
            visitId: currentVisitId,
            checkoutLat: lat,
            checkoutLng: lng,
            notes,
            orderId: venteId || undefined,
            merchId: merchId || undefined,
          };
          
          console.log(' [VisitDetailNew] Completion de la visite:', completeData);
          await visitsService.completeVisit(completeData);

          // Mettre à jour le statut du routeStop à VISITED
          if (routePlanId) {
            try {
              await routesService.updateRouteStopStatus(routePlanId, outletId, 'VISITED');
              console.log(' [VisitDetailNew] Statut du stop de route mis à jour vers VISITED');
            } catch (error) {
              console.error(' [VisitDetailNew] Erreur lors de la mise à jour du statut:', error);
              // Ne pas faire échouer toute l'opération pour cette erreur
            }
          }

          // Les données sont automatiquement nettoyées par le store lors de onVisitCompleted
          
          // Message de succès et retour
          let successMessage = 'Visite terminée et enregistrée avec succès!';
          if (hasVente && hasMerchandising) {
            successMessage += '\n Vente enregistrée\n Merchandising enregistré';
          } else if (hasVente) {
            successMessage += '\n Vente enregistrée';
          } else if (hasMerchandising) {
            successMessage += '\n Merchandising enregistré';
          }
          
          alert(successMessage);
          
          // Notifier que la visite est terminée pour nettoyer le store
          if (onVisitCompleted) {
            onVisitCompleted();
          }
          
          onBack();
          return; // Sortir de la fonction
        }
      }

      // Créer une visite complète (si pas de visite existante ou si elle n'existe plus)
      const visitData = {
        outletId,
        checkinLat: lat,
        checkinLng: lng,
        notes,
        score: undefined,
        merchCheck: hasMerchandising ? merchData : undefined,
        orderId: venteId || undefined,
      };
      
      console.log(' [VisitDetailNew] Envoi des données de visite:', visitData);
      const visit = await visitsService.createCompleteVisit(visitData);
      
      console.log(' [VisitDetailNew] Visite créée avec succès:', visit);
      
      // Vérifier que la visite a bien été créée
      if (!visit || !visit.id) {
        console.error(' [VisitDetailNew] Visite invalide retournée par l\'API:', visit);
        throw new Error('La visite n\'a pas pu être créée correctement');
      }
      
      setCurrentVisitId(visit.id);

      // Mettre à jour le statut du routeStop à VISITED
      if (routePlanId) {
        try {
          await routesService.updateRouteStopStatus(routePlanId, outletId, 'VISITED');
          console.log(' [VisitDetailNew] Statut du stop de route mis à jour vers VISITED');
        } catch (error) {
          console.error(' [VisitDetailNew] Erreur lors de la mise à jour du statut:', error);
          // Ne pas faire échouer toute l'opération pour cette erreur
        }
      } else {
        console.warn(' [VisitDetailNew] Pas de routePlanId fourni, impossible de mettre à jour le statut');
      }

      // Message de succès avec détails
      let successMessage = 'Visite terminée et enregistrée avec succès!';
      if (hasVente && hasMerchandising) {
        successMessage += '\n Vente enregistrée\n Merchandising enregistré';
      } else if (hasVente) {
        successMessage += '\n Vente enregistrée';
      } else if (hasMerchandising) {
        successMessage += '\n Merchandising enregistré';
      }
      
      alert(successMessage);
      
      // Notifier que la visite est terminée pour nettoyer le store
      if (onVisitCompleted) {
        onVisitCompleted();
      }
      
      onBack();
    } catch (error) {
      console.error('Erreur lors de la création de la visite:', error);
      alert('Erreur lors de l\'enregistrement de la visite. Veuillez réessayer.');
    } finally {
      setIsCreatingVisit(false);
    }
  };

  return (
    <div>
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-primary mb-4 text-lg"
      >
        <Icon name="arrowLeft" size="sm" /> Retour à la liste
      </button>

      {/* Informations du PDV */}
      <Card className="p-6 mb-4 bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{pdvName}</h2>
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <Icon name="locationMarker" size="sm" className="mr-3" />
            <span className="text-lg">{address}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Icon name="calendar" size="sm" className="mr-3" />
            <span className="text-lg">Dernière visite : {lastVisit}</span>
          </div>
          <div className="flex items-center">
            <Icon name="flag" size="sm" className="mr-3" />
            <Badge variant={currentStatus === 'COMPLETED' ? 'success' : currentStatus === 'IN_PROGRESS' ? 'warning' : 'secondary'}>
              {currentStatus === 'COMPLETED' ? 'Terminée' : currentStatus === 'IN_PROGRESS' ? 'En cours' : 'Planifiée'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Actions principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Vente */}
        <Card className={`p-4 transition-all duration-300 ${hasVente ? 'border-2 border-emerald-500 bg-emerald-50' : 'border border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="cart" size="md" variant={hasVente ? "green" : "primary"} />
              Ventes
            </h3>
            {hasVente && (
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-base px-3 py-1">
                  <Icon name="checkCircle" size="sm" className="mr-1" />
                  {ventesCount}
                </Badge>
              </div>
            )}
          </div>

          {/* Liste des ventes si existantes */}
          {hasVente && (
            <div className="mb-3 space-y-2">
              {getVenteIds(outletId).map((venteId, index) => (
                <div 
                  key={venteId}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-emerald-200 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-700 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Vente #{index + 1}</p>
                      <p className="text-xs text-gray-500">ID: {venteId.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <Icon name="checkCircle" size="sm" variant="green" />
                </div>
              ))}
            </div>
          )}

          {/* Bouton d'ajout */}
          <Link 
            to={getVenteUrl()}
            className={`inline-flex items-center justify-center w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              hasVente 
                ? "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white" 
                : "bg-sky-600 hover:bg-sky-700 text-white"
            }`}
          >
            <Icon name="plus" size="sm" className="mr-2" />
            {hasVente ? `Ajouter la vente #${ventesCount + 1}` : "🛒 Créer ma première vente"}
          </Link>
          
          {/* Message informatif */}
          <div className={`mt-3 p-2 rounded-lg ${hasVente ? 'bg-emerald-100' : 'bg-blue-50'}`}>
            <p className="text-xs text-center font-medium">
              {hasVente ? (
                <>
                  <span className="text-emerald-700">✨ {ventesCount} vente{ventesCount > 1 ? 's' : ''} enregistrée{ventesCount > 1 ? 's' : ''}</span>
                  <br />
                  <span className="text-gray-600">Continuez à vendre !</span>
                </>
              ) : (
                <span className="text-blue-700">
                  {!currentVisitId 
                    ? "La vente sera liée à la visite lors de la finalisation" 
                    : "Commencez par enregistrer votre première vente"}
                </span>
              )}
            </p>
          </div>
        </Card>

        {/* Merchandising */}
        <Card className={`p-4 transition-all duration-300 ${hasMerchandising ? 'border-2 border-purple-500 bg-purple-50' : 'border border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="camera" size="md" variant={hasMerchandising ? "primary" : "primary"} />
              Merchandising
            </h3>
            {hasMerchandising && (
              <div className="flex items-center gap-2">
                <Badge variant="warning" className="text-base px-3 py-1 bg-purple-600 text-white">
                  <Icon name="checkCircle" size="sm" className="mr-1" />
                  {merchCount}
                </Badge>
              </div>
            )}
          </div>

          {/* Liste des merchandising si existants */}
          {hasMerchandising && (
            <div className="mb-3 space-y-2">
              {getMerchIds(outletId).map((merchId, index) => (
                <div 
                  key={merchId}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-700 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Merchandising #{index + 1}</p>
                      <p className="text-xs text-gray-500">ID: {merchId.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <Icon name="camera" size="sm" variant="primary" />
                </div>
              ))}
            </div>
          )}

          {/* Bouton d'ajout */}
          <Link 
            to={getMerchandisingUrl()}
            className={`inline-flex items-center justify-center w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              hasMerchandising 
                ? "border-2 border-purple-600 text-purple-700 hover:bg-purple-600 hover:text-white" 
                : "bg-sky-600 hover:bg-sky-700 text-white"
            }`}
          >
            <Icon name="plus" size="sm" className="mr-2" />
            {hasMerchandising ? `Ajouter le merchandising #${merchCount + 1}` : "📸 Faire mon premier merchandising"}
          </Link>
          
          {/* Message informatif */}
          <div className={`mt-3 p-2 rounded-lg ${hasMerchandising ? 'bg-purple-100' : 'bg-blue-50'}`}>
            <p className="text-xs text-center font-medium">
              {hasMerchandising ? (
                <>
                  <span className="text-purple-700">✨ {merchCount} merchandising enregistré{merchCount > 1 ? 's' : ''}</span>
                  <br />
                  <span className="text-gray-600">Continuez le bon travail !</span>
                </>
              ) : (
                <span className="text-blue-700">
                  {!currentVisitId 
                    ? "Le merchandising sera lié à la visite lors de la finalisation" 
                    : "Prenez des photos et remplissez la checklist"}
                </span>
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Notes */}
      <Card className="p-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="note" size="md" variant="primary" />
          Notes sur la visite
        </h3>
        <textarea 
          className="w-full border border-gray-300 rounded-lg p-3 text-lg"
          rows={4}
          placeholder="Ajouter des notes sur cette visite..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Card>

      {/* Résumé des actions effectuées */}
      {(hasVente || hasMerchandising) && (
        <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Actions effectuées durant cette visite
          </h3>
          <div className="space-y-2">
            {hasVente && (
              <div className="flex items-center gap-2 text-blue-800">
                <Icon name="checkCircle" size="sm" variant="green" />
                <span>Vente enregistrée</span>
              </div>
            )}
            {hasMerchandising && (
              <div className="flex items-center gap-2 text-blue-800">
                <Icon name="checkCircle" size="sm" variant="green" />
                <span>Merchandising effectué</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Bouton TERMINER */}
      <Button 
        variant="success" 
        size="lg" 
        fullWidth
        disabled={isCreatingVisit}
        onClick={handleTerminerVisite}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {isCreatingVisit ? (
          <>
            <Icon name="refresh" size="md" className="mr-2 animate-spin" />
            Enregistrement de la visite...
          </>
        ) : (
          <>
            <Icon name="checkCircle" size="md" className="mr-2" />
            TERMINER LA VISITE
          </>
        )}
      </Button>
      
      {!hasVente && !hasMerchandising && (
        <p className="text-sm text-gray-500 text-center mt-2">
          La visite sera enregistrée même si aucune action n'a été effectuée
        </p>
      )}
    </div>
  );
}
