import { useAuthStore } from '../store/authStore';
import ProfilePageAdmin from './admin/ProfilePageAdmin';
import ProfilePageNew from './profile/ProfilePageNew';

export default function ProfileRouter() {
  const user = useAuthStore((state) => state.user);

  // Rediriger vers la bonne page de profil selon le rôle
  if (user?.role === 'ADMIN') {
    return <ProfilePageAdmin />;
  }

  // Pour REP et SUP, utiliser ProfilePageNew (qui contient déjà les performances et sync)
  return <ProfilePageNew />;
}
