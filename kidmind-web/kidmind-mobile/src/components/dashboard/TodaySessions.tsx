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
  Clock3,
} from "lucide-react-native";

import Card from "../ui/Card";

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
        "#DCFCE7",

      color:
        "#15803D",
    };

  }


  if (
    status ===
    "In Progress"
  ) {

    return {
      backgroundColor:
        "#DBEAFE",

      color:
        "#1D4ED8",
    };

  }


  if (
    status ===
    "Paused"
  ) {

    return {
      backgroundColor:
        "#FEF3C7",

      color:
        "#B45309",
    };

  }


  if (
    status ===
    "Ended"
  ) {

    return {
      backgroundColor:
        "#FEE2E2",

      color:
        "#B91C1C",
    };

  }


  return {
    backgroundColor:
      "#F1F5F9",

    color:
      "#64748B",
  };

};


const TodaySessions = () => {

  const [
    sessions,
    setSessions,
  ] = useState<any[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {

    const loadSessions =
      async () => {

        try {

          setLoading(true);
          setError("");


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
                (session) => {

                  const dashboardDate =
                    getSessionDate(
                      session
                    );


                  const child =
                    allChildren.find(
                      (item) =>
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
                (session) => {

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

        } catch (loadError) {

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

          setLoading(false);

        }

      };


    loadSessions();

  }, []);


  return (

    <Card>

      <View
        style={
          styles.header
        }
      >

        <View>

          <Text
            style={
              styles.title
            }
          >
            Today's Sessions
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Assessment sessions from today
          </Text>

        </View>


        <TouchableOpacity
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


      {loading && (

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

      )}


      {!loading &&
        error !== "" && (

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

      )}


      {!loading &&
        error === "" &&
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
            Today's assessment sessions will appear here.
          </Text>

        </View>

      )}


      {!loading &&
        error === "" &&
        sessions.length >
          0 && (

        <View
          style={
            styles.sessionsContainer
          }
        >

          {sessions.map(
            (item) => {

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
                    styles.sessionCard
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
                      styles.leftSide
                    }
                  >

                    <View
                      style={
                        styles.iconBox
                      }
                    >

                      <Clock3
                        size={20}
                        color="#7B6EF6"
                      />

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
                          styles.game
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {getActivityText(
                          item
                        )}
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


                  <Text
                    style={
                      styles.time
                    }
                  >
                    {formatTime(
                      item.dashboardDate
                    )}
                  </Text>

                </TouchableOpacity>

              );

            }
          )}

        </View>

      )}

    </Card>

  );

};


const styles =
  StyleSheet.create({

    header: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom:
        24,

      gap:
        12,

    },


    title: {

      fontSize:
        20,

      fontWeight:
        "600",

    },


    subtitle: {

      fontSize:
        14,

      color:
        "#94A3B8",

      marginTop:
        3,

    },


    viewAll: {

      color:
        "#7B6EF6",

      fontWeight:
        "600",

    },


    sessionsContainer: {

      gap:
        16,

    },


    sessionCard: {

      backgroundColor:
        "#F8F9FD",

      borderRadius:
        16,

      padding:
        16,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap:
        12,

    },


    leftSide: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        16,

      flex:
        1,

    },


    iconBox: {

      width:
        48,

      height:
        48,

      borderRadius:
        16,

      backgroundColor:
        "#EEE9FF",

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    sessionInfo: {

      flex:
        1,

    },


    childName: {

      fontWeight:
        "600",

      fontSize:
        16,

    },


    game: {

      fontSize:
        14,

      color:
        "#64748B",

      marginTop:
        4,

    },


    time: {

      fontWeight:
        "600",

      fontSize:
        13,

      color:
        "#334155",

    },


    statusBadge: {

      alignSelf:
        "flex-start",

      borderRadius:
        999,

      paddingHorizontal:
        8,

      paddingVertical:
        3,

      marginTop:
        7,

    },


    statusText: {

      fontSize:
        10,

      fontWeight:
        "700",

    },


    stateBox: {

      minHeight:
        150,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        20,

    },


    stateText: {

      color:
        "#94A3B8",

      fontSize:
        13,

      marginTop:
        8,

      textAlign:
        "center",

    },


    emptyTitle: {

      fontSize:
        16,

      fontWeight:
        "700",

      color:
        "#475569",

    },


    errorBox: {

      minHeight:
        120,

      backgroundColor:
        "#FEF2F2",

      borderRadius:
        16,

      padding:
        20,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    errorText: {

      color:
        "#DC2626",

      fontSize:
        13,

      textAlign:
        "center",

    },

  });


export default TodaySessions;