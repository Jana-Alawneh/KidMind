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
  SafeAreaView,
} from "react-native-safe-area-context";

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
    Array.isArray(
      params.id
    )
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

          setLoading(
            false
          );

          return;

        }


        try {

          setLoading(
            true
          );

          setError(
            ""
          );


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

          setLoading(
            false
          );

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

    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        "top",
        "bottom",
      ]}
    >

      <View
        style={
          styles.container
        }
      >

        <Navbar
          onMenuPress={() => {
            setSidebarVisible(
              true
            );
          }}
        />


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
              styles.pageHeading
            }
          >

            <Text
              style={
                styles.eyebrow
              }
            >
              CHILD PROFILE
            </Text>


            <Text
              style={
                styles.pageTitle
              }
              numberOfLines={
                1
              }
            >
              {child?.full_name ||
                "Child Profile"}
            </Text>


            <Text
              style={
                styles.pageSubtitle
              }
            >
              Review assessments, progress, sessions and assigned games.
            </Text>

          </View>


          <TouchableOpacity
            style={
              styles.backButton
            }
            activeOpacity={
              0.75
            }
            onPress={() => {

              router.push(
                "/children"
              );

            }}
          >

            <ArrowLeft
              size={15}
              color="#7566EB"
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
                size="small"
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
                child={
                  child
                }
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
                activeOpacity={
                  0.85
                }
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
                    size={18}
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
                    numberOfLines={
                      2
                    }
                  >
                    Select one or more games for {child.full_name}
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
                      size={18}
                      color="#7566EB"
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
                      numberOfLines={
                        2
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
                  assignedGamesError !==
                    "" && (

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
                  assignedGames.length ===
                    0 && (

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
                        size={24}
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
                                  size={17}
                                  color="#7566EB"
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
                                  numberOfLines={
                                    2
                                  }
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
                                      numberOfLines={
                                        1
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
                                numberOfLines={
                                  3
                                }
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
                                activeOpacity={
                                  0.85
                                }
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
                                      size={15}
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
                                activeOpacity={
                                  0.85
                                }
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
                                    color="#C95166"
                                  />

                                ) : (

                                  <Trash2
                                    size={16}
                                    color="#C95166"
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
            child={
              child
            }
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
            child={
              child
            }
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
                  id:
                    String(
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

    </SafeAreaView>

  );

}


const styles =
  StyleSheet.create({

    safeArea: {

      flex: 1,

      backgroundColor:
        "#FFFFFF",

    },


    container: {

      flex: 1,

      backgroundColor:
        "#F7F8FC",

    },


    content: {

      paddingHorizontal:
        18,

      paddingTop:
        20,

      paddingBottom:
        38,

      gap:
        18,

    },


    pageHeading: {

      paddingHorizontal:
        1,

    },


    eyebrow: {

      color:
        "#8172EA",

      fontSize:
        9,

      fontWeight:
        "800",

      letterSpacing:
        1,

    },


    pageTitle: {

      marginTop:
        5,

      color:
        "#303253",

      fontSize:
        25,

      lineHeight:
        31,

      fontWeight:
        "800",

    },


    pageSubtitle: {

      marginTop:
        4,

      color:
        "#9699AC",

      fontSize:
        10.5,

      lineHeight:
        16,

    },


    backButton: {

      alignSelf:
        "flex-start",

      minHeight:
        40,

      paddingHorizontal:
        11,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        6,

      borderRadius:
        11,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E7E7F0",

    },


    backText: {

      color:
        "#7566EB",

      fontSize:
        10,

      fontWeight:
        "700",

    },


    loadingBox: {

      minHeight:
        330,

      borderRadius:
        21,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

      justifyContent:
        "center",

      alignItems:
        "center",

      gap:
        10,

    },


    loadingText: {

      color:
        "#A0A3B4",

      fontSize:
        10.5,

    },


    errorBox: {

      padding:
        17,

      borderRadius:
        17,

      backgroundColor:
        "#FFF0F3",

      borderWidth:
        1,

      borderColor:
        "#F6D8DF",

    },


    errorTitle: {

      color:
        "#B9415E",

      fontSize:
        13,

      fontWeight:
        "700",

    },


    errorText: {

      marginTop:
        6,

      color:
        "#C55A70",

      fontSize:
        10.5,

      lineHeight:
        16,

    },


    returnButton: {

      minHeight:
        40,

      marginTop:
        14,

      paddingHorizontal:
        13,

      alignSelf:
        "flex-start",

      justifyContent:
        "center",

      borderRadius:
        11,

      backgroundColor:
        "#C95166",

    },


    returnButtonText: {

      color:
        "#FFFFFF",

      fontSize:
        10,

      fontWeight:
        "700",

    },


    startSessionButton: {

      minHeight:
        78,

      padding:
        14,

      borderRadius:
        19,

      backgroundColor:
        "#7969EA",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        12,

      shadowColor:
        "#7969EA",

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity:
        0.16,

      shadowRadius:
        9,

      elevation:
        3,

    },


    startSessionIcon: {

      width:
        43,

      height:
        43,

      flexShrink:
        0,

      borderRadius:
        13,

      backgroundColor:
        "rgba(255,255,255,0.17)",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    startSessionTextContainer: {

      flex: 1,

      minWidth:
        0,

    },


    startSessionTitle: {

      color:
        "#FFFFFF",

      fontSize:
        13,

      fontWeight:
        "800",

    },


    startSessionSubtitle: {

      marginTop:
        4,

      color:
        "#EDE9FE",

      fontSize:
        9.5,

      lineHeight:
        14,

    },


    assignedGamesCard: {

      padding:
        17,

      borderRadius:
        21,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

      shadowColor:
        "#44446E",

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity:
        0.035,

      shadowRadius:
        12,

      elevation:
        2,

    },


    assignedGamesHeader: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

      paddingBottom:
        14,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#F0F0F5",

    },


    assignedGamesHeaderIcon: {

      width:
        39,

      height:
        39,

      flexShrink:
        0,

      borderRadius:
        12,

      backgroundColor:
        "#F0EDFF",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    assignedGamesHeaderText: {

      flex:
        1,

      minWidth:
        0,

    },


    assignedGamesTitle: {

      color:
        "#333554",

      fontSize:
        15,

      fontWeight:
        "700",

    },


    assignedGamesSubtitle: {

      marginTop:
        3,

      color:
        "#A0A3B4",

      fontSize:
        9.5,

      lineHeight:
        14,

    },


    assignedGamesLoading: {

      minHeight:
        120,

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        8,

    },


    assignedGamesLoadingText: {

      color:
        "#A0A3B4",

      fontSize:
        10,

    },


    assignedGamesError: {

      marginTop:
        14,

      padding:
        13,

      borderRadius:
        13,

      backgroundColor:
        "#FFF0F3",

      borderWidth:
        1,

      borderColor:
        "#F6D8DF",

    },


    assignedGamesErrorText: {

      color:
        "#B9415E",

      fontSize:
        10,

      lineHeight:
        15,

    },


    assignedGamesRetry: {

      minHeight:
        36,

      marginTop:
        9,

      paddingHorizontal:
        12,

      alignSelf:
        "flex-start",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,

      backgroundColor:
        "#7969EA",

    },


    assignedGamesRetryText: {

      color:
        "#FFFFFF",

      fontSize:
        9.5,

      fontWeight:
        "700",

    },


    assignedGamesEmpty: {

      minHeight:
        145,

      marginTop:
        14,

      padding:
        16,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        15,

      backgroundColor:
        "#FBFAFE",

      borderWidth:
        1,

      borderColor:
        "#EFEAFD",

    },


    assignedGamesEmptyIcon: {

      width:
        48,

      height:
        48,

      borderRadius:
        15,

      backgroundColor:
        "#F0EDFF",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    assignedGamesEmptyTitle: {

      marginTop:
        10,

      color:
        "#55586B",

      fontSize:
        12,

      fontWeight:
        "700",

    },


    assignedGamesEmptyText: {

      marginTop:
        5,

      color:
        "#A0A3B4",

      textAlign:
        "center",

      lineHeight:
        15,

      fontSize:
        9.5,

    },


    assignedGamesList: {

      marginTop:
        13,

      gap:
        10,

    },


    assignedGameItem: {

      padding:
        13,

      borderRadius:
        15,

      borderWidth:
        1,

      borderColor:
        "#EFEFF5",

      backgroundColor:
        "#FCFCFE",

    },


    assignedGameTop: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

    },


    assignedGameIcon: {

      width:
        39,

      height:
        39,

      flexShrink:
        0,

      borderRadius:
        12,

      backgroundColor:
        "#F0EDFF",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    assignedGameInfo: {

      flex:
        1,

      minWidth:
        0,

    },


    assignedGameName: {

      color:
        "#454762",

      fontSize:
        11.5,

      lineHeight:
        16,

      fontWeight:
        "700",

    },


    assignedGameMeta: {

      marginTop:
        5,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        7,

    },


    difficultyBadge: {

      paddingHorizontal:
        8,

      paddingVertical:
        4,

      borderRadius:
        999,

      backgroundColor:
        "#F3F0FF",

    },


    difficultyText: {

      color:
        "#7566EB",

      fontSize:
        8,

      fontWeight:
        "700",

    },


    domainText: {

      flex:
        1,

      color:
        "#A0A3B4",

      fontSize:
        8.5,

    },


    assignedGameDescription: {

      marginTop:
        10,

      color:
        "#8E91A4",

      fontSize:
        9.5,

      lineHeight:
        15,

    },


    assignedGameActions: {

      marginTop:
        12,

      flexDirection:
        "row",

      gap:
        8,

    },


    playAssignedButton: {

      flex:
        1,

      minHeight:
        44,

      borderRadius:
        12,

      backgroundColor:
        "#7969EA",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        6,

    },


    playAssignedButtonText: {

      color:
        "#FFFFFF",

      fontSize:
        10,

      fontWeight:
        "700",

    },


    removeAssignedButton: {

      width:
        44,

      minHeight:
        44,

      borderRadius:
        12,

      backgroundColor:
        "#FFF4F6",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#F6DDE2",

    },


    disabledButton: {

      opacity:
        0.5,

    },

  });