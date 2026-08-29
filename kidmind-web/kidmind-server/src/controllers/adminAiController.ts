import type {
  Response,
} from "express";

import {
  getAdminPlatformStatistics,
} from "../models/adminInsightsModel";

import {
  generateAdminAIInterpretation,
} from "../services/adminAiService";

import type {
  AuthenticatedRequest,
} from "../middleware/authMiddleware";


export const fetchAdminAIInsights =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const statistics =
        await getAdminPlatformStatistics();

      const ai =
        await generateAdminAIInterpretation(
          statistics
        );

      return res.json({
        success:
          true,

        data: {
          statistics,
          ai,
        },
      });
    } catch (error) {
      console.error(
        "Fetch Admin AI Insights error:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to load Admin AI Insights.",
      });
    }
  };
