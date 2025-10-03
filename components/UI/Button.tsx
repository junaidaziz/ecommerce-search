import React from 'react';
import clsx from 'clsx';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline'
  | 'ghost'
  | 'gradient'
  | 'accent';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  rounded?: boolean;
  shadow?: boolean;
  children: React.ReactNode;
}

const base =
  'inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary focus:ring-primary',
  secondary:
    'bg-secondary text-white hover:bg-secondary-light dark:bg-secondary-dark dark:hover:bg-secondary focus:ring-secondary',
  success:
    'bg-success text-white hover:bg-success-light dark:bg-success-dark dark:hover:bg-success focus:ring-success',
  warning:
    'bg-warning text-white hover:bg-warning-light dark:bg-warning-dark dark:hover:bg-warning focus:ring-warning',
  danger:
    'bg-danger text-white hover:bg-danger-light dark:bg-danger-dark dark:hover:bg-danger focus:ring-danger',
  info:
    'bg-info text-white hover:bg-info-light dark:bg-info-dark dark:hover:bg-info focus:ring-info',
  outline:
    'border border-primary text-primary bg-transparent hover:bg-primary-light/10 dark:border-primary-light dark:text-primary-light focus:ring-primary',
  ghost:
    'bg-transparent text-primary hover:bg-primary-light/10 dark:text-primary-light dark:hover:bg-primary-dark/20 focus:ring-primary',
  gradient:
    'bg-gradient-to-r from-primary via-secondary to-info text-white hover:from-primary-light hover:to-info-light focus:ring-primary',
  accent:
    'relative overflow-hidden bg-gradient-to-r from-fuchsia-600 via-pink-500 to-rose-500 text-white shadow-sm hover:brightness-110 hover:shadow-md focus:ring-fuchsia-500 focus-visible:ring-fuchsia-500 after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)] after:opacity-40 after:transition-opacity hover:after:opacity-60'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  rounded = true,
  shadow = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={clsx(
        base,
        variantStyles[variant],
        sizeStyles[size],
        rounded && 'rounded-full',
        shadow && 'shadow-card dark:shadow-card-dark',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 