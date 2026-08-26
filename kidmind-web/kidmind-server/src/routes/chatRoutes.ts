import {
  Router,
} from "express";

import {
  clearChatConversation,
  createChatConversation,
  fetchChatContacts,
  fetchChatConversation,
  fetchChatConversations,
  fetchChatMessages,
  markChatConversationRead,
  sendChatMessage,
  updateChatConversationMute,
} from "../controllers/chatController";

import {
  authenticate,
} from "../middleware/authMiddleware";


const router =
  Router();


router.use(
  authenticate
);


router.get(
  "/contacts",
  fetchChatContacts
);


router.get(
  "/conversations",
  fetchChatConversations
);


router.post(
  "/conversations",
  createChatConversation
);


router.get(
  "/conversations/:conversationId",
  fetchChatConversation
);


router.get(
  "/conversations/:conversationId/messages",
  fetchChatMessages
);


router.post(
  "/conversations/:conversationId/messages",
  sendChatMessage
);


router.put(
  "/conversations/:conversationId/read",
  markChatConversationRead
);


router.put(
  "/conversations/:conversationId/mute",
  updateChatConversationMute
);


router.delete(
  "/conversations/:conversationId/messages",
  clearChatConversation
);


export default router;