import type { ReactNode } from 'react';

export interface SectionProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function Section({
  title,
  subtitle,
  actions,
  children,
  className = '',
  noPadding = false,
}: SectionProps) {
  return (
    <div className={`${noPadding ? '' : 'p-4'} ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="ml-4">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
