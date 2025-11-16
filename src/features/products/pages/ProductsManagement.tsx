import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { PageHeader, DataTable, FilterBar } from '../../../core/components/desktop';
import type { Column } from '../../../core/components/desktop/DataTable';
import { Button, Badge } from '@/core/ui';
import { useFilters } from '@/core/hooks';
import SKUModal from '../components/SKUModal';
import { skusService } from '../services/productsService';
import type { SKU } from '../services/productsService';


export default function ProductsManagement() {
  const [skus, setSkus] = useState<SKU[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Charger les SKU au montage
  useEffect(() => {
    loadSKUs();
  }, []);

  const loadSKUs = async () => {
    try {
      setLoading(true);
      const data = await skusService.getAll();
      setSkus(data);
    } catch (error) {
      console.error('Erreur chargement SKU:', error);
      alert('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  // Filtres
  const { filters, setFilter, resetFilters } = useFilters({
    category: 'all',
    status: 'all',
  });

  const filteredSKUs = (skus || []).filter((sku) => {
    if (filters.category !== 'all' && sku.category !== filters.category) return false;
    if (filters.status === 'active' && !sku.active) return false;
    if (filters.status === 'inactive' && sku.active) return false;
    return true;
  });

  // Handlers
  const handleCreate = () => {
    console.log('🔥 BOUTON CLIQUÉ !');
    console.log('showModal avant:', showModal);
    setSelectedSKU(null);
    setModalMode('create');
    setShowModal(true);
    console.log('showModal après:', true);
  };

  const handleEdit = (sku: SKU) => {
    setSelectedSKU(sku);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    
    try {
      await skusService.delete(id);
      alert('Produit supprimé avec succès');
      loadSKUs();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (modalMode === 'create') {
        await skusService.create(data);
        alert('Produit créé avec succès');
      } else if (selectedSKU) {
        await skusService.update(selectedSKU.id, data);
        alert('Produit mis à jour avec succès');
      }
      
      // Fermer le modal
      setShowModal(false);
      
      // Recharger la liste instantanément
      await loadSKUs();
    } catch (error: any) {
      throw error;
    }
  };

  const columns: Column<SKU>[] = [
    {
      key: 'name',
      label: 'Produit',
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Catégorie',
      sortable: true,
      render: (product) => (
        <Badge variant="secondary">{product.category}</Badge>
      ),
    },
    {
      key: 'price',
      label: 'Prix',
      sortable: true,
      render: (product) => (
        <span className="font-semibold text-gray-900">
          {product.price.toLocaleString()} FCFA
        </span>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (product) => (
        <div>
          <span
            className={`font-semibold ${
              product.stock === 0
                ? 'text-danger'
                : product.stock < 100
                ? 'text-warning'
                : 'text-success'
            }`}
          >
            {product.stock}
          </span>
          {product.stock === 0 && (
            <p className="text-xs text-danger mt-1">Rupture</p>
          )}
          {product.stock > 0 && product.stock < 100 && (
            <p className="text-xs text-warning mt-1">Stock faible</p>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Statut',
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-2">
          {product.isActive ? (
            <>
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-success font-medium">Actif</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Inactif</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render: (_product) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert('Fonction de modification à implémenter');
            }}
            className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Supprimer ce produit ?')) {
                alert('Fonction de suppression à implémenter');
              }
            }}
            className="p-2 text-danger hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const activeCount = (skus || []).filter((s) => s.active).length;
  const inactiveCount = (skus || []).length - activeCount;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Gestion des Produits"
        description={`${(skus || []).length} produits • ${activeCount} actifs • ${inactiveCount} inactifs`}
        actions={
          <Button variant="primary" size="md" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Produit
          </Button>
        }
      />

      <FilterBar
        activeFiltersCount={(filters.category !== 'all' ? 1 : 0) + (filters.status !== 'all' ? 1 : 0)}
        onClear={resetFilters}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Toutes les catégories</option>
            <option value="Boissons">Boissons</option>
            <option value="Snacks">Snacks</option>
            <option value="Hygiène">Hygiène</option>
            <option value="Alimentaire">Alimentaire</option>
            <option value="Entretien">Entretien</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </FilterBar>

      <DataTable
        data={filteredSKUs}
        columns={columns}
        searchable
        searchPlaceholder="Rechercher un produit (nom, EAN, marque)..."
      />

      <SKUModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        sku={selectedSKU}
        mode={modalMode}
      />
    </div>
  );
}
