import db from "../database/db";

import type {
  RowDataPacket,
} from "mysql2/promise";


export type PlatformTotals = {
  totalChildren: number;
  improvedChildren: number;
  noClearImprovement: number;
  needsAttention: number;
  childrenWithEnoughData: number;
  childrenWithoutEnoughData: number;
  totalTherapists: number;
  activeTherapists: number;
  totalAssessmentSessions: number;
  completedAssessmentSessions: number;
};

export type RegionCount = {
  region: string;
  count: number;
};

export type CognitivePerformanceItem = {
  key: string;
  label: string;
  gameName: string;
  averageScore: number | null;
  averageAccuracy: number | null;
  assessments: number;
  children: number;
};

export type ImprovementTrendPoint = {
  period: string;
  label: string;
  averageScore: number;
  sessions: number;
  children: number;
};

export type EarlyTrendSignal = {
  key: string;
  label: string;
  gameName: string;
  direction:
    | "rising"
    | "declining"
    | "stable"
    | "insufficient_data";
  attentionLevel:
    | "positive"
    | "watch"
    | "needs_attention"
    | "insufficient_data";
  delta: number | null;
  currentAverage: number | null;
  previousAverage: number | null;
  currentSamples: number;
  previousSamples: number;
};

export type AdminPlatformStatistics = {
  generatedAt: string;
  methodology: {
    improvementThresholdPoints: number;
    needsAttentionScoreThreshold: number;
    domainTrendThresholdPoints: number;
    geographyField: string;
    notes: string[];
  };
  totals: PlatformTotals;
  childrenByRegion: RegionCount[];
  cognitivePerformance: CognitivePerformanceItem[];
  improvementTrend: ImprovementTrendPoint[];
  earlyTrendSignals: EarlyTrendSignal[];
};

interface CountRow extends RowDataPacket {
  count_value: number | string;
}

interface TherapistCountRow extends RowDataPacket {
  total_therapists: number | string;
  active_therapists: number | string;
}

interface SessionCountRow extends RowDataPacket {
  total_sessions: number | string;
  completed_sessions: number | string;
}

interface RegionRow extends RowDataPacket {
  region_name: string;
  child_count: number | string;
}

interface SessionScoreRow extends RowDataPacket {
  session_id: number;
  child_id: number;
  occurred_at: string | Date;
  effective_score: number | string;
}

interface DomainAggregateRow extends RowDataPacket {
  game_name: string;
  average_score: number | string | null;
  average_accuracy: number | string | null;
  assessments: number | string;
  children: number | string;
}

interface DomainMonthlyRow extends RowDataPacket {
  game_name: string;
  period: string;
  average_score: number | string;
  assessments: number | string;
  children: number | string;
}


const IMPROVEMENT_THRESHOLD = 5;
const NEEDS_ATTENTION_SCORE = 60;
const DOMAIN_TREND_THRESHOLD = 3;


// This mirrors the cognitive mapping already used by KidMind's
// cognitiveScores.ts instead of inventing new domains.
const cognitiveDomains = [
  {
    key: "attention",
    label: "Attention / Focus",
    gameName: "focus finder",
  },
  {
    key: "memory",
    label: "Memory",
    gameName: "memory match",
  },
  {
    key: "problemSolving",
    label: "Problem Solving",
    gameName: "puzzle path",
  },
  {
    key: "reading",
    label: "Reading",
    gameName: "reading adventure",
  },
  {
    key: "processingSpeed",
    label: "Processing Speed",
    gameName: "quick match",
  },
] as const;


const toNumber = (
  value: unknown,
  fallback = 0
) => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
};


const round = (
  value: number,
  digits = 1
) => {
  const factor = Math.pow(10, digits);

  return (
    Math.round(value * factor) /
    factor
  );
};


const normalizeGameName = (
  value: unknown
) =>
  String(value || "")
    .trim()
    .toLowerCase();


const monthLabel = (
  period: string
) => {
  const [year, month] =
    period
      .split("-")
      .map(Number);

  if (!year || !month) {
    return period;
  }

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      1
    )
  );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }
  );
};


const getTotalChildren =
  async () => {
    const [rows] =
      await db.query<
        CountRow[]
      >(
        `
        SELECT
          COUNT(*) AS count_value
        FROM children
        `
      );

    return toNumber(
      rows[0]?.count_value
    );
  };


const getTherapistCounts =
  async () => {
    const [rows] =
      await db.query<
        TherapistCountRow[]
      >(
        `
        SELECT
          COUNT(*) AS total_therapists,
          SUM(
            CASE
              WHEN is_active = 1
              THEN 1
              ELSE 0
            END
          ) AS active_therapists
        FROM users
        WHERE role = 'therapist'
        `
      );

    return {
      totalTherapists:
        toNumber(
          rows[0]?.total_therapists
        ),
      activeTherapists:
        toNumber(
          rows[0]?.active_therapists
        ),
    };
  };


const getSessionCounts =
  async () => {
    const [rows] =
      await db.query<
        SessionCountRow[]
      >(
        `
        SELECT
          COUNT(*) AS total_sessions,
          SUM(
            CASE
              WHEN status IN (
                'Completed',
                'Ended'
              )
              THEN 1
              ELSE 0
            END
          ) AS completed_sessions
        FROM sessions
        `
      );

    return {
      totalAssessmentSessions:
        toNumber(
          rows[0]?.total_sessions
        ),
      completedAssessmentSessions:
        toNumber(
          rows[0]?.completed_sessions
        ),
    };
  };


const getChildrenByRegion =
  async (): Promise<
    RegionCount[]
  > => {
    const [rows] =
      await db.query<
        RegionRow[]
      >(
        `
        SELECT
          COALESCE(
            NULLIF(
              TRIM(region),
              ''
            ),
            'Unspecified'
          ) AS region_name,
          COUNT(*) AS child_count
        FROM children
        GROUP BY
          COALESCE(
            NULLIF(
              TRIM(region),
              ''
            ),
            'Unspecified'
          )
        ORDER BY
          child_count DESC,
          region_name ASC
        `
      );

    return rows.map(
      row => ({
        region:
          row.region_name,
        count:
          toNumber(
            row.child_count
          ),
      })
    );
  };


const getCompletedSessionScores =
  async (): Promise<
    SessionScoreRow[]
  > => {
    const [rows] =
      await db.query<
        SessionScoreRow[]
      >(
        `
        SELECT
          s.id AS session_id,
          s.child_id,
          COALESCE(
            s.ended_at,
            s.updated_at,
            s.started_at,
            s.created_at
          ) AS occurred_at,
          COALESCE(
            s.score,
            game_summary.average_game_score
          ) AS effective_score
        FROM sessions s

        LEFT JOIN (
          SELECT
            session_id,
            AVG(score)
              AS average_game_score
          FROM session_games
          WHERE
            status IN (
              'Completed',
              'Failed',
              'Ended'
            )
            AND score IS NOT NULL
          GROUP BY
            session_id
        ) game_summary
          ON game_summary.session_id =
            s.id

        WHERE
          s.status IN (
            'Completed',
            'Ended'
          )
          AND COALESCE(
            s.score,
            game_summary.average_game_score
          ) IS NOT NULL

        ORDER BY
          s.child_id ASC,
          occurred_at ASC,
          s.id ASC
        `
      );

    return rows;
  };


const calculateProgressStats = (
  totalChildren: number,
  sessionScores: SessionScoreRow[]
) => {
  const byChild =
    new Map<
      number,
      Array<{
        occurredAt: number;
        score: number;
      }>
    >();

  for (const row of sessionScores) {
    const childId =
      Number(row.child_id);

    const score =
      toNumber(
        row.effective_score,
        NaN
      );

    const occurredAt =
      new Date(
        row.occurred_at
      ).getTime();

    if (
      !Number.isFinite(childId) ||
      !Number.isFinite(score)
    ) {
      continue;
    }

    const current =
      byChild.get(childId) ||
      [];

    current.push({
      occurredAt:
        Number.isFinite(
          occurredAt
        )
          ? occurredAt
          : 0,
      score,
    });

    byChild.set(
      childId,
      current
    );
  }

  let improvedChildren = 0;
  let noClearImprovement = 0;
  let needsAttention = 0;
  let childrenWithEnoughData = 0;

  for (
    const entries of
      byChild.values()
  ) {
    entries.sort(
      (first, second) =>
        first.occurredAt -
        second.occurredAt
    );

    const latest =
      entries[
        entries.length - 1
      ];

    if (entries.length >= 2) {
      childrenWithEnoughData += 1;

      const first =
        entries[0];

      const delta =
        latest.score -
        first.score;

      if (
        delta >=
        IMPROVEMENT_THRESHOLD
      ) {
        improvedChildren += 1;
      } else if (
        Math.abs(delta) <
        IMPROVEMENT_THRESHOLD
      ) {
        noClearImprovement += 1;
      }
    }

    const firstScore =
      entries[0]?.score;

    const deltaFromFirst =
      entries.length >= 2
        ? latest.score -
          firstScore
        : null;

    if (
      latest.score <
        NEEDS_ATTENTION_SCORE ||
      (
        deltaFromFirst !== null &&
        deltaFromFirst <=
          -IMPROVEMENT_THRESHOLD
      )
    ) {
      needsAttention += 1;
    }
  }

  return {
    improvedChildren,
    noClearImprovement,
    needsAttention,
    childrenWithEnoughData,
    childrenWithoutEnoughData:
      Math.max(
        0,
        totalChildren -
          childrenWithEnoughData
      ),
  };
};


const calculateImprovementTrend = (
  rows: SessionScoreRow[]
): ImprovementTrendPoint[] => {
  const monthly =
    new Map<
      string,
      {
        scores: number[];
        children: Set<number>;
      }
    >();

  for (const row of rows) {
    const date =
      new Date(
        row.occurred_at
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      continue;
    }

    const period = [
      date.getUTCFullYear(),
      String(
        date.getUTCMonth() + 1
      ).padStart(
        2,
        "0"
      ),
    ].join("-");

    const score =
      toNumber(
        row.effective_score,
        NaN
      );

    if (
      !Number.isFinite(score)
    ) {
      continue;
    }

    const current =
      monthly.get(period) ||
      {
        scores: [],
        children:
          new Set<number>(),
      };

    current.scores.push(score);
    current.children.add(
      Number(row.child_id)
    );

    monthly.set(
      period,
      current
    );
  }

  return [
    ...monthly.entries(),
  ]
    .sort(
      (first, second) =>
        first[0].localeCompare(
          second[0]
        )
    )
    .slice(-12)
    .map(
      ([period, value]) => ({
        period,
        label:
          monthLabel(period),
        averageScore:
          round(
            value.scores.reduce(
              (
                total,
                score
              ) =>
                total + score,
              0
            ) /
              value.scores.length,
            1
          ),
        sessions:
          value.scores.length,
        children:
          value.children.size,
      })
    );
};


const getCognitivePerformance =
  async (): Promise<
    CognitivePerformanceItem[]
  > => {
    const [rows] =
      await db.query<
        DomainAggregateRow[]
      >(
        `
        SELECT
          LOWER(
            TRIM(
              sg.game_name
            )
          ) AS game_name,

          ROUND(
            AVG(sg.score),
            2
          ) AS average_score,

          ROUND(
            AVG(sg.accuracy),
            2
          ) AS average_accuracy,

          COUNT(*)
            AS assessments,

          COUNT(
            DISTINCT s.child_id
          ) AS children

        FROM session_games sg

        INNER JOIN sessions s
          ON s.id =
            sg.session_id

        WHERE
          s.status IN (
            'Completed',
            'Ended'
          )
          AND sg.status IN (
            'Completed',
            'Failed',
            'Ended'
          )
          AND sg.score IS NOT NULL

        GROUP BY
          LOWER(
            TRIM(
              sg.game_name
            )
          )
        `
      );

    const byName =
      new Map(
        rows.map(
          row => [
            normalizeGameName(
              row.game_name
            ),
            row,
          ]
        )
      );

    return cognitiveDomains.map(
      domain => {
        const row =
          byName.get(
            normalizeGameName(
              domain.gameName
            )
          );

        return {
          key:
            domain.key,
          label:
            domain.label,
          gameName:
            domain.gameName,
          averageScore:
            row
              ? round(
                  toNumber(
                    row.average_score
                  ),
                  1
                )
              : null,
          averageAccuracy:
            row &&
            row.average_accuracy !==
              null
              ? round(
                  toNumber(
                    row.average_accuracy
                  ),
                  1
                )
              : null,
          assessments:
            row
              ? toNumber(
                  row.assessments
                )
              : 0,
          children:
            row
              ? toNumber(
                  row.children
                )
              : 0,
        };
      }
    );
  };


const getDomainMonthlyRows =
  async (): Promise<
    DomainMonthlyRow[]
  > => {
    const [rows] =
      await db.query<
        DomainMonthlyRow[]
      >(
        `
        SELECT
          LOWER(
            TRIM(
              sg.game_name
            )
          ) AS game_name,

          DATE_FORMAT(
            COALESCE(
              sg.ended_at,
              s.ended_at,
              sg.updated_at,
              s.updated_at,
              sg.created_at,
              s.created_at
            ),
            '%Y-%m'
          ) AS period,

          ROUND(
            AVG(sg.score),
            2
          ) AS average_score,

          COUNT(*)
            AS assessments,

          COUNT(
            DISTINCT s.child_id
          ) AS children

        FROM session_games sg

        INNER JOIN sessions s
          ON s.id =
            sg.session_id

        WHERE
          s.status IN (
            'Completed',
            'Ended'
          )
          AND sg.status IN (
            'Completed',
            'Failed',
            'Ended'
          )
          AND sg.score IS NOT NULL

        GROUP BY
          LOWER(
            TRIM(
              sg.game_name
            )
          ),
          DATE_FORMAT(
            COALESCE(
              sg.ended_at,
              s.ended_at,
              sg.updated_at,
              s.updated_at,
              sg.created_at,
              s.created_at
            ),
            '%Y-%m'
          )

        ORDER BY
          period ASC
        `
      );

    return rows;
  };


const calculateEarlyTrendSignals = (
  rows: DomainMonthlyRow[]
): EarlyTrendSignal[] => {
  const byGame =
    new Map<
      string,
      DomainMonthlyRow[]
    >();

  for (const row of rows) {
    const gameName =
      normalizeGameName(
        row.game_name
      );

    const current =
      byGame.get(gameName) ||
      [];

    current.push(row);

    byGame.set(
      gameName,
      current
    );
  }

  return cognitiveDomains.map(
    domain => {
      const points =
        (
          byGame.get(
            normalizeGameName(
              domain.gameName
            )
          ) || []
        )
          .filter(
            point =>
              Boolean(point.period)
          )
          .sort(
            (first, second) =>
              first.period.localeCompare(
                second.period
              )
          );

      if (points.length < 2) {
        const current =
          points[
            points.length - 1
          ];

        return {
          key:
            domain.key,
          label:
            domain.label,
          gameName:
            domain.gameName,
          direction:
            "insufficient_data",
          attentionLevel:
            "insufficient_data",
          delta:
            null,
          currentAverage:
            current
              ? round(
                  toNumber(
                    current.average_score
                  ),
                  1
                )
              : null,
          previousAverage:
            null,
          currentSamples:
            current
              ? toNumber(
                  current.assessments
                )
              : 0,
          previousSamples:
            0,
        };
      }

      const previous =
        points[
          points.length - 2
        ];

      const current =
        points[
          points.length - 1
        ];

      const previousAverage =
        toNumber(
          previous.average_score
        );

      const currentAverage =
        toNumber(
          current.average_score
        );

      const delta =
        round(
          currentAverage -
            previousAverage,
          1
        );

      let direction:
        EarlyTrendSignal[
          "direction"
        ] =
        "stable";

      if (
        delta >=
        DOMAIN_TREND_THRESHOLD
      ) {
        direction =
          "rising";
      } else if (
        delta <=
        -DOMAIN_TREND_THRESHOLD
      ) {
        direction =
          "declining";
      }

      let attentionLevel:
        EarlyTrendSignal[
          "attentionLevel"
        ] =
        "watch";

      if (
        currentAverage <
        NEEDS_ATTENTION_SCORE
      ) {
        attentionLevel =
          "needs_attention";
      } else if (
        direction ===
        "rising"
      ) {
        attentionLevel =
          "positive";
      } else if (
        direction ===
          "stable" &&
        currentAverage >= 70
      ) {
        attentionLevel =
          "positive";
      }

      return {
        key:
          domain.key,
        label:
          domain.label,
        gameName:
          domain.gameName,
        direction,
        attentionLevel,
        delta,
        currentAverage:
          round(
            currentAverage,
            1
          ),
        previousAverage:
          round(
            previousAverage,
            1
          ),
        currentSamples:
          toNumber(
            current.assessments
          ),
        previousSamples:
          toNumber(
            previous.assessments
          ),
      };
    }
  );
};


export const getAdminPlatformStatistics =
  async (): Promise<
    AdminPlatformStatistics
  > => {
    const [
      totalChildren,
      therapistCounts,
      sessionCounts,
      childrenByRegion,
      sessionScores,
      cognitivePerformance,
      domainMonthlyRows,
    ] =
      await Promise.all([
        getTotalChildren(),
        getTherapistCounts(),
        getSessionCounts(),
        getChildrenByRegion(),
        getCompletedSessionScores(),
        getCognitivePerformance(),
        getDomainMonthlyRows(),
      ]);

    const progress =
      calculateProgressStats(
        totalChildren,
        sessionScores
      );

    const improvementTrend =
      calculateImprovementTrend(
        sessionScores
      );

    const earlyTrendSignals =
      calculateEarlyTrendSignals(
        domainMonthlyRows
      );

    return {
      generatedAt:
        new Date()
          .toISOString(),

      methodology: {
        improvementThresholdPoints:
          IMPROVEMENT_THRESHOLD,
        needsAttentionScoreThreshold:
          NEEDS_ATTENTION_SCORE,
        domainTrendThresholdPoints:
          DOMAIN_TREND_THRESHOLD,
        geographyField:
          "children.region",
        notes: [
          "KidMind currently stores geography in children.region, so the dashboard reports region values exactly as stored rather than inventing a country field.",
          "Improvement requires at least two scored completed/ended sessions. A child is counted as improved when the latest score is at least 5 points above the earliest scored session.",
          "No clear improvement means the change is smaller than 5 points in either direction.",
          "Needs attention is an administrative follow-up signal, not a diagnosis. It is flagged when the latest score is below 60 or when performance declined by at least 5 points.",
          "Cognitive domains use the game-to-domain mapping already present in KidMind: Focus Finder, Memory Match, Puzzle Path, Reading Adventure, and Quick Match.",
        ],
      },

      totals: {
        totalChildren,
        ...progress,
        ...therapistCounts,
        ...sessionCounts,
      },

      childrenByRegion,
      cognitivePerformance,
      improvementTrend,
      earlyTrendSignals,
    };
  };
