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
  Apple,
  Balloon,
  Car,
  Cat,
  Cherry,
  Circle,
  Dog,
  Flower2,
  Music,
  Rocket,
  RotateCcw,
  Star,
  Sun,
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


type FinalSummary =
  GameResult & {
    correct: number;
    wrong: number;
    attempts: number;
    time: number;
    averageAttemptTime: number;
    speed: number;
  };


type MemoryMatchProps = {
  embedded?: boolean;
  paused?: boolean;
  difficulty?: string;

  onComplete?: (
    result: GameResult
  ) => void;
};


type IconComponent =
  typeof Apple;


type MemoryCard = {
  id: string;
  pairId: string;
  Icon: IconComponent;
  matched: boolean;
};


const LEVELS = {
  1: {
    name: "Easy",
    pairs: 4,
    time: 60,
    description:
      "A simple memory challenge.",
  },

  2: {
    name: "Medium",
    pairs: 8,
    time: 90,
    description:
      "A balanced working memory challenge.",
  },

  3: {
    name: "Hard",
    pairs: 12,
    time: 120,
    description:
      "A challenging memory assessment.",
  },
};


const DEFAULT_ICONS = [
  {
    id: "apple",
    Icon: Apple,
  },
  {
    id: "car",
    Icon: Car,
  },
  {
    id: "star",
    Icon: Star,
  },
  {
    id: "dog",
    Icon: Dog,
  },
  {
    id: "flower",
    Icon: Flower2,
  },
  {
    id: "balloon",
    Icon: Balloon,
  },
  {
    id: "rocket",
    Icon: Rocket,
  },
  {
    id: "ball",
    Icon: Circle,
  },
  {
    id: "cherry",
    Icon: Cherry,
  },
  {
    id: "cat",
    Icon: Cat,
  },
  {
    id: "sun",
    Icon: Sun,
  },
  {
    id: "music",
    Icon: Music,
  },
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


const createCards = (
  pairCount: number
): MemoryCard[] => {

  const selected =
    DEFAULT_ICONS.slice(
      0,
      pairCount
    );


  const duplicated =
    selected.flatMap(
      (item) => [
        {
          id:
            `${item.id}-a-${Math.random()}`,

          pairId:
            item.id,

          Icon:
            item.Icon,

          matched:
            false,
        },

        {
          id:
            `${item.id}-b-${Math.random()}`,

          pairId:
            item.id,

          Icon:
            item.Icon,

          matched:
            false,
        },
      ]
    );


  return shuffle(
    duplicated
  );

};


const calculateMetrics = ({
  correctPairs,
  wrongPairs,
  elapsedTime,
  totalPairs,
  timeLimit,
}: {
  correctPairs: number;
  wrongPairs: number;
  elapsedTime: number;
  totalPairs: number;
  timeLimit: number;
}) => {

  const attempts =
    correctPairs +
    wrongPairs;


  const accuracy =
    attempts > 0
      ? Math.min(
          100,
          Math.round(
            (
              correctPairs /
              attempts
            ) * 100
          )
        )
      : 0;


  const score =
    totalPairs > 0
      ? Math.min(
          100,
          Math.round(
            (
              correctPairs /
              totalPairs
            ) * 100
          )
        )
      : 0;


  const averageAttemptTime =
    attempts > 0
      ? Number(
          (
            elapsedTime /
            attempts
          ).toFixed(2)
        )
      : 0;


  const speed =
    elapsedTime > 0
      ? Number(
          (
            correctPairs /
            (
              elapsedTime /
              60
            )
          ).toFixed(2)
        )
      : 0;


  const timeRemaining =
    Math.max(
      0,
      timeLimit -
        elapsedTime
    );


  return {
    attempts,
    accuracy,
    score,
    averageAttemptTime,
    speed,
    timeRemaining,
  };

};


export default function MemoryMatch({
  embedded = true,
  paused = false,
  difficulty = "Level 1",
  onComplete,
}: MemoryMatchProps) {

  const [
    standaloneLevel,
    setStandaloneLevel,
  ] = useState<
    number | null
  >(null);


  const levelId =
    embedded
      ? resolveLevelId(
          difficulty
        )
      : standaloneLevel;


  const config =
    useMemo(
      () => {

        if (!levelId) {
          return null;
        }


        return LEVELS[
          levelId as keyof typeof LEVELS
        ];

      },
      [
        levelId,
      ]
    );


  const [
    cards,
    setCards,
  ] = useState<
    MemoryCard[]
  >([]);


  const [
    selectedIds,
    setSelectedIds,
  ] = useState<
    string[]
  >([]);


  const [
    correctPairs,
    setCorrectPairs,
  ] = useState(0);


  const [
    wrongPairs,
    setWrongPairs,
  ] = useState(0);


  const [
    gameTime,
    setGameTime,
  ] = useState(0);


  const [
    finished,
    setFinished,
  ] = useState(false);


  const [
    started,
    setStarted,
  ] = useState(false);


  const [
    checking,
    setChecking,
  ] = useState(false);


  const [
    finalResult,
    setFinalResult,
  ] = useState<
    FinalSummary | null
  >(null);


  const cardsRef =
    useRef<
      MemoryCard[]
    >([]);


  const correctRef =
    useRef(0);


  const wrongRef =
    useRef(0);


  const gameTimeRef =
    useRef(0);


  const completionSentRef =
    useRef(false);


  const initializedRef =
    useRef(false);


  const prepareGame =
    useCallback(() => {

      if (!config) {
        return;
      }


      const newCards =
        createCards(
          config.pairs
        );


      cardsRef.current =
        newCards;


      setCards(
        newCards
      );


      setSelectedIds(
        []
      );


      setCorrectPairs(
        0
      );


      setWrongPairs(
        0
      );


      setGameTime(
        0
      );


      setChecking(
        false
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


      gameTimeRef.current =
        0;


      completionSentRef.current =
        false;

    }, [
      config,
    ]);


  const startGame =
    useCallback(() => {

      if (!config) {
        return;
      }


      prepareGame();


      setStarted(
        true
      );


      setFinished(
        false
      );

    }, [
      config,
      prepareGame,
    ]);


  useEffect(() => {

    if (
      !embedded ||
      !config ||
      initializedRef.current
    ) {
      return;
    }


    initializedRef.current =
      true;


    startGame();

  }, [
    embedded,
    config,
    startGame,
  ]);


  const finishGame =
    useCallback(
      (
        completed: boolean
      ) => {

        if (
          completionSentRef.current ||
          !config
        ) {
          return;
        }


        completionSentRef.current =
          true;


        const finalCorrect =
          correctRef.current;


        const finalWrong =
          wrongRef.current;


        const finalTime =
          Math.min(
            config.time,
            gameTimeRef.current
          );


        const metrics =
          calculateMetrics({

            correctPairs:
              finalCorrect,

            wrongPairs:
              finalWrong,

            elapsedTime:
              finalTime,

            totalPairs:
              config.pairs,

            timeLimit:
              config.time,

          });


        const status:
          GameStatus =
            completed
              ? "Completed"
              : "Failed";


        const result:
          FinalSummary = {

          status,

          duration_seconds:
            Math.max(
              0,
              Math.ceil(
                finalTime
              )
            ),

          score:
            metrics.score,

          accuracy:
            metrics.accuracy,

          mistakes:
            finalWrong,

          reaction_time:
            null,

          correct:
            finalCorrect,

          wrong:
            finalWrong,

          attempts:
            metrics.attempts,

          time:
            finalTime,

          averageAttemptTime:
            metrics
              .averageAttemptTime,

          speed:
            metrics.speed,

          result_data: {

            domain:
              "Working Memory",

            difficulty,

            level:
              config.name,

            total_cards:
              config.pairs * 2,

            total_pairs:
              config.pairs,

            correct_pairs:
              finalCorrect,

            wrong_pairs:
              finalWrong,

            mistakes:
              finalWrong,

            attempts:
              metrics.attempts,

            completion:
              metrics.score,

            time_limit:
              config.time,

            time_remaining:
              metrics
                .timeRemaining,

            average_attempt_time:
              metrics
                .averageAttemptTime,

            speed_pairs_per_minute:
              metrics.speed,

            reaction_time:
              null,

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


        setChecking(
          false
        );


        if (onComplete) {

          onComplete({

            status:
              result.status,

            duration_seconds:
              result
                .duration_seconds,

            score:
              result.score,

            accuracy:
              result.accuracy,

            mistakes:
              result.mistakes,

            reaction_time:
              result
                .reaction_time,

            result_data:
              result.result_data,

          });

        }

      },
      [
        config,
        difficulty,
        onComplete,
      ]
    );


  useEffect(() => {

    const activeConfig =
      config;


    if (
      !started ||
      finished ||
      paused ||
      !activeConfig
    ) {
      return;
    }


    const timer =
      setInterval(
        () => {

          const nextTime =
            Math.min(
              activeConfig.time,
              gameTimeRef.current +
                1
            );


          gameTimeRef.current =
            nextTime;


          setGameTime(
            nextTime
          );

        },
        1000
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
    config,
  ]);


  useEffect(() => {

    const activeConfig =
      config;


    if (
      !started ||
      finished ||
      !activeConfig
    ) {
      return;
    }


    if (
      gameTime >=
      activeConfig.time
    ) {

      finishGame(
        false
      );

    }

  }, [
    started,
    finished,
    gameTime,
    config,
    finishGame,
  ]);


  const handleCardPress = (
    card: MemoryCard
  ) => {

    const activeConfig =
      config;


    if (
      !activeConfig ||
      paused ||
      finished ||
      checking ||
      card.matched ||
      selectedIds.includes(
        card.id
      )
    ) {
      return;
    }


    const nextSelected = [
      ...selectedIds,
      card.id,
    ];


    setSelectedIds(
      nextSelected
    );


    if (
      nextSelected.length <
      2
    ) {
      return;
    }


    setChecking(
      true
    );


    const firstCard =
      cardsRef.current.find(
        (item) =>
          item.id ===
          nextSelected[0]
      );


    const secondCard =
      cardsRef.current.find(
        (item) =>
          item.id ===
          nextSelected[1]
      );


    if (
      !firstCard ||
      !secondCard
    ) {

      setSelectedIds(
        []
      );


      setChecking(
        false
      );


      return;

    }


    if (
      firstCard.pairId ===
      secondCard.pairId
    ) {

      const updatedCards =
        cardsRef.current.map(
          (item) => {

            if (
              item.pairId ===
              firstCard.pairId
            ) {

              return {
                ...item,
                matched:
                  true,
              };

            }


            return item;

          }
        );


      cardsRef.current =
        updatedCards;


      setCards(
        updatedCards
      );


      const nextCorrect =
        correctRef.current +
        1;


      correctRef.current =
        nextCorrect;


      setCorrectPairs(
        nextCorrect
      );


      setTimeout(
        () => {

          setSelectedIds(
            []
          );


          setChecking(
            false
          );


          if (
            nextCorrect >=
            activeConfig.pairs
          ) {

            finishGame(
              true
            );

          }

        },
        350
      );


      return;

    }


    const nextWrong =
      wrongRef.current +
      1;


    wrongRef.current =
      nextWrong;


    setWrongPairs(
      nextWrong
    );


    setTimeout(
      () => {

        setSelectedIds(
          []
        );


        setChecking(
          false
        );

      },
      850
    );

  };


  const liveMetrics =
    config
      ? calculateMetrics({

          correctPairs,

          wrongPairs,

          elapsedTime:
            gameTime,

          totalPairs:
            config.pairs,

          timeLimit:
            config.time,

        })
      : {
          attempts: 0,
          accuracy: 0,
          score: 0,
          averageAttemptTime: 0,
          speed: 0,
          timeRemaining: 0,
        };


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

        <View
          style={
            styles.selectionHeader
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
            Memory Match
          </Text>


          <Text
            style={
              styles.selectionDescription
            }
          >
            Select a difficulty level before starting the assessment.
          </Text>

        </View>


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
                standaloneLevel ===
                numericId;


              return (

                <Pressable
                  key={id}
                  onPress={() => {

                    setStandaloneLevel(
                      numericId
                    );

                  }}
                  style={[
                    styles.levelCard,

                    selected &&
                      styles
                        .levelCardSelected,
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
                          styles
                            .levelNumberText
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
                      styles
                        .levelCardTitle
                    }
                  >
                    {item.name}
                  </Text>


                  <Text
                    style={
                      styles
                        .levelCardDescription
                    }
                  >
                    {item.description}
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
                        Cards
                      </Text>

                      <Text
                        style={
                          styles.smallValue
                        }
                      >
                        {item.pairs * 2}
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


        {standaloneLevel && (

          <Pressable
            onPress={
              startGame
            }
            style={
              styles.startButton
            }
          >

            <Text
              style={
                styles.startButtonText
              }
            >
              Start Assessment
            </Text>

          </Pressable>

        )}

      </View>

    );

  }


  if (
    finished &&
    finalResult
  ) {

    const insight =
      finalResult.accuracy !==
        null &&
      finalResult.accuracy >= 85

        ? "Excellent working memory accuracy."

        : finalResult.accuracy !==
            null &&
          finalResult.accuracy >= 70

        ? "Good working memory accuracy. Continue monitoring progress."

        : "The child may benefit from additional working memory assessment and practice.";


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

            <Star
              size={30}
              color="#7C6CFF"
              strokeWidth={1.8}
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
              : "ASSESSMENT FINISHED"
            }
          </Text>


          <Text
            style={
              styles.resultTitle
            }
          >
            Memory Match Results
          </Text>


          <View
            style={
              styles.resultGrid
            }
          >

            <View
              style={
                styles
                  .resultMetricCard
              }
            >

              <Text
                style={
                  styles
                    .resultMetricLabel
                }
              >
                Accuracy
              </Text>

              <Text
                style={
                  styles
                    .resultMetricValue
                }
              >
                {finalResult.accuracy ?? 0}%
              </Text>

            </View>


            <View
              style={
                styles
                  .resultMetricCard
              }
            >

              <Text
                style={
                  styles
                    .resultMetricLabel
                }
              >
                Score
              </Text>

              <Text
                style={
                  styles
                    .resultMetricValue
                }
              >
                {finalResult.score}%
              </Text>

            </View>


            <View
              style={
                styles
                  .resultMetricCard
              }
            >

              <Text
                style={
                  styles
                    .resultMetricLabel
                }
              >
                Correct
              </Text>

              <Text
                style={
                  styles
                    .resultMetricValue
                }
              >
                {finalResult.correct}
              </Text>

            </View>


            <View
              style={
                styles
                  .resultMetricCard
              }
            >

              <Text
                style={
                  styles
                    .resultMetricLabel
                }
              >
                Wrong
              </Text>

              <Text
                style={
                  styles
                    .resultMetricValue
                }
              >
                {finalResult.wrong}
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
                Attempts
              </Text>

              <Text
                style={
                  styles.secondaryValue
                }
              >
                {finalResult.attempts}
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
                {finalResult.time}s
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
                Avg. Attempt Time
              </Text>

              <Text
                style={
                  styles.secondaryValue
                }
              >
                {finalResult
                  .averageAttemptTime}s
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
                Speed
              </Text>

              <Text
                style={
                  styles.secondaryValue
                }
              >
                {finalResult.speed} pairs/min
              </Text>

            </View>

          </View>


          <View
            style={
              styles.insightCard
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
              {insight}
            </Text>

          </View>


          {!embedded && (

            <Pressable
              onPress={
                startGame
              }
              style={
                styles.restartButton
              }
            >

              <RotateCcw
                size={18}
                color="#202033"
              />

              <Text
                style={
                  styles
                    .restartButtonText
                }
              >
                Restart
              </Text>

            </Pressable>

          )}

        </View>

      </View>

    );

  }


  if (
    !started ||
    !config
  ) {
    return null;
  }


  const timeLeft =
    Math.max(
      0,
      config.time -
        gameTime
    );


  const hardMode =
    config.pairs >= 12;


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
            WORKING MEMORY
          </Text>


          <Text
            style={
              styles.gameTitle
            }
          >
            Memory Match
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
              {gameTime}s
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
        style={
          styles.board
        }
      >

        <View
          style={
            styles.cardsGrid
          }
        >

          {cards.map(
            (card) => {

              const visible =
                card.matched ||
                selectedIds.includes(
                  card.id
                );


              const Icon =
                card.Icon;


              return (

                <Pressable
                  key={
                    card.id
                  }
                  disabled={
                    paused ||
                    finished ||
                    checking ||
                    card.matched
                  }
                  onPress={() => {

                    handleCardPress(
                      card
                    );

                  }}
                  style={[
                    styles.card,

                    hardMode
                      ? styles
                          .cardSixColumns
                      : styles
                          .cardFourColumns,

                    visible
                      ? styles.cardVisible
                      : styles.cardHidden,

                    paused &&
                      styles.cardPaused,
                  ]}
                >

                  {visible ? (

                    <Icon
                      size={
                        hardMode
                          ? 27
                          : 34
                      }
                      strokeWidth={
                        1.8
                      }
                      color="#7C6CFF"
                    />

                  ) : (

                    <View
                      style={
                        styles.hiddenCircle
                      }
                    >

                      <View
                        style={
                          styles.hiddenDot
                        }
                      />

                    </View>

                  )}

                </Pressable>

              );

            }
          )}

        </View>

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
              styles.liveMetricLabel
            }
          >
            Attempts
          </Text>

          <Text
            style={
              styles.liveMetricValue
            }
          >
            {liveMetrics.attempts}
          </Text>

        </View>


        <View
          style={
            styles.liveMetric
          }
        >

          <Text
            style={
              styles.liveMetricLabel
            }
          >
            Correct
          </Text>

          <Text
            style={
              styles.liveMetricValue
            }
          >
            {correctPairs}
          </Text>

        </View>


        <View
          style={
            styles.liveMetric
          }
        >

          <Text
            style={
              styles.liveMetricLabel
            }
          >
            Wrong
          </Text>

          <Text
            style={
              styles.liveMetricValue
            }
          >
            {wrongPairs}
          </Text>

        </View>


        <View
          style={
            styles.liveMetric
          }
        >

          <Text
            style={
              styles.liveMetricLabel
            }
          >
            Accuracy
          </Text>

          <Text
            style={
              styles.liveMetricValue
            }
          >
            {liveMetrics.accuracy}%
          </Text>

        </View>


        <View
          style={
            styles.liveMetric
          }
        >

          <Text
            style={
              styles.liveMetricLabel
            }
          >
            Score
          </Text>

          <Text
            style={
              styles.liveMetricValue
            }
          >
            {liveMetrics.score}%
          </Text>

        </View>

      </View>

    </View>

  );

}


const styles =
  StyleSheet.create({

    gameScreen: {
      width: "100%",
    },

    standaloneScreen: {
      width: "100%",
      minHeight: "100%",
      backgroundColor:
        "#F7F8FC",
      padding: 20,
    },

    selectionHeader: {
      marginBottom: 28,
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
      gap: 16,
    },

    levelCard: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E8E8F0",
      borderRadius: 28,
      padding: 22,
    },

    levelCardSelected: {
      backgroundColor:
        "#F5F2FF",
      borderColor:
        "#7C6CFF",
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
      fontWeight:
        "800",
      fontSize: 16,
    },

    selectedText: {
      color:
        "#7C6CFF",
      fontSize: 11,
      fontWeight:
        "800",
    },

    levelCardTitle: {
      marginTop: 20,
      color:
        "#202033",
      fontSize: 20,
      fontWeight:
        "800",
    },

    levelCardDescription: {
      marginTop: 7,
      color:
        "#77778A",
      fontSize: 14,
      lineHeight: 21,
    },

    levelDivider: {
      height: 1,
      backgroundColor:
        "#EEEEF5",
      marginTop: 20,
      marginBottom: 16,
    },

    levelStats: {
      flexDirection:
        "row",
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
        "#202033",
      fontWeight:
        "800",
      fontSize: 15,
    },

    startButton: {
      height: 56,
      borderRadius: 16,
      backgroundColor:
        "#7C6CFF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 24,
    },

    startButtonText: {
      color:
        "#FFFFFF",
      fontWeight:
        "700",
      fontSize: 15,
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
      fontWeight:
        "800",
    },

    statsRow: {
      flexDirection:
        "row",
      gap: 8,
    },

    headerStat: {
      flex: 1,
      minHeight: 67,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      backgroundColor:
        "#FFFFFF",
      paddingHorizontal: 12,
      paddingVertical: 11,
      justifyContent:
        "center",
    },

    headerTimeStat: {
      flex: 1,
      minHeight: 67,
      borderRadius: 16,
      backgroundColor:
        "#7C6CFF",
      paddingHorizontal: 12,
      paddingVertical: 11,
      justifyContent:
        "center",
    },

    headerStatLabel: {
      color:
        "#9999AA",
      fontSize: 10,
    },

    headerStatValue: {
      color:
        "#202033",
      fontSize: 14,
      fontWeight:
        "800",
      marginTop: 3,
    },

    headerTimeLabel: {
      color:
        "rgba(255,255,255,0.75)",
      fontSize: 10,
    },

    headerTimeValue: {
      color:
        "#FFFFFF",
      fontSize: 14,
      fontWeight:
        "800",
      marginTop: 3,
    },

    pausedBox: {
      marginBottom: 18,
      backgroundColor:
        "#FFFBEB",
      borderWidth: 1,
      borderColor:
        "#FDE68A",
      borderRadius: 16,
      padding: 14,
      alignItems:
        "center",
    },

    pausedText: {
      color:
        "#B45309",
      fontWeight:
        "700",
    },

    board: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 32,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      padding: 16,
    },

    cardsGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      justifyContent:
        "center",
      gap: 8,
    },

    card: {
      aspectRatio: 1,
      borderRadius: 22,
      borderWidth: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    cardFourColumns: {
      width: "22.5%",
    },

    cardSixColumns: {
      width: "14.5%",
      borderRadius: 17,
    },

    cardHidden: {
      backgroundColor:
        "#7C6CFF",
      borderColor:
        "#6E5FF0",
    },

    cardVisible: {
      backgroundColor:
        "#F2EEFF",
      borderColor:
        "#D8D0FF",
    },

    cardPaused: {
      opacity: 0.6,
    },

    hiddenCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.30)",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    hiddenDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        "rgba(255,255,255,0.80)",
    },

    liveMetrics: {
      marginTop: 20,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      justifyContent:
        "center",
      gap: 18,
    },

    liveMetric: {
      alignItems:
        "center",
      minWidth: 52,
    },

    liveMetricLabel: {
      color:
        "#9999AA",
      fontSize: 11,
    },

    liveMetricValue: {
      color:
        "#202033",
      fontSize: 14,
      fontWeight:
        "800",
      marginTop: 2,
    },

    resultScreen: {
      width: "100%",
    },

    resultPanel: {
      width: "100%",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 32,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      padding: 22,
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
      fontWeight:
        "800",
      textAlign:
        "center",
    },

    resultTitle: {
      marginTop: 6,
      color:
        "#202033",
      fontSize: 27,
      fontWeight:
        "800",
      textAlign:
        "center",
    },

    resultGrid: {
      width: "100%",
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 10,
      marginTop: 24,
    },

    resultMetricCard: {
      width: "48%",
      minHeight: 95,
      borderRadius: 16,
      backgroundColor:
        "#F7F8FC",
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 12,
    },

    resultMetricLabel: {
      color:
        "#9999AA",
      fontSize: 11,
    },

    resultMetricValue: {
      marginTop: 6,
      color:
        "#202033",
      fontSize: 22,
      fontWeight:
        "800",
    },

    secondaryGrid: {
      width: "100%",
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 10,
      marginTop: 10,
    },

    secondaryCard: {
      width: "48%",
      minHeight: 85,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      padding: 15,
      justifyContent:
        "center",
    },

    secondaryValue: {
      marginTop: 5,
      color:
        "#202033",
      fontSize: 14,
      fontWeight:
        "800",
    },

    insightCard: {
      width: "100%",
      marginTop: 16,
      backgroundColor:
        "#F2EEFF",
      borderRadius: 16,
      padding: 17,
    },

    insightTitle: {
      color:
        "#7C6CFF",
      fontSize: 11,
      fontWeight:
        "800",
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
      height: 54,
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

    restartButtonText: {
      color:
        "#202033",
      fontWeight:
        "700",
    },

  });