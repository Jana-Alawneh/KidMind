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
  BookOpen,
  Clock3,
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


type ReadingAdventureProps = {
  embedded?: boolean;

  paused?: boolean;

  difficulty?: string;

  onComplete?: (
    result: GameResult
  ) => void;
};


type VisualItem = {
  symbol: string;

  color: string;

  label?: string;
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
    answer:
      "Circle",
    options: [
      "Circle",
      "Square",
      "Triangle",
      "Diamond",
    ],
    visual: [
      {
        symbol: "●",
        color: "#EF6A8A",
        label: "Circle",
      },
      {
        symbol: "■",
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
    answer:
      "Triangle",
    options: [
      "Circle",
      "Triangle",
      "Square",
      "Diamond",
    ],
    visual: [
      {
        symbol: "●",
        color: "#F2A65A",
      },
      {
        symbol: "▲",
        color: "#63B3ED",
      },
      {
        symbol: "■",
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
    direction:
      "column",
    visual: [
      {
        symbol: "●",
        color: "#A59AFF",
      },
      {
        symbol: "■",
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
        symbol: "▲",
        color: "#F2C94C",
      },
      {
        symbol: "●",
        color: "#A59AFF",
      },
    ],
  },

  {
    type: "color",
    title: "Find the Purple Shape",
    description:
      "A green triangle, a purple diamond, and a blue circle are shown.",
    question:
      "Which shape is purple?",
    answer:
      "Diamond",
    options: [
      "Triangle",
      "Diamond",
      "Circle",
      "Square",
    ],
    visual: [
      {
        symbol: "▲",
        color: "#7BC67B",
      },
      {
        symbol: "◆",
        color: "#A59AFF",
      },
      {
        symbol: "●",
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
    answer:
      "2",
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    visual: [
      {
        symbol: "●",
        color: "#7C6CFF",
      },
      {
        symbol: "■",
        color: "#63B3ED",
      },
      {
        symbol: "●",
        color: "#EF6A8A",
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
    answer:
      "2",
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    visual: [
      {
        symbol: "■",
        color: "#7C6CFF",
      },
      {
        symbol: "●",
        color: "#F2C94C",
      },
      {
        symbol: "■",
        color: "#63B3ED",
      },
      {
        symbol: "▲",
        color: "#EF6A8A",
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
    answer:
      "Yellow",
    options: [
      "Yellow",
      "Purple",
      "Blue",
      "Green",
    ],
    visual: [
      {
        symbol: "●",
        color: "#F2C94C",
      },
      {
        symbol: "▲",
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
        symbol: "●",
        color: "#63B3ED",
      },
      {
        symbol: "▲",
        color: "#7C6CFF",
      },
      {
        symbol: "■",
        color: "#F2C94C",
      },
    ],
  },

  {
    type: "position",
    title: "The Shape in the Middle",
    description:
      "A circle is on the left, a triangle is in the middle, and a square is on the right.",
    question:
      "Which shape is in the middle?",
    answer:
      "Triangle",
    options: [
      "Circle",
      "Triangle",
      "Square",
      "Diamond",
    ],
    visual: [
      {
        symbol: "●",
        color: "#63B3ED",
      },
      {
        symbol: "▲",
        color: "#7C6CFF",
      },
      {
        symbol: "■",
        color: "#F2C94C",
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
    answer:
      "Blue",
    options: [
      "Green",
      "Blue",
      "Yellow",
      "Purple",
    ],
    visual: [
      {
        symbol: "▲",
        color: "#7BC67B",
      },
      {
        symbol: "◆",
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
    answer:
      "3",
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    visual: [
      {
        symbol: "●",
        color: "#7C6CFF",
      },
      {
        symbol: "▲",
        color: "#63B3ED",
      },
      {
        symbol: "◆",
        color: "#F2C94C",
      },
    ],
  },

  {
    type: "position",
    title: "The Shape on the Right",
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
        symbol: "■",
        color: "#63B3ED",
      },
      {
        symbol: "●",
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
    answer:
      "Diamond",
    options: [
      "Circle",
      "Diamond",
      "Triangle",
      "None",
    ],
    visual: [
      {
        symbol: "●",
        color: "#63B3ED",
      },
      {
        symbol: "◆",
        color: "#A59AFF",
      },
      {
        symbol: "▲",
        color: "#F2C94C",
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
    answer:
      "Triangle",
    options: [
      "Square",
      "Triangle",
      "Circle",
      "Diamond",
    ],
    visual: [
      {
        symbol: "■",
        color: "#A59AFF",
      },
      {
        symbol: "▲",
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
    direction:
      "column",
    visual: [
      {
        symbol: "▲",
        color: "#63B3ED",
      },
      {
        symbol: "■",
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
    answer:
      "2",
    options: [
      "1",
      "2",
      "3",
      "4",
    ],
    visual: [
      {
        symbol: "●",
        color: "#EF6A8A",
      },
      {
        symbol: "▲",
        color: "#63B3ED",
      },
      {
        symbol: "●",
        color: "#7C6CFF",
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
    answer:
      "Star",
    options: [
      "Circle",
      "Star",
      "Square",
      "Triangle",
    ],
    visual: [
      {
        symbol: "●",
        color: "#63B3ED",
      },
      {
        symbol: "★",
        color: "#F2C94C",
      },
      {
        symbol: "■",
        color: "#A59AFF",
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
    answer:
      "Pink",
    options: [
      "Pink",
      "Green",
      "Blue",
      "Purple",
    ],
    visual: [
      {
        symbol: "●",
        color: "#EF6A8A",
      },
      {
        symbol: "■",
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
        symbol: "◆",
        color: "#A59AFF",
      },
      {
        symbol: "●",
        color: "#F2C94C",
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
  ] = useState<string | null>(
    null
  );


  const [
    answerLocked,
    setAnswerLocked,
  ] = useState(false);


  const [
    finalResult,
    setFinalResult,
  ] = useState<GameResult | null>(
    null
  );


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
          number = correctRef.current,
        finalWrong:
          number = wrongRef.current
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


        const result:
          GameResult = {

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


        if (
          onComplete
        ) {

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

          <BookOpen
            size={34}
            color="#7B6EF6"
          />

        </View>


        <Text
          style={
            styles.title
          }
        >
          Reading Adventure
        </Text>


        <Text
          style={
            styles.description
          }
        >
          Read the short visual story, observe the shapes and colors, then choose the correct answer.
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
                    {item.questions} questions
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

    const resultData =
      finalResult.result_data as
        | Record<
            string,
            unknown
          >
        | null;


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
          Reading Adventure Results
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
              {correct}
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
              Wrong
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {wrong}
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
              Missed
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {Number(
                resultData
                  ?.missed_questions ||
                0
              )}
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
              Game Time
            </Text>

            <Text
              style={
                styles.metricValueSmall
              }
            >
              {finalResult.duration_seconds}s
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


  const question =
    questions[
      current
    ];


  if (
    !question
  ) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <Text
          style={
            styles.description
          }
        >
          Preparing assessment...
        </Text>

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
            READING COMPREHENSION
          </Text>


          <Text
            style={
              styles.title
            }
          >
            Reading Adventure
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
          styles.progressHeader
        }
      >

        <Text
          style={
            styles.progressText
          }
        >
          Question {current + 1} / {questions.length}
        </Text>


        <Text
          style={
            styles.progressText
          }
        >
          {Math.round(
            (
              (
                current + 1
              ) /
              questions.length
            ) * 100
          )}%
        </Text>

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
                `${
                  (
                    (
                      current + 1
                    ) /
                    questions.length
                  ) * 100
                }%`,
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
                  `${item.symbol}-${index}`
                }
                style={
                  styles.visualItem
                }
              >

                <Text
                  style={[
                    styles.visualSymbol,

                    {
                      color:
                        item.color,
                    },
                  ]}
                >
                  {item.symbol}
                </Text>


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


      <Text
        style={
          styles.questionLabel
        }
      >
        QUESTION
      </Text>


      <Text
        style={
          styles.questionText
        }
      >
        {question.question}
      </Text>


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
                key={
                  option
                }
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
            Correct
          </Text>

          <Text
            style={
              styles.metricValue
            }
          >
            {correct}
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
            Wrong
          </Text>

          <Text
            style={
              styles.metricValue
            }
          >
            {wrong}
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


    loadingContainer: {
      minHeight: 300,

      width: "100%",

      alignItems:
        "center",

      justifyContent:
        "center",

      padding: 20,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 24,
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

      fontSize: 24,

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


    progressHeader: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginTop: 20,
    },


    progressText: {
      color: "#64748B",

      fontSize: 12,

      fontWeight: "700",
    },


    progressTrack: {
      width: "100%",

      height: 7,

      borderRadius: 20,

      backgroundColor:
        "#F0EFF7",

      overflow:
        "hidden",

      marginTop: 8,
    },


    progressBar: {
      height: "100%",

      borderRadius: 20,

      backgroundColor:
        "#7B6EF6",
    },


    storyCard: {
      marginTop: 20,

      padding: 20,

      borderRadius: 22,

      backgroundColor:
        "#F7F8FC",

      borderWidth: 1,

      borderColor:
        "#ECECF4",

      alignItems:
        "center",
    },


    storyTitle: {
      color: "#7B6EF6",

      fontSize: 12,

      fontWeight: "800",

      textAlign:
        "center",
    },


    storyDescription: {
      color: "#77778A",

      fontSize: 13,

      lineHeight: 20,

      textAlign:
        "center",

      marginTop: 7,
    },


    visualContainer: {
      minHeight: 135,

      width: "100%",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 16,

      marginTop: 14,
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


    visualSymbol: {
      fontSize: 58,

      fontWeight: "900",

      lineHeight: 66,
    },


    visualLabel: {
      color: "#303044",

      fontSize: 12,

      fontWeight: "700",

      marginTop: 2,
    },


    questionLabel: {
      color: "#9999AA",

      fontSize: 11,

      fontWeight: "800",

      textAlign:
        "center",

      marginTop: 22,
    },


    questionText: {
      color: "#202033",

      fontSize: 20,

      lineHeight: 27,

      fontWeight: "800",

      textAlign:
        "center",

      marginTop: 7,
    },


    answersContainer: {
      gap: 10,

      marginTop: 18,
    },


    answerButton: {
      width: "100%",

      minHeight: 65,

      borderRadius: 17,

      borderWidth: 2,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal: 14,

      gap: 12,
    },


    answerDisabled: {
      opacity: 0.65,
    },


    answerLetter: {
      width: 35,

      height: 35,

      borderRadius: 11,

      backgroundColor:
        "#FFFFFF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    answerLetterText: {
      color: "#7B6EF6",

      fontWeight: "900",
    },


    answerText: {
      flex: 1,

      color: "#303044",

      fontSize: 14,

      fontWeight: "700",
    },


    metricsGrid: {
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


    metricValueSmall: {
      color: "#202033",

      fontSize: 15,

      fontWeight: "800",

      marginTop: 3,
    },

  });