import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  clearChatConversation,
  createChatConversation,
  getChatContacts,
  getChatConversations,
  getChatMessages,
  markChatConversationRead,
  sendChatMessage,
  setChatConversationMuted,
  type ChatContact,
  type ChatConversation,
  type ChatConversationType,
  type ChatMessage,
  type ChatRole,
} from "../../api/chatApi";

import {
  getCurrentUser,
} from "../../api/authApi";


type ChatListItem = {
  id:
    | number
    | string;
  isContact: boolean;
  userId: number;
  childId:
    | number
    | null;
  conversationType:
    ChatConversationType;
  name: string;
  role:
    ChatRole;
  email: string;
  phone: string;
  region: string;
  childName:
    | string
    | null;
  lastMessage: string;
  lastTime: string;
  unread: number;
  muted: boolean;
};


const normalizeRoleLabel =
  (
    role: ChatRole
  ) => {

    if (
      role === "admin"
    ) {
      return "Admin";
    }

    if (
      role === "parent"
    ) {
      return "Parent";
    }

    return "Therapist";

  };


const parseDate =
  (
    value:
      | string
      | Date
      | null
      | undefined
  ) => {

    if (!value) {
      return null;
    }

    const date =
      value instanceof Date
        ? value
        : new Date(
            String(value).replace(
              " ",
              "T"
            )
          );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date;

  };


const isSameDay =
  (
    first: Date,
    second: Date
  ) =>
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate();


const formatTime =
  (
    value:
      | string
      | Date
      | null
      | undefined
  ) => {

    const date =
      parseDate(value);

    if (!date) {
      return "";
    }

    const now =
      new Date();

    if (
      isSameDay(
        date,
        now
      )
    ) {
      return date.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }

    const yesterday =
      new Date(now);

    yesterday.setDate(
      now.getDate() - 1
    );

    if (
      isSameDay(
        date,
        yesterday
      )
    ) {
      return "Yesterday";
    }

    return date.toLocaleDateString(
      [],
      {
        month: "short",
        day: "numeric",
      }
    );

  };


const normalizeConversation =
  (
    conversation:
      ChatConversation
  ): ChatListItem => ({
    id:
      Number(
        conversation.id
      ),
    isContact: false,
    userId:
      Number(
        conversation
          .other_user_id
      ),
    childId:
      Number(
        conversation
          .child_id || 0
      ) || null,
    conversationType:
      conversation
        .conversation_type,
    name:
      conversation
        .other_user_name ||
      "User",
    role:
      conversation
        .other_user_role,
    email:
      conversation
        .other_user_email ||
      "",
    phone:
      conversation
        .other_user_phone ||
      "",
    region:
      conversation
        .other_user_region ||
      "",
    childName:
      conversation
        .child_name ||
      null,
    lastMessage:
      conversation
        .last_message_body ||
      (
        conversation
          .last_message_type ===
        "image"
          ? "Image"
          : conversation
              .last_message_type ===
            "file"
            ? "File"
            : "No messages yet"
      ),
    lastTime:
      formatTime(
        conversation
          .last_message_created_at ||
        conversation
          .updated_at
      ),
    unread:
      Number(
        conversation
          .unread_count || 0
      ),
    muted:
      Boolean(
        Number(
          conversation.muted
        )
      ),
  });


const normalizeContact =
  (
    contact:
      ChatContact
  ): ChatListItem => ({
    id:
      `contact-${contact.user_id}-${contact.conversation_type}-${contact.child_id || 0}`,
    isContact: true,
    userId:
      Number(
        contact.user_id
      ),
    childId:
      Number(
        contact.child_id || 0
      ) || null,
    conversationType:
      contact
        .conversation_type,
    name:
      contact.full_name ||
      "User",
    role:
      contact.role,
    email:
      contact.email || "",
    phone:
      contact.phone || "",
    region:
      contact.region || "",
    childName:
      contact.child_name ||
      null,
    lastMessage:
      "Start a conversation",
    lastTime: "",
    unread: 0,
    muted: false,
  });


const getChatKey =
  (
    item:
      ChatListItem
  ) =>
    `${item.userId}:${item.conversationType}:${item.childId || 0}`;


const getInitials =
  (
    value: string
  ) => {

    const parts =
      String(
        value || "?"
      )
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    if (
      parts.length === 0
    ) {
      return "?";
    }

    return parts
      .map(
        part =>
          part
            .charAt(0)
            .toUpperCase()
      )
      .join("");

  };


const getRoleTitle =
  (
    role:
      ChatRole | undefined
  ) => {

    if (
      role === "parent"
    ) {
      return "Parent Chat";
    }

    if (
      role === "admin"
    ) {
      return "Admin Chat";
    }

    return "Therapist Chat";

  };


const getRoleSubtitle =
  (
    role:
      ChatRole | undefined
  ) => {

    if (
      role === "parent"
    ) {
      return "Chat with your child's assigned therapist";
    }

    if (
      role === "admin"
    ) {
      return "Chat with therapists";
    }

    return "Chat with assigned parents, admins, and therapists";

  };


export default function MobileChat() {

  const currentUser =
    getCurrentUser();

  const [
    contacts,
    setContacts,
  ] =
    useState<
      ChatListItem[]
    >([]);

  const [
    conversations,
    setConversations,
  ] =
    useState<
      ChatListItem[]
    >([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] =
    useState<
      ChatListItem | null
    >(null);

  const [
    messages,
    setMessages,
  ] =
    useState<
      ChatMessage[]
    >([]);

  const [
    messageText,
    setMessageText,
  ] =
    useState("");

  const [
    searchText,
    setSearchText,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    loadingMessages,
    setLoadingMessages,
  ] =
    useState(false);

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    profileVisible,
    setProfileVisible,
  ] =
    useState(false);

  const [
    optionsVisible,
    setOptionsVisible,
  ] =
    useState(false);

  const listRef =
    useRef<
      FlatList<ChatMessage>
    >(null);

  const selectedIdRef =
    useRef<
      number | null
    >(null);


  useEffect(
    () => {

      selectedIdRef.current =
        selectedConversation &&
        !selectedConversation
          .isContact
          ? Number(
              selectedConversation.id
            )
          : null;

    },
    [
      selectedConversation,
    ]
  );


  const loadContacts =
    useCallback(
      async () => {

        const result =
          await getChatContacts();

        const normalized =
          result.map(
            normalizeContact
          );

        setContacts(
          normalized
        );

        return normalized;

      },
      []
    );


  const loadConversations =
    useCallback(
      async (
        keepSelection = true
      ) => {

        const result =
          await getChatConversations();

        const normalized =
          result.map(
            normalizeConversation
          );

        setConversations(
          normalized
        );

        if (
          keepSelection &&
          selectedIdRef.current
        ) {

          const refreshed =
            normalized.find(
              item =>
                Number(
                  item.id
                ) ===
                Number(
                  selectedIdRef.current
                )
            );

          if (
            refreshed
          ) {

            setSelectedConversation(
              previous => ({
                ...refreshed,
                childName:
                  refreshed
                    .childName ||
                  previous
                    ?.childName ||
                  null,
              })
            );

          }

        }

        return normalized;

      },
      []
    );


  const loadPage =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError("");

          await Promise.all([
            loadContacts(),
            loadConversations(
              false
            ),
          ]);

        } catch (
          requestError
        ) {

          console.error(
            requestError
          );

          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Unable to load chat."
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      [
        loadContacts,
        loadConversations,
      ]
    );


  useEffect(
    () => {

      loadPage();

    },
    [
      loadPage,
    ]
  );


  const availableItems =
    useMemo(
      () => {

        const result =
          conversations.map(
            item => ({
              ...item,
            })
          );

        const existingKeys =
          new Set(
            result.map(
              getChatKey
            )
          );

        contacts.forEach(
          contact => {

            if (
              !existingKeys.has(
                getChatKey(
                  contact
                )
              )
            ) {

              result.push(
                contact
              );

            }

          }
        );

        return result;

      },
      [
        contacts,
        conversations,
      ]
    );


  const filteredItems =
    useMemo(
      () => {

        const query =
          searchText
            .trim()
            .toLowerCase();

        if (!query) {
          return availableItems;
        }

        return availableItems.filter(
          item =>
            `${item.name} ${item.role} ${item.childName || ""}`
              .toLowerCase()
              .includes(
                query
              )
        );

      },
      [
        availableItems,
        searchText,
      ]
    );


  const loadMessages =
    useCallback(
      async (
        conversation:
          ChatListItem,
        showLoader = true
      ) => {

        if (
          conversation
            .isContact
        ) {

          setMessages(
            []
          );

          return;

        }

        try {

          if (
            showLoader
          ) {

            setLoadingMessages(
              true
            );

          }

          const result =
            await getChatMessages(
              Number(
                conversation.id
              )
            );

          setMessages(
            result
          );

          await markChatConversationRead(
            Number(
              conversation.id
            )
          );

          setConversations(
            previous =>
              previous.map(
                item =>
                  Number(
                    item.id
                  ) ===
                  Number(
                    conversation.id
                  )
                    ? {
                        ...item,
                        unread: 0,
                      }
                    : item
              )
          );

        } catch (
          requestError
        ) {

          console.error(
            requestError
          );

          if (
            showLoader
          ) {

            setError(
              requestError instanceof
                Error
                ? requestError.message
                : "Unable to load messages."
            );

          }

        } finally {

          if (
            showLoader
          ) {

            setLoadingMessages(
              false
            );

          }

        }

      },
      []
    );


  useEffect(
    () => {

      if (
        !selectedConversation ||
        selectedConversation
          .isContact
      ) {
        return;
      }

      const timer =
        setInterval(
          async () => {

            try {

              await Promise.all([
                loadConversations(),
                loadMessages(
                  selectedConversation,
                  false
                ),
              ]);

            } catch {
              return;
            }

          },
          4000
        );

      return () =>
        clearInterval(
          timer
        );

    },
    [
      selectedConversation?.id,
      selectedConversation
        ?.isContact,
      loadConversations,
      loadMessages,
    ]
  );


  useEffect(
    () => {

      if (
        messages.length ===
        0
      ) {
        return;
      }

      const timer =
        setTimeout(
          () => {

            listRef.current
              ?.scrollToEnd({
                animated: true,
              });

          },
          80
        );

      return () =>
        clearTimeout(
          timer
        );

    },
    [
      messages.length,
    ]
  );


  const openConversation =
    async (
      item:
        ChatListItem
    ) => {

      try {

        setError("");

        let resolved =
          item;

        if (
          item.isContact
        ) {

          setLoadingMessages(
            true
          );

          const result =
            await createChatConversation({
              targetUserId:
                item.userId,
              childId:
                item.childId,
            });

          const createdId =
            Number(
              result
                .conversation
                .id
            );

          const refreshed =
            await loadConversations(
              false
            );

          resolved =
            refreshed.find(
              conversation =>
                Number(
                  conversation.id
                ) ===
                createdId
            ) || {
              ...item,
              id:
                createdId,
              isContact: false,
              lastMessage:
                "No messages yet",
            };

          if (
            !resolved
              .childName &&
            item.childName
          ) {

            resolved = {
              ...resolved,
              childName:
                item.childName,
            };

          }

        }

        setSelectedConversation(
          resolved
        );

        selectedIdRef.current =
          Number(
            resolved.id
          );

        await loadMessages(
          resolved
        );

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );

        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to open conversation."
        );

        setLoadingMessages(
          false
        );

      }

    };


  const handleSend =
    async () => {

      const text =
        messageText.trim();

      if (
        !text ||
        !selectedConversation ||
        selectedConversation
          .isContact ||
        sending
      ) {
        return;
      }

      try {

        setSending(
          true
        );

        setError("");

        const result =
          await sendChatMessage(
            Number(
              selectedConversation.id
            ),
            text
          );

        setMessages(
          previous => [
            ...previous,
            result.chat_message,
          ]
        );

        setMessageText("");

        setConversations(
          previous =>
            previous.map(
              item =>
                Number(
                  item.id
                ) ===
                Number(
                  selectedConversation.id
                )
                  ? {
                      ...item,
                      lastMessage:
                        text,
                      lastTime:
                        formatTime(
                          result
                            .chat_message
                            .created_at
                        ),
                      unread: 0,
                    }
                  : item
            )
        );

        setSelectedConversation(
          previous =>
            previous
              ? {
                  ...previous,
                  lastMessage:
                    text,
                  lastTime:
                    formatTime(
                      result
                        .chat_message
                        .created_at
                    ),
                }
              : previous
        );

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );

        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to send message."
        );

      } finally {

        setSending(
          false
        );

      }

    };


  const toggleMute =
    async () => {

      if (
        !selectedConversation ||
        selectedConversation
          .isContact
      ) {
        return;
      }

      try {

        const nextMuted =
          !selectedConversation
            .muted;

        await setChatConversationMuted(
          Number(
            selectedConversation.id
          ),
          nextMuted
        );

        setSelectedConversation(
          previous =>
            previous
              ? {
                  ...previous,
                  muted:
                    nextMuted,
                }
              : previous
        );

        setConversations(
          previous =>
            previous.map(
              item =>
                Number(
                  item.id
                ) ===
                Number(
                  selectedConversation.id
                )
                  ? {
                      ...item,
                      muted:
                        nextMuted,
                    }
                  : item
            )
        );

        setOptionsVisible(
          false
        );

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );

        Alert.alert(
          "Chat",
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to update notifications."
        );

      }

    };


  const clearConversation =
    () => {

      if (
        !selectedConversation ||
        selectedConversation
          .isContact
      ) {
        return;
      }

      Alert.alert(
        "Clear conversation?",
        "Messages will be removed from your chat view only.",
        [
          {
            text:
              "Cancel",
            style:
              "cancel",
          },
          {
            text:
              "Clear",
            style:
              "destructive",
            onPress:
              async () => {

                try {

                  await clearChatConversation(
                    Number(
                      selectedConversation.id
                    )
                  );

                  setMessages(
                    []
                  );

                  setConversations(
                    previous =>
                      previous.map(
                        item =>
                          Number(
                            item.id
                          ) ===
                          Number(
                            selectedConversation.id
                          )
                            ? {
                                ...item,
                                lastMessage:
                                  "No messages yet",
                                lastTime:
                                  "",
                                unread:
                                  0,
                              }
                            : item
                      )
                  );

                  setSelectedConversation(
                    previous =>
                      previous
                        ? {
                            ...previous,
                            lastMessage:
                              "No messages yet",
                            lastTime:
                              "",
                            unread:
                              0,
                          }
                        : previous
                  );

                  setOptionsVisible(
                    false
                  );

                } catch (
                  requestError
                ) {

                  console.error(
                    requestError
                  );

                  Alert.alert(
                    "Chat",
                    requestError instanceof
                      Error
                      ? requestError.message
                      : "Unable to clear chat."
                  );

                }

              },
          },
        ]
      );

    };


  const totalUnread =
    conversations.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.unread ||
          0
        ),
      0
    );


  const renderContact =
    ({
      item,
    }: {
      item:
        ChatListItem;
    }) => (
      <Pressable
        style={
          styles.contactCard
        }
        onPress={() =>
          openConversation(
            item
          )
        }
      >
        <View
          style={
            styles.avatar
          }
        >
          <Text
            style={
              styles.avatarText
            }
          >
            {getInitials(
              item.name
            )}
          </Text>
        </View>

        <View
          style={
            styles.contactMain
          }
        >
          <View
            style={
              styles.contactTop
            }
          >
            <Text
              numberOfLines={1}
              style={
                styles.contactName
              }
            >
              {item.name}
            </Text>

            <Text
              style={
                styles.contactTime
              }
            >
              {item.lastTime}
            </Text>
          </View>

          <View
            style={
              styles.contactMetaRow
            }
          >
            <View
              style={
                styles.rolePill
              }
            >
              <Text
                style={
                  styles.rolePillText
                }
              >
                {normalizeRoleLabel(
                  item.role
                )}
              </Text>
            </View>

            {item.childName && (
              <Text
                numberOfLines={1}
                style={
                  styles.childText
                }
              >
                {item.childName}
              </Text>
            )}
          </View>

          <View
            style={
              styles.messagePreviewRow
            }
          >
            <Text
              numberOfLines={1}
              style={
                styles.messagePreview
              }
            >
              {item.lastMessage}
            </Text>

            {item.unread > 0 && (
              <View
                style={
                  styles.unreadBadge
                }
              >
                <Text
                  style={
                    styles.unreadText
                  }
                >
                  {item.unread}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );


  const renderMessage =
    ({
      item,
    }: {
      item:
        ChatMessage;
    }) => {

      const mine =
        Number(
          item.sender_id
        ) ===
        Number(
          currentUser?.id
        );

      return (
        <View
          style={[
            styles.messageRow,
            mine
              ? styles.messageRowMine
              : styles.messageRowOther,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              mine
                ? styles.messageBubbleMine
                : styles.messageBubbleOther,
            ]}
          >
            <Text
              style={[
                styles.messageBody,
                mine
                  ? styles.messageBodyMine
                  : styles.messageBodyOther,
              ]}
            >
              {item.body || ""}
            </Text>
          </View>

          <Text
            style={[
              styles.messageTime,
              mine
                ? styles.messageTimeMine
                : styles.messageTimeOther,
            ]}
          >
            {formatTime(
              item.created_at
            )}
          </Text>
        </View>
      );

    };


  if (
    !currentUser
  ) {
    return (
      <SafeAreaView
        style={
          styles.centeredPage
        }
      >
        <Text
          style={
            styles.emptyTitle
          }
        >
          Authentication required
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          Please sign in again.
        </Text>
      </SafeAreaView>
    );
  }


  if (
    selectedConversation
  ) {
    return (
      <SafeAreaView
        style={
          styles.page
        }
      >
        <KeyboardAvoidingView
          style={
            styles.page
          }
          behavior={
            Platform.OS ===
            "ios"
              ? "padding"
              : undefined
          }
        >
          <View
            style={
              styles.chatHeader
            }
          >
            <Pressable
              onPress={() => {
                setSelectedConversation(
                  null
                );
                setMessages(
                  []
                );
              }}
              style={
                styles.headerButton
              }
            >
              <Text
                style={
                  styles.backText
                }
              >
                ‹
              </Text>
            </Pressable>

            <View
              style={
                styles.chatHeaderAvatar
              }
            >
              <Text
                style={
                  styles.chatHeaderAvatarText
                }
              >
                {getInitials(
                  selectedConversation
                    .name
                )}
              </Text>
            </View>

            <View
              style={
                styles.chatHeaderMain
              }
            >
              <Text
                numberOfLines={1}
                style={
                  styles.chatHeaderName
                }
              >
                {selectedConversation.name}
              </Text>

              <Text
                numberOfLines={1}
                style={
                  styles.chatHeaderMeta
                }
              >
                {normalizeRoleLabel(
                  selectedConversation.role
                )}
                {selectedConversation.childName
                  ? ` • ${selectedConversation.childName}`
                  : ""}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                setOptionsVisible(
                  true
                )
              }
              style={
                styles.headerButton
              }
            >
              <Text
                style={
                  styles.optionsText
                }
              >
                •••
              </Text>
            </Pressable>
          </View>

          {selectedConversation.childName && (
            <View
              style={
                styles.childBanner
              }
            >
              <Text
                style={
                  styles.childBannerLabel
                }
              >
                Discussing child
              </Text>

              <Text
                style={
                  styles.childBannerName
                }
              >
                {selectedConversation.childName}
              </Text>
            </View>
          )}

          {error ? (
            <View
              style={
                styles.errorBox
              }
            >
              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>
            </View>
          ) : null}

          {loadingMessages ? (
            <View
              style={
                styles.messagesLoading
              }
            >
              <ActivityIndicator
                size="small"
                color="#7666e7"
              />
            </View>
          ) : (
            <FlatList
              ref={
                listRef
              }
              data={
                messages
              }
              keyExtractor={
                item =>
                  String(
                    item.id
                  )
              }
              renderItem={
                renderMessage
              }
              contentContainerStyle={
                messages.length
                  ? styles.messagesContent
                  : styles.emptyMessagesContent
              }
              ListEmptyComponent={
                <View
                  style={
                    styles.emptyMessages
                  }
                >
                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    No messages yet
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    Send the first message.
                  </Text>
                </View>
              }
              keyboardShouldPersistTaps="handled"
            />
          )}

          <View
            style={
              styles.composerWrap
            }
          >
            <View
              style={
                styles.composer
              }
            >
              <TextInput
                value={
                  messageText
                }
                onChangeText={
                  setMessageText
                }
                placeholder="Write a message..."
                placeholderTextColor="#a3a4b5"
                multiline
                maxLength={4000}
                style={
                  styles.composerInput
                }
              />

              <Pressable
                onPress={
                  handleSend
                }
                disabled={
                  !messageText.trim() ||
                  sending
                }
                style={[
                  styles.sendButton,
                  (
                    !messageText.trim() ||
                    sending
                  ) &&
                    styles.sendButtonDisabled,
                ]}
              >
                {sending ? (
                  <ActivityIndicator
                    size="small"
                    color="#ffffff"
                  />
                ) : (
                  <Text
                    style={
                      styles.sendButtonText
                    }
                  >
                    Send
                  </Text>
                )}
              </Pressable>
            </View>

            <Text
              style={
                styles.secureText
              }
            >
              {selectedConversation.muted
                ? "Notifications are muted"
                : "Messages are private and secure"}
            </Text>
          </View>

          <Modal
            visible={
              optionsVisible
            }
            transparent
            animationType="fade"
            onRequestClose={() =>
              setOptionsVisible(
                false
              )
            }
          >
            <Pressable
              style={
                styles.modalBackdrop
              }
              onPress={() =>
                setOptionsVisible(
                  false
                )
              }
            >
              <View
                style={
                  styles.optionsCard
                }
              >
                <Pressable
                  style={
                    styles.optionRow
                  }
                  onPress={() => {
                    setOptionsVisible(
                      false
                    );
                    setProfileVisible(
                      true
                    );
                  }}
                >
                  <Text
                    style={
                      styles.optionText
                    }
                  >
                    View Profile
                  </Text>
                </Pressable>

                <Pressable
                  style={
                    styles.optionRow
                  }
                  onPress={
                    toggleMute
                  }
                >
                  <Text
                    style={
                      styles.optionText
                    }
                  >
                    {selectedConversation.muted
                      ? "Unmute Notifications"
                      : "Mute Notifications"}
                  </Text>
                </Pressable>

                <Pressable
                  style={
                    styles.optionRow
                  }
                  onPress={
                    clearConversation
                  }
                >
                  <Text
                    style={
                      styles.dangerOptionText
                    }
                  >
                    Clear Chat
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>

          <Modal
            visible={
              profileVisible
            }
            transparent
            animationType="fade"
            onRequestClose={() =>
              setProfileVisible(
                false
              )
            }
          >
            <View
              style={
                styles.modalBackdrop
              }
            >
              <View
                style={
                  styles.profileCard
                }
              >
                <View
                  style={
                    styles.profileAvatar
                  }
                >
                  <Text
                    style={
                      styles.profileAvatarText
                    }
                  >
                    {getInitials(
                      selectedConversation
                        .name
                    )}
                  </Text>
                </View>

                <Text
                  style={
                    styles.profileName
                  }
                >
                  {selectedConversation.name}
                </Text>

                <Text
                  style={
                    styles.profileRole
                  }
                >
                  {normalizeRoleLabel(
                    selectedConversation.role
                  )}
                </Text>

                {selectedConversation.childName && (
                  <View
                    style={
                      styles.profileInfo
                    }
                  >
                    <Text
                      style={
                        styles.profileInfoLabel
                      }
                    >
                      Child
                    </Text>

                    <Text
                      style={
                        styles.profileInfoValue
                      }
                    >
                      {selectedConversation.childName}
                    </Text>
                  </View>
                )}

                {selectedConversation.email && (
                  <View
                    style={
                      styles.profileInfo
                    }
                  >
                    <Text
                      style={
                        styles.profileInfoLabel
                      }
                    >
                      Email
                    </Text>

                    <Text
                      style={
                        styles.profileInfoValue
                      }
                    >
                      {selectedConversation.email}
                    </Text>
                  </View>
                )}

                {selectedConversation.phone && (
                  <View
                    style={
                      styles.profileInfo
                    }
                  >
                    <Text
                      style={
                        styles.profileInfoLabel
                      }
                    >
                      Phone
                    </Text>

                    <Text
                      style={
                        styles.profileInfoValue
                      }
                    >
                      {selectedConversation.phone}
                    </Text>
                  </View>
                )}

                <Pressable
                  style={
                    styles.doneButton
                  }
                  onPress={() =>
                    setProfileVisible(
                      false
                    )
                  }
                >
                  <Text
                    style={
                      styles.doneButtonText
                    }
                  >
                    Done
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView
      style={
        styles.page
      }
    >
      <View
        style={
          styles.listHeader
        }
      >
        <View
          style={
            styles.listHeaderTop
          }
        >
          <View>
            <Text
              style={
                styles.pageTitle
              }
            >
              {getRoleTitle(
                currentUser.role
              )}
            </Text>

            <Text
              style={
                styles.pageSubtitle
              }
            >
              {getRoleSubtitle(
                currentUser.role
              )}
            </Text>
          </View>

          {totalUnread > 0 && (
            <View
              style={
                styles.totalUnreadBadge
              }
            >
              <Text
                style={
                  styles.totalUnreadText
                }
              >
                {totalUnread}
              </Text>
            </View>
          )}
        </View>

        <TextInput
          value={
            searchText
          }
          onChangeText={
            setSearchText
          }
          placeholder="Search conversations..."
          placeholderTextColor="#a0a2b4"
          style={
            styles.searchInput
          }
        />
      </View>

      {error ? (
        <View
          style={
            styles.errorBox
          }
        >
          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>
        </View>
      ) : null}

      {loading ? (
        <View
          style={
            styles.centeredPage
          }
        >
          <ActivityIndicator
            size="large"
            color="#7666e7"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading chat...
          </Text>
        </View>
      ) : (
        <FlatList
          data={
            filteredItems
          }
          keyExtractor={
            item =>
              String(
                item.id
              )
          }
          renderItem={
            renderContact
          }
          contentContainerStyle={
            filteredItems.length
              ? styles.contactsContent
              : styles.emptyListContent
          }
          keyboardShouldPersistTaps="handled"
          refreshing={
            loading
          }
          onRefresh={
            loadPage
          }
          ListEmptyComponent={
            <View
              style={
                styles.emptyMessages
              }
            >
              <Text
                style={
                  styles.emptyTitle
                }
              >
                No conversations found
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                {searchText
                  ? "Try another search."
                  : "No available chat contacts."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}


const styles =
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor:
        "#f7f8fc",
    },
    centeredPage: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 24,
      backgroundColor:
        "#f7f8fc",
    },
    listHeader: {
      paddingHorizontal:
        20,
      paddingTop: 18,
      paddingBottom: 16,
      backgroundColor:
        "#ffffff",
      borderBottomWidth: 1,
      borderBottomColor:
        "#ececf4",
    },
    listHeaderTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 16,
    },
    pageTitle: {
      color:
        "#303044",
      fontSize: 22,
      fontWeight:
        "800",
    },
    pageSubtitle: {
      marginTop: 4,
      maxWidth: 290,
      color:
        "#989aab",
      fontSize: 11,
      lineHeight: 17,
    },
    totalUnreadBadge: {
      minWidth: 32,
      height: 32,
      paddingHorizontal:
        9,
      borderRadius: 16,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#7666e7",
    },
    totalUnreadText: {
      color:
        "#ffffff",
      fontSize: 11,
      fontWeight:
        "800",
    },
    searchInput: {
      marginTop: 16,
      minHeight: 46,
      paddingHorizontal:
        15,
      borderWidth: 1,
      borderColor:
        "#ececf4",
      borderRadius: 15,
      backgroundColor:
        "#f8f8fb",
      color:
        "#303044",
      fontSize: 12,
    },
    contactsContent: {
      padding:
        14,
      paddingBottom:
        28,
    },
    emptyListContent: {
      flexGrow: 1,
      justifyContent:
        "center",
      padding:
        24,
    },
    contactCard: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor:
        "#ececf4",
      borderRadius: 18,
      backgroundColor:
        "#ffffff",
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 16,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#f0edff",
    },
    avatarText: {
      color:
        "#7161de",
      fontSize: 14,
      fontWeight:
        "800",
    },
    contactMain: {
      flex: 1,
      minWidth: 0,
    },
    contactTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 10,
    },
    contactName: {
      flex: 1,
      color:
        "#303044",
      fontSize: 13,
      fontWeight:
        "700",
    },
    contactTime: {
      color:
        "#a2a4b3",
      fontSize: 9,
    },
    contactMetaRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 7,
      marginTop: 6,
    },
    rolePill: {
      paddingHorizontal:
        7,
      paddingVertical:
        3,
      borderRadius: 7,
      backgroundColor:
        "#f2efff",
    },
    rolePillText: {
      color:
        "#7161de",
      fontSize: 8,
      fontWeight:
        "700",
    },
    childText: {
      flex: 1,
      color:
        "#9294a6",
      fontSize: 9,
    },
    messagePreviewRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
      marginTop: 7,
    },
    messagePreview: {
      flex: 1,
      color:
        "#989aab",
      fontSize: 10,
    },
    unreadBadge: {
      minWidth: 21,
      height: 21,
      paddingHorizontal: 6,
      borderRadius: 11,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#7666e7",
    },
    unreadText: {
      color:
        "#ffffff",
      fontSize: 8,
      fontWeight:
        "800",
    },
    chatHeader: {
      minHeight: 72,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
      paddingHorizontal:
        14,
      paddingVertical:
        10,
      borderBottomWidth: 1,
      borderBottomColor:
        "#ececf4",
      backgroundColor:
        "#ffffff",
    },
    headerButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#f7f6fb",
    },
    backText: {
      marginTop: -4,
      color:
        "#7161de",
      fontSize: 31,
      lineHeight: 32,
      fontWeight:
        "400",
    },
    optionsText: {
      color:
        "#74768c",
      fontSize: 15,
      fontWeight:
        "900",
      letterSpacing: 1,
    },
    chatHeaderAvatar: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#f0edff",
    },
    chatHeaderAvatarText: {
      color:
        "#7161de",
      fontSize: 12,
      fontWeight:
        "800",
    },
    chatHeaderMain: {
      flex: 1,
      minWidth: 0,
    },
    chatHeaderName: {
      color:
        "#303044",
      fontSize: 14,
      fontWeight:
        "800",
    },
    chatHeaderMeta: {
      marginTop: 3,
      color:
        "#9799aa",
      fontSize: 9,
    },
    childBanner: {
      marginHorizontal:
        16,
      marginTop: 12,
      paddingHorizontal:
        15,
      paddingVertical:
        11,
      borderWidth: 1,
      borderColor:
        "#e8e3ff",
      borderRadius: 15,
      backgroundColor:
        "#f8f6ff",
    },
    childBannerLabel: {
      color:
        "#9b9dad",
      fontSize: 8,
      fontWeight:
        "700",
      textTransform:
        "uppercase",
      letterSpacing: 0.7,
    },
    childBannerName: {
      marginTop: 3,
      color:
        "#4d4963",
      fontSize: 12,
      fontWeight:
        "800",
    },
    messagesLoading: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },
    messagesContent: {
      paddingHorizontal:
        16,
      paddingTop: 18,
      paddingBottom: 24,
    },
    emptyMessagesContent: {
      flexGrow: 1,
      justifyContent:
        "center",
      padding: 24,
    },
    emptyMessages: {
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 24,
    },
    emptyTitle: {
      color:
        "#303044",
      fontSize: 14,
      fontWeight:
        "800",
      textAlign:
        "center",
    },
    emptyText: {
      marginTop: 5,
      color:
        "#9a9cad",
      fontSize: 10,
      lineHeight: 16,
      textAlign:
        "center",
    },
    loadingText: {
      marginTop: 12,
      color:
        "#8d8fa2",
      fontSize: 11,
    },
    messageRow: {
      marginBottom: 13,
      maxWidth: "82%",
    },
    messageRowMine: {
      alignSelf:
        "flex-end",
      alignItems:
        "flex-end",
    },
    messageRowOther: {
      alignSelf:
        "flex-start",
      alignItems:
        "flex-start",
    },
    messageBubble: {
      paddingHorizontal:
        14,
      paddingVertical:
        10,
      borderRadius: 17,
    },
    messageBubbleMine: {
      borderBottomRightRadius:
        5,
      backgroundColor:
        "#7666e7",
    },
    messageBubbleOther: {
      borderBottomLeftRadius:
        5,
      borderWidth: 1,
      borderColor:
        "#ececf4",
      backgroundColor:
        "#ffffff",
    },
    messageBody: {
      fontSize: 12,
      lineHeight: 19,
    },
    messageBodyMine: {
      color:
        "#ffffff",
    },
    messageBodyOther: {
      color:
        "#46475b",
    },
    messageTime: {
      marginTop: 4,
      color:
        "#a1a3b3",
      fontSize: 8,
    },
    messageTimeMine: {
      marginRight: 4,
    },
    messageTimeOther: {
      marginLeft: 4,
    },
    composerWrap: {
      paddingHorizontal:
        12,
      paddingTop: 8,
      paddingBottom:
        Platform.OS ===
        "ios"
          ? 10
          : 12,
      borderTopWidth: 1,
      borderTopColor:
        "#ececf4",
      backgroundColor:
        "#fcfcfe",
    },
    composer: {
      flexDirection:
        "row",
      alignItems:
        "flex-end",
      gap: 8,
      padding: 7,
      borderWidth: 1,
      borderColor:
        "#e8e8f0",
      borderRadius: 18,
      backgroundColor:
        "#ffffff",
    },
    composerInput: {
      flex: 1,
      maxHeight: 110,
      minHeight: 40,
      paddingHorizontal:
        10,
      paddingVertical:
        10,
      color:
        "#303044",
      fontSize: 12,
      textAlignVertical:
        "top",
    },
    sendButton: {
      minWidth: 66,
      height: 42,
      paddingHorizontal:
        14,
      borderRadius: 13,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#7666e7",
    },
    sendButtonDisabled: {
      opacity: 0.35,
    },
    sendButtonText: {
      color:
        "#ffffff",
      fontSize: 10,
      fontWeight:
        "800",
    },
    secureText: {
      marginTop: 6,
      marginLeft: 5,
      color:
        "#a1a3b3",
      fontSize: 8,
    },
    errorBox: {
      marginHorizontal:
        16,
      marginTop: 10,
      paddingHorizontal:
        13,
      paddingVertical:
        10,
      borderWidth: 1,
      borderColor:
        "#f1d8df",
      borderRadius: 12,
      backgroundColor:
        "#fff3f5",
    },
    errorText: {
      color:
        "#bd566b",
      fontSize: 10,
      lineHeight: 15,
    },
    modalBackdrop: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 22,
      backgroundColor:
        "rgba(24,24,45,.28)",
    },
    optionsCard: {
      width: "100%",
      maxWidth: 340,
      overflow:
        "hidden",
      borderRadius: 19,
      backgroundColor:
        "#ffffff",
    },
    optionRow: {
      minHeight: 52,
      justifyContent:
        "center",
      paddingHorizontal:
        18,
      borderBottomWidth: 1,
      borderBottomColor:
        "#f0f0f4",
    },
    optionText: {
      color:
        "#46475b",
      fontSize: 12,
      fontWeight:
        "600",
    },
    dangerOptionText: {
      color:
        "#c45d6c",
      fontSize: 12,
      fontWeight:
        "700",
    },
    profileCard: {
      width: "100%",
      maxWidth: 360,
      padding: 22,
      borderRadius: 23,
      backgroundColor:
        "#ffffff",
    },
    profileAvatar: {
      width: 72,
      height: 72,
      alignSelf:
        "center",
      borderRadius: 22,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#f0edff",
    },
    profileAvatarText: {
      color:
        "#7161de",
      fontSize: 20,
      fontWeight:
        "900",
    },
    profileName: {
      marginTop: 13,
      color:
        "#303044",
      fontSize: 17,
      fontWeight:
        "800",
      textAlign:
        "center",
    },
    profileRole: {
      marginTop: 4,
      color:
        "#8f91a3",
      fontSize: 10,
      textAlign:
        "center",
    },
    profileInfo: {
      marginTop: 12,
      padding: 13,
      borderWidth: 1,
      borderColor:
        "#ececf4",
      borderRadius: 14,
      backgroundColor:
        "#f8f7fc",
    },
    profileInfoLabel: {
      color:
        "#a0a2b3",
      fontSize: 8,
      fontWeight:
        "700",
      textTransform:
        "uppercase",
    },
    profileInfoValue: {
      marginTop: 4,
      color:
        "#48495c",
      fontSize: 11,
      fontWeight:
        "600",
    },
    doneButton: {
      height: 45,
      marginTop: 18,
      borderRadius: 14,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#7666e7",
    },
    doneButtonText: {
      color:
        "#ffffff",
      fontSize: 11,
      fontWeight:
        "800",
    },
  });
