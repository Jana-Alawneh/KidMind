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
  ArrowUpRight,
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
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
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
    session.games.length ===
      0
  ) {
    return "Assessment Report";
  }


  const names =
    session.games
      .map(
        (game) =>
          game.game_name
      )
      .filter(
        Boolean
      );


  if (
    names.length ===
    0
  ) {
    return "Assessment Report";
  }


  if (
    names.length ===
    1
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
    session.games.length ===
      0
  ) {
    return "No game details";
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


  const loadReports =
    useCallback(
      async () => {

        if (
          !Number.isInteger(
            childId
          ) ||
          childId <=
            0
        ) {

          setReports(
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

        } catch (
          loadError
        ) {

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

          setLoading(
            false
          );

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
            styles.headingGroup
          }
        >

          <View
            style={
              styles.headerIcon
            }
          >

            <FileText
              size={18}
              color="#7566EB"
            />

          </View>


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

        </View>


        <TouchableOpacity
          style={
            styles.button
          }
          activeOpacity={
            0.8
          }
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
            View All
          </Text>


          <ArrowUpRight
            size={12}
            color="#7566EB"
          />

        </TouchableOpacity>

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
        reports.length ===
          0 && (

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
              size={20}
              color="#7566EB"
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
            Completed assessment sessions will appear here.
          </Text>

        </View>

      )}


      {!loading &&
        !error &&
        reports.length >
          0 && (

        <View
          style={
            styles.list
          }
        >

          {reports.map(
            (
              report
            ) => {

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
                    styles.reportCard
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
                          size={15}
                          color="#7566EB"
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
                          numberOfLines={
                            2
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


                    <View
                      style={
                        styles.scoreBox
                      }
                    >

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

                  </View>


                  <Text
                    style={
                      styles.games
                    }
                    numberOfLines={
                      2
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
                        size={11}
                        color="#3E9E7D"
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
                      activeOpacity={
                        0.8
                      }
                      onPress={() => {

                        router.push({
                          pathname:
                            "/sessions/[id]",

                          params: {
                            id:
                              String(
                                report.id
                              ),
                          },
                        });

                      }}
                    >

                      <Eye
                        size={15}
                        color="#7565E6"
                      />

                    </TouchableOpacity>

                  </View>

                </View>

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
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        8,

    },


    headingGroup: {

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
        39,

      height:
        39,

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


    headerText: {

      flex:
        1,

      minWidth:
        0,

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


    button: {

      minHeight:
        34,

      paddingHorizontal:
        9,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        4,

      borderRadius:
        10,

      backgroundColor:
        "#F7F4FF",

      borderWidth:
        1,

      borderColor:
        "#E4DFFF",

    },


    buttonText: {

      color:
        "#7566EB",

      fontSize:
        8.5,

      fontWeight:
        "700",

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
        120,

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


    errorTitle: {

      color:
        "#B9415E",

      fontSize:
        11,

      fontWeight:
        "700",

      textAlign:
        "center",

    },


    errorText: {

      marginTop:
        4,

      color:
        "#C55A70",

      fontSize:
        9.5,

      textAlign:
        "center",

    },


    emptyBox: {

      minHeight:
        180,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    emptyIcon: {

      width:
        46,

      height:
        46,

      borderRadius:
        14,

      backgroundColor:
        "#F0EDFF",

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    emptyTitle: {

      marginTop:
        10,

      color:
        "#55586D",

      fontWeight:
        "700",

      fontSize:
        12,

    },


    emptyText: {

      marginTop:
        4,

      maxWidth:
        230,

      color:
        "#A0A3B4",

      fontSize:
        9.5,

      textAlign:
        "center",

      lineHeight:
        15,

    },


    list: {

      marginTop:
        13,

      gap:
        9,

    },


    reportCard: {

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

      justifyContent:
        "space-between",

      alignItems:
        "flex-start",

      gap:
        8,

    },


    left: {

      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      gap:
        9,

      alignItems:
        "center",

    },


    iconBox: {

      width:
        37,

      height:
        37,

      flexShrink:
        0,

      borderRadius:
        11,

      backgroundColor:
        "#F0EDFF",

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    reportInfo: {

      flex:
        1,

      minWidth:
        0,

    },


    reportTitle: {

      color:
        "#454762",

      fontSize:
        10.5,

      lineHeight:
        14,

      fontWeight:
        "700",

    },


    reportId: {

      marginTop:
        3,

      color:
        "#A0A3B4",

      fontSize:
        8,

    },


    scoreBox: {

      minWidth:
        46,

      paddingHorizontal:
        7,

      paddingVertical:
        6,

      borderRadius:
        9,

      alignItems:
        "center",

      backgroundColor:
        "#F3F0FF",

    },


    score: {

      color:
        "#7566EB",

      fontWeight:
        "800",

      fontSize:
        10,

    },


    games: {

      marginTop:
        10,

      color:
        "#8E91A4",

      fontSize:
        9,

      lineHeight:
        14,

    },


    date: {

      marginTop:
        6,

      color:
        "#9295A7",

      fontSize:
        8.5,

    },


    bottom: {

      marginTop:
        10,

      paddingTop:
        9,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      borderTopWidth:
        1,

      borderTopColor:
        "#F1F1F6",

    },


    status: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,

      paddingHorizontal:
        8,

      paddingVertical:
        4,

      borderRadius:
        999,

      backgroundColor:
        "#ECFAF4",

    },


    statusText: {

      color:
        "#3E9E7D",

      fontSize:
        8,

      fontWeight:
        "700",

    },


    view: {

      width:
        37,

      height:
        37,

      borderRadius:
        10,

      backgroundColor:
        "#F7F4FF",

      borderWidth:
        1,

      borderColor:
        "#E5E0FF",

      justifyContent:
        "center",

      alignItems:
        "center",

    },

  });


export default ReportsTable;