import {
  Router,
} from "express";

import {
  cancelSession,
  completeSession,
  completeSessionGame,
  createSession,
  endSession,
  fetchAllSessions,
  fetchSessionById,
  pauseSession,
  resumeSession,
  startSessionGame,
} from "../controllers/sessionController";


const router = Router();


router.post(
  "/",
  createSession
);


router.get(
  "/",
  fetchAllSessions
);


router.get(
  "/:id",
  fetchSessionById
);


router.patch(
  "/:id/pause",
  pauseSession
);


router.patch(
  "/:id/resume",
  resumeSession
);


router.patch(
  "/:id/complete",
  completeSession
);


router.patch(
  "/:id/end",
  endSession
);


router.patch(
  "/:id/cancel",
  cancelSession
);


router.patch(
  "/:sessionId/games/:gameId/start",
  startSessionGame
);


router.patch(
  "/:sessionId/games/:gameId/complete",
  completeSessionGame
);


export default router;