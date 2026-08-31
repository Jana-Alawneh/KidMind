import fs from "fs";
import path from "path";

import multer from "multer";

import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import {
  assignUserToChild,
  changeCurrentUserPassword,
  changeUserStatus,
  fetchAssignments,
  fetchAssignableParents,
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
  heartbeatUserPresence,
  markUserOffline,
} from "../controllers/presenceController";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware";


const router =
  Router();


const avatarUploadDirectory =
  path.resolve(
    process.cwd(),
    "uploads",
    "avatars"
  );


fs.mkdirSync(
  avatarUploadDirectory,
  {
    recursive: true,
  }
);


const avatarExtensionByMimeType:
  Record<
    string,
    string
  > = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };


const avatarStorage =
  multer.diskStorage({

    destination: (
      _req,
      _file,
      callback
    ) => {

      callback(
        null,
        avatarUploadDirectory
      );

    },

    filename: (
      _req,
      file,
      callback
    ) => {

      const extension =
        avatarExtensionByMimeType[
          file.mimetype
        ] || ".jpg";

      callback(
        null,
        `avatar-${Date.now()}-${Math.round(
          Math.random() *
            1_000_000_000
        )}${extension}`
      );

    },

  });


const avatarUpload =
  multer({
    storage:
      avatarStorage,
    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
    fileFilter: (
      _req,
      file,
      callback
    ) => {

      if (
        avatarExtensionByMimeType[
          file.mimetype
        ]
      ) {

        callback(
          null,
          true
        );

        return;

      }

      callback(
        new Error(
          "Profile photo must be JPG, PNG or WEBP."
        )
      );

    },
  });


const handleAvatarUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  avatarUpload.single(
    "avatar"
  )(
    req,
    res,
    error => {

      if (!error) {

        next();
        return;

      }

      if (
        error instanceof
          multer.MulterError &&
        error.code ===
          "LIMIT_FILE_SIZE"
      ) {

        res.status(400).json({
          message:
            "Profile photo must be 5MB or smaller.",
        });

        return;

      }

      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Unable to upload profile photo.",
      });

    }
  );

};


router.post(
  "/login",
  loginUser
);


router.get(
  "/me",
  authenticate,
  fetchCurrentUser
);


router.post(
  "/presence/heartbeat",
  authenticate,
  heartbeatUserPresence
);


router.post(
  "/presence/offline",
  authenticate,
  markUserOffline
);


router.get(
  "/settings",
  authenticate,
  fetchSettings
);


router.put(
  "/settings/profile",
  authenticate,
  handleAvatarUpload,
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
  "/assignable-parents",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  fetchAssignableParents
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
    "admin",
    "therapist"
  ),
  fetchChildUsers
);


router.post(
  "/assignments",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
  ),
  assignUserToChild
);


router.delete(
  "/assignments/:childId/:userId",
  authenticate,
  authorizeRoles(
    "admin",
    "therapist"
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
