export type PHStatus =
  | 'CRITICAL_LOW'
  | 'LOW'
  | 'NORMAL'
  | 'HIGH'
  | 'CRITICAL_HIGH'
  | 'NO_DATA'

export type DOStatus =
  | 'CRITICAL'
  | 'VERY_LOW'
  | 'LOW'
  | 'NORMAL'
  | 'EXCELLENT'
  | 'NO_DATA'

export type ColorRisk = 'GOOD' | 'MODERATE' | 'HIGH'

export interface PHStats {
  count: number
  average: number | null
  min: number | null
  max: number | null
  latest: number | null
  latestDate: Date | null
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
  latestDate: Date | null
  criticalReadings: number
  lowReadings: number
  normalReadings: number
}

export interface TemperatureStats {
  count: number
  average: number | null
  min: number | null
  max: number | null
  latest: number | null
  latestDate: Date | null
}

export interface ColorFrequency {
  waterColor: string
  count: number
  percentage: number
}

export interface ChemicalUsageSummary {
  chemicalType: string
  chemicalName: string
  totalKg: number
  applicationCount: number
}

export interface WaterAlert {
  type: 'danger' | 'warning' | 'info'
  category: 'ph' | 'do' | 'color' | 'smell' | 'monitoring' | 'treatment'
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

export interface WaterQualityStats {
  periodDays: number
  totalReadings: number
  daysSinceLastReading: number
  latestLog: any | null // WaterQualityLog
  latestPHStatus: PHStatus
  latestDOStatus: DOStatus
  phStats: PHStats
  doStats: DOStats
  tempStats: TemperatureStats
  colorFrequency: ColorFrequency[]
  phTrend: PHDataPoint[]
  doTrend: DODataPoint[]
  tempTrend: TempDataPoint[]
  alerts: WaterAlert[]
  allTreatments: any[] // WaterTreatmentLog[]
  upcomingTreatments: any[] // WaterTreatmentLog[]
  chemicalUsage: ChemicalUsageSummary[]
  limeRecommendation: LimeRecommendation
  seasonalAdvice: SeasonalAdvice
}

export interface WaterOverview {
  stats: WaterQualityStats
  recentLogs: any[]
  recentTreatments: any[]
}
