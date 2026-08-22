import {
  Router,
} from "express";

import {
  assignUserToChild,
  changeUserStatus,
  fetchAssignments,
  fetchChildUsers,
  fetchCurrentUser,
  fetchUsers,
  loginUser,
  registerUser,
  removeUser,
  removeUserFromChild,
  updateUserAsAdmin,
} from "../controllers/userController";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware";


const router =
  Router();


router.post(
  "/login",
  loginUser
);


router.get(
  "/me",
  authenticate,
  fetchCurrentUser
);


router.get(
  "/",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  fetchUsers
);


router.post(
  "/register",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  registerUser
);


router.get(
  "/assignments",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  fetchAssignments
);


router.get(
  "/children/:childId/users",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  fetchChildUsers
);


router.post(
  "/assignments",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  assignUserToChild
);


router.delete(
  "/assignments/:childId/:userId",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  removeUserFromChild
);


router.put(
  "/:userId",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  updateUserAsAdmin
);


router.patch(
  "/:userId/status",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  changeUserStatus
);


router.delete(
  "/:userId",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  removeUser
);


export default router;