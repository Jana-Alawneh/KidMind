import {
  authRequest,
} from "./authApi";

export type ChatRole =
  | "therapist"
  | "parent"
  | "admin";

export type ChatConversationType =
  | "direct"
  | "child";

export type ChatMessageType =
  | "text"
  | "image"
  | "file";

export type ChatContact = {
  user_id: number;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  region?: string | null;
  avatar_url?: string | null;
  role: ChatRole;
  child_id?: number | null;
  child_name?: string | null;
  conversation_type:
    ChatConversationType;
};

export type ChatConversation = {
  id: number;
  conversation_type:
    ChatConversationType;
  child_id: number;
  participant_one_id: number;
  participant_two_id: number;
  created_by: number;
  created_at:
    | string
    | Date;
  updated_at:
    | string
    | Date;
  muted:
    | number
    | boolean;
  cleared_at?:
    | string
    | Date
    | null;
  last_read_message_id:
    number;
  other_user_id: number;
  other_user_name: string;
  other_user_email?:
    string | null;
  other_user_role:
    ChatRole;
  other_user_phone?:
    string | null;
  other_user_region?:
    string | null;
  other_user_avatar_url?:
    string | null;
  other_user_is_active:
    number | boolean;
  child_name?:
    string | null;
  last_message_id?:
    number | null;
  last_message_sender_id?:
    number | null;
  last_message_type?:
    ChatMessageType | null;
  last_message_body?:
    string | null;
  last_message_attachment_url?:
    string | null;
  last_message_created_at?:
    string | Date | null;
  unread_count:
    number | string;
};

export type ChatMessage = {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name?: string;
  sender_role?: ChatRole;
  sender_avatar_url?:
    string | null;
  message_type:
    ChatMessageType;
  body:
    string | null;
  attachment_url?:
    string | null;
  attachment_name?:
    string | null;
  attachment_mime?:
    string | null;
  attachment_size?:
    number | null;
  edited_at?:
    string | Date | null;
  deleted_at?:
    string | Date | null;
  created_at:
    string | Date;
};

type CreateConversationInput = {
  targetUserId: number;
  childId?: number | null;
};

type CreateConversationResponse = {
  message: string;
  conversation:
    ChatConversation;
};

type MessagesResponse = {
  messages:
    ChatMessage[];
};

type SendMessageResponse = {
  message: string;
  chat_message:
    ChatMessage;
};

type ReadConversationResponse = {
  message: string;
  last_read_message_id?:
    number;
};

type MuteConversationResponse = {
  message: string;
  muted: boolean;
};

type ClearConversationResponse = {
  message: string;
};

export const getChatContacts =
  async (): Promise<
    ChatContact[]
  > => {

    const data =
      await authRequest<
        ChatContact[]
      >(
        "/chat/contacts"
      );

    return Array.isArray(
      data
    )
      ? data
      : [];

  };

export const getChatConversations =
  async (): Promise<
    ChatConversation[]
  > => {

    const data =
      await authRequest<
        ChatConversation[]
      >(
        "/chat/conversations"
      );

    return Array.isArray(
      data
    )
      ? data
      : [];

  };

export const createChatConversation =
  async ({
    targetUserId,
    childId = null,
  }: CreateConversationInput):
    Promise<
      CreateConversationResponse
    > => {

    const body: {
      target_user_id: number;
      child_id?: number;
    } = {
      target_user_id:
        targetUserId,
    };

    if (
      childId !== null &&
      childId !== undefined
    ) {

      body.child_id =
        childId;

    }

    return authRequest<
      CreateConversationResponse
    >(
      "/chat/conversations",
      {
        method: "POST",
        body:
          JSON.stringify(
            body
          ),
      }
    );

  };

export const getChatConversation =
  async (
    conversationId: number
  ): Promise<
    ChatConversation
  > => {

    return authRequest<
      ChatConversation
    >(
      `/chat/conversations/${conversationId}`
    );

  };

export const getChatMessages =
  async (
    conversationId: number,
    options?: {
      limit?: number;
      before?: number | null;
    }
  ): Promise<
    ChatMessage[]
  > => {

    const limit =
      options?.limit ?? 50;

    const before =
      options?.before ?? null;

    const params =
      new URLSearchParams();

    params.set(
      "limit",
      String(limit)
    );

    if (
      before !== null
    ) {

      params.set(
        "before",
        String(before)
      );

    }

    const data =
      await authRequest<
        MessagesResponse
      >(
        `/chat/conversations/${conversationId}/messages?${params.toString()}`
      );

    return Array.isArray(
      data.messages
    )
      ? data.messages
      : [];

  };

export const sendChatMessage =
  async (
    conversationId: number,
    body: string
  ): Promise<
    SendMessageResponse
  > => {

    return authRequest<
      SendMessageResponse
    >(
      `/chat/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body:
          JSON.stringify({
            body:
              body.trim(),
          }),
      }
    );

  };

export const markChatConversationRead =
  async (
    conversationId: number,
    messageId?: number | null
  ): Promise<
    ReadConversationResponse
  > => {

    const body: {
      message_id?: number;
    } = {};

    if (
      messageId !== null &&
      messageId !== undefined
    ) {

      body.message_id =
        messageId;

    }

    return authRequest<
      ReadConversationResponse
    >(
      `/chat/conversations/${conversationId}/read`,
      {
        method: "PUT",
        body:
          JSON.stringify(
            body
          ),
      }
    );

  };

export const setChatConversationMuted =
  async (
    conversationId: number,
    muted: boolean
  ): Promise<
    MuteConversationResponse
  > => {

    return authRequest<
      MuteConversationResponse
    >(
      `/chat/conversations/${conversationId}/mute`,
      {
        method: "PUT",
        body:
          JSON.stringify({
            muted,
          }),
      }
    );

  };

export const clearChatConversation =
  async (
    conversationId: number
  ): Promise<
    ClearConversationResponse
  > => {

    return authRequest<
      ClearConversationResponse
    >(
      `/chat/conversations/${conversationId}/messages`,
      {
        method: "DELETE",
      }
    );

  };