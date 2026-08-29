import fs from "fs";
import path from "path";

import multer from "multer";

import {
  Router,
} from "express";

import {
  clearChatConversation,
  createChatConversation,
  downloadChatAttachment,
  fetchChatContacts,
  fetchChatConversation,
  fetchChatConversations,
  fetchChatMessages,
  fetchChatUserProfile,
  markChatConversationRead,
  sendChatAttachment,
  sendChatMessage,
  updateChatConversationMute,
} from "../controllers/chatController";

import {
  authenticate,
} from "../middleware/authMiddleware";


const router =
  Router();


const uploadDirectory =
  path.resolve(
    process.cwd(),
    "uploads",
    "chat"
  );


fs.mkdirSync(
  uploadDirectory,
  {
    recursive: true,
  }
);


const storage =
  multer.diskStorage({

    destination: (
      _req,
      _file,
      callback
    ) => {

      callback(
        null,
        uploadDirectory
      );

    },

    filename: (
      _req,
      file,
      callback
    ) => {

      const extension =
        path.extname(
          file.originalname
        )
          .toLowerCase()
          .slice(
            0,
            12
          );

      callback(
        null,
        `${Date.now()}-${Math.round(
          Math.random() *
            1_000_000_000
        )}${extension}`
      );

    },

  });


const allowedMimeTypes =
  new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);


const upload =
  multer({
    storage,
    limits: {
      fileSize:
        10 * 1024 * 1024,
    },
    fileFilter: (
      _req,
      file,
      callback
    ) => {

      if (
        allowedMimeTypes.has(
          file.mimetype
        )
      ) {
        callback(
          null,
          true
        );
        return;
      }

      callback(
        new Error(
          "Unsupported file type"
        )
      );

    },
  });


router.use(
  authenticate
);


router.get(
  "/contacts",
  fetchChatContacts
);


router.get(
  "/users/:userId/profile",
  fetchChatUserProfile
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


router.post(
  "/conversations/:conversationId/attachments",
  upload.single(
    "file"
  ),
  sendChatAttachment
);


router.get(
  "/attachments/:messageId/download",
  downloadChatAttachment
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
