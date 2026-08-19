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

  difficulty: string;
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


const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  "http://10.0.2.2:5000"
).replace(/\/$/, "");


const handleResponse = async <T>(
  response: Response
): Promise<T> => {

  const data =
    await response
      .json()
      .catch(() => null);


  if (!response.ok) {

    throw new Error(
      data?.message ||
      "Request failed"
    );

  }


  return data as T;

};


export const createSession = async (
  payload: CreateSessionPayload
): Promise<CreateSessionResponse> => {

  const response =
    await fetch(
      `${API_URL}/sessions`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          payload
        ),
      }
    );


  return handleResponse<CreateSessionResponse>(
    response
  );

};


export const getSessions = async (
): Promise<Session[]> => {

  const response =
    await fetch(
      `${API_URL}/sessions`
    );


  const data =
    await handleResponse<SessionsResponse>(
      response
    );


  return data.sessions;

};


export const getSessionById = async (
  id: number
): Promise<Session> => {

  const response =
    await fetch(
      `${API_URL}/sessions/${id}`
    );


  return handleResponse<Session>(
    response
  );

};


export const pauseSession = async (
  id: number,
  durationSeconds: number
): Promise<SessionResponse> => {

  const response =
    await fetch(
      `${API_URL}/sessions/${id}/pause`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          duration_seconds:
            durationSeconds,
        }),
      }
    );


  return handleResponse<SessionResponse>(
    response
  );

};


export const resumeSession = async (
  id: number,
  durationSeconds: number
): Promise<SessionResponse> => {

  const response =
    await fetch(
      `${API_URL}/sessions/${id}/resume`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          duration_seconds:
            durationSeconds,
        }),
      }
    );


  return handleResponse<SessionResponse>(
    response
  );

};


export const endSession = async (
  id: number,
  durationSeconds: number
): Promise<SessionResponse> => {

  const response =
    await fetch(
      `${API_URL}/sessions/${id}/end`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          duration_seconds:
            durationSeconds,
        }),
      }
    );


  return handleResponse<SessionResponse>(
    response
  );

};


export const cancelSession = async (
  id: number
): Promise<SessionResponse> => {

  const response =
    await fetch(
      `${API_URL}/sessions/${id}/cancel`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );


  return handleResponse<SessionResponse>(
    response
  );

};


export const startSessionGame = async (
  sessionId: number,
  gameId: number
): Promise<SessionResponse> => {

  const response =
    await fetch(
      `${API_URL}/sessions/${sessionId}/games/${gameId}/start`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );


  return handleResponse<SessionResponse>(
    response
  );

};


export const completeSessionGame =
  async (
    sessionId: number,
    gameId: number,
    payload: CompleteGamePayload
  ): Promise<CompleteGameResponse> => {

    const response =
      await fetch(
        `${API_URL}/sessions/${sessionId}/games/${gameId}/complete`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );


    return handleResponse<CompleteGameResponse>(
      response
    );

  };