import { User } from 'lucide-react';
import type { PDVFormData } from '../types/pdv.types';

interface PDVFormStep3Props {
  formData: PDVFormData;
  onChange: (data: Partial<PDVFormData>) => void;
}

export default function PDVFormStep3({ formData, onChange }: PDVFormStep3Props) {
  const handleDayToggle = (day: string) => {
    onChange({
      openDays: {
        ...formData.openDays,
        [day]: !formData.openDays[day as keyof typeof formData.openDays]
      }
    });
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
        <User className="w-5 h-5" />
        Contact et horaires
      </h2>
      <p className="text-sm text-gray-600 mb-4">Informations complémentaires (optionnel)</p>
      
      <div className="space-y-4">
        {/* Propriétaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du propriétaire/gérant
          </label>
          <input
            type="text"
            value={formData.ownerName}
            onChange={(e) => onChange({ ownerName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: M. Kouassi"
          />
        </div>

        {/* Personne de contact */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact principal
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => onChange({ contactPerson: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className="text-lg">🇨🇮</span>
                  <span>+225</span>
                </div>
              </div>
              <input
                type="tel"
                value={formData.contactPhone?.replace('+225 ', '') || ''}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').substring(0, 10);
                  const formatted = cleaned.match(/.{1,2}/g)?.join(' ') || cleaned;
                  onChange({ contactPhone: `+225 ${formatted}` });
                }}
                className="w-full pl-24 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
                placeholder="XX XX XX XX XX"
                maxLength={13}
              />
            </div>
          </div>
        </div>

        {/* Email et ID fiscal */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="email@exemple.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              N° Contribuable
            </label>
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => onChange({ taxId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="CC..."
            />
          </div>
        </div>

        {/* Jours d'ouverture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jours d'ouverture
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(formData.openDays).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`p-2 border-2 rounded-lg text-xs font-medium transition-all ${
                  formData.openDays[day as keyof typeof formData.openDays]
                    ? 'border-success bg-success text-white'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Horaires */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure d'ouverture
            </label>
            <input
              type="time"
              value={formData.openingTime}
              onChange={(e) => onChange({ openingTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure de fermeture
            </label>
            <input
              type="time"
              value={formData.closingTime}
              onChange={(e) => onChange({ closingTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
