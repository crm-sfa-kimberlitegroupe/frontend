import { useState } from 'react';
import { Package, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { PageHeader, DataTable, FilterBar } from '../../components/desktop';
import type { Column } from '../../components/desktop/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  photo?: string;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Coca-Cola 33cl',
    sku: 'COCA-33',
    category: 'Boissons',
    price: 500,
    stock: 1250,
    isActive: true,
  },
  {
    id: '2',
    name: 'Fanta Orange 33cl',
    sku: 'FANTA-33',
    category: 'Boissons',
    price: 500,
    stock: 980,
    isActive: true,
  },
  {
    id: '3',
    name: 'Eau Minérale 1.5L',
    sku: 'EAU-15',
    category: 'Boissons',
    price: 300,
    stock: 2100,
    isActive: true,
  },
  {
    id: '4',
    name: 'Biscuits Choco',
    sku: 'BISC-CHOCO',
    category: 'Snacks',
    price: 250,
    stock: 450,
    isActive: true,
  },
  {
    id: '5',
    name: 'Chips Nature 50g',
    sku: 'CHIPS-NAT',
    category: 'Snacks',
    price: 200,
    stock: 0,
    isActive: false,
  },
];

export default function ProductsManagement() {
  const [products] = useState<Product[]>(mockProducts);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  const filteredProducts = products.filter((product) => {
    if (categoryFilter !== 'all' && product.category !== categoryFilter) return false;
    if (statusFilter === 'active' && !product.isActive) return false;
    if (statusFilter === 'inactive' && product.isActive) return false;
    if (stockFilter === 'in_stock' && product.stock === 0) return false;
    if (stockFilter === 'out_of_stock' && product.stock > 0) return false;
    if (stockFilter === 'low_stock' && product.stock > 100) return false;
    return true;
  });

  const activeFiltersCount =
    (categoryFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (stockFilter !== 'all' ? 1 : 0);

  const handleClearFilters = () => {
    setCategoryFilter('all');
    setStatusFilter('all');
    setStockFilter('all');
  };

  const columns: Column<Product>[] = [
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
      render: (product) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit product:', product.id);
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
                console.log('Delete product:', product.id);
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

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 100).length;

  return (
    <div>
      <PageHeader
        title="Gestion des Produits"
        description={`${products.length} produits • ${outOfStock} en rupture • ${lowStock} stock faible`}
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Produit
          </Button>
        }
      />

      {/* Alertes */}
      {(outOfStock > 0 || lowStock > 0) && (
        <div className="mb-6 space-y-3">
          {outOfStock > 0 && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-3">
              <XCircle className="w-5 h-5 text-danger" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {outOfStock} produit{outOfStock > 1 ? 's' : ''} en rupture de stock
                </p>
                <p className="text-sm text-gray-600">
                  Ces produits ne sont plus disponibles et nécessitent un réapprovisionnement.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setStockFilter('out_of_stock')}
              >
                Voir
              </Button>
            </div>
          )}
          {lowStock > 0 && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-3">
              <Package className="w-5 h-5 text-warning" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {lowStock} produit{lowStock > 1 ? 's' : ''} avec stock faible
                </p>
                <p className="text-sm text-gray-600">
                  Ces produits ont moins de 100 unités en stock.
                </p>
              </div>
              <Button
                variant="warning"
                size="sm"
                onClick={() => setStockFilter('low_stock')}
              >
                Voir
              </Button>
            </div>
          )}
        </div>
      )}

      <FilterBar
        activeFiltersCount={activeFiltersCount}
        onClear={handleClearFilters}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Toutes les catégories</option>
            <option value="Boissons">Boissons</option>
            <option value="Snacks">Snacks</option>
            <option value="Hygiène">Hygiène</option>
            <option value="Alimentaire">Alimentaire</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock
          </label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous</option>
            <option value="in_stock">En stock</option>
            <option value="low_stock">Stock faible</option>
            <option value="out_of_stock">Rupture</option>
          </select>
        </div>
      </FilterBar>

      <DataTable
        data={filteredProducts}
        columns={columns}
        searchable
        searchPlaceholder="Rechercher un produit..."
        onRowClick={(product) => console.log('View product details:', product)}
      />
    </div>
  );
}
