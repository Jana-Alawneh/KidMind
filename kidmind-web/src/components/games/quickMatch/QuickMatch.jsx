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

import {
  Clock3,
  Play,
  RotateCcw,
  Target,
  Trophy,
  Zap,
} from "lucide-react";


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


const SYMBOLS = [
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


const shuffle = (
  array
) => {

  const result = [
    ...array,
  ];


  for (
    let i =
      result.length - 1;
    i > 0;
    i -= 1
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


const getRandomColor =
  () => {

    return COLORS[
      Math.floor(
        Math.random() *
        COLORS.length
      )
    ];

  };


const Shape = ({
  type,
  color = "#7C6CFF",
  size = 58,
}) => {

  if (
    type === "circle"
  ) {

    return (

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="35"
          fill={color}
        />
      </svg>

    );

  }


  if (
    type === "square"
  ) {

    return (

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <rect
          x="16"
          y="16"
          width="68"
          height="68"
          rx="10"
          fill={color}
        />
      </svg>

    );

  }


  if (
    type === "triangle"
  ) {

    return (

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,10 90,85 10,85"
          fill={color}
        />
      </svg>

    );

  }


  if (
    type === "diamond"
  ) {

    return (

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,8 92,50 50,92 8,50"
          fill={color}
        />
      </svg>

    );

  }


  if (
    type === "star"
  ) {

    return (

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <polygon
          points="
            50,8
            61,37
            92,37
            67,55
            77,86
            50,67
            23,86
            33,55
            8,37
            39,37
          "
          fill={color}
        />
      </svg>

    );

  }


  if (
    type === "hexagon"
  ) {

    return (

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <polygon
          points="
            25,12
            75,12
            92,50
            75,88
            25,88
            8,50
          "
          fill={color}
        />
      </svg>

    );

  }


  if (
    type === "heart"
  ) {

    return (

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <path
          d="
            M50 86
            C45 80 15 62 15 37
            C15 18 38 12 50 30
            C62 12 85 18 85 37
            C85 62 55 80 50 86
          "
          fill={color}
        />
      </svg>

    );

  }


  if (
    type === "cross"
  ) {

    return (

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <path
          d="
            M35 10
            H65
            V35
            H90
            V65
            H65
            V90
            H35
            V65
            H10
            V35
            H35
            Z
          "
          fill={color}
        />
      </svg>

    );

  }


  return null;

};


const createRound = (
  cardCount
) => {

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


const QuickMatch = ({
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
    round,
    setRound,
  ] = useState(0);


  const [
    gameTime,
    setGameTime,
  ] = useState(0);


  const [
    roundTime,
    setRoundTime,
  ] = useState(0);


  const [
    currentRound,
    setCurrentRound,
  ] = useState(null);


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
  ] = useState([]);


  const [
    feedback,
    setFeedback,
  ] = useState(null);


  const [
    pressedId,
    setPressedId,
  ] = useState(null);


  const [
    finalResult,
    setFinalResult,
  ] = useState(null);


  const correctRef =
    useRef(0);

  const wrongRef =
    useRef(0);

  const missedRef =
    useRef(0);

  const reactionTimesRef =
    useRef([]);

  const gameTimeRef =
    useRef(0);

  const roundTimeRef =
    useRef(0);

  const completionSentRef =
    useRef(false);

  const initializedRef =
    useRef(false);


  const config =
    useMemo(() => {

      if (customGame) {

        const customDifficulty =
          String(
            customGame
              ?.settings
              ?.difficulty ||
            customGame
              ?.settings
              ?.quickMatchDifficulty ||
            ""
          ).toLowerCase();


        if (
          customDifficulty ===
          "hard"
        ) {
          return LEVELS[3];
        }


        if (
          customDifficulty ===
          "medium"
        ) {
          return LEVELS[2];
        }


        return LEVELS[1];

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

      setRound(0);

      setCorrect(0);

      setWrong(0);

      setMissed(0);

      setReactionTimes([]);

      setGameTime(0);

      setRoundTime(0);

      setFeedback(null);

      setPressedId(null);

      setFinished(false);

      setFinalResult(null);


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


  const finishAssessment =
    useCallback(
      (
        completedAll
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
          finalReactionTimes.length > 0
            ? Number(
                (
                  finalReactionTimes.reduce(
                    (
                      sum,
                      value
                    ) =>
                      sum + value,
                    0
                  ) /
                  finalReactionTimes.length
                ).toFixed(2)
              )
            : null;


        const processedRounds =
          finalCorrect +
          finalWrong +
          finalMissed;


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


        const status =
          completedAll
            ? "Completed"
            : "Failed";


        const recommendation =
          accuracy >= 85
            ? "Excellent processing speed and visual attention."
            : accuracy >= 70
            ? "Good processing speed. Continue monitoring progress."
            : "The child may benefit from additional visual matching and attention practice.";


        const report = {
          game:
            "Quick Match",

          domain:
            "Processing Speed & Attention",

          custom:
            Boolean(
              customGame
            ),

          level:
            config.name,

          difficulty,

          score,

          accuracy,

          correct:
            finalCorrect,

          wrong:
            finalWrong,

          mistakes:
            finalWrong,

          missed:
            finalMissed,

          attempts,

          reactionTime:
            averageReaction,

          reactionTimes:
            finalReactionTimes,

          completionRate,

          time:
            Number(
              finalGameTime.toFixed(
                1
              )
            ),

          timeLimit:
            config.time,

          timeRemaining,

          totalRounds:
            config.rounds,

          cardsPerRound:
            config.cards,

          reactionTimeLimit:
            config.reactionTime,

          completed:
            completedAll,

          status,

          recommendation,

          date:
            new Date()
              .toLocaleDateString(),

          timestamp:
            new Date()
              .toISOString(),
        };


        localStorage.setItem(
          "quickMatchResult",
          JSON.stringify(
            report
          )
        );


        setFinalResult(
          report
        );


        setFinished(
          true
        );


        setFeedback(
          null
        );


        if (onComplete) {

          onComplete({
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

              result_status:
                status,
            },
          });

        }

      },
      [
        config,
        customGame,
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
      window.setInterval(
        () => {

          const nextTime =
            Math.min(
              config.time,
              Number(
                (
                  gameTimeRef.current +
                  0.1
                ).toFixed(1)
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

      window.clearInterval(
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
      window.setInterval(
        () => {

          const nextTime =
            Math.min(
              config.reactionTime,
              Number(
                (
                  roundTimeRef.current +
                  0.1
                ).toFixed(1)
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

      window.clearInterval(
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

      finishAssessment(
        false
      );

    }

  }, [
    started,
    finished,
    gameTime,
    config.time,
    finishAssessment,
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
      roundTime >=
      config.reactionTime
    ) {

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

    }

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
      window.setTimeout(
        () => {

          if (
            round >=
            config.rounds - 1
          ) {

            finishAssessment(
              true
            );

            return;

          }


          setRound(
            (previous) =>
              previous + 1
          );


          createNewRound();

        },
        450
      );


    return () => {

      window.clearTimeout(
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
    finishAssessment,
  ]);


  const chooseCard = (
    card
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


      const newReactionTimes = [
        ...reactionTimesRef.current,
        reaction,
      ];


      reactionTimesRef.current =
        newReactionTimes;


      setReactionTimes(
        newReactionTimes
      );


      setFeedback(
        "correct"
      );

    } else {

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

    }

  };


  const restartGame =
    () => {

      prepareGame();

      setStarted(
        true
      );

  };


  const selectLevel = (
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


    setRound(0);

    setCorrect(0);

    setWrong(0);

    setMissed(0);

    setReactionTimes([]);

    setGameTime(0);

    setRoundTime(0);

    setCurrentRound(null);

    setFeedback(null);

    setPressedId(null);

    setFinalResult(null);

  };


  const viewReport =
    () => {

      if (!finalResult) {
        return;
      }


      localStorage.setItem(
        "quickMatchResult",
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
              Quick Match
            </h1>


            <p
              className="
                mt-3
                max-w-2xl
                text-[#77778A]
              "
            >
              Find the matching shape as quickly and accurately as possible. Each round changes the layout, colors and target.
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
                        Number(id)
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
                      Match the target shape quickly while keeping your accuracy.
                    </p>


                    <div
                      className="
                        mt-6
                        pt-5
                        border-t
                        border-[#EEEEF5]
                        grid
                        grid-cols-3
                        gap-3
                      "
                    >

                      <div>

                        <p
                          className="
                            text-xs
                            text-[#9999AA]
                          "
                        >
                          Rounds
                        </p>

                        <p
                          className="
                            mt-1
                            font-bold
                            text-[#303044]
                          "
                        >
                          {item.rounds}
                        </p>

                      </div>


                      <div>

                        <p
                          className="
                            text-xs
                            text-[#9999AA]
                          "
                        >
                          Cards
                        </p>

                        <p
                          className="
                            mt-1
                            font-bold
                            text-[#303044]
                          "
                        >
                          {item.cards}
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
              flex
              items-center
              justify-center
              gap-3
              hover:bg-[#6F60F0]
              transition
            "
          >

            <Play
              size={19}
            />

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
    !finished
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

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-[#F2EEFF]
                flex
                items-center
                justify-center
              "
            >

              <Zap
                size={26}
                className="
                  text-[#7C6CFF]
                "
              />

            </div>


            <div>

              <p
                className="
                  text-xs
                  font-semibold
                  text-[#7C6CFF]
                "
              >
                CUSTOM GAME
              </p>


              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-[#202033]
                "
              >
                {customGame?.title ||
                  "Quick Match"}
              </h2>

            </div>

          </div>


          <div
            className="
              grid
              grid-cols-3
              gap-4
              mt-7
            "
          >

            <div
              className="
                bg-[#F7F8FC]
                rounded-2xl
                p-5
              "
            >

              <p className="text-xs text-[#9999AA]">
                Rounds
              </p>

              <p className="mt-1 text-xl font-bold text-[#303044]">
                {config.rounds}
              </p>

            </div>


            <div
              className="
                bg-[#F7F8FC]
                rounded-2xl
                p-5
              "
            >

              <p className="text-xs text-[#9999AA]">
                Cards
              </p>

              <p className="mt-1 text-xl font-bold text-[#303044]">
                {config.cards}
              </p>

            </div>


            <div
              className="
                bg-[#F7F8FC]
                rounded-2xl
                p-5
              "
            >

              <p className="text-xs text-[#9999AA]">
                Time
              </p>

              <p className="mt-1 text-xl font-bold text-[#303044]">
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
              flex
              items-center
              justify-center
              gap-3
            "
          >

            <Play
              size={19}
            />

            Start Assessment

          </button>

        </div>

      </div>

    );

  }


  if (
    started &&
    !finished &&
    currentRound
  ) {

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
              : "max-w-5xl mx-auto"
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
              mb-7
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
                PROCESSING SPEED
              </p>


              <h1
                className="
                  mt-1
                  text-3xl
                  font-bold
                  text-[#202033]
                "
              >
                Quick Match
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
                  min-w-[105px]
                "
              >

                <p className="text-xs opacity-75">
                  Game Time
                </p>

                <p className="font-bold">
                  {gameTime.toFixed(1)}s
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
                  min-w-[105px]
                "
              >

                <p className="text-xs text-[#9999AA]">
                  Time Left
                </p>

                <p className="font-bold text-[#303044]">
                  {timeLeft.toFixed(1)}s
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
                items-center
                justify-between
                mb-5
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    text-[#9999AA]
                  "
                >
                  ROUND
                </p>

                <p
                  className="
                    mt-1
                    font-bold
                    text-[#303044]
                  "
                >
                  {round + 1}
                  {" / "}
                  {config.rounds}
                </p>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-[#77778A]
                "
              >

                <Clock3
                  size={17}
                />

                {roundTime.toFixed(1)}s
                {" / "}
                {config.reactionTime}s

              </div>

            </div>


            <div
              className="
                h-2
                bg-[#F0EFF7]
                rounded-full
                overflow-hidden
              "
            >

              <div
                className="
                  h-full
                  bg-[#7C6CFF]
                  rounded-full
                  transition-all
                  duration-200
                "
                style={{
                  width:
                    `${
                      (
                        (
                          round + 1
                        ) /
                        config.rounds
                      ) * 100
                    }%`,
                }}
              />

            </div>


            <div
              className="
                mt-7
                rounded-[28px]
                bg-[#F7F8FC]
                border
                border-[#ECECF4]
                p-6
                md:p-8
              "
            >

              <div className="text-center">

                <div
                  className="
                    mx-auto
                    w-12
                    h-12
                    rounded-2xl
                    bg-[#F2EEFF]
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Target
                    size={23}
                    className="
                      text-[#7C6CFF]
                    "
                  />

                </div>


                <p
                  className="
                    mt-4
                    text-xs
                    font-semibold
                    text-[#9999AA]
                  "
                >
                  FIND THIS SHAPE
                </p>


                <div
                  className="
                    mt-3
                    flex
                    items-center
                    justify-center
                    gap-3
                  "
                >

                  <Shape
                    type={
                      SYMBOLS.find(
                        (symbol) =>
                          symbol.id ===
                          currentRound.targetId
                      )?.shape
                    }
                    color={
                      currentRound.targetColor
                    }
                    size={72}
                  />

                </div>


                <p
                  className="
                    mt-2
                    text-lg
                    font-bold
                    text-[#202033]
                  "
                >
                  Match the target
                </p>


                <p
                  className="
                    mt-1
                    text-sm
                    text-[#77778A]
                  "
                >
                  Choose the identical shape below.
                </p>


                <p
                  className="
                    mt-3
                    text-xs
                    font-semibold
                    text-[#9999AA]
                  "
                >
                  Round time left:{" "}
                  {roundTimeLeft.toFixed(
                    1
                  )}s
                </p>

              </div>


              <div
                className="
                  mt-7
                  grid
                  grid-cols-2
                  md:grid-cols-4
                  gap-4
                "
              >

                {currentRound.cards.map(
                  (
                    card
                  ) => {

                    const isPressed =
                      pressedId ===
                      card.id;


                    let border =
                      "border-[#E7E7F0]";


                    let background =
                      "bg-white";


                    if (
                      feedback &&
                      isPressed
                    ) {

                      if (
                        feedback ===
                        "correct"
                      ) {

                        border =
                          "border-[#7BC67B]";

                        background =
                          "bg-[#EEF9EE]";

                      }


                      if (
                        feedback ===
                        "wrong"
                      ) {

                        border =
                          "border-[#EF6A8A]";

                        background =
                          "bg-[#FFF0F3]";

                      }

                    }


                    return (

                      <button
                        key={
                          `${card.id}-${card.color}`
                        }
                        type="button"
                        disabled={
                          Boolean(
                            feedback
                          ) ||
                          paused
                        }
                        onClick={() => {

                          chooseCard(
                            card
                          );

                        }}
                        className={`
                          aspect-square
                          rounded-[26px]
                          border-2
                          ${border}
                          ${background}
                          flex
                          items-center
                          justify-center
                          transition-all
                          duration-200
                          hover:-translate-y-1
                          hover:shadow-[0_12px_30px_rgba(30,30,60,0.08)]
                          disabled:cursor-default

                          ${
                            paused
                              ? "opacity-60"
                              : ""
                          }
                        `}
                      >

                        <Shape
                          type={
                            card.shape
                          }
                          color={
                            card.color
                          }
                          size={62}
                        />

                      </button>

                    );

                  }
                )}

              </div>

            </div>


            <div
              className="
                mt-7
                grid
                grid-cols-2
                md:grid-cols-5
                gap-4
              "
            >

              <div
                className="
                  rounded-2xl
                  bg-[#F7F8FC]
                  p-4
                  text-center
                "
              >

                <p className="text-xs text-[#9999AA]">
                  Correct
                </p>

                <p className="mt-1 font-bold text-[#303044]">
                  {correct}
                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  bg-[#F7F8FC]
                  p-4
                  text-center
                "
              >

                <p className="text-xs text-[#9999AA]">
                  Wrong
                </p>

                <p className="mt-1 font-bold text-[#303044]">
                  {wrong}
                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  bg-[#F7F8FC]
                  p-4
                  text-center
                "
              >

                <p className="text-xs text-[#9999AA]">
                  Missed
                </p>

                <p className="mt-1 font-bold text-[#303044]">
                  {missed}
                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  bg-[#F7F8FC]
                  p-4
                  text-center
                "
              >

                <p className="text-xs text-[#9999AA]">
                  Accuracy
                </p>

                <p className="mt-1 font-bold text-[#303044]">
                  {liveAccuracy}%
                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  bg-[#F7F8FC]
                  p-4
                  text-center
                "
              >

                <p className="text-xs text-[#9999AA]">
                  Score
                </p>

                <p className="mt-1 font-bold text-[#303044]">
                  {liveScore}%
                </p>

              </div>

            </div>


            {feedback ===
              "timeout" && (

              <div
                className="
                  mt-5
                  rounded-2xl
                  bg-[#FFF5E8]
                  border
                  border-[#FFE1B8]
                  p-4
                  text-center
                  text-sm
                  font-semibold
                  text-[#A66A00]
                "
              >
                Time ran out. This round was counted as missed.
              </div>

            )}

          </div>

        </div>

      </div>

    );

  }


  if (
    finished &&
    finalResult
  ) {

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

              <Trophy
                size={30}
                className="
                  text-[#7C6CFF]
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
              {finalResult.completed
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
              Quick Match Results
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
                {finalResult.score}%
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
                {finalResult.accuracy}%
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
                Correct
              </p>

              <p className="mt-2 text-2xl font-bold text-[#303044]">
                {finalResult.correct}
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
                Wrong
              </p>

              <p className="mt-2 text-2xl font-bold text-[#303044]">
                {finalResult.wrong}
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
                Missed
              </p>

              <p className="mt-1 font-bold text-[#303044]">
                {finalResult.missed}
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
                {finalResult.attempts}
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
                Reaction Time
              </p>

              <p className="mt-1 font-bold text-[#303044]">
                {finalResult.reactionTime !==
                null
                  ? `${finalResult.reactionTime}s`
                  : "—"
                }
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
                {finalResult.time}s
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
              {finalResult.recommendation}
            </p>

          </div>


          {!embedded && (

            <div
              className="
                flex
                flex-col
                md:flex-row
                gap-3
                mt-7
              "
            >

              <button
                type="button"
                onClick={
                  viewReport
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
                  restartGame
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
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >

                <RotateCcw
                  size={17}
                />

                Play Again

              </button>

            </div>

          )}

        </div>

      </div>

    );

  }


  return null;

};


export default QuickMatch;