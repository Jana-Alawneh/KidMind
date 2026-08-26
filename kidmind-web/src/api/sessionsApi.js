import api from "../services/api";


export const createSession = async (
  sessionData
) => {

  const response =
    await api.post(
      "/sessions",
      sessionData
    );

  return response.data;

};


export const getSessions = async () => {

  const response =
    await api.get(
      "/sessions"
    );

  const data =
    response.data;

  return Array.isArray(
    data?.sessions
  )
    ? data.sessions
    : [];

};


export const getSessionById = async (
  id
) => {

  const response =
    await api.get(
      `/sessions/${id}`
    );

  return response.data;

};


export const pauseSession = async (
  id,
  durationSeconds
) => {

  const response =
    await api.patch(
      `/sessions/${id}/pause`,
      {
        duration_seconds:
          durationSeconds,
      }
    );

  return response.data;

};


export const resumeSession = async (
  id,
  durationSeconds
) => {

  const response =
    await api.patch(
      `/sessions/${id}/resume`,
      {
        duration_seconds:
          durationSeconds,
      }
    );

  return response.data;

};


export const endSession = async (
  id,
  durationSeconds
) => {

  const response =
    await api.patch(
      `/sessions/${id}/end`,
      {
        duration_seconds:
          durationSeconds,
      }
    );

  return response.data;

};


export const startSessionGame = async (
  sessionId,
  gameId
) => {

  const response =
    await api.patch(
      `/sessions/${sessionId}/games/${gameId}/start`
    );

  return response.data;

};


export const completeSessionGame = async (
  sessionId,
  gameId,
  result
) => {

  const response =
    await api.patch(
      `/sessions/${sessionId}/games/${gameId}/complete`,
      result
    );

  return response.data;

};