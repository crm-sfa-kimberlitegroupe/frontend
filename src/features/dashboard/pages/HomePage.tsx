import { useAuthStore } from '@/core/auth';
import HomeREP from '../components/HomeREP';
import HomeADMIN from '../components/HomeADMIN';
import HomeSUP from '../components/HomeSUP';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  
  // Si pas d'utilisateur, ne rien afficher (sera géré par ProtectedRoute)
  if (!user) return null;

  switch (user.role) {
    case 'REP':
      return <HomeREP />;
    case 'ADMIN':
      return <HomeADMIN />;
    case 'SUP':
      return <HomeSUP />;
    default:
      return <HomeREP />;
  }
}
