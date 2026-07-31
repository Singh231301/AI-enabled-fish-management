import { z } from 'zod';

const createStockingBase = z.object({
  pondId: z.string().uuid("Valid pond ID required"),
  stockingDate: z.string().min(1, "Stocking date is required").refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  species: z.string().min(2, "Species name is required").max(100).trim(),
  localName: z.string().max(100).optional().nullable().transform(val => val === '' ? null : val),
  quantity: z.number({ required_error: "Quantity is required", invalid_type_error: "Quantity must be a number" }).int("Quantity must be a whole number").positive("Quantity must be positive").max(100000, "Quantity seems too large"),
  fingerlingSize_cm: z.number({ required_error: "Fingerling size is required", invalid_type_error: "Must be a number" }).positive("Size must be positive").max(100, "Size seems too large"),
  sourceSupplier: z.string().max(200).optional().nullable().transform(val => val === '' ? null : val),
  costPerFingerling: z.number().nonnegative("Cost cannot be negative").optional().nullable(),
  totalCost: z.number().nonnegative("Total cost cannot be negative").optional().nullable(),
  batchNumber: z.number().int().positive().default(1),
  notes: z.string().max(1000).optional().nullable().transform(val => val === '' ? null : val),
});

export const createStockingSchema = createStockingBase.refine(data => {
  if (data.costPerFingerling && data.quantity && data.totalCost) {
    const expected = data.costPerFingerling * data.quantity;
    const variance = Math.abs(expected - data.totalCost) / expected;
    return variance <= 0.01;
  }
  return true;
}, {
  message: "Total cost does not match quantity × cost per fingerling",
  path: ["totalCost"]
});

export const updateStockingSchema = createStockingBase
  .omit({ pondId: true, batchNumber: true })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  });

export const createMortalitySchema = z.object({
  pondId: z.string().uuid("Valid pond ID required"),
  logDate: z.string().min(1, "Date is required").refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" }).refine(val => new Date(val) <= new Date(), { message: "Date cannot be in the future" }),
  deadCount: z.number({ required_error: "Dead count is required", invalid_type_error: "Must be a number" }).int("Must be a whole number").positive("Must be at least 1").max(10000, "Count seems too high — please verify"),
  probableReason: z.enum(['OXYGEN_DEFICIENCY', 'DISEASE_INFECTION', 'WATER_QUALITY', 'PREDATION', 'INJURY', 'UNKNOWN', 'OTHER']).optional().nullable(),
  actionTaken: z.string().max(500).optional().nullable().transform(val => val === '' ? null : val),
  notes: z.string().max(500).optional().nullable().transform(val => val === '' ? null : val),
});

export const updateMortalitySchema = createMortalitySchema
  .omit({ pondId: true })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  });

const createGrowthSampleBase = z.object({
  pondId: z.string().uuid("Valid pond ID required"),
  sampleDate: z.string().min(1, "Sample date is required").refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" }).refine(val => new Date(val) <= new Date(), { message: "Sample date cannot be in the future" }),
  fishSampledCount: z.number({ required_error: "Number of fish sampled is required", invalid_type_error: "Must be a number" }).int("Must be a whole number").positive().max(500, "Sampling more than 500 fish at once is unusual"),
  averageWeightGrams: z.number({ required_error: "Average weight is required", invalid_type_error: "Must be a number" }).positive("Weight must be positive").max(5000, "Weight seems too high for this species"),
  minWeightGrams: z.number().positive().optional().nullable(),
  maxWeightGrams: z.number().positive().optional().nullable(),
  notes: z.string().max(500).optional().nullable().transform(val => val === '' ? null : val),
});

export const createGrowthSampleSchema = createGrowthSampleBase
  .refine(data => {
    if (data.minWeightGrams && data.maxWeightGrams) {
      return data.minWeightGrams <= data.maxWeightGrams;
    }
    return true;
  }, { message: "Min weight cannot be greater than max weight", path: ["minWeightGrams"] })
  .refine(data => {
    if (data.minWeightGrams && data.averageWeightGrams) {
      return data.minWeightGrams <= data.averageWeightGrams;
    }
    return true;
  }, { message: "Min weight cannot be greater than average weight", path: ["minWeightGrams"] })
  .refine(data => {
    if (data.maxWeightGrams && data.averageWeightGrams) {
      return data.maxWeightGrams >= data.averageWeightGrams;
    }
    return true;
  }, { message: "Max weight cannot be less than average weight", path: ["maxWeightGrams"] });

export const updateGrowthSampleSchema = createGrowthSampleBase
  .omit({ pondId: true })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  });

export const mortalityListQuerySchema = z.object({
  pondId: z.string().uuid(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reason: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const growthSampleListQuerySchema = z.object({
  pondId: z.string().uuid(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateStockingDTO = z.infer<typeof createStockingSchema>;
export type UpdateStockingDTO = z.infer<typeof updateStockingSchema>;
export type CreateMortalityDTO = z.infer<typeof createMortalitySchema>;
export type UpdateMortalityDTO = z.infer<typeof updateMortalitySchema>;
export type CreateGrowthSampleDTO = z.infer<typeof createGrowthSampleSchema>;
export type UpdateGrowthSampleDTO = z.infer<typeof updateGrowthSampleSchema>;
export type MortalityListQuery = z.infer<typeof mortalityListQuerySchema>;
export type GrowthSampleListQuery = z.infer<typeof growthSampleListQuerySchema>;
