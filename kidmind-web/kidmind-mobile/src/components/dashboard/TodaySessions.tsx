import {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  CalendarDays,
  Clock3,
} from "lucide-react-native";

import {
  getSessions,
} from "@/api/sessionsApi";

import {
  getChildren,
} from "@/api/childrenApi";


const parseDate = (
  value:
    | string
    | null
    | undefined
): Date | null => {

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


const getSessionDate = (
  session: any
): Date | null => {

  return (
    parseDate(
      session.started_at
    ) ||
    parseDate(
      session.scheduled_at
    ) ||
    parseDate(
      session.created_at
    )
  );

};


const isToday = (
  date: Date
) => {

  const now =
    new Date();


  return (
    date.getFullYear() ===
      now.getFullYear() &&
    date.getMonth() ===
      now.getMonth() &&
    date.getDate() ===
      now.getDate()
  );

};


const formatTime = (
  date: Date | null
) => {

  if (!date) {
    return "—";
  }


  return date.toLocaleTimeString(
    "en-US",
    {
      hour:
        "numeric",

      minute:
        "2-digit",

      hour12:
        true,
    }
  );

};


const getTimestamp = (
  date: Date | null
) => {

  return (
    date?.getTime() ??
    0
  );

};


const getActivityText = (
  session: any
) => {

  const games =
    Array.isArray(
      session.games
    )
      ? session.games
      : [];


  if (
    games.length ===
    0
  ) {
    return "Assessment Session";
  }


  if (
    games.length ===
    1
  ) {

    return (
      games[0]?.game_name ||
      "Assessment Session"
    );

  }


  return `${games.length} Assessment Games`;

};


const getStatusStyle = (
  status: string
) => {

  if (
    status ===
    "Completed"
  ) {

    return {
      backgroundColor:
        "#ECFAF4",

      color:
        "#3E9E7D",
    };

  }


  if (
    status ===
    "In Progress"
  ) {

    return {
      backgroundColor:
        "#EDF6FF",

      color:
        "#5595DD",
    };

  }


  if (
    status ===
    "Paused"
  ) {

    return {
      backgroundColor:
        "#FFF7E8",

      color:
        "#C48432",
    };

  }


  if (
    status ===
    "Ended"
  ) {

    return {
      backgroundColor:
        "#FFF0F3",

      color:
        "#C4556C",
    };

  }


  return {
    backgroundColor:
      "#F5F5F8",

    color:
      "#85899D",
  };

};


const getInitial = (
  name: string
) => {

  return String(
    name || "C"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

};


const TodaySessions = () => {

  const [
    sessions,
    setSessions,
  ] =
    useState<any[]>([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(
    () => {

      const loadSessions =
        async () => {

          try {

            setLoading(
              true
            );

            setError(
              ""
            );


            const [
              sessionsData,
              childrenData,
            ] =
              await Promise.all([
                getSessions(),
                getChildren(),
              ]);


            const allSessions =
              Array.isArray(
                sessionsData
              )
                ? sessionsData
                : [];


            const allChildren =
              Array.isArray(
                childrenData
              )
                ? childrenData
                : [];


            const todaySessions =
              allSessions
                .map(
                  session => {

                    const dashboardDate =
                      getSessionDate(
                        session
                      );


                    const child =
                      allChildren.find(
                        item =>
                          Number(
                            item.id
                          ) ===
                          Number(
                            session.child_id
                          )
                      );


                    return {
                      ...session,

                      dashboardDate,

                      dashboardChildName:
                        session.child_name ||
                        child?.full_name ||
                        `Child #${session.child_id}`,
                    };

                  }
                )
                .filter(
                  session => {

                    if (
                      !session.dashboardDate
                    ) {
                      return false;
                    }


                    return isToday(
                      session.dashboardDate
                    );

                  }
                )
                .sort(
                  (
                    first,
                    second
                  ) =>
                    getTimestamp(
                      second.dashboardDate
                    ) -
                    getTimestamp(
                      first.dashboardDate
                    )
                )
                .slice(
                  0,
                  3
                );


            setSessions(
              todaySessions
            );

          } catch (
            loadError
          ) {

            console.error(
              "Failed to load today's sessions:",
              loadError
            );


            setError(
              loadError instanceof Error
                ? loadError.message
                : "Failed to load today's sessions"
            );

          } finally {

            setLoading(
              false
            );

          }

        };


      loadSessions();

    },
    []
  );


  return (

    <View
      style={
        styles.panel
      }
    >

      <View
        style={
          styles.header
        }
      >

        <View
          style={
            styles.headerLeft
          }
        >

          <View
            style={
              styles.headerIcon
            }
          >

            <CalendarDays
              size={18}
              color="#7465E8"
            />

          </View>


          <View
            style={
              styles.headerCopy
            }
          >

            <Text
              style={
                styles.title
              }
            >
              Today&apos;s Sessions
            </Text>


            <Text
              style={
                styles.subtitle
              }
            >
              Assessment sessions from today
            </Text>

          </View>

        </View>


        <TouchableOpacity
          activeOpacity={
            0.7
          }
          style={
            styles.viewAllButton
          }
          onPress={() => {

            router.push(
              "/sessions"
            );

          }}
        >

          <Text
            style={
              styles.viewAll
            }
          >
            View All
          </Text>

        </TouchableOpacity>

      </View>


      {
        loading && (

          <View
            style={
              styles.stateBox
            }
          >

            <ActivityIndicator
              color="#7B6EF6"
            />


            <Text
              style={
                styles.stateText
              }
            >
              Loading sessions...
            </Text>

          </View>

        )
      }


      {
        !loading &&
        error !==
          "" && (

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
              Unable to load sessions
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
        !loading &&
        error ===
          "" &&
        sessions.length ===
          0 && (

          <View
            style={
              styles.stateBox
            }
          >

            <Text
              style={
                styles.emptyTitle
              }
            >
              No sessions today
            </Text>


            <Text
              style={
                styles.stateText
              }
            >
              Today&apos;s assessment sessions will appear here.
            </Text>

          </View>

        )
      }


      {
        !loading &&
        error ===
          "" &&
        sessions.length >
          0 && (

          <View
            style={
              styles.sessionsContainer
            }
          >

            {
              sessions.map(
                item => {

                  const statusStyle =
                    getStatusStyle(
                      item.status
                    );


                  return (

                    <TouchableOpacity
                      key={
                        item.id
                      }
                      activeOpacity={
                        0.75
                      }
                      style={
                        styles.sessionRow
                      }
                      onPress={() => {

                        router.push({
                          pathname:
                            "/sessions/[id]",

                          params: {
                            id:
                              String(
                                item.id
                              ),
                          },
                        });

                      }}
                    >

                      <View
                        style={
                          styles.sessionMain
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
                            {
                              getInitial(
                                item.dashboardChildName
                              )
                            }
                          </Text>

                        </View>


                        <View
                          style={
                            styles.sessionInfo
                          }
                        >

                          <Text
                            style={
                              styles.childName
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {item.dashboardChildName}
                          </Text>


                          <Text
                            style={
                              styles.activity
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {
                              getActivityText(
                                item
                              )
                            }
                          </Text>


                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  statusStyle.backgroundColor,
                              },
                            ]}
                          >

                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color:
                                    statusStyle.color,
                                },
                              ]}
                            >
                              {item.status}
                            </Text>

                          </View>

                        </View>

                      </View>


                      <View
                        style={
                          styles.timeWrap
                        }
                      >

                        <Clock3
                          size={13}
                          color="#9497A8"
                        />


                        <Text
                          style={
                            styles.time
                          }
                        >
                          {
                            formatTime(
                              item.dashboardDate
                            )
                          }
                        </Text>

                      </View>

                    </TouchableOpacity>

                  );

                }
              )
            }

          </View>

        )
      }

    </View>

  );

};


const styles =
  StyleSheet.create({

    panel: {

      padding:
        18,

      borderRadius:
        21,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

      shadowColor:
        "#44446E",

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity:
        0.035,

      shadowRadius:
        12,

      elevation:
        2,

    },


    header: {

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        10,

      marginBottom:
        15,

    },


    headerLeft: {

      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

    },


    headerIcon: {

      width:
        38,

      height:
        38,

      flexShrink:
        0,

      borderRadius:
        12,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F0EDFF",

    },


    headerCopy: {

      flex:
        1,

      minWidth:
        0,

    },


    title: {

      color:
        "#333554",

      fontSize:
        15.5,

      fontWeight:
        "700",

    },


    subtitle: {

      marginTop:
        3,

      color:
        "#A0A3B4",

      fontSize:
        10.5,

    },


    viewAllButton: {

      paddingHorizontal:
        8,

      paddingVertical:
        6,

      borderRadius:
        9,

    },


    viewAll: {

      color:
        "#7566EB",

      fontSize:
        10.5,

      fontWeight:
        "700",

    },


    sessionsContainer: {

      borderTopWidth:
        1,

      borderTopColor:
        "#F1F1F6",

    },


    sessionRow: {

      minHeight:
        82,

      paddingVertical:
        12,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        10,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#F1F1F6",

    },


    sessionMain: {

      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        11,

    },


    avatar: {

      width:
        41,

      height:
        41,

      flexShrink:
        0,

      borderRadius:
        13,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFF0FA",

    },


    avatarText: {

      color:
        "#B05D9B",

      fontSize:
        13,

      fontWeight:
        "800",

    },


    sessionInfo: {

      flex:
        1,

      minWidth:
        0,

    },


    childName: {

      color:
        "#373953",

      fontSize:
        12.5,

      fontWeight:
        "700",

    },


    activity: {

      marginTop:
        3,

      color:
        "#9093A6",

      fontSize:
        10,

    },


    statusBadge: {

      alignSelf:
        "flex-start",

      marginTop:
        6,

      paddingHorizontal:
        8,

      paddingVertical:
        4,

      borderRadius:
        999,

    },


    statusText: {

      fontSize:
        9,

      fontWeight:
        "700",

    },


    timeWrap: {

      flexShrink:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        4,

      paddingLeft:
        5,

    },


    time: {

      color:
        "#777A8E",

      fontSize:
        9.5,

      fontWeight:
        "600",

    },


    stateBox: {

      minHeight:
        145,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        20,

    },


    stateText: {

      marginTop:
        7,

      color:
        "#A0A3B4",

      textAlign:
        "center",

      fontSize:
        10.5,

      lineHeight:
        16,

    },


    emptyTitle: {

      color:
        "#62657B",

      fontSize:
        13,

      fontWeight:
        "700",

    },


    errorBox: {

      minHeight:
        120,

      padding:
        16,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        14,

      backgroundColor:
        "#FFF0F3",

      borderWidth:
        1,

      borderColor:
        "#F6D8DF",

    },


    errorTitle: {

      color:
        "#B9415E",

      fontSize:
        12.5,

      fontWeight:
        "700",

    },


    errorText: {

      marginTop:
        4,

      color:
        "#C55A70",

      textAlign:
        "center",

      fontSize:
        10.5,

    },

  });


export default TodaySessions;