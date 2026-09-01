import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  router,
} from "expo-router";

import {
  Bell,
  Check,
  CheckCheck,
  Gamepad2,
  Mail,
  RefreshCw,
  Sparkles,
  UserRoundPlus,
} from "lucide-react-native";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type KidMindNotification,
} from "@/api/notificationsApi";


type FilterType =
  | "all"
  | "unread";


const isRead = (
  value:
    | number
    | boolean
) => {

  return (
    value === true ||
    Number(value) === 1
  );

};


const parseDate = (
  value:
    | string
    | null
    | undefined
) => {

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


  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;

};


const formatTimeAgo = (
  value:
    | string
    | null
    | undefined
) => {

  const date =
    parseDate(
      value
    );


  if (!date) {
    return "";
  }


  const diff =
    Math.max(
      0,
      Date.now() -
        date.getTime()
    );


  const minutes =
    Math.floor(
      diff / 60000
    );


  if (minutes < 1) {
    return "Just now";
  }


  if (minutes < 60) {
    return `${minutes} min ago`;
  }


  const hours =
    Math.floor(
      minutes / 60
    );


  if (hours < 24) {
    return `${hours} hr${
      hours === 1
        ? ""
        : "s"
    } ago`;
  }


  const days =
    Math.floor(
      hours / 24
    );


  if (days < 7) {
    return `${days} day${
      days === 1
        ? ""
        : "s"
    } ago`;
  }


  return date.toLocaleDateString(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        date.getFullYear() !==
        new Date().getFullYear()
          ? "numeric"
          : undefined,
    }
  );

};


const getVisual = (
  type: string
) => {

  if (
    type ===
    "new_message"
  ) {
    return {
      Icon:
        Mail,
      color:
        "#6F61DF",
      background:
        "#F0EDFF",
    };
  }


  if (
    type ===
    "assigned_game"
  ) {
    return {
      Icon:
        Gamepad2,
      color:
        "#3D73C8",
      background:
        "#EDF4FF",
    };
  }


  if (
    type ===
    "session_completed"
  ) {
    return {
      Icon:
        CheckCheck,
      color:
        "#3F9271",
      background:
        "#E9F8F1",
    };
  }


  if (
    type ===
    "child_assigned"
  ) {
    return {
      Icon:
        UserRoundPlus,
      color:
        "#B77A25",
      background:
        "#FFF4DF",
    };
  }


  return {
    Icon:
      Sparkles,
    color:
      "#7465E8",
    background:
      "#F0EDFF",
  };

};


export default function ParentNotificationsSection() {

  const [
    notifications,
    setNotifications,
  ] =
    useState<
      KidMindNotification[]
    >(
      []
    );


  const [
    unreadCount,
    setUnreadCount,
  ] =
    useState(
      0
    );


  const [
    filter,
    setFilter,
  ] =
    useState<
      FilterType
    >(
      "all"
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false
    );


  const [
    markingAll,
    setMarkingAll,
  ] =
    useState(
      false
    );


  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  const loadNotifications =
    async (
      refresh = false
    ) => {

      try {

        if (
          refresh
        ) {
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
          items
        );


        setUnreadCount(
          count
        );

      } catch (
        loadError
      ) {

        console.error(
          "Failed to load parent notifications:",
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

    };


  useEffect(
    () => {

      void loadNotifications();

    },
    []
  );


  const visibleNotifications =
    useMemo(
      () => {

        if (
          filter ===
          "unread"
        ) {
          return notifications.filter(
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


      setUnreadCount(
        previous =>
          Math.max(
            0,
            previous - 1
          )
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


      if (
        path &&
        path !==
          "/notifications"
      ) {

        router.push(
          path as never
        );

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


        setUnreadCount(
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


  return (

    <View
      style={
        styles.container
      }
    >

      <View
        style={
          styles.summaryStrip
        }
      >

        <View
          style={
            styles.summaryIntro
          }
        >

          <View
            style={
              styles.summaryIcon
            }
          >
            <Bell
              size={21}
              color="#7465E8"
            />
          </View>


          <View
            style={
              styles.summaryText
            }
          >
            <Text
              style={
                styles.summaryTitle
              }
            >
              Notification Center
            </Text>

            <Text
              style={
                styles.summarySubtitle
              }
            >
              Messages, sessions and care updates in one place.
            </Text>
          </View>

        </View>


        <View
          style={
            styles.countRow
          }
        >

          <View
            style={
              styles.countItem
            }
          >
            <Text
              style={
                styles.countLabel
              }
            >
              Total
            </Text>

            <Text
              style={
                styles.countValue
              }
            >
              {
                notifications.length
              }
            </Text>
          </View>


          <View
            style={[
              styles.countItem,
              styles.unreadCountItem,
            ]}
          >
            <Text
              style={
                styles.countLabel
              }
            >
              Unread
            </Text>

            <Text
              style={[
                styles.countValue,
                styles.unreadCountValue,
              ]}
            >
              {
                unreadCount
              }
            </Text>
          </View>

        </View>

      </View>


      <View
        style={
          styles.toolbar
        }
      >

        <View
          style={
            styles.filterGroup
          }
        >

          <Pressable
            onPress={() =>
              setFilter(
                "all"
              )
            }
            style={[
              styles.filterButton,
              filter ===
                "all" &&
                styles.filterButtonActive,
            ]}
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
            onPress={() =>
              setFilter(
                "unread"
              )
            }
            style={[
              styles.filterButton,
              filter ===
                "unread" &&
                styles.filterButtonActive,
            ]}
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
              {
                unreadCount > 0
                  ? ` (${unreadCount})`
                  : ""
              }
            </Text>
          </Pressable>

        </View>


        <Pressable
          onPress={() =>
            void loadNotifications(
              true
            )
          }
          disabled={
            refreshing
          }
          style={
            styles.iconButton
          }
        >
          {
            refreshing
              ? (
                <ActivityIndicator
                  size="small"
                  color="#7465E8"
                />
              )
              : (
                <RefreshCw
                  size={17}
                  color="#7465E8"
                />
              )
          }
        </Pressable>

      </View>


      {
        unreadCount > 0 && (
          <Pressable
            onPress={() =>
              void markAllRead()
            }
            disabled={
              markingAll
            }
            style={[
              styles.markAllButton,
              markingAll &&
                styles.disabled,
            ]}
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
                    size={17}
                    color="#FFFFFF"
                  />
                )
            }

            <Text
              style={
                styles.markAllText
              }
            >
              {
                markingAll
                  ? "Marking..."
                  : "Mark all as read"
              }
            </Text>
          </Pressable>
        )
      }


      {
        error !== "" && (
          <View
            style={
              styles.errorBox
            }
          >
            <Text
              style={
                styles.errorTitle
              }
            >
              Unable to load notifications
            </Text>

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>
          </View>
        )
      }


      {
        loading
          ? (
            <View
              style={
                styles.stateBox
              }
            >
              <ActivityIndicator
                size="large"
                color="#7465E8"
              />

              <Text
                style={
                  styles.stateText
                }
              >
                Loading notifications...
              </Text>
            </View>
          )
          : visibleNotifications.length ===
              0
            ? (
              <View
                style={
                  styles.emptyBox
                }
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <Bell
                    size={28}
                    color="#7465E8"
                  />
                </View>

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  {
                    filter ===
                      "unread"
                      ? "You're all caught up"
                      : "No notifications yet"
                  }
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  {
                    filter ===
                      "unread"
                      ? "There are no unread notifications right now."
                      : "Your KidMind updates will appear here."
                  }
                </Text>
              </View>
            )
            : (
              <View
                style={
                  styles.list
                }
              >
                {
                  visibleNotifications.map(
                    item => {

                      const visual =
                        getVisual(
                          String(
                            item.type ||
                            ""
                          )
                        );


                      const Icon =
                        visual.Icon;


                      const unread =
                        !isRead(
                          item.is_read
                        );


                      return (

                        <Pressable
                          key={
                            item.id
                          }
                          onPress={() =>
                            void openNotification(
                              item
                            )
                          }
                          style={[
                            styles.notificationCard,
                            unread &&
                              styles.notificationCardUnread,
                          ]}
                        >

                          <View
                            style={[
                              styles.notificationIcon,
                              {
                                backgroundColor:
                                  visual.background,
                              },
                            ]}
                          >
                            <Icon
                              size={19}
                              color={
                                visual.color
                              }
                            />
                          </View>


                          <View
                            style={
                              styles.notificationContent
                            }
                          >

                            <View
                              style={
                                styles.notificationTop
                              }
                            >
                              <Text
                                style={[
                                  styles.notificationTitle,
                                  unread &&
                                    styles.notificationTitleUnread,
                                ]}
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
                                        styles.newBadge
                                      }
                                    >
                                      <Text
                                        style={
                                          styles.newBadgeText
                                        }
                                      >
                                        New
                                      </Text>
                                    </View>
                                  )
                                  : (
                                    <Check
                                      size={15}
                                      color="#A1A4B3"
                                    />
                                  )
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
                                styles.notificationFooter
                              }
                            >
                              <Text
                                style={
                                  styles.notificationTime
                                }
                              >
                                {
                                  formatTimeAgo(
                                    item.created_at
                                  )
                                }
                              </Text>


                              {
                                item.child_name
                                  ? (
                                    <>
                                      <View
                                        style={
                                          styles.footerDot
                                        }
                                      />

                                      <Text
                                        numberOfLines={1}
                                        style={
                                          styles.childName
                                        }
                                      >
                                        {
                                          item.child_name
                                        }
                                      </Text>
                                    </>
                                  )
                                  : null
                              }

                            </View>

                          </View>

                        </Pressable>

                      );

                    }
                  )
                }
              </View>
            )
      }

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {
      gap: 13,
    },

    summaryStrip: {
      padding: 18,
      borderRadius: 21,
      borderWidth: 1,
      borderColor:
        "#E9E7F2",
      backgroundColor:
        "#FFFFFF",
    },

    summaryIntro: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
    },

    summaryIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F0EDFF",
    },

    summaryText: {
      flex: 1,
    },

    summaryTitle: {
      color:
        "#333554",
      fontSize: 14,
      fontWeight:
        "800",
    },

    summarySubtitle: {
      marginTop: 3,
      color:
        "#989BAD",
      fontSize: 10.5,
      lineHeight: 15,
    },

    countRow: {
      flexDirection:
        "row",
      gap: 9,
      marginTop: 16,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor:
        "#F0EFF5",
    },

    countItem: {
      flex: 1,
      paddingHorizontal: 13,
      paddingVertical: 11,
      borderRadius: 13,
      backgroundColor:
        "#F8F8FB",
    },

    unreadCountItem: {
      backgroundColor:
        "#F5F2FF",
    },

    countLabel: {
      color:
        "#9A9CAD",
      fontSize: 9,
      fontWeight:
        "650",
    },

    countValue: {
      marginTop: 3,
      color:
        "#3D3F5D",
      fontSize: 20,
      fontWeight:
        "800",
    },

    unreadCountValue: {
      color:
        "#7465E8",
    },

    toolbar: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
    },

    filterGroup: {
      flex: 1,
      flexDirection:
        "row",
      gap: 7,
      padding: 4,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      backgroundColor:
        "#FFFFFF",
    },

    filterButton: {
      flex: 1,
      minHeight: 38,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 10,
    },

    filterButtonActive: {
      backgroundColor:
        "#F0EDFF",
    },

    filterText: {
      color:
        "#8A8DA0",
      fontSize: 10.5,
      fontWeight:
        "700",
    },

    filterTextActive: {
      color:
        "#6F61DF",
    },

    iconButton: {
      width: 46,
      height: 46,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#E8E6F1",
      backgroundColor:
        "#FFFFFF",
    },

    markAllButton: {
      minHeight: 45,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
      borderRadius: 13,
      backgroundColor:
        "#7465E8",
    },

    markAllText: {
      color:
        "#FFFFFF",
      fontSize: 11.5,
      fontWeight:
        "800",
    },

    disabled: {
      opacity: 0.6,
    },

    errorBox: {
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#F3D7DE",
      backgroundColor:
        "#FFF4F6",
    },

    errorTitle: {
      color:
        "#B34D64",
      fontSize: 11.5,
      fontWeight:
        "800",
    },

    errorText: {
      marginTop: 4,
      color:
        "#C16879",
      fontSize: 10,
      lineHeight: 15,
    },

    stateBox: {
      minHeight: 190,
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      backgroundColor:
        "#FFFFFF",
    },

    stateText: {
      color:
        "#9295A8",
      fontSize: 11,
    },

    emptyBox: {
      minHeight: 215,
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 24,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      backgroundColor:
        "#FFFFFF",
    },

    emptyIcon: {
      width: 54,
      height: 54,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 17,
      backgroundColor:
        "#F0EDFF",
    },

    emptyTitle: {
      marginTop: 13,
      color:
        "#3D3F5C",
      fontSize: 14,
      fontWeight:
        "800",
      textAlign:
        "center",
    },

    emptyText: {
      marginTop: 5,
      maxWidth: 290,
      color:
        "#9A9CAD",
      fontSize: 10.5,
      lineHeight: 16,
      textAlign:
        "center",
    },

    list: {
      gap: 9,
    },

    notificationCard: {
      flexDirection:
        "row",
      gap: 12,
      padding: 15,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      backgroundColor:
        "#FFFFFF",
    },

    notificationCardUnread: {
      borderColor:
        "#E1DBFF",
      backgroundColor:
        "#FCFBFF",
    },

    notificationIcon: {
      width: 43,
      height: 43,
      flexShrink: 0,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 13,
    },

    notificationContent: {
      flex: 1,
      minWidth: 0,
    },

    notificationTop: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 8,
    },

    notificationTitle: {
      flex: 1,
      color:
        "#55576D",
      fontSize: 11.5,
      lineHeight: 16,
      fontWeight:
        "700",
    },

    notificationTitleUnread: {
      color:
        "#333554",
      fontWeight:
        "800",
    },

    newBadge: {
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor:
        "#F0EDFF",
    },

    newBadgeText: {
      color:
        "#6F61DF",
      fontSize: 8,
      fontWeight:
        "800",
    },

    notificationBody: {
      marginTop: 5,
      color:
        "#76798E",
      fontSize: 10.5,
      lineHeight: 16,
    },

    notificationFooter: {
      flexDirection:
        "row",
      alignItems:
        "center",
      flexWrap:
        "wrap",
      gap: 6,
      marginTop: 9,
    },

    notificationTime: {
      color:
        "#A0A3B2",
      fontSize: 9,
    },

    footerDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor:
        "#C3C4CF",
    },

    childName: {
      flexShrink: 1,
      color:
        "#8F91A3",
      fontSize: 9,
      fontWeight:
        "650",
    },

  });
