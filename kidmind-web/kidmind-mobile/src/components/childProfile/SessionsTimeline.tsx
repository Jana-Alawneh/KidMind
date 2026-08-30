import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
} from "lucide-react-native";

import Card from "../ui/Card";

import {
  getSessions,
} from "@/api/sessionsApi";

import type {
  Session,
} from "@/api/sessionsApi";


const formatDuration = (
  seconds: number | null | undefined
) => {

  const totalSeconds =
    Math.max(
      0,
      Number(seconds) || 0
    );


  const minutes =
    Math.floor(
      totalSeconds / 60
    );


  const remainingSeconds =
    totalSeconds % 60;


  if (
    minutes ===
    0
  ) {
    return `${remainingSeconds}s`;
  }


  return `${minutes}m ${remainingSeconds}s`;

};


const formatDate = (
  value:
    | string
    | null
    | undefined
) => {

  if (!value) {
    return "No date";
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
    return "No date";
  }


  return date.toLocaleDateString(
    "en-US",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );

};


const getGamesText = (
  session: Session
) => {

  if (
    !Array.isArray(
      session.games
    ) ||
    session.games.length ===
      0
  ) {
    return "No games";
  }


  return session.games
    .map(
      (game) =>
        game.game_name
    )
    .filter(
      Boolean
    )
    .join(" • ");

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
        "#F0EDFF",

      color:
        "#7566EB",
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


  if (
    status ===
    "Cancelled"
  ) {
    return {
      backgroundColor:
        "#F5F5F8",

      color:
        "#777A8F",
    };
  }


  return {
    backgroundColor:
      "#EDF6FF",

    color:
      "#5595DD",
  };

};


const SessionsTimeline = () => {

  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();


  const idValue =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;


  const childId =
    Number(
      idValue
    );


  const [
    sessions,
    setSessions,
  ] =
    useState<Session[]>(
      []
    );


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

          if (
            !Number.isInteger(
              childId
            ) ||
            childId <=
              0
          ) {

            setSessions(
              []
            );

            setLoading(
              false
            );

            return;

          }


          try {

            setLoading(
              true
            );

            setError(
              ""
            );


            const allSessions =
              await getSessions();


            const childSessions =
              allSessions
                .filter(
                  (
                    session
                  ) =>
                    Number(
                      session.child_id
                    ) ===
                    childId
                )
                .sort(
                  (
                    first,
                    second
                  ) => {

                    const firstDate =
                      new Date(
                        String(
                          first.started_at ||
                          first.scheduled_at ||
                          first.created_at ||
                          ""
                        ).replace(
                          " ",
                          "T"
                        )
                      ).getTime();


                    const secondDate =
                      new Date(
                        String(
                          second.started_at ||
                          second.scheduled_at ||
                          second.created_at ||
                          ""
                        ).replace(
                          " ",
                          "T"
                        )
                      ).getTime();


                    return (
                      (
                        Number.isFinite(
                          secondDate
                        )
                          ? secondDate
                          : 0
                      ) -
                      (
                        Number.isFinite(
                          firstDate
                        )
                          ? firstDate
                          : 0
                      )
                    );

                  }
                )
                .slice(
                  0,
                  3
                );


            setSessions(
              childSessions
            );

          } catch (
            loadError
          ) {

            console.error(
              "Failed to load child sessions:",
              loadError
            );


            setError(
              loadError instanceof Error
                ? loadError.message
                : "Failed to load sessions"
            );

          } finally {

            setLoading(
              false
            );

          }

        };


      loadSessions();

    },
    [
      childId,
    ]
  );


  return (

    <Card>

      <View
        style={
          styles.header
        }
      >

        <View
          style={
            styles.headerIcon
          }
        >

          <CalendarDays
            size={18}
            color="#7566EB"
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
            Recent Sessions
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Latest child assessment activity
          </Text>

        </View>

      </View>


      <View
        style={
          styles.divider
        }
      />


      {loading && (

        <View
          style={
            styles.loadingBox
          }
        >

          <ActivityIndicator
            size="small"
            color="#7B6EF6"
          />


          <Text
            style={
              styles.loadingText
            }
          >
            Loading sessions...
          </Text>

        </View>

      )}


      {!loading &&
        error !==
          "" && (

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
        error ===
          "" &&
        sessions.length ===
          0 && (

        <View
          style={
            styles.emptyBox
          }
        >

          <Text
            style={
              styles.emptyTitle
            }
          >
            No sessions yet
          </Text>


          <Text
            style={
              styles.emptyText
            }
          >
            This child does not have any assessment sessions yet.
          </Text>

        </View>

      )}


      {!loading &&
        error ===
          "" &&
        sessions.length >
          0 && (

        <View
          style={
            styles.list
          }
        >

          {sessions.map(
            (
              session
            ) => {

              const statusStyle =
                getStatusStyle(
                  session.status
                );


              const dateValue =
                session.started_at ||
                session.scheduled_at ||
                session.created_at;


              return (

                <TouchableOpacity
                  key={
                    session.id
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
                            session.id
                          ),
                      },
                    });

                  }}
                >

                  <View
                    style={
                      styles.topRow
                    }
                  >

                    <View
                      style={
                        styles.sessionInfo
                      }
                    >

                      <Text
                        style={
                          styles.sessionTitle
                        }
                      >
                        Session #{session.id}
                      </Text>


                      <Text
                        style={
                          styles.game
                        }
                        numberOfLines={
                          2
                        }
                      >
                        {getGamesText(
                          session
                        )}
                      </Text>

                    </View>


                    <ArrowUpRight
                      size={14}
                      color="#B0B2C1"
                    />

                  </View>


                  <View
                    style={
                      styles.dateRow
                    }
                  >

                    <CalendarDays
                      size={11}
                      color="#9295A7"
                    />


                    <Text
                      style={
                        styles.date
                      }
                    >
                      {formatDate(
                        dateValue
                      )}
                    </Text>

                  </View>


                  <View
                    style={
                      styles.detailsRow
                    }
                  >

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            statusStyle
                              .backgroundColor,
                        },
                      ]}
                    >

                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              statusStyle
                                .color,
                          },
                        ]}
                      >
                        {session.status}
                      </Text>

                    </View>


                    <View
                      style={
                        styles.detailsRight
                      }
                    >

                      <View
                        style={
                          styles.durationBadge
                        }
                      >

                        <Clock3
                          size={10}
                          color="#7566EB"
                        />


                        <Text
                          style={
                            styles.durationText
                          }
                        >
                          {formatDuration(
                            session.duration_seconds
                          )}
                        </Text>

                      </View>


                      {session.score !==
                        null &&
                        session.score !==
                          undefined && (

                        <View
                          style={
                            styles.scoreBadge
                          }
                        >

                          <Text
                            style={
                              styles.scoreBadgeText
                            }
                          >
                            {Math.round(
                              Number(
                                session.score
                              )
                            )}%
                          </Text>

                        </View>

                      )}

                    </View>

                  </View>

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

      alignItems:
        "center",

      gap:
        10,

    },


    headerIcon: {

      width:
        39,

      height:
        39,

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

    },


    title: {

      color:
        "#333554",

      fontSize:
        15,

      fontWeight:
        "700",

    },


    subtitle: {

      marginTop:
        3,

      color:
        "#A0A3B4",

      fontSize:
        9.5,

    },


    divider: {

      height:
        1,

      marginTop:
        14,

      backgroundColor:
        "#F0F0F5",

    },


    loadingBox: {

      minHeight:
        150,

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        8,

    },


    loadingText: {

      color:
        "#A0A3B4",

      fontSize:
        10,

    },


    errorBox: {

      minHeight:
        100,

      marginTop:
        13,

      padding:
        13,

      borderRadius:
        13,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFF0F3",

      borderWidth:
        1,

      borderColor:
        "#F6D8DF",

    },


    errorText: {

      color:
        "#B9415E",

      fontSize:
        9.5,

      textAlign:
        "center",

    },


    emptyBox: {

      minHeight:
        150,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    emptyTitle: {

      color:
        "#55586D",

      fontSize:
        12,

      fontWeight:
        "700",

    },


    emptyText: {

      marginTop:
        5,

      maxWidth:
        230,

      color:
        "#A0A3B4",

      fontSize:
        9.5,

      lineHeight:
        15,

      textAlign:
        "center",

    },


    list: {

      marginTop:
        13,

      gap:
        9,

    },


    sessionCard: {

      padding:
        12,

      borderRadius:
        14,

      backgroundColor:
        "#FCFCFE",

      borderWidth:
        1,

      borderColor:
        "#EFEFF5",

    },


    topRow: {

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        8,

    },


    sessionInfo: {

      flex:
        1,

      minWidth:
        0,

    },


    sessionTitle: {

      color:
        "#A0A3B4",

      fontSize:
        8.5,

      fontWeight:
        "600",

    },


    game: {

      marginTop:
        4,

      color:
        "#55586D",

      fontSize:
        10.5,

      lineHeight:
        15,

      fontWeight:
        "700",

    },


    dateRow: {

      marginTop:
        8,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,

    },


    date: {

      color:
        "#9295A7",

      fontSize:
        8.5,

    },


    detailsRow: {

      marginTop:
        10,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap:
        8,

    },


    statusBadge: {

      paddingHorizontal:
        8,

      paddingVertical:
        4,

      borderRadius:
        999,

    },


    statusText: {

      fontSize:
        8,

      fontWeight:
        "700",

    },


    detailsRight: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,

    },


    durationBadge: {

      paddingHorizontal:
        7,

      paddingVertical:
        4,

      borderRadius:
        8,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        4,

      backgroundColor:
        "#F3F0FF",

    },


    durationText: {

      color:
        "#7566EB",

      fontSize:
        8,

      fontWeight:
        "600",

    },


    scoreBadge: {

      paddingHorizontal:
        7,

      paddingVertical:
        4,

      borderRadius:
        8,

      backgroundColor:
        "#ECFAF4",

    },


    scoreBadgeText: {

      color:
        "#3E9E7D",

      fontSize:
        8,

      fontWeight:
        "700",

    },

  });


export default SessionsTimeline;