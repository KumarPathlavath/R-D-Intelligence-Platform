import React from 'react';

interface TrustGaugeProps {
  value: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TrustGauge: React.FC<TrustGaugeProps> = ({
  value,
  color = '#0284c7'
}) => {
  return (
    <div
      className="relative grid size-14 shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(${color} ${value * 3.6}deg, rgba(226, 234, 242, 0.9) 0deg)`
      }}
    >
      <div className="grid size-11 place-items-center rounded-full bg-white dark:bg-slate-900 shadow-sm">
        <span className="text-xs font-extrabold font-mono" style={{ color }}>
          {value}%
        </span>
      </div>
    </div>
  );
};
