import {
  useCallback,
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
  useFocusEffect,
} from "expo-router";

import {
  getChildren,
} from "@/api/childrenApi";

import {
  getSessions,
} from "@/api/sessionsApi";


const gameNames = {
  attention:
    "focus finder",

  workingMemory:
    "memory match",

  visualSpatial:
    "puzzle path",

  reading:
    "reading adventure",

  processingSpeed:
    "quick match",
};


const normalizeGameName = (
  value: unknown
) => {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

};


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


const getGameTimestamp = (
  game: any,
  session: any
) => {

  const date =
    parseDate(
      game?.ended_at
    ) ||
    parseDate(
      game?.started_at
    ) ||
    parseDate(
      game?.updated_at
    ) ||
    parseDate(
      game?.created_at
    ) ||
    parseDate(
      session?.ended_at
    ) ||
    parseDate(
      session?.started_at
    ) ||
    parseDate(
      session?.scheduled_at
    ) ||
    parseDate(
      session?.created_at
    );


  return (
    date?.getTime() ??
    0
  );

};


const getLatestGameScore = (
  sessions: any[],
  gameName: string
) => {

  const matchingGames: {
    score: number;
    timestamp: number;
  }[] = [];


  sessions.forEach(
    session => {

      const games =
        Array.isArray(
          session?.games
        )
          ? session.games
          : [];


      games.forEach(
        (game: any) => {

          const score =
            Number(
              game?.score
            );


          if (
            normalizeGameName(
              game?.game_name
            ) !==
              gameName ||
            (
              game?.status !==
                "Completed" &&
              game?.status !==
                "Failed"
            ) ||
            !Number.isFinite(
              score
            )
          ) {
            return;
          }


          matchingGames.push({
            score:
              Math.max(
                0,
                Math.min(
                  100,
                  Math.round(
                    score
                  )
                )
              ),

            timestamp:
              getGameTimestamp(
                game,
                session
              ),
          });

        }
      );

    }
  );


  if (
    matchingGames.length ===
    0
  ) {
    return null;
  }


  matchingGames.sort(
    (
      first,
      second
    ) =>
      second.timestamp -
      first.timestamp
  );


  return matchingGames[0]
    .score;

};


const getOverallScore = (
  sessions: any[]
) => {

  const domainScores = [
    getLatestGameScore(
      sessions,
      gameNames.attention
    ),

    getLatestGameScore(
      sessions,
      gameNames.workingMemory
    ),

    getLatestGameScore(
      sessions,
      gameNames.visualSpatial
    ),

    getLatestGameScore(
      sessions,
      gameNames.reading
    ),

    getLatestGameScore(
      sessions,
      gameNames.processingSpeed
    ),
  ].filter(
    (
      score
    ): score is number =>
      typeof score ===
      "number"
  );


  if (
    domainScores.length ===
    0
  ) {
    return null;
  }


  const total =
    domainScores.reduce(
      (
        sum,
        score
      ) =>
        sum + score,
      0
    );


  return Math.round(
    total /
      domainScores.length
  );

};


const getChildTimestamp = (
  child: any
) => {

  const date =
    parseDate(
      child?.created_at
    );


  if (date) {
    return date.getTime();
  }


  return (
    Number(
      child?.id
    ) || 0
  );

};


const getChildName = (
  child: any
) => {

  return (
    child?.full_name ||
    child?.name ||
    `Child ${child?.id ?? ""}`
  );

};


const getInitial = (
  child: any
) => {

  return String(
    getChildName(
      child
    ) || "C"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

};


const RecentChildren = () => {

  const [
    children,
    setChildren,
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


  const loadChildren =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError(
            ""
          );


          const [
            childrenData,
            sessionsData,
          ] =
            await Promise.all([
              getChildren(),
              getSessions(),
            ]);


          const allChildren =
            Array.isArray(
              childrenData
            )
              ? childrenData
              : [];


          const allSessions =
            Array.isArray(
              sessionsData
            )
              ? sessionsData
              : [];


          const recentChildren =
            allChildren
              .map(
                child => {

                  const childSessions =
                    allSessions.filter(
                      session =>
                        Number(
                          session.child_id
                        ) ===
                        Number(
                          child.id
                        )
                    );


                  return {
                    ...child,

                    dashboardScore:
                      getOverallScore(
                        childSessions
                      ),
                  };

                }
              )
              .sort(
                (
                  first,
                  second
                ) =>
                  getChildTimestamp(
                    second
                  ) -
                  getChildTimestamp(
                    first
                  )
              )
              .slice(
                0,
                3
              );


          setChildren(
            recentChildren
          );

        } catch (
          loadError
        ) {

          console.error(
            "Failed to load recent children:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load recent children"
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      []
    );


  useFocusEffect(
    useCallback(
      () => {

        loadChildren();

      },
      [
        loadChildren,
      ]
    )
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
            styles.headerCopy
          }
        >

          <Text
            style={
              styles.title
            }
          >
            Recent Children
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Recently added children in your care
          </Text>

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
              "/children"
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
              Loading children...
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
              Unable to load children
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
        children.length ===
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
              No children yet
            </Text>


            <Text
              style={
                styles.stateText
              }
            >
              Registered children will appear here.
            </Text>

          </View>

        )
      }


      {
        !loading &&
        error ===
          "" &&
        children.length >
          0 && (

          <View
            style={
              styles.childrenList
            }
          >

            {
              children.map(
                child => (

                  <TouchableOpacity
                    key={
                      child.id
                    }
                    activeOpacity={
                      0.72
                    }
                    style={
                      styles.childRow
                    }
                    onPress={() => {

                      router.push({
                        pathname:
                          "/children/[id]",

                        params: {
                          id:
                            String(
                              child.id
                            ),
                        },
                      });

                    }}
                  >

                    <View
                      style={
                        styles.childInfo
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
                              child
                            )
                          }
                        </Text>

                      </View>


                      <View
                        style={
                          styles.childText
                        }
                      >

                        <Text
                          style={
                            styles.name
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {
                            getChildName(
                              child
                            )
                          }
                        </Text>


                        <Text
                          style={
                            styles.age
                          }
                        >
                          Age {
                            child.age ??
                            "—"
                          }
                          {"  •  "}
                          ID #{child.id}
                        </Text>

                      </View>

                    </View>


                    <View
                      style={[
                        styles.scoreBox,

                        typeof child.dashboardScore !==
                          "number" &&
                          styles.scoreBoxEmpty,
                      ]}
                    >

                      <Text
                        style={[
                          styles.score,

                          typeof child.dashboardScore !==
                            "number" &&
                            styles.scoreEmpty,
                        ]}
                      >
                        {
                          typeof child.dashboardScore ===
                            "number"
                            ? `${child.dashboardScore}%`
                            : "—"
                        }
                      </Text>

                    </View>

                  </TouchableOpacity>

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
        12,

      marginBottom:
        14,

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


    childrenList: {

      borderTopWidth:
        1,

      borderTopColor:
        "#F1F1F6",

    },


    childRow: {

      minHeight:
        69,

      paddingVertical:
        11,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        12,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#F1F1F6",

    },


    childInfo: {

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


    childText: {

      flex:
        1,

      minWidth:
        0,

    },


    name: {

      color:
        "#373953",

      fontSize:
        12.5,

      fontWeight:
        "700",

    },


    age: {

      marginTop:
        3,

      color:
        "#9DA0B1",

      fontSize:
        10,

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


    scoreBoxEmpty: {

      backgroundColor:
        "#F5F5F8",

    },


    score: {

      color:
        "#7566EB",

      fontSize:
        11,

      fontWeight:
        "800",

    },


    scoreEmpty: {

      color:
        "#A4A6B6",

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


export default RecentChildren;