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
  BookOpen,
  Clock3,
  Play,
  Trophy,
} from "lucide-react";


const LEVELS = {
  1: {
    name: "Easy",
    questions: 8,
    time: 60,
  },

  2: {
    name: "Medium",
    questions: 12,
    time: 90,
  },

  3: {
    name: "Hard",
    questions: 16,
    time: 120,
  },
};


const Shape = ({
  type,
  color = "#7C6CFF",
  size = 80,
}) => {

  if (type === "circle") {
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

  if (type === "square") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <rect
          x="15"
          y="15"
          width="70"
          height="70"
          rx="8"
          fill={color}
        />
      </svg>
    );
  }

  if (type === "triangle") {
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

  if (type === "diamond") {
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

  if (type === "rectangle") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <rect
          x="10"
          y="25"
          width="80"
          height="50"
          rx="8"
          fill={color}
        />
      </svg>
    );
  }

  if (type === "star") {
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

  return null;
};


const DATA = [
  {
    type: "color",
    title: "The Red Circle",
    description:
      "A red circle is placed next to a blue square.",
    question:
      "Which shape is red?",
    visual: (
      <div className="flex items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <Shape
            type="circle"
            color="#EF6A8A"
          />
          <span className="text-sm font-semibold">
            Circle
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Shape
            type="square"
            color="#63B3ED"
          />
          <span className="text-sm font-semibold">
            Square
          </span>
        </div>
      </div>
    ),
    answer: "Circle",
    options: [
      "Circle",
      "Square",
      "Triangle",
      "Diamond",
    ],
  },

  {
    type: "shape",
    title: "The Blue Shape",
    description:
      "There are three shapes. Only one of them is blue.",
    question:
      "Which shape is blue?",
    visual: (
      <div className="flex items-center justify-center gap-6">
        <Shape
          type="circle"
          color="#F2A65A"
        />

        <Shape
          type="triangle"
          color="#63B3ED"
        />

        <Shape
          type="square"
          color="#A59AFF"
        />
      </div>
    ),
    answer: "Triangle",
    options: [
      "Circle",
      "Triangle",
      "Square",
      "Diamond",
    ],
  },

  {
    type: "position",
    title: "Above and Below",
    description:
      "A purple circle is above a green square.",
    question:
      "What is below the circle?",
    visual: (
      <div className="flex flex-col items-center gap-2">
        <Shape
          type="circle"
          color="#A59AFF"
        />

        <Shape
          type="square"
          color="#7BC67B"
        />
      </div>
    ),
    answer: "Green square",
    options: [
      "Green square",
      "Purple circle",
      "Blue triangle",
      "Red diamond",
    ],
  },

  {
    type: "position",
    title: "Left and Right",
    description:
      "A yellow triangle is on the left of a purple circle.",
    question:
      "What is on the left?",
    visual: (
      <div className="flex items-center justify-center gap-8">
        <Shape
          type="triangle"
          color="#F2C94C"
        />

        <Shape
          type="circle"
          color="#A59AFF"
        />
      </div>
    ),
    answer: "Yellow triangle",
    options: [
      "Yellow triangle",
      "Purple circle",
      "Blue square",
      "Red diamond",
    ],
  },

  {
    type: "color",
    title: "Find the Purple Shape",
    description:
      "A green triangle, a purple diamond, and a blue circle are shown.",
    question:
      "Which shape is purple?",
    visual: (
      <div className="flex items-center justify-center gap-5">
        <Shape
          type="triangle"
          color="#7BC67B"
        />

        <Shape
          type="diamond"
          color="#A59AFF"
        />

        <Shape
          type="circle"
          color="#63B3ED"
        />
      </div>
    ),
    answer: "Diamond",
    options: [
      "Triangle",
      "Diamond",
      "Circle",
      "Square",
    ],
  },

  {
    type: "count",
    title: "Count the Shapes",
    description:
      "Look carefully at the shapes.",
    question:
      "How many circles are there?",
    visual: (
      <div className="flex items-center justify-center gap-4">
        <Shape
          type="circle"
          color="#7C6CFF"
          size={60}
        />

        <Shape
          type="square"
          color="#63B3ED"
          size={60}
        />

        <Shape
          type="circle"
          color="#EF6A8A"
          size={60}
        />
      </div>
    ),
    answer: "2",
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
  },

  {
    type: "count",
    title: "Count the Squares",
    description:
      "There are different shapes in the scene.",
    question:
      "How many squares are there?",
    visual: (
      <div className="flex items-center justify-center gap-4">
        <Shape
          type="square"
          color="#7C6CFF"
          size={60}
        />

        <Shape
          type="circle"
          color="#F2C94C"
          size={60}
        />

        <Shape
          type="square"
          color="#63B3ED"
          size={60}
        />

        <Shape
          type="triangle"
          color="#EF6A8A"
          size={60}
        />
      </div>
    ),
    answer: "2",
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
  },

  {
    type: "color",
    title: "The Yellow Shape",
    description:
      "The scene contains a yellow circle and a purple triangle.",
    question:
      "What color is the circle?",
    visual: (
      <div className="flex items-center justify-center gap-8">
        <Shape
          type="circle"
          color="#F2C94C"
        />

        <Shape
          type="triangle"
          color="#A59AFF"
        />
      </div>
    ),
    answer: "Yellow",
    options: [
      "Yellow",
      "Purple",
      "Blue",
      "Green",
    ],
  },

  {
    type: "shape",
    title: "Find the Triangle",
    description:
      "Three different shapes are shown.",
    question:
      "Which one is the triangle?",
    visual: (
      <div className="flex items-center justify-center gap-7">
        <Shape
          type="circle"
          color="#63B3ED"
        />

        <Shape
          type="triangle"
          color="#7C6CFF"
        />

        <Shape
          type="square"
          color="#F2C94C"
        />
      </div>
    ),
    answer: "Middle shape",
    options: [
      "Left shape",
      "Middle shape",
      "Right shape",
      "None",
    ],
  },

  {
    type: "position",
    title: "The Shape in the Middle",
    description:
      "A circle is on the left, a triangle is in the middle, and a square is on the right.",
    question:
      "Which shape is in the middle?",
    visual: (
      <div className="flex items-center justify-center gap-5">
        <Shape
          type="circle"
          color="#63B3ED"
          size={60}
        />

        <Shape
          type="triangle"
          color="#7C6CFF"
          size={60}
        />

        <Shape
          type="square"
          color="#F2C94C"
          size={60}
        />
      </div>
    ),
    answer: "Triangle",
    options: [
      "Circle",
      "Triangle",
      "Square",
      "Diamond",
    ],
  },

  {
    type: "color",
    title: "Green and Blue",
    description:
      "A green triangle is beside a blue diamond.",
    question:
      "What color is the diamond?",
    visual: (
      <div className="flex items-center justify-center gap-8">
        <Shape
          type="triangle"
          color="#7BC67B"
        />

        <Shape
          type="diamond"
          color="#63B3ED"
        />
      </div>
    ),
    answer: "Blue",
    options: [
      "Green",
      "Blue",
      "Yellow",
      "Purple",
    ],
  },

  {
    type: "count",
    title: "Three Shapes",
    description:
      "Look at all the shapes carefully.",
    question:
      "How many shapes are shown?",
    visual: (
      <div className="flex items-center justify-center gap-4">
        <Shape
          type="circle"
          color="#7C6CFF"
          size={60}
        />

        <Shape
          type="triangle"
          color="#63B3ED"
          size={60}
        />

        <Shape
          type="diamond"
          color="#F2C94C"
          size={60}
        />
      </div>
    ),
    answer: "3",
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
  },

  {
    type: "position",
    title: "The Shape on the Right",
    description:
      "A square is on the left and a red circle is on the right.",
    question:
      "Which shape is on the right?",
    visual: (
      <div className="flex items-center justify-center gap-8">
        <Shape
          type="square"
          color="#63B3ED"
        />

        <Shape
          type="circle"
          color="#EF6A8A"
        />
      </div>
    ),
    answer: "Red circle",
    options: [
      "Blue square",
      "Red circle",
      "Purple triangle",
      "Green diamond",
    ],
  },

  {
    type: "shape",
    title: "The Diamond",
    description:
      "A circle, diamond, and triangle are shown.",
    question:
      "Which shape has four corners?",
    visual: (
      <div className="flex items-center justify-center gap-6">
        <Shape
          type="circle"
          color="#63B3ED"
          size={65}
        />

        <Shape
          type="diamond"
          color="#A59AFF"
          size={65}
        />

        <Shape
          type="triangle"
          color="#F2C94C"
          size={65}
        />
      </div>
    ),
    answer: "Diamond",
    options: [
      "Circle",
      "Diamond",
      "Triangle",
      "None",
    ],
  },

  {
    type: "color",
    title: "The Orange Shape",
    description:
      "A purple square and an orange triangle are shown.",
    question:
      "Which shape is orange?",
    visual: (
      <div className="flex items-center justify-center gap-8">
        <Shape
          type="square"
          color="#A59AFF"
        />

        <Shape
          type="triangle"
          color="#F2A65A"
        />
      </div>
    ),
    answer: "Triangle",
    options: [
      "Square",
      "Triangle",
      "Circle",
      "Diamond",
    ],
  },

  {
    type: "position",
    title: "Above the Square",
    description:
      "A blue triangle is above a purple square.",
    question:
      "What is above the square?",
    visual: (
      <div className="flex flex-col items-center gap-2">
        <Shape
          type="triangle"
          color="#63B3ED"
        />

        <Shape
          type="square"
          color="#A59AFF"
        />
      </div>
    ),
    answer: "Blue triangle",
    options: [
      "Blue triangle",
      "Purple square",
      "Red circle",
      "Green diamond",
    ],
  },

  {
    type: "count",
    title: "Circle Count",
    description:
      "Two circles and one triangle are shown.",
    question:
      "How many circles can you see?",
    visual: (
      <div className="flex items-center justify-center gap-5">
        <Shape
          type="circle"
          color="#EF6A8A"
          size={65}
        />

        <Shape
          type="triangle"
          color="#63B3ED"
          size={65}
        />

        <Shape
          type="circle"
          color="#7C6CFF"
          size={65}
        />
      </div>
    ),
    answer: "2",
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
  },

  {
    type: "shape",
    title: "The Star",
    description:
      "There are three shapes in the scene.",
    question:
      "Which shape has many points?",
    visual: (
      <div className="flex items-center justify-center gap-6">
        <Shape
          type="circle"
          color="#63B3ED"
          size={65}
        />

        <Shape
          type="star"
          color="#F2C94C"
          size={65}
        />

        <Shape
          type="square"
          color="#A59AFF"
          size={65}
        />
      </div>
    ),
    answer: "Star",
    options: [
      "Circle",
      "Star",
      "Square",
      "Triangle",
    ],
  },

  {
    type: "color",
    title: "The Pink Circle",
    description:
      "A pink circle is beside a green square.",
    question:
      "What color is the circle?",
    visual: (
      <div className="flex items-center justify-center gap-8">
        <Shape
          type="circle"
          color="#EF6A8A"
        />

        <Shape
          type="square"
          color="#7BC67B"
        />
      </div>
    ),
    answer: "Pink",
    options: [
      "Pink",
      "Green",
      "Blue",
      "Purple",
    ],
  },

  {
    type: "position",
    title: "Left Side",
    description:
      "A purple diamond is on the left of a yellow circle.",
    question:
      "What is on the left?",
    visual: (
      <div className="flex items-center justify-center gap-8">
        <Shape
          type="diamond"
          color="#A59AFF"
        />

        <Shape
          type="circle"
          color="#F2C94C"
        />
      </div>
    ),
    answer: "Purple diamond",
    options: [
      "Purple diamond",
      "Yellow circle",
      "Blue square",
      "Green triangle",
    ],
  },

  {
    type: "count",
    title: "Four Shapes",
    description:
      "Four shapes are arranged in one row.",
    question:
      "How many shapes are there?",
    visual: (
      <div className="flex items-center justify-center gap-3">
        <Shape
          type="circle"
          color="#EF6A8A"
          size={55}
        />

        <Shape
          type="square"
          color="#63B3ED"
          size={55}
        />

        <Shape
          type="triangle"
          color="#7C6CFF"
          size={55}
        />

        <Shape
          type="diamond"
          color="#F2C94C"
          size={55}
        />
      </div>
    ),
    answer: "4",
    options: [
      "2",
      "3",
      "4",
      "5",
    ],
  },

  {
    type: "shape",
    title: "The Rectangle",
    description:
      "A rectangle is shown beside a circle.",
    question:
      "Which shape is wider than it is tall?",
    visual: (
      <div className="flex items-center justify-center gap-8">
        <Shape
          type="rectangle"
          color="#7C6CFF"
        />

        <Shape
          type="circle"
          color="#63B3ED"
        />
      </div>
    ),
    answer: "Rectangle",
    options: [
      "Rectangle",
      "Circle",
      "Triangle",
      "Diamond",
    ],
  },
];


const ANSWER_COLORS = [
  {
    background: "#F2EEFF",
    border: "#DDD7FF",
  },
  {
    background: "#EAF7FF",
    border: "#CDEBFF",
  },
  {
    background: "#FFF5E8",
    border: "#FFE1B8",
  },
  {
    background: "#EEF9EE",
    border: "#D5EFD5",
  },
];


const shuffle = (array) => {

  const result = [
    ...array,
  ];

  for (
    let i = result.length - 1;
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


const ReadingAdventure = ({
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
    current,
    setCurrent,
  ] = useState(0);

  const [
    questions,
    setQuestions,
  ] = useState([]);

  const [
    correct,
    setCorrect,
  ] = useState(0);

  const [
    wrong,
    setWrong,
  ] = useState(0);

  const [
    gameTime,
    setGameTime,
  ] = useState(0);

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState(null);

  const [
    answerLocked,
    setAnswerLocked,
  ] = useState(false);

  const [
    finalResult,
    setFinalResult,
  ] = useState(null);


  const correctRef =
    useRef(0);

  const wrongRef =
    useRef(0);

  const gameTimeRef =
    useRef(0);

  const questionsRef =
    useRef([]);

  const completionSentRef =
    useRef(false);

  const initializedRef =
    useRef(false);


  const config =
    useMemo(() => {

      if (customGame) {

        return {
          name:
            customGame
              ?.settings
              ?.readingLevel ||
            customGame
              ?.settings
              ?.difficulty ||
            "Custom",

          questions:
            Math.max(
              1,
              Number(
                customGame
                  ?.settings
                  ?.questions
              ) || 8
            ),

          time:
            Math.max(
              1,
              Number(
                customGame
                  ?.settings
                  ?.time
              ) || 60
            ),
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


  const createQuestions =
    useCallback(() => {

      const shuffled =
        shuffle(
          DATA
        );

      const count =
        Math.min(
          config.questions,
          shuffled.length
        );

      return shuffled.slice(
        0,
        count
      );

    }, [
      config.questions,
    ]);


  const prepareGame =
    useCallback(() => {

      const newQuestions =
        createQuestions();

      questionsRef.current =
        newQuestions;

      setQuestions(
        newQuestions
      );

      setCurrent(0);

      setCorrect(0);

      setWrong(0);

      setGameTime(0);

      setSelectedAnswer(
        null
      );

      setAnswerLocked(
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
      createQuestions,
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
      ({
        completedAll,
        finalCorrect,
        finalWrong,
      }) => {

        if (
          completionSentRef.current
        ) {
          return;
        }

        completionSentRef.current =
          true;


        const totalQuestions =
          questionsRef.current.length ||
          Math.min(
            config.questions,
            DATA.length
          );


        const attempts =
          finalCorrect +
          finalWrong;


        const missed =
          Math.max(
            0,
            totalQuestions -
            attempts
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
          totalQuestions > 0
            ? Math.min(
                100,
                Math.round(
                  (
                    finalCorrect /
                    totalQuestions
                  ) * 100
                )
              )
            : 0;


        const completionRate =
          totalQuestions > 0
            ? Math.min(
                100,
                Math.round(
                  (
                    attempts /
                    totalQuestions
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
            config.time -
            finalGameTime
          );


        const status =
          completedAll
            ? "Completed"
            : "Failed";


        const recommendation =
          accuracy >= 85
            ? "Excellent reading comprehension and visual attention."
            : accuracy >= 70
            ? "Good comprehension skills. Continue monitoring progress."
            : "The child may benefit from additional reading comprehension and visual attention practice.";


        const report = {
          game:
            "Reading Adventure",

          domain:
            "Reading Comprehension",

          custom:
            Boolean(
              customGame
            ),

          level:
            config.name,

          difficulty,

          totalQuestions,

          correct:
            finalCorrect,

          wrong:
            finalWrong,

          mistakes:
            finalWrong,

          attempts,

          missed,

          score,

          accuracy,

          completionRate,

          reactionTime:
            null,

          time:
            finalGameTime,

          timeLimit:
            config.time,

          timeRemaining,

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
          "readingAdventureResult",
          JSON.stringify(
            report
          )
        );


        setCorrect(
          finalCorrect
        );

        setWrong(
          finalWrong
        );

        setFinalResult(
          report
        );

        setFinished(
          true
        );


        if (onComplete) {

          onComplete({
            status,

            duration_seconds:
              Math.max(
                0,
                Math.floor(
                  finalGameTime
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
                "Reading Comprehension",

              difficulty,

              level:
                config.name,

              total_questions:
                totalQuestions,

              correct_answers:
                finalCorrect,

              wrong_answers:
                finalWrong,

              mistakes:
                finalWrong,

              missed_questions:
                missed,

              total_attempts:
                attempts,

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

      finishAssessment({
        completedAll:
          false,

        finalCorrect:
          correctRef.current,

        finalWrong:
          wrongRef.current,
      });

    }

  }, [
    started,
    finished,
    gameTime,
    config.time,
    finishAssessment,
  ]);


  const checkAnswer = (
    option
  ) => {

    if (
      !started ||
      finished ||
      paused ||
      answerLocked ||
      !questions[current]
    ) {
      return;
    }


    setSelectedAnswer(
      option
    );

    setAnswerLocked(
      true
    );


    const isCorrect =
      option ===
      questions[current].answer;


    let nextCorrect =
      correctRef.current;

    let nextWrong =
      wrongRef.current;


    if (isCorrect) {

      nextCorrect += 1;

      correctRef.current =
        nextCorrect;

      setCorrect(
        nextCorrect
      );

    } else {

      nextWrong += 1;

      wrongRef.current =
        nextWrong;

      setWrong(
        nextWrong
      );

    }


    const lastQuestion =
      current >=
      questions.length - 1;


    window.setTimeout(
      () => {

        if (
          lastQuestion
        ) {

          finishAssessment({
            completedAll:
              true,

            finalCorrect:
              nextCorrect,

            finalWrong:
              nextWrong,
          });

          return;

        }


        setCurrent(
          (previous) =>
            previous + 1
        );

        setSelectedAnswer(
          null
        );

        setAnswerLocked(
          false
        );

      },
      450
    );

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

    setCurrent(0);

    setCorrect(0);

    setWrong(0);

    setGameTime(0);

    setQuestions([]);

    setSelectedAnswer(
      null
    );

    setAnswerLocked(
      false
    );

    setFinalResult(
      null
    );

  };


  const viewReport =
    () => {

      if (!finalResult) {
        return;
      }


      localStorage.setItem(
        "readingAdventureResult",
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


  const totalQuestions =
    questions.length ||
    Math.min(
      config.questions,
      DATA.length
    );


  const attempts =
    correct +
    wrong;


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
    totalQuestions > 0
      ? Math.min(
          100,
          Math.round(
            (
              correct /
              totalQuestions
            ) * 100
          )
        )
      : 0;


  const missed =
    Math.max(
      0,
      totalQuestions -
      attempts
    );


  const timeLeft =
    Math.max(
      0,
      config.time -
      gameTime
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
              Reading Adventure
            </h1>


            <p
              className="
                mt-3
                max-w-2xl
                text-[#77778A]
              "
            >
              Read the short visual story, observe the shapes and colors, then choose the correct answer.
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
                      Read and understand visual stories, shapes and colors.
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
                          Questions
                        </p>

                        <p
                          className="
                            mt-1
                            font-bold
                            text-[#303044]
                          "
                        >
                          {item.questions}
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

              <BookOpen
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
                {config.name}
              </h2>

            </div>

          </div>


          <div
            className="
              grid
              grid-cols-2
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

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
                Questions
              </p>

              <p
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-[#303044]
                "
              >
                {config.questions}
              </p>

            </div>


            <div
              className="
                bg-[#F7F8FC]
                rounded-2xl
                p-5
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
                  text-xl
                  font-bold
                  text-[#303044]
                "
              >
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
    questions.length > 0
  ) {

    const question =
      questions[
        current
      ];


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
                READING COMPREHENSION
              </p>

              <h1
                className="
                  mt-1
                  text-3xl
                  font-bold
                  text-[#202033]
                "
              >
                Reading Adventure
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
                items-center
                justify-between
                mb-6
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
                  QUESTION
                </p>

                <p
                  className="
                    mt-1
                    font-bold
                    text-[#303044]
                  "
                >
                  {current + 1}
                  {" / "}
                  {questions.length}
                </p>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  text-[#77778A]
                "
              >
                <Clock3
                  size={16}
                />

                {timeLeft}s
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
                "
                style={{
                  width:
                    `${
                      (
                        (
                          current + 1
                        ) /
                        questions.length
                      ) * 100
                    }%`,
                }}
              />

            </div>


            <div
              className="
                mt-8
                rounded-[28px]
                bg-[#F7F8FC]
                border
                border-[#ECECF4]
                p-6
                md:p-8
              "
            >

              <div className="text-center">

                <p
                  className="
                    text-xs
                    font-semibold
                    text-[#7C6CFF]
                  "
                >
                  {question.title}
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[#77778A]
                  "
                >
                  {question.description}
                </p>

              </div>


              <div
                className="
                  mt-7
                  min-h-[180px]
                  flex
                  items-center
                  justify-center
                "
              >
                {question.visual}
              </div>

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
                QUESTION
              </p>

              <h2
                className="
                  mt-2
                  text-xl
                  md:text-2xl
                  font-bold
                  text-[#202033]
                "
              >
                {question.question}
              </h2>

            </div>


            <div
              className="
                mt-6
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
              "
            >

              {question.options.map(
                (
                  option,
                  index
                ) => {

                  const color =
                    ANSWER_COLORS[
                      index %
                      ANSWER_COLORS.length
                    ];


                  const isSelected =
                    selectedAnswer ===
                    option;


                  const isCorrect =
                    option ===
                    question.answer;


                  let extraClass =
                    "";


                  if (
                    isSelected &&
                    isCorrect
                  ) {

                    extraClass =
                      "border-[#7BC67B] bg-[#EEF9EE]";

                  }


                  if (
                    isSelected &&
                    !isCorrect
                  ) {

                    extraClass =
                      "border-[#EF6A8A] bg-[#FFF0F3]";

                  }


                  return (

                    <button
                      key={option}
                      type="button"
                      disabled={
                        answerLocked ||
                        paused
                      }
                      onClick={() => {

                        checkAnswer(
                          option
                        );

                      }}
                      className={`
                        min-h-[72px]
                        rounded-2xl
                        border-2
                        px-5
                        text-left
                        font-semibold
                        text-[#303044]
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:shadow-sm
                        disabled:cursor-default
                        ${extraClass}
                      `}
                      style={
                        !isSelected
                          ? {
                              backgroundColor:
                                color.background,

                              borderColor:
                                color.border,
                            }
                          : undefined
                      }
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
                            w-9
                            h-9
                            rounded-xl
                            bg-white
                            flex
                            items-center
                            justify-center
                            text-sm
                            font-bold
                            text-[#7C6CFF]
                          "
                        >
                          {String.fromCharCode(
                            65 + index
                          )}
                        </div>

                        <span>
                          {option}
                        </span>

                      </div>

                    </button>

                  );

                }
              )}

            </div>


            <div
              className="
                mt-8
                pt-6
                border-t
                border-[#EEEEF5]
                flex
                flex-wrap
                items-center
                justify-center
                gap-10
                text-sm
              "
            >

              <div className="text-center">

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
                    mt-1
                    font-bold
                    text-[#303044]
                  "
                >
                  {correct}
                </p>

              </div>


              <div className="text-center">

                <p
                  className="
                    text-xs
                    text-[#9999AA]
                  "
                >
                  Wrong
                </p>

                <p
                  className="
                    mt-1
                    font-bold
                    text-[#303044]
                  "
                >
                  {wrong}
                </p>

              </div>


              <div className="text-center">

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
                    mt-1
                    font-bold
                    text-[#303044]
                  "
                >
                  {accuracy}%
                </p>

              </div>


              <div className="text-center">

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
                    mt-1
                    font-bold
                    text-[#303044]
                  "
                >
                  {score}%
                </p>

              </div>

            </div>

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
              Reading Adventure Results
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

              <p
                className="
                  text-xs
                  text-[#9999AA]
                "
              >
                Wrong
              </p>

              <p
                className="
                  mt-2
                  text-2xl
                  font-bold
                  text-[#303044]
                "
              >
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
                  mt-1
                  font-bold
                  text-[#303044]
                "
              >
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
                {finalResult.time}s
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
                Questions
              </p>

              <p
                className="
                  mt-1
                  font-bold
                  text-[#303044]
                "
              >
                {finalResult.totalQuestions}
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


export default ReadingAdventure;