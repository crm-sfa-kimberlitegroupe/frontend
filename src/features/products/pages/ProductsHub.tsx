import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, StatCard, DashboardGrid } from '../../../core/components/desktop';
import { Card, Badge, Alert } from '@/core/ui';
import { productHierarchyService, type ProductStatistics } from '../services/productHierarchy.service';
import { 
  Package, 
  QrCode, 
  Tag, 
  Users, 
  TrendingUp, 
  Settings,
  ChevronRight,
  Layers
} from 'lucide-react';

interface ProductFeature {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  bgColor: string;
  available: boolean;
  stats?: {
    value: number | string;
    label: string;
  };
}

const ProductsHub: React.FC = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<ProductStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const stats = await productHierarchyService.getStatistics();
      console.log('📊 [ProductsHub] Statistiques chargées:', stats);
      setStatistics(stats);
    } catch (error) {
      console.error('❌ [ProductsHub] Erreur chargement statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const features: ProductFeature[] = [
    {
      title: 'Hiérarchie Produits',
      description: 'Gérer la structure complète des produits',
      icon: Layers,
      path: '/dashboard/products/hierarchy',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      available: true,
      stats: { value: '7', label: 'Niveaux' }
    },
    {
      title: 'Gestion des SKUs',
      description: 'Créer et gérer tous les produits finis',
      icon: QrCode,
      path: '/dashboard/products/skus',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      available: true,
      stats: { value: statistics?.activeSKUs || '--', label: 'SKUs actifs' }
    },
    {
      title: 'Groupes SKU',
      description: 'Assigner des groupes aux vendeurs',
      icon: Users,
      path: '/dashboard/products/groups',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      available: false,
      stats: { value: '--', label: 'Groupes' }
    },
    {
      title: 'Promotions',
      description: 'Gérer les remises sur les produits',
      icon: Tag,
      path: '/dashboard/products/promotions',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      available: false,
      stats: { value: '--', label: 'Actives' }
    },
    {
      title: 'Statistiques',
      description: 'Analyser les performances',
      icon: TrendingUp,
      path: '/dashboard/products/analytics',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      available: false,
      stats: { value: '--', label: 'Rapports' }
    },
    {
      title: 'Paramètres',
      description: 'Configuration globale',
      icon: Settings,
      path: '/dashboard/products/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      available: false,
    },
  ];

  const handleNavigate = (feature: ProductFeature) => {
    if (feature.available) {
      navigate(feature.path);
    }
  };

  return (
    <div>
      <PageHeader
        title="Gestion des Produits"
        description="Centre de contrôle pour la gestion complète du catalogue produits"
      />

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className={`relative overflow-hidden transition-all duration-300 ${
                feature.available 
                  ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => handleNavigate(feature)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  {feature.stats && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {feature.stats.value}
                      </div>
                      <div className="text-xs text-gray-500">
                        {feature.stats.label}
                      </div>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {feature.description}
                </p>
                
                <div className="flex items-center justify-between">
                  {feature.available ? (
                    <span className="text-sm font-medium text-emerald-600">
                      Disponible
                    </span>
                  ) : (
                    <Badge variant="secondary">Bientôt</Badge>
                  )}
                  {feature.available && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info Alert */}
      <Alert variant="info" className="mb-8">
        <div className="flex items-start">
          <Package className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold mb-1">Système de hiérarchie à 7 niveaux</h4>
            <p className="text-sm">
              Notre système utilise une structure hiérarchique complète : Catégorie → Sous-Catégorie →
              Marque → Sous-Marque → Format d'emballage → Taille d'emballage → SKU. Cette structure
              permet une organisation précise et une gestion optimale de votre catalogue produits.
            </p>
          </div>
        </div>
      </Alert>

      {/* Quick Stats */}
      <DashboardGrid columns={4}>
        <StatCard
          title="Catégories"
          value={loading ? '--' : (statistics?.totalCategories || 0)}
          icon={Layers}
        />
        <StatCard
          title="SKUs Actifs"
          value={loading ? '--' : (statistics?.activeSKUs || 0)}
          icon={QrCode}
        />
        <StatCard
          title="Marques"
          value={loading ? '--' : (statistics?.totalBrands || 0)}
          icon={Package}
        />
        <StatCard
          title="Promotions"
          value="--"
          icon={Tag}
        />
      </DashboardGrid>
    </div>
  );
};

export default ProductsHub;
