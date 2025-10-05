import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function RouteADMIN() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const pdvList = [
    { id: 1, name: 'Supermarché Plateau', status: 'pending', channel: 'Supermarché', segment: 'A', lat: 5.316667, lng: -4.033333 },
    { id: 2, name: 'Boutique Cocody', status: 'approved', channel: 'Boutique', segment: 'B', lat: 5.35, lng: -3.983333 },
    { id: 3, name: 'Épicerie Marcory', status: 'pending', channel: 'Épicerie', segment: 'C', lat: 5.283333, lng: -3.983333 },
    { id: 4, name: 'Mini-market Yopougon', status: 'approved', channel: 'Mini-market', segment: 'B', lat: 5.333333, lng: -4.083333 },
    { id: 5, name: 'Kiosque Abobo', status: 'rejected', channel: 'Kiosque', segment: 'C', lat: 5.416667, lng: -4.016667 },
  ];

  const filteredPDV = selectedFilter === 'all' 
    ? pdvList 
    : pdvList.filter(pdv => pdv.status === selectedFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Validé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      default:
        return status;
    }
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Gestion des PDV 🗺️</h1>
        
        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Tous', count: pdvList.length },
            { key: 'pending', label: 'En attente', count: pdvList.filter(p => p.status === 'pending').length },
            { key: 'approved', label: 'Validés', count: pdvList.filter(p => p.status === 'approved').length },
            { key: 'rejected', label: 'Rejetés', count: pdvList.filter(p => p.status === 'rejected').length },
          ].map((filter) => (
            <button
              key={filter.key}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setSelectedFilter(filter.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Carte */}
        <Card className="mb-4 overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-secondary/20 to-primary/20 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-2">🗺️</p>
                <p className="text-sm font-semibold text-gray-900">Carte de tous les PDV</p>
                <p className="text-xs text-gray-600 mt-1">Cliquez sur un marker pour plus d'infos</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions rapides */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button variant="primary" size="sm">
            <span className="mr-1">➕</span>
            Créer PDV
          </Button>
          <Button variant="secondary" size="sm">
            <span className="mr-1">🗺️</span>
            Créer route
          </Button>
          <Button variant="outline" size="sm">
            <span className="mr-1">👤</span>
            Affecter
          </Button>
        </div>

        {/* Liste des PDV */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">
            PDV ({filteredPDV.length})
          </h3>
          <div className="space-y-3">
            {filteredPDV.map((pdv) => (
              <Card key={pdv.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                    📍
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{pdv.name}</h4>
                      <Badge variant={getStatusColor(pdv.status)} size="sm">
                        {getStatusLabel(pdv.status)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">
                        📍 {pdv.lat.toFixed(4)}, {pdv.lng.toFixed(4)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="gray" size="sm">{pdv.channel}</Badge>
                        <Badge variant="gray" size="sm">Segment {pdv.segment}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {pdv.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button variant="success" size="sm" fullWidth>
                      ✓ Valider
                    </Button>
                    <Button variant="danger" size="sm" fullWidth>
                      ✗ Rejeter
                    </Button>
                  </div>
                )}

                {pdv.status === 'approved' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" fullWidth>
                      Voir détails
                    </Button>
                    <Button variant="outline" size="sm" fullWidth>
                      Modifier
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
