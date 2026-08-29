import {
  authRequest,
} from "@/api/authApi";


export type NotificationType =
  | "new_message"
  | "assigned_game"
  | "session_completed"
  | "child_assigned"
  | string;


export type KidMindNotification = {
  id: number;
  user_id?: number;
  type: NotificationType;
  title: string;
  body: string;
  actor_user_id?: number | null;
  child_id?: number | null;
  child_name?: string | null;
  entity_type?: string | null;
  entity_id?: number | null;
  action_path?: string | null;
  is_read: number | boolean;
  read_at?: string | null;
  created_at: string;
};


type NotificationsResponse = {
  notifications: KidMindNotification[];
};


type UnreadCountResponse = {
  unread_count: number;
};


type MessageResponse = {
  message: string;
};


export const getNotifications =
  async (): Promise<
    KidMindNotification[]
  > => {

    const data =
      await authRequest<
        NotificationsResponse
      >(
        "/notifications"
      );

    return Array.isArray(
      data?.notifications
    )
      ? data.notifications
      : [];

  };


export const getUnreadNotificationCount =
  async (): Promise<number> => {

    const data =
      await authRequest<
        UnreadCountResponse
      >(
        "/notifications/unread-count"
      );

    return Number(
      data?.unread_count ||
      0
    );

  };


export const markNotificationRead =
  async (
    notificationId: number
  ): Promise<MessageResponse> => {

    return authRequest<MessageResponse>(
      `/notifications/${notificationId}/read`,
      {
        method: "PUT",
      }
    );

  };


export const markAllNotificationsRead =
  async (): Promise<MessageResponse> => {

    return authRequest<MessageResponse>(
      "/notifications/read-all",
      {
        method: "PUT",
      }
    );

  };
