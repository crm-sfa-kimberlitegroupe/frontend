import React, { useState, useEffect } from 'react';
import { PageHeader, StatCard, DashboardGrid } from '../../../core/components/desktop';
import { Button, Card, LoadingSpinner, Alert } from '@/core/ui';
import { useAuthStore } from '../../../core/auth/authStore';
import { 
  Plus, 
  Package,
  Tag,
  Box,
  Ruler,
  QrCode,
  RefreshCw
} from 'lucide-react';
import { Tabs, TabPanel } from '../components/Tabs';
import {
  productHierarchyService,
  ProductStatistics,
  Category,
  SubCategory,
  Brand,
  PackFormat,
} from '../services/productHierarchy.service';
import CategoryDialog from '../components/dialogs/CategoryDialog';
import SubCategoryDialog from '../components/dialogs/SubCategoryDialog';
import BrandDialog from '../components/dialogs/BrandDialog';
import PackFormatDialog from '../components/dialogs/PackFormatDialog';
import PackSizeDialog from '../components/dialogs/PackSizeDialog';
import SKUDialog from '../components/dialogs/SKUDialog';

const ProductHierarchy: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<ProductStatistics | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [packFormats, setPackFormats] = useState<PackFormat[]>([]);
  const [packSizes, setPackSizes] = useState<any[]>([]);
  const [skus, setSkus] = useState<any[]>([]);
  
  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subCategoryDialogOpen, setSubCategoryDialogOpen] = useState(false);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [packFormatDialogOpen, setPackFormatDialogOpen] = useState(false);
  const [packSizeDialogOpen, setPackSizeDialogOpen] = useState(false);
  const [skuDialogOpen, setSkuDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingPackFormat, setEditingPackFormat] = useState<PackFormat | null>(null);
  const [editingPackSize, setEditingPackSize] = useState<any | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    console.log('🔄 [ProductHierarchy] Début chargement des données...');
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 [ProductHierarchy] Appel aux APIs...');
      const [stats, cats, subCats, brandsList, formats, sizes, skusData] = await Promise.all([
        productHierarchyService.getStatistics(),
        productHierarchyService.getCategories(),
        productHierarchyService.getSubCategories(),
        productHierarchyService.getBrands(),
        productHierarchyService.getPackFormats(),
        productHierarchyService.getPackSizes(),
        productHierarchyService.getSKUs(),
      ]);
      
      console.log('📊 [ProductHierarchy] Données reçues:', {
        statistics: stats,
        categoriesCount: cats?.length || 0,
        categories: cats,
        subCategoriesCount: subCats?.length || 0,
        subCategories: subCats,
        brandsCount: brandsList?.length || 0,
        brands: brandsList,
        packFormatsCount: formats?.length || 0,
        packFormats: formats,
        packSizesCount: sizes?.length || 0,
        packSizes: sizes,
        skusCount: skusData?.skus?.length || 0,
        skus: skusData?.skus
      });
      
      setStatistics(stats);
      setCategories(cats || []);
      setSubCategories(subCats || []);
      setBrands(brandsList || []);
      setPackFormats(formats || []);
      setPackSizes(sizes || []);
      setSkus(skusData?.skus || []);
      
      console.log('✅ [ProductHierarchy] Données chargées avec succès');
    } catch (err: unknown) {
      console.error('❌ [ProductHierarchy] Erreur lors du chargement des données:', {
        error: err,
        errorMessage: (err as Error)?.message,
        errorResponse: (err as { response?: { data?: any } })?.response?.data
      });
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
      console.log('⏹️ [ProductHierarchy] Fin du chargement des données');
    }
  };

  const handleRefresh = () => {
    console.log('🔄 [ProductHierarchy] Actualisation manuelle des données...');
    loadStatistics();
  };

  const tabs = [
    { id: 'categories', label: 'Catégories', icon: Tag },
    { id: 'brands', label: 'Marques', icon: Package },
    { id: 'formats', label: 'Formats', icon: Box },
    { id: 'sizes', label: 'Tailles', icon: Ruler },
    { id: 'skus', label: 'SKUs', icon: QrCode },
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
        title="Hiérarchie des Produits"
        description="Gérez la structure complète de votre catalogue produits"
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            {user?.role === 'SUP' && (
              <Button 
                variant="primary"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Catégorie
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistiques principales - KPI */}
      {statistics && (
        <div className="mb-8">
          <DashboardGrid columns={4}>
            <StatCard
              title="Catégories"
              value={statistics.totalCategories || 0}
              icon={Tag}
            />
            <StatCard
              title="Marques"
              value={statistics.totalBrands || 0}
              icon={Package}
            />
            <StatCard
              title="Formats"
              value={statistics.totalPackFormats || 0}
              icon={Box}
            />
            <StatCard
              title="SKUs"
              value={statistics.totalSKUs || 0}
              icon={QrCode}
            />
          </DashboardGrid>
        </div>
      )}

      {/* Contenu principal avec tabs */}
      <Card>
        <Tabs tabs={tabs}>
          <TabPanel value="categories" index="categories">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Gestion des Catégories</h3>
                {user?.role === 'SUP' && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingSubCategory(null);
                        setSubCategoryDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Sous-catégorie
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Catégorie
                    </Button>
                  </div>
                )}
              </div>
              
              {categories && categories.length > 0 ? (
                <div className="space-y-6">
                  {categories.map((category) => (
                    <div key={category.id} className="space-y-3">
                      <Card>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{category.name}</h4>
                              <p className="text-sm text-gray-500">{category.code}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              category.active 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {category.active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                          )}
                          {category._count && (
                            <div className="flex gap-2 text-xs text-gray-500">
                              <span>{category._count.subCategories} sous-catégories</span>
                              <span>•</span>
                              <span>{category._count.skus} SKUs</span>
                            </div>
                          )}
                        </div>
                      </Card>
                      
                      {/* Afficher les sous-catégories de cette catégorie */}
                      {subCategories.filter(sub => sub.categoryId === category.id).length > 0 && (
                        <div className="ml-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {subCategories
                            .filter(sub => sub.categoryId === category.id)
                            .map((subCategory) => (
                              <Card key={subCategory.id}>
                                <div className="p-3 bg-gray-50">
                                  <div className="flex justify-between items-start mb-1">
                                    <div>
                                      <h5 className="font-medium text-sm text-gray-900">{subCategory.name}</h5>
                                      <p className="text-xs text-gray-500">{subCategory.code}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                      subCategory.active 
                                        ? 'bg-emerald-100 text-emerald-700' 
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {subCategory.active ? 'Actif' : 'Inactif'}
                                    </span>
                                  </div>
                                  {subCategory.description && (
                                    <p className="text-xs text-gray-600 mt-1">{subCategory.description}</p>
                                  )}
                                </div>
                              </Card>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Alert variant="info">
                  Aucune catégorie. Créez votre première catégorie pour commencer.
                </Alert>
              )}
            </div>
          </TabPanel>

          <TabPanel value="brands" index="brands">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Gestion des Marques</h3>
                {user?.role === 'SUP' && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => {
                      setEditingBrand(null);
                      setBrandDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                )}
              </div>
              
              {brands && brands.length > 0 ? (
                <div className="space-y-6">
                  {subCategories.map((subCategory) => {
                    const subCategoryBrands = brands.filter(brand => brand.subCategoryId === subCategory.id);
                    if (subCategoryBrands.length === 0) return null;
                    
                    return (
                      <div key={subCategory.id} className="space-y-3">
                        <h4 className="font-medium text-gray-900">
                          {subCategory.name} <span className="text-sm text-gray-500">({subCategory.code})</span>
                        </h4>
                        <div className="ml-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {subCategoryBrands.map((brand) => (
                            <Card key={brand.id}>
                              <div className="p-3 bg-blue-50">
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h5 className="font-medium text-sm text-gray-900">{brand.name}</h5>
                                    <p className="text-xs text-gray-500">{brand.code}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                                    brand.active 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {brand.active ? 'Actif' : 'Inactif'}
                                  </span>
                                </div>
                                {brand.description && (
                                  <p className="text-xs text-gray-600 mt-1">{brand.description}</p>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Alert variant="info">
                  Aucune marque. Créez votre première marque pour commencer.
                </Alert>
              )}
            </div>
          </TabPanel>

          <TabPanel value="formats" index="formats">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Gestion des Formats de Pack</h3>
                {user?.role === 'SUP' && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => {
                      setEditingPackFormat(null);
                      setPackFormatDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                )}
              </div>
              
              {packFormats && packFormats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packFormats.map((format) => (
                    <Card key={format.id}>
                      <div className="p-4 bg-purple-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{format.name}</h4>
                            <p className="text-sm text-gray-500">{format.code}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            format.active 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {format.active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        {format.description && (
                          <p className="text-sm text-gray-600">{format.description}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert variant="info">
                  Aucun format de pack. Créez votre premier format pour commencer.
                </Alert>
              )}
            </div>
          </TabPanel>

          <TabPanel value="sizes" index="sizes">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Gestion des Tailles de Pack</h3>
                {user?.role === 'SUP' && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => {
                      setEditingPackSize(null);
                      setPackSizeDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                )}
              </div>
              
              {packSizes && packSizes.length > 0 ? (
                <div className="space-y-6">
                  {packFormats.map((format) => {
                    const formatSizes = packSizes.filter(size => size.packFormatId === format.id);
                    if (formatSizes.length === 0) return null;
                    
                    return (
                      <div key={format.id} className="space-y-3">
                        <h4 className="font-medium text-gray-900">
                          {format.name} <span className="text-sm text-gray-500">({format.code})</span>
                        </h4>
                        <div className="ml-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {formatSizes.map((size) => (
                            <Card key={size.id}>
                              <div className="p-3 bg-indigo-50">
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h5 className="font-medium text-sm text-gray-900">{size.name}</h5>
                                    <p className="text-xs text-gray-500">{size.code}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                                    size.active 
                                      ? 'bg-emerald-100 text-emerald-700' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {size.active ? 'Actif' : 'Inactif'}
                                  </span>
                                </div>
                                {size.description && (
                                  <p className="text-xs text-gray-600 mt-1">{size.description}</p>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Alert variant="info">
                  Aucune taille de pack. Créez votre première taille pour commencer.
                </Alert>
              )}
            </div>
          </TabPanel>

          <TabPanel value="skus" index="skus">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Gestion des SKUs</h3>
                {user?.role === 'SUP' && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => {
                      setSkuDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                )}
              </div>
              
              {skus && skus.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          EAN
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prix HT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prix TTC
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {skus.map((sku) => (
                        <tr key={sku.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {sku.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sku.ean || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {sku.shortDescription}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Number(sku.priceHt || 0).toFixed(2)} FCFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Number(sku.priceTtc || 0).toFixed(2)} FCFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              sku.active 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {sku.active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Alert variant="info">
                  Créez votre premier SKU pour commencer.
                </Alert>
              )}
            </div>
          </TabPanel>
        </Tabs>
      </Card>

      {/* Dialogs */}
      <CategoryDialog
        open={categoryDialogOpen}
        onClose={() => {
          setCategoryDialogOpen(false);
          setEditingCategory(null);
        }}
        onSave={async (data) => {
          console.log('🔧 [ProductHierarchy] Début sauvegarde catégorie:', {
            isEdit: !!editingCategory,
            categoryId: editingCategory?.id,
            data: data
          });

          try {
            if (editingCategory) {
              console.log('✏️ [ProductHierarchy] Mise à jour catégorie:', {
                categoryId: editingCategory.id,
                updateData: data
              });
              
              const updatedCategory = await productHierarchyService.updateCategory(editingCategory.id, data);
              console.log('✅ [ProductHierarchy] Catégorie mise à jour avec succès:', updatedCategory);
              
              // Mettre à jour l'état local
              setCategories(prev => prev.map(cat => 
                cat.id === updatedCategory.id ? updatedCategory : cat
              ));
            } else {
              console.log('➕ [ProductHierarchy] Création nouvelle catégorie:', {
                categoryData: data
              });
              
              const newCategory = await productHierarchyService.createCategory(data);
              console.log('✅ [ProductHierarchy] Catégorie créée avec succès:', newCategory);
              
              // Ajouter à l'état local
              setCategories(prev => [...prev, newCategory]);
            }
            
            console.log('🔄 [ProductHierarchy] Rechargement des statistiques...');
            await loadStatistics();
            console.log('✅ [ProductHierarchy] Sauvegarde catégorie terminée avec succès');
            
            // Fermer le dialog
            setCategoryDialogOpen(false);
            setEditingCategory(null);
            
          } catch (error) {
            console.error('❌ [ProductHierarchy] Erreur lors de la sauvegarde de la catégorie:', {
              error: error,
              errorMessage: error?.message,
              errorResponse: error?.response?.data,
              isEdit: !!editingCategory,
              categoryId: editingCategory?.id
            });
            throw error; // Propager l'erreur pour que le dialog puisse l'afficher
          }
        }}
        category={editingCategory}
      />

      <SubCategoryDialog
        open={subCategoryDialogOpen}
        onClose={() => {
          setSubCategoryDialogOpen(false);
          setEditingSubCategory(null);
        }}
        onSave={async (data) => {
          console.log('🔧 [ProductHierarchy] Début sauvegarde sous-catégorie:', {
            isEdit: !!editingSubCategory,
            subCategoryId: editingSubCategory?.id,
            data: data
          });

          try {
            if (editingSubCategory) {
              console.log('✏️ [ProductHierarchy] Mise à jour sous-catégorie:', {
                subCategoryId: editingSubCategory.id,
                updateData: data
              });
              
              const updatedSubCategory = await productHierarchyService.updateSubCategory(editingSubCategory.id, data);
              console.log('✅ [ProductHierarchy] Sous-catégorie mise à jour avec succès:', updatedSubCategory);
              
              // Mettre à jour l'état local
              setSubCategories(prev => prev.map(subCat => 
                subCat.id === updatedSubCategory.id ? updatedSubCategory : subCat
              ));
            } else {
              console.log('➕ [ProductHierarchy] Création nouvelle sous-catégorie:', {
                subCategoryData: data
              });
              
              const newSubCategory = await productHierarchyService.createSubCategory(data);
              console.log('✅ [ProductHierarchy] Sous-catégorie créée avec succès:', newSubCategory);
              
              // Ajouter à l'état local
              setSubCategories(prev => [...prev, newSubCategory]);
            }
            
            console.log('🔄 [ProductHierarchy] Rechargement des statistiques...');
            await loadStatistics();
            console.log('✅ [ProductHierarchy] Sauvegarde sous-catégorie terminée avec succès');
            
            // Fermer le dialog
            setSubCategoryDialogOpen(false);
            setEditingSubCategory(null);
            
          } catch (error) {
            console.error('❌ [ProductHierarchy] Erreur lors de la sauvegarde de la sous-catégorie:', {
              error: error,
              errorMessage: (error as Error)?.message,
              errorResponse: (error as { response?: { data?: any } })?.response?.data,
              isEdit: !!editingSubCategory,
              subCategoryId: editingSubCategory?.id
            });
            throw error; // Propager l'erreur pour que le dialog puisse l'afficher
          }
        }}
        subCategory={editingSubCategory}
        categories={categories}
      />

      <BrandDialog
        open={brandDialogOpen}
        onClose={() => {
          setBrandDialogOpen(false);
          setEditingBrand(null);
        }}
        onSave={async (data) => {
          console.log('🔧 [ProductHierarchy] Début sauvegarde marque:', {
            isEdit: !!editingBrand,
            brandId: editingBrand?.id,
            data: data
          });

          try {
            if (editingBrand) {
              console.log('✏️ [ProductHierarchy] Mise à jour marque:', {
                brandId: editingBrand.id,
                updateData: data
              });
              
              const updatedBrand = await productHierarchyService.updateBrand(editingBrand.id, data);
              console.log('✅ [ProductHierarchy] Marque mise à jour avec succès:', updatedBrand);
              
              // Mettre à jour l'état local
              setBrands(prev => prev.map(brand => 
                brand.id === updatedBrand.id ? updatedBrand : brand
              ));
            } else {
              console.log('➕ [ProductHierarchy] Création nouvelle marque:', {
                brandData: data
              });
              
              const newBrand = await productHierarchyService.createBrand(data);
              console.log('✅ [ProductHierarchy] Marque créée avec succès:', newBrand);
              
              // Ajouter à l'état local
              setBrands(prev => [...prev, newBrand]);
            }
            
            console.log('🔄 [ProductHierarchy] Rechargement des statistiques...');
            await loadStatistics();
            console.log('✅ [ProductHierarchy] Sauvegarde marque terminée avec succès');
            
            // Fermer le dialog
            setBrandDialogOpen(false);
            setEditingBrand(null);
            
          } catch (error) {
            console.error('❌ [ProductHierarchy] Erreur lors de la sauvegarde de la marque:', {
              error: error,
              errorMessage: (error as Error)?.message,
              errorResponse: (error as { response?: { data?: any } })?.response?.data,
              isEdit: !!editingBrand,
              brandId: editingBrand?.id
            });
            throw error; // Propager l'erreur pour que le dialog puisse l'afficher
          }
        }}
        brand={editingBrand}
        subCategories={subCategories}
      />

      <SKUDialog
        open={skuDialogOpen}
        onClose={() => {
          setSkuDialogOpen(false);
        }}
        onSave={async (data) => {
          console.log('🔧 [ProductHierarchy] Début sauvegarde SKU:', { data });
          
          try {
            console.log('➕ [ProductHierarchy] Création nouveau SKU:', { skuData: data });
            
            const newSKU = await productHierarchyService.createSKU(data);
            console.log('✅ [ProductHierarchy] SKU créé avec succès:', newSKU);
            
            console.log('🔄 [ProductHierarchy] Rechargement des statistiques...');
            await loadStatistics();
            console.log('✅ [ProductHierarchy] Sauvegarde SKU terminée avec succès');
            
            // Fermer le dialog
            setSkuDialogOpen(false);
            
          } catch (error) {
            console.error('❌ [ProductHierarchy] Erreur lors de la sauvegarde du SKU:', {
              error: error,
              errorMessage: (error as Error)?.message,
              errorResponse: (error as { response?: { data?: any } })?.response?.data
            });
            throw error;
          }
        }}
      />

      <PackFormatDialog
        open={packFormatDialogOpen}
        onClose={() => {
          setPackFormatDialogOpen(false);
          setEditingPackFormat(null);
        }}
        onSave={async (data) => {
          console.log('🔧 [ProductHierarchy] Début sauvegarde format:', { data });
          
          try {
            console.log('➕ [ProductHierarchy] Création nouveau format:', { formatData: data });
            
            const newFormat = await productHierarchyService.createPackFormat(data);
            console.log('✅ [ProductHierarchy] Format créé avec succès:', newFormat);
            
            // Ajouter à l'état local
            setPackFormats(prev => [...prev, newFormat]);
            
            console.log('🔄 [ProductHierarchy] Rechargement des statistiques...');
            await loadStatistics();
            console.log('✅ [ProductHierarchy] Sauvegarde format terminée avec succès');
            
            // Fermer le dialog
            setPackFormatDialogOpen(false);
            
          } catch (error) {
            console.error('❌ [ProductHierarchy] Erreur lors de la sauvegarde du format:', {
              error: error,
              errorMessage: (error as Error)?.message,
              errorResponse: (error as { response?: { data?: any } })?.response?.data
            });
            throw error;
          }
        }}
        packFormat={editingPackFormat}
        subBrands={brands}
      />

      <PackSizeDialog
        open={packSizeDialogOpen}
        onClose={() => {
          setPackSizeDialogOpen(false);
          setEditingPackSize(null);
        }}
        onSave={async (data) => {
          console.log('🔧 [ProductHierarchy] Début sauvegarde taille:', { data });
          
          try {
            console.log('➕ [ProductHierarchy] Création nouvelle taille:', { sizeData: data });
            
            const newSize = await productHierarchyService.createPackSize(data);
            console.log('✅ [ProductHierarchy] Taille créée avec succès:', newSize);
            
            // Ajouter à l'état local
            setPackSizes(prev => [...prev, newSize]);
            
            console.log('🔄 [ProductHierarchy] Rechargement des statistiques...');
            await loadStatistics();
            console.log('✅ [ProductHierarchy] Sauvegarde taille terminée avec succès');
            
            // Fermer le dialog
            setPackSizeDialogOpen(false);
            
          } catch (error) {
            console.error('❌ [ProductHierarchy] Erreur lors de la sauvegarde de la taille:', {
              error: error,
              errorMessage: (error as Error)?.message,
              errorResponse: (error as { response?: { data?: any } })?.response?.data
            });
            throw error;
          }
        }}
        packSize={editingPackSize}
        packFormats={packFormats}
      />
    </div>
  );
};

export default ProductHierarchy;
