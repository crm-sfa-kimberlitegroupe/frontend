import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface SecuritySectionProps {
  onChangePassword: () => void;
}

export default function SecuritySection({ onChangePassword }: SecuritySectionProps) {
  return (
    <Card className="border border-slate-200">
      <div className="p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Sécurité</h2>
        <Button 
          variant="outline" 
          fullWidth
          onClick={onChangePassword}
        >
          Changer le mot de passe
        </Button>
      </div>
    </Card>
  );
}
