import api from "../services/api";


export const getChatContacts =
  async () => {

    const response =
      await api.get(
        "/chat/contacts"
      );

    return Array.isArray(
      response.data
    )
      ? response.data
      : [];

  };


export const getChatConversations =
  async () => {

    const response =
      await api.get(
        "/chat/conversations"
      );

    return Array.isArray(
      response.data
    )
      ? response.data
      : [];

  };


export const createChatConversation =
  async ({
    targetUserId,
    childId = null,
  }) => {

    const payload = {
      target_user_id:
        targetUserId,
    };

    if (
      childId !== null &&
      childId !== undefined &&
      childId !== ""
    ) {
      payload.child_id =
        childId;
    }

    const response =
      await api.post(
        "/chat/conversations",
        payload
      );

    return response.data;

  };


export const getChatConversation =
  async (
    conversationId
  ) => {

    const response =
      await api.get(
        `/chat/conversations/${conversationId}`
      );

    return response.data;

  };


export const getChatMessages =
  async (
    conversationId,
    {
      limit = 50,
      before = null,
    } = {}
  ) => {

    const params = {
      limit,
    };

    if (
      before !== null &&
      before !== undefined &&
      before !== ""
    ) {
      params.before =
        before;
    }

    const response =
      await api.get(
        `/chat/conversations/${conversationId}/messages`,
        {
          params,
        }
      );

    return Array.isArray(
      response.data?.messages
    )
      ? response.data.messages
      : [];

  };


export const sendChatMessage =
  async (
    conversationId,
    body
  ) => {

    const response =
      await api.post(
        `/chat/conversations/${conversationId}/messages`,
        {
          body,
        }
      );

    return response.data;

  };


export const markChatConversationRead =
  async (
    conversationId,
    messageId = null
  ) => {

    const payload = {};

    if (
      messageId !== null &&
      messageId !== undefined &&
      messageId !== ""
    ) {
      payload.message_id =
        messageId;
    }

    const response =
      await api.put(
        `/chat/conversations/${conversationId}/read`,
        payload
      );

    return response.data;

  };


export const setChatConversationMuted =
  async (
    conversationId,
    muted
  ) => {

    const response =
      await api.put(
        `/chat/conversations/${conversationId}/mute`,
        {
          muted:
            Boolean(muted),
        }
      );

    return response.data;

  };


export const clearChatConversation =
  async (
    conversationId
  ) => {

    const response =
      await api.delete(
        `/chat/conversations/${conversationId}/messages`
      );

    return response.data;

  };


export const sendChatAttachment =
  async (
    conversationId,
    file
  ) => {

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await api.post(
        `/chat/conversations/${conversationId}/attachments`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;

  };


export const downloadChatAttachment =
  async (
    messageId,
    fileName =
      "attachment"
  ) => {

    const response =
      await api.get(
        `/chat/attachments/${messageId}/download`,
        {
          responseType:
            "blob",
        }
      );

    const blobUrl =
      window.URL
        .createObjectURL(
          response.data
        );

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href =
      blobUrl;

    anchor.download =
      fileName ||
      "attachment";

    document.body.appendChild(
      anchor
    );

    anchor.click();
    anchor.remove();

    window.setTimeout(
      () => {
        window.URL
          .revokeObjectURL(
            blobUrl
          );
      },
      1000
    );

  };


export const getChatUserProfile =
  async (
    userId
  ) => {

    const response =
      await api.get(
        `/chat/users/${userId}/profile`
      );

    return response.data;

  };