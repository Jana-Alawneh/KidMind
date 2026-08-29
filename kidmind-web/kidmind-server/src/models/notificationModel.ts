import db from "../database/db";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";


export type NotificationType =
  | "new_message"
  | "assigned_game"
  | "session_completed"
  | "report_ready"
  | "child_assigned"
  | "new_user"
  | "system";


export interface NotificationRow
  extends RowDataPacket {

  id: number;

  user_id: number;

  type: NotificationType | string;

  title: string;

  body: string;

  actor_user_id:
    | number
    | null;

  child_id:
    | number
    | null;

  entity_type:
    | string
    | null;

  entity_id:
    | number
    | null;

  action_path:
    | string
    | null;

  is_read: number;

  read_at:
    | string
    | Date
    | null;

  created_at:
    | string
    | Date;
}


type CreateNotificationInput = {

  userId: number;

  type:
    NotificationType | string;

  title: string;

  body: string;

  actorUserId?:
    | number
    | null;

  childId?:
    | number
    | null;

  entityType?:
    | string
    | null;

  entityId?:
    | number
    | null;

  actionPath?:
    | string
    | null;
};


export const createNotification =
  async ({
    userId,
    type,
    title,
    body,
    actorUserId = null,
    childId = null,
    entityType = null,
    entityId = null,
    actionPath = null,
  }: CreateNotificationInput) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        INSERT INTO notifications
        (
          user_id,
          type,
          title,
          body,
          actor_user_id,
          child_id,
          entity_type,
          entity_id,
          action_path
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          userId,
          type,
          title,
          body,
          actorUserId,
          childId,
          entityType,
          entityId,
          actionPath,
        ]
      );


    return getNotificationByIdForUser(
      userId,
      result.insertId
    );

  };


export const getNotificationByIdForUser =
  async (
    userId: number,
    notificationId: number
  ) => {

    const [rows] =
      await db.query<
        NotificationRow[]
      >(
        `
        SELECT
          notification.id,
          notification.user_id,
          notification.type,
          notification.title,
          notification.body,
          notification.actor_user_id,
          notification.child_id,
          notification.entity_type,
          notification.entity_id,
          notification.action_path,
          notification.is_read,
          notification.read_at,
          notification.created_at,

          actor.full_name
            AS actor_name,

          actor.role
            AS actor_role,

          actor.avatar_url
            AS actor_avatar_url,

          child.full_name
            AS child_name

        FROM notifications notification

        LEFT JOIN users actor
          ON actor.id =
            notification.actor_user_id

        LEFT JOIN children child
          ON child.id =
            notification.child_id

        WHERE
          notification.id = ?
          AND notification.user_id = ?

        LIMIT 1
        `,
        [
          notificationId,
          userId,
        ]
      );


    return rows[0] ?? null;

  };


export const getNotificationsForUser =
  async (
    userId: number,
    limit: number = 50,
    unreadOnly: boolean = false
  ) => {

    const safeLimit =
      Number.isInteger(limit) &&
      limit > 0
        ? Math.min(
            limit,
            100
          )
        : 50;


    const [rows] =
      await db.query<
        NotificationRow[]
      >(
        `
        SELECT
          notification.id,
          notification.user_id,
          notification.type,
          notification.title,
          notification.body,
          notification.actor_user_id,
          notification.child_id,
          notification.entity_type,
          notification.entity_id,
          notification.action_path,
          notification.is_read,
          notification.read_at,
          notification.created_at,

          actor.full_name
            AS actor_name,

          actor.role
            AS actor_role,

          actor.avatar_url
            AS actor_avatar_url,

          child.full_name
            AS child_name

        FROM notifications notification

        LEFT JOIN users actor
          ON actor.id =
            notification.actor_user_id

        LEFT JOIN children child
          ON child.id =
            notification.child_id

        WHERE
          notification.user_id = ?

          AND (
            ? = 0
            OR notification.is_read = 0
          )

        ORDER BY
          notification.created_at DESC,
          notification.id DESC

        LIMIT ?
        `,
        [
          userId,
          unreadOnly
            ? 1
            : 0,
          safeLimit,
        ]
      );


    return rows;

  };


export const getUnreadNotificationCount =
  async (
    userId: number
  ) => {

    const [rows] =
      await db.query<
        RowDataPacket[]
      >(
        `
        SELECT
          COUNT(*) AS unread_count
        FROM notifications
        WHERE
          user_id = ?
          AND is_read = 0
        `,
        [
          userId,
        ]
      );


    return Number(
      rows[0]
        ?.unread_count || 0
    );

  };


export const markNotificationAsRead =
  async (
    userId: number,
    notificationId: number
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE notifications

        SET
          is_read = 1,

          read_at =
            COALESCE(
              read_at,
              CURRENT_TIMESTAMP
            )

        WHERE
          id = ?
          AND user_id = ?
        `,
        [
          notificationId,
          userId,
        ]
      );


    return result.affectedRows;

  };


export const markAllNotificationsAsRead =
  async (
    userId: number
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE notifications

        SET
          is_read = 1,

          read_at =
            COALESCE(
              read_at,
              CURRENT_TIMESTAMP
            )

        WHERE
          user_id = ?
          AND is_read = 0
        `,
        [
          userId,
        ]
      );


    return result.affectedRows;

  };