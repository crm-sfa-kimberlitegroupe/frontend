import { Icon } from '@/core/ui/Icon';
import Button from '@/core/ui/Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK'
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec icône de succès */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="checkCircle" size="lg" className="text-emerald-600" />
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

        {/* Action */}
        <div className="px-6 pb-6">
          <Button
            variant="success"
            fullWidth
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
