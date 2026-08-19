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
  Grid3X3,
  Play,
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


type PuzzlePathProps = {
  embedded?: boolean;

  paused?: boolean;

  difficulty?: string;

  onComplete?: (
    result: GameResult
  ) => void;
};


type Tile = {
  id: number;
};


type ShapeItem = {
  name: string;

  symbol: string;
};


const LEVELS = {
  1: {
    name: "Easy",
    size: 2,
    time: 60,
  },

  2: {
    name: "Medium",
    size: 3,
    time: 90,
  },

  3: {
    name: "Hard",
    size: 4,
    time: 120,
  },
};


const SHAPES: ShapeItem[] = [
  {
    name: "Circle",
    symbol: "●",
  },

  {
    name: "Triangle",
    symbol: "▲",
  },

  {
    name: "Square",
    symbol: "■",
  },

  {
    name: "Diamond",
    symbol: "◆",
  },

  {
    name: "Rectangle",
    symbol: "▬",
  },

  {
    name: "Star",
    symbol: "★",
  },

  {
    name: "Hexagon",
    symbol: "⬢",
  },

  {
    name: "Plus",
    symbol: "✚",
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


const createPuzzle = (
  size: number
) => {

  const total =
    size * size;


  const solved =
    Array.from(
      {
        length: total,
      },
      (
        _,
        index
      ) => ({
        id: index,
      })
    );


  let result =
    shuffle(
      solved
    );


  const alreadySolved =
    result.every(
      (
        tile,
        index
      ) =>
        tile.id ===
        index
    );


  if (
    alreadySolved &&
    result.length > 1
  ) {

    const temporary =
      result[0];


    result[0] =
      result[1];


    result[1] =
      temporary;

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


const countCorrectPieces = (
  tiles: Tile[]
) => {

  return tiles.reduce(
    (
      count,
      tile,
      index
    ) => {

      if (
        tile.id === index
      ) {
        return count + 1;
      }


      return count;

    },
    0
  );

};


const areNeighbors = (
  firstIndex: number,
  secondIndex: number,
  size: number
) => {

  const firstRow =
    Math.floor(
      firstIndex / size
    );


  const secondRow =
    Math.floor(
      secondIndex / size
    );


  const sameRow =
    firstRow ===
      secondRow &&
    Math.abs(
      firstIndex -
      secondIndex
    ) === 1;


  const vertical =
    Math.abs(
      firstIndex -
      secondIndex
    ) === size;


  return (
    sameRow ||
    vertical
  );

};


export default function PuzzlePath({
  embedded = true,
  paused = false,
  difficulty = "Level 1",
  onComplete,
}: PuzzlePathProps) {

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
    completed,
    setCompleted,
  ] = useState(false);


  const [
    tiles,
    setTiles,
  ] = useState<Tile[]>(
    []
  );


  const [
    selectedTile,
    setSelectedTile,
  ] = useState<number | null>(
    null
  );


  const [
    moves,
    setMoves,
  ] = useState(0);


  const [
    errors,
    setErrors,
  ] = useState(0);


  const [
    gameTime,
    setGameTime,
  ] = useState(0);


  const [
    shape,
    setShape,
  ] = useState<ShapeItem>(
    SHAPES[0]
  );


  const [
    finalResult,
    setFinalResult,
  ] = useState<GameResult | null>(
    null
  );


  const tilesRef =
    useRef<Tile[]>(
      []
    );


  const movesRef =
    useRef(0);


  const errorsRef =
    useRef(0);


  const gameTimeRef =
    useRef(0);


  const completionSentRef =
    useRef(false);


  const initializedRef =
    useRef(false);


  const prepareGame =
    useCallback(() => {

      const newTiles =
        createPuzzle(
          config.size
        );


      const randomShape =
        SHAPES[
          Math.floor(
            Math.random() *
            SHAPES.length
          )
        ];


      tilesRef.current =
        newTiles;


      setTiles(
        newTiles
      );


      setShape(
        randomShape
      );


      setSelectedTile(
        null
      );


      setMoves(
        0
      );


      setErrors(
        0
      );


      setGameTime(
        0
      );


      setFinished(
        false
      );


      setCompleted(
        false
      );


      setFinalResult(
        null
      );


      movesRef.current =
        0;


      errorsRef.current =
        0;


      gameTimeRef.current =
        0;


      completionSentRef.current =
        false;

    }, [
      config.size,
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
        wasCompleted: boolean,
        finalTiles?: Tile[]
      ) => {

        if (
          completionSentRef.current
        ) {
          return;
        }


        completionSentRef.current =
          true;


        const currentTiles =
          finalTiles ||
          tilesRef.current;


        const finalMoves =
          movesRef.current;


        const finalErrors =
          errorsRef.current;


        const attempts =
          finalMoves +
          finalErrors;


        const totalPieces =
          config.size *
          config.size;


        const currentCorrectPieces =
          countCorrectPieces(
            currentTiles
          );


        const correctPieces =
          wasCompleted
            ? totalPieces
            : currentCorrectPieces;


        const score =
          totalPieces > 0
            ? Math.min(
                100,
                Math.round(
                  (
                    correctPieces /
                    totalPieces
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
                    finalMoves /
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
            wasCompleted
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
            finalErrors,

          reaction_time:
            null,

          result_data: {
            domain:
              "Visual Spatial Skills",

            difficulty,

            level:
              config.name,

            shape:
              shape.name,

            puzzle_size:
              `${config.size}x${config.size}`,

            total_pieces:
              totalPieces,

            correct_pieces:
              correctPieces,

            moves:
              finalMoves,

            errors:
              finalErrors,

            mistakes:
              finalErrors,

            attempts,

            time_limit:
              config.time,

            time_remaining:
              Math.max(
                0,
                config.time -
                  finalTime
              ),

            completed:
              wasCompleted,

            result_status:
              status,
          },
        };


        setCompleted(
          wasCompleted
        );


        setFinished(
          true
        );


        setFinalResult(
          result
        );


        setSelectedTile(
          null
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
        shape.name,
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


  const handleTilePress = (
    index: number
  ) => {

    if (
      paused ||
      finished
    ) {
      return;
    }


    if (
      selectedTile === null
    ) {

      setSelectedTile(
        index
      );


      return;

    }


    if (
      selectedTile ===
      index
    ) {

      setSelectedTile(
        null
      );


      return;

    }


    const validMove =
      areNeighbors(
        selectedTile,
        index,
        config.size
      );


    if (!validMove) {

      const nextErrors =
        errorsRef.current +
        1;


      errorsRef.current =
        nextErrors;


      setErrors(
        nextErrors
      );


      setSelectedTile(
        null
      );


      return;

    }


    const nextTiles = [
      ...tilesRef.current,
    ];


    const temporary =
      nextTiles[
        selectedTile
      ];


    nextTiles[
      selectedTile
    ] =
      nextTiles[
        index
      ];


    nextTiles[
      index
    ] =
      temporary;


    const nextMoves =
      movesRef.current +
      1;


    movesRef.current =
      nextMoves;


    tilesRef.current =
      nextTiles;


    setMoves(
      nextMoves
    );


    setTiles(
      nextTiles
    );


    setSelectedTile(
      null
    );


    const solved =
      nextTiles.every(
        (
          tile,
          tileIndex
        ) =>
          tile.id ===
          tileIndex
      );


    if (solved) {

      setTimeout(
        () => {

          finishGame(
            true,
            nextTiles
          );

        },
        250
      );

    }

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


    setCompleted(
      false
    );


    setTiles(
      []
    );


    setSelectedTile(
      null
    );


    setMoves(
      0
    );


    setErrors(
      0
    );


    setGameTime(
      0
    );


    setFinalResult(
      null
    );

  };


  const restartGame =
    () => {

      startGame();

  };


  const totalPieces =
    config.size *
    config.size;


  const correctPieces =
    countCorrectPieces(
      tiles
    );


  const attempts =
    moves +
    errors;


  const liveScore =
    totalPieces > 0
      ? Math.min(
          100,
          Math.round(
            (
              correctPieces /
              totalPieces
            ) * 100
          )
        )
      : 0;


  const liveAccuracy =
    attempts > 0
      ? Math.min(
          100,
          Math.round(
            (
              moves /
              attempts
            ) * 100
          )
        )
      : 0;


  const timeLeft =
    Math.max(
      0,
      config.time -
        gameTime
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

          <Grid3X3
            size={34}
            color="#7B6EF6"
          />

        </View>


        <Text
          style={
            styles.title
          }
        >
          Puzzle Path
        </Text>


        <Text
          style={
            styles.description
          }
        >
          Arrange the puzzle pieces in the correct order using neighboring swaps.
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
                    {item.size}x{item.size} puzzle
                  </Text>


                  <Text
                    style={
                      styles.levelDetails
                    }
                  >
                    {item.time}s
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
            styles.iconBox
          }
        >

          <Trophy
            size={34}
            color={
              completed
                ? "#7B6EF6"
                : "#EF6A8A"
            }
          />

        </View>


        <Text
          style={
            styles.title
          }
        >
          Puzzle Path Results
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
              Moves
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {moves}
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
              Errors
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {errors}
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
            VISUAL SPATIAL SKILLS
          </Text>


          <Text
            style={
              styles.title
            }
          >
            Puzzle Path
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


      <View
        style={
          styles.targetCard
        }
      >

        <Text
          style={
            styles.targetLabel
          }
        >
          TARGET SHAPE
        </Text>


        <Text
          style={
            styles.targetShape
          }
        >
          {shape.symbol}
        </Text>


        <Text
          style={
            styles.targetName
          }
        >
          {shape.name}
        </Text>


        <Text
          style={
            styles.targetInstruction
          }
        >
          Arrange the numbered pieces from 1 to {totalPieces}.
        </Text>

      </View>


      <View
        style={[
          styles.puzzleGrid,

          {
            gap:
              config.size === 4
                ? 6
                : 9,
          },
        ]}
      >

        {tiles.map(
          (
            tile,
            index
          ) => {

            const selected =
              selectedTile ===
              index;


            const correct =
              tile.id ===
              index;


            const tileWidth =
              config.size === 2
                ? "47%"
                : config.size === 3
                ? "30%"
                : "22%";


            return (

              <Pressable
                key={
                  `${tile.id}-${index}`
                }
                onPress={() => {

                  handleTilePress(
                    index
                  );

                }}
                disabled={
                  paused ||
                  finished
                }
                style={[
                  styles.tile,

                  {
                    width:
                      tileWidth,
                  },

                  selected &&
                    styles.tileSelected,

                  correct &&
                    styles.tileCorrect,

                  paused &&
                    styles.tilePaused,
                ]}
              >

                <Text
                  style={[
                    styles.tileShape,

                    config.size === 4 &&
                      styles.tileShapeSmall,
                  ]}
                >
                  {shape.symbol}
                </Text>


                <Text
                  style={[
                    styles.tileNumber,

                    config.size === 4 &&
                      styles.tileNumberSmall,
                  ]}
                >
                  {tile.id + 1}
                </Text>

              </Pressable>

            );

          }
        )}

      </View>


      <Text
        style={
          styles.instruction
        }
      >
        Tap one piece, then tap a neighboring piece to swap them.
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
            Correct Pieces
          </Text>

          <Text
            style={
              styles.metricValue
            }
          >
            {correctPieces}/{totalPieces}
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
            Moves
          </Text>

          <Text
            style={
              styles.metricValue
            }
          >
            {moves}
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
            Errors
          </Text>

          <Text
            style={
              styles.metricValue
            }
          >
            {errors}
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


    targetCard: {
      marginTop: 18,

      padding: 18,

      borderRadius: 22,

      backgroundColor:
        "#F7F5FF",

      borderWidth: 1,

      borderColor:
        "#E5E1FF",

      alignItems:
        "center",
    },


    targetLabel: {
      color: "#7B6EF6",

      fontSize: 11,

      fontWeight: "800",
    },


    targetShape: {
      color: "#7B6EF6",

      fontSize: 56,

      marginTop: 5,
    },


    targetName: {
      color: "#202033",

      fontSize: 17,

      fontWeight: "800",

      marginTop: 2,
    },


    targetInstruction: {
      color: "#64748B",

      fontSize: 12,

      textAlign:
        "center",

      marginTop: 6,
    },


    puzzleGrid: {
      width: "100%",

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "center",

      marginTop: 20,
    },


    tile: {
      aspectRatio: 1,

      borderRadius: 18,

      borderWidth: 2,

      borderColor:
        "#E7E7F0",

      backgroundColor:
        "#FFFFFF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    tileSelected: {
      borderColor:
        "#7B6EF6",

      backgroundColor:
        "#EEE9FF",
    },


    tileCorrect: {
      borderColor:
        "#A7E3BD",

      backgroundColor:
        "#F0FDF4",
    },


    tilePaused: {
      opacity: 0.55,
    },


    tileShape: {
      color: "#7B6EF6",

      fontSize: 28,
    },


    tileShapeSmall: {
      fontSize: 21,
    },


    tileNumber: {
      color: "#202033",

      fontSize: 20,

      fontWeight: "900",

      marginTop: 3,
    },


    tileNumberSmall: {
      fontSize: 16,
    },


    instruction: {
      color: "#64748B",

      textAlign:
        "center",

      fontSize: 12,

      lineHeight: 18,

      marginTop: 14,
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

  });