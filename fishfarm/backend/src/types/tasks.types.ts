import { Task } from '@prisma/client';

export type TaskCategory =
  | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEASONAL'
  | 'ONE_TIME' | 'AI_GENERATED';

export type TaskPriority =
  | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatus =
  | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'OVERDUE';

export type RecurrencePattern =
  | 'DAILY' | 'EVERY_2_DAYS' | 'WEEKLY' | 'EVERY_2_WEEKS'
  | 'MONTHLY' | 'QUARTERLY' | 'CUSTOM';

export interface TaskStatusCounts {
  pending: number;
  inProgress: number;
  overdue: number;
  dueToday: number;
  completedThisMonth: number;
}

export interface CompletionStats {
  totalCreated: number;
  totalCompleted: number;
  completionRate: number;
  avgCompletionMinutes: number | null;
  onTimeCompletionRate: number;
  streak: number;
}

export interface CalendarDay {
  date: string;
  tasks: Task[];
  hasOverdue: boolean;
  hasDueToday: boolean;
  hasCompleted: boolean;
  pendingCount: number;
  completedCount: number;
}

export interface AISuggestedTask {
  title: string;
  description: string;
  reason: string;
  priority: TaskPriority;
  category: TaskCategory;
  suggestedDueDate: string;
  estimatedMinutes: number;
  tags: string[];
  aiConfidence: number;
}

export interface TaskStats {
  counts: TaskStatusCounts;
  completionStats: CompletionStats;
  overdueList: Task[];
  dueTodayList: Task[];
  upcomingList: Task[];
  aiSuggestions: AISuggestedTask[];
}

export interface TaskOverview {
  stats: TaskStats;
  recentTasks: Task[];
}

export interface TaskWithUser extends Task {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  pond: {
    id: string;
    name: string;
  } | null;
}
