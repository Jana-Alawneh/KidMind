import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";


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


const SHAPES = [
  {
    name: "Circle",
    content: (
      <>
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="#7C6CFF"
        />

        <circle
          cx="50"
          cy="50"
          r="16"
          fill="#A59AFF"
        />
      </>
    ),
  },

  {
    name: "Triangle",
    content: (
      <>
        <polygon
          points="50,8 92,88 8,88"
          fill="#7C6CFF"
        />

        <polygon
          points="50,30 70,68 30,68"
          fill="#A59AFF"
        />
      </>
    ),
  },

  {
    name: "Square",
    content: (
      <>
        <rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="8"
          fill="#7C6CFF"
        />

        <rect
          x="30"
          y="30"
          width="40"
          height="40"
          rx="5"
          fill="#A59AFF"
        />
      </>
    ),
  },

  {
    name: "Diamond",
    content: (
      <>
        <polygon
          points="50,7 93,50 50,93 7,50"
          fill="#7C6CFF"
        />

        <polygon
          points="50,27 73,50 50,73 27,50"
          fill="#A59AFF"
        />
      </>
    ),
  },

  {
    name: "Rectangle",
    content: (
      <>
        <rect
          x="8"
          y="25"
          width="84"
          height="50"
          rx="8"
          fill="#7C6CFF"
        />

        <rect
          x="27"
          y="37"
          width="46"
          height="26"
          rx="5"
          fill="#A59AFF"
        />
      </>
    ),
  },

  {
    name: "Star",
    content: (
      <>
        <polygon
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

        <polygon
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
    ),
  },

  {
    name: "Hexagon",
    content: (
      <>
        <polygon
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

        <polygon
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
    ),
  },

  {
    name: "Plus",
    content: (
      <>
        <rect
          x="38"
          y="8"
          width="24"
          height="84"
          rx="6"
          fill="#7C6CFF"
        />

        <rect
          x="8"
          y="38"
          width="84"
          height="24"
          rx="6"
          fill="#7C6CFF"
        />

        <rect
          x="44"
          y="27"
          width="12"
          height="46"
          rx="3"
          fill="#A59AFF"
        />

        <rect
          x="27"
          y="44"
          width="46"
          height="12"
          rx="3"
          fill="#A59AFF"
        />
      </>
    ),
  },
];


const shuffle = (array) => {

  const result = [
    ...array,
  ];


  for (
    let i =
      result.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );


    [
      result[i],
      result[j],
    ] = [
      result[j],
      result[i],
    ];

  }


  return result;
};


const createPuzzle = (
  size
) => {

  const total =
    size * size;


  const pieces =
    Array.from(
      {
        length:
          total,
      },
      (
        _,
        index
      ) => ({
        id:
          index,
      })
    );


  let shuffled =
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

    [
      shuffled[0],
      shuffled[1],
    ] = [
      shuffled[1],
      shuffled[0],
    ];

  }


  return shuffled;
};


const resolveLevelId = (
  difficulty
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
  tiles
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


const calculateMetrics = ({
  tiles,
  moves,
  errors,
  config,
}) => {

  const totalPieces =
    config
      ? config.size *
        config.size
      : 0;


  const correctPieces =
    countCorrectPieces(
      tiles
    );


  const attempts =
    moves +
    errors;


  const accuracy =
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


  return {
    totalPieces,
    correctPieces,
    attempts,
    accuracy,
    score,
  };
};


const PuzzlePath = ({
  embedded = false,
  paused = false,
  onComplete,
  difficulty = "Level 1",
}) => {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  const customGame =
    embedded
      ? null
      : location.state?.game;


  const [
    level,
    setLevel,
  ] = useState(1);


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
  ] = useState([]);


  const [
    selectedTile,
    setSelectedTile,
  ] = useState(null);


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
    shapeIndex,
    setShapeIndex,
  ] = useState(0);


  const [
    finalResult,
    setFinalResult,
  ] = useState(null);


  const movesRef =
    useRef(0);

  const errorsRef =
    useRef(0);

  const gameTimeRef =
    useRef(0);

  const tilesRef =
    useRef([]);

  const completionSentRef =
    useRef(false);

  const initializedRef =
    useRef(false);


  const config =
    useMemo(() => {

      if (customGame) {

        const customDifficulty =
          customGame
            ?.settings
            ?.puzzleDifficulty ||
          customGame
            ?.settings
            ?.difficulty ||
          "Easy";


        const pieces =
          Number(
            customGame
              ?.settings
              ?.pieces
          ) || 4;


        const size =
          pieces >= 16
            ? 4
            : pieces >= 9
            ? 3
            : 2;


        const time =
          Math.max(
            1,
            Number(
              customGame
                ?.settings
                ?.time
            ) || 60
          );


        return {
          name:
            customDifficulty,

          size,

          time,
        };

      }


      if (embedded) {

        const levelId =
          resolveLevelId(
            difficulty
          );


        return LEVELS[
          levelId
        ];

      }


      return LEVELS[
        level
      ];

    }, [
      customGame,
      embedded,
      difficulty,
      level,
    ]);


  const shape =
    SHAPES[
      shapeIndex
    ];


  const prepareGame =
    useCallback(
      (
        activeConfig
      ) => {

        if (!activeConfig) {
          return;
        }


        const newTiles =
          createPuzzle(
            activeConfig.size
          );


        setTiles(
          newTiles
        );

        tilesRef.current =
          newTiles;


        setSelectedTile(
          null
        );


        setMoves(0);

        movesRef.current =
          0;


        setErrors(0);

        errorsRef.current =
          0;


        setGameTime(0);

        gameTimeRef.current =
          0;


        setFinished(
          false
        );

        setCompleted(
          false
        );

        setFinalResult(
          null
        );


        completionSentRef.current =
          false;


        setShapeIndex(
          Math.floor(
            Math.random() *
            SHAPES.length
          )
        );

      },
      []
    );


  const startGame =
    useCallback(() => {

      if (!config) {
        return;
      }


      prepareGame(
        config
      );


      setStarted(
        true
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
        wasCompleted,
        finalTiles
      ) => {

        if (
          completionSentRef.current ||
          !config
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


        const finalGameTime =
          Math.min(
            config.time,
            gameTimeRef.current
          );


        const metrics =
          calculateMetrics({

            tiles:
              currentTiles,

            moves:
              finalMoves,

            errors:
              finalErrors,

            config,

          });


        const finalScore =
          wasCompleted
            ? 100
            : metrics.score;


        const recommendation =
          metrics.accuracy >= 85
            ? "Good Performance"
            : metrics.accuracy >= 70
            ? "Monitor Progress"
            : "Needs Further Assessment";


        const report = {

          game:
            "Puzzle Path",

          domain:
            "Visual Spatial Skills",

          custom:
            Boolean(
              customGame
            ),

          level:
            config.name,

          difficulty,

          shape:
            shape.name,

          puzzleSize:
            `${config.size} × ${config.size}`,

          totalPieces:
            metrics.totalPieces,

          correctPieces:
            wasCompleted
              ? metrics.totalPieces
              : metrics.correctPieces,

          moves:
            finalMoves,

          errors:
            finalErrors,

          mistakes:
            finalErrors,

          attempts:
            metrics.attempts,

          score:
            finalScore,

          accuracy:
            metrics.accuracy,

          reactionTime:
            null,

          time:
            finalGameTime,

          timeLimit:
            config.time,

          completed:
            wasCompleted,

          status:
            wasCompleted
              ? "Completed"
              : "Failed",

          recommendation,

          date:
            new Date()
              .toLocaleDateString(),

          timestamp:
            new Date()
              .toISOString(),

        };


        localStorage.setItem(
          "puzzlePathResult",
          JSON.stringify(
            report
          )
        );


        setFinalResult(
          report
        );


        setCompleted(
          wasCompleted
        );


        setFinished(
          true
        );


        setSelectedTile(
          null
        );


        if (onComplete) {

          onComplete({

            status:
              wasCompleted
                ? "Completed"
                : "Failed",

            duration_seconds:
              Math.max(
                0,
                Math.floor(
                  finalGameTime
                )
              ),

            score:
              finalScore,

            accuracy:
              metrics.accuracy,

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
                metrics.totalPieces,

              correct_pieces:
                wasCompleted
                  ? metrics.totalPieces
                  : metrics.correctPieces,

              moves:
                finalMoves,

              errors:
                finalErrors,

              mistakes:
                finalErrors,

              attempts:
                metrics.attempts,

              time_limit:
                config.time,

              completed:
                wasCompleted,

            },

          });

        }

      },
      [
        config,
        customGame,
        difficulty,
        onComplete,
        shape.name,
      ]
    );


  useEffect(() => {

    if (
      !started ||
      finished ||
      paused ||
      !config
    ) {
      return;
    }


    const timer =
      window.setInterval(
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

      window.clearInterval(
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

    if (
      !started ||
      finished ||
      !config
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
    config,
    finishGame,
  ]);


  const handleTileClick =
    (
      index
    ) => {

      if (
        !started ||
        finished ||
        paused
      ) {
        return;
      }


      if (
        selectedTile ===
        null
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


      const difference =
        Math.abs(
          selectedTile -
          index
        );


      const selectedRow =
        Math.floor(
          selectedTile /
          config.size
        );


      const currentRow =
        Math.floor(
          index /
          config.size
        );


      const isHorizontal =
        difference === 1 &&
        selectedRow ===
          currentRow;


      const isVertical =
        difference ===
        config.size;


      if (
        !isHorizontal &&
        !isVertical
      ) {

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
        ...tiles,
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


      setMoves(
        nextMoves
      );


      tilesRef.current =
        updated;


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

        window.setTimeout(
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


  const restart =
    () => {

      if (!config) {
        return;
      }


      prepareGame(
        config
      );


      setStarted(
        true
      );

    };


  const selectLevel =
    (
      value
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


      setSelectedTile(
        null
      );

    };


  const saveReport =
    () => {

      if (!finalResult) {
        return;
      }


      localStorage.setItem(
        "puzzlePathResult",
        JSON.stringify(
          finalResult
        )
      );


      navigate(
        "/assessment-report",
        {
          state:
            finalResult,
        }
      );

    };


  const renderShapePiece =
    (
      piece
    ) => {

      const size =
        config.size;


      const row =
        Math.floor(
          piece.id /
          size
        );


      const column =
        piece.id %
        size;


      const viewWidth =
        100 /
        size;


      const viewHeight =
        100 /
        size;


      const viewX =
        column *
        viewWidth;


      const viewY =
        row *
        viewHeight;


      return (

        <svg
          viewBox={`${viewX} ${viewY} ${viewWidth} ${viewHeight}`}
          className="
            w-full
            h-full
          "
          preserveAspectRatio="none"
        >
          {shape.content}
        </svg>

      );

    };


  const liveMetrics =
    calculateMetrics({

      tiles,

      moves,

      errors,

      config,

    });


  if (
    !embedded &&
    !customGame &&
    !started &&
    !finished
  ) {

    return (

      <div
        className="
          min-h-screen
          bg-[#F7F8FC]
          px-6
          py-10
        "
      >

        <div
          className="
            max-w-5xl
            mx-auto
          "
        >

          <div className="mb-10">

            <p
              className="
                text-sm
                font-semibold
                text-[#7C6CFF]
              "
            >
              COGNITIVE ASSESSMENT
            </p>


            <h1
              className="
                mt-2
                text-4xl
                font-bold
                text-[#202033]
              "
            >
              Puzzle Path
            </h1>


            <p
              className="
                mt-3
                max-w-2xl
                text-[#77778A]
              "
            >
              Look at the shape, then arrange the pieces to recreate it.
            </p>

          </div>


          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-6
            "
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

                const selected =
                  Number(id) ===
                  level;


                return (

                  <button
                    key={id}
                    type="button"
                    onClick={() => {

                      selectLevel(
                        Number(
                          id
                        )
                      );

                    }}
                    className={`
                      text-left
                      bg-white
                      p-6
                      rounded-[28px]
                      border
                      transition-all
                      duration-200

                      ${
                        selected
                          ? "border-[#7C6CFF] bg-[#F5F2FF] shadow-[0_15px_40px_rgba(124,108,255,0.14)]"
                          : "border-[#E8E8F0] hover:border-[#CFC8FF] hover:-translate-y-1"
                      }
                    `}
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <div
                        className="
                          w-12
                          h-12
                          rounded-2xl
                          bg-[#7C6CFF]
                          flex
                          items-center
                          justify-center
                          text-white
                          font-bold
                        "
                      >
                        {id}
                      </div>


                      {selected && (

                        <span
                          className="
                            text-xs
                            font-semibold
                            text-[#7C6CFF]
                          "
                        >
                          SELECTED
                        </span>

                      )}

                    </div>


                    <h2
                      className="
                        mt-6
                        text-xl
                        font-bold
                        text-[#202033]
                      "
                    >
                      {item.name}
                    </h2>


                    <p
                      className="
                        mt-2
                        text-sm
                        leading-6
                        text-[#77778A]
                      "
                    >
                      Rebuild the geometric shape by arranging its pieces.
                    </p>


                    <div
                      className="
                        mt-6
                        pt-5
                        border-t
                        border-[#EEEEF5]
                        grid
                        grid-cols-2
                        gap-4
                      "
                    >

                      <div>

                        <p
                          className="
                            text-xs
                            text-[#9999AA]
                          "
                        >
                          Puzzle
                        </p>

                        <p
                          className="
                            mt-1
                            font-bold
                            text-[#303044]
                          "
                        >
                          {item.size}
                          {" × "}
                          {item.size}
                        </p>

                      </div>


                      <div>

                        <p
                          className="
                            text-xs
                            text-[#9999AA]
                          "
                        >
                          Time
                        </p>

                        <p
                          className="
                            mt-1
                            font-bold
                            text-[#303044]
                          "
                        >
                          {item.time}s
                        </p>

                      </div>

                    </div>

                  </button>

                );

              }
            )}

          </div>


          <button
            type="button"
            onClick={
              startGame
            }
            className="
              mt-8
              w-full
              h-14
              rounded-2xl
              bg-[#7C6CFF]
              text-white
              font-semibold
              transition
              hover:bg-[#6F60F0]
            "
          >
            Start Assessment
          </button>

        </div>

      </div>

    );

  }


  if (
    !embedded &&
    customGame &&
    !started &&
    !finished &&
    config
  ) {

    return (

      <div
        className="
          min-h-screen
          bg-[#F7F8FC]
          flex
          items-center
          justify-center
          px-6
          py-10
        "
      >

        <div
          className="
            w-full
            max-w-lg
            bg-white
            rounded-[30px]
            border
            border-[#ECECF4]
            p-8
            shadow-xl
          "
        >

          <p
            className="
              text-sm
              font-semibold
              text-[#7C6CFF]
            "
          >
            CUSTOM ASSESSMENT
          </p>


          <h1
            className="
              mt-2
              text-3xl
              font-bold
              text-[#202033]
            "
          >
            Puzzle Path
          </h1>


          <div
            className="
              grid
              grid-cols-3
              gap-3
              mt-8
            "
          >

            <div
              className="
                bg-[#F7F8FC]
                rounded-2xl
                p-4
              "
            >

              <p className="text-xs text-[#9999AA]">
                Level
              </p>

              <p className="font-bold mt-1">
                {config.name}
              </p>

            </div>


            <div
              className="
                bg-[#F7F8FC]
                rounded-2xl
                p-4
              "
            >

              <p className="text-xs text-[#9999AA]">
                Puzzle
              </p>

              <p className="font-bold mt-1">
                {config.size} × {config.size}
              </p>

            </div>


            <div
              className="
                bg-[#F7F8FC]
                rounded-2xl
                p-4
              "
            >

              <p className="text-xs text-[#9999AA]">
                Time
              </p>

              <p className="font-bold mt-1">
                {config.time}s
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={
              startGame
            }
            className="
              mt-8
              w-full
              h-14
              rounded-2xl
              bg-[#7C6CFF]
              text-white
              font-semibold
            "
          >
            Start Assessment
          </button>

        </div>

      </div>

    );

  }


  if (
    started &&
    !finished &&
    config
  ) {

    const timeLeft =
      Math.max(
        0,
        config.time -
        gameTime
      );


    return (

      <div
        className={
          embedded
            ? "w-full"
            : "min-h-screen bg-[#F7F8FC] px-5 py-7"
        }
      >

        <div
          className={
            embedded
              ? "w-full"
              : "max-w-6xl mx-auto"
          }
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
              mb-8
            "
          >

            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-[#7C6CFF]
                "
              >
                VISUAL-SPATIAL ASSESSMENT
              </p>


              <h1
                className="
                  mt-1
                  text-3xl
                  font-bold
                  text-[#202033]
                "
              >
                Puzzle Path
              </h1>

            </div>


            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
              "
            >

              <div
                className="
                  px-5
                  py-3
                  bg-white
                  rounded-2xl
                  border
                  border-[#ECECF4]
                "
              >

                <p className="text-xs text-[#9999AA]">
                  Level
                </p>

                <p className="font-bold text-[#303044]">
                  {config.name}
                </p>

              </div>


              <div
                className="
                  px-5
                  py-3
                  bg-[#7C6CFF]
                  text-white
                  rounded-2xl
                  min-w-[100px]
                "
              >

                <p className="text-xs opacity-75">
                  Game Time
                </p>

                <p className="font-bold">
                  {gameTime}s
                </p>

              </div>


              <div
                className="
                  px-5
                  py-3
                  bg-white
                  rounded-2xl
                  border
                  border-[#ECECF4]
                  min-w-[100px]
                "
              >

                <p className="text-xs text-[#9999AA]">
                  Time Left
                </p>

                <p className="font-bold text-[#303044]">
                  {timeLeft}s
                </p>

              </div>

            </div>

          </div>


          {paused && (

            <div
              className="
                mb-6
                bg-amber-50
                border
                border-amber-200
                text-amber-700
                rounded-2xl
                px-5
                py-4
                text-center
                font-semibold
              "
            >
              Game Paused
            </div>

          )}


          <div
            className="
              bg-white
              rounded-[32px]
              border
              border-[#ECECF4]
              shadow-[0_15px_45px_rgba(30,30,60,0.06)]
              p-5
              md:p-8
            "
          >

            <div
              className="
                flex
                flex-col
                items-center
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  text-[#7C6CFF]
                "
              >
                TARGET SHAPE
              </p>


              <p
                className="
                  mt-1
                  text-sm
                  text-[#77778A]
                "
              >
                Rebuild this shape below
              </p>


              <div
                className="
                  mt-4
                  w-32
                  h-32
                  md:w-40
                  md:h-40
                  rounded-3xl
                  bg-[#F5F2FF]
                  border
                  border-[#E5E0FF]
                  flex
                  items-center
                  justify-center
                  p-3
                "
              >

                <svg
                  viewBox="0 0 100 100"
                  className="
                    w-full
                    h-full
                  "
                >
                  {shape.content}
                </svg>

              </div>


              <p
                className="
                  mt-3
                  text-base
                  font-bold
                  text-[#303044]
                "
              >
                {shape.name}
              </p>

            </div>


            <div
              className="
                mt-8
                text-center
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  text-[#9999AA]
                "
              >
                ARRANGE THE PIECES
              </p>


              <p
                className="
                  mt-1
                  text-sm
                  text-[#77778A]
                "
              >
                Select two neighboring pieces to swap them.
              </p>

            </div>


            <div
              className="
                grid
                gap-2
                md:gap-3
                max-w-[520px]
                mx-auto
                mt-5
              "
              style={{
                gridTemplateColumns:
                  `repeat(${config.size}, minmax(0, 1fr))`,
              }}
            >

              {tiles.map(
                (
                  piece,
                  index
                ) => (

                  <button
                    key={`${piece.id}-${index}`}
                    type="button"
                    disabled={paused}
                    onClick={() => {

                      handleTileClick(
                        index
                      );

                    }}
                    className={`
                      relative
                      aspect-square
                      rounded-2xl
                      overflow-hidden
                      border-4
                      bg-[#F5F2FF]
                      transition-all
                      duration-200

                      ${
                        paused
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }

                      ${
                        selectedTile ===
                        index
                          ? "border-[#7C6CFF] scale-95 shadow-[0_0_0_4px_rgba(124,108,255,0.12)]"
                          : "border-white hover:border-[#DDD7FF] hover:-translate-y-0.5"
                      }
                    `}
                  >
                    {renderShapePiece(
                      piece
                    )}
                  </button>

                )
              )}

            </div>


            <div
              className="
                mt-7
                flex
                flex-wrap
                items-center
                justify-center
                gap-8
                text-sm
              "
            >

              <div>

                <span className="text-[#9999AA]">
                  Correct Pieces
                </span>

                <span className="ml-2 font-bold text-[#303044]">
                  {liveMetrics.correctPieces}
                  /
                  {liveMetrics.totalPieces}
                </span>

              </div>


              <div>

                <span className="text-[#9999AA]">
                  Moves
                </span>

                <span className="ml-2 font-bold text-[#303044]">
                  {moves}
                </span>

              </div>


              <div>

                <span className="text-[#9999AA]">
                  Errors
                </span>

                <span className="ml-2 font-bold text-[#303044]">
                  {errors}
                </span>

              </div>


              <div>

                <span className="text-[#9999AA]">
                  Accuracy
                </span>

                <span className="ml-2 font-bold text-[#303044]">
                  {liveMetrics.accuracy}%
                </span>

              </div>


              <div>

                <span className="text-[#9999AA]">
                  Score
                </span>

                <span className="ml-2 font-bold text-[#303044]">
                  {liveMetrics.score}%
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    );

  }


  if (
    finished &&
    config
  ) {

    const result =
      finalResult || {

        score:
          liveMetrics.score,

        accuracy:
          liveMetrics.accuracy,

        moves,

        errors,

        attempts:
          liveMetrics.attempts,

        correctPieces:
          liveMetrics.correctPieces,

        totalPieces:
          liveMetrics.totalPieces,

        time:
          gameTime,

        recommendation:
          liveMetrics.accuracy >= 85
            ? "Good Performance"
            : liveMetrics.accuracy >= 70
            ? "Monitor Progress"
            : "Needs Further Assessment",

      };


    return (

      <div
        className={
          embedded
            ? "w-full"
            : "min-h-screen bg-[#F7F8FC] flex items-center justify-center px-6 py-10"
        }
      >

        <div
          className="
            w-full
            max-w-2xl
            bg-white
            rounded-[32px]
            border
            border-[#ECECF4]
            p-8
            md:p-10
            shadow-[0_20px_60px_rgba(30,30,60,0.08)]
          "
        >

          <div className="text-center">

            <div
              className="
                mx-auto
                w-16
                h-16
                rounded-2xl
                bg-[#F2EEFF]
                flex
                items-center
                justify-center
              "
            >

              <div
                className="
                  w-8
                  h-8
                  rounded-full
                  bg-[#7C6CFF]
                "
              />

            </div>


            <p
              className="
                mt-5
                text-sm
                font-semibold
                text-[#7C6CFF]
              "
            >
              {completed
                ? "ASSESSMENT COMPLETED"
                : "TIME COMPLETED"
              }
            </p>


            <h1
              className="
                mt-2
                text-3xl
                font-bold
                text-[#202033]
              "
            >
              Puzzle Path Results
            </h1>


            <p
              className="
                mt-3
                text-[#77778A]
              "
            >
              {config.name} Level
            </p>

          </div>


          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-4
              gap-4
              mt-8
            "
          >

            <div
              className="
                rounded-2xl
                bg-[#F7F8FC]
                p-5
                text-center
              "
            >

              <p className="text-xs text-[#9999AA]">
                Score
              </p>

              <p className="mt-2 text-2xl font-bold text-[#303044]">
                {result.score}%
              </p>

            </div>


            <div
              className="
                rounded-2xl
                bg-[#F7F8FC]
                p-5
                text-center
              "
            >

              <p className="text-xs text-[#9999AA]">
                Accuracy
              </p>

              <p className="mt-2 text-2xl font-bold text-[#303044]">
                {result.accuracy}%
              </p>

            </div>


            <div
              className="
                rounded-2xl
                bg-[#F7F8FC]
                p-5
                text-center
              "
            >

              <p className="text-xs text-[#9999AA]">
                Moves
              </p>

              <p className="mt-2 text-2xl font-bold text-[#303044]">
                {result.moves}
              </p>

            </div>


            <div
              className="
                rounded-2xl
                bg-[#F7F8FC]
                p-5
                text-center
              "
            >

              <p className="text-xs text-[#9999AA]">
                Errors
              </p>

              <p className="mt-2 text-2xl font-bold text-[#303044]">
                {result.errors}
              </p>

            </div>

          </div>


          <div
            className="
              grid
              grid-cols-2
              gap-4
              mt-4
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-[#ECECF4]
                p-5
              "
            >

              <p className="text-xs text-[#9999AA]">
                Correct Pieces
              </p>

              <p className="mt-1 font-bold text-[#303044]">
                {result.correctPieces}
                /
                {result.totalPieces}
              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-[#ECECF4]
                p-5
              "
            >

              <p className="text-xs text-[#9999AA]">
                Attempts
              </p>

              <p className="mt-1 font-bold text-[#303044]">
                {result.attempts}
              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-[#ECECF4]
                p-5
              "
            >

              <p className="text-xs text-[#9999AA]">
                Game Time
              </p>

              <p className="mt-1 font-bold text-[#303044]">
                {result.time}s
              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-[#ECECF4]
                p-5
              "
            >

              <p className="text-xs text-[#9999AA]">
                Shape
              </p>

              <p className="mt-1 font-bold text-[#303044]">
                {shape.name}
              </p>

            </div>

          </div>


          <div
            className="
              mt-5
              rounded-2xl
              bg-[#F2EEFF]
              p-5
            "
          >

            <p
              className="
                text-xs
                font-semibold
                text-[#7C6CFF]
              "
            >
              PERFORMANCE INSIGHT
            </p>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-[#555568]
              "
            >
              {result.recommendation}
            </p>

          </div>


          {!embedded && (

            <div
              className="
                flex
                gap-3
                mt-7
              "
            >

              <button
                type="button"
                onClick={
                  saveReport
                }
                className="
                  flex-1
                  h-12
                  rounded-2xl
                  bg-[#7C6CFF]
                  text-white
                  font-semibold
                  hover:bg-[#6F60F0]
                  transition
                "
              >
                View Report
              </button>


              <button
                type="button"
                onClick={
                  restart
                }
                className="
                  flex-1
                  h-12
                  rounded-2xl
                  border
                  border-[#E4E4EC]
                  text-[#303044]
                  font-semibold
                  hover:bg-[#F7F7FA]
                  transition
                "
              >
                Restart
              </button>

            </div>

          )}

        </div>

      </div>

    );

  }


  return null;

};


export default PuzzlePath;