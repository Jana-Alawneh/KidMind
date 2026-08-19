import type {
  Request,
  Response,
} from "express";

import {
  addSession,
  addSessionGames,
  cancelSessionById,
  completeSessionById,
  completeSessionGameById,
  endSessionById,
  endUnfinishedGamesBySessionId,
  getAllSessions,
  getNextPendingGame,
  getSessionById,
  getSessionGameById,
  getSessionGames,
  getSessionGamesSummary,
  pauseActiveGameBySessionId,
  pauseSessionById,
  resumePausedGameBySessionId,
  resumeSessionById,
  startSessionGameById,
} from "../models/sessionModel";

import type {
  SessionGameInput,
} from "../models/sessionModel";

import {
  getChildById,
} from "../models/childModel";


const getSessionDetails = async (
  sessionId: number
) => {

  const session =
    await getSessionById(sessionId);

  if (!session) {
    return null;
  }

  const games =
    await getSessionGames(sessionId);

  return {
    ...session,
    games,
  };

};


const isFinishedStatus = (
  status: string
) => {

  return [
    "Completed",
    "Ended",
    "Cancelled",
  ].includes(status);

};


const isFinishedGameStatus = (
  status: string
) => {

  return [
    "Completed",
    "Failed",
    "Ended",
  ].includes(status);

};


export const fetchAllSessions = async (
  _req: Request,
  res: Response
) => {

  try {

    const sessionRows =
      await getAllSessions();

    const sessions =
      await Promise.all(
        sessionRows.map(
          async (session) => {

            const games =
              await getSessionGames(
                Number(session.id)
              );

            return {
              ...session,
              games,
            };

          }
        )
      );

    return res.json({
      sessions,
    });

  } catch (error) {

    console.error(
      "Failed to load sessions:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });

  }

};


export const createSession = async (
  req: Request,
  res: Response
) => {

  try {

    const childId =
      Number(req.body.child_id);


    if (
      !Number.isInteger(childId) ||
      childId <= 0
    ) {

      return res.status(400).json({
        message: "Invalid child ID",
      });

    }


    const child =
      await getChildById(childId);


    if (!child) {

      return res.status(404).json({
        message: "Child not found",
      });

    }


    const rawGames =
      Array.isArray(req.body.games) &&
      req.body.games.length > 0
        ? req.body.games
        : [
            {
              game_name:
                req.body.game_name,

              difficulty:
                req.body.difficulty,
            },
          ];


    const games: SessionGameInput[] =
      rawGames.map(
        (
          game: {
            game_name?: unknown;
            difficulty?: unknown;
          }
        ) => {

          return {

            game_name:
              typeof game.game_name ===
              "string"
                ? game.game_name.trim()
                : "",

            difficulty:
              typeof game.difficulty ===
                "string" &&
              game.difficulty.trim()
                ? game.difficulty.trim()
                : null,

          };

        }
      );


    const invalidGame =
      games.some(
        (game) =>
          !game.game_name
      );


    if (
      games.length === 0 ||
      invalidGame
    ) {

      return res.status(400).json({
        message:
          "Please provide at least one valid game",
      });

    }


    const sessionId =
      await addSession(
        childId,
        games
      );


    await addSessionGames(
      sessionId,
      games
    );


    const session =
      await getSessionDetails(
        sessionId
      );


    return res.status(201).json({
      message:
        "Session created successfully",

      session,
    });

  } catch (error) {

    console.error(
      "Failed to create session:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });

  }

};


export const fetchSessionById = async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      Number(req.params.id);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message: "Invalid session ID",
      });

    }


    const session =
      await getSessionDetails(id);


    if (!session) {

      return res.status(404).json({
        message: "Session not found",
      });

    }


    return res.json(session);

  } catch (error) {

    console.error(
      "Failed to load session:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });

  }

};


export const pauseSession = async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      Number(req.params.id);

    const durationSeconds =
      Number(
        req.body.duration_seconds
      );


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message: "Invalid session ID",
      });

    }


    if (
      !Number.isInteger(
        durationSeconds
      ) ||
      durationSeconds < 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session duration",
      });

    }


    const currentSession =
      await getSessionById(id);


    if (!currentSession) {

      return res.status(404).json({
        message: "Session not found",
      });

    }


    if (
      isFinishedStatus(
        currentSession.status
      )
    ) {

      return res.status(409).json({
        message:
          "Finished session cannot be paused",
      });

    }


    await pauseSessionById(
      id,
      durationSeconds
    );


    await pauseActiveGameBySessionId(
      id
    );


    const session =
      await getSessionDetails(id);


    return res.json({
      message:
        "Session paused successfully",

      session,
    });

  } catch (error) {

    console.error(
      "Failed to pause session:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });

  }

};


export const resumeSession = async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      Number(req.params.id);

    const durationSeconds =
      Number(
        req.body.duration_seconds
      );


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message: "Invalid session ID",
      });

    }


    if (
      !Number.isInteger(
        durationSeconds
      ) ||
      durationSeconds < 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session duration",
      });

    }


    const currentSession =
      await getSessionById(id);


    if (!currentSession) {

      return res.status(404).json({
        message: "Session not found",
      });

    }


    if (
      isFinishedStatus(
        currentSession.status
      )
    ) {

      return res.status(409).json({
        message:
          "Finished session cannot be resumed",
      });

    }


    await resumeSessionById(
      id,
      durationSeconds
    );


    await resumePausedGameBySessionId(
      id
    );


    const session =
      await getSessionDetails(id);


    return res.json({
      message:
        "Session resumed successfully",

      session,
    });

  } catch (error) {

    console.error(
      "Failed to resume session:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });

  }

};


export const completeSession = async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      Number(req.params.id);

    const durationSeconds =
      Number(
        req.body.duration_seconds
      );

    const score =
      Number(req.body.score);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message: "Invalid session ID",
      });

    }


    if (
      !Number.isInteger(
        durationSeconds
      ) ||
      durationSeconds < 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session duration",
      });

    }


    if (
      !Number.isInteger(score) ||
      score < 0 ||
      score > 100
    ) {

      return res.status(400).json({
        message:
          "Score must be between 0 and 100",
      });

    }


    const currentSession =
      await getSessionById(id);


    if (!currentSession) {

      return res.status(404).json({
        message: "Session not found",
      });

    }


    if (
      isFinishedStatus(
        currentSession.status
      )
    ) {

      return res.status(409).json({
        message:
          "Session has already finished",
      });

    }


    await completeSessionById(
      id,
      durationSeconds,
      score
    );


    const session =
      await getSessionDetails(id);


    return res.json({
      message:
        "Session completed successfully",

      session,
    });

  } catch (error) {

    console.error(
      "Failed to complete session:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });

  }

};


export const endSession = async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      Number(req.params.id);

    const durationSeconds =
      Number(
        req.body.duration_seconds
      );


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message: "Invalid session ID",
      });

    }


    if (
      !Number.isInteger(
        durationSeconds
      ) ||
      durationSeconds < 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session duration",
      });

    }


    const currentSession =
      await getSessionById(id);


    if (!currentSession) {

      return res.status(404).json({
        message: "Session not found",
      });

    }


    if (
      currentSession.status ===
      "Completed"
    ) {

      return res.status(409).json({
        message:
          "Completed session cannot be ended",
      });

    }


    if (
      currentSession.status ===
        "Ended" ||
      currentSession.status ===
        "Cancelled"
    ) {

      return res.status(409).json({
        message:
          "Session has already finished",
      });

    }


    await endSessionById(
      id,
      durationSeconds
    );


    await endUnfinishedGamesBySessionId(
      id
    );


    const session =
      await getSessionDetails(id);


    return res.json({
      message:
        "Session ended successfully",

      session,
    });

  } catch (error) {

    console.error(
      "Failed to end session:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });

  }

};


export const cancelSession = async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      Number(req.params.id);

    const durationSeconds =
      Number(
        req.body.duration_seconds
      );


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message: "Invalid session ID",
      });

    }


    const currentSession =
      await getSessionById(id);


    if (!currentSession) {

      return res.status(404).json({
        message: "Session not found",
      });

    }


    if (
      isFinishedStatus(
        currentSession.status
      )
    ) {

      return res.status(409).json({
        message:
          "Session has already finished",
      });

    }


    await cancelSessionById(
      id,
      Number.isInteger(
        durationSeconds
      ) &&
      durationSeconds >= 0
        ? durationSeconds
        : 0
    );


    const session =
      await getSessionDetails(id);


    return res.json({
      message:
        "Session cancelled successfully",

      session,
    });

  } catch (error) {

    console.error(
      "Failed to cancel session:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });

  }

};


export const startSessionGame = async (
  req: Request,
  res: Response
) => {

  try {

    const sessionId =
      Number(
        req.params.sessionId
      );

    const gameId =
      Number(
        req.params.gameId
      );


    if (
      !Number.isInteger(
        sessionId
      ) ||
      sessionId <= 0 ||
      !Number.isInteger(gameId) ||
      gameId <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session or game ID",
      });

    }


    const session =
      await getSessionById(
        sessionId
      );

    const game =
      await getSessionGameById(
        sessionId,
        gameId
      );


    if (!session || !game) {

      return res.status(404).json({
        message:
          "Session game not found",
      });

    }


    if (
      isFinishedStatus(
        session.status
      )
    ) {

      return res.status(409).json({
        message:
          "Finished session cannot start another game",
      });

    }


    if (
      game.status !== "Pending"
    ) {

      return res.status(409).json({
        message:
          "Only a pending game can be started",
      });

    }


    const affectedRows =
      await startSessionGameById(
        sessionId,
        gameId
      );


    if (affectedRows === 0) {

      return res.status(409).json({
        message:
          "This game cannot be started",
      });

    }


    const updatedSession =
      await getSessionDetails(
        sessionId
      );


    return res.json({
      message:
        "Game started successfully",

      session: updatedSession,
    });

  } catch (error) {

    console.error(
      "Failed to start game:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });

  }

};


export const completeSessionGame = async (
  req: Request,
  res: Response
) => {

  try {

    const sessionId =
      Number(
        req.params.sessionId
      );

    const gameId =
      Number(
        req.params.gameId
      );

    const durationSeconds =
      Number(
        req.body.duration_seconds
      );

    const sessionDurationSeconds =
      Number(
        req.body
          .session_duration_seconds
      );

    const score =
      Number(req.body.score);


    if (
      !Number.isInteger(
        sessionId
      ) ||
      sessionId <= 0 ||
      !Number.isInteger(gameId) ||
      gameId <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session or game ID",
      });

    }


    if (
      !Number.isInteger(
        durationSeconds
      ) ||
      durationSeconds < 0
    ) {

      return res.status(400).json({
        message:
          "Invalid game duration",
      });

    }


    if (
      !Number.isInteger(score) ||
      score < 0 ||
      score > 100
    ) {

      return res.status(400).json({
        message:
          "Score must be between 0 and 100",
      });

    }


    const session =
      await getSessionById(
        sessionId
      );


    if (!session) {

      return res.status(404).json({
        message:
          "Session not found",
      });

    }


    if (
      isFinishedStatus(
        session.status
      )
    ) {

      return res.status(409).json({
        message:
          "Finished session cannot complete a game",
      });

    }


    const game =
      await getSessionGameById(
        sessionId,
        gameId
      );


    if (!game) {

      return res.status(404).json({
        message:
          "Session game not found",
      });

    }


    if (
      isFinishedGameStatus(
        game.status
      )
    ) {

      return res.status(409).json({
        message:
          "This game has already finished",
      });

    }


    if (
      game.status !==
        "In Progress" &&
      game.status !== "Paused"
    ) {

      return res.status(409).json({
        message:
          "This game has not started yet",
      });

    }


    const gameStatus:
      "Completed" | "Failed" =
        req.body.status ===
        "Failed"
          ? "Failed"
          : "Completed";


    const accuracy =
      req.body.accuracy ===
        undefined ||
      req.body.accuracy === null
        ? null
        : Number(
            req.body.accuracy
          );


    const mistakes =
      req.body.mistakes ===
        undefined ||
      req.body.mistakes === null
        ? null
        : Number(
            req.body.mistakes
          );


    const reactionTime =
      req.body.reaction_time ===
        undefined ||
      req.body.reaction_time ===
        null
        ? null
        : Number(
            req.body.reaction_time
          );


    const safeAccuracy =
      accuracy !== null &&
      Number.isFinite(accuracy)
        ? accuracy
        : null;


    const safeMistakes =
      mistakes !== null &&
      Number.isFinite(mistakes)
        ? mistakes
        : null;


    const safeReactionTime =
      reactionTime !== null &&
      Number.isFinite(
        reactionTime
      )
        ? reactionTime
        : null;


    await completeSessionGameById(
      sessionId,
      gameId,
      gameStatus,
      durationSeconds,
      score,
      safeAccuracy,
      safeMistakes,
      safeReactionTime,
      req.body.result_data
    );


    const summary =
      await getSessionGamesSummary(
        sessionId
      );


    const remainingGames =
      Number(
        summary?.remaining_games
      ) || 0;


    let allGamesCompleted =
      false;


    if (remainingGames === 0) {

      const averageScore =
        Math.round(
          Number(
            summary?.average_score
          ) || 0
        );


      const totalGameDuration =
        Number(
          summary
            ?.total_game_duration
        ) || 0;


      const finalDuration =
        Number.isInteger(
          sessionDurationSeconds
        ) &&
        sessionDurationSeconds >= 0
          ? sessionDurationSeconds
          : totalGameDuration;


      await completeSessionById(
        sessionId,
        finalDuration,
        averageScore
      );


      allGamesCompleted = true;

    }


    const nextGame =
      allGamesCompleted
        ? null
        : await getNextPendingGame(
            sessionId
          );


    const updatedSession =
      await getSessionDetails(
        sessionId
      );


    return res.json({
      message:
        gameStatus === "Completed"
          ? "Game completed successfully"
          : "Game finished without successful completion",

      game_status: gameStatus,

      all_games_completed:
        allGamesCompleted,

      next_game: nextGame,

      session: updatedSession,
    });

  } catch (error) {

    console.error(
      "Failed to complete game:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });

  }

};