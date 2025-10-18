import { useState } from 'react';
import Button from '../../../core/ui/Button';
import type     { Visit } from '../types/pdv.types';
import VisitsHeader from '../components/VisitsHeader';
import ActiveVisitCTA from '../components/ActiveVisitCTA';
import PDVFormWizard from '../components/PDVFormWizard';
import VisitCard from '../components/VisitCard';
import VisitDetail from '../components/VisitDetail';

export default function VisitsREP() {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [showPDVForm, setShowPDVForm] = useState(false);

  const visits: Visit[] = [
    { id: '1', pdvName: 'Supermarché Plateau', status: 'COMPLETED', scheduledTime: '08:00', checkInTime: '08:05', checkOutTime: '08:45' },
    { id: '2', pdvName: 'Boutique Cocody', status: 'COMPLETED', scheduledTime: '09:30', checkInTime: '09:35', checkOutTime: '10:10' },
    { id: '3', pdvName: 'Épicerie Marcory', status: 'IN_PROGRESS', scheduledTime: '11:00', checkInTime: '11:05' },
    { id: '4', pdvName: 'Mini-market Yopougon', status: 'PLANNED', scheduledTime: '13:00' },
    { id: '5', pdvName: 'Superette Abobo', status: 'PLANNED', scheduledTime: '14:30' },
  ];

  const activeVisit = visits.find(v => v.status === 'IN_PROGRESS');
  const completedCount = visits.filter(v => v.status === 'COMPLETED').length;
  const inProgressCount = visits.filter(v => v.status === 'IN_PROGRESS').length;
  const plannedCount = visits.filter(v => v.status === 'PLANNED').length;

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <VisitsHeader 
        completedCount={completedCount}
        inProgressCount={inProgressCount}
        plannedCount={plannedCount}
      />

      <div className="p-4">
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
            {visits.map((visit) => (
              <VisitCard 
                key={visit.id}
                visit={visit}
                onSelect={setSelectedVisit}
              />
            ))}
          </div>
        )}

        {/* Détail de visite */}
        {selectedVisit && !showPDVForm && (
          <VisitDetail onBack={() => setSelectedVisit(null)} />
        )}
      </div>
    </div>
  );
}
