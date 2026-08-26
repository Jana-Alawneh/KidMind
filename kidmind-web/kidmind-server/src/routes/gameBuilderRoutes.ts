import {
  Router,
} from "express";

import {
  assignGameBuilderGameController,
  createGameBuilderGameController,
  deleteGameBuilderGameController,
  fetchGameBuilderAssignmentOptions,
  fetchGameBuilderAssignmentsController,
  fetchGameBuilderGame,
  fetchGameBuilderGames,
  removeGameBuilderAssignmentController,
  updateGameBuilderGameController,
} from "../controllers/gameBuilderController";

import {
  authenticate,
} from "../middleware/authMiddleware";


const router =
  Router();


router.use(
  authenticate
);


router.get(
  "/",
  fetchGameBuilderGames
);


router.get(
  "/:gameId/assignment-options",
  fetchGameBuilderAssignmentOptions
);


router.get(
  "/:gameId/assignments",
  fetchGameBuilderAssignmentsController
);


router.post(
  "/:gameId/assignments",
  assignGameBuilderGameController
);


router.delete(
  "/:gameId/assignments/:assignmentId",
  removeGameBuilderAssignmentController
);


router.get(
  "/:gameId",
  fetchGameBuilderGame
);


router.post(
  "/",
  createGameBuilderGameController
);


router.put(
  "/:gameId",
  updateGameBuilderGameController
);


router.delete(
  "/:gameId",
  deleteGameBuilderGameController
);


export default router;
