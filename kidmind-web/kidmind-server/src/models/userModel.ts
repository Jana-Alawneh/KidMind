import db from "../database/db";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";


export type UserRole =
  | "therapist"
  | "parent"
  | "admin";


export type ChildLinkType =
  | "therapist"
  | "parent";


export interface UserRow
  extends RowDataPacket {

  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone: string | null;
  region: string | null;
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
          region,
          avatar_url,
          is_active,
          last_login_at,
          created_at,
          updated_at
        FROM users
        ORDER BY
          created_at DESC,
          id DESC
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
        [id]
      );

    return rows[0] ?? null;

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
        [normalizedEmail]
      );

    return rows[0] ?? null;

  };


export const createUser =
  async (
    fullName: string,
    email: string,
    passwordHash: string,
    role: UserRole,
    phone: string | null = null,
    avatarUrl: string | null = null,
    region: string | null = null
  ) => {

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    const normalizedRegion =
      region
        ? region.trim()
        : null;


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
          avatar_url,
          region
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          fullName.trim(),
          normalizedEmail,
          passwordHash,
          role,
          phone,
          avatarUrl,
          normalizedRegion,
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
        SET
          last_login_at =
            CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [id]
      );

    return result.affectedRows;

  };


export const updateUserProfile =
  async (
    id: number,
    fullName: string,
    phone: string | null,
    avatarUrl: string | null,
    region:
      | string
      | null
      | undefined =
        undefined
  ) => {

    if (
      region ===
      undefined
    ) {

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

    }


    const normalizedRegion =
      region
        ? region.trim()
        : null;


    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE users
        SET
          full_name = ?,
          phone = ?,
          avatar_url = ?,
          region = ?
        WHERE id = ?
        `,
        [
          fullName.trim(),
          phone,
          avatarUrl,
          normalizedRegion,
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
    phone: string | null,
    region:
      | string
      | null
      | undefined =
        undefined
  ) => {

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (
      region ===
      undefined
    ) {

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

    }


    const normalizedRegion =
      region
        ? region.trim()
        : null;


    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE users
        SET
          full_name = ?,
          email = ?,
          phone = ?,
          region = ?
        WHERE id = ?
        `,
        [
          fullName.trim(),
          normalizedEmail,
          phone,
          normalizedRegion,
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
        [id]
      );

    return result.affectedRows;

  };


export const getChildAssignmentByType =
  async (
    childId: number,
    linkType: ChildLinkType
  ) => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          cu.id AS assignment_id,
          cu.child_id,
          cu.user_id,
          cu.link_type,
          cu.created_at AS assigned_at,
          u.full_name AS user_name,
          u.email AS user_email,
          u.phone,
          u.region,
          u.role
        FROM child_users cu
        INNER JOIN users u
          ON u.id = cu.user_id
        WHERE
          cu.child_id = ?
          AND cu.link_type = ?
        LIMIT 1
        `,
        [
          childId,
          linkType,
        ]
      );

    return rows[0] ?? null;

  };


export const isChildAssignedForType =
  async (
    childId: number,
    linkType: ChildLinkType,
    exceptUserId:
      | number
      | null =
        null
  ) => {

    let query = `
      SELECT id
      FROM child_users
      WHERE
        child_id = ?
        AND link_type = ?
    `;


    const params:
      (
        | number
        | string
      )[] = [
        childId,
        linkType,
      ];


    if (
      exceptUserId !==
      null
    ) {

      query += `
        AND user_id <> ?
      `;

      params.push(
        exceptUserId
      );

    }


    query += `
      LIMIT 1
    `;


    const [rows] =
      await db.query<RowDataPacket[]>(
        query,
        params
      );


    return rows.length > 0;

  };


export const linkUserToChild =
  async (
    userId: number,
    childId: number
  ) => {

    const user =
      await getUserById(
        userId
      );


    if (!user) {

      throw new Error(
        "User not found"
      );

    }


    if (
      user.role !==
        "parent" &&
      user.role !==
        "therapist"
    ) {

      throw new Error(
        "Only parents and therapists can be linked to children"
      );

    }


    const linkType:
      ChildLinkType =
        user.role;


    const existingAssignment =
      await getChildAssignmentByType(
        childId,
        linkType
      );


    if (
      existingAssignment
    ) {

      if (
        Number(
          existingAssignment
            .user_id
        ) ===
        Number(
          userId
        )
      ) {

        return {
          alreadyLinked:
            true,
          assignmentId:
            existingAssignment
              .assignment_id,
        };

      }


      throw new Error(
        linkType ===
        "parent"
          ? "This child already has a parent"
          : "This child already has a therapist"
      );

    }


    const [result] =
      await db.query<ResultSetHeader>(
        `
        INSERT INTO child_users
        (
          child_id,
          user_id,
          link_type
        )
        VALUES
        (?, ?, ?)
        `,
        [
          childId,
          userId,
          linkType,
        ]
      );


    return {
      alreadyLinked:
        false,
      assignmentId:
        result.insertId,
    };

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


export const getAvailableChildrenForRole =
  async (
    linkType: ChildLinkType,
    currentUserId:
      | number
      | null =
        null
  ) => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          c.id,
          c.full_name,
          c.age,
          c.gender,
          c.region,
          c.status,
          c.created_at,
          assignment.user_id
            AS assigned_user_id
        FROM children c
        LEFT JOIN child_users assignment
          ON assignment.child_id =
            c.id
          AND assignment.link_type =
            ?
        WHERE
          assignment.id
            IS NULL
          OR
          (
            ?
              IS NOT NULL
            AND assignment.user_id =
              ?
          )
        ORDER BY
          c.full_name ASC,
          c.id ASC
        `,
        [
          linkType,
          currentUserId,
          currentUserId,
        ]
      );

    return rows;

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
          ON cu.child_id =
            c.id
        WHERE
          cu.user_id = ?
        ORDER BY
          c.created_at DESC,
          c.id DESC
        `,
        [userId]
      );

    return rows;

  };


export const getLinkedChildrenForUser =
  async (
    userId: number
  ) => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          c.id,
          c.full_name,
          c.age,
          c.gender,
          c.region,
          c.status,
          cu.id
            AS assignment_id,
          cu.link_type,
          cu.created_at
            AS assigned_at
        FROM child_users cu
        INNER JOIN children c
          ON c.id =
            cu.child_id
        WHERE
          cu.user_id = ?
        ORDER BY
          c.full_name ASC,
          c.id ASC
        `,
        [userId]
      );

    return rows;

  };


export const getChildForUser =
  async (
    userId: number,
    childId: number
  ) => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          c.*
        FROM children c
        INNER JOIN child_users cu
          ON cu.child_id =
            c.id
        WHERE
          cu.user_id = ?
          AND c.id = ?
        LIMIT 1
        `,
        [
          userId,
          childId,
        ]
      );

    return rows[0] ?? null;

  };


export const isUserLinkedToChild =
  async (
    userId: number,
    childId: number
  ) => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          cu.id
        FROM child_users cu
        WHERE
          cu.user_id = ?
          AND cu.child_id = ?
        LIMIT 1
        `,
        [
          userId,
          childId,
        ]
      );

    return rows.length > 0;

  };


export const getTherapistsForUserChildren =
  async (
    userId: number
  ) => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT DISTINCT
          therapist.id,
          therapist.full_name,
          therapist.email,
          therapist.phone,
          therapist.region,
          therapist.avatar_url,
          therapist.is_active,
          therapist_link.child_id,
          child.full_name
            AS child_name
        FROM child_users owner_link
        INNER JOIN children child
          ON child.id =
            owner_link.child_id
        INNER JOIN child_users therapist_link
          ON therapist_link.child_id =
            owner_link.child_id
          AND therapist_link.link_type =
            'therapist'
        INNER JOIN users therapist
          ON therapist.id =
            therapist_link.user_id
          AND therapist.role =
            'therapist'
        WHERE
          owner_link.user_id = ?
          AND owner_link.link_type =
            'parent'
        ORDER BY
          child.full_name ASC,
          therapist.full_name ASC
        `,
        [userId]
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
          u.region,
          u.avatar_url,
          u.is_active,
          cu.link_type,
          cu.created_at
            AS assigned_at
        FROM users u
        INNER JOIN child_users cu
          ON cu.user_id =
            u.id
        WHERE
          cu.child_id = ?
        ORDER BY
          cu.link_type ASC,
          u.full_name ASC
        `,
        [childId]
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
          child.full_name
            AS child_name,
          child.age
            AS child_age,
          child.gender
            AS child_gender,
          child.region
            AS child_region,
          cu.user_id,
          cu.link_type,
          cu.created_at
            AS assigned_at,
          u.full_name
            AS user_name,
          u.email
            AS user_email,
          u.role,
          u.phone,
          u.region
            AS user_region,
          u.avatar_url,
          u.is_active
        FROM child_users cu
        INNER JOIN users u
          ON u.id =
            cu.user_id
        INNER JOIN children child
          ON child.id =
            cu.child_id
        ORDER BY
          child.full_name ASC,
          cu.link_type ASC
        `
      );

    return rows;

  };


export const deleteAllAssignmentsForUser =
  async (
    userId: number
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        DELETE FROM child_users
        WHERE user_id = ?
        `,
        [userId]
      );

    return result.affectedRows;

  };


export const deleteUserChildAssignment =
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


export const getSelectedLinkedChildren =
  async (
    userId: number,
    childIds: number[]
  ) => {

    if (
      childIds.length ===
      0
    ) {
      return [];
    }


    const placeholders =
      childIds
        .map(
          () => "?"
        )
        .join(", ");


    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          c.id,
          c.full_name,
          c.age,
          c.gender,
          c.region,
          cu.link_type
        FROM children c
        INNER JOIN child_users cu
          ON cu.child_id =
            c.id
        WHERE
          cu.user_id = ?
          AND c.id IN
          (
            ${placeholders}
          )
        `,
        [
          userId,
          ...childIds,
        ]
      );

    return rows;

  };