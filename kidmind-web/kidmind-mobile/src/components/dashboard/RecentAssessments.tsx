import {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  FileText,
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

  const sessionScore =
    Number(
      session?.score
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


  return getFallbackScore(
    session
  );

};


const RecentAssessments = () => {

  const [
    assessments,
    setAssessments,
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

    const loadAssessments =
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


          const recentAssessments =
            allSessions
              .filter(
                (session) =>
                  session.status ===
                  "Completed"
              )
              .map(
                (session) => {

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

        } catch (loadError) {

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

          setLoading(false);

        }

      };


    loadAssessments();

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
            Loading assessments...
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

      )}


      {!loading &&
        error === "" &&
        assessments.length >
          0 && (

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
        >

          <View>

            <View
              style={
                styles.row
              }
            >

              <Text
                style={[
                  styles.headerCell,
                  styles.childHeader,
                ]}
              >
                Child
              </Text>


              <Text
                style={
                  styles.headerCell
                }
              >
                Activity
              </Text>


              <Text
                style={
                  styles.scoreHeader
                }
              >
                Score
              </Text>


              <Text
                style={
                  styles.headerCell
                }
              >
                Date
              </Text>


              <Text
                style={
                  styles.statusHeader
                }
              >
                Status
              </Text>


              <Text
                style={
                  styles.actionHeader
                }
              >
                Action
              </Text>

            </View>


            {assessments.map(
              (item) => (

                <View
                  key={
                    item.id
                  }
                  style={
                    styles.dataRow
                  }
                >

                  <View
                    style={
                      styles.childContainer
                    }
                  >

                    <View
                      style={
                        styles.iconBox
                      }
                    >

                      <FileText
                        size={18}
                        color="#7B6EF6"
                      />

                    </View>


                    <Text
                      style={
                        styles.childName
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {item.dashboardChildName}
                    </Text>

                  </View>


                  <Text
                    style={
                      styles.cell
                    }
                    numberOfLines={
                      2
                    }
                  >
                    {item.dashboardActivity}
                  </Text>


                  <Text
                    style={
                      styles.score
                    }
                  >
                    {typeof item.dashboardScore ===
                    "number"
                      ? `${item.dashboardScore}%`
                      : "—"}
                  </Text>


                  <Text
                    style={
                      styles.cell
                    }
                  >
                    {formatDate(
                      item.dashboardDate
                    )}
                  </Text>


                  <View
                    style={
                      styles.statusCell
                    }
                  >

                    <View
                      style={[
                        styles.status,
                        styles.completed,
                      ]}
                    >

                      <Text
                        style={[
                          styles.statusText,
                          styles.completedText,
                        ]}
                      >
                        Completed
                      </Text>

                    </View>

                  </View>


                  <View
                    style={
                      styles.actionCell
                    }
                  >

                    <TouchableOpacity
                      activeOpacity={
                        0.8
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

                    </TouchableOpacity>

                  </View>

                </View>

              )
            )}

          </View>

        </ScrollView>

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
        4,

    },


    viewAll: {

      color:
        "#7B6EF6",

      fontWeight:
        "600",

      fontSize:
        14,

    },


    row: {

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        1,

      borderColor:
        "#F1F1F1",

      paddingBottom:
        12,

    },


    dataRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        20,

      borderBottomWidth:
        1,

      borderColor:
        "#F1F1F1",

    },


    headerCell: {

      width:
        150,

      color:
        "#94A3B8",

      fontSize:
        14,

      fontWeight:
        "500",

    },


    childHeader: {

      width:
        180,

    },


    scoreHeader: {

      width:
        100,

      color:
        "#94A3B8",

      fontSize:
        14,

      fontWeight:
        "500",

    },


    statusHeader: {

      width:
        120,

      color:
        "#94A3B8",

      fontSize:
        14,

      fontWeight:
        "500",

    },


    actionHeader: {

      width:
        130,

      color:
        "#94A3B8",

      fontSize:
        14,

      fontWeight:
        "500",

    },


    cell: {

      width:
        150,

      color:
        "#475569",

      fontSize:
        13,

      paddingRight:
        12,

    },


    childContainer: {

      width:
        180,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        12,

      paddingRight:
        12,

    },


    iconBox: {

      width:
        40,

      height:
        40,

      borderRadius:
        16,

      backgroundColor:
        "#EEE9FF",

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    childName: {

      fontWeight:
        "600",

      flex:
        1,

      color:
        "#1E293B",

    },


    score: {

      width:
        100,

      fontWeight:
        "700",

      color:
        "#7B6EF6",

    },


    statusCell: {

      width:
        120,

      alignItems:
        "flex-start",

    },


    status: {

      paddingHorizontal:
        12,

      paddingVertical:
        5,

      borderRadius:
        50,

    },


    completed: {

      backgroundColor:
        "#E8FFF5",

    },


    statusText: {

      fontSize:
        12,

      fontWeight:
        "600",

    },


    completedText: {

      color:
        "#38B2AC",

    },


    actionCell: {

      width:
        130,

      alignItems:
        "flex-start",

    },


    reportButton: {

      backgroundColor:
        "#7B6EF6",

      paddingHorizontal:
        16,

      paddingVertical:
        10,

      borderRadius:
        12,

    },


    reportText: {

      color:
        "#FFFFFF",

      fontSize:
        12,

      fontWeight:
        "600",

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

      fontSize:
        13,

      color:
        "#94A3B8",

      textAlign:
        "center",

      marginTop:
        8,

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

      justifyContent:
        "center",

      alignItems:
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


export default RecentAssessments;