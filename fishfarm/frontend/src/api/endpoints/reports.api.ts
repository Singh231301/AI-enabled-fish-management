import axiosInstance from '../axios';
import {
  FarmScorecard,
  HarvestReadinessReport,
  GrowthAnalyticsReport,
  FeedingPerformanceData,
  WaterQualityReportData,
  FullFarmReport,
  ExportDataResult,
  ReportPeriod
} from '../../types/reports.types';

export const reportsApi = {
  getScorecard: async (pondId: string): Promise<FarmScorecard> => {
    const response = await axiosInstance.get(`/reports/scorecard`, {
      params: { pondId }
    });
    return response.data.data;
  },

  getHarvestReadiness: async (pondId: string): Promise<HarvestReadinessReport> => {
    const response = await axiosInstance.get(`/reports/harvest-readiness`, {
      params: { pondId }
    });
    return response.data.data;
  },

  getGrowthAnalytics: async (pondId: string): Promise<GrowthAnalyticsReport> => {
    const response = await axiosInstance.get(`/reports/growth-analytics`, {
      params: { pondId }
    });
    return response.data.data;
  },

  getFeedingAnalytics: async (
    pondId: string,
    period: ReportPeriod,
    startDate?: string,
    endDate?: string
  ): Promise<FeedingPerformanceData> => {
    const response = await axiosInstance.get(`/reports/feeding-analytics`, {
      params: { pondId, period, startDate, endDate }
    });
    return response.data.data;
  },

  getWaterQuality: async (
    pondId: string,
    period: ReportPeriod,
    startDate?: string,
    endDate?: string
  ): Promise<WaterQualityReportData> => {
    const response = await axiosInstance.get(`/reports/water-quality`, {
      params: { pondId, period, startDate, endDate }
    });
    return response.data.data;
  },

  getFullFarmReport: async (
    pondId: string,
    period: ReportPeriod,
    startDate?: string,
    endDate?: string
  ): Promise<FullFarmReport> => {
    const response = await axiosInstance.get(`/reports/full`, {
      params: { pondId, period, startDate, endDate }
    });
    return response.data.data;
  },

  exportData: async (
    pondId: string,
    module: string,
    period: ReportPeriod,
    startDate?: string,
    endDate?: string
  ): Promise<ExportDataResult> => {
    const response = await axiosInstance.get(`/reports/export`, {
      params: { pondId, module, period, startDate, endDate }
    });
    return response.data.data;
  }
};
