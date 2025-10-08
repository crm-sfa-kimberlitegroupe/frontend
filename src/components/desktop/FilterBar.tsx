import { ReactNode } from 'react';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  children: ReactNode;
  onClear?: () => void;
  activeFiltersCount?: number;
}

export default function FilterBar({
  children,
  onClear,
  activeFiltersCount = 0,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filtres</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {onClear && activeFiltersCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}
