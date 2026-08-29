const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL = "gemini-3.6-flash";

if (!GEMINI_API_KEY) {
  console.warn(
    "WARNING: GEMINI_API_KEY is not configured in environment variables."
  );
}

export interface ChildAssessmentGame {
  id?: number;
  gameName?: string;
  difficulty?: string | null;
  status?: string;
  durationSeconds?: number;
  score?: number | null;
  accuracy?: number | null;
  mistakes?: number | null;
  reactionTime?: number | null;
  resultSummary?: Record<string, unknown> | null;
}

export interface ChildAssessmentReport {
  sessionId: number;
  status: string;
  assessmentDate?: string | null;
  durationSeconds?: number;
  score?: number | null;
  averageAccuracy?: number | null;
  totalMistakes?: number | null;
  averageReactionTime?: number | null;
  games: ChildAssessmentGame[];
}

export interface ChildAssessment {
  id?: number | string;
  name?: string;
  age?: number;

  results: {
    attention?: number;
    workingMemory?: number;
    executiveFunctions?: number;
    accuracy?: number;
    errors?: number;
    responseTime?: number;
    impulsivity?: number;
  };

  latestReport?: ChildAssessmentReport;
}

export interface AIGameObject {
  id: string;
  type: "shape" | "text" | "button" | "image";
  elementId?: string;

  name: string;

  x: number;
  y: number;

  width: number;
  height: number;

  color: string;

  text?: string;

  shape?:
    | "circle"
    | "square"
    | "triangle"
    | "star"
    | "diamond"
    | "card"
    | null;

  image?: string | null;

  visible?: boolean;

  rotation?: number;

  role?: string;

  aiGenerated?: boolean;
}

export interface AIGameRule {
  id: string;

  trigger: string;

  triggerTargetId?: string;

  action: string;

  targetIds: string[];

  value?: number;

  wait?: number;

  moveX?: number;

  moveY?: number;

  enabled: boolean;

  description: string;

  aiGenerated?: boolean;
}

export interface AIGameResult {
  childId?: number | string | null;

  childName?: string | null;

  childAge?: number | null;

  gameId?: string;

  gameName: string;

  gameDescription: string;

  description?: string;

  gameType:
    | "Memory"
    | "Attention"
    | "Sequence"
    | "Processing Speed";

  domain:
    | "Attention"
    | "Memory"
    | "Executive Functions"
    | "Processing Speed"
    | "Reading";

  difficulty: "Easy" | "Medium" | "Hard";

  timeLimit: number;

  lives: number;

  levels: number;

  progressiveDifficulty: boolean;

  scoreEnabled: boolean;

  targetSkill: string;

  secondaryConcern: string;

  analysis: string;

  therapyPlan: string;

  objects: AIGameObject[];

  rules: AIGameRule[];

  reportSnapshot?: {
    attention?: number;
    workingMemory?: number;
    executiveFunctions?: number;
    accuracy?: number;
    errors?: number;
    responseTime?: number;
    impulsivity?: number;
    sessionId?: number;
    sessionStatus?: string;
    assessmentDate?: string | null;
    sessionScore?: number | null;
    averageAccuracy?: number | null;
    totalMistakes?: number | null;
    averageReactionTime?: number | null;
    games?: ChildAssessmentGame[];
  };
}


/* ============================================================
   HELPERS
============================================================ */

function cleanJson(text: string): string {
  let cleaned = text.trim();

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  }

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }

  return cleaned.trim();
}


function clampNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(
    Math.max(number, min),
    max
  );
}


function normalizeDifficulty(
  value: unknown
): "Easy" | "Medium" | "Hard" {
  if (
    value === "Easy" ||
    value === "Medium" ||
    value === "Hard"
  ) {
    return value;
  }

  return "Medium";
}


function normalizeGameType(
  value: unknown
):
  | "Memory"
  | "Attention"
  | "Sequence"
  | "Processing Speed" {
  if (
    value === "Memory" ||
    value === "Attention" ||
    value === "Sequence" ||
    value === "Processing Speed"
  ) {
    return value;
  }

  return "Attention";
}


function normalizeDomain(
  value: unknown
):
  | "Attention"
  | "Memory"
  | "Executive Functions"
  | "Processing Speed"
  | "Reading" {
  if (
    value === "Attention" ||
    value === "Memory" ||
    value === "Executive Functions" ||
    value === "Processing Speed" ||
    value === "Reading"
  ) {
    return value;
  }

  return "Attention";
}


function normalizeShape(
  value: unknown
):
  | "circle"
  | "square"
  | "triangle"
  | "star"
  | "diamond"
  | "card"
  | null {
  if (
    value === "circle" ||
    value === "square" ||
    value === "triangle" ||
    value === "star" ||
    value === "diamond" ||
    value === "card"
  ) {
    return value;
  }

  return "circle";
}


/* ============================================================
   NORMALIZE OBJECT
============================================================ */

function normalizeObject(
  object: any,
  index: number
): AIGameObject {
  const id =
    typeof object?.id === "string" &&
    object.id.trim()
      ? object.id
      : `ai-object-${index + 1}`;

  const shape =
    normalizeShape(object?.shape);

  const type =
    object?.type === "text" ||
    object?.type === "button" ||
    object?.type === "image"
      ? object.type
      : "shape";

  return {
    id,

    type,

    elementId:
      object?.elementId ||
      (type === "shape"
        ? shape || "circle"
        : type),

    name:
      typeof object?.name === "string" &&
      object.name.trim()
        ? object.name
        : `AI Object ${index + 1}`,

    x: clampNumber(
      object?.x,
      100 + (index % 4) * 170,
      5,
      1000
    ),

    y: clampNumber(
      object?.y,
      120 + Math.floor(index / 4) * 150,
      50,
      650
    ),

    width: clampNumber(
      object?.width,
      100,
      40,
      300
    ),

    height: clampNumber(
      object?.height,
      100,
      40,
      300
    ),

    color:
      typeof object?.color === "string" &&
      object.color.trim()
        ? object.color
        : "#7C6CFF",

    text:
      typeof object?.text === "string"
        ? object.text
        : "",

    shape,

    image:
      typeof object?.image === "string"
        ? object.image
        : null,

    visible:
      object?.visible !== false,

    rotation:
      clampNumber(
        object?.rotation,
        0,
        -360,
        360
      ),

    role:
      typeof object?.role === "string"
        ? object.role
        : "interactive",

    aiGenerated: true,
  };
}


/* ============================================================
   NORMALIZE RULE
============================================================ */

function normalizeRule(
  rule: any,
  index: number,
  objects: AIGameObject[]
): AIGameRule {
  const objectIds =
    objects.map(
      (object) => object.id
    );

  let triggerTargetId =
    typeof rule?.triggerTargetId === "string"
      ? rule.triggerTargetId
      : "";

  if (
    triggerTargetId &&
    !objectIds.includes(triggerTargetId)
  ) {
    triggerTargetId =
      objects[0]?.id || "";
  }

  let targetIds =
    Array.isArray(rule?.targetIds)
      ? rule.targetIds.filter(
          (id: unknown): id is string =>
            typeof id === "string" &&
            objectIds.includes(id)
        )
      : [];

  /*
   * Actions like hide/show/move need target objects.
   */
  if (
    targetIds.length === 0 &&
    (
      rule?.action === "hide" ||
      rule?.action === "show" ||
      rule?.action === "move" ||
      rule?.action === "add-score"
    )
  ) {
    if (triggerTargetId) {
      targetIds = [
        triggerTargetId,
      ];
    } else if (objects[0]) {
      targetIds = [
        objects[0].id,
      ];
    }
  }

  return {
    id:
      typeof rule?.id === "string" &&
      rule.id.trim()
        ? rule.id
        : `ai-rule-${index + 1}`,

    trigger:
      typeof rule?.trigger === "string" &&
      rule.trigger.trim()
        ? rule.trigger
        : "object-clicked",

    triggerTargetId,

    action:
      typeof rule?.action === "string" &&
      rule.action.trim()
        ? rule.action
        : "add-score",

    targetIds,

    value:
      Number.isFinite(
        Number(rule?.value)
      )
        ? Number(rule.value)
        : 5,

    wait:
      Number.isFinite(
        Number(rule?.wait)
      )
        ? Number(rule.wait)
        : 0,

    moveX:
      Number.isFinite(
        Number(rule?.moveX)
      )
        ? Number(rule.moveX)
        : 0,

    moveY:
      Number.isFinite(
        Number(rule?.moveY)
      )
        ? Number(rule.moveY)
        : 0,

    enabled:
      rule?.enabled !== false,

    description:
      typeof rule?.description === "string" &&
      rule.description.trim()
        ? rule.description
        : "Correct interaction applies the game rule.",

    aiGenerated: true,
  };
}


/* ============================================================
   NORMALIZE COMPLETE AI GAME
============================================================ */

function normalizeGame(
  raw: any,
  child: ChildAssessment
): AIGameResult {
  const difficulty =
    normalizeDifficulty(
      raw?.difficulty
    );

  const defaultTime =
    difficulty === "Hard"
      ? 30
      : difficulty === "Medium"
        ? 45
        : 60;

  const defaultLives =
    difficulty === "Hard"
      ? 2
      : 3;

  const rawObjects =
    Array.isArray(raw?.objects)
      ? raw.objects
      : [];

  const objects =
    rawObjects
      .map(
        (object: any, index: number) =>
          normalizeObject(
            object,
            index
          )
      );

  /*
   * Guarantee that the builder never receives an empty game.
   */
  if (objects.length === 0) {
    objects.push(
      normalizeObject(
        {
          id: "ai-object-1",
          type: "shape",
          elementId: "circle",
          name: "Target",
          x: 300,
          y: 180,
          width: 120,
          height: 120,
          color: "#7C6CFF",
          shape: "circle",
          role: "target",
        },
        0
      )
    );
  }

  const rawRules =
    Array.isArray(raw?.rules)
      ? raw.rules
      : [];

  const rules =
    rawRules.length > 0
      ? rawRules.map(
          (
            rule: any,
            index: number
          ) =>
            normalizeRule(
              rule,
              index,
              objects
            )
        )
      : [
          normalizeRule(
            {
              id: "ai-rule-1",
              trigger: "object-clicked",
              triggerTargetId:
                objects[0].id,
              action: "add-score",
              targetIds: [
                objects[0].id,
              ],
              value: 5,
              description:
                "Clicking the target correctly adds points.",
            },
            0,
            objects
          ),
        ];

  const gameName =
    typeof raw?.gameName === "string" &&
    raw.gameName.trim()
      ? raw.gameName.trim()
      : `${child.name || "Child"} — Personalized Cognitive Game`;

  const gameDescription =
    typeof raw?.gameDescription === "string" &&
    raw.gameDescription.trim()
      ? raw.gameDescription.trim()
      : `AI-generated cognitive activity personalized for ${child.name || "the selected child"}.`;

  const targetSkill =
    typeof raw?.targetSkill === "string" &&
    raw.targetSkill.trim()
      ? raw.targetSkill
      : "Cognitive Skills";

  const secondaryConcern =
    typeof raw?.secondaryConcern === "string"
      ? raw.secondaryConcern
      : "";

  const analysis =
    typeof raw?.analysis === "string" &&
    raw.analysis.trim()
      ? raw.analysis
      : "The game was generated from the child's available assessment results.";

  const therapyPlan =
    typeof raw?.therapyPlan === "string" &&
    raw.therapyPlan.trim()
      ? raw.therapyPlan.trim()
      : `Use short, structured practice sessions targeting ${targetSkill}, review progress after each session, and adjust difficulty based on the child's response.`;

  return {
    childId:
      child.id ?? null,

    childName:
      child.name ?? null,

    childAge:
      child.age ?? null,

    gameId:
      `ai-game-${Date.now()}`,

    gameName,

    gameDescription,

    description:
      gameDescription,

    gameType:
      normalizeGameType(
        raw?.gameType
      ),

    domain:
      normalizeDomain(
        raw?.domain
      ),

    difficulty,

    timeLimit:
      clampNumber(
        raw?.timeLimit,
        defaultTime,
        15,
        300
      ),

    lives:
      clampNumber(
        raw?.lives,
        defaultLives,
        1,
        10
      ),

    levels:
      3,

    progressiveDifficulty:
      true,

    scoreEnabled:
      raw?.scoreEnabled !== false,

    targetSkill,

    secondaryConcern,

    analysis,

    therapyPlan,

    objects,

    rules,

    reportSnapshot: {
      attention:
        child.results?.attention,

      workingMemory:
        child.results?.workingMemory,

      executiveFunctions:
        child.results?.executiveFunctions,

      accuracy:
        child.results?.accuracy,

      errors:
        child.results?.errors,

      responseTime:
        child.results?.responseTime,

      impulsivity:
        child.results?.impulsivity,

      sessionId:
        child.latestReport?.sessionId,

      sessionStatus:
        child.latestReport?.status,

      assessmentDate:
        child.latestReport?.assessmentDate,

      sessionScore:
        child.latestReport?.score,

      averageAccuracy:
        child.latestReport?.averageAccuracy,

      totalMistakes:
        child.latestReport?.totalMistakes,

      averageReactionTime:
        child.latestReport?.averageReactionTime,

      games:
        child.latestReport?.games,
    },
  };
}


/* ============================================================
   MAIN AI FUNCTION
============================================================ */

export async function generatePersonalizedGame(
  child: ChildAssessment
): Promise<AIGameResult> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is missing. Add GEMINI_API_KEY to your backend .env file."
    );
  }

  const results =
    child.results || {};

  const latestReport =
    child.latestReport;

  const latestReportJson =
    latestReport
      ? JSON.stringify(
          latestReport,
          null,
          2
        )
      : "No completed report was provided.";

  const prompt = `
You are the AI game-generation engine for KidMind.

You must analyze ONE child's assessment profile and generate ONE complete personalized cognitive game.

The game will be loaded directly into KidMind's Game Builder.

IMPORTANT:
This is NOT a medical diagnosis.
Do not diagnose ADHD, autism, learning disorders, or any other disorder.
Only describe observable performance patterns.
The therapist reviews the generated game before saving it.

============================================================
CHILD
============================================================

Name:
${child.name ?? "Unknown Child"}

Age:
${child.age ?? 0}

============================================================
LATEST COMPLETED ASSESSMENT REPORT
============================================================

Use this database report as the PRIMARY source of truth:

${latestReportJson}

Derived summary metrics, when available:

Accuracy:
${results.accuracy ?? "Not available"}

Errors / Mistakes:
${results.errors ?? "Not available"}

Average Reaction Time:
${results.responseTime ?? "Not available"} seconds

Explicit Attention Score:
${results.attention ?? "Not available"}

Explicit Working Memory Score:
${results.workingMemory ?? "Not available"}

Explicit Executive Functions Score:
${results.executiveFunctions ?? "Not available"}

Explicit Impulsivity Score:
${results.impulsivity ?? "Not available"}

IMPORTANT DATA RULES:

- Do NOT invent cognitive-domain scores that are not present in the report.
- Base your interpretation on the actual game names, score, accuracy, mistakes,
  reaction time, duration, and recorded result summaries.
- If a domain is inferred from a game name or performance pattern, clearly treat
  it as a practice recommendation, not as a diagnosis or a measured clinical score.
- Prefer the most recent report only. Do not claim longitudinal change from one report.

============================================================
AVAILABLE GAME TYPES
============================================================

1. Memory
   Use for working-memory or memory-related performance patterns.

2. Attention
   Use for attention, selective attention, response control, or impulsivity patterns.

3. Sequence
   Use for executive functions, planning, sequencing, or reading-related activity.

4. Processing Speed
   Use for processing speed and response-time patterns.

Choose the game based on THIS child's profile.

Do NOT always choose the same game.

============================================================
GAME REQUIREMENTS
============================================================

Generate a complete game.

The Game Builder needs:

- gameName
- gameDescription
- gameType
- domain
- difficulty
- timeLimit
- lives
- levels
- progressiveDifficulty
- scoreEnabled
- targetSkill
- secondaryConcern
- analysis
- therapyPlan
- objects
- rules

The game must have exactly 3 progressive levels conceptually.

The generated objects MUST already be usable by the Game Builder.

Every object MUST contain:

{
  "id": "unique-string",
  "type": "shape",
  "elementId": "circle",
  "name": "Target",
  "x": 100,
  "y": 150,
  "width": 100,
  "height": 100,
  "color": "#7C6CFF",
  "text": "",
  "shape": "circle",
  "image": null,
  "visible": true,
  "rotation": 0,
  "role": "target"
}

Allowed shape values:

circle
square
triangle
star
diamond
card

Allowed object types:

shape
text
button
image

Prefer shape objects because they are safest for the Game Builder preview.

Objects should be placed inside a canvas approximately 1000x650.

Do not place objects outside the canvas.

Create enough objects to make the game meaningful.

============================================================
RULE REQUIREMENTS
============================================================

Every rule MUST contain:

{
  "id": "unique-string",
  "trigger": "object-clicked",
  "triggerTargetId": "object-id",
  "action": "add-score",
  "targetIds": ["object-id"],
  "value": 5,
  "wait": 0,
  "moveX": 0,
  "moveY": 0,
  "enabled": true,
  "description": "Clear explanation"
}

Useful actions include:

add-score
hide
show
move
reset
end-game

Useful triggers include:

object-clicked
timer
game-start

Rules must reference real object IDs.

Do not reference objects that do not exist.

============================================================
PERSONALIZATION
============================================================

Analyze the latest report and identify:

1. The strongest observed performance area.
2. The main area that would benefit from reinforcement.
3. A secondary concern if supported by the recorded results.
4. A short practical strengthening / therapeutic practice plan.
5. A game type that directly practices the main target skill.

Consider ALL recorded assessment results.

Examples:

- Lower working memory -> Memory game
- Lower attention / higher impulsivity -> Attention game
- Lower executive functions -> Sequence game
- Slower response time -> Processing Speed game
- Reading-related activity can use Sequence

These are performance-based choices, NOT diagnoses.

Difficulty:

Easy:
better overall performance

Medium:
mixed performance

Hard:
greater observed difficulty

Use reasonable game settings.

Easy:
timeLimit around 60
lives 3

Medium:
timeLimit around 45
lives 3

Hard:
timeLimit around 30
lives 2

============================================================
OUTPUT
============================================================

Return ONLY valid JSON.

No markdown.
No code fences.
No explanation outside JSON.

Use exactly this structure:

{
  "gameName": "string",
  "gameDescription": "string",
  "gameType": "Memory | Attention | Sequence | Processing Speed",
  "domain": "Attention | Memory | Executive Functions | Processing Speed | Reading",
  "difficulty": "Easy | Medium | Hard",
  "timeLimit": 45,
  "lives": 3,
  "levels": 3,
  "progressiveDifficulty": true,
  "scoreEnabled": true,
  "targetSkill": "string",
  "secondaryConcern": "string",
  "analysis": "string",
  "therapyPlan": "A concise 3-5 step strengthening plan grounded in the latest report.",

  "objects": [
    {
      "id": "object_1",
      "type": "shape",
      "elementId": "circle",
      "name": "Target",
      "x": 100,
      "y": 150,
      "width": 100,
      "height": 100,
      "color": "#7C6CFF",
      "text": "",
      "shape": "circle",
      "image": null,
      "visible": true,
      "rotation": 0,
      "role": "target"
    }
  ],

  "rules": [
    {
      "id": "rule_1",
      "trigger": "object-clicked",
      "triggerTargetId": "object_1",
      "action": "add-score",
      "targetIds": ["object_1"],
      "value": 5,
      "wait": 0,
      "moveX": 0,
      "moveY": 0,
      "enabled": true,
      "description": "Clicking the correct target adds points."
    }
  ]
}
`;

  const response =
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
        GEMINI_API_KEY
      )}`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0.35,

            responseMimeType:
              "application/json",
          },
        }),
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Gemini API error (${response.status}): ${errorText}`
    );
  }

  const data =
    await response.json();

  const generatedText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  const cleaned =
    cleanJson(generatedText);

  let parsed: any;

  try {
    parsed =
      JSON.parse(cleaned);
  } catch {
    console.error(
      "Invalid Gemini JSON:",
      generatedText
    );

    throw new Error(
      "Gemini returned invalid JSON."
    );
  }

  return normalizeGame(
    parsed,
    child
  );
}