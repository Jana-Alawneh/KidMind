import db from "../database/db";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";


export interface FeedbackRow
  extends RowDataPacket {

  id: number;
  parent_user_id: number;
  message: string;
  created_at:
    | string
    | Date;

}


export interface AdminFeedbackRow
  extends RowDataPacket {

  id: number;
  parent_user_id: number;
  parent_name: string;
  parent_email: string;
  message: string;
  created_at:
    | string
    | Date;

}


export const createFeedback =
  async (
    parentUserId: number,
    message: string
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        INSERT INTO feedback
        (
          parent_user_id,
          message
        )
        VALUES
        (?, ?)
        `,
        [
          parentUserId,
          message,
        ]
      );


    return result.insertId;

  };


export const getFeedbackById =
  async (
    feedbackId: number
  ) => {

    const [rows] =
      await db.query<AdminFeedbackRow[]>(
        `
        SELECT
          feedback.id,
          feedback.parent_user_id,
          users.full_name
            AS parent_name,
          users.email
            AS parent_email,
          feedback.message,
          feedback.created_at
        FROM feedback
        INNER JOIN users
          ON users.id =
            feedback.parent_user_id
        WHERE feedback.id = ?
        LIMIT 1
        `,
        [
          feedbackId,
        ]
      );


    return rows[0] ?? null;

  };


export const getAllFeedback =
  async () => {

    const [rows] =
      await db.query<AdminFeedbackRow[]>(
        `
        SELECT
          feedback.id,
          feedback.parent_user_id,
          users.full_name
            AS parent_name,
          users.email
            AS parent_email,
          feedback.message,
          feedback.created_at
        FROM feedback
        INNER JOIN users
          ON users.id =
            feedback.parent_user_id
        WHERE users.role = 'parent'
        ORDER BY
          feedback.created_at DESC,
          feedback.id DESC
        `
      );


    return rows;

  };