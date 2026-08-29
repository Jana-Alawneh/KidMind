import {
  Router,
} from "express";

import {
  generateGameWithAI,
} from "../controllers/aiController";

import {
  authenticate,
} from "../middleware/authMiddleware";


const router =
  Router();


/* ============================================================
   AUTHENTICATION
============================================================ */

router.use(
  authenticate
);


/* ============================================================
   AI GAME GENERATION
============================================================ */

router.post(
  "/generate-game",
  generateGameWithAI
);


export default router;