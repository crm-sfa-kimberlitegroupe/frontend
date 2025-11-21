import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import { visitsService } from '../services/visits.service';
import routesService from '../../routes/services/routesService';

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
  const navigate = useNavigate();
  const [isCreatingVisit, setIsCreatingVisit] = useState(false);
  const [notes, setNotes] = useState('');
  const [hasVente, setHasVente] = useState(false);
  const [hasMerchandising, setHasMerchandising] = useState(false);
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

  // Mettre à jour currentVisitId quand visitId change
  useEffect(() => {
    setCurrentVisitId(visitId);
  }, [visitId]);

  // Récupérer les données sauvegardées et utiliser le visitId passé en prop
  useEffect(() => {
    // Récupérer simplement les IDs sauvegardés
    const savedVenteId = localStorage.getItem(`visit_${visitId}_venteId`);
    const savedMerchId = localStorage.getItem(`visit_${visitId}_merchId`);
    
    if (savedVenteId) {
      setVenteId(savedVenteId);
      setHasVente(true);
    }
    if (savedMerchId) {
      setMerchId(savedMerchId);
      setHasMerchandising(true);
    }
    
    // Utiliser le visitId qui a été créé avant d'arriver ici
    if (visitId) {
      setCurrentVisitId(visitId);
      setCurrentStatus('IN_PROGRESS');
    }
  }, [visitId]);

  // Fonction pour créer une vente
  const handleCreateVente = () => {
    // Utiliser currentVisitId si disponible, sinon créer sans visitId
    const realVisitId = currentVisitId;
    console.log('🛒 Navigation vers création vente avec visitId:', realVisitId || 'sans visite');
    
    if (realVisitId) {
      navigate(`/dashboard/orders/create?outletId=${outletId}&visitId=${realVisitId}&fromVisit=true`);
    } else {
      // Créer vente sans visitId - sera associée plus tard lors de la completion
      navigate(`/dashboard/orders/create?outletId=${outletId}&fromVisit=true`);
    }
  };

  // Fonction pour créer un merchandising
  const handleCreateMerchandising = () => {
    // Utiliser currentVisitId si disponible, sinon créer sans visitId
    const realVisitId = currentVisitId;
    console.log(' Navigation vers merchandising avec visitId:', realVisitId || 'sans visite');
    
    if (realVisitId) {
      navigate(`/dashboard/merchandising?outletId=${outletId}&visitId=${realVisitId}&fromVisit=true&pdvName=${encodeURIComponent(pdvName || '')}`);
    } else {
      // Créer merchandising sans visitId - sera associé plus tard lors de la completion
      navigate(`/dashboard/merchandising?outletId=${outletId}&fromVisit=true&pdvName=${encodeURIComponent(pdvName || '')}`);
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
          console.warn(' Visite introuvable, nettoyage du localStorage et création d\'une nouvelle visite');
          // Nettoyer le localStorage et créer une nouvelle visite
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

          // Nettoyer localStorage
          localStorage.removeItem(`visit_${visitId}_venteId`);
          localStorage.removeItem(`visit_${visitId}_merchId`);
          
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
          
          // Notifier que la visite est terminée pour nettoyer le localStorage
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
      
      // Notifier que la visite est terminée pour nettoyer le localStorage
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
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="cart" size="md" variant="primary" />
              Vente
            </h3>
            {hasVente && (
              <Badge variant="success">
                <Icon name="checkCircle" size="xs" className="mr-1" />
                Effectuée
              </Badge>
            )}
          </div>
          <Button 
            variant={hasVente ? "success" : "primary"}
            size="md" 
            fullWidth
            onClick={handleCreateVente}
            disabled={hasVente}
            className={hasVente ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-sky-600 hover:bg-sky-700"}
          >
            <Icon name={hasVente ? "checkCircle" : "cart"} size="sm" className="mr-2" />
            {hasVente ? " Vente enregistrée" : "Enregistrer une vente"}
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            {hasVente ? " La vente a été enregistrée avec succès pour cette visite" : 
             !currentVisitId ? "Vous pouvez créer une vente - elle sera liée à la visite lors de la finalisation" :
             "Créez une nouvelle vente pour ce point de vente"}
          </p>
        </Card>

        {/* Merchandising */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="camera" size="md" variant="primary" />
              Merchandising
            </h3>
            {hasMerchandising && (
              <Badge variant="success">
                <Icon name="checkCircle" size="xs" className="mr-1" />
                Effectué
              </Badge>
            )}
          </div>
          <Button 
            variant={hasMerchandising ? "outline" : "primary"}
            size="md" 
            fullWidth
            onClick={handleCreateMerchandising}
            disabled={hasMerchandising}
            className={hasMerchandising ? "" : "bg-sky-600 hover:bg-sky-700"}
          >
            <Icon name="camera" size="sm" className="mr-2" />
            {hasMerchandising ? "Merchandising enregistré" : "Enregistrer merchandising"}
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            {hasMerchandising ? "Le merchandising a été effectué" :
             !currentVisitId ? "Vous pouvez faire le merchandising - il sera lié à la visite lors de la finalisation" :
             "Prenez des photos et remplissez la checklist"}
          </p>
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
