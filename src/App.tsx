import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/core/auth';
import { ProtectedRoute } from './core/components/ProtectedRoute';

// Pages publiques
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
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
// Pages Desktop (ADMIN/SUP)
import TeamPage from './features/team/pages/TeamPage';
import VisitsADMIN from './features/visits/pages/VisitsADMIN';
import UsersManagement from './features/users/pages/UsersManagement';
import SectorsManagementUnified from './features/territories/pages/SectorsManagementUnified';
import TerritoriesManagement from './features/territories/pages/TerritoriesManagement';
import CreateTerritoryWithMap from './features/territories/pages/CreateTerritoryWithMap';

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

  // Mock role à remplacer par user?.role quand le backend sera prêt

  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
          
          {/* Routes Desktop - ADMIN */}
          <Route path="users" element={<UsersManagement />} />
          <Route path="pdv" element={<VisitsADMIN />} />
          <Route path="sectors" element={<SectorsManagementUnified />} />
          {/*         <Route path="routes" element={<RoutesManagement />} /> */}
          <Route path="products" element={<UnderConstruction />} />
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
          <Route path="data" element={<DataPageRoute />} />
          <Route path="route" element={<RoutePageRoute />} />
          
          {/* Pages anciennes - TEMPORAIREMENT DÉSACTIVÉES */}
          <Route path="sessions" element={<UnderConstruction />} />
        </Route>

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
