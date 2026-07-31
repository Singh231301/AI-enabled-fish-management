import { z } from 'zod';

export const createFeedingLogSchema = z.object({
  pondId: z.string()
    .uuid("Valid pond ID required"),

  feedDate: z.string()
    .min(1, "Feed date is required")
    .refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid date format"
    })
    .refine(val => new Date(val) <= new Date(), {
      message: "Feed date cannot be in the future"
    }),

  feedTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Invalid time format (use HH:MM)"
    })
    .optional()
    .nullable(),

  feedBrand: z.string()
    .max(100)
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),

  feedType: z.enum([
    'FLOATING_PELLET',
    'SINKING_PELLET',
    'MIXED',
    'POWDER',
    'NATURAL',
    'OTHER'
  ], {
    errorMap: () => ({ message: "Invalid feed type" })
  }),

  quantityGrams: z.number({
    required_error: "Feed quantity is required",
    invalid_type_error: "Must be a number"
  })
    .positive("Quantity must be positive")
    .max(50000, "Quantity seems too high — please verify")
    .multipleOf(0.1, "Max 1 decimal place"),

  finishTimeMinutes: z.number()
    .positive("Must be positive")
    .max(120, "Finish time seems too long")
    .optional()
    .nullable(),

  leftoverObserved: z.boolean()
    .default(false),

  fishResponse: z.enum([
    'EXCELLENT',
    'GOOD',
    'FAIR',
    'POOR',
    'REFUSED'
  ], {
    errorMap: () => ({ message: "Fish response is required" })
  }),

  notes: z.string()
    .max(500)
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
}).refine(data => {
  return true;
}, { message: "" });

export const updateFeedingLogSchema = z.object({
  feedDate: z.string().optional(),
  feedTime: z.string().optional().nullable(),
  feedBrand: z.string().optional().nullable(),
  feedType: z.enum(['FLOATING_PELLET', 'SINKING_PELLET', 'MIXED', 'POWDER', 'NATURAL', 'OTHER']).optional(),
  quantityGrams: z.number().positive().optional(),
  finishTimeMinutes: z.number().positive().optional().nullable(),
  leftoverObserved: z.boolean().optional(),
  fishResponse: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'REFUSED']).optional(),
  notes: z.string().optional().nullable(),
}).refine((data: any) => Object.keys(data).length > 0, {
  message: "At least one field must be provided"
});

export const createFeedingScheduleSchema = z.object({
  pondId: z.string().uuid("Valid pond ID required"),

  morningTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Invalid time format (HH:MM)"
    })
    .optional()
    .nullable(),

  eveningTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Invalid time format (HH:MM)"
    })
    .optional()
    .nullable(),

  feedsPerDay: z.number()
    .int()
    .min(1, "Must feed at least once per day")
    .max(4, "More than 4 feeds per day is unusual")
    .default(2),

  reminderEnabled: z.boolean().default(true),
  isActive: z.boolean().default(true),

  notes: z.string()
    .max(500)
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
}).refine(data => {
  if (!data.morningTime && !data.eveningTime) {
    return false;
  }
  return true;
}, {
  message: "At least one feeding time (morning or evening) is required",
  path: ["morningTime"]
});

export const updateFeedingScheduleSchema = z.object({
  morningTime: z.string().optional().nullable(),
  eveningTime: z.string().optional().nullable(),
  feedsPerDay: z.number().optional(),
  reminderEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export const feedingListQuerySchema = z.object({
  pondId: z.string().uuid(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  feedType: z.string().optional(),
  fishResponse: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const feedingStatsQuerySchema = z.object({
  pondId: z.string().uuid(),
  period: z.enum(['7d', '30d', '90d', 'all']).default('30d'),
});

export type CreateFeedingLogDTO = z.infer<typeof createFeedingLogSchema>;
export type UpdateFeedingLogDTO = z.infer<typeof updateFeedingLogSchema>;
export type CreateFeedingScheduleDTO = z.infer<typeof createFeedingScheduleSchema>;
export type UpdateFeedingScheduleDTO = z.infer<typeof updateFeedingScheduleSchema>;
export type FeedingListQuery = z.infer<typeof feedingListQuerySchema>;
export type FeedingStatsQuery = z.infer<typeof feedingStatsQuerySchema>;
