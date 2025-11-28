import { useState } from 'react';
import Card from '@/core/ui/Card';
import { Icon } from '@/core/ui/Icon';
import type { VendorStockItem } from '../services/vendorStockService';
import { useVendorStockStore } from '../stores/vendorStockStore';
import ConfirmModal from './ConfirmModal';

interface PortfolioListProps {
  items: VendorStockItem[];
  onRefresh?: () => void;
}

export default function PortfolioList({ items, onRefresh }: PortfolioListProps) {
  const { removeProduct, isRemovingProduct } = useVendorStockStore();
  
  // Etat pour la modal de confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    skuId: string;
    name: string;
    quantity: number;
  } | null>(null);

  const handleDeleteClick = (item: VendorStockItem) => {
    setProductToDelete({
      skuId: item.skuId,
      name: item.sku.shortDescription,
      quantity: item.quantity,
    });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    const result = await removeProduct(productToDelete.skuId);
    setShowDeleteModal(false);
    setProductToDelete(null);
    
    if (result.success) {
      onRefresh?.();
    } else {
      alert(result.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { color: 'text-gray-500', bg: 'bg-gray-100', label: 'Épuisé' };
    if (quantity < 10) return { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Faible' };
    return { color: 'text-green-700', bg: 'bg-green-100', label: 'OK' };
  };

  return (
    <div className="space-y-3 pb-20">
      {items.map((item) => {
        const status = getStockStatus(item.quantity);
        
        return (
          <Card key={item.id} className="p-4">
            <div className="flex gap-4">
              {/* Photo produit */}
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {item.sku.photo ? (
                  <img
                    src={item.sku.photo}
                    alt={item.sku.shortDescription}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="package" size="xl" variant="grey" />
                  </div>
                )}
              </div>

              {/* Informations produit */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {item.sku.packSize.packFormat.brand.displayName}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {item.sku.shortDescription}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {item.sku.packSize.displayName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-xs text-blue-700 rounded">
                    {item.sku.packSize.packFormat.brand.subCategory.category.displayName}
                  </span>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                    {item.sku.packSize.packFormat.brand.subCategory.displayName}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mis à jour {formatDate(item.updatedAt)}
                </p>
              </div>

              {/* Stock et prix */}
              <div className="flex flex-col items-end gap-2">
                <div className={`px-3 py-1 rounded-lg ${status.bg} flex items-center gap-2`}>
                  <span className={`text-lg font-bold ${status.color}`}>
                    {item.quantity}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{status.label}</span>
                <span className="text-sm font-medium text-gray-900">
                  {item.sku.priceHt.toLocaleString()} FCFA
                </span>
                {/* Bouton supprimer */}
                <button
                  onClick={() => handleDeleteClick(item)}
                  disabled={isRemovingProduct}
                  className="mt-1 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Supprimer du stock"
                >
                  <Icon name="trash" size="md" />
                </button>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer ce produit"
        message={productToDelete 
          ? `Voulez-vous vraiment supprimer "${productToDelete.name}" de votre stock ?\n\nQuantite actuelle: ${productToDelete.quantity} unites\n\nCette action est irreversible.`
          : ''
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        isLoading={isRemovingProduct}
      />
    </div>
  );
}
