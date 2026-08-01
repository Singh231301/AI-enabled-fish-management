import { z } from 'zod';

export const sendMessageSchema = z.object({
  pondId: z.string()
    .uuid("Valid pond ID required")
    .optional()
    .nullable(),

  message: z.string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message too long (max 2000 characters)")
    .trim(),

  sessionId: z.string()
    .uuid("Invalid session ID")
    .optional()
    .nullable(),

  language: z.enum(['en', 'hi', 'hinglish'])
    .default('en'),

  includeContext: z.boolean()
    .default(true),

  contextModules: z.array(
    z.enum([
      'fish', 'feeding', 'water', 'financials',
      'inventory', 'tasks', 'weather', 'all'
    ])
  )
    .default(['all']),
});

export const generateBriefingSchema = z.object({
  pondId: z.string()
    .uuid("Valid pond ID required"),

  briefingType: z.enum(['daily', 'weekly', 'alert'])
    .default('daily'),

  forceRegenerate: z.boolean()
    .default(false),
});

export const getDailyBriefingSchema = z.object({
  pondId: z.string().uuid("Valid pond ID required"),
});

export const getWeeklyReportSchema = z.object({
  pondId: z.string().uuid("Valid pond ID required"),
});

export const getInsightsSchema = z.object({
  pondId: z.string().uuid("Valid pond ID required"),
  module: z.enum([
    'fish', 'feeding', 'water', 'financials',
    'inventory', 'tasks', 'all'
  ]).default('all'),
});

export const getChatHistorySchema = z.object({
  pondId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type SendMessageDTO = z.infer<typeof sendMessageSchema>;
export type GenerateBriefingDTO = z.infer<typeof generateBriefingSchema>;
export type GetChatHistoryDTO = z.infer<typeof getChatHistorySchema>;
