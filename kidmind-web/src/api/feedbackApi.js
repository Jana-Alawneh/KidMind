import api from "../services/api";


export const sendParentFeedback =
  async (
    message
  ) => {

    const response =
      await api.post(
        "/feedback",
        {
          message,
        }
      );


    return response.data;

  };


export const getAdminFeedback =
  async () => {

    const response =
      await api.get(
        "/feedback"
      );


    return Array.isArray(
      response.data
        ?.feedback
    )
      ? response.data.feedback
      : [];

  };