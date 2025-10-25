import type { ReactNode } from 'react';
import type { LucideProps } from 'lucide-react';
import Button from '../Button';

export interface EmptyStateProps {
  icon?: React.ComponentType<LucideProps>;
  title: string;
  description?: string;
  action?: {
    label: string;    
    onClick: () => void;
    icon?: ReactNode;
  };  
  children?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>
      )}
      
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
      
      {children}
    </div>
  );
}
