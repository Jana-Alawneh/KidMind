import {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
} from "expo-router";

import Card from "./Card";

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
    (session) => {

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


const RecentChildren = () => {

  const [
    children,
    setChildren,
  ] = useState<any[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


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
                (child) => {

                  const childSessions =
                    allSessions.filter(
                      (session) =>
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

        } catch (loadError) {

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

    <Card>

      <View
        style={
          styles.header
        }
      >

        <Text
          style={
            styles.title
          }
        >
          Recent Children
        </Text>


        <TouchableOpacity
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
            Loading children...
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

      )}


      {!loading &&
        error === "" &&
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

      )}


      {!loading &&
        error === "" &&
        children.length >
          0 && (

        <View>

          {children.map(
            (child) => (

              <TouchableOpacity
                key={
                  child.id
                }
                activeOpacity={
                  0.75
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

                  <Image
                    source={{
                      uri:
                        `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(
                          child.full_name ||
                          `Child ${child.id}`
                        )}`,
                    }}
                    style={
                      styles.avatar
                    }
                  />


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
                      {child.full_name}
                    </Text>


                    <Text
                      style={
                        styles.age
                      }
                    >
                      Age {child.age}
                      {" · "}
                      ID #{child.id}
                    </Text>

                  </View>

                </View>


                <Text
                  style={
                    styles.score
                  }
                >
                  {typeof child.dashboardScore ===
                  "number"
                    ? `${child.dashboardScore}%`
                    : "—"}
                </Text>

              </TouchableOpacity>

            )
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

    },


    title: {

      fontSize:
        20,

      fontWeight:
        "600",

      color:
        "#111827",

    },


    viewAll: {

      color:
        "#7B6EF6",

      fontWeight:
        "600",

    },


    childRow: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom:
        20,

      paddingVertical:
        4,

      gap:
        12,

    },


    childInfo: {

      flex:
        1,

      flexDirection:
        "row",

      alignItems:
        "center",

    },


    avatar: {

      width:
        48,

      height:
        48,

      borderRadius:
        16,

      backgroundColor:
        "#F3F4FF",

      marginRight:
        16,

    },


    childText: {

      flex:
        1,

    },


    name: {

      fontWeight:
        "600",

      fontSize:
        16,

      color:
        "#111827",

    },


    age: {

      fontSize:
        14,

      color:
        "#64748B",

      marginTop:
        3,

    },


    score: {

      color:
        "#7B6EF6",

      fontWeight:
        "700",

      fontSize:
        16,

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

      borderRadius:
        16,

      backgroundColor:
        "#FEF2F2",

      padding:
        18,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    errorTitle: {

      color:
        "#B91C1C",

      fontWeight:
        "700",

      fontSize:
        15,

    },


    errorText: {

      color:
        "#DC2626",

      fontSize:
        13,

      marginTop:
        5,

      textAlign:
        "center",

    },

  });


export default RecentChildren;