import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  onBack?: () => void;
  showBackButton?: boolean;
  sticky?: boolean;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  onBack,
  showBackButton = false,
  sticky = true,
  className = '',
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className={`
        bg-white border-b border-gray-200 px-4 py-4
        ${sticky ? 'sticky top-0 z-10' : ''}
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
