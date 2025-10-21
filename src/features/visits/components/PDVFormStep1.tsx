import { FileText } from 'lucide-react';
import type { PDVFormData } from '../types/pdv.types';

interface PDVFormStep1Props {
  formData: PDVFormData;
  onChange: (data: Partial<PDVFormData>) => void;
}

export default function PDVFormStep1({ formData, onChange }: PDVFormStep1Props) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Informations de base
      </h2>
      <p className="text-sm text-gray-600 mb-4">Les champs marqués d'un * sont obligatoires</p>
      
      <div className="space-y-4">
        {/* Code PDV */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code PDV (auto-généré)
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => onChange({ code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
            placeholder="Sera généré automatiquement"
            disabled
          />
        </div>

        {/* Nom du PDV */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du point de vente *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: Supermarché Plateau"
          />
        </div>



      </div>
    </div>
  );
}
