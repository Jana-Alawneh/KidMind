import type {
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../middleware/authMiddleware";

import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
} from "../models/feedbackModel";

import {
  createNotification,
} from "../models/notificationModel";

import {
  getAllUsers,
  getUserById,
} from "../models/userModel";


const MAX_FEEDBACK_LENGTH =
  2000;


export const submitParentFeedback =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      if (
        !req.auth
      ) {

        return res
          .status(401)
          .json({
            message:
              "Authentication required",
          });

      }


      if (
        req.auth.role !==
        "parent"
      ) {

        return res
          .status(403)
          .json({
            message:
              "Parent access required",
          });

      }


      const parent =
        await getUserById(
          req.auth.id
        );


      if (
        !parent
      ) {

        return res
          .status(404)
          .json({
            message:
              "Parent account not found",
          });

      }


      if (
        !parent.is_active
      ) {

        return res
          .status(403)
          .json({
            message:
              "This account is inactive",
          });

      }


      const rawMessage =
        req.body?.message;


      if (
        typeof rawMessage !==
        "string"
      ) {

        return res
          .status(400)
          .json({
            message:
              "Feedback message is required",
          });

      }


      const message =
        rawMessage.trim();


      if (
        !message
      ) {

        return res
          .status(400)
          .json({
            message:
              "Feedback message is required",
          });

      }


      if (
        message.length >
        MAX_FEEDBACK_LENGTH
      ) {

        return res
          .status(400)
          .json({
            message:
              `Feedback cannot exceed ${MAX_FEEDBACK_LENGTH} characters`,
          });

      }


      const feedbackId =
        await createFeedback(
          req.auth.id,
          message
        );


      const feedback =
        await getFeedbackById(
          feedbackId
        );


      /*
       * Notify every active Admin.
       *
       * Notification failure must NOT cancel
       * the successfully saved feedback.
       */
      try {

        const users =
          await getAllUsers();


        const admins =
          users.filter(
            user =>
              user.role ===
                "admin" &&
              (
                user.is_active ===
                  true ||
                Number(
                  user.is_active
                ) === 1
              )
          );


        for (
          const admin of admins
        ) {

          await createNotification({
            userId:
              Number(
                admin.id
              ),

            type:
              "new_feedback",

            title:
              "New Parent Feedback",

            body:
              `${parent.full_name} submitted new feedback.`,

            actorUserId:
              parent.id,

            childId:
              null,

            entityType:
              "feedback",

            entityId:
              feedbackId,

            actionPath:
  "/admin?section=feedback",
          });

        }

      } catch (
        notificationError
      ) {

        console.error(
          "Failed to create feedback notification:",
          notificationError
        );

      }


      return res
        .status(201)
        .json({
          message:
            "Feedback sent successfully",
          feedback,
        });

    } catch (
      error
    ) {

      console.error(
        "Submit parent feedback error:",
        error
      );


      return res
        .status(500)
        .json({
          message:
            "Server Error",
        });

    }

  };


export const fetchAdminFeedback =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      if (
        !req.auth
      ) {

        return res
          .status(401)
          .json({
            message:
              "Authentication required",
          });

      }


      if (
        req.auth.role !==
        "admin"
      ) {

        return res
          .status(403)
          .json({
            message:
              "Admin access required",
          });

      }


      const feedback =
        await getAllFeedback();


      return res.json({
        feedback,
      });

    } catch (
      error
    ) {

      console.error(
        "Fetch admin feedback error:",
        error
      );


      return res
        .status(500)
        .json({
          message:
            "Server Error",
        });

    }

  };