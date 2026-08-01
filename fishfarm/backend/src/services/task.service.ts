import { Task, Prisma, TaskCategory, TaskPriority, TaskStatus, NotificationPriority } from '@prisma/client';
import { TaskRepository } from '../repositories/task.repository';
import { PondRepository } from '../repositories/pond.repository';
import { FishStockingRepository } from '../repositories/fish-stocking.repository';
import { FishGrowthSampleRepository } from '../repositories/fish-growth-sample.repository';
import { MortalityLogRepository } from '../repositories/mortality-log.repository';
import { WaterQualityLogRepository } from '../repositories/water-quality-log.repository';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { NotificationService } from './notifications.service';
import { AppError } from '../utils/app-error';
import { CreateTaskDTO, UpdateTaskDTO, CompleteTaskDTO, SkipTaskDTO, TaskListQuery } from '../validators/tasks.validator';
import { AISuggestedTask, TaskStats, CalendarDay, TaskOverview } from '../types/tasks.types';
import { addDays, addWeeks, addMonths, differenceInDays, format, subDays, startOfDay } from 'date-fns';

const POND_TASK_TEMPLATES: Array<{
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  isRecurring: boolean;
  recurrencePattern: string | null;
  estimatedMinutes: number;
  tags: string[];
  dueDaysFromNow: number;
}> = [
  {
    title: "Morning Feeding",
    description: "Feed fish in the morning session. Observe fish response and log quantity fed.",
    category: 'DAILY',
    priority: 'HIGH',
    isRecurring: true,
    recurrencePattern: 'DAILY',
    estimatedMinutes: 20,
    tags: ['feeding', 'daily', 'critical'],
    dueDaysFromNow: 0
  },
  {
    title: "Evening Feeding",
    description: "Feed fish in the evening session. Log quantity and fish response in feeding module.",
    category: 'DAILY',
    priority: 'HIGH',
    isRecurring: true,
    recurrencePattern: 'DAILY',
    estimatedMinutes: 20,
    tags: ['feeding', 'daily', 'critical'],
    dueDaysFromNow: 0
  },
  {
    title: "Fish Observation",
    description: "Observe fish behavior: are they active, any surface gasping, unusual movements, dead fish? Log any observations in the system.",
    category: 'DAILY',
    priority: 'MEDIUM',
    isRecurring: true,
    recurrencePattern: 'DAILY',
    estimatedMinutes: 10,
    tags: ['observation', 'daily', 'health'],
    dueDaysFromNow: 0
  },
  {
    title: "Inspect Pond Bunds",
    description: "Walk around all pond bunds. Check for rat holes, crab holes, seepage, erosion. Fill any holes found immediately.",
    category: 'WEEKLY',
    priority: 'HIGH',
    isRecurring: true,
    recurrencePattern: 'WEEKLY',
    estimatedMinutes: 30,
    tags: ['infrastructure', 'weekly', 'bund'],
    dueDaysFromNow: 3
  },
  {
    title: "Water Quality Check",
    description: "Test pH using test kit. Observe water color, smell, and clarity. Log results in Water Quality module.",
    category: 'WEEKLY',
    priority: 'HIGH',
    isRecurring: true,
    recurrencePattern: 'EVERY_2_DAYS',
    estimatedMinutes: 15,
    tags: ['water', 'weekly', 'critical'],
    dueDaysFromNow: 1
  },
  {
    title: "Remove Floating Weeds",
    description: "Remove floating weeds from pond surface. Do NOT remove all aquatic weeds at once — remove gradually over several sessions.",
    category: 'WEEKLY',
    priority: 'MEDIUM',
    isRecurring: true,
    recurrencePattern: 'WEEKLY',
    estimatedMinutes: 45,
    tags: ['maintenance', 'weekly', 'weeds'],
    dueDaysFromNow: 5
  },
  {
    title: "Check Bird Protection",
    description: "Inspect bamboo poles and rope/net setup. Replace broken ropes. Add fresh reflective tape if needed to deter birds.",
    category: 'WEEKLY',
    priority: 'MEDIUM',
    isRecurring: true,
    recurrencePattern: 'WEEKLY',
    estimatedMinutes: 20,
    tags: ['infrastructure', 'weekly', 'birds'],
    dueDaysFromNow: 2
  },
  {
    title: "Fish Growth Sample",
    description: "Catch 10-20 fish with cast net. Weigh each fish individually, calculate average weight. Record in Fish Tracking module.",
    category: 'MONTHLY',
    priority: 'HIGH',
    isRecurring: true,
    recurrencePattern: 'MONTHLY',
    estimatedMinutes: 60,
    tags: ['growth', 'monthly', 'sampling'],
    dueDaysFromNow: 7
  },
  {
    title: "Lime Application Assessment",
    description: "Check latest pH readings. If pH is below 7.0 or has been trending down, apply agricultural lime (150 kg/acre). Record in Water Quality module.",
    category: 'MONTHLY',
    priority: 'MEDIUM',
    isRecurring: true,
    recurrencePattern: 'MONTHLY',
    estimatedMinutes: 45,
    tags: ['water', 'monthly', 'lime'],
    dueDaysFromNow: 10
  },
  {
    title: "Feed Inventory Check",
    description: "Count remaining feed bags/kg. Ensure at least 15 days of feed in stock. Place order if below reorder threshold.",
    category: 'MONTHLY',
    priority: 'MEDIUM',
    isRecurring: true,
    recurrencePattern: 'MONTHLY',
    estimatedMinutes: 15,
    tags: ['inventory', 'monthly', 'feed'],
    dueDaysFromNow: 5
  },
  {
    title: "Financial Record Review",
    description: "Review all expenses and income for the month. Update any missing records in Financials module. Check P&L status.",
    category: 'MONTHLY',
    priority: 'LOW',
    isRecurring: true,
    recurrencePattern: 'MONTHLY',
    estimatedMinutes: 30,
    tags: ['finance', 'monthly', 'records'],
    dueDaysFromNow: 28
  },
  {
    title: "Pre-Monsoon Bund Strengthening",
    description: "Before monsoon: strengthen all pond bunds. Add soil, compact bunds, check overflow channel. Ensure bunds can handle heavy rainfall.",
    category: 'SEASONAL',
    priority: 'URGENT',
    isRecurring: false,
    recurrencePattern: null,
    estimatedMinutes: 180,
    tags: ['seasonal', 'monsoon', 'infrastructure', 'bund'],
    dueDaysFromNow: 14
  },
  {
    title: "Equipment Service — Tube Well Pump",
    description: "Service the tube well pump before peak summer. Check oil, clean filters, test water output. Repair or replace worn parts.",
    category: 'SEASONAL',
    priority: 'HIGH',
    isRecurring: false,
    recurrencePattern: null,
    estimatedMinutes: 120,
    tags: ['seasonal', 'equipment', 'pump', 'summer'],
    dueDaysFromNow: 21
  }
];

export class TaskService {
  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly pondRepo: PondRepository,
    private readonly stockingRepo: FishStockingRepository,
    private readonly growthRepo: FishGrowthSampleRepository,
    private readonly mortalityRepo: MortalityLogRepository,
    private readonly waterRepo: WaterQualityLogRepository,
    private readonly activityRepo: ActivityLogRepository,
    private readonly notificationService: NotificationService
  ) {}

  private calculateNextDueDate(currentDueDate: Date, pattern: string): Date {
    switch (pattern) {
      case 'DAILY': return addDays(currentDueDate, 1);
      case 'EVERY_2_DAYS': return addDays(currentDueDate, 2);
      case 'WEEKLY': return addWeeks(currentDueDate, 1);
      case 'EVERY_2_WEEKS': return addWeeks(currentDueDate, 2);
      case 'MONTHLY': return addMonths(currentDueDate, 1);
      case 'QUARTERLY': return addMonths(currentDueDate, 3);
      case 'CUSTOM': return addDays(currentDueDate, 7);
      default: return addDays(currentDueDate, 7);
    }
  }

  private sortByPriority(tasks: Task[]): Task[] {
    const priorityWeight: Record<TaskPriority, number> = {
      URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1
    };
    return [...tasks].sort((a, b) => {
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }

  private shouldGenerateNextOccurrence(task: Task): boolean {
    if (task.recurrenceMaxOccurrences) {
      return task.recurrenceCount < task.recurrenceMaxOccurrences;
    }
    if (task.recurrenceEndDate && task.recurrencePattern) {
      const nextDate = this.calculateNextDueDate(task.dueDate, task.recurrencePattern);
      return nextDate <= task.recurrenceEndDate;
    }
    return true;
  }

  async createTask(dto: CreateTaskDTO, userId: string): Promise<Task> {
    if (dto.pondId) {
      const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
      if (!pond) throw new AppError("Pond not found", 404);
    }

    const task = await this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      priority: dto.priority,
      status: 'PENDING',
      dueDate: new Date(dto.dueDate),
      isRecurring: dto.isRecurring,
      recurrencePattern: dto.recurrencePattern,
      recurrenceEndDate: dto.recurrenceEndDate ? new Date(dto.recurrenceEndDate) : null,
      recurrenceMaxOccurrences: dto.recurrenceMaxOccurrences,
      reminderDaysBefore: dto.reminderDaysBefore,
      tags: dto.tags ?? [],
      estimatedMinutes: dto.estimatedMinutes,
      user: { connect: { id: userId } },
      ...(dto.pondId ? { pond: { connect: { id: dto.pondId } } } : {}),
      ...(dto.assignedToUserId ? { assignedTo: { connect: { id: dto.assignedToUserId } } } : {})
    });

    if (dto.reminderDaysBefore !== null && dto.reminderDaysBefore !== undefined) {
      const reminderDate = subDays(new Date(dto.dueDate), dto.reminderDaysBefore);
      const daysUntilReminder = differenceInDays(reminderDate, new Date());
      const daysUntilDue = differenceInDays(new Date(dto.dueDate), new Date());
      
      if (daysUntilReminder <= 0) {
        await this.notificationService.checkAndCreate({
          userId,
          pondId: dto.pondId ?? undefined,
          title: `Task Due: ${dto.title}`,
          message: `Task is due ${
            daysUntilDue === 0 ? 'today' 
            : daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days ago`
            : `in ${daysUntilDue} day(s)`
          }.`,
          type: 'TASK_DUE',
          priority: dto.priority as NotificationPriority,
          actionUrl: '/tasks'
        });
      }
    }

    await this.activityRepo.create({ user: { connect: { id: userId } }, action: 'CREATE_TASK', module: 'Tasks', recordId: task.id, details: { title: task.title } });
    return task;
  }

  async getTasks(userId: string, query: TaskListQuery): Promise<{ tasks: Task[], total: number, counts: any, pagination: any }> {
    const [result, counts] = await Promise.all([
      this.taskRepo.findByUserId(userId, {
        pondId: query.pondId,
        status: query.status === 'ALL' ? [] : [query.status],
        category: query.category,
        priority: query.priority,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        isRecurring: query.isRecurring,
        search: query.search,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder
      }),
      this.taskRepo.countByStatus(userId, query.pondId)
    ]);

    let tasks = result.tasks;
    if (query.sortBy === 'priority') {
      tasks = this.sortByPriority(tasks);
      if (query.sortOrder === 'desc') {
        tasks = tasks.reverse();
      }
    }

    return {
      tasks,
      total: result.total,
      counts,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(result.total / query.limit),
        totalItems: result.total
      }
    };
  }

  async getTaskById(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepo.findByIdAndUserId(id, userId);
    if (!task) throw new AppError("Task not found", 404);
    
    if (!task.viewedAt) {
      await this.taskRepo.update(id, { viewedAt: new Date() });
    }
    
    return task;
  }

  async updateTask(id: string, userId: string, dto: UpdateTaskDTO): Promise<Task> {
    const task = await this.taskRepo.findByIdAndUserId(id, userId);
    if (!task) throw new AppError("Task not found", 404);

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.notes !== undefined) updateData.description = dto.notes || dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.dueDate !== undefined) updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : undefined;
    if (dto.isRecurring !== undefined) updateData.isRecurring = dto.isRecurring;
    if (dto.recurrencePattern !== undefined) updateData.recurrencePattern = dto.recurrencePattern;
    if (dto.recurrenceEndDate !== undefined) updateData.recurrenceEndDate = dto.recurrenceEndDate ? new Date(dto.recurrenceEndDate) : null;
    if (dto.recurrenceMaxOccurrences !== undefined) updateData.recurrenceMaxOccurrences = dto.recurrenceMaxOccurrences;
    if (dto.reminderDaysBefore !== undefined) updateData.reminderDaysBefore = dto.reminderDaysBefore;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.estimatedMinutes !== undefined) updateData.estimatedMinutes = dto.estimatedMinutes;
    if (dto.assignedToUserId !== undefined) {
      if (dto.assignedToUserId) {
        updateData.assignedTo = { connect: { id: dto.assignedToUserId } };
      } else {
        updateData.assignedTo = { disconnect: true };
      }
    }

    const updatedTask = await this.taskRepo.update(id, updateData);

    await this.activityRepo.create({ user: { connect: { id: userId } }, action: 'UPDATE_TASK', module: 'Tasks', recordId: id, details: { title: updatedTask.title } });
    return updatedTask;
  }

  async deleteTask(id: string, userId: string): Promise<void> {
    const task = await this.taskRepo.findByIdAndUserId(id, userId);
    if (!task) throw new AppError("Task not found", 404);

    const children = await this.taskRepo.findChildTasks(id);
    const futureChildren = children.filter(c => c.status === 'PENDING' && c.dueDate >= new Date());
    if (futureChildren.length > 0) {
      await this.taskRepo.deleteMany(futureChildren.map(c => c.id));
    }

    await this.taskRepo.delete(id);
    await this.activityRepo.create({ user: { connect: { id: userId } }, action: 'DELETE_TASK', module: 'Tasks', recordId: id, details: { title: task.title } });
  }

  async completeTask(id: string, userId: string, dto: CompleteTaskDTO): Promise<{ task: Task; nextTask: Task | null }> {
    const task = await this.taskRepo.findByIdAndUserId(id, userId);
    if (!task) throw new AppError("Task not found", 404);
    if (task.status === 'COMPLETED') throw new AppError("Task is already completed", 400);

    const completedTask = await this.taskRepo.update(id, {
      status: 'COMPLETED',
      completedDate: new Date(dto.completedDate),
      completionNote: dto.completionNote ?? null,
      actualMinutes: dto.actualMinutes ?? null,
      updatedAt: new Date()
    });

    let nextTask: Task | null = null;
    if (task.isRecurring && task.recurrencePattern && dto.generateNext) {
      if (this.shouldGenerateNextOccurrence(task)) {
        const nextDueDate = this.calculateNextDueDate(task.dueDate, task.recurrencePattern);
        nextTask = await this.taskRepo.create({
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          status: 'PENDING',
          dueDate: nextDueDate,
          isRecurring: true,
          recurrencePattern: task.recurrencePattern,
          recurrenceEndDate: task.recurrenceEndDate,
          recurrenceMaxOccurrences: task.recurrenceMaxOccurrences,
          recurrenceCount: task.recurrenceCount + 1,
          parentTask: { connect: { id: task.parentTaskId ?? task.id } },
          reminderDaysBefore: task.reminderDaysBefore,
          tags: task.tags,
          estimatedMinutes: task.estimatedMinutes,
          isAiGenerated: task.isAiGenerated,
          user: { connect: { id: task.userId } },
          ...(task.pondId ? { pond: { connect: { id: task.pondId } } } : {}),
          ...(task.assignedToUserId ? { assignedTo: { connect: { id: task.assignedToUserId } } } : {})
        });

        await this.taskRepo.update(task.parentTaskId ?? task.id, {
          recurrenceCount: task.recurrenceCount + 1
        });
      }
    }

    const stats = await this.taskRepo.getCompletionStats(userId, 7);
    if (stats.streak >= 7) {
      await this.notificationService.checkAndCreate({
        userId,
        title: "🔥 7-Day Task Streak!",
        message: "You've completed tasks every day for 7 days. Excellent farm management!",
        type: 'INFO',
        priority: 'LOW',
        actionUrl: '/tasks'
      });
    }

    await this.activityRepo.create({ user: { connect: { id: userId } }, action: 'COMPLETE_TASK', module: 'Tasks', recordId: id, details: { title: task.title } });
    return { task: completedTask, nextTask };
  }

  async skipTask(id: string, userId: string, dto: SkipTaskDTO): Promise<{ task: Task; nextTask: Task | null }> {
    const task = await this.taskRepo.findByIdAndUserId(id, userId);
    if (!task) throw new AppError("Task not found", 404);
    if (task.status === 'SKIPPED') throw new AppError("Task is already skipped", 400);

    const skippedTask = await this.taskRepo.update(id, {
      status: 'SKIPPED',
      skipReason: dto.skipReason,
      updatedAt: new Date()
    });

    let nextTask: Task | null = null;
    if (task.isRecurring && task.recurrencePattern && dto.generateNext) {
      if (this.shouldGenerateNextOccurrence(task)) {
        const nextDueDate = this.calculateNextDueDate(task.dueDate, task.recurrencePattern);
        nextTask = await this.taskRepo.create({
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          status: 'PENDING',
          dueDate: nextDueDate,
          isRecurring: true,
          recurrencePattern: task.recurrencePattern,
          recurrenceEndDate: task.recurrenceEndDate,
          recurrenceMaxOccurrences: task.recurrenceMaxOccurrences,
          recurrenceCount: task.recurrenceCount + 1,
          parentTask: { connect: { id: task.parentTaskId ?? task.id } },
          reminderDaysBefore: task.reminderDaysBefore,
          tags: task.tags,
          estimatedMinutes: task.estimatedMinutes,
          isAiGenerated: task.isAiGenerated,
          user: { connect: { id: task.userId } },
          ...(task.pondId ? { pond: { connect: { id: task.pondId } } } : {}),
          ...(task.assignedToUserId ? { assignedTo: { connect: { id: task.assignedToUserId } } } : {})
        });

        await this.taskRepo.update(task.parentTaskId ?? task.id, {
          recurrenceCount: task.recurrenceCount + 1
        });
      }
    }

    await this.activityRepo.create({ user: { connect: { id: userId } }, action: 'SKIP_TASK', module: 'Tasks', recordId: id, details: { title: task.title } });
    return { task: skippedTask, nextTask };
  }

  async bulkUpdateStatus(ids: string[], status: TaskStatus, userId: string): Promise<number> {
    const tasks = await this.taskRepo.findByUserId(userId, {
      skip: 0, take: ids.length, sortBy: 'createdAt', sortOrder: 'asc'
    });
    
    // Only update tasks owned by this user
    const validIds = ids.filter(id => tasks.tasks.some(t => t.id === id));
    
    if (validIds.length > 0) {
      for (const id of validIds) {
        await this.taskRepo.update(id, { status, updatedAt: new Date() });
      }
    }
    
    return validIds.length;
  }

  private getCurrentSeason(month: number): string {
    if (month >= 1 && month <= 2 || month === 12) return 'WINTER';
    if (month >= 3 && month <= 4) return 'PRE_SUMMER';
    if (month >= 5 && month <= 6) return 'SUMMER';
    if (month >= 7 && month <= 9) return 'MONSOON';
    if (month >= 10 && month <= 11) return 'POST_MONSOON';
    return 'WINTER';
  }

  private getBenchmarkWeight(ageDays: number): number {
    if (ageDays <= 30) return 50;
    if (ageDays <= 60) return 150;
    if (ageDays <= 90) return 300;
    if (ageDays <= 120) return 500;
    if (ageDays <= 150) return 700;
    return 1000;
  }

  async generateAITaskSuggestions(pondId: string, userId: string): Promise<AISuggestedTask[]> {
    const [latestStocking, latestGrowth, latestWater, totalMortality, existingTasks] = await Promise.all([
      this.stockingRepo.findLatestByPondId(pondId),
      this.growthRepo.findLatestByPondId(pondId),
      this.waterRepo.findLatestByPondId(pondId),
      this.mortalityRepo.getTotalMortality(pondId),
      this.taskRepo.findByUserId(userId, {
        pondId, status: ['PENDING', 'IN_PROGRESS'], skip: 0, take: 100, sortBy: 'dueDate', sortOrder: 'asc'
      })
    ]);

    const fishAgeDays = latestStocking ? differenceInDays(new Date(), latestStocking.stockingDate) : 0;
    const currentMonth = new Date().getMonth() + 1;
    const currentAvgWeight = latestGrowth?.averageWeightGrams ?? 0;
    const totalStocked = latestStocking?.quantity ?? 0;
    const estimatedAlive = totalStocked - totalMortality;
    const survivalRate = totalStocked > 0 ? (estimatedAlive / totalStocked) * 100 : 100;
    const latestPH = latestWater?.phValue ?? null;

    const existingTitles = new Set(existingTasks.tasks.map(t => t.title.toLowerCase()));
    const suggestions: AISuggestedTask[] = [];

    const addSuggestion = (s: AISuggestedTask) => {
      const isDuplicate = Array.from(existingTitles).some(title => title.includes(s.title.toLowerCase().substring(0, 15)));
      if (!isDuplicate) suggestions.push(s);
    };

    if (fishAgeDays > 0 && fishAgeDays <= 7) {
      addSuggestion({
        title: "Daily Fingerling Monitoring",
        description: "New fingerlings are in the critical adaptation phase (first 7 days). Observe 3-4 times per day. Do NOT feed for first 24-48 hours after stocking.",
        reason: "Fish are newly stocked and in stress adaptation period",
        priority: 'URGENT',
        category: 'DAILY',
        suggestedDueDate: format(new Date(), 'yyyy-MM-dd'),
        estimatedMinutes: 15,
        tags: ['fingerling', 'critical', 'adaptation'],
        aiConfidence: 0.98
      });
    }

    if (fishAgeDays >= 7 && fishAgeDays <= 14 && currentAvgWeight < 10) {
      addSuggestion({
        title: "Start Feed Training",
        description: "Fish are 1-2 weeks old. Begin feeding at a fixed spot at pond edge. Use very small quantities initially (100-200g). Observe response carefully.",
        reason: "Optimal time to establish feeding habits",
        priority: 'HIGH',
        category: 'ONE_TIME',
        suggestedDueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        estimatedMinutes: 20,
        tags: ['feeding', 'training', 'fingerling'],
        aiConfidence: 0.92
      });
    }

    if (fishAgeDays >= 30 && fishAgeDays % 30 < 3 && (!latestGrowth || differenceInDays(new Date(), new Date(latestGrowth.sampleDate)) > 25)) {
      addSuggestion({
        title: `Monthly Growth Sampling — Week ${Math.floor(fishAgeDays / 7)}`,
        description: `Fish are ${fishAgeDays} days old. Sample 10-15 fish with cast net, weigh each one. Expected weight around this age: ~${this.getBenchmarkWeight(fishAgeDays)}g.`,
        reason: `Monthly growth sample is due (fish are ${fishAgeDays} days old)`,
        priority: 'HIGH',
        category: 'ONE_TIME',
        suggestedDueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        estimatedMinutes: 60,
        tags: ['growth', 'sampling', 'monthly'],
        aiConfidence: 0.95
      });
    }

    if (fishAgeDays >= 150 && currentAvgWeight >= 500) {
      addSuggestion({
        title: "Pre-Harvest Assessment",
        description: `Fish average weight is ~${currentAvgWeight}g. Conduct full assessment: count sample, check quality, contact buyers, plan harvest logistics.`,
        reason: "Fish approaching harvest weight (target: 700g)",
        priority: 'HIGH',
        category: 'ONE_TIME',
        suggestedDueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        estimatedMinutes: 120,
        tags: ['harvest', 'pre-harvest', 'planning'],
        aiConfidence: 0.90
      });
    }

    if (!latestWater || differenceInDays(new Date(), new Date(latestWater.logDate)) >= 3) {
      addSuggestion({
        title: "Water Quality Check — Overdue",
        description: "No water quality reading in 3+ days. Test pH with kit, observe color and smell. Log in Water Quality module.",
        reason: `Last reading was ${latestWater ? differenceInDays(new Date(), new Date(latestWater.logDate)) : 'unknown'} days ago`,
        priority: 'HIGH',
        category: 'ONE_TIME',
        suggestedDueDate: format(new Date(), 'yyyy-MM-dd'),
        estimatedMinutes: 15,
        tags: ['water', 'ph', 'urgent'],
        aiConfidence: 0.97
      });
    }

    if (latestPH !== null && latestPH < 7.0) {
      addSuggestion({
        title: "Apply Agricultural Lime — pH Correction",
        description: `pH is currently ${latestPH}. Apply 150 kg/acre agricultural lime (calcium carbonate ONLY, NOT quick lime). Spread evenly in evening.`,
        reason: `pH ${latestPH} is below optimal range (7.0–8.5)`,
        priority: latestPH < 6.5 ? 'URGENT' : 'HIGH',
        category: 'ONE_TIME',
        suggestedDueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        estimatedMinutes: 45,
        tags: ['water', 'lime', 'ph-correction'],
        aiConfidence: 0.99
      });
    }

    if (survivalRate < 90 && totalMortality > 0) {
      addSuggestion({
        title: "Investigate Mortality Causes",
        description: `Survival rate is ${survivalRate.toFixed(1)}% (${totalMortality} fish lost). Check: water quality, feeding response, signs of disease, bird activity.`,
        reason: `Survival rate below 90% (${totalMortality} deaths recorded)`,
        priority: survivalRate < 80 ? 'URGENT' : 'HIGH',
        category: 'ONE_TIME',
        suggestedDueDate: format(new Date(), 'yyyy-MM-dd'),
        estimatedMinutes: 30,
        tags: ['health', 'mortality', 'investigation'],
        aiConfidence: 0.93
      });
    }

    const season = this.getCurrentSeason(currentMonth);

    if (season === 'PRE_MONSOON') {
      addSuggestion({
        title: "Strengthen Pond Bunds Before Monsoon",
        description: "Monsoon approaching. Add fresh soil to bunds, compact firmly, check overflow channel is clear. Bunds must withstand heavy rainfall.",
        reason: "Pre-monsoon bund work is critical (June approaching)",
        priority: 'URGENT',
        category: 'SEASONAL',
        suggestedDueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        estimatedMinutes: 180,
        tags: ['seasonal', 'monsoon', 'bund', 'infrastructure'],
        aiConfidence: 0.95
      });
      addSuggestion({
        title: "Service Water Pump Before Monsoon",
        description: "Service tube well pump before monsoon season. Clean, oil, test. You may need it less during monsoon but it must be ready.",
        reason: "Pre-monsoon equipment maintenance due",
        priority: 'HIGH',
        category: 'SEASONAL',
        suggestedDueDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
        estimatedMinutes: 120,
        tags: ['seasonal', 'equipment', 'pump'],
        aiConfidence: 0.88
      });
    }

    if (season === 'SUMMER') {
      addSuggestion({
        title: "Early Morning Feeding Only — Summer Mode",
        description: "Switch to early morning feeding (before 8 AM) only during peak summer. High temperatures reduce dissolved oxygen. Avoid afternoon feeding.",
        reason: "Peak summer — high temperature reduces DO capacity",
        priority: 'HIGH',
        category: 'ONE_TIME',
        suggestedDueDate: format(new Date(), 'yyyy-MM-dd'),
        estimatedMinutes: 10,
        tags: ['seasonal', 'summer', 'feeding', 'do'],
        aiConfidence: 0.94
      });
      addSuggestion({
        title: "Daily DO Monitoring — Summer",
        description: "Check dissolved oxygen daily during summer, especially at dawn (5-7 AM). Fish gasping at surface = danger. Add fresh water immediately.",
        reason: "Summer = high DO crash risk at dawn",
        priority: 'URGENT',
        category: 'DAILY',
        suggestedDueDate: format(new Date(), 'yyyy-MM-dd'),
        estimatedMinutes: 15,
        tags: ['seasonal', 'summer', 'do', 'critical'],
        aiConfidence: 0.97
      });
    }

    if (season === 'POST_MONSOON') {
      addSuggestion({
        title: "Maximize Feeding — Best Growth Season",
        description: "Post-monsoon (Oct-Nov) is the optimal growth period. Increase feeding to maximum recommended amount. This is your best FCR window.",
        reason: "Post-monsoon = best water temperature for growth",
        priority: 'HIGH',
        category: 'ONE_TIME',
        suggestedDueDate: format(new Date(), 'yyyy-MM-dd'),
        estimatedMinutes: 10,
        tags: ['seasonal', 'post-monsoon', 'feeding', 'growth'],
        aiConfidence: 0.91
      });
    }

    if (season === 'WINTER') {
      addSuggestion({
        title: "Reduce Feed for Winter — Cold Water Mode",
        description: "Cold water slows fish metabolism. Reduce feed quantity by 30-40%. Feed only at warmest part of day (noon). Monitor for disease signs.",
        reason: `Winter cold reduces metabolism (current month: ${currentMonth})`,
        priority: 'HIGH',
        category: 'ONE_TIME',
        suggestedDueDate: format(new Date(), 'yyyy-MM-dd'),
        estimatedMinutes: 10,
        tags: ['seasonal', 'winter', 'feeding', 'metabolism'],
        aiConfidence: 0.93
      });
    }

    suggestions.sort((a, b) => b.aiConfidence - a.aiConfidence);
    return suggestions.slice(0, 8);
  }

  async seedDefaultTasks(pondId: string, userId: string): Promise<Task[]> {
    const existing = await this.taskRepo.findByUserId(userId, { pondId, skip: 0, take: 100, sortBy: 'dueDate', sortOrder: 'asc' });
    const existingTitles = new Set(existing.tasks.map(t => t.title.toLowerCase()));

    const today = new Date();
    const tasksToCreate = POND_TASK_TEMPLATES
      .filter(t => !existingTitles.has(t.title.toLowerCase()))
      .map(template => ({
        title: template.title,
        description: template.description,
        category: template.category,
        priority: template.priority,
        status: 'PENDING' as TaskStatus,
        dueDate: addDays(today, template.dueDaysFromNow),
        isRecurring: template.isRecurring,
        recurrencePattern: template.recurrencePattern,
        recurrenceCount: 0,
        tags: template.tags,
        estimatedMinutes: template.estimatedMinutes,
        userId,
        pondId,
        reminderDaysBefore: 1,
        isAiGenerated: false
      }));

    if (tasksToCreate.length > 0) {
      await this.taskRepo.createMany(tasksToCreate);
    }
    
    // We fetch again to get full objects since createMany doesn't return them
    const newTasks = await this.taskRepo.findByUserId(userId, { pondId, skip: 0, take: 100, sortBy: 'dueDate', sortOrder: 'asc' });
    return newTasks.tasks;
  }

  async getTaskStats(userId: string, pondId?: string): Promise<TaskStats> {
    const [counts, completionStats, overdueList, dueTodayList, upcomingList, aiSuggestions] = await Promise.all([
      this.taskRepo.countByStatus(userId, pondId),
      this.taskRepo.getCompletionStats(userId, 30),
      this.taskRepo.findOverdueByUserId(userId),
      this.taskRepo.findDueTodayByUserId(userId),
      this.taskRepo.findUpcomingByUserId(userId, 7),
      pondId ? this.generateAITaskSuggestions(pondId, userId) : Promise.resolve([])
    ]);

    return {
      counts,
      completionStats,
      overdueList,
      dueTodayList,
      upcomingList,
      aiSuggestions
    };
  }

  async getCalendarData(userId: string, year: number, month: number): Promise<CalendarDay[]> {
    return this.taskRepo.getCalendarData(userId, year, month);
  }

  async getTasksOverview(userId: string, pondId?: string): Promise<TaskOverview> {
    const [stats, recentTasks] = await Promise.all([
      this.getTaskStats(userId, pondId),
      this.getTasks(userId, {
        pondId,
        status: 'ALL',
        page: 1,
        limit: 20,
        sortBy: 'dueDate',
        sortOrder: 'asc'
      })
    ]);
    return { stats, recentTasks: recentTasks.tasks };
  }
}
