import type {
  AIBuilderObject,
  AIBuilderRule,
  AISourceReport,
} from "@/api/aiApi";


export type AIGameDraft = {
  source: "GEMINI_AI";
  aiGenerated: true;
  childId: number | null;
  childName: string | null;
  childAge: number | null;
  gameName: string;
  gameDescription: string;
  domain: string;
  difficulty:
    | "Easy"
    | "Medium"
    | "Hard";
  timeLimit: number;
  lives: number;
  scoreEnabled: boolean;
  levels: number;
  progressiveDifficulty: boolean;
  targetSkill: string;
  secondaryConcern: string;
  analysis: string;
  therapyPlan: string;
  sourceReport: AISourceReport | null;
  objects: AIBuilderObject[];
  rules: AIBuilderRule[];
  generatedAt: string;
};


let currentDraft:
  AIGameDraft | null =
  null;


export const setAIGameDraft = (
  draft: AIGameDraft
) => {
  currentDraft =
    draft;
};


export const peekAIGameDraft =
  () => currentDraft;


export const takeAIGameDraft =
  () => {
    const draft =
      currentDraft;

    currentDraft =
      null;

    return draft;
  };


export const clearAIGameDraft =
  () => {
    currentDraft =
      null;
  };
