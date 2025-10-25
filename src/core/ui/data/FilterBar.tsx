import { ReactNode } from 'react';

export interface FilterTab {
  key: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface FilterBarProps {
  tabs: FilterTab[];
  selected: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function FilterBar({
  tabs,
  selected,
  onChange,
  className = '',
}: FilterBarProps) {
  return (
    <div className={`flex gap-2 overflow-x-auto pb-2 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap 
            transition-all duration-200 flex items-center gap-2
            ${
              selected === tab.key
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={`
                px-2 py-0.5 rounded-full text-xs font-semibold
                ${selected === tab.key ? 'bg-white/20' : 'bg-gray-200'}
              `}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
