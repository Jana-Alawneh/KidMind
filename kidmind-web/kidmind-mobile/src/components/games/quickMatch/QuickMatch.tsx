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

  symbol: string;
};


type Card = {
  id: string;

  label: string;

  symbol: string;

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
    symbol: "●",
  },

  {
    id: "square",
    label: "Square",
    symbol: "■",
  },

  {
    id: "triangle",
    label: "Triangle",
    symbol: "▲",
  },

  {
    id: "diamond",
    label: "Diamond",
    symbol: "◆",
  },

  {
    id: "star",
    label: "Star",
    symbol: "★",
  },

  {
    id: "hexagon",
    label: "Hexagon",
    symbol: "⬢",
  },

  {
    id: "heart",
    label: "Heart",
    symbol: "♥",
  },

  {
    id: "cross",
    label: "Cross",
    symbol: "✚",
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
            styles.iconBox
          }
        >

          <Zap
            size={34}
            color="#7B6EF6"
          />

        </View>


        <Text
          style={
            styles.title
          }
        >
          Quick Match
        </Text>


        <Text
          style={
            styles.description
          }
        >
          Find the matching shape as quickly and accurately as possible.
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
                      styles.levelName,

                      selected &&
                        styles.levelNameSelected,
                    ]}
                  >
                    {item.name}
                  </Text>


                  <Text
                    style={
                      styles.levelDetails
                    }
                  >
                    {item.rounds} rounds
                  </Text>


                  <Text
                    style={
                      styles.levelDetails
                    }
                  >
                    {item.cards} cards
                  </Text>


                  <Text
                    style={
                      styles.levelDetails
                    }
                  >
                    {item.reactionTime}s per round
                  </Text>


                  <Text
                    style={
                      styles.levelDetails
                    }
                  >
                    {item.time}s total
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


    return (

      <View
        style={
          styles.resultContainer
        }
      >

        <View
          style={
            styles.iconBox
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
          Quick Match Results
        </Text>


        <Text
          style={
            styles.resultStatus
          }
        >
          {finalResult.status}
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
              {Number(
                resultData
                  ?.missed_rounds ||
                0
              )}
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
            styles.description
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
            PROCESSING SPEED
          </Text>


          <Text
            style={
              styles.title
            }
          >
            Quick Match
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

          <Clock3
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
              {gameTime.toFixed(1)}s
            </Text>

          </View>

        </View>


        <View
          style={
            styles.timeCard
          }
        >

          <Clock3
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
          styles.roundHeader
        }
      >

        <Text
          style={
            styles.roundText
          }
        >
          Round {round + 1} / {config.rounds}
        </Text>


        <Text
          style={
            styles.roundText
          }
        >
          {roundTimeLeft.toFixed(1)}s left
        </Text>

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
            size={22}
            color="#7B6EF6"
          />

        </View>


        <Text
          style={
            styles.targetLabel
          }
        >
          FIND THIS SHAPE
        </Text>


        <Text
          style={[
            styles.targetSymbol,

            {
              color:
                currentRound.targetColor,
            },
          ]}
        >
          {target?.symbol}
        </Text>


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
          Choose the identical shape and color below.
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

                <Text
                  style={[
                    styles.cardSymbol,

                    {
                      color:
                        card.color,
                    },
                  ]}
                >
                  {card.symbol}
                </Text>

              </Pressable>

            );

          }
        )}

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
            styles.scoreBox
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


    iconBox: {
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

      textAlign:
        "center",

      lineHeight: 21,

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


    levelName: {
      color: "#202033",

      fontSize: 17,

      fontWeight: "800",
    },


    levelNameSelected: {
      color: "#6D5CE7",
    },


    levelDetails: {
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


    roundHeader: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginTop: 20,
    },


    roundText: {
      color: "#64748B",

      fontSize: 12,

      fontWeight: "700",
    },


    progressTrack: {
      width: "100%",

      height: 7,

      borderRadius: 20,

      backgroundColor:
        "#F0EFF7",

      overflow:
        "hidden",

      marginTop: 8,
    },


    progressBar: {
      height: "100%",

      borderRadius: 20,

      backgroundColor:
        "#7B6EF6",
    },


    targetCard: {
      marginTop: 20,

      padding: 20,

      borderRadius: 22,

      backgroundColor:
        "#F7F8FC",

      borderWidth: 1,

      borderColor:
        "#ECECF4",

      alignItems:
        "center",
    },


    targetIconBox: {
      width: 46,

      height: 46,

      borderRadius: 15,

      backgroundColor:
        "#EEE9FF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    targetLabel: {
      color: "#9999AA",

      fontSize: 11,

      fontWeight: "800",

      marginTop: 12,
    },


    targetSymbol: {
      fontSize: 72,

      fontWeight: "900",

      lineHeight: 82,

      marginTop: 5,
    },


    targetName: {
      color: "#202033",

      fontSize: 18,

      fontWeight: "800",
    },


    targetDescription: {
      color: "#77778A",

      fontSize: 12,

      textAlign:
        "center",

      marginTop: 5,
    },


    cardsGrid: {
      width: "100%",

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "center",

      gap: 9,

      marginTop: 18,
    },


    card: {
      width: "22%",

      aspectRatio: 1,

      borderRadius: 18,

      borderWidth: 2,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    cardPaused: {
      opacity: 0.55,
    },


    cardSymbol: {
      fontSize: 37,

      fontWeight: "900",
    },


    timeoutBox: {
      marginTop: 14,

      padding: 13,

      borderRadius: 15,

      backgroundColor:
        "#FFF5E8",

      borderWidth: 1,

      borderColor:
        "#FFE1B8",
    },


    timeoutText: {
      color: "#A66A00",

      textAlign:
        "center",

      fontSize: 12,

      fontWeight: "700",
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


    scoreBox: {
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

      fontSize: 15,

      fontWeight: "800",

      marginTop: 3,
    },

  });