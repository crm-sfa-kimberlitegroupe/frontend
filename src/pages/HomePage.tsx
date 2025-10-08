import { useAuthStore } from '../store/authStore';
import HomeREP from './home/HomeREP';
import UsersManagement from './desktop/UsersManagement';
import DashboardSupervisor from './desktop/DashboardSupervisor';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  
  // Si pas d'utilisateur, ne rien afficher (sera géré par ProtectedRoute)
  if (!user) return null;

  switch (user.role) {
    case 'REP':
      return <HomeREP />;
    case 'ADMIN':
      return <UsersManagement />;
    case 'SUP':
      return <DashboardSupervisor />;
    default:
      return <HomeREP />;
  }
}
