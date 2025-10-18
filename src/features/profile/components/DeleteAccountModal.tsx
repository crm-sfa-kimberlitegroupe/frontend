import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-md border border-slate-200">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">⚠</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Supprimer le compte</h3>
            <p className="text-sm text-slate-600">
              Cette action est irréversible. Toutes vos données seront définitivement supprimées.
            </p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tapez <span className="font-bold">SUPPRIMER</span> pour confirmer
            </label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder="SUPPRIMER"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose}>
              Annuler
            </Button>
            <Button variant="danger" fullWidth onClick={onConfirm}>
              Confirmer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
