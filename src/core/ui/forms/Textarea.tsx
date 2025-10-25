import { forwardRef, TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      showCharCount = false,
      maxLength,
      className = '',
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'px-3 py-2 border rounded-lg text-sm transition-colors resize-y';
    const stateClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-primary focus:ring-primary';
    const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
    const widthClasses = fullWidth ? 'w-full' : '';

    const currentLength = value ? String(value).length : 0;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <textarea
            ref={ref}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            className={`
              ${baseClasses}
              ${stateClasses}
              ${disabledClasses}
              ${widthClasses}
              ${className}
              focus:outline-none focus:ring-2 focus:ring-opacity-50
            `}
            {...props}
          />
          
          {error && (
            <div className="absolute right-3 top-3 text-red-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex-1">
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            
            {helperText && !error && (
              <p className="text-xs text-gray-500">{helperText}</p>
            )}
          </div>
          
          {showCharCount && maxLength && (
            <p className={`text-xs ml-2 ${currentLength > maxLength ? 'text-red-500' : 'text-gray-500'}`}>
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
