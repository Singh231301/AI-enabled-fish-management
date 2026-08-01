import { z } from 'zod';

export const createInventoryItemSchema = z.object({
  pondId: z.string().uuid("Valid pond ID required"),
  itemName: z.string().min(2, "Item name is required").max(100).trim(),
  category: z.enum([
    'FEED',
    'CHEMICAL',
    'EQUIPMENT',
    'TOOL',
    'OTHER'
  ], {
    errorMap: () => ({ message: "Select a valid category" })
  }),
  description: z.string().max(500).optional().nullable().transform(val => val === '' ? null : val),
  currentQuantity: z.number({
    required_error: "Current quantity is required",
    invalid_type_error: "Must be a number"
  }).nonnegative("Cannot be negative"),
  unit: z.string().min(1, "Unit is required").max(20).trim(),
  reorderThreshold: z.number({
    required_error: "Reorder threshold is required",
    invalid_type_error: "Must be a number"
  }).nonnegative("Cannot be negative"),
  unitCost: z.number().nonnegative("Cost cannot be negative").optional().nullable(),
  supplier: z.string().max(200).optional().nullable().transform(val => val === '' ? null : val),
  location: z.string().max(100).optional().nullable().transform(val => val === '' ? null : val),
});

export const updateInventoryItemSchema = createInventoryItemSchema
  .omit({ pondId: true })
  .partial()
  .refine(
    data => Object.keys(data).length > 0,
    { message: "At least one field must be provided" }
  );

export const recordPurchaseSchema = z.object({
  inventoryId: z.string().uuid("Valid inventory ID required"),
  pondId: z.string().uuid("Valid pond ID required"),
  quantity: z.number({
    required_error: "Quantity is required",
    invalid_type_error: "Must be a number"
  }).positive("Quantity must be positive"),
  unitCost: z.number().nonnegative("Cost cannot be negative").optional().nullable(),
  totalCost: z.number().nonnegative("Total cost cannot be negative").optional().nullable(),
  purchaseDate: z.string().min(1, "Purchase date is required").refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }),
  supplier: z.string().max(200).optional().nullable().transform(val => val === '' ? null : val),
  invoiceNumber: z.string().max(100).optional().nullable().transform(val => val === '' ? null : val),
  notes: z.string().max(500).optional().nullable().transform(val => val === '' ? null : val),
  createExpenseRecord: z.boolean().default(true),
}).refine(data => {
  if (data.quantity && data.unitCost && data.totalCost) {
    const expected = data.quantity * data.unitCost;
    const variance = Math.abs(expected - data.totalCost) / expected;
    return variance <= 0.02;
  }
  return true;
}, {
  message: "Total cost does not match quantity × unit cost",
  path: ["totalCost"]
});

export const recordUsageSchema = z.object({
  inventoryId: z.string().uuid("Valid inventory ID required"),
  pondId: z.string().uuid("Valid pond ID required"),
  quantity: z.number({
    required_error: "Quantity is required",
    invalid_type_error: "Must be a number"
  }).positive("Quantity must be positive"),
  usageDate: z.string().min(1, "Usage date is required").refine(val => !isNaN(Date.parse(val))),
  sourceType: z.enum([
    'MANUAL',
    'FEEDING_LOG',
    'WATER_TREATMENT',
    'ADJUSTMENT'
  ]).default('MANUAL'),
  sourceId: z.string().uuid().optional().nullable(),
  notes: z.string().max(500).optional().nullable().transform(val => val === '' ? null : val),
});

export const adjustStockSchema = z.object({
  inventoryId: z.string().uuid("Valid inventory ID required"),
  pondId: z.string().uuid("Valid pond ID required"),
  newQuantity: z.number().nonnegative("Cannot be negative"),
  reason: z.string().min(3, "Reason is required").max(300),
});

export const createMaintenanceSchema = z.object({
  inventoryId: z.string().uuid("Valid inventory ID required"),
  scheduledDate: z.string().min(1, "Scheduled date is required").refine(val => !isNaN(Date.parse(val))),
  maintenanceType: z.string().min(2, "Maintenance type is required").max(100),
  description: z.string().max(500).optional().nullable().transform(val => val === '' ? null : val),
  cost: z.number().nonnegative().optional().nullable(),
  notes: z.string().max(500).optional().nullable().transform(val => val === '' ? null : val),
  nextScheduledDate: z.string().optional().nullable(),
});

export const completeMaintenanceSchema = z.object({
  completedDate: z.string().min(1, "Completion date is required").refine(val => !isNaN(Date.parse(val))),
  cost: z.number().nonnegative().optional().nullable(),
  notes: z.string().max(500).optional().nullable().transform(val => val === '' ? null : val),
  nextScheduledDate: z.string().optional().nullable(),
});

export const inventoryQuerySchema = z.object({
  pondId: z.string().uuid(),
  category: z.string().optional(),
  lowStockOnly: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional().default(true),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const transactionQuerySchema = z.object({
  inventoryId: z.string().uuid().optional(),
  pondId: z.string().uuid(),
  transactionType: z.enum([
    'PURCHASE', 'USAGE', 'ADJUSTMENT', 'WASTAGE'
  ]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
});

export type CreateInventoryItemDTO = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemDTO = z.infer<typeof updateInventoryItemSchema>;
export type RecordPurchaseDTO = z.infer<typeof recordPurchaseSchema>;
export type RecordUsageDTO = z.infer<typeof recordUsageSchema>;
export type AdjustStockDTO = z.infer<typeof adjustStockSchema>;
export type CreateMaintenanceDTO = z.infer<typeof createMaintenanceSchema>;
export type CompleteMaintenanceDTO = z.infer<typeof completeMaintenanceSchema>;
export type InventoryQuery = z.infer<typeof inventoryQuerySchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
