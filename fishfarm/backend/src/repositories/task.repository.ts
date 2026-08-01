import { PrismaClient, Prisma, Task, TaskStatus, TaskCategory, TaskPriority } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AppError } from '../utils/app-error';
import { BaseRepository } from './base.repository';
import { TaskStatusCounts, CompletionStats, CalendarDay, TaskWithUser } from '../types/tasks.types';
import { startOfDay, endOfDay, addDays, startOfMonth, endOfMonth, subDays, format } from 'date-fns';

export class TaskRepository extends BaseRepository<Task> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, fullName: true, email: true }
        },
        parentTask: {
          select: { id: true, title: true }
        },
        _count: { select: { childTasks: true } }
      }
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Task | null> {
    return this.prisma.task.findFirst({
      where: {
        id,
        OR: [{ userId }, { assignedToUserId: userId }]
      }
    });
  }

  async findByUserId(
    userId: string,
    filters: {
      pondId?: string;
      status?: string[];
      category?: string;
      priority?: string;
      startDate?: Date;
      endDate?: Date;
      isRecurring?: boolean;
      search?: string;
      skip: number;
      take: number;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    }
  ): Promise<{ tasks: Task[]; total: number }> {
    const where: Prisma.TaskWhereInput = {
      OR: [{ userId }, { assignedToUserId: userId }]
    };

    if (filters.pondId) where.pondId = filters.pondId;

    if (filters.status && filters.status.length > 0 && !filters.status.includes('ALL')) {
      where.status = { in: filters.status as TaskStatus[] };
    }

    if (filters.category) where.category = filters.category as TaskCategory;
    if (filters.priority) where.priority = filters.priority as TaskPriority;

    if (filters.startDate || filters.endDate) {
      where.dueDate = {};
      if (filters.startDate) where.dueDate.gte = filters.startDate;
      if (filters.endDate) where.dueDate.lte = filters.endDate;
    }

    if (typeof filters.isRecurring === 'boolean') {
      where.isRecurring = filters.isRecurring;
    }

    if (filters.search) {
      where.OR = [
        ...(where.OR ? where.OR : []),
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    if (filters.sortBy === 'priority') {
      // Custom priority sort: URGENT > HIGH > MEDIUM > LOW
      // We will handle this in the service, so we fallback to dueDate here
      orderBy.dueDate = filters.sortOrder;
    } else {
      (orderBy as any)[filters.sortBy] = filters.sortOrder;
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy
      }),
      this.prisma.task.count({ where })
    ]);

    return { tasks, total };
  }

  async findDueTodayByUserId(userId: string): Promise<Task[]> {
    const today = new Date();
    return this.prisma.task.findMany({
      where: {
        OR: [{ userId }, { assignedToUserId: userId }],
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: {
          gte: startOfDay(today),
          lte: endOfDay(today)
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });
  }

  async findOverdueByUserId(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        OR: [{ userId }, { assignedToUserId: userId }],
        status: { in: ['PENDING', 'IN_PROGRESS', 'OVERDUE'] },
        dueDate: { lt: startOfDay(new Date()) }
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  async findUpcomingByUserId(userId: string, daysAhead: number): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        OR: [{ userId }, { assignedToUserId: userId }],
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: {
          gte: startOfDay(new Date()),
          lte: addDays(endOfDay(new Date()), daysAhead)
        }
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }]
    });
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Task[]> {
    try {
      return await this.prisma.task.findMany({
        where: {
          OR: [{ userId }, { assignedToUserId: userId }],
          dueDate: { gte: startDate, lte: endDate }
        },
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }]
      });
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Task not found', 404);
      }
      throw error;
    }
  }

  async findChildTasks(parentTaskId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { parentTaskId },
      orderBy: { dueDate: 'asc' }
    });
  }

  async countByStatus(userId: string, pondId?: string): Promise<TaskStatusCounts> {
    const [pending, inProgress, overdue, dueToday, completedThisMonth] = await Promise.all([
      this.prisma.task.count({
        where: {
          OR: [{ userId }, { assignedToUserId: userId }],
          ...(pondId ? { pondId } : {}),
          status: 'PENDING',
          dueDate: { gte: startOfDay(new Date()) }
        }
      }),
      this.prisma.task.count({
        where: {
          OR: [{ userId }, { assignedToUserId: userId }],
          ...(pondId ? { pondId } : {}),
          status: 'IN_PROGRESS'
        }
      }),
      this.prisma.task.count({
        where: {
          OR: [{ userId }, { assignedToUserId: userId }],
          ...(pondId ? { pondId } : {}),
          status: { in: ['PENDING', 'IN_PROGRESS', 'OVERDUE'] },
          dueDate: { lt: startOfDay(new Date()) }
        }
      }),
      this.prisma.task.count({
        where: {
          OR: [{ userId }, { assignedToUserId: userId }],
          ...(pondId ? { pondId } : {}),
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: {
            gte: startOfDay(new Date()),
            lte: endOfDay(new Date())
          }
        }
      }),
      this.prisma.task.count({
        where: {
          OR: [{ userId }, { assignedToUserId: userId }],
          ...(pondId ? { pondId } : {}),
          status: 'COMPLETED',
          completedDate: {
            gte: startOfMonth(new Date()),
            lte: endOfMonth(new Date())
          }
        }
      })
    ]);

    return { pending, inProgress, overdue, dueToday, completedThisMonth };
  }

  async getCompletionStats(userId: string, days: number): Promise<CompletionStats> {
    const since = subDays(new Date(), days);
    
    const [totalCreated, completedTasks] = await Promise.all([
      this.prisma.task.count({
        where: {
          userId,
          createdAt: { gte: since }
        }
      }),
      this.prisma.task.findMany({
        where: {
          OR: [{ userId }, { assignedToUserId: userId }],
          status: 'COMPLETED',
          completedDate: { gte: since }
        },
        select: {
          completedDate: true,
          dueDate: true,
          actualMinutes: true
        }
      })
    ]);

    const totalCompleted = completedTasks.length;
    const completionRate = totalCreated > 0 ? (totalCompleted / totalCreated) * 100 : 100;
    
    let totalMinutes = 0;
    let minutesCount = 0;
    let onTimeCount = 0;

    const completedDates = new Set<string>();

    for (const task of completedTasks) {
      if (task.actualMinutes) {
        totalMinutes += task.actualMinutes;
        minutesCount++;
      }
      if (task.completedDate && task.completedDate <= task.dueDate) {
        onTimeCount++;
      }
      if (task.completedDate) {
        completedDates.add(format(task.completedDate, 'yyyy-MM-dd'));
      }
    }

    const avgCompletionMinutes = minutesCount > 0 ? totalMinutes / minutesCount : null;
    const onTimeCompletionRate = totalCompleted > 0 ? (onTimeCount / totalCompleted) * 100 : 100;

    let streak = 0;
    let checkDate = new Date();
    while (completedDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }

    return {
      totalCreated,
      totalCompleted,
      completionRate,
      avgCompletionMinutes,
      onTimeCompletionRate,
      streak
    };
  }

  async getCalendarData(userId: string, year: number, month: number): Promise<CalendarDay[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = endOfMonth(startDate);

    const tasks = await this.prisma.task.findMany({
      where: {
        OR: [{ userId }, { assignedToUserId: userId }],
        dueDate: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        }
      }
    });

    const dayMap = new Map<string, Task[]>();
    for (const task of tasks) {
      const dateStr = format(task.dueDate, 'yyyy-MM-dd');
      const existing = dayMap.get(dateStr) ?? [];
      dayMap.set(dateStr, [...existing, task]);
    }

    const calendar: CalendarDay[] = [];
    let currentDay = startDate;
    while (currentDay <= endDate) {
      const dateStr = format(currentDay, 'yyyy-MM-dd');
      const dayTasks = dayMap.get(dateStr) ?? [];
      
      const hasOverdue = dayTasks.some(t => t.status === 'OVERDUE' || (t.status === 'PENDING' && t.dueDate < new Date()));
      const hasDueToday = dateStr === format(new Date(), 'yyyy-MM-dd') && dayTasks.some(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
      const completedCount = dayTasks.filter(t => t.status === 'COMPLETED').length;
      const pendingCount = dayTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
      const hasCompleted = completedCount > 0 && completedCount === dayTasks.length;

      calendar.push({
        date: dateStr,
        tasks: dayTasks,
        hasOverdue,
        hasDueToday,
        hasCompleted,
        completedCount,
        pendingCount
      });

      currentDay = addDays(currentDay, 1);
    }

    return calendar;
  }

  async findAllOverdue(): Promise<TaskWithUser[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { lt: startOfDay(new Date()) }
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        pond: { select: { id: true, name: true } }
      }
    });
    return tasks;
  }

  async markManyOverdue(ids: string[]): Promise<{ count: number }> {
    const result = await this.prisma.task.updateMany({
      where: { id: { in: ids } },
      data: { status: 'OVERDUE', updatedAt: new Date() }
    });
    return { count: result.count };
  }

  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return this.prisma.task.create({ data });
  }

  async createMany(data: Prisma.TaskCreateManyInput[]): Promise<{ count: number }> {
    const result = await this.prisma.task.createMany({ data, skipDuplicates: true });
    return { count: result.count };
  }

  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return this.prisma.task.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Task> {
    return this.prisma.task.delete({ where: { id } });
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    const result = await this.prisma.task.deleteMany({ where: { id: { in: ids } } });
    return { count: result.count };
  }
}
