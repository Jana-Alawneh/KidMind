import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  Bell,
  CheckCheck,
  ChevronRight,
  MessageCircle,
  RefreshCw,
} from "lucide-react-native";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type KidMindNotification,
} from "@/api/notificationsApi";


type Props = {
  onNavigateSection?: (
    section: string
  ) => void;
  onUnreadCountChange?: (
    count: number
  ) => void;
};


const isRead = (
  value:
    | number
    | boolean
) =>
  value === true ||
  Number(
    value
  ) === 1;


const formatDate = (
  value?: string | null
) => {

  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date
    .toLocaleString(
      [],
      {
        month:
          "short",
        day:
          "numeric",
        hour:
          "2-digit",
        minute:
          "2-digit",
      }
    );

};


const getSectionFromPath = (
  path: string
) => {

  if (!path) {
    return "";
  }

  if (
    path === "/chat" ||
    path.startsWith(
      "/chat?"
    )
  ) {
    return "messages";
  }

  const sectionMatch =
    path.match(
      /[?&]section=([^&]+)/i
    );

  if (
    sectionMatch?.[1]
  ) {
    return decodeURIComponent(
      sectionMatch[1]
    );
  }

  return "";

};


export default function MobileNotificationsContent({
  onNavigateSection,
  onUnreadCountChange,
}: Props) {

  const [
    notifications,
    setNotifications,
  ] =
    useState<
      KidMindNotification[]
    >([]);

  const [
    filter,
    setFilter,
  ] =
    useState<
      "all" | "unread"
    >(
      "all"
    );

  const [
    unreadCount,
    setUnreadCount,
  ] =
    useState(0);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    markingAll,
    setMarkingAll,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  const updateUnreadCount =
    useCallback(
      (
        count: number
      ) => {

        const safeCount =
          Math.max(
            0,
            Number(
              count || 0
            )
          );

        setUnreadCount(
          safeCount
        );

        onUnreadCountChange?.(
          safeCount
        );

      },
      [
        onUnreadCountChange,
      ]
    );


  const loadNotifications =
    useCallback(
      async (
        refresh = false
      ) => {

        try {

          if (refresh) {
            setRefreshing(
              true
            );
          } else {
            setLoading(
              true
            );
          }

          setError(
            ""
          );

          const [
            items,
            count,
          ] =
            await Promise.all([
              getNotifications(),
              getUnreadNotificationCount(),
            ]);

          setNotifications(
            Array.isArray(
              items
            )
              ? items
              : []
          );

          updateUnreadCount(
            count
          );

        } catch (
          loadError
        ) {

          console.error(
            "Failed to load notifications:",
            loadError
          );

          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Failed to load notifications"
          );

        } finally {

          setLoading(
            false
          );

          setRefreshing(
            false
          );

        }

      },
      [
        updateUnreadCount,
      ]
    );


  useFocusEffect(
    useCallback(
      () => {

        loadNotifications();

        return undefined;

      },
      [
        loadNotifications,
      ]
    )
  );


  const visibleNotifications =
    useMemo(
      () => {

        if (
          filter ===
          "unread"
        ) {
          return notifications
            .filter(
              item =>
                !isRead(
                  item.is_read
                )
            );
        }

        return notifications;

      },
      [
        filter,
        notifications,
      ]
    );


  const markOneRead =
    async (
      item:
        KidMindNotification
    ) => {

      if (
        isRead(
          item.is_read
        )
      ) {
        return;
      }

      await markNotificationRead(
        item.id
      );

      setNotifications(
        previous =>
          previous.map(
            notification =>
              Number(
                notification.id
              ) ===
              Number(
                item.id
              )
                ? {
                    ...notification,
                    is_read:
                      1,
                    read_at:
                      new Date()
                        .toISOString(),
                  }
                : notification
          )
      );

      updateUnreadCount(
        unreadCount -
          1
      );

    };


  const openNotification =
    async (
      item:
        KidMindNotification
    ) => {

      try {

        await markOneRead(
          item
        );

      } catch (
        readError
      ) {

        console.error(
          "Failed to mark notification as read:",
          readError
        );

      }

      const path =
        String(
          item.action_path ||
          ""
        ).trim();

      if (!path) {
        return;
      }

      const adminSection =
        getSectionFromPath(
          path
        );

      if (
        adminSection &&
        onNavigateSection
      ) {

        onNavigateSection(
          adminSection
        );

        return;

      }

      router.push(
        path as never
      );

    };


  const markAllRead =
    async () => {

      if (
        unreadCount <=
          0 ||
        markingAll
      ) {
        return;
      }

      try {

        setMarkingAll(
          true
        );

        setError(
          ""
        );

        await markAllNotificationsRead();

        setNotifications(
          previous =>
            previous.map(
              item => ({
                ...item,
                is_read:
                  1,
                read_at:
                  item.read_at ||
                  new Date()
                    .toISOString(),
              })
            )
        );

        updateUnreadCount(
          0
        );

      } catch (
        markError
      ) {

        console.error(
          "Failed to mark all notifications as read:",
          markError
        );

        setError(
          markError instanceof
            Error
            ? markError.message
            : "Failed to mark notifications as read"
        );

      } finally {

        setMarkingAll(
          false
        );

      }

    };


  if (
    loading
  ) {
    return (
      <View
        style={
          styles.stateCard
        }
      >
        <ActivityIndicator
          size="large"
          color="#7C6CFF"
        />

        <Text
          style={
            styles.stateText
          }
        >
          Loading notifications...
        </Text>
      </View>
    );
  }


  return (

    <View
      style={
        styles.root
      }
    >

      <View
        style={
          styles.heading
        }
      >
        <View
          style={
            styles.headingIcon
          }
        >
          <Bell
            size={22}
            color="#7566E8"
          />
        </View>

        <View
          style={
            styles.headingCopy
          }
        >
          <Text
            style={
              styles.kicker
            }
          >
            NOTIFICATION CENTER
          </Text>

          <Text
            style={
              styles.title
            }
          >
            Notifications
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Keep track of messages, assignments, sessions and care updates.
          </Text>
        </View>
      </View>


      {
        error
          ? (
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
          )
          : null
      }


      <View
        style={
          styles.statsRow
        }
      >
        <View
          style={
            styles.statCard
          }
        >
          <Text
            style={
              styles.statLabel
            }
          >
            Total
          </Text>

          <Text
            style={
              styles.statValue
            }
          >
            {
              notifications.length
            }
          </Text>
        </View>

        <View
          style={
            styles.statCard
          }
        >
          <Text
            style={
              styles.statLabel
            }
          >
            Unread
          </Text>

          <Text
            style={[
              styles.statValue,
              styles.unreadValue,
            ]}
          >
            {
              unreadCount
            }
          </Text>
        </View>
      </View>


      <View
        style={
          styles.actionsRow
        }
      >
        <Pressable
          style={
            styles.secondaryButton
          }
          disabled={
            refreshing
          }
          onPress={() =>
            loadNotifications(
              true
            )
          }
        >
          {
            refreshing
              ? (
                <ActivityIndicator
                  size="small"
                  color="#6F61DF"
                />
              )
              : (
                <RefreshCw
                  size={16}
                  color="#6F61DF"
                />
              )
          }

          <Text
            style={
              styles.secondaryButtonText
            }
          >
            Refresh
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.primaryButton,
            (
              unreadCount <=
                0 ||
              markingAll
            ) &&
              styles.disabled,
          ]}
          disabled={
            unreadCount <=
              0 ||
            markingAll
          }
          onPress={
            markAllRead
          }
        >
          {
            markingAll
              ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              )
              : (
                <CheckCheck
                  size={16}
                  color="#FFFFFF"
                />
              )
          }

          <Text
            style={
              styles.primaryButtonText
            }
          >
            {
              markingAll
                ? "Marking..."
                : "Mark all read"
            }
          </Text>
        </Pressable>
      </View>


      <View
        style={
          styles.filterRow
        }
      >
        <Pressable
          style={[
            styles.filterButton,
            filter ===
              "all" &&
              styles.filterButtonActive,
          ]}
          onPress={() =>
            setFilter(
              "all"
            )
          }
        >
          <Text
            style={[
              styles.filterText,
              filter ===
                "all" &&
                styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            filter ===
              "unread" &&
              styles.filterButtonActive,
          ]}
          onPress={() =>
            setFilter(
              "unread"
            )
          }
        >
          <Text
            style={[
              styles.filterText,
              filter ===
                "unread" &&
                styles.filterTextActive,
            ]}
          >
            Unread
          </Text>
        </Pressable>
      </View>


      <View
        style={
          styles.list
        }
      >

        {
          visibleNotifications
            .length ===
          0
            ? (
              <View
                style={
                  styles.emptyCard
                }
              >
                <Bell
                  size={29}
                  color="#A09FB3"
                />

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  {
                    filter ===
                    "unread"
                      ? "No unread notifications"
                      : "No notifications yet"
                  }
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  New KidMind updates will appear here.
                </Text>
              </View>
            )
            : visibleNotifications
                .map(
                  item => {

                    const unread =
                      !isRead(
                        item.is_read
                      );

                    const messageNotification =
                      item.type ===
                        "new_message";

                    return (
                      <Pressable
                        key={
                          item.id
                        }
                        style={[
                          styles.notificationCard,
                          unread &&
                            styles.notificationUnread,
                        ]}
                        onPress={() =>
                          openNotification(
                            item
                          )
                        }
                      >
                        <View
                          style={[
                            styles.notificationIcon,
                            messageNotification &&
                              styles.messageIcon,
                          ]}
                        >
                          {
                            messageNotification
                              ? (
                                <MessageCircle
                                  size={17}
                                  color="#4F8EC9"
                                />
                              )
                              : (
                                <Bell
                                  size={17}
                                  color="#7465E8"
                                />
                              )
                          }
                        </View>

                        <View
                          style={
                            styles.notificationCopy
                          }
                        >
                          <View
                            style={
                              styles.notificationTitleRow
                            }
                          >
                            <Text
                              numberOfLines={
                                2
                              }
                              style={
                                styles.notificationTitle
                              }
                            >
                              {
                                item.title
                              }
                            </Text>

                            {
                              unread
                                ? (
                                  <View
                                    style={
                                      styles.unreadDot
                                    }
                                  />
                                )
                                : null
                            }
                          </View>

                          <Text
                            style={
                              styles.notificationBody
                            }
                          >
                            {
                              item.body
                            }
                          </Text>

                          <View
                            style={
                              styles.notificationMeta
                            }
                          >
                            <Text
                              style={
                                styles.notificationDate
                              }
                            >
                              {
                                formatDate(
                                  item.created_at
                                )
                              }
                            </Text>

                            {
                              item.child_name
                                ? (
                                  <Text
                                    style={
                                      styles.childTag
                                    }
                                  >
                                    {
                                      item.child_name
                                    }
                                  </Text>
                                )
                                : null
                            }
                          </View>
                        </View>

                        {
                          item.action_path
                            ? (
                              <ChevronRight
                                size={17}
                                color="#AAAABB"
                              />
                            )
                            : null
                        }
                      </Pressable>
                    );

                  }
                )
        }

      </View>

    </View>

  );

}


const styles =
  StyleSheet.create({

    root: {
      gap:
        15,
    },

    heading: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap:
        12,
    },

    headingIcon: {
      width:
        46,
      height:
        46,
      borderRadius:
        14,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F0EDFF",
    },

    headingCopy: {
      flex:
        1,
    },

    kicker: {
      color:
        "#999BAD",
      fontSize:
        9,
      fontWeight:
        "800",
      letterSpacing:
        1,
    },

    title: {
      marginTop:
        3,
      color:
        "#343653",
      fontSize:
        25,
      fontWeight:
        "800",
    },

    subtitle: {
      marginTop:
        4,
      color:
        "#989AAD",
      fontSize:
        11,
      lineHeight:
        17,
    },

    errorBox: {
      padding:
        12,
      borderRadius:
        13,
      borderWidth:
        1,
      borderColor:
        "#F2D5DB",
      backgroundColor:
        "#FFF3F5",
    },

    errorText: {
      color:
        "#B55367",
      fontSize:
        10,
    },

    statsRow: {
      flexDirection:
        "row",
      gap:
        10,
    },

    statCard: {
      flex:
        1,
      minHeight:
        73,
      padding:
        13,
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
      borderRadius:
        15,
      backgroundColor:
        "#FFFFFF",
    },

    statLabel: {
      color:
        "#999BAD",
      fontSize:
        9,
    },

    statValue: {
      marginTop:
        5,
      color:
        "#3C3E5B",
      fontSize:
        22,
      fontWeight:
        "800",
    },

    unreadValue: {
      color:
        "#7868E6",
    },

    actionsRow: {
      flexDirection:
        "row",
      gap:
        9,
      flexWrap:
        "wrap",
    },

    secondaryButton: {
      minHeight:
        41,
      paddingHorizontal:
        13,
      borderWidth:
        1,
      borderColor:
        "#E1DDF9",
      borderRadius:
        12,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        7,
      backgroundColor:
        "#F8F6FF",
    },

    secondaryButtonText: {
      color:
        "#6F61DF",
      fontSize:
        10,
      fontWeight:
        "800",
    },

    primaryButton: {
      minHeight:
        41,
      paddingHorizontal:
        13,
      borderRadius:
        12,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        7,
      backgroundColor:
        "#7868E6",
    },

    primaryButtonText: {
      color:
        "#FFFFFF",
      fontSize:
        10,
      fontWeight:
        "800",
    },

    disabled: {
      opacity:
        .5,
    },

    filterRow: {
      padding:
        4,
      borderRadius:
        12,
      flexDirection:
        "row",
      gap:
        4,
      backgroundColor:
        "#F1F1F6",
    },

    filterButton: {
      flex:
        1,
      minHeight:
        35,
      borderRadius:
        9,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    filterButtonActive: {
      backgroundColor:
        "#FFFFFF",
    },

    filterText: {
      color:
        "#999BAC",
      fontSize:
        10,
      fontWeight:
        "700",
    },

    filterTextActive: {
      color:
        "#6657CE",
    },

    list: {
      gap:
        9,
      paddingBottom:
        8,
    },

    notificationCard: {
      minHeight:
        92,
      padding:
        13,
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
      borderRadius:
        16,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        10,
      backgroundColor:
        "#FFFFFF",
    },

    notificationUnread: {
      borderColor:
        "#DDD7FF",
      backgroundColor:
        "#FAF9FF",
    },

    notificationIcon: {
      width:
        38,
      height:
        38,
      borderRadius:
        12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F0EDFF",
    },

    messageIcon: {
      backgroundColor:
        "#EDF6FF",
    },

    notificationCopy: {
      minWidth:
        0,
      flex:
        1,
    },

    notificationTitleRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        7,
    },

    notificationTitle: {
      flex:
        1,
      color:
        "#44465F",
      fontSize:
        11,
      fontWeight:
        "800",
    },

    unreadDot: {
      width:
        7,
      height:
        7,
      borderRadius:
        999,
      backgroundColor:
        "#7868E6",
    },

    notificationBody: {
      marginTop:
        4,
      color:
        "#85889C",
      fontSize:
        9.5,
      lineHeight:
        15,
    },

    notificationMeta: {
      marginTop:
        7,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        7,
      flexWrap:
        "wrap",
    },

    notificationDate: {
      color:
        "#AAACBB",
      fontSize:
        8,
    },

    childTag: {
      paddingHorizontal:
        7,
      paddingVertical:
        3,
      borderRadius:
        999,
      color:
        "#6E62C2",
      backgroundColor:
        "#F0EDFF",
      fontSize:
        8,
      fontWeight:
        "700",
    },

    emptyCard: {
      minHeight:
        190,
      padding:
        20,
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
      borderRadius:
        18,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
    },

    emptyTitle: {
      marginTop:
        9,
      color:
        "#52546B",
      fontSize:
        13,
      fontWeight:
        "800",
    },

    emptyText: {
      marginTop:
        4,
      color:
        "#999BAC",
      fontSize:
        10,
      textAlign:
        "center",
    },

    stateCard: {
      minHeight:
        250,
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        10,
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
      borderRadius:
        20,
      backgroundColor:
        "#FFFFFF",
    },

    stateText: {
      color:
        "#999BAC",
      fontSize:
        11,
    },

  });
