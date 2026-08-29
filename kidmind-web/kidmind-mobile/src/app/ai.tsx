import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  router,
} from "expo-router";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Gamepad2,
  Gauge,
  Menu,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react-native";

import Sidebar from "@/components/layout/Sidebar";

import {
  fetchCurrentUser,
} from "@/api/authApi";

import {
  generateChildAIGame,
  getAIChildren,
  type AIBuilderObject,
  type AIBuilderRule,
  type AIChild,
  type AISourceReport,
  type GeneratedAIGame,
} from "@/api/aiApi";

import {
  setAIGameDraft,
  type AIGameDraft,
} from "@/state/aiGameDraftStore";


type GeneratedResult = {
  primarySkill: string;
  secondaryConcern: string;
  analysis: string;
  therapyPlan: string;
  sourceReport:
    | AISourceReport
    | null;
  game: GeneratedAIGame;
};


const getChildName = (
  child:
    AIChild |
    null
) => {
  if (!child) {
    return "Select Child";
  }

  return (
    child.full_name ||
    child.name ||
    `Child #${child.id}`
  );
};


const toNumber = (
  value: unknown,
  fallback: number
) => {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
};


const normalizeDifficulty = (
  value: unknown
): "Easy" | "Medium" | "Hard" => {
  return value === "Easy" ||
    value === "Medium" ||
    value === "Hard"
    ? value
    : "Medium";
};


const normalizeObjects = (
  value: unknown
): AIBuilderObject[] => {
  return Array.isArray(value)
    ? value.filter(
        item =>
          item &&
          typeof item ===
            "object"
      ) as AIBuilderObject[]
    : [];
};


const normalizeRules = (
  value: unknown
): AIBuilderRule[] => {
  return Array.isArray(value)
    ? value.filter(
        item =>
          item &&
          typeof item ===
            "object"
      ) as AIBuilderRule[]
    : [];
};


const formatDate = (
  value:
    | string
    | null
    | undefined
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};


const formatMetric = (
  value:
    | number
    | null
    | undefined,
  suffix = ""
) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(
      Number(value)
    )
  ) {
    return "—";
  }

  return `${Math.round(
    Number(value)
  )}${suffix}`;
};


const buildDraft = (
  result:
    GeneratedResult,
  child:
    AIChild
): AIGameDraft => {
  const game =
    result.game || {};

  const difficulty =
    normalizeDifficulty(
      game.difficulty ||
      game.gameSettings
        ?.difficulty
    );

  const defaultTime =
    difficulty === "Hard"
      ? 30
      : difficulty ===
          "Medium"
        ? 45
        : 60;

  const timeLimit =
    toNumber(
      game.timeLimit ??
      game.gameSettings
        ?.timeSeconds ??
      game.gameSettings
        ?.time,
      defaultTime
    );

  const lives =
    toNumber(
      game.gameSettings
        ?.lives,
      difficulty === "Hard"
        ? 2
        : 3
    );

  const scoreEnabled =
    game.scoreEnabled !==
      false &&
    game.gameSettings
      ?.scoreEnabled !==
      false;

  const childName =
    getChildName(child);

  return {
    source:
      "GEMINI_AI",

    aiGenerated:
      true,

    childId:
      Number(child.id),

    childName,

    childAge:
      child.age ??
      null,

    gameName:
      game.gameName ||
      game.title ||
      `${childName} — AI Game`,

    gameDescription:
      game.gameDescription ||
      game.description ||
      "AI-generated personalized cognitive game.",

    domain:
      game.domain ||
      game.gameType ||
      "Custom Cognitive Assessment",

    difficulty,

    timeLimit:
      Math.max(
        1,
        Math.round(
          timeLimit
        )
      ),

    lives:
      Math.max(
        1,
        Math.round(
          lives
        )
      ),

    scoreEnabled,

    levels:
      toNumber(
        game.levels,
        3
      ),

    progressiveDifficulty:
      game.progressiveDifficulty !==
      false,

    targetSkill:
      result.primarySkill ||
      game.targetSkill ||
      "Cognitive Skills",

    secondaryConcern:
      result.secondaryConcern ||
      game.secondaryConcern ||
      "",

    analysis:
      result.analysis ||
      game.analysis ||
      "",

    therapyPlan:
      result.therapyPlan ||
      game.therapyPlan ||
      "",

    sourceReport:
      result.sourceReport ||
      null,

    objects:
      normalizeObjects(
        game.objects
      ),

    rules:
      normalizeRules(
        game.rules
      ),

    generatedAt:
      new Date()
        .toISOString(),
  };
};


export default function AI() {
  const [
    sidebarVisible,
    setSidebarVisible,
  ] =
    useState(false);

  const [
    children,
    setChildren,
  ] =
    useState<AIChild[]>(
      []
    );

  const [
    selectedChildId,
    setSelectedChildId,
  ] =
    useState<
      number | null
    >(null);

  const [
    pickerVisible,
    setPickerVisible,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    generating,
    setGenerating,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    generated,
    setGenerated,
  ] =
    useState<
      GeneratedResult |
      null
    >(null);

  const selectedChild =
    useMemo(
      () =>
        children.find(
          child =>
            Number(
              child.id
            ) ===
            Number(
              selectedChildId
            )
        ) || null,
      [
        children,
        selectedChildId,
      ]
    );

  useEffect(
    () => {
      const load =
        async () => {
          try {
            setLoading(true);
            setError("");

            const user =
              await fetchCurrentUser();

            if (
              user.role !==
              "therapist"
            ) {
              throw new Error(
                "AI Assistant is available to therapist accounts."
              );
            }

            const response =
              await getAIChildren();

            setChildren(
              response
            );

            if (
              response.length >
              0
            ) {
              setSelectedChildId(
                Number(
                  response[0].id
                )
              );
            }
          } catch (
            loadError: any
          ) {
            console.error(
              "Load AI children error:",
              loadError
            );

            setError(
              loadError?.message ||
              "Unable to load children."
            );
          } finally {
            setLoading(false);
          }
        };

      load();
    },
    []
  );

  const generateGame =
    async () => {
      if (!selectedChild) {
        setError(
          "Please select a child first."
        );
        return;
      }

      try {
        setGenerating(true);
        setGenerated(null);
        setError("");

        const response =
          await generateChildAIGame(
            Number(
              selectedChild.id
            )
          );

        if (
          !response.success ||
          !response.data
            ?.game
        ) {
          throw new Error(
            response.message ||
            "AI returned incomplete game data."
          );
        }

        const game =
          response.data.game;

        setGenerated({
          primarySkill:
            response.data
              .primarySkill ||
            game.targetSkill ||
            "Cognitive Skills",

          secondaryConcern:
            response.data
              .secondaryConcern ||
            game.secondaryConcern ||
            "",

          analysis:
            response.data
              .analysis ||
            game.analysis ||
            "",

          therapyPlan:
            response.data
              .therapyPlan ||
            game.therapyPlan ||
            "",

          sourceReport:
            response.data
              .sourceReport ||
            null,

          game,
        });
      } catch (
        generateError: any
      ) {
        console.error(
          "Generate AI game error:",
          generateError
        );

        setError(
          generateError?.message ||
          "Something went wrong while generating the game."
        );
      } finally {
        setGenerating(false);
      }
    };

  const openBuilder =
    () => {
      if (
        !generated ||
        !selectedChild
      ) {
        return;
      }

      const draft =
        buildDraft(
          generated,
          selectedChild
        );

      setAIGameDraft(
        draft
      );

      router.push({
        pathname:
          "/game-builder",
        params: {
          fromAI:
            "1",
        },
      } as any);
    };

  const report =
    generated
      ?.sourceReport ||
    null;

  const game =
    generated?.game ||
    null;

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        "top",
      ]}
    >
      <View
        style={
          styles.page
        }
      >
        <View
          style={
            styles.header
          }
        >
          <Pressable
            style={
              styles.headerButton
            }
            onPress={() =>
              setSidebarVisible(
                true
              )
            }
          >
            <Menu
              size={21}
              color="#72768F"
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={
                styles.headerLabel
              }
            >
              KidMind Therapist
            </Text>

            <Text
              style={
                styles.headerName
              }
            >
              AI Assistant
            </Text>
          </View>

          <View
            style={
              styles.headerSparkle
            }
          >
            <Sparkles
              size={19}
              color="#7C6CFF"
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <View
            style={
              styles.hero
            }
          >
            <View
              style={
                styles.heroIcon
              }
            >
              <BrainCircuit
                size={30}
                color="#FFFFFF"
              />
            </View>

            <Text
              style={
                styles.heroEyebrow
              }
            >
              PERSONALIZED GAME GENERATOR
            </Text>

            <Text
              style={
                styles.heroTitle
              }
            >
              Child AI
            </Text>

            <Text
              style={
                styles.heroText
              }
            >
              Select a child. KidMind securely uses that child's latest completed assessment report, identifies a strengthening target, and generates a complete editable Game Builder draft.
            </Text>
          </View>

          {error ? (
            <View
              style={
                styles.errorBox
              }
            >
              <Text
                style={
                  styles.errorTitle
                }
              >
                AI Assistant Error
              </Text>

              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>
            </View>
          ) : null}

          <View
            style={
              styles.panel
            }
          >
            <Text
              style={
                styles.panelTitle
              }
            >
              Select Child
            </Text>

            <Text
              style={
                styles.panelSubtitle
              }
            >
              The backend automatically selects the latest completed assessment report for this child.
            </Text>

            {loading ? (
              <View
                style={
                  styles.loadingBlock
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#7C6CFF"
                />

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Loading children...
                </Text>
              </View>
            ) : children.length ===
              0 ? (
              <View
                style={
                  styles.emptyBox
                }
              >
                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No children found
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  Assign a child to this therapist before using the AI generator.
                </Text>
              </View>
            ) : (
              <>
                <Pressable
                  style={
                    styles.selector
                  }
                  onPress={() =>
                    setPickerVisible(
                      true
                    )
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.selectorLabel
                      }
                    >
                      CHILD
                    </Text>

                    <Text
                      style={
                        styles.selectorValue
                      }
                    >
                      {
                        getChildName(
                          selectedChild
                        )
                      }
                    </Text>
                  </View>

                  <ChevronDown
                    size={20}
                    color="#7C6CFF"
                  />
                </Pressable>

                {selectedChild ? (
                  <View
                    style={
                      styles.childInfo
                    }
                  >
                    <View>
                      <Text
                        style={
                          styles.childInfoLabel
                        }
                      >
                        Age
                      </Text>
                      <Text
                        style={
                          styles.childInfoValue
                        }
                      >
                        {
                          selectedChild.age ??
                          "—"
                        }
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={
                          styles.childInfoLabel
                        }
                      >
                        Region
                      </Text>
                      <Text
                        style={
                          styles.childInfoValue
                        }
                      >
                        {
                          selectedChild.region ||
                          "—"
                        }
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={
                          styles.childInfoLabel
                        }
                      >
                        Source
                      </Text>
                      <Text
                        style={
                          styles.childInfoValue
                        }
                      >
                        Latest report
                      </Text>
                    </View>
                  </View>
                ) : null}

                <Pressable
                  disabled={
                    generating ||
                    !selectedChild
                  }
                  style={[
                    styles.generateButton,
                    (
                      generating ||
                      !selectedChild
                    ) &&
                      styles.generateButtonDisabled,
                  ]}
                  onPress={
                    generateGame
                  }
                >
                  {generating ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Sparkles
                      size={18}
                      color="#FFFFFF"
                    />
                  )}

                  <Text
                    style={
                      styles.generateButtonText
                    }
                  >
                    {
                      generating
                        ? "Analyzing latest report..."
                        : "Analyze & Generate Personalized Game"
                    }
                  </Text>
                </Pressable>
              </>
            )}
          </View>

          {generated ? (
            <>
              <View
                style={
                  styles.panel
                }
              >
                <View
                  style={
                    styles.sectionHeading
                  }
                >
                  <View
                    style={
                      styles.sectionIcon
                    }
                  >
                    <CalendarDays
                      size={18}
                      color="#7C6CFF"
                    />
                  </View>

                  <View
                    style={
                      styles.sectionHeadingText
                    }
                  >
                    <Text
                      style={
                        styles.panelTitle
                      }
                    >
                      Source Report
                    </Text>

                    <Text
                      style={
                        styles.panelSubtitle
                      }
                    >
                      Latest completed assessment used by the backend
                    </Text>
                  </View>
                </View>

                {report ? (
                  <>
                    <View
                      style={
                        styles.reportHeader
                      }
                    >
                      <Text
                        style={
                          styles.reportSession
                        }
                      >
                        Session #{
                          report.sessionId ??
                          "—"
                        }
                      </Text>

                      <Text
                        style={
                          styles.reportDate
                        }
                      >
                        {
                          formatDate(
                            report.assessmentDate
                          )
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.metricGrid
                      }
                    >
                      <MetricCard
                        icon={
                          <Gauge
                            size={17}
                            color="#7C6CFF"
                          />
                        }
                        label="Score"
                        value={
                          formatMetric(
                            report.score,
                            "%"
                          )
                        }
                      />

                      <MetricCard
                        icon={
                          <CheckCircle2
                            size={17}
                            color="#49A27C"
                          />
                        }
                        label="Accuracy"
                        value={
                          formatMetric(
                            report.averageAccuracy,
                            "%"
                          )
                        }
                      />

                      <MetricCard
                        icon={
                          <Target
                            size={17}
                            color="#D98556"
                          />
                        }
                        label="Mistakes"
                        value={
                          formatMetric(
                            report.totalMistakes
                          )
                        }
                      />

                      <MetricCard
                        icon={
                          <Clock3
                            size={17}
                            color="#5595DD"
                          />
                        }
                        label="Reaction"
                        value={
                          report.averageReactionTime ===
                            null ||
                          report.averageReactionTime ===
                            undefined
                            ? "—"
                            : `${Number(
                                report.averageReactionTime
                              ).toFixed(
                                2
                              )}s`
                        }
                      />
                    </View>

                    {Array.isArray(
                      report.games
                    ) &&
                    report.games.length >
                      0 ? (
                      <View
                        style={
                          styles.reportGames
                        }
                      >
                        {report.games.map(
                          (
                            reportGame,
                            index
                          ) => (
                            <View
                              style={
                                styles.reportGameRow
                              }
                              key={
                                `${reportGame.gameName || reportGame.game_name || "game"}-${index}`
                              }
                            >
                              <Text
                                numberOfLines={
                                  1
                                }
                                style={
                                  styles.reportGameName
                                }
                              >
                                {
                                  reportGame.gameName ||
                                  reportGame.game_name ||
                                  `Game ${index + 1}`
                                }
                              </Text>

                              <Text
                                style={
                                  styles.reportGameScore
                                }
                              >
                                {
                                  formatMetric(
                                    reportGame.score,
                                    "%"
                                  )
                                }
                              </Text>
                            </View>
                          )
                        )}
                      </View>
                    ) : null}
                  </>
                ) : (
                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    No source report details were returned.
                  </Text>
                )}
              </View>

              <View
                style={
                  styles.panel
                }
              >
                <View
                  style={
                    styles.sectionHeading
                  }
                >
                  <View
                    style={
                      styles.sectionIcon
                    }
                  >
                    <BrainCircuit
                      size={18}
                      color="#7C6CFF"
                    />
                  </View>

                  <View
                    style={
                      styles.sectionHeadingText
                    }
                  >
                    <Text
                      style={
                        styles.panelTitle
                      }
                    >
                      AI Analysis
                    </Text>

                    <Text
                      style={
                        styles.panelSubtitle
                      }
                    >
                      Performance interpretation, not a diagnosis
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.skillPill
                  }
                >
                  <Target
                    size={15}
                    color="#6F60E7"
                  />

                  <Text
                    style={
                      styles.skillPillText
                    }
                  >
                    Strengthen: {
                      generated.primarySkill
                    }
                  </Text>
                </View>

                {generated.secondaryConcern ? (
                  <Text
                    style={
                      styles.secondaryConcern
                    }
                  >
                    Secondary concern: {
                      generated.secondaryConcern
                    }
                  </Text>
                ) : null}

                <Text
                  style={
                    styles.analysisText
                  }
                >
                  {
                    generated.analysis ||
                    "No analysis text returned."
                  }
                </Text>
              </View>

              <View
                style={
                  styles.planPanel
                }
              >
                <View
                  style={
                    styles.planIcon
                  }
                >
                  <Zap
                    size={19}
                    color="#FFFFFF"
                  />
                </View>

                <View
                  style={
                    styles.planContent
                  }
                >
                  <Text
                    style={
                      styles.planTitle
                    }
                  >
                    Strengthening Plan
                  </Text>

                  <Text
                    style={
                      styles.planText
                    }
                  >
                    {
                      generated.therapyPlan ||
                      "No strengthening plan was returned."
                    }
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.panel
                }
              >
                <View
                  style={
                    styles.sectionHeading
                  }
                >
                  <View
                    style={
                      styles.sectionIcon
                    }
                  >
                    <Gamepad2
                      size={18}
                      color="#7C6CFF"
                    />
                  </View>

                  <View
                    style={
                      styles.sectionHeadingText
                    }
                  >
                    <Text
                      style={
                        styles.panelTitle
                      }
                    >
                      Generated Game
                    </Text>

                    <Text
                      style={
                        styles.panelSubtitle
                      }
                    >
                      Full Game Builder configuration
                    </Text>
                  </View>
                </View>

                <Text
                  style={
                    styles.gameTitle
                  }
                >
                  {
                    game?.gameName ||
                    game?.title ||
                    "Personalized AI Game"
                  }
                </Text>

                <Text
                  style={
                    styles.gameDescription
                  }
                >
                  {
                    game?.gameDescription ||
                    game?.description ||
                    "AI-generated cognitive game."
                  }
                </Text>

                <View
                  style={
                    styles.gameMetaGrid
                  }
                >
                  <InfoBox
                    label="Domain"
                    value={
                      game?.domain ||
                      "Cognitive"
                    }
                  />

                  <InfoBox
                    label="Difficulty"
                    value={
                      game?.difficulty ||
                      "Medium"
                    }
                  />

                  <InfoBox
                    label="Time"
                    value={`${toNumber(
                      game?.timeLimit ??
                      game?.gameSettings
                        ?.timeSeconds,
                      45
                    )}s`}
                  />

                  <InfoBox
                    label="Lives"
                    value={String(
                      toNumber(
                        game?.gameSettings
                          ?.lives,
                        3
                      )
                    )}
                  />

                  <InfoBox
                    label="Objects"
                    value={String(
                      normalizeObjects(
                        game?.objects
                      ).length
                    )}
                  />

                  <InfoBox
                    label="Rules"
                    value={String(
                      normalizeRules(
                        game?.rules
                      ).length
                    )}
                  />
                </View>

                <Pressable
                  style={
                    styles.builderButton
                  }
                  onPress={
                    openBuilder
                  }
                >
                  <Gamepad2
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.builderButtonText
                    }
                  >
                    Open Complete Game in Builder
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </ScrollView>

        <Sidebar
          visible={
            sidebarVisible
          }
          onClose={() =>
            setSidebarVisible(
              false
            )
          }
        />

        <Modal
          visible={
            pickerVisible
          }
          transparent
          animationType="fade"
          onRequestClose={() =>
            setPickerVisible(
              false
            )
          }
        >
          <Pressable
            style={
              styles.modalBackdrop
            }
            onPress={() =>
              setPickerVisible(
                false
              )
            }
          >
            <Pressable
              style={
                styles.pickerCard
              }
              onPress={
                event =>
                  event.stopPropagation()
              }
            >
              <View
                style={
                  styles.pickerHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.pickerTitle
                    }
                  >
                    Select Child
                  </Text>

                  <Text
                    style={
                      styles.pickerSubtitle
                    }
                  >
                    Assigned therapist children
                  </Text>
                </View>

                <Pressable
                  style={
                    styles.pickerClose
                  }
                  onPress={() =>
                    setPickerVisible(
                      false
                    )
                  }
                >
                  <X
                    size={19}
                    color="#73778F"
                  />
                </Pressable>
              </View>

              <ScrollView
                style={
                  styles.pickerList
                }
                showsVerticalScrollIndicator={
                  false
                }
              >
                {children.map(
                  child => {
                    const selected =
                      Number(
                        child.id
                      ) ===
                      Number(
                        selectedChildId
                      );

                    return (
                      <Pressable
                        key={
                          child.id
                        }
                        style={[
                          styles.pickerRow,
                          selected &&
                            styles.pickerRowSelected,
                        ]}
                        onPress={() => {
                          setSelectedChildId(
                            Number(
                              child.id
                            )
                          );
                          setGenerated(null);
                          setError("");
                          setPickerVisible(
                            false
                          );
                        }}
                      >
                        <View
                          style={
                            styles.pickerAvatar
                          }
                        >
                          <Text
                            style={
                              styles.pickerAvatarText
                            }
                          >
                            {
                              getChildName(
                                child
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()
                            }
                          </Text>
                        </View>

                        <View
                          style={
                            styles.pickerMain
                          }
                        >
                          <Text
                            style={
                              styles.pickerName
                            }
                          >
                            {
                              getChildName(
                                child
                              )
                            }
                          </Text>

                          <Text
                            style={
                              styles.pickerMeta
                            }
                          >
                            Age {
                              child.age ??
                              "—"
                            } • {
                              child.region ||
                              "No region"
                            }
                          </Text>
                        </View>

                        {selected ? (
                          <CheckCircle2
                            size={20}
                            color="#7C6CFF"
                          />
                        ) : null}
                      </Pressable>
                    );
                  }
                )}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}


const MetricCard = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <View
    style={
      styles.metricCard
    }
  >
    <View
      style={
        styles.metricIcon
      }
    >
      {icon}
    </View>

    <Text
      style={
        styles.metricLabel
      }
    >
      {label}
    </Text>

    <Text
      style={
        styles.metricValue
      }
    >
      {value}
    </Text>
  </View>
);


const InfoBox = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View
    style={
      styles.infoBox
    }
  >
    <Text
      style={
        styles.infoLabel
      }
    >
      {label}
    </Text>

    <Text
      numberOfLines={
        2
      }
      style={
        styles.infoValue
      }
    >
      {value}
    </Text>
  </View>
);


const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    page: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    header: {
      height: 70,
      paddingHorizontal: 18,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderBottomWidth: 1,
      borderBottomColor:
        "#ECECF4",
      backgroundColor:
        "#FFFFFF",
    },

    headerButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
    },

    headerText: {
      flex: 1,
      marginLeft: 12,
    },

    headerLabel: {
      fontSize: 10,
      color:
        "#A0A3B5",
    },

    headerName: {
      marginTop: 2,
      fontSize: 15,
      fontWeight:
        "700",
      color:
        "#343654",
    },

    headerSparkle: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F1EDFF",
    },

    content: {
      padding: 18,
      paddingBottom: 42,
      gap: 16,
    },

    hero: {
      borderRadius: 24,
      padding: 22,
      backgroundColor:
        "#7C6CFF",
    },

    heroIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "rgba(255,255,255,.15)",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,.18)",
      marginBottom: 16,
    },

    heroEyebrow: {
      fontSize: 10,
      fontWeight:
        "800",
      letterSpacing: 1.2,
      color:
        "rgba(255,255,255,.76)",
    },

    heroTitle: {
      marginTop: 6,
      fontSize: 28,
      fontWeight:
        "800",
      color:
        "#FFFFFF",
    },

    heroText: {
      marginTop: 7,
      fontSize: 12.5,
      lineHeight: 20,
      color:
        "rgba(255,255,255,.84)",
    },

    panel: {
      borderRadius: 20,
      padding: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#ECECF4",
    },

    panelTitle: {
      fontSize: 16,
      fontWeight:
        "800",
      color:
        "#353755",
    },

    panelSubtitle: {
      marginTop: 4,
      fontSize: 10.5,
      lineHeight: 16,
      color:
        "#A0A3B4",
    },

    selector: {
      minHeight: 62,
      marginTop: 16,
      paddingHorizontal: 15,
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        "#E8E5F7",
      backgroundColor:
        "#FBFAFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    selectorLabel: {
      fontSize: 8.5,
      fontWeight:
        "800",
      letterSpacing: .8,
      color:
        "#AAA7BE",
    },

    selectorValue: {
      marginTop: 3,
      fontSize: 14,
      fontWeight:
        "700",
      color:
        "#3D3F5B",
    },

    childInfo: {
      marginTop: 12,
      flexDirection:
        "row",
      gap: 8,
    },

    childInfoLabel: {
      fontSize: 8,
      color:
        "#AAADBD",
    },

    childInfoValue: {
      marginTop: 2,
      fontSize: 10.5,
      fontWeight:
        "700",
      color:
        "#55576D",
    },

    generateButton: {
      minHeight: 50,
      marginTop: 18,
      borderRadius: 15,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
      backgroundColor:
        "#7C6CFF",
    },

    generateButtonDisabled: {
      opacity: .55,
    },

    generateButtonText: {
      color:
        "#FFFFFF",
      fontSize: 11.5,
      fontWeight:
        "800",
    },

    loadingBlock: {
      minHeight: 120,
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 9,
    },

    loadingText: {
      fontSize: 10.5,
      color:
        "#9699AA",
    },

    emptyBox: {
      marginTop: 15,
      padding: 18,
      borderRadius: 15,
      backgroundColor:
        "#FAFAFD",
      alignItems:
        "center",
    },

    emptyTitle: {
      fontSize: 12,
      fontWeight:
        "700",
      color:
        "#55576C",
    },

    emptyText: {
      marginTop: 5,
      fontSize: 10,
      lineHeight: 15,
      color:
        "#A0A3B4",
      textAlign:
        "center",
    },

    errorBox: {
      padding: 14,
      borderRadius: 15,
      backgroundColor:
        "#FFF1F4",
      borderWidth: 1,
      borderColor:
        "#F4D8DF",
    },

    errorTitle: {
      fontSize: 11,
      fontWeight:
        "800",
      color:
        "#B94F67",
    },

    errorText: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 15,
      color:
        "#B56D7C",
    },

    sectionHeading: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
      marginBottom: 16,
    },

    sectionIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F0EDFF",
    },

    sectionHeadingText: {
      flex: 1,
    },

    reportHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 12,
    },

    reportSession: {
      fontSize: 11,
      fontWeight:
        "700",
      color:
        "#5A5C72",
    },

    reportDate: {
      fontSize: 9.5,
      color:
        "#A0A3B4",
    },

    metricGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 9,
    },

    metricCard: {
      width: "48%",
      minHeight: 92,
      borderRadius: 15,
      padding: 12,
      backgroundColor:
        "#FAFAFD",
      borderWidth: 1,
      borderColor:
        "#F0F0F5",
    },

    metricIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
      marginBottom: 8,
    },

    metricLabel: {
      fontSize: 8.5,
      color:
        "#A0A3B4",
    },

    metricValue: {
      marginTop: 2,
      fontSize: 17,
      fontWeight:
        "800",
      color:
        "#3B3D5A",
    },

    reportGames: {
      marginTop: 14,
      borderTopWidth: 1,
      borderTopColor:
        "#F0F0F5",
      paddingTop: 8,
    },

    reportGameRow: {
      minHeight: 38,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F4F4F7",
    },

    reportGameName: {
      flex: 1,
      fontSize: 10,
      color:
        "#64677B",
    },

    reportGameScore: {
      fontSize: 10,
      fontWeight:
        "800",
      color:
        "#7C6CFF",
    },

    skillPill: {
      alignSelf:
        "flex-start",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
      paddingHorizontal: 11,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor:
        "#F0EDFF",
    },

    skillPillText: {
      fontSize: 10,
      fontWeight:
        "700",
      color:
        "#6658D4",
    },

    secondaryConcern: {
      marginTop: 12,
      fontSize: 10,
      fontWeight:
        "600",
      color:
        "#8B7996",
    },

    analysisText: {
      marginTop: 13,
      fontSize: 11,
      lineHeight: 18,
      color:
        "#686B80",
    },

    planPanel: {
      borderRadius: 20,
      padding: 18,
      flexDirection:
        "row",
      gap: 12,
      backgroundColor:
        "#5146BD",
    },

    planIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "rgba(255,255,255,.14)",
    },

    planContent: {
      flex: 1,
    },

    planTitle: {
      fontSize: 14,
      fontWeight:
        "800",
      color:
        "#FFFFFF",
    },

    planText: {
      marginTop: 6,
      fontSize: 10.5,
      lineHeight: 17,
      color:
        "rgba(255,255,255,.84)",
    },

    gameTitle: {
      fontSize: 18,
      fontWeight:
        "800",
      color:
        "#353755",
    },

    gameDescription: {
      marginTop: 5,
      fontSize: 10.5,
      lineHeight: 16,
      color:
        "#9295A8",
    },

    gameMetaGrid: {
      marginTop: 15,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 9,
    },

    infoBox: {
      width: "48%",
      minHeight: 67,
      padding: 11,
      borderRadius: 14,
      backgroundColor:
        "#FAFAFD",
      borderWidth: 1,
      borderColor:
        "#F0F0F5",
    },

    infoLabel: {
      fontSize: 8,
      color:
        "#AAADBC",
    },

    infoValue: {
      marginTop: 3,
      fontSize: 10.5,
      fontWeight:
        "700",
      color:
        "#53556C",
    },

    builderButton: {
      minHeight: 50,
      marginTop: 17,
      borderRadius: 15,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
      backgroundColor:
        "#7C6CFF",
    },

    builderButtonText: {
      fontSize: 11.5,
      fontWeight:
        "800",
      color:
        "#FFFFFF",
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor:
        "rgba(31,32,47,.45)",
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 20,
    },

    pickerCard: {
      width: "100%",
      maxHeight: "76%",
      borderRadius: 22,
      padding: 17,
      backgroundColor:
        "#FFFFFF",
    },

    pickerHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 12,
    },

    pickerTitle: {
      fontSize: 17,
      fontWeight:
        "800",
      color:
        "#353755",
    },

    pickerSubtitle: {
      marginTop: 2,
      fontSize: 9.5,
      color:
        "#A0A3B4",
    },

    pickerClose: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "#F7F8FC",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    pickerList: {
      flexGrow: 0,
    },

    pickerRow: {
      minHeight: 64,
      paddingHorizontal: 10,
      borderRadius: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
      marginBottom: 5,
    },

    pickerRowSelected: {
      backgroundColor:
        "#F3F0FF",
    },

    pickerAvatar: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F0EDFF",
    },

    pickerAvatarText: {
      fontSize: 13,
      fontWeight:
        "800",
      color:
        "#7465E8",
    },

    pickerMain: {
      flex: 1,
    },

    pickerName: {
      fontSize: 11.5,
      fontWeight:
        "700",
      color:
        "#4C4E65",
    },

    pickerMeta: {
      marginTop: 3,
      fontSize: 9,
      color:
        "#A0A3B4",
    },
  });
