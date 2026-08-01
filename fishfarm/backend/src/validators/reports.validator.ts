import { z } from 'zod';

export const reportQuerySchema = z.object({
  pondId: z.string().uuid("Valid pond ID required"),
  startDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), { message: "Invalid start date format" })
    .optional(),
  endDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), { message: "Invalid end date format" })
    .optional(),
  period: z.enum([
    'last_7_days',
    'last_30_days',
    'last_90_days',
    'last_6_months',
    'last_year',
    'current_month',
    'current_year',
    'all_time',
    'custom'
  ]).default('last_30_days'),
  reportType: z.enum([
    'farm_scorecard',
    'harvest_readiness',
    'feeding_analytics',
    'water_quality',
    'financial_summary',
    'growth_analytics',
    'task_completion',
    'full_farm_report'
  ]).default('farm_scorecard'),
  format: z.enum(['json', 'pdf', 'csv']).default('json'),
  includeCharts: z.boolean().default(true),
}).refine(data => {
  if (data.period === 'custom') {
    return data.startDate && data.endDate;
  }
  return true;
}, {
  message: "startDate and endDate required for custom period",
  path: ["startDate"]
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "startDate must be before endDate",
  path: ["endDate"]
});

export const exportQuerySchema = z.object({
  pondId: z.string().uuid("Valid pond ID required"),
  module: z.enum([
    'expenses', 'sales', 'feeding_logs', 'mortality_logs',
    'water_quality_logs', 'growth_samples', 'tasks',
    'inventory_transactions', 'all'
  ]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum([
    'last_7_days', 'last_30_days', 'last_90_days',
    'last_6_months', 'last_year', 'all_time', 'custom'
  ]).default('all_time'),
});

export const scorecardQuerySchema = z.object({
  pondId: z.string().uuid("Valid pond ID required"),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;
export type ExportQuery = z.infer<typeof exportQuerySchema>;
export type ScorecardQuery = z.infer<typeof scorecardQuerySchema>;
