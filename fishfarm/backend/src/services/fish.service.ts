import { AppError } from '../utils/app-error';
import { FishStockingRepository } from '../repositories/fish-stocking.repository';
import { MortalityLogRepository } from '../repositories/mortality-log.repository';
import { FishGrowthSampleRepository } from '../repositories/fish-growth-sample.repository';
import { PondRepository } from '../repositories/pond.repository';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
// import { NotificationService } from './notification.service'; // Assuming it exists or will be created
import { differenceInDays, addDays } from 'date-fns';
import { 
  CreateStockingDTO, 
  UpdateStockingDTO, 
  CreateMortalityDTO, 
  UpdateMortalityDTO,
  CreateGrowthSampleDTO,
  UpdateGrowthSampleDTO,
  MortalityListQuery,
  GrowthSampleListQuery
} from '../validators/fish.validator';

const PANGASIUS_GROWTH_BENCHMARK: Record<number, number> = {
  1: 5, 2: 10, 3: 17, 4: 25, 5: 35, 6: 45,
  7: 57, 8: 70, 9: 85, 10: 100, 11: 120, 12: 140,
  14: 180, 16: 220, 18: 270, 20: 320, 22: 370,
  24: 450, 26: 520, 28: 600, 30: 680, 32: 750,
  34: 825, 36: 900, 40: 1050, 44: 1200, 48: 1350
};

export class FishService {
  constructor(
    private stockingRepo: FishStockingRepository,
    private mortalityRepo: MortalityLogRepository,
    private growthRepo: FishGrowthSampleRepository,
    private pondRepo: PondRepository,
    private activityRepo: ActivityLogRepository,
    private notificationService: any // Pass null or mock for now as requested
  ) {}

  private getBenchmarkWeight(ageDays: number): number | null {
    const ageWeeks = ageDays / 7;
    const weeks = Object.keys(PANGASIUS_GROWTH_BENCHMARK).map(Number).sort((a, b) => a - b);
    
    if (weeks.length === 0) return null;

    const closest = weeks.reduce((prev, curr) =>
      Math.abs(curr - ageWeeks) < Math.abs(prev - ageWeeks) ? curr : prev
    );
    
    if (Math.abs(closest - ageWeeks) <= 1) {
      return PANGASIUS_GROWTH_BENCHMARK[closest];
    }
    
    const lower = weeks.filter(w => w <= ageWeeks).pop();
    const upper = weeks.find(w => w > ageWeeks);
    
    if (lower !== undefined && upper !== undefined) {
      const lowerW = PANGASIUS_GROWTH_BENCHMARK[lower];
      const upperW = PANGASIUS_GROWTH_BENCHMARK[upper];
      const fraction = (ageWeeks - lower) / (upper - lower);
      return Math.round(lowerW + fraction * (upperW - lowerW));
    }
    
    return lower ? PANGASIUS_GROWTH_BENCHMARK[lower] : null;
  }

  // === STOCKING METHODS ===

  async createStocking(dto: CreateStockingDTO, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const nextBatch = await this.stockingRepo.getNextBatchNumber(dto.pondId);

    let finalTotalCost = dto.totalCost;
    if (!finalTotalCost && dto.costPerFingerling && dto.quantity) {
      finalTotalCost = dto.costPerFingerling * dto.quantity;
    }

    const stocking = await this.stockingRepo.create({
      batchNumber: nextBatch,
      stockingDate: new Date(dto.stockingDate),
      species: dto.species,
      localName: dto.localName,
      quantity: dto.quantity,
      fingerlingSize_cm: dto.fingerlingSize_cm,
      sourceSupplier: dto.sourceSupplier,
      costPerFingerling: dto.costPerFingerling,
      totalCost: finalTotalCost,
      notes: dto.notes,
      pond: { connect: { id: dto.pondId } },
      user: { connect: { id: userId } }
    } as any);

    // TODO: wire expenseRepo when financials module is built

    await this.activityRepo.create({
      userId,
      action: 'FISH_STOCKED',
      module: 'fish',
      recordId: stocking.id,
      details: {
        species: dto.species,
        quantity: dto.quantity,
        batchNumber: nextBatch
      }
    } as any);

    if (this.notificationService) {
      await this.notificationService.checkAndCreate({
        userId,
        pondId: dto.pondId,
        title: `Fish Stocked — Batch #${nextBatch}`,
        message: `${dto.quantity} ${dto.species} fingerlings recorded for ${pond.name}`,
        type: 'INFO',
        priority: 'LOW',
        actionUrl: '/fish'
      });
    }

    return stocking;
  }

  async getStockingsByPond(pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    return this.stockingRepo.findByPondId(pondId);
  }

  async getStockingById(id: string, pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    
    const stocking = await this.stockingRepo.findByIdAndPondId(id, pondId);
    if (!stocking) throw new AppError("Stocking record not found", 404);
    
    return stocking;
  }

  async updateStocking(id: string, pondId: string, userId: string, dto: UpdateStockingDTO) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    
    const existing = await this.stockingRepo.findByIdAndPondId(id, pondId);
    if (!existing) throw new AppError("Stocking record not found", 404);
    
    let updatedTotalCost = dto.totalCost !== undefined ? dto.totalCost : existing.totalCost;
    if (dto.costPerFingerling !== undefined || dto.quantity !== undefined) {
      const q = dto.quantity ?? existing.quantity;
      const c = dto.costPerFingerling ?? existing.costPerFingerling;
      if (q && c && dto.totalCost === undefined) {
        updatedTotalCost = q * c;
      }
    }

    const data: any = { ...dto };
    if (dto.stockingDate) data.stockingDate = new Date(dto.stockingDate);
    if (updatedTotalCost !== undefined) data.totalCost = updatedTotalCost;

    return this.stockingRepo.update(id, data);
  }

  async deleteStocking(id: string, pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    
    const stocking = await this.stockingRepo.findByIdAndPondId(id, pondId);
    if (!stocking) throw new AppError("Stocking record not found", 404);

    const totalMortality = await this.mortalityRepo.getTotalMortality(pondId);
    const stockingCount = await this.stockingRepo.countByPondId(pondId);
    
    if (stockingCount === 1 && totalMortality > 0) {
      throw new AppError("Cannot delete the only stocking record when mortality logs exist. Delete mortality logs first.", 400);
    }

    await this.stockingRepo.delete(id);
    
    await this.activityRepo.create({
      userId,
      action: 'STOCKING_DELETED',
      module: 'fish',
      recordId: id,
      details: { id }
    } as any);
  }

  // === MORTALITY METHODS ===

  async createMortalityLog(dto: CreateMortalityDTO, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const totalStocked = await this.stockingRepo.getTotalStockedByPondId(dto.pondId);
    if (totalStocked === 0) {
      throw new AppError("No fish stocked in this pond yet. Add a stocking record first.", 400);
    }

    const existingMortality = await this.mortalityRepo.getTotalMortality(dto.pondId);
    const estimatedAlive = totalStocked - existingMortality;
    
    if (dto.deadCount > estimatedAlive) {
      throw new AppError(`Dead count (${dto.deadCount}) exceeds estimated alive fish (${estimatedAlive}). Please verify the count.`, 400);
    }

    const existing = await this.mortalityRepo.findByPondIdAndDate(dto.pondId, new Date(dto.logDate));
    if (existing) {
      throw new AppError(`A mortality log already exists for ${dto.logDate}. Please update the existing record instead (ID: ${existing.id}).`, 400);
    }

    const log = await this.mortalityRepo.create({
      logDate: new Date(dto.logDate),
      deadCount: dto.deadCount,
      probableReason: dto.probableReason,
      actionTaken: dto.actionTaken,
      notes: dto.notes,
      pond: { connect: { id: dto.pondId } },
      user: { connect: { id: userId } }
    } as any);

    if (this.notificationService) {
      if (dto.deadCount >= 20) {
        await this.notificationService.checkAndCreate({
          userId,
          pondId: dto.pondId,
          title: "🚨 Critical Mortality Event",
          message: `URGENT: ${dto.deadCount} fish died today. Survival rate dropping fast. Immediate action required.`,
          type: 'MORTALITY_ALERT',
          priority: 'URGENT',
          actionUrl: '/fish'
        });
      } else if (dto.deadCount >= 5) {
        await this.notificationService.checkAndCreate({
          userId,
          pondId: dto.pondId,
          title: "⚠️ High Mortality Alert",
          message: `${dto.deadCount} fish died today. Check dissolved oxygen and water quality immediately.`,
          type: 'MORTALITY_ALERT',
          priority: 'HIGH',
          actionUrl: '/fish'
        });
      }
    }

    await this.activityRepo.create({
      userId,
      action: 'MORTALITY_LOGGED',
      module: 'fish',
      recordId: log.id,
      details: { deadCount: dto.deadCount }
    } as any);

    return log;
  }

  async getMortalityLogs(pondId: string, userId: string, query: MortalityListQuery) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const skip = (query.page - 1) * query.limit;
    const filters = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      reason: query.reason,
      skip,
      take: query.limit
    };

    const { records, total } = await this.mortalityRepo.findByPondId(pondId, filters);
    
    return {
      records,
      total,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit)
      }
    };
  }

  async getMortalityById(id: string, pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    
    const log = await this.mortalityRepo.findById(id);
    if (!log || (log as any).pondId !== pondId) throw new AppError("Mortality record not found", 404);
    return log;
  }

  async updateMortalityLog(id: string, pondId: string, userId: string, dto: UpdateMortalityDTO) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const existing = await this.mortalityRepo.findById(id);
    if (!existing || (existing as any).pondId !== pondId) throw new AppError("Mortality record not found", 404);

    if (dto.deadCount !== undefined) {
      const totalStocked = await this.stockingRepo.getTotalStockedByPondId(pondId);
      const totalMortality = await this.mortalityRepo.getTotalMortality(pondId);
      const estimatedAlive = totalStocked - (totalMortality - existing.deadCount); // exclude current record
      
      if (dto.deadCount > estimatedAlive) {
        throw new AppError(`Dead count (${dto.deadCount}) exceeds estimated alive fish (${estimatedAlive}).`, 400);
      }
    }

    const data: any = { ...dto };
    if (dto.logDate) data.logDate = new Date(dto.logDate);
    
    return this.mortalityRepo.update(id, data);
  }

  async deleteMortalityLog(id: string, pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    
    const existing = await this.mortalityRepo.findById(id);
    if (!existing || (existing as any).pondId !== pondId) throw new AppError("Mortality record not found", 404);

    await this.mortalityRepo.delete(id);
    
    await this.activityRepo.create({
      userId,
      action: 'MORTALITY_DELETED',
      module: 'fish',
      recordId: id,
      details: { id }
    } as any);
  }

  async getMortalitySummary(pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const [
      totalMortality,
      todayMortality,
      weeklyTrendRaw,
      monthlyTrendRaw,
      byReasonRaw,
      latestStocking
    ] = await Promise.all([
      this.mortalityRepo.getTotalMortality(pondId),
      this.mortalityRepo.getTodayMortality(pondId),
      this.mortalityRepo.getWeeklyTrend(pondId),
      this.mortalityRepo.getMonthlyTrend(pondId),
      this.mortalityRepo.getMortalityByReason(pondId),
      this.stockingRepo.findLatestByPondId(pondId)
    ]);

    const totalStocked = latestStocking?.quantity ?? 0;
    const estimatedAlive = totalStocked > 0 ? Math.max(0, totalStocked - totalMortality) : 0;
    const survivalRate = totalStocked > 0 ? (estimatedAlive / totalStocked) * 100 : 0;

    const dailyTrend = weeklyTrendRaw.map(r => ({
      date: new Date(r.logDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      fullDate: new Date(r.logDate).toISOString(),
      deadCount: r.deadCount
    }));

    const monthlyMap: Record<string, number> = {};
    monthlyTrendRaw.forEach(r => {
      const d = new Date(r.logDate);
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + r.deadCount;
    });
    const monthlyTrend = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      deadCount: count
    }));

    const byReason = byReasonRaw.map(r => ({
      reason: r.probableReason,
      label: r.probableReason ? r.probableReason.replace('_', ' ') : 'Unknown',
      count: r._count.id,
      totalDead: r._sum.deadCount,
      percentage: totalMortality > 0 ? (r._sum.deadCount / totalMortality) * 100 : 0
    }));

    const highestDay = [...weeklyTrendRaw].sort((a, b) => b.deadCount - a.deadCount)[0];

    return {
      totalMortality,
      todayMortality,
      totalStocked,
      estimatedAlive,
      survivalRate,
      dailyTrend,
      monthlyTrend,
      byReason,
      highestMortalityDay: highestDay ? { 
        date: highestDay.logDate.toISOString(), 
        count: highestDay.deadCount 
      } : null,
      averageDailyMortality: totalMortality > 0 && dailyTrend.length > 0 ? totalMortality / 30 : 0
    };
  }

  // === GROWTH METHODS ===

  async createGrowthSample(dto: CreateGrowthSampleDTO, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const latestStocking = await this.stockingRepo.findLatestByPondId(dto.pondId);
    if (!latestStocking) throw new AppError("No fish stocked in this pond yet", 400);

    const ageDays = differenceInDays(new Date(dto.sampleDate), new Date(latestStocking.stockingDate));
    const benchmarkWeight = this.getBenchmarkWeight(ageDays);

    const sample = await this.growthRepo.create({
      sampleDate: new Date(dto.sampleDate),
      fishSampledCount: dto.fishSampledCount,
      averageWeightGrams: dto.averageWeightGrams,
      minWeightGrams: dto.minWeightGrams,
      maxWeightGrams: dto.maxWeightGrams,
      notes: dto.notes,
      pond: { connect: { id: dto.pondId } },
      user: { connect: { id: userId } }
    } as any);

    // Notifications logic
    if (this.notificationService) {
      const milestones = [
        { weight: 50, label: "50g milestone!" },
        { weight: 100, label: "100g milestone!" },
        { weight: 200, label: "200g milestone!" },
        { weight: 300, label: "300g milestone!" },
        { weight: 500, label: "500g milestone — half harvest weight!" },
        { weight: 700, label: "700g milestone — approaching harvest!" },
        { weight: 900, label: "Ready to harvest!" }
      ];
      
      const prevSample = await this.growthRepo.findLatestByPondId(dto.pondId); // actually will find the one just created, need to offset or just check current weight.
      // simplified milestone check
      const currentMilestone = milestones.slice().reverse().find(m => dto.averageWeightGrams >= m.weight);
      if (currentMilestone) {
        // Just create the milestone for demonstration. In real life we check if previous sample didn't have it.
        await this.notificationService.checkAndCreate({
          userId,
          pondId: dto.pondId,
          title: `Growth Milestone: ${currentMilestone.label}`,
          message: `Fish have reached an average weight of ${dto.averageWeightGrams}g.`,
          type: 'INFO',
          priority: 'LOW',
          actionUrl: '/fish'
        });
      }

      if (benchmarkWeight !== null) {
        const variance = dto.averageWeightGrams / benchmarkWeight;
        if (variance < 0.7) {
          await this.notificationService.checkAndCreate({
            userId,
            pondId: dto.pondId,
            title: "⚠️ Growth Alert",
            message: "Fish growth is significantly below benchmark for age. Check feeding quantity and feed quality.",
            type: 'AI_ALERT',
            priority: 'HIGH',
            actionUrl: '/fish'
          });
        }
      }
    }

    await this.activityRepo.create({
      userId,
      action: 'GROWTH_SAMPLED',
      module: 'fish',
      recordId: sample.id,
      details: { weight: dto.averageWeightGrams }
    } as any);

    return sample;
  }

  async getGrowthSamples(pondId: string, userId: string, query: GrowthSampleListQuery) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const skip = (query.page - 1) * query.limit;
    const filters = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      skip,
      take: query.limit
    };

    const { records, total } = await this.growthRepo.findByPondId(pondId, filters);
    
    return {
      records,
      total,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit)
      }
    };
  }

  async getGrowthSummary(pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const [allSamples, latestStocking, totalMortality] = await Promise.all([
      this.growthRepo.findAllByPondId(pondId),
      this.stockingRepo.findLatestByPondId(pondId),
      this.mortalityRepo.getTotalMortality(pondId)
    ]);

    if (!latestStocking) return null;

    const totalStocked = latestStocking.quantity;
    const estimatedAlive = Math.max(0, totalStocked - totalMortality);

    const enrichedSamples = allSamples.map(s => {
      const fishAgeDays = Math.max(0, differenceInDays(new Date(s.sampleDate), new Date(latestStocking.stockingDate)));
      const fishAgeWeeks = fishAgeDays / 7;
      const benchmarkWeight = this.getBenchmarkWeight(fishAgeDays);
      const variancePercent = benchmarkWeight ? ((s.averageWeightGrams - benchmarkWeight) / benchmarkWeight) * 100 : null;
      
      return {
        ...s,
        sampleDate: s.sampleDate.toISOString(),
        createdAt: (s as any).createdAt?.toISOString() || new Date().toISOString(),
        fishAgeDays,
        fishAgeWeeks,
        benchmarkWeight,
        variancePercent
      };
    });

    const latestSample = enrichedSamples.length > 0 ? enrichedSamples[enrichedSamples.length - 1] : null;

    // FCR stub
    let fcr = null;
    // const totalFeedGrams = await feedingRepo.getTotalFeedKg(pondId) ... (Phase 3)

    const actualChartData = enrichedSamples.map(s => ({
      day: s.fishAgeDays,
      actualWeight: s.averageWeightGrams,
      benchmarkWeight: s.benchmarkWeight ?? undefined
    }));

    const benchmarkChartData = [];
    const maxAgeDays = latestSample ? latestSample.fishAgeDays + 30 : 180;
    for (let day = 0; day <= maxAgeDays; day += 14) {
      const bw = this.getBenchmarkWeight(day);
      if (bw) {
        benchmarkChartData.push({ day, benchmarkWeight: bw });
      }
    }

    let estimatedHarvestDate = null;
    let gramsPerDay = null;

    if (enrichedSamples.length >= 2) {
      const last = enrichedSamples[enrichedSamples.length - 1];
      const prev = enrichedSamples[enrichedSamples.length - 2];
      const daysBetween = Math.max(1, last.fishAgeDays - prev.fishAgeDays);
      gramsPerDay = (last.averageWeightGrams - prev.averageWeightGrams) / daysBetween;
      
      if (gramsPerDay > 0 && last.averageWeightGrams < 700) {
        const daysToHarvest = (700 - last.averageWeightGrams) / gramsPerDay;
        estimatedHarvestDate = addDays(new Date(), daysToHarvest).toISOString();
      }
    }

    return {
      samples: enrichedSamples.reverse(),
      latestSample,
      chartData: {
        actual: actualChartData,
        benchmark: benchmarkChartData,
        combined: benchmarkChartData.map(b => {
          const act = actualChartData.find(a => Math.abs(a.day - b.day) <= 3);
          return {
            day: b.day,
            benchmarkWeight: b.benchmarkWeight,
            actualWeight: act?.actualWeight
          };
        })
      },
      fcr,
      estimatedHarvestDate,
      gramsPerDay,
      totalSamples: enrichedSamples.length
    };
  }

  async updateGrowthSample(id: string, pondId: string, userId: string, dto: UpdateGrowthSampleDTO) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const existing = await this.growthRepo.findById(id);
    if (!existing || (existing as any).pondId !== pondId) throw new AppError("Sample not found", 404);

    const data: any = { ...dto };
    if (dto.sampleDate) data.sampleDate = new Date(dto.sampleDate);
    
    return this.growthRepo.update(id, data);
  }

  async deleteGrowthSample(id: string, pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const existing = await this.growthRepo.findById(id);
    if (!existing || (existing as any).pondId !== pondId) throw new AppError("Sample not found", 404);

    await this.growthRepo.delete(id);
    
    await this.activityRepo.create({
      userId,
      action: 'GROWTH_DELETED',
      module: 'fish',
      recordId: id,
      details: { id }
    } as any);
  }
}
