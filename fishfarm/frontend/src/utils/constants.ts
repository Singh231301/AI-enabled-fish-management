import { FeedType, FishResponseType } from '../types/feeding.types';

export const FEED_TYPE_CONFIG: Record<
  FeedType,
  { label: string; emoji: string; color: string }
> = {
  FLOATING_PELLET: {
    label: "Floating Pellet",
    emoji: "🔵",
    color: "text-sky-400"
  },
  SINKING_PELLET: {
    label: "Sinking Pellet",
    emoji: "⬇️",
    color: "text-blue-400"
  },
  MIXED: {
    label: "Mixed",
    emoji: "🔀",
    color: "text-purple-400"
  },
  POWDER: {
    label: "Powder",
    emoji: "🟡",
    color: "text-yellow-400"
  },
  NATURAL: {
    label: "Natural",
    emoji: "🌿",
    color: "text-green-400"
  },
  OTHER: {
    label: "Other",
    emoji: "📦",
    color: "text-slate-400"
  },
};

export const FISH_RESPONSE_CONFIG: Record<
  FishResponseType,
  { label: string; emoji: string; color: string; bgColor: string }
> = {
  EXCELLENT: {
    label: "Excellent",
    emoji: "🌟",
    color: "text-green-400",
    bgColor: "bg-green-500/20"
  },
  GOOD: {
    label: "Good",
    emoji: "✅",
    color: "text-sky-400",
    bgColor: "bg-sky-500/20"
  },
  FAIR: {
    label: "Fair",
    emoji: "⚠️",
    color: "text-amber-400",
    bgColor: "bg-amber-500/20"
  },
  POOR: {
    label: "Poor",
    emoji: "❌",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20"
  },
  REFUSED: {
    label: "Refused",
    emoji: "🚫",
    color: "text-red-400",
    bgColor: "bg-red-500/20"
  },
};
