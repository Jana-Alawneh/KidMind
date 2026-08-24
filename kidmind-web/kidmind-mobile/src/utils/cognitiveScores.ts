export type SessionGame = {
  id?: number;
  game_name?: string | null;
  name?: string | null;
  status?: string | null;
  score?: number | string | null;
  accuracy?: number | string | null;
  ended_at?: string | null;
  started_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type CognitiveSession = {
  id?: number;
  child_id?: number;
  status?: string | null;
  score?: number | string | null;
  duration_seconds?: number | string | null;
  ended_at?: string | null;
  started_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  games?: SessionGame[];
};

export const domainConfigs = [
  { key: "focus", label: "Focus", gameName: "focus finder" },
  { key: "memory", label: "Memory", gameName: "memory match" },
  { key: "problemSolving", label: "Problem Solving", gameName: "puzzle path" },
  { key: "reading", label: "Reading", gameName: "reading adventure" },
  { key: "processingSpeed", label: "Processing Speed", gameName: "quick match" },
] as const;

export const normalizeGameName = (value?: string | null) =>
  String(value || "").trim().toLowerCase();

const getTimestamp = (
  game?: SessionGame | null,
  session?: CognitiveSession | null
) => {
  const value =
    game?.ended_at ||
    game?.started_at ||
    game?.updated_at ||
    game?.created_at ||
    session?.ended_at ||
    session?.started_at ||
    session?.updated_at ||
    session?.created_at;

  if (!value) return 0;

  const timestamp = new Date(String(value).replace(" ", "T")).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const getLatestGameScore = (
  sessions: CognitiveSession[],
  gameName: string
): number | null => {
  const matches: { score: number; timestamp: number }[] = [];

  sessions.forEach((session) => {
    const games = Array.isArray(session.games) ? session.games : [];

    games.forEach((game) => {
      const isFinished =
        game.status === "Completed" || game.status === "Failed";

      if (
        !isFinished ||
        normalizeGameName(game.game_name) !== normalizeGameName(gameName)
      ) {
        return;
      }

      if (
        game.score === null ||
        game.score === undefined ||
        game.score === ""
      ) {
        return;
      }

      const score = Number(game.score);
      if (!Number.isFinite(score)) return;

      matches.push({
        score: Math.max(0, Math.min(100, Math.round(score))),
        timestamp: getTimestamp(game, session),
      });
    });
  });

  if (!matches.length) return null;

  matches.sort((a, b) => b.timestamp - a.timestamp);
  return matches[0].score;
};

export const getCognitiveDomains = (sessions: CognitiveSession[]) =>
  domainConfigs.map((domain) => ({
    ...domain,
    score: getLatestGameScore(sessions, domain.gameName),
  }));

export const calculateCognitiveScore = (
  sessions: CognitiveSession[]
): number | null => {
  const values = getCognitiveDomains(sessions)
    .map((domain) => domain.score)
    .filter((value): value is number => typeof value === "number");

  if (!values.length) return null;

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  );
};

export const getLatestCompletedAssessment = (
  sessions: CognitiveSession[]
): CognitiveSession | null => {
  const completed = sessions.filter(
    (session) => session.status === "Completed"
  );

  if (!completed.length) return null;

  return [...completed].sort(
    (a, b) => getTimestamp(null, b) - getTimestamp(null, a)
  )[0];
};

export const getAverageSessionScore = (
  sessions: CognitiveSession[]
): number | null => {
  const scores = sessions
    .filter(
      (session) =>
        session.status === "Completed" || session.status === "Ended"
    )
    .map((session) => {
      if (
        session.score === null ||
        session.score === undefined ||
        session.score === ""
      ) {
        return null;
      }

      const score = Number(session.score);
      if (!Number.isFinite(score)) return null;

      return Math.max(0, Math.min(100, Math.round(score)));
    })
    .filter((score): score is number => score !== null);

  if (!scores.length) return null;

  return Math.round(
    scores.reduce((total, score) => total + score, 0) / scores.length
  );
};