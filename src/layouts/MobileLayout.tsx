import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNavigation from '../core/components/BottomNavigation';
import DataPreloader from '../core/components/DataPreloader';
import type { UserRole } from '@/core/types';

export default function MobileLayout() {
  // Le rôle sera toujours REP pour ce layout
  const userRole: UserRole = 'REP';
  const [, setIsDataReady] = useState(false);

  useEffect(() => {
    // Vérifier si les données sont déjà préchargées
    const dataPreloaded = localStorage.getItem('dataPreloaded');
    const preloadedAt = localStorage.getItem('dataPreloadedAt');
    
    if (dataPreloaded && preloadedAt) {
      const preloadDate = new Date(preloadedAt);
      const today = new Date();
      
      // Si les données sont d'aujourd'hui, pas besoin de recharger
      if (preloadDate.toDateString() === today.toDateString()) {
        setIsDataReady(true);
      }
    }
  }, []);

  return (
    <DataPreloader onComplete={() => setIsDataReady(true)}>
      <div className="min-h-screen bg-gray-50">
        <Outlet />
        <BottomNavigation userRole={userRole} />
      </div>
    </DataPreloader>
  );
}
