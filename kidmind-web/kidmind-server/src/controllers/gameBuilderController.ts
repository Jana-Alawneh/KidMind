import type {
  Response,
} from "express";

import {
  createGameBuilderAssignment,
  createGameBuilderGame,
  deleteGameBuilderAssignment,
  deleteGameBuilderGame,
  getGameBuilderAssignments,
  getGameBuilderGameById,
  getGameBuilderGamesForTherapist,
  updateGameBuilderGame,
  type GameBuilderDifficulty,
  type GameBuilderStatus,
} from "../models/gameBuilderModel";

import {
  getChildForUser,
  getLinkedChildrenForUser,
  getUserById,
} from "../models/userModel";

import {
  getSessionForUser,
  getSessionsForUser,
} from "../models/sessionModel";

import type {
  AuthenticatedRequest,
} from "../middleware/authMiddleware";


const difficulties:
  GameBuilderDifficulty[] = [
    "Easy",
    "Medium",
    "Hard",
  ];


const statuses:
  GameBuilderStatus[] = [
    "draft",
    "published",
    "archived",
  ];


const parsePositiveId =
  (
    value: unknown
  ) => {

    const id =
      Number(value);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return null;
    }

    return id;

  };


const parsePositiveInteger =
  (
    value: unknown,
    fallback: number
  ) => {

    const number =
      Number(value);

    if (
      !Number.isInteger(number) ||
      number <= 0
    ) {
      return fallback;
    }

    return number;

  };


const parseBoolean =
  (
    value: unknown,
    fallback: boolean
  ) => {

    if (
      typeof value ===
      "boolean"
    ) {
      return value;
    }

    if (
      value === 1 ||
      value === "1" ||
      value === "true"
    ) {
      return true;
    }

    if (
      value === 0 ||
      value === "0" ||
      value === "false"
    ) {
      return false;
    }

    return fallback;

  };


const getAuthenticatedTherapist =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    if (!req.auth) {

      res.status(401).json({
        message:
          "Authentication required",
      });

      return null;

    }


    const user =
      await getUserById(
        req.auth.id
      );


    if (!user) {

      res.status(404).json({
        message:
          "User not found",
      });

      return null;

    }


    if (
      !user.is_active
    ) {

      res.status(403).json({
        message:
          "This account is inactive",
      });

      return null;

    }


    if (
      user.role !==
      "therapist"
    ) {

      res.status(403).json({
        message:
          "Only therapists can use Game Builder",
      });

      return null;

    }


    return user;

  };


const resolveChildForTherapist =
  async (
    therapistId: number,
    childId:
      | number
      | null
  ) => {

    if (!childId) {
      return null;
    }


    const child =
      await getChildForUser(
        therapistId,
        childId
      );


    return child ?? null;

  };


export const fetchGameBuilderGames =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const therapist =
        await getAuthenticatedTherapist(
          req,
          res
        );


      if (!therapist) {
        return;
      }


      const games =
        await getGameBuilderGamesForTherapist(
          therapist.id
        );


      return res.json(
        games
      );

    } catch (
      error
    ) {

      console.error(
        "Fetch Game Builder games error:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const fetchGameBuilderGame =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const therapist =
        await getAuthenticatedTherapist(
          req,
          res
        );


      if (!therapist) {
        return;
      }


      const gameId =
        parsePositiveId(
          req.params.gameId
        );


      if (!gameId) {

        return res.status(400).json({
          message:
            "Invalid game ID",
        });

      }


      const game =
        await getGameBuilderGameById(
          gameId,
          therapist.id
        );


      if (!game) {

        return res.status(404).json({
          message:
            "Game not found",
        });

      }


      return res.json(
        game
      );

    } catch (
      error
    ) {

      console.error(
        "Fetch Game Builder game error:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const createGameBuilderGameController =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const therapist =
        await getAuthenticatedTherapist(
          req,
          res
        );


      if (!therapist) {
        return;
      }


      const title =
        String(
          req.body?.title ||
          ""
        ).trim();


      const description =
        String(
          req.body?.description ||
          ""
        ).trim();


      const domain =
        String(
          req.body?.domain ||
          "Custom Cognitive Assessment"
        ).trim();


      const difficulty =
        String(
          req.body?.difficulty ||
          "Easy"
        ) as GameBuilderDifficulty;


      const status =
        String(
          req.body?.status ||
          "draft"
        ) as GameBuilderStatus;


      const objects =
        Array.isArray(
          req.body?.objects
        )
          ? req.body.objects
          : [];


      const rules =
        Array.isArray(
          req.body?.rules
        )
          ? req.body.rules
          : [];


      if (!title) {

        return res.status(400).json({
          message:
            "Game title is required",
        });

      }


      if (
        title.length > 180
      ) {

        return res.status(400).json({
          message:
            "Game title is too long",
        });

      }


      if (
        !difficulties.includes(
          difficulty
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid difficulty",
        });

      }


      if (
        !statuses.includes(
          status
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid game status",
        });

      }


      if (
        objects.length ===
        0
      ) {

        return res.status(400).json({
          message:
            "Add at least one object before saving",
        });

      }


      const rawAiChildId =
        req.body?.ai_child_id;


      const aiChildId =
        rawAiChildId ===
          undefined ||
        rawAiChildId ===
          null ||
        rawAiChildId ===
          ""
          ? null
          : parsePositiveId(
              rawAiChildId
            );


      if (
        rawAiChildId !==
          undefined &&
        rawAiChildId !==
          null &&
        rawAiChildId !==
          "" &&
        !aiChildId
      ) {

        return res.status(400).json({
          message:
            "Invalid AI child ID",
        });

      }


      const linkedChild =
        await resolveChildForTherapist(
          therapist.id,
          aiChildId
        );


      if (
        aiChildId &&
        !linkedChild
      ) {

        return res.status(403).json({
          message:
            "This child is not assigned to you",
        });

      }


      const game =
        await createGameBuilderGame({
          therapistId:
            therapist.id,
          title,
          description:
            description ||
            null,
          domain:
            domain ||
            "Custom Cognitive Assessment",
          difficulty,
          timeSeconds:
            parsePositiveInteger(
              req.body?.time_seconds,
              60
            ),
          lives:
            parsePositiveInteger(
              req.body?.lives,
              3
            ),
          scoreEnabled:
            parseBoolean(
              req.body?.score_enabled,
              true
            ),
          color:
            String(
              req.body?.color ||
              "#F1EDFF"
            ).trim() ||
            "#F1EDFF",
          iconName:
            String(
              req.body?.icon_name ||
              "Puzzle"
            ).trim() ||
            "Puzzle",
          objects,
          rules,
          isAiGenerated:
            parseBoolean(
              req.body?.is_ai_generated,
              false
            ),
          aiChildId,
          aiChildName:
            linkedChild
              ?.full_name ||
            null,
          aiTargetSkill:
            req.body
              ?.ai_target_skill ===
              undefined ||
            req.body
              ?.ai_target_skill ===
              null
              ? null
              : String(
                  req.body
                    .ai_target_skill
                ).trim() ||
                null,
          aiAnalysis:
            req.body
              ?.ai_analysis ===
              undefined ||
            req.body
              ?.ai_analysis ===
              null
              ? null
              : String(
                  req.body
                    .ai_analysis
                ).trim() ||
                null,
          status,
        });


      if (!game) {

        return res.status(500).json({
          message:
            "Failed to create game",
        });

      }


      return res.status(201).json({
        message:
          "Game saved successfully",
        game,
      });

    } catch (
      error
    ) {

      console.error(
        "Create Game Builder game error:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const updateGameBuilderGameController =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const therapist =
        await getAuthenticatedTherapist(
          req,
          res
        );


      if (!therapist) {
        return;
      }


      const gameId =
        parsePositiveId(
          req.params.gameId
        );


      if (!gameId) {

        return res.status(400).json({
          message:
            "Invalid game ID",
        });

      }


      const existingGame =
        await getGameBuilderGameById(
          gameId,
          therapist.id
        );


      if (!existingGame) {

        return res.status(404).json({
          message:
            "Game not found",
        });

      }


      if (
        req.body?.title !==
        undefined
      ) {

        const title =
          String(
            req.body.title
          ).trim();


        if (!title) {

          return res.status(400).json({
            message:
              "Game title is required",
          });

        }


        if (
          title.length > 180
        ) {

          return res.status(400).json({
            message:
              "Game title is too long",
          });

        }

      }


      if (
        req.body?.difficulty !==
        undefined &&
        !difficulties.includes(
          req.body
            .difficulty
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid difficulty",
        });

      }


      if (
        req.body?.status !==
        undefined &&
        !statuses.includes(
          req.body.status
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid game status",
        });

      }


      if (
        req.body?.objects !==
          undefined &&
        !Array.isArray(
          req.body.objects
        )
      ) {

        return res.status(400).json({
          message:
            "Objects must be an array",
        });

      }


      if (
        Array.isArray(
          req.body?.objects
        ) &&
        req.body.objects
          .length === 0
      ) {

        return res.status(400).json({
          message:
            "Add at least one object before saving",
        });

      }


      if (
        req.body?.rules !==
          undefined &&
        !Array.isArray(
          req.body.rules
        )
      ) {

        return res.status(400).json({
          message:
            "Rules must be an array",
        });

      }


      let aiChildId =
        existingGame
          .ai_child_id;


      if (
        req.body?.ai_child_id !==
        undefined
      ) {

        if (
          req.body.ai_child_id ===
            null ||
          req.body.ai_child_id ===
            ""
        ) {

          aiChildId =
            null;

        } else {

          const parsed =
            parsePositiveId(
              req.body
                .ai_child_id
            );


          if (!parsed) {

            return res.status(400).json({
              message:
                "Invalid AI child ID",
            });

          }


          aiChildId =
            parsed;

        }

      }


      const linkedChild =
        await resolveChildForTherapist(
          therapist.id,
          aiChildId
        );


      if (
        aiChildId &&
        !linkedChild
      ) {

        return res.status(403).json({
          message:
            "This child is not assigned to you",
        });

      }


      const updateInput:
        Parameters<
          typeof updateGameBuilderGame
        >[2] = {};


      if (
        req.body?.title !==
        undefined
      ) {
        updateInput.title =
          String(
            req.body.title
          ).trim();
      }


      if (
        req.body?.description !==
        undefined
      ) {
        updateInput.description =
          String(
            req.body.description ||
            ""
          ).trim() ||
          null;
      }


      if (
        req.body?.domain !==
        undefined
      ) {
        updateInput.domain =
          String(
            req.body.domain ||
            ""
          ).trim() ||
          "Custom Cognitive Assessment";
      }


      if (
        req.body?.difficulty !==
        undefined
      ) {
        updateInput.difficulty =
          req.body
            .difficulty;
      }


      if (
        req.body?.time_seconds !==
        undefined
      ) {

        const timeSeconds =
          parsePositiveInteger(
            req.body
              .time_seconds,
            0
          );


        if (
          timeSeconds <= 0
        ) {

          return res.status(400).json({
            message:
              "Time must be greater than zero",
          });

        }


        updateInput.timeSeconds =
          timeSeconds;

      }


      if (
        req.body?.lives !==
        undefined
      ) {

        const lives =
          parsePositiveInteger(
            req.body.lives,
            0
          );


        if (
          lives <= 0
        ) {

          return res.status(400).json({
            message:
              "Lives must be greater than zero",
          });

        }


        updateInput.lives =
          lives;

      }


      if (
        req.body?.score_enabled !==
        undefined
      ) {
        updateInput.scoreEnabled =
          parseBoolean(
            req.body
              .score_enabled,
            existingGame
              .score_enabled
          );
      }


      if (
        req.body?.color !==
        undefined
      ) {
        updateInput.color =
          String(
            req.body.color ||
            ""
          ).trim() ||
          "#F1EDFF";
      }


      if (
        req.body?.icon_name !==
        undefined
      ) {
        updateInput.iconName =
          String(
            req.body.icon_name ||
            ""
          ).trim() ||
          "Puzzle";
      }


      if (
        req.body?.objects !==
        undefined
      ) {
        updateInput.objects =
          req.body.objects;
      }


      if (
        req.body?.rules !==
        undefined
      ) {
        updateInput.rules =
          req.body.rules;
      }


      if (
        req.body?.is_ai_generated !==
        undefined
      ) {
        updateInput.isAiGenerated =
          parseBoolean(
            req.body
              .is_ai_generated,
            existingGame
              .is_ai_generated
          );
      }


      if (
        req.body?.ai_child_id !==
        undefined
      ) {
        updateInput.aiChildId =
          aiChildId;

        updateInput.aiChildName =
          linkedChild
            ?.full_name ||
          null;
      }


      if (
        req.body?.ai_target_skill !==
        undefined
      ) {
        updateInput.aiTargetSkill =
          req.body
            .ai_target_skill ===
            null
            ? null
            : String(
                req.body
                  .ai_target_skill ||
                ""
              ).trim() ||
              null;
      }


      if (
        req.body?.ai_analysis !==
        undefined
      ) {
        updateInput.aiAnalysis =
          req.body
            .ai_analysis ===
            null
            ? null
            : String(
                req.body
                  .ai_analysis ||
                ""
              ).trim() ||
              null;
      }


      if (
        req.body?.status !==
        undefined
      ) {
        updateInput.status =
          req.body.status;
      }


      const game =
        await updateGameBuilderGame(
          gameId,
          therapist.id,
          updateInput
        );


      if (!game) {

        return res.status(404).json({
          message:
            "Game not found",
        });

      }


      return res.json({
        message:
          "Game updated successfully",
        game,
      });

    } catch (
      error
    ) {

      console.error(
        "Update Game Builder game error:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const deleteGameBuilderGameController =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const therapist =
        await getAuthenticatedTherapist(
          req,
          res
        );


      if (!therapist) {
        return;
      }


      const gameId =
        parsePositiveId(
          req.params.gameId
        );


      if (!gameId) {

        return res.status(400).json({
          message:
            "Invalid game ID",
        });

      }


      const deleted =
        await deleteGameBuilderGame(
          gameId,
          therapist.id
        );


      if (!deleted) {

        return res.status(404).json({
          message:
            "Game not found",
        });

      }


      return res.json({
        message:
          "Game deleted successfully",
      });

    } catch (
      error
    ) {

      console.error(
        "Delete Game Builder game error:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };

const finishedSessionStatuses =
  new Set([
    "Completed",
    "Ended",
    "Cancelled",
  ]);


export const fetchGameBuilderAssignmentOptions =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const therapist =
        await getAuthenticatedTherapist(
          req,
          res
        );

      if (!therapist) {
        return;
      }


      const gameId =
        parsePositiveId(
          req.params.gameId
        );

      if (!gameId) {

        return res.status(400).json({
          message:
            "Invalid game ID",
        });

      }


      const game =
        await getGameBuilderGameById(
          gameId,
          therapist.id
        );

      if (!game) {

        return res.status(404).json({
          message:
            "Game not found",
        });

      }


      const [
        children,
        sessions,
      ] =
        await Promise.all([
          getLinkedChildrenForUser(
            therapist.id
          ),
          getSessionsForUser(
            therapist.id
          ),
        ]);


      const assignableSessions =
        sessions.filter(
          session =>
            !finishedSessionStatuses.has(
              String(
                session.status ||
                ""
              )
            )
        );


      return res.json({
        game: {
          id:
            game.id,
          title:
            game.title,
          difficulty:
            game.difficulty,
        },
        children:
          children.map(
            child => ({
              id:
                Number(
                  child.id
                ),
              full_name:
                child.full_name,
              age:
                child.age,
              gender:
                child.gender,
              region:
                child.region,
            })
          ),
        sessions:
          assignableSessions.map(
            session => ({
              id:
                Number(
                  session.id
                ),
              child_id:
                Number(
                  session.child_id
                ),
              child_name:
                session.child_name,
              status:
                session.status,
              started_at:
                session.started_at,
              scheduled_at:
                session.scheduled_at,
              created_at:
                session.created_at,
            })
          ),
      });

    } catch (error) {

      console.error(
        "Fetch Game Builder assignment options error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const fetchGameBuilderAssignmentsController =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const therapist =
        await getAuthenticatedTherapist(
          req,
          res
        );

      if (!therapist) {
        return;
      }


      const gameId =
        parsePositiveId(
          req.params.gameId
        );

      if (!gameId) {

        return res.status(400).json({
          message:
            "Invalid game ID",
        });

      }


      const game =
        await getGameBuilderGameById(
          gameId,
          therapist.id
        );

      if (!game) {

        return res.status(404).json({
          message:
            "Game not found",
        });

      }


      const assignments =
        await getGameBuilderAssignments(
          gameId,
          therapist.id
        );


      return res.json(
        assignments
      );

    } catch (error) {

      console.error(
        "Fetch Game Builder assignments error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const assignGameBuilderGameController =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const therapist =
        await getAuthenticatedTherapist(
          req,
          res
        );

      if (!therapist) {
        return;
      }


      const gameId =
        parsePositiveId(
          req.params.gameId
        );

      if (!gameId) {

        return res.status(400).json({
          message:
            "Invalid game ID",
        });

      }


      const game =
        await getGameBuilderGameById(
          gameId,
          therapist.id
        );

      if (!game) {

        return res.status(404).json({
          message:
            "Game not found",
        });

      }


      const assignmentType =
        String(
          req.body?.assignment_type ||
          ""
        )
          .trim()
          .toLowerCase();


      if (
        assignmentType !==
          "child" &&
        assignmentType !==
          "session"
      ) {

        return res.status(400).json({
          message:
            "assignment_type must be child or session",
        });

      }


      const childId =
        parsePositiveId(
          req.body?.child_id
        );

      if (!childId) {

        return res.status(400).json({
          message:
            "Valid child ID is required",
        });

      }


      const child =
        await getChildForUser(
          therapist.id,
          childId
        );

      if (!child) {

        return res.status(403).json({
          message:
            "This child is not assigned to you",
        });

      }


      let sessionId:
        | number
        | null =
          null;


      if (
        assignmentType ===
        "session"
      ) {

        sessionId =
          parsePositiveId(
            req.body?.session_id
          );

        if (!sessionId) {

          return res.status(400).json({
            message:
              "Valid session ID is required",
          });

        }


        const session =
          await getSessionForUser(
            therapist.id,
            sessionId
          );

        if (!session) {

          return res.status(403).json({
            message:
              "This session is not assigned to you",
          });

        }


        if (
          Number(
            session.child_id
          ) !==
          childId
        ) {

          return res.status(400).json({
            message:
              "The selected session does not belong to the selected child",
          });

        }


        if (
          finishedSessionStatuses.has(
            String(
              session.status ||
              ""
            )
          )
        ) {

          return res.status(409).json({
            message:
              "Finished sessions cannot receive new games",
          });

        }

      }


      const assignment =
        await createGameBuilderAssignment({
          gameId,
          therapistId:
            therapist.id,
          assignmentType,
          childId,
          sessionId,
          gameTitle:
            game.title,
          difficulty:
            game.difficulty,
        });


      if (!assignment) {

        return res.status(500).json({
          message:
            "Failed to assign game",
        });

      }


      return res.status(201).json({
        message:
          assignmentType ===
            "session"
            ? "Game assigned to session successfully"
            : "Game assigned to child successfully",
        assignment,
      });

    } catch (error) {

      console.error(
        "Assign Game Builder game error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const removeGameBuilderAssignmentController =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const therapist =
        await getAuthenticatedTherapist(
          req,
          res
        );

      if (!therapist) {
        return;
      }


      const gameId =
        parsePositiveId(
          req.params.gameId
        );

      const assignmentId =
        parsePositiveId(
          req.params.assignmentId
        );


      if (
        !gameId ||
        !assignmentId
      ) {

        return res.status(400).json({
          message:
            "Invalid game or assignment ID",
        });

      }


      const game =
        await getGameBuilderGameById(
          gameId,
          therapist.id
        );

      if (!game) {

        return res.status(404).json({
          message:
            "Game not found",
        });

      }


      const deleted =
        await deleteGameBuilderAssignment(
          assignmentId,
          gameId,
          therapist.id
        );


      if (!deleted) {

        return res.status(404).json({
          message:
            "Assignment not found",
        });

      }


      return res.json({
        message:
          "Game assignment removed successfully",
      });

    } catch (error) {

      console.error(
        "Remove Game Builder assignment error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };

