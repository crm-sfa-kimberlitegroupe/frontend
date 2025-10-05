import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-sky-500 active:bg-sky-600',
    secondary: 'bg-secondary text-white hover:bg-green-600 active:bg-green-700',
    success: 'bg-success text-white hover:bg-green-600 active:bg-green-700',
    danger: 'bg-danger text-white hover:bg-red-600 active:bg-red-700',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
}
