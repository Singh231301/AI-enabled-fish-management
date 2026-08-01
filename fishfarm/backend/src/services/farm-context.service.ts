import { PondRepository } from '../repositories/pond.repository';
import { FishStockingRepository } from '../repositories/fish-stocking.repository';
import { MortalityLogRepository } from '../repositories/mortality-log.repository';
import { FishGrowthSampleRepository } from '../repositories/fish-growth-sample.repository';
import { FeedingLogRepository } from '../repositories/feeding-log.repository';
import { WaterQualityLogRepository } from '../repositories/water-quality-log.repository';
import { WaterTreatmentLogRepository } from '../repositories/water-treatment-log.repository';
import { ExpenseRepository } from '../repositories/expense.repository';
import { SaleRepository } from '../repositories/sale.repository';
import { InventoryRepository } from '../repositories/inventory.repository';
import { TaskRepository } from '../repositories/task.repository';
import { WeatherService } from './weather.service';
import { FarmContext } from '../types/ai.types';
import { AppError } from '../utils/app-error';
import { differenceInDays } from 'date-fns';

export class FarmContextService {
  constructor(
    private pondRepo: PondRepository,
    private stockingRepo: FishStockingRepository,
    private mortalityRepo: MortalityLogRepository,
    private growthRepo: FishGrowthSampleRepository,
    private feedingRepo: FeedingLogRepository,
    private waterRepo: WaterQualityLogRepository,
    private waterTreatmentRepo: WaterTreatmentLogRepository,
    private expenseRepo: ExpenseRepository,
    private saleRepo: SaleRepository,
    private inventoryRepo: InventoryRepository,
    private taskRepo: TaskRepository,
    private weatherService: WeatherService
  ) {}

  private getCurrentSeason(month: number): string {
    if (month >= 3 && month <= 6) return 'SUMMER';
    if (month >= 7 && month <= 9) return 'MONSOON';
    if (month >= 10 && month <= 11) return 'POST_MONSOON';
    if (month === 12 || month <= 2) return 'WINTER';
    return 'PRE_SUMMER';
  }

  private getSeasonSummary(season: string): string {
    switch (season) {
      case 'SUMMER':
        return "Peak summer — high DO risk, early morning feeding only";
      case 'MONSOON':
        return "Monsoon — monitor bunds, check pH after rain";
      case 'POST_MONSOON':
        return "Best growth season — maximize feeding";
      case 'WINTER':
        return "Cold water — reduce feed, feed at noon";
      case 'PRE_SUMMER':
        return "Warming up — prepare for summer protocols";
      default:
        return "Normal conditions";
    }
  }

  async buildFarmContext(pondId: string, userId: string, modules: string[] = ['all']): Promise<FarmContext> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const includeAll = modules.includes('all');

    const [
      latestStocking,
      totalMortality,
      latestGrowth,
      latestWater,
      todayFeeding,
      recentExpenses,
      lowStockItems,
      overdueTasks,
      weather
    ] = await Promise.all([
      includeAll || modules.includes('fish') ? this.stockingRepo.findLatestByPondId(pondId) : Promise.resolve(null),
      includeAll || modules.includes('fish') ? this.mortalityRepo.getTotalMortality(pondId) : Promise.resolve(0),
      includeAll || modules.includes('fish') ? this.growthRepo.findLatestByPondId(pondId) : Promise.resolve(null),
      includeAll || modules.includes('water') ? this.waterRepo.findLatestByPondId(pondId) : Promise.resolve(null),
      includeAll || modules.includes('feeding') ? this.feedingRepo.findTodayByPondId(pondId) : Promise.resolve([]),
      includeAll || modules.includes('financials') ? this.expenseRepo.getTotalExpenses(pondId) : Promise.resolve(0),
      includeAll || modules.includes('inventory') ? this.inventoryRepo.findLowStockItems(pondId) : Promise.resolve([]),
      includeAll || modules.includes('tasks') ? this.taskRepo.countByStatus(userId, pondId) : Promise.resolve(null),
      includeAll ? this.weatherService.getCurrentWeather(pond.latitude ?? 25.1337, pond.longitude ?? 82.5644).catch(() => null) : Promise.resolve(null)
    ]);

    const today = new Date();
    const fishAgeDays = latestStocking ? differenceInDays(today, latestStocking.stockingDate) : 0;
    const fishAgeWeeks = Math.floor(fishAgeDays / 7);
    const totalStocked = latestStocking?.quantity ?? 0;
    const estimatedAlive = totalStocked - totalMortality;
    const survivalRate = totalStocked > 0 ? ((estimatedAlive / totalStocked) * 100) : 100;
    const avgWeightGrams = latestGrowth?.averageWeightGrams ?? null;
    const estimatedBiomassKg = avgWeightGrams && estimatedAlive ? (estimatedAlive * avgWeightGrams) / 1000 : null;

    const todayFedGrams = todayFeeding.reduce((s, l) => s + l.quantityGrams, 0);
    const fedToday = todayFeeding.length > 0;

    const latestPH = latestWater?.phValue ?? null;
    let phStatus = 'UNKNOWN';
    if (latestPH !== null) {
      if (latestPH < 6.5) phStatus = 'CRITICAL_LOW';
      else if (latestPH < 7.0) phStatus = 'LOW';
      else if (latestPH <= 8.5) phStatus = 'NORMAL';
      else if (latestPH <= 9.0) phStatus = 'HIGH';
      else phStatus = 'CRITICAL_HIGH';
    }

    const currentMonth = today.getMonth() + 1;
    const season = this.getCurrentSeason(currentMonth);

    return {
      generatedAt: today.toISOString(),
      pond: {
        name: pond.name,
        location: pond.location,
        areaSqft: pond.areaSqft,
        areaAcres: pond.areaAcres,
        maxDepthFt: pond.maxDepthFt,
        soilType: pond.soilType,
        waterSource: pond.waterSource,
        pondType: pond.pondType
      },
      fish: latestStocking ? {
        species: latestStocking.species,
        localName: latestStocking.localName,
        totalStocked,
        estimatedAlive,
        totalMortality,
        survivalRate: parseFloat(survivalRate.toFixed(2)),
        fishAgeDays,
        fishAgeWeeks,
        stockingDate: latestStocking.stockingDate.toISOString(),
        fingerlingSize_cm: latestStocking.fingerlingSize_cm,
        batchNumber: latestStocking.batchNumber
      } : null,
      growth: latestGrowth ? {
        avgWeightGrams: latestGrowth.averageWeightGrams,
        sampleDate: latestGrowth.sampleDate.toISOString(),
        fishSampledCount: latestGrowth.fishSampledCount,
        estimatedBiomassKg,
        daysSinceLastSample: differenceInDays(today, latestGrowth.sampleDate)
      } : null,
      feeding: {
        fedToday,
        todayFedGrams,
        todaySessionCount: todayFeeding.length,
        lastFeedResponse: todayFeeding.length > 0 ? todayFeeding[todayFeeding.length - 1].fishResponse : null
      },
      water: latestWater ? {
        logDate: latestWater.logDate.toISOString(),
        phValue: latestPH,
        phStatus,
        waterColor: latestWater.waterColor,
        waterSmell: latestWater.waterSmell,
        temperatureCelsius: latestWater.temperatureCelsius,
        dissolvedOxygenPpm: latestWater.dissolvedOxygenPpm,
        daysSinceLastReading: differenceInDays(today, latestWater.logDate)
      } : null,
      financials: {
        totalInvested: recentExpenses
      },
      inventory: {
        lowStockCount: lowStockItems.length,
        lowStockItems: lowStockItems.map(i => ({
          name: i.itemName,
          quantity: i.currentQuantity,
          unit: i.unit,
          threshold: i.reorderThreshold
        }))
      },
      tasks: overdueTasks ? {
        overdueCount: overdueTasks.overdue,
        dueTodayCount: overdueTasks.dueToday,
        pendingCount: overdueTasks.pending
      } : null,
      season: {
        name: season,
        month: currentMonth,
        advice: this.getSeasonSummary(season)
      },
      weather: weather ? {
        temperature: weather.current.temperature,
        description: weather.current.weatherDescription,
        humidity: weather.current.humidity,
        pondImpact: weather.pondImpact
      } : null
    };
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  buildContextString(context: FarmContext): string {
    return `
=== FISHFARM MANAGER — FARM CONTEXT ===
Generated: ${this.formatDate(context.generatedAt)}

POND DETAILS:
- Name: ${context.pond.name}
- Location: ${context.pond.location}
- Area: ${context.pond.areaAcres.toFixed(3)} acres (${context.pond.areaSqft} sq ft)
- Max Depth: ${context.pond.maxDepthFt} ft
- Soil Type: ${context.pond.soilType}
- Water Source: ${context.pond.waterSource}
- Pond Type: ${context.pond.pondType}

FISH STATUS:
${context.fish ? `
- Species: ${context.fish.species}${context.fish.localName ? ` (${context.fish.localName})` : ''}
- Age: ${context.fish.fishAgeDays} days (${context.fish.fishAgeWeeks} weeks)
- Originally Stocked: ${context.fish.totalStocked} fish
- Estimated Alive: ${context.fish.estimatedAlive} fish
- Total Mortality: ${context.fish.totalMortality} fish
- Survival Rate: ${context.fish.survivalRate}%
- Stocking Date: ${this.formatDate(context.fish.stockingDate)}
` : '- No fish stocked yet'}

GROWTH:
${context.growth ? `
- Latest Avg Weight: ${context.growth.avgWeightGrams}g
- Sample Date: ${this.formatDate(context.growth.sampleDate)} (${context.growth.daysSinceLastSample} days ago)
- Fish Sampled: ${context.growth.fishSampledCount}
- Estimated Biomass: ${context.growth.estimatedBiomassKg?.toFixed(2) ?? 'Unknown'} kg
` : '- No growth samples recorded yet'}

TODAY'S FEEDING:
- Fed Today: ${context.feeding.fedToday ? 'YES' : 'NO'}
- Total Fed: ${context.feeding.todayFedGrams}g
- Sessions: ${context.feeding.todaySessionCount}
- Last Response: ${context.feeding.lastFeedResponse ?? 'Not recorded'}

WATER QUALITY (latest reading):
${context.water ? `
- Date: ${this.formatDate(context.water.logDate)} (${context.water.daysSinceLastReading} days ago)
- pH: ${context.water.phValue ?? 'Not measured'} (Status: ${context.water.phStatus})
- Color: ${context.water.waterColor}
- Smell: ${context.water.waterSmell}
- Temperature: ${context.water.temperatureCelsius ?? 'Not measured'}°C
- Dissolved Oxygen: ${context.water.dissolvedOxygenPpm ?? 'Not measured'} ppm
` : '- No water quality readings yet'}

FINANCIALS:
- Total Invested: ₹${context.financials.totalInvested.toFixed(2)}

INVENTORY ALERTS:
- Low Stock Items: ${context.inventory.lowStockCount}
${context.inventory.lowStockItems.map(i => `  • ${i.name}: ${i.quantity}${i.unit} (threshold: ${i.threshold}${i.unit})`).join('\n')}

TASKS:
${context.tasks ? `
- Overdue: ${context.tasks.overdueCount}
- Due Today: ${context.tasks.dueTodayCount}
- Pending: ${context.tasks.pendingCount}
` : '- Task data not loaded'}

CURRENT SEASON:
- Season: ${context.season.name}
- Month: ${context.season.month}
- Advice: ${context.season.advice}

WEATHER (Mirzapur area):
${context.weather ? `
- Temperature: ${context.weather.temperature}°C
- Conditions: ${context.weather.description}
- Humidity: ${context.weather.humidity}%
- Pond Impact: ${context.weather.pondImpact}
` : '- Weather data unavailable'}

=== END OF FARM CONTEXT ===
`;
  }
}
