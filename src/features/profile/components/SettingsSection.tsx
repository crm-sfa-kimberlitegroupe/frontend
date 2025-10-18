import Card from '../../../core/ui/Card';

interface SettingsSectionProps {
  settings: {
    darkMode: boolean;
    autoSync: boolean;
    geoLocation: boolean;
    photoQuality: string;
  };
  onUpdate: (settings: Partial<SettingsSectionProps['settings']>) => void;
  userRole: string;
}

export default function SettingsSection({ settings, onUpdate, userRole }: SettingsSectionProps) {
  return (
    <Card className="border border-slate-200">
      <div className="p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-6">Paramètres</h2>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between py-3 cursor-pointer group">
            <span className="text-sm text-slate-700 group-hover:text-slate-900">Mode sombre</span>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => onUpdate({ darkMode: e.target.checked })}
              className="w-4 h-4 text-slate-900 rounded focus:ring-2 focus:ring-slate-900"
            />
          </label>
          
          <label className="flex items-center justify-between py-3 cursor-pointer group">
            <span className="text-sm text-slate-700 group-hover:text-slate-900">Synchronisation auto</span>
            <input
              type="checkbox"
              checked={settings.autoSync}
              onChange={(e) => onUpdate({ autoSync: e.target.checked })}
              className="w-4 h-4 text-slate-900 rounded focus:ring-2 focus:ring-slate-900"
            />
          </label>

          {userRole === 'REP' && (
            <label className="flex items-center justify-between py-3 opacity-50 cursor-not-allowed">
              <span className="text-sm text-slate-700">Géolocalisation</span>
              <input
                type="checkbox"
                checked={settings.geoLocation}
                disabled
                className="w-4 h-4 text-slate-900 rounded"
              />
            </label>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <label className="block text-sm font-medium text-slate-700 mb-3">Qualité des photos</label>
          <div className="space-y-2">
            {[
              { value: 'high', label: 'Haute qualité' },
              { value: 'medium', label: 'Moyenne' },
              { value: 'low', label: 'Économie de données' },
            ].map((quality) => (
              <label key={quality.value} className="flex items-center gap-3 py-2 cursor-pointer">
                <input
                  type="radio"
                  name="photoQuality"
                  value={quality.value}
                  checked={settings.photoQuality === quality.value}
                  onChange={(e) => onUpdate({ photoQuality: e.target.value })}
                  className="w-4 h-4 text-slate-900 focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">{quality.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
