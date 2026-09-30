import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'secondary';
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'outline',
  active = false,
  size = 'md',
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm'
  };

  const variantClasses = {
    solid: 'bg-primary text-primary-foreground hover:bg-sky-deep border-transparent shadow-sm hover:shadow',
    outline: 'border border-primary/40 bg-transparent text-sky-deep dark:text-sky-soft hover:bg-accent/50 hover:border-primary',
    ghost: 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
    secondary: 'bg-muted text-foreground hover:bg-muted/80 border border-border'
  };

  const activeClasses = active
    ? 'bg-primary text-primary-foreground border-primary hover:bg-sky-deep shadow-sm'
    : '';

  return (
    <button
      className={twMerge(
        clsx(
          'micro-label inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          sizeClasses[size],
          variantClasses[variant],
          activeClasses,
          className
        )
      )}
      {...props}
    >
      {children}
    </button>
  );
};
