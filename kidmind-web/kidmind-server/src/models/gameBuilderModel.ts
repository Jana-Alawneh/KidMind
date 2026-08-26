import db from "../database/db";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";


export type GameBuilderDifficulty =
  | "Easy"
  | "Medium"
  | "Hard";

export type GameBuilderStatus =
  | "draft"
  | "published"
  | "archived";


export type GameBuilderObject =
  Record<
    string,
    unknown
  >;


export type GameBuilderRule =
  Record<
    string,
    unknown
  >;


export type GameBuilderGame = {
  id: number;
  therapist_id: number;
  title: string;
  description:
    | string
    | null;
  domain: string;
  difficulty:
    GameBuilderDifficulty;
  time_seconds: number;
  lives: number;
  score_enabled: boolean;
  color: string;
  icon_name: string;
  objects:
    GameBuilderObject[];
  rules:
    GameBuilderRule[];
  is_ai_generated: boolean;
  ai_child_id:
    | number
    | null;
  ai_child_name:
    | string
    | null;
  ai_target_skill:
    | string
    | null;
  ai_analysis:
    | string
    | null;
  status:
    GameBuilderStatus;
  created_at:
    | string
    | Date;
  updated_at:
    | string
    | Date;
};


type GameBuilderGameRow =
  RowDataPacket & {
    id: number;
    therapist_id: number;
    title: string;
    description:
      | string
      | null;
    domain: string;
    difficulty:
      GameBuilderDifficulty;
    time_seconds: number;
    lives: number;
    score_enabled:
      | number
      | boolean;
    color: string;
    icon_name: string;
    objects_json:
      | string
      | GameBuilderObject[];
    rules_json:
      | string
      | GameBuilderRule[];
    is_ai_generated:
      | number
      | boolean;
    ai_child_id:
      | number
      | null;
    ai_child_name:
      | string
      | null;
    ai_target_skill:
      | string
      | null;
    ai_analysis:
      | string
      | null;
    status:
      GameBuilderStatus;
    created_at:
      | string
      | Date;
    updated_at:
      | string
      | Date;
  };


export type CreateGameBuilderGameInput = {
  therapistId: number;
  title: string;
  description?:
    | string
    | null;
  domain?: string;
  difficulty?:
    GameBuilderDifficulty;
  timeSeconds?: number;
  lives?: number;
  scoreEnabled?: boolean;
  color?: string;
  iconName?: string;
  objects?:
    GameBuilderObject[];
  rules?:
    GameBuilderRule[];
  isAiGenerated?: boolean;
  aiChildId?:
    | number
    | null;
  aiChildName?:
    | string
    | null;
  aiTargetSkill?:
    | string
    | null;
  aiAnalysis?:
    | string
    | null;
  status?:
    GameBuilderStatus;
};


export type UpdateGameBuilderGameInput = {
  title?: string;
  description?:
    | string
    | null;
  domain?: string;
  difficulty?:
    GameBuilderDifficulty;
  timeSeconds?: number;
  lives?: number;
  scoreEnabled?: boolean;
  color?: string;
  iconName?: string;
  objects?:
    GameBuilderObject[];
  rules?:
    GameBuilderRule[];
  isAiGenerated?: boolean;
  aiChildId?:
    | number
    | null;
  aiChildName?:
    | string
    | null;
  aiTargetSkill?:
    | string
    | null;
  aiAnalysis?:
    | string
    | null;
  status?:
    GameBuilderStatus;
};


const parseJsonArray =
  <T>(
    value:
      | string
      | T[]
      | null
      | undefined
  ): T[] => {

    if (
      Array.isArray(
        value
      )
    ) {
      return value;
    }

    if (
      typeof value !==
      "string"
    ) {
      return [];
    }

    try {

      const parsed =
        JSON.parse(
          value
        );

      return Array.isArray(
        parsed
      )
        ? parsed
        : [];

    } catch {

      return [];

    }

  };


const normalizeGame =
  (
    row:
      GameBuilderGameRow
  ): GameBuilderGame => {

    return {
      id:
        Number(
          row.id
        ),
      therapist_id:
        Number(
          row.therapist_id
        ),
      title:
        row.title,
      description:
        row.description,
      domain:
        row.domain,
      difficulty:
        row.difficulty,
      time_seconds:
        Number(
          row.time_seconds
        ),
      lives:
        Number(
          row.lives
        ),
      score_enabled:
        Boolean(
          Number(
            row.score_enabled
          )
        ),
      color:
        row.color,
      icon_name:
        row.icon_name,
      objects:
        parseJsonArray<
          GameBuilderObject
        >(
          row.objects_json
        ),
      rules:
        parseJsonArray<
          GameBuilderRule
        >(
          row.rules_json
        ),
      is_ai_generated:
        Boolean(
          Number(
            row.is_ai_generated
          )
        ),
      ai_child_id:
        row.ai_child_id ===
          null
          ? null
          : Number(
              row.ai_child_id
            ),
      ai_child_name:
        row.ai_child_name,
      ai_target_skill:
        row.ai_target_skill,
      ai_analysis:
        row.ai_analysis,
      status:
        row.status,
      created_at:
        row.created_at,
      updated_at:
        row.updated_at,
    };

  };


const selectFields = `
  id,
  therapist_id,
  title,
  description,
  domain,
  difficulty,
  time_seconds,
  lives,
  score_enabled,
  color,
  icon_name,
  objects_json,
  rules_json,
  is_ai_generated,
  ai_child_id,
  ai_child_name,
  ai_target_skill,
  ai_analysis,
  status,
  created_at,
  updated_at
`;


export const getGameBuilderGamesForTherapist =
  async (
    therapistId: number
  ): Promise<
    GameBuilderGame[]
  > => {

    const [rows] =
      await db.query<
        GameBuilderGameRow[]
      >(
        `
        SELECT
          ${selectFields}
        FROM game_builder_games
        WHERE therapist_id = ?
        ORDER BY
          updated_at DESC,
          id DESC
        `,
        [
          therapistId,
        ]
      );

    return rows.map(
      normalizeGame
    );

  };


export const getGameBuilderGameById =
  async (
    gameId: number,
    therapistId: number
  ): Promise<
    GameBuilderGame | null
  > => {

    const [rows] =
      await db.query<
        GameBuilderGameRow[]
      >(
        `
        SELECT
          ${selectFields}
        FROM game_builder_games
        WHERE
          id = ?
          AND therapist_id = ?
        LIMIT 1
        `,
        [
          gameId,
          therapistId,
        ]
      );

    if (
      rows.length === 0
    ) {
      return null;
    }

    return normalizeGame(
      rows[0]
    );

  };


export const createGameBuilderGame =
  async (
    input:
      CreateGameBuilderGameInput
  ): Promise<
    GameBuilderGame | null
  > => {

    const [result] =
      await db.query<
        ResultSetHeader
      >(
        `
        INSERT INTO game_builder_games
        (
          therapist_id,
          title,
          description,
          domain,
          difficulty,
          time_seconds,
          lives,
          score_enabled,
          color,
          icon_name,
          objects_json,
          rules_json,
          is_ai_generated,
          ai_child_id,
          ai_child_name,
          ai_target_skill,
          ai_analysis,
          status
        )
        VALUES
        (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?,
          ?,
          ?, ?, ?, ?, ?, ?
        )
        `,
        [
          input.therapistId,
          input.title,
          input.description ??
            null,
          input.domain ??
            "Custom Cognitive Assessment",
          input.difficulty ??
            "Easy",
          input.timeSeconds ??
            60,
          input.lives ??
            3,
          input.scoreEnabled ===
            false
            ? 0
            : 1,
          input.color ??
            "#F1EDFF",
          input.iconName ??
            "Puzzle",
          JSON.stringify(
            input.objects ??
              []
          ),
          JSON.stringify(
            input.rules ??
              []
          ),
          input.isAiGenerated
            ? 1
            : 0,
          input.aiChildId ??
            null,
          input.aiChildName ??
            null,
          input.aiTargetSkill ??
            null,
          input.aiAnalysis ??
            null,
          input.status ??
            "draft",
        ]
      );

    return getGameBuilderGameById(
      result.insertId,
      input.therapistId
    );

  };


export const updateGameBuilderGame =
  async (
    gameId: number,
    therapistId: number,
    input:
      UpdateGameBuilderGameInput
  ): Promise<
    GameBuilderGame | null
  > => {

    const fields:
      string[] = [];

    const values:
      unknown[] = [];


    if (
      input.title !==
      undefined
    ) {
      fields.push(
        "title = ?"
      );

      values.push(
        input.title
      );
    }


    if (
      input.description !==
      undefined
    ) {
      fields.push(
        "description = ?"
      );

      values.push(
        input.description
      );
    }


    if (
      input.domain !==
      undefined
    ) {
      fields.push(
        "domain = ?"
      );

      values.push(
        input.domain
      );
    }


    if (
      input.difficulty !==
      undefined
    ) {
      fields.push(
        "difficulty = ?"
      );

      values.push(
        input.difficulty
      );
    }


    if (
      input.timeSeconds !==
      undefined
    ) {
      fields.push(
        "time_seconds = ?"
      );

      values.push(
        input.timeSeconds
      );
    }


    if (
      input.lives !==
      undefined
    ) {
      fields.push(
        "lives = ?"
      );

      values.push(
        input.lives
      );
    }


    if (
      input.scoreEnabled !==
      undefined
    ) {
      fields.push(
        "score_enabled = ?"
      );

      values.push(
        input.scoreEnabled
          ? 1
          : 0
      );
    }


    if (
      input.color !==
      undefined
    ) {
      fields.push(
        "color = ?"
      );

      values.push(
        input.color
      );
    }


    if (
      input.iconName !==
      undefined
    ) {
      fields.push(
        "icon_name = ?"
      );

      values.push(
        input.iconName
      );
    }


    if (
      input.objects !==
      undefined
    ) {
      fields.push(
        "objects_json = ?"
      );

      values.push(
        JSON.stringify(
          input.objects
        )
      );
    }


    if (
      input.rules !==
      undefined
    ) {
      fields.push(
        "rules_json = ?"
      );

      values.push(
        JSON.stringify(
          input.rules
        )
      );
    }


    if (
      input.isAiGenerated !==
      undefined
    ) {
      fields.push(
        "is_ai_generated = ?"
      );

      values.push(
        input.isAiGenerated
          ? 1
          : 0
      );
    }


    if (
      input.aiChildId !==
      undefined
    ) {
      fields.push(
        "ai_child_id = ?"
      );

      values.push(
        input.aiChildId
      );
    }


    if (
      input.aiChildName !==
      undefined
    ) {
      fields.push(
        "ai_child_name = ?"
      );

      values.push(
        input.aiChildName
      );
    }


    if (
      input.aiTargetSkill !==
      undefined
    ) {
      fields.push(
        "ai_target_skill = ?"
      );

      values.push(
        input.aiTargetSkill
      );
    }


    if (
      input.aiAnalysis !==
      undefined
    ) {
      fields.push(
        "ai_analysis = ?"
      );

      values.push(
        input.aiAnalysis
      );
    }


    if (
      input.status !==
      undefined
    ) {
      fields.push(
        "status = ?"
      );

      values.push(
        input.status
      );
    }


    if (
      fields.length === 0
    ) {
      return getGameBuilderGameById(
        gameId,
        therapistId
      );
    }


    values.push(
      gameId,
      therapistId
    );


    const [result] =
      await db.query<
        ResultSetHeader
      >(
        `
        UPDATE game_builder_games
        SET
          ${fields.join(
            ", "
          )}
        WHERE
          id = ?
          AND therapist_id = ?
        `,
        values
      );


    if (
      result.affectedRows ===
      0
    ) {
      return null;
    }


    return getGameBuilderGameById(
      gameId,
      therapistId
    );

  };


export const deleteGameBuilderGame =
  async (
    gameId: number,
    therapistId: number
  ): Promise<boolean> => {

    await db.query(
      `
      DELETE FROM session_games
      WHERE
        custom_game_id = ?
        AND status = 'Pending'
      `,
      [
        gameId,
      ]
    );


    await db.query(
      `
      UPDATE session_games
      SET custom_game_id = NULL
      WHERE custom_game_id = ?
      `,
      [
        gameId,
      ]
    );


    await db.query(
      `
      DELETE FROM game_builder_assignments
      WHERE
        game_id = ?
        AND therapist_id = ?
      `,
      [
        gameId,
        therapistId,
      ]
    );


    const [result] =
      await db.query<
        ResultSetHeader
      >(
        `
        DELETE FROM game_builder_games
        WHERE
          id = ?
          AND therapist_id = ?
        `,
        [
          gameId,
          therapistId,
        ]
      );

    return (
      result.affectedRows >
      0
    );

  };


export const gameBuilderGameExists =
  async (
    gameId: number,
    therapistId: number
  ): Promise<boolean> => {

    const [rows] =
      await db.query<
        RowDataPacket[]
      >(
        `
        SELECT id
        FROM game_builder_games
        WHERE
          id = ?
          AND therapist_id = ?
        LIMIT 1
        `,
        [
          gameId,
          therapistId,
        ]
      );

    return (
      rows.length >
      0
    );

  };

export type GameBuilderAssignmentType =
  | "child"
  | "session";


export type GameBuilderAssignment = {
  id: number;
  game_id: number;
  therapist_id: number;
  assignment_type:
    GameBuilderAssignmentType;
  child_id: number;
  child_name: string;
  session_id:
    | number
    | null;
  session_status:
    | string
    | null;
  target_key: string;
  created_at:
    | string
    | Date;
};


type GameBuilderAssignmentRow =
  RowDataPacket & {
    id: number;
    game_id: number;
    therapist_id: number;
    assignment_type:
      GameBuilderAssignmentType;
    child_id: number;
    child_name: string;
    session_id:
      | number
      | null;
    session_status:
      | string
      | null;
    target_key: string;
    created_at:
      | string
      | Date;
  };


export type CreateGameBuilderAssignmentInput = {
  gameId: number;
  therapistId: number;
  assignmentType:
    GameBuilderAssignmentType;
  childId: number;
  sessionId?:
    | number
    | null;
  gameTitle: string;
  difficulty:
    GameBuilderDifficulty;
};


const normalizeAssignment =
  (
    row:
      GameBuilderAssignmentRow
  ): GameBuilderAssignment => {

    return {
      id:
        Number(
          row.id
        ),
      game_id:
        Number(
          row.game_id
        ),
      therapist_id:
        Number(
          row.therapist_id
        ),
      assignment_type:
        row.assignment_type,
      child_id:
        Number(
          row.child_id
        ),
      child_name:
        row.child_name,
      session_id:
        row.session_id ===
          null
          ? null
          : Number(
              row.session_id
            ),
      session_status:
        row.session_status,
      target_key:
        row.target_key,
      created_at:
        row.created_at,
    };

  };


export const getGameBuilderAssignmentById =
  async (
    assignmentId: number,
    gameId: number,
    therapistId: number
  ): Promise<
    GameBuilderAssignment | null
  > => {

    const [rows] =
      await db.query<
        GameBuilderAssignmentRow[]
      >(
        `
        SELECT
          a.id,
          a.game_id,
          a.therapist_id,
          a.assignment_type,
          a.child_id,
          c.full_name AS child_name,
          a.session_id,
          s.status AS session_status,
          a.target_key,
          a.created_at
        FROM game_builder_assignments a
        INNER JOIN children c
          ON c.id = a.child_id
        LEFT JOIN sessions s
          ON s.id = a.session_id
        WHERE
          a.id = ?
          AND a.game_id = ?
          AND a.therapist_id = ?
        LIMIT 1
        `,
        [
          assignmentId,
          gameId,
          therapistId,
        ]
      );

    if (
      rows.length === 0
    ) {
      return null;
    }

    return normalizeAssignment(
      rows[0]
    );

  };


export const getGameBuilderAssignments =
  async (
    gameId: number,
    therapistId: number
  ): Promise<
    GameBuilderAssignment[]
  > => {

    const [rows] =
      await db.query<
        GameBuilderAssignmentRow[]
      >(
        `
        SELECT
          a.id,
          a.game_id,
          a.therapist_id,
          a.assignment_type,
          a.child_id,
          c.full_name AS child_name,
          a.session_id,
          s.status AS session_status,
          a.target_key,
          a.created_at
        FROM game_builder_assignments a
        INNER JOIN children c
          ON c.id = a.child_id
        LEFT JOIN sessions s
          ON s.id = a.session_id
        WHERE
          a.game_id = ?
          AND a.therapist_id = ?
        ORDER BY
          a.created_at DESC,
          a.id DESC
        `,
        [
          gameId,
          therapistId,
        ]
      );

    return rows.map(
      normalizeAssignment
    );

  };


export const createGameBuilderAssignment =
  async (
    input:
      CreateGameBuilderAssignmentInput
  ): Promise<
    GameBuilderAssignment | null
  > => {

    const sessionId =
      input.assignmentType ===
        "session"
        ? input.sessionId ??
          null
        : null;

    const targetKey =
      input.assignmentType ===
        "session"
        ? `session:${sessionId}`
        : `child:${input.childId}`;

    const [result] =
      await db.query<
        ResultSetHeader
      >(
        `
        INSERT INTO game_builder_assignments
        (
          game_id,
          therapist_id,
          assignment_type,
          child_id,
          session_id,
          target_key
        )
        VALUES
        (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          id = LAST_INSERT_ID(id)
        `,
        [
          input.gameId,
          input.therapistId,
          input.assignmentType,
          input.childId,
          sessionId,
          targetKey,
        ]
      );

    const assignmentId =
      Number(
        result.insertId
      );

    if (
      input.assignmentType ===
        "session" &&
      sessionId
    ) {

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
        SELECT
          ?,
          ?,
          ?,
          ?,
          'Pending',
          NULL
        WHERE NOT EXISTS
        (
          SELECT 1
          FROM session_games
          WHERE
            session_id = ?
            AND custom_game_id = ?
        )
        `,
        [
          sessionId,
          input.gameId,
          input.gameTitle,
          input.difficulty,
          sessionId,
          input.gameId,
        ]
      );

    }

    return getGameBuilderAssignmentById(
      assignmentId,
      input.gameId,
      input.therapistId
    );

  };


export const deleteGameBuilderAssignment =
  async (
    assignmentId: number,
    gameId: number,
    therapistId: number
  ): Promise<boolean> => {

    const assignment =
      await getGameBuilderAssignmentById(
        assignmentId,
        gameId,
        therapistId
      );

    if (!assignment) {
      return false;
    }

    const [result] =
      await db.query<
        ResultSetHeader
      >(
        `
        DELETE FROM game_builder_assignments
        WHERE
          id = ?
          AND game_id = ?
          AND therapist_id = ?
        `,
        [
          assignmentId,
          gameId,
          therapistId,
        ]
      );

    if (
      result.affectedRows ===
      0
    ) {
      return false;
    }

    if (
      assignment.assignment_type ===
        "session" &&
      assignment.session_id
    ) {

      await db.query(
        `
        DELETE FROM session_games
        WHERE
          session_id = ?
          AND custom_game_id = ?
          AND status = 'Pending'
        `,
        [
          assignment.session_id,
          gameId,
        ]
      );

    }

    return true;

  };

