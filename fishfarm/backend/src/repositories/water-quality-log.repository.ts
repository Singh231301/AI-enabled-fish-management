import { PrismaClient, Prisma, WaterQualityLog } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { DOStats, PHStats, TemperatureStats, ColorFrequency } from '../types/water.types';
import { differenceInDays } from 'date-fns';

export class WaterQualityLogRepository extends BaseRepository<
  WaterQualityLog,
  Prisma.WaterQualityLogCreateInput,
  Prisma.WaterQualityLogUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, prisma.waterQualityLog);
  }

  async findByPondId(
    pondId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      hasPhValue?: boolean;
      skip: number;
      take: number;
    }
  ): Promise<{ records: WaterQualityLog[]; total: number }> {
    const where: Prisma.WaterQualityLogWhereInput = { pondId };

    if (filters.startDate || filters.endDate) {
      where.logDate = {};
      if (filters.startDate) where.logDate.gte = filters.startDate;
      if (filters.endDate) where.logDate.lte = filters.endDate;
    }

    if (filters.hasPhValue) {
      where.phValue = { not: null };
    }

    const [records, total] = await Promise.all([
      this.prisma.waterQualityLog.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: [{ logDate: 'desc' }, { logTime: 'desc' }],
      }),
      this.prisma.waterQualityLog.count({ where }),
    ]);

    return { records, total };
  }

  async findAllByPondId(pondId: string): Promise<WaterQualityLog[]> {
    return this.prisma.waterQualityLog.findMany({
      where: { pondId },
      orderBy: { logDate: 'asc' },
    });
  }

  async findLatestByPondId(pondId: string): Promise<WaterQualityLog | null> {
    return this.prisma.waterQualityLog.findFirst({
      where: { pondId },
      orderBy: { logDate: 'desc' },
    });
  }

  async findLatestWithPH(pondId: string): Promise<WaterQualityLog | null> {
    return this.prisma.waterQualityLog.findFirst({
      where: { pondId, phValue: { not: null } },
      orderBy: { logDate: 'desc' },
    });
  }

  async findByPondIdAndDateRange(
    pondId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WaterQualityLog[]> {
    return this.prisma.waterQualityLog.findMany({
      where: {
        pondId,
        logDate: { gte: startDate, lte: endDate },
      },
      orderBy: { logDate: 'asc' },
    });
  }

  async findByIdAndPondId(id: string, pondId: string): Promise<WaterQualityLog | null> {
    return this.prisma.waterQualityLog.findFirst({
      where: { id, pondId },
    });
  }

  async getPHStats(pondId: string, startDate?: Date): Promise<PHStats> {
    const logs = await this.prisma.waterQualityLog.findMany({
      where: {
        pondId,
        phValue: { not: null },
        ...(startDate ? { logDate: { gte: startDate } } : {}),
      },
      select: { phValue: true, logDate: true },
      orderBy: { logDate: 'asc' },
    });

    if (logs.length === 0) {
      return { count: 0, average: null, min: null, max: null, latest: null, latestDate: null, daysInNormalRange: 0, daysOutOfRange: 0, normalRangePercent: 0 };
    }

    const count = logs.length;
    let sum = 0;
    let min = logs[0].phValue!;
    let max = logs[0].phValue!;
    let daysInNormal = 0;

    for (const log of logs) {
      const val = log.phValue!;
      sum += val;
      if (val < min) min = val;
      if (val > max) max = val;
      if (val >= 7.0 && val <= 8.5) daysInNormal++;
    }

    return {
      count,
      average: sum / count,
      min,
      max,
      latest: logs[logs.length - 1].phValue!,
      latestDate: logs[logs.length - 1].logDate,
      daysInNormalRange: daysInNormal,
      daysOutOfRange: count - daysInNormal,
      normalRangePercent: count > 0 ? (daysInNormal / count) * 100 : 0,
    };
  }

  async getWaterColorFrequency(pondId: string): Promise<ColorFrequency[]> {
    const counts = await this.prisma.waterQualityLog.groupBy({
      by: ['waterColor'],
      where: { pondId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const total = counts.reduce((acc, curr) => acc + curr._count.id, 0);

    return counts.map((c) => ({
      waterColor: c.waterColor as string,
      count: c._count.id,
      percentage: total > 0 ? (c._count.id / total) * 100 : 0,
    }));
  }

  async getDOStats(pondId: string, startDate?: Date): Promise<DOStats> {
    const logs = await this.prisma.waterQualityLog.findMany({
      where: {
        pondId,
        dissolvedOxygenPpm: { not: null },
        ...(startDate ? { logDate: { gte: startDate } } : {}),
      },
      select: { dissolvedOxygenPpm: true, logDate: true },
      orderBy: { logDate: 'asc' },
    });

    if (logs.length === 0) {
      return { count: 0, average: null, min: null, max: null, latest: null, latestDate: null, criticalReadings: 0, lowReadings: 0, normalReadings: 0 };
    }

    const count = logs.length;
    let sum = 0;
    let min = logs[0].dissolvedOxygenPpm!;
    let max = logs[0].dissolvedOxygenPpm!;
    let critical = 0;
    let low = 0;
    let normal = 0;

    for (const log of logs) {
      const val = log.dissolvedOxygenPpm!;
      sum += val;
      if (val < min) min = val;
      if (val > max) max = val;
      if (val < 3) {
        critical++;
      } else if (val >= 3 && val <= 5) {
        low++;
      } else {
        normal++;
      }
    }

    return {
      count,
      average: sum / count,
      min,
      max,
      latest: logs[logs.length - 1].dissolvedOxygenPpm!,
      latestDate: logs[logs.length - 1].logDate,
      criticalReadings: critical,
      lowReadings: low,
      normalReadings: normal,
    };
  }

  async getTemperatureStats(pondId: string, startDate?: Date): Promise<TemperatureStats> {
    const logs = await this.prisma.waterQualityLog.findMany({
      where: {
        pondId,
        temperatureCelsius: { not: null },
        ...(startDate ? { logDate: { gte: startDate } } : {}),
      },
      select: { temperatureCelsius: true, logDate: true },
      orderBy: { logDate: 'asc' },
    });

    if (logs.length === 0) {
      return { count: 0, average: null, min: null, max: null, latest: null, latestDate: null };
    }

    const count = logs.length;
    let sum = 0;
    let min = logs[0].temperatureCelsius!;
    let max = logs[0].temperatureCelsius!;

    for (const log of logs) {
      const val = log.temperatureCelsius!;
      sum += val;
      if (val < min) min = val;
      if (val > max) max = val;
    }

    return {
      count,
      average: sum / count,
      min,
      max,
      latest: logs[logs.length - 1].temperatureCelsius!,
      latestDate: logs[logs.length - 1].logDate,
    };
  }

  async getDaysSinceLastReading(pondId: string): Promise<number> {
    const latest = await this.findLatestByPondId(pondId);
    if (!latest) return 999;
    return differenceInDays(new Date(), latest.logDate);
  }

  async getReadingFrequency(pondId: string, days: number): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.waterQualityLog.findMany({
      where: {
        pondId,
        logDate: { gte: startDate },
      },
      select: { logDate: true },
    });

    const uniqueDates = new Set(logs.map((l) => l.logDate.toISOString().split('T')[0]));
    const weeks = Math.max(1, days / 7);
    return uniqueDates.size / weeks;
  }

  async countByPondId(pondId: string): Promise<number> {
    return this.prisma.waterQualityLog.count({ where: { pondId } });
  }
}
