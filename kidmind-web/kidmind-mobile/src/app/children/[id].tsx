import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import {
  ArrowLeft,
  Gamepad2,
  Play,
  Trash2,
} from "lucide-react-native";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

import AIInsights from "@/components/childProfile/AIInsights";
import ChildInfoCard from "@/components/childProfile/ChildInfoCard";
import CognitiveScores from "@/components/childProfile/CognitiveScores";
import ProgressChart from "@/components/childProfile/ProgressChart";
import ReportsTable from "@/components/childProfile/ReportsTable";
import SessionsTimeline from "@/components/childProfile/SessionsTimeline";

import EditChildModal from "@/components/children/EditChildModal";

import StartSessionModal from "@/components/sessions/StartSessionModal";

import {
  getChildById,
} from "@/api/childrenApi";

import type {
  Child,
} from "@/api/childrenApi";

import {
  getGameBuilderAssignments,
  getGameBuilderGames,
  removeGameBuilderAssignment,
} from "@/api/gameBuilderApi";

import type {
  GameBuilderGame,
} from "@/api/gameBuilderApi";

import {
  createSession,
} from "@/api/sessionsApi";


type AssignedGameItem = {
  assignmentId: number;
  assignedAt?: string;
  game: GameBuilderGame;
};


export default function ChildProfile() {

  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();


  const childId =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;


  const numericChildId =
    Number(
      childId
    );


  const [
    sidebarVisible,
    setSidebarVisible,
  ] = useState(false);


  const [
    child,
    setChild,
  ] = useState<Child | null>(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    editModalOpen,
    setEditModalOpen,
  ] = useState(false);


  const [
    startSessionOpen,
    setStartSessionOpen,
  ] = useState(false);


  const [
    assignedGames,
    setAssignedGames,
  ] =
    useState<AssignedGameItem[]>(
      []
    );


  const [
    assignedGamesLoading,
    setAssignedGamesLoading,
  ] = useState(true);


  const [
    assignedGamesError,
    setAssignedGamesError,
  ] = useState("");


  const [
    startingGameId,
    setStartingGameId,
  ] = useState<number | null>(
    null
  );


  const [
    removingAssignmentId,
    setRemovingAssignmentId,
  ] = useState<number | null>(
    null
  );


  const loadChild =
    useCallback(
      async () => {

        if (
          !Number.isInteger(
            numericChildId
          ) ||
          numericChildId <= 0
        ) {

          setError(
            "Invalid child ID"
          );

          setLoading(false);

          return;

        }


        try {

          setLoading(true);

          setError("");


          const childData =
            await getChildById(
              numericChildId
            );


          setChild(
            childData
          );

        } catch (
          loadError
        ) {

          console.error(
            "Failed to load child:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load child information"
          );

        } finally {

          setLoading(false);

        }

      },
      [
        numericChildId,
      ]
    );


  const loadAssignedGames =
    useCallback(
      async () => {

        if (
          !Number.isInteger(
            numericChildId
          ) ||
          numericChildId <= 0
        ) {

          setAssignedGames(
            []
          );

          setAssignedGamesLoading(
            false
          );

          return;

        }


        try {

          setAssignedGamesLoading(
            true
          );

          setAssignedGamesError(
            ""
          );


          const games =
            await getGameBuilderGames();


          const safeGames =
            Array.isArray(
              games
            )
              ? games
              : [];


          const assignmentGroups =
            await Promise.all(
              safeGames.map(
                async (
                  game
                ) => {

                  try {

                    const assignments =
                      await getGameBuilderAssignments(
                        game.id
                      );


                    return {
                      game,

                      assignments:
                        Array.isArray(
                          assignments
                        )
                          ? assignments
                          : [],
                    };

                  } catch (
                    assignmentError
                  ) {

                    console.error(
                      `Failed to load assignments for game ${game.id}:`,
                      assignmentError
                    );


                    return {
                      game,
                      assignments: [],
                    };

                  }

                }
              )
            );


          const childGames:
            AssignedGameItem[] =
              assignmentGroups.flatMap(
                ({
                  game,
                  assignments,
                }) => {

                  return assignments
                    .filter(
                      (
                        assignment
                      ) =>
                        assignment.assignment_type ===
                          "child" &&
                        Number(
                          assignment.child_id
                        ) ===
                          numericChildId
                    )
                    .map(
                      (
                        assignment
                      ) => ({
                        assignmentId:
                          Number(
                            assignment.id
                          ),

                        assignedAt:
                          assignment.created_at,

                        game,
                      })
                    );

                }
              );


          setAssignedGames(
            childGames
          );

        } catch (
          loadError
        ) {

          console.error(
            "Failed to load assigned games:",
            loadError
          );


          setAssignedGamesError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load assigned games"
          );

        } finally {

          setAssignedGamesLoading(
            false
          );

        }

      },
      [
        numericChildId,
      ]
    );


  useEffect(
    () => {

      loadChild();

    },
    [
      loadChild,
    ]
  );


  useFocusEffect(
    useCallback(
      () => {

        loadAssignedGames();

      },
      [
        loadAssignedGames,
      ]
    )
  );


  const handlePlayAssignedGame =
    async (
      item: AssignedGameItem
    ) => {

      if (
        startingGameId !==
        null
      ) {
        return;
      }


      try {

        setStartingGameId(
          item.game.id
        );

        setAssignedGamesError(
          ""
        );


        const response =
          await createSession({
            child_id:
              numericChildId,

            games: [
              {
                game_name:
                  item.game.title,

                difficulty:
                  item.game.difficulty ||
                  null,

                custom_game_id:
                  Number(
                    item.game.id
                  ),
              },
            ],
          });


        const sessionId =
          Number(
            response?.session?.id
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


        router.push({
          pathname:
            "/sessions/[id]",

          params: {
            id:
              String(
                sessionId
              ),
          },
        });

      } catch (
        playError
      ) {

        console.error(
          "Failed to start assigned game:",
          playError
        );


        setAssignedGamesError(
          playError instanceof Error
            ? playError.message
            : "Failed to start assigned game"
        );

      } finally {

        setStartingGameId(
          null
        );

      }

    };


  const handleRemoveAssignedGame =
    (
      item: AssignedGameItem
    ) => {

      Alert.alert(
        "Remove Assigned Game",
        `Remove "${item.game.title}" from this child?`,
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

                  setRemovingAssignmentId(
                    item.assignmentId
                  );

                  setAssignedGamesError(
                    ""
                  );


                  await removeGameBuilderAssignment(
                    item.game.id,
                    item.assignmentId
                  );


                  setAssignedGames(
                    (
                      previous
                    ) =>
                      previous.filter(
                        (
                          gameItem
                        ) =>
                          gameItem.assignmentId !==
                          item.assignmentId
                      )
                  );

                } catch (
                  removeError
                ) {

                  console.error(
                    "Failed to remove assigned game:",
                    removeError
                  );


                  setAssignedGamesError(
                    removeError instanceof Error
                      ? removeError.message
                      : "Failed to remove assigned game"
                  );

                } finally {

                  setRemovingAssignmentId(
                    null
                  );

                }

              },
          },
        ]
      );

    };


  return (

    <View
      style={
        styles.container
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        <Navbar
          onMenuPress={() => {
            setSidebarVisible(
              true
            );
          }}
        />


        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() => {
            router.push(
              "/children"
            );
          }}
        >

          <ArrowLeft
            size={20}
            color="#7B6EF6"
          />

          <Text
            style={
              styles.backText
            }
          >
            Back to Children
          </Text>

        </TouchableOpacity>


        {loading && (

          <View
            style={
              styles.loadingBox
            }
          >

            <ActivityIndicator
              size="large"
              color="#7B6EF6"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading child information...
            </Text>

          </View>

        )}


        {!loading &&
          error && (

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
              Unable to load child
            </Text>

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>


            <TouchableOpacity
              style={
                styles.returnButton
              }
              onPress={() => {
                router.push(
                  "/children"
                );
              }}
            >

              <Text
                style={
                  styles.returnButtonText
                }
              >
                Return to Children
              </Text>

            </TouchableOpacity>

          </View>

        )}


        {!loading &&
          !error &&
          child && (

          <>

            <ChildInfoCard
              child={child}
              onEdit={() => {
                setEditModalOpen(
                  true
                );
              }}
            />


            <TouchableOpacity
              style={
                styles.startSessionButton
              }
              activeOpacity={0.85}
              onPress={() => {
                setStartSessionOpen(
                  true
                );
              }}
            >

              <View
                style={
                  styles.startSessionIcon
                }
              >

                <Play
                  size={21}
                  color="#FFFFFF"
                  fill="#FFFFFF"
                />

              </View>


              <View
                style={
                  styles.startSessionTextContainer
                }
              >

                <Text
                  style={
                    styles.startSessionTitle
                  }
                >
                  Start Assessment Session
                </Text>

                <Text
                  style={
                    styles.startSessionSubtitle
                  }
                >
                  Select one or more games
                  for {child.full_name}
                </Text>

              </View>

            </TouchableOpacity>


            <View
              style={
                styles.assignedGamesCard
              }
            >

              <View
                style={
                  styles.assignedGamesHeader
                }
              >

                <View
                  style={
                    styles.assignedGamesHeaderIcon
                  }
                >

                  <Gamepad2
                    size={22}
                    color="#7B6EF6"
                  />

                </View>


                <View
                  style={
                    styles.assignedGamesHeaderText
                  }
                >

                  <Text
                    style={
                      styles.assignedGamesTitle
                    }
                  >
                    Assigned Games
                  </Text>

                  <Text
                    style={
                      styles.assignedGamesSubtitle
                    }
                  >
                    Games assigned directly to {child.full_name}
                  </Text>

                </View>

              </View>


              {assignedGamesLoading && (

                <View
                  style={
                    styles.assignedGamesLoading
                  }
                >

                  <ActivityIndicator
                    size="small"
                    color="#7B6EF6"
                  />

                  <Text
                    style={
                      styles.assignedGamesLoadingText
                    }
                  >
                    Loading assigned games...
                  </Text>

                </View>

              )}


              {!assignedGamesLoading &&
                assignedGamesError !== "" && (

                <View
                  style={
                    styles.assignedGamesError
                  }
                >

                  <Text
                    style={
                      styles.assignedGamesErrorText
                    }
                  >
                    {assignedGamesError}
                  </Text>


                  <TouchableOpacity
                    style={
                      styles.assignedGamesRetry
                    }
                    onPress={
                      loadAssignedGames
                    }
                  >

                    <Text
                      style={
                        styles.assignedGamesRetryText
                      }
                    >
                      Try Again
                    </Text>

                  </TouchableOpacity>

                </View>

              )}


              {!assignedGamesLoading &&
                !assignedGamesError &&
                assignedGames.length === 0 && (

                <View
                  style={
                    styles.assignedGamesEmpty
                  }
                >

                  <View
                    style={
                      styles.assignedGamesEmptyIcon
                    }
                  >

                    <Gamepad2
                      size={28}
                      color="#A59AF8"
                    />

                  </View>

                  <Text
                    style={
                      styles.assignedGamesEmptyTitle
                    }
                  >
                    No assigned games
                  </Text>

                  <Text
                    style={
                      styles.assignedGamesEmptyText
                    }
                  >
                    Games assigned directly to this child will appear here.
                  </Text>

                </View>

              )}


              {!assignedGamesLoading &&
                assignedGames.length >
                  0 && (

                <View
                  style={
                    styles.assignedGamesList
                  }
                >

                  {assignedGames.map(
                    (
                      item
                    ) => {

                      const starting =
                        startingGameId ===
                        item.game.id;


                      const removing =
                        removingAssignmentId ===
                        item.assignmentId;


                      return (

                        <View
                          key={
                            item.assignmentId
                          }
                          style={
                            styles.assignedGameItem
                          }
                        >

                          <View
                            style={
                              styles.assignedGameTop
                            }
                          >

                            <View
                              style={
                                styles.assignedGameIcon
                              }
                            >

                              <Gamepad2
                                size={21}
                                color="#7B6EF6"
                              />

                            </View>


                            <View
                              style={
                                styles.assignedGameInfo
                              }
                            >

                              <Text
                                style={
                                  styles.assignedGameName
                                }
                                numberOfLines={2}
                              >
                                {item.game.title}
                              </Text>


                              <View
                                style={
                                  styles.assignedGameMeta
                                }
                              >

                                <View
                                  style={
                                    styles.difficultyBadge
                                  }
                                >

                                  <Text
                                    style={
                                      styles.difficultyText
                                    }
                                  >
                                    {item.game.difficulty ||
                                      "Easy"}
                                  </Text>

                                </View>


                                {!!item.game.domain && (

                                  <Text
                                    style={
                                      styles.domainText
                                    }
                                  >
                                    {item.game.domain}
                                  </Text>

                                )}

                              </View>

                            </View>

                          </View>


                          {!!item.game.description && (

                            <Text
                              style={
                                styles.assignedGameDescription
                              }
                              numberOfLines={3}
                            >
                              {item.game.description}
                            </Text>

                          )}


                          <View
                            style={
                              styles.assignedGameActions
                            }
                          >

                            <TouchableOpacity
                              style={[
                                styles.playAssignedButton,

                                starting &&
                                  styles.disabledButton,
                              ]}
                              activeOpacity={0.85}
                              disabled={
                                starting ||
                                removing
                              }
                              onPress={() => {
                                void handlePlayAssignedGame(
                                  item
                                );
                              }}
                            >

                              {starting ? (

                                <ActivityIndicator
                                  size="small"
                                  color="#FFFFFF"
                                />

                              ) : (

                                <>

                                  <Play
                                    size={17}
                                    color="#FFFFFF"
                                    fill="#FFFFFF"
                                  />

                                  <Text
                                    style={
                                      styles.playAssignedButtonText
                                    }
                                  >
                                    Play Game
                                  </Text>

                                </>

                              )}

                            </TouchableOpacity>


                            <TouchableOpacity
                              style={[
                                styles.removeAssignedButton,

                                removing &&
                                  styles.disabledButton,
                              ]}
                              activeOpacity={0.85}
                              disabled={
                                removing ||
                                starting
                              }
                              onPress={() => {
                                handleRemoveAssignedGame(
                                  item
                                );
                              }}
                            >

                              {removing ? (

                                <ActivityIndicator
                                  size="small"
                                  color="#DC2626"
                                />

                              ) : (

                                <Trash2
                                  size={18}
                                  color="#DC2626"
                                />

                              )}

                            </TouchableOpacity>

                          </View>

                        </View>

                      );

                    }
                  )}

                </View>

              )}

            </View>


            <CognitiveScores />

            <AIInsights />

            <ProgressChart />

            <SessionsTimeline />

            <ReportsTable />

          </>

        )}

      </ScrollView>


      {editModalOpen &&
        child && (

        <EditChildModal
          child={child}
          close={() => {
            setEditModalOpen(
              false
            );
          }}
          onSuccess={
            loadChild
          }
        />

      )}


      {startSessionOpen &&
        child && (

        <StartSessionModal
          visible={
            startSessionOpen
          }
          child={child}
          onClose={() => {
            setStartSessionOpen(
              false
            );
          }}
          onStarted={(
            sessionId
          ) => {

            setStartSessionOpen(
              false
            );


            router.push({
              pathname:
                "/sessions/[id]",

              params: {
                id: String(
                  sessionId
                ),
              },
            });

          }}
        />

      )}


      <Sidebar
        visible={
          sidebarVisible
        }
        onClose={() => {
          setSidebarVisible(
            false
          );
        }}
      />

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {
      flex: 1,

      backgroundColor:
        "#F7F8FC",
    },


    content: {
      padding: 20,

      paddingBottom: 40,

      gap: 20,
    },


    backButton: {
      flexDirection: "row",

      alignItems: "center",

      gap: 8,

      marginTop: 25,
    },


    backText: {
      color: "#7B6EF6",

      fontWeight: "600",
    },


    loadingBox: {
      minHeight: 350,

      justifyContent:
        "center",

      alignItems:
        "center",

      gap: 14,
    },


    loadingText: {
      color: "#64748B",
    },


    errorBox: {
      marginTop: 20,

      padding: 22,

      borderRadius: 18,

      backgroundColor:
        "#FEF2F2",

      borderWidth: 1,

      borderColor:
        "#FECACA",
    },


    errorTitle: {
      color: "#B91C1C",

      fontSize: 18,

      fontWeight: "700",
    },


    errorText: {
      color: "#B91C1C",

      marginTop: 8,
    },


    returnButton: {
      marginTop: 18,

      alignSelf:
        "flex-start",

      backgroundColor:
        "#DC2626",

      paddingHorizontal: 18,

      paddingVertical: 11,

      borderRadius: 10,
    },


    returnButtonText: {
      color: "#FFFFFF",

      fontWeight: "600",
    },


    startSessionButton: {
      minHeight: 84,

      padding: 16,

      borderRadius: 20,

      backgroundColor:
        "#7B6EF6",

      flexDirection: "row",

      alignItems: "center",

      gap: 14,

      shadowColor: "#7B6EF6",

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.2,

      shadowRadius: 8,

      elevation: 4,
    },


    startSessionIcon: {
      width: 48,

      height: 48,

      borderRadius: 16,

      backgroundColor:
        "rgba(255, 255, 255, 0.18)",

      alignItems: "center",

      justifyContent:
        "center",
    },


    startSessionTextContainer: {
      flex: 1,
    },


    startSessionTitle: {
      color: "#FFFFFF",

      fontSize: 17,

      fontWeight: "800",
    },


    startSessionSubtitle: {
      color: "#EDE9FE",

      lineHeight: 19,

      marginTop: 4,
    },


    assignedGamesCard: {
      padding: 17,

      borderRadius: 22,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#E8E4FF",
    },


    assignedGamesHeader: {
      flexDirection: "row",

      alignItems: "center",

      gap: 12,
    },


    assignedGamesHeaderIcon: {
      width: 46,

      height: 46,

      borderRadius: 15,

      backgroundColor:
        "#F0EDFF",

      alignItems: "center",

      justifyContent:
        "center",
    },


    assignedGamesHeaderText: {
      flex: 1,
    },


    assignedGamesTitle: {
      fontSize: 18,

      fontWeight: "800",

      color: "#1E293B",
    },


    assignedGamesSubtitle: {
      marginTop: 3,

      fontSize: 12,

      lineHeight: 17,

      color: "#94A3B8",
    },


    assignedGamesLoading: {
      minHeight: 120,

      alignItems: "center",

      justifyContent:
        "center",

      gap: 10,
    },


    assignedGamesLoadingText: {
      color: "#64748B",

      fontSize: 13,
    },


    assignedGamesError: {
      marginTop: 16,

      padding: 14,

      borderRadius: 14,

      backgroundColor:
        "#FEF2F2",

      borderWidth: 1,

      borderColor:
        "#FECACA",
    },


    assignedGamesErrorText: {
      color: "#B91C1C",

      fontSize: 13,
    },


    assignedGamesRetry: {
      marginTop: 10,

      alignSelf:
        "flex-start",

      backgroundColor:
        "#7B6EF6",

      paddingHorizontal: 14,

      paddingVertical: 8,

      borderRadius: 9,
    },


    assignedGamesRetryText: {
      color: "#FFFFFF",

      fontWeight: "700",

      fontSize: 12,
    },


    assignedGamesEmpty: {
      marginTop: 16,

      minHeight: 150,

      borderRadius: 17,

      backgroundColor:
        "#F9F8FF",

      alignItems: "center",

      justifyContent:
        "center",

      padding: 18,
    },


    assignedGamesEmptyIcon: {
      width: 54,

      height: 54,

      borderRadius: 18,

      backgroundColor:
        "#EEE9FF",

      alignItems: "center",

      justifyContent:
        "center",
    },


    assignedGamesEmptyTitle: {
      marginTop: 11,

      color: "#334155",

      fontSize: 15,

      fontWeight: "800",
    },


    assignedGamesEmptyText: {
      marginTop: 5,

      color: "#94A3B8",

      textAlign: "center",

      lineHeight: 18,

      fontSize: 12,
    },


    assignedGamesList: {
      marginTop: 16,

      gap: 12,
    },


    assignedGameItem: {
      padding: 14,

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        "#EDE9FE",

      backgroundColor:
        "#FCFBFF",
    },


    assignedGameTop: {
      flexDirection: "row",

      alignItems: "center",

      gap: 11,
    },


    assignedGameIcon: {
      width: 43,

      height: 43,

      borderRadius: 14,

      backgroundColor:
        "#EEE9FF",

      alignItems: "center",

      justifyContent:
        "center",
    },


    assignedGameInfo: {
      flex: 1,
    },


    assignedGameName: {
      color: "#1E293B",

      fontSize: 15,

      fontWeight: "800",
    },


    assignedGameMeta: {
      marginTop: 6,

      flexDirection: "row",

      alignItems: "center",

      gap: 8,
    },


    difficultyBadge: {
      paddingHorizontal: 9,

      paddingVertical: 4,

      borderRadius: 999,

      backgroundColor:
        "#EEE9FF",
    },


    difficultyText: {
      color: "#6D5CE7",

      fontSize: 10,

      fontWeight: "700",
    },


    domainText: {
      color: "#94A3B8",

      fontSize: 11,
    },


    assignedGameDescription: {
      marginTop: 11,

      color: "#64748B",

      fontSize: 12,

      lineHeight: 18,
    },


    assignedGameActions: {
      marginTop: 14,

      flexDirection: "row",

      gap: 9,
    },


    playAssignedButton: {
      flex: 1,

      minHeight: 45,

      borderRadius: 13,

      backgroundColor:
        "#7B6EF6",

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap: 7,
    },


    playAssignedButtonText: {
      color: "#FFFFFF",

      fontSize: 13,

      fontWeight: "800",
    },


    removeAssignedButton: {
      width: 48,

      minHeight: 45,

      borderRadius: 13,

      backgroundColor:
        "#FEF2F2",

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        "#FECACA",
    },


    disabledButton: {
      opacity: 0.5,
    },

  });