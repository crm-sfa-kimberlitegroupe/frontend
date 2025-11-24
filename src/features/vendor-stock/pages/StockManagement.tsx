import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/core/ui/Card';
import Button from '@/core/ui/Button';
import KPICard from '@/core/ui/KPICard';
import { Icon } from '@/core/ui/Icon';
import { useVendorStockStore } from '../stores/vendorStockStore';
import { type VendorStockItem } from '../services/vendorStockService';
import AddStockModal from '../components/AddStockModal';
import PortfolioList from '../components/PortfolioList';
import LowStockAlerts from '../components/LowStockAlerts';
import ConfirmModal from '../components/ConfirmModal';
import SuccessModal from '../components/SuccessModal';

export default function StockManagement() {
  const navigate = useNavigate();
  
  // Utiliser le store préchargé au lieu des états locaux
  const { 
    portfolio, 
    stats, 
    lowStockItems: lowStock,
    unloadAllStock,
    refreshData: refreshStock
  } = useVendorStockStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // États pour les modaux
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUnloading, setIsUnloading] = useState(false);

  // Plus besoin de useEffect - les données sont déjà dans le store
  // Les données ont été préchargées par le DataPreloader

  const loadData = async () => {
    // Rafraîchir les données depuis le store
    try {
      await refreshStock();
    } catch (error) {
      console.error('Erreur rafraîchissement stock:', error);
    }
  };

  const handleAddStockSuccess = () => {
    setShowAddModal(false);
    loadData(); // Recharger les données
  };

  const handleUnloadStock = () => {
    setShowConfirmModal(true);
  };

  const confirmUnloadStock = async () => {
    try {
      setIsUnloading(true);
      setShowConfirmModal(false);
      
      // Utiliser l'action du store
      await unloadAllStock();
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erreur lors du déchargement du stock:', error);
      alert('Erreur lors du déchargement du stock. Veuillez réessayer.');
    } finally {
      setIsUnloading(false);
    }
  };

  // Filtrage du portefeuille
  const filteredPortfolio = portfolio?.filter((item: VendorStockItem) => {
    // Vérifier que item.sku existe
    if (!item.sku) return false;
    
    const skuName = item.sku.shortDescription || '';
    const skuBrand = item.sku.packSize.packFormat.brand.displayName || '';
    const matchesSearch = skuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skuBrand.toLowerCase().includes(searchTerm.toLowerCase());
    const skuCategory = item.sku.packSize.packFormat.brand.subCategory.category.displayName;
    const matchesCategory = filterCategory === 'all' || skuCategory === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Catégories uniques
  const categories = Array.from(new Set(portfolio?.map(item => {
    return item.sku?.packSize.packFormat.brand.subCategory.category.displayName;
  }).filter(Boolean) || []));

  // Plus besoin d'état de chargement - données préchargées

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

      {/* Boutons d'action */}
      <div className="space-y-3 mb-6">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => setShowAddModal(true)}
        >
          <Icon name="plus" size="lg" className="mr-2" />
          <span className="font-medium">Ajouter des produits</span>
        </Button>
        
        {/* Bouton décharger stock - affiché seulement s'il y a du stock */}
        {portfolio && portfolio.length > 0 && (
          <Button
            variant="danger"
            size="md"
            fullWidth
            onClick={handleUnloadStock}
            disabled={isUnloading}
            className="bg-red-600 hover:bg-red-700"
          >
            <Icon name="trash" size="md" className="mr-2" />
            <span className="font-medium">Décharger tout le stock</span>
          </Button>
        )}
      </div>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par catégorie
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    filterCategory === 'all'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon 
                    name="package" 
                    size="sm" 
                    className={filterCategory === 'all' ? 'text-white' : 'text-gray-500'}
                  />
                  Tous
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat!)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      filterCategory === cat
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon 
                      name="package" 
                      size="sm" 
                      className={filterCategory === cat ? 'text-white' : 'text-gray-500'}
                    />
                    {cat}
                  </button>
                ))}
              </div>
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
        <Card className="p-8 text-center mb-20">
          <Icon name="package" size="2xl" variant="grey" className="mx-auto mb-4" />
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

      {/* Modal de confirmation pour décharger le stock */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmUnloadStock}
        title="Décharger tout le stock"
        message={`Êtes-vous sûr de vouloir décharger tout votre stock ?

Cette action va :
• Vider complètement votre portefeuille
• Supprimer tous les produits en stock
• Cette action est IRRÉVERSIBLE

Confirmez-vous cette action ?`}
        confirmText="Oui, décharger"
        cancelText="Annuler"
        type="danger"
        isLoading={isUnloading}
      />

      {/* Modal de succès */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Stock déchargé !"
        message="Votre stock a été déchargé avec succès. Votre portefeuille est maintenant vide."
        buttonText="Parfait !"
      />
    </div>
  );
}
