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
    minutes === 0
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
      day: "2-digit",
      month: "short",
      year: "numeric",
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
    session.games.length === 0
  ) {
    return "No games";
  }

  return session.games
    .map(
      (game) =>
        game.game_name
    )
    .filter(Boolean)
    .join(" • ");
};


const getStatusStyle = (
  status: string
) => {

  if (
    status === "Completed"
  ) {
    return {
      backgroundColor:
        "#DCFCE7",

      color:
        "#15803D",
    };
  }

  if (
    status === "In Progress"
  ) {
    return {
      backgroundColor:
        "#EDE9FE",

      color:
        "#6D5CE7",
    };
  }

  if (
    status === "Paused"
  ) {
    return {
      backgroundColor:
        "#FEF3C7",

      color:
        "#B45309",
    };
  }

  if (
    status === "Ended"
  ) {
    return {
      backgroundColor:
        "#FEE2E2",

      color:
        "#B91C1C",
    };
  }

  if (
    status === "Cancelled"
  ) {
    return {
      backgroundColor:
        "#F1F5F9",

      color:
        "#64748B",
    };
  }

  return {
    backgroundColor:
      "#E0F2FE",

    color:
      "#0369A1",
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
  ] = useState<Session[]>([]);


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

        if (
          !Number.isInteger(
            childId
          ) ||
          childId <= 0
        ) {

          setSessions([]);
          setLoading(false);

          return;
        }


        try {

          setLoading(true);
          setError("");


          const allSessions =
            await getSessions();


          const childSessions =
            allSessions
              .filter(
                (session) =>
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

        } catch (loadError) {

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

          setLoading(false);

        }

      };


    loadSessions();

  }, [
    childId,
  ]);


  return (

    <Card>

      <Text
        style={
          styles.title
        }
      >
        Recent Sessions
      </Text>


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
        sessions.length === 0 && (

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
        error === "" &&
        sessions.map(
          (
            session,
            index
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
                activeOpacity={0.75}
                style={
                  styles.row
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
                    styles.timeline
                  }
                >

                  <View
                    style={
                      styles.circle
                    }
                  />


                  {index !==
                    sessions.length -
                      1 && (

                    <View
                      style={
                        styles.line
                      }
                    />

                  )}

                </View>


                <View
                  style={
                    styles.content
                  }
                >

                  <View
                    style={
                      styles.topRow
                    }
                  >

                    <Text
                      style={
                        styles.sessionTitle
                      }
                    >
                      Session #{session.id}
                    </Text>


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

                  </View>


                  <Text
                    style={
                      styles.game
                    }
                  >
                    {getGamesText(
                      session
                    )}
                  </Text>


                  <Text
                    style={
                      styles.date
                    }
                  >
                    {formatDate(
                      dateValue
                    )}
                  </Text>


                  <View
                    style={
                      styles.detailsRow
                    }
                  >

                    <View
                      style={
                        styles.badge
                      }
                    >

                      <Text
                        style={
                          styles.badgeText
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
                          Score{" "}
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

    </Card>

  );

};


const styles =
  StyleSheet.create({

    title: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 25,
      color: "#172554",
    },


    loadingBox: {
      minHeight: 110,
      alignItems: "center",
      justifyContent:
        "center",
      gap: 10,
    },


    loadingText: {
      color: "#64748B",
      fontSize: 13,
    },


    errorBox: {
      padding: 16,
      borderRadius: 15,
      backgroundColor:
        "#FEF2F2",
    },


    errorText: {
      color: "#B91C1C",
      textAlign: "center",
    },


    emptyBox: {
      paddingVertical: 30,
      alignItems: "center",
    },


    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#172554",
    },


    emptyText: {
      marginTop: 6,
      color: "#64748B",
      textAlign: "center",
      lineHeight: 20,
    },


    row: {
      flexDirection: "row",
      marginBottom: 20,
    },


    timeline: {
      alignItems: "center",
      marginRight: 15,
    },


    circle: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor:
        "#7B6EF6",
      marginTop: 4,
    },


    line: {
      width: 2,
      flex: 1,
      minHeight: 95,
      backgroundColor:
        "#E6E2FF",
      marginTop: 4,
    },


    content: {
      flex: 1,
      paddingBottom: 5,
    },


    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: 10,
    },


    sessionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: "#94A3B8",
    },


    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },


    statusText: {
      fontSize: 10,
      fontWeight: "800",
    },


    game: {
      fontSize: 16,
      fontWeight: "700",
      color: "#172554",
      marginTop: 7,
      lineHeight: 22,
    },


    date: {
      marginTop: 5,
      color: "#64748B",
      fontSize: 13,
    },


    detailsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
    },


    badge: {
      alignSelf: "flex-start",
      backgroundColor:
        "#F3F0FF",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },


    badgeText: {
      color: "#7B6EF6",
      fontWeight: "600",
      fontSize: 12,
    },


    scoreBadge: {
      alignSelf: "flex-start",
      backgroundColor:
        "#DCFCE7",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },


    scoreBadgeText: {
      color: "#15803D",
      fontWeight: "700",
      fontSize: 12,
    },

  });


export default SessionsTimeline;