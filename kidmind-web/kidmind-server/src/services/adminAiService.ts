import type {
  AdminPlatformStatistics,
} from "../models/adminInsightsModel";


export type AdminAITrend = {
  title: string;
  description: string;
  domainKey:
    | string
    | null;
  direction:
    | "positive"
    | "watch"
    | "emerging"
    | "stable";
};

export type AdminAIRecommendation = {
  title: string;
  description: string;
  priority:
    | "high"
    | "medium"
    | "low";
};

export type AdminAIInterpretation = {
  available: boolean;
  summary: string;
  keyTrends:
    AdminAITrend[];
  areasNeedingAttention:
    AdminAITrend[];
  positiveTrends:
    AdminAITrend[];
  emergingTrends:
    AdminAITrend[];
  recommendations:
    AdminAIRecommendation[];
  error:
    | string
    | null;
};


const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";


const extractText = (
  payload: any
) => {
  const parts =
    payload
      ?.candidates?.[0]
      ?.content
      ?.parts;

  if (
    !Array.isArray(
      parts
    )
  ) {
    return "";
  }

  return parts
    .map(
      (part: any) =>
        typeof part?.text ===
          "string"
          ? part.text
          : ""
    )
    .join("")
    .trim();
};


const stripCodeFence = (
  value: string
) =>
  value
    .replace(
      /^```json\s*/i,
      ""
    )
    .replace(
      /^```\s*/i,
      ""
    )
    .replace(
      /\s*```$/,
      ""
    )
    .trim();


const sanitizeNarrative = (
  value: unknown,
  fallback = ""
) => {
  const text =
    String(
      value ||
      fallback
    )
      // Verified numeric values must come from the backend statistics,
      // never from the Gemini narrative.
      .replace(
        /\b\d+(?:\.\d+)?\s*%?/g,
        ""
      )
      .replace(
        /\s{2,}/g,
        " "
      )
      .replace(
        /\s+([,.!?;:])/g,
        "$1"
      )
      .trim();

  return text ||
    fallback;
};


const normalizeTrend = (
  value: any,
  fallbackDirection:
    AdminAITrend[
      "direction"
    ] =
    "watch"
): AdminAITrend => {
  const allowedDirections:
    AdminAITrend[
      "direction"
    ][] = [
      "positive",
      "watch",
      "emerging",
      "stable",
    ];

  const direction =
    allowedDirections.includes(
      value?.direction
    )
      ? value.direction
      : fallbackDirection;

  return {
    title:
      sanitizeNarrative(
        value?.title,
        "Platform trend"
      ),

    description:
      sanitizeNarrative(
        value?.description,
        "Review this trend alongside the verified platform statistics."
      ),

    domainKey:
      typeof value
        ?.domainKey ===
        "string"
        ? value.domainKey
        : null,

    direction,
  };
};


const normalizeRecommendation = (
  value: any
): AdminAIRecommendation => {
  const allowedPriorities:
    AdminAIRecommendation[
      "priority"
    ][] = [
      "high",
      "medium",
      "low",
    ];

  return {
    title:
      sanitizeNarrative(
        value?.title,
        "Review platform performance"
      ),

    description:
      sanitizeNarrative(
        value?.description,
        "Use the verified dashboard metrics to guide the next operational review."
      ),

    priority:
      allowedPriorities.includes(
        value?.priority
      )
        ? value.priority
        : "medium",
  };
};


const emptyInterpretation = (
  error:
    string |
    null = null
): AdminAIInterpretation => ({
  available:
    false,

  summary:
    "AI interpretation is temporarily unavailable. The verified platform statistics are still available below.",

  keyTrends:
    [],

  areasNeedingAttention:
    [],

  positiveTrends:
    [],

  emergingTrends:
    [],

  recommendations:
    [],

  error,
});


export const generateAdminAIInterpretation =
  async (
    statistics:
      AdminPlatformStatistics
  ): Promise<
    AdminAIInterpretation
  > => {
    const apiKey =
      process.env
        .GEMINI_API_KEY;

    if (!apiKey) {
      return emptyInterpretation(
        "GEMINI_API_KEY is not configured."
      );
    }

    // Only aggregated, de-identified statistics are sent to Gemini.
    const aggregatedPayload = {
      methodology:
        statistics.methodology,

      totals:
        statistics.totals,

      childrenByRegion:
        statistics.childrenByRegion,

      cognitivePerformance:
        statistics.cognitivePerformance,

      improvementTrend:
        statistics.improvementTrend,

      earlyTrendSignals:
        statistics.earlyTrendSignals,
    };

    const prompt = `
You are the platform-level analytics assistant for KidMind.

You are NOT the child-level AI used to generate personalized games.
You are analyzing only aggregated, de-identified platform statistics.

STRICT RULES:
1. Never diagnose a child, population, or medical condition.
2. Never invent a count, percentage, score, country, trend, domain, or statistic.
3. Do not calculate or restate numeric values in your prose. All numbers are displayed separately by the trusted backend.
4. Use only the supplied aggregate data.
5. Treat "needs attention" as an administrative follow-up signal, not a clinical diagnosis.
6. If the data is insufficient, say that the evidence is limited.
7. Recommendations must be operational or program-level, such as reviewing content, therapist workflows, assessment coverage, or follow-up capacity.
8. Never include names, identifiers, or personal information.
9. The actual KidMind domain mapping is already represented in cognitivePerformance. Do not add new cognitive domains.
10. Return valid JSON only.

Return this exact shape:

{
  "summary": "short platform-level summary without numbers",
  "keyTrends": [
    {
      "title": "short title",
      "description": "qualitative explanation without numbers",
      "domainKey": "matching domain key or null",
      "direction": "positive|watch|emerging|stable"
    }
  ],
  "areasNeedingAttention": [
    {
      "title": "short title",
      "description": "qualitative explanation without numbers",
      "domainKey": "matching domain key or null",
      "direction": "watch"
    }
  ],
  "positiveTrends": [
    {
      "title": "short title",
      "description": "qualitative explanation without numbers",
      "domainKey": "matching domain key or null",
      "direction": "positive"
    }
  ],
  "emergingTrends": [
    {
      "title": "short title",
      "description": "early signal; explicitly note when evidence is limited",
      "domainKey": "matching domain key or null",
      "direction": "emerging"
    }
  ],
  "recommendations": [
    {
      "title": "short action",
      "description": "admin-level action without numbers",
      "priority": "high|medium|low"
    }
  ]
}

AGGREGATED KIDMIND DATA:
${JSON.stringify(
  aggregatedPayload,
  null,
  2
)}
`;

    try {
      const response =
        await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            GEMINI_MODEL
          )}:generateContent?key=${encodeURIComponent(
            apiKey
          )}`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                contents: [
                  {
                    role:
                      "user",
                    parts: [
                      {
                        text:
                          prompt,
                      },
                    ],
                  },
                ],

                generationConfig: {
                  temperature:
                    0.15,
                  responseMimeType:
                    "application/json",
                },
              }),
          }
        );

      const data =
        await response
          .json()
          .catch(
            () => null
          );

      if (
        !response.ok
      ) {
        const apiMessage =
          data?.error
            ?.message ||
          `Gemini returned ${response.status}.`;

        return emptyInterpretation(
          apiMessage
        );
      }

      const rawText =
        extractText(
          data
        );

      if (!rawText) {
        return emptyInterpretation(
          "Gemini returned an empty response."
        );
      }

      const parsed =
        JSON.parse(
          stripCodeFence(
            rawText
          )
        );

      return {
        available:
          true,

        summary:
          sanitizeNarrative(
            parsed?.summary,
            "KidMind platform data was analyzed successfully."
          ),

        keyTrends:
          Array.isArray(
            parsed?.keyTrends
          )
            ? parsed.keyTrends
                .slice(0, 6)
                .map(
                  (item: any) =>
                    normalizeTrend(
                      item
                    )
                )
            : [],

        areasNeedingAttention:
          Array.isArray(
            parsed
              ?.areasNeedingAttention
          )
            ? parsed
                .areasNeedingAttention
                .slice(0, 6)
                .map(
                  (item: any) =>
                    normalizeTrend(
                      item,
                      "watch"
                    )
                )
            : [],

        positiveTrends:
          Array.isArray(
            parsed
              ?.positiveTrends
          )
            ? parsed
                .positiveTrends
                .slice(0, 6)
                .map(
                  (item: any) =>
                    normalizeTrend(
                      item,
                      "positive"
                    )
                )
            : [],

        emergingTrends:
          Array.isArray(
            parsed
              ?.emergingTrends
          )
            ? parsed
                .emergingTrends
                .slice(0, 6)
                .map(
                  (item: any) =>
                    normalizeTrend(
                      item,
                      "emerging"
                    )
                )
            : [],

        recommendations:
          Array.isArray(
            parsed
              ?.recommendations
          )
            ? parsed
                .recommendations
                .slice(0, 6)
                .map(
                  (item: any) =>
                    normalizeRecommendation(
                      item
                    )
                )
            : [],

        error:
          null,
      };
    } catch (error) {
      console.error(
        "Admin AI interpretation error:",
        error
      );

      return emptyInterpretation(
        error instanceof Error
          ? error.message
          : "AI interpretation failed."
      );
    }
  };
