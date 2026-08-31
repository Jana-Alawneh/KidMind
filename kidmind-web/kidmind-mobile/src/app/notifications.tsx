import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ArrowLeft,
  Bell,
  CheckCheck,
  ClipboardList,
  Gamepad2,
  Mail,
  RefreshCw,
  Sparkles,
  UserRoundPlus,
} from "lucide-react-native";

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
  SafeAreaView,
} from "react-native-safe-area-context";

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
    value ===
      true ||
    Number(
      value
    ) === 1
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
      String(value)
        .replace(
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
      diff /
      60000
    );

  if (
    minutes <
    1
  ) {
    return "Just now";
  }

  if (
    minutes <
    60
  ) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(
      minutes /
      60
    );

  if (
    hours <
    24
  ) {
    return `${hours} hr${
      hours === 1
        ? ""
        : "s"
    } ago`;
  }

  const days =
    Math.floor(
      hours /
      24
    );

  if (
    days <
    7
  ) {
    return `${days} day${
      days === 1
        ? ""
        : "s"
    } ago`;
  }

  return date
    .toLocaleDateString(
      "en-US",
      {
        month:
          "short",
        day:
          "numeric",
        year:
          date.getFullYear() !==
          new Date()
            .getFullYear()
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
        "#2563EB",
      background:
        "#EAF2FF",
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
        "#159669",
      background:
        "#E7F8F1",
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
        "#D97706",
      background:
        "#FFF3DF",
    };
  }
if (
  type ===
  "new_feedback"
) {

  return {
    Icon:
      ClipboardList,
    color:
      "#7465E8",
    background:
      "#EEEAFE",
  };

}
  return {
    Icon:
      Sparkles,
    color:
      "#7C6CFF",
    background:
      "#F2EEFF",
  };

};


export default function NotificationsScreen() {

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
    useCallback(
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

        } catch (loadError) {

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
      []
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

      setUnreadCount(
        previous =>
          Math.max(
            0,
            previous -
              1
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

      } catch (readError) {

        console.error(
          "Failed to mark notification as read:",
          readError
        );

      }

      const isFeedbackNotification =
  item.type ===
    "new_feedback" ||
  item.entity_type ===
    "feedback";


const path =
  isFeedbackNotification
    ? "/admin?section=feedback"
    : String(
        item.action_path ||
        ""
      ).trim();

      if (
        path
      ) {

        router.push(
          path as never
        );

      }

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

        setUnreadCount(
          0
        );

      } catch (markError) {

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

    <SafeAreaView
      style={
        styles.safeArea
      }
    >

      <ScrollView
        style={
          styles.screen
        }
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              loadNotifications(
                true
              )
            }
            tintColor="#7C6CFF"
            colors={[
              "#7C6CFF",
            ]}
          />
        }
      >

        <View
          style={
            styles.topRow
          }
        >

          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
          >
            <ArrowLeft
              size={20}
              color="#5E6074"
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerIcon
            }
          >
            <Bell
              size={24}
              color="#7C6CFF"
            />
          </View>

          <View
            style={
              styles.headerTextBox
            }
          >

            <Text
              style={
                styles.heading
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

          <TouchableOpacity
            style={
              styles.refreshButton
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

            <RefreshCw
              size={17}
              color="#6F61DF"
            />

            <Text
              style={
                styles.refreshText
              }
            >
              Refresh
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.markAllButton,
              (
                unreadCount <=
                  0 ||
                markingAll
              ) &&
                styles.disabledButton,
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

            <CheckCheck
              size={17}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.markAllText
              }
            >
              {markingAll
                ? "Marking..."
                : "Mark all read"}
            </Text>

          </TouchableOpacity>

        </View>


        <View
          style={
            styles.filterBox
          }
        >

          <TouchableOpacity
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
          </TouchableOpacity>

          <TouchableOpacity
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
              {
                unreadCount >
                  0
                  ? ` (${unreadCount})`
                  : ""
              }
            </Text>
          </TouchableOpacity>

        </View>


        {error
          ? (
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
          : null
        }


        {loading
          ? (
            <View
              style={
                styles.loadingBox
              }
            >
              <ActivityIndicator
                size="large"
                color="#7C6CFF"
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Loading notifications...
              </Text>
            </View>
          )
          : null
        }


        {!loading &&
          !error &&
          visibleNotifications
            .length ===
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
                  size={30}
                  color="#8A7DF1"
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                {filter ===
                  "unread"
                  ? "You're all caught up"
                  : "No notifications yet"}
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                {filter ===
                  "unread"
                  ? "There are no unread notifications."
                  : "Your KidMind updates will appear here."}
              </Text>

            </View>
          )
          : null
        }


        {!loading &&
          visibleNotifications
            .map(
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

                  <TouchableOpacity
                    key={
                      item.id
                    }
                    activeOpacity={
                      0.82
                    }
                    style={[
                      styles.notificationCard,
                      unread &&
                        styles.notificationCardUnread,
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
                          styles.notificationTitleRow
                        }
                      >

                        <Text
                          style={
                            styles.notificationTitle
                          }
                        >
                          {
                            item.title
                          }
                        </Text>

                        {unread &&
                          <View
                            style={
                              styles.unreadDot
                            }
                          />
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
                          styles.metaRow
                        }
                      >

                        <Text
                          style={
                            styles.metaText
                          }
                        >
                          {formatTimeAgo(
                            item.created_at
                          )}
                        </Text>

                        {item.child_name
                          ? (
                            <>
                              <View
                                style={
                                  styles.metaDot
                                }
                              />

                              <Text
                                style={
                                  styles.metaText
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

                  </TouchableOpacity>

                );

              }
            )
        }

      </ScrollView>

    </SafeAreaView>

  );

}


const styles =
  StyleSheet.create({

    safeArea: {
      flex:
        1,
      backgroundColor:
        "#F7F8FC",
    },

    screen: {
      flex:
        1,
      backgroundColor:
        "#F7F8FC",
    },

    content: {
      paddingHorizontal:
        18,
      paddingTop:
        14,
      paddingBottom:
        36,
    },

    topRow: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap:
        12,
    },

    backButton: {
      width:
        42,
      height:
        42,
      borderRadius:
        14,
      backgroundColor:
        "#FFFFFF",
      borderWidth:
        1,
      borderColor:
        "#E8E8F1",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    headerIcon: {
      width:
        48,
      height:
        48,
      borderRadius:
        16,
      backgroundColor:
        "#F0EDFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    headerTextBox: {
      flex:
        1,
      paddingTop:
        1,
    },

    heading: {
      fontSize:
        25,
      lineHeight:
        30,
      fontWeight:
        "800",
      color:
        "#25263A",
    },

    subtitle: {
      marginTop:
        5,
      fontSize:
        12,
      lineHeight:
        18,
      color:
        "#8A8DA0",
    },

    statsRow: {
      flexDirection:
        "row",
      gap:
        12,
      marginTop:
        22,
    },

    statCard: {
      flex:
        1,
      backgroundColor:
        "#FFFFFF",
      borderRadius:
        18,
      borderWidth:
        1,
      borderColor:
        "#E9E7F1",
      paddingHorizontal:
        17,
      paddingVertical:
        16,
    },

    statLabel: {
      fontSize:
        12,
      fontWeight:
        "600",
      color:
        "#9497A8",
    },

    statValue: {
      marginTop:
        5,
      fontSize:
        26,
      fontWeight:
        "800",
      color:
        "#25263A",
    },

    unreadValue: {
      color:
        "#7C6CFF",
    },

    actionsRow: {
      flexDirection:
        "row",
      gap:
        10,
      marginTop:
        14,
    },

    refreshButton: {
      flex:
        1,
      minHeight:
        46,
      borderRadius:
        14,
      backgroundColor:
        "#FFFFFF",
      borderWidth:
        1,
      borderColor:
        "#E5E2F2",
      flexDirection:
        "row",
      gap:
        7,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    refreshText: {
      color:
        "#6F61DF",
      fontSize:
        12,
      fontWeight:
        "700",
    },

    markAllButton: {
      flex:
        1.25,
      minHeight:
        46,
      borderRadius:
        14,
      backgroundColor:
        "#7C6CFF",
      flexDirection:
        "row",
      gap:
        7,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    markAllText: {
      color:
        "#FFFFFF",
      fontSize:
        12,
      fontWeight:
        "700",
    },

    disabledButton: {
      opacity:
        0.48,
    },

    filterBox: {
      marginTop:
        18,
      backgroundColor:
        "#ECEAF5",
      borderRadius:
        14,
      padding:
        4,
      flexDirection:
        "row",
    },

    filterButton: {
      flex:
        1,
      minHeight:
        38,
      borderRadius:
        11,
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
        "#8A8D9E",
      fontSize:
        12,
      fontWeight:
        "700",
    },

    filterTextActive: {
      color:
        "#6758D6",
    },

    errorBox: {
      marginTop:
        18,
      borderRadius:
        16,
      backgroundColor:
        "#FFF5F6",
      borderWidth:
        1,
      borderColor:
        "#FFDDE2",
      padding:
        16,
    },

    errorTitle: {
      color:
        "#B94F62",
      fontWeight:
        "800",
      fontSize:
        13,
    },

    errorText: {
      marginTop:
        5,
      color:
        "#C66A78",
      fontSize:
        11,
      lineHeight:
        17,
    },

    loadingBox: {
      minHeight:
        210,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        12,
      color:
        "#9294A5",
      fontSize:
        12,
    },

    emptyBox: {
      marginTop:
        18,
      minHeight:
        220,
      borderRadius:
        22,
      borderWidth:
        1,
      borderStyle:
        "dashed",
      borderColor:
        "#DCD8F4",
      backgroundColor:
        "#FBFAFE",
      alignItems:
        "center",
      justifyContent:
        "center",
      padding:
        26,
    },

    emptyIcon: {
      width:
        58,
      height:
        58,
      borderRadius:
        18,
      backgroundColor:
        "#F0EDFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop:
        14,
      fontSize:
        15,
      fontWeight:
        "800",
      color:
        "#4B4D61",
    },

    emptyText: {
      marginTop:
        6,
      fontSize:
        11,
      lineHeight:
        17,
      color:
        "#9699A9",
      textAlign:
        "center",
    },

    notificationCard: {
      marginTop:
        12,
      backgroundColor:
        "#FFFFFF",
      borderRadius:
        19,
      borderWidth:
        1,
      borderColor:
        "#E9E8F0",
      padding:
        15,
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap:
        12,
    },

    notificationCardUnread: {
      borderColor:
        "#DCD5FF",
      backgroundColor:
        "#FCFBFF",
    },

    notificationIcon: {
      width:
        42,
      height:
        42,
      borderRadius:
        13,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    notificationContent: {
      flex:
        1,
    },

    notificationTitleRow: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap:
        8,
    },

    notificationTitle: {
      flex:
        1,
      color:
        "#343548",
      fontSize:
        13,
      lineHeight:
        18,
      fontWeight:
        "800",
    },

    unreadDot: {
      width:
        8,
      height:
        8,
      borderRadius:
        4,
      backgroundColor:
        "#7C6CFF",
      marginTop:
        4,
    },

    notificationBody: {
      marginTop:
        5,
      color:
        "#73768B",
      fontSize:
        12,
      lineHeight:
        18,
    },

    metaRow: {
      marginTop:
        9,
      flexDirection:
        "row",
      alignItems:
        "center",
      flexWrap:
        "wrap",
      gap:
        7,
    },

    metaText: {
      color:
        "#A0A3B2",
      fontSize:
        10,
      fontWeight:
        "600",
    },

    metaDot: {
      width:
        3,
      height:
        3,
      borderRadius:
        2,
      backgroundColor:
        "#C1C3CF",
    },

  });
