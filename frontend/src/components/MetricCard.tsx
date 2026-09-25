import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  denominator?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'slate';
  onClick?: () => void;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  denominator,
  subtitle,
  badge,
  badgeColor = 'slate',
  onClick,
  icon
}) => {
  const badgeClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200'
  }[badgeColor];

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl p-5 transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-400 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="mt-3 flex items-baseline space-x-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {denominator && <span className="text-sm font-medium text-slate-500">/ {denominator}</span>}
      </div>

      <div className="mt-2 flex items-center justify-between">
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        {badge && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
