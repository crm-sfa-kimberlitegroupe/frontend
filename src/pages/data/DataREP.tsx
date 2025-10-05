import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function DataREP() {
  const [activeTab, setActiveTab] = useState<'orders' | 'stock'>('orders');
  const [showNewOrder, setShowNewOrder] = useState(false);

  const orders = [
    { id: '1', pdvName: 'Supermarché Plateau', status: 'DELIVERED', totalAmount: 125000, itemsCount: 15, date: '2025-10-03' },
    { id: '2', pdvName: 'Boutique Cocody', status: 'CONFIRMED', totalAmount: 85000, itemsCount: 8, date: '2025-10-04' },
    { id: '3', pdvName: 'Épicerie Marcory', status: 'DRAFT', totalAmount: 45000, itemsCount: 5, date: '2025-10-05' },
  ];

  const stockAlerts = [
    { id: '1', pdvName: 'Supermarché Plateau', product: 'Coca-Cola 1.5L', status: 'rupture' },
    { id: '2', pdvName: 'Boutique Cocody', product: 'Fanta Orange 50cl', status: 'faible' },
    { id: '3', pdvName: 'Épicerie Marcory', product: 'Sprite 1L', status: 'rupture' },
  ];

  const products = [
    { id: '1', name: 'Coca-Cola 1.5L', price: 1000, category: 'Boissons', stock: 150 },
    { id: '2', name: 'Fanta Orange 50cl', price: 500, category: 'Boissons', stock: 200 },
    { id: '3', name: 'Sprite 1L', price: 800, category: 'Boissons', stock: 180 },
  ];

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'success';
      case 'CONFIRMED': return 'warning';
      case 'DRAFT': return 'gray';
      default: return 'gray';
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'Livrée';
      case 'CONFIRMED': return 'Confirmée';
      case 'DRAFT': return 'Brouillon';
      default: return status;
    }
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête avec onglets */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Données 📊</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            🛒 Commandes
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'stock'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            📦 Stock
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'orders' ? (
          <div>
            {/* Bouton nouvelle commande */}
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth 
              className="mb-4"
              onClick={() => setShowNewOrder(!showNewOrder)}
            >
              <span className="mr-2">➕</span>
              Nouvelle commande
            </Button>

            {/* Formulaire nouvelle commande */}
            {showNewOrder && (
              <Card className="p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Créer une commande</h3>
                
                {/* Recherche produits */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rechercher un produit
                  </label>
                  <input
                    type="text"
                    placeholder="Nom du produit..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                {/* Liste produits */}
                <div className="space-y-2 mb-4">
                  {products.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.price} FCFA</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 bg-white border border-gray-300 rounded-lg flex items-center justify-center">
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">0</span>
                        <button className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center">
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Sous-total</span>
                    <span className="text-sm font-medium">0 FCFA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">Total TTC</span>
                    <span className="text-lg font-bold text-primary">0 FCFA</span>
                  </div>
                </div>

                {/* Mode paiement */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode de paiement
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Espèces</option>
                    <option>Mobile Money</option>
                    <option>Crédit</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" fullWidth onClick={() => setShowNewOrder(false)}>
                    Annuler
                  </Button>
                  <Button variant="success" fullWidth>
                    Confirmer
                  </Button>
                </div>
              </Card>
            )}

            {/* Liste des commandes */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 px-1">
                Mes commandes ({orders.length})
              </h3>
              {orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{order.pdvName}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>📅 {order.date}</span>
                        <span>📦 {order.itemsCount} articles</span>
                      </div>
                    </div>
                    <Badge variant={getOrderStatusColor(order.status) as any} size="sm">
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-primary">
                      {order.totalAmount.toLocaleString()} FCFA
                    </span>
                    <Button variant="outline" size="sm">
                      Voir détails
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Alertes ruptures */}
            <Card className="p-4 mb-4 bg-danger/10 border-danger/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-danger">Alertes ruptures</p>
                  <p className="text-sm text-gray-600">{stockAlerts.length} produits en rupture ou stock faible</p>
                </div>
              </div>
            </Card>

            {/* Liste des alertes */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 px-1">
                Alertes stock
              </h3>
              {stockAlerts.map((alert) => (
                <Card key={alert.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{alert.product}</h4>
                      <p className="text-sm text-gray-600">{alert.pdvName}</p>
                    </div>
                    <Badge 
                      variant={alert.status === 'rupture' ? 'danger' : 'warning'} 
                      size="sm"
                    >
                      {alert.status === 'rupture' ? '🚫 Rupture' : '⚠️ Faible'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {/* Inventaire */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">
                Inventaire produits
              </h3>
              <div className="space-y-2">
                {products.map((product) => (
                  <Card key={product.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="gray" size="sm">{product.category}</Badge>
                          <span className="text-xs text-gray-600">{product.price} FCFA</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{product.stock}</p>
                        <p className="text-xs text-gray-600">en stock</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
