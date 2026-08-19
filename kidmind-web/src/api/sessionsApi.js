const API_URL =
  "http://localhost:5000";


const handleResponse = async (
  response
) => {

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
      "Request failed"
    );
  }

  return data;

};


export const createSession = async (
  sessionData
) => {

  const response = await fetch(
    `${API_URL}/sessions`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        sessionData
      ),
    }
  );

  return handleResponse(response);

};


export const getSessionById = async (
  id
) => {

  const response = await fetch(
    `${API_URL}/sessions/${id}`
  );

  return handleResponse(response);

};


export const pauseSession = async (
  id,
  durationSeconds
) => {

  const response = await fetch(
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

  return handleResponse(response);

};


export const resumeSession = async (
  id,
  durationSeconds
) => {

  const response = await fetch(
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

  return handleResponse(response);

};


export const endSession = async (
  id,
  durationSeconds
) => {

  const response = await fetch(
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

  return handleResponse(response);

};


export const startSessionGame = async (
  sessionId,
  gameId
) => {

  const response = await fetch(
    `${API_URL}/sessions/${sessionId}/games/${gameId}/start`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );

  return handleResponse(response);

};


export const completeSessionGame = async (
  sessionId,
  gameId,
  result
) => {

  const response = await fetch(
    `${API_URL}/sessions/${sessionId}/games/${gameId}/complete`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(result),
    }
  );

  return handleResponse(response);

};