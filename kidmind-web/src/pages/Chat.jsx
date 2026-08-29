import {
  ArrowLeft,
  Bell,
  BellOff,
  Check,
  Download,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  clearChatConversation,
  createChatConversation,
  getChatContacts,
  getChatConversations,
  getChatMessages,
  getChatUserProfile,
  downloadChatAttachment,
  markChatConversationRead,
  sendChatAttachment,
  sendChatMessage,
  setChatConversationMuted,
} from "../api/chatApi";


const getCurrentUser = () => {
  try {
    const storedUser =
      sessionStorage.getItem(
        "kidmind_user"
      );

    if (!storedUser) {
      return null;
    }

    return JSON.parse(
      storedUser
    );
  } catch {
    return null;
  }
};


const normalizeRole = role => {
  const normalized =
    String(
      role || ""
    )
      .trim()
      .toLowerCase();

  if (
    normalized ===
      "administrator"
  ) {
    return "admin";
  }

  if (
    normalized ===
      "parents"
  ) {
    return "parent";
  }

  if (
    normalized ===
      "therapists"
  ) {
    return "therapist";
  }

  return normalized;
};


const getRoleLabel = role => {
  const normalized =
    normalizeRole(role);

  if (
    normalized ===
      "admin"
  ) {
    return "Admin";
  }

  if (
    normalized ===
      "parent"
  ) {
    return "Parent";
  }

  return "Therapist";
};


const parseDate = value => {
  if (!value) {
    return null;
  }

  const date =
    new Date(
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


const isSameDay = (
  first,
  second
) =>
  first.getFullYear() ===
    second.getFullYear() &&
  first.getMonth() ===
    second.getMonth() &&
  first.getDate() ===
    second.getDate();


const formatTime = value => {
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
  conversation => ({
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
      getRoleLabel(
        conversation
          .other_user_role
      ),
    roleValue:
      normalizeRole(
        conversation
          .other_user_role
      ),
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
    avatarUrl:
      conversation
        .other_user_avatar_url ||
      null,
    available:
      Boolean(
        Number(
          conversation
            .other_user_is_online
        )
      ),
    child:
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
  contact => ({
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
      getRoleLabel(
        contact.role
      ),
    roleValue:
      normalizeRole(
        contact.role
      ),
    email:
      contact.email || "",
    phone:
      contact.phone || "",
    region:
      contact.region || "",
    avatarUrl:
      contact.avatar_url ||
      null,
    available:
      Boolean(
        Number(
          contact.is_online
        )
      ),
    child:
      contact.child_name ||
      null,
    lastMessage:
      "Start a conversation",
    lastTime: "",
    unread: 0,
    muted: false,
  });


const getChatKey = item =>
  `${item.userId}:${item.conversationType}:${item.childId || 0}`;


const normalizeMessage = (
  item,
  currentUserId
) => ({
  id:
    Number(item.id),
  senderId:
    Number(
      item.sender_id
    ),
  isMine:
    Number(
      item.sender_id
    ) ===
      Number(
        currentUserId
      ),
  text:
    item.body || "",
  messageType:
    item.message_type ||
    "text",
  attachmentName:
    item.attachment_name ||
    "",
  attachmentMime:
    item.attachment_mime ||
    "",
  attachmentSize:
    Number(
      item.attachment_size ||
      0
    ),
  time:
    formatTime(
      item.created_at
    ),
  read: false,
});


const Chat = () => {
  const navigate =
    useNavigate();

  const currentUser =
    useMemo(
      () =>
        getCurrentUser(),
      []
    );

  const userRole =
    normalizeRole(
      currentUser?.role
    );

  const [
    contacts,
    setContacts,
  ] =
    useState([]);

  const [
    conversationList,
    setConversationList,
  ] =
    useState([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] =
    useState(null);

  const [
    currentMessages,
    setCurrentMessages,
  ] =
    useState([]);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    mobileShowChat,
    setMobileShowChat,
  ] =
    useState(false);

  const [
    showMenu,
    setShowMenu,
  ] =
    useState(false);

  const [
    showProfile,
    setShowProfile,
  ] =
    useState(false);

  const [
    profileDetails,
    setProfileDetails,
  ] =
    useState(null);

  const [
    profileLoading,
    setProfileLoading,
  ] =
    useState(false);

  const [
    profileError,
    setProfileError,
  ] =
    useState("");

  const [
    showSearch,
    setShowSearch,
  ] =
    useState(false);

  const [
    conversationSearch,
    setConversationSearch,
  ] =
    useState("");

  const [
    showClearConfirm,
    setShowClearConfirm,
  ] =
    useState(false);

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
    uploadingAttachment,
    setUploadingAttachment,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const messagesEndRef =
    useRef(null);

  const fileInputRef =
    useRef(null);

  const menuRef =
    useRef(null);

  const selectedIdRef =
    useRef(null);


  useEffect(
    () => {
      selectedIdRef.current =
        selectedConversation
          ?.isContact
          ? null
          : selectedConversation
              ?.id ||
            null;
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

        setContacts(
          result.map(
            normalizeContact
          )
        );

        return result;
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

        setConversationList(
          normalized
        );

        if (
          keepSelection &&
          selectedIdRef.current
        ) {
          const refreshed =
            normalized.find(
              item =>
                Number(item.id) ===
                Number(
                  selectedIdRef.current
                )
            );

          if (refreshed) {
            setSelectedConversation(
              previous => ({
                ...refreshed,
                child:
                  refreshed.child ||
                  previous?.child ||
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
          setLoading(true);
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
            requestError
              ?.response
              ?.data
              ?.message ||
            "Unable to load chat."
          );
        } finally {
          setLoading(false);
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


  useEffect(
    () => {

      let active =
        true;

      if (
        !showProfile ||
        !selectedConversation
          ?.userId
      ) {

        setProfileDetails(
          null
        );

        setProfileError(
          ""
        );

        return () => {
          active =
            false;
        };

      }

      const loadProfile =
        async () => {

          try {

            setProfileLoading(
              true
            );

            setProfileError(
              ""
            );

            const result =
              await getChatUserProfile(
                selectedConversation
                  .userId
              );

            if (
              active
            ) {
              setProfileDetails(
                result
              );
            }

          } catch (
            requestError
          ) {

            console.error(
              requestError
            );

            if (
              active
            ) {

              setProfileDetails(
                null
              );

              setProfileError(
                requestError
                  ?.response
                  ?.data
                  ?.message ||
                "Unable to load profile details."
              );

            }

          } finally {

            if (
              active
            ) {
              setProfileLoading(
                false
              );
            }

          }

        };

      loadProfile();

      return () => {
        active =
          false;
      };

    },
    [
      showProfile,
      selectedConversation
        ?.userId,
    ]
  );


  const availableItems =
    useMemo(
      () => {
        const conversations =
          conversationList.map(
            item => ({
              ...item,
            })
          );

        const existingKeys =
          new Set(
            conversations.map(
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
              conversations.push(
                contact
              );
            }
          }
        );

        return conversations;
      },
      [
        contacts,
        conversationList,
      ]
    );


  const loadMessages =
    useCallback(
      async (
        conversation,
        showLoader = true
      ) => {
        if (
          !conversation ||
          conversation
            .isContact
        ) {
          setCurrentMessages(
            []
          );
          return [];
        }

        try {
          if (showLoader) {
            setLoadingMessages(
              true
            );
          }

          const result =
            await getChatMessages(
              conversation.id
            );

          const normalized =
            result.map(
              item =>
                normalizeMessage(
                  item,
                  currentUser?.id
                )
            );

          setCurrentMessages(
            normalized
          );

          await markChatConversationRead(
            conversation.id
          );

          setConversationList(
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

          return normalized;
        } catch (
          requestError
        ) {
          console.error(
            requestError
          );

          if (showLoader) {
            setError(
              requestError
                ?.response
                ?.data
                ?.message ||
              "Unable to load messages."
            );
          }

          return [];
        } finally {
          if (showLoader) {
            setLoadingMessages(
              false
            );
          }
        }
      },
      [
        currentUser?.id,
      ]
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

      const interval =
        window.setInterval(
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
        window.clearInterval(
          interval
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
      messagesEndRef
        .current
        ?.scrollIntoView({
          behavior: "smooth",
        });
    },
    [
      currentMessages.length,
      selectedConversation?.id,
    ]
  );


  useEffect(
    () => {
      const handleClickOutside =
        event => {
          if (
            menuRef.current &&
            !menuRef.current.contains(
              event.target
            )
          ) {
            setShowMenu(false);
          }
        };

      document.addEventListener(
        "mousedown",
        handleClickOutside
      );

      return () => {
        document.removeEventListener(
          "mousedown",
          handleClickOutside
        );
      };
    },
    []
  );


  const filteredConversations =
    availableItems.filter(
      conversation =>
        `${conversation.name} ${conversation.role} ${conversation.child || ""}`
          .toLowerCase()
          .includes(
            search
              .trim()
              .toLowerCase()
          )
    );


  const filteredMessages =
    currentMessages.filter(
      item =>
        `${item.text || ""} ${item.attachmentName || ""}`
          .toLowerCase()
          .includes(
            conversationSearch
              .toLowerCase()
          )
    );


  const selectConversation =
    async conversation => {
      try {
        setError("");
        setShowMenu(false);
        setShowSearch(false);
        setConversationSearch("");
        setMobileShowChat(true);

        let resolved =
          conversation;

        if (
          conversation.isContact
        ) {
          setLoadingMessages(
            true
          );

          const result =
            await createChatConversation({
              targetUserId:
                conversation.userId,
              childId:
                conversation.childId,
            });

          const createdId =
            Number(
              result
                ?.conversation
                ?.id
            );

          const refreshed =
            await loadConversations(
              false
            );

          resolved =
            refreshed.find(
              item =>
                Number(item.id) ===
                  createdId
            ) || {
              ...conversation,
              id: createdId,
              isContact: false,
              lastMessage:
                "No messages yet",
            };

          if (
            !resolved.child &&
            conversation.child
          ) {
            resolved = {
              ...resolved,
              child:
                conversation.child,
            };
          }
        }

        setSelectedConversation(
          resolved
        );

        selectedIdRef.current =
          resolved.id;

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
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to open conversation."
        );

        setLoadingMessages(
          false
        );
      }
    };


  const handleSendMessage =
    async () => {
      const trimmedMessage =
        message.trim();

      if (
        !trimmedMessage ||
        !selectedConversation ||
        selectedConversation
          .isContact ||
        sending
      ) {
        return;
      }

      try {
        setSending(true);
        setError("");

        const result =
          await sendChatMessage(
            selectedConversation.id,
            trimmedMessage
          );

        const sent =
          result?.chat_message;

        if (sent) {
          const normalized =
            normalizeMessage(
              sent,
              currentUser?.id
            );

          setCurrentMessages(
            previous => [
              ...previous,
              normalized,
            ]
          );

          setConversationList(
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
                          trimmedMessage,
                        lastTime:
                          normalized.time,
                        unread: 0,
                      }
                    : item
              )
          );

          setSelectedConversation(
            previous => ({
              ...previous,
              lastMessage:
                trimmedMessage,
              lastTime:
                normalized.time,
            })
          );
        }

        setMessage("");
      } catch (
        requestError
      ) {
        console.error(
          requestError
        );

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to send message."
        );
      } finally {
        setSending(false);
      }
    };


  const formatFileSize =
    bytes => {

      const size =
        Number(
          bytes ||
          0
        );

      if (
        size < 1024
      ) {
        return `${size} B`;
      }

      if (
        size <
        1024 * 1024
      ) {
        return `${(
          size /
          1024
        ).toFixed(1)} KB`;
      }

      return `${(
        size /
        (
          1024 *
          1024
        )
      ).toFixed(1)} MB`;

    };


  const handleAttachmentChange =
    async event => {

      const file =
        event.target
          .files?.[0];

      event.target.value =
        "";

      if (
        !file ||
        !selectedConversation ||
        selectedConversation
          .isContact ||
        uploadingAttachment
      ) {
        return;
      }

      if (
        file.size >
        10 *
          1024 *
          1024
      ) {

        setError(
          "Files must be 10 MB or smaller."
        );

        return;
      }

      try {

        setUploadingAttachment(
          true
        );

        setError(
          ""
        );

        const result =
          await sendChatAttachment(
            selectedConversation.id,
            file
          );

        const sent =
          result?.chat_message;

        if (
          sent
        ) {

          const normalized =
            normalizeMessage(
              sent,
              currentUser?.id
            );

          setCurrentMessages(
            previous => [
              ...previous,
              normalized,
            ]
          );

          const previewText =
            sent.message_type ===
              "image"
              ? "Image"
              : `File: ${
                  sent.attachment_name ||
                  file.name
                }`;

          setConversationList(
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
                          previewText,
                        lastTime:
                          normalized.time,
                        unread: 0,
                      }
                    : item
              )
          );

          setSelectedConversation(
            previous => ({
              ...previous,
              lastMessage:
                previewText,
              lastTime:
                normalized.time,
            })
          );

        }

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
          (
            requestError
              ?.response
              ?.status ===
            413
              ? "File is too large."
              : "Unable to send file."
          )
        );

      } finally {

        setUploadingAttachment(
          false
        );

      }

    };


  const handleDownloadAttachment =
    async item => {

      try {

        setError(
          ""
        );

        await downloadChatAttachment(
          item.id,
          item.attachmentName ||
            "attachment"
        );

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to download file."
        );

      }

    };


  const handleKeyDown =
    event => {
      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        handleSendMessage();
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
          selectedConversation.id,
          nextMuted
        );

        setSelectedConversation(
          previous => ({
            ...previous,
            muted:
              nextMuted,
          })
        );

        setConversationList(
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

        setShowMenu(false);
      } catch (
        requestError
      ) {
        console.error(
          requestError
        );

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to update notifications."
        );
      }
    };


  const clearChat =
    async () => {
      if (
        !selectedConversation ||
        selectedConversation
          .isContact
      ) {
        return;
      }

      try {
        await clearChatConversation(
          selectedConversation.id
        );

        setCurrentMessages(
          []
        );

        setConversationList(
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
                      lastTime: "",
                      unread: 0,
                    }
                  : item
            )
        );

        setSelectedConversation(
          previous => ({
            ...previous,
            lastMessage:
              "No messages yet",
            lastTime: "",
            unread: 0,
          })
        );

        setShowClearConfirm(
          false
        );

        setShowMenu(false);
      } catch (
        requestError
      ) {
        console.error(
          requestError
        );

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to clear chat."
        );
      }
    };


  const totalUnread =
    conversationList.reduce(
      (
        total,
        conversation
      ) =>
        total +
        Number(
          conversation.unread ||
            0
        ),
      0
    );


  const parentConversations =
    filteredConversations.filter(
      conversation =>
        conversation.role ===
        "Parent"
    );

  const adminConversations =
    filteredConversations.filter(
      conversation =>
        conversation.role ===
        "Admin"
    );

  const therapistConversations =
    filteredConversations.filter(
      conversation =>
        conversation.role ===
        "Therapist"
    );


  const getAvatar =
    conversation => {
      if (
        conversation.role ===
        "Admin"
      ) {
        return (
          <ShieldCheck
            size={20}
            strokeWidth={1.8}
          />
        );
      }

      if (
        conversation.role ===
        "Parent"
      ) {
        return (
          <UsersRound
            size={20}
            strokeWidth={1.8}
          />
        );
      }

      return (
        <UserRound
          size={20}
          strokeWidth={1.8}
        />
      );
    };


  const getRoleStyle =
    role => {
      if (
        role ===
        "Parent"
      ) {
        return "bg-[#EEF7FF] text-[#5D8DB8]";
      }

      if (
        role ===
        "Admin"
      ) {
        return "bg-[#F2EFFF] text-[#7566D8]";
      }

      return "bg-[#EEF9F5] text-[#4E9B7B]";
    };


  const getPageTitle =
    () => {
      if (
        userRole ===
        "parent"
      ) {
        return "Parent Chat";
      }

      if (
        userRole ===
        "admin"
      ) {
        return "Admin Chat";
      }

      return "Therapist Chat";
    };


  const getPageDescription =
    () => {
      if (
        userRole ===
        "parent"
      ) {
        return "Communicate with your child's therapist";
      }

      if (
        userRole ===
        "admin"
      ) {
        return "Communicate with therapists";
      }

      return "Communicate with parents, administrators and therapists";
    };


  const renderConversation =
    conversation => {
      const isSelected =
        !conversation
          .isContact &&
        !selectedConversation
          ?.isContact &&
        Number(
          selectedConversation
            ?.id
        ) ===
          Number(
            conversation.id
          );

      return (
        <button
          key={
            conversation.id
          }
          onClick={() =>
            selectConversation(
              conversation
            )
          }
          className={`
            group
            relative
            w-full
            text-left
            flex
            items-center
            gap-3
            px-3
            py-3
            rounded-[18px]
            transition-all
            duration-200
            mb-1.5
            ${
              isSelected
                ? "bg-[#F4F1FF] shadow-[0_4px_16px_rgba(124,108,255,.06)]"
                : "hover:bg-[#FAFAFC]"
            }
          `}
        >
          {isSelected && (
            <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[#7C6CFF]" />
          )}

          <div className="relative shrink-0">
            <div
              className={`
                w-12
                h-12
                rounded-[16px]
                flex
                items-center
                justify-center
                transition-all
                ${
                  isSelected
                    ? "bg-white text-[#7C6CFF] shadow-[0_4px_12px_rgba(124,108,255,.12)]"
                    : "bg-[#F3F4F8] text-[#85879A]"
                }
              `}
            >
              {getAvatar(
                conversation
              )}
            </div>

            {conversation.available && (
              <span
                className="
                  absolute
                  right-[-1px]
                  bottom-[-1px]
                  w-[11px]
                  h-[11px]
                  rounded-full
                  bg-[#38C991]
                  border-[2px]
                  border-white
                "
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[13px] text-[#303044] truncate">
                {conversation.name}
              </span>

              <span className="text-[10px] text-[#A5A6B6] shrink-0">
                {conversation.lastTime}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 mt-1.5">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`
                      inline-flex
                      items-center
                      px-1.5
                      py-[2px]
                      rounded-md
                      text-[9px]
                      font-semibold
                      ${getRoleStyle(
                        conversation.role
                      )}
                    `}
                  >
                    {conversation.role}
                  </span>

                  {conversation.child && (
                    <>
                      <span className="text-[#D5D6DF] text-[10px]">
                        •
                      </span>

                      <span className="text-[10px] text-[#8F91A4] truncate">
                        {conversation.child}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-[11px] text-[#999BAE] truncate mt-1">
                  {conversation.lastMessage}
                </p>
              </div>

              {conversation.unread > 0 && (
                <span
                  className="
                    min-w-[20px]
                    h-[20px]
                    px-1.5
                    rounded-full
                    bg-[#7C6CFF]
                    text-white
                    text-[9px]
                    font-bold
                    flex
                    items-center
                    justify-center
                    shrink-0
                    shadow-[0_3px_8px_rgba(124,108,255,.2)]
                  "
                >
                  {conversation.unread}
                </span>
              )}
            </div>
          </div>
        </button>
      );
    };


  if (
    !currentUser
  ) {
    return (
      <div className="h-screen bg-[#F7F8FC] flex items-center justify-center p-6">
        <div className="bg-white border border-[#ECECF5] rounded-[24px] p-8 text-center shadow-sm">
          <MessageCircle
            size={30}
            className="mx-auto text-[#7C6CFF]"
          />
          <h2 className="mt-4 text-[16px] font-bold text-[#303044]">
            Authentication required
          </h2>
          <p className="mt-2 text-[11px] text-[#9A9CAF]">
            Please sign in again to open chat.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="h-screen bg-[#F7F8FC] flex flex-col">
      <header
        className="
          h-[82px]
          bg-white
          border-b
          border-[#ECECF5]
          flex
          items-center
          justify-between
          px-5
          sm:px-8
          shrink-0
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              w-11
              h-11
              rounded-[15px]
              bg-[#F2EFFF]
              text-[#7C6CFF]
              flex
              items-center
              justify-center
            "
          >
            <MessageCircle
              size={21}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-[#303044] tracking-[-0.3px]">
                {getPageTitle()}
              </h1>

              <span
                className="
                  hidden
                  sm:inline-flex
                  items-center
                  gap-1
                  px-2
                  py-1
                  rounded-full
                  bg-[#F4F1FF]
                  text-[#7C6CFF]
                  text-[9px]
                  font-semibold
                "
              >
                <Sparkles size={10} />
                Connected
              </span>
            </div>

            <p className="text-[11px] text-[#9A9CAF] mt-1">
              {getPageDescription()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalUnread > 0 && (
            <div
              className="
                hidden
                sm:flex
                items-center
                gap-2
                px-3
                py-2
                rounded-xl
                bg-[#F6F3FF]
                text-[#7C6CFF]
                text-[10px]
                font-semibold
              "
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C6CFF]" />
              {totalUnread} unread
            </div>
          )}

          <div
            className="
              flex
              items-center
              gap-2
              px-3.5
              py-2
              rounded-xl
              bg-[#F7F8FC]
              border
              border-[#ECECF4]
              text-[#77798E]
              text-[10px]
              font-medium
            "
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#38C991]" />
            <span className="hidden sm:block">
              Secure Chat
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-5 lg:mx-6 mt-4 px-4 py-3 rounded-[14px] border border-[#FFDDE1] bg-[#FFF5F6] text-[#C45D6C] text-[11px]">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 p-5 lg:p-6">
        <div
          className="
            h-full
            bg-white
            rounded-[26px]
            border
            border-[#EDEDF5]
            shadow-[0_12px_45px_rgba(72,67,120,.07)]
            overflow-hidden
            flex
          "
        >
          <aside
            className={`
              w-full
              lg:w-[350px]
              border-r
              border-[#ECECF5]
              flex-col
              shrink-0
              bg-white
              ${
                mobileShowChat
                  ? "hidden lg:flex"
                  : "flex"
              }
            `}
          >
            <div className="p-5 border-b border-[#F0F0F5]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[14px] font-bold text-[#343447]">
                    Conversations
                  </h2>

                  <p className="text-[10px] text-[#A0A2B3] mt-1">
                    {availableItems.length} contacts
                  </p>
                </div>

                <div className="w-8 h-8 rounded-xl bg-[#F6F4FF] text-[#7C6CFF] flex items-center justify-center">
                  <MessageCircle size={15} />
                </div>
              </div>

              <div
                className="
                  h-11
                  bg-[#F8F8FB]
                  rounded-[14px]
                  flex
                  items-center
                  gap-3
                  px-3.5
                  border
                  border-transparent
                  focus-within:border-[#DED9FF]
                  focus-within:bg-white
                  focus-within:shadow-[0_4px_14px_rgba(124,108,255,.05)]
                  transition-all
                "
              >
                <Search
                  size={16}
                  className="text-[#A1A3B5]"
                />

                <input
                  value={search}
                  onChange={event =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search conversations..."
                  className="flex-1 bg-transparent outline-none text-[11px] text-[#303044] placeholder:text-[#A1A3B5]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <MessageCircle
                    size={24}
                    className="text-[#7C6CFF]"
                  />
                  <p className="text-[11px] text-[#9A9CAF] mt-3">
                    Loading chat...
                  </p>
                </div>
              ) : (
                <>
                  {parentConversations.length > 0 && (
                    <div className="pt-5">
                      <div className="flex items-center gap-2 px-2 pb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#73B8EA]" />
                        <span className="text-[9px] uppercase tracking-[0.12em] font-bold text-[#9B9DAE]">
                          Parents
                        </span>
                      </div>

                      {parentConversations.map(
                        renderConversation
                      )}
                    </div>
                  )}

                  {adminConversations.length > 0 && (
                    <div className="pt-5">
                      <div className="flex items-center gap-2 px-2 pb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B7DF2]" />
                        <span className="text-[9px] uppercase tracking-[0.12em] font-bold text-[#9B9DAE]">
                          Administration
                        </span>
                      </div>

                      {adminConversations.map(
                        renderConversation
                      )}
                    </div>
                  )}

                  {therapistConversations.length > 0 && (
                    <div className="pt-5">
                      <div className="flex items-center gap-2 px-2 pb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#61C49B]" />
                        <span className="text-[9px] uppercase tracking-[0.12em] font-bold text-[#9B9DAE]">
                          Therapists
                        </span>
                      </div>

                      {therapistConversations.map(
                        renderConversation
                      )}
                    </div>
                  )}

                  {filteredConversations.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-6">
                      <div className="w-14 h-14 rounded-[18px] bg-[#F4F1FF] flex items-center justify-center text-[#7C6CFF] mb-3">
                        <MessageCircle size={24} />
                      </div>

                      <p className="text-[13px] font-semibold text-[#303044]">
                        No conversations found
                      </p>

                      <p className="text-[10px] text-[#9A9CAF] mt-1">
                        {search
                          ? "Try another search"
                          : "No chat contacts"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>

          <main
            className={`
              flex-1
              min-w-0
              flex-col
              bg-[#FCFCFE]
              ${
                !mobileShowChat
                  ? "hidden lg:flex"
                  : "flex"
              }
            `}
          >
            {selectedConversation ? (
              <>
                <div
                  className="
                    h-[78px]
                    px-5
                    lg:px-7
                    bg-white
                    border-b
                    border-[#ECECF5]
                    flex
                    items-center
                    justify-between
                    shrink-0
                  "
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setMobileShowChat(
                          false
                        )
                      }
                      className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[#777A91] hover:bg-[#F5F3FF] hover:text-[#7C6CFF] transition"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <div className="relative">
                      <div className="w-11 h-11 rounded-[15px] bg-[#F3F4F8] text-[#777A91] flex items-center justify-center">
                        {getAvatar(
                          selectedConversation
                        )}
                      </div>

                      {selectedConversation.available && (
                        <span className="absolute right-[-1px] bottom-[-1px] w-[11px] h-[11px] rounded-full bg-[#38C991] border-2 border-white" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setShowProfile(
                              true
                            )
                          }
                          title="View profile"
                          className="font-bold text-[#303044] text-[14px] hover:text-[#7C6CFF] transition text-left"
                        >
                          {selectedConversation.name}
                        </button>

                        <span
                          className={`
                            hidden
                            sm:inline-flex
                            px-2
                            py-0.5
                            rounded-md
                            text-[9px]
                            font-semibold
                            ${getRoleStyle(
                              selectedConversation.role
                            )}
                          `}
                        >
                          {selectedConversation.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`
                            w-1.5
                            h-1.5
                            rounded-full
                            ${
                              selectedConversation.available
                                ? "bg-[#38C991]"
                                : "bg-[#C7C8D1]"
                            }
                          `}
                        />

                        <span
                          className={`
                            text-[10px]
                            ${
                              selectedConversation.available
                                ? "text-[#4E9B7B]"
                                : "text-[#9A9CAF]"
                            }
                          `}
                        >
                          {selectedConversation.available
                            ? "Online"
                            : "Offline"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="relative"
                    ref={menuRef}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setShowMenu(
                          previous =>
                            !previous
                        )
                      }
                      className={`
                        w-9
                        h-9
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        transition
                        ${
                          showMenu
                            ? "bg-[#F5F3FF] text-[#7C6CFF]"
                            : "text-[#85879A] hover:bg-[#F5F3FF] hover:text-[#7C6CFF]"
                        }
                      `}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 top-11 w-[205px] bg-white border border-[#ECECF4] rounded-[16px] shadow-[0_12px_35px_rgba(55,50,100,.12)] p-1.5 z-50">
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfile(
                              true
                            );
                            setShowMenu(
                              false
                            );
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[11px] font-medium text-[#4A4B60] hover:bg-[#F7F5FF] hover:text-[#7C6CFF] transition"
                        >
                          <UserRound size={15} />
                          View Profile
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowSearch(
                              true
                            );
                            setShowMenu(
                              false
                            );
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[11px] font-medium text-[#4A4B60] hover:bg-[#F7F5FF] hover:text-[#7C6CFF] transition"
                        >
                          <Search size={15} />
                          Search Conversation
                        </button>

                        <button
                          type="button"
                          onClick={
                            toggleMute
                          }
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[11px] font-medium text-[#4A4B60] hover:bg-[#F7F5FF] hover:text-[#7C6CFF] transition"
                        >
                          {selectedConversation.muted ? (
                            <Bell size={15} />
                          ) : (
                            <BellOff size={15} />
                          )}

                          {selectedConversation.muted
                            ? "Unmute Notifications"
                            : "Mute Notifications"}
                        </button>

                        <div className="h-px bg-[#F0F0F5] my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            setShowClearConfirm(
                              true
                            );
                            setShowMenu(
                              false
                            );
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[11px] font-medium text-[#D26A78] hover:bg-[#FFF4F5] transition"
                        >
                          <Trash2 size={15} />
                          Clear Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {showSearch && (
                  <div className="mx-5 lg:mx-7 mt-4 px-3 py-2 bg-white border border-[#E8E8F0] rounded-[14px] flex items-center gap-2 shadow-[0_3px_12px_rgba(40,40,80,.03)]">
                    <Search
                      size={16}
                      className="text-[#A1A3B5] shrink-0"
                    />

                    <input
                      autoFocus
                      value={
                        conversationSearch
                      }
                      onChange={event =>
                        setConversationSearch(
                          event.target
                            .value
                        )
                      }
                      placeholder="Search messages..."
                      className="flex-1 bg-transparent outline-none text-[11px] text-[#303044] placeholder:text-[#A1A3B5]"
                    />

                    {conversationSearch && (
                      <span className="text-[9px] text-[#9A9CAF]">
                        {filteredMessages.length} found
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowSearch(
                          false
                        );
                        setConversationSearch(
                          ""
                        );
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9294A7] hover:bg-[#F5F3FF] hover:text-[#7C6CFF]"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}

                {selectedConversation.child && (
                  <div className="mx-5 lg:mx-7 mt-4 px-4 py-3 rounded-[17px] bg-gradient-to-r from-[#F8F6FF] to-[#FCFBFF] border border-[#ECE7FF] flex items-center justify-between shadow-[0_3px_14px_rgba(124,108,255,.035)]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white text-[#7C6CFF] flex items-center justify-center shadow-[0_3px_10px_rgba(124,108,255,.08)]">
                        <UserRound size={16} />
                      </div>

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.1em] font-bold text-[#9A9CAF]">
                          Discussing child
                        </p>

                        <p className="text-[12px] font-bold text-[#4A4960] mt-0.5">
                          {selectedConversation.child}
                        </p>
                      </div>
                    </div>

                    {userRole ===
                      "therapist" &&
                    selectedConversation.role ===
                      "Parent" &&
                    Number(
                      selectedConversation.childId ||
                      0
                    ) > 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/children/${selectedConversation.childId}`
                          )
                        }
                        className="text-[9px] font-semibold text-[#8B7DF2] bg-white border border-[#ECE7FF] px-3 py-1.5 rounded-lg hover:bg-[#F4F1FF] hover:border-[#DCD4FF] transition"
                      >
                        Child Profile
                      </button>
                    ) : null}
                  </div>
                )}

                <div className="flex-1 min-h-0 overflow-y-auto px-5 lg:px-8 py-6">
                  <div className="max-w-[850px] mx-auto space-y-4">
                    <div className="flex items-center justify-center mb-6">
                      <div className="flex items-center gap-3 w-full">
                        <span className="h-px bg-[#EDEDF4] flex-1" />

                        <span className="px-3 py-1 rounded-full bg-white border border-[#ECECF4] text-[9px] font-medium text-[#A1A3B5]">
                          Messages
                        </span>

                        <span className="h-px bg-[#EDEDF4] flex-1" />
                      </div>
                    </div>

                    {loadingMessages ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <MessageCircle
                          size={22}
                          className="text-[#7C6CFF]"
                        />
                        <p className="text-[10px] text-[#9A9CAF] mt-3">
                          Loading messages...
                        </p>
                      </div>
                    ) : filteredMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-[18px] bg-[#F4F1FF] text-[#7C6CFF] flex items-center justify-center mb-3">
                          {conversationSearch ? (
                            <Search size={22} />
                          ) : (
                            <MessageCircle size={22} />
                          )}
                        </div>

                        <p className="text-[12px] font-semibold text-[#303044]">
                          {conversationSearch
                            ? "No messages found"
                            : "No messages yet"}
                        </p>

                        {conversationSearch && (
                          <p className="text-[10px] text-[#9A9CAF] mt-1">
                            Try another search
                          </p>
                        )}
                      </div>
                    ) : (
                      filteredMessages.map(
                        item => (
                          <div
                            key={item.id}
                            className={`
                              flex
                              ${
                                item.isMine
                                  ? "justify-end"
                                  : "justify-start"
                              }
                            `}
                          >
                            <div
                              className={`
                                max-w-[75%]
                                sm:max-w-[65%]
                                flex
                                flex-col
                                ${
                                  item.isMine
                                    ? "items-end"
                                    : "items-start"
                                }
                              `}
                            >
                              <div
                                className={`
                                  px-4
                                  py-3
                                  rounded-[18px]
                                  text-[12px]
                                  leading-[1.7]
                                  shadow-[0_3px_12px_rgba(30,30,60,.035)]
                                  whitespace-pre-wrap
                                  break-words
                                  ${
                                    item.isMine
                                      ? "bg-[#7C6CFF] text-white rounded-br-[6px] shadow-[0_6px_18px_rgba(124,108,255,.16)]"
                                      : "bg-white text-[#46475B] border border-[#ECECF4] rounded-bl-[6px]"
                                  }
                                `}
                              >
                                {item.attachmentName ? (
                                  <div
                                    className={`
                                      min-w-[220px]
                                      flex
                                      items-center
                                      gap-3
                                      ${
                                        item.isMine
                                          ? "text-white"
                                          : "text-[#46475B]"
                                      }
                                    `}
                                  >
                                    <div
                                      className={`
                                        w-10
                                        h-10
                                        rounded-xl
                                        shrink-0
                                        flex
                                        items-center
                                        justify-center
                                        ${
                                          item.isMine
                                            ? "bg-white/15"
                                            : "bg-[#F4F1FF] text-[#7C6CFF]"
                                        }
                                      `}
                                    >
                                      {item.messageType ===
                                      "image" ? (
                                        <ImageIcon
                                          size={19}
                                        />
                                      ) : (
                                        <FileText
                                          size={19}
                                        />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold truncate text-[11px]">
                                        {
                                          item.attachmentName
                                        }
                                      </p>

                                      <p
                                        className={`
                                          text-[9px]
                                          mt-0.5
                                          ${
                                            item.isMine
                                              ? "text-white/70"
                                              : "text-[#9A9CAF]"
                                          }
                                        `}
                                      >
                                        {formatFileSize(
                                          item.attachmentSize
                                        )}
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDownloadAttachment(
                                          item
                                        )
                                      }
                                      title="Download file"
                                      className={`
                                        w-9
                                        h-9
                                        rounded-xl
                                        shrink-0
                                        flex
                                        items-center
                                        justify-center
                                        transition
                                        ${
                                          item.isMine
                                            ? "bg-white/15 hover:bg-white/25 text-white"
                                            : "bg-[#F4F1FF] hover:bg-[#ECE7FF] text-[#7C6CFF]"
                                        }
                                      `}
                                    >
                                      <Download
                                        size={17}
                                      />
                                    </button>
                                  </div>
                                ) : conversationSearch ? (
                                  <span>
                                    {item.text
                                      .split(
                                        new RegExp(
                                          `(${conversationSearch.replace(
                                            /[.*+?^${}()|[\]\\]/g,
                                            "\\$&"
                                          )})`,
                                          "gi"
                                        )
                                      )
                                      .map(
                                        (
                                          part,
                                          index
                                        ) =>
                                          part.toLowerCase() ===
                                          conversationSearch.toLowerCase() ? (
                                            <mark
                                              key={index}
                                              className={
                                                item.isMine
                                                  ? "bg-white/30 text-white rounded px-0.5"
                                                  : "bg-[#EEE9FF] text-[#6F60F0] rounded px-0.5"
                                              }
                                            >
                                              {part}
                                            </mark>
                                          ) : (
                                            part
                                          )
                                      )}
                                  </span>
                                ) : (
                                  item.text
                                )}
                              </div>

                              <div
                                className={`
                                  flex
                                  items-center
                                  gap-1.5
                                  mt-1.5
                                  ${
                                    item.isMine
                                      ? "mr-1"
                                      : "ml-1"
                                  }
                                `}
                              >
                                <span className="text-[9px] text-[#A1A3B5]">
                                  {item.time}
                                </span>

                                {item.isMine && (
                                  <Check
                                    size={13}
                                    className="text-[#A1A3B5]"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="px-5 lg:px-7 pb-5 pt-2 shrink-0 bg-[#FCFCFE]">
                  <div className="max-w-[900px] mx-auto">
                    <div className="min-h-[58px] bg-white border border-[#E8E8F0] rounded-[18px] flex items-end gap-1.5 px-2.5 py-2 focus-within:border-[#D7D1FF] focus-within:ring-4 focus-within:ring-[#F3F0FF] focus-within:shadow-[0_5px_20px_rgba(124,108,255,.06)] transition-all shadow-[0_4px_16px_rgba(40,40,80,.04)]">
                      <input
                        ref={
                          fileInputRef
                        }
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp"
                        onChange={
                          handleAttachmentChange
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef
                            .current
                            ?.click()
                        }
                        disabled={
                          uploadingAttachment ||
                          !selectedConversation ||
                          selectedConversation
                            .isContact
                        }
                        title={
                          uploadingAttachment
                            ? "Uploading file..."
                            : "Send file or report"
                        }
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8D8FA3] hover:bg-[#F5F3FF] hover:text-[#7C6CFF] disabled:opacity-35 disabled:cursor-not-allowed transition shrink-0"
                      >
                        <Paperclip
                          size={18}
                        />
                      </button>

                      <textarea
                        value={message}
                        onChange={event =>
                          setMessage(
                            event.target.value
                          )
                        }
                        onKeyDown={
                          handleKeyDown
                        }
                        rows={1}
                        maxLength={4000}
                        placeholder="Write a message..."
                        className="flex-1 resize-none bg-transparent outline-none border-none text-[12px] text-[#303044] placeholder:text-[#A1A3B5] py-2.5 max-h-28"
                      />

                      <button
                        type="button"
                        disabled
                        title="Emoji picker will be added next"
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[#C2C3CD] shrink-0 cursor-not-allowed"
                      >
                        <Smile size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleSendMessage
                        }
                        disabled={
                          !message.trim() ||
                          sending
                        }
                        className="w-10 h-10 rounded-[13px] bg-[#7C6CFF] text-white flex items-center justify-center hover:bg-[#6F60F0] active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed transition-all shrink-0 shadow-[0_6px_16px_rgba(124,108,255,.22)]"
                      >
                        <Send size={17} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 px-1">
                      <p className="text-[9px] text-[#A6A8B8]">
                        {uploadingAttachment
                          ? "Uploading file..."
                          : selectedConversation.muted
                            ? "Notifications are muted"
                            : "Messages are private and secure"}
                      </p>

                      <p className="text-[9px] text-[#A6A8B8]">
                        Press Enter to send
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center px-5">
                  <div className="w-16 h-16 rounded-[20px] bg-[#F4F1FF] text-[#7C6CFF] flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={27} />
                  </div>

                  <h2 className="text-[17px] font-bold text-[#303044]">
                    No conversation selected
                  </h2>

                  <p className="text-[11px] text-[#9A9CAF] mt-2">
                    Select a contact to start chatting
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showProfile &&
        selectedConversation && (
          <div
            className="fixed inset-0 bg-[#25243A]/30 backdrop-blur-[3px] flex items-center justify-center p-5 z-[100]"
            onClick={() =>
              setShowProfile(
                false
              )
            }
          >
            <div
              className="w-full max-w-[720px] max-h-[88vh] overflow-y-auto bg-white rounded-[30px] border border-[#E9E9F2] shadow-[0_30px_90px_rgba(45,40,90,.22)]"
              onClick={event =>
                event.stopPropagation()
              }
            >
              <div className="relative px-8 pt-8 pb-7 bg-gradient-to-br from-[#F7F4FF] via-white to-[#F6FBFA] border-b border-[#EEEEF5]">
                <button
                  type="button"
                  onClick={() =>
                    setShowProfile(
                      false
                    )
                  }
                  className="absolute right-6 top-6 w-10 h-10 rounded-[14px] bg-white border border-[#E8E8F0] text-[#7C7E91] flex items-center justify-center hover:text-[#7C6CFF] hover:border-[#DCD5FF] transition"
                >
                  <X size={18} />
                </button>

                <div className="flex items-start gap-5 pr-14">
                  <div className="w-[92px] h-[92px] rounded-[28px] bg-white border border-[#E8E8F0] shadow-[0_10px_28px_rgba(70,60,130,.11)] flex items-center justify-center text-[#7C6CFF] relative shrink-0">
                    <div className="scale-[1.35]">
                      {getAvatar(
                        selectedConversation
                      )}
                    </div>

                    <span
                      className={`
                        absolute
                        right-1
                        bottom-1
                        w-4
                        h-4
                        rounded-full
                        border-[3px]
                        border-white
                        ${
                          selectedConversation.available
                            ? "bg-[#35C991]"
                            : "bg-[#C9CAD4]"
                        }
                      `}
                    />
                  </div>

                  <div className="min-w-0 pt-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-[25px] font-bold text-[#292A3A] leading-tight">
                        {profileDetails
                          ?.user
                          ?.full_name ||
                          selectedConversation.name}
                      </h2>

                      <span
                        className={`
                          px-3
                          py-1.5
                          rounded-full
                          text-[10px]
                          font-bold
                          ${getRoleStyle(
                            selectedConversation.role
                          )}
                        `}
                      >
                        {selectedConversation.role}
                      </span>

                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          px-3
                          py-1.5
                          rounded-full
                          text-[10px]
                          font-bold
                          ${
                            selectedConversation.available
                              ? "bg-[#EAF8F2] text-[#36956F]"
                              : "bg-[#F1F2F6] text-[#8D8F9E]"
                          }
                        `}
                      >
                        <span
                          className={`
                            w-1.5
                            h-1.5
                            rounded-full
                            ${
                              selectedConversation.available
                                ? "bg-[#35C991]"
                                : "bg-[#B9BAC5]"
                            }
                          `}
                        />

                        {selectedConversation.available
                          ? "Online"
                          : "Offline"}
                      </span>
                    </div>

                    <p className="text-[12px] text-[#9A9CAF] mt-2">
                      {selectedConversation.role} ID #
                      {profileDetails
                        ?.user
                        ?.id ||
                        selectedConversation.userId}
                    </p>

                    <div className="mt-3">
                      <span
                        className={`
                          inline-flex
                          items-center
                          px-3
                          py-1.5
                          rounded-[10px]
                          text-[10px]
                          font-semibold
                          ${
                            Number(
                              profileDetails
                                ?.user
                                ?.is_active ??
                              1
                            )
                              ? "bg-[#F0FAF6] text-[#46916F]"
                              : "bg-[#FFF0F2] text-[#C55E70]"
                          }
                        `}
                      >
                        {Number(
                          profileDetails
                            ?.user
                            ?.is_active ??
                          1
                        )
                          ? "Account Active"
                          : "Account Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-7">
                {profileLoading ? (
                  <div className="py-14 text-center">
                    <div className="w-10 h-10 rounded-full border-[3px] border-[#E8E4FF] border-t-[#7C6CFF] animate-spin mx-auto" />

                    <p className="text-[12px] text-[#9294A5] mt-4">
                      Loading profile details...
                    </p>
                  </div>
                ) : (
                  <>
                    {profileError && (
                      <div className="mb-5 px-4 py-3 rounded-[14px] bg-[#FFF5F6] border border-[#FFDDE2] text-[11px] text-[#C96272]">
                        {profileError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="min-h-[112px] rounded-[18px] bg-[#F9F9FC] border border-[#EEEEF4] px-4 py-4">
                        <div className="w-8 h-8 rounded-[10px] bg-white text-[#7C6CFF] border border-[#ECEAF7] flex items-center justify-center mb-3">
                          <Mail size={15} />
                        </div>

                        <p className="text-[9px] uppercase tracking-[.11em] font-bold text-[#AAABBA]">
                          Email
                        </p>

                        <p className="text-[12px] font-semibold text-[#4A4B5C] mt-1 break-all">
                          {profileDetails
                            ?.user
                            ?.email ||
                            selectedConversation.email ||
                            "Not provided"}
                        </p>
                      </div>

                      <div className="min-h-[112px] rounded-[18px] bg-[#F9F9FC] border border-[#EEEEF4] px-4 py-4">
                        <div className="w-8 h-8 rounded-[10px] bg-white text-[#6E9D8A] border border-[#E8F1ED] flex items-center justify-center mb-3">
                          <Phone size={15} />
                        </div>

                        <p className="text-[9px] uppercase tracking-[.11em] font-bold text-[#AAABBA]">
                          Phone
                        </p>

                        <p className="text-[12px] font-semibold text-[#4A4B5C] mt-1">
                          {profileDetails
                            ?.user
                            ?.phone ||
                            selectedConversation.phone ||
                            "Not provided"}
                        </p>
                      </div>

                      <div className="min-h-[112px] rounded-[18px] bg-[#F9F9FC] border border-[#EEEEF4] px-4 py-4">
                        <div className="w-8 h-8 rounded-[10px] bg-white text-[#D08C71] border border-[#F5ECE8] flex items-center justify-center mb-3">
                          <MapPin size={15} />
                        </div>

                        <p className="text-[9px] uppercase tracking-[.11em] font-bold text-[#AAABBA]">
                          Region
                        </p>

                        <p className="text-[12px] font-semibold text-[#4A4B5C] mt-1">
                          {profileDetails
                            ?.user
                            ?.region ||
                            selectedConversation.region ||
                            "No region"}
                        </p>
                      </div>
                    </div>

                    {selectedConversation.role !==
                      "Admin" && (
                      <div className="mt-6 rounded-[22px] border border-[#ECECF4] overflow-hidden">
                        <div className="px-5 py-4 bg-[#FAFAFD] border-b border-[#ECECF4] flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-[13px] font-bold text-[#3F4052]">
                              Linked Children
                            </h3>

                            <p className="text-[10px] text-[#9B9DAC] mt-1">
                              Children connected to this profile that you are allowed to view.
                            </p>
                          </div>

                          <span className="min-w-8 h-8 px-2 rounded-[11px] bg-[#F0ECFF] text-[#7C6CFF] text-[11px] font-bold flex items-center justify-center">
                            {
                              (
                                profileDetails
                                  ?.linked_children ||
                                (
                                  selectedConversation.childId
                                    ? [
                                        {
                                          id:
                                            selectedConversation.childId,
                                          full_name:
                                            selectedConversation.child,
                                        },
                                      ]
                                    : []
                                )
                              ).length
                            }
                          </span>
                        </div>

                        <div className="p-5">
                          {(
                            profileDetails
                              ?.linked_children ||
                            (
                              selectedConversation.childId
                                ? [
                                    {
                                      id:
                                        selectedConversation.childId,
                                      full_name:
                                        selectedConversation.child,
                                    },
                                  ]
                                : []
                            )
                          ).length ? (
                            <div className="flex flex-wrap gap-2.5">
                              {(
                                profileDetails
                                  ?.linked_children ||
                                [
                                  {
                                    id:
                                      selectedConversation.childId,
                                    full_name:
                                      selectedConversation.child,
                                  },
                                ]
                              ).map(
                                child => (
                                  <button
                                    key={
                                      child.id
                                    }
                                    type="button"
                                    disabled={
                                      userRole !==
                                      "therapist"
                                    }
                                    onClick={() => {
                                      if (
                                        userRole ===
                                        "therapist"
                                      ) {
                                        setShowProfile(
                                          false
                                        );

                                        navigate(
                                          `/children/${child.id}`
                                        );
                                      }
                                    }}
                                    className={`
                                      px-4
                                      py-2.5
                                      rounded-[13px]
                                      bg-[#F2F7FF]
                                      text-[#5D83B3]
                                      text-[11px]
                                      font-semibold
                                      border
                                      border-[#E3EDF9]
                                      ${
                                        userRole ===
                                        "therapist"
                                          ? "hover:bg-[#EAF3FF] cursor-pointer"
                                          : "cursor-default"
                                      }
                                      transition
                                    `}
                                  >
                                    {child.full_name ||
                                      selectedConversation.child ||
                                      `Child #${child.id}`}
                                  </button>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] text-[#9A9CAF]">
                              No linked children are available for this profile.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-between gap-4 rounded-[18px] bg-[#F8F7FC] border border-[#ECECF4] px-5 py-4">
                      <div>
                        <p className="text-[11px] font-semibold text-[#55566A]">
                          Chat Notifications
                        </p>

                        <p className="text-[9px] text-[#9A9CAF] mt-1">
                          Notification setting for this conversation.
                        </p>
                      </div>

                      <span
                        className={`
                          px-3
                          py-1.5
                          rounded-[10px]
                          text-[10px]
                          font-bold
                          ${
                            selectedConversation.muted
                              ? "bg-[#FFF0F2] text-[#C55F70]"
                              : "bg-[#EAF8F2] text-[#3D956F]"
                          }
                        `}
                      >
                        {selectedConversation.muted
                          ? "Muted"
                          : "Enabled"}
                      </span>
                    </div>
                  </>
                )}

                <div className="mt-7 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setShowProfile(
                        false
                      )
                    }
                    className="min-w-[120px] h-11 px-6 rounded-[14px] bg-[#7C6CFF] text-white text-[11px] font-semibold hover:bg-[#6F60F0] transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {showClearConfirm && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-5 z-[110]"
          onClick={() =>
            setShowClearConfirm(
              false
            )
          }
        >
          <div
            className="w-full max-w-[360px] bg-white rounded-[22px] border border-[#ECECF4] shadow-[0_25px_70px_rgba(45,40,90,.18)] p-6"
            onClick={event =>
              event.stopPropagation()
            }
          >
            <div className="w-12 h-12 rounded-[15px] bg-[#FFF2F4] text-[#D26A78] flex items-center justify-center mb-4">
              <Trash2 size={20} />
            </div>

            <h2 className="text-[16px] font-bold text-[#303044]">
              Clear conversation?
            </h2>

            <p className="text-[11px] leading-6 text-[#8F91A4] mt-2">
              All messages will be removed from your current chat view only.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() =>
                  setShowClearConfirm(
                    false
                  )
                }
                className="flex-1 h-10 rounded-xl bg-[#F5F5F8] text-[#66687B] text-[11px] font-semibold hover:bg-[#EEEEF3] transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={clearChat}
                className="flex-1 h-10 rounded-xl bg-[#D26A78] text-white text-[11px] font-semibold hover:bg-[#C45D6C] transition"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Chat;
