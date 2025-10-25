import type { ReactNode } from 'react';

export interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  fullHeight?: boolean;
}

export default function PageLayout({
  children,
  className = '',
  noPadding = false,
  fullHeight = true,
}: PageLayoutProps) {
  return (
    <div
      className={`
        ${fullHeight ? 'min-h-screen' : ''}
        ${noPadding ? '' : 'pb-20'}
        bg-gray-50
        ${className}
      `}
    >
      {children}
    </div>
  );
}
