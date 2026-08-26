import type {
  Response,
} from "express";

import {
  clearConversationForUser,
  createMessage,
  getConversationForUser,
  getConversationMessages,
  getLatestConversationMessage,
  getMessageById,
  getOrCreateConversation,
  getUserConversations,
  isUserInConversation,
  markConversationAsRead,
  updateConversationMutedState,
  type ChatConversationType,
} from "../models/chatModel";

import {
  getAllUsers,
  getChildForUser,
  getChildrenForUser,
  getTherapistsForUserChildren,
  getUserById,
  getUsersForChild,
  type UserRow,
} from "../models/userModel";

import type {
  AuthenticatedRequest,
} from "../middleware/authMiddleware";

type ConversationAccess = {
  conversationType:
    ChatConversationType;
  childId: number;
};

const parsePositiveId = (
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

    if (!req.auth) {

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

    if (!user) {

      res.status(404).json({
        message:
          "User not found",
      });

      return null;

    }

    if (!user.is_active) {

      res.status(403).json({
        message:
          "This account is inactive",
      });

      return null;

    }

    return user;

  };

const resolveConversationAccess =
  async (
    currentUser: UserRow,
    targetUser: UserRow,
    requestedChildId:
      | number
      | null
  ): Promise<
    ConversationAccess | null
  > => {

    if (
      currentUser.id ===
      targetUser.id
    ) {
      return null;
    }

    if (
      !targetUser.is_active
    ) {
      return null;
    }

    if (
      currentUser.role ===
        "parent" &&
      targetUser.role ===
        "therapist"
    ) {

      if (!requestedChildId) {
        return null;
      }

      const currentChild =
        await getChildForUser(
          currentUser.id,
          requestedChildId
        );

      if (!currentChild) {
        return null;
      }

      const childUsers =
        await getUsersForChild(
          requestedChildId
        );

      const therapistIsAssigned =
        childUsers.some(
          item =>
            Number(item.id) ===
              Number(
                targetUser.id
              ) &&
            item.role ===
              "therapist"
        );

      if (
        !therapistIsAssigned
      ) {
        return null;
      }

      return {
        conversationType:
          "child",
        childId:
          requestedChildId,
      };

    }

    if (
      currentUser.role ===
        "therapist" &&
      targetUser.role ===
        "parent"
    ) {

      if (!requestedChildId) {
        return null;
      }

      const currentChild =
        await getChildForUser(
          currentUser.id,
          requestedChildId
        );

      if (!currentChild) {
        return null;
      }

      const childUsers =
        await getUsersForChild(
          requestedChildId
        );

      const parentIsAssigned =
        childUsers.some(
          item =>
            Number(item.id) ===
              Number(
                targetUser.id
              ) &&
            item.role ===
              "parent"
        );

      if (
        !parentIsAssigned
      ) {
        return null;
      }

      return {
        conversationType:
          "child",
        childId:
          requestedChildId,
      };

    }

    if (
      currentUser.role ===
        "therapist" &&
      targetUser.role ===
        "admin"
    ) {

      return {
        conversationType:
          "direct",
        childId: 0,
      };

    }

    if (
      currentUser.role ===
        "admin" &&
      targetUser.role ===
        "therapist"
    ) {

      return {
        conversationType:
          "direct",
        childId: 0,
      };

    }

    if (
      currentUser.role ===
        "therapist" &&
      targetUser.role ===
        "therapist"
    ) {

      return {
        conversationType:
          "direct",
        childId: 0,
      };

    }

    return null;

  };

export const fetchChatContacts =
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

      if (!currentUser) {
        return;
      }

      if (
        currentUser.role ===
        "parent"
      ) {

        const therapists =
          await getTherapistsForUserChildren(
            currentUser.id
          );

        return res.json(
          therapists
            .filter(
              item =>
                Boolean(
                  item.is_active
                )
            )
            .map(
              item => ({
                user_id:
                  Number(item.id),
                full_name:
                  item.full_name,
                email:
                  item.email,
                phone:
                  item.phone,
                region:
                  item.region,
                avatar_url:
                  item.avatar_url,
                role:
                  "therapist",
                child_id:
                  Number(
                    item.child_id
                  ),
                child_name:
                  item.child_name,
                conversation_type:
                  "child",
              })
            )
        );

      }

      if (
        currentUser.role ===
        "admin"
      ) {

        const users =
          await getAllUsers();

        return res.json(
          users
            .filter(
              item =>
                item.role ===
                  "therapist" &&
                Boolean(
                  item.is_active
                )
            )
            .map(
              item => ({
                user_id:
                  Number(item.id),
                full_name:
                  item.full_name,
                email:
                  item.email,
                phone:
                  item.phone,
                region:
                  item.region,
                avatar_url:
                  item.avatar_url,
                role:
                  item.role,
                child_id: null,
                child_name: null,
                conversation_type:
                  "direct",
              })
            )
        );

      }

      const [
        children,
        users,
      ] =
        await Promise.all([
          getChildrenForUser(
            currentUser.id
          ),
          getAllUsers(),
        ]);

      const contacts:
        Array<
          Record<
            string,
            unknown
          >
        > = [];

      for (
        const child of children
      ) {

        const childUsers =
          await getUsersForChild(
            Number(child.id)
          );

        for (
          const childUser of
            childUsers
        ) {

          if (
            childUser.role !==
              "parent" ||
            !childUser.is_active
          ) {
            continue;
          }

          contacts.push({
            user_id:
              Number(
                childUser.id
              ),
            full_name:
              childUser.full_name,
            email:
              childUser.email,
            phone:
              childUser.phone,
            region:
              childUser.region,
            avatar_url:
              childUser.avatar_url,
            role:
              "parent",
            child_id:
              Number(child.id),
            child_name:
              child.full_name,
            conversation_type:
              "child",
          });

        }

      }

      users
        .filter(
          item =>
            Boolean(
              item.is_active
            ) &&
            Number(item.id) !==
              Number(
                currentUser.id
              ) &&
            (
              item.role ===
                "admin" ||
              item.role ===
                "therapist"
            )
        )
        .forEach(
          item => {

            contacts.push({
              user_id:
                Number(item.id),
              full_name:
                item.full_name,
              email:
                item.email,
              phone:
                item.phone,
              region:
                item.region,
              avatar_url:
                item.avatar_url,
              role:
                item.role,
              child_id: null,
              child_name: null,
              conversation_type:
                "direct",
            });

          }
        );

      return res.json(
        contacts
      );

    } catch (error) {

      console.error(
        "Fetch chat contacts error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };

export const fetchChatConversations =
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

      if (!currentUser) {
        return;
      }

      const conversations =
        await getUserConversations(
          currentUser.id
        );

      return res.json(
        conversations
      );

    } catch (error) {

      console.error(
        "Fetch chat conversations error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };

export const createChatConversation =
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

      if (!currentUser) {
        return;
      }

      const targetUserId =
        parsePositiveId(
          req.body
            ?.target_user_id
        );

      const childId =
        req.body?.child_id ===
            undefined ||
        req.body?.child_id ===
            null ||
        req.body?.child_id ===
            ""
          ? null
          : parsePositiveId(
              req.body.child_id
            );

      if (!targetUserId) {

        return res.status(400).json({
          message:
            "Invalid target user ID",
        });

      }

      if (
        req.body?.child_id !==
          undefined &&
        req.body?.child_id !==
          null &&
        req.body?.child_id !==
          "" &&
        !childId
      ) {

        return res.status(400).json({
          message:
            "Invalid child ID",
        });

      }

      const targetUser =
        await getUserById(
          targetUserId
        );

      if (!targetUser) {

        return res.status(404).json({
          message:
            "Target user not found",
        });

      }

      const access =
        await resolveConversationAccess(
          currentUser,
          targetUser,
          childId
        );

      if (!access) {

        return res.status(403).json({
          message:
            "You are not allowed to start this conversation",
        });

      }

      const conversation =
        await getOrCreateConversation(
          currentUser.id,
          targetUser.id,
          currentUser.id,
          access
            .conversationType,
          access.childId
        );

      if (!conversation) {

        return res.status(500).json({
          message:
            "Failed to create conversation",
        });

      }

      const conversationForUser =
        await getConversationForUser(
          currentUser.id,
          conversation.id
        );

      return res.status(201).json({
        message:
          "Conversation ready",
        conversation:
          conversationForUser,
      });

    } catch (error) {

      console.error(
        "Create chat conversation error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };

export const fetchChatConversation =
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

      if (!currentUser) {
        return;
      }

      const conversationId =
        parsePositiveId(
          req.params
            .conversationId
        );

      if (!conversationId) {

        return res.status(400).json({
          message:
            "Invalid conversation ID",
        });

      }

      const conversation =
        await getConversationForUser(
          currentUser.id,
          conversationId
        );

      if (!conversation) {

        return res.status(404).json({
          message:
            "Conversation not found",
        });

      }

      return res.json(
        conversation
      );

    } catch (error) {

      console.error(
        "Fetch chat conversation error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };

export const fetchChatMessages =
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

      if (!currentUser) {
        return;
      }

      const conversationId =
        parsePositiveId(
          req.params
            .conversationId
        );

      if (!conversationId) {

        return res.status(400).json({
          message:
            "Invalid conversation ID",
        });

      }

      const isMember =
        await isUserInConversation(
          currentUser.id,
          conversationId
        );

      if (!isMember) {

        return res.status(403).json({
          message:
            "You do not have access to this conversation",
        });

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

      const beforeMessageId =
        req.query.before ===
            undefined ||
        req.query.before ===
            ""
          ? null
          : parsePositiveId(
              req.query.before
            );

      if (
        req.query.before !==
          undefined &&
        req.query.before !==
          "" &&
        !beforeMessageId
      ) {

        return res.status(400).json({
          message:
            "Invalid before message ID",
        });

      }

      const messages =
        await getConversationMessages(
          currentUser.id,
          conversationId,
          limit,
          beforeMessageId
        );

      return res.json({
        messages,
      });

    } catch (error) {

      console.error(
        "Fetch chat messages error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };

export const sendChatMessage =
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

      if (!currentUser) {
        return;
      }

      const conversationId =
        parsePositiveId(
          req.params
            .conversationId
        );

      if (!conversationId) {

        return res.status(400).json({
          message:
            "Invalid conversation ID",
        });

      }

      const isMember =
        await isUserInConversation(
          currentUser.id,
          conversationId
        );

      if (!isMember) {

        return res.status(403).json({
          message:
            "You do not have access to this conversation",
        });

      }

      const body =
        String(
          req.body?.body || ""
        ).trim();

      if (!body) {

        return res.status(400).json({
          message:
            "Message cannot be empty",
        });

      }

      if (
        body.length > 4000
      ) {

        return res.status(400).json({
          message:
            "Message is too long",
        });

      }

      const message =
        await createMessage({
          conversationId,
          senderId:
            currentUser.id,
          messageType:
            "text",
          body,
        });

      if (!message) {

        return res.status(500).json({
          message:
            "Failed to send message",
        });

      }

      await markConversationAsRead(
        currentUser.id,
        conversationId,
        message.id
      );

      return res.status(201).json({
        message:
          "Message sent",
        chat_message:
          message,
      });

    } catch (error) {

      console.error(
        "Send chat message error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };

export const markChatConversationRead =
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

      if (!currentUser) {
        return;
      }

      const conversationId =
        parsePositiveId(
          req.params
            .conversationId
        );

      if (!conversationId) {

        return res.status(400).json({
          message:
            "Invalid conversation ID",
        });

      }

      const isMember =
        await isUserInConversation(
          currentUser.id,
          conversationId
        );

      if (!isMember) {

        return res.status(403).json({
          message:
            "You do not have access to this conversation",
        });

      }

      let messageId =
        req.body?.message_id
          ? parsePositiveId(
              req.body
                .message_id
            )
          : null;

      if (
        req.body?.message_id &&
        !messageId
      ) {

        return res.status(400).json({
          message:
            "Invalid message ID",
        });

      }

      if (messageId) {

        const selectedMessage =
          await getMessageById(
            messageId
          );

        if (
          !selectedMessage ||
          Number(
            selectedMessage
              .conversation_id
          ) !==
            Number(
              conversationId
            )
        ) {

          return res.status(400).json({
            message:
              "Message does not belong to this conversation",
          });

        }

      } else {

        const latestMessage =
          await getLatestConversationMessage(
            conversationId
          );

        if (!latestMessage) {

          return res.json({
            message:
              "Conversation marked as read",
          });

        }

        messageId =
          latestMessage.id;

      }

      await markConversationAsRead(
        currentUser.id,
        conversationId,
        messageId
      );

      return res.json({
        message:
          "Conversation marked as read",
        last_read_message_id:
          messageId,
      });

    } catch (error) {

      console.error(
        "Mark chat conversation read error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };

export const updateChatConversationMute =
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

      if (!currentUser) {
        return;
      }

      const conversationId =
        parsePositiveId(
          req.params
            .conversationId
        );

      if (!conversationId) {

        return res.status(400).json({
          message:
            "Invalid conversation ID",
        });

      }

      const isMember =
        await isUserInConversation(
          currentUser.id,
          conversationId
        );

      if (!isMember) {

        return res.status(403).json({
          message:
            "You do not have access to this conversation",
        });

      }

      if (
        typeof req.body?.muted !==
        "boolean"
      ) {

        return res.status(400).json({
          message:
            "Muted must be a boolean",
        });

      }

      await updateConversationMutedState(
        currentUser.id,
        conversationId,
        req.body.muted
      );

      return res.json({
        message:
          req.body.muted
            ? "Conversation muted"
            : "Conversation unmuted",
        muted:
          req.body.muted,
      });

    } catch (error) {

      console.error(
        "Update chat mute error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };

export const clearChatConversation =
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

      if (!currentUser) {
        return;
      }

      const conversationId =
        parsePositiveId(
          req.params
            .conversationId
        );

      if (!conversationId) {

        return res.status(400).json({
          message:
            "Invalid conversation ID",
        });

      }

      const isMember =
        await isUserInConversation(
          currentUser.id,
          conversationId
        );

      if (!isMember) {

        return res.status(403).json({
          message:
            "You do not have access to this conversation",
        });

      }

      await clearConversationForUser(
        currentUser.id,
        conversationId
      );

      return res.json({
        message:
          "Chat cleared",
      });

    } catch (error) {

      console.error(
        "Clear chat conversation error:",
        error
      );

      return res.status(500).json({
        message:
          "Server Error",
      });

    }

  };