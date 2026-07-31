import { FeedType, FishResponseType } from '../types/feeding.types';
import { ExpenseCategory, PaymentMethod, PaymentStatus } from '../types/financials.types';

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

export const EXPENSE_CATEGORY_CONFIG: Record<
  Exclude<ExpenseCategory, 'TOTAL'>,
  { label: string; emoji: string; color: string; bgColor: string }
> = {
  FINGERLINGS: {
    label: "Fingerlings",
    emoji: "🐟",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10"
  },
  FEED: {
    label: "Fish Feed",
    emoji: "🌾",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10"
  },
  CHEMICALS_LIME: {
    label: "Chemicals & Lime",
    emoji: "🧪",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10"
  },
  EQUIPMENT: {
    label: "Equipment",
    emoji: "⚙️",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10"
  },
  LABOR: {
    label: "Labor",
    emoji: "👷",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10"
  },
  FENCING_INFRASTRUCTURE: {
    label: "Infrastructure",
    emoji: "🚧",
    color: "text-stone-400",
    bgColor: "bg-stone-500/10"
  },
  TRANSPORT: {
    label: "Transport",
    emoji: "🚚",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10"
  },
  MISCELLANEOUS: {
    label: "Miscellaneous",
    emoji: "📦",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10"
  }
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: { label: "Pending", color: "text-red-400", bgColor: "bg-red-500/10" },
  PARTIAL: { label: "Partial", color: "text-amber-400", bgColor: "bg-amber-500/10" },
  COMPLETED: { label: "Completed", color: "text-green-400", bgColor: "bg-green-500/10" }
};

export const PAYMENT_METHOD_CONFIG: Record<
  PaymentMethod,
  { label: string; icon: string }
> = {
  CASH: { label: "Cash", icon: "💵" },
  UPI: { label: "UPI", icon: "📱" },
  BANK_TRANSFER: { label: "Bank Transfer", icon: "🏦" },
  CREDIT: { label: "Credit", icon: "💳" },
  OTHER: { label: "Other", icon: "🧾" }
};
