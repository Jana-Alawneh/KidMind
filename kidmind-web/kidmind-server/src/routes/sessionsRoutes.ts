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
  fetchParentSessionById,
  fetchParentSessions,
  fetchSessionById,
  pauseSession,
  resumeSession,
  startSessionGame,
} from "../controllers/sessionController";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware";


const router =
  Router();


router.get(
  "/parent",
  authenticate,
  authorizeRoles(
    "parent"
  ),
  fetchParentSessions
);


router.get(
  "/parent/:sessionId",
  authenticate,
  authorizeRoles(
    "parent"
  ),
  fetchParentSessionById
);


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