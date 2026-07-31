import { PrismaClient, FeedingLog, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { startOfDay, endOfDay } from 'date-fns';
import { DailyFeedTotal, WeeklyFeedTotal, ResponseBreakdown, FeedTypeBreakdown, FeedingStreakData } from '../types/feeding.types';
import { FeedType, FishResponseType } from '../types/feeding.types';

export class FeedingLogRepository extends BaseRepository<FeedingLog> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<FeedingLog | null> {
    return this.prisma.feedingLog.findUnique({ where: { id } });
  }

  async findByPondId(
    pondId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      feedType?: string;
      fishResponse?: string;
      skip: number;
      take: number;
    }
  ): Promise<{ records: FeedingLog[]; total: number }> {
    const where: Prisma.FeedingLogWhereInput = { pondId };
    if (filters.startDate || filters.endDate) {
      where.feedDate = {};
      if (filters.startDate) where.feedDate.gte = filters.startDate;
      if (filters.endDate) where.feedDate.lte = filters.endDate;
    }
    if (filters.feedType) where.feedType = filters.feedType;
    if (filters.fishResponse) where.fishResponse = filters.fishResponse as any;

    const [records, total] = await Promise.all([
      this.prisma.feedingLog.findMany({
        where,
        orderBy: [{ feedDate: 'desc' }, { feedTime: 'desc' }],
        skip: filters.skip,
        take: filters.take,
      }),
      this.prisma.feedingLog.count({ where }),
    ]);
    return { records, total };
  }

  async findAllByPondId(pondId: string): Promise<FeedingLog[]> {
    return this.prisma.feedingLog.findMany({
      where: { pondId },
      orderBy: { feedDate: 'asc' },
    });
  }

  async findByPondIdAndDateRange(pondId: string, startDate: Date, endDate: Date): Promise<FeedingLog[]> {
    return this.prisma.feedingLog.findMany({
      where: {
        pondId,
        feedDate: { gte: startDate, lte: endDate },
      },
      orderBy: { feedDate: 'asc' },
    });
  }

  async findTodayByPondId(pondId: string): Promise<FeedingLog[]> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    return this.prisma.feedingLog.findMany({
      where: {
        pondId,
        feedDate: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { feedTime: 'asc' },
    });
  }

  async findByDateAndPondId(pondId: string, date: Date): Promise<FeedingLog[]> {
    return this.prisma.feedingLog.findMany({
      where: {
        pondId,
        feedDate: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    });
  }

  async getTotalFeedKgByPondId(pondId: string): Promise<number> {
    const result = await this.prisma.feedingLog.aggregate({
      where: { pondId },
      _sum: { quantityGrams: true },
    });
    return (result._sum.quantityGrams ?? 0) / 1000;
  }

  async getDailyFeedTotals(pondId: string, startDate: Date, endDate: Date): Promise<DailyFeedTotal[]> {
    const logs = await this.prisma.feedingLog.findMany({
      where: {
        pondId,
        feedDate: { gte: startDate, lte: endDate },
      },
      select: {
        feedDate: true,
        quantityGrams: true,
        fishResponse: true,
        leftoverObserved: true
      },
      orderBy: { feedDate: 'asc' },
    });

    const grouped = new Map<string, DailyFeedTotal>();
    for (const log of logs) {
      const dateStr = log.feedDate.toISOString().split('T')[0];
      if (!grouped.has(dateStr)) {
        grouped.set(dateStr, {
          date: dateStr,
          displayDate: log.feedDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
          totalGrams: 0,
          sessions: 0,
          responses: [],
          hasLeftover: false
        });
      }
      const entry = grouped.get(dateStr)!;
      entry.totalGrams += log.quantityGrams;
      entry.sessions += 1;
      entry.responses.push(log.fishResponse as FishResponseType);
      if (log.leftoverObserved) entry.hasLeftover = true;
    }

    return Array.from(grouped.values());
  }

  async getWeeklyFeedTotals(pondId: string): Promise<WeeklyFeedTotal[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 84); // Last 12 weeks
    const logs = await this.prisma.feedingLog.findMany({
      where: {
        pondId,
        feedDate: { gte: startDate }
      },
      orderBy: { feedDate: 'asc' }
    });

    const weeks = new Map<string, { totalGrams: number, days: Set<string> }>();
    for (const log of logs) {
      const date = log.feedDate;
      const weekStart = startOfDay(new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()));
      const weekStr = `Week of ${weekStart.toISOString().split('T')[0]}`;
      if (!weeks.has(weekStr)) {
        weeks.set(weekStr, { totalGrams: 0, days: new Set() });
      }
      const entry = weeks.get(weekStr)!;
      entry.totalGrams += log.quantityGrams;
      entry.days.add(log.feedDate.toISOString().split('T')[0]);
    }

    return Array.from(weeks.entries()).map(([week, data]) => ({
      week,
      totalGrams: data.totalGrams,
      avgGramsPerDay: data.days.size > 0 ? data.totalGrams / data.days.size : 0,
      daysWithFeeding: data.days.size
    }));
  }

  async getFeedResponseBreakdown(pondId: string, startDate?: Date): Promise<ResponseBreakdown[]> {
    const result = await this.prisma.feedingLog.groupBy({
      by: ['fishResponse'],
      where: {
        pondId,
        ...(startDate ? { feedDate: { gte: startDate } } : {}),
      },
      _count: { id: true },
      _sum: { quantityGrams: true },
    });

    const totalLogs = result.reduce((sum, r) => sum + r._count.id, 0);

    return result.map(r => ({
      response: r.fishResponse as FishResponseType,
      label: r.fishResponse,
      count: r._count.id,
      totalGrams: r._sum.quantityGrams ?? 0,
      percentage: totalLogs > 0 ? (r._count.id / totalLogs) * 100 : 0
    }));
  }

  async getFeedTypeBreakdown(pondId: string): Promise<FeedTypeBreakdown[]> {
    const result = await this.prisma.feedingLog.groupBy({
      by: ['feedType'],
      where: { pondId },
      _count: { id: true },
      _sum: { quantityGrams: true },
    });

    const totalLogs = result.reduce((sum, r) => sum + r._count.id, 0);

    return result.map(r => ({
      feedType: r.feedType as FeedType,
      label: r.feedType,
      count: r._count.id,
      totalGrams: r._sum.quantityGrams ?? 0,
      percentage: totalLogs > 0 ? (r._count.id / totalLogs) * 100 : 0
    }));
  }

  async getAverageDailyFeed(pondId: string, days: number): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const result = await this.prisma.feedingLog.aggregate({
      where: {
        pondId,
        feedDate: { gte: startDate }
      },
      _sum: { quantityGrams: true }
    });
    return (result._sum.quantityGrams ?? 0) / days;
  }

  async getStreakData(pondId: string): Promise<FeedingStreakData> {
    const logs = await this.prisma.feedingLog.findMany({
      where: { pondId },
      select: { feedDate: true },
      orderBy: { feedDate: 'desc' }
    });

    if (logs.length === 0) return { currentStreak: 0, longestStreak: 0, lastFedDate: null };

    const distinctDates = Array.from(new Set(logs.map(l => l.feedDate.toISOString().split('T')[0]))).sort().reverse();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    const todayStr = new Date().toISOString().split('T')[0];
    let isCurrentStreak = distinctDates[0] === todayStr || distinctDates[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0];

    for (let i = 0; i < distinctDates.length; i++) {
      const currentDate = new Date(distinctDates[i]);
      if (lastDate) {
        const diffDays = Math.round(Math.abs((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          if (tempStreak > longestStreak) longestStreak = tempStreak;
          if (isCurrentStreak) {
            currentStreak = tempStreak;
            isCurrentStreak = false;
          }
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      lastDate = currentDate;
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    if (isCurrentStreak) currentStreak = tempStreak;

    return {
      currentStreak,
      longestStreak,
      lastFedDate: distinctDates.length > 0 ? distinctDates[0] : null
    };
  }

  async getLeftoverFrequency(pondId: string, days: number): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const [totalLogs, leftoverLogs] = await Promise.all([
      this.prisma.feedingLog.count({ where: { pondId, feedDate: { gte: startDate } } }),
      this.prisma.feedingLog.count({ where: { pondId, feedDate: { gte: startDate }, leftoverObserved: true } })
    ]);

    return totalLogs > 0 ? (leftoverLogs / totalLogs) * 100 : 0;
  }

  async create(data: Prisma.FeedingLogCreateInput): Promise<FeedingLog> {
    return this.prisma.feedingLog.create({ data });
  }

  async update(id: string, data: Prisma.FeedingLogUpdateInput): Promise<FeedingLog> {
    return this.prisma.feedingLog.update({ where: { id }, data });
  }

  async delete(id: string): Promise<FeedingLog> {
    return this.prisma.feedingLog.delete({ where: { id } });
  }

  async countByPondId(pondId: string): Promise<number> {
    return this.prisma.feedingLog.count({ where: { pondId } });
  }
}
