import Card from '../../../core/ui/Card';

export default function SupportSection() {
  return (
    <Card className="border border-slate-200">
      <div className="p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Support & Aide</h2>
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
            Guide utilisateur
          </button>
          <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
            Contacter le support
          </button>
          <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
            Politique de confidentialité
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-4 text-center">Version 1.2.3</p>
      </div>
    </Card>
  );
}
