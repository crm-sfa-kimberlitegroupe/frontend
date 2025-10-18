import { useAuthStore } from '../store/authStore';
import MobileLayout from './MobileLayout';
import DesktopLayout from './DesktopLayout';

export default function LayoutRouter() {
  const user = useAuthStore((state) => state.user);

  // Si pas d'utilisateur, retourner null (sera géré par ProtectedRoute)
  if (!user) {
    return null;
  }

  // REP → Mobile PWA
  // ADMIN/SUP → Desktop Web
  const isMobileRole = user.role === 'REP';

  return isMobileRole ? <MobileLayout /> : <DesktopLayout userRole={user.role} />;
}
