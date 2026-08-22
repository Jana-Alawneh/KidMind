import db from "../database/db";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";


export type UserRole =
  | "therapist"
  | "parent"
  | "admin";


export interface UserRow
  extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_active: number;
  last_login_at:
    | string
    | Date
    | null;
  created_at:
    | string
    | Date;
  updated_at:
    | string
    | Date;
}


export const getAllUsers =
  async () => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          id,
          full_name,
          email,
          role,
          phone,
          avatar_url,
          is_active,
          last_login_at,
          created_at,
          updated_at
        FROM users
        ORDER BY created_at DESC
        `
      );

    return rows;

  };


export const getUserById =
  async (
    id: number
  ) => {

    const [rows] =
      await db.query<UserRow[]>(
        `
        SELECT *
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [
          id,
        ]
      );

    return (
      rows[0] ??
      null
    );

  };


export const getUserByEmail =
  async (
    email: string
  ) => {

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    const [rows] =
      await db.query<UserRow[]>(
        `
        SELECT *
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [
          normalizedEmail,
        ]
      );

    return (
      rows[0] ??
      null
    );

  };


export const createUser =
  async (
    fullName: string,
    email: string,
    passwordHash: string,
    role: UserRole,
    phone: string | null = null,
    avatarUrl: string | null = null
  ) => {

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    const [result] =
      await db.query<ResultSetHeader>(
        `
        INSERT INTO users
        (
          full_name,
          email,
          password_hash,
          role,
          phone,
          avatar_url
        )
        VALUES
        (?, ?, ?, ?, ?, ?)
        `,
        [
          fullName.trim(),
          normalizedEmail,
          passwordHash,
          role,
          phone,
          avatarUrl,
        ]
      );


    return result;

  };


export const updateLastLogin =
  async (
    id: number
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE users
        SET last_login_at =
          CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [
          id,
        ]
      );

    return result.affectedRows;

  };


export const updateUserProfile =
  async (
    id: number,
    fullName: string,
    phone: string | null,
    avatarUrl: string | null
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE users
        SET
          full_name = ?,
          phone = ?,
          avatar_url = ?
        WHERE id = ?
        `,
        [
          fullName.trim(),
          phone,
          avatarUrl,
          id,
        ]
      );

    return result.affectedRows;

  };


export const updateUserByAdmin =
  async (
    id: number,
    fullName: string,
    email: string,
    phone: string | null
  ) => {

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE users
        SET
          full_name = ?,
          email = ?,
          phone = ?
        WHERE id = ?
        `,
        [
          fullName.trim(),
          normalizedEmail,
          phone,
          id,
        ]
      );

    return result.affectedRows;

  };


export const updateUserPassword =
  async (
    id: number,
    passwordHash: string
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
        `,
        [
          passwordHash,
          id,
        ]
      );

    return result.affectedRows;

  };


export const updateUserActiveStatus =
  async (
    id: number,
    isActive: boolean
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE users
        SET is_active = ?
        WHERE id = ?
        `,
        [
          isActive
            ? 1
            : 0,
          id,
        ]
      );

    return result.affectedRows;

  };


export const deleteUser =
  async (
    id: number
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        DELETE FROM users
        WHERE id = ?
        `,
        [
          id,
        ]
      );

    return result.affectedRows;

  };


export const linkUserToChild =
  async (
    userId: number,
    childId: number
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        INSERT IGNORE
        INTO child_users
        (
          child_id,
          user_id
        )
        VALUES
        (?, ?)
        `,
        [
          childId,
          userId,
        ]
      );

    return result;

  };


export const unlinkUserFromChild =
  async (
    userId: number,
    childId: number
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        DELETE FROM child_users
        WHERE
          user_id = ?
          AND child_id = ?
        `,
        [
          userId,
          childId,
        ]
      );

    return result.affectedRows;

  };


export const getChildrenForUser =
  async (
    userId: number
  ) => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          c.*
        FROM children c

        INNER JOIN child_users cu
          ON cu.child_id = c.id

        WHERE cu.user_id = ?

        ORDER BY
          c.created_at DESC
        `,
        [
          userId,
        ]
      );

    return rows;

  };


export const getUsersForChild =
  async (
    childId: number
  ) => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          u.id,
          u.full_name,
          u.email,
          u.role,
          u.phone,
          u.avatar_url,
          u.is_active,
          cu.created_at
            AS assigned_at

        FROM users u

        INNER JOIN child_users cu
          ON cu.user_id = u.id

        WHERE cu.child_id = ?

        ORDER BY
          u.role ASC,
          u.full_name ASC
        `,
        [
          childId,
        ]
      );

    return rows;

  };


export const getAllChildAssignments =
  async () => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          cu.id
            AS assignment_id,

          cu.child_id,

          cu.user_id,

          cu.created_at
            AS assigned_at,

          u.full_name
            AS user_name,

          u.email
            AS user_email,

          u.role,

          u.phone,

          u.avatar_url,

          u.is_active

        FROM child_users cu

        INNER JOIN users u
          ON u.id = cu.user_id

        ORDER BY
          cu.created_at DESC,
          cu.id DESC
        `
      );

    return rows;

  };