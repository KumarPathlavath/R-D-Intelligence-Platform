import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = true,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'glass p-6 transition-all duration-300',
          hover && 'glass-hover',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
