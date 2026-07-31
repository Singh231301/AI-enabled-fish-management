import { User } from '@prisma/client';
import { differenceInDays } from 'date-fns';

export type SafeUser = Omit<User, 'passwordHash'>;

export function sanitizeUser(user: User): SafeUser {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function calculateAreaAcres(lengthFt: number, widthFt: number): number {
  return (lengthFt * widthFt) / 43560;
}

export function calculateBiomassKg(fishCount: number, avgWeightGrams: number): number {
  return (fishCount * avgWeightGrams) / 1000;
}

export function calculateFCR(feedKg: number, weightGainKg: number): number {
  if (weightGainKg === 0) return 0;
  return feedKg / weightGainKg;
}

export function calculateSurvivalRate(stocked: number, dead: number): number {
  if (stocked === 0) return 0;
  return ((stocked - dead) / stocked) * 100;
}

export function getFishAgeDays(stockingDate: Date): number {
  return differenceInDays(new Date(), stockingDate);
}
