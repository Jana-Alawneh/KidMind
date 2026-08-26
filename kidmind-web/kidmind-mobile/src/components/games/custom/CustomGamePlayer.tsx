import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Clock3,
  Target,
} from "lucide-react-native";

import {
  getGameBuilderGame,
} from "@/api/gameBuilderApi";

import type {
  GameBuilderGame,
} from "@/api/gameBuilderApi";


type CustomObject = {
  id: string;
  type?: string;
  elementId?: string;
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  text?: string;
  shape?: string | null;
  visible?: boolean;
  rotation?: number;
};


type CustomRule = {
  id?: string;
  trigger?: string;
  triggerTargetId?: string;
  action?: string;
  targetIds?: string[];
  value?: number;
  wait?: number;
  moveX?: number;
  moveY?: number;
  enabled?: boolean;
};


type Trial = {
  objectId: string;
  result:
    | "correct"
    | "incorrect"
    | "neutral";
  scoreDelta: number;
  reactionTimeMs: number;
};


type GameResult = {
  status:
    | "Completed"
    | "Failed";
  duration_seconds: number;
  score: number;
  accuracy: number | null;
  mistakes: number | null;
  reaction_time: number | null;
  result_data:
    | Record<string, unknown>
    | null;
};


type Props = {
  customGameId: number;
  paused?: boolean;
  onComplete:
    (
      result: GameResult
    ) => void | Promise<void>;
};


const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 650;


const clampScore = (
  value: number
) => {

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        Number(value) || 0
      )
    )
  );

};


const wait = (
  milliseconds: number
) => {

  return new Promise<void>(
    (resolve) => {

      setTimeout(
        resolve,
        Math.max(
          0,
          milliseconds
        )
      );

    }
  );

};


export default function CustomGamePlayer({
  customGameId,
  paused = false,
  onComplete,
}: Props) {

  const [
    game,
    setGame,
  ] =
    useState<GameBuilderGame | null>(
      null
    );


  const [
    objects,
    setObjects,
  ] =
    useState<CustomObject[]>(
      []
    );


  const [
    rules,
    setRules,
  ] =
    useState<CustomRule[]>(
      []
    );


  const [
    score,
    setScore,
  ] =
    useState(0);


  const [
    timeLeft,
    setTimeLeft,
  ] =
    useState(0);


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


  const [
    runningRules,
    setRunningRules,
  ] =
    useState(false);


  const [
    canvasWidth,
    setCanvasWidth,
  ] =
    useState(0);


  const [
    finishing,
    setFinishing,
  ] =
    useState(false);


  const [
    finished,
    setFinished,
  ] =
    useState(false);


  const objectsRef =
    useRef<CustomObject[]>(
      []
    );


  const scoreRef =
    useRef(0);


  const timeLeftRef =
    useRef(0);


  const totalTimeRef =
    useRef(60);


  const elapsedRef =
    useRef(0);


  const trialsRef =
    useRef<Trial[]>(
      []
    );


  const trialStartRef =
    useRef(
      Date.now()
    );


  const finishedRef =
    useRef(false);


  const timerEndingRef =
    useRef(false);


  const scoreEnabledRef =
    useRef(true);


  const setRuntimeObjects = (
    nextObjects: CustomObject[]
  ) => {

    objectsRef.current =
      nextObjects;

    setObjects(
      nextObjects
    );

  };


  const updateScore = (
    nextScore: number
  ) => {

    const normalized =
      clampScore(
        nextScore
      );

    scoreRef.current =
      normalized;

    setScore(
      normalized
    );

  };


  const applyRule =
    async (
      rule: CustomRule
    ): Promise<number> => {

      if (
        rule.enabled === false
      ) {
        return 0;
      }


      const action =
        rule.action ||
        "";


      const value =
  Number(
    rule.value
  ) || 10;


      const targetIds =
        Array.isArray(
          rule.targetIds
        )
          ? rule.targetIds
          : [];


      const waitSeconds =
        Math.max(
          0,
          Number(
            rule.wait
          ) || 0
        );


      if (
        waitSeconds > 0
      ) {

        await wait(
          waitSeconds *
            1000
        );

      }


      if (
        action ===
        "add-score"
      ) {

        if (
          !scoreEnabledRef.current
        ) {
          return 0;
        }


        const before =
          scoreRef.current;


        updateScore(
          before +
            value
        );


        return (
          scoreRef.current -
          before
        );

      }


      if (
        action ===
        "remove-score"
      ) {

        if (
          !scoreEnabledRef.current
        ) {
          return 0;
        }


        const before =
          scoreRef.current;


        updateScore(
          before -
            Math.abs(
              value
            )
        );


        return (
          scoreRef.current -
          before
        );

      }


      if (
        action ===
        "hide"
      ) {

        const nextObjects =
          objectsRef.current.map(
            (object) =>
              targetIds.includes(
                object.id
              )
                ? {
                    ...object,
                    visible:
                      false,
                  }
                : object
          );


        setRuntimeObjects(
          nextObjects
        );


        return 0;

      }


      if (
        action ===
        "show"
      ) {

        const nextObjects =
          objectsRef.current.map(
            (object) =>
              targetIds.includes(
                object.id
              )
                ? {
                    ...object,
                    visible:
                      true,
                  }
                : object
          );


        setRuntimeObjects(
          nextObjects
        );


        return 0;

      }


      if (
        action ===
        "move"
      ) {

        const moveX =
          Number(
            rule.moveX
          ) || 0;


        const moveY =
          Number(
            rule.moveY
          ) || 0;


        const nextObjects =
          objectsRef.current.map(
            (object) =>
              targetIds.includes(
                object.id
              )
                ? {
                    ...object,

                    x:
                      Number(
                        object.x
                      ) +
                      moveX,

                    y:
                      Number(
                        object.y
                      ) +
                      moveY,
                  }
                : object
          );


        setRuntimeObjects(
          nextObjects
        );


        return 0;

      }


      return 0;

    };


  const runRules =
    async (
      selectedRules:
        CustomRule[]
    ) => {

      let totalDelta =
        0;


      for (
        const rule of
          selectedRules
      ) {

        const delta =
          await applyRule(
            rule
          );


        totalDelta +=
          delta;

      }


      return totalDelta;

    };


  const finishGame =
    async () => {

      if (
        finishedRef.current
      ) {
        return;
      }


      finishedRef.current =
        true;

      setFinishing(
        true
      );


      const trials =
        trialsRef.current;


      const positiveTrials =
        trials.filter(
          (trial) =>
            trial.result ===
            "correct"
        );


      const negativeTrials =
        trials.filter(
          (trial) =>
            trial.result ===
            "incorrect"
        );


      const scoredTrials =
        positiveTrials.length +
        negativeTrials.length;


      const accuracy =
        scoredTrials > 0
          ? Math.round(
              (
                positiveTrials.length /
                scoredTrials
              ) *
                100
            )
          : null;


      const averageReactionTime =
        trials.length > 0
          ? trials.reduce(
              (
                total,
                trial
              ) =>
                total +
                trial.reactionTimeMs,
              0
            ) /
            trials.length /
            1000
          : null;


      const result:
        GameResult = {

        status:
          "Completed",

        duration_seconds:
          Math.max(
            0,
            elapsedRef.current
          ),

        score:
          clampScore(
            scoreRef.current
          ),

        accuracy,

        mistakes:
          negativeTrials.length,

        reaction_time:
          averageReactionTime ===
          null
            ? null
            : Number(
                averageReactionTime.toFixed(
                  2
                )
              ),

        result_data: {
          custom_game_id:
            customGameId,

          game_title:
            game?.title ||
            "Custom Game",

          trials,

          final_time_left:
            timeLeftRef.current,

          configured_time:
            totalTimeRef.current,

          score:
            clampScore(
              scoreRef.current
            ),

          accuracy,

          mistakes:
            negativeTrials.length,

          reaction_time:
            averageReactionTime ===
            null
              ? null
              : Number(
                  averageReactionTime.toFixed(
                    2
                  )
                ),

          duration_seconds:
            Math.max(
              0,
              elapsedRef.current
            ),
        },

      };


      try {

        await onComplete(
          result
        );

        setFinished(
          true
        );

      } catch (
        completeError
      ) {

        console.error(
          "Failed to complete custom game:",
          completeError
        );

        finishedRef.current =
          false;

      } finally {

        setFinishing(
          false
        );

      }

    };


  const handleTimerEnd =
    async () => {

      if (
        timerEndingRef.current ||
        finishedRef.current
      ) {
        return;
      }


      timerEndingRef.current =
        true;


      const timerRules =
        rules.filter(
          (rule) =>
            rule.enabled !==
              false &&
            rule.trigger ===
              "timer-end"
        );


      try {

        if (
          timerRules.length >
          0
        ) {

          setRunningRules(
            true
          );


          await runRules(
            timerRules
          );

        }


        await finishGame();

      } finally {

        setRunningRules(
          false
        );

      }

    };


  useEffect(
    () => {

      let active =
        true;


      const loadGame =
        async () => {

          try {

            setLoading(
              true
            );

            setError(
              ""
            );

            setFinishing(
              false
            );

            setFinished(
              false
            );


            finishedRef.current =
              false;

            timerEndingRef.current =
              false;

            trialsRef.current =
              [];

            elapsedRef.current =
              0;

            scoreRef.current =
              0;

            setScore(
              0
            );


            const loaded =
              await getGameBuilderGame(
                customGameId
              );


            if (
              !active
            ) {
              return;
            }


            const loadedObjects =
              Array.isArray(
                loaded.objects
              )
                ? (
                    loaded.objects as
                      CustomObject[]
                  ).map(
                    (object) => ({
                      ...object,

                      visible:
                        object.visible !==
                        false,
                    })
                  )
                : [];


            const loadedRules =
              Array.isArray(
                loaded.rules
              )
                ? loaded.rules as
                    CustomRule[]
                : [];


            const configuredTime =
              Math.max(
                1,
                Number(
                  (
                    loaded as any
                  ).time_seconds
                ) || 60
              );


            const scoreSetting =
              (
                loaded as any
              ).score_enabled;


            scoreEnabledRef.current =
              scoreSetting ===
                undefined ||
              scoreSetting ===
                null
                ? true
                : Boolean(
                    Number(
                      scoreSetting
                    )
                  ) ||
                  scoreSetting ===
                    true;


            setGame(
              loaded
            );


            setRuntimeObjects(
              loadedObjects
            );


            setRules(
              loadedRules
            );


            totalTimeRef.current =
              configuredTime;


            timeLeftRef.current =
              configuredTime;


            setTimeLeft(
              configuredTime
            );


            trialStartRef.current =
              Date.now();


            const startRules =
              loadedRules.filter(
                (rule) =>
                  rule.enabled !==
                    false &&
                  rule.trigger ===
                    "game-start"
              );


            if (
              startRules.length >
              0
            ) {

              setRunningRules(
                true
              );


              await runRules(
                startRules
              );


              if (
                active
              ) {

                setRunningRules(
                  false
                );

              }

            }

          } catch (
            loadError
          ) {

            console.error(
              "Failed to load custom game:",
              loadError
            );


            if (
              active
            ) {

              setError(
                loadError instanceof
                  Error
                  ? loadError.message
                  : "Could not load this custom game"
              );

            }

          } finally {

            if (
              active
            ) {

              setLoading(
                false
              );

            }

          }

        };


      loadGame();


      return () => {

        active =
          false;

      };

    },
    [
      customGameId,
    ]
  );


  useEffect(
    () => {

      if (
        !game ||
        paused ||
        finished ||
        finishedRef.current
      ) {
        return;
      }


      const timer =
        setInterval(
          () => {

            elapsedRef.current +=
              1;


            const nextTime =
              Math.max(
                0,
                timeLeftRef.current -
                  1
              );


            timeLeftRef.current =
              nextTime;


            setTimeLeft(
              nextTime
            );


            if (
              nextTime <= 0
            ) {

              clearInterval(
                timer
              );


              void handleTimerEnd();

            }

          },
          1000
        );


      return () => {

        clearInterval(
          timer
        );

      };

    },
    [
      game,
      paused,
      rules,
      finished,
    ]
  );


  const handleObjectPress =
  async (
    object: CustomObject
  ) => {

    if (
      paused ||
      runningRules ||
      finishing ||
      finished ||
      finishedRef.current ||
      object.visible === false
    ) {
      return;
    }


    const matchingRules =
      rules.filter(
        (rule) => {

          if (
            rule.enabled === false
          ) {
            return false;
          }


          if (
            rule.trigger !==
            "object-clicked"
          ) {
            return false;
          }


          if (
            !rule.triggerTargetId
          ) {
            return true;
          }


          return (
            rule.triggerTargetId ===
            object.id
          );

        }
      );


    const now =
      Date.now();


    const reactionTimeMs =
      Math.max(
        0,
        now -
          trialStartRef.current
      );


    trialStartRef.current =
      now;


    setRunningRules(
      true
    );


    try {

      const scoreDelta =
        await runRules(
          matchingRules
        );


      const result:
        Trial["result"] =
          scoreDelta > 0
            ? "correct"
            : scoreDelta < 0
              ? "incorrect"
              : "neutral";


      trialsRef.current = [
        ...trialsRef.current,
        {
          objectId:
            object.id,

          result,

          scoreDelta,

          reactionTimeMs,
        },
      ];

    } finally {

      setRunningRules(
        false
      );

    }

  };


  if (
    loading
  ) {

    return (
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
          Loading custom game...
        </Text>

      </View>
    );

  }


  if (
    error ||
    !game
  ) {

    return (
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
          Unable to load game
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          {error ||
            "Custom game not found"}
        </Text>

      </View>
    );

  }


  const scale =
    canvasWidth > 0
      ? canvasWidth /
        CANVAS_WIDTH
      : 0;


  const canvasHeight =
    canvasWidth > 0
      ? canvasWidth *
        (
          CANVAS_HEIGHT /
          CANVAS_WIDTH
        )
      : 260;


  return (
    <View
      style={
        styles.container
      }
    >

      <View
        style={
          styles.header
        }
      >

        <View
          style={
            styles.titleBox
          }
        >

          <Text
            style={
              styles.title
            }
            numberOfLines={2}
          >
            {game.title}
          </Text>

          <Text
            style={
              styles.difficulty
            }
          >
            {game.difficulty ||
              "Easy"}
          </Text>

        </View>


        <View
          style={
            styles.metrics
          }
        >

          <View
            style={
              styles.metricCard
            }
          >

            <Target
              size={16}
              color="#7B6EF6"
            />

            <Text
              style={
                styles.metricLabel
              }
            >
              Score
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {score}
            </Text>

          </View>


          <View
            style={
              styles.metricCard
            }
          >

            <Clock3
              size={16}
              color="#3B82F6"
            />

            <Text
              style={
                styles.metricLabel
              }
            >
              Time
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {timeLeft}s
            </Text>

          </View>

        </View>

      </View>


      {paused && (
        <View
          style={
            styles.pausedBox
          }
        >

          <Text
            style={
              styles.pausedText
            }
          >
            Game Paused
          </Text>

        </View>
      )}


      <View
        style={[
          styles.canvas,
          {
            height:
              canvasHeight,
          },
        ]}
        onLayout={(
          event
        ) => {

          setCanvasWidth(
            event.nativeEvent
              .layout.width
          );

        }}
      >

        {scale > 0 &&
          objects.map(
            (object) => {

              if (
                object.visible ===
                false
              ) {
                return null;
              }


              const objectWidth =
                Math.max(
                  34,
                  (
                    Number(
                      object.width
                    ) || 120
                  ) *
                    scale
                );


              const objectHeight =
                Math.max(
                  34,
                  (
                    Number(
                      object.height
                    ) || 70
                  ) *
                    scale
                );


              const left =
                (
                  Number(
                    object.x
                  ) || 0
                ) *
                scale;


              const top =
                (
                  Number(
                    object.y
                  ) || 0
                ) *
                scale;


              const isCircle =
                object.shape ===
                  "circle" ||
                object.elementId ===
                  "circle";


              const isButton =
                object.type ===
                  "button" ||
                object.elementId ===
                  "button";


              const isText =
                object.type ===
                  "text" ||
                object.elementId ===
                  "text";


              return (
                <TouchableOpacity
                  key={
                    object.id
                  }
                  activeOpacity={
                    0.75
                  }
                  disabled={
                    paused ||
                    runningRules ||
                    finishing ||
                    finished
                  }
                  onPress={() => {

                    void handleObjectPress(
                      object
                    );

                  }}
                  style={[
                    styles.object,
                    {
                      left,
                      top,

                      width:
                        objectWidth,

                      height:
                        objectHeight,

                      backgroundColor:
                        isText
                          ? "transparent"
                          : object.color ||
                            "#7B6EF6",

                      borderRadius:
                        isCircle
                          ? Math.min(
                              objectWidth,
                              objectHeight
                            ) /
                            2
                          : isButton
                            ? 14
                            : 8,

                      transform: [
                        {
                          rotate:
                            `${
                              Number(
                                object.rotation
                              ) || 0
                            }deg`,
                        },
                      ],
                    },
                  ]}
                >

                  <Text
                    style={[
                      styles.objectText,

                      isText && {
                        color:
                          object.color ||
                          "#334155",
                      },
                    ]}
                    numberOfLines={3}
                  >
                    {object.text ||
                      object.name ||
                      ""}
                  </Text>

                </TouchableOpacity>
              );

            }
          )}

      </View>


      <TouchableOpacity
        style={[
          styles.finishButton,

          (
            paused ||
            runningRules ||
            finishing ||
            finished
          ) &&
            styles.finishButtonDisabled,
        ]}
        activeOpacity={0.85}
        disabled={
          paused ||
          runningRules ||
          finishing ||
          finished
        }
        onPress={() => {

          void finishGame();

        }}
      >

        {finishing ? (

          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />

        ) : (

          <Text
            style={
              styles.finishButtonText
            }
          >
            {finished
              ? "Game Finished"
              : "Finish Game"}
          </Text>

        )}

      </TouchableOpacity>

    </View>
  );

}


const styles =
  StyleSheet.create({

    container: {
      width: "100%",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 22,
      padding: 14,
      overflow: "hidden",
    },


    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 13,
    },


    titleBox: {
      flex: 1,
    },


    title: {
      color: "#172554",
      fontSize: 19,
      fontWeight: "800",
    },


    difficulty: {
      color: "#7B6EF6",
      marginTop: 3,
      fontSize: 12,
      fontWeight: "700",
    },


    metrics: {
      flexDirection: "row",
      gap: 7,
    },


    metricCard: {
      minWidth: 58,
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderRadius: 12,
      backgroundColor:
        "#F7F5FF",
      alignItems: "center",
    },


    metricLabel: {
      color: "#94A3B8",
      fontSize: 9,
      marginTop: 2,
    },


    metricValue: {
      color: "#172554",
      fontSize: 14,
      fontWeight: "800",
      marginTop: 1,
    },


    canvas: {
      width: "100%",
      position: "relative",
      overflow: "hidden",
      backgroundColor:
        "#F8FAFC",
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        "#E5E1FF",
    },


    object: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      padding: 4,
    },


    objectText: {
      color: "#FFFFFF",
      fontWeight: "800",
      textAlign: "center",
      fontSize: 12,
    },


    pausedBox: {
      marginBottom: 10,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor:
        "#FEF3C7",
      alignItems: "center",
    },


    pausedText: {
      color: "#B45309",
      fontWeight: "800",
    },


    finishButton: {
      marginTop: 14,
      minHeight: 50,
      borderRadius: 15,
      backgroundColor:
        "#7B6EF6",
      alignItems: "center",
      justifyContent: "center",
    },


    finishButtonDisabled: {
      opacity: 0.5,
    },


    finishButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },


    loadingBox: {
      minHeight: 300,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 22,
    },


    loadingText: {
      color: "#64748B",
    },


    errorBox: {
      minHeight: 220,
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#FEF2F2",
      borderRadius: 22,
    },


    errorTitle: {
      color: "#B91C1C",
      fontSize: 18,
      fontWeight: "800",
    },


    errorText: {
      color: "#B91C1C",
      marginTop: 7,
      textAlign: "center",
    },

  });