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
  RotateCcw,
} from "lucide-react-native";

import Svg, {
  Circle,
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


type FinalResult =
  GameResult & {
    moves: number;

    errors: number;

    attempts: number;

    correctPieces: number;

    totalPieces: number;

    time: number;

    shape: string;

    recommendation: string;
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
  },

  {
    name: "Triangle",
  },

  {
    name: "Square",
  },

  {
    name: "Diamond",
  },

  {
    name: "Rectangle",
  },

  {
    name: "Star",
  },

  {
    name: "Hexagon",
  },

  {
    name: "Plus",
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
): Tile[] => {

  const total =
    size * size;


  const pieces =
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


  const shuffled =
    shuffle(
      pieces
    );


  const alreadySolved =
    shuffled.every(
      (
        piece,
        index
      ) =>
        piece.id ===
        index
    );


  if (
    alreadySolved &&
    shuffled.length > 1
  ) {

    const first =
      shuffled[0];


    shuffled[0] =
      shuffled[1];


    shuffled[1] =
      first;

  }


  return shuffled;

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
      total,
      piece,
      index
    ) =>
      piece.id === index
        ? total + 1
        : total,
    0
  );

};


const areNeighbors = (
  firstIndex: number,
  secondIndex: number,
  size: number
) => {

  const difference =
    Math.abs(
      firstIndex -
      secondIndex
    );


  const firstRow =
    Math.floor(
      firstIndex /
      size
    );


  const secondRow =
    Math.floor(
      secondIndex /
      size
    );


  const horizontal =
    difference === 1 &&
    firstRow ===
      secondRow;


  const vertical =
    difference ===
    size;


  return (
    horizontal ||
    vertical
  );

};


const renderShapeContent = (
  shapeName: string
) => {

  if (
    shapeName === "Circle"
  ) {

    return (
      <>
        <Circle
          cx="50"
          cy="50"
          r="34"
          fill="#7C6CFF"
        />

        <Circle
          cx="50"
          cy="50"
          r="16"
          fill="#A59AFF"
        />
      </>
    );

  }


  if (
    shapeName === "Triangle"
  ) {

    return (
      <>
        <Polygon
          points="50,8 92,88 8,88"
          fill="#7C6CFF"
        />

        <Polygon
          points="50,30 70,68 30,68"
          fill="#A59AFF"
        />
      </>
    );

  }


  if (
    shapeName === "Square"
  ) {

    return (
      <>
        <Rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="8"
          fill="#7C6CFF"
        />

        <Rect
          x="30"
          y="30"
          width="40"
          height="40"
          rx="5"
          fill="#A59AFF"
        />
      </>
    );

  }


  if (
    shapeName === "Diamond"
  ) {

    return (
      <>
        <Polygon
          points="50,7 93,50 50,93 7,50"
          fill="#7C6CFF"
        />

        <Polygon
          points="50,27 73,50 50,73 27,50"
          fill="#A59AFF"
        />
      </>
    );

  }


  if (
    shapeName === "Rectangle"
  ) {

    return (
      <>
        <Rect
          x="8"
          y="25"
          width="84"
          height="50"
          rx="8"
          fill="#7C6CFF"
        />

        <Rect
          x="27"
          y="37"
          width="46"
          height="26"
          rx="5"
          fill="#A59AFF"
        />
      </>
    );

  }


  if (
    shapeName === "Star"
  ) {

    return (
      <>
        <Polygon
          points="
            50,7
            61,36
            92,36
            67,54
            77,86
            50,67
            23,86
            33,54
            8,36
            39,36
          "
          fill="#7C6CFF"
        />

        <Polygon
          points="
            50,27
            56,43
            73,43
            59,53
            64,70
            50,60
            36,70
            41,53
            27,43
            44,43
          "
          fill="#A59AFF"
        />
      </>
    );

  }


  if (
    shapeName === "Hexagon"
  ) {

    return (
      <>
        <Polygon
          points="
            28,10
            72,10
            92,50
            72,90
            28,90
            8,50
          "
          fill="#7C6CFF"
        />

        <Polygon
          points="
            37,28
            63,28
            75,50
            63,72
            37,72
            25,50
          "
          fill="#A59AFF"
        />
      </>
    );

  }


  return (
    <>
      <Rect
        x="38"
        y="8"
        width="24"
        height="84"
        rx="6"
        fill="#7C6CFF"
      />

      <Rect
        x="8"
        y="38"
        width="84"
        height="24"
        rx="6"
        fill="#7C6CFF"
      />

      <Rect
        x="44"
        y="27"
        width="12"
        height="46"
        rx="3"
        fill="#A59AFF"
      />

      <Rect
        x="27"
        y="44"
        width="46"
        height="12"
        rx="3"
        fill="#A59AFF"
      />
    </>
  );

};


const ShapeSvg = ({
  shapeName,
  viewBox =
    "0 0 100 100",
}: {
  shapeName: string;
  viewBox?: string;
}) => {

  return (

    <Svg
      width="100%"
      height="100%"
      viewBox={
        viewBox
      }
      preserveAspectRatio="none"
    >

      {renderShapeContent(
        shapeName
      )}

    </Svg>

  );

};


export default function PuzzlePath({
  embedded = true,
  paused = false,
  difficulty = "Level 1",
  onComplete,
}: PuzzlePathProps) {

  const [
    level,
    setLevel,
  ] = useState(1);


  const activeLevelId =
    embedded
      ? resolveLevelId(
          difficulty
        )
      : level;


  const config =
    useMemo(
      () =>
        LEVELS[
          activeLevelId as keyof typeof LEVELS
        ],
      [
        activeLevelId,
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
  ] = useState<
    number | null
  >(null);


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
  ] = useState<
    FinalResult | null
  >(null);


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


        const recommendation =
          accuracy >= 85
            ? "Good Performance"
            : accuracy >= 70
            ? "Monitor Progress"
            : "Needs Further Assessment";


        const result:
          FinalResult = {

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

          moves:
            finalMoves,

          errors:
            finalErrors,

          attempts,

          correctPieces,

          totalPieces,

          time:
            finalTime,

          shape:
            shape.name,

          recommendation,

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

          onComplete({

            status:
              result.status,

            duration_seconds:
              result.duration_seconds,

            score:
              result.score,

            accuracy:
              result.accuracy,

            mistakes:
              result.mistakes,

            reaction_time:
              result.reaction_time,

            result_data:
              result.result_data,

          });

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
        false,
        tilesRef.current
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
      !started ||
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


    const updated = [
      ...tilesRef.current,
    ];


    const first =
      updated[
        selectedTile
      ];


    updated[
      selectedTile
    ] =
      updated[
        index
      ];


    updated[
      index
    ] =
      first;


    const nextMoves =
      movesRef.current +
      1;


    movesRef.current =
      nextMoves;


    tilesRef.current =
      updated;


    setMoves(
      nextMoves
    );


    setTiles(
      updated
    );


    setSelectedTile(
      null
    );


    const solved =
      updated.every(
        (
          piece,
          pieceIndex
        ) =>
          piece.id ===
          pieceIndex
      );


    if (solved) {

      setTimeout(
        () => {

          finishGame(
            true,
            updated
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


  const restart =
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


  const timeLeft =
    Math.max(
      0,
      config.time -
        gameTime
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
          Puzzle Path
        </Text>


        <Text
          style={
            styles.selectionDescription
          }
        >
          Look at the shape, then arrange the pieces to recreate it.
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
                    Rebuild the geometric shape by arranging its pieces.
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
                        Puzzle
                      </Text>

                      <Text
                        style={
                          styles.smallValue
                        }
                      >
                        {item.size}
                        {" × "}
                        {item.size}
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

            <View
              style={
                styles.resultDot
              }
            />

          </View>


          <Text
            style={
              styles.resultCategory
            }
          >
            {completed
              ? "ASSESSMENT COMPLETED"
              : "TIME COMPLETED"
            }
          </Text>


          <Text
            style={
              styles.resultTitle
            }
          >
            Puzzle Path Results
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
                Moves
              </Text>

              <Text
                style={
                  styles.resultMetricValue
                }
              >
                {finalResult.moves}
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
                Errors
              </Text>

              <Text
                style={
                  styles.resultMetricValue
                }
              >
                {finalResult.errors}
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
                Correct Pieces
              </Text>

              <Text
                style={
                  styles.secondaryValue
                }
              >
                {finalResult.correctPieces}
                /
                {finalResult.totalPieces}
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
                Shape
              </Text>

              <Text
                style={
                  styles.secondaryValue
                }
              >
                {finalResult.shape}
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
              {finalResult.recommendation}
            </Text>

          </View>


          {!embedded && (

            <Pressable
              onPress={
                restart
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
                Restart
              </Text>

            </Pressable>

          )}

        </View>

      </View>

    );

  }


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
            VISUAL-SPATIAL ASSESSMENT
          </Text>


          <Text
            style={
              styles.gameTitle
            }
          >
            Puzzle Path
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
            styles.targetSection
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
              styles.targetDescription
            }
          >
            Rebuild this shape below
          </Text>


          <View
            style={
              styles.targetPreview
            }
          >

            <ShapeSvg
              shapeName={
                shape.name
              }
            />

          </View>


          <Text
            style={
              styles.targetName
            }
          >
            {shape.name}
          </Text>

        </View>


        <View
          style={
            styles.arrangeSection
          }
        >

          <Text
            style={
              styles.arrangeTitle
            }
          >
            ARRANGE THE PIECES
          </Text>


          <Text
            style={
              styles.arrangeDescription
            }
          >
            Select two neighboring pieces to swap them.
          </Text>

        </View>


        <View
          style={[
            styles.puzzleGrid,

            {
              gap:
                config.size === 4
                  ? 6
                  : 8,
            },
          ]}
        >

          {tiles.map(
            (
              piece,
              index
            ) => {

              const selected =
                selectedTile ===
                index;


              const row =
                Math.floor(
                  piece.id /
                  config.size
                );


              const column =
                piece.id %
                config.size;


              const viewWidth =
                100 /
                config.size;


              const viewHeight =
                100 /
                config.size;


              const viewX =
                column *
                viewWidth;


              const viewY =
                row *
                viewHeight;


              const viewBox =
                `${viewX} ${viewY} ${viewWidth} ${viewHeight}`;


              const tileWidth =
                config.size === 2
                  ? "47%"
                  : config.size === 3
                  ? "30%"
                  : "22%";


              return (

                <Pressable
                  key={
                    `${piece.id}-${index}`
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

                    selected
                      ? styles.tileSelected
                      : styles.tileNormal,

                    paused &&
                      styles.tilePaused,
                  ]}
                >

                  <ShapeSvg
                    shapeName={
                      shape.name
                    }
                    viewBox={
                      viewBox
                    }
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
              Correct Pieces
            </Text>

            <Text
              style={
                styles.liveValue
              }
            >
              {correctPieces}/{totalPieces}
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
              Moves
            </Text>

            <Text
              style={
                styles.liveValue
              }
            >
              {moves}
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
              Errors
            </Text>

            <Text
              style={
                styles.liveValue
              }
            >
              {errors}
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
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    startButtonText: {
      color:
        "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
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


    targetSection: {
      alignItems:
        "center",
    },


    targetLabel: {
      color:
        "#7C6CFF",
      fontSize: 11,
      fontWeight: "800",
    },


    targetDescription: {
      marginTop: 4,
      color:
        "#77778A",
      fontSize: 13,
    },


    targetPreview: {
      width: 140,
      height: 140,
      marginTop: 14,
      padding: 12,
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        "#E5E0FF",
      backgroundColor:
        "#F5F2FF",
      overflow:
        "hidden",
    },


    targetName: {
      marginTop: 10,
      color:
        "#303044",
      fontSize: 16,
      fontWeight: "800",
    },


    arrangeSection: {
      marginTop: 28,
      alignItems:
        "center",
    },


    arrangeTitle: {
      color:
        "#9999AA",
      fontSize: 11,
      fontWeight: "800",
    },


    arrangeDescription: {
      marginTop: 4,
      color:
        "#77778A",
      fontSize: 13,
      textAlign:
        "center",
    },


    puzzleGrid: {
      width: "100%",
      marginTop: 18,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      justifyContent:
        "center",
    },


    tile: {
      aspectRatio: 1,
      borderRadius: 16,
      borderWidth: 4,
      backgroundColor:
        "#F5F2FF",
      overflow:
        "hidden",
    },


    tileNormal: {
      borderColor:
        "#FFFFFF",
    },


    tileSelected: {
      borderColor:
        "#7C6CFF",
      transform: [
        {
          scale: 0.96,
        },
      ],
    },


    tilePaused: {
      opacity: 0.6,
    },


    liveMetrics: {
      marginTop: 24,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      justifyContent:
        "center",
      gap: 18,
    },


    liveMetric: {
      minWidth: 52,
      alignItems:
        "center",
    },


    liveLabel: {
      color:
        "#9999AA",
      fontSize: 11,
      textAlign:
        "center",
    },


    liveValue: {
      marginTop: 3,
      color:
        "#303044",
      fontSize: 14,
      fontWeight: "800",
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


    resultDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor:
        "#7C6CFF",
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