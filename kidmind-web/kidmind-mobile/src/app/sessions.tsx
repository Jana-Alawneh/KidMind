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
  useCallback,
  useState,
} from "react";

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  Brain,
  CalendarDays,
  ChevronRight,
  Clock3,
  Target,
} from "lucide-react-native";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

import {
  getSessions,
} from "@/api/sessionsApi";

import type {
  Session,
  SessionStatus,
} from "@/api/sessionsApi";


const formatDuration = (
  totalSeconds: number
) => {

  const safeSeconds =
    Math.max(
      0,
      Math.floor(
        Number(totalSeconds) || 0
      )
    );

  const hours =
    Math.floor(
      safeSeconds / 3600
    );

  const minutes =
    Math.floor(
      (
        safeSeconds % 3600
      ) / 60
    );

  const seconds =
    safeSeconds % 60;


  if (hours > 0) {

    return `${hours}h ${minutes}m ${seconds}s`;

  }


  if (minutes > 0) {

    return `${minutes}m ${seconds}s`;

  }


  return `${seconds}s`;

};


const formatDate = (
  value: string | null
) => {

  if (!value) {
    return "Not available";
  }


  const parsed =
    new Date(
      value.replace(
        " ",
        "T"
      )
    );


  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {

    return value;

  }


  return parsed.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

};


const getStatusColors = (
  status: SessionStatus
) => {

  if (
    status === "In Progress"
  ) {

    return {
      backgroundColor:
        "#DCFCE7",

      color:
        "#15803D",
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
    status === "Completed"
  ) {

    return {
      backgroundColor:
        "#EDE9FE",

      color:
        "#6D28D9",
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
        "#475569",
    };

  }


  return {
    backgroundColor:
      "#DBEAFE",

    color:
      "#1D4ED8",
  };

};


const getGamesText = (
  session: Session
) => {

  const games =
    Array.isArray(
      session.games
    )
      ? session.games
      : [];


  if (
    games.length === 0
  ) {

    return session.game_name ||
      "No games";

  }


  return games
    .map(
      (game) =>
        game.game_name
    )
    .join(" • ");

};


export default function Sessions() {

  const [
    sidebarVisible,
    setSidebarVisible,
  ] = useState(false);


  const [
    sessions,
    setSessions,
  ] = useState<Session[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const loadSessions =
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


          const data =
            await getSessions();


          setSessions(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (loadError) {

          console.error(
            "Failed to load sessions:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load sessions"
          );

        } finally {

          setLoading(false);

          setRefreshing(false);

        }

      },
      []
    );


  useFocusEffect(
    useCallback(
      () => {

        loadSessions();

      },
      [loadSessions]
    )
  );


  const completedCount =
    sessions.filter(
      (session) =>
        session.status ===
        "Completed"
    ).length;


  const activeCount =
    sessions.filter(
      (session) =>
        session.status ===
          "In Progress" ||
        session.status ===
          "Paused"
    ).length;


  return (

    <View
      style={
        styles.container
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() => {
              loadSessions(true);
            }}
            tintColor="#7B6EF6"
            colors={[
              "#7B6EF6",
            ]}
          />
        }
      >

        <Navbar
          onMenuPress={() => {
            setSidebarVisible(
              true
            );
          }}
        />


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
              Sessions
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              View assessment sessions
              and results
            </Text>

          </View>

        </View>


        {!loading &&
          !error && (
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

              <View
                style={
                  styles.statIcon
                }
              >
                <Brain
                  size={20}
                  color="#7B6EF6"
                />
              </View>

              <Text
                style={
                  styles.statValue
                }
              >
                {sessions.length}
              </Text>

              <Text
                style={
                  styles.statLabel
                }
              >
                Total Sessions
              </Text>

            </View>


            <View
              style={
                styles.statCard
              }
            >

              <View
                style={
                  styles.statIcon
                }
              >
                <Clock3
                  size={20}
                  color="#7B6EF6"
                />
              </View>

              <Text
                style={
                  styles.statValue
                }
              >
                {activeCount}
              </Text>

              <Text
                style={
                  styles.statLabel
                }
              >
                Active
              </Text>

            </View>


            <View
              style={
                styles.statCard
              }
            >

              <View
                style={
                  styles.statIcon
                }
              >
                <Target
                  size={20}
                  color="#7B6EF6"
                />
              </View>

              <Text
                style={
                  styles.statValue
                }
              >
                {completedCount}
              </Text>

              <Text
                style={
                  styles.statLabel
                }
              >
                Completed
              </Text>

            </View>

          </View>
        )}


        {loading && (
          <View
            style={
              styles.loadingBox
            }
          >

            <ActivityIndicator
              size="large"
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
          error && (
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

            <TouchableOpacity
              style={
                styles.retryButton
              }
              activeOpacity={0.85}
              onPress={() => {
                loadSessions();
              }}
            >

              <Text
                style={
                  styles.retryButtonText
                }
              >
                Try Again
              </Text>

            </TouchableOpacity>

          </View>
        )}


        {!loading &&
          !error &&
          sessions.length === 0 && (
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
              <Brain
                size={38}
                color="#7B6EF6"
              />
            </View>

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
              Assessment sessions
              will appear here once
              they are created.
            </Text>

          </View>
        )}


        {!loading &&
          !error &&
          sessions.length > 0 && (
          <View
            style={
              styles.list
            }
          >

            {sessions.map(
              (session) => {

                const statusColors =
                  getStatusColors(
                    session.status
                  );


                return (

                  <TouchableOpacity
                    key={
                      session.id
                    }
                    style={
                      styles.sessionCard
                    }
                    activeOpacity={
                      0.82
                    }
                    onPress={() => {

                      router.push({
                        pathname:
                          "/sessions/[id]",

                        params: {
                          id: String(
                            session.id
                          ),
                        },
                      });

                    }}
                  >

                    <View
                      style={
                        styles.cardTopRow
                      }
                    >

                      <View
                        style={
                          styles.childSection
                        }
                      >

                        <View
                          style={
                            styles.childAvatar
                          }
                        >

                          <Text
                            style={
                              styles.childAvatarText
                            }
                          >
                            {session
                              .child_name
                              ?.trim()
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "C"}
                          </Text>

                        </View>


                        <View
                          style={
                            styles.childText
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
                            {session.child_name}
                          </Text>

                          <Text
                            style={
                              styles.sessionId
                            }
                          >
                            Session #{session.id}
                          </Text>

                        </View>

                      </View>


                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              statusColors.backgroundColor,
                          },
                        ]}
                      >

                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                statusColors.color,
                            },
                          ]}
                        >
                          {session.status}
                        </Text>

                      </View>

                    </View>


                    <View
                      style={
                        styles.gamesBox
                      }
                    >

                      <Brain
                        size={18}
                        color="#7B6EF6"
                      />

                      <Text
                        style={
                          styles.gamesText
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


                    <View
                      style={
                        styles.infoGrid
                      }
                    >

                      <View
                        style={
                          styles.infoItem
                        }
                      >

                        <CalendarDays
                          size={16}
                          color="#64748B"
                        />

                        <View>

                          <Text
                            style={
                              styles.infoLabel
                            }
                          >
                            Date
                          </Text>

                          <Text
                            style={
                              styles.infoValue
                            }
                          >
                            {formatDate(
                              session.created_at
                            )}
                          </Text>

                        </View>

                      </View>


                      <View
                        style={
                          styles.infoItem
                        }
                      >

                        <Clock3
                          size={16}
                          color="#64748B"
                        />

                        <View>

                          <Text
                            style={
                              styles.infoLabel
                            }
                          >
                            Duration
                          </Text>

                          <Text
                            style={
                              styles.infoValue
                            }
                          >
                            {formatDuration(
                              session.duration_seconds
                            )}
                          </Text>

                        </View>

                      </View>


                      <View
                        style={
                          styles.infoItem
                        }
                      >

                        <Target
                          size={16}
                          color="#64748B"
                        />

                        <View>

                          <Text
                            style={
                              styles.infoLabel
                            }
                          >
                            Score
                          </Text>

                          <Text
                            style={
                              styles.infoValue
                            }
                          >
                            {session.score ===
                            null
                              ? "—"
                              : `${Math.round(
                                  Number(
                                    session.score
                                  )
                                )}%`}
                          </Text>

                        </View>

                      </View>

                    </View>


                    <View
                      style={
                        styles.cardFooter
                      }
                    >

                      <Text
                        style={
                          styles.viewText
                        }
                      >
                        View Session
                      </Text>

                      <ChevronRight
                        size={19}
                        color="#7B6EF6"
                      />

                    </View>

                  </TouchableOpacity>

                );

              }
            )}

          </View>
        )}

      </ScrollView>


      <Sidebar
        visible={
          sidebarVisible
        }
        onClose={() => {
          setSidebarVisible(
            false
          );
        }}
      />

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {
      flex: 1,

      backgroundColor:
        "#F7F8FC",
    },


    content: {
      padding: 20,

      paddingBottom: 50,
    },


    header: {
      marginTop: 26,

      marginBottom: 22,
    },


    title: {
      fontSize: 28,

      fontWeight: "800",

      color: "#1E293B",
    },


    subtitle: {
      marginTop: 6,

      fontSize: 14,

      lineHeight: 20,

      color: "#64748B",
    },


    statsRow: {
      flexDirection: "row",

      gap: 10,

      marginBottom: 22,
    },


    statCard: {
      flex: 1,

      minHeight: 115,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 18,

      padding: 12,

      borderWidth: 1,

      borderColor:
        "#EDE9FE",

      alignItems: "center",

      justifyContent:
        "center",
    },


    statIcon: {
      width: 36,

      height: 36,

      borderRadius: 12,

      backgroundColor:
        "#F3F0FF",

      alignItems: "center",

      justifyContent:
        "center",

      marginBottom: 7,
    },


    statValue: {
      fontSize: 21,

      fontWeight: "800",

      color: "#1E293B",
    },


    statLabel: {
      marginTop: 2,

      fontSize: 11,

      color: "#64748B",

      textAlign: "center",
    },


    loadingBox: {
      minHeight: 350,

      alignItems: "center",

      justifyContent:
        "center",

      gap: 14,
    },


    loadingText: {
      color: "#64748B",

      fontSize: 14,
    },


    errorBox: {
      padding: 22,

      borderRadius: 18,

      backgroundColor:
        "#FEF2F2",

      borderWidth: 1,

      borderColor:
        "#FECACA",
    },


    errorTitle: {
      fontSize: 18,

      fontWeight: "700",

      color: "#B91C1C",
    },


    errorText: {
      marginTop: 8,

      color: "#B91C1C",

      lineHeight: 20,
    },


    retryButton: {
      marginTop: 18,

      alignSelf:
        "flex-start",

      paddingHorizontal: 18,

      paddingVertical: 11,

      borderRadius: 11,

      backgroundColor:
        "#7B6EF6",
    },


    retryButtonText: {
      color: "#FFFFFF",

      fontWeight: "700",
    },


    emptyBox: {
      minHeight: 320,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,

      borderWidth: 1,

      borderColor:
        "#EDE9FE",

      alignItems: "center",

      justifyContent:
        "center",

      padding: 30,
    },


    emptyIcon: {
      width: 72,

      height: 72,

      borderRadius: 24,

      backgroundColor:
        "#F3F0FF",

      alignItems: "center",

      justifyContent:
        "center",
    },


    emptyTitle: {
      marginTop: 18,

      fontSize: 19,

      fontWeight: "800",

      color: "#1E293B",
    },


    emptyText: {
      marginTop: 8,

      maxWidth: 260,

      textAlign: "center",

      color: "#64748B",

      lineHeight: 20,
    },


    list: {
      gap: 14,
    },


    sessionCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 20,

      padding: 17,

      borderWidth: 1,

      borderColor:
        "#E9E5FF",
    },


    cardTopRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      gap: 10,
    },


    childSection: {
      flex: 1,

      flexDirection: "row",

      alignItems: "center",

      gap: 11,
    },


    childAvatar: {
      width: 44,

      height: 44,

      borderRadius: 14,

      backgroundColor:
        "#EEE9FF",

      alignItems: "center",

      justifyContent:
        "center",
    },


    childAvatarText: {
      color: "#6D5CE7",

      fontSize: 18,

      fontWeight: "800",
    },


    childText: {
      flex: 1,
    },


    childName: {
      fontSize: 16,

      fontWeight: "800",

      color: "#1E293B",
    },


    sessionId: {
      marginTop: 3,

      color: "#94A3B8",

      fontSize: 12,
    },


    statusBadge: {
      paddingHorizontal: 10,

      paddingVertical: 6,

      borderRadius: 999,
    },


    statusText: {
      fontSize: 11,

      fontWeight: "700",
    },


    gamesBox: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      gap: 9,

      marginTop: 16,

      padding: 12,

      borderRadius: 14,

      backgroundColor:
        "#F8F7FF",
    },


    gamesText: {
      flex: 1,

      color: "#475569",

      lineHeight: 19,

      fontSize: 13,

      fontWeight: "600",
    },


    infoGrid: {
      marginTop: 15,

      gap: 11,
    },


    infoItem: {
      flexDirection: "row",

      alignItems: "center",

      gap: 10,
    },


    infoLabel: {
      fontSize: 11,

      color: "#94A3B8",
    },


    infoValue: {
      marginTop: 1,

      fontSize: 13,

      fontWeight: "600",

      color: "#334155",
    },


    cardFooter: {
      marginTop: 16,

      paddingTop: 14,

      borderTopWidth: 1,

      borderTopColor:
        "#F1F5F9",

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "flex-end",

      gap: 4,
    },


    viewText: {
      color: "#7B6EF6",

      fontWeight: "700",

      fontSize: 13,
    },

  });