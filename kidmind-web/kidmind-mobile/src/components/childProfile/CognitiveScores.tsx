import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCallback,
  useState,
} from "react";

import {
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import {
  BookOpen,
  Brain,
  Database,
  Eye,
  Target,
  Zap,
} from "lucide-react-native";

import Card from "../ui/Card";

import {
  getSessions,
} from "@/api/sessionsApi";

import type {
  Session,
} from "@/api/sessionsApi";


type DomainConfig = {
  key: string;
  title: string;
  gameName: string;
  color: string;
  icon:
    | typeof Brain
    | typeof Eye
    | typeof Database
    | typeof Target
    | typeof BookOpen
    | typeof Zap;
};


type ScoreItem = {
  key: string;
  title: string;
  value: number | null;
  color: string;
  icon: DomainConfig["icon"];
};


const domainConfigs: DomainConfig[] = [
  {
    key: "attention",
    title: "Attention",
    gameName: "focus finder",
    color: "#63B3ED",
    icon: Eye,
  },
  {
    key: "workingMemory",
    title: "Working Memory",
    gameName: "memory match",
    color: "#48BB78",
    icon: Database,
  },
  {
    key: "visualSpatial",
    title: "Visual-Spatial Skills",
    gameName: "puzzle path",
    color: "#F6AD55",
    icon: Target,
  },
  {
    key: "reading",
    title: "Reading Skills",
    gameName: "reading adventure",
    color: "#F56565",
    icon: BookOpen,
  },
  {
    key: "processingSpeed",
    title: "Processing Speed",
    gameName: "quick match",
    color: "#38BDF8",
    icon: Zap,
  },
];


const normalizeGameName = (
  value: unknown
) => {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

};


const getTimestamp = (
  game: Session["games"][number],
  session: Session
) => {

  const value =
    game.ended_at ||
    game.started_at ||
    game.updated_at ||
    game.created_at ||
    session.ended_at ||
    session.started_at ||
    session.created_at;


  if (!value) {
    return 0;
  }


  const timestamp =
    new Date(
      String(value).replace(
        " ",
        "T"
      )
    ).getTime();


  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : 0;

};


const getLatestGameScore = (
  sessions: Session[],
  gameName: string
) => {

  const matches: {
    score: number;
    timestamp: number;
  }[] = [];


  sessions.forEach(
    (session) => {

      if (
        !Array.isArray(
          session.games
        )
      ) {
        return;
      }


      session.games.forEach(
        (game) => {

          const isFinished =
            game.status ===
              "Completed" ||
            game.status ===
              "Failed";


          const score =
            Number(
              game.score
            );


          if (
            !isFinished ||
            normalizeGameName(
              game.game_name
            ) !== gameName ||
            !Number.isFinite(
              score
            )
          ) {
            return;
          }


          matches.push({
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
              getTimestamp(
                game,
                session
              ),
          });

        }
      );

    }
  );


  if (
    matches.length === 0
  ) {
    return null;
  }


  matches.sort(
    (
      first,
      second
    ) =>
      second.timestamp -
      first.timestamp
  );


  return matches[0].score;

};


export default function CognitiveScores() {

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
    scores,
    setScores,
  ] = useState<ScoreItem[]>(
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


  const loadScores =
    useCallback(
      async () => {

        if (
          !Number.isInteger(
            childId
          ) ||
          childId <= 0
        ) {

          setScores([]);
          setLoading(false);

          return;

        }


        try {

          setLoading(true);

          setError("");


          const allSessions =
            await getSessions();


          const childSessions =
            allSessions.filter(
              (session) =>
                Number(
                  session.child_id
                ) ===
                childId
            );


          const domainScores =
            domainConfigs.map(
              (domain) => {

                const value =
                  getLatestGameScore(
                    childSessions,
                    domain.gameName
                  );


                return {
                  ...domain,
                  value,
                };

              }
            );


          const availableValues =
            domainScores
              .map(
                (item) =>
                  item.value
              )
              .filter(
                (
                  value
                ): value is number =>
                  typeof value ===
                    "number" &&
                  Number.isFinite(
                    value
                  )
              );


          const overallScore =
            availableValues.length >
            0
              ? Math.round(
                  availableValues.reduce(
                    (
                      total,
                      value
                    ) =>
                      total +
                      value,
                    0
                  ) /
                    availableValues.length
                )
              : null;


          setScores([
            {
              key:
                "overall",

              title:
                "Overall Score",

              value:
                overallScore,

              color:
                "#7B6EF6",

              icon:
                Brain,
            },

            ...domainScores,
          ]);

        } catch (
          loadError
        ) {

          console.error(
            "Failed to load cognitive scores:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load cognitive scores"
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

        void loadScores();

      },
      [
        loadScores,
      ]
    )
  );


  return (

    <Card>

      <View
        style={
          styles.sectionHeader
        }
      >

        <View
          style={
            styles.headerIcon
          }
        >

          <Brain
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
            Cognitive Assessment
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Latest available score for each cognitive domain
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
            Loading cognitive scores...
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
            Unable to load cognitive scores
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
        !error && (

        <View
          style={
            styles.list
          }
        >

          {scores.map(
            (item) => {

              const Icon =
                item.icon;


              const hasScore =
                typeof item.value ===
                  "number" &&
                Number.isFinite(
                  item.value
                );


              const progressValue =
                hasScore
                  ? Math.max(
                      0,
                      Math.min(
                        100,
                        item.value as number
                      )
                    )
                  : 0;


              return (

                <View
                  key={
                    item.key
                  }
                  style={[
                    styles.item,

                    item.key ===
                      "overall"
                      ? styles.overallItem
                      : null,
                  ]}
                >

                  <View
                    style={
                      styles.itemHeader
                    }
                  >

                    <View
                      style={
                        styles.left
                      }
                    >

                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor:
                              item.color,
                          },
                        ]}
                      >

                        <Icon
                          size={15}
                          color="#FFFFFF"
                        />

                      </View>


                      <View
                        style={
                          styles.textBox
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
                          {item.title}
                        </Text>


                        {!hasScore && (

                          <Text
                            style={
                              styles.noData
                            }
                          >
                            No assessment data yet
                          </Text>

                        )}

                      </View>

                    </View>


                    <Text
                      style={
                        styles.score
                      }
                    >
                      {hasScore
                        ? `${Math.round(
                            item.value as number
                          )}%`
                        : "—"}
                    </Text>

                  </View>


                  <View
                    style={
                      styles.progressBackground
                    }
                  >

                    <View
                      style={[
                        styles.progress,
                        {
                          width:
                            `${progressValue}%`,

                          backgroundColor:
                            item.color,
                        },
                      ]}
                    />

                  </View>

                </View>

              );

            }
          )}

        </View>

      )}

    </Card>

  );

}


const styles =
  StyleSheet.create({

    sectionHeader: {

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

      lineHeight:
        14,

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
        200,

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        9,

    },


    loadingText: {

      color:
        "#A0A3B4",

      fontSize:
        10,

    },


    errorBox: {

      minHeight:
        140,

      marginTop:
        14,

      padding:
        14,

      borderRadius:
        14,

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


    list: {

      marginTop:
        13,

      gap:
        9,

    },


    item: {

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


    overallItem: {

      backgroundColor:
        "#FAF8FF",

      borderColor:
        "#E5E0FF",

    },


    itemHeader: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap:
        10,

    },


    left: {

      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        9,

    },


    iconBox: {

      width:
        35,

      height:
        35,

      flexShrink:
        0,

      borderRadius:
        11,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    textBox: {

      flex:
        1,

      minWidth:
        0,

    },


    name: {

      color:
        "#55586D",

      fontSize:
        10.5,

      fontWeight:
        "700",

    },


    noData: {

      marginTop:
        2,

      color:
        "#A7AABB",

      fontSize:
        8,

    },


    score: {

      color:
        "#454762",

      fontSize:
        12,

      fontWeight:
        "800",

    },


    progressBackground: {

      height:
        6,

      marginTop:
        10,

      overflow:
        "hidden",

      borderRadius:
        999,

      backgroundColor:
        "#EEEFF4",

    },


    progress: {

      height:
        "100%",

      borderRadius:
        999,

    },

  });