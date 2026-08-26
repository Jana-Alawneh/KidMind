import {
  Router,
} from "express";

import {
  fetchUsers,
  fetchChildById,
  fetchChildDeleteInfo,
  createChild,
  removeChild,
  editChild,
  editParentChild,
} from "../controllers/childController";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware";

const router =
  Router();

router.get(
  "/",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  fetchUsers
);

router.put(
  "/parent/:id",
  authenticate,
  authorizeRoles(
    "parent"
  ),
  editParentChild
);

router.get(
  "/:id/delete-info",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  fetchChildDeleteInfo
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist",
    "parent"
  ),
  fetchChildById
);

router.post(
  "/",
  createChild
);

router.put(
  "/:id",
  editChild
);

router.delete(
  "/:id",
  removeChild
);

export default router;
