import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import { useAuthStore } from '@/core/auth';
import { useVisitsStore } from '@/features/visits/stores/visitsStore';
import { useOrdersStore } from '@/features/orders/stores/ordersStore';
import { useVendorStockStore } from '@/features/vendor-stock/stores/vendorStockStore';
import { useRoutesStore } from '@/features/routes/stores/routesStore';
// import { useStatsStore } from '@/features/stats/stores/statsStore'; // Disponible si besoin
import { weatherService, type WeatherData } from '../../weather/services/weatherService';

// Fonction utilitaire pour calculer la distance entre deux points GPS (formule de Haversine)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Arrondir à 1 décimale
};

export default function HomeREP() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [syncStatus] = useState({
    isOnline: true,
    lastSync: new Date(),
  });
  // Plus besoin d'états locaux - utilisation des stores
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  
  // Récupérer les données depuis les stores (déjà préchargées)
  const { activeVisits } = useVisitsStore();
  const { getTodayOrdersCount, getTodayRevenue, todayOrders } = useOrdersStore();
  const { lowStockItems } = useVendorStockStore();
  const { todayRoute } = useRoutesStore();
  // Les stats sont disponibles si besoin : const { dailyStats, kpiStats } = useStatsStore();


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Plus besoin de charger - les données sont déjà dans les stores

  // Plus besoin de charger - la route est déjà dans le store

  // Obtenir la géolocalisation de l'utilisateur
  useEffect(() => {
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        console.warn('[HomeREP] Géolocalisation non supportée par ce navigateur');
        return;
      }

      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          console.log('[HomeREP] Position obtenue:', { lat: latitude, lng: longitude });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('[HomeREP] Erreur géolocalisation:', error.message);
          setIsLoadingLocation(false);
          // En cas d'erreur, on peut utiliser une position par défaut (Abidjan par exemple)
          // setUserLocation({ lat: 5.3600, lng: -4.0083 }); // Coordonnées d'Abidjan
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache pendant 5 minutes
        }
      );
    };

    getCurrentLocation();
  }, []);

  // Charger les données météo
  useEffect(() => {
    const loadWeather = async () => {
      try {
        setIsLoadingWeather(true);
        let weather: WeatherData;
        
        if (userLocation) {
          // Utiliser la position GPS si disponible
          weather = await weatherService.getWeatherByCoordinates(userLocation.lat, userLocation.lng);
        } else {
          // Sinon utiliser Abidjan par défaut
          weather = await weatherService.getWeatherByCity('Abidjan');
        }
        
        setWeatherData(weather);
      } catch (error) {
        console.error('Erreur lors du chargement de la météo:', error);
        // Utiliser des données par défaut en cas d'erreur
        setWeatherData(weatherService.getDefaultWeather('Abidjan'));
      } finally {
        setIsLoadingWeather(false);
      }
    };

    loadWeather();
  }, [userLocation]); // Se recharge quand la position change

  // Toutes les données sont déjà préchargées dans les stores



  // Calculer les statistiques du jour à partir des vraies données
  const todayStats = React.useMemo(() => {
    // Nombre de PDV à visiter (depuis la route du jour)
    const pdvToVisit = todayRoute?.routeStops?.length || 0;
    
    // Nombre de PDV visités (depuis les visites actives terminées + route stops avec status VISITED)
    const visitedFromActiveVisits = Object.values(activeVisits).filter(visit => visit.status === 'COMPLETED').length;
    const visitedFromRoute = todayRoute?.routeStops?.filter(stop => stop.status === 'VISITED').length || 0;
    const pdvVisited = Math.max(visitedFromActiveVisits, visitedFromRoute);
    
    // Nombre de commandes/ventes du jour (depuis le store des commandes)
    const ordersPlaced = getTodayOrdersCount();
    
    // Chiffre d'affaires du jour (somme des ventes en FCFA)
    const todayRevenue = getTodayRevenue();
    const formattedRevenue = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(todayRevenue);
    
    // Prochaine visite (premier PDV non visité de la route)
    const nextStop = todayRoute?.routeStops?.find(stop => stop.status === 'PLANNED');
    const nextVisit = nextStop?.outlet?.name || 'Aucune visite planifiée';
    
    // Calculer la distance jusqu'au prochain PDV
    let distance = 'N/A';
    if (userLocation && nextStop?.outlet?.lat && nextStop?.outlet?.lng) {
      const distanceKm = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        nextStop.outlet.lat, 
        nextStop.outlet.lng
      );
      distance = `${distanceKm} km`;
    } else if (isLoadingLocation) {
      distance = 'Localisation...';
    } else if (!userLocation) {
      distance = 'Position indisponible';
    } else if (!nextStop?.outlet?.lat || !nextStop?.outlet?.lng) {
      distance = 'Coordonnées PDV manquantes';
    }
    
    return {
      pdvToVisit,
      pdvVisited,
      ordersPlaced,
      revenue: formattedRevenue,
      nextVisit,
      distance,
    };
  }, [todayRoute, activeVisits, userLocation, isLoadingLocation, todayOrders, getTodayOrdersCount, getTodayRevenue]);


  // Créer les notifications à partir des alertes de stock
  const notifications = lowStockItems.map((item, index) => {
    // Utiliser la structure réelle des données : shortDescription
    const productName = item.sku?.shortDescription || 'Produit inconnu';
    
    return {
      id: index + 1,
      type: 'warning' as const,
      message: `Stock faible: ${productName} (${item.quantity} restant${item.quantity > 1 ? 's' : ''})`,
      time: 'maintenant',
      skuId: item.id
    };
  });

  const progressPercentage = Math.round((todayStats.pdvVisited / todayStats.pdvToVisit) * 100);

  return (
    <div className="pb-nav-safe px-4 bg-gray-50 min-h-screen">
      {/* En-tête sobre et professionnel */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Bonjour, {user?.firstName || 'Vendeur'}!
            </h1>
            <p className="text-gray-600 text-sm">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${syncStatus.isOnline ? 'bg-success animate-pulse' : 'bg-danger'}`} />
              <span className="text-xs text-gray-600">
                {syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Résumé de la journée - Design sobre */}
      <Card className="p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ma journée</h2>
          <Badge variant="primary">{progressPercentage}% complété</Badge>
        </div>
        
        {/* Barre de progression élégante */}
        <div className="mb-5">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-sky-600 h-2 rounded-full transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon name="checkCircle" size="lg" variant="primary" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{todayStats.pdvVisited}<span className="text-base text-gray-500">/{todayStats.pdvToVisit}</span></p>
            <p className="text-sm text-gray-600 mt-1">PDV visités</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon name="chartBar" size="lg" variant="green" />
            </div>
            <p className="text-xl font-bold text-gray-900">
              {todayStats.revenue}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Chiffre d'affaires
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {todayStats.ordersPlaced} vente{todayStats.ordersPlaced > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {!todayRoute ? (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-3">
              <Icon name="warning" size="lg" variant="yellow" />
              <div>
                <p className="text-sm font-medium text-gray-900">Aucune route planifiée</p>
                <p className="text-xs text-gray-600">Contactez votre superviseur pour planifier votre journée</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">Prochaine visite</p>
                <p className="font-semibold text-gray-900">{todayStats.nextVisit}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Icon name="locationMarker" size="sm" variant="grey" />
                  <span>{todayStats.distance}</span>
                </div>
              </div>
              <Icon name="arrowRight" size="xl" variant="primary" />
            </div>
          </div>
        )}
      </Card>

      {/* CTA Principal sobre */}
      <div className="space-y-3 mb-6">
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth
          onClick={() => navigate('/dashboard/stock')}
        >
          <Icon name="package" size="lg" className="mr-2" />
          <span className="font-medium">Créer stock pour ma journée</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          fullWidth
        >
          <Icon name="map" size="lg" className="mr-2" />
          <span className="font-medium">Démarrer ma tournée</span>
        </Button>
      </div>


      {/* Alertes de stock */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Alertes de stock</h3>
          {lowStockItems.length > 0 && (
            <button
              onClick={() => navigate('/dashboard/stock')}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Voir tout
            </button>
          )}
        </div>
        
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notif) => (
              <Card key={notif.id} className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate('/dashboard/stock')}>
                <div className="flex items-start gap-3">
                  <Icon 
                    name="warning"
                    size="lg"
                    variant="yellow"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">Cliquez pour gérer votre stock</p>
                  </div>
                  <Icon name="arrowRight" size="sm" variant="grey" />
                </div>
              </Card>
            ))}
            {notifications.length > 3 && (
              <Card className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate('/dashboard/stock')}>
                <div className="text-center">
                  <p className="text-sm text-primary font-medium">
                    +{notifications.length - 3} autre{notifications.length - 3 > 1 ? 's' : ''} alerte{notifications.length - 3 > 1 ? 's' : ''}
                  </p>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Icon name="checkCircle" size="lg" variant="green" />
              <div>
                <p className="text-sm font-medium text-gray-900">Aucune alerte de stock</p>
                <p className="text-xs text-gray-600">Votre stock est en bon état</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Informations complémentaires */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {isLoadingWeather ? (
              <Icon name="refresh" size="md" variant="grey" className="animate-spin" />
            ) : (
              <Icon name="map" size="md" variant="primary" />
            )}
            <p className="text-xs text-gray-600 font-medium">
              {isLoadingWeather ? 'Chargement...' : `Météo ${weatherData?.city || 'Abidjan'}`}
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoadingWeather ? '--°C' : `${weatherData?.temperature || '--'}°C`}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {isLoadingWeather ? 'Chargement...' : weatherData?.description || 'Indisponible'}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="refresh" size="md" variant="primary" />
            <p className="text-xs text-gray-600 font-medium">Dernière synchro</p>
          </div>
          <p className="text-sm text-gray-900 font-medium mb-2">
            {syncStatus.lastSync.toLocaleTimeString('fr-FR')}
          </p>
          <Button variant="outline" size="sm" fullWidth className="text-xs">
            Synchroniser
          </Button>
        </Card>
      </div>

      {/* Actions rapides - design cohérent */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions rapides</h3>
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => navigate('/dashboard/visits')}
            className="text-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="mb-2 flex justify-center">
              <Icon name="store" size="2xl" variant="primary" />
            </div>
            <p className="text-xs font-medium text-gray-700">Nouveau PDV</p>
          </button>
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <Icon name="phone" size="2xl" variant="primary" />
            </div>
            <p className="text-xs font-medium text-gray-700">Support</p>
          </div>
        </div>
      </Card>

      {/* Espacement pour éviter que le contenu soit masqué par la bottom navigation */}
      <div className="pb-20"></div>
    </div>
  );
}
