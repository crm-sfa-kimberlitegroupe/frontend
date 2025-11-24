/**
 * Composant de préchargement des données
 * Affiche un écran de chargement avec progression
 * pendant le préchargement initial après connexion
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataPreloaderService, type PreloadProgress } from '../services/dataPreloader.service';
import { indexedDBService } from '../services/indexedDB.service';
import { Icon } from '../ui/Icon';
import { useAuthStore } from '../auth';

interface DataPreloaderProps {
  onComplete?: () => void;
  children?: React.ReactNode;
}

export const DataPreloader: React.FC<DataPreloaderProps> = ({ onComplete, children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<PreloadProgress>({
    total: 0,
    loaded: 0,
    percentage: 0,
    currentTask: 'Initialisation...',
    isComplete: false
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      navigate('/login');
      return;
    }

    // Vérifier si les données sont déjà préchargées
    if (dataPreloaderService.isDataPreloaded()) {
      setIsLoading(false);
      onComplete?.();
      return;
    }

    // Lancer le préchargement
    const preloadData = async () => {
      try {
        // Initialiser IndexedDB en premier
        if (indexedDBService.isSupported()) {
          await indexedDBService.init();
          console.log('✅ IndexedDB initialisé');
        } else {
          console.warn('⚠️ IndexedDB non supporté, utilisation du localStorage');
        }

        // S'abonner aux mises à jour de progression
        const unsubscribe = dataPreloaderService.onProgress((progress) => {
          setProgress(progress);
        });

        // Lancer le préchargement
        await dataPreloaderService.preloadAllData();

        // Nettoyer l'abonnement
        unsubscribe();

        // Marquer comme terminé
        setIsLoading(false);
        onComplete?.();
      } catch (err) {
        console.error('Erreur lors du préchargement:', err);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        
        // Permettre de continuer même en cas d'erreur après 2 secondes
        setTimeout(() => {
          setIsLoading(false);
          onComplete?.();
        }, 2000);
      }
    };

    preloadData();
  }, [user, navigate, onComplete]);

  // Si le chargement est terminé, afficher les enfants
  if (!isLoading) {
    return <>{children}</>;
  }

  // Afficher l'écran de chargement
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Logo ou titre de l'application */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="cart" size="2xl" variant="white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SFA Mobile</h1>
          <p className="text-sm text-gray-600 mt-2">Préparation de votre espace de travail...</p>
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{progress.currentTask}</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-primary-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress.percentage}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{progress.loaded} sur {progress.total} éléments</span>
            {progress.isComplete && (
              <span className="text-success font-medium">✓ Terminé</span>
            )}
          </div>
        </div>

        {/* Message d'erreur si nécessaire */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {/* Animation de chargement */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Conseils pendant le chargement */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Astuce:</strong> Une fois le chargement terminé, vous pourrez naviguer dans l'application sans temps d'attente !
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataPreloader;
