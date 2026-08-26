import {
  authRequest,
} from "@/api/authApi";

export type GameBuilderDifficulty =
  | "Easy"
  | "Medium"
  | "Hard";

export type GameBuilderStatus =
  | "draft"
  | "published";

export type GameBuilderGame = {
  id: number;
  therapist_id?: number;
  title: string;
  description?: string | null;
  domain?: string | null;
  difficulty?:
    | GameBuilderDifficulty
    | string
    | null;
  status?:
    | GameBuilderStatus
    | string
    | null;
  objects?: any[];
  rules?: any[];
  blocks?: any[];
  settings?: Record<
    string,
    any
  >;
  created_at?: string;
  updated_at?: string;
};

export type GameBuilderAssignment = {
  id: number;
  game_id: number;
  therapist_id: number;
  assignment_type:
    | "child"
    | "session";
  child_id: number;
  child_name?: string | null;
  session_id?: number | null;
  session_status?: string | null;
  target_key?: string;
  created_at?: string;
};

export type GameBuilderAssignmentOptions = {
  children?: any[];
  sessions?: any[];
};

export type GameBuilderAssignmentInput = {
  assignment_type:
    | "child"
    | "session";
  child_id: number;
  session_id?: number | null;
};

export const getGameBuilderGames =
  async (): Promise<
    GameBuilderGame[]
  > => {
    const data =
      await authRequest<
        GameBuilderGame[]
      >(
        "/game-builder"
      );

    return Array.isArray(
      data
    )
      ? data
      : [];
  };

export const getGameBuilderGame =
  async (
    gameId: number
  ): Promise<
    GameBuilderGame
  > => {
    return authRequest<
      GameBuilderGame
    >(
      `/game-builder/${gameId}`
    );
  };

export const createGameBuilderGame =
  async (
    game: Partial<
      GameBuilderGame
    >
  ) => {
    return authRequest(
      "/game-builder",
      {
        method: "POST",
        body: JSON.stringify(
          game
        ),
      }
    );
  };

export const updateGameBuilderGame =
  async (
    gameId: number,
    game: Partial<
      GameBuilderGame
    >
  ) => {
    return authRequest(
      `/game-builder/${gameId}`,
      {
        method: "PUT",
        body: JSON.stringify(
          game
        ),
      }
    );
  };

export const deleteGameBuilderGame =
  async (
    gameId: number
  ) => {
    return authRequest(
      `/game-builder/${gameId}`,
      {
        method: "DELETE",
      }
    );
  };

export const getGameBuilderAssignmentOptions =
  async (
    gameId: number
  ): Promise<
    GameBuilderAssignmentOptions
  > => {
    return authRequest<
      GameBuilderAssignmentOptions
    >(
      `/game-builder/${gameId}/assignment-options`
    );
  };

export const getGameBuilderAssignments =
  async (
    gameId: number
  ): Promise<
    GameBuilderAssignment[]
  > => {
    const data =
      await authRequest<
        GameBuilderAssignment[]
      >(
        `/game-builder/${gameId}/assignments`
      );

    return Array.isArray(
      data
    )
      ? data
      : [];
  };

export const assignGameBuilderGame =
  async (
    gameId: number,
    assignment:
      GameBuilderAssignmentInput
  ) => {
    return authRequest(
      `/game-builder/${gameId}/assignments`,
      {
        method: "POST",
        body: JSON.stringify(
          assignment
        ),
      }
    );
  };

export const removeGameBuilderAssignment =
  async (
    gameId: number,
    assignmentId: number
  ) => {
    return authRequest(
      `/game-builder/${gameId}/assignments/${assignmentId}`,
      {
        method:
          "DELETE",
      }
    );
  };