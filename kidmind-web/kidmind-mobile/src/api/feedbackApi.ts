import {
  authRequest,
} from "@/api/authApi";


export type FeedbackItem = {
  id: number;
  parent_user_id?: number;
  parent_name?: string | null;
  parent_email?: string | null;
  message: string;
  created_at: string;
};


type SendFeedbackResponse = {
  message?: string;
  feedback?: FeedbackItem;
  feedback_id?: number;
};


type AdminFeedbackResponse =
  | FeedbackItem[]
  | {
      feedback?: FeedbackItem[];
      feedbacks?: FeedbackItem[];
    };


export const sendParentFeedback =
  async (
    message: string
  ): Promise<SendFeedbackResponse> => {

    return authRequest<SendFeedbackResponse>(
      "/feedback",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          message:
            message.trim(),
        }),
      }
    );

  };


export const getAdminFeedback =
  async (): Promise<
    FeedbackItem[]
  > => {

    const data =
      await authRequest<
        AdminFeedbackResponse
      >(
        "/feedback"
      );

    if (
      Array.isArray(
        data
      )
    ) {

      return data;

    }

    if (
      Array.isArray(
        data?.feedback
      )
    ) {

      return data.feedback;

    }

    if (
      Array.isArray(
        data?.feedbacks
      )
    ) {

      return data.feedbacks;

    }

    return [];

  };