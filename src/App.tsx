import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages publiques
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Layout principal
import LayoutRouter from './layouts/LayoutRouter';

// Pages SFA CRM
import ProfileRouter from './pages/ProfileRouter';
import HomePage from './pages/HomePage';

// Pages Desktop (ADMIN/SUP)
import { 
  UsersManagement,
  PDVManagement,
  RoutesManagement,
  ProductsManagement,
  TasksManagement,
  PerformancePage,
  TeamPage,
  ReportsPage
} from './pages/desktop';

// Pages anciennes (à garder pour compatibilité)
import SessionsPage from './pages/SessionsPage';

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Mock role - à remplacer par user?.role quand le backend sera prêt

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
          <Route path="pdv" element={<PDVManagement />} />
          <Route path="routes" element={<RoutesManagement />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="tasks" element={<TasksManagement />} />
          
          {/* Routes Desktop - SUP */}
          <Route path="performance" element={<PerformancePage />} />
          <Route path="team" element={<TeamPage />} />
          
          {/* Routes communes ADMIN/SUP */}
          <Route path="reports" element={<ReportsPage />} />
          
          {/* Routes communes */}
          <Route path="profile" element={<ProfileRouter />} />
          
          {/* Pages anciennes */}
          <Route path="sessions" element={<SessionsPage />} />
        </Route>

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
