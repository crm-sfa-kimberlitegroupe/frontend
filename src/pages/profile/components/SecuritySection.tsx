import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import type { UserRole } from '../../../types';

interface SecuritySectionProps {
  onChangePassword: () => void;
  userRole: UserRole;
  on2FAClick?: () => void;
  is2FAEnabled?: boolean;
}

export default function SecuritySection({ 
  onChangePassword, 
  userRole,
  on2FAClick,
  is2FAEnabled = false
}: SecuritySectionProps) {
  return (
    <Card className="border border-slate-200">
      <div className="p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Sécurité</h2>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            fullWidth
            onClick={onChangePassword}
          >
            Changer le mot de passe
          </Button>

          {/* Section 2FA pour ADMIN uniquement */}
          {userRole === 'ADMIN' && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Authentification 2FA</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Sécurité renforcée obligatoire pour les administrateurs
                  </p>
                </div>
                {is2FAEnabled && (
                  <Badge variant="success" size="sm">Actif</Badge>
                )}
              </div>
              
              <Button 
                variant={is2FAEnabled ? "outline" : "primary"}
                fullWidth
                onClick={on2FAClick}
              >
                {is2FAEnabled ? '⚙️ Gérer 2FA' : '🔐 Activer 2FA'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
