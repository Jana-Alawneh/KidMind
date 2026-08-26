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
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  createSession
);


router.get(
  "/",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  fetchAllSessions
);


router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  fetchSessionById
);


router.patch(
  "/:id/pause",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  pauseSession
);


router.patch(
  "/:id/resume",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  resumeSession
);


router.patch(
  "/:id/complete",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  completeSession
);


router.patch(
  "/:id/end",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  endSession
);


router.patch(
  "/:id/cancel",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  cancelSession
);


router.patch(
  "/:sessionId/games/:gameId/start",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  startSessionGame
);


router.patch(
  "/:sessionId/games/:gameId/complete",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  completeSessionGame
);


export default router;