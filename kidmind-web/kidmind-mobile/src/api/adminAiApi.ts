import {
  authRequest,
} from "@/api/authApi";


export type AdminAITotals = {
  totalChildren: number;
  improvedChildren: number;
  noClearImprovement: number;
  needsAttention: number;
  childrenWithEnoughData: number;
  childrenWithoutEnoughData: number;
  totalTherapists: number;
  activeTherapists: number;
  totalAssessmentSessions: number;
  completedAssessmentSessions: number;
};


export type AdminAIRegionCount = {
  region: string;
  count: number;
};


export type AdminAICognitivePerformance = {
  key: string;
  label: string;
  gameName: string;
  averageScore: number | null;
  averageAccuracy: number | null;
  assessments: number;
  children: number;
};


export type AdminAITrendPoint = {
  period: string;
  label: string;
  averageScore: number;
  sessions: number;
  children: number;
};


export type AdminAIEarlySignal = {
  key: string;
  label: string;
  gameName: string;
  direction:
    | "rising"
    | "declining"
    | "stable"
    | "insufficient_data";
  attentionLevel:
    | "positive"
    | "watch"
    | "needs_attention"
    | "insufficient_data";
  delta: number | null;
  currentAverage: number | null;
  previousAverage: number | null;
  currentSamples: number;
  previousSamples: number;
};


export type AdminAITrend = {
  title: string;
  description: string;
  domainKey?: string | null;
  direction?:
    | "positive"
    | "watch"
    | "emerging"
    | "stable";
};


export type AdminAIRecommendation = {
  title: string;
  description: string;
  priority:
    | "high"
    | "medium"
    | "low";
};


export type AdminAIInsightsData = {
  statistics: {
    generatedAt: string;
    methodology: {
      improvementThresholdPoints: number;
      needsAttentionScoreThreshold: number;
      domainTrendThresholdPoints: number;
      geographyField: string;
      notes: string[];
    };
    totals: AdminAITotals;
    childrenByRegion: AdminAIRegionCount[];
    cognitivePerformance: AdminAICognitivePerformance[];
    improvementTrend: AdminAITrendPoint[];
    earlyTrendSignals: AdminAIEarlySignal[];
  };
  ai: {
    available: boolean;
    summary: string;
    keyTrends: AdminAITrend[];
    areasNeedingAttention: AdminAITrend[];
    positiveTrends: AdminAITrend[];
    emergingTrends: AdminAITrend[];
    recommendations: AdminAIRecommendation[];
    error: string | null;
  };
};


type AdminAIInsightsResponse = {
  success: boolean;
  message?: string;
  data?: AdminAIInsightsData;
};


export const getAdminAIInsights =
  async (): Promise<
    AdminAIInsightsData
  > => {
    const response =
      await authRequest<
        AdminAIInsightsResponse
      >(
        "/api/ai/admin-insights"
      );

    if (
      !response.success ||
      !response.data
    ) {
      throw new Error(
        response.message ||
        "Invalid Admin AI response."
      );
    }

    return response.data;
  };
