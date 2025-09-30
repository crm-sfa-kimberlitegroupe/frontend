import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

type Page = 'login' | 'register' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<unknown>(null);
  const [token, setToken] = useState<string | null>(null);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLoginSuccess = (accessToken: string, userData: unknown) => {
    setToken(accessToken);
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleRegisterSuccess = (accessToken: string, userData: unknown) => {
    setToken(accessToken);
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCurrentPage('login');
  };

  return (
    <>
      {currentPage === 'login' && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setCurrentPage('register')}
        />
      )}
      
      {currentPage === 'register' && (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setCurrentPage('login')}
        />
      )}
      
      {currentPage === 'dashboard' && user && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
