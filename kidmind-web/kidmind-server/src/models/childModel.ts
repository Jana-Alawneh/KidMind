import db from "../database/db";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

const buildChildrenWithStatsQuery = (
  whereClause = ""
) => {

  return `
    SELECT

      child_data.id,
      child_data.full_name,
      child_data.age,
      child_data.gender,
      child_data.parent_name,
      child_data.region,
      child_data.notes,
      child_data.created_at,

      child_data.legacy_score
        AS score,

      child_data.status,

      child_data.legacy_last_assessment
        AS last_assessment,

      child_data.image,

      child_data.assessment_count,

      child_data.latest_assessment_at,

      CASE

        WHEN
          (
            (
              child_data.focus_score
              IS NOT NULL
            )
            +
            (
              child_data.memory_score
              IS NOT NULL
            )
            +
            (
              child_data.problem_solving_score
              IS NOT NULL
            )
            +
            (
              child_data.reading_score
              IS NOT NULL
            )
            +
            (
              child_data.processing_speed_score
              IS NOT NULL
            )
          ) = 0

        THEN NULL

        ELSE ROUND(
          (
            COALESCE(
              child_data.focus_score,
              0
            )
            +
            COALESCE(
              child_data.memory_score,
              0
            )
            +
            COALESCE(
              child_data.problem_solving_score,
              0
            )
            +
            COALESCE(
              child_data.reading_score,
              0
            )
            +
            COALESCE(
              child_data.processing_speed_score,
              0
            )
          )
          /
          (
            (
              child_data.focus_score
              IS NOT NULL
            )
            +
            (
              child_data.memory_score
              IS NOT NULL
            )
            +
            (
              child_data.problem_solving_score
              IS NOT NULL
            )
            +
            (
              child_data.reading_score
              IS NOT NULL
            )
            +
            (
              child_data.processing_speed_score
              IS NOT NULL
            )
          )
        )

      END
        AS current_cognitive_score

    FROM
    (

      SELECT

        c.id,
        c.full_name,
        c.age,
        c.gender,
        c.parent_name,
        c.region,
        c.notes,
        c.created_at,

        c.score
          AS legacy_score,

        COALESCE(
          c.status,
          'Active'
        )
          AS status,

        c.last_assessment
          AS legacy_last_assessment,

        c.image,


        /*
          Number of completed /
          ended assessments.
        */

        (
          SELECT
            COUNT(*)

          FROM sessions s

          WHERE
            s.child_id = c.id

            AND s.status IN
            (
              'Completed',
              'Ended'
            )
        )
          AS assessment_count,


        /*
          Latest completed
          assessment date.
        */

        (
          SELECT
            COALESCE(
              s.ended_at,
              s.updated_at,
              s.started_at,
              s.created_at
            )

          FROM sessions s

          WHERE
            s.child_id = c.id

            AND s.status =
              'Completed'

          ORDER BY

            COALESCE(
              s.ended_at,
              s.updated_at,
              s.started_at,
              s.created_at
            )
              DESC,

            s.id DESC

          LIMIT 1
        )
          AS latest_assessment_at,


        /*
          Focus
          Latest finished score.
        */

        (
          SELECT
            sg.score

          FROM session_games sg

          INNER JOIN sessions s
            ON s.id =
              sg.session_id

          WHERE
            s.child_id = c.id

            AND LOWER(
              TRIM(
                sg.game_name
              )
            ) =
              'focus finder'

            AND sg.status IN
            (
              'Completed',
              'Failed'
            )

            AND sg.score
              IS NOT NULL

          ORDER BY

            COALESCE(
              sg.ended_at,
              sg.started_at,
              sg.updated_at,
              sg.created_at,
              s.ended_at,
              s.started_at,
              s.updated_at,
              s.created_at
            )
              DESC,

            sg.id DESC

          LIMIT 1
        )
          AS focus_score,


        /*
          Memory
        */

        (
          SELECT
            sg.score

          FROM session_games sg

          INNER JOIN sessions s
            ON s.id =
              sg.session_id

          WHERE
            s.child_id = c.id

            AND LOWER(
              TRIM(
                sg.game_name
              )
            ) =
              'memory match'

            AND sg.status IN
            (
              'Completed',
              'Failed'
            )

            AND sg.score
              IS NOT NULL

          ORDER BY

            COALESCE(
              sg.ended_at,
              sg.started_at,
              sg.updated_at,
              sg.created_at,
              s.ended_at,
              s.started_at,
              s.updated_at,
              s.created_at
            )
              DESC,

            sg.id DESC

          LIMIT 1
        )
          AS memory_score,


        /*
          Problem Solving
        */

        (
          SELECT
            sg.score

          FROM session_games sg

          INNER JOIN sessions s
            ON s.id =
              sg.session_id

          WHERE
            s.child_id = c.id

            AND LOWER(
              TRIM(
                sg.game_name
              )
            ) =
              'puzzle path'

            AND sg.status IN
            (
              'Completed',
              'Failed'
            )

            AND sg.score
              IS NOT NULL

          ORDER BY

            COALESCE(
              sg.ended_at,
              sg.started_at,
              sg.updated_at,
              sg.created_at,
              s.ended_at,
              s.started_at,
              s.updated_at,
              s.created_at
            )
              DESC,

            sg.id DESC

          LIMIT 1
        )
          AS problem_solving_score,


        /*
          Reading
        */

        (
          SELECT
            sg.score

          FROM session_games sg

          INNER JOIN sessions s
            ON s.id =
              sg.session_id

          WHERE
            s.child_id = c.id

            AND LOWER(
              TRIM(
                sg.game_name
              )
            ) =
              'reading adventure'

            AND sg.status IN
            (
              'Completed',
              'Failed'
            )

            AND sg.score
              IS NOT NULL

          ORDER BY

            COALESCE(
              sg.ended_at,
              sg.started_at,
              sg.updated_at,
              sg.created_at,
              s.ended_at,
              s.started_at,
              s.updated_at,
              s.created_at
            )
              DESC,

            sg.id DESC

          LIMIT 1
        )
          AS reading_score,


        /*
          Processing Speed
        */

        (
          SELECT
            sg.score

          FROM session_games sg

          INNER JOIN sessions s
            ON s.id =
              sg.session_id

          WHERE
            s.child_id = c.id

            AND LOWER(
              TRIM(
                sg.game_name
              )
            ) =
              'quick match'

            AND sg.status IN
            (
              'Completed',
              'Failed'
            )

            AND sg.score
              IS NOT NULL

          ORDER BY

            COALESCE(
              sg.ended_at,
              sg.started_at,
              sg.updated_at,
              sg.created_at,
              s.ended_at,
              s.started_at,
              s.updated_at,
              s.created_at
            )
              DESC,

            sg.id DESC

          LIMIT 1
        )
          AS processing_speed_score


      FROM children c

      ${whereClause}

    )
      AS child_data
  `;

};


export const getAllUsers =
  async () => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        ${buildChildrenWithStatsQuery()}

        ORDER BY
          child_data.created_at DESC,
          child_data.id DESC
        `
      );

    return rows;

  };


export const getChildById =
  async (
    id: number
  ) => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        ${buildChildrenWithStatsQuery(
          `
          WHERE
            c.id = ?
          `
        )}

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


export const addChild =
  async (
    full_name: string,
    age: number,
    gender: string,
    parent_name: string,
    region: string,
    notes: string
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        INSERT INTO children
        (
          full_name,
          age,
          gender,
          parent_name,
          region,
          notes
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [
          full_name.trim(),
          age,
          gender,
          parent_name.trim(),
          region.trim(),
          notes,
        ]
      );

    return result;

  };


export const deleteChild =
  async (
    id: number
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        DELETE FROM children

        WHERE id = ?
        `,
        [
          id,
        ]
      );

    return result;

  };


export const updateChild =
  async (
    id: number,
    fullName: string,
    age: number,
    gender: string,
    parentName: string,
    region: string | null,
    notes: string | null
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE children

        SET
          full_name = ?,
          age = ?,
          gender = ?,
          parent_name = ?,
          region = ?,
          notes = ?

        WHERE id = ?
        `,
        [
          fullName.trim(),
          age,
          gender,
          parentName.trim(),
          region
            ? region.trim()
            : null,
          notes,
          id,
        ]
      );

    return result.affectedRows;

  };




export const getChildAssignments =
  async (
    childId: number
  ) => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          cu.id
            AS assignment_id,

          cu.child_id,

          cu.user_id,

          cu.link_type,

          cu.created_at
            AS assigned_at,

          u.full_name
            AS user_name,

          u.email
            AS user_email,

          u.role,

          u.region
            AS user_region

        FROM child_users cu

        INNER JOIN users u
          ON u.id =
            cu.user_id

        WHERE
          cu.child_id = ?

        ORDER BY
          cu.link_type ASC,
          u.full_name ASC
        `,
        [
          childId,
        ]
      );

    return rows;

  };


export const deleteChildAssignments =
  async (
    childId: number
  ) => {

    const [result] =
      await db.query<ResultSetHeader>(
        `
        DELETE FROM child_users

        WHERE child_id = ?
        `,
        [
          childId,
        ]
      );

    return result.affectedRows;

  };