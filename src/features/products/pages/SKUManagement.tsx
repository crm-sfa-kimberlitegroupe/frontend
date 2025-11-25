import React, { useState, useEffect } from 'react';
import { PageHeader, DataTable } from '../../../core/components/desktop';
import { Button, Badge, Card, LoadingSpinner, Alert } from '@/core/ui';
import { useAuthStore } from '../../../core/auth/authStore';
import { 
  Plus, 
  Edit2, 
  Trash2,
  QrCode,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X
} from 'lucide-react';
import {
  productHierarchyService,
  SKU,
} from '../services/productHierarchy.service';
import SKUDialog from '../components/dialogs/SKUDialog';

const SKUManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skus, setSkus] = useState<SKU[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSKU, setSelectedSKU] = useState<SKU | undefined>(undefined);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    loadSKUs();
  }, []);

  const loadSKUs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productHierarchyService.getSKUs();
      setSkus(data.skus || []);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors du chargement des SKUs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSKUs();
  };

  const handleToggleStatus = async (sku: SKU) => {
    try {
      await productHierarchyService.toggleSKUStatus(sku.id);
      await loadSKUs();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce SKU ?')) {
      return;
    }
    
    try {
      await productHierarchyService.deleteSKU(id);
      await loadSKUs();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleOpenDialog = (sku?: SKU) => {
    setSelectedSKU(sku);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSKU(undefined);
  };

  const handleSaveSKU = async (data: Record<string, unknown>) => {
    if (selectedSKU) {
      await productHierarchyService.updateSKU(selectedSKU.id, data);
    } else {
      await productHierarchyService.createSKU(data);
    }
    await loadSKUs(); // Rafraîchir la liste après création/modification
    handleCloseDialog();
  };

  const handleImageClick = (imageUrl: string, title: string) => {
    setSelectedImage({ url: imageUrl, title });
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const filteredSKUs = skus.filter(sku => 
    sku.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sku.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sku.ean?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (sku: SKU) => (
        <div className="flex items-center justify-center">
          {sku.photo ? (
            <button
              onClick={() => handleImageClick(sku.photo!, sku.shortDescription)}
              className="relative group cursor-pointer"
            >
              <img
                src={sku.photo}
                alt={sku.shortDescription}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 transition-transform group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </button>
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'code',
      label: 'Code',
      render: (sku: SKU) => (
        <span className="font-medium text-gray-900">{sku.code}</span>
      )
    },
    {
      key: 'name',
      label: 'Nom',
      render: (sku: SKU) => (
        <div>
          <p className="font-medium text-gray-900">{sku.shortDescription}</p>
          {sku.fullDescription && (
            <p className="text-sm text-gray-500">{sku.fullDescription}</p>
          )}
        </div>
      )
    },
    {
      key: 'barcode',
      label: 'Code-barres',
      render: (sku: SKU) => (
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{sku.ean || '-'}</span>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Prix',
      render: (sku: SKU) => (
        <span className="font-medium">{sku.priceTtc} FCFA</span>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (sku: SKU) => (
        <Badge variant={sku.active ? 'success' : 'secondary'}>
          {sku.active ? 'Actif' : 'Inactif'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (sku: SKU) => (
        <div className="flex gap-2">
          {user?.role === 'SUP' && (
            <button
              onClick={() => handleOpenDialog(sku)}
              className="p-2 text-gray-600 hover:text-sky-600 transition-colors"
              title="Modifier"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleToggleStatus(sku)}
            className="p-2 text-gray-600 hover:text-sky-600 transition-colors"
            title={sku.active ? 'Désactiver' : 'Activer'}
          >
            {sku.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          {user?.role === 'SUP' && (
            <button
              onClick={() => handleDelete(sku.id)}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Gestion des SKUs"
        description="Gérez tous les produits finis de votre catalogue"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            {user?.role === 'SUP' && (
              <>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Importer
                </Button>
                <Button variant="primary" onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau SKU
                </Button>
              </>
            )}
          </div>
        }
      />

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <div className="p-6">
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, code ou EAN..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {filteredSKUs.length > 0 ? (
            <DataTable
              data={filteredSKUs}
              columns={columns}
            />
          ) : (
            <div className="text-center py-12">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucun SKU trouvé' : 'Aucun SKU disponible'}
              </h3>
              <p className="text-sm text-gray-500">
                {searchTerm 
                  ? 'Essayez avec d\'autres termes de recherche'
                  : 'Commencez par créer votre premier SKU'
                }
              </p>
              {!searchTerm && user?.role === 'SUP' && (
                <Button variant="primary" className="mt-4" onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le premier SKU
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Dialog SKU */}
      <SKUDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveSKU}
        sku={selectedSKU}
      />

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={handleCloseImageModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={handleCloseImageModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
              <p className="text-white font-medium text-center">{selectedImage.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SKUManagement;
