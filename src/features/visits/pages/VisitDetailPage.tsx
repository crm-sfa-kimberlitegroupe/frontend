import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/core/ui';
import VisitDetailNew from '../components/VisitDetailNew';
import { useVisitsStore } from '../stores/visitsStore';
import { useRoutesStore } from '../../routes/stores/routesStore';

export default function VisitDetailPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Récupérer les paramètres depuis l'URL
  const outletId = searchParams.get('outletId') || '';
  const pdvName = searchParams.get('pdvName') || 'PDV';
  const address = searchParams.get('address') || '';
  const status = (searchParams.get('status') as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED') || 'IN_PROGRESS';
  const routePlanId = searchParams.get('routePlanId') || '';
  
  const { clearVisit } = useVisitsStore();
  const { todayRoute } = useRoutesStore();

  // Si pas de visitId ou outletId, rediriger vers la liste
  if (!visitId || !outletId) {
    navigate('/dashboard/visits');
    return null;
  }

  const handleBack = () => {
    navigate('/dashboard/visits');
  };

  const handleVisitCompleted = () => {
    // Nettoyer l'ID de la visite terminée du store
    clearVisit(outletId);
    console.log('Visite terminée nettoyée du store pour outlet:', outletId);
  };

  return (
    <PageLayout>
      <div className="p-4">
        <VisitDetailNew 
          onBack={handleBack}
          onVisitCompleted={handleVisitCompleted}
          visitId={visitId}
          outletId={outletId}
          pdvName={decodeURIComponent(pdvName)}
          address={decodeURIComponent(address)}
          status={status}
          routePlanId={routePlanId || todayRoute?.id}
        />
      </div>
    </PageLayout>
  );
}
