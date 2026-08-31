import {
  Router,
} from "express";

import {
  fetchAdminFeedback,
  submitParentFeedback,
} from "../controllers/feedbackController";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware";


const router =
  Router();


router.post(
  "/",
  authenticate,
  authorizeRoles(
    "parent"
  ),
  submitParentFeedback
);


router.get(
  "/",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  fetchAdminFeedback
);


export default router;