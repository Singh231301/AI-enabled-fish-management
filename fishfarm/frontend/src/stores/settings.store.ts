import { UserSettings } from '../types/settings.types';

let globalSettings: Partial<UserSettings> = {};

export const setGlobalSettings = (s: Partial<UserSettings>) => {
  globalSettings = s;
};

export const getDateFormat = () => {
  return globalSettings.dateFormat ?? 'dd MMM yyyy';
};

export const getCurrency = () => {
  return globalSettings.currency ?? 'INR';
};

export const getWeightUnit = () => {
  return globalSettings.weightUnit ?? 'kilograms';
};
