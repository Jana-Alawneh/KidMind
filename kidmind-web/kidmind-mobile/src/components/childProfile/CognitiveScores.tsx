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
                ) === childId
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
              key: "overall",
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

        } catch (loadError) {

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

        void loadScores();

      },
      [
        loadScores,
      ]
    )
  );


  return (

    <Card>

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
        !error &&
        scores.map(
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
                style={
                  styles.item
                }
              >

                <View
                  style={
                    styles.header
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
                        size={18}
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

    </Card>

  );

}


const styles =
  StyleSheet.create({

    title: {
      fontSize: 24,

      fontWeight: "700",

      color: "#172554",
    },


    subtitle: {
      color: "#64748B",

      fontSize: 13,

      marginTop: 5,

      marginBottom: 30,
    },


    loadingBox: {
      minHeight: 180,

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


    item: {
      marginBottom: 24,
    },


    header: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap: 12,

      marginBottom: 10,
    },


    left: {
      flex: 1,

      flexDirection: "row",

      alignItems:
        "center",

      gap: 14,
    },


    iconBox: {
      width: 42,

      height: 42,

      borderRadius: 12,

      justifyContent:
        "center",

      alignItems:
        "center",
    },


    textBox: {
      flex: 1,
    },


    name: {
      fontSize: 17,

      fontWeight: "600",

      color: "#1E293B",
    },


    noData: {
      color: "#94A3B8",

      fontSize: 11,

      marginTop: 2,
    },


    score: {
      fontSize: 19,

      fontWeight: "700",

      color: "#0F172A",
    },


    progressBackground: {
      height: 10,

      backgroundColor:
        "#E5E7EB",

      borderRadius: 20,

      overflow: "hidden",
    },


    progress: {
      height: "100%",

      borderRadius: 20,
    },

  });