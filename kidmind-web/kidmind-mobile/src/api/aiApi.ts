import {
  authRequest,
} from "@/api/authApi";


export type AIChild = {
  id: number;
  full_name?: string | null;
  name?: string | null;
  age?: number | null;
  gender?: string | null;
  region?: string | null;
  parent_name?: string | null;
};


export type AISourceGame = {
  gameName?: string | null;
  game_name?: string | null;
  difficulty?: string | null;
  durationSeconds?: number | null;
  score?: number | null;
  accuracy?: number | null;
  mistakes?: number | null;
  reactionTime?: number | null;
  resultSummary?: unknown;
};


export type AISourceReport = {
  sessionId?: number | null;
  status?: string | null;
  assessmentDate?: string | null;
  durationSeconds?: number | null;
  score?: number | null;
  averageAccuracy?: number | null;
  totalMistakes?: number | null;
  averageReactionTime?: number | null;
  games?: AISourceGame[];
};


export type AIBuilderObject = {
  id: string;
  type: string;
  elementId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text: string;
  shape: string | null;
  image: string | null;
  visible: boolean;
  rotation: number;
  [key: string]: unknown;
};


export type AIBuilderRule = {
  id: string;
  trigger: string;
  triggerTargetId: string;
  action: string;
  targetIds: string[];
  value: number;
  wait: number;
  moveX: number;
  moveY: number;
  enabled: boolean;
  description?: string;
  [key: string]: unknown;
};


export type GeneratedAIGame = {
  title?: string;
  description?: string;
  domain?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  gameSettings?: {
    difficulty?: string;
    timeSeconds?: number;
    time?: number;
    lives?: number;
    scoreEnabled?: boolean;
  };
  gameId?: string;
  gameName?: string;
  gameDescription?: string;
  gameType?: string;
  timeLimit?: number;
  levels?: number;
  progressiveDifficulty?: boolean;
  scoreEnabled?: boolean;
  childId?: number | null;
  childName?: string | null;
  childAge?: number | null;
  targetSkill?: string;
  secondaryConcern?: string;
  analysis?: string;
  therapyPlan?: string;
  reportSnapshot?: Record<string, unknown> | null;
  aiGenerated?: boolean;
  aiChildId?: number | null;
  aiChildName?: string | null;
  aiTargetSkill?: string;
  aiAnalysis?: string;
  objects?: AIBuilderObject[];
  rules?: AIBuilderRule[];
  isAiGenerated?: boolean;
};


export type GenerateChildAIResponse = {
  success: boolean;
  message?: string;
  data?: {
    sourceReport?: AISourceReport | null;
    primarySkill?: string;
    secondaryConcern?: string;
    analysis?: string;
    therapyPlan?: string;
    game?: GeneratedAIGame;
  };
};


const unwrapChildren = (
  value: unknown
): AIChild[] => {
  if (
    Array.isArray(
      value
    )
  ) {
    return value as AIChild[];
  }

  if (
    value &&
    typeof value === "object" &&
    "children" in value &&
    Array.isArray(
      (value as {
        children?: unknown;
      }).children
    )
  ) {
    return (
      value as {
        children: AIChild[];
      }
    ).children;
  }

  return [];
};


export const getAIChildren =
  async (): Promise<
    AIChild[]
  > => {
    const response =
      await authRequest<unknown>(
        "/children"
      );

    return unwrapChildren(
      response
    );
  };


export const generateChildAIGame =
  async (
    childId: number
  ): Promise<
    GenerateChildAIResponse
  > => {
    return authRequest<
      GenerateChildAIResponse
    >(
      "/ai/generate-game",
      {
        method: "POST",
        body:
          JSON.stringify({
            child_id:
              childId,
          }),
      }
    );
  };
