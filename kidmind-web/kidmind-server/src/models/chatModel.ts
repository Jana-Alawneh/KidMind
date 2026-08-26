import db from "../database/db";

import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

export type ChatConversationType =
  | "direct"
  | "child";

export type ChatMessageType =
  | "text"
  | "image"
  | "file";

export interface ChatConversationRow
  extends RowDataPacket {
  id: number;
  conversation_type: ChatConversationType;
  child_id: number;
  participant_one_id: number;
  participant_two_id: number;
  created_by: number;
  created_at:
    | string
    | Date;
  updated_at:
    | string
    | Date;
}

export interface ChatConversationMemberRow
  extends RowDataPacket {
  conversation_id: number;
  user_id: number;
  muted: number;
  cleared_at:
    | string
    | Date
    | null;
  last_read_message_id: number;
  joined_at:
    | string
    | Date;
  updated_at:
    | string
    | Date;
}

export interface ChatMessageRow
  extends RowDataPacket {
  id: number;
  conversation_id: number;
  sender_id: number;
  message_type: ChatMessageType;
  body: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_mime: string | null;
  attachment_size: number | null;
  edited_at:
    | string
    | Date
    | null;
  deleted_at:
    | string
    | Date
    | null;
  created_at:
    | string
    | Date;
}

type CreateMessageInput = {
  conversationId: number;
  senderId: number;
  messageType?: ChatMessageType;
  body?: string | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentMime?: string | null;
  attachmentSize?: number | null;
};

const normalizeParticipants = (
  firstUserId: number,
  secondUserId: number
) => {

  if (
    firstUserId <= secondUserId
  ) {

    return {
      participantOneId:
        firstUserId,
      participantTwoId:
        secondUserId,
    };

  }

  return {
    participantOneId:
      secondUserId,
    participantTwoId:
      firstUserId,
  };

};

export const getConversationById =
  async (
    conversationId: number
  ) => {

    const [rows] =
      await db.query<
        ChatConversationRow[]
      >(
        `
        SELECT
          id,
          conversation_type,
          child_id,
          participant_one_id,
          participant_two_id,
          created_by,
          created_at,
          updated_at
        FROM chat_conversations
        WHERE id = ?
        LIMIT 1
        `,
        [conversationId]
      );

    return rows[0] ?? null;

  };

export const getConversationByParticipants =
  async (
    firstUserId: number,
    secondUserId: number,
    conversationType: ChatConversationType,
    childId: number = 0
  ) => {

    const {
      participantOneId,
      participantTwoId,
    } =
      normalizeParticipants(
        firstUserId,
        secondUserId
      );

    const normalizedChildId =
      conversationType ===
      "child"
        ? childId
        : 0;

    const [rows] =
      await db.query<
        ChatConversationRow[]
      >(
        `
        SELECT
          id,
          conversation_type,
          child_id,
          participant_one_id,
          participant_two_id,
          created_by,
          created_at,
          updated_at
        FROM chat_conversations
        WHERE
          participant_one_id = ?
          AND participant_two_id = ?
          AND conversation_type = ?
          AND child_id = ?
        LIMIT 1
        `,
        [
          participantOneId,
          participantTwoId,
          conversationType,
          normalizedChildId,
        ]
      );

    return rows[0] ?? null;

  };

const insertConversationMembers =
  async (
    connection: PoolConnection,
    conversationId: number,
    userIds: number[]
  ) => {

    for (
      const userId of userIds
    ) {

      await connection.query(
        `
        INSERT IGNORE INTO chat_conversation_members
        (
          conversation_id,
          user_id
        )
        VALUES
        (?, ?)
        `,
        [
          conversationId,
          userId,
        ]
      );

    }

  };

export const getOrCreateConversation =
  async (
    firstUserId: number,
    secondUserId: number,
    createdBy: number,
    conversationType: ChatConversationType = "direct",
    childId: number = 0
  ) => {

    const {
      participantOneId,
      participantTwoId,
    } =
      normalizeParticipants(
        firstUserId,
        secondUserId
      );

    const normalizedChildId =
      conversationType ===
      "child"
        ? childId
        : 0;

    const existing =
      await getConversationByParticipants(
        participantOneId,
        participantTwoId,
        conversationType,
        normalizedChildId
      );

    if (existing) {

      await db.query(
        `
        INSERT IGNORE INTO chat_conversation_members
        (
          conversation_id,
          user_id
        )
        VALUES
        (?, ?),
        (?, ?)
        `,
        [
          existing.id,
          participantOneId,
          existing.id,
          participantTwoId,
        ]
      );

      return existing;

    }

    const connection =
      await db.getConnection();

    try {

      await connection.beginTransaction();

      const [insertResult] =
        await connection.query<ResultSetHeader>(
          `
          INSERT INTO chat_conversations
          (
            conversation_type,
            child_id,
            participant_one_id,
            participant_two_id,
            created_by
          )
          VALUES
          (?, ?, ?, ?, ?)
          `,
          [
            conversationType,
            normalizedChildId,
            participantOneId,
            participantTwoId,
            createdBy,
          ]
        );

      const conversationId =
        insertResult.insertId;

      await insertConversationMembers(
        connection,
        conversationId,
        [
          participantOneId,
          participantTwoId,
        ]
      );

      const [rows] =
        await connection.query<
          ChatConversationRow[]
        >(
          `
          SELECT
            id,
            conversation_type,
            child_id,
            participant_one_id,
            participant_two_id,
            created_by,
            created_at,
            updated_at
          FROM chat_conversations
          WHERE id = ?
          LIMIT 1
          `,
          [conversationId]
        );

      await connection.commit();

      return rows[0] ?? null;

    } catch (
      error: unknown
    ) {

      await connection.rollback();

      const duplicateError =
        typeof error ===
          "object" &&
        error !== null &&
        "code" in error &&
        (
          error as {
            code?: string;
          }
        ).code ===
          "ER_DUP_ENTRY";

      if (
        duplicateError
      ) {

        const conversation =
          await getConversationByParticipants(
            participantOneId,
            participantTwoId,
            conversationType,
            normalizedChildId
          );

        if (
          conversation
        ) {
          return conversation;
        }

      }

      throw error;

    } finally {

      connection.release();

    }

  };

export const isUserInConversation =
  async (
    userId: number,
    conversationId: number
  ) => {

    const [rows] =
      await db.query<
        RowDataPacket[]
      >(
        `
        SELECT conversation_id
        FROM chat_conversation_members
        WHERE
          user_id = ?
          AND conversation_id = ?
        LIMIT 1
        `,
        [
          userId,
          conversationId,
        ]
      );

    return rows.length > 0;

  };

export const getConversationForUser =
  async (
    userId: number,
    conversationId: number
  ) => {

    const [rows] =
      await db.query<
        RowDataPacket[]
      >(
        `
        SELECT
          c.id,
          c.conversation_type,
          c.child_id,
          c.participant_one_id,
          c.participant_two_id,
          c.created_by,
          c.created_at,
          c.updated_at,
          member.muted,
          member.cleared_at,
          member.last_read_message_id,
          other_user.id
            AS other_user_id,
          other_user.full_name
            AS other_user_name,
          other_user.email
            AS other_user_email,
          other_user.role
            AS other_user_role,
          other_user.phone
            AS other_user_phone,
          other_user.region
            AS other_user_region,
          other_user.avatar_url
            AS other_user_avatar_url,
          other_user.is_active
            AS other_user_is_active
        FROM chat_conversations c
        INNER JOIN chat_conversation_members member
          ON member.conversation_id = c.id
          AND member.user_id = ?
        INNER JOIN chat_conversation_members other_member
          ON other_member.conversation_id = c.id
          AND other_member.user_id <> member.user_id
        INNER JOIN users other_user
          ON other_user.id = other_member.user_id
        WHERE c.id = ?
        LIMIT 1
        `,
        [
          userId,
          conversationId,
        ]
      );

    return rows[0] ?? null;

  };

export const getUserConversations =
  async (
    userId: number
  ) => {

    const [rows] =
      await db.query<
        RowDataPacket[]
      >(
        `
        SELECT
          c.id,
          c.conversation_type,
          c.child_id,
          c.participant_one_id,
          c.participant_two_id,
          c.created_by,
          c.created_at,
          c.updated_at,

          member.muted,
          member.cleared_at,
          member.last_read_message_id,

          other_user.id
            AS other_user_id,
          other_user.full_name
            AS other_user_name,
          other_user.email
            AS other_user_email,
          other_user.role
            AS other_user_role,
          other_user.phone
            AS other_user_phone,
          other_user.region
            AS other_user_region,
          other_user.avatar_url
            AS other_user_avatar_url,
          other_user.is_active
            AS other_user_is_active,

          child.full_name
            AS child_name,

          last_message.id
            AS last_message_id,
          last_message.sender_id
            AS last_message_sender_id,
          last_message.message_type
            AS last_message_type,
          last_message.body
            AS last_message_body,
          last_message.attachment_url
            AS last_message_attachment_url,
          last_message.created_at
            AS last_message_created_at,

          (
            SELECT COUNT(*)
            FROM chat_messages unread_message
            WHERE
              unread_message.conversation_id = c.id
              AND unread_message.deleted_at IS NULL
              AND unread_message.sender_id <> ?
              AND unread_message.id >
                COALESCE(
                  member.last_read_message_id,
                  0
                )
              AND
              (
                member.cleared_at IS NULL
                OR unread_message.created_at >
                  member.cleared_at
              )
          ) AS unread_count

        FROM chat_conversation_members member

        INNER JOIN chat_conversations c
          ON c.id =
            member.conversation_id

        INNER JOIN chat_conversation_members other_member
          ON other_member.conversation_id =
            c.id
          AND other_member.user_id <>
            member.user_id

        INNER JOIN users other_user
          ON other_user.id =
            other_member.user_id

        LEFT JOIN children child
          ON child.id =
            c.child_id
          AND c.child_id <> 0

        LEFT JOIN chat_messages last_message
          ON last_message.id = (
            SELECT message_row.id
            FROM chat_messages message_row
            WHERE
              message_row.conversation_id =
                c.id
              AND message_row.deleted_at
                IS NULL
              AND
              (
                member.cleared_at IS NULL
                OR message_row.created_at >
                  member.cleared_at
              )
            ORDER BY
              message_row.id DESC
            LIMIT 1
          )

        WHERE member.user_id = ?

        ORDER BY
          COALESCE(
            last_message.created_at,
            c.updated_at
          ) DESC,
          c.id DESC
        `,
        [
          userId,
          userId,
        ]
      );

    return rows;

  };

export const getMessageById =
  async (
    messageId: number
  ) => {

    const [rows] =
      await db.query<
        ChatMessageRow[]
      >(
        `
        SELECT
          id,
          conversation_id,
          sender_id,
          message_type,
          body,
          attachment_url,
          attachment_name,
          attachment_mime,
          attachment_size,
          edited_at,
          deleted_at,
          created_at
        FROM chat_messages
        WHERE id = ?
        LIMIT 1
        `,
        [messageId]
      );

    return rows[0] ?? null;

  };

export const getConversationMessages =
  async (
    userId: number,
    conversationId: number,
    limit: number = 50,
    beforeMessageId:
      | number
      | null = null
  ) => {

    const safeLimit =
      Number.isInteger(limit) &&
      limit > 0
        ? Math.min(limit, 100)
        : 50;

    const [rows] =
      await db.query<
        RowDataPacket[]
      >(
        `
        SELECT *
        FROM (
          SELECT
            message.id,
            message.conversation_id,
            message.sender_id,
            sender.full_name
              AS sender_name,
            sender.role
              AS sender_role,
            sender.avatar_url
              AS sender_avatar_url,
            message.message_type,
            message.body,
            message.attachment_url,
            message.attachment_name,
            message.attachment_mime,
            message.attachment_size,
            message.edited_at,
            message.deleted_at,
            message.created_at
          FROM chat_messages message

          INNER JOIN chat_conversation_members member
            ON member.conversation_id =
              message.conversation_id
            AND member.user_id = ?

          INNER JOIN users sender
            ON sender.id =
              message.sender_id

          WHERE
            message.conversation_id = ?
            AND message.deleted_at
              IS NULL
            AND
            (
              member.cleared_at IS NULL
              OR message.created_at >
                member.cleared_at
            )
            AND
            (
              ? IS NULL
              OR message.id < ?
            )

          ORDER BY
            message.id DESC

          LIMIT ?
        ) recent_messages
        ORDER BY
          recent_messages.id ASC
        `,
        [
          userId,
          conversationId,
          beforeMessageId,
          beforeMessageId,
          safeLimit,
        ]
      );

    return rows;

  };

export const createMessage =
  async ({
    conversationId,
    senderId,
    messageType = "text",
    body = null,
    attachmentUrl = null,
    attachmentName = null,
    attachmentMime = null,
    attachmentSize = null,
  }: CreateMessageInput) => {

    const normalizedBody =
      body === null
        ? null
        : String(body).trim();

    const [result] =
      await db.query<ResultSetHeader>(
        `
        INSERT INTO chat_messages
        (
          conversation_id,
          sender_id,
          message_type,
          body,
          attachment_url,
          attachment_name,
          attachment_mime,
          attachment_size
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          conversationId,
          senderId,
          messageType,
          normalizedBody,
          attachmentUrl,
          attachmentName,
          attachmentMime,
          attachmentSize,
        ]
      );

    await db.query(
      `
      UPDATE chat_conversations
      SET updated_at =
        CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [conversationId]
    );

    return getMessageById(
      result.insertId
    );

  };

export const markConversationAsRead =
  async (
    userId: number,
    conversationId: number,
    messageId: number
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE chat_conversation_members
        SET
          last_read_message_id =
            GREATEST(
              last_read_message_id,
              ?
            ),
          updated_at =
            CURRENT_TIMESTAMP
        WHERE
          user_id = ?
          AND conversation_id = ?
        `,
        [
          messageId,
          userId,
          conversationId,
        ]
      );

    return result.affectedRows;

  };

export const clearConversationForUser =
  async (
    userId: number,
    conversationId: number
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE chat_conversation_members
        SET
          cleared_at =
            CURRENT_TIMESTAMP,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE
          user_id = ?
          AND conversation_id = ?
        `,
        [
          userId,
          conversationId,
        ]
      );

    return result.affectedRows;

  };

export const updateConversationMutedState =
  async (
    userId: number,
    conversationId: number,
    muted: boolean
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE chat_conversation_members
        SET
          muted = ?,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE
          user_id = ?
          AND conversation_id = ?
        `,
        [
          muted ? 1 : 0,
          userId,
          conversationId,
        ]
      );

    return result.affectedRows;

  };

export const getLatestConversationMessage =
  async (
    conversationId: number
  ) => {

    const [rows] =
      await db.query<
        ChatMessageRow[]
      >(
        `
        SELECT
          id,
          conversation_id,
          sender_id,
          message_type,
          body,
          attachment_url,
          attachment_name,
          attachment_mime,
          attachment_size,
          edited_at,
          deleted_at,
          created_at
        FROM chat_messages
        WHERE
          conversation_id = ?
          AND deleted_at IS NULL
        ORDER BY id DESC
        LIMIT 1
        `,
        [conversationId]
      );

    return rows[0] ?? null;

  };