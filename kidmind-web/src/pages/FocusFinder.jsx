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
    totalTargets: 20,
    duration: 60,
    targetSize: 82,
    targetLife: 2000,
    description:
      "A gentle introduction to visual attention.",
  },

  2: {
    name: "Medium",
    totalTargets: 30,
    duration: 45,
    targetSize: 66,
    targetLife: 1500,
    description:
      "A balanced attention and reaction challenge.",
  },

  3: {
    name: "Hard",
    totalTargets: 40,
    duration: 30,
    targetSize: 52,
    targetLife: 1000,
    description:
      "A demanding challenge for sustained attention.",
  },
};


const getRandomPosition = () => ({
  top:
    Math.floor(
      Math.random() * 70
    ) + 15,

  left:
    Math.floor(
      Math.random() * 70
    ) + 15,
});


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


const calculateMetrics = ({
  correct,
  wrong,
  missed,
  reactionTimes,
  gameTime,
  config,
}) => {

  const attempts =
    correct + wrong;


  const accuracy =
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


  const score =
    config &&
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


  const reactionSum =
    reactionTimes.reduce(
      (
        total,
        value
      ) =>
        total +
        Number(value),
      0
    );


  const averageReaction =
    reactionTimes.length > 0
      ? Number(
          (
            reactionSum /
            reactionTimes.length
          ).toFixed(2)
        )
      : null;


  const processedTargets =
    correct + missed;


  const completionRate =
    config &&
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


  const timeRemaining =
    config
      ? Math.max(
          0,
          Number(
            (
              config.duration -
              gameTime
            ).toFixed(1)
          )
        )
      : 0;


  return {
    attempts,
    accuracy,
    score,
    averageReaction,
    processedTargets,
    completionRate,
    timeRemaining,
  };
};


const FocusFinder = ({
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
  ] = useState(null);


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
    target,
    setTarget,
  ] = useState(null);


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
  ] = useState([]);


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

  const gameTimeRef =
    useRef(0);

  const targetTimeRef =
    useRef(0);

  const reactionTimesRef =
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
            ?.difficulty ||
          "Medium";


        const targets =
          Math.max(
            1,
            Number(
              customGame
                ?.settings
                ?.targets
            ) || 30
          );


        const duration =
          Math.max(
            1,
            Number(
              customGame
                ?.settings
                ?.time
            ) || 45
          );


        let targetSize =
          66;

        let targetLife =
          1500;


        if (
          String(
            customDifficulty
          ).toLowerCase() ===
          "easy"
        ) {

          targetSize =
            82;

          targetLife =
            2000;

        }


        if (
          String(
            customDifficulty
          ).toLowerCase() ===
          "hard"
        ) {

          targetSize =
            52;

          targetLife =
            1000;

        }


        return {
          name:
            customDifficulty,

          totalTargets:
            targets,

          duration,

          targetSize,

          targetLife,

          description:
            "Custom attention assessment.",
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


  const resetGame =
    useCallback(() => {

      setFinished(false);

      setCountdown(3);

      setGameTime(0);

      setTarget(null);

      setTargetTime(0);

      setCorrect(0);

      setWrong(0);

      setMissed(0);

      setReactionTimes([]);

      setFinalResult(null);


      correctRef.current =
        0;

      wrongRef.current =
        0;

      missedRef.current =
        0;

      gameTimeRef.current =
        0;

      targetTimeRef.current =
        0;

      reactionTimesRef.current =
        [];

      completionSentRef.current =
        false;

    }, []);


  const startGame =
    useCallback(() => {

      if (!config) {
        return;
      }


      resetGame();

      setStarted(true);

    }, [
      config,
      resetGame,
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


  const finishAssessment =
    useCallback(
      (
        reason =
          "Assessment Completed"
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

        const finalMissed =
          missedRef.current;

        const finalGameTime =
          Math.min(
            config.duration,
            gameTimeRef.current
          );

        const finalReactionTimes =
          [
            ...reactionTimesRef
              .current,
          ];


        const metrics =
          calculateMetrics({

            correct:
              finalCorrect,

            wrong:
              finalWrong,

            missed:
              finalMissed,

            reactionTimes:
              finalReactionTimes,

            gameTime:
              finalGameTime,

            config,

          });


        const recommendation =
          metrics.accuracy >= 85
            ? "Good Performance"
            : metrics.accuracy >= 70
            ? "Monitor Progress"
            : "Needs Further Assessment";


        const report = {

          game:
            "Focus Finder",

          domain:
            "Attention",

          custom:
            Boolean(
              customGame
            ),

          level:
            config.name,

          difficulty,

          totalTargets:
            config.totalTargets,

          correct:
            finalCorrect,

          wrong:
            finalWrong,

          mistakes:
            finalWrong,

          missed:
            finalMissed,

          attempts:
            metrics.attempts,

          score:
            metrics.score,

          accuracy:
            metrics.accuracy,

          averageReactionTime:
            metrics.averageReaction,

          reactionTimes:
            finalReactionTimes,

          completionRate:
            metrics.completionRate,

          duration:
            config.duration,

          timeSpent:
            finalGameTime,

          timeRemaining:
            metrics.timeRemaining,

          completed:
            true,

          status:
            "Completed",

          finishReason:
            reason,

          recommendation,

          date:
            new Date()
              .toLocaleDateString(),

          timestamp:
            new Date()
              .toISOString(),

        };


        localStorage.setItem(
          "focusResult",
          JSON.stringify(
            report
          )
        );


        localStorage.setItem(
          "focusFinderResult",
          JSON.stringify(
            report
          )
        );


        setFinalResult(
          report
        );

        setTarget(null);

        setTargetTime(0);

        setFinished(true);


        if (onComplete) {

          onComplete({

            status:
              "Completed",

            duration_seconds:
              Math.max(
                0,
                Math.ceil(
                  finalGameTime
                )
              ),

            score:
              metrics.score,

            accuracy:
              metrics.accuracy,

            mistakes:
              finalWrong,

            reaction_time:
              metrics.averageReaction,

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

              wrong_clicks:
                finalWrong,

              mistakes:
                finalWrong,

              missed_targets:
                finalMissed,

              total_attempts:
                metrics.attempts,

              score:
                metrics.score,

              accuracy:
                metrics.accuracy,

              reaction_times:
                finalReactionTimes,

              average_reaction_time:
                metrics.averageReaction,

              completion_rate:
                metrics.completionRate,

              time_limit:
                config.duration,

              time_remaining:
                metrics.timeRemaining,

              target_life_ms:
                config.targetLife,

              finish_reason:
                reason,

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
      paused ||
      countdown <= 0
    ) {
      return;
    }


    const timer =
      window.setTimeout(
        () => {

          setCountdown(
            (currentValue) =>
              currentValue - 1
          );

        },
        1000
      );


    return () => {

      window.clearTimeout(
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
      paused ||
      countdown > 0 ||
      !config
    ) {
      return;
    }


    const timer =
      window.setInterval(
        () => {

          const nextGameTime =
            Math.min(
              config.duration,
              Number(
                (
                  gameTimeRef.current +
                  0.1
                ).toFixed(1)
              )
            );


          gameTimeRef.current =
            nextGameTime;


          setGameTime(
            nextGameTime
          );


          if (target) {

            const nextTargetTime =
              Number(
                (
                  targetTimeRef.current +
                  0.1
                ).toFixed(1)
              );


            targetTimeRef.current =
              nextTargetTime;


            setTargetTime(
              nextTargetTime
            );

          }

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
    countdown,
    config,
    target,
  ]);


  useEffect(() => {

    if (
      !started ||
      finished ||
      countdown > 0 ||
      !config
    ) {
      return;
    }


    if (
      gameTime >=
      config.duration
    ) {

      finishAssessment(
        "Time Finished"
      );

    }

  }, [
    started,
    finished,
    countdown,
    gameTime,
    config,
    finishAssessment,
  ]);


  useEffect(() => {

    if (
      !started ||
      finished ||
      paused ||
      countdown > 0 ||
      !config ||
      target
    ) {
      return;
    }


    const processedTargets =
      correctRef.current +
      missedRef.current;


    if (
      processedTargets >=
      config.totalTargets
    ) {

      finishAssessment(
        "All Targets Finished"
      );

      return;
    }


    if (
      gameTimeRef.current >=
      config.duration
    ) {
      return;
    }


    setTarget(
      getRandomPosition()
    );

    setTargetTime(0);

    targetTimeRef.current =
      0;

  }, [
    started,
    finished,
    paused,
    countdown,
    target,
    correct,
    missed,
    config,
    finishAssessment,
  ]);


  useEffect(() => {

    if (
      !target ||
      finished ||
      paused ||
      countdown > 0 ||
      !config
    ) {
      return;
    }


    if (
      targetTime * 1000 <
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

    setTarget(null);

    setTargetTime(0);

    targetTimeRef.current =
      0;


    if (
      correctRef.current +
        nextMissed >=
      config.totalTargets
    ) {

      finishAssessment(
        "All Targets Finished"
      );

    }

  }, [
    target,
    targetTime,
    finished,
    paused,
    countdown,
    config,
    finishAssessment,
  ]);


  const handleTargetClick =
    (
      event
    ) => {

      event.stopPropagation();


      if (
        !target ||
        finished ||
        paused ||
        countdown > 0
      ) {
        return;
      }


      const reactionTime =
        Math.max(
          0.1,
          Number(
            targetTimeRef.current
              .toFixed(2)
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

      setTarget(null);

      setTargetTime(0);

      targetTimeRef.current =
        0;


      if (
        nextCorrect +
          missedRef.current >=
        config.totalTargets
      ) {

        finishAssessment(
          "All Targets Finished"
        );

      }

    };


  const handleWrongClick =
    () => {

      if (
        !started ||
        finished ||
        paused ||
        countdown > 0 ||
        !target
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


  const restartGame =
    () => {

      resetGame();

      setStarted(false);

    };


  const saveReport =
    () => {

      if (!finalResult) {
        return;
      }


      localStorage.setItem(
        "focusResult",
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


  const liveMetrics =
    calculateMetrics({

      correct,

      wrong,

      missed,

      reactionTimes,

      gameTime,

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
              Focus Finder
            </h1>


            <p
              className="
                mt-3
                max-w-2xl
                text-[#77778A]
              "
            >
              Select a difficulty level before starting the attention and reaction assessment.
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
                        min-h-[48px]
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
                          Targets
                        </p>

                        <p
                          className="
                            mt-1
                            font-bold
                            text-[#303044]
                          "
                        >
                          {item.totalTargets}
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
                          {item.duration}s
                        </p>

                      </div>

                    </div>


                    <div
                      className="
                        mt-4
                        text-xs
                        text-[#9999AA]
                      "
                    >
                      Target visibility:{" "}
                      {item.targetLife / 1000}s
                    </div>

                  </button>

                );

              }
            )}

          </div>


          <button
            type="button"
            disabled={!level}
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
              disabled:opacity-40
              transition
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
            shadow-[0_20px_60px_rgba(30,30,60,0.08)]
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
            Focus Finder
          </h1>


          <p
            className="
              mt-3
              text-[#77778A]
            "
          >
            {config.description}
          </p>


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

              <p
                className="
                  mt-1
                  font-bold
                  text-[#303044]
                "
              >
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
                Targets
              </p>

              <p
                className="
                  mt-1
                  font-bold
                  text-[#303044]
                "
              >
                {config.totalTargets}
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

              <p
                className="
                  mt-1
                  font-bold
                  text-[#303044]
                "
              >
                {config.duration}s
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
        Number(
          (
            config.duration -
            gameTime
          ).toFixed(1)
        )
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
                ATTENTION ASSESSMENT
              </p>


              <h1
                className="
                  mt-1
                  text-3xl
                  font-bold
                  text-[#202033]
                "
              >
                Focus Finder
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

                <p
                  className="
                    text-xs
                    text-[#9999AA]
                  "
                >
                  Level
                </p>

                <p
                  className="
                    font-bold
                    text-[#303044]
                  "
                >
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

                <p
                  className="
                    text-xs
                    opacity-75
                  "
                >
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

                <p
                  className="
                    text-xs
                    text-[#9999AA]
                  "
                >
                  Time Left
                </p>

                <p
                  className="
                    font-bold
                    text-[#303044]
                  "
                >
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
              overflow-hidden
            "
          >

            <div
              className="
                relative
                h-[520px]
                md:h-[600px]
                bg-[#FAFAFD]
              "
              onClick={
                handleWrongClick
              }
            >

              {countdown > 0 ? (

                <div
                  className="
                    absolute
                    inset-0
                    flex
                    flex-col
                    items-center
                    justify-center
                  "
                >

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-[#9999AA]
                    "
                  >
                    GET READY
                  </p>

                  <p
                    className="
                      mt-2
                      text-7xl
                      font-bold
                      text-[#7C6CFF]
                    "
                  >
                    {countdown}
                  </p>

                  <p
                    className="
                      mt-3
                      text-sm
                      text-[#77778A]
                    "
                  >
                    Click the target as quickly as possible.
                  </p>

                </div>

              ) : target ? (

                <button
                  type="button"
                  aria-label="Target"
                  disabled={paused}
                  onClick={
                    handleTargetClick
                  }
                  style={{
                    width:
                      config.targetSize,

                    height:
                      config.targetSize,

                    top:
                      `${target.top}%`,

                    left:
                      `${target.left}%`,
                  }}
                  className="
                    absolute
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-[#7C6CFF]
                    border-[7px]
                    border-[#E7E2FF]
                    shadow-[0_12px_35px_rgba(124,108,255,0.35)]
                    hover:scale-105
                    active:scale-95
                    transition-transform
                    disabled:opacity-60
                  "
                >

                  <span
                    className="
                      absolute
                      inset-[22%]
                      rounded-full
                      border
                      border-white
                      opacity-60
                    "
                  />

                  <span
                    className="
                      absolute
                      top-1/2
                      left-1/2
                      -translate-x-1/2
                      -translate-y-1/2
                      w-3
                      h-3
                      rounded-full
                      bg-white
                    "
                  />

                </button>

              ) : (

                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                  "
                >

                  <p
                    className="
                      text-sm
                      text-[#9999AA]
                    "
                  >
                    Preparing next target...
                  </p>

                </div>

              )}

            </div>

          </div>


          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
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
                Correct
              </span>

              <span
                className="
                  ml-2
                  font-bold
                  text-[#303044]
                "
              >
                {correct}
              </span>

            </div>


            <div>

              <span
                className="
                  text-[#9999AA]
                "
              >
                Mistakes
              </span>

              <span
                className="
                  ml-2
                  font-bold
                  text-[#303044]
                "
              >
                {wrong}
              </span>

            </div>


            <div>

              <span
                className="
                  text-[#9999AA]
                "
              >
                Missed
              </span>

              <span
                className="
                  ml-2
                  font-bold
                  text-[#303044]
                "
              >
                {missed}
              </span>

            </div>


            <div>

              <span
                className="
                  text-[#9999AA]
                "
              >
                Accuracy
              </span>

              <span
                className="
                  ml-2
                  font-bold
                  text-[#303044]
                "
              >
                {liveMetrics.accuracy}%
              </span>

            </div>


            <div>

              <span
                className="
                  text-[#9999AA]
                "
              >
                Score
              </span>

              <span
                className="
                  ml-2
                  font-bold
                  text-[#303044]
                "
              >
                {liveMetrics.score}%
              </span>

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

        correct,

        wrong,

        missed,

        attempts:
          liveMetrics.attempts,

        averageReactionTime:
          liveMetrics.averageReaction,

        completionRate:
          liveMetrics.completionRate,

        timeSpent:
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
                  w-7
                  h-7
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
              ASSESSMENT COMPLETED
            </p>


            <h1
              className="
                mt-2
                text-3xl
                font-bold
                text-[#202033]
              "
            >
              Focus Finder Results
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

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
                Accuracy
              </p>

              <p
                className="
                  mt-2
                  text-2xl
                  font-bold
                  text-[#303044]
                "
              >
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

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
                Score
              </p>

              <p
                className="
                  mt-2
                  text-2xl
                  font-bold
                  text-[#303044]
                "
              >
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

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
                Correct
              </p>

              <p
                className="
                  mt-2
                  text-2xl
                  font-bold
                  text-[#303044]
                "
              >
                {result.correct}
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

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
                Missed
              </p>

              <p
                className="
                  mt-2
                  text-2xl
                  font-bold
                  text-[#303044]
                "
              >
                {result.missed}
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

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
                Mistakes
              </p>

              <p
                className="
                  mt-1
                  font-bold
                  text-[#303044]
                "
              >
                {result.wrong}
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

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
                Attempts
              </p>

              <p
                className="
                  mt-1
                  font-bold
                  text-[#303044]
                "
              >
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

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
                Avg. Reaction
              </p>

              <p
                className="
                  mt-1
                  font-bold
                  text-[#303044]
                "
              >
                {result.averageReactionTime !==
                null
                  ? `${result.averageReactionTime}s`
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

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
                Game Time
              </p>

              <p
                className="
                  mt-1
                  font-bold
                  text-[#303044]
                "
              >
                {Number(
                  result.timeSpent
                ).toFixed(1)}s
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


export default FocusFinder;