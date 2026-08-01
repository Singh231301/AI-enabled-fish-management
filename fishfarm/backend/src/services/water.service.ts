import { AppError } from '../utils/app-error';
import { PondRepository } from '../repositories/pond.repository';
import { FishStockingRepository } from '../repositories/fish-stocking.repository';
import { MortalityLogRepository } from '../repositories/mortality-log.repository';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { NotificationService } from './notifications.service';
import { WaterQualityLogRepository } from '../repositories/water-quality-log.repository';
import { WaterTreatmentLogRepository } from '../repositories/water-treatment-log.repository';
import {
  CreateWaterQualityLogDTO,
  UpdateWaterQualityLogDTO,
  CreateWaterTreatmentDTO,
  UpdateWaterTreatmentDTO,
  WaterQualityListQuery,
  WaterQualityStatsQuery,
} from '../validators/water.validator';
import {
  WaterAlert,
  WaterOverview,
  WaterQualityStats,
  PHStatus,
  DOStatus,
  ColorRisk,
  SeasonalAdvice,
  PHStats,
  DOStats,
  PHDataPoint,
  DODataPoint,
  TempDataPoint,
} from '../types/water.types';
import { differenceInDays, addDays, startOfDay, eachDayOfInterval, format } from 'date-fns';
import { WaterQualityLog, WaterTreatmentLog, WaterColor, WaterSmell, DataSource, ApplicationMethod, ChemicalType } from '@prisma/client';

const PH_RANGES = {
  CRITICAL_LOW: 6.0,
  LOW: 7.0,
  OPTIMAL_LOW: 7.0,
  OPTIMAL_HIGH: 8.5,
  HIGH: 8.5,
  CRITICAL_HIGH: 9.0,
};

const DO_RANGES = {
  CRITICAL: 2,
  VERY_LOW: 3,
  LOW: 5,
  OPTIMAL: 7,
  EXCELLENT: 8,
};

const TEMP_RANGES = {
  TOO_COLD: 15,
  COLD: 20,
  OPTIMAL_LOW: 26,
  OPTIMAL_HIGH: 32,
  HOT: 35,
  CRITICAL_HOT: 38,
};

const LIME_RECOMMENDATION_KG_PER_ACRE = 150;

const SEASONAL_ADVICE: Record<string, SeasonalAdvice> = {
  PRE_SUMMER: {
    season: "Pre-Summer",
    months: "March – April",
    tempRange: "25–35°C",
    phTendency: "Rises (algae bloom)",
    doRisk: "Moderate",
    keyRisks: [
      "Increasing temperature reduces DO capacity",
      "Algae blooms can cause pH swings",
      "Dawn DO crash risk increases"
    ],
    actions: [
      "Check DO in early morning (6-7 AM)",
      "Reduce afternoon feeding",
      "Increase water exchange frequency",
      "Monitor pH every 2 days"
    ],
    limeAdvice: "Apply if pH drops below 7.0",
    feedingAdvice: "Feed in early morning only"
  },
  SUMMER: {
    season: "Peak Summer",
    months: "May – June",
    tempRange: "35–42°C",
    phTendency: "High risk of swings",
    doRisk: "HIGH",
    keyRisks: [
      "Very high temperatures reduce DO severely",
      "Fish stop feeding in heat",
      "Mass mortality risk if DO crashes",
      "Rapid algae growth and crash cycles"
    ],
    actions: [
      "Monitor DO DAILY — especially at dawn",
      "Feed only before 8 AM and after 5 PM",
      "Keep tube well running for fresh water",
      "Install aerator before this season",
      "Reduce stocking density if possible"
    ],
    limeAdvice: "Avoid lime in peak summer — use carefully",
    feedingAdvice: "Reduce feed by 30-40% in extreme heat"
  },
  MONSOON: {
    season: "Monsoon",
    months: "July – September",
    tempRange: "25–32°C",
    phTendency: "Drops during heavy rain",
    doRisk: "Low-Moderate",
    keyRisks: [
      "Rain dilutes pond — pH can drop suddenly",
      "Pond overflow risk — check bunds",
      "Turbidity increases after rain",
      "Freshwater fish entry via overflow"
    ],
    actions: [
      "Check pH after every major rain event",
      "Inspect bunds weekly during monsoon",
      "Maintain overflow channel",
      "Apply lime if pH drops below 7.0 after rain",
      "Monitor bunds for rat/crab holes"
    ],
    limeAdvice: "Be ready to apply lime after heavy rains",
    feedingAdvice: "Delay feeding 2-3 hours after heavy rain"
  },
  POST_MONSOON: {
    season: "Post-Monsoon",
    months: "October – November",
    tempRange: "22–30°C",
    phTendency: "Stabilizes — good conditions",
    doRisk: "Low",
    keyRisks: [
      "Excellent growing season",
      "Water level drops — monitor closely",
      "Good conditions for weight gain"
    ],
    actions: [
      "Optimize feeding — best growth period",
      "Record growth samples",
      "Maintain water level with tube well",
      "Service equipment before winter"
    ],
    limeAdvice: "Good time for routine lime if pH is 7.0-7.5",
    feedingAdvice: "Maximize feeding — best FCR season"
  },
  WINTER: {
    season: "Winter",
    months: "December – February",
    tempRange: "12–22°C",
    phTendency: "Stable but lower",
    doRisk: "Very Low (high DO in cold)",
    keyRisks: [
      "Cold water slows fish metabolism",
      "Fish eat less — FCR may worsen",
      "Growth significantly reduced",
      "Disease risk increases"
    ],
    actions: [
      "Reduce feed by 30-50% in cold weather",
      "Feed only in warmest part of day (noon)",
      "Monitor for disease signs — check fins",
      "Plan harvest before March if fish are ready"
    ],
    limeAdvice: "Apply lime before pond refilling in spring",
    feedingAdvice: "Feed at noon only, reduce quantity significantly"
  }
};

export class WaterService {
  constructor(
    private readonly waterQualityRepo: WaterQualityLogRepository,
    private readonly treatmentRepo: WaterTreatmentLogRepository,
    private readonly pondRepo: PondRepository,
    private readonly fishStockingRepo: FishStockingRepository,
    private readonly mortalityLogRepo: MortalityLogRepository,
    private readonly activityRepo: ActivityLogRepository,
    private readonly notificationService: NotificationService
  ) {}

  public getPHStatus(ph: number): PHStatus {
    if (ph < 6.0) return 'CRITICAL_LOW';
    if (ph < 7.0) return 'LOW';
    if (ph <= 8.5) return 'NORMAL';
    if (ph <= 9.0) return 'HIGH';
    return 'CRITICAL_HIGH';
  }

  public getDOStatus(doVal: number): DOStatus {
    if (doVal < 2) return 'CRITICAL';
    if (doVal < 3) return 'VERY_LOW';
    if (doVal < 5) return 'LOW';
    if (doVal < 7) return 'NORMAL';
    return 'EXCELLENT';
  }

  public getWaterColorRisk(color: string): ColorRisk {
    if (['CLEAR', 'LIGHT_GREEN'].includes(color)) return 'GOOD';
    if (['DARK_GREEN', 'BROWN', 'CLOUDY'].includes(color)) return 'MODERATE';
    return 'HIGH'; // BLACK
  }

  public generateWaterAlerts(
    latestLog: WaterQualityLog | null,
    phStats: PHStats,
    doStats: DOStats,
    daysSinceReading: number,
    latestTreatment: WaterTreatmentLog | null
  ): WaterAlert[] {
    const alerts: WaterAlert[] = [];

    if (latestLog) {
      if (latestLog.phValue !== null) {
        const ph = latestLog.phValue;
        if (ph < 6.0) {
          alerts.push({
            type: 'danger',
            category: 'ph',
            title: "Critical pH — Immediate Action Required",
            message: `pH is ${ph}. This is life-threatening for fish. Apply 150-200 kg/acre agricultural lime immediately. Stop feeding. Monitor fish behavior closely.`,
            action: "Apply Agricultural Lime",
            priority: 1,
            actionUrl: "/water",
          });
        } else if (ph > 9.0) {
          alerts.push({
            type: 'danger',
            category: 'ph',
            title: "Critical High pH",
            message: `pH is ${ph}. Too alkaline. Add alum or increase water flow. Check for dense algae bloom.`,
            action: "Increase water exchange",
            priority: 1,
            actionUrl: "/water",
          });
        }
      }

      if (latestLog.dissolvedOxygenPpm !== null) {
        const doVal = latestLog.dissolvedOxygenPpm;
        if (doVal < DO_RANGES.CRITICAL) {
          alerts.push({
            type: 'danger',
            category: 'do',
            title: "Critical Oxygen Deficiency",
            message: `Dissolved oxygen is ${doVal} ppm. Fish will start dying. STOP FEEDING NOW. Add fresh water immediately. Create water movement. Plan emergency aeration.`,
            action: "Add fresh water & aerate",
            priority: 1,
            actionUrl: "/water",
          });
        }
      }

      if (latestLog.waterColor === 'BLACK') {
        alerts.push({
          type: 'danger',
          category: 'color',
          title: "Black Water Emergency",
          message: "Black water indicates anaerobic bottom conditions. This produces toxic hydrogen sulfide gas. Add fresh water, increase aeration, apply lime.",
          action: "Emergency water exchange",
          priority: 1,
          actionUrl: "/water",
        });
      }

      if (latestLog.waterSmell === 'FOUL') {
        alerts.push({
          type: 'danger',
          category: 'smell',
          title: "Foul Smell Detected",
          message: "Foul-smelling water indicates dangerous organic decomposition. Add fresh water, reduce feeding, consider lime application.",
          action: "Reduce feeding, exchange water",
          priority: 2,
          actionUrl: "/water",
        });
      }

      if (latestLog.dissolvedOxygenPpm !== null && latestLog.dissolvedOxygenPpm >= DO_RANGES.CRITICAL && latestLog.dissolvedOxygenPpm < DO_RANGES.VERY_LOW) {
        alerts.push({
          type: 'danger',
          category: 'do',
          title: "Very Low Dissolved Oxygen",
          message: `DO at ${latestLog.dissolvedOxygenPpm} ppm. Fish are stressed. Add fresh water, reduce feeding by 50%, increase surface agitation.`,
          action: "Reduce feed, aerate",
          priority: 2,
          actionUrl: "/water",
        });
      }

      if (latestLog.phValue !== null && latestLog.phValue >= 6.0 && latestLog.phValue < 7.0) {
        alerts.push({
          type: 'warning',
          category: 'ph',
          title: "pH Below Optimal Range",
          message: `pH is ${latestLog.phValue}. Apply 100 kg/acre agricultural lime (calcium carbonate only — NOT quick lime). Recheck pH in 48 hours.`,
          action: "Apply agricultural lime",
          priority: 2,
          actionUrl: "/water",
        });
      }

      if (latestLog.phValue !== null && latestLog.phValue > 8.5 && latestLog.phValue <= 9.0) {
        alerts.push({
          type: 'warning',
          category: 'ph',
          title: "pH Above Optimal Range",
          message: `pH at ${latestLog.phValue}. Reduce algae growth if present. Partial water exchange may help. Monitor daily.`,
          action: "Partial water exchange",
          priority: 3,
          actionUrl: "/water",
        });
      }

      if (latestLog.temperatureCelsius !== null && latestLog.temperatureCelsius > TEMP_RANGES.HOT) {
        alerts.push({
          type: 'warning',
          category: 'monitoring',
          title: "High Water Temperature",
          message: `Temperature is ${latestLog.temperatureCelsius}°C. DO levels will be reduced. Feed only in early morning and evening. Increase water exchange from tube well.`,
          action: "Adjust feeding time",
          priority: 3,
        });
      }

      if (latestLog.waterColor === 'DARK_GREEN') {
        alerts.push({
          type: 'warning',
          category: 'color',
          title: "Dense Algae Bloom",
          message: "Dark green water indicates heavy algae growth. DO may crash at night. Monitor early morning. Consider partial water exchange.",
          action: "Monitor DO, exchange water",
          priority: 3,
        });
      }
    }

    if (daysSinceReading >= 7) {
      alerts.push({
        type: 'warning',
        category: 'monitoring',
        title: "Water Quality Check Overdue",
        message: `No water quality reading in ${daysSinceReading} days. Test pH and observe water color today.`,
        action: "Log water quality",
        priority: 3,
        actionUrl: "/water",
      });
    } else if (daysSinceReading >= 3) {
      alerts.push({
        type: 'info',
        category: 'monitoring',
        title: "Water Quality Check Due",
        message: "Recommended to check water quality every 2-3 days.",
        action: "Log water quality",
        priority: 5,
        actionUrl: "/water",
      });
    }

    if (latestTreatment?.nextTreatmentDate) {
      const daysUntil = differenceInDays(latestTreatment.nextTreatmentDate, new Date());
      if (daysUntil >= 0 && daysUntil <= 3) {
        alerts.push({
          type: 'info',
          category: 'treatment',
          title: "Scheduled Treatment Due",
          message: `Upcoming treatment: ${latestTreatment.chemicalName} due on ${format(latestTreatment.nextTreatmentDate, 'MMM d, yyyy')}.`,
          action: "Prepare treatment",
          priority: 4,
          actionUrl: "/water",
        });
      }
    }

    return alerts.sort((a, b) => a.priority - b.priority);
  }

  private getSeasonalAdvice(month: number): SeasonalAdvice {
    if (month >= 3 && month <= 4) return SEASONAL_ADVICE.PRE_SUMMER;
    if (month >= 5 && month <= 6) return SEASONAL_ADVICE.SUMMER;
    if (month >= 7 && month <= 9) return SEASONAL_ADVICE.MONSOON;
    if (month >= 10 && month <= 11) return SEASONAL_ADVICE.POST_MONSOON;
    return SEASONAL_ADVICE.WINTER;
  }

  private async checkAndNotifyWaterAlerts(pondId: string, userId: string, log: WaterQualityLog) {
    if (log.phValue !== null) {
      const status = this.getPHStatus(log.phValue);
      if (status === 'CRITICAL_LOW' || status === 'CRITICAL_HIGH') {
        await this.notificationService.checkAndCreate({
          userId, pondId,
          title: "🚨 Critical pH Level",
          message: `pH is ${log.phValue}. Immediate action required.`,
          type: 'WATER_QUALITY_ALERT',
          priority: 'URGENT',
          actionUrl: '/water'
        });
      } else if (status === 'LOW' || status === 'HIGH') {
        await this.notificationService.checkAndCreate({
          userId, pondId,
          title: "⚠️ pH Out of Range",
          message: `pH is ${log.phValue}. Normal range: 7.0–8.5.`,
          type: 'WATER_QUALITY_ALERT',
          priority: 'HIGH',
          actionUrl: '/water'
        });
      }
    }

    if (log.dissolvedOxygenPpm !== null) {
      if (log.dissolvedOxygenPpm < DO_RANGES.CRITICAL) {
        await this.notificationService.checkAndCreate({
          userId, pondId,
          title: "🚨 Critical Oxygen Deficiency",
          message: `DO is only ${log.dissolvedOxygenPpm} ppm. Fish will die. Add fresh water immediately.`,
          type: 'WATER_QUALITY_ALERT',
          priority: 'URGENT',
          actionUrl: '/water'
        });
      }
    }

    if (log.waterSmell === 'FOUL') {
      await this.notificationService.checkAndCreate({
        userId, pondId,
        title: "⚠️ Foul Pond Smell",
        message: "Foul smell indicates water quality problems.",
        type: 'WATER_QUALITY_ALERT',
        priority: 'HIGH',
        actionUrl: '/water'
      });
    }

    if (log.waterColor === 'BLACK') {
      await this.notificationService.checkAndCreate({
        userId, pondId,
        title: "🚨 Black Water Detected",
        message: "Black water is dangerous. Take immediate action.",
        type: 'WATER_QUALITY_ALERT',
        priority: 'URGENT',
        actionUrl: '/water'
      });
    }
  }

  public async createWaterQualityLog(dto: CreateWaterQualityLogDTO, userId: string): Promise<WaterQualityLog> {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError("Pond not found or access denied", 404);

    const log = await this.waterQualityRepo.create({
      pond: { connect: { id: dto.pondId } },
      user: { connect: { id: userId } },
      logDate: new Date(dto.logDate),
      logTime: dto.logTime,
      phValue: dto.phValue,
      waterLevelFt: dto.waterLevelFt,
      waterColor: dto.waterColor as WaterColor,
      waterSmell: dto.waterSmell as WaterSmell,
      temperatureCelsius: dto.temperatureCelsius,
      dissolvedOxygenPpm: dto.dissolvedOxygenPpm,
      turbidity: dto.turbidity,
      dataSource: dto.dataSource as DataSource,
      notes: dto.notes,
    });

    await this.checkAndNotifyWaterAlerts(dto.pondId, userId, log);

    await this.activityRepo.create({
      user: { connect: { id: userId } },
      action: 'WATER_QUALITY_LOGGED',
      module: 'water',
      recordId: log.id,
      details: { ph: log.phValue, color: log.waterColor } as any
    });

    return log;
  }

  public async getWaterQualityLogs(pondId: string, userId: string, query: WaterQualityListQuery) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const skip = (query.page - 1) * query.limit;
    return this.waterQualityRepo.findByPondId(pondId, {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      skip,
      take: query.limit,
    });
  }

  public async getWaterQualityLogById(id: string, pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const log = await this.waterQualityRepo.findByIdAndPondId(id, pondId);
    if (!log) throw new AppError("Log not found", 404);
    return log;
  }

  public async updateWaterQualityLog(id: string, pondId: string, userId: string, dto: UpdateWaterQualityLogDTO) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const existing = await this.waterQualityRepo.findByIdAndPondId(id, pondId);
    if (!existing) throw new AppError("Log not found", 404);

    const updated = await this.waterQualityRepo.update(id, {
      ...(dto.logDate && { logDate: new Date(dto.logDate) }),
      ...(dto.logTime !== undefined && { logTime: dto.logTime }),
      ...(dto.phValue !== undefined && { phValue: dto.phValue }),
      ...(dto.waterLevelFt !== undefined && { waterLevelFt: dto.waterLevelFt }),
      ...(dto.waterColor !== undefined && { waterColor: dto.waterColor as WaterColor }),
      ...(dto.waterSmell !== undefined && { waterSmell: dto.waterSmell as WaterSmell }),
      ...(dto.temperatureCelsius !== undefined && { temperatureCelsius: dto.temperatureCelsius }),
      ...(dto.dissolvedOxygenPpm !== undefined && { dissolvedOxygenPpm: dto.dissolvedOxygenPpm }),
      ...(dto.turbidity !== undefined && { turbidity: dto.turbidity }),
      ...(dto.dataSource !== undefined && { dataSource: dto.dataSource as DataSource }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    });

    await this.checkAndNotifyWaterAlerts(pondId, userId, updated);
    return updated;
  }

  public async deleteWaterQualityLog(id: string, pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const existing = await this.waterQualityRepo.findByIdAndPondId(id, pondId);
    if (!existing) throw new AppError("Log not found", 404);

    await this.waterQualityRepo.delete(id);

    await this.activityRepo.create({
      user: { connect: { id: userId } },
      action: 'WATER_QUALITY_DELETED',
      module: 'water',
      recordId: id,
      details: { id } as any
    });

    return true;
  }

  public async createWaterTreatment(dto: CreateWaterTreatmentDTO, userId: string): Promise<WaterTreatmentLog> {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    if (dto.chemicalType === 'QUICK_LIME') {
      throw new AppError(
        "Quick lime is NOT recommended for active fish ponds. Use agricultural lime (calcium carbonate) instead. Quick lime can kill fish. If you must use it, apply only to dry pond bottom before filling.",
        400
      );
    }

    if (dto.chemicalType === 'AGRICULTURAL_LIME') {
      const maxSafeKg = pond.areaAcres * 300;
      if (dto.quantityKg > maxSafeKg) {
        throw new AppError(
          `${dto.quantityKg}kg of lime for a ${pond.areaAcres.toFixed(3)} acre pond may be excessive. Recommended max: ${Math.round(maxSafeKg)}kg (300 kg/acre). Reduce quantity or apply in stages.`,
          400
        );
      }
    }

    const treatment = await this.treatmentRepo.create({
      pond: { connect: { id: dto.pondId } },
      user: { connect: { id: userId } },
      treatmentDate: new Date(dto.treatmentDate),
      chemicalName: dto.chemicalName,
      chemicalType: dto.chemicalType as ChemicalType,
      quantityKg: dto.quantityKg,
      reason: dto.reason,
      applicationMethod: dto.applicationMethod as ApplicationMethod | null,
      phBefore: dto.phBefore,
      phAfter: dto.phAfter,
      resultObserved: dto.resultObserved,
      nextTreatmentDate: dto.nextTreatmentDate ? new Date(dto.nextTreatmentDate) : null,
      notes: dto.notes,
    });

    await this.activityRepo.create({
      user: { connect: { id: userId } },
      action: 'WATER_TREATMENT_APPLIED',
      module: 'water',
      recordId: treatment.id,
      details: {
        chemical: dto.chemicalName,
        quantityKg: dto.quantityKg,
        reason: dto.reason
      }
    });

    if (dto.nextTreatmentDate) {
      await this.notificationService.checkAndCreate({
        userId, pondId: dto.pondId,
        title: `Treatment Reminder: ${dto.chemicalName}`,
        message: `Next ${dto.chemicalName} application scheduled.`,
        type: 'TASK_DUE',
        priority: 'MEDIUM',
        actionUrl: '/water'
      });
    }

    return treatment;
  }

  public async getTreatmentLogs(pondId: string, userId: string, query: { page: number; limit: number; chemicalType?: string }) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const skip = (query.page - 1) * query.limit;
    return this.treatmentRepo.findByPondId(pondId, { skip, take: query.limit, chemicalType: query.chemicalType });
  }

  public async updateWaterTreatment(id: string, pondId: string, userId: string, dto: UpdateWaterTreatmentDTO) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const existing = await this.treatmentRepo.findByIdAndPondId(id, pondId);
    if (!existing) throw new AppError("Treatment not found", 404);

    return this.treatmentRepo.update(id, {
      ...(dto.treatmentDate && { treatmentDate: new Date(dto.treatmentDate) }),
      ...(dto.chemicalName !== undefined && { chemicalName: dto.chemicalName }),
      ...(dto.chemicalType !== undefined && { chemicalType: dto.chemicalType as ChemicalType }),
      ...(dto.quantityKg !== undefined && { quantityKg: dto.quantityKg }),
      ...(dto.reason !== undefined && { reason: dto.reason }),
      ...(dto.applicationMethod !== undefined && { applicationMethod: dto.applicationMethod as ApplicationMethod }),
      ...(dto.phBefore !== undefined && { phBefore: dto.phBefore }),
      ...(dto.phAfter !== undefined && { phAfter: dto.phAfter }),
      ...(dto.resultObserved !== undefined && { resultObserved: dto.resultObserved }),
      ...(dto.nextTreatmentDate !== undefined && { nextTreatmentDate: dto.nextTreatmentDate ? new Date(dto.nextTreatmentDate) : null }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    });
  }

  public async deleteWaterTreatment(id: string, pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const existing = await this.treatmentRepo.findByIdAndPondId(id, pondId);
    if (!existing) throw new AppError("Treatment not found", 404);

    await this.treatmentRepo.delete(id);
    return true;
  }

  public async getWaterQualityStats(pondId: string, userId: string, query: WaterQualityStatsQuery): Promise<WaterQualityStats> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    let startDate = new Date();
    let periodDays = 30;
    if (query.period === '7d') { periodDays = 7; startDate = addDays(new Date(), -7); }
    else if (query.period === '30d') { periodDays = 30; startDate = addDays(new Date(), -30); }
    else if (query.period === '90d') { periodDays = 90; startDate = addDays(new Date(), -90); }
    else { periodDays = 365; startDate = new Date(0); } // all

    const [
      allLogs,
      phStats,
      doStats,
      tempStats,
      colorFrequency,
      daysSinceReading,
      latestLog,
      allTreatments,
      latestTreatment,
      latestLime,
      chemicalUsage,
      upcomingTreatments
    ] = await Promise.all([
      this.waterQualityRepo.findByPondIdAndDateRange(pondId, startDate, new Date()),
      this.waterQualityRepo.getPHStats(pondId, startDate),
      this.waterQualityRepo.getDOStats(pondId, startDate),
      this.waterQualityRepo.getTemperatureStats(pondId, startDate),
      this.waterQualityRepo.getWaterColorFrequency(pondId),
      this.waterQualityRepo.getDaysSinceLastReading(pondId),
      this.waterQualityRepo.findLatestByPondId(pondId),
      this.treatmentRepo.findAllByPondId(pondId),
      this.treatmentRepo.findLatestByPondId(pondId),
      this.treatmentRepo.findLatestLimeApplication(pondId),
      this.treatmentRepo.getChemicalUsageSummary(pondId),
      this.treatmentRepo.findUpcomingTreatments(pondId),
    ]);

    const alerts = this.generateWaterAlerts(latestLog, phStats, doStats, daysSinceReading, latestTreatment);

    const phTrend: PHDataPoint[] = [];
    const doTrend: DODataPoint[] = [];
    const tempTrend: TempDataPoint[] = [];

    const realStartDate = query.period === 'all' && allLogs.length > 0 ? allLogs[0].logDate : startDate;
    const daysInInterval = eachDayOfInterval({ start: realStartDate, end: new Date() });

    const logsByDate = new Map<string, WaterQualityLog>();
    for (const log of allLogs) {
      logsByDate.set(format(log.logDate, 'yyyy-MM-dd'), log); // latest per day will overwrite
    }

    for (const d of daysInInterval) {
      const dStr = format(d, 'yyyy-MM-dd');
      const log = logsByDate.get(dStr);
      
      phTrend.push({
        date: d.toISOString(),
        displayDate: format(d, 'MMM d'),
        ph: log?.phValue ?? null,
        status: log?.phValue ? this.getPHStatus(log.phValue) : 'NO_DATA'
      });

      doTrend.push({
        date: d.toISOString(),
        displayDate: format(d, 'MMM d'),
        do: log?.dissolvedOxygenPpm ?? null,
        status: log?.dissolvedOxygenPpm ? this.getDOStatus(log.dissolvedOxygenPpm) : 'NO_DATA'
      });

      tempTrend.push({
        date: d.toISOString(),
        displayDate: format(d, 'MMM d'),
        temp: log?.temperatureCelsius ?? null
      });
    }

    const recommendedLimeKg = Math.round(pond.areaAcres * LIME_RECOMMENDATION_KG_PER_ACRE);
    const totalLimeUsed = await this.treatmentRepo.getTotalLimeUsedKg(pondId);
    const daysSinceLastLime = latestLime ? differenceInDays(new Date(), latestLime.treatmentDate) : 999;
    
    let isApplicationDue = false;
    if (daysSinceLastLime > 30 && latestLog?.phValue && latestLog.phValue < 7.5) {
      isApplicationDue = true;
    }

    const currentMonth = new Date().getMonth() + 1;
    const seasonalAdvice = this.getSeasonalAdvice(currentMonth);

    return {
      periodDays,
      totalReadings: allLogs.length,
      daysSinceLastReading: daysSinceReading,
      latestLog,
      latestPHStatus: latestLog?.phValue ? this.getPHStatus(latestLog.phValue) : 'NO_DATA',
      latestDOStatus: latestLog?.dissolvedOxygenPpm ? this.getDOStatus(latestLog.dissolvedOxygenPpm) : 'NO_DATA',
      phStats,
      doStats,
      tempStats,
      colorFrequency,
      phTrend,
      doTrend,
      tempTrend,
      alerts,
      allTreatments,
      upcomingTreatments,
      chemicalUsage,
      limeRecommendation: {
        pondAreaAcres: pond.areaAcres,
        recommendedKgPerAcre: LIME_RECOMMENDATION_KG_PER_ACRE,
        recommendedTotalKg: recommendedLimeKg,
        totalUsedKg: totalLimeUsed,
        daysSinceLastApplication: daysSinceLastLime,
        isApplicationDue,
        nextApplicationAdvice: isApplicationDue ? "Apply lime soon to stabilize pH" : "No lime needed currently"
      },
      seasonalAdvice,
    };
  }

  public async getWaterOverview(pondId: string, userId: string): Promise<WaterOverview> {
    const [stats, logs, treatments] = await Promise.all([
      this.getWaterQualityStats(pondId, userId, { pondId, period: '30d' }),
      this.getWaterQualityLogs(pondId, userId, { pondId, page: 1, limit: 20 }),
      this.getTreatmentLogs(pondId, userId, { page: 1, limit: 10 }),
    ]);

    return {
      stats,
      recentLogs: logs.records,
      recentTreatments: treatments.records,
    };
  }
}
