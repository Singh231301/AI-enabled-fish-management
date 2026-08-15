import { z } from 'zod';
import { TaskCategory, TaskPriority, TaskStatus } from '@prisma/client';

export const createTaskSchema = z.object({
  pondId: z.string()
    .uuid("Valid pond ID required")
    .optional()
    .nullable(),

  title: z.string()
    .min(3, "Task title must be at least 3 characters")
    .max(200, "Title too long")
    .trim(),

  description: z.string()
    .max(1000, "Description too long")
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),

  category: z.enum([
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'SEASONAL',
    'ONE_TIME',
    'AI_GENERATED'
  ], {
    errorMap: () => ({ message: "Invalid task category" })
  }),

  priority: z.enum([
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
  ], {
    errorMap: () => ({ message: "Invalid priority" })
  }).default('MEDIUM'),

  dueDate: z.string()
    .min(1, "Due date is required")
    .refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid date format"
    }),

  assignedToUserId: z.string()
    .uuid("Invalid user ID")
    .optional()
    .nullable(),

  isRecurring: z.boolean()
    .default(false),

  recurrencePattern: z.enum([
    'DAILY',
    'EVERY_2_DAYS',
    'WEEKLY',
    'EVERY_2_WEEKS',
    'MONTHLY',
    'QUARTERLY',
    'CUSTOM'
  ])
    .optional()
    .nullable(),

  recurrenceEndDate: z.string()
    .optional()
    .nullable()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: "Invalid recurrence end date"
    }),

  recurrenceMaxOccurrences: z.number()
    .int()
    .positive()
    .max(365)
    .optional()
    .nullable(),

  reminderDaysBefore: z.number()
    .int()
    .nonnegative()
    .max(30)
    .optional()
    .nullable()
    .default(1),

  tags: z.array(z.string().max(50))
    .max(5, "Maximum 5 tags")
    .optional()
    .default([]),

  estimatedMinutes: z.number()
    .int()
    .positive()
    .max(1440)
    .optional()
    .nullable(),

  notes: z.string()
    .max(500)
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
})
.refine(data => {
  if (data.isRecurring && !data.recurrencePattern) {
    return false;
  }
  return true;
}, {
  message: "Recurrence pattern required when task is recurring",
  path: ["recurrencePattern"]
});

const baseTaskSchema = z.object({
  pondId: z.string().uuid("Invalid pond ID").optional().nullable(),
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional().nullable(),
  category: z.nativeEnum(TaskCategory),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid due date format" }),
  assignedToUserId: z.string().uuid().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(['DAILY', 'EVERY_2_DAYS', 'WEEKLY', 'EVERY_2_WEEKS', 'MONTHLY', 'QUARTERLY', 'CUSTOM']).optional().nullable(),
  recurrenceEndDate: z.string().optional().nullable().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid datetime" }),
  recurrenceMaxOccurrences: z.number().int().min(1).max(100).optional().nullable(),
  reminderDaysBefore: z.number().int().min(0).max(30).optional().nullable(),
  tags: z.array(z.string()).max(10).optional(),
  estimatedMinutes: z.number().int().min(1).max(1440).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional().nullable()
});

export const updateTaskSchema = baseTaskSchema.omit({ pondId: true }).partial().refine(
  data => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

export const completeTaskSchema = z.object({
  completionNote: z.string()
    .max(500)
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),

  completedDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid date format"
    })
    .default(() => new Date().toISOString()),

  actualMinutes: z.number()
    .int()
    .positive()
    .max(1440)
    .optional()
    .nullable(),

  generateNext: z.boolean()
    .default(true),
});

export const skipTaskSchema = z.object({
  skipReason: z.string()
    .min(3, "Please provide a reason for skipping")
    .max(200),

  generateNext: z.boolean()
    .default(true),
});

export const taskListQuerySchema = z.object({
  pondId: z.string().uuid().optional(),
  status: z.enum([
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'OVERDUE', 'ALL'
  ]).default('ALL'),
  category: z.string().optional(),
  priority: z.string().optional(),
  assignedToUserId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isRecurring: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
  sortBy: z.enum(['dueDate', 'priority', 'createdAt', 'title'])
    .default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const aiSuggestTasksQuerySchema = z.object({
  pondId: z.string().uuid("Valid pond ID required"),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;
export type CompleteTaskDTO = z.infer<typeof completeTaskSchema>;
export type SkipTaskDTO = z.infer<typeof skipTaskSchema>;
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
