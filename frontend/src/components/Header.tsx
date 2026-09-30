import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="mb-7">
      <h1 className="text-3xl sm:text-[34px] font-extrabold text-[#0284c7] tracking-tight leading-tight">
        {title}
      </h1>
      <p className="mt-2.5 text-sm sm:text-[15px] text-[#64748b] dark:text-slate-400 leading-relaxed max-w-3xl">
        {subtitle}
      </p>
    </header>
  );
};
