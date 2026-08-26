import db from "../database/db";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";


export type SessionGameInput = {
  game_name: string;
  difficulty: string | null;
  custom_game_id?: number | null;
};


export const addSession = async (
  childId: number,
  games: SessionGameInput[]
) => {

  const firstGame = games[0];

  const [result] =
    await db.query<ResultSetHeader>(
      `
      INSERT INTO sessions
      (
        child_id,
        game_name,
        status,
        started_at,
        difficulty
      )
      VALUES
      (?, ?, 'In Progress', NOW(), ?)
      `,
      [
        childId,
        firstGame.game_name,
        firstGame.difficulty,
      ]
    );

  return result.insertId;

};


export const addSessionGames = async (
  sessionId: number,
  games: SessionGameInput[]
) => {

  for (
    let index = 0;
    index < games.length;
    index += 1
  ) {

    const game = games[index];

    const status =
      index === 0
        ? "In Progress"
        : "Pending";

    const customGameId =
      game.custom_game_id ===
        undefined ||
      game.custom_game_id ===
        null
        ? null
        : Number(
            game.custom_game_id
          );

    await db.query(
      `
      INSERT INTO session_games
      (
        session_id,
        custom_game_id,
        game_name,
        difficulty,
        status,
        started_at
      )
      VALUES
      (
        ?,
        ?,
        ?,
        ?,
        ?,
        CASE
          WHEN ? = 'In Progress'
          THEN NOW()
          ELSE NULL
        END
      )
      `,
      [
        sessionId,
        customGameId,
        game.game_name,
        game.difficulty,
        status,
        status,
      ]
    );

  }

};


export const getAllSessions = async () => {

  const [rows] =
    await db.query<RowDataPacket[]>(
      `
      SELECT
        sessions.id,
        sessions.child_id,
        children.full_name AS child_name,
        children.age AS child_age,
        children.gender AS child_gender,
        children.region AS child_region,
        sessions.game_name,
        sessions.status,
        sessions.scheduled_at,
        sessions.started_at,
        sessions.ended_at,
        sessions.duration_seconds,
        sessions.score,
        sessions.difficulty,
        sessions.created_at,
        sessions.updated_at
      FROM sessions
      INNER JOIN children
        ON children.id = sessions.child_id
      ORDER BY
        sessions.created_at DESC,
        sessions.id DESC
      `
    );

  return rows;

};


export const getSessionsForUser = async (
  userId: number
) => {

  const [rows] =
    await db.query<RowDataPacket[]>(
      `
      SELECT DISTINCT
        sessions.id,
        sessions.child_id,
        children.full_name AS child_name,
        children.age AS child_age,
        children.gender AS child_gender,
        children.region AS child_region,
        sessions.game_name,
        sessions.status,
        sessions.scheduled_at,
        sessions.started_at,
        sessions.ended_at,
        sessions.duration_seconds,
        sessions.score,
        sessions.difficulty,
        sessions.created_at,
        sessions.updated_at
      FROM sessions
      INNER JOIN children
        ON children.id = sessions.child_id
      INNER JOIN child_users
        ON child_users.child_id = sessions.child_id
      WHERE
        child_users.user_id = ?
      ORDER BY
        sessions.created_at DESC,
        sessions.id DESC
      `,
      [userId]
    );

  return rows;

};


export const getSessionById = async (
  id: number
) => {

  const [rows] =
    await db.query<RowDataPacket[]>(
      `
      SELECT
        sessions.id,
        sessions.child_id,
        children.full_name AS child_name,
        children.age AS child_age,
        children.gender AS child_gender,
        children.region AS child_region,
        sessions.game_name,
        sessions.status,
        sessions.scheduled_at,
        sessions.started_at,
        sessions.ended_at,
        sessions.duration_seconds,
        sessions.score,
        sessions.difficulty,
        sessions.created_at,
        sessions.updated_at
      FROM sessions
      INNER JOIN children
        ON children.id = sessions.child_id
      WHERE sessions.id = ?
      `,
      [id]
    );

  return rows[0] ?? null;

};


export const getSessionForUser = async (
  userId: number,
  sessionId: number
) => {

  const [rows] =
    await db.query<RowDataPacket[]>(
      `
      SELECT
        sessions.id,
        sessions.child_id,
        children.full_name AS child_name,
        children.age AS child_age,
        children.gender AS child_gender,
        children.region AS child_region,
        sessions.game_name,
        sessions.status,
        sessions.scheduled_at,
        sessions.started_at,
        sessions.ended_at,
        sessions.duration_seconds,
        sessions.score,
        sessions.difficulty,
        sessions.created_at,
        sessions.updated_at
      FROM sessions
      INNER JOIN children
        ON children.id = sessions.child_id
      INNER JOIN child_users
        ON child_users.child_id = sessions.child_id
      WHERE
        child_users.user_id = ?
        AND sessions.id = ?
      LIMIT 1
      `,
      [
        userId,
        sessionId,
      ]
    );

  return rows[0] ?? null;

};


export const getSessionGames = async (
  sessionId: number
) => {

  const [rows] =
    await db.query<RowDataPacket[]>(
      `
      SELECT
        id,
        session_id,
        custom_game_id,
        game_name,
        difficulty,
        status,
        started_at,
        ended_at,
        duration_seconds,
        score,
        accuracy,
        mistakes,
        reaction_time,
        result_data,
        created_at,
        updated_at
      FROM session_games
      WHERE session_id = ?
      ORDER BY id ASC
      `,
      [sessionId]
    );

  return rows;

};


export const getSessionGameById = async (
  sessionId: number,
  gameId: number
) => {

  const [rows] =
    await db.query<RowDataPacket[]>(
      `
      SELECT *
      FROM session_games
      WHERE
        id = ?
        AND session_id = ?
      `,
      [
        gameId,
        sessionId,
      ]
    );

  return rows[0] ?? null;

};


export const getNextPendingGame = async (
  sessionId: number
) => {

  const [rows] =
    await db.query<RowDataPacket[]>(
      `
      SELECT *
      FROM session_games
      WHERE
        session_id = ?
        AND status = 'Pending'
      ORDER BY id ASC
      LIMIT 1
      `,
      [sessionId]
    );

  return rows[0] ?? null;

};


export const getAllChildrenSessionStats =
  async () => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          c.id AS child_id,
          COUNT(DISTINCT s.id) AS total_sessions,
          SUM(
            CASE
              WHEN s.status IN ('Completed', 'Ended')
              THEN 1
              ELSE 0
            END
          ) AS assessment_count,
          MAX(
            CASE
              WHEN s.status = 'Completed'
              THEN COALESCE(
                s.ended_at,
                s.updated_at,
                s.started_at,
                s.created_at
              )
              ELSE NULL
            END
          ) AS latest_assessment_at,
          ROUND(
            AVG(
              CASE
                WHEN
                  s.status IN ('Completed', 'Ended')
                  AND s.score IS NOT NULL
                THEN s.score
                ELSE NULL
              END
            )
          ) AS average_session_score
        FROM children c
        LEFT JOIN sessions s
          ON s.child_id = c.id
        GROUP BY
          c.id
        ORDER BY
          c.id ASC
        `
      );

    return rows;

  };


export const getChildSessionStats =
  async (
    childId: number
  ) => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          c.id AS child_id,
          COUNT(DISTINCT s.id) AS total_sessions,
          SUM(
            CASE
              WHEN s.status IN ('Completed', 'Ended')
              THEN 1
              ELSE 0
            END
          ) AS assessment_count,
          MAX(
            CASE
              WHEN s.status = 'Completed'
              THEN COALESCE(
                s.ended_at,
                s.updated_at,
                s.started_at,
                s.created_at
              )
              ELSE NULL
            END
          ) AS latest_assessment_at,
          ROUND(
            AVG(
              CASE
                WHEN
                  s.status IN ('Completed', 'Ended')
                  AND s.score IS NOT NULL
                THEN s.score
                ELSE NULL
              END
            )
          ) AS average_session_score
        FROM children c
        LEFT JOIN sessions s
          ON s.child_id = c.id
        WHERE
          c.id = ?
        GROUP BY
          c.id
        LIMIT 1
        `,
        [childId]
      );

    return rows[0] ?? null;

  };


export const startSessionGameById = async (
  sessionId: number,
  gameId: number
) => {

  const [result] =
    await db.query<ResultSetHeader>(
      `
      UPDATE session_games
      SET
        status = 'In Progress',
        started_at = COALESCE(
          started_at,
          NOW()
        )
      WHERE
        id = ?
        AND session_id = ?
        AND status = 'Pending'
      `,
      [
        gameId,
        sessionId,
      ]
    );

  return result.affectedRows;

};


export const completeSessionGameById =
  async (
    sessionId: number,
    gameId: number,
    gameStatus: "Completed" | "Failed",
    durationSeconds: number,
    score: number,
    accuracy: number | null,
    mistakes: number | null,
    reactionTime: number | null,
    resultData: unknown
  ) => {

    const serializedResult =
      resultData === undefined ||
      resultData === null
        ? null
        : JSON.stringify(resultData);

    const [result] =
      await db.query<ResultSetHeader>(
        `
        UPDATE session_games
        SET
          status = ?,
          ended_at = NOW(),
          duration_seconds = ?,
          score = ?,
          accuracy = ?,
          mistakes = ?,
          reaction_time = ?,
          result_data = ?
        WHERE
          id = ?
          AND session_id = ?
        `,
        [
          gameStatus,
          durationSeconds,
          score,
          accuracy,
          mistakes,
          reactionTime,
          serializedResult,
          gameId,
          sessionId,
        ]
      );

    return result.affectedRows;

  };


export const getSessionGamesSummary =
  async (
    sessionId: number
  ) => {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT
          SUM(
            CASE
              WHEN status IN (
                'Pending',
                'In Progress',
                'Paused'
              )
              THEN 1
              ELSE 0
            END
          ) AS remaining_games,
          AVG(
            CASE
              WHEN score IS NOT NULL
              THEN score
              ELSE NULL
            END
          ) AS average_score,
          SUM(duration_seconds)
            AS total_game_duration
        FROM session_games
        WHERE session_id = ?
        `,
        [sessionId]
      );

    return rows[0];

  };


export const pauseSessionById = async (
  id: number,
  durationSeconds: number
) => {

  const [result] =
    await db.query<ResultSetHeader>(
      `
      UPDATE sessions
      SET
        status = 'Paused',
        duration_seconds = ?
      WHERE id = ?
      `,
      [
        durationSeconds,
        id,
      ]
    );

  return result.affectedRows;

};


export const pauseActiveGameBySessionId =
  async (
    sessionId: number
  ) => {

    await db.query(
      `
      UPDATE session_games
      SET status = 'Paused'
      WHERE
        session_id = ?
        AND status = 'In Progress'
      `,
      [sessionId]
    );

  };


export const resumeSessionById = async (
  id: number,
  durationSeconds: number
) => {

  const [result] =
    await db.query<ResultSetHeader>(
      `
      UPDATE sessions
      SET
        status = 'In Progress',
        duration_seconds = ?,
        started_at =
          FROM_UNIXTIME(
            UNIX_TIMESTAMP(NOW()) - ?
          )
      WHERE id = ?
      `,
      [
        durationSeconds,
        durationSeconds,
        id,
      ]
    );

  return result.affectedRows;

};


export const resumePausedGameBySessionId =
  async (
    sessionId: number
  ) => {

    await db.query(
      `
      UPDATE session_games
      SET status = 'In Progress'
      WHERE
        session_id = ?
        AND status = 'Paused'
      `,
      [sessionId]
    );

  };


export const completeSessionById = async (
  id: number,
  durationSeconds: number,
  score: number
) => {

  const [result] =
    await db.query<ResultSetHeader>(
      `
      UPDATE sessions
      SET
        status = 'Completed',
        duration_seconds = ?,
        score = ?,
        ended_at = NOW()
      WHERE id = ?
      `,
      [
        durationSeconds,
        score,
        id,
      ]
    );

  return result.affectedRows;

};


export const endSessionById = async (
  id: number,
  durationSeconds: number
) => {

  const [result] =
    await db.query<ResultSetHeader>(
      `
      UPDATE sessions
      SET
        status = 'Ended',
        duration_seconds = ?,
        ended_at = NOW()
      WHERE id = ?
      `,
      [
        durationSeconds,
        id,
      ]
    );

  return result.affectedRows;

};


export const endUnfinishedGamesBySessionId =
  async (
    sessionId: number
  ) => {

    await db.query(
      `
      UPDATE session_games
      SET
        duration_seconds =
          CASE
            WHEN status IN (
              'In Progress',
              'Paused'
            )
            THEN COALESCE(
              duration_seconds,
              GREATEST(
                0,
                TIMESTAMPDIFF(
                  SECOND,
                  COALESCE(
                    started_at,
                    NOW()
                  ),
                  NOW()
                )
              )
            )
            ELSE COALESCE(
              duration_seconds,
              0
            )
          END,
        status = 'Ended',
        ended_at = NOW()
      WHERE
        session_id = ?
        AND status IN (
          'Pending',
          'In Progress',
          'Paused'
        )
      `,
      [sessionId]
    );

  };


export const cancelSessionById = async (
  id: number,
  durationSeconds: number
) => {

  const [result] =
    await db.query<ResultSetHeader>(
      `
      UPDATE sessions
      SET
        status = 'Cancelled',
        duration_seconds = ?,
        ended_at = NOW()
      WHERE id = ?
      `,
      [
        durationSeconds,
        id,
      ]
    );

  return result.affectedRows;

};
