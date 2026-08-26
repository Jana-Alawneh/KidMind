import api from "../services/api";


export const getGameBuilderGames =
  async () => {

    const response =
      await api.get(
        "/game-builder"
      );

    return Array.isArray(
      response.data
    )
      ? response.data
      : [];

  };


export const getGameBuilderGame =
  async (
    gameId
  ) => {

    const response =
      await api.get(
        `/game-builder/${gameId}`
      );

    return response.data;

  };


export const createGameBuilderGame =
  async (
    game
  ) => {

    const response =
      await api.post(
        "/game-builder",
        game
      );

    return response.data;

  };


export const updateGameBuilderGame =
  async (
    gameId,
    game
  ) => {

    const response =
      await api.put(
        `/game-builder/${gameId}`,
        game
      );

    return response.data;

  };


export const deleteGameBuilderGame =
  async (
    gameId
  ) => {

    const response =
      await api.delete(
        `/game-builder/${gameId}`
      );

    return response.data;

  };


export const getGameBuilderAssignmentOptions =
  async (
    gameId
  ) => {

    const response =
      await api.get(
        `/game-builder/${gameId}/assignment-options`
      );

    return response.data;

  };


export const getGameBuilderAssignments =
  async (
    gameId
  ) => {

    const response =
      await api.get(
        `/game-builder/${gameId}/assignments`
      );

    return Array.isArray(
      response.data
    )
      ? response.data
      : [];

  };


export const assignGameBuilderGame =
  async (
    gameId,
    assignment
  ) => {

    const response =
      await api.post(
        `/game-builder/${gameId}/assignments`,
        assignment
      );

    return response.data;

  };


export const removeGameBuilderAssignment =
  async (
    gameId,
    assignmentId
  ) => {

    const response =
      await api.delete(
        `/game-builder/${gameId}/assignments/${assignmentId}`
      );

    return response.data;

  };