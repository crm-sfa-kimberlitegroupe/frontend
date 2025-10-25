import type { ReactNode } from 'react';

export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}

export default function FormField({
  label,
  error,
  helperText,
  required,
  children,
  fullWidth = false,
}: FormFieldProps) {
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
