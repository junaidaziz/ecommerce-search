import React from 'react';
import clsx from 'clsx';

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pill?: boolean;
  children: React.ReactNode;
}

const base =
  'inline-flex items-center px-3 py-1 text-xs font-semibold select-none transition-colors';

const variantStyles: Record<BadgeVariant, string> = {
  primary:
    'bg-primary/10 text-primary border border-primary/20 dark:bg-primary-dark/20 dark:text-primary-light',
  secondary:
    'bg-secondary/10 text-secondary border border-secondary/20 dark:bg-secondary-dark/20 dark:text-secondary-light',
  success:
    'bg-success/10 text-success border border-success/20 dark:bg-success-dark/20 dark:text-success-light',
  warning:
    'bg-warning/10 text-warning border border-warning/20 dark:bg-warning-dark/20 dark:text-warning-light',
  danger:
    'bg-danger/10 text-danger border border-danger/20 dark:bg-danger-dark/20 dark:text-danger-light',
  info:
    'bg-info/10 text-info border border-info/20 dark:bg-info-dark/20 dark:text-info-light',
  neutral:
    'bg-neutral/10 text-neutral border border-neutral/20 dark:bg-neutral-dark/20 dark:text-neutral-light',
  outline:
    'border border-primary text-primary bg-transparent dark:border-primary-light dark:text-primary-light',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  pill = true,
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={clsx(
        base,
        variantStyles[variant],
        pill && 'rounded-full',
        !pill && 'rounded-md',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge; 