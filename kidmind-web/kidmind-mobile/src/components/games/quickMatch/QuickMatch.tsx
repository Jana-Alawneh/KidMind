import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Clock3,
  Play,
  RotateCcw,
  Target,
  Trophy,
  Zap,
} from "lucide-react-native";

import Svg, {
  Circle,
  Path,
  Polygon,
  Rect,
} from "react-native-svg";


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


type QuickMatchProps = {
  embedded?: boolean;

  paused?: boolean;

  difficulty?: string;

  onComplete?: (
    result: GameResult
  ) => void;
};


type SymbolItem = {
  id: string;

  label: string;

  shape: string;
};


type Card = {
  id: string;

  label: string;

  shape: string;

  color: string;
};


type RoundData = {
  cards: Card[];

  targetId: string;

  targetColor: string;
};


const LEVELS = {
  1: {
    name: "Easy",
    rounds: 6,
    time: 45,
    cards: 4,
    reactionTime: 6,
  },

  2: {
    name: "Medium",
    rounds: 9,
    time: 60,
    cards: 6,
    reactionTime: 5,
  },

  3: {
    name: "Hard",
    rounds: 12,
    time: 75,
    cards: 8,
    reactionTime: 4,
  },
};


const SYMBOLS: SymbolItem[] = [
  {
    id: "circle",
    label: "Circle",
    shape: "circle",
  },

  {
    id: "square",
    label: "Square",
    shape: "square",
  },

  {
    id: "triangle",
    label: "Triangle",
    shape: "triangle",
  },

  {
    id: "diamond",
    label: "Diamond",
    shape: "diamond",
  },

  {
    id: "star",
    label: "Star",
    shape: "star",
  },

  {
    id: "hexagon",
    label: "Hexagon",
    shape: "hexagon",
  },

  {
    id: "heart",
    label: "Heart",
    shape: "heart",
  },

  {
    id: "cross",
    label: "Cross",
    shape: "cross",
  },
];


const COLORS = [
  "#7C6CFF",
  "#63B3ED",
  "#EF6A8A",
  "#F2C94C",
  "#7BC67B",
  "#F2A65A",
  "#9B8AFB",
  "#5EC6B3",
];

const ShapeSvg = ({
  shapeName,
  color = "#7C6CFF",
  size = 58,
}: {
  shapeName?: string;
  color?: string;
  size?: number;
}) => {

  if (!shapeName) {
    return null;
  }


  if (
    shapeName === "circle"
  ) {

    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <Circle
          cx="50"
          cy="50"
          r="35"
          fill={color}
        />
      </Svg>
    );

  }


  if (
    shapeName === "square"
  ) {

    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <Rect
          x="16"
          y="16"
          width="68"
          height="68"
          rx="10"
          fill={color}
        />
      </Svg>
    );

  }


  if (
    shapeName === "triangle"
  ) {

    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <Polygon
          points="50,10 90,85 10,85"
          fill={color}
        />
      </Svg>
    );

  }


  if (
    shapeName === "diamond"
  ) {

    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <Polygon
          points="50,8 92,50 50,92 8,50"
          fill={color}
        />
      </Svg>
    );

  }


  if (
    shapeName === "star"
  ) {

    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <Polygon
          points="50,8 61,37 92,37 67,55 77,86 50,67 23,86 33,55 8,37 39,37"
          fill={color}
        />
      </Svg>
    );

  }


  if (
    shapeName === "hexagon"
  ) {

    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <Polygon
          points="25,12 75,12 92,50 75,88 25,88 8,50"
          fill={color}
        />
      </Svg>
    );

  }


  if (
    shapeName === "heart"
  ) {

    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <Path
          d="M50 86 C45 80 15 62 15 37 C15 18 38 12 50 30 C62 12 85 18 85 37 C85 62 55 80 50 86"
          fill={color}
        />
      </Svg>
    );

  }


  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
    >
      <Path
        d="M35 10 H65 V35 H90 V65 H65 V90 H35 V65 H10 V35 H35 Z"
        fill={color}
      />
    </Svg>
  );

};


const shuffle = <T,>(
  array: T[]
) => {

  const result = [
    ...array,
  ];


  for (
    let index =
      result.length - 1;
    index > 0;
    index -= 1
  ) {

    const randomIndex =
      Math.floor(
        Math.random() *
        (index + 1)
      );


    [
      result[index],
      result[randomIndex],
    ] = [
      result[randomIndex],
      result[index],
    ];

  }


  return result;

};


const getRandomColor =
  () => {

    return COLORS[
      Math.floor(
        Math.random() *
        COLORS.length
      )
    ];

  };


const createRound = (
  cardCount: number
): RoundData => {

  const symbols =
    shuffle(
      SYMBOLS
    );


  const selected =
    symbols.slice(
      0,
      Math.min(
        cardCount,
        symbols.length
      )
    );


  const cards =
    selected.map(
      (symbol) => ({
        ...symbol,

        color:
          getRandomColor(),
      })
    );


  const target =
    cards[
      Math.floor(
        Math.random() *
        cards.length
      )
    ];


  return {
    cards:
      shuffle(
        cards
      ),

    targetId:
      target.id,

    targetColor:
      target.color,
  };

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


export default function QuickMatch({
  embedded = true,
  paused = false,
  difficulty = "Level 1",
  onComplete,
}: QuickMatchProps) {

  const difficultyLevel =
    resolveLevelId(
      difficulty
    );


  const [
    level,
    setLevel,
  ] = useState(
    difficultyLevel
  );


  const activeLevel =
    embedded
      ? difficultyLevel
      : level;


  const config =
    useMemo(
      () =>
        LEVELS[
          activeLevel as keyof typeof LEVELS
        ],
      [
        activeLevel,
      ]
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
    round,
    setRound,
  ] = useState(0);


  const [
    currentRound,
    setCurrentRound,
  ] = useState<RoundData | null>(
    null
  );


  const [
    gameTime,
    setGameTime,
  ] = useState(0);


  const [
    roundTime,
    setRoundTime,
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
    feedback,
    setFeedback,
  ] = useState<
    | "correct"
    | "wrong"
    | "timeout"
    | null
  >(
    null
  );


  const [
    pressedId,
    setPressedId,
  ] = useState<string | null>(
    null
  );


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


  const roundTimeRef =
    useRef(0);


  const completionSentRef =
    useRef(false);


  const initializedRef =
    useRef(false);


  const createNewRound =
    useCallback(() => {

      const newRound =
        createRound(
          config.cards
        );


      setCurrentRound(
        newRound
      );


      setRoundTime(
        0
      );


      roundTimeRef.current =
        0;


      setFeedback(
        null
      );


      setPressedId(
        null
      );

    }, [
      config.cards,
    ]);


  const prepareGame =
    useCallback(() => {

      setRound(
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


      setGameTime(
        0
      );


      setRoundTime(
        0
      );


      setFeedback(
        null
      );


      setPressedId(
        null
      );


      setFinished(
        false
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


      roundTimeRef.current =
        0;


      completionSentRef.current =
        false;


      setCurrentRound(
        createRound(
          config.cards
        )
      );

    }, [
      config.cards,
    ]);


  const startGame =
    useCallback(() => {

      prepareGame();


      setStarted(
        true
      );

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


  const finishGame =
    useCallback(
      (
        completedAll: boolean,
        finishReason:
          | "rounds_completed"
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


        const processedRounds =
          finalCorrect +
          finalWrong +
          finalMissed;


        const unprocessedRounds =
          Math.max(
            0,
            config.rounds -
              processedRounds
          );


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
          config.rounds > 0
            ? Math.min(
                100,
                Math.round(
                  (
                    finalCorrect /
                    config.rounds
                  ) * 100
                )
              )
            : 0;


        const finalReactionTimes =
          reactionTimesRef.current;


        const averageReaction =
          finalReactionTimes.length >
          0
            ? Number(
                (
                  finalReactionTimes.reduce(
                    (
                      total,
                      value
                    ) =>
                      total + value,
                    0
                  ) /
                  finalReactionTimes.length
                ).toFixed(2)
              )
            : null;


        const completionRate =
          config.rounds > 0
            ? Math.min(
                100,
                Math.round(
                  (
                    processedRounds /
                    config.rounds
                  ) * 100
                )
              )
            : 0;


        const finalGameTime =
          Math.min(
            config.time,
            gameTimeRef.current
          );


        const timeRemaining =
          Math.max(
            0,
            Number(
              (
                config.time -
                finalGameTime
              ).toFixed(1)
            )
          );


        const status:
          GameStatus =
            completedAll
              ? "Completed"
              : "Failed";


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
              "Processing Speed & Attention",

            difficulty,

            level:
              config.name,

            total_rounds:
              config.rounds,

            completed_rounds:
              processedRounds,

            correct_answers:
              finalCorrect,

            wrong_answers:
              finalWrong,

            mistakes:
              finalWrong,

            missed_rounds:
              finalMissed,

            unprocessed_rounds:
              unprocessedRounds,

            total_attempts:
              attempts,

            score,

            accuracy,

            reaction_times:
              finalReactionTimes,

            average_reaction_time:
              averageReaction,

            reaction_time_limit:
              config.reactionTime,

            cards_per_round:
              config.cards,

            completion_rate:
              completionRate,

            time_limit:
              config.time,

            time_remaining:
              timeRemaining,

            completed:
              completedAll,

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


        setFeedback(
          null
        );


        if (
          onComplete
        ) {

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
      paused
    ) {
      return;
    }


    const timer =
      setInterval(
        () => {

          const nextTime =
            Math.min(
              config.time,
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
    config.time,
  ]);


  useEffect(() => {

    if (
      !started ||
      finished ||
      paused ||
      feedback ||
      !currentRound
    ) {
      return;
    }


    const timer =
      setInterval(
        () => {

          const nextTime =
            Math.min(
              config.reactionTime,
              roundOneDecimal(
                roundTimeRef.current +
                  0.1
              )
            );


          roundTimeRef.current =
            nextTime;


          setRoundTime(
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
    feedback,
    currentRound,
    config.reactionTime,
  ]);


  useEffect(() => {

    if (
      !started ||
      finished
    ) {
      return;
    }


    if (
      gameTime >=
      config.time
    ) {

      finishGame(
        false,
        "time_limit"
      );

    }

  }, [
    started,
    finished,
    gameTime,
    config.time,
    finishGame,
  ]);


  useEffect(() => {

    if (
      !started ||
      finished ||
      paused ||
      feedback ||
      !currentRound
    ) {
      return;
    }


    if (
      roundTime <
      config.reactionTime
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


    setFeedback(
      "timeout"
    );


    setPressedId(
      null
    );

  }, [
    started,
    finished,
    paused,
    feedback,
    currentRound,
    roundTime,
    config.reactionTime,
  ]);


  useEffect(() => {

    if (
      !started ||
      finished ||
      paused ||
      !feedback
    ) {
      return;
    }


    const transition =
      setTimeout(
        () => {

          if (
            round >=
            config.rounds - 1
          ) {

            finishGame(
              true,
              "rounds_completed"
            );


            return;

          }


          setRound(
            (
              previous
            ) =>
              previous + 1
          );


          createNewRound();

        },
        450
      );


    return () => {

      clearTimeout(
        transition
      );

    };

  }, [
    started,
    finished,
    paused,
    feedback,
    round,
    config.rounds,
    createNewRound,
    finishGame,
  ]);


  const chooseCard = (
    card: Card
  ) => {

    if (
      !started ||
      finished ||
      paused ||
      !currentRound ||
      feedback
    ) {
      return;
    }


    const isCorrect =
      card.id ===
      currentRound.targetId;


    setPressedId(
      card.id
    );


    if (isCorrect) {

      const nextCorrect =
        correctRef.current +
        1;


      correctRef.current =
        nextCorrect;


      setCorrect(
        nextCorrect
      );


      const reaction =
        Number(
          roundTimeRef.current.toFixed(
            2
          )
        );


      const nextReactionTimes = [
        ...reactionTimesRef.current,
        reaction,
      ];


      reactionTimesRef.current =
        nextReactionTimes;


      setReactionTimes(
        nextReactionTimes
      );


      setFeedback(
        "correct"
      );


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


    setFeedback(
      "wrong"
    );

  };


  const restartGame =
    () => {

      startGame();

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


    setRound(
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


    setGameTime(
      0
    );


    setRoundTime(
      0
    );


    setCurrentRound(
      null
    );


    setFeedback(
      null
    );


    setPressedId(
      null
    );


    setFinalResult(
      null
    );

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
    config.rounds > 0
      ? Math.min(
          100,
          Math.round(
            (
              correct /
              config.rounds
            ) * 100
          )
        )
      : 0;


  const timeLeft =
    Math.max(
      0,
      Number(
        (
          config.time -
          gameTime
        ).toFixed(1)
      )
    );


  const roundTimeLeft =
    Math.max(
      0,
      Number(
        (
          config.reactionTime -
          roundTime
        ).toFixed(1)
      )
    );



  if (
    !embedded &&
    !started &&
    !finished
  ) {

    return (

      <View
        style={
          styles.standaloneScreen
        }
      >

        <Text
          style={
            styles.category
          }
        >
          COGNITIVE ASSESSMENT
        </Text>


        <Text
          style={
            styles.selectionTitle
          }
        >
          Quick Match
        </Text>


        <Text
          style={
            styles.selectionDescription
          }
        >
          Find the matching shape as quickly and accurately as possible. Each round changes the layout, colors and target.
        </Text>


        <View
          style={
            styles.levelList
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
                  key={id}
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

                  <View
                    style={
                      styles.levelTopRow
                    }
                  >

                    <View
                      style={
                        styles.levelNumber
                      }
                    >

                      <Text
                        style={
                          styles.levelNumberText
                        }
                      >
                        {id}
                      </Text>

                    </View>


                    {selected && (

                      <Text
                        style={
                          styles.selectedText
                        }
                      >
                        SELECTED
                      </Text>

                    )}

                  </View>


                  <Text
                    style={
                      styles.levelTitle
                    }
                  >
                    {item.name}
                  </Text>


                  <Text
                    style={
                      styles.levelDescription
                    }
                  >
                    Match the target shape quickly while keeping your accuracy.
                  </Text>


                  <View
                    style={
                      styles.levelDivider
                    }
                  />


                  <View
                    style={
                      styles.levelStats
                    }
                  >

                    <View
                      style={
                        styles.levelStat
                      }
                    >

                      <Text
                        style={
                          styles.smallLabel
                        }
                      >
                        Rounds
                      </Text>

                      <Text
                        style={
                          styles.smallValue
                        }
                      >
                        {item.rounds}
                      </Text>

                    </View>


                    <View
                      style={
                        styles.levelStat
                      }
                    >

                      <Text
                        style={
                          styles.smallLabel
                        }
                      >
                        Cards
                      </Text>

                      <Text
                        style={
                          styles.smallValue
                        }
                      >
                        {item.cards}
                      </Text>

                    </View>


                    <View
                      style={
                        styles.levelStat
                      }
                    >

                      <Text
                        style={
                          styles.smallLabel
                        }
                      >
                        Time
                      </Text>

                      <Text
                        style={
                          styles.smallValue
                        }
                      >
                        {item.time}s
                      </Text>

                    </View>

                  </View>

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
            styles.startButton
          }
        >

          <Play
            size={19}
            color="#FFFFFF"
          />


          <Text
            style={
              styles.startButtonText
            }
          >
            Start Assessment
          </Text>

        </Pressable>

      </View>

    );

  }


  if (
    finished &&
    finalResult
  ) {

    const resultData =
      finalResult.result_data as
        | Record<
            string,
            unknown
          >
        | null;


    const resultCorrect =
      Number(
        resultData
          ?.correct_answers ??
        correct
      );


    const resultWrong =
      Number(
        resultData
          ?.wrong_answers ??
        wrong
      );


    const resultMissed =
      Number(
        resultData
          ?.missed_rounds ??
        missed
      );


    const resultAttempts =
      Number(
        resultData
          ?.total_attempts ??
        (
          resultCorrect +
          resultWrong
        )
      );


    const resultTime =
      Number(
        (
          config.time -
          Number(
            resultData
              ?.time_remaining ??
            0
          )
        ).toFixed(1)
      );


    const recommendation =
      (
        finalResult.accuracy ??
        0
      ) >= 85
        ? "Excellent processing speed and visual attention."
        : (
            finalResult.accuracy ??
            0
          ) >= 70
        ? "Good processing speed. Continue monitoring progress."
        : "The child may benefit from additional visual matching and attention practice.";


    return (

      <View
        style={[
          styles.resultScreen,

          !embedded &&
            styles.standaloneScreen,
        ]}
      >

        <View
          style={
            styles.resultPanel
          }
        >

          <View
            style={
              styles.resultIcon
            }
          >

            <Trophy
              size={30}
              color="#7C6CFF"
            />

          </View>


          <Text
            style={
              styles.resultCategory
            }
          >
            {finalResult.status ===
            "Completed"
              ? "ASSESSMENT COMPLETED"
              : "TIME COMPLETED"
            }
          </Text>


          <Text
            style={
              styles.resultTitle
            }
          >
            Quick Match Results
          </Text>


          <Text
            style={
              styles.resultLevel
            }
          >
            {config.name} Level
          </Text>


          <View
            style={
              styles.resultGrid
            }
          >

            <View
              style={
                styles.resultMetric
              }
            >

              <Text
                style={
                  styles.smallLabel
                }
              >
                Score
              </Text>

              <Text
                style={
                  styles.resultMetricValue
                }
              >
                {finalResult.score}%
              </Text>

            </View>


            <View
              style={
                styles.resultMetric
              }
            >

              <Text
                style={
                  styles.smallLabel
                }
              >
                Accuracy
              </Text>

              <Text
                style={
                  styles.resultMetricValue
                }
              >
                {finalResult.accuracy ?? 0}%
              </Text>

            </View>


            <View
              style={
                styles.resultMetric
              }
            >

              <Text
                style={
                  styles.smallLabel
                }
              >
                Correct
              </Text>

              <Text
                style={
                  styles.resultMetricValue
                }
              >
                {resultCorrect}
              </Text>

            </View>


            <View
              style={
                styles.resultMetric
              }
            >

              <Text
                style={
                  styles.smallLabel
                }
              >
                Wrong
              </Text>

              <Text
                style={
                  styles.resultMetricValue
                }
              >
                {resultWrong}
              </Text>

            </View>

          </View>


          <View
            style={
              styles.secondaryGrid
            }
          >

            <View
              style={
                styles.secondaryCard
              }
            >

              <Text
                style={
                  styles.smallLabel
                }
              >
                Missed
              </Text>

              <Text
                style={
                  styles.secondaryValue
                }
              >
                {resultMissed}
              </Text>

            </View>


            <View
              style={
                styles.secondaryCard
              }
            >

              <Text
                style={
                  styles.smallLabel
                }
              >
                Attempts
              </Text>

              <Text
                style={
                  styles.secondaryValue
                }
              >
                {resultAttempts}
              </Text>

            </View>


            <View
              style={
                styles.secondaryCard
              }
            >

              <Text
                style={
                  styles.smallLabel
                }
              >
                Reaction Time
              </Text>

              <Text
                style={
                  styles.secondaryValue
                }
              >
                {finalResult.reaction_time !==
                null
                  ? `${finalResult.reaction_time}s`
                  : "—"
                }
              </Text>

            </View>


            <View
              style={
                styles.secondaryCard
              }
            >

              <Text
                style={
                  styles.smallLabel
                }
              >
                Game Time
              </Text>

              <Text
                style={
                  styles.secondaryValue
                }
              >
                {resultTime}s
              </Text>

            </View>

          </View>


          <View
            style={
              styles.insightBox
            }
          >

            <Text
              style={
                styles.insightTitle
              }
            >
              PERFORMANCE INSIGHT
            </Text>


            <Text
              style={
                styles.insightText
              }
            >
              {recommendation}
            </Text>

          </View>


          {!embedded && (

            <Pressable
              onPress={
                restartGame
              }
              style={
                styles.restartButton
              }
            >

              <RotateCcw
                size={18}
                color="#303044"
              />


              <Text
                style={
                  styles.restartText
                }
              >
                Play Again
              </Text>

            </Pressable>

          )}

        </View>

      </View>

    );

  }


  if (
    !currentRound
  ) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <Text
          style={
            styles.selectionDescription
          }
        >
          Preparing Quick Match...
        </Text>

      </View>

    );

  }


  const target =
    SYMBOLS.find(
      (symbol) =>
        symbol.id ===
        currentRound.targetId
    );


  return (

    <View
      style={[
        styles.gameScreen,

        !embedded &&
          styles.standaloneScreen,
      ]}
    >

      <View
        style={
          styles.gameHeader
        }
      >

        <View>

          <Text
            style={
              styles.category
            }
          >
            PROCESSING SPEED
          </Text>


          <Text
            style={
              styles.gameTitle
            }
          >
            Quick Match
          </Text>

        </View>


        <View
          style={
            styles.statsRow
          }
        >

          <View
            style={
              styles.headerStat
            }
          >

            <Text
              style={
                styles.headerStatLabel
              }
            >
              Level
            </Text>

            <Text
              style={
                styles.headerStatValue
              }
            >
              {config.name}
            </Text>

          </View>


          <View
            style={
              styles.headerTimeStat
            }
          >

            <Text
              style={
                styles.headerTimeLabel
              }
            >
              Game Time
            </Text>

            <Text
              style={
                styles.headerTimeValue
              }
            >
              {gameTime.toFixed(1)}s
            </Text>

          </View>


          <View
            style={
              styles.headerStat
            }
          >

            <Text
              style={
                styles.headerStatLabel
              }
            >
              Time Left
            </Text>

            <Text
              style={
                styles.headerStatValue
              }
            >
              {timeLeft.toFixed(1)}s
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
          styles.board
        }
      >

        <View
          style={
            styles.roundHeader
          }
        >

          <View>

            <Text
              style={
                styles.roundLabel
              }
            >
              ROUND
            </Text>

            <Text
              style={
                styles.roundValue
              }
            >
              {round + 1}
              {" / "}
              {config.rounds}
            </Text>

          </View>


          <View
            style={
              styles.roundTimer
            }
          >

            <Clock3
              size={17}
              color="#77778A"
            />

            <Text
              style={
                styles.roundTimerText
              }
            >
              {roundTime.toFixed(1)}s
              {" / "}
              {config.reactionTime}s
            </Text>

          </View>

        </View>


        <View
          style={
            styles.progressTrack
          }
        >

          <View
            style={[
              styles.progressBar,

              {
                width:
                  `${
                    (
                      (
                        round + 1
                      ) /
                      config.rounds
                    ) * 100
                  }%`,
              },
            ]}
          />

        </View>


        <View
          style={
            styles.targetCard
          }
        >

          <View
            style={
              styles.targetIconBox
            }
          >

            <Target
              size={23}
              color="#7C6CFF"
            />

          </View>


          <Text
            style={
              styles.targetLabel
            }
          >
            FIND THIS SHAPE
          </Text>


          <View
            style={
              styles.targetShape
            }
          >

            <ShapeSvg
              shapeName={
                target?.shape
              }
              color={
                currentRound.targetColor
              }
              size={72}
            />

          </View>


          <Text
            style={
              styles.targetName
            }
          >
            Match the target
          </Text>


          <Text
            style={
              styles.targetDescription
            }
          >
            Choose the identical shape below.
          </Text>


          <Text
            style={
              styles.roundTimeLeftText
            }
          >
            Round time left:{" "}
            {roundTimeLeft.toFixed(
              1
            )}s
          </Text>

        </View>


        <View
          style={
            styles.cardsGrid
          }
        >

          {currentRound.cards.map(
            (
              card
            ) => {

              const isPressed =
                pressedId ===
                card.id;


              let backgroundColor =
                "#FFFFFF";


              let borderColor =
                "#E7E7F0";


              if (
                isPressed &&
                feedback ===
                "correct"
              ) {

                backgroundColor =
                  "#EEF9EE";


                borderColor =
                  "#7BC67B";

              }


              if (
                isPressed &&
                feedback ===
                "wrong"
              ) {

                backgroundColor =
                  "#FFF0F3";


                borderColor =
                  "#EF6A8A";

              }


              return (

                <Pressable
                  key={
                    `${card.id}-${card.color}`
                  }
                  onPress={() => {

                    chooseCard(
                      card
                    );

                  }}
                  disabled={
                    paused ||
                    finished ||
                    Boolean(
                      feedback
                    )
                  }
                  style={[
                    styles.card,

                    {
                      backgroundColor,
                      borderColor,
                    },

                    paused &&
                      styles.cardPaused,
                  ]}
                >

                  <ShapeSvg
                    shapeName={
                      card.shape
                    }
                    color={
                      card.color
                    }
                    size={62}
                  />

                </Pressable>

              );

            }
          )}

        </View>


        <View
          style={
            styles.liveMetrics
          }
        >

          <View
            style={
              styles.liveMetric
            }
          >

            <Text
              style={
                styles.liveLabel
              }
            >
              Correct
            </Text>

            <Text
              style={
                styles.liveValue
              }
            >
              {correct}
            </Text>

          </View>


          <View
            style={
              styles.liveMetric
            }
          >

            <Text
              style={
                styles.liveLabel
              }
            >
              Wrong
            </Text>

            <Text
              style={
                styles.liveValue
              }
            >
              {wrong}
            </Text>

          </View>


          <View
            style={
              styles.liveMetric
            }
          >

            <Text
              style={
                styles.liveLabel
              }
            >
              Missed
            </Text>

            <Text
              style={
                styles.liveValue
              }
            >
              {missed}
            </Text>

          </View>


          <View
            style={
              styles.liveMetric
            }
          >

            <Text
              style={
                styles.liveLabel
              }
            >
              Accuracy
            </Text>

            <Text
              style={
                styles.liveValue
              }
            >
              {liveAccuracy}%
            </Text>

          </View>


          <View
            style={
              styles.liveMetric
            }
          >

            <Text
              style={
                styles.liveLabel
              }
            >
              Score
            </Text>

            <Text
              style={
                styles.liveValue
              }
            >
              {liveScore}%
            </Text>

          </View>

        </View>


        {feedback ===
          "timeout" && (

          <View
            style={
              styles.timeoutBox
            }
          >

            <Text
              style={
                styles.timeoutText
              }
            >
              Time ran out. This round was counted as missed.
            </Text>

          </View>

        )}

      </View>

    </View>

  );

}


const styles =
  StyleSheet.create({

    standaloneScreen: {
      width: "100%",
      minHeight: "100%",
      padding: 20,
      backgroundColor:
        "#F7F8FC",
    },


    gameScreen: {
      width: "100%",
    },


    category: {
      color:
        "#7C6CFF",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.3,
    },


    selectionTitle: {
      marginTop: 6,
      color:
        "#202033",
      fontSize: 34,
      fontWeight: "800",
    },


    selectionDescription: {
      marginTop: 10,
      color:
        "#77778A",
      fontSize: 15,
      lineHeight: 22,
    },


    levelList: {
      marginTop: 28,
      gap: 16,
    },


    levelCard: {
      padding: 22,
      borderRadius: 28,
      borderWidth: 1,
      borderColor:
        "#E8E8F0",
      backgroundColor:
        "#FFFFFF",
    },


    levelCardSelected: {
      borderColor:
        "#7C6CFF",
      backgroundColor:
        "#F5F2FF",
    },


    levelTopRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },


    levelNumber: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor:
        "#7C6CFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    levelNumberText: {
      color:
        "#FFFFFF",
      fontSize: 16,
      fontWeight: "800",
    },


    selectedText: {
      color:
        "#7C6CFF",
      fontSize: 11,
      fontWeight: "800",
    },


    levelTitle: {
      marginTop: 20,
      color:
        "#202033",
      fontSize: 20,
      fontWeight: "800",
    },


    levelDescription: {
      marginTop: 7,
      color:
        "#77778A",
      fontSize: 14,
      lineHeight: 21,
    },


    levelDivider: {
      height: 1,
      marginTop: 20,
      marginBottom: 16,
      backgroundColor:
        "#EEEEF5",
    },


    levelStats: {
      flexDirection:
        "row",
      gap: 8,
    },


    levelStat: {
      flex: 1,
    },


    smallLabel: {
      color:
        "#9999AA",
      fontSize: 11,
    },


    smallValue: {
      marginTop: 4,
      color:
        "#303044",
      fontSize: 15,
      fontWeight: "800",
    },


    startButton: {
      height: 56,
      marginTop: 24,
      borderRadius: 16,
      backgroundColor:
        "#7C6CFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },


    startButtonText: {
      color:
        "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },


    loadingContainer: {
      width: "100%",
      minHeight: 280,
      padding: 20,
      borderRadius: 24,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    gameHeader: {
      gap: 18,
      marginBottom: 24,
    },


    gameTitle: {
      marginTop: 4,
      color:
        "#202033",
      fontSize: 30,
      fontWeight: "800",
    },


    statsRow: {
      flexDirection:
        "row",
      gap: 8,
    },


    headerStat: {
      flex: 1,
      minHeight: 67,
      paddingHorizontal: 12,
      paddingVertical: 11,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      backgroundColor:
        "#FFFFFF",
      justifyContent:
        "center",
    },


    headerTimeStat: {
      flex: 1,
      minHeight: 67,
      paddingHorizontal: 12,
      paddingVertical: 11,
      borderRadius: 16,
      backgroundColor:
        "#7C6CFF",
      justifyContent:
        "center",
    },


    headerStatLabel: {
      color:
        "#9999AA",
      fontSize: 10,
    },


    headerStatValue: {
      marginTop: 3,
      color:
        "#303044",
      fontSize: 14,
      fontWeight: "800",
    },


    headerTimeLabel: {
      color:
        "rgba(255,255,255,0.75)",
      fontSize: 10,
    },


    headerTimeValue: {
      marginTop: 3,
      color:
        "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },


    pausedBox: {
      marginBottom: 18,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#FDE68A",
      backgroundColor:
        "#FFFBEB",
      alignItems:
        "center",
    },


    pausedText: {
      color:
        "#B45309",
      fontWeight: "700",
    },


    board: {
      width: "100%",
      padding: 18,
      borderRadius: 32,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      backgroundColor:
        "#FFFFFF",
    },


    roundHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 10,
    },


    roundLabel: {
      color:
        "#9999AA",
      fontSize: 11,
      fontWeight: "800",
    },


    roundValue: {
      marginTop: 3,
      color:
        "#303044",
      fontSize: 14,
      fontWeight: "800",
    },


    roundTimer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
    },


    roundTimerText: {
      color:
        "#77778A",
      fontSize: 12,
      fontWeight: "700",
    },


    progressTrack: {
      width: "100%",
      height: 8,
      marginTop: 14,
      borderRadius: 20,
      backgroundColor:
        "#F0EFF7",
      overflow:
        "hidden",
    },


    progressBar: {
      height: "100%",
      borderRadius: 20,
      backgroundColor:
        "#7C6CFF",
    },


    targetCard: {
      marginTop: 22,
      padding: 22,
      borderRadius: 28,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      backgroundColor:
        "#F7F8FC",
      alignItems:
        "center",
    },


    targetIconBox: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor:
        "#F2EEFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    targetLabel: {
      marginTop: 14,
      color:
        "#9999AA",
      fontSize: 11,
      fontWeight: "800",
    },


    targetShape: {
      height: 80,
      marginTop: 7,
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    targetName: {
      marginTop: 4,
      color:
        "#202033",
      fontSize: 18,
      fontWeight: "800",
    },


    targetDescription: {
      marginTop: 5,
      color:
        "#77778A",
      fontSize: 13,
      textAlign:
        "center",
    },


    roundTimeLeftText: {
      marginTop: 12,
      color:
        "#9999AA",
      fontSize: 11,
      fontWeight: "700",
    },


    cardsGrid: {
      width: "100%",
      marginTop: 18,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      justifyContent:
        "center",
      gap: 10,
    },


    card: {
      width: "47%",
      aspectRatio: 1,
      borderRadius: 26,
      borderWidth: 2,
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    cardPaused: {
      opacity: 0.6,
    },


    liveMetrics: {
      marginTop: 22,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      justifyContent:
        "center",
      gap: 10,
    },


    liveMetric: {
      width: "47%",
      minHeight: 70,
      borderRadius: 16,
      backgroundColor:
        "#F7F8FC",
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 10,
    },


    liveLabel: {
      color:
        "#9999AA",
      fontSize: 11,
      textAlign:
        "center",
    },


    liveValue: {
      marginTop: 4,
      color:
        "#303044",
      fontSize: 15,
      fontWeight: "800",
    },


    timeoutBox: {
      marginTop: 16,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#FFE1B8",
      backgroundColor:
        "#FFF5E8",
    },


    timeoutText: {
      color:
        "#A66A00",
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18,
      textAlign:
        "center",
    },


    resultScreen: {
      width: "100%",
    },


    resultPanel: {
      width: "100%",
      padding: 22,
      borderRadius: 32,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
    },


    resultIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor:
        "#F2EEFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    resultCategory: {
      marginTop: 18,
      color:
        "#7C6CFF",
      fontSize: 12,
      fontWeight: "800",
      textAlign:
        "center",
    },


    resultTitle: {
      marginTop: 6,
      color:
        "#202033",
      fontSize: 27,
      fontWeight: "800",
      textAlign:
        "center",
    },


    resultLevel: {
      marginTop: 8,
      color:
        "#77778A",
      fontSize: 14,
    },


    resultGrid: {
      width: "100%",
      marginTop: 24,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 10,
    },


    resultMetric: {
      width: "48%",
      minHeight: 95,
      padding: 12,
      borderRadius: 16,
      backgroundColor:
        "#F7F8FC",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    resultMetricValue: {
      marginTop: 6,
      color:
        "#303044",
      fontSize: 22,
      fontWeight: "800",
    },


    secondaryGrid: {
      width: "100%",
      marginTop: 10,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 10,
    },


    secondaryCard: {
      width: "48%",
      minHeight: 85,
      padding: 15,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      justifyContent:
        "center",
    },


    secondaryValue: {
      marginTop: 5,
      color:
        "#303044",
      fontSize: 14,
      fontWeight: "800",
    },


    insightBox: {
      width: "100%",
      marginTop: 16,
      padding: 17,
      borderRadius: 16,
      backgroundColor:
        "#F2EEFF",
    },


    insightTitle: {
      color:
        "#7C6CFF",
      fontSize: 11,
      fontWeight: "800",
    },


    insightText: {
      marginTop: 7,
      color:
        "#555568",
      fontSize: 13,
      lineHeight: 20,
    },


    restartButton: {
      width: "100%",
      height: 52,
      marginTop: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#E4E4EC",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },


    restartText: {
      color:
        "#303044",
      fontWeight: "700",
    },

  });
