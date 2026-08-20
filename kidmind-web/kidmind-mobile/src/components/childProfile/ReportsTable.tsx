import {
  ActivityIndicator,
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
  useLocalSearchParams,
} from "expo-router";

import {
  CheckCircle,
  Eye,
  FileText,
} from "lucide-react-native";

import Card from "../ui/Card";

import {
  getSessions,
} from "@/api/sessionsApi";

import type {
  Session,
} from "@/api/sessionsApi";


const formatDate = (
  value: unknown
) => {

  if (!value) {
    return "—";
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
    return "—";
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


const getReportTitle = (
  session: Session
) => {

  if (
    !Array.isArray(
      session.games
    ) ||
    session.games.length === 0
  ) {
    return "Assessment Report";
  }


  const names =
    session.games
      .map(
        (game) =>
          game.game_name
      )
      .filter(Boolean);


  if (
    names.length === 0
  ) {
    return "Assessment Report";
  }


  if (
    names.length === 1
  ) {
    return `${names[0]} Assessment`;
  }


  return "Multi-Game Assessment";

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
    return "No game details";
  }


  return session.games
    .map(
      (game) =>
        game.game_name
    )
    .filter(Boolean)
    .join(" • ");

};


const ReportsTable = () => {

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
    reports,
    setReports,
  ] = useState<Session[]>(
    []
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const loadReports =
    useCallback(
      async () => {

        if (
          !Number.isInteger(
            childId
          ) ||
          childId <= 0
        ) {

          setReports([]);
          setLoading(false);

          return;

        }


        try {

          setLoading(true);

          setError("");


          const sessions =
            await getSessions();


          const completedReports =
            sessions
              .filter(
                (session) =>
                  Number(
                    session.child_id
                  ) ===
                    childId &&
                  session.status ===
                    "Completed"
              )
              .sort(
                (
                  first,
                  second
                ) => {

                  const firstDate =
                    new Date(
                      String(
                        first.ended_at ||
                        first.started_at ||
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
                        second.ended_at ||
                        second.started_at ||
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
              );


          setReports(
            completedReports
          );

        } catch (loadError) {

          console.error(
            "Failed to load reports:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load assessment reports"
          );

        } finally {

          setLoading(false);

        }

      },
      [
        childId,
      ]
    );


  useFocusEffect(
    useCallback(
      () => {

        void loadReports();

      },
      [
        loadReports,
      ]
    )
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
            styles.headerText
          }
        >

          <Text
            style={
              styles.title
            }
          >
            Assessment Reports
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Completed assessment history
          </Text>

        </View>


        <TouchableOpacity
          style={
            styles.button
          }
          activeOpacity={0.85}
          onPress={() => {

            router.push(
              "/sessions"
            );

          }}
        >

          <Text
            style={
              styles.buttonText
            }
          >
            View All Sessions
          </Text>

        </TouchableOpacity>

      </View>


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
            Loading reports...
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
            Unable to load reports
          </Text>

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
        !error &&
        reports.length === 0 && (

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

            <FileText
              size={25}
              color="#7B6EF6"
            />

          </View>

          <Text
            style={
              styles.emptyTitle
            }
          >
            No reports yet
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            Completed assessment sessions
            will appear here.
          </Text>

        </View>

      )}


      {!loading &&
        !error &&
        reports.map(
          (report) => {

            const reportDate =
              report.ended_at ||
              report.started_at ||
              report.created_at;


            return (

              <View
                key={
                  report.id
                }
                style={
                  styles.card
                }
              >

                <View
                  style={
                    styles.topRow
                  }
                >

                  <View
                    style={
                      styles.left
                    }
                  >

                    <View
                      style={
                        styles.iconBox
                      }
                    >

                      <FileText
                        size={22}
                        color="#7B6EF6"
                      />

                    </View>


                    <View
                      style={
                        styles.reportInfo
                      }
                    >

                      <Text
                        style={
                          styles.reportTitle
                        }
                      >
                        {getReportTitle(
                          report
                        )}
                      </Text>

                      <Text
                        style={
                          styles.reportId
                        }
                      >
                        Session #{report.id}
                      </Text>

                    </View>

                  </View>


                  <Text
                    style={
                      styles.score
                    }
                  >
                    {report.score !==
                      null &&
                    report.score !==
                      undefined
                      ? `${Math.round(
                          Number(
                            report.score
                          )
                        )}%`
                      : "—"}
                  </Text>

                </View>


                <Text
                  style={
                    styles.games
                  }
                >
                  {getGamesText(
                    report
                  )}
                </Text>


                <Text
                  style={
                    styles.date
                  }
                >
                  {formatDate(
                    reportDate
                  )}
                </Text>


                <View
                  style={
                    styles.bottom
                  }
                >

                  <View
                    style={
                      styles.status
                    }
                  >

                    <CheckCircle
                      size={14}
                      color="#15803D"
                    />

                    <Text
                      style={
                        styles.statusText
                      }
                    >
                      Completed
                    </Text>

                  </View>


                  <TouchableOpacity
                    style={
                      styles.view
                    }
                    activeOpacity={0.8}
                    onPress={() => {

                      router.push({
                        pathname:
                          "/sessions/[id]",

                        params: {
                          id: String(
                            report.id
                          ),
                        },
                      });

                    }}
                  >

                    <Eye
                      size={18}
                      color="#2563EB"
                    />

                  </TouchableOpacity>

                </View>

              </View>

            );

          }
        )}

    </Card>

  );

};


const styles =
  StyleSheet.create({

    header: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap: 12,

      marginBottom: 20,
    },


    headerText: {
      flex: 1,
    },


    title: {
      fontSize: 22,

      fontWeight: "700",

      color: "#172554",
    },


    subtitle: {
      color: "#64748B",

      marginTop: 5,
    },


    button: {
      backgroundColor:
        "#7B6EF6",

      paddingHorizontal: 13,

      paddingVertical: 10,

      borderRadius: 12,
    },


    buttonText: {
      color: "#FFFFFF",

      fontWeight: "600",

      fontSize: 12,

      textAlign: "center",
    },


    loadingBox: {
      minHeight: 160,

      justifyContent:
        "center",

      alignItems:
        "center",

      gap: 12,
    },


    loadingText: {
      color: "#64748B",

      fontSize: 13,
    },


    errorBox: {
      padding: 18,

      borderRadius: 16,

      backgroundColor:
        "#FEF2F2",

      borderWidth: 1,

      borderColor:
        "#FECACA",
    },


    errorTitle: {
      color: "#B91C1C",

      fontWeight: "700",

      textAlign: "center",
    },


    errorText: {
      color: "#DC2626",

      fontSize: 13,

      textAlign: "center",

      marginTop: 5,
    },


    emptyBox: {
      paddingVertical: 30,

      alignItems:
        "center",
    },


    emptyIcon: {
      width: 54,

      height: 54,

      borderRadius: 18,

      backgroundColor:
        "#F2EEFF",

      justifyContent:
        "center",

      alignItems:
        "center",
    },


    emptyTitle: {
      color: "#172554",

      fontWeight: "700",

      fontSize: 16,

      marginTop: 12,
    },


    emptyText: {
      color: "#64748B",

      fontSize: 13,

      textAlign: "center",

      marginTop: 5,

      lineHeight: 19,
    },


    card: {
      backgroundColor:
        "#FAFAFD",

      borderRadius: 18,

      padding: 16,

      marginBottom: 15,

      borderWidth: 1,

      borderColor:
        "#F1F5F9",
    },


    topRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems:
        "flex-start",

      gap: 10,
    },


    left: {
      flex: 1,

      flexDirection: "row",

      gap: 12,

      alignItems:
        "center",
    },


    iconBox: {
      width: 48,

      height: 48,

      borderRadius: 14,

      backgroundColor:
        "#F2EEFF",

      justifyContent:
        "center",

      alignItems:
        "center",
    },


    reportInfo: {
      flex: 1,
    },


    reportTitle: {
      fontWeight: "700",

      fontSize: 16,

      color: "#172554",
    },


    reportId: {
      color: "#94A3B8",

      fontSize: 12,

      marginTop: 3,
    },


    score: {
      color: "#7B6EF6",

      fontWeight: "800",

      fontSize: 22,
    },


    games: {
      color: "#64748B",

      fontSize: 12,

      lineHeight: 18,

      marginTop: 13,
    },


    date: {
      marginTop: 8,

      color: "#64748B",

      fontSize: 13,
    },


    bottom: {
      marginTop: 15,

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },


    status: {
      flexDirection: "row",

      alignItems:
        "center",

      gap: 6,

      backgroundColor:
        "#DCFCE7",

      paddingHorizontal: 10,

      paddingVertical: 6,

      borderRadius: 20,
    },


    statusText: {
      color: "#15803D",

      fontSize: 12,

      fontWeight: "600",
    },


    view: {
      width: 40,

      height: 40,

      borderRadius: 12,

      backgroundColor:
        "#DBEAFE",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

  });


export default ReportsTable;