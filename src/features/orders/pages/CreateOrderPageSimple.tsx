import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/core/ui';
import Button from '../../../core/ui/Button';

export const CreateOrderPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const outletId = searchParams.get('outletId');
  const visitId = searchParams.get('visitId');

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Header */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🛒 Nouvelle Vente
          </h1>
          <p className="text-sm text-gray-600">
            Enregistrer une vente sur le terrain
          </p>
        </div>

        {/* Info PDV sélectionné */}
        {outletId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-blue-900">
              📍 PDV sélectionné
            </p>
            <p className="text-xs text-blue-700 mt-1">
              ID: {outletId}
            </p>
            {visitId && (
              <p className="text-xs text-blue-700">
                Visite ID: {visitId}
              </p>
            )}
          </div>
        )}

        {/* Message temporaire */}
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Page en construction
          </h2>
          <p className="text-gray-600 mb-6">
            La fonctionnalité d'enregistrement de vente est en cours de développement.
          </p>
          
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-gray-900 mb-2">
                ✅ Navigation fonctionnelle
              </p>
              <p className="text-xs text-gray-600">
                Vous pouvez maintenant accéder à cette page depuis les visites
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-gray-900 mb-2">
                🔄 Prochaines étapes
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Formulaire de sélection de produits</li>
                <li>• Gestion du panier</li>
                <li>• Calcul des totaux</li>
                <li>• Enregistrement de la vente</li>
              </ul>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/dashboard/visits')}
            className="mt-6 w-full"
          >
            ← Retour aux visites
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};
