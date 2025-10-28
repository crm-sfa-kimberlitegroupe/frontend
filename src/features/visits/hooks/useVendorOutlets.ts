import { useState, useEffect } from 'react';
import { useAuthStore } from '@/core/auth';
import territoriesService, { type Outlet } from '../../territories/services/territoriesService';

interface VendorOutletsData {
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  sector: {
    id: string;
    code: string;
    name: string;
  } | null;
  outlets: Outlet[];
}

export function useVendorOutlets() {
  const [data, setData] = useState<VendorOutletsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchVendorOutlets = async () => {
      if (!user?.id || user.role !== 'REP') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await territoriesService.getVendorOutlets(user.id);
        setData(result);
      } catch (err: unknown) {
        console.error('Erreur lors de la récupération des PDV:', err);
        const errorMessage = err && typeof err === 'object' && 'response' in err 
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
          : 'Erreur lors de la récupération des PDV';
        setError(errorMessage || 'Erreur lors de la récupération des PDV');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorOutlets();
  }, [user?.id, user?.role]);

  const refetch = async () => {
    if (!user?.id || user.role !== 'REP') return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await territoriesService.getVendorOutlets(user.id);
      setData(result);
    } catch (err: unknown) {
      console.error('Erreur lors de la récupération des PDV:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Erreur lors de la récupération des PDV';
      setError(errorMessage || 'Erreur lors de la récupération des PDV');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    outlets: data?.outlets || [],
    sector: data?.sector,
    vendor: data?.vendor,
    loading,
    error,
    refetch,
  };
}
