import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              disabled={disabled}
              className="sr-only peer"
              {...props}
            />
            <div
              className={`
                w-5 h-5 border-2 rounded transition-all cursor-pointer
                ${error ? 'border-red-500' : 'border-gray-300'}
                ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                peer-checked:bg-primary peer-checked:border-primary
                peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-opacity-50
                ${className}
              `}
            >
              <Check className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
        
        {(label || helperText || error) && (
          <div className="ml-3 flex-1">
            {label && (
              <label className="text-sm font-medium text-gray-700 cursor-pointer">
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            
            {error && (
              <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
            
            {helperText && !error && (
              <p className="mt-1 text-xs text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
