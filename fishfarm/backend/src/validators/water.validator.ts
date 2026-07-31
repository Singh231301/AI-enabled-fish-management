import { z } from 'zod';

export const createWaterQualityLogSchema = z.object({
  pondId: z.string()
    .uuid("Valid pond ID required"),

  logDate: z.string()
    .min(1, "Log date is required")
    .refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid date format"
    })
    .refine(val => new Date(val) <= new Date(), {
      message: "Log date cannot be in the future"
    }),

  logTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Invalid time format (use HH:MM)"
    })
    .optional()
    .nullable(),

  phValue: z.number()
    .min(0, "pH cannot be below 0")
    .max(14, "pH cannot exceed 14")
    .multipleOf(0.01, "Max 2 decimal places")
    .optional()
    .nullable(),

  waterLevelFt: z.number()
    .positive("Water level must be positive")
    .max(50, "Water level seems too high")
    .optional()
    .nullable(),

  waterColor: z.enum([
    'CLEAR',
    'LIGHT_GREEN',
    'DARK_GREEN',
    'BROWN',
    'CLOUDY',
    'BLACK'
  ], {
    errorMap: () => ({ message: "Select a valid water color" })
  }),

  waterSmell: z.enum([
    'NONE',
    'MILD',
    'STRONG',
    'FOUL'
  ], {
    errorMap: () => ({ message: "Select a valid smell level" })
  }),

  temperatureCelsius: z.number()
    .min(-5, "Temperature seems too low")
    .max(50, "Temperature seems too high")
    .optional()
    .nullable(),

  dissolvedOxygenPpm: z.number()
    .min(0, "DO cannot be negative")
    .max(20, "DO level seems too high")
    .multipleOf(0.01)
    .optional()
    .nullable(),

  turbidity: z.string()
    .max(100)
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),

  dataSource: z.enum(['MANUAL', 'SENSOR'])
    .default('MANUAL'),

  notes: z.string()
    .max(1000)
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
})
.refine(data => {
  return true;
}, { message: "" });

export const updateWaterQualityLogSchema = z.object({
  logDate: z.string().optional(),
  logTime: z.string().optional().nullable(),
  phValue: z.number().optional().nullable(),
  waterLevelFt: z.number().optional().nullable(),
  waterColor: z.enum(['CLEAR','LIGHT_GREEN','DARK_GREEN','BROWN','CLOUDY','BLACK']).optional(),
  waterSmell: z.enum(['NONE','MILD','STRONG','FOUL']).optional(),
  temperatureCelsius: z.number().optional().nullable(),
  dissolvedOxygenPpm: z.number().optional().nullable(),
  turbidity: z.string().optional().nullable(),
  dataSource: z.enum(['MANUAL', 'SENSOR']).optional(),
  notes: z.string().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided"
});

export const createWaterTreatmentSchema = z.object({
  pondId: z.string()
    .uuid("Valid pond ID required"),

  treatmentDate: z.string()
    .min(1, "Treatment date is required")
    .refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid date format"
    })
    .refine(val => new Date(val) <= new Date(), {
      message: "Treatment date cannot be in the future"
    }),

  chemicalName: z.string()
    .min(2, "Chemical name is required")
    .max(100)
    .trim(),

  chemicalType: z.enum([
    'AGRICULTURAL_LIME',
    'QUICK_LIME',
    'DOLOMITE',
    'POTASSIUM_PERMANGANATE',
    'BLEACHING_POWDER',
    'SALT',
    'PROBIOTIC',
    'OTHER'
  ], {
    errorMap: () => ({ message: "Select a valid chemical type" })
  }),

  quantityKg: z.number({
    required_error: "Quantity is required",
    invalid_type_error: "Must be a number"
  })
    .positive("Quantity must be positive")
    .max(10000, "Quantity seems too high"),

  reason: z.string()
    .min(3, "Reason is required")
    .max(500)
    .trim(),

  applicationMethod: z.enum([
    'BROADCAST',
    'DISSOLVED_IN_WATER',
    'SPOT_APPLICATION',
    'INLET_WATER',
    'OTHER'
  ])
    .optional()
    .nullable(),

  phBefore: z.number()
    .min(0).max(14)
    .optional()
    .nullable(),

  phAfter: z.number()
    .min(0).max(14)
    .optional()
    .nullable(),

  resultObserved: z.string()
    .max(500)
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),

  nextTreatmentDate: z.string()
    .refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date" })
    .optional()
    .nullable(),

  notes: z.string()
    .max(500)
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
});

export const updateWaterTreatmentSchema = z.object({
  treatmentDate: z.string().optional(),
  chemicalName: z.string().optional(),
  chemicalType: z.enum(['AGRICULTURAL_LIME','QUICK_LIME','DOLOMITE','POTASSIUM_PERMANGANATE','BLEACHING_POWDER','SALT','PROBIOTIC','OTHER']).optional(),
  quantityKg: z.number().optional(),
  reason: z.string().optional(),
  applicationMethod: z.enum(['BROADCAST','DISSOLVED_IN_WATER','SPOT_APPLICATION','INLET_WATER','OTHER']).optional().nullable(),
  phBefore: z.number().optional().nullable(),
  phAfter: z.number().optional().nullable(),
  resultObserved: z.string().optional().nullable(),
  nextTreatmentDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided"
});

export const waterQualityListQuerySchema = z.object({
  pondId: z.string().uuid(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hasAlerts: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const waterQualityStatsQuerySchema = z.object({
  pondId: z.string().uuid(),
  period: z.enum(['7d', '30d', '90d', 'all']).default('30d'),
});

export type CreateWaterQualityLogDTO = z.infer<typeof createWaterQualityLogSchema>;
export type UpdateWaterQualityLogDTO = z.infer<typeof updateWaterQualityLogSchema>;
export type CreateWaterTreatmentDTO = z.infer<typeof createWaterTreatmentSchema>;
export type UpdateWaterTreatmentDTO = z.infer<typeof updateWaterTreatmentSchema>;
export type WaterQualityListQuery = z.infer<typeof waterQualityListQuerySchema>;
export type WaterQualityStatsQuery = z.infer<typeof waterQualityStatsQuerySchema>;
