import api from "../services/api";


export const getAdminAIInsights =
  async () => {
    const response =
      await api.get(
        "/api/ai/admin-insights"
      );

    return response.data;
  };