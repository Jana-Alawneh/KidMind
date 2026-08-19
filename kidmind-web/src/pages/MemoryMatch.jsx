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
  Star,
  Sun,
} from "lucide-react";


/* =====================================================
   LEVELS
===================================================== */

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


/* =====================================================
   DEFAULT ICONS
===================================================== */

const defaultIcons = [

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


/* =====================================================
   HELPERS
===================================================== */

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


/* =====================================================
   OUR METRICS
===================================================== */

const calculateMetrics = ({
  correctPairs,
  wrongPairs,
  elapsedTime,
  config,
}) => {

  /*
    Attempts =
    correct pair attempts
    +
    wrong pair attempts
  */
  const attempts =
    correctPairs +
    wrongPairs;


  /*
    ACCURACY

    Correct Pairs
    ---------------------------- × 100
    Correct Pairs + Wrong Pairs
  */
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


  /*
    SCORE

    Correct Pairs
    ---------------- × 100
    Total Pairs
  */
  const score =
    config &&
    config.pairs > 0
      ? Math.min(
          100,
          Math.round(
            (
              correctPairs /
              config.pairs
            ) * 100
          )
        )
      : 0;


  const completion =
    score;


  const timeRemaining =
    config
      ? Math.max(
          0,
          config.time -
            elapsedTime
        )
      : 0;


  /*
    This is NOT Reaction Time.

    It is only extra information
    describing the average duration
    of a pair attempt.
  */
  const averageAttemptTime =
    attempts > 0
      ? Number(
          (
            elapsedTime /
            attempts
          ).toFixed(2)
        )
      : 0;


  /*
    Extra information only.
    Does NOT affect Score
    or Accuracy.
  */
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


  return {

    attempts,

    accuracy,

    score,

    completion,

    timeRemaining,

    averageAttemptTime,

    speed,

  };

};


/* =====================================================
   COMPONENT
===================================================== */

const MemoryMatch = ({

  embedded = false,

  paused = false,

  onComplete,

  difficulty = "Level 1",

}) => {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  /*
    Custom game is used only when
    the game is opened outside
    SessionPlayer.
  */
  const customGame =
    embedded
      ? null
      : location.state?.game;


  /* =====================================================
     LEVEL
  ===================================================== */

  const [
    level,
    setLevel,
  ] = useState(null);


  /* =====================================================
     GAME STATE
  ===================================================== */

  const [
    started,
    setStarted,
  ] = useState(false);


  const [
    cards,
    setCards,
  ] = useState([]);


  const [
    flipped,
    setFlipped,
  ] = useState([]);


  const [
    matched,
    setMatched,
  ] = useState([]);


  const [
    correctPairs,
    setCorrectPairs,
  ] = useState(0);


  const [
    wrongPairs,
    setWrongPairs,
  ] = useState(0);


  /*
    Game timer starts at ZERO.
  */
  const [
    elapsedTime,
    setElapsedTime,
  ] = useState(0);


  const [
    finished,
    setFinished,
  ] = useState(false);


  const [
    resultStatus,
    setResultStatus,
  ] = useState("");


  const [
    finalResult,
    setFinalResult,
  ] = useState(null);


  /* =====================================================
     REFS
  ===================================================== */

  const correctPairsRef =
    useRef(0);

  const wrongPairsRef =
    useRef(0);

  const elapsedTimeRef =
    useRef(0);

  const completionSentRef =
    useRef(false);

  const initializedRef =
    useRef(false);


  /* =====================================================
     CONFIG
  ===================================================== */

  const config =
    useMemo(() => {

      /*
        Custom assessment
      */
      if (customGame) {

        return {

          name:
            customGame.level ||
            "Medium",

          pairs:
            Math.max(
              1,
              Math.floor(
                Number(
                  customGame
                    ?.settings
                    ?.cards ||
                  8
                ) / 2
              )
            ),

          time:
            Math.max(
              1,
              Number(
                customGame
                  ?.settings
                  ?.time
              ) || 90
            ),

          description:
            "Custom memory assessment.",

        };

      }


      /*
        Session assessment
      */
      if (embedded) {

        const levelId =
          resolveLevelId(
            difficulty
          );


        return LEVELS[
          levelId
        ];

      }


      /*
        Standalone assessment
      */
      if (level) {

        return LEVELS[
          level
        ];

      }


      return null;

    }, [
      customGame,
      embedded,
      difficulty,
      level,
    ]);


  /* =====================================================
     CREATE DECK
  ===================================================== */

  const createDeck =
    useCallback(
      (
        activeConfig
      ) => {

        if (!activeConfig) {
          return;
        }


        let selected = [];


        /*
          Custom icons
        */
        if (customGame) {

          const customIcons =
            customGame
              ?.settings
              ?.icons ||
            [];


          if (
            customIcons.length >=
            activeConfig.pairs
          ) {

            selected =
              customIcons
                .slice(
                  0,
                  activeConfig.pairs
                )
                .map(
                  (
                    icon,
                    index
                  ) => ({

                    id:
                      `custom-${index}`,

                    icon,

                    custom:
                      true,

                  })
                );

          }

        }


        /*
          Default icons
        */
        if (
          selected.length <
          activeConfig.pairs
        ) {

          selected =
            defaultIcons
              .slice(
                0,
                activeConfig.pairs
              )
              .map(
                (item) => ({

                  ...item,

                  custom:
                    false,

                })
              );

        }


        /*
          Create two copies
          from every selected icon.
        */
        const duplicated = [

          ...selected.map(
            (item) => ({
              ...item,
            })
          ),

          ...selected.map(
            (item) => ({
              ...item,
            })
          ),

        ];


        const deck =
          shuffle(
            duplicated.map(
              (
                item,
                index
              ) => ({

                ...item,

                cardId:
                  index,

                pairId:
                  item.id,

              })
            )
          );


        setCards(
          deck
        );

        setFlipped([]);

        setMatched([]);

        setCorrectPairs(0);

        setWrongPairs(0);

        setElapsedTime(0);

        setFinished(false);

        setResultStatus("");

        setFinalResult(
          null
        );


        correctPairsRef.current =
          0;

        wrongPairsRef.current =
          0;

        elapsedTimeRef.current =
          0;

        completionSentRef.current =
          false;

      },
      [customGame]
    );


  /* =====================================================
     START GAME
  ===================================================== */

  const startGame =
    useCallback(() => {

      if (!config) {
        return;
      }


      createDeck(
        config
      );


      setStarted(
        true
      );

      setFinished(
        false
      );

    }, [
      config,
      createDeck,
    ]);


  /*
    Inside SessionPlayer,
    start automatically.
  */
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


  /* =====================================================
     FINISH GAME
  ===================================================== */

  const finishGame =
    useCallback(
      (
        status
      ) => {

        if (
          completionSentRef
            .current ||
          !config
        ) {
          return;
        }


        completionSentRef.current =
          true;


        const finalCorrect =
          correctPairsRef.current;


        const finalWrong =
          wrongPairsRef.current;


        const finalTime =
          Math.min(
            config.time,
            elapsedTimeRef.current
          );


        const metrics =
          calculateMetrics({

            correctPairs:
              finalCorrect,

            wrongPairs:
              finalWrong,

            elapsedTime:
              finalTime,

            config,

          });


        const completed =
          finalCorrect >=
          config.pairs;


        const recommendation =
          metrics.accuracy >= 85

            ? "Excellent working memory accuracy."

            : metrics.accuracy >= 70

            ? "Good working memory accuracy. Continue monitoring progress."

            : "The child may benefit from additional working memory assessment and practice.";


        const report = {

          game:
            "Memory Match",

          domain:
            "Working Memory",

          custom:
            Boolean(
              customGame
            ),

          level:
            config.name,

          difficulty,

          cards:
            config.pairs *
            2,

          totalPairs:
            config.pairs,

          correct:
            finalCorrect,

          wrong:
            finalWrong,

          mistakes:
            finalWrong,

          attempts:
            metrics.attempts,

          score:
            metrics.score,

          accuracy:
            metrics.accuracy,

          completion:
            metrics.completion,

          timeLimit:
            config.time,

          time:
            finalTime,

          timeRemaining:
            metrics.timeRemaining,

          averageAttemptTime:
            metrics
              .averageAttemptTime,

          speed:
            metrics.speed,

          /*
            Memory Match does not have
            a true reaction-time metric.
          */
          reactionTime:
            null,

          completed,

          status,

          recommendation,

          date:
            new Date()
              .toLocaleDateString(),

          timestamp:
            new Date()
              .toISOString(),

        };


        /*
          Keep standalone compatibility.
        */
        localStorage.setItem(
          "memoryResult",
          JSON.stringify(
            report
          )
        );


        setFinalResult(
          report
        );

        setResultStatus(
          status
        );

        setFinished(
          true
        );


        /*
          SessionPlayer receives this
          object and saves it to
          session_games.
        */
        if (onComplete) {

          onComplete({

            status:
              completed
                ? "Completed"
                : "Failed",

            duration_seconds:
              finalTime,

            score:
              metrics.score,

            accuracy:
              metrics.accuracy,

            mistakes:
              finalWrong,

            /*
              Important:
              Memory Match has no
              real Reaction Time.
            */
            reaction_time:
              null,

            result_data: {

              domain:
                "Working Memory",

              difficulty,

              level:
                config.name,

              total_cards:
                config.pairs *
                2,

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
                metrics.completion,

              time_limit:
                config.time,

              time_remaining:
                metrics.timeRemaining,

              average_attempt_time:
                metrics
                  .averageAttemptTime,

              speed_pairs_per_minute:
                metrics.speed,

              custom:
                Boolean(
                  customGame
                ),

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


  /* =====================================================
     TIMER
  ===================================================== */

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
              elapsedTimeRef
                .current + 1
            );


          elapsedTimeRef.current =
            nextTime;


          setElapsedTime(
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


  /*
    Time finished.
  */
  useEffect(() => {

    if (
      !config ||
      !started ||
      finished
    ) {
      return;
    }


    if (
      elapsedTime >=
      config.time
    ) {

      finishGame(
        "Failed - Time Finished"
      );

    }

  }, [
    elapsedTime,
    config,
    started,
    finished,
    finishGame,
  ]);


  /* =====================================================
     CURRENT METRICS
  ===================================================== */

  const liveMetrics =
    calculateMetrics({

      correctPairs,

      wrongPairs,

      elapsedTime,

      config,

    });


  /* =====================================================
     CARD CLICK
  ===================================================== */

  const handleCard = (
    card
  ) => {

    if (
      !started ||
      finished ||
      paused ||
      flipped.length >= 2 ||
      flipped.includes(
        card.cardId
      ) ||
      matched.includes(
        card.cardId
      )
    ) {
      return;
    }


    const nextFlipped = [

      ...flipped,

      card.cardId,

    ];


    setFlipped(
      nextFlipped
    );


    if (
      nextFlipped.length !==
      2
    ) {
      return;
    }


    const first =
      cards.find(
        (item) =>
          item.cardId ===
          nextFlipped[0]
      );


    const second =
      cards.find(
        (item) =>
          item.cardId ===
          nextFlipped[1]
      );


    if (
      !first ||
      !second
    ) {

      setFlipped([]);

      return;

    }


    /* =================================================
       CORRECT
    ================================================= */

    if (
      first.pairId ===
      second.pairId
    ) {

      const nextCorrect =
        correctPairsRef
          .current + 1;


      correctPairsRef.current =
        nextCorrect;


      setCorrectPairs(
        nextCorrect
      );


      setMatched(
        (previous) => [

          ...previous,

          first.cardId,

          second.cardId,

        ]
      );


      window.setTimeout(
        () => {

          setFlipped([]);

        },
        350
      );


      /*
        Last pair completed.
      */
      if (
        nextCorrect >=
        config.pairs
      ) {

        window.setTimeout(
          () => {

            finishGame(
              "Completed"
            );

          },
          400
        );

      }


      return;

    }


    /* =================================================
       WRONG
    ================================================= */

    const nextWrong =
      wrongPairsRef.current +
      1;


    wrongPairsRef.current =
      nextWrong;


    setWrongPairs(
      nextWrong
    );


    window.setTimeout(
      () => {

        setFlipped([]);

      },
      850
    );

  };


  /* =====================================================
     RESTART
  ===================================================== */

  const restart = () => {

    if (!config) {
      return;
    }


    createDeck(
      config
    );


    setStarted(
      true
    );

    setFinished(
      false
    );

  };


  /* =====================================================
     STANDALONE REPORT DATA
  ===================================================== */

  const saveReport = () => {

    if (!finalResult) {
      return;
    }


    localStorage.setItem(
      "memoryResult",
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


  /* =====================================================
     LEVEL SELECTION
  ===================================================== */

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
              Memory Match
            </h1>


            <p
              className="
                mt-3
                text-[#77778A]
              "
            >
              Select a difficulty level before starting the assessment.
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

                      setLevel(
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

                          ? "border-[#7C6CFF] bg-[#F5F2FF] shadow-lg"

                          : "border-[#E8E8F0] hover:border-[#CFC8FF] hover:-translate-y-1"
                      }
                    `}
                  >

                    <div
                      className="
                        flex
                        justify-between
                        items-center
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
                        text-[#77778A]
                        leading-6
                      "
                    >
                      {item.description}
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
                          Cards
                        </p>

                        <p
                          className="
                            mt-1
                            font-bold
                          "
                        >
                          {item.pairs * 2}
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


          {level && (

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
                shadow-lg
                hover:bg-[#6E5FF0]
                transition
              "
            >
              Start Assessment
            </button>

          )}

        </div>

      </div>

    );

  }


  /* =====================================================
     CUSTOM GAME START
  ===================================================== */

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
            Memory Match
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

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
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

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
                Cards
              </p>

              <p className="font-bold mt-1">
                {config.pairs * 2}
              </p>

            </div>


            <div
              className="
                bg-[#F7F8FC]
                rounded-2xl
                p-4
              "
            >

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
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


  /* =====================================================
     GAME
  ===================================================== */

  if (
    started &&
    !finished &&
    config
  ) {

    const columns =
      config.pairs <= 4
        ? 4
        : config.pairs <= 8
        ? 4
        : 6;


    const timeLeft =
      Math.max(
        0,
        config.time -
          elapsedTime
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
              md:justify-between
              md:items-center
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
                WORKING MEMORY
              </p>

              <h1
                className="
                  mt-1
                  text-3xl
                  font-bold
                  text-[#202033]
                "
              >
                Memory Match
              </h1>

            </div>


            <div
              className="
                flex
                flex-wrap
                gap-3
              "
            >

              <div
                className="
                  bg-white
                  border
                  border-[#ECECF4]
                  rounded-2xl
                  px-5
                  py-3
                "
              >

                <p
                  className="
                    text-xs
                    text-[#9999AA]
                  "
                >
                  Level
                </p>

                <p className="font-bold">
                  {config.name}
                </p>

              </div>


              <div
                className="
                  bg-[#7C6CFF]
                  text-white
                  rounded-2xl
                  px-5
                  py-3
                  min-w-[105px]
                "
              >

                <p
                  className="
                    text-xs
                    opacity-75
                  "
                >
                  Game Time
                </p>

                <p className="font-bold">
                  {elapsedTime}s
                </p>

              </div>


              <div
                className="
                  bg-white
                  border
                  border-[#ECECF4]
                  rounded-2xl
                  px-5
                  py-3
                  min-w-[105px]
                "
              >

                <p
                  className="
                    text-xs
                    text-[#9999AA]
                  "
                >
                  Time Left
                </p>

                <p className="font-bold">
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
              p-5
              md:p-8
              shadow-sm
            "
          >

            <div
              className="
                grid
                gap-4
              "
              style={{

                gridTemplateColumns:
                  `repeat(${columns}, minmax(0, 1fr))`,

              }}
            >

              {cards.map(
                (card) => {

                  const open =
                    flipped.includes(
                      card.cardId
                    ) ||
                    matched.includes(
                      card.cardId
                    );


                  const IconComponent =
                    card.Icon;


                  return (

                    <button
                      key={
                        card.cardId
                      }
                      type="button"
                      disabled={
                        paused
                      }
                      onClick={() => {

                        handleCard(
                          card
                        );

                      }}
                      className={`
                        aspect-square
                        rounded-[22px]
                        flex
                        items-center
                        justify-center
                        border
                        transition-all
                        duration-300

                        ${
                          paused
                            ? "cursor-not-allowed opacity-60"
                            : ""
                        }

                        ${
                          open

                            ? "bg-[#F2EEFF] border-[#D8D0FF] shadow-inner"

                            : "bg-[#7C6CFF] border-[#6E5FF0] hover:-translate-y-1 hover:shadow-lg"
                        }
                      `}
                    >

                      {open ? (

                        card.custom ? (

                          <span
                            className="
                              text-3xl
                            "
                          >
                            {card.icon}
                          </span>

                        ) : IconComponent ? (

                          <IconComponent
                            size={38}
                            strokeWidth={
                              1.7
                            }
                            className="
                              text-[#7C6CFF]
                            "
                          />

                        ) : null

                      ) : (

                        <div
                          className="
                            w-11
                            h-11
                            rounded-full
                            border
                            border-white/30
                            flex
                            items-center
                            justify-center
                          "
                        >

                          <div
                            className="
                              w-2
                              h-2
                              rounded-full
                              bg-white/80
                            "
                          />

                        </div>

                      )}

                    </button>

                  );

                }
              )}

            </div>

          </div>


          <div
            className="
              mt-5
              flex
              flex-wrap
              justify-center
              gap-8
              text-sm
            "
          >

            <div>

              <span
                className="
                  text-[#9999AA]
                "
              >
                Attempts
              </span>

              <strong className="ml-2">
                {liveMetrics.attempts}
              </strong>

            </div>


            <div>

              <span
                className="
                  text-[#9999AA]
                "
              >
                Correct
              </span>

              <strong className="ml-2">
                {correctPairs}
              </strong>

            </div>


            <div>

              <span
                className="
                  text-[#9999AA]
                "
              >
                Wrong
              </span>

              <strong className="ml-2">
                {wrongPairs}
              </strong>

            </div>


            <div>

              <span
                className="
                  text-[#9999AA]
                "
              >
                Accuracy
              </span>

              <strong className="ml-2">
                {liveMetrics.accuracy}%
              </strong>

            </div>


            <div>

              <span
                className="
                  text-[#9999AA]
                "
              >
                Score
              </span>

              <strong className="ml-2">
                {liveMetrics.score}%
              </strong>

            </div>

          </div>

        </div>

      </div>

    );

  }


  /* =====================================================
     RESULTS
  ===================================================== */

  if (
    finished &&
    config
  ) {

    const result =
      finalResult || {

        accuracy:
          liveMetrics.accuracy,

        score:
          liveMetrics.score,

        correct:
          correctPairs,

        wrong:
          wrongPairs,

        attempts:
          liveMetrics.attempts,

        time:
          elapsedTime,

        averageAttemptTime:
          liveMetrics
            .averageAttemptTime,

        speed:
          liveMetrics.speed,

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
            shadow-xl
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

              <Star
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
              {resultStatus ===
              "Completed"
                ? "ASSESSMENT COMPLETED"
                : "ASSESSMENT FINISHED"
              }
            </p>


            <h1
              className="
                mt-2
                text-3xl
                font-bold
              "
            >
              Memory Match Results
            </h1>

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
                bg-[#F7F8FC]
                rounded-2xl
                p-5
                text-center
              "
            >

              <p className="text-xs text-[#9999AA]">
                Accuracy
              </p>

              <p className="text-2xl font-bold mt-2">
                {result.accuracy}%
              </p>

            </div>


            <div
              className="
                bg-[#F7F8FC]
                rounded-2xl
                p-5
                text-center
              "
            >

              <p className="text-xs text-[#9999AA]">
                Score
              </p>

              <p className="text-2xl font-bold mt-2">
                {result.score}%
              </p>

            </div>


            <div
              className="
                bg-[#F7F8FC]
                rounded-2xl
                p-5
                text-center
              "
            >

              <p className="text-xs text-[#9999AA]">
                Correct
              </p>

              <p className="text-2xl font-bold mt-2">
                {result.correct}
              </p>

            </div>


            <div
              className="
                bg-[#F7F8FC]
                rounded-2xl
                p-5
                text-center
              "
            >

              <p className="text-xs text-[#9999AA]">
                Wrong
              </p>

              <p className="text-2xl font-bold mt-2">
                {result.wrong}
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
                border
                border-[#ECECF4]
                rounded-2xl
                p-5
              "
            >

              <p className="text-xs text-[#9999AA]">
                Attempts
              </p>

              <p className="font-bold mt-1">
                {result.attempts}
              </p>

            </div>


            <div
              className="
                border
                border-[#ECECF4]
                rounded-2xl
                p-5
              "
            >

              <p className="text-xs text-[#9999AA]">
                Game Time
              </p>

              <p className="font-bold mt-1">
                {result.time}s
              </p>

            </div>


            <div
              className="
                border
                border-[#ECECF4]
                rounded-2xl
                p-5
              "
            >

              <p className="text-xs text-[#9999AA]">
                Avg. Attempt Time
              </p>

              <p className="font-bold mt-1">
                {
                  result.averageAttemptTime
                }s
              </p>

            </div>


            <div
              className="
                border
                border-[#ECECF4]
                rounded-2xl
                p-5
              "
            >

              <p className="text-xs text-[#9999AA]">
                Speed
              </p>

              <p className="font-bold mt-1">
                {result.speed} pairs/min
              </p>

            </div>

          </div>


          <div
            className="
              mt-5
              bg-[#F2EEFF]
              rounded-2xl
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
                text-[#555568]
                leading-6
              "
            >

              {result.accuracy >= 85

                ? "Excellent working memory accuracy."

                : result.accuracy >= 70

                ? "Good working memory accuracy. Continue monitoring progress."

                : "The child may benefit from additional working memory assessment and practice."
              }

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
                  h-14
                  rounded-2xl
                  bg-[#7C6CFF]
                  text-white
                  font-semibold
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
                  h-14
                  rounded-2xl
                  border
                  border-[#E4E4EC]
                  font-semibold
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


export default MemoryMatch;