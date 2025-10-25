import { useState } from 'react';
import { usePWA } from '@/core/hooks/usePWA';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import { Icon } from '../../../core/ui/Icon';

export default function InstallPWA() {
  const { canInstall, isInstalled, isStandalone, promptInstall } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  // MODE TEST: Toujours afficher en développement pour voir l'UI
  const isDevMode = import.meta.env.DEV;
  const shouldShow = isDevMode || (canInstall && !isInstalled && !isStandalone && !isDismissed);

  // Ne rien afficher si déjà installé, en mode standalone, ou si l'utilisateur a fermé
  if (!shouldShow) {
    return null;
  }

  const handleInstall = async () => {
    await promptInstall();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Sauvegarder dans localStorage pour ne plus afficher pendant 7 jours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Vérifier si l'utilisateur a déjà fermé récemment
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) {
      return null;
    }
  }

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 bg-sky-600 rounded-full p-2">
          <Icon name="download" size="lg" className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Installer l'application
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Installez SFA REP sur votre appareil pour un accès rapide et une utilisation hors ligne.
          </p>
          <div className="flex gap-2">
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleInstall}
              className="flex items-center gap-2"
            >
              <Icon name="download" size="md" />
              <span>Installer</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDismiss}
            >
              Plus tard
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <Icon name="x" size="md" />
        </button>
      </div>
      
      {/* Avantages de l'installation */}
      <div className="mt-4 pt-4 border-t border-sky-200">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center">
            <Icon name="lightbulb" size="md" variant="yellow" className="mb-1" />
            <p className="text-xs text-gray-600">Accès rapide</p>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="refresh" size="md" variant="green" className="mb-1" />
            <p className="text-xs text-gray-600">Mode hors ligne</p>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="checkCircle" size="md" variant="primary" className="mb-1" />
            <p className="text-xs text-gray-600">Notifications</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
