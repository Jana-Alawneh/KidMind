import type {
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../middleware/authMiddleware";

import {
  clearUserPresence,
  getUserById,
  touchUserPresence,
} from "../models/userModel";


export const heartbeatUserPresence =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      if (!req.auth) {

        return res.status(401).json({
          message:
            "Authentication required",
        });

      }


      const user =
        await getUserById(
          req.auth.id
        );


      if (!user) {

        return res.status(404).json({
          message:
            "User not found",
        });

      }


      if (
        !user.is_active
      ) {

        return res.status(403).json({
          message:
            "This account is inactive",
        });

      }


      await touchUserPresence(
        user.id
      );


      return res.json({
        online: true,
      });

    } catch (error) {

      console.error(
        "Heartbeat presence error:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };


export const markUserOffline =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      if (!req.auth) {

        return res.status(401).json({
          message:
            "Authentication required",
        });

      }


      await clearUserPresence(
        req.auth.id
      );


      return res.json({
        online: false,
      });

    } catch (error) {

      console.error(
        "Mark user offline error:",
        error
      );


      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };
