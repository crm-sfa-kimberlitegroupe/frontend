import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/core/ui/Card';
import Button from '@/core/ui/Button';
import KPICard from '@/core/ui/KPICard';
import { Icon } from '@/core/ui/Icon';
import { vendorStockService, type VendorStockItem, type StockStats, type LowStockItem } from '../services/vendorStockService';
import AddStockModal from '../components/AddStockModal';
import PortfolioList from '../components/PortfolioList';
import LowStockAlerts from '../components/LowStockAlerts';

export default function StockManagement() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StockStats | null>(null);
  const [portfolio, setPortfolio] = useState<VendorStockItem[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, portfolioData, lowStockData] = await Promise.all([
        vendorStockService.getStats(),
        vendorStockService.getMyPortfolio(),
        vendorStockService.getLowStockItems(10),
      ]);
      setStats(statsData);
      setPortfolio(portfolioData);
      setLowStock(lowStockData);
    } catch (error) {
      console.error('Erreur chargement stock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStockSuccess = () => {
    setShowAddModal(false);
    loadData(); // Recharger les données
  };

  // Filtrage du portefeuille
  const filteredPortfolio = portfolio?.filter((item) => {
    const matchesSearch = item.sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.sku.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Catégories uniques
  const categories = Array.from(new Set(portfolio?.map(item => item.sku.category).filter(Boolean) || []));

  if (isLoading) {
    return (
      <div className="pb-nav-safe px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="refresh" size="3xl" variant="primary" className="animate-spin mb-4" />
          <p className="text-gray-600">Chargement du stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-nav-safe px-4 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="arrowLeft" size="lg" variant="grey" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon Stock</h1>
            <p className="text-sm text-gray-600">Gestion de votre portefeuille</p>
          </div>
        </div>
        <Icon name="package" size="2xl" variant="primary" />
      </div>

      {/* Statistiques rapides */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <KPICard
            label="Produits"
            value={stats.totalProducts}
            icon="package"
            color="primary"
          />
          <KPICard
            label="Quantité totale"
            value={stats.totalQuantity}
            icon="chartBar"
            color="green"
          />
          <KPICard
            label="Stock faible"
            value={stats.lowStockCount}
            icon="warning"
            color="yellow"
          />
          <KPICard
            label="Mouvements"
            value={stats.todayMovements}
            icon="refresh"
            color="primary"
          />
        </div>
      )}

      {/* Bouton principal */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="mb-6"
        onClick={() => setShowAddModal(true)}
      >
        <Icon name="plus" size="lg" className="mr-2" />
        <span className="font-medium">Créer stock pour ma journée</span>
      </Button>

      {/* Alertes stock faible */}
      {lowStock && lowStock.length > 0 && (
        <LowStockAlerts items={lowStock} className="mb-6" />
      )}

      {/* Recherche et filtres */}
      <Card className="p-4 mb-4">
        <div className="space-y-3">
          {/* Recherche */}
          <div className="relative">
            <Icon
              name="search"
              size="md"
              variant="grey"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filtres catégories */}
          {categories && categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat!)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filterCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* En-tête liste */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Mon Portefeuille ({filteredPortfolio.length})
        </h2>
        <button
          onClick={() => navigate('/dashboard/stock/history')}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <Icon name="clock" size="sm" />
          Historique
        </button>
      </div>

      {/* Liste du portefeuille */}
      {filteredPortfolio.length > 0 ? (
        <PortfolioList items={filteredPortfolio} onRefresh={loadData} />
      ) : (
        <Card className="p-8 text-center">
          <Icon name="package" size="3xl" variant="grey" className="mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            {searchTerm || filterCategory !== 'all'
              ? 'Aucun produit trouvé'
              : 'Votre portefeuille est vide'}
          </p>
          <p className="text-sm text-gray-500">
            {searchTerm || filterCategory !== 'all'
              ? 'Essayez de modifier vos filtres'
              : 'Ajoutez du stock pour commencer'}
          </p>
        </Card>
      )}

      {/* Modal d'ajout de stock */}
      {showAddModal && (
        <AddStockModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddStockSuccess}
        />
      )}
    </div>
  );
}
