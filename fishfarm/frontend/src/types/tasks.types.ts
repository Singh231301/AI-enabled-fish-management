import { User } from './auth.types';
import { Pond } from './pond.types';

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

export interface Task {
  id: string;
  pondId: string | null;
  userId: string;
  assignedToUserId: string | null;
  title: string;
  description: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  completedDate: string | null;
  completionNote: string | null;
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern | null;
  recurrenceEndDate: string | null;
  recurrenceMaxOccurrences: number | null;
  recurrenceCount: number;
  parentTaskId: string | null;
  reminderDaysBefore: number | null;
  tags: string[];
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  skipReason: string | null;
  isAiGenerated: boolean;
  aiContext: Record<string, any> | null;
  viewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations when included
  user?: Pick<User, 'id' | 'email' | 'fullName'>;
  assignedTo?: Pick<User, 'id' | 'email' | 'fullName'>;
  pond?: Pick<Pond, 'id' | 'name'>;
}

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

export interface CreateTaskDTO {
  pondId?: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority?: TaskPriority;
  dueDate: string;
  assignedToUserId?: string;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: string;
  recurrenceMaxOccurrences?: number;
  reminderDaysBefore?: number;
  tags?: string[];
  estimatedMinutes?: number;
  notes?: string;
}

export interface UpdateTaskDTO extends Partial<Omit<CreateTaskDTO, 'pondId'>> {}

export interface CompleteTaskDTO {
  completionNote?: string;
  completedDate?: string;
  actualMinutes?: number;
  generateNext?: boolean;
}

export interface SkipTaskDTO {
  skipReason: string;
  generateNext?: boolean;
}

export interface TaskListQuery {
  pondId?: string;
  status?: TaskStatus | 'ALL';
  category?: TaskCategory | string;
  priority?: TaskPriority | string;
  assignedToUserId?: string;
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}
