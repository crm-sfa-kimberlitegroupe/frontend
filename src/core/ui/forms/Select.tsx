import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder = 'Sélectionner...',
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'px-3 py-2 pr-10 border rounded-lg text-sm transition-colors appearance-none';
    const stateClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-primary focus:ring-primary';
    const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer';
    const widthClasses = fullWidth ? 'w-full' : '';

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={`
              ${baseClasses}
              ${stateClasses}
              ${disabledClasses}
              ${widthClasses}
              ${className}
              focus:outline-none focus:ring-2 focus:ring-opacity-50
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {error ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
