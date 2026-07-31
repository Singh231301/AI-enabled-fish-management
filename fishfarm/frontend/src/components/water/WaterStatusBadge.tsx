import React from 'react';
import { PHStatus, DOStatus } from '../../types/water.types';
import { PH_STATUS_CONFIG, DO_STATUS_CONFIG } from '../../utils/constants';

interface WaterStatusBadgeProps {
  status: PHStatus | DOStatus;
  value?: number | null;
  type: 'ph' | 'do';
  size?: 'sm' | 'md' | 'lg';
}

export const WaterStatusBadge: React.FC<WaterStatusBadgeProps> = ({
  status,
  value,
  type,
  size = 'md'
}) => {
  const config = type === 'ph'
    ? PH_STATUS_CONFIG[status as PHStatus]
    : DO_STATUS_CONFIG[status as DOStatus];

  if (!config) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgColor} ${config.color} ${'borderColor' in config ? 'border ' + config.borderColor : ''} ${sizeClasses[size]}`}>
      <span>{config.emoji}</span>
      {value !== undefined && value !== null && (
        <span className="font-bold">{value.toFixed(type === 'ph' ? 2 : 1)}{type === 'do' ? ' ppm' : ''}</span>
      )}
      <span>{config.label}</span>
    </span>
  );
};
