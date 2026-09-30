import React from 'react';
import { SourceType } from '../types';
import { SOURCE_CONFIGS } from '../data/mockData';
import { clsx } from 'clsx';

interface SourceBadgeProps {
  source: SourceType | string;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, className }) => {
  const normSource = (source in SOURCE_CONFIGS ? source : 'news') as SourceType;
  const config = SOURCE_CONFIGS[normSource] || SOURCE_CONFIGS.news;

  return (
    <span
      className={clsx(
        'micro-label inline-flex items-center rounded-full px-3 py-1 font-bold text-[11px] tracking-wider uppercase',
        config.pill,
        className
      )}
    >
      {config.label}
    </span>
  );
};
