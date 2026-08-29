import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  ArrowLeft,
  Brain,
  Check,
  Circle,
  Eye,
  EyeOff,
  Gamepad2,
  Link2,
  Minus,
  Move,
  Plus,
  Save,
  Send,
  Settings,
  Square,
  Trash2,
  Type,
  X,
} from "lucide-react-native";

import {
  assignGameBuilderGame,
  createGameBuilderGame,
  getGameBuilderAssignmentOptions,
  getGameBuilderAssignments,
  getGameBuilderGame,
  removeGameBuilderAssignment,
  updateGameBuilderGame,
  type GameBuilderAssignment,
} from "@/api/gameBuilderApi";

import {
  takeAIGameDraft,
} from "@/state/aiGameDraftStore";


type Difficulty =
  | "Easy"
  | "Medium"
  | "Hard";

type BuilderObject = {
  id: string;
  type: string;
  elementId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text: string;
  shape: string | null;
  image: string | null;
  visible: boolean;
  rotation: number;
};

type BuilderRule = {
  id: string;
  trigger: string;
  triggerTargetId: string;
  action: string;
  targetIds: string[];
  value: number;
  wait: number;
  moveX: number;
  moveY: number;
  enabled: boolean;
};

type AssignmentType =
  | "child"
  | "session";


const difficultySettings: Record<
  Difficulty,
  {
    time: number;
    lives: number;
  }
> = {
  Easy: {
    time: 60,
    lives: 3,
  },
  Medium: {
    time: 45,
    lives: 3,
  },
  Hard: {
    time: 30,
    lives: 2,
  },
};


const makeId = (
  prefix: string
) => {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};


const createObject = (
  type:
    | "button"
    | "text"
    | "circle"
    | "square",
  index: number
): BuilderObject => {

  if (
    type === "button"
  ) {
    return {
      id: makeId(
        "object"
      ),
      type:
        "button",
      elementId:
        "button",
      name:
        `Button ${index + 1}`,
      x:
        50 +
        (index % 3) *
          110,
      y:
        100 +
        Math.floor(
          index / 3
        ) *
          100,
      width: 110,
      height: 54,
      color:
        "#7C6CFF",
      text:
        "Click Me",
      shape: null,
      image: null,
      visible: true,
      rotation: 0,
    };
  }

  if (
    type === "text"
  ) {
    return {
      id: makeId(
        "object"
      ),
      type:
        "text",
      elementId:
        "text",
      name:
        `Text ${index + 1}`,
      x:
        50 +
        (index % 3) *
          110,
      y:
        100 +
        Math.floor(
          index / 3
        ) *
          100,
      width: 150,
      height: 50,
      color:
        "#303044",
      text:
        "Your Text",
      shape: null,
      image: null,
      visible: true,
      rotation: 0,
    };
  }

  return {
    id: makeId(
      "object"
    ),
    type:
      "shape",
    elementId:
      type,
    name:
      type ===
      "circle"
        ? `Circle ${index + 1}`
        : `Square ${index + 1}`,
    x:
      50 +
      (index % 3) *
        110,
    y:
      100 +
      Math.floor(
        index / 3
      ) *
        100,
    width: 90,
    height: 90,
    color:
      type ===
      "circle"
        ? "#63B3ED"
        : "#48BB78",
    text: "",
    shape:
      type,
    image: null,
    visible: true,
    rotation: 0,
  };
};


const createRule = (
  objects:
    BuilderObject[]
): BuilderRule => {
  return {
    id: makeId(
      "rule"
    ),
    trigger:
      "object-clicked",
    triggerTargetId:
      objects[0]?.id ||
      "",
    action:
      "add-score",
    targetIds: [],
    value: 10,
    wait: 1,
    moveX: 30,
    moveY: 0,
    enabled: true,
  };
};


const getErrorMessage =
  (
    error: any,
    fallback: string
  ) => {
    return (
      error?.message ||
      fallback
    );
  };


const ChoiceButton = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={
        onPress
      }
      style={[
        styles.choiceButton,
        selected &&
          styles.choiceButtonSelected,
      ]}
    >
      <Text
        style={[
          styles.choiceText,
          selected &&
            styles.choiceTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};


export default function GameBuilder() {

  const params =
    useLocalSearchParams<{
      gameId?: string;
      openAssignment?: string;
      fromAI?: string;
    }>();

  const initialGameId =
    Number(
      params.gameId
    );

  const [
    currentGameId,
    setCurrentGameId,
  ] =
    useState<
      number | null
    >(
      Number.isInteger(
        initialGameId
      ) &&
        initialGameId >
          0
        ? initialGameId
        : null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      Boolean(
        currentGameId
      )
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    savedMessage,
    setSavedMessage,
  ] =
    useState("");

  const [
    gameName,
    setGameName,
  ] =
    useState(
      "My Therapeutic Game"
    );

  const [
    gameDescription,
    setGameDescription,
  ] =
    useState(
      "Custom cognitive assessment game."
    );

  const [
    gameDomain,
    setGameDomain,
  ] =
    useState(
      "Custom Cognitive Assessment"
    );

  const [
    isAiGenerated,
    setIsAiGenerated,
  ] =
    useState(false);

  const [
    aiChildId,
    setAiChildId,
  ] =
    useState<
      number | null
    >(null);

  const [
    aiChildName,
    setAiChildName,
  ] =
    useState("");

  const [
    aiTargetSkill,
    setAiTargetSkill,
  ] =
    useState("");

  const [
    aiAnalysis,
    setAiAnalysis,
  ] =
    useState("");

  const [
    difficulty,
    setDifficulty,
  ] =
    useState<Difficulty>(
      "Easy"
    );

  const [
    time,
    setTime,
  ] =
    useState(
      60
    );

  const [
    lives,
    setLives,
  ] =
    useState(
      3
    );

  const [
    scoreEnabled,
    setScoreEnabled,
  ] =
    useState(
      true
    );

  const [
    objects,
    setObjects,
  ] =
    useState<
      BuilderObject[]
    >([]);

  const [
    rules,
    setRules,
  ] =
    useState<
      BuilderRule[]
    >([]);

  const [
    selectedObjectId,
    setSelectedObjectId,
  ] =
    useState<
      string | null
    >(null);

  const [
    selectedRuleId,
    setSelectedRuleId,
  ] =
    useState<
      string | null
    >(null);

  const [
    assignmentVisible,
    setAssignmentVisible,
  ] =
    useState(false);

  const [
    assignmentLoading,
    setAssignmentLoading,
  ] =
    useState(false);

  const [
    assignmentSaving,
    setAssignmentSaving,
  ] =
    useState(false);

  const [
    assignmentError,
    setAssignmentError,
  ] =
    useState("");

  const [
    assignmentMessage,
    setAssignmentMessage,
  ] =
    useState("");

  const [
    assignmentType,
    setAssignmentType,
  ] =
    useState<
      AssignmentType
    >(
      "child"
    );

  const [
    assignmentChildId,
    setAssignmentChildId,
  ] =
    useState<
      number | null
    >(null);

  const [
    assignmentSessionId,
    setAssignmentSessionId,
  ] =
    useState<
      number | null
    >(null);

  const [
    assignmentChildren,
    setAssignmentChildren,
  ] =
    useState<
      any[]
    >([]);

  const [
    assignmentSessions,
    setAssignmentSessions,
  ] =
    useState<
      any[]
    >([]);

  const [
    assignments,
    setAssignments,
  ] =
    useState<
      GameBuilderAssignment[]
    >([]);


  const selectedObject =
    useMemo(
      () =>
        objects.find(
          object =>
            object.id ===
            selectedObjectId
        ) ||
        null,
      [
        objects,
        selectedObjectId,
      ]
    );


  const selectedRule =
    useMemo(
      () =>
        rules.find(
          rule =>
            rule.id ===
            selectedRuleId
        ) ||
        null,
      [
        rules,
        selectedRuleId,
      ]
    );


  const filteredSessions =
    useMemo(
      () => {
        if (
          !assignmentChildId
        ) {
          return [];
        }

        return assignmentSessions.filter(
          session =>
            Number(
              session.child_id
            ) ===
            Number(
              assignmentChildId
            )
        );
      },
      [
        assignmentChildId,
        assignmentSessions,
      ]
    );


  const loadGame =
    useCallback(
      async () => {

        if (
          !currentGameId
        ) {
          setLoading(
            false
          );
          return;
        }

        try {

          setLoading(
            true
          );

          setError("");

          const game =
            await getGameBuilderGame(
              currentGameId
            ) as any;

          setGameName(
            game.title ||
            "My Therapeutic Game"
          );

          setGameDescription(
            game.description ||
            "Custom cognitive assessment game."
          );

          setGameDomain(
            game.domain ||
            "Custom Cognitive Assessment"
          );

          setIsAiGenerated(
            Boolean(
              game.is_ai_generated
            )
          );

          setAiChildId(
            game.ai_child_id ===
              null ||
            game.ai_child_id ===
              undefined
              ? null
              : Number(
                  game.ai_child_id
                )
          );

          setAiChildName(
            game.ai_child_name ||
            ""
          );

          setAiTargetSkill(
            game.ai_target_skill ||
            ""
          );

          setAiAnalysis(
            game.ai_analysis ||
            ""
          );

          const loadedDifficulty =
            (
              [
                "Easy",
                "Medium",
                "Hard",
              ].includes(
                game.difficulty
              )
                ? game.difficulty
                : "Easy"
            ) as Difficulty;

          setDifficulty(
            loadedDifficulty
          );

          setTime(
            Number(
              game.time_seconds
            ) ||
            difficultySettings[
              loadedDifficulty
            ].time
          );

          setLives(
            Number(
              game.lives
            ) ||
            difficultySettings[
              loadedDifficulty
            ].lives
          );

          setScoreEnabled(
            game.score_enabled !==
              false
          );

          setObjects(
            Array.isArray(
              game.objects
            )
              ? game.objects
              : []
          );

          setRules(
            Array.isArray(
              game.rules
            )
              ? game.rules
              : []
          );

        } catch (
          loadError
        ) {

          console.error(
            "Load game error:",
            loadError
          );

          setError(
            getErrorMessage(
              loadError,
              "Could not load this game."
            )
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      [
        currentGameId,
      ]
    );


  useEffect(
    () => {
      loadGame();
    },
    [
      loadGame,
    ]
  );


  useEffect(
    () => {
      if (
        params.fromAI !==
          "1" ||
        currentGameId
      ) {
        return;
      }

      const draft =
        takeAIGameDraft();

      if (!draft) {
        return;
      }

      setGameName(
        draft.gameName ||
        "AI Personalized Game"
      );

      setGameDescription(
        draft.gameDescription ||
        "AI-generated personalized cognitive game."
      );

      setGameDomain(
        draft.domain ||
        "Custom Cognitive Assessment"
      );

      setDifficulty(
        draft.difficulty
      );

      setTime(
        Number(
          draft.timeLimit
        ) ||
        difficultySettings[
          draft.difficulty
        ].time
      );

      setLives(
        Number(
          draft.lives
        ) ||
        difficultySettings[
          draft.difficulty
        ].lives
      );

      setScoreEnabled(
        draft.scoreEnabled !==
          false
      );

      setObjects(
        Array.isArray(
          draft.objects
        )
          ? draft.objects as BuilderObject[]
          : []
      );

      setRules(
        Array.isArray(
          draft.rules
        )
          ? draft.rules as BuilderRule[]
          : []
      );

      setIsAiGenerated(
        true
      );

      setAiChildId(
        draft.childId
      );

      setAiChildName(
        draft.childName ||
        ""
      );

      setAiTargetSkill(
        draft.targetSkill ||
        ""
      );

      setAiAnalysis(
        [
          draft.analysis,
          draft.therapyPlan
            ? `Strengthening plan:\n${draft.therapyPlan}`
            : "",
        ]
          .filter(
            Boolean
          )
          .join(
            "\n\n"
          )
      );

      setSavedMessage(
        "AI-generated draft loaded. Review and edit it before saving."
      );

      setError(
        ""
      );
    },
    [
      params.fromAI,
      currentGameId,
    ]
  );


  useEffect(
    () => {

      if (
        params.openAssignment ===
          "1" &&
        currentGameId &&
        !loading
      ) {
        openAssignmentModal();
      }

    },
    [
      params.openAssignment,
      currentGameId,
      loading,
    ]
  );


  const handleDifficultyChange =
    (
      value:
        Difficulty
    ) => {

      setDifficulty(
        value
      );

      setTime(
        difficultySettings[
          value
        ].time
      );

      setLives(
        difficultySettings[
          value
        ].lives
      );

    };


  const addObject =
    (
      type:
        | "button"
        | "text"
        | "circle"
        | "square"
    ) => {

      const object =
        createObject(
          type,
          objects.length
        );

      setObjects(
        previous => [
          ...previous,
          object,
        ]
      );

      setSelectedObjectId(
        object.id
      );

      setSelectedRuleId(
        null
      );

    };


  const updateObject =
    (
      id: string,
      field:
        keyof BuilderObject,
      value: any
    ) => {

      setObjects(
        previous =>
          previous.map(
            object =>
              object.id ===
              id
                ? {
                    ...object,
                    [field]:
                      value,
                  }
                : object
          )
      );

    };


  const deleteObject =
    (
      id: string
    ) => {

      setObjects(
        previous =>
          previous.filter(
            object =>
              object.id !==
              id
          )
      );

      setRules(
        previous =>
          previous.map(
            rule => ({
              ...rule,
              triggerTargetId:
                rule.triggerTargetId ===
                id
                  ? ""
                  : rule.triggerTargetId,
              targetIds:
                rule.targetIds.filter(
                  targetId =>
                    targetId !==
                    id
                ),
            })
          )
      );

      setSelectedObjectId(
        null
      );

    };


  const duplicateObject =
    (
      object:
        BuilderObject
    ) => {

      const duplicate = {
        ...object,
        id:
          makeId(
            "object"
          ),
        name:
          `${object.name} Copy`,
        x:
          Number(
            object.x
          ) + 20,
        y:
          Number(
            object.y
          ) + 20,
      };

      setObjects(
        previous => [
          ...previous,
          duplicate,
        ]
      );

      setSelectedObjectId(
        duplicate.id
      );

    };


  const addRule =
    () => {

      const rule =
        createRule(
          objects
        );

      setRules(
        previous => [
          ...previous,
          rule,
        ]
      );

      setSelectedRuleId(
        rule.id
      );

      setSelectedObjectId(
        null
      );

    };


  const updateRule =
    (
      id: string,
      field:
        keyof BuilderRule,
      value: any
    ) => {

      setRules(
        previous =>
          previous.map(
            rule =>
              rule.id ===
              id
                ? {
                    ...rule,
                    [field]:
                      value,
                  }
                : rule
          )
      );

    };


  const deleteRule =
    (
      id: string
    ) => {

      setRules(
        previous =>
          previous.filter(
            rule =>
              rule.id !==
              id
          )
      );

      setSelectedRuleId(
        null
      );

    };


  const buildPayload =
    () => ({
      title:
        gameName.trim(),
      description:
        gameDescription.trim(),
      domain:
        gameDomain.trim() ||
        "Custom Cognitive Assessment",
      difficulty,
      time_seconds:
        Number(
          time
        ),
      lives:
        Number(
          lives
        ),
      score_enabled:
        Boolean(
          scoreEnabled
        ),
      color:
        "#F1EDFF",
      icon_name:
        "Puzzle",
      objects:
        objects.map(
          object => ({
            ...object,
          })
        ),
      rules:
        rules.map(
          rule => ({
            ...rule,
            targetIds:
              Array.isArray(
                rule.targetIds
              )
                ? [
                    ...rule.targetIds,
                  ]
                : [],
          })
        ),
      is_ai_generated:
        Boolean(
          isAiGenerated
        ),
      ai_child_id:
        isAiGenerated
          ? aiChildId
          : null,
      ai_target_skill:
        isAiGenerated
          ? aiTargetSkill ||
            null
          : null,
      ai_analysis:
        isAiGenerated
          ? aiAnalysis ||
            null
          : null,
      status:
        "draft",
    });


  const persistGame =
    async (
      goBack:
        boolean
    ) => {

      if (
        !gameName.trim()
      ) {
        setError(
          "Game title is required."
        );
        return null;
      }

      if (
        !Number.isFinite(
          Number(
            time
          )
        ) ||
        Number(
          time
        ) <= 0
      ) {
        setError(
          "Game time must be greater than 0."
        );
        return null;
      }

      try {

        setSaving(
          true
        );

        setError("");

        setSavedMessage(
          ""
        );

        const payload =
          buildPayload();

        const result =
          currentGameId
            ? await updateGameBuilderGame(
                currentGameId,
                payload as any
              )
            : await createGameBuilderGame(
                payload as any
              );

        const savedGame =
          (result as any)
            ?.game ||
          result;

        const savedId =
          Number(
            (savedGame as any)
              ?.id ||
            currentGameId
          );

        if (
          !Number.isInteger(
            savedId
          ) ||
          savedId <=
            0
        ) {
          throw new Error(
            "Invalid game ID returned by server."
          );
        }

        setCurrentGameId(
          savedId
        );

        setSavedMessage(
          "Game saved successfully."
        );

        if (
          goBack
        ) {
          setTimeout(
            () => {
              router.replace(
                "/games" as any
              );
            },
            500
          );
        }

        return savedId;

      } catch (
        saveError
      ) {

        console.error(
          "Save game error:",
          saveError
        );

        setError(
          getErrorMessage(
            saveError,
            "Could not save the game."
          )
        );

        return null;

      } finally {

        setSaving(
          false
        );

      }

    };


  const loadAssignmentData =
    async (
      gameId:
        number
    ) => {

      try {

        setAssignmentLoading(
          true
        );

        setAssignmentError(
          ""
        );

        const [
          options,
          currentAssignments,
        ] =
          await Promise.all([
            getGameBuilderAssignmentOptions(
              gameId
            ),
            getGameBuilderAssignments(
              gameId
            ),
          ]);

        const children =
          Array.isArray(
            options?.children
          )
            ? options.children
            : [];

        const sessions =
          Array.isArray(
            options?.sessions
          )
            ? options.sessions
            : [];

        setAssignmentChildren(
          children
        );

        setAssignmentSessions(
          sessions
        );

        setAssignments(
          Array.isArray(
            currentAssignments
          )
            ? currentAssignments
            : []
        );

        const firstChild =
          children[0];

        setAssignmentChildId(
          firstChild
            ? Number(
                firstChild.id
              )
            : null
        );

        setAssignmentSessionId(
          null
        );

      } catch (
        loadError
      ) {

        console.error(
          "Assignment options error:",
          loadError
        );

        setAssignmentError(
          getErrorMessage(
            loadError,
            "Could not load assignment options."
          )
        );

      } finally {

        setAssignmentLoading(
          false
        );

      }

    };


  const openAssignmentModal =
    async () => {

      if (
        assignmentVisible
      ) {
        return;
      }

      const gameId =
        currentGameId ||
        await persistGame(
          false
        );

      if (
        !gameId
      ) {
        return;
      }

      setAssignmentVisible(
        true
      );

      setAssignmentMessage(
        ""
      );

      setAssignmentError(
        ""
      );

      await loadAssignmentData(
        gameId
      );

    };


  const handleAssign =
    async () => {

      if (
        !currentGameId
      ) {
        return;
      }

      if (
        !assignmentChildId
      ) {
        setAssignmentError(
          "Please select a child."
        );
        return;
      }

      if (
        assignmentType ===
          "session" &&
        !assignmentSessionId
      ) {
        setAssignmentError(
          "Please select a session."
        );
        return;
      }

      try {

        setAssignmentSaving(
          true
        );

        setAssignmentError(
          ""
        );

        setAssignmentMessage(
          ""
        );

        const result =
          await assignGameBuilderGame(
            currentGameId,
            {
              assignment_type:
                assignmentType,
              child_id:
                assignmentChildId,
              session_id:
                assignmentType ===
                "session"
                  ? assignmentSessionId
                  : null,
            }
          );

        setAssignmentMessage(
          (result as any)
            ?.message ||
          "Game assigned successfully."
        );

        const updated =
          await getGameBuilderAssignments(
            currentGameId
          );

        setAssignments(
          updated
        );

      } catch (
        assignError
      ) {

        console.error(
          "Assign game error:",
          assignError
        );

        setAssignmentError(
          getErrorMessage(
            assignError,
            "Could not assign game."
          )
        );

      } finally {

        setAssignmentSaving(
          false
        );

      }

    };


  const handleRemoveAssignment =
    (
      assignment:
        GameBuilderAssignment
    ) => {

      if (
        !currentGameId
      ) {
        return;
      }

      Alert.alert(
        "Remove Assignment",
        "Remove this game assignment?",
        [
          {
            text:
              "Cancel",
            style:
              "cancel",
          },
          {
            text:
              "Remove",
            style:
              "destructive",
            onPress:
              async () => {

                try {

                  setAssignmentSaving(
                    true
                  );

                  await removeGameBuilderAssignment(
                    currentGameId,
                    assignment.id
                  );

                  setAssignments(
                    previous =>
                      previous.filter(
                        item =>
                          item.id !==
                          assignment.id
                      )
                  );

                  setAssignmentMessage(
                    "Assignment removed."
                  );

                } catch (
                  removeError
                ) {

                  setAssignmentError(
                    getErrorMessage(
                      removeError,
                      "Could not remove assignment."
                    )
                  );

                } finally {

                  setAssignmentSaving(
                    false
                  );

                }

              },
          },
        ]
      );

    };


  if (
    loading
  ) {
    return (
      <View
        style={
          styles.center
        }
      >
        <ActivityIndicator
          size="large"
          color="#7C6CFF"
        />
        <Text
          style={
            styles.loadingText
          }
        >
          Loading game...
        </Text>
      </View>
    );
  }


  return (
    <View
      style={
        styles.page
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >

        <View
          style={
            styles.topBar
          }
        >

          <Pressable
            onPress={() =>
              router.back()
            }
            style={
              styles.iconButton
            }
          >
            <ArrowLeft
              size={21}
              color="#595A6C"
            />
          </Pressable>

          <View
            style={
              styles.topTitleWrap
            }
          >
            <Text
              style={
                styles.topTitle
              }
            >
              Game Builder
            </Text>

            <Text
              style={
                styles.topSubtitle
              }
            >
              Build a therapeutic game
            </Text>
          </View>

          <Pressable
            onPress={() =>
              persistGame(
                false
              )
            }
            disabled={
              saving
            }
            style={
              styles.saveIconButton
            }
          >
            {
              saving
                ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                )
                : (
                  <Save
                    size={19}
                    color="#FFFFFF"
                  />
                )
            }
          </Pressable>

        </View>


        {isAiGenerated ? (
          <View
            style={
              styles.aiDraftBanner
            }
          >
            <View
              style={
                styles.aiDraftIcon
              }
            >
              <Brain
                size={19}
                color="#6B5CDD"
              />
            </View>

            <View
              style={
                styles.aiDraftText
              }
            >
              <Text
                style={
                  styles.aiDraftTitle
                }
              >
                AI-generated personalized draft
              </Text>

              <Text
                style={
                  styles.aiDraftSubtitle
                }
              >
                {
                  aiChildName
                    ? `Child: ${aiChildName}`
                    : "Personalized child game"
                }
                {
                  aiTargetSkill
                    ? ` • Target: ${aiTargetSkill}`
                    : ""
                }
              </Text>

              <Text
                style={
                  styles.aiDraftHint
                }
              >
                Review objects, rules and settings before saving or assigning.
              </Text>
            </View>
          </View>
        ) : null}


        {error ? (
          <View
            style={
              styles.errorBox
            }
          >
            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>
          </View>
        ) : null}


        {savedMessage ? (
          <View
            style={
              styles.successBox
            }
          >
            <Check
              size={17}
              color="#2E9C5B"
            />
            <Text
              style={
                styles.successText
              }
            >
              {
                savedMessage
              }
            </Text>
          </View>
        ) : null}


        <View
          style={
            styles.card
          }
        >

          <View
            style={
              styles.sectionHeader
            }
          >
            <Gamepad2
              size={20}
              color="#7C6CFF"
            />
            <Text
              style={
                styles.sectionTitle
              }
            >
              Game Details
            </Text>
          </View>

          <Text
            style={
              styles.label
            }
          >
            Game Name
          </Text>

          <TextInput
            value={
              gameName
            }
            onChangeText={
              setGameName
            }
            placeholder="Game name"
            style={
              styles.input
            }
          />

          <Text
            style={
              styles.label
            }
          >
            Description
          </Text>

          <TextInput
            value={
              gameDescription
            }
            onChangeText={
              setGameDescription
            }
            placeholder="Game description"
            multiline
            style={[
              styles.input,
              styles.multilineInput,
            ]}
          />

        </View>


        <View
          style={
            styles.card
          }
        >

          <View
            style={
              styles.sectionHeader
            }
          >
            <Settings
              size={20}
              color="#7C6CFF"
            />
            <Text
              style={
                styles.sectionTitle
              }
            >
              Game Settings
            </Text>
          </View>


          <Text
            style={
              styles.label
            }
          >
            Difficulty
          </Text>

          <View
            style={
              styles.choiceRow
            }
          >
            {(
              [
                "Easy",
                "Medium",
                "Hard",
              ] as Difficulty[]
            ).map(
              value => (
                <ChoiceButton
                  key={
                    value
                  }
                  label={
                    value
                  }
                  selected={
                    difficulty ===
                    value
                  }
                  onPress={() =>
                    handleDifficultyChange(
                      value
                    )
                  }
                />
              )
            )}
          </View>


          <View
            style={
              styles.settingGrid
            }
          >

            <View
              style={
                styles.settingField
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Time (seconds)
              </Text>

              <TextInput
                value={
                  String(
                    time
                  )
                }
                onChangeText={
                  value =>
                    setTime(
                      Number(
                        value.replace(
                          /[^0-9]/g,
                          ""
                        )
                      ) ||
                      0
                    )
                }
                keyboardType="number-pad"
                style={
                  styles.input
                }
              />
            </View>


            <View
              style={
                styles.settingField
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Lives
              </Text>

              <TextInput
                value={
                  String(
                    lives
                  )
                }
                onChangeText={
                  value =>
                    setLives(
                      Number(
                        value.replace(
                          /[^0-9]/g,
                          ""
                        )
                      ) ||
                      0
                    )
                }
                keyboardType="number-pad"
                style={
                  styles.input
                }
              />
            </View>

          </View>


          <View
            style={
              styles.switchRow
            }
          >
            <View>
              <Text
                style={
                  styles.switchTitle
                }
              >
                Score Enabled
              </Text>
              <Text
                style={
                  styles.switchSubtitle
                }
              >
                Track score during game
              </Text>
            </View>

            <Switch
              value={
                scoreEnabled
              }
              onValueChange={
                setScoreEnabled
              }
              trackColor={{
                false:
                  "#DADAE4",
                true:
                  "#BEB6FF",
              }}
              thumbColor={
                scoreEnabled
                  ? "#7C6CFF"
                  : "#FFFFFF"
              }
            />
          </View>

        </View>


        <View
          style={
            styles.card
          }
        >

          <View
            style={
              styles.sectionHeaderBetween
            }
          >

            <View
              style={
                styles.sectionHeader
              }
            >
              <Square
                size={20}
                color="#7C6CFF"
              />
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Objects
              </Text>
            </View>

            <Text
              style={
                styles.countText
              }
            >
              {objects.length}
            </Text>

          </View>


          <View
            style={
              styles.objectTools
            }
          >

            <Pressable
              onPress={() =>
                addObject(
                  "button"
                )
              }
              style={
                styles.toolButton
              }
            >
              <Plus
                size={16}
                color="#7C6CFF"
              />
              <Text
                style={
                  styles.toolText
                }
              >
                Button
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                addObject(
                  "text"
                )
              }
              style={
                styles.toolButton
              }
            >
              <Type
                size={16}
                color="#7C6CFF"
              />
              <Text
                style={
                  styles.toolText
                }
              >
                Text
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                addObject(
                  "circle"
                )
              }
              style={
                styles.toolButton
              }
            >
              <Circle
                size={16}
                color="#7C6CFF"
              />
              <Text
                style={
                  styles.toolText
                }
              >
                Circle
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                addObject(
                  "square"
                )
              }
              style={
                styles.toolButton
              }
            >
              <Square
                size={16}
                color="#7C6CFF"
              />
              <Text
                style={
                  styles.toolText
                }
              >
                Square
              </Text>
            </Pressable>

          </View>


          {objects.length ===
          0 ? (
            <View
              style={
                styles.emptySmall
              }
            >
              <Text
                style={
                  styles.emptySmallText
                }
              >
                Add an object to start building the game.
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.itemList
              }
            >
              {objects.map(
                object => (
                  <Pressable
                    key={
                      object.id
                    }
                    onPress={() => {
                      setSelectedObjectId(
                        object.id
                      );
                      setSelectedRuleId(
                        null
                      );
                    }}
                    style={[
                      styles.itemCard,
                      selectedObjectId ===
                        object.id &&
                        styles.itemCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.objectColor,
                        {
                          backgroundColor:
                            object.color ||
                            "#7C6CFF",
                        },
                      ]}
                    />

                    <View
                      style={
                        styles.itemCopy
                      }
                    >
                      <Text
                        style={
                          styles.itemTitle
                        }
                      >
                        {
                          object.name
                        }
                      </Text>
                      <Text
                        style={
                          styles.itemSubtitle
                        }
                      >
                        {
                          object.elementId
                        }
                      </Text>
                    </View>

                    {
                      object.visible
                        ? (
                          <Eye
                            size={17}
                            color="#9294A6"
                          />
                        )
                        : (
                          <EyeOff
                            size={17}
                            color="#9294A6"
                          />
                        )
                    }
                  </Pressable>
                )
              )}
            </View>
          )}


          {selectedObject ? (
            <View
              style={
                styles.editorBox
              }
            >

              <Text
                style={
                  styles.editorTitle
                }
              >
                Edit Object
              </Text>

              <Text
                style={
                  styles.label
                }
              >
                Name
              </Text>

              <TextInput
                value={
                  selectedObject.name
                }
                onChangeText={
                  value =>
                    updateObject(
                      selectedObject.id,
                      "name",
                      value
                    )
                }
                style={
                  styles.input
                }
              />


              {
                selectedObject.type ===
                  "button" ||
                selectedObject.type ===
                  "text"
                  ? (
                    <>
                      <Text
                        style={
                          styles.label
                        }
                      >
                        Text
                      </Text>

                      <TextInput
                        value={
                          selectedObject.text
                        }
                        onChangeText={
                          value =>
                            updateObject(
                              selectedObject.id,
                              "text",
                              value
                            )
                        }
                        style={
                          styles.input
                        }
                      />
                    </>
                  )
                  : null
              }


              <View
                style={
                  styles.switchRow
                }
              >
                <Text
                  style={
                    styles.switchTitle
                  }
                >
                  Visible
                </Text>

                <Switch
                  value={
                    selectedObject.visible !==
                    false
                  }
                  onValueChange={
                    value =>
                      updateObject(
                        selectedObject.id,
                        "visible",
                        value
                      )
                  }
                />
              </View>


              <View
                style={
                  styles.editorActions
                }
              >

                <Pressable
                  onPress={() =>
                    duplicateObject(
                      selectedObject
                    )
                  }
                  style={
                    styles.secondaryButton
                  }
                >
                  <Plus
                    size={16}
                    color="#7C6CFF"
                  />
                  <Text
                    style={
                      styles.secondaryButtonText
                    }
                  >
                    Duplicate
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    deleteObject(
                      selectedObject.id
                    )
                  }
                  style={
                    styles.dangerButton
                  }
                >
                  <Trash2
                    size={16}
                    color="#D95757"
                  />
                  <Text
                    style={
                      styles.dangerButtonText
                    }
                  >
                    Delete
                  </Text>
                </Pressable>

              </View>

            </View>
          ) : null}

        </View>


        <View
          style={
            styles.card
          }
        >

          <View
            style={
              styles.sectionHeaderBetween
            }
          >

            <View
              style={
                styles.sectionHeader
              }
            >
              <Brain
                size={20}
                color="#7C6CFF"
              />
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Logic Rules
              </Text>
            </View>

            <Pressable
              onPress={
                addRule
              }
              style={
                styles.smallPrimary
              }
            >
              <Plus
                size={16}
                color="#FFFFFF"
              />
              <Text
                style={
                  styles.smallPrimaryText
                }
              >
                Rule
              </Text>
            </Pressable>

          </View>


          {rules.length ===
          0 ? (
            <View
              style={
                styles.emptySmall
              }
            >
              <Text
                style={
                  styles.emptySmallText
                }
              >
                Add rules to define what happens when the child interacts with objects.
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.itemList
              }
            >
              {rules.map(
                (
                  rule,
                  index
                ) => (
                  <Pressable
                    key={
                      rule.id
                    }
                    onPress={() => {
                      setSelectedRuleId(
                        rule.id
                      );
                      setSelectedObjectId(
                        null
                      );
                    }}
                    style={[
                      styles.ruleCard,
                      selectedRuleId ===
                        rule.id &&
                        styles.itemCardSelected,
                    ]}
                  >

                    <View
                      style={
                        styles.ruleNumber
                      }
                    >
                      <Text
                        style={
                          styles.ruleNumberText
                        }
                      >
                        {
                          index +
                          1
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.itemCopy
                      }
                    >
                      <Text
                        style={
                          styles.itemTitle
                        }
                      >
                        Object clicked
                      </Text>

                      <Text
                        style={
                          styles.itemSubtitle
                        }
                      >
                        {
                          rule.action
                        }
                        {
                          rule.action ===
                          "add-score"
                            ? ` +${rule.value}`
                            : ""
                        }
                      </Text>
                    </View>

                  </Pressable>
                )
              )}
            </View>
          )}


          {selectedRule ? (
            <View
              style={
                styles.editorBox
              }
            >

              <Text
                style={
                  styles.editorTitle
                }
              >
                Edit Rule
              </Text>


              <Text
                style={
                  styles.label
                }
              >
                When this object is clicked
              </Text>

              <View
                style={
                  styles.wrapRow
                }
              >
                {objects.map(
                  object => (
                    <ChoiceButton
                      key={
                        object.id
                      }
                      label={
                        object.name
                      }
                      selected={
                        selectedRule.triggerTargetId ===
                        object.id
                      }
                      onPress={() =>
                        updateRule(
                          selectedRule.id,
                          "triggerTargetId",
                          object.id
                        )
                      }
                    />
                  )
                )}
              </View>


              <Text
                style={
                  styles.label
                }
              >
                Action
              </Text>

              <View
                style={
                  styles.wrapRow
                }
              >
                {[
                  "add-score",
                  "remove-score",
                  "hide",
                  "show",
                  "move",
                ].map(
                  action => (
                    <ChoiceButton
                      key={
                        action
                      }
                      label={
                        action
                      }
                      selected={
                        selectedRule.action ===
                        action
                      }
                      onPress={() =>
                        updateRule(
                          selectedRule.id,
                          "action",
                          action
                        )
                      }
                    />
                  )
                )}
              </View>


              {
                selectedRule.action ===
                  "add-score" ||
                selectedRule.action ===
                  "remove-score"
                  ? (
                    <>
                      <Text
                        style={
                          styles.label
                        }
                      >
                        Score Value
                      </Text>

                      <TextInput
                        value={
                          String(
                            selectedRule.value
                          )
                        }
                        onChangeText={
                          value =>
                            updateRule(
                              selectedRule.id,
                              "value",
                              Number(
                                value.replace(
                                  /[^0-9]/g,
                                  ""
                                )
                              ) ||
                              0
                            )
                        }
                        keyboardType="number-pad"
                        style={
                          styles.input
                        }
                      />
                    </>
                  )
                  : null
              }


              {
                [
                  "hide",
                  "show",
                  "move",
                ].includes(
                  selectedRule.action
                )
                  ? (
                    <>
                      <Text
                        style={
                          styles.label
                        }
                      >
                        Target Object
                      </Text>

                      <View
                        style={
                          styles.wrapRow
                        }
                      >
                        {objects.map(
                          object => (
                            <ChoiceButton
                              key={
                                object.id
                              }
                              label={
                                object.name
                              }
                              selected={
                                selectedRule.targetIds.includes(
                                  object.id
                                )
                              }
                              onPress={() =>
                                updateRule(
                                  selectedRule.id,
                                  "targetIds",
                                  [
                                    object.id,
                                  ]
                                )
                              }
                            />
                          )
                        )}
                      </View>
                    </>
                  )
                  : null
              }


              {
                selectedRule.action ===
                "move"
                  ? (
                    <View
                      style={
                        styles.settingGrid
                      }
                    >

                      <View
                        style={
                          styles.settingField
                        }
                      >
                        <Text
                          style={
                            styles.label
                          }
                        >
                          Move X
                        </Text>

                        <TextInput
                          value={
                            String(
                              selectedRule.moveX
                            )
                          }
                          onChangeText={
                            value =>
                              updateRule(
                                selectedRule.id,
                                "moveX",
                                Number(
                                  value
                                ) ||
                                0
                              )
                          }
                          keyboardType="numbers-and-punctuation"
                          style={
                            styles.input
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.settingField
                        }
                      >
                        <Text
                          style={
                            styles.label
                          }
                        >
                          Move Y
                        </Text>

                        <TextInput
                          value={
                            String(
                              selectedRule.moveY
                            )
                          }
                          onChangeText={
                            value =>
                              updateRule(
                                selectedRule.id,
                                "moveY",
                                Number(
                                  value
                                ) ||
                                0
                              )
                          }
                          keyboardType="numbers-and-punctuation"
                          style={
                            styles.input
                          }
                        />
                      </View>

                    </View>
                  )
                  : null
              }


              <View
                style={
                  styles.switchRow
                }
              >
                <Text
                  style={
                    styles.switchTitle
                  }
                >
                  Rule Enabled
                </Text>

                <Switch
                  value={
                    selectedRule.enabled !==
                    false
                  }
                  onValueChange={
                    value =>
                      updateRule(
                        selectedRule.id,
                        "enabled",
                        value
                      )
                  }
                />
              </View>


              <Pressable
                onPress={() =>
                  deleteRule(
                    selectedRule.id
                  )
                }
                style={
                  styles.dangerButtonFull
                }
              >
                <Trash2
                  size={16}
                  color="#D95757"
                />
                <Text
                  style={
                    styles.dangerButtonText
                  }
                >
                  Delete Rule
                </Text>
              </Pressable>

            </View>
          ) : null}

        </View>


        <View
          style={
            styles.bottomActions
          }
        >

          <Pressable
            onPress={
              openAssignmentModal
            }
            disabled={
              saving
            }
            style={
              styles.assignButton
            }
          >
            <Link2
              size={18}
              color="#7C6CFF"
            />
            <Text
              style={
                styles.assignButtonText
              }
            >
              Assign Game
            </Text>
          </Pressable>


          <Pressable
            onPress={() =>
              persistGame(
                true
              )
            }
            disabled={
              saving
            }
            style={
              styles.primaryButton
            }
          >
            {
              saving
                ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                )
                : (
                  <>
                    <Save
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Save Game
                    </Text>
                  </>
                )
            }
          </Pressable>

        </View>

      </ScrollView>


      <Modal
        visible={
          assignmentVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          !assignmentSaving &&
          setAssignmentVisible(
            false
          )
        }
      >

        <View
          style={
            styles.modalBackdrop
          }
        >

          <View
            style={
              styles.modalSheet
            }
          >

            <View
              style={
                styles.modalHeader
              }
            >

              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Assign Game
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Assign to a child or an active session
                </Text>
              </View>

              <Pressable
                disabled={
                  assignmentSaving
                }
                onPress={() =>
                  setAssignmentVisible(
                    false
                  )
                }
                style={
                  styles.iconButton
                }
              >
                <X
                  size={20}
                  color="#6D6F81"
                />
              </Pressable>

            </View>


            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
            >

              {
                assignmentLoading
                  ? (
                    <View
                      style={
                        styles.modalLoading
                      }
                    >
                      <ActivityIndicator
                        size="large"
                        color="#7C6CFF"
                      />
                    </View>
                  )
                  : (
                    <>

                      <Text
                        style={
                          styles.label
                        }
                      >
                        Assignment Type
                      </Text>

                      <View
                        style={
                          styles.choiceRow
                        }
                      >
                        <ChoiceButton
                          label="Child"
                          selected={
                            assignmentType ===
                            "child"
                          }
                          onPress={() => {
                            setAssignmentType(
                              "child"
                            );
                            setAssignmentSessionId(
                              null
                            );
                          }}
                        />

                        <ChoiceButton
                          label="Session"
                          selected={
                            assignmentType ===
                            "session"
                          }
                          onPress={() => {
                            setAssignmentType(
                              "session"
                            );
                            setAssignmentSessionId(
                              null
                            );
                          }}
                        />
                      </View>


                      <Text
                        style={
                          styles.label
                        }
                      >
                        Child
                      </Text>

                      <View
                        style={
                          styles.wrapRow
                        }
                      >
                        {
                          assignmentChildren.length
                            ? assignmentChildren.map(
                                child => (
                                  <ChoiceButton
                                    key={
                                      child.id
                                    }
                                    label={
                                      child.full_name ||
                                      child.name ||
                                      `Child #${child.id}`
                                    }
                                    selected={
                                      Number(
                                        assignmentChildId
                                      ) ===
                                      Number(
                                        child.id
                                      )
                                    }
                                    onPress={() => {
                                      setAssignmentChildId(
                                        Number(
                                          child.id
                                        )
                                      );
                                      setAssignmentSessionId(
                                        null
                                      );
                                    }}
                                  />
                                )
                              )
                            : (
                              <Text
                                style={
                                  styles.emptySmallText
                                }
                              >
                                No assigned children.
                              </Text>
                            )
                        }
                      </View>


                      {
                        assignmentType ===
                        "session"
                          ? (
                            <>
                              <Text
                                style={
                                  styles.label
                                }
                              >
                                Session
                              </Text>

                              <View
                                style={
                                  styles.wrapRow
                                }
                              >
                                {
                                  filteredSessions.length
                                    ? filteredSessions.map(
                                        session => (
                                          <ChoiceButton
                                            key={
                                              session.id
                                            }
                                            label={
                                              `#${session.id} ${session.status || ""}`
                                            }
                                            selected={
                                              Number(
                                                assignmentSessionId
                                              ) ===
                                              Number(
                                                session.id
                                              )
                                            }
                                            onPress={() =>
                                              setAssignmentSessionId(
                                                Number(
                                                  session.id
                                                )
                                              )
                                            }
                                          />
                                        )
                                      )
                                    : (
                                      <Text
                                        style={
                                          styles.emptySmallText
                                        }
                                      >
                                        No active sessions for this child.
                                      </Text>
                                    )
                                }
                              </View>
                            </>
                          )
                          : null
                      }


                      {assignmentError ? (
                        <View
                          style={
                            styles.errorBox
                          }
                        >
                          <Text
                            style={
                              styles.errorText
                            }
                          >
                            {
                              assignmentError
                            }
                          </Text>
                        </View>
                      ) : null}


                      {assignmentMessage ? (
                        <View
                          style={
                            styles.successBox
                          }
                        >
                          <Check
                            size={16}
                            color="#2E9C5B"
                          />
                          <Text
                            style={
                              styles.successText
                            }
                          >
                            {
                              assignmentMessage
                            }
                          </Text>
                        </View>
                      ) : null}


                      <Pressable
                        disabled={
                          assignmentSaving
                        }
                        onPress={
                          handleAssign
                        }
                        style={
                          styles.primaryButton
                        }
                      >
                        {
                          assignmentSaving
                            ? (
                              <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                              />
                            )
                            : (
                              <>
                                <Send
                                  size={18}
                                  color="#FFFFFF"
                                />
                                <Text
                                  style={
                                    styles.primaryButtonText
                                  }
                                >
                                  Assign
                                </Text>
                              </>
                            )
                        }
                      </Pressable>


                      <View
                        style={
                          styles.assignmentsSection
                        }
                      >
                        <Text
                          style={
                            styles.editorTitle
                          }
                        >
                          Current Assignments
                        </Text>

                        {
                          assignments.length ===
                          0
                            ? (
                              <Text
                                style={
                                  styles.emptySmallText
                                }
                              >
                                This game has no assignments yet.
                              </Text>
                            )
                            : assignments.map(
                                assignment => (
                                  <View
                                    key={
                                      assignment.id
                                    }
                                    style={
                                      styles.assignmentRow
                                    }
                                  >

                                    <View
                                      style={
                                        styles.itemCopy
                                      }
                                    >
                                      <Text
                                        style={
                                          styles.itemTitle
                                        }
                                      >
                                        {
                                          assignment.child_name ||
                                          `Child #${assignment.child_id}`
                                        }
                                      </Text>

                                      <Text
                                        style={
                                          styles.itemSubtitle
                                        }
                                      >
                                        {
                                          assignment.assignment_type ===
                                          "session"
                                            ? `Session #${assignment.session_id}`
                                            : "Child assignment"
                                        }
                                      </Text>
                                    </View>

                                    <Pressable
                                      disabled={
                                        assignmentSaving
                                      }
                                      onPress={() =>
                                        handleRemoveAssignment(
                                          assignment
                                        )
                                      }
                                      style={
                                        styles.removeAssignment
                                      }
                                    >
                                      <Trash2
                                        size={17}
                                        color="#D95757"
                                      />
                                    </Pressable>

                                  </View>
                                )
                              )
                        }
                      </View>

                    </>
                  )
              }

            </ScrollView>

          </View>

        </View>

      </Modal>

    </View>
  );
}


const styles =
  StyleSheet.create({

    page: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    content: {
      paddingHorizontal:
        16,
      paddingTop:
        14,
      paddingBottom:
        50,
    },

    center: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 13,
      color:
        "#9193A5",
    },

    topBar: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom:
        18,
    },

    topTitleWrap: {
      flex: 1,
      marginHorizontal:
        12,
    },

    topTitle: {
      fontSize: 22,
      fontWeight:
        "800",
      color:
        "#29293F",
    },

    topSubtitle: {
      marginTop: 2,
      fontSize: 12,
      color:
        "#9496A6",
    },

    iconButton: {
      width: 42,
      height: 42,
      borderRadius:
        13,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E8E8EF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    saveIconButton: {
      width: 42,
      height: 42,
      borderRadius:
        13,
      backgroundColor:
        "#7C6CFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    card: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E8E8F0",
      borderRadius:
        20,
      padding: 16,
      marginBottom:
        14,
    },

    sectionHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },

    sectionHeaderBetween: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 4,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight:
        "800",
      color:
        "#343449",
    },

    countText: {
      minWidth: 28,
      height: 28,
      paddingHorizontal:
        8,
      borderRadius:
        14,
      backgroundColor:
        "#F0EDFF",
      color:
        "#7C6CFF",
      textAlign:
        "center",
      lineHeight: 28,
      fontWeight:
        "700",
    },

    label: {
      marginTop: 14,
      marginBottom: 7,
      fontSize: 12,
      fontWeight:
        "700",
      color:
        "#626477",
    },

    input: {
      minHeight: 46,
      borderWidth: 1,
      borderColor:
        "#E0E0E8",
      borderRadius:
        13,
      backgroundColor:
        "#FAFAFD",
      paddingHorizontal:
        13,
      fontSize: 14,
      color:
        "#303044",
    },

    multilineInput: {
      minHeight: 90,
      paddingTop: 12,
      textAlignVertical:
        "top",
    },

    choiceRow: {
      flexDirection:
        "row",
      gap: 8,
    },

    wrapRow: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 8,
    },

    choiceButton: {
      minHeight: 38,
      paddingHorizontal:
        13,
      borderRadius:
        12,
      borderWidth: 1,
      borderColor:
        "#DDDDE7",
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    choiceButtonSelected: {
      borderColor:
        "#7C6CFF",
      backgroundColor:
        "#F0EDFF",
    },

    choiceText: {
      fontSize: 12,
      fontWeight:
        "700",
      color:
        "#747687",
    },

    choiceTextSelected: {
      color:
        "#6F60DF",
    },

    settingGrid: {
      flexDirection:
        "row",
      gap: 10,
    },

    settingField: {
      flex: 1,
    },

    switchRow: {
      marginTop: 16,
      minHeight: 52,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      paddingHorizontal:
        13,
      paddingVertical:
        8,
      borderRadius:
        13,
      backgroundColor:
        "#F8F8FC",
    },

    switchTitle: {
      fontSize: 13,
      fontWeight:
        "700",
      color:
        "#46485C",
    },

    switchSubtitle: {
      marginTop: 2,
      fontSize: 10,
      color:
        "#9698A8",
    },

    objectTools: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 8,
      marginTop: 14,
    },

    toolButton: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
      minHeight: 38,
      paddingHorizontal:
        11,
      borderRadius:
        11,
      backgroundColor:
        "#F1EDFF",
    },

    toolText: {
      fontSize: 11,
      fontWeight:
        "700",
      color:
        "#7062DF",
    },

    emptySmall: {
      marginTop: 14,
      minHeight: 72,
      borderRadius:
        13,
      backgroundColor:
        "#FAFAFD",
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 14,
    },

    emptySmallText: {
      fontSize: 12,
      lineHeight: 18,
      color:
        "#989AAA",
      textAlign:
        "center",
    },

    itemList: {
      marginTop: 12,
      gap: 8,
    },

    itemCard: {
      flexDirection:
        "row",
      alignItems:
        "center",
      minHeight: 58,
      paddingHorizontal:
        12,
      borderRadius:
        13,
      borderWidth: 1,
      borderColor:
        "#E8E8EF",
      backgroundColor:
        "#FFFFFF",
    },

    itemCardSelected: {
      borderColor:
        "#A89FFF",
      backgroundColor:
        "#F8F6FF",
    },

    objectColor: {
      width: 32,
      height: 32,
      borderRadius: 10,
    },

    itemCopy: {
      flex: 1,
      marginHorizontal:
        10,
    },

    itemTitle: {
      fontSize: 13,
      fontWeight:
        "700",
      color:
        "#3F4054",
    },

    itemSubtitle: {
      marginTop: 2,
      fontSize: 10,
      color:
        "#9A9CAA",
    },

    editorBox: {
      marginTop: 14,
      borderRadius:
        15,
      backgroundColor:
        "#F9F8FF",
      padding: 14,
    },

    editorTitle: {
      fontSize: 14,
      fontWeight:
        "800",
      color:
        "#4A4B60",
      marginBottom: 2,
    },

    editorActions: {
      flexDirection:
        "row",
      gap: 8,
      marginTop: 14,
    },

    secondaryButton: {
      flex: 1,
      height: 42,
      borderRadius:
        12,
      backgroundColor:
        "#EFECFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 6,
    },

    secondaryButtonText: {
      color:
        "#6F60DF",
      fontSize: 12,
      fontWeight:
        "700",
    },

    dangerButton: {
      flex: 1,
      height: 42,
      borderRadius:
        12,
      backgroundColor:
        "#FFF0F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 6,
    },

    dangerButtonFull: {
      height: 43,
      borderRadius:
        12,
      backgroundColor:
        "#FFF0F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 6,
      marginTop: 14,
    },

    dangerButtonText: {
      color:
        "#D95757",
      fontSize: 12,
      fontWeight:
        "700",
    },

    smallPrimary: {
      height: 36,
      paddingHorizontal:
        12,
      borderRadius:
        11,
      backgroundColor:
        "#7C6CFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    smallPrimaryText: {
      color:
        "#FFFFFF",
      fontSize: 11,
      fontWeight:
        "700",
    },

    ruleCard: {
      flexDirection:
        "row",
      alignItems:
        "center",
      minHeight: 58,
      paddingHorizontal:
        12,
      borderRadius:
        13,
      borderWidth: 1,
      borderColor:
        "#E8E8EF",
    },

    ruleNumber: {
      width: 32,
      height: 32,
      borderRadius:
        10,
      backgroundColor:
        "#EFECFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    ruleNumberText: {
      color:
        "#6F60DF",
      fontSize: 12,
      fontWeight:
        "800",
    },

    bottomActions: {
      flexDirection:
        "row",
      gap: 10,
      marginTop: 4,
    },

    assignButton: {
      flex: 1,
      minHeight: 50,
      borderRadius:
        14,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#CEC7FF",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
    },

    assignButtonText: {
      color:
        "#6F60DF",
      fontSize: 13,
      fontWeight:
        "700",
    },

    primaryButton: {
      flex: 1,
      minHeight: 50,
      borderRadius:
        14,
      backgroundColor:
        "#7C6CFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
      paddingHorizontal:
        16,
    },

    primaryButtonText: {
      color:
        "#FFFFFF",
      fontSize: 13,
      fontWeight:
        "700",
    },

    errorBox: {
      marginBottom: 12,
      borderRadius:
        12,
      backgroundColor:
        "#FFF0F0",
      borderWidth: 1,
      borderColor:
        "#F1CACA",
      padding: 12,
    },

    errorText: {
      color:
        "#B84E4E",
      fontSize: 12,
      lineHeight: 17,
    },

    successBox: {
      marginBottom: 12,
      borderRadius:
        12,
      backgroundColor:
        "#EBF9F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 7,
      padding: 12,
    },

    successText: {
      color:
        "#2E8E55",
      fontSize: 12,
      fontWeight:
        "600",
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor:
        "rgba(27,27,43,0.40)",
      justifyContent:
        "flex-end",
    },

    modalSheet: {
      maxHeight:
        "88%",
      minHeight:
        "55%",
      backgroundColor:
        "#FFFFFF",
      borderTopLeftRadius:
        26,
      borderTopRightRadius:
        26,
      paddingHorizontal:
        18,
      paddingTop:
        18,
      paddingBottom:
        30,
    },

    modalHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 12,
    },

    modalTitle: {
      fontSize: 20,
      fontWeight:
        "800",
      color:
        "#303044",
    },

    modalSubtitle: {
      marginTop: 3,
      fontSize: 11,
      color:
        "#9698A8",
    },

    modalLoading: {
      minHeight: 220,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    assignmentsSection: {
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor:
        "#ECECF2",
    },

    assignmentRow: {
      minHeight: 58,
      marginTop: 8,
      borderRadius:
        13,
      backgroundColor:
        "#F8F8FC",
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal:
        10,
    },

    removeAssignment: {
      width: 38,
      height: 38,
      borderRadius:
        11,
      backgroundColor:
        "#FFF0F0",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    aiDraftBanner: {
      marginBottom: 14,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#E5E0FF",
      backgroundColor:
        "#F7F4FF",
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 10,
    },

    aiDraftIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EEE9FF",
    },

    aiDraftText: {
      flex: 1,
    },

    aiDraftTitle: {
      fontSize: 11.5,
      fontWeight:
        "800",
      color:
        "#51469A",
    },

    aiDraftSubtitle: {
      marginTop: 3,
      fontSize: 9.5,
      fontWeight:
        "600",
      color:
        "#756AA4",
    },

    aiDraftHint: {
      marginTop: 4,
      fontSize: 8.8,
      lineHeight: 13,
      color:
        "#9993B5",
    },

  });