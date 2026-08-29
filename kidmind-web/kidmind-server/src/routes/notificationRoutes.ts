import {
  Router,
} from "express";

import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController";

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
  fetchNotifications
);


router.get(
  "/unread-count",
  fetchUnreadNotificationCount
);


router.put(
  "/read-all",
  markAllNotificationsRead
);


router.put(
  "/:notificationId/read",
  markNotificationRead
);


export default router;