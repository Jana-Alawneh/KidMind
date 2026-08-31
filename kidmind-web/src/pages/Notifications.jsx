import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  Check,
  CheckCheck,
  Gamepad2,
  Mail,
  RefreshCw,
  Sparkles,
  UserRoundPlus,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import api from "../services/api";

const getStoredUser = () => {
  try {
    const raw =
      sessionStorage.getItem(
        "kidmind_user"
      );

    return raw
      ? JSON.parse(raw)
      : null;
  } catch {
    return null;
  }
};

const formatTimeAgo = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  const now =
    new Date();

  const seconds =
    Math.max(
      0,
      Math.floor(
        (
          now.getTime() -
          date.getTime()
        ) / 1000
      )
    );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !==
        now.getFullYear()
          ? "numeric"
          : undefined,
    }
  );
};

const getVisual = (
  type
) => {
  if (
    type ===
    "new_message"
  ) {
    return {
      Icon: Mail,
      color: "#6F61DF",
      background:
        "#F0EDFF",
    };
  }

  if (
    type ===
    "assigned_game"
  ) {
    return {
      Icon: Gamepad2,
      color: "#2563EB",
      background:
        "#EAF2FF",
    };
  }

  if (
    type ===
    "session_completed"
  ) {
    return {
      Icon: CheckCheck,
      color: "#159669",
      background:
        "#E7F8F1",
    };
  }

  if (
    type ===
    "child_assigned"
  ) {
    return {
      Icon: UserRoundPlus,
      color: "#D97706",
      background:
        "#FFF3DF",
    };
  }

  return {
    Icon: Sparkles,
    color: "#7C6CFF",
    background:
      "#F2EEFF",
  };
};

const getSubtitle = (
  role
) => {
  if (role === "parent") {
    return "Stay updated on your child's games, sessions, reports, and care team messages.";
  }

  if (role === "admin") {
    return "Review important account, communication, and system activity updates.";
  }

  return "Keep track of child assignments, completed sessions, games, and messages.";
};

function NotificationsContent({
  currentUser,
}) {
  const navigate =
    useNavigate();

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    filter,
    setFilter,
  ] = useState("all");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const notifySidebar = () => {
    window.dispatchEvent(
      new Event(
        "kidmind-notifications-updated"
      )
    );
  };

  const loadNotifications =
    useCallback(
      async (
        refresh = false
      ) => {
        try {
          if (refresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const [
            listResponse,
            countResponse,
          ] =
            await Promise.all([
              api.get(
                "/notifications"
              ),
              api.get(
                "/notifications/unread-count"
              ),
            ]);

          setNotifications(
            Array.isArray(
              listResponse
                .data
                ?.notifications
            )
              ? listResponse
                  .data
                  .notifications
              : []
          );

          setUnreadCount(
            Number(
              countResponse
                .data
                ?.unread_count ||
              0
            )
          );
        } catch (loadError) {
          console.error(
            "Failed to load notifications:",
            loadError
          );

          setError(
            loadError
              ?.response
              ?.data
              ?.message ||
            loadError
              ?.message ||
            "Failed to load notifications"
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const visibleNotifications =
    useMemo(
      () =>
        filter === "unread"
          ? notifications.filter(
              item =>
                Number(
                  item.is_read
                ) !== 1
            )
          : notifications,
      [
        filter,
        notifications,
      ]
    );

  const markOneRead =
    async (
      item
    ) => {
      if (
        Number(
          item.is_read
        ) === 1
      ) {
        return;
      }

      await api.put(
        `/notifications/${item.id}/read`
      );

      setNotifications(
        previous =>
          previous.map(
            notification =>
              Number(
                notification.id
              ) ===
              Number(item.id)
                ? {
                    ...notification,
                    is_read: 1,
                    read_at:
                      new Date()
                        .toISOString(),
                  }
                : notification
          )
      );

      setUnreadCount(
        previous =>
          Math.max(
            0,
            previous - 1
          )
      );

      notifySidebar();
    };

  const openNotification =
    async (
      item
    ) => {
      try {
        await markOneRead(
          item
        );
      } catch (readError) {
        console.error(
          "Failed to mark notification as read:",
          readError
        );
      }

      const path =
  (
    item.type ===
      "new_feedback" ||
    item.entity_type ===
      "feedback"
  )
    ? "/admin?section=feedback"
    : String(
        item.action_path ||
        ""
      ).trim();

      if (path) {
        navigate(path);
      }
    };

  const markAllRead =
    async () => {
      if (
        unreadCount <= 0 ||
        markingAll
      ) {
        return;
      }

      try {
        setMarkingAll(true);

        await api.put(
          "/notifications/read-all"
        );

        setNotifications(
          previous =>
            previous.map(
              item => ({
                ...item,
                is_read: 1,
                read_at:
                  item.read_at ||
                  new Date()
                    .toISOString(),
              })
            )
        );

        setUnreadCount(0);
        notifySidebar();
      } catch (markError) {
        console.error(
          "Failed to mark all notifications as read:",
          markError
        );

        setError(
          markError
            ?.response
            ?.data
            ?.message ||
          "Failed to mark notifications as read"
        );
      } finally {
        setMarkingAll(false);
      }
    };

  return (
    <div
      className="
        mt-8
        max-w-[1180px]
        mx-auto
        pb-12
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-6
          flex-wrap
        "
      >
        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <div
            className="
              w-14
              h-14
              rounded-[18px]
              bg-[#F0EDFF]
              text-[#7C6CFF]
              flex
              items-center
              justify-center
            "
          >
            <Bell size={28} />
          </div>

          <div>
            <h1
              className="
                text-[32px]
                leading-tight
                font-bold
                text-[#25263A]
              "
            >
              Notifications
            </h1>

            <p
              className="
                text-[15px]
                leading-6
                text-[#8A8DA0]
                mt-1
                max-w-[720px]
              "
            >
              {getSubtitle(
                currentUser?.role
              )}
            </p>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-3
            flex-wrap
          "
        >
          <button
            type="button"
            onClick={() =>
              loadNotifications(
                true
              )
            }
            disabled={
              refreshing
            }
            className="
              h-12
              px-5
              rounded-[15px]
              border
              border-[#E5E2F2]
              bg-white
              text-[#6F61DF]
              text-[14px]
              font-semibold
              flex
              items-center
              gap-2
              hover:bg-[#FAF9FF]
              transition
              disabled:opacity-60
            "
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={
              markAllRead
            }
            disabled={
              unreadCount <= 0 ||
              markingAll
            }
            className="
              h-12
              px-5
              rounded-[15px]
              bg-[#7C6CFF]
              text-white
              text-[14px]
              font-semibold
              flex
              items-center
              gap-2
              hover:bg-[#6F61DF]
              transition
              shadow-[0_8px_22px_rgba(124,108,255,.18)]
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            <CheckCheck
              size={18}
            />
            {markingAll
              ? "Marking..."
              : "Mark all as read"}
          </button>
        </div>
      </div>

      <div
        className="
          mt-7
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        "
      >
        <div
          className="
            bg-white
            border
            border-[#E9E7F1]
            rounded-[20px]
            px-5
            py-5
            shadow-[0_8px_28px_rgba(59,49,120,.04)]
          "
        >
          <p
            className="
              text-[14px]
              font-medium
              text-[#9497A8]
            "
          >
            Total Notifications
          </p>
          <strong
            className="
              block
              mt-2
              text-[28px]
              text-[#25263A]
            "
          >
            {notifications.length}
          </strong>
        </div>

        <div
          className="
            bg-white
            border
            border-[#E9E7F1]
            rounded-[20px]
            px-5
            py-5
            shadow-[0_8px_28px_rgba(59,49,120,.04)]
          "
        >
          <p
            className="
              text-[14px]
              font-medium
              text-[#9497A8]
            "
          >
            Unread
          </p>
          <strong
            className="
              block
              mt-2
              text-[28px]
              text-[#7C6CFF]
            "
          >
            {unreadCount}
          </strong>
        </div>

        <div
          className="
            bg-white
            border
            border-[#E9E7F1]
            rounded-[20px]
            px-5
            py-5
            shadow-[0_8px_28px_rgba(59,49,120,.04)]
          "
        >
          <p
            className="
              text-[14px]
              font-medium
              text-[#9497A8]
            "
          >
            Account
          </p>
          <strong
            className="
              block
              mt-2
              text-[19px]
              capitalize
              text-[#25263A]
            "
          >
            {currentUser?.role ||
              "User"}
          </strong>
        </div>
      </div>

      <section
        className="
          mt-6
          bg-white
          border
          border-[#E9E7F1]
          rounded-[24px]
          shadow-[0_10px_34px_rgba(59,49,120,.05)]
          overflow-hidden
        "
      >
        <div
          className="
            px-6
            py-5
            border-b
            border-[#F0EEF6]
            flex
            items-center
            justify-between
            gap-5
            flex-wrap
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={() =>
                setFilter("all")
              }
              className={`
                h-10
                px-5
                rounded-[13px]
                text-[14px]
                font-semibold
                transition
                ${
                  filter === "all"
                    ? "bg-[#F0EDFF] text-[#6F61DF]"
                    : "text-[#85889D] hover:bg-[#F8F8FC]"
                }
              `}
            >
              All
            </button>

            <button
              type="button"
              onClick={() =>
                setFilter(
                  "unread"
                )
              }
              className={`
                h-10
                px-5
                rounded-[13px]
                text-[14px]
                font-semibold
                transition
                flex
                items-center
                gap-2
                ${
                  filter ===
                  "unread"
                    ? "bg-[#F0EDFF] text-[#6F61DF]"
                    : "text-[#85889D] hover:bg-[#F8F8FC]"
                }
              `}
            >
              Unread

              {unreadCount > 0 && (
                <span
                  className="
                    min-w-6
                    h-6
                    px-1.5
                    rounded-full
                    bg-[#7C6CFF]
                    text-white
                    text-[11px]
                    flex
                    items-center
                    justify-center
                  "
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>
          </div>

          <span
            className="
              text-[13px]
              font-medium
              text-[#A0A3B2]
            "
          >
            {
              visibleNotifications
                .length
            }{" "}
            {visibleNotifications
              .length === 1
              ? "notification"
              : "notifications"}
          </span>
        </div>

        {loading ? (
          <div
            className="
              min-h-[320px]
              flex
              flex-col
              items-center
              justify-center
              gap-4
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-full
                border-[3px]
                border-[#E9E5FF]
                border-t-[#7C6CFF]
                animate-spin
              "
            />

            <p
              className="
                text-[15px]
                text-[#8A8DA0]
              "
            >
              Loading notifications...
            </p>
          </div>
        ) : error ? (
          <div
            className="
              m-6
              rounded-[18px]
              border
              border-[#F8CACA]
              bg-[#FFF5F5]
              px-5
              py-5
            "
          >
            <p
              className="
                text-[16px]
                font-semibold
                text-[#B91C1C]
              "
            >
              Unable to load notifications
            </p>

            <p
              className="
                text-[14px]
                leading-6
                text-[#C24141]
                mt-1
              "
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadNotifications()
              }
              className="
                mt-4
                h-10
                px-4
                rounded-[12px]
                bg-[#7C6CFF]
                text-white
                text-[13px]
                font-semibold
              "
            >
              Try again
            </button>
          </div>
        ) : visibleNotifications
            .length === 0 ? (
          <div
            className="
              min-h-[330px]
              flex
              flex-col
              items-center
              justify-center
              px-8
              text-center
            "
          >
            <div
              className="
                w-16
                h-16
                rounded-[20px]
                bg-[#F0EDFF]
                text-[#7C6CFF]
                flex
                items-center
                justify-center
              "
            >
              <Bell size={30} />
            </div>

            <h2
              className="
                mt-5
                text-[20px]
                font-bold
                text-[#303146]
              "
            >
              {filter === "unread"
                ? "You're all caught up"
                : "No notifications yet"}
            </h2>

            <p
              className="
                mt-2
                max-w-[540px]
                text-[15px]
                leading-6
                text-[#9699AA]
              "
            >
              {filter === "unread"
                ? "There are no unread notifications right now."
                : "New messages, assigned games, completed sessions, and child assignments will appear here."}
            </p>
          </div>
        ) : (
          <div>
            {visibleNotifications.map(
              item => {
                const unread =
                  Number(
                    item.is_read
                  ) !== 1;

                const {
                  Icon,
                  color,
                  background,
                } =
                  getVisual(
                    item.type
                  );

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      openNotification(
                        item
                      )
                    }
                    className={`
                      w-full
                      text-left
                      px-6
                      py-5
                      border-b
                      last:border-b-0
                      border-[#F0EEF6]
                      flex
                      items-start
                      gap-4
                      transition
                      ${
                        unread
                          ? "bg-[#FCFBFF] hover:bg-[#F8F6FF]"
                          : "bg-white hover:bg-[#FAFAFC]"
                      }
                    `}
                  >
                    <div
                      className="
                        w-12
                        h-12
                        rounded-[16px]
                        shrink-0
                        flex
                        items-center
                        justify-center
                      "
                      style={{
                        color,
                        background,
                      }}
                    >
                      <Icon
                        size={23}
                      />
                    </div>

                    <div
                      className="
                        flex-1
                        min-w-0
                      "
                    >
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-4
                        "
                      >
                        <div
                          className="
                            min-w-0
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >
                            <h3
                              className={`
                                text-[16px]
                                leading-6
                                ${
                                  unread
                                    ? "font-bold text-[#25263A]"
                                    : "font-semibold text-[#4A4C60]"
                                }
                              `}
                            >
                              {
                                item.title
                              }
                            </h3>

                            {unread && (
                              <span
                                className="
                                  w-2.5
                                  h-2.5
                                  rounded-full
                                  bg-[#7C6CFF]
                                "
                              />
                            )}
                          </div>

                          <p
                            className="
                              mt-1
                              text-[15px]
                              leading-6
                              text-[#73768B]
                            "
                          >
                            {item.body}
                          </p>

                          <div
                            className="
                              mt-3
                              flex
                              items-center
                              gap-3
                              flex-wrap
                              text-[13px]
                              text-[#A0A3B2]
                            "
                          >
                            <span>
                              {formatTimeAgo(
                                item.created_at
                              )}
                            </span>

                            {item.child_name && (
                              <>
                                <span>
                                  •
                                </span>
                                <span>
                                  {
                                    item.child_name
                                  }
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div
                          className="
                            shrink-0
                            pt-1
                          "
                        >
                          {unread ? (
                            <span
                              className="
                                inline-flex
                                items-center
                                px-3
                                h-8
                                rounded-full
                                bg-[#F0EDFF]
                                text-[#6F61DF]
                                text-[12px]
                                font-semibold
                              "
                            >
                              New
                            </span>
                          ) : (
                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                text-[#A3A6B4]
                                text-[12px]
                                font-medium
                              "
                            >
                              <Check
                                size={15}
                              />
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Notifications() {
  const currentUser =
    getStoredUser();

  const role =
    currentUser?.role;

  if (
    role ===
    "therapist"
  ) {
    return (
      <div
        className="
          flex
          bg-[#F7F8FC]
          min-h-screen
        "
      >
        <Sidebar />

        <main
          className="
            flex-1
            p-10
            overflow-y-auto
          "
        >
          <Navbar />

          <NotificationsContent
            currentUser={
              currentUser
            }
          />
        </main>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen
        bg-[#F7F8FC]
        px-6
        py-7
        lg:px-10
      "
    >
      <div
        className="
          max-w-[1180px]
          mx-auto
        "
      >
        <div
          className="
            bg-white
            rounded-[22px]
            border
            border-[#ECECF5]
            min-h-[104px]
            px-7
            py-3
            flex
            items-center
            justify-between
            gap-6
            shadow-[0_10px_36px_rgba(124,108,255,.05)]
          "
        >
          <img
            src="/logo.png"
            alt="KidMind"
            className="
              w-[180px]
              h-[92px]
              object-contain
            "
          />

          <button
            type="button"
            onClick={() =>
              navigateHome(
                role
              )
            }
            className="
              h-11
              px-5
              rounded-[14px]
              bg-[#F2EEFF]
              text-[#6F61DF]
              text-[14px]
              font-semibold
              hover:bg-[#EAE5FF]
              transition
            "
          >
            Back to Dashboard
          </button>
        </div>

        <NotificationsContent
          currentUser={
            currentUser
          }
        />
      </div>
    </div>
  );
}

function navigateHome(
  role
) {
  window.location.href =
    role === "admin"
      ? "/admin"
      : "/parent";
}
