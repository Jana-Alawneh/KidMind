import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Crosshair,
  Play,
  RotateCcw,
  Target,
  Timer,
  Trophy,
} from "lucide-react-native";


type GameStatus =
  | "Completed"
  | "Failed";


type GameResult = {
  status: GameStatus;

  duration_seconds: number;

  score: number;

  accuracy: number | null;

  mistakes: number | null;

  reaction_time: number | null;

  result_data:
    | Record<string, unknown>
    | null;
};


type FocusFinderProps = {
  embedded?: boolean;

  paused?: boolean;

  difficulty?: string;

  onComplete?: (
    result: GameResult
  ) => void;
};


type TargetPosition = {
  left: number;

  top: number;
};


const LEVELS = {
  1: {
    name: "Easy",
    totalTargets: 20,
    duration: 60,
    targetSize: 82,
    targetLife: 2,
  },

  2: {
    name: "Medium",
    totalTargets: 30,
    duration: 45,
    targetSize: 66,
    targetLife: 1.5,
  },

  3: {
    name: "Hard",
    totalTargets: 40,
    duration: 30,
    targetSize: 52,
    targetLife: 1,
  },
};


const resolveLevelId = (
  difficulty: string
) => {

  const value =
    String(
      difficulty || ""
    ).toLowerCase();


  if (
    value.includes("3") ||
    value.includes("hard")
  ) {
    return 3;
  }


  if (
    value.includes("2") ||
    value.includes("medium")
  ) {
    return 2;
  }


  return 1;

};


const roundOneDecimal = (
  value: number
) => {

  return Number(
    value.toFixed(1)
  );

};


export default function FocusFinder({
  embedded = true,
  paused = false,
  difficulty = "Level 1",
  onComplete,
}: FocusFinderProps) {

  const levelId =
    resolveLevelId(
      difficulty
    );


  const config =
    useMemo(
      () =>
        LEVELS[
          levelId as keyof typeof LEVELS
        ],
      [
        levelId,
      ]
    );


  const [
    level,
    setLevel,
  ] = useState(
    levelId
  );


  const [
    started,
    setStarted,
  ] = useState(false);


  const [
    finished,
    setFinished,
  ] = useState(false);


  const [
    countdown,
    setCountdown,
  ] = useState(3);


  const [
    gameTime,
    setGameTime,
  ] = useState(0);


  const [
    targetTime,
    setTargetTime,
  ] = useState(0);


  const [
    correct,
    setCorrect,
  ] = useState(0);


  const [
    wrong,
    setWrong,
  ] = useState(0);


  const [
    missed,
    setMissed,
  ] = useState(0);


  const [
    reactionTimes,
    setReactionTimes,
  ] = useState<number[]>(
    []
  );


  const [
    targetPosition,
    setTargetPosition,
  ] = useState<TargetPosition>({
    left: 20,
    top: 20,
  });


  const [
    arenaWidth,
    setArenaWidth,
  ] = useState(0);


  const [
    arenaHeight,
    setArenaHeight,
  ] = useState(0);


  const [
    finalResult,
    setFinalResult,
  ] = useState<GameResult | null>(
    null
  );


  const correctRef =
    useRef(0);


  const wrongRef =
    useRef(0);


  const missedRef =
    useRef(0);


  const reactionTimesRef =
    useRef<number[]>(
      []
    );


  const gameTimeRef =
    useRef(0);


  const targetTimeRef =
    useRef(0);


  const completionSentRef =
    useRef(false);


  const initializedRef =
    useRef(false);


  const createTarget =
    useCallback(() => {

      const horizontalPadding =
        12;


      const verticalPadding =
        12;


      const maxLeft =
        Math.max(
          horizontalPadding,
          arenaWidth -
            config.targetSize -
            horizontalPadding
        );


      const maxTop =
        Math.max(
          verticalPadding,
          arenaHeight -
            config.targetSize -
            verticalPadding
        );


      const left =
        arenaWidth > 0
          ? horizontalPadding +
            Math.random() *
              Math.max(
                1,
                maxLeft -
                  horizontalPadding
              )
          : 20;


      const top =
        arenaHeight > 0
          ? verticalPadding +
            Math.random() *
              Math.max(
                1,
                maxTop -
                  verticalPadding
              )
          : 20;


      setTargetPosition({
        left,
        top,
      });


      targetTimeRef.current =
        0;


      setTargetTime(
        0
      );

    }, [
      arenaWidth,
      arenaHeight,
      config.targetSize,
    ]);


  const prepareGame =
    useCallback(() => {

      setStarted(
        true
      );


      setFinished(
        false
      );


      setCountdown(
        3
      );


      setGameTime(
        0
      );


      setTargetTime(
        0
      );


      setCorrect(
        0
      );


      setWrong(
        0
      );


      setMissed(
        0
      );


      setReactionTimes(
        []
      );


      setFinalResult(
        null
      );


      correctRef.current =
        0;


      wrongRef.current =
        0;


      missedRef.current =
        0;


      reactionTimesRef.current =
        [];


      gameTimeRef.current =
        0;


      targetTimeRef.current =
        0;


      completionSentRef.current =
        false;

    }, []);


  const startGame =
    useCallback(() => {

      prepareGame();

    }, [
      prepareGame,
    ]);


  useEffect(() => {

    if (
      !embedded ||
      initializedRef.current
    ) {
      return;
    }


    initializedRef.current =
      true;


    startGame();

  }, [
    embedded,
    startGame,
  ]);


  useEffect(() => {

    if (
      !started ||
      finished ||
      paused ||
      countdown <= 0
    ) {
      return;
    }


    const timer =
      setTimeout(
        () => {

          setCountdown(
            (
              currentCountdown
            ) =>
              Math.max(
                0,
                currentCountdown -
                  1
              )
          );

        },
        1000
      );


    return () => {

      clearTimeout(
        timer
      );

    };

  }, [
    started,
    finished,
    paused,
    countdown,
  ]);


  useEffect(() => {

    if (
      !started ||
      finished ||
      countdown !== 0
    ) {
      return;
    }


    createTarget();

  }, [
    started,
    finished,
    countdown,
    createTarget,
  ]);


  const finishGame =
    useCallback(
      (
        finishReason:
          | "targets_completed"
          | "time_limit"
      ) => {

        if (
          completionSentRef.current
        ) {
          return;
        }


        completionSentRef.current =
          true;


        const finalCorrect =
          correctRef.current;


        const finalWrong =
          wrongRef.current;


        const finalMissed =
          missedRef.current;


        const attempts =
          finalCorrect +
          finalWrong;


        const accuracy =
          attempts > 0
            ? Math.min(
                100,
                Math.round(
                  (
                    finalCorrect /
                    attempts
                  ) * 100
                )
              )
            : 0;


        const score =
          config.totalTargets > 0
            ? Math.min(
                100,
                Math.round(
                  (
                    finalCorrect /
                    config.totalTargets
                  ) * 100
                )
              )
            : 0;


        const reactionValues =
          reactionTimesRef.current;


        const averageReaction =
          reactionValues.length > 0
            ? Number(
                (
                  reactionValues.reduce(
                    (
                      total,
                      value
                    ) =>
                      total + value,
                    0
                  ) /
                  reactionValues.length
                ).toFixed(2)
              )
            : null;


        const processedTargets =
          finalCorrect +
          finalMissed;


        const completionRate =
          config.totalTargets > 0
            ? Math.min(
                100,
                Math.round(
                  (
                    processedTargets /
                    config.totalTargets
                  ) * 100
                )
              )
            : 0;


        const finalGameTime =
          Math.min(
            config.duration,
            gameTimeRef.current
          );


        const timeRemaining =
          Math.max(
            0,
            Number(
              (
                config.duration -
                finalGameTime
              ).toFixed(1)
            )
          );


        const unprocessedTargets =
          Math.max(
            0,
            config.totalTargets -
              processedTargets
          );


        const status:
          GameStatus =
            "Completed";


        const result:
          GameResult = {

          status,

          duration_seconds:
            Math.max(
              0,
              Math.ceil(
                finalGameTime
              )
            ),

          score,

          accuracy,

          mistakes:
            finalWrong,

          reaction_time:
            averageReaction,

          result_data: {
            domain:
              "Attention",

            difficulty,

            level:
              config.name,

            total_targets:
              config.totalTargets,

            correct_answers:
              finalCorrect,

            wrong_taps:
              finalWrong,

            mistakes:
              finalWrong,

            missed_targets:
              finalMissed,

            unprocessed_targets:
              unprocessedTargets,

            attempts,

            processed_targets:
              processedTargets,

            completion_rate:
              completionRate,

            reaction_times:
              reactionValues,

            average_reaction_time:
              averageReaction,

            target_life:
              config.targetLife,

            time_limit:
              config.duration,

            time_remaining:
              timeRemaining,

            finish_reason:
              finishReason,

            result_status:
              status,
          },
        };


        setFinalResult(
          result
        );


        setFinished(
          true
        );


        if (onComplete) {

          onComplete(
            result
          );

        }

      },
      [
        config,
        difficulty,
        onComplete,
      ]
    );


  useEffect(() => {

    if (
      !started ||
      finished ||
      paused ||
      countdown > 0
    ) {
      return;
    }


    const timer =
      setInterval(
        () => {

          const nextTime =
            Math.min(
              config.duration,
              roundOneDecimal(
                gameTimeRef.current +
                  0.1
              )
            );


          gameTimeRef.current =
            nextTime;


          setGameTime(
            nextTime
          );

        },
        100
      );


    return () => {

      clearInterval(
        timer
      );

    };

  }, [
    started,
    finished,
    paused,
    countdown,
    config.duration,
  ]);


  useEffect(() => {

    if (
      !started ||
      finished ||
      paused ||
      countdown > 0
    ) {
      return;
    }


    const timer =
      setInterval(
        () => {

          const nextTime =
            Math.min(
              config.targetLife,
              roundOneDecimal(
                targetTimeRef.current +
                  0.1
              )
            );


          targetTimeRef.current =
            nextTime;


          setTargetTime(
            nextTime
          );

        },
        100
      );


    return () => {

      clearInterval(
        timer
      );

    };

  }, [
    started,
    finished,
    paused,
    countdown,
    config.targetLife,
    targetPosition,
  ]);


  useEffect(() => {

    if (
      !started ||
      finished ||
      countdown > 0
    ) {
      return;
    }


    if (
      gameTime >=
      config.duration
    ) {

      finishGame(
        "time_limit"
      );

    }

  }, [
    started,
    finished,
    countdown,
    gameTime,
    config.duration,
    finishGame,
  ]);


  useEffect(() => {

    if (
      !started ||
      finished ||
      paused ||
      countdown > 0
    ) {
      return;
    }


    if (
      targetTime <
      config.targetLife
    ) {
      return;
    }


    const nextMissed =
      missedRef.current +
      1;


    missedRef.current =
      nextMissed;


    setMissed(
      nextMissed
    );


    const processedTargets =
      correctRef.current +
      nextMissed;


    if (
      processedTargets >=
      config.totalTargets
    ) {

      finishGame(
        "targets_completed"
      );


      return;

    }


    createTarget();

  }, [
    started,
    finished,
    paused,
    countdown,
    targetTime,
    config.targetLife,
    config.totalTargets,
    createTarget,
    finishGame,
  ]);


  const handleArenaPress =
    () => {

      if (
        !started ||
        finished ||
        paused ||
        countdown > 0
      ) {
        return;
      }


      const nextWrong =
        wrongRef.current +
        1;


      wrongRef.current =
        nextWrong;


      setWrong(
        nextWrong
      );

  };


  const handleTargetPress =
    (
      event: {
        stopPropagation?: () => void;
      }
    ) => {

      event.stopPropagation?.();


      if (
        !started ||
        finished ||
        paused ||
        countdown > 0
      ) {
        return;
      }


      const reactionTime =
        Number(
          targetTimeRef.current.toFixed(
            2
          )
        );


      const nextCorrect =
        correctRef.current +
        1;


      const nextReactionTimes = [
        ...reactionTimesRef.current,
        reactionTime,
      ];


      correctRef.current =
        nextCorrect;


      reactionTimesRef.current =
        nextReactionTimes;


      setCorrect(
        nextCorrect
      );


      setReactionTimes(
        nextReactionTimes
      );


      const processedTargets =
        nextCorrect +
        missedRef.current;


      if (
        processedTargets >=
        config.totalTargets
      ) {

        finishGame(
          "targets_completed"
        );


        return;

      }


      createTarget();

  };


  const handleArenaLayout =
    (
      event: LayoutChangeEvent
    ) => {

      const {
        width,
        height,
      } =
        event.nativeEvent.layout;


      setArenaWidth(
        width
      );


      setArenaHeight(
        height
      );

  };


  const selectLevel = (
    value: number
  ) => {

    setLevel(
      value
    );


    setStarted(
      false
    );


    setFinished(
      false
    );


    setCountdown(
      3
    );


    setGameTime(
      0
    );


    setTargetTime(
      0
    );


    setCorrect(
      0
    );


    setWrong(
      0
    );


    setMissed(
      0
    );


    setReactionTimes(
      []
    );


    setFinalResult(
      null
    );

  };


  const restartGame =
    () => {

      startGame();

  };


  const attempts =
    correct +
    wrong;


  const liveAccuracy =
    attempts > 0
      ? Math.min(
          100,
          Math.round(
            (
              correct /
              attempts
            ) * 100
          )
        )
      : 0;


  const liveScore =
    config.totalTargets > 0
      ? Math.min(
          100,
          Math.round(
            (
              correct /
              config.totalTargets
            ) * 100
          )
        )
      : 0;


  const timeLeft =
    Math.max(
      0,
      Number(
        (
          config.duration -
          gameTime
        ).toFixed(1)
      )
    );


  const targetTimeLeft =
    Math.max(
      0,
      Number(
        (
          config.targetLife -
          targetTime
        ).toFixed(1)
      )
    );


  if (
    !embedded &&
    !started
  ) {

    return (

      <View
        style={
          styles.startContainer
        }
      >

        <View
          style={
            styles.startIcon
          }
        >

          <Crosshair
            size={34}
            color="#7B6EF6"
          />

        </View>


        <Text
          style={
            styles.title
          }
        >
          Focus Finder
        </Text>


        <Text
          style={
            styles.description
          }
        >
          Find and tap the target as quickly and accurately as possible.
        </Text>


        <View
          style={
            styles.levelsContainer
          }
        >

          {Object.entries(
            LEVELS
          ).map(
            (
              [
                id,
                item,
              ]
            ) => {

              const numericId =
                Number(id);


              const selected =
                numericId ===
                level;


              return (

                <Pressable
                  key={
                    id
                  }
                  onPress={() => {

                    selectLevel(
                      numericId
                    );

                  }}
                  style={[
                    styles.levelCard,

                    selected &&
                      styles.levelCardSelected,
                  ]}
                >

                  <Text
                    style={[
                      styles.levelCardTitle,

                      selected &&
                        styles.levelCardTitleSelected,
                    ]}
                  >
                    {item.name}
                  </Text>


                  <Text
                    style={
                      styles.levelCardDetails
                    }
                  >
                    {item.totalTargets} targets
                  </Text>


                  <Text
                    style={
                      styles.levelCardDetails
                    }
                  >
                    {item.duration}s
                  </Text>

                </Pressable>

              );

            }
          )}

        </View>


        <Pressable
          onPress={
            startGame
          }
          style={
            styles.primaryButton
          }
        >

          <Play
            size={19}
            color="#FFFFFF"
          />


          <Text
            style={
              styles.primaryButtonText
            }
          >
            Start Game
          </Text>

        </Pressable>

      </View>

    );

  }


  if (
    finished &&
    finalResult
  ) {

    return (

      <View
        style={
          styles.resultContainer
        }
      >

        <View
          style={
            styles.startIcon
          }
        >

          <Trophy
            size={34}
            color="#7B6EF6"
          />

        </View>


        <Text
          style={
            styles.title
          }
        >
          Focus Finder Results
        </Text>


        <Text
          style={
            styles.resultStatus
          }
        >
          {config.name}
        </Text>


        <View
          style={
            styles.resultGrid
          }
        >

          <View
            style={
              styles.resultCard
            }
          >

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
              {finalResult.score}%
            </Text>

          </View>


          <View
            style={
              styles.resultCard
            }
          >

            <Text
              style={
                styles.metricLabel
              }
            >
              Accuracy
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {finalResult.accuracy ?? 0}%
            </Text>

          </View>


          <View
            style={
              styles.resultCard
            }
          >

            <Text
              style={
                styles.metricLabel
              }
            >
              Correct
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {correct}
            </Text>

          </View>


          <View
            style={
              styles.resultCard
            }
          >

            <Text
              style={
                styles.metricLabel
              }
            >
              Mistakes
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {wrong}
            </Text>

          </View>


          <View
            style={
              styles.resultCard
            }
          >

            <Text
              style={
                styles.metricLabel
              }
            >
              Missed
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {missed}
            </Text>

          </View>


          <View
            style={
              styles.resultCard
            }
          >

            <Text
              style={
                styles.metricLabel
              }
            >
              Reaction
            </Text>

            <Text
              style={
                styles.metricValueSmall
              }
            >
              {finalResult.reaction_time !==
              null
                ? `${finalResult.reaction_time}s`
                : "—"
              }
            </Text>

          </View>

        </View>


        {!embedded && (

          <Pressable
            onPress={
              restartGame
            }
            style={
              styles.secondaryButton
            }
          >

            <RotateCcw
              size={18}
              color="#7B6EF6"
            />


            <Text
              style={
                styles.secondaryButtonText
              }
            >
              Play Again
            </Text>

          </Pressable>

        )}

      </View>

    );

  }


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
            styles.headerTextBox
          }
        >

          <Text
            style={
              styles.category
            }
          >
            VISUAL ATTENTION
          </Text>


          <Text
            style={
              styles.title
            }
          >
            Focus Finder
          </Text>

        </View>


        <View
          style={
            styles.levelBadge
          }
        >

          <Text
            style={
              styles.levelBadgeText
            }
          >
            {config.name}
          </Text>

        </View>

      </View>


      {countdown > 0 ? (

        <View
          style={
            styles.countdownContainer
          }
        >

          <Text
            style={
              styles.countdownLabel
            }
          >
            Get Ready
          </Text>


          <Text
            style={
              styles.countdownValue
            }
          >
            {countdown}
          </Text>

        </View>

      ) : (

        <>

          <View
            style={
              styles.timeRow
            }
          >

            <View
              style={
                styles.timeCard
              }
            >

              <Timer
                size={19}
                color="#7B6EF6"
              />

              <View>

                <Text
                  style={
                    styles.timeLabel
                  }
                >
                  Game Time
                </Text>

                <Text
                  style={
                    styles.timeValue
                  }
                >
                  {gameTime.toFixed(
                    1
                  )}s
                </Text>

              </View>

            </View>


            <View
              style={
                styles.timeCard
              }
            >

              <Timer
                size={19}
                color="#7B6EF6"
              />

              <View>

                <Text
                  style={
                    styles.timeLabel
                  }
                >
                  Time Left
                </Text>

                <Text
                  style={
                    styles.timeValue
                  }
                >
                  {timeLeft.toFixed(
                    1
                  )}s
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
            style={
              styles.progressRow
            }
          >

            <Text
              style={
                styles.progressText
              }
            >
              Target{" "}
              {Math.min(
                config.totalTargets,
                correct +
                  missed +
                  1
              )}
              {" / "}
              {config.totalTargets}
            </Text>


            <Text
              style={
                styles.progressText
              }
            >
              Target Time:{" "}
              {targetTimeLeft.toFixed(
                1
              )}s
            </Text>

          </View>


          <Pressable
            onLayout={
              handleArenaLayout
            }
            onPress={
              handleArenaPress
            }
            disabled={
              paused
            }
            style={[
              styles.arena,

              paused &&
                styles.arenaPaused,
            ]}
          >

            {arenaWidth > 0 &&
              arenaHeight > 0 && (

              <Pressable
                onPress={
                  handleTargetPress
                }
                disabled={
                  paused
                }
                style={[
                  styles.target,

                  {
                    width:
                      config.targetSize,

                    height:
                      config.targetSize,

                    borderRadius:
                      config.targetSize /
                      2,

                    left:
                      targetPosition.left,

                    top:
                      targetPosition.top,
                  },
                ]}
              >

                <View
                  style={[
                    styles.targetMiddle,

                    {
                      width:
                        config.targetSize *
                        0.62,

                      height:
                        config.targetSize *
                        0.62,

                      borderRadius:
                        (
                          config.targetSize *
                          0.62
                        ) / 2,
                    },
                  ]}
                >

                  <View
                    style={[
                      styles.targetCenter,

                      {
                        width:
                          config.targetSize *
                          0.28,

                        height:
                          config.targetSize *
                          0.28,

                        borderRadius:
                          (
                            config.targetSize *
                            0.28
                          ) / 2,
                      },
                    ]}
                  />

                </View>

              </Pressable>

            )}

          </Pressable>


          <Text
            style={
              styles.instruction
            }
          >
            Tap the purple target. Tapping anywhere else counts as a mistake.
          </Text>


          <View
            style={
              styles.metricsGrid
            }
          >

            <View
              style={
                styles.metricBox
              }
            >

              <Text
                style={
                  styles.metricLabel
                }
              >
                Correct
              </Text>

              <Text
                style={
                  styles.metricValue
                }
              >
                {correct}
              </Text>

            </View>


            <View
              style={
                styles.metricBox
              }
            >

              <Text
                style={
                  styles.metricLabel
                }
              >
                Mistakes
              </Text>

              <Text
                style={
                  styles.metricValue
                }
              >
                {wrong}
              </Text>

            </View>


            <View
              style={
                styles.metricBox
              }
            >

              <Text
                style={
                  styles.metricLabel
                }
              >
                Missed
              </Text>

              <Text
                style={
                  styles.metricValue
                }
              >
                {missed}
              </Text>

            </View>


            <View
              style={
                styles.metricBox
              }
            >

              <Text
                style={
                  styles.metricLabel
                }
              >
                Accuracy
              </Text>

              <Text
                style={
                  styles.metricValue
                }
              >
                {liveAccuracy}%
              </Text>

            </View>


            <View
              style={
                styles.metricBoxWide
              }
            >

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
                {liveScore}%
              </Text>

            </View>

          </View>

        </>

      )}

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {
      width: "100%",

      padding: 18,

      borderRadius: 24,

      backgroundColor:
        "#FFFFFF",
    },


    startContainer: {
      width: "100%",

      padding: 24,

      borderRadius: 24,

      backgroundColor:
        "#FFFFFF",

      alignItems:
        "center",
    },


    resultContainer: {
      width: "100%",

      padding: 24,

      borderRadius: 24,

      backgroundColor:
        "#FFFFFF",

      alignItems:
        "center",
    },


    startIcon: {
      width: 64,

      height: 64,

      borderRadius: 20,

      backgroundColor:
        "#EEE9FF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    title: {
      color: "#202033",

      fontSize: 25,

      fontWeight: "800",

      marginTop: 5,
    },


    category: {
      color: "#7B6EF6",

      fontSize: 12,

      fontWeight: "800",
    },


    description: {
      color: "#77778A",

      lineHeight: 21,

      textAlign:
        "center",

      marginTop: 10,
    },


    levelsContainer: {
      width: "100%",

      gap: 10,

      marginTop: 22,
    },


    levelCard: {
      width: "100%",

      padding: 17,

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      backgroundColor:
        "#F8FAFC",
    },


    levelCardSelected: {
      borderColor:
        "#7B6EF6",

      backgroundColor:
        "#F4F1FF",
    },


    levelCardTitle: {
      color: "#202033",

      fontSize: 17,

      fontWeight: "800",
    },


    levelCardTitleSelected: {
      color: "#6D5CE7",
    },


    levelCardDetails: {
      color: "#77778A",

      fontSize: 13,

      marginTop: 4,
    },


    primaryButton: {
      width: "100%",

      height: 52,

      borderRadius: 16,

      backgroundColor:
        "#7B6EF6",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 8,

      marginTop: 22,
    },


    primaryButtonText: {
      color: "#FFFFFF",

      fontSize: 16,

      fontWeight: "800",
    },


    secondaryButton: {
      minHeight: 48,

      paddingHorizontal: 22,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        "#DDD7FF",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 8,

      marginTop: 22,
    },


    secondaryButtonText: {
      color: "#7B6EF6",

      fontWeight: "800",
    },


    resultStatus: {
      color: "#64748B",

      marginTop: 6,

      fontWeight: "700",
    },


    resultGrid: {
      width: "100%",

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap: 10,

      marginTop: 22,
    },


    resultCard: {
      width: "48%",

      minHeight: 90,

      borderRadius: 18,

      backgroundColor:
        "#F7F8FC",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap: 12,
    },


    headerTextBox: {
      flex: 1,
    },


    levelBadge: {
      paddingHorizontal: 13,

      paddingVertical: 8,

      borderRadius: 15,

      backgroundColor:
        "#EEE9FF",
    },


    levelBadgeText: {
      color: "#6D5CE7",

      fontSize: 12,

      fontWeight: "800",
    },


    countdownContainer: {
      minHeight: 360,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    countdownLabel: {
      color: "#77778A",

      fontSize: 18,

      fontWeight: "700",
    },


    countdownValue: {
      color: "#7B6EF6",

      fontSize: 84,

      fontWeight: "900",

      marginTop: 10,
    },


    timeRow: {
      flexDirection:
        "row",

      gap: 10,

      marginTop: 18,
    },


    timeCard: {
      flex: 1,

      minHeight: 70,

      padding: 12,

      borderRadius: 17,

      backgroundColor:
        "#F7F8FC",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 10,
    },


    timeLabel: {
      color: "#77778A",

      fontSize: 11,
    },


    timeValue: {
      color: "#202033",

      fontWeight: "800",

      marginTop: 2,
    },


    pausedBox: {
      padding: 13,

      borderRadius: 15,

      backgroundColor:
        "#FEF3C7",

      marginTop: 16,

      alignItems:
        "center",
    },


    pausedText: {
      color: "#B45309",

      fontWeight: "800",
    },


    progressRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap: 10,

      marginTop: 18,

      marginBottom: 10,
    },


    progressText: {
      color: "#64748B",

      fontSize: 12,

      fontWeight: "700",
    },


    arena: {
      width: "100%",

      height: 370,

      borderRadius: 24,

      backgroundColor:
        "#F7F5FF",

      borderWidth: 1,

      borderColor:
        "#E5E1FF",

      position:
        "relative",

      overflow:
        "hidden",
    },


    arenaPaused: {
      opacity: 0.55,
    },


    target: {
      position:
        "absolute",

      backgroundColor:
        "#7B6EF6",

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        "#7B6EF6",

      shadowOpacity: 0.28,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 7,
    },


    targetMiddle: {
      backgroundColor:
        "#FFFFFF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    targetCenter: {
      backgroundColor:
        "#7B6EF6",
    },


    instruction: {
      color: "#64748B",

      fontSize: 12,

      lineHeight: 18,

      textAlign:
        "center",

      marginTop: 12,
    },


    metricsGrid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap: 8,

      marginTop: 20,
    },


    metricBox: {
      width: "48%",

      minHeight: 72,

      borderRadius: 16,

      backgroundColor:
        "#F7F8FC",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    metricBoxWide: {
      width: "100%",

      minHeight: 72,

      borderRadius: 16,

      backgroundColor:
        "#F2EEFF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    metricLabel: {
      color: "#77778A",

      fontSize: 11,
    },


    metricValue: {
      color: "#202033",

      fontSize: 19,

      fontWeight: "800",

      marginTop: 3,
    },


    metricValueSmall: {
      color: "#202033",

      fontSize: 16,

      fontWeight: "800",

      marginTop: 3,
    },

  });