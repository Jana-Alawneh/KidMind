import type {
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
  getSessionForUser,
  getSessionGameById,
  getSessionGames,
  getSessionGamesSummary,
  getSessionsForUser,
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

import {
  getChildForUser,
  getUserById,
  getUsersForChild,
} from "../models/userModel";

import {
  createNotification,
} from "../models/notificationModel";

import type {
  AuthenticatedRequest,
} from "../middleware/authMiddleware";


const getSessionDetails = async (
  sessionId: number
) => {

  const session =
    await getSessionById(
      sessionId
    );

  if (!session) {
    return null;
  }

  const games =
    await getSessionGames(
      sessionId
    );

  return {
    ...session,
    games,
  };

};


const getUserSessionDetails =
  async (
    userId: number,
    sessionId: number
  ) => {

    const session =
      await getSessionForUser(
        userId,
        sessionId
      );


    if (!session) {

      return null;

    }


    const games =
      await getSessionGames(
        sessionId
      );


    return {
      ...session,
      games,
    };

  };


const getAccessibleSession =
  async (
    req: AuthenticatedRequest,
    sessionId: number
  ) => {

    if (!req.auth) {
      return null;
    }

    if (
      req.auth.role ===
      "admin"
    ) {

      return getSessionById(
        sessionId
      );

    }

    if (
      req.auth.role ===
      "therapist"
    ) {

      return getSessionForUser(
        req.auth.id,
        sessionId
      );

    }

    return null;

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


const createSessionCompletedNotifications =
  async ({
    actorUserId,
    childId,
    sessionId,
    score,
  }: {
    actorUserId: number;
    childId: number;
    sessionId: number;
    score: number;
  }) => {

    try {

      const [
        child,
        childUsers,
      ] =
        await Promise.all([
          getChildById(
            childId
          ),
          getUsersForChild(
            childId
          ),
        ]);


      if (!child) {
        return;
      }


      const recipients =
        childUsers.filter(
          user =>
            Boolean(
              user.is_active
            ) &&
            (
              user.role ===
                "parent" ||
              user.role ===
                "therapist"
            )
        );


      for (
        const recipient of
          recipients
      ) {

        await createNotification({
          userId:
            Number(
              recipient.id
            ),

          type:
            "session_completed",

          title:
            "Session Completed",

          body:
            `${child.full_name} completed Session #${sessionId} with a score of ${score}%.`,

          actorUserId,

          childId,

          entityType:
            "session",

          entityId:
            sessionId,

          actionPath:
            recipient.role ===
              "parent"
              ? "/parent"
              : `/sessions/${sessionId}`,
        });

      }

    } catch (
      notificationError
    ) {

      console.error(
        "Failed to create session completed notifications:",
        notificationError
      );

    }

  };


export const fetchAllSessions = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    let sessionRows;


    if (
      req.auth.role ===
      "admin"
    ) {

      sessionRows =
        await getAllSessions();

    } else if (
      req.auth.role ===
      "therapist"
    ) {

      sessionRows =
        await getSessionsForUser(
          req.auth.id
        );

    } else {

      return res.status(403).json({
        message:
          "Access denied",
      });

    }


    const sessions =
      await Promise.all(
        sessionRows.map(
          async (session) => {

            const games =
              await getSessionGames(
                Number(
                  session.id
                )
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
      message:
        "Server Error",
    });

  }

};


export const fetchParentSessions =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      if (!req.auth) {

        return res.status(401).json({
          message:
            "Authentication required",
        });

      }


      if (
        req.auth.role !==
        "parent"
      ) {

        return res.status(403).json({
          message:
            "Parent access required",
        });

      }


      const parent =
        await getUserById(
          req.auth.id
        );


      if (!parent) {

        return res.status(404).json({
          message:
            "Parent account not found",
        });

      }


      if (
        Number(
          parent.is_active
        ) !== 1
      ) {

        return res.status(403).json({
          message:
            "This account is inactive",
        });

      }


      const sessionRows =
        await getSessionsForUser(
          req.auth.id
        );


      const sessions =
        await Promise.all(
          sessionRows.map(
            async (session) => {

              const games =
                await getSessionGames(
                  Number(
                    session.id
                  )
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
        "Failed to load parent sessions:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const fetchParentSessionById =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      if (!req.auth) {

        return res.status(401).json({
          message:
            "Authentication required",
        });

      }


      if (
        req.auth.role !==
        "parent"
      ) {

        return res.status(403).json({
          message:
            "Parent access required",
        });

      }


      const sessionId =
        Number(
          req.params.sessionId
        );


      if (
        !Number.isInteger(
          sessionId
        ) ||
        sessionId <= 0
      ) {

        return res.status(400).json({
          message:
            "Invalid session ID",
        });

      }


      const parent =
        await getUserById(
          req.auth.id
        );


      if (!parent) {

        return res.status(404).json({
          message:
            "Parent account not found",
        });

      }


      if (
        Number(
          parent.is_active
        ) !== 1
      ) {

        return res.status(403).json({
          message:
            "This account is inactive",
        });

      }


      const session =
        await getUserSessionDetails(
          req.auth.id,
          sessionId
        );


      if (!session) {

        return res.status(404).json({
          message:
            "Session not found or not linked to this parent",
        });

      }


      return res.json(
        session
      );

    } catch (error) {

      console.error(
        "Failed to load parent session:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const createSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    const childId =
      Number(
        req.body.child_id
      );


    if (
      !Number.isInteger(
        childId
      ) ||
      childId <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid child ID",
      });

    }


    let child;


    if (
      req.auth.role ===
      "admin"
    ) {

      child =
        await getChildById(
          childId
        );

    } else if (
      req.auth.role ===
      "therapist"
    ) {

      child =
        await getChildForUser(
          req.auth.id,
          childId
        );

    } else {

      return res.status(403).json({
        message:
          "Access denied",
      });

    }


    if (!child) {

      return res.status(404).json({
        message:
          req.auth.role ===
            "admin"
            ? "Child not found"
            : "Child not found or not linked to this therapist",
      });

    }


    const rawGames =
      Array.isArray(
        req.body.games
      ) &&
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


    const games:
      SessionGameInput[] =
        rawGames.map(
          (
            game: {
              game_name?: unknown;
              difficulty?: unknown;
              custom_game_id?: unknown;
            }
          ) => {

            const parsedCustomGameId =
              Number(
                game.custom_game_id
              );


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

              custom_game_id:
                Number.isInteger(
                  parsedCustomGameId
                ) &&
                parsedCustomGameId > 0
                  ? parsedCustomGameId
                  : null,

            };

          }
        );


    const invalidGame =
      games.some(
        game =>
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
      message:
        "Server Error",
    });

  }

};


export const fetchSessionById = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    const id =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session ID",
      });

    }


    const sessionRow =
      await getAccessibleSession(
        req,
        id
      );


    if (!sessionRow) {

      return res.status(404).json({
        message:
          req.auth.role ===
            "therapist"
            ? "Session not found or not linked to this therapist"
            : "Session not found",
      });

    }


    const games =
      await getSessionGames(
        id
      );


    return res.json({
      ...sessionRow,
      games,
    });

  } catch (error) {

    console.error(
      "Failed to load session:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const pauseSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    const id =
      Number(
        req.params.id
      );


    const durationSeconds =
      Number(
        req.body.duration_seconds
      );


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session ID",
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
      await getAccessibleSession(
        req,
        id
      );


    if (!currentSession) {

      return res.status(404).json({
        message:
          req.auth.role ===
            "therapist"
            ? "Session not found or not linked to this therapist"
            : "Session not found",
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
      await getSessionDetails(
        id
      );


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
      message:
        "Server Error",
    });

  }

};


export const resumeSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    const id =
      Number(
        req.params.id
      );


    const durationSeconds =
      Number(
        req.body.duration_seconds
      );


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session ID",
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
      await getAccessibleSession(
        req,
        id
      );


    if (!currentSession) {

      return res.status(404).json({
        message:
          req.auth.role ===
            "therapist"
            ? "Session not found or not linked to this therapist"
            : "Session not found",
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
      await getSessionDetails(
        id
      );


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
      message:
        "Server Error",
    });

  }

};


export const completeSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    const id =
      Number(
        req.params.id
      );


    const durationSeconds =
      Number(
        req.body.duration_seconds
      );


    const score =
      Number(
        req.body.score
      );


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session ID",
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
      !Number.isInteger(
        score
      ) ||
      score < 0 ||
      score > 100
    ) {

      return res.status(400).json({
        message:
          "Score must be between 0 and 100",
      });

    }


    const currentSession =
      await getAccessibleSession(
        req,
        id
      );


    if (!currentSession) {

      return res.status(404).json({
        message:
          req.auth.role ===
            "therapist"
            ? "Session not found or not linked to this therapist"
            : "Session not found",
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
      await getSessionDetails(
        id
      );


    await createSessionCompletedNotifications({
      actorUserId:
        req.auth.id,

      childId:
        Number(
          (currentSession as any).child_id
        ),

      sessionId:
        id,

      score:
        score,
    });


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
      message:
        "Server Error",
    });

  }

};


export const endSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    const id =
      Number(
        req.params.id
      );


    const durationSeconds =
      Number(
        req.body.duration_seconds
      );


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session ID",
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
      await getAccessibleSession(
        req,
        id
      );


    if (!currentSession) {

      return res.status(404).json({
        message:
          req.auth.role ===
            "therapist"
            ? "Session not found or not linked to this therapist"
            : "Session not found",
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
      await getSessionDetails(
        id
      );


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
      message:
        "Server Error",
    });

  }

};


export const cancelSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    const id =
      Number(
        req.params.id
      );


    const durationSeconds =
      Number(
        req.body.duration_seconds
      );


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session ID",
      });

    }


    const currentSession =
      await getAccessibleSession(
        req,
        id
      );


    if (!currentSession) {

      return res.status(404).json({
        message:
          req.auth.role ===
            "therapist"
            ? "Session not found or not linked to this therapist"
            : "Session not found",
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
      await getSessionDetails(
        id
      );


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
      message:
        "Server Error",
    });

  }

};


export const startSessionGame = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


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
      !Number.isInteger(
        gameId
      ) ||
      gameId <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid session or game ID",
      });

    }


    const session =
      await getAccessibleSession(
        req,
        sessionId
      );


    if (!session) {

      return res.status(404).json({
        message:
          req.auth.role ===
            "therapist"
            ? "Session not found or not linked to this therapist"
            : "Session not found",
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
      game.status !==
      "Pending"
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


    if (
      affectedRows === 0
    ) {

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

      session:
        updatedSession,
    });

  } catch (error) {

    console.error(
      "Failed to start game:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const completeSessionGame = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


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
      Number(
        req.body.score
      );


    if (
      !Number.isInteger(
        sessionId
      ) ||
      sessionId <= 0 ||
      !Number.isInteger(
        gameId
      ) ||
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
      !Number.isInteger(
        score
      ) ||
      score < 0 ||
      score > 100
    ) {

      return res.status(400).json({
        message:
          "Score must be between 0 and 100",
      });

    }


    const session =
      await getAccessibleSession(
        req,
        sessionId
      );


    if (!session) {

      return res.status(404).json({
        message:
          req.auth.role ===
            "therapist"
            ? "Session not found or not linked to this therapist"
            : "Session not found",
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
      game.status !==
        "Paused"
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
      req.body.accuracy ===
        null
        ? null
        : Number(
            req.body.accuracy
          );


    const mistakes =
      req.body.mistakes ===
        undefined ||
      req.body.mistakes ===
        null
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
      Number.isFinite(
        accuracy
      )
        ? accuracy
        : null;


    const safeMistakes =
      mistakes !== null &&
      Number.isFinite(
        mistakes
      )
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


    let finalSessionScore:
      number | null =
        null;


    if (
      remainingGames ===
      0
    ) {

      const averageScore =
        Math.round(
          Number(
            summary?.average_score
          ) || 0
        );


      finalSessionScore =
        averageScore;


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


      allGamesCompleted =
        true;

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


    if (
      allGamesCompleted
    ) {

      await createSessionCompletedNotifications({
        actorUserId:
          req.auth.id,

        childId:
          Number(
            (session as any).child_id
          ),

        sessionId,

        score:
          finalSessionScore ??
          score,
      });

    }


    return res.json({
      message:
        gameStatus ===
        "Completed"
          ? "Game completed successfully"
          : "Game finished without successful completion",

      game_status:
        gameStatus,

      all_games_completed:
        allGamesCompleted,

      next_game:
        nextGame,

      session:
        updatedSession,
    });

  } catch (error) {

    console.error(
      "Failed to complete game:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};
