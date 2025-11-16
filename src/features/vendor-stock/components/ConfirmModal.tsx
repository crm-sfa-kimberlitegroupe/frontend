import { Icon } from '@/core/ui/Icon';
import Button from '@/core/ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'warning',
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'warning' as const,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmVariant: 'danger' as const
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          confirmVariant: 'warning' as const
        };
      case 'info':
        return {
          icon: 'checkCircle' as const,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmVariant: 'primary' as const
        };
      default:
        return {
          icon: 'warning' as const,
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          confirmVariant: 'warning' as const
        };
    }
  };

  const { icon, iconBg, iconColor, confirmVariant } = getIconAndColors();

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec icône */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
              <Icon name={icon} size="lg" className={iconColor} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {title}
              </h3>
              <div className="text-gray-600 whitespace-pre-line">
                {message}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={confirmVariant}
              fullWidth
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="refresh" size="sm" className="animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
