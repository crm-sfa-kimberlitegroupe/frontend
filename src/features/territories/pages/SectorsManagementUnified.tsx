import { useState, useEffect } from 'react';
import { Grid3x3, Plus, MapIcon, UserPlus, BarChart3 } from 'lucide-react';
import SectorsCreateTab from '../components/SectorsCreateTab';
import SectorsListTab from '../components/SectorsListTab';
import SectorsAssignTab from '../components/SectorsAssignTab';
import SectorsOverviewTab from '../components/SectorsOverviewTab';
import territoriesService, { type Territory, type TerritoryGeoInfo } from '../services/territoriesService';
import outletsService, { type Outlet, OutletStatusEnum } from '../../pdv/services/outletsService';
import usersService from '../../users/services/usersService';
import { useAuthStore } from '@/core/auth';

const showError = (message: string) => alert(`Erreur: ${message}`);

type MainTab = 'create' | 'list' | 'assign' | 'overview';

export default function SectorsManagementUnified() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<MainTab>('create');
  const [loading, setLoading] = useState(false);
  
  const [sectors, setSectors] = useState<Territory[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [userTerritory, setUserTerritory] = useState<Territory | null>(null);
  const [territoryGeoInfo, setTerritoryGeoInfo] = useState<TerritoryGeoInfo | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      if (!user?.territoryId) {
        showError('Aucun territoire assigné');
        return;
      }

      const [sectorsData, territoriesData, outletsData, usersData, geoInfo] = await Promise.all([
        territoriesService.getAllSectors({ level: 'SECTEUR' }),
        territoriesService.getAll(),
        outletsService.getMyTerritoryOutlets({ status: OutletStatusEnum.APPROVED }),
        usersService.getAll(),
        territoriesService.getTerritoryGeoInfo(user.territoryId),
      ]);

      const myTerritory = territoriesData.find(t => t.id === user.territoryId);
      if (!myTerritory) {
        showError('Territoire introuvable');
        return;
      }

      setUserTerritory(myTerritory);
      setSectors(sectorsData.filter(s => s.parentId === myTerritory.id));
      setOutlets(outletsData);
      setVendors(usersData.filter((u: any) => u.role === 'REP' && u.status === 'ACTIVE'));
      setTerritoryGeoInfo(geoInfo);
    } catch (error) {
      console.error('Erreur chargement:', error);
      showError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'create' as MainTab, label: 'Créer', icon: Plus },
    { id: 'list' as MainTab, label: `Mes Secteurs (${sectors.length})`, icon: MapIcon },
    { id: 'assign' as MainTab, label: 'Assignations', icon: UserPlus },
    { id: 'overview' as MainTab, label: 'Vue d\'ensemble', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <Grid3x3 className="inline w-6 h-6 mr-2" />
            Gestion des Secteurs
          </h1>
          <p className="text-sm text-gray-600 mt-1">Créez et gérez vos secteurs commerciaux</p>
        </div>
        {userTerritory && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-xs text-blue-600 font-medium">Votre zone</p>
            <p className="text-sm font-semibold text-blue-900">{userTerritory.name}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu */}
      {activeTab === 'create' && (
        <SectorsCreateTab
          outlets={outlets}
          userTerritory={userTerritory}
          territoryGeoInfo={territoryGeoInfo}
          onSuccess={loadData}
        />
      )}

      {activeTab === 'list' && (
        <SectorsListTab
          sectors={sectors}
          loading={loading}
          onDelete={loadData}
        />
      )}

      {activeTab === 'assign' && (
        <SectorsAssignTab
          sectors={sectors}
          outlets={outlets}
          vendors={vendors}
          onSuccess={loadData}
        />
      )}

      {activeTab === 'overview' && (
        <SectorsOverviewTab />
      )}
    </div>
  );
}
