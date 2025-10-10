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
import UnderConstruction from './pages/UnderConstruction';

// Pages Desktop (ADMIN/SUP)
import { 
  TeamPage
} from './pages/desktop';

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
          
          {/* Routes Desktop - ADMIN - TEMPORAIREMENT DÉSACTIVÉES */}
          <Route path="users" element={<UnderConstruction />} />
          <Route path="pdv" element={<UnderConstruction />} />
          <Route path="routes" element={<UnderConstruction />} />
          <Route path="products" element={<UnderConstruction />} />
          <Route path="tasks" element={<UnderConstruction />} />
          
          {/* Routes Desktop - SUP */}
          <Route path="performance" element={<UnderConstruction />} />
          <Route path="team" element={<TeamPage />} />
          
          {/* Routes communes ADMIN/SUP - TEMPORAIREMENT DÉSACTIVÉES */}
          <Route path="reports" element={<UnderConstruction />} />
          
          {/* Routes communes */}
          <Route path="profile" element={<ProfileRouter />} />
          
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
