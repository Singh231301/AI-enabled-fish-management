import { AppError } from '../utils/app-error';
import { PondRepository } from '../repositories/pond.repository';
import { InfrastructureChecklistRepository } from '../repositories/infrastructure-checklist.repository';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { TaskRepository } from '../repositories/task.repository';
import { TaskStatus, TaskPriority, TaskCategory } from '@prisma/client';
import { addDays } from 'date-fns';
import { 
  CreatePondDTO, 
  UpdatePondDTO, 
  CreateInfrastructureItemDTO, 
  UpdateInfrastructureItemDTO 
} from '../validators/pond.validator';
import { PondWithCounts, PondWithFullDetails, InfrastructureStats } from '../types/pond.types';
import { InfrastructureChecklist, Pond } from '@prisma/client';

const DEFAULT_INFRASTRUCTURE_ITEMS = [
  {
    itemName: "Bamboo Fencing",
    description: "Install bamboo poles around the entire pond perimeter to prevent predators and unauthorized access",
    status: 'NOT_STARTED'
  },
  {
    itemName: "Bird Protection Net / Rope Grid",
    description: "Install criss-cross nylon rope over pond with reflective tape and old CDs to deter birds",
    status: 'NOT_STARTED'
  },
  {
    itemName: "Bund Inspection & Repair",
    description: "Inspect all pond bunds for rat holes, crab holes, leaks. Fill and compact all holes found",
    status: 'NOT_STARTED'
  },
  {
    itemName: "Overflow Point Setup",
    description: "Create or verify overflow outlet to prevent flooding during heavy monsoon rain",
    status: 'NOT_STARTED'
  },
  {
    itemName: "Weed Removal",
    description: "Remove large aquatic weeds from pond center. Leave some near edges for natural ecology",
    status: 'NOT_STARTED'
  },
  {
    itemName: "Inlet Pipe / Tube Well Connection",
    description: "Set up water inlet from tube well for backup water supply during dry season",
    status: 'NOT_STARTED'
  },
  {
    itemName: "pH Test Kit",
    description: "Purchase and keep ready a pH test kit for regular water quality monitoring",
    status: 'NOT_STARTED'
  },
  {
    itemName: "Feeding Area Marker",
    description: "Mark a consistent feeding spot at the pond edge for training fish",
    status: 'NOT_STARTED'
  },
  {
    itemName: "Record Keeping Notebook",
    description: "Maintain a physical backup notebook for daily feed, mortality, and observation logs",
    status: 'NOT_STARTED'
  },
  {
    itemName: "Cast Net",
    description: "Purchase a cast net for periodic fish sampling and growth measurement",
    status: 'NOT_STARTED'
  },
  {
    itemName: "Aerator / Water Pump (Future)",
    description: "Plan for aerator installation before fish reach 500g average weight or if DO issues arise",
    status: 'NOT_STARTED'
  },
  {
    itemName: "Lime Application",
    description: "Apply agricultural lime (calcium carbonate) to pond bottom before stocking. 150-200 kg/acre",
    status: 'NOT_STARTED'
  }
];

export class PondService {
  constructor(
    private pondRepo: PondRepository,
    private infraRepo: InfrastructureChecklistRepository,
    private activityRepo: ActivityLogRepository,
    private notificationRepo: NotificationRepository,
    private taskRepo: TaskRepository
  ) {}

  async createPond(dto: CreatePondDTO, userId: string): Promise<PondWithFullDetails> {
    const count = await this.pondRepo.countByUserId(userId);
    if (count >= 5) {
      throw new AppError("Maximum 5 ponds allowed per account", 400);
    }

    const areaSqft = dto.lengthFt * dto.widthFt;
    const areaAcres = areaSqft / 43560;

    const pond = await this.pondRepo.create({
      ...dto,
      userId,
      areaSqft,
      areaAcres,
      constructionDate: dto.constructionDate ? new Date(dto.constructionDate) : null
    });

    const itemsToCreate = DEFAULT_INFRASTRUCTURE_ITEMS.map(item => ({
      ...item,
      pondId: pond.id,
      userId
    }));
    await this.infraRepo.bulkCreate(itemsToCreate as any);

    // Seed default tasks
    const today = new Date();
    const defaultTasks = [
      {
        title: "Morning Feeding",
        description: "Feed fish in the morning session. Observe fish response and log quantity fed.",
        category: 'DAILY' as TaskCategory,
        priority: 'HIGH' as TaskPriority,
        status: 'PENDING' as TaskStatus,
        dueDate: addDays(today, 0),
        isRecurring: true,
        recurrencePattern: 'DAILY',
        recurrenceCount: 0,
        tags: ['feeding', 'daily', 'critical'],
        estimatedMinutes: 20,
        userId: userId,
        pondId: pond.id,
        reminderDaysBefore: 1,
        isAiGenerated: false
      },
      {
        title: "Evening Feeding",
        description: "Feed fish in the evening session. Log quantity and fish response in feeding module.",
        category: 'DAILY' as TaskCategory,
        priority: 'HIGH' as TaskPriority,
        status: 'PENDING' as TaskStatus,
        dueDate: addDays(today, 0),
        isRecurring: true,
        recurrencePattern: 'DAILY',
        recurrenceCount: 0,
        tags: ['feeding', 'daily', 'critical'],
        estimatedMinutes: 20,
        userId: userId,
        pondId: pond.id,
        reminderDaysBefore: 1,
        isAiGenerated: false
      },
      {
        title: "Fish Observation",
        description: "Observe fish behavior: are they active, any surface gasping, unusual movements, dead fish? Log any observations in the system.",
        category: 'DAILY' as TaskCategory,
        priority: 'MEDIUM' as TaskPriority,
        status: 'PENDING' as TaskStatus,
        dueDate: addDays(today, 0),
        isRecurring: true,
        recurrencePattern: 'DAILY',
        recurrenceCount: 0,
        tags: ['observation', 'daily', 'health'],
        estimatedMinutes: 10,
        userId: userId,
        pondId: pond.id,
        reminderDaysBefore: 1,
        isAiGenerated: false
      },
      {
        title: "Inspect Pond Bunds",
        description: "Walk around all pond bunds. Check for rat holes, crab holes, seepage, erosion. Fill any holes found immediately.",
        category: 'WEEKLY' as TaskCategory,
        priority: 'HIGH' as TaskPriority,
        status: 'PENDING' as TaskStatus,
        dueDate: addDays(today, 3),
        isRecurring: true,
        recurrencePattern: 'WEEKLY',
        recurrenceCount: 0,
        tags: ['infrastructure', 'weekly', 'bund'],
        estimatedMinutes: 30,
        userId: userId,
        pondId: pond.id,
        reminderDaysBefore: 1,
        isAiGenerated: false
      },
      {
        title: "Water Quality Check",
        description: "Test pH using test kit. Observe water color, smell, and clarity. Log results in Water Quality module.",
        category: 'WEEKLY' as TaskCategory,
        priority: 'HIGH' as TaskPriority,
        status: 'PENDING' as TaskStatus,
        dueDate: addDays(today, 1),
        isRecurring: true,
        recurrencePattern: 'EVERY_2_DAYS',
        recurrenceCount: 0,
        tags: ['water', 'weekly', 'critical'],
        estimatedMinutes: 15,
        userId: userId,
        pondId: pond.id,
        reminderDaysBefore: 1,
        isAiGenerated: false
      }
    ];
    await this.taskRepo.createMany(defaultTasks as any);

    await this.activityRepo.create({
      userId,
      action: 'POND_CREATED',
      module: 'pond',
      recordId: pond.id,
      details: { pondName: pond.name, location: pond.location }
    } as any);

    const fullPond = await this.pondRepo.findWithFullDetails(pond.id);
    if (!fullPond) throw new AppError("Failed to fetch created pond details", 500);
    return fullPond;
  }

  async getUserPonds(userId: string): Promise<PondWithCounts[]> {
    return this.pondRepo.findByUserId(userId);
  }

  async getPondById(pondId: string, userId: string): Promise<PondWithFullDetails> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) {
      throw new AppError("Pond not found", 404);
    }
    const fullPond = await this.pondRepo.findWithFullDetails(pondId);
    if (!fullPond) {
       throw new AppError("Pond not found", 404);
    }
    const infraStats = await this.infraRepo.getCompletionStats(pondId);
    return { ...fullPond, infrastructureStats: infraStats };
  }

  async updatePond(pondId: string, userId: string, dto: UpdatePondDTO): Promise<Pond> {
    const existing = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!existing) {
      throw new AppError("Pond not found", 404);
    }

    const updateData: any = { ...dto };
    const newLength = dto.lengthFt ?? existing.lengthFt;
    const newWidth = dto.widthFt ?? existing.widthFt;
    
    if (dto.lengthFt || dto.widthFt) {
      updateData.areaSqft = newLength * newWidth;
      updateData.areaAcres = updateData.areaSqft / 43560;
    }

    if (dto.constructionDate) {
      updateData.constructionDate = new Date(dto.constructionDate);
    } else if (dto.constructionDate === null) {
      updateData.constructionDate = null;
    }

    const updated = await this.pondRepo.update(pondId, updateData);

    await this.activityRepo.create({
      userId,
      action: 'POND_UPDATED',
      module: 'pond',
      recordId: pondId,
      details: { changes: Object.keys(dto) }
    } as any);

    return updated;
  }

  async deletePond(pondId: string, userId: string): Promise<void> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) {
      throw new AppError("Pond not found", 404);
    }

    await this.pondRepo.softDelete(pondId);

    await this.activityRepo.create({
      userId,
      action: 'POND_DELETED',
      module: 'pond',
      recordId: pondId,
      details: { pondName: pond.name }
    } as any);
  }

  async getInfrastructureItems(pondId: string, userId: string): Promise<InfrastructureChecklist[]> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    return this.infraRepo.findByPondId(pondId);
  }

  async addInfrastructureItem(pondId: string, userId: string, dto: CreateInfrastructureItemDTO): Promise<InfrastructureChecklist> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    let completedDate = dto.completedDate;
    if (dto.status === 'COMPLETED' && !completedDate) {
      completedDate = new Date().toISOString();
    }

    return this.infraRepo.create({
      ...dto,
      pondId,
      userId,
      completedDate: completedDate ? new Date(completedDate) : null
    });
  }

  async updateInfrastructureItem(pondId: string, itemId: string, userId: string, dto: UpdateInfrastructureItemDTO): Promise<InfrastructureChecklist> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const item = await this.infraRepo.findById(itemId);
    if (!item || item.pondId !== pondId) {
      throw new AppError("Item not found", 404);
    }

    let completedDate = dto.completedDate;
    
    if (dto.status === 'COMPLETED' && !completedDate && !item.completedDate) {
      completedDate = new Date().toISOString();
    }
    
    if (dto.status && dto.status !== 'COMPLETED') {
      completedDate = null;
    }

    const updateData: any = { ...dto };
    if (completedDate !== undefined) {
      updateData.completedDate = completedDate ? new Date(completedDate) : null;
    } else if (dto.status && dto.status !== 'COMPLETED') {
      updateData.completedDate = null;
    }

    return this.infraRepo.update(itemId, updateData);
  }

  async deleteInfrastructureItem(pondId: string, itemId: string, userId: string): Promise<void> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const item = await this.infraRepo.findById(itemId);
    if (!item || item.pondId !== pondId) {
      throw new AppError("Item not found", 404);
    }

    await this.infraRepo.delete(itemId);
  }

  async getInfrastructureStats(pondId: string, userId: string): Promise<InfrastructureStats> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    return this.infraRepo.getCompletionStats(pondId);
  }
}
