import {
  authRequest,
} from "@/api/authApi";


export type SessionStatus =
  | "Scheduled"
  | "In Progress"
  | "Paused"
  | "Completed"
  | "Ended"
  | "Cancelled";


export type SessionGameStatus =
  | "Pending"
  | "In Progress"
  | "Paused"
  | "Completed"
  | "Failed"
  | "Ended";


export type SessionGame = {
  id: number;
  session_id: number;
  custom_game_id?: number | null;
  game_name: string;
  difficulty: string | null;
  status: SessionGameStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  score: number | null;
  accuracy: number | null;
  mistakes: number | null;
  reaction_time: number | null;
  result_data:
    | string
    | Record<string, unknown>
    | null;
  created_at: string;
  updated_at: string;
};


export type Session = {
  id: number;
  child_id: number;
  child_name: string;
  child_age: number;
  child_gender: string;
  game_name: string;
  status: SessionStatus;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  score: number | null;
  difficulty: string | null;
  created_at: string;
  updated_at: string;
  games: SessionGame[];
};


export type SessionGameInput = {
  game_name: string;
  difficulty: string | null;
  custom_game_id?: number | null;
};


export type CreateSessionPayload = {
  child_id: number;
  games: SessionGameInput[];
};


export type CreateSessionResponse = {
  message: string;
  session: Session;
};


export type SessionsResponse = {
  sessions: Session[];
};


export type SessionResponse = {
  message: string;
  session: Session;
};


export type CompleteGamePayload = {
  status:
    | "Completed"
    | "Failed";
  duration_seconds: number;
  session_duration_seconds: number;
  score: number;
  accuracy: number | null;
  mistakes: number | null;
  reaction_time: number | null;
  result_data:
    | Record<string, unknown>
    | null;
};


export type CompleteGameResponse = {
  message: string;
  game_status:
    | "Completed"
    | "Failed";
  all_games_completed: boolean;
  next_game: SessionGame | null;
  session: Session;
};


export const createSession =
  async (
    payload: CreateSessionPayload
  ): Promise<CreateSessionResponse> => {

    return authRequest<CreateSessionResponse>(
      "/sessions",
      {
        method: "POST",
        body: JSON.stringify(
          payload
        ),
      }
    );

  };


export const getSessions =
  async (): Promise<Session[]> => {

    const data =
      await authRequest<SessionsResponse>(
        "/sessions"
      );

    return Array.isArray(
      data?.sessions
    )
      ? data.sessions
      : [];

  };


export const getSessionById =
  async (
    id: number
  ): Promise<Session> => {

    return authRequest<Session>(
      `/sessions/${id}`
    );

  };


export const pauseSession =
  async (
    id: number,
    durationSeconds: number
  ): Promise<SessionResponse> => {

    return authRequest<SessionResponse>(
      `/sessions/${id}/pause`,
      {
        method: "PATCH",
        body: JSON.stringify({
          duration_seconds:
            durationSeconds,
        }),
      }
    );

  };


export const resumeSession =
  async (
    id: number,
    durationSeconds: number
  ): Promise<SessionResponse> => {

    return authRequest<SessionResponse>(
      `/sessions/${id}/resume`,
      {
        method: "PATCH",
        body: JSON.stringify({
          duration_seconds:
            durationSeconds,
        }),
      }
    );

  };


export const endSession =
  async (
    id: number,
    durationSeconds: number
  ): Promise<SessionResponse> => {

    return authRequest<SessionResponse>(
      `/sessions/${id}/end`,
      {
        method: "PATCH",
        body: JSON.stringify({
          duration_seconds:
            durationSeconds,
        }),
      }
    );

  };


export const cancelSession =
  async (
    id: number
  ): Promise<SessionResponse> => {

    return authRequest<SessionResponse>(
      `/sessions/${id}/cancel`,
      {
        method: "PATCH",
      }
    );

  };


export const startSessionGame =
  async (
    sessionId: number,
    gameId: number
  ): Promise<SessionResponse> => {

    return authRequest<SessionResponse>(
      `/sessions/${sessionId}/games/${gameId}/start`,
      {
        method: "PATCH",
      }
    );

  };


export const completeSessionGame =
  async (
    sessionId: number,
    gameId: number,
    payload: CompleteGamePayload
  ): Promise<CompleteGameResponse> => {

    return authRequest<CompleteGameResponse>(
      `/sessions/${sessionId}/games/${gameId}/complete`,
      {
        method: "PATCH",
        body: JSON.stringify(
          payload
        ),
      }
    );

  };