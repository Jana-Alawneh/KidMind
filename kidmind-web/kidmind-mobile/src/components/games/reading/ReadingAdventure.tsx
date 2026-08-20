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
  Trophy,
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
    completed: boolean;
    totalQuestions: number;
    correct: number;
    wrong: number;
    attempts: number;
    missed: number;
    completionRate: number;
    time: number;
    recommendation: string;
  };


type ReadingAdventureProps = {
  embedded?: boolean;
  paused?: boolean;
  difficulty?: string;
  onComplete?: (
    result: GameResult
  ) => void;
};


type ShapeType =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "rectangle"
  | "star";


type VisualItem = {
  shape: ShapeType;
  color: string;
  label?: string;
  size?: number;
};


type Question = {
  type: string;
  title: string;
  description: string;
  question: string;
  answer: string;
  options: string[];
  visual: VisualItem[];
  direction?: "row" | "column";
};


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


const DATA: Question[] = [
  {
    type: "color",
    title: "The Red Circle",
    description:
      "A red circle is placed next to a blue square.",
    question:
      "Which shape is red?",
    answer: "Circle",
    options: [
      "Circle",
      "Square",
      "Triangle",
      "Diamond",
    ],
    visual: [
      {
        shape: "circle",
        color: "#EF6A8A",
        label: "Circle",
      },
      {
        shape: "square",
        color: "#63B3ED",
        label: "Square",
      },
    ],
  },

  {
    type: "shape",
    title: "The Blue Shape",
    description:
      "There are three shapes. Only one of them is blue.",
    question:
      "Which shape is blue?",
    answer: "Triangle",
    options: [
      "Circle",
      "Triangle",
      "Square",
      "Diamond",
    ],
    visual: [
      {
        shape: "circle",
        color: "#F2A65A",
      },
      {
        shape: "triangle",
        color: "#63B3ED",
      },
      {
        shape: "square",
        color: "#A59AFF",
      },
    ],
  },

  {
    type: "position",
    title: "Above and Below",
    description:
      "A purple circle is above a green square.",
    question:
      "What is below the circle?",
    answer:
      "Green square",
    options: [
      "Green square",
      "Purple circle",
      "Blue triangle",
      "Red diamond",
    ],
    direction: "column",
    visual: [
      {
        shape: "circle",
        color: "#A59AFF",
      },
      {
        shape: "square",
        color: "#7BC67B",
      },
    ],
  },

  {
    type: "position",
    title: "Left and Right",
    description:
      "A yellow triangle is on the left of a purple circle.",
    question:
      "What is on the left?",
    answer:
      "Yellow triangle",
    options: [
      "Yellow triangle",
      "Purple circle",
      "Blue square",
      "Red diamond",
    ],
    visual: [
      {
        shape: "triangle",
        color: "#F2C94C",
      },
      {
        shape: "circle",
        color: "#A59AFF",
      },
    ],
  },

  {
    type: "color",
    title:
      "Find the Purple Shape",
    description:
      "A green triangle, a purple diamond, and a blue circle are shown.",
    question:
      "Which shape is purple?",
    answer: "Diamond",
    options: [
      "Triangle",
      "Diamond",
      "Circle",
      "Square",
    ],
    visual: [
      {
        shape: "triangle",
        color: "#7BC67B",
      },
      {
        shape: "diamond",
        color: "#A59AFF",
      },
      {
        shape: "circle",
        color: "#63B3ED",
      },
    ],
  },

  {
    type: "count",
    title: "Count the Shapes",
    description:
      "Look carefully at the shapes.",
    question:
      "How many circles are there?",
    answer: "2",
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    visual: [
      {
        shape: "circle",
        color: "#7C6CFF",
        size: 60,
      },
      {
        shape: "square",
        color: "#63B3ED",
        size: 60,
      },
      {
        shape: "circle",
        color: "#EF6A8A",
        size: 60,
      },
    ],
  },

  {
    type: "count",
    title: "Count the Squares",
    description:
      "There are different shapes in the scene.",
    question:
      "How many squares are there?",
    answer: "2",
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    visual: [
      {
        shape: "square",
        color: "#7C6CFF",
        size: 60,
      },
      {
        shape: "circle",
        color: "#F2C94C",
        size: 60,
      },
      {
        shape: "square",
        color: "#63B3ED",
        size: 60,
      },
      {
        shape: "triangle",
        color: "#EF6A8A",
        size: 60,
      },
    ],
  },

  {
    type: "color",
    title: "The Yellow Shape",
    description:
      "The scene contains a yellow circle and a purple triangle.",
    question:
      "What color is the circle?",
    answer: "Yellow",
    options: [
      "Yellow",
      "Purple",
      "Blue",
      "Green",
    ],
    visual: [
      {
        shape: "circle",
        color: "#F2C94C",
      },
      {
        shape: "triangle",
        color: "#A59AFF",
      },
    ],
  },

  {
    type: "shape",
    title: "Find the Triangle",
    description:
      "Three different shapes are shown.",
    question:
      "Which one is the triangle?",
    answer:
      "Middle shape",
    options: [
      "Left shape",
      "Middle shape",
      "Right shape",
      "None",
    ],
    visual: [
      {
        shape: "circle",
        color: "#63B3ED",
      },
      {
        shape: "triangle",
        color: "#7C6CFF",
      },
      {
        shape: "square",
        color: "#F2C94C",
      },
    ],
  },

  {
    type: "position",
    title:
      "The Shape in the Middle",
    description:
      "A circle is on the left, a triangle is in the middle, and a square is on the right.",
    question:
      "Which shape is in the middle?",
    answer: "Triangle",
    options: [
      "Circle",
      "Triangle",
      "Square",
      "Diamond",
    ],
    visual: [
      {
        shape: "circle",
        color: "#63B3ED",
        size: 60,
      },
      {
        shape: "triangle",
        color: "#7C6CFF",
        size: 60,
      },
      {
        shape: "square",
        color: "#F2C94C",
        size: 60,
      },
    ],
  },

  {
    type: "color",
    title: "Green and Blue",
    description:
      "A green triangle is beside a blue diamond.",
    question:
      "What color is the diamond?",
    answer: "Blue",
    options: [
      "Green",
      "Blue",
      "Yellow",
      "Purple",
    ],
    visual: [
      {
        shape: "triangle",
        color: "#7BC67B",
      },
      {
        shape: "diamond",
        color: "#63B3ED",
      },
    ],
  },

  {
    type: "count",
    title: "Three Shapes",
    description:
      "Look at all the shapes carefully.",
    question:
      "How many shapes are shown?",
    answer: "3",
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    visual: [
      {
        shape: "circle",
        color: "#7C6CFF",
        size: 60,
      },
      {
        shape: "triangle",
        color: "#63B3ED",
        size: 60,
      },
      {
        shape: "diamond",
        color: "#F2C94C",
        size: 60,
      },
    ],
  },

  {
    type: "position",
    title:
      "The Shape on the Right",
    description:
      "A square is on the left and a red circle is on the right.",
    question:
      "Which shape is on the right?",
    answer:
      "Red circle",
    options: [
      "Blue square",
      "Red circle",
      "Purple triangle",
      "Green diamond",
    ],
    visual: [
      {
        shape: "square",
        color: "#63B3ED",
      },
      {
        shape: "circle",
        color: "#EF6A8A",
      },
    ],
  },

  {
    type: "shape",
    title: "The Diamond",
    description:
      "A circle, diamond, and triangle are shown.",
    question:
      "Which shape has four corners?",
    answer: "Diamond",
    options: [
      "Circle",
      "Diamond",
      "Triangle",
      "None",
    ],
    visual: [
      {
        shape: "circle",
        color: "#63B3ED",
        size: 65,
      },
      {
        shape: "diamond",
        color: "#A59AFF",
        size: 65,
      },
      {
        shape: "triangle",
        color: "#F2C94C",
        size: 65,
      },
    ],
  },

  {
    type: "color",
    title: "The Orange Shape",
    description:
      "A purple square and an orange triangle are shown.",
    question:
      "Which shape is orange?",
    answer: "Triangle",
    options: [
      "Square",
      "Triangle",
      "Circle",
      "Diamond",
    ],
    visual: [
      {
        shape: "square",
        color: "#A59AFF",
      },
      {
        shape: "triangle",
        color: "#F2A65A",
      },
    ],
  },

  {
    type: "position",
    title: "Above the Square",
    description:
      "A blue triangle is above a purple square.",
    question:
      "What is above the square?",
    answer:
      "Blue triangle",
    options: [
      "Blue triangle",
      "Purple square",
      "Red circle",
      "Green diamond",
    ],
    direction: "column",
    visual: [
      {
        shape: "triangle",
        color: "#63B3ED",
      },
      {
        shape: "square",
        color: "#A59AFF",
      },
    ],
  },

  {
    type: "count",
    title: "Circle Count",
    description:
      "Two circles and one triangle are shown.",
    question:
      "How many circles can you see?",
    answer: "2",
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    visual: [
      {
        shape: "circle",
        color: "#EF6A8A",
        size: 65,
      },
      {
        shape: "triangle",
        color: "#63B3ED",
        size: 65,
      },
      {
        shape: "circle",
        color: "#7C6CFF",
        size: 65,
      },
    ],
  },

  {
    type: "shape",
    title: "The Star",
    description:
      "There are three shapes in the scene.",
    question:
      "Which shape has many points?",
    answer: "Star",
    options: [
      "Circle",
      "Star",
      "Square",
      "Triangle",
    ],
    visual: [
      {
        shape: "circle",
        color: "#63B3ED",
        size: 65,
      },
      {
        shape: "star",
        color: "#F2C94C",
        size: 65,
      },
      {
        shape: "square",
        color: "#A59AFF",
        size: 65,
      },
    ],
  },

  {
    type: "color",
    title: "The Pink Circle",
    description:
      "A pink circle is beside a green square.",
    question:
      "What color is the circle?",
    answer: "Pink",
    options: [
      "Pink",
      "Green",
      "Blue",
      "Purple",
    ],
    visual: [
      {
        shape: "circle",
        color: "#EF6A8A",
      },
      {
        shape: "square",
        color: "#7BC67B",
      },
    ],
  },

  {
    type: "position",
    title: "Left Side",
    description:
      "A purple diamond is on the left of a yellow circle.",
    question:
      "What is on the left?",
    answer:
      "Purple diamond",
    options: [
      "Purple diamond",
      "Yellow circle",
      "Blue square",
      "Green triangle",
    ],
    visual: [
      {
        shape: "diamond",
        color: "#A59AFF",
      },
      {
        shape: "circle",
        color: "#F2C94C",
      },
    ],
  },

  {
    type: "count",
    title: "Four Shapes",
    description:
      "Four shapes are arranged in one row.",
    question:
      "How many shapes are there?",
    answer: "4",
    options: [
      "2",
      "3",
      "4",
      "5",
    ],
    visual: [
      {
        shape: "circle",
        color: "#EF6A8A",
        size: 55,
      },
      {
        shape: "square",
        color: "#63B3ED",
        size: 55,
      },
      {
        shape: "triangle",
        color: "#7C6CFF",
        size: 55,
      },
      {
        shape: "diamond",
        color: "#F2C94C",
        size: 55,
      },
    ],
  },

  {
    type: "shape",
    title: "The Rectangle",
    description:
      "A rectangle is shown beside a circle.",
    question:
      "Which shape is wider than it is tall?",
    answer: "Rectangle",
    options: [
      "Rectangle",
      "Circle",
      "Triangle",
      "Diamond",
    ],
    visual: [
      {
        shape: "rectangle",
        color: "#7C6CFF",
      },
      {
        shape: "circle",
        color: "#63B3ED",
      },
    ],
  },
];


const ANSWER_COLORS = [
  {
    background:
      "#F2EEFF",
    border:
      "#DDD7FF",
  },

  {
    background:
      "#EAF7FF",
    border:
      "#CDEBFF",
  },

  {
    background:
      "#FFF5E8",
    border:
      "#FFE1B8",
  },

  {
    background:
      "#EEF9EE",
    border:
      "#D5EFD5",
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


const ShapeGraphic = ({
  type,
  color,
  size = 80,
}: {
  type: ShapeType;
  color: string;
  size?: number;
}) => {

  return (

    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
    >

      {type ===
        "circle" && (

        <Circle
          cx="50"
          cy="50"
          r="35"
          fill={color}
        />

      )}


      {type ===
        "square" && (

        <Rect
          x="15"
          y="15"
          width="70"
          height="70"
          rx="8"
          fill={color}
        />

      )}


      {type ===
        "triangle" && (

        <Polygon
          points="50,10 90,85 10,85"
          fill={color}
        />

      )}


      {type ===
        "diamond" && (

        <Polygon
          points="50,8 92,50 50,92 8,50"
          fill={color}
        />

      )}


      {type ===
        "rectangle" && (

        <Rect
          x="10"
          y="25"
          width="80"
          height="50"
          rx="8"
          fill={color}
        />

      )}


      {type ===
        "star" && (

        <Polygon
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

      )}

    </Svg>

  );

};


export default function ReadingAdventure({
  embedded = true,
  paused = false,
  difficulty = "Level 1",
  onComplete,
}: ReadingAdventureProps) {

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
    questions,
    setQuestions,
  ] = useState<Question[]>(
    []
  );


  const [
    current,
    setCurrent,
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
    gameTime,
    setGameTime,
  ] = useState(0);


  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState<
    string | null
  >(null);


  const [
    answerLocked,
    setAnswerLocked,
  ] = useState(false);


  const [
    finalResult,
    setFinalResult,
  ] = useState<
    FinalResult | null
  >(null);


  const questionsRef =
    useRef<Question[]>(
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


  const transitionRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(
      null
    );


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

      if (
        transitionRef.current
      ) {

        clearTimeout(
          transitionRef.current
        );


        transitionRef.current =
          null;

      }


      const newQuestions =
        createQuestions();


      questionsRef.current =
        newQuestions;


      setQuestions(
        newQuestions
      );


      setCurrent(
        0
      );


      setCorrect(
        0
      );


      setWrong(
        0
      );


      setGameTime(
        0
      );


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
      (
        completedAll: boolean,
        finalCorrect:
          number =
            correctRef.current,
        finalWrong:
          number =
            wrongRef.current
      ) => {

        if (
          completionSentRef.current
        ) {
          return;
        }


        completionSentRef.current =
          true;


        if (
          transitionRef.current
        ) {

          clearTimeout(
            transitionRef.current
          );


          transitionRef.current =
            null;

        }


        const totalQuestions =
          questionsRef.current
            .length ||
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


        const status:
          GameStatus =
            completedAll
              ? "Completed"
              : "Failed";


        const recommendation =
          accuracy >= 85
            ? "Excellent reading comprehension and visual attention."
            : accuracy >= 70
            ? "Good comprehension skills. Continue monitoring progress."
            : "The child may benefit from additional reading comprehension and visual attention practice.";


        const result:
          FinalResult = {

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

          completed:
            completedAll,

          totalQuestions,

          correct:
            finalCorrect,

          wrong:
            finalWrong,

          attempts,

          missed,

          completionRate,

          time:
            finalGameTime,

          recommendation,

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

        };


        setCorrect(
          finalCorrect
        );


        setWrong(
          finalWrong
        );


        setFinalResult(
          result
        );


        setFinished(
          true
        );


        setAnswerLocked(
          true
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

    return () => {

      if (
        transitionRef.current
      ) {

        clearTimeout(
          transitionRef.current
        );

      }

    };

  }, []);


  const checkAnswer = (
    option: string
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


    const currentQuestion =
      questions[current];


    const isCorrect =
      option ===
      currentQuestion.answer;


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


    transitionRef.current =
      setTimeout(
        () => {

          if (
            lastQuestion
          ) {

            finishAssessment(
              true,
              nextCorrect,
              nextWrong
            );


            return;

          }


          setCurrent(
            (
              previous
            ) =>
              previous + 1
          );


          setSelectedAnswer(
            null
          );


          setAnswerLocked(
            false
          );


          transitionRef.current =
            null;

        },
        450
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


    setQuestions(
      []
    );


    setCurrent(
      0
    );


    setCorrect(
      0
    );


    setWrong(
      0
    );


    setGameTime(
      0
    );


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


  const attempts =
    correct +
    wrong;


  const totalQuestions =
    questions.length ||
    config.questions;


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
          Reading Adventure
        </Text>


        <Text
          style={
            styles.selectionDescription
          }
        >
          Read the short visual story, observe the shapes and colors, then choose the correct answer.
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
                    Read and understand visual stories, shapes and colors.
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
                        Questions
                      </Text>

                      <Text
                        style={
                          styles.smallValue
                        }
                      >
                        {item.questions}
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

          <Play
            size={19}
            color="#FFFFFF"
          />


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

            <Trophy
              size={30}
              color="#7C6CFF"
            />

          </View>


          <Text
            style={
              styles.resultCategory
            }
          >
            {finalResult.completed
              ? "ASSESSMENT COMPLETED"
              : "TIME COMPLETED"
            }
          </Text>


          <Text
            style={
              styles.resultTitle
            }
          >
            Reading Adventure Results
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
                Correct
              </Text>

              <Text
                style={
                  styles.resultMetricValue
                }
              >
                {finalResult.correct}
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
                Wrong
              </Text>

              <Text
                style={
                  styles.resultMetricValue
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
                Missed
              </Text>

              <Text
                style={
                  styles.secondaryValue
                }
              >
                {finalResult.missed}
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
                Questions
              </Text>

              <Text
                style={
                  styles.secondaryValue
                }
              >
                {finalResult.totalQuestions}
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
                restartGame
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


  const question =
    questions[
      current
    ];


  if (!question) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <Text
          style={
            styles.loadingText
          }
        >
          Preparing assessment...
        </Text>

      </View>

    );

  }


  const progress =
    questions.length > 0
      ? (
          (
            current + 1
          ) /
          questions.length
        ) * 100
      : 0;


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
            READING COMPREHENSION
          </Text>


          <Text
            style={
              styles.gameTitle
            }
          >
            Reading Adventure
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
            styles.questionHeader
          }
        >

          <View>

            <Text
              style={
                styles.questionHeaderLabel
              }
            >
              QUESTION
            </Text>


            <Text
              style={
                styles.questionCount
              }
            >
              {current + 1}
              {" / "}
              {questions.length}
            </Text>

          </View>


          <View
            style={
              styles.questionTime
            }
          >

            <Clock3
              size={16}
              color="#77778A"
            />


            <Text
              style={
                styles.questionTimeText
              }
            >
              {timeLeft}s
            </Text>

          </View>

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
                  `${progress}%`,
              },
            ]}
          />

        </View>


        <View
          style={
            styles.storyCard
          }
        >

          <Text
            style={
              styles.storyTitle
            }
          >
            {question.title}
          </Text>


          <Text
            style={
              styles.storyDescription
            }
          >
            {question.description}
          </Text>


          <View
            style={[
              styles.visualContainer,

              question.direction ===
                "column"
                ? styles.visualColumn
                : styles.visualRow,
            ]}
          >

            {question.visual.map(
              (
                item,
                index
              ) => (

                <View
                  key={
                    `${item.shape}-${index}`
                  }
                  style={
                    styles.visualItem
                  }
                >

                  <ShapeGraphic
                    type={
                      item.shape
                    }
                    color={
                      item.color
                    }
                    size={
                      item.size ??
                      80
                    }
                  />


                  {item.label && (

                    <Text
                      style={
                        styles.visualLabel
                      }
                    >
                      {item.label}
                    </Text>

                  )}

                </View>

              )
            )}

          </View>

        </View>


        <View
          style={
            styles.mainQuestionSection
          }
        >

          <Text
            style={
              styles.mainQuestionLabel
            }
          >
            QUESTION
          </Text>


          <Text
            style={
              styles.mainQuestionText
            }
          >
            {question.question}
          </Text>

        </View>


        <View
          style={
            styles.answersContainer
          }
        >

          {question.options.map(
            (
              option,
              index
            ) => {

              const colors =
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


              let backgroundColor =
                colors.background;


              let borderColor =
                colors.border;


              if (
                isSelected &&
                isCorrect
              ) {

                backgroundColor =
                  "#EEF9EE";


                borderColor =
                  "#7BC67B";

              }


              if (
                isSelected &&
                !isCorrect
              ) {

                backgroundColor =
                  "#FFF0F3";


                borderColor =
                  "#EF6A8A";

              }


              return (

                <Pressable
                  key={option}
                  onPress={() => {

                    checkAnswer(
                      option
                    );

                  }}
                  disabled={
                    answerLocked ||
                    paused ||
                    finished
                  }
                  style={[
                    styles.answerButton,

                    {
                      backgroundColor,
                      borderColor,
                    },

                    paused &&
                      styles.answerDisabled,
                  ]}
                >

                  <View
                    style={
                      styles.answerLetter
                    }
                  >

                    <Text
                      style={
                        styles.answerLetterText
                      }
                    >
                      {String.fromCharCode(
                        65 + index
                      )}
                    </Text>

                  </View>


                  <Text
                    style={
                      styles.answerText
                    }
                  >
                    {option}
                  </Text>

                </Pressable>

              );

            }
          )}

        </View>


        <View
          style={
            styles.metricsDivider
          }
        />


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
              Correct
            </Text>

            <Text
              style={
                styles.liveValue
              }
            >
              {correct}
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
              Wrong
            </Text>

            <Text
              style={
                styles.liveValue
              }
            >
              {wrong}
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
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },


    startButtonText: {
      color:
        "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },


    loadingContainer: {
      width: "100%",
      minHeight: 300,
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    loadingText: {
      color:
        "#77778A",
      fontSize: 14,
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


    questionHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },


    questionHeaderLabel: {
      color:
        "#9999AA",
      fontSize: 11,
      fontWeight: "800",
    },


    questionCount: {
      marginTop: 3,
      color:
        "#303044",
      fontSize: 14,
      fontWeight: "800",
    },


    questionTime: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
    },


    questionTimeText: {
      color:
        "#77778A",
      fontSize: 13,
    },


    progressTrack: {
      width: "100%",
      height: 8,
      marginTop: 18,
      borderRadius: 999,
      backgroundColor:
        "#F0EFF7",
      overflow:
        "hidden",
    },


    progressBar: {
      height: "100%",
      borderRadius: 999,
      backgroundColor:
        "#7C6CFF",
    },


    storyCard: {
      marginTop: 26,
      padding: 20,
      borderRadius: 28,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      backgroundColor:
        "#F7F8FC",
      alignItems:
        "center",
    },


    storyTitle: {
      color:
        "#7C6CFF",
      fontSize: 11,
      fontWeight: "800",
      textAlign:
        "center",
    },


    storyDescription: {
      marginTop: 7,
      color:
        "#77778A",
      fontSize: 13,
      lineHeight: 20,
      textAlign:
        "center",
    },


    visualContainer: {
      width: "100%",
      minHeight: 180,
      marginTop: 18,
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 12,
    },


    visualRow: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
    },


    visualColumn: {
      flexDirection:
        "column",
    },


    visualItem: {
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    visualLabel: {
      marginTop: 3,
      color:
        "#303044",
      fontSize: 12,
      fontWeight: "700",
    },


    mainQuestionSection: {
      marginTop: 26,
      alignItems:
        "center",
    },


    mainQuestionLabel: {
      color:
        "#9999AA",
      fontSize: 11,
      fontWeight: "800",
    },


    mainQuestionText: {
      marginTop: 7,
      color:
        "#202033",
      fontSize: 20,
      lineHeight: 27,
      fontWeight: "800",
      textAlign:
        "center",
    },


    answersContainer: {
      marginTop: 20,
      gap: 12,
    },


    answerButton: {
      width: "100%",
      minHeight: 72,
      paddingHorizontal: 16,
      borderRadius: 16,
      borderWidth: 2,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 14,
    },


    answerDisabled: {
      opacity: 0.65,
    },


    answerLetter: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    answerLetterText: {
      color:
        "#7C6CFF",
      fontSize: 13,
      fontWeight: "800",
    },


    answerText: {
      flex: 1,
      color:
        "#303044",
      fontSize: 14,
      fontWeight: "700",
    },


    metricsDivider: {
      width: "100%",
      height: 1,
      marginTop: 26,
      backgroundColor:
        "#EEEEF5",
    },


    liveMetrics: {
      marginTop: 20,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      justifyContent:
        "center",
      gap: 24,
    },


    liveMetric: {
      minWidth: 56,
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
