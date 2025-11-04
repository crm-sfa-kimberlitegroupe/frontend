import { useState } from 'react';
import { Button, PageLayout } from '@/core/ui';
import { useToggle } from '@/core/hooks';
import type { Visit } from '../types/pdv.types';
import { useVendorOutlets } from '../hooks/useVendorOutlets';
import VisitsHeader from '../components/VisitsHeader';
import ActiveVisitCTA from '../components/ActiveVisitCTA';
import PDVFormWizard from '../components/PDVFormWizard';
import VisitCard from '../components/VisitCard';
import VisitDetail from '../components/VisitDetail';

export default function VisitsREP() {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  // ✅ Hook réutilisable pour le toggle
  const [showPDVForm, , setShowPDVForm] = useToggle(false);
  
  // 🏪 Récupérer les PDV du vendeur connecté
  const { outlets, sector, loading, error } = useVendorOutlets();

  // 📝 Convertir les PDV en visites (pour l'instant, toutes planifiées)
  // TODO: Intégrer avec un vrai système de planification de visites
  const visits: Visit[] = outlets.map((outlet, index) => ({
    id: outlet.id,
    pdvName: outlet.name,
    status: index === 0 ? 'IN_PROGRESS' : index < 2 ? 'COMPLETED' : 'PLANNED' as const,
    scheduledTime: `${8 + index * 2}:00`,
    checkInTime: index < 2 ? `${8 + index * 2}:05` : undefined,
    checkOutTime: index < 2 ? `${8 + index * 2}:45` : undefined,
  }));

  const activeVisit = visits.find(v => v.status === 'IN_PROGRESS');
  const completedCount = visits.filter(v => v.status === 'COMPLETED').length;
  const inProgressCount = visits.filter(v => v.status === 'IN_PROGRESS').length;
  const plannedCount = visits.filter(v => v.status === 'PLANNED').length;

  // 🔄 État de chargement
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

  // ❌ État d'erreur
  if (error) {
    return (
      <PageLayout>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-lg text-slate-600">Chargement...</p>
        </div>
      </div>
      </PageLayout>
    );
  }

  // 🚫 Pas de secteur assigné
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
              {outlets.length} PDV assignés
            </p>
          </div>
        )}

        {/* Boutons d'action principaux */}
        {!selectedVisit && !showPDVForm && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button 
              variant="primary" 
              size="md"
              onClick={() => alert('Fonctionnalité: Enregistrer une visite')}
            >
              <span className="mr-2">📍</span>
              Enregistrer visite
            </Button>
            <Button 
              variant="secondary" 
              size="md"
              onClick={() => setShowPDVForm(true)}
            >
              <span className="mr-2">🏪</span>
              Nouveau PDV
            </Button>
          </div>
        )}

        {/* CTA Check-in si visite en cours */}
        {activeVisit && !selectedVisit && !showPDVForm && (
          <ActiveVisitCTA 
            pdvName={activeVisit.pdvName}
            onContinue={() => setSelectedVisit(activeVisit.id)}
          />
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
                  onSelect={setSelectedVisit}
                />
              ))
            )}
          </div>
        )}

        {/* Détail de visite */}
        {selectedVisit && !showPDVForm && (
          <VisitDetail onBack={() => setSelectedVisit(null)} />
        )}
      </div>
    </PageLayout>
  );
}
