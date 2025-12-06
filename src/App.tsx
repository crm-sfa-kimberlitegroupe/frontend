import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/core/auth';
import { ProtectedRoute } from './core/components/ProtectedRoute';
import OfflineIndicator from './core/components/OfflineIndicator';

// Pages publiques
import LoginPage from './features/auth/pages/LoginPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';

// Layout principal
import LayoutRouter from './layouts/LayoutRouter';

// Pages SFA CRM
import ProfileRouter from './features/profile/ProfileRouter';
import HomePage from './features/dashboard/pages/HomePage';
import UnderConstruction from './features/UnderConstruction';
import VisitsPage from './features/visits/pages/VisitsPage';
import DataPage from './features/data/pages/DataPage';
import RouteREP from './features/routes/pages/RouteREP';
import RouteSUP from './features/routes/pages/RouteSUP';
import RouteADMIN from './features/routes/pages/RouteADMIN';
import StockManagement from './features/vendor-stock/pages/StockManagement';
// Pages Desktop (ADMIN/SUP)
import TeamPage from './features/team/pages/TeamPage';
import VisitsADMIN from './features/visits/pages/VisitsADMIN';
import UsersManagement from './features/users/pages/UsersManagement';
import SectorsManagementUnified from './features/territories/pages/SectorsManagementUnified';
import SectorsAssignment from './features/territories/pages/SectorsAssignment';
import TerritoriesManagement from './features/territories/pages/TerritoriesManagement';
import CreateTerritoryWithMap from './features/territories/pages/CreateTerritoryWithMap';
// Pages Produits
import ProductsManagement from './features/products/pages/ProductsManagement';
import ProductsHub from './features/products/pages/ProductsHub';
import ProductHierarchy from './features/products/pages/ProductHierarchy';
import SKUManagement from './features/products/pages/SKUManagement';
// Pages Ventes (Orders)
import { CreateOrderPage } from './features/orders/pages/CreateOrderPageWorking';
import { OrdersListPage } from './features/orders/pages/OrdersListPage';
import { OrderDetailPage } from './features/orders/pages/OrderDetailPage';
// Page Merchandising
import MerchandisingPage from './features/merchandising/pages/MerchandisingPage';
// Page Détail de visite
import VisitDetailPage from './features/visits/pages/VisitDetailPage';

function VisitsPageRoute() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  return <VisitsPage userRole={user.role} />;
}

function DataPageRoute() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  return <DataPage userRole={user.role} />;
}

function RoutePageRoute() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  if (user.role === 'REP') return <RouteREP />;
  if (user.role === 'ADMIN') return <RouteADMIN />;
  if (user.role === 'SUP') return <RouteSUP />;
  // Par défaut, retourner null si rôle inconnu
  return null;
}


function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <OfflineIndicator />
      <Routes>
        {/* Routes publiques */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Routes protégées avec Layout dynamique */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LayoutRouter />
            </ProtectedRoute>
          }
        >
          {/* Page d'accueil (affiche le bon dashboard selon le rôle) */}
          <Route index element={<HomePage />} />
          
          {/* Routes Desktop - ADMIN */}-
          <Route path="users" element={<UsersManagement />} />
          <Route path="pdv" element={<VisitsADMIN />} />
          <Route path="sectors" element={<SectorsManagementUnified />} />
          <Route path="sectors/assignment" element={<SectorsAssignment />} />
          {/*         <Route path="routes" element={<RoutesManagement />} /> */}
          
          {/* Routes Produits - Nouvelles */}
          <Route path="products" element={<ProductsHub />} />
          <Route path="products/hierarchy" element={<ProductHierarchy />} />
          <Route path="products/skus" element={<SKUManagement />} />
          <Route path="products/old" element={<ProductsManagement />} />
          
          <Route path="tasks" element={<UnderConstruction />} />
          
          {/* Routes Desktop - SUP */}
          <Route path="territories" element={<TerritoriesManagement />} />
          <Route path="territories/create-with-map" element={<CreateTerritoryWithMap />} />
          <Route path="performance" element={<UnderConstruction />} />
          <Route path="team" element={<TeamPage />} />
          
          {/* Routes communes ADMIN/SUP - TEMPORAIREMENT DÉSACTIVÉES */}
          <Route path="reports" element={<UnderConstruction />} />
          
          {/* Routes communes */}
          <Route path="profile" element={<ProfileRouter />} />
          <Route path="visits" element={<VisitsPageRoute />} />
          <Route path="visits/detail/:visitId" element={<VisitDetailPage />} />
          <Route path="data" element={<DataPageRoute />} />
          <Route path="route" element={<RoutePageRoute />} />
          <Route path="stock" element={<StockManagement />} />
          
          {/* Routes Ventes (Orders) - REP */}
          <Route path="orders" element={<OrdersListPage />} />
          <Route path="orders/create" element={<CreateOrderPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          
          {/* Route Merchandising */}
          <Route path="merchandising" element={<MerchandisingPage />} />
          
          {/* Pages anciennes - TEMPORAIREMENT DÉSACTIVÉES */}
          <Route path="sessions" element={<UnderConstruction />} />
        </Route>

        {/* Page de connexion sur la racine */}
        <Route path="/" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
