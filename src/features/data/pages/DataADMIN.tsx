import { useState } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';

export default function DataADMIN() {
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'tasks' | 'territories'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    { id: '1', name: 'Coca-Cola 1.5L', sku: 'CC-1500', price: 1000, category: 'Boissons', isActive: true },
    { id: '2', name: 'Fanta Orange 50cl', sku: 'FO-500', price: 500, category: 'Boissons', isActive: true },
    { id: '3', name: 'Sprite 1L', sku: 'SP-1000', price: 800, category: 'Boissons', isActive: false },
  ];

  const users = [
    { id: '1', name: 'Jean Kouassi', email: 'jean.k@example.com', role: 'REP', territory: 'Plateau', isActive: true },
    { id: '2', name: 'Marie Diallo', email: 'marie.d@example.com', role: 'REP', territory: 'Cocody', isActive: true },
    { id: '3', name: 'Paul Bamba', email: 'paul.b@example.com', role: 'SUP', territory: 'Zone Nord', isActive: true },
  ];

  const tasks = [
    { id: '1', title: 'Inventaire mensuel', assignedTo: 'Jean Kouassi', dueDate: '2025-10-10', status: 'pending' },
    { id: '2', title: 'Formation nouveaux produits', assignedTo: 'Marie Diallo', dueDate: '2025-10-08', status: 'in_progress' },
    { id: '3', title: 'Audit Perfect Store', assignedTo: 'Paul Bamba', dueDate: '2025-10-05', status: 'completed' },
  ];

  const territories = [
    { id: '1', name: 'Plateau', pdvCount: 45, repsCount: 3, coverage: 87 },
    { id: '2', name: 'Cocody', pdvCount: 38, repsCount: 2, coverage: 92 },
    { id: '3', name: 'Marcory', pdvCount: 32, repsCount: 2, coverage: 78 },
  ];

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête avec onglets */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
          Gestion des données
          <Icon name="chartBar" size="lg" variant="primary" />
        </h1>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'products', label: 'Produits', icon: 'package', count: products.length },
            { key: 'users', label: 'Utilisateurs', icon: 'user', count: users.length },
            { key: 'tasks', label: 'Tâches', icon: 'checkCircle', count: tasks.length },
            { key: 'territories', label: 'Territoires', icon: 'map', count: territories.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Icon name={tab.icon as any} size="sm" className="mr-1" />
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Barre de recherche et actions */}
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <Button variant="primary" size="md">
              <Icon name="plus" size="sm" className="mr-2" />
              Créer
            </Button>
          </div>
          <Button variant="outline" size="sm" fullWidth>
            <Icon name="download" size="sm" className="mr-2" />
            Importer CSV
          </Button>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'products' && (
          <div className="space-y-3">
            {products.map((product) => (
              <Card key={product.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      {product.isActive ? (
                        <Badge variant="success" size="sm">Actif</Badge>
                      ) : (
                        <Badge variant="gray" size="sm">Inactif</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>SKU: {product.sku}</span>
                      <span>•</span>
                      <span>{product.category}</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-primary">{product.price} FCFA</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" fullWidth>
                    <Icon name="edit" size="sm" className="mr-1" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" fullWidth>
                    <Icon name={product.isActive ? 'x' : 'check'} size="sm" className="mr-1" />
                    {product.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <Icon name="user" size="xl" variant="primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <Badge variant="primary" size="sm">{user.role}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Icon name="locationMarker" size="xs" variant="grey" />
                        {user.territory}
                      </p>
                    </div>
                  </div>
                  {user.isActive ? (
                    <Badge variant="success" size="sm">Actif</Badge>
                  ) : (
                    <Badge variant="gray" size="sm">Inactif</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" fullWidth>
                    <Icon name="edit" size="sm" className="mr-1" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" fullWidth>
                    <Icon name="fingerprint" size="sm" className="mr-1" />
                    Réinitialiser MDP
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Icon name="user" size="xs" variant="grey" />
                        {task.assignedTo}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Icon name="calendar" size="xs" variant="grey" />
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      task.status === 'completed' ? 'success' :
                      task.status === 'in_progress' ? 'warning' : 'gray'
                    } 
                    size="sm"
                  >
                    {task.status === 'completed' ? 'Terminée' :
                     task.status === 'in_progress' ? 'En cours' : 'En attente'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" fullWidth>
                    Voir détails
                  </Button>
                  <Button variant="outline" size="sm" fullWidth>
                    <Icon name="edit" size="sm" className="mr-1" />
                    Modifier
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'territories' && (
          <div className="space-y-3">
            {territories.map((territory) => (
              <Card key={territory.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">{territory.name}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">PDV</p>
                        <p className="font-semibold text-gray-900">{territory.pdvCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Vendeurs</p>
                        <p className="font-semibold text-gray-900">{territory.repsCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 mb-1">Couverture</p>
                    <p className="text-2xl font-bold text-primary">{territory.coverage}%</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" fullWidth>
                  Gérer le territoire
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
