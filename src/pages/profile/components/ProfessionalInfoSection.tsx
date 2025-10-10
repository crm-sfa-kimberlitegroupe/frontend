import Card from '../../../components/ui/Card';

interface ProfessionalInfoSectionProps {
  territory: string;
  employeeId: string;
  hireDate: string;
  manager: string;
}

export default function ProfessionalInfoSection({ 
  territory, 
  employeeId, 
  hireDate, 
  manager 
}: ProfessionalInfoSectionProps) {
  return (
    <Card className="border border-slate-200">
      <div className="p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-6">Informations professionnelles</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Territoire</span>
            <span className="text-sm font-medium text-slate-900">{territory}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Matricule</span>
            <span className="text-sm font-medium text-slate-900">{employeeId}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Date d'embauche</span>
            <span className="text-sm font-medium text-slate-900">
              {new Date(hireDate).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600">Manager</span>
            <span className="text-sm font-medium text-slate-900">{manager}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
