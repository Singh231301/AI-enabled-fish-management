import { format } from 'date-fns';
import { getDateFormat, getCurrency, getWeightUnit } from '../stores/settings.store';

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const formatStr = getDateFormat();
    return format(d, formatStr);
  } catch (e) {
    return String(date);
  }
};

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return '-';
  const currency = getCurrency();
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatWeight = (amount: number | null | undefined): string => {
  if (amount == null) return '-';
  const unit = getWeightUnit();
  if (unit === 'grams') {
    return `${(amount * 1000).toLocaleString('en-IN')} g`;
  }
  return `${amount.toLocaleString('en-IN')} kg`;
};
