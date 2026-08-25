import {
  Router,
} from "express";

import {
  assignUserToChild,
  changeCurrentUserPassword,
  changeUserStatus,
  fetchAssignments,
  fetchAvailableChildren,
  fetchChildUsers,
  fetchCurrentUser,
  fetchParentChild,
  fetchParentChildren,
  fetchParentTherapists,
  fetchSettings,
  fetchUserDeleteInfo,
  fetchUsers,
  loginUser,
  registerUser,
  removeUser,
  removeUserFromChild,
  updateCurrentUserProfile,
  updateCurrentUserSettings,
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
  "/settings",
  authenticate,
  fetchSettings
);


router.put(
  "/settings/profile",
  authenticate,
  updateCurrentUserProfile
);


router.put(
  "/settings/password",
  authenticate,
  changeCurrentUserPassword
);


router.put(
  "/settings/preferences",
  authenticate,
  updateCurrentUserSettings
);


router.get(
  "/parent/children",
  authenticate,
  authorizeRoles(
    "parent"
  ),
  fetchParentChildren
);


router.get(
  "/parent/children/:childId",
  authenticate,
  authorizeRoles(
    "parent"
  ),
  fetchParentChild
);


router.get(
  "/parent/therapists",
  authenticate,
  authorizeRoles(
    "parent"
  ),
  fetchParentTherapists
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
  "/available-children",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  fetchAvailableChildren
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


router.get(
  "/:userId/delete-info",
  authenticate,
  authorizeRoles(
    "admin"
  ),
  fetchUserDeleteInfo
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