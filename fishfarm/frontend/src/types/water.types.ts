export type WaterColor =
  | 'CLEAR' | 'LIGHT_GREEN' | 'DARK_GREEN'
  | 'BROWN' | 'CLOUDY' | 'BLACK'

export type WaterSmell =
  | 'NONE' | 'MILD' | 'STRONG' | 'FOUL'

export type PHStatus =
  | 'CRITICAL_LOW' | 'LOW' | 'NORMAL'
  | 'HIGH' | 'CRITICAL_HIGH' | 'NO_DATA'

export type DOStatus =
  | 'CRITICAL' | 'VERY_LOW' | 'LOW'
  | 'NORMAL' | 'EXCELLENT' | 'NO_DATA'

export type ChemicalType =
  | 'AGRICULTURAL_LIME' | 'QUICK_LIME' | 'DOLOMITE'
  | 'POTASSIUM_PERMANGANATE' | 'BLEACHING_POWDER'
  | 'SALT' | 'PROBIOTIC' | 'OTHER'

export type ApplicationMethod =
  | 'BROADCAST' | 'DISSOLVED_IN_WATER' | 'SPOT_APPLICATION'
  | 'INLET_WATER' | 'OTHER'

export interface WaterQualityLog {
  id: string
  pondId: string
  logDate: string
  logTime: string | null
  phValue: number | null
  waterLevelFt: number | null
  waterColor: WaterColor
  waterSmell: WaterSmell
  temperatureCelsius: number | null
  dissolvedOxygenPpm: number | null
  turbidity: string | null
  dataSource: 'MANUAL' | 'SENSOR'
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface WaterTreatmentLog {
  id: string
  pondId: string
  treatmentDate: string
  chemicalName: string
  chemicalType: ChemicalType
  quantityKg: number
  reason: string
  applicationMethod: ApplicationMethod | null
  phBefore: number | null
  phAfter: number | null
  resultObserved: string | null
  nextTreatmentDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface WaterAlert {
  type: 'danger' | 'warning' | 'info'
  category: string
  title: string
  message: string
  action: string
  priority: number
  actionUrl?: string
}

export interface PHDataPoint {
  date: string
  displayDate: string
  ph: number | null
  status: PHStatus
}

export interface DODataPoint {
  date: string
  displayDate: string
  do: number | null
  status: DOStatus
}

export interface TempDataPoint {
  date: string
  displayDate: string
  temp: number | null
}

export interface PHStats {
  count: number
  average: number | null
  min: number | null
  max: number | null
  latest: number | null
  latestDate: string | null
  daysInNormalRange: number
  daysOutOfRange: number
  normalRangePercent: number
}

export interface DOStats {
  count: number
  average: number | null
  min: number | null
  max: number | null
  latest: number | null
  latestDate: string | null
  criticalReadings: number
  lowReadings: number
  normalReadings: number
}

export interface SeasonalAdvice {
  season: string
  months: string
  tempRange: string
  phTendency: string
  doRisk: string
  keyRisks: string[]
  actions: string[]
  limeAdvice: string
  feedingAdvice: string
}

export interface LimeRecommendation {
  pondAreaAcres: number
  recommendedKgPerAcre: number
  recommendedTotalKg: number
  totalUsedKg: number
  daysSinceLastApplication: number
  isApplicationDue: boolean
  nextApplicationAdvice: string
}

export interface ColorFrequency {
  waterColor: WaterColor
  count: number
  percentage: number
}

export interface ChemicalUsageSummary {
  chemicalType: ChemicalType
  chemicalName: string
  totalKg: number
  applicationCount: number
}

export interface WaterQualityStats {
  periodDays: number
  totalReadings: number
  daysSinceLastReading: number
  latestLog: WaterQualityLog | null
  latestPHStatus: PHStatus
  latestDOStatus: DOStatus
  phStats: PHStats
  doStats: DOStats
  phTrend: PHDataPoint[]
  doTrend: DODataPoint[]
  tempTrend: TempDataPoint[]
  colorFrequency: ColorFrequency[]
  alerts: WaterAlert[]
  allTreatments: WaterTreatmentLog[]
  upcomingTreatments: WaterTreatmentLog[]
  chemicalUsage: ChemicalUsageSummary[]
  limeRecommendation: LimeRecommendation
  seasonalAdvice: SeasonalAdvice
}

export interface WaterOverview {
  stats: WaterQualityStats
  recentLogs: WaterQualityLog[]
  recentTreatments: WaterTreatmentLog[]
}

export interface CreateWaterQualityLogForm {
  pondId: string
  logDate: string
  logTime?: string
  phValue?: number
  waterLevelFt?: number
  waterColor: WaterColor
  waterSmell: WaterSmell
  temperatureCelsius?: number
  dissolvedOxygenPpm?: number
  turbidity?: string
  notes?: string
}

export interface CreateWaterTreatmentForm {
  pondId: string
  treatmentDate: string
  chemicalName: string
  chemicalType: ChemicalType
  quantityKg: number
  reason: string
  applicationMethod?: ApplicationMethod
  phBefore?: number
  phAfter?: number
  resultObserved?: string
  nextTreatmentDate?: string
  notes?: string
}
