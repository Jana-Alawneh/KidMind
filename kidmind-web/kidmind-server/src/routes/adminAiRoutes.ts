import {
  Router,
} from "express";

import {
  fetchAdminAIInsights,
} from "../controllers/adminAiController";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware";


const router =
  Router();


router.get(
  "/admin-insights",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  fetchAdminAIInsights
);


export default router;
