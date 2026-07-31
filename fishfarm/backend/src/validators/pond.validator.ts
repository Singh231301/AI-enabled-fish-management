import { z } from 'zod';

export const createPondSchema = z.object({
  name: z.string()
    .min(2, "Pond name must be at least 2 characters")
    .max(100, "Pond name cannot exceed 100 characters")
    .trim(),

  location: z.string()
    .min(3, "Location is required")
    .max(200)
    .trim(),

  latitude: z.number()
    .min(-90).max(90)
    .optional()
    .nullable(),

  longitude: z.number()
    .min(-180).max(180)
    .optional()
    .nullable(),

  lengthFt: z.number()
    .positive("Length must be positive")
    .max(10000, "Length seems too large"),

  widthFt: z.number()
    .positive("Width must be positive")
    .max(10000, "Width seems too large"),

  maxDepthFt: z.number()
    .positive("Depth must be positive")
    .max(100, "Depth seems too large"),

  soilType: z.string()
    .min(2, "Soil type is required")
    .max(100),

  waterSource: z.string()
    .min(2, "Water source is required")
    .max(200),

  pondType: z.string()
    .min(2)
    .max(50)
    .default("Earthen"),

  constructionDate: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() === '') return null;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return `${val}T00:00:00.000Z`;
    return val;
  }, z.string().datetime({ offset: true }).optional().nullable()),

  notes: z.string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
});

export const updatePondSchema = createPondSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export const createInfrastructureItemSchema = z.object({
  itemName: z.string()
    .min(2, "Item name is required")
    .max(100)
    .trim(),

  description: z.string()
    .max(500)
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),

  status: z.enum(
    ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
    { errorMap: () => ({ message: "Invalid status" }) }
  ).default('NOT_STARTED'),

  completedDate: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() === '') return null;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return `${val}T00:00:00.000Z`;
    return val;
  }, z.string().datetime({ offset: true }).optional().nullable()),

  notes: z.string()
    .max(500)
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
});

export const updateInfrastructureItemSchema = createInfrastructureItemSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export const pondIdParamSchema = z.object({
  pondId: z.string().uuid("Invalid pond ID format")
});

export const itemIdParamSchema = z.object({
  pondId: z.string().uuid("Invalid pond ID format"),
  itemId: z.string().uuid("Invalid item ID format")
});

export type CreatePondDTO = z.infer<typeof createPondSchema>;
export type UpdatePondDTO = z.infer<typeof updatePondSchema>;
export type CreateInfrastructureItemDTO = z.infer<typeof createInfrastructureItemSchema>;
export type UpdateInfrastructureItemDTO = z.infer<typeof updateInfrastructureItemSchema>;
