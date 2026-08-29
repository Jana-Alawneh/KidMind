import type {
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../middleware/authMiddleware";

import {
  getNotificationsForUser,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../models/notificationModel";

import {
  getUserById,
} from "../models/userModel";


const parsePositiveId =
  (
    value: unknown
  ) => {

    const id =
      Number(value);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return null;
    }


    return id;

  };


const getActiveAuthenticatedUser =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    if (
      !req.auth
    ) {

      res.status(401).json({
        message:
          "Authentication required",
      });

      return null;

    }


    const user =
      await getUserById(
        req.auth.id
      );


    if (
      !user
    ) {

      res.status(404).json({
        message:
          "User not found",
      });

      return null;

    }


    if (
      !user.is_active
    ) {

      res.status(403).json({
        message:
          "This account is inactive",
      });

      return null;

    }


    return user;

  };


export const fetchNotifications =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const currentUser =
        await getActiveAuthenticatedUser(
          req,
          res
        );


      if (
        !currentUser
      ) {
        return;
      }


      const requestedLimit =
        Number(
          req.query.limit
        );


      const limit =
        Number.isInteger(
          requestedLimit
        ) &&
        requestedLimit > 0
          ? Math.min(
              requestedLimit,
              100
            )
          : 50;


      const unreadOnly =
        req.query.unread ===
          "1" ||
        req.query.unread ===
          "true";


      const notifications =
        await getNotificationsForUser(
          currentUser.id,
          limit,
          unreadOnly
        );


      return res.json({
        notifications,
      });

    } catch (
      error
    ) {

      console.error(
        "Fetch notifications error:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const fetchUnreadNotificationCount =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const currentUser =
        await getActiveAuthenticatedUser(
          req,
          res
        );


      if (
        !currentUser
      ) {
        return;
      }


      const unreadCount =
        await getUnreadNotificationCount(
          currentUser.id
        );


      return res.json({
        unread_count:
          unreadCount,
      });

    } catch (
      error
    ) {

      console.error(
        "Fetch unread notification count error:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const markNotificationRead =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const currentUser =
        await getActiveAuthenticatedUser(
          req,
          res
        );


      if (
        !currentUser
      ) {
        return;
      }


      const notificationId =
        parsePositiveId(
          req.params.notificationId
        );


      if (
        !notificationId
      ) {

        return res.status(400).json({
          message:
            "Invalid notification ID",
        });

      }


      const affectedRows =
        await markNotificationAsRead(
          currentUser.id,
          notificationId
        );


      if (
        affectedRows === 0
      ) {

        return res.status(404).json({
          message:
            "Notification not found",
        });

      }


      return res.json({
        message:
          "Notification marked as read",
      });

    } catch (
      error
    ) {

      console.error(
        "Mark notification read error:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const markAllNotificationsRead =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const currentUser =
        await getActiveAuthenticatedUser(
          req,
          res
        );


      if (
        !currentUser
      ) {
        return;
      }


      const updated =
        await markAllNotificationsAsRead(
          currentUser.id
        );


      return res.json({
        message:
          "All notifications marked as read",

        updated,
      });

    } catch (
      error
    ) {

      console.error(
        "Mark all notifications read error:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };