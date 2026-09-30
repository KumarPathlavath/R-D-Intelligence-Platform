import React from 'react';
import { clsx } from 'clsx';

interface ShimmerProps {
  className?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ className }) => {
  return <div className={clsx('shimmer rounded-xl', className)} />;
};
