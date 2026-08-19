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
  Brain,
  Clock3,
  RotateCcw,
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


type MemoryMatchProps = {
  embedded?: boolean;

  paused?: boolean;

  difficulty?: string;

  onComplete?: (
    result: GameResult
  ) => void;
};


type Card = {
  id: string;

  pairId: number;

  symbol: string;

  matched: boolean;
};


const LEVELS = {
  1: {
    name: "Easy",
    pairs: 4,
    time: 60,
  },

  2: {
    name: "Medium",
    pairs: 8,
    time: 90,
  },

  3: {
    name: "Hard",
    pairs: 12,
    time: 120,
  },
};


const SYMBOLS = [
  "🍎",
  "🚗",
  "⭐",
  "🐶",
  "🌸",
  "🎈",
  "🚀",
  "⚽",
  "🍒",
  "🐱",
  "☀️",
  "🎵",
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
): Card[] => {

  const selectedSymbols =
    SYMBOLS.slice(
      0,
      pairCount
    );


  const cards =
    selectedSymbols.flatMap(
      (
        symbol,
        pairId
      ) => [
        {
          id:
            `${pairId}-a-${Math.random()}`,

          pairId,

          symbol,

          matched: false,
        },

        {
          id:
            `${pairId}-b-${Math.random()}`,

          pairId,

          symbol,

          matched: false,
        },
      ]
    );


  return shuffle(
    cards
  );

};


export default function MemoryMatch({
  embedded = true,
  paused = false,
  difficulty = "Level 1",
  onComplete,
}: MemoryMatchProps) {

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
    cards,
    setCards,
  ] = useState<Card[]>(
    []
  );


  const [
    selectedIds,
    setSelectedIds,
  ] = useState<string[]>(
    []
  );


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
  ] = useState<GameResult | null>(
    null
  );


  const cardsRef =
    useRef<Card[]>(
      []
    );


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
      config.pairs,
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
        completed: boolean
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


        const attempts =
          finalCorrect +
          finalWrong;


        const score =
          config.pairs > 0
            ? Math.min(
                100,
                Math.round(
                  (
                    finalCorrect /
                    config.pairs
                  ) * 100
                )
              )
            : 0;


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


        const finalTime =
          Math.min(
            config.time,
            gameTimeRef.current
          );


        const status:
          GameStatus =
            completed
              ? "Completed"
              : "Failed";


        const result:
          GameResult = {

          status,

          duration_seconds:
            Math.max(
              0,
              Math.ceil(
                finalTime
              )
            ),

          score,

          accuracy,

          mistakes:
            finalWrong,

          reaction_time:
            null,

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

            attempts,

            completion:
              score,

            time_limit:
              config.time,

            time_remaining:
              Math.max(
                0,
                Number(
                  (
                    config.time -
                    finalTime
                  ).toFixed(
                    1
                  )
                )
              ),

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
    config.time,
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
        false
      );

    }

  }, [
    started,
    finished,
    gameTime,
    config.time,
    finishGame,
  ]);


  const handleCardPress = (
    card: Card
  ) => {

    if (
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
                matched: true,
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
            nextCorrect ===
            config.pairs
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
      650
    );

  };


  const attempts =
    correctPairs +
    wrongPairs;


  const liveAccuracy =
    attempts > 0
      ? Math.round(
          (
            correctPairs /
            attempts
          ) * 100
        )
      : 0;


  const liveScore =
    config.pairs > 0
      ? Math.round(
          (
            correctPairs /
            config.pairs
          ) * 100
        )
      : 0;


  const timeLeft =
    Math.max(
      0,
      config.time -
      gameTime
    );


  if (
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

          <Brain
            size={34}
            color="#7B6EF6"
          />

        </View>


        <Text
          style={
            styles.title
          }
        >
          Memory Match
        </Text>


        <Text
          style={
            styles.description
          }
        >
          Match identical cards and test working memory.
        </Text>


        <View
          style={
            styles.levelInfo
          }
        >

          <Text
            style={
              styles.levelName
            }
          >
            {config.name}
          </Text>


          <Text
            style={
              styles.levelDetails
            }
          >
            {config.pairs} pairs · {config.time}s
          </Text>

        </View>


        <Pressable
          onPress={
            startGame
          }
          style={
            styles.primaryButton
          }
        >

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
          Memory Match Results
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
              {correctPairs}
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
              {wrongPairs}
            </Text>

          </View>

        </View>


        {!embedded && (

          <Pressable
            onPress={
              startGame
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
              styles.title
            }
          >
            Memory Match
          </Text>

        </View>


        <View
          style={
            styles.levelBadge
          }
        >

          <Text
            style={
              styles.levelBadgeLabel
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
              {gameTime}s
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


      <Text
        style={
          styles.instruction
        }
      >
        Find all matching pairs
      </Text>


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

                  visible
                    ? styles.cardVisible
                    : styles.cardHidden,

                  config.pairs >= 12
                    ? styles.cardHard
                    : config.pairs >= 8
                    ? styles.cardMedium
                    : styles.cardEasy,
                ]}
              >

                <Text
                  style={
                    visible
                      ? styles.cardSymbol
                      : styles.cardQuestion
                  }
                >
                  {visible
                    ? card.symbol
                    : "?"}
                </Text>

              </Pressable>

            );

          }
        )}

      </View>


      <View
        style={
          styles.metricsRow
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
            {correctPairs}
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
            {wrongPairs}
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
            styles.metricBox
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

      marginTop: 6,
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


    levelInfo: {
      width: "100%",

      marginTop: 22,

      padding: 18,

      borderRadius: 18,

      backgroundColor:
        "#F7F8FC",

      alignItems:
        "center",
    },


    levelName: {
      color: "#202033",

      fontSize: 20,

      fontWeight: "800",
    },


    levelDetails: {
      color: "#77778A",

      marginTop: 5,
    },


    primaryButton: {
      width: "100%",

      height: 52,

      borderRadius: 16,

      backgroundColor:
        "#7B6EF6",

      alignItems:
        "center",

      justifyContent:
        "center",

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


    levelBadge: {
      paddingHorizontal: 13,

      paddingVertical: 8,

      borderRadius: 15,

      backgroundColor:
        "#EEE9FF",
    },


    levelBadgeLabel: {
      color: "#6D5CE7",

      fontWeight: "800",

      fontSize: 12,
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


    instruction: {
      color: "#202033",

      fontSize: 17,

      fontWeight: "800",

      textAlign:
        "center",

      marginTop: 22,

      marginBottom: 15,
    },


    cardsGrid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "center",

      gap: 9,
    },


    card: {
      borderRadius: 16,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,
    },


    cardEasy: {
      width: "22%",

      aspectRatio: 0.82,
    },


    cardMedium: {
      width: "22%",

      aspectRatio: 0.88,
    },


    cardHard: {
      width: "22%",

      aspectRatio: 0.92,
    },


    cardHidden: {
      backgroundColor:
        "#7B6EF6",

      borderColor:
        "#6959F5",
    },


    cardVisible: {
      backgroundColor:
        "#F5F2FF",

      borderColor:
        "#D8D0FF",
    },


    cardSymbol: {
      fontSize: 29,
    },


    cardQuestion: {
      color: "#FFFFFF",

      fontSize: 25,

      fontWeight: "900",
    },


    metricsRow: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap: 8,

      marginTop: 22,
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

  });