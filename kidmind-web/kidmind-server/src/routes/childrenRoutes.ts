import {
  Router,
} from "express";

import {
  fetchUsers,
  fetchChildById,
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
  "/:id",
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