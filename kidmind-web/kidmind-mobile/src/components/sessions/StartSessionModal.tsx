import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import {
  Brain,
  Check,
  Play,
  X,
} from "lucide-react-native";

import {
  createSession,
} from "@/api/sessionsApi";

import type {
  Child,
} from "@/api/childrenApi";

import type {
  SessionGameInput,
} from "@/api/sessionsApi";


type StartSessionModalProps = {
  visible: boolean;

  child: Child;

  onClose: () => void;

  onStarted: (
    sessionId: number
  ) => void;
};


const availableGames = [
  {
    game_name:
      "Memory Match",

    description:
      "Working memory assessment",
  },

  {
    game_name:
      "Focus Finder",

    description:
      "Attention and reaction assessment",
  },

  {
    game_name:
      "Puzzle Path",

    description:
      "Visual-spatial and problem-solving assessment",
  },

  {
    game_name:
      "Reading Adventure",

    description:
      "Reading comprehension and visual attention assessment",
  },

  {
    game_name:
      "Quick Match",

    description:
      "Processing speed and visual attention assessment",
  },
];


const difficultyLevels = [
  "Level 1",
  "Level 2",
  "Level 3",
];


export default function StartSessionModal({
  visible,
  child,
  onClose,
  onStarted,
}: StartSessionModalProps) {

  const [
    selectedGames,
    setSelectedGames,
  ] = useState<SessionGameInput[]>([
    {
      game_name:
        "Memory Match",

      difficulty:
        "Level 1",
    },
  ]);


  const [
    saving,
    setSaving,
  ] = useState(false);


  useEffect(() => {

    if (!visible) {
      return;
    }


    setSelectedGames([
      {
        game_name:
          "Memory Match",

        difficulty:
          "Level 1",
      },
    ]);

  }, [
    visible,
  ]);


  const isGameSelected = (
    gameName: string
  ) => {

    return selectedGames.some(
      (game) =>
        game.game_name ===
        gameName
    );

  };


  const toggleGame = (
    gameName: string
  ) => {

    setSelectedGames(
      (currentGames) => {

        const alreadySelected =
          currentGames.some(
            (game) =>
              game.game_name ===
              gameName
          );


        if (
          alreadySelected
        ) {

          return currentGames.filter(
            (game) =>
              game.game_name !==
              gameName
          );

        }


        return [
          ...currentGames,

          {
            game_name:
              gameName,

            difficulty:
              "Level 1",
          },
        ];

      }
    );

  };


  const updateDifficulty = (
    gameName: string,
    difficulty: string
  ) => {

    setSelectedGames(
      (currentGames) =>
        currentGames.map(
          (game) =>
            game.game_name ===
            gameName
              ? {
                  ...game,
                  difficulty,
                }
              : game
        )
    );

  };


  const handleClose =
    () => {

      if (
        saving
      ) {
        return;
      }


      onClose();

    };


  const handleStartSession =
    async () => {

      if (
        saving
      ) {
        return;
      }


      if (
        selectedGames.length ===
        0
      ) {

        Alert.alert(
          "No Games Selected",
          "Please select at least one game."
        );


        return;

      }


      try {

        setSaving(
          true
        );


        const result =
          await createSession({
            child_id:
              child.id,

            games:
              selectedGames,
          });


        const sessionId =
          Number(
            result.session.id
          );


        if (
          !Number.isInteger(
            sessionId
          ) ||
          sessionId <= 0
        ) {

          throw new Error(
            "Invalid session ID returned by the server"
          );

        }


        onClose();


        onStarted(
          sessionId
        );

      } catch (error) {

        console.error(
          "Failed to create session:",
          error
        );


        Alert.alert(
          "Unable to Start Session",

          error instanceof Error
            ? error.message
            : "Failed to start session"
        );

      } finally {

        setSaving(
          false
        );

      }

    };


  return (

    <Modal
      visible={
        visible
      }
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        handleClose
      }
    >

      <View
        style={
          styles.overlay
        }
      >

        <View
          style={
            styles.modalCard
          }
        >

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.scrollContent
            }
          >

            <View
              style={
                styles.header
              }
            >

              <View
                style={
                  styles.headerInfo
                }
              >

                <View
                  style={
                    styles.headerIcon
                  }
                >

                  <Brain
                    size={25}
                    color="#7B6EF6"
                  />

                </View>


                <View
                  style={
                    styles.headerText
                  }
                >

                  <Text
                    style={
                      styles.title
                    }
                  >
                    Start Session
                  </Text>


                  <Text
                    style={
                      styles.subtitle
                    }
                    numberOfLines={2}
                  >
                    Child:{" "}
                    {child.full_name}
                  </Text>

                </View>

              </View>


              <TouchableOpacity
                style={
                  styles.closeButton
                }
                onPress={
                  handleClose
                }
                disabled={
                  saving
                }
              >

                <X
                  size={23}
                  color="#64748B"
                />

              </TouchableOpacity>

            </View>


            <Text
              style={
                styles.sectionTitle
              }
            >
              Select Session Games
            </Text>


            <Text
              style={
                styles.sectionDescription
              }
            >
              Select one or more games. The first selected game will start immediately.
            </Text>


            <View
              style={
                styles.gamesContainer
              }
            >

              {availableGames.map(
                (
                  availableGame
                ) => {

                  const selected =
                    isGameSelected(
                      availableGame.game_name
                    );


                  const selectedGame =
                    selectedGames.find(
                      (game) =>
                        game.game_name ===
                        availableGame.game_name
                    );


                  return (

                    <View
                      key={
                        availableGame.game_name
                      }
                      style={[
                        styles.gameCard,

                        selected &&
                          styles.gameCardSelected,
                      ]}
                    >

                      <TouchableOpacity
                        style={
                          styles.gameHeader
                        }
                        activeOpacity={0.8}
                        onPress={() => {

                          toggleGame(
                            availableGame.game_name
                          );

                        }}
                        disabled={
                          saving
                        }
                      >

                        <View
                          style={[
                            styles.checkbox,

                            selected &&
                              styles.checkboxSelected,
                          ]}
                        >

                          {selected && (

                            <Check
                              size={17}
                              color="#FFFFFF"
                            />

                          )}

                        </View>


                        <View
                          style={
                            styles.gameText
                          }
                        >

                          <Text
                            style={
                              styles.gameName
                            }
                          >
                            {availableGame.game_name}
                          </Text>


                          <Text
                            style={
                              styles.gameDescription
                            }
                          >
                            {availableGame.description}
                          </Text>

                        </View>

                      </TouchableOpacity>


                      {selected && (

                        <View
                          style={
                            styles.difficultySection
                          }
                        >

                          <Text
                            style={
                              styles.difficultyLabel
                            }
                          >
                            Difficulty
                          </Text>


                          <View
                            style={
                              styles.difficultyButtons
                            }
                          >

                            {difficultyLevels.map(
                              (
                                level
                              ) => {

                                const active =
                                  selectedGame?.difficulty ===
                                  level;


                                return (

                                  <TouchableOpacity
                                    key={
                                      level
                                    }
                                    style={[
                                      styles.difficultyButton,

                                      active &&
                                        styles.difficultyButtonActive,
                                    ]}
                                    onPress={() => {

                                      updateDifficulty(
                                        availableGame.game_name,
                                        level
                                      );

                                    }}
                                    disabled={
                                      saving
                                    }
                                  >

                                    <Text
                                      style={[
                                        styles.difficultyText,

                                        active &&
                                          styles.difficultyTextActive,
                                      ]}
                                    >
                                      {level}
                                    </Text>

                                  </TouchableOpacity>

                                );

                              }
                            )}

                          </View>

                        </View>

                      )}

                    </View>

                  );

                }
              )}

            </View>


            <View
              style={
                styles.summaryCard
              }
            >

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Selected Games
              </Text>


              <Text
                style={
                  styles.summaryCount
                }
              >
                {selectedGames.length}
              </Text>


              {selectedGames.length >
                0 && (

                <View
                  style={
                    styles.selectedChips
                  }
                >

                  {selectedGames.map(
                    (
                      game,
                      index
                    ) => (

                      <View
                        key={
                          `${game.game_name}-${index}`
                        }
                        style={
                          styles.chip
                        }
                      >

                        <Text
                          style={
                            styles.chipOrder
                          }
                        >
                          {index + 1}
                        </Text>


                        <Text
                          style={
                            styles.chipText
                          }
                        >
                          {game.game_name}
                          {" · "}
                          {game.difficulty}
                        </Text>

                      </View>

                    )
                  )}

                </View>

              )}

            </View>


            <View
              style={
                styles.actions
              }
            >

              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={
                  handleClose
                }
                disabled={
                  saving
                }
              >

                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancel
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={[
                  styles.startButton,

                  (
                    saving ||
                    selectedGames.length ===
                      0
                  ) &&
                    styles.disabledButton,
                ]}
                onPress={
                  handleStartSession
                }
                disabled={
                  saving ||
                  selectedGames.length ===
                    0
                }
              >

                {saving ? (

                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                ) : (

                  <Play
                    size={18}
                    color="#FFFFFF"
                  />

                )}


                <Text
                  style={
                    styles.startButtonText
                  }
                >
                  {saving
                    ? "Starting..."
                    : "Start Session"
                  }
                </Text>

              </TouchableOpacity>

            </View>

          </ScrollView>

        </View>

      </View>

    </Modal>

  );

}


const styles =
  StyleSheet.create({

    overlay: {
      flex: 1,

      backgroundColor:
        "rgba(15, 23, 42, 0.42)",

      justifyContent:
        "center",

      padding: 18,
    },


    modalCard: {
      width: "100%",

      maxHeight: "92%",

      borderRadius: 26,

      backgroundColor:
        "#FFFFFF",

      overflow:
        "hidden",
    },


    scrollContent: {
      padding: 22,

      paddingBottom: 26,
    },


    header: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap: 12,
    },


    headerInfo: {
      flex: 1,

      flexDirection: "row",

      alignItems:
        "center",

      gap: 12,
    },


    headerIcon: {
      width: 50,

      height: 50,

      borderRadius: 16,

      backgroundColor:
        "#EEE9FF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    headerText: {
      flex: 1,
    },


    title: {
      color: "#172554",

      fontSize: 23,

      fontWeight: "800",
    },


    subtitle: {
      color: "#64748B",

      marginTop: 3,
    },


    closeButton: {
      padding: 5,
    },


    sectionTitle: {
      color: "#172554",

      fontSize: 19,

      fontWeight: "700",

      marginTop: 27,
    },


    sectionDescription: {
      color: "#64748B",

      lineHeight: 21,

      marginTop: 5,
    },


    gamesContainer: {
      gap: 14,

      marginTop: 18,
    },


    gameCard: {
      padding: 17,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      backgroundColor:
        "#FFFFFF",
    },


    gameCardSelected: {
      borderColor:
        "#7B6EF6",

      backgroundColor:
        "#F8F6FF",
    },


    gameHeader: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      gap: 12,
    },


    checkbox: {
      width: 28,

      height: 28,

      borderRadius: 8,

      borderWidth: 1,

      borderColor:
        "#CBD5E1",

      backgroundColor:
        "#FFFFFF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    checkboxSelected: {
      borderColor:
        "#7B6EF6",

      backgroundColor:
        "#7B6EF6",
    },


    gameText: {
      flex: 1,
    },


    gameName: {
      color: "#172554",

      fontSize: 16,

      fontWeight: "700",
    },


    gameDescription: {
      color: "#64748B",

      lineHeight: 20,

      marginTop: 4,
    },


    difficultySection: {
      borderTopWidth: 1,

      borderTopColor:
        "#E2E8F0",

      marginTop: 16,

      paddingTop: 14,
    },


    difficultyLabel: {
      color: "#64748B",

      fontSize: 13,

      fontWeight: "600",
    },


    difficultyButtons: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 8,

      marginTop: 10,
    },


    difficultyButton: {
      flex: 1,

      minWidth: 82,

      paddingHorizontal: 10,

      paddingVertical: 10,

      borderRadius: 11,

      borderWidth: 1,

      borderColor:
        "#CBD5E1",

      backgroundColor:
        "#FFFFFF",

      alignItems:
        "center",
    },


    difficultyButtonActive: {
      borderColor:
        "#7B6EF6",

      backgroundColor:
        "#EEE9FF",
    },


    difficultyText: {
      color: "#64748B",

      fontSize: 13,

      fontWeight: "600",
    },


    difficultyTextActive: {
      color: "#6D5CE7",

      fontWeight: "800",
    },


    summaryCard: {
      marginTop: 19,

      padding: 17,

      borderRadius: 18,

      backgroundColor:
        "#F8FAFC",
    },


    summaryLabel: {
      color: "#64748B",

      fontSize: 13,
    },


    summaryCount: {
      color: "#172554",

      fontSize: 25,

      fontWeight: "800",

      marginTop: 2,
    },


    selectedChips: {
      gap: 7,

      marginTop: 10,
    },


    chip: {
      minHeight: 38,

      paddingHorizontal: 10,

      paddingVertical: 7,

      borderRadius: 14,

      backgroundColor:
        "#EEE9FF",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,
    },


    chipOrder: {
      width: 24,

      height: 24,

      borderRadius: 8,

      backgroundColor:
        "#7B6EF6",

      color: "#FFFFFF",

      textAlign:
        "center",

      lineHeight: 24,

      fontSize: 12,

      fontWeight: "800",
    },


    chipText: {
      flex: 1,

      color: "#6D5CE7",

      fontSize: 12,

      fontWeight: "600",
    },


    actions: {
      flexDirection: "row",

      gap: 12,

      marginTop: 23,
    },


    cancelButton: {
      flex: 1,

      minHeight: 51,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        "#CBD5E1",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    cancelButtonText: {
      color: "#334155",

      fontWeight: "700",
    },


    startButton: {
      flex: 1,

      minHeight: 51,

      borderRadius: 14,

      backgroundColor:
        "#7B6EF6",

      flexDirection: "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 8,
    },


    startButtonText: {
      color: "#FFFFFF",

      fontWeight: "700",
    },


    disabledButton: {
      opacity: 0.55,
    },

  });