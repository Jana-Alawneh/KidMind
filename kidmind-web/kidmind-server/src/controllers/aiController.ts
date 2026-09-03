import type {
  Response,
} from "express";

import type {
  RowDataPacket,
} from "mysql2/promise";

import db from "../database/db";

import {
  generatePersonalizedGame,
  GeminiApiError,
  type ChildAssessment,
  type ChildAssessmentGame,
  type ChildAssessmentReport,
} from "../services/aiService";

import {
  getChildForUser,
  getUserById,
} from "../models/userModel";

import type {
  AuthenticatedRequest,
} from "../middleware/authMiddleware";


interface LatestSessionRow
  extends RowDataPacket {
  id: number;
  child_id: number;
  status: string;
  duration_seconds: number | null;
  score: number | string | null;
  started_at: string | Date | null;
  ended_at: string | Date | null;
  created_at: string | Date | null;
}


interface LatestSessionGameRow
  extends RowDataPacket {
  id: number;
  game_name: string;
  difficulty: string | null;
  status: string;
  duration_seconds: number | null;
  score: number | string | null;
  accuracy: number | string | null;
  mistakes: number | string | null;
  reaction_time: number | string | null;
  result_data:
    | string
    | Record<string, unknown>
    | null;
}


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


const nullableNumber =
  (
    value: unknown
  ): number | null => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }


    const number =
      Number(value);


    return Number.isFinite(
      number
    )
      ? number
      : null;

  };


const averageNumbers =
  (
    values:
      Array<
        number | null
      >
  ) => {

    const available =
      values.filter(
        (
          value
        ): value is number =>
          value !== null &&
          Number.isFinite(
            value
          )
      );


    if (
      available.length ===
      0
    ) {
      return null;
    }


    return Number(
      (
        available.reduce(
          (
            total,
            value
          ) =>
            total +
            value,
          0
        ) /
        available.length
      ).toFixed(
        2
      )
    );

  };


const normalizeDate =
  (
    value:
      | string
      | Date
      | null
  ) => {

    if (!value) {
      return null;
    }


    if (
      value instanceof Date
    ) {
      return value.toISOString();
    }


    return String(
      value
    );

  };


const summarizeResultData =
  (
    value:
      | string
      | Record<
          string,
          unknown
        >
      | null
  ) => {

    if (!value) {
      return null;
    }


    let parsed:
      Record<
        string,
        unknown
      >;


    try {

      parsed =
        typeof value ===
          "string"
          ? JSON.parse(
              value
            )
          : value;

    } catch {

      return null;

    }


    if (
      !parsed ||
      typeof parsed !==
        "object"
    ) {
      return null;
    }


    const allowedKeys = [
      "totalResponses",
      "correct",
      "incorrect",
      "neutral",
      "classifiedResponses",
      "accuracy",
      "errorRate",
      "score",
      "elapsedSeconds",
      "meanResponseTimeMs",
      "medianResponseTimeMs",
      "responseTimeStdDevMs",
      "configured_time",
      "final_time_left",
    ];


    const summary:
      Record<
        string,
        unknown
      > = {};


    for (
      const key of
        allowedKeys
    ) {

      if (
        parsed[key] !==
          undefined
      ) {
        summary[key] =
          parsed[key];
      }

    }


    if (
      Array.isArray(
        parsed.trials
      )
    ) {

      const trials =
        parsed.trials as
          Array<
            Record<
              string,
              unknown
            >
          >;


      summary.trialCount =
        trials.length;

      summary.correctTrials =
        trials.filter(
          trial =>
            trial.result ===
            "correct"
        ).length;

      summary.incorrectTrials =
        trials.filter(
          trial =>
            trial.result ===
            "incorrect"
        ).length;

      summary.neutralTrials =
        trials.filter(
          trial =>
            trial.result ===
            "neutral"
        ).length;

    }


    return Object.keys(
      summary
    ).length > 0
      ? summary
      : null;

  };


const getLatestReport =
  async (
    childId: number
  ): Promise<
    ChildAssessmentReport | null
  > => {

    const [
      sessionRows,
    ] =
      await db.query<
        LatestSessionRow[]
      >(
        `
        SELECT
          id,
          child_id,
          status,
          duration_seconds,
          score,
          started_at,
          ended_at,
          created_at
        FROM sessions
        WHERE
          child_id = ?
          AND status IN (
            'Completed',
            'Ended'
          )
        ORDER BY
          COALESCE(
            ended_at,
            started_at,
            created_at
          ) DESC,
          id DESC
        LIMIT 1
        `,
        [
          childId,
        ]
      );


    const session =
      sessionRows[0];


    if (!session) {
      return null;
    }


    const [
      gameRows,
    ] =
      await db.query<
        LatestSessionGameRow[]
      >(
        `
        SELECT
          id,
          game_name,
          difficulty,
          status,
          duration_seconds,
          score,
          accuracy,
          mistakes,
          reaction_time,
          result_data
        FROM session_games
        WHERE
          session_id = ?
          AND status IN (
            'Completed',
            'Ended',
            'Failed'
          )
        ORDER BY id ASC
        `,
        [
          session.id,
        ]
      );


    const games:
      ChildAssessmentGame[] =
      gameRows.map(
        game => ({
          id:
            Number(
              game.id
            ),

          gameName:
            game.game_name,

          difficulty:
            game.difficulty,

          status:
            game.status,

          durationSeconds:
            Number(
              game.duration_seconds ||
              0
            ),

          score:
            nullableNumber(
              game.score
            ),

          accuracy:
            nullableNumber(
              game.accuracy
            ),

          mistakes:
            nullableNumber(
              game.mistakes
            ),

          reactionTime:
            nullableNumber(
              game.reaction_time
            ),

          resultSummary:
            summarizeResultData(
              game.result_data
            ),
        })
      );


    const gameScores =
      games.map(
        game =>
          nullableNumber(
            game.score
          )
      );


    const gameAccuracies =
      games.map(
        game =>
          nullableNumber(
            game.accuracy
          )
      );


    const gameReactionTimes =
      games.map(
        game =>
          nullableNumber(
            game.reactionTime
          )
      );


    const totalMistakes =
      games.reduce(
        (
          total,
          game
        ) =>
          total +
          (
            nullableNumber(
              game.mistakes
            ) ||
            0
          ),
        0
      );


    const sessionScore =
      nullableNumber(
        session.score
      );


    return {
      sessionId:
        Number(
          session.id
        ),

      status:
        session.status,

      assessmentDate:
        normalizeDate(
          session.ended_at ||
          session.started_at ||
          session.created_at
        ),

      durationSeconds:
        Number(
          session.duration_seconds ||
          0
        ),

      score:
        sessionScore ??
        averageNumbers(
          gameScores
        ),

      averageAccuracy:
        averageNumbers(
          gameAccuracies
        ),

      totalMistakes,

      averageReactionTime:
        averageNumbers(
          gameReactionTimes
        ),

      games,
    };

  };


export async function generateGameWithAI(
  req: AuthenticatedRequest,
  res: Response
) {

  try {

    if (!req.auth) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });

    }


    const currentUser =
      await getUserById(
        req.auth.id
      );


    if (!currentUser) {

      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });

    }


    if (
      !currentUser.is_active
    ) {

      return res.status(403).json({
        success: false,
        message:
          "This account is inactive.",
      });

    }


    if (
      currentUser.role !==
      "therapist"
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Only therapists can generate personalized AI games.",
      });

    }


    const childId =
      parsePositiveId(
        req.body
          ?.child_id ??
        req.body
          ?.childId ??
        req.body
          ?.child?.id
      );


    if (!childId) {

      return res.status(400).json({
        success: false,
        message:
          "Valid child ID is required.",
      });

    }


    const child =
      await getChildForUser(
        currentUser.id,
        childId
      );


    if (!child) {

      return res.status(403).json({
        success: false,
        message:
          "This child is not assigned to you.",
      });

    }


    const latestReport =
      await getLatestReport(
        childId
      );


    if (!latestReport) {

      return res.status(404).json({
        success: false,
        message:
          "This child does not have a completed assessment report yet.",
      });

    }


    if (
      latestReport.games.length ===
      0
    ) {

      return res.status(422).json({
        success: false,
        message:
          "The latest report has no completed game results to analyze.",
      });

    }


    const childAssessment:
      ChildAssessment = {

      id:
        Number(
          child.id
        ),

      name:
        child.full_name,

      age:
        Number(
          child.age
        ) || 0,

      results: {
        accuracy:
          latestReport
            .averageAccuracy ??
          undefined,

        errors:
          latestReport
            .totalMistakes ??
          undefined,

        responseTime:
          latestReport
            .averageReactionTime ??
          undefined,
      },

      latestReport,
    };


    const game =
      await generatePersonalizedGame(
        childAssessment
      );


    return res.status(200).json({
      success: true,

      data: {
        sourceReport: {
          sessionId:
            latestReport.sessionId,

          status:
            latestReport.status,

          assessmentDate:
            latestReport.assessmentDate,

          durationSeconds:
            latestReport.durationSeconds,

          score:
            latestReport.score,

          averageAccuracy:
            latestReport.averageAccuracy,

          totalMistakes:
            latestReport.totalMistakes,

          averageReactionTime:
            latestReport.averageReactionTime,

          games:
            latestReport.games,
        },

        primarySkill:
          game.targetSkill,

        secondaryConcern:
          game.secondaryConcern,

        analysis:
          game.analysis,

        therapyPlan:
          game.therapyPlan,

        game: {
          title:
            game.gameName,

          description:
            game.gameDescription,

          domain:
            game.domain,

          difficulty:
            game.difficulty,

          gameSettings: {
            difficulty:
              game.difficulty,

            timeSeconds:
              game.timeLimit,

            time:
              game.timeLimit,

            lives:
              game.lives,

            scoreEnabled:
              game.scoreEnabled,
          },

          gameId:
            game.gameId,

          gameName:
            game.gameName,

          gameDescription:
            game.gameDescription,

          gameType:
            game.gameType,

          timeLimit:
            game.timeLimit,

          levels:
            game.levels,

          progressiveDifficulty:
            game.progressiveDifficulty,

          childId:
            game.childId,

          childName:
            game.childName,

          childAge:
            game.childAge,

          targetSkill:
            game.targetSkill,

          secondaryConcern:
            game.secondaryConcern,

          analysis:
            game.analysis,

          therapyPlan:
            game.therapyPlan,

          reportSnapshot:
            game.reportSnapshot,

          aiGenerated:
            true,

          aiChildId:
            game.childId,

          aiChildName:
            game.childName,

          aiTargetSkill:
            game.targetSkill,

          aiAnalysis:
            [
              game.analysis,
              game.therapyPlan,
            ]
              .filter(
                Boolean
              )
              .join(
                "\\n\\nStrengthening plan:\\n"
              ),

          objects:
            game.objects,

          rules:
            game.rules,

          isAiGenerated:
            true,
        },
      },
    });

  } catch (error) {

  console.error(
    "AI Game Generation Error:",
    error
  );


  if (
    error instanceof
    GeminiApiError
  ) {

    const responseStatus =
      error.status === 429
        ? 429
        : error.status >= 500
          ? 503
          : error.status;


    return res
      .status(
        responseStatus
      )
      .json({
        success:
          false,

        code:
          error.retryable
            ? "AI_TEMPORARILY_UNAVAILABLE"
            : "AI_PROVIDER_ERROR",

        retryable:
          error.retryable,

        message:
          error.message,
      });

  }


  const message =
    error instanceof Error
      ? error.message
      : "Failed to generate AI game.";


  return res
    .status(500)
    .json({
      success:
        false,

      code:
        "AI_GENERATION_ERROR",

      retryable:
        false,

      message,
    });

}

}
