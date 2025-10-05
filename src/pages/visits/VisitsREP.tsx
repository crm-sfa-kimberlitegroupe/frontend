import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function VisitsREP() {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const visits = [
    { id: '1', pdvName: 'Supermarché Plateau', status: 'COMPLETED', scheduledTime: '08:00', checkInTime: '08:05', checkOutTime: '08:45' },
    { id: '2', pdvName: 'Boutique Cocody', status: 'COMPLETED', scheduledTime: '09:30', checkInTime: '09:35', checkOutTime: '10:10' },
    { id: '3', pdvName: 'Épicerie Marcory', status: 'IN_PROGRESS', scheduledTime: '11:00', checkInTime: '11:05' },
    { id: '4', pdvName: 'Mini-market Yopougon', status: 'PLANNED', scheduledTime: '13:00' },
    { id: '5', pdvName: 'Superette Abobo', status: 'PLANNED', scheduledTime: '14:30' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'PLANNED': return 'gray';
      case 'SKIPPED': return 'danger';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Terminée ✓';
      case 'IN_PROGRESS': return 'En cours';
      case 'PLANNED': return 'Planifiée';
      case 'SKIPPED': return 'Sautée';
      default: return status;
    }
  };

  const handleCheckIn = () => {
    setIsCheckingIn(true);
    // Simulation géolocalisation
    setTimeout(() => {
      setIsCheckingIn(false);
      alert('Check-in réussi! 📍');
    }, 1500);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Mes Visites 📍</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            <span className="font-semibold text-success">2</span> terminées
          </span>
          <span className="text-gray-600">
            <span className="font-semibold text-warning">1</span> en cours
          </span>
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">2</span> planifiées
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* CTA Check-in si visite en cours */}
        {visits.some(v => v.status === 'IN_PROGRESS') && !selectedVisit && (
          <Card className="p-4 mb-4 bg-gradient-to-br from-success to-secondary text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm opacity-90">Visite en cours</p>
                <p className="text-lg font-bold">Épicerie Marcory</p>
              </div>
              <span className="text-3xl">📍</span>
            </div>
            <Button 
              variant="outline" 
              fullWidth 
              className="bg-white text-success hover:bg-gray-50"
              onClick={() => setSelectedVisit('3')}
            >
              Continuer la visite
            </Button>
          </Card>
        )}

        {/* Liste des visites */}
        {!selectedVisit ? (
          <div className="space-y-3">
            {visits.map((visit) => (
              <Card key={visit.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{visit.pdvName}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>⏰ {visit.scheduledTime}</span>
                      {visit.checkInTime && <span>✓ Check-in: {visit.checkInTime}</span>}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(visit.status) as any} size="sm">
                    {getStatusLabel(visit.status)}
                  </Badge>
                </div>

                {visit.status === 'PLANNED' && (
                  <Button 
                    variant="success" 
                    size="sm" 
                    fullWidth
                    onClick={() => setSelectedVisit(visit.id)}
                  >
                    <span className="mr-2">📍</span>
                    CHECK-IN
                  </Button>
                )}

                {visit.status === 'IN_PROGRESS' && (
                  <Button 
                    variant="warning" 
                    size="sm" 
                    fullWidth
                    onClick={() => setSelectedVisit(visit.id)}
                  >
                    Continuer la visite
                  </Button>
                )}

                {visit.status === 'COMPLETED' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth
                    onClick={() => setSelectedVisit(visit.id)}
                  >
                    Voir détails
                  </Button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          // Formulaire de visite détaillé
          <div>
            <button 
              onClick={() => setSelectedVisit(null)}
              className="flex items-center gap-2 text-primary mb-4"
            >
              <span>←</span> Retour à la liste
            </button>

            <Card className="p-4 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Épicerie Marcory</h2>
              <p className="text-sm text-gray-600 mb-3">123 Rue de Marcory, Abidjan</p>
              <Badge variant="warning">En cours</Badge>
            </Card>

            {/* Photos merchandising */}
            <Card className="p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">📸 Photos merchandising</h3>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">📷</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" fullWidth>
                <span className="mr-2">➕</span>
                Ajouter une photo
              </Button>
            </Card>

            {/* Checklist Perfect Store */}
            <Card className="p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">✅ Checklist Perfect Store</h3>
              <div className="space-y-2">
                {[
                  'Produits bien disposés',
                  'Prix affichés',
                  'PLV en place',
                  'Stock suffisant',
                  'Propreté du rayon'
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="w-5 h-5 text-primary rounded" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Gestion stock */}
            <Card className="p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">📦 Gestion stock</h3>
              <Button variant="outline" size="sm" fullWidth>
                <span className="mr-2">⚠️</span>
                Signaler une rupture
              </Button>
            </Card>

            {/* Prendre commande */}
            <Card className="p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">🛒 Commande</h3>
              <Button variant="primary" size="sm" fullWidth>
                <span className="mr-2">➕</span>
                Prendre une commande
              </Button>
            </Card>

            {/* Notes */}
            <Card className="p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">📝 Notes</h3>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                rows={4}
                placeholder="Ajouter des notes sur cette visite..."
              />
            </Card>

            {/* Bouton CHECK-OUT */}
            <Button 
              variant="danger" 
              size="lg" 
              fullWidth
              onClick={() => {
                if (confirm('Terminer cette visite ?')) {
                  setSelectedVisit(null);
                  alert('Visite terminée! ✓');
                }
              }}
            >
              <span className="mr-2">🏁</span>
              CHECK-OUT
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
