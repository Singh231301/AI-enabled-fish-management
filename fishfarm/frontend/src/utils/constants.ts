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

export const INVENTORY_CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  FEED: { label: 'Feed', color: 'blue', icon: 'Fish' },
  CHEMICAL: { label: 'Chemicals & Lime', color: 'indigo', icon: 'FlaskConical' },
  EQUIPMENT: { label: 'Equipment', color: 'orange', icon: 'Wrench' },
  TOOL: { label: 'Tools', color: 'gray', icon: 'Hammer' },
  OTHER: { label: 'Other', color: 'slate', icon: 'Box' }
};

export const TRANSACTION_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PURCHASE: { label: 'Purchase', color: 'green', icon: 'ArrowDownToLine' },
  USAGE: { label: 'Usage', color: 'blue', icon: 'ArrowUpFromLine' },
  ADJUSTMENT: { label: 'Adjustment', color: 'orange', icon: 'SlidersHorizontal' },
  WASTAGE: { label: 'Wastage', color: 'red', icon: 'Trash2' }
};

export const MAINTENANCE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'yellow' },
  COMPLETED: { label: 'Completed', color: 'green' },
  OVERDUE: { label: 'Overdue', color: 'red' },
  SKIPPED: { label: 'Skipped', color: 'gray' }
};

export const STOCK_LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  WELL_STOCKED: { label: 'Well Stocked', color: 'green' },
  ADEQUATE: { label: 'Adequate', color: 'blue' },
  LOW: { label: 'Low Stock', color: 'orange' },
  CRITICAL: { label: 'Critical', color: 'red' },
  OUT_OF_STOCK: { label: 'Out of Stock', color: 'slate' }
};

export const WATER_COLOR_CONFIG: Record<string, Record<string, any>> = {
  CLEAR: { label: 'Clear', color: 'text-blue-400', bgColor: 'bg-blue-500/10', class: 'bg-cyan-100 text-cyan-800 border-cyan-200', emoji: '💧', description: 'Normal water color', risk: 'low' },
  LIGHT_GREEN: { label: 'Light Green', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', class: 'bg-green-100 text-green-800 border-green-200', emoji: '🌿', description: 'Healthy phytoplankton', risk: 'low' },
  DARK_GREEN: { label: 'Dark Green', color: 'text-green-600', bgColor: 'bg-green-600/10', class: 'bg-green-600 text-white border-green-700', emoji: '🦠', description: 'Dense algae bloom', risk: 'medium' },
  BROWN: { label: 'Brown', color: 'text-amber-600', bgColor: 'bg-amber-600/10', class: 'bg-amber-700 text-white border-amber-800', emoji: '🟤', description: 'Muddy or zooplankton', risk: 'medium' },
  CLOUDY: { label: 'Cloudy', color: 'text-slate-400', bgColor: 'bg-slate-500/10', class: 'bg-neutral-200 text-neutral-800 border-neutral-300', emoji: '☁️', description: 'High turbidity', risk: 'high' },
  BLACK: { label: 'Black', color: 'text-zinc-800', bgColor: 'bg-zinc-800/10', class: 'bg-neutral-900 text-white border-neutral-950', emoji: '⚫', description: 'Decomposing matter', risk: 'critical' },
};

// ==========================================
// TASK MANAGEMENT
// ==========================================

export const TASK_CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  DAILY: { label: 'Daily Routine', icon: 'Sun', color: 'bg-blue-100 text-blue-700' },
  WEEKLY: { label: 'Weekly Check', icon: 'Calendar', color: 'bg-purple-100 text-purple-700' },
  MONTHLY: { label: 'Monthly Action', icon: 'CalendarDays', color: 'bg-indigo-100 text-indigo-700' },
  SEASONAL: { label: 'Seasonal', icon: 'CloudRain', color: 'bg-amber-100 text-amber-700' },
  ONE_TIME: { label: 'One Time', icon: 'Target', color: 'bg-slate-100 text-slate-700' },
  AI_GENERATED: { label: 'AI Suggestion', icon: 'Sparkles', color: 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200' },
};

export const TASK_PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200', icon: 'AlertTriangle' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'ChevronsUp' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'ChevronUp' },
  LOW: { label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'Minus' },
};

export const TASK_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'To Do', color: 'bg-slate-100 text-slate-700', icon: 'Circle' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: 'Clock' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: 'CheckCircle2' },
  SKIPPED: { label: 'Skipped', color: 'bg-slate-200 text-slate-500 line-through', icon: 'SkipForward' },
  OVERDUE: { label: 'Overdue', color: 'bg-red-100 text-red-700 font-bold', icon: 'AlertCircle' },
};

export const RECURRENCE_PATTERN_CONFIG: Record<string, { label: string }> = {
  DAILY: { label: 'Daily' },
  EVERY_2_DAYS: { label: 'Every 2 Days' },
  WEEKLY: { label: 'Weekly' },
  EVERY_2_WEEKS: { label: 'Every 2 Weeks' },
  MONTHLY: { label: 'Monthly' },
  QUARTERLY: { label: 'Quarterly' },
  CUSTOM: { label: 'Custom' },
};

export const WATER_SMELL_CONFIG: Record<string, Record<string, any>> = {
  NONE: { label: 'None', color: 'green' },
  MILD: { label: 'Mild', color: 'yellow' },
  STRONG: { label: 'Strong', color: 'orange' },
  FOUL: { label: 'Foul', color: 'red' }
};

export const DO_STATUS_CONFIG: Record<string, Record<string, any>> = {
  OPTIMAL: { label: 'Optimal', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  ACCEPTABLE: { label: 'Acceptable', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  LOW: { label: 'Low', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  CRITICAL: { label: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500/10' }
};

export const PH_STATUS_CONFIG: Record<string, Record<string, any>> = {
  OPTIMAL: { label: 'Optimal', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  ACCEPTABLE: { label: 'Acceptable', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  LOW_DANGER: { label: 'Low (Danger)', color: 'text-red-400', bgColor: 'bg-red-500/10' },
  HIGH_DANGER: { label: 'High (Danger)', color: 'text-red-400', bgColor: 'bg-red-500/10' }
};

export const CHEMICAL_TYPE_CONFIG: Record<string, Record<string, any>> = {
  AGRICULTURAL_LIME: { label: 'Agricultural Lime', color: 'slate' },
  QUICK_LIME: { label: 'Quick Lime', color: 'zinc' },
  DOLOMITE: { label: 'Dolomite', color: 'stone' },
  POTASSIUM_PERMANGANATE: { label: 'Potassium Permanganate', color: 'purple' },
  BLEACHING_POWDER: { label: 'Bleaching Powder', color: 'cyan' },
  SALT: { label: 'Salt', color: 'gray' },
  PROBIOTIC: { label: 'Probiotic', color: 'emerald' },
  OTHER: { label: 'Other', color: 'blue' }
};

Object.values(DO_STATUS_CONFIG).forEach((c: any) => c.emoji = '💧');
Object.values(PH_STATUS_CONFIG).forEach((c: any) => c.emoji = '🧪');
Object.values(WATER_COLOR_CONFIG).forEach((c: any) => { c.emoji = '🎨'; c.risk = 'Low'; c.description = 'Normal'; });
Object.values(WATER_SMELL_CONFIG).forEach((c: any) => { c.emoji = '👃'; c.description = 'Normal'; });
Object.values(CHEMICAL_TYPE_CONFIG).forEach((c: any) => c.emoji = '🧪');
