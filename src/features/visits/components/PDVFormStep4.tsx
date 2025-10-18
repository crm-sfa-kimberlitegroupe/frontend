import { BarChart3, ParkingCircle, Snowflake, Refrigerator, Banknote, Smartphone, CreditCard, FileText } from 'lucide-react';
import type { PDVFormData } from '../types/pdv.types';
import { COMPETITORS } from '../constants/pdv.constants';

interface PDVFormStep4Props {
  formData: PDVFormData;
  onChange: (data: Partial<PDVFormData>) => void;
}

export default function PDVFormStep4({ formData, onChange }: PDVFormStep4Props) {
  const handleCompetitorToggle = (competitor: string) => {
    const current = formData.competitorPresence;
    if (current.includes(competitor)) {
      onChange({
        competitorPresence: current.filter(c => c !== competitor)
      });
    } else {
      onChange({
        competitorPresence: [...current, competitor]
      });
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Caractéristiques
      </h2>
      <p className="text-sm text-gray-600 mb-4">Informations sur le point de vente</p>
      
      <div className="space-y-4">
        {/* Surface et employés */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Surface (m²)
            </label>
            <input
              type="number"
              value={formData.surfaceArea}
              onChange={(e) => onChange({ surfaceArea: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: 150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre d'employés
            </label>
            <input
              type="number"
              value={formData.employeeCount}
              onChange={(e) => onChange({ employeeCount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: 5"
            />
          </div>
        </div>

        {/* Affluence */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Affluence mensuelle estimée
          </label>
          <select
            value={formData.monthlyFootfall}
            onChange={(e) => onChange({ monthlyFootfall: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Sélectionner</option>
            <option value="low">Faible (&lt; 500 clients)</option>
            <option value="medium">Moyenne (500-2000)</option>
            <option value="high">Élevée (2000-5000)</option>
            <option value="very_high">Très élevée (&gt; 5000)</option>
          </select>
        </div>

        {/* Équipements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Équipements disponibles
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.hasParking}
                onChange={(e) => onChange({ hasParking: e.target.checked })}
                className="w-5 h-5 text-primary rounded"
              />
              <span className="text-sm flex items-center gap-2">
                <ParkingCircle className="w-4 h-4" />
                Parking disponible
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.hasAC}
                onChange={(e) => onChange({ hasAC: e.target.checked })}
                className="w-5 h-5 text-primary rounded"
              />
              <span className="text-sm flex items-center gap-2">
                <Snowflake className="w-4 h-4" />
                Climatisation
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.hasRefrigeration}
                onChange={(e) => onChange({ hasRefrigeration: e.target.checked })}
                className="w-5 h-5 text-primary rounded"
              />
              <span className="text-sm flex items-center gap-2">
                <Refrigerator className="w-4 h-4" />
                Équipement frigorifique
              </span>
            </label>
          </div>
        </div>

        {/* Moyens de paiement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Moyens de paiement acceptés
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.paymentMethods.cash}
                onChange={(e) => onChange({
                  paymentMethods: { ...formData.paymentMethods, cash: e.target.checked }
                })}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm flex items-center gap-2">
                <Banknote className="w-4 h-4" />
                Espèces
              </span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.paymentMethods.mobileMoney}
                onChange={(e) => onChange({
                  paymentMethods: { ...formData.paymentMethods, mobileMoney: e.target.checked }
                })}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Mobile Money
              </span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.paymentMethods.card}
                onChange={(e) => onChange({
                  paymentMethods: { ...formData.paymentMethods, card: e.target.checked }
                })}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Carte bancaire
              </span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.paymentMethods.credit}
                onChange={(e) => onChange({
                  paymentMethods: { ...formData.paymentMethods, credit: e.target.checked }
                })}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                À crédit
              </span>
            </label>
          </div>
        </div>

        {/* Concurrence */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Présence concurrente
          </label>
          <div className="space-y-2">
            {COMPETITORS.map((competitor) => (
              <label 
                key={competitor}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.competitorPresence.includes(competitor)}
                  onChange={() => handleCompetitorToggle(competitor)}
                  className="w-5 h-5 text-primary rounded"
                />
                <span className="text-sm">{competitor}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes additionnelles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes et observations
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            placeholder="Informations complémentaires, particularités du PDV..."
          />
        </div>
      </div>
    </div>
  );
}
