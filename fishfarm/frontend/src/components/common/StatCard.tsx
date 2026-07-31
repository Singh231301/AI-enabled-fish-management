import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  badge?: {
    label: string;
    variant: 'success' | 'warning' | 'danger' | 'info';
  };
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-slate-700',
  iconColor = 'text-slate-400',
  trend,
  badge,
  isLoading = false,
  onClick,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`bg-slate-800 rounded-xl p-5 border border-slate-700 flex flex-col justify-between h-full ${className}`}>
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-slate-700 animate-pulse" />
          <div className="w-24 h-4 bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="mt-4">
          <div className="w-32 h-8 bg-slate-700 rounded animate-pulse" />
          <div className="w-48 h-4 bg-slate-700 rounded animate-pulse mt-2" />
        </div>
      </div>
    );
  }

  const getBadgeColors = (variant: string) => {
    switch (variant) {
      case 'success': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'warning': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'danger': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'info': return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div 
      className={`bg-slate-800 rounded-xl p-5 border border-slate-700 flex flex-col justify-between h-full transition-colors duration-200 ${onClick ? 'cursor-pointer hover:border-sky-500 hover:shadow-lg hover:shadow-sky-900/20' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-3 ${iconBgColor}`}>
          <Icon className={iconColor} size={22} />
        </div>
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide text-right">
          {title}
        </h3>
      </div>
      
      <div className="mt-4">
        <div className="text-2xl font-bold text-white">{value}</div>
        
        {subtitle && (
          <div className="text-sm text-slate-400 mt-1">{subtitle}</div>
        )}
        
        {(trend || badge) && (
          <div className="mt-3 flex items-center">
            {trend && (
              <div className={`flex items-center text-xs font-medium ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
                {trend.positive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {trend.positive ? '+' : ''}{trend.value}%
                <span className="text-slate-500 ml-1 font-normal">{trend.label}</span>
              </div>
            )}
            
            {badge && !trend && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColors(badge.variant)}`}>
                {badge.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
