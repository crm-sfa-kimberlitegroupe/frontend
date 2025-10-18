import { FileText } from 'lucide-react';
import type { PDVFormData } from '../types/pdv.types';
import { CHANNELS } from '../constants/pdv.constants';

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

        {/* Canal de distribution */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Canal de distribution *
          </label>
          <select
            value={formData.channel}
            onChange={(e) => onChange({ channel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Sélectionnez un canal</option>
            {CHANNELS.map((channel) => (
              <option key={channel.value} value={channel.value}>
                {channel.icon} {channel.label}
              </option>
            ))}
          </select>
        </div>

        {/* Segment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Segment (optionnel)
          </label>
          <select
            value={formData.segment}
            onChange={(e) => onChange({ segment: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Sélectionnez un segment</option>
            <option value="A">Segment A - Premium</option>
            <option value="B">Segment B - Standard</option>
            <option value="C">Segment C - Économique</option>
          </select>
        </div>

        {/* Territoire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Territoire *
          </label>
          <input
            type="text"
            value={formData.territoryId}
            onChange={(e) => onChange({ territoryId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: ABIDJAN-PLATEAU"
          />
          <p className="text-xs text-gray-500 mt-1">
            Identifiant du territoire assigné
          </p>
        </div>

      </div>
    </div>
  );
}
