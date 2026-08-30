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
  ArrowUpRight,
  FileText,
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


const getAssessmentDate = (
  session: any
): Date | null => {

  return (
    parseDate(
      session.ended_at
    ) ||
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


const getTimestamp = (
  date: Date | null
) => {

  return (
    date?.getTime() ??
    0
  );

};


const formatDate = (
  date: Date | null
) => {

  if (!date) {
    return "—";
  }


  const now =
    new Date();


  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );


  const target =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );


  const difference =
    today.getTime() -
    target.getTime();


  const dayDifference =
    Math.round(
      difference /
        86400000
    );


  if (
    dayDifference ===
    0
  ) {
    return "Today";
  }


  if (
    dayDifference ===
    1
  ) {
    return "Yesterday";
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
        now.getFullYear()
          ? "numeric"
          : undefined,
    }
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


const getFallbackScore = (
  session: any
) => {

  const games =
    Array.isArray(
      session.games
    )
      ? session.games
      : [];


  const scores =
    games
      .filter(
        (game: any) =>
          game?.status ===
            "Completed" ||
          game?.status ===
            "Failed"
      )
      .map(
        (game: any) =>
          Number(
            game?.score
          )
      )
      .filter(
        (score: number) =>
          Number.isFinite(
            score
          )
      );


  if (
    scores.length ===
    0
  ) {
    return null;
  }


  const average =
    scores.reduce(
      (
        total: number,
        score: number
      ) =>
        total +
        score,
      0
    ) /
    scores.length;


  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        average
      )
    )
  );

};


const getSessionScore = (
  session: any
) => {

  if (
    session?.score !==
      null &&
    session?.score !==
      undefined &&
    session?.score !==
      ""
  ) {

    const sessionScore =
      Number(
        session.score
      );


    if (
      Number.isFinite(
        sessionScore
      )
    ) {

      return Math.max(
        0,
        Math.min(
          100,
          Math.round(
            sessionScore
          )
        )
      );

    }

  }


  return getFallbackScore(
    session
  );

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


const RecentAssessments = () => {

  const [
    assessments,
    setAssessments,
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

      const loadAssessments =
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


            const recentAssessments =
              allSessions
                .filter(
                  session =>
                    session.status ===
                    "Completed"
                )
                .map(
                  session => {

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


                    const assessmentDate =
                      getAssessmentDate(
                        session
                      );


                    return {
                      ...session,

                      dashboardDate:
                        assessmentDate,

                      dashboardChildName:
                        session.child_name ||
                        child?.full_name ||
                        `Child #${session.child_id}`,

                      dashboardActivity:
                        getActivityText(
                          session
                        ),

                      dashboardScore:
                        getSessionScore(
                          session
                        ),
                    };

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


            setAssessments(
              recentAssessments
            );

          } catch (
            loadError
          ) {

            console.error(
              "Failed to load recent assessments:",
              loadError
            );


            setError(
              loadError instanceof Error
                ? loadError.message
                : "Failed to load recent assessments"
            );

          } finally {

            setLoading(
              false
            );

          }

        };


      loadAssessments();

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

            <FileText
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
              Recent Assessments
            </Text>


            <Text
              style={
                styles.subtitle
              }
            >
              Latest cognitive evaluation results
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
              Loading assessments...
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
              Unable to load assessments
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
        assessments.length ===
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
              No completed assessments
            </Text>


            <Text
              style={
                styles.stateText
              }
            >
              Completed assessment sessions will appear here.
            </Text>

          </View>

        )
      }


      {
        !loading &&
        error ===
          "" &&
        assessments.length >
          0 && (

          <View
            style={
              styles.list
            }
          >

            {
              assessments.map(
                item => (

                  <View
                    key={
                      item.id
                    }
                    style={
                      styles.assessmentRow
                    }
                  >

                    <View
                      style={
                        styles.topRow
                      }
                    >

                      <View
                        style={
                          styles.childMain
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
                            styles.childCopy
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
                            {
                              item.dashboardChildName
                            }
                          </Text>


                          <Text
                            style={
                              styles.sessionId
                            }
                          >
                            Session #{item.id}
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
                          {
                            typeof item.dashboardScore ===
                              "number"
                              ? `${item.dashboardScore}%`
                              : "—"
                          }
                        </Text>

                      </View>

                    </View>


                    <View
                      style={
                        styles.detailsRow
                      }
                    >

                      <View
                        style={
                          styles.detailBlock
                        }
                      >

                        <Text
                          style={
                            styles.detailLabel
                          }
                        >
                          Activity
                        </Text>


                        <Text
                          style={
                            styles.detailValue
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {
                            item.dashboardActivity
                          }
                        </Text>

                      </View>


                      <View
                        style={
                          styles.dateBlock
                        }
                      >

                        <Text
                          style={
                            styles.detailLabel
                          }
                        >
                          Date
                        </Text>


                        <Text
                          style={
                            styles.detailValue
                          }
                        >
                          {
                            formatDate(
                              item.dashboardDate
                            )
                          }
                        </Text>

                      </View>

                    </View>


                    <View
                      style={
                        styles.footerRow
                      }
                    >

                      <View
                        style={
                          styles.status
                        }
                      >

                        <Text
                          style={
                            styles.statusText
                          }
                        >
                          Completed
                        </Text>

                      </View>


                      <TouchableOpacity
                        activeOpacity={
                          0.75
                        }
                        style={
                          styles.reportButton
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

                        <Text
                          style={
                            styles.reportText
                          }
                        >
                          View Report
                        </Text>


                        <ArrowUpRight
                          size={13}
                          color="#7566EB"
                        />

                      </TouchableOpacity>

                    </View>

                  </View>

                )
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


    list: {

      gap:
        10,

    },


    assessmentRow: {

      padding:
        13,

      borderRadius:
        15,

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
        "center",

      justifyContent:
        "space-between",

      gap:
        12,

    },


    childMain: {

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


    avatar: {

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


    childCopy: {

      flex:
        1,

      minWidth:
        0,

    },


    childName: {

      color:
        "#373953",

      fontSize:
        12,

      fontWeight:
        "700",

    },


    sessionId: {

      marginTop:
        2,

      color:
        "#A0A3B4",

      fontSize:
        9,

    },


    scoreBox: {

      minWidth:
        51,

      paddingHorizontal:
        9,

      paddingVertical:
        7,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,

      backgroundColor:
        "#F3F0FF",

    },


    score: {

      color:
        "#7566EB",

      fontSize:
        11,

      fontWeight:
        "800",

    },


    detailsRow: {

      marginTop:
        12,

      paddingTop:
        11,

      flexDirection:
        "row",

      gap:
        12,

      borderTopWidth:
        1,

      borderTopColor:
        "#F1F1F6",

    },


    detailBlock: {

      flex:
        1,

      minWidth:
        0,

    },


    dateBlock: {

      minWidth:
        80,

    },


    detailLabel: {

      color:
        "#AAADBC",

      fontSize:
        8.5,

      fontWeight:
        "600",

      textTransform:
        "uppercase",

      letterSpacing:
        0.4,

    },


    detailValue: {

      marginTop:
        3,

      color:
        "#66697E",

      fontSize:
        10.5,

      fontWeight:
        "500",

    },


    footerRow: {

      marginTop:
        12,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        10,

    },


    status: {

      paddingHorizontal:
        9,

      paddingVertical:
        5,

      borderRadius:
        999,

      backgroundColor:
        "#ECFAF4",

    },


    statusText: {

      color:
        "#3E9E7D",

      fontSize:
        9,

      fontWeight:
        "700",

    },


    reportButton: {

      minHeight:
        32,

      paddingHorizontal:
        10,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        5,

      borderRadius:
        10,

      backgroundColor:
        "#F6F3FF",

      borderWidth:
        1,

      borderColor:
        "#E1DCFF",

    },


    reportText: {

      color:
        "#7566EB",

      fontSize:
        9.5,

      fontWeight:
        "700",

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


export default RecentAssessments;