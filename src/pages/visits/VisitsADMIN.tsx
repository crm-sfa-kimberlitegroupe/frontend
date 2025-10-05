import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function VisitsADMIN() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const pendingPDV = [
    { 
      id: '1', 
      name: 'Nouveau Supermarché Plateau', 
      address: '123 Rue du Commerce, Plateau',
      submittedBy: 'Jean Kouassi',
      submittedAt: '2025-10-05 10:30',
      photo: '📍',
      gps: { lat: 5.316667, lng: -4.033333 },
      phone: '+225 07 12 34 56 78',
      channel: 'Supermarché',
      segment: 'A'
    },
    { 
      id: '2', 
      name: 'Boutique Cocody Centre', 
      address: '45 Boulevard Latrille, Cocody',
      submittedBy: 'Marie Diallo',
      submittedAt: '2025-10-05 11:15',
      photo: '📍',
      gps: { lat: 5.35, lng: -3.983333 },
      phone: '+225 07 98 76 54 32',
      channel: 'Boutique',
      segment: 'B'
    },
  ];

  const handleApprove = (_id: string, name: string) => {
    if (confirm(`Valider le PDV "${name}" ?`)) {
      alert('PDV validé avec succès! ✓');
    }
  };

  const handleReject = (_id: string, name: string) => {
    if (!rejectionReason.trim()) {
      alert('Veuillez indiquer une raison de rejet');
      return;
    }
    alert(`PDV "${name}" rejeté. Raison: ${rejectionReason}`);
    setShowRejectModal(null);
    setRejectionReason('');
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Validation PDV 📍</h1>
        
        {/* Filtres */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === 'pending'
                ? 'bg-warning text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            En attente ({pendingPDV.length})
          </button>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tous les PDV
          </button>
        </div>
      </div>

      <div className="p-4">
        {pendingPDV.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-4xl mb-3">✓</p>
            <p className="text-lg font-semibold text-gray-900">Aucun PDV en attente</p>
            <p className="text-sm text-gray-600 mt-1">Tous les PDV ont été traités</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingPDV.map((pdv) => (
              <Card key={pdv.id} className="p-4">
                {/* En-tête PDV */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center text-3xl">
                    {pdv.photo}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{pdv.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{pdv.address}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="gray" size="sm">{pdv.channel}</Badge>
                      <Badge variant="gray" size="sm">Segment {pdv.segment}</Badge>
                    </div>
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="space-y-2 mb-4 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">📞</span>
                    <span className="text-gray-900">{pdv.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">📍</span>
                    <span className="text-gray-900">
                      {pdv.gps.lat.toFixed(6)}, {pdv.gps.lng.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">👤</span>
                    <span className="text-gray-900">Proposé par {pdv.submittedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">🕐</span>
                    <span className="text-gray-900">{pdv.submittedAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="success" 
                    size="md" 
                    fullWidth
                    onClick={() => handleApprove(pdv.id, pdv.name)}
                  >
                    <span className="mr-2">✓</span>
                    Valider
                  </Button>
                  <Button 
                    variant="danger" 
                    size="md" 
                    fullWidth
                    onClick={() => setShowRejectModal(pdv.id)}
                  >
                    <span className="mr-2">✗</span>
                    Rejeter
                  </Button>
                </div>

                {/* Modal de rejet */}
                {showRejectModal === pdv.id && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Rejeter le PDV
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Veuillez indiquer la raison du rejet (obligatoire)
                      </p>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4"
                        rows={4}
                        placeholder="Ex: Adresse incorrecte, doublon, etc."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          fullWidth
                          onClick={() => {
                            setShowRejectModal(null);
                            setRejectionReason('');
                          }}
                        >
                          Annuler
                        </Button>
                        <Button 
                          variant="danger" 
                          fullWidth
                          onClick={() => handleReject(pdv.id, pdv.name)}
                        >
                          Confirmer le rejet
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
