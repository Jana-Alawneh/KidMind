import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCallback,
  useState,
} from "react";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  Brain,
  Edit3,
  Gamepad2,
  Plus,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react-native";

import {
  deleteGameBuilderGame,
  getGameBuilderGames,
  type GameBuilderGame,
} from "@/api/gameBuilderApi";

import {
  getCurrentUser,
} from "@/api/authApi";


const getErrorMessage = (
  error: any,
  fallback: string
) => {
  return (
    error?.message ||
    fallback
  );
};


const getDifficultyColor = (
  difficulty?: string | null
) => {
  const value =
    String(
      difficulty || ""
    ).toLowerCase();

  if (
    value === "hard"
  ) {
    return {
      background:
        "#FDECEC",
      text:
        "#D95757",
    };
  }

  if (
    value === "medium"
  ) {
    return {
      background:
        "#FFF3DC",
      text:
        "#C98222",
    };
  }

  return {
    background:
      "#E9F8EE",
    text:
      "#39A461",
  };
};


const getStatusColor = (
  status?: string | null
) => {
  const value =
    String(
      status || ""
    ).toLowerCase();

  if (
    value === "published"
  ) {
    return {
      background:
        "#E8F8EF",
      text:
        "#2F9B5C",
    };
  }

  return {
    background:
      "#F0EEFF",
    text:
      "#7867D9",
  };
};


export default function Games() {

  const [
    games,
    setGames,
  ] =
    useState<
      GameBuilderGame[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<
      number | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState("");

  const currentUser =
    getCurrentUser();

  const isTherapist =
    currentUser?.role ===
    "therapist";


  const loadGames =
    useCallback(
      async (
        refresh = false
      ) => {

        if (
          !isTherapist
        ) {
          setGames([]);
          setLoading(false);
          setRefreshing(
            false
          );
          return;
        }

        try {

          if (
            refresh
          ) {
            setRefreshing(
              true
            );
          } else {
            setLoading(
              true
            );
          }

          setError("");

          const result =
            await getGameBuilderGames();

          setGames(
            Array.isArray(
              result
            )
              ? result
              : []
          );

        } catch (
          loadError
        ) {

          console.error(
            "Failed to load games:",
            loadError
          );

          setError(
            getErrorMessage(
              loadError,
              "Failed to load games."
            )
          );

        } finally {

          setLoading(
            false
          );

          setRefreshing(
            false
          );

        }

      },
      [
        isTherapist,
      ]
    );


  useFocusEffect(
    useCallback(
      () => {

        loadGames();

      },
      [
        loadGames,
      ]
    )
  );


  const handleCreate =
    () => {

      router.push(
        "/game-builder" as any
      );

    };


  const handleEdit =
    (
      game:
        GameBuilderGame
    ) => {

      router.push(
        {
          pathname:
            "/game-builder" as any,
          params: {
            gameId:
              String(
                game.id
              ),
          },
        }
      );

    };


  const handleAssign =
    (
      game:
        GameBuilderGame
    ) => {

      router.push(
        {
          pathname:
            "/game-builder" as any,
          params: {
            gameId:
              String(
                game.id
              ),
            openAssignment:
              "1",
          },
        }
      );

    };


  const confirmDelete =
    (
      game:
        GameBuilderGame
    ) => {

      Alert.alert(
        "Delete Game",
        `Delete "${game.title}"?`,
        [
          {
            text:
              "Cancel",
            style:
              "cancel",
          },
          {
            text:
              "Delete",
            style:
              "destructive",
            onPress:
              () =>
                handleDelete(
                  game
                ),
          },
        ]
      );

    };


  const handleDelete =
    async (
      game:
        GameBuilderGame
    ) => {

      try {

        setDeletingId(
          game.id
        );

        setError("");

        await deleteGameBuilderGame(
          game.id
        );

        setGames(
          previous =>
            previous.filter(
              item =>
                item.id !==
                game.id
            )
        );

      } catch (
        deleteError
      ) {

        console.error(
          "Failed to delete game:",
          deleteError
        );

        Alert.alert(
          "Delete Failed",
          getErrorMessage(
            deleteError,
            "Could not delete this game."
          )
        );

      } finally {

        setDeletingId(
          null
        );

      }

    };


  if (
    !isTherapist
  ) {

    return (
  <SafeAreaView
    style={
      styles.centerPage
    }
    edges={[
      "top",
      "bottom",
    ]}
  >

        <View
          style={
            styles.lockedIcon
          }
        >
          <Gamepad2
            size={32}
            color="#7867D9"
          />
        </View>

        <Text
          style={
            styles.emptyTitle
          }
        >
          Therapist Games
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          Game Builder is available to therapist accounts.
        </Text>

     </SafeAreaView>
    );

  }


  return (
  <SafeAreaView
    style={
      styles.page
    }
    edges={[
      "top",
    ]}
  >

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              loadGames(
                true
              )
            }
            tintColor="#7867D9"
          />
        }
      >

        <View
          style={
            styles.header
          }
        >

          <View
            style={
              styles.headerTextWrap
            }
          >

            <View
              style={
                styles.headerIcon
              }
            >
              <Gamepad2
                size={28}
                color="#7867D9"
              />
            </View>

            <View
              style={
                styles.headerCopy
              }
            >

              <Text
                style={
                  styles.title
                }
              >
                Cognitive Games
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Create and manage children's assessment games
              </Text>

            </View>

          </View>


          <Pressable
            onPress={
              handleCreate
            }
            style={({ pressed }) => [
              styles.createButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >

            <Plus
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.createButtonText
              }
            >
              Create Game
            </Text>

          </Pressable>

        </View>


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

            <Pressable
              onPress={() =>
                loadGames()
              }
              style={
                styles.retryButton
              }
            >

              <RefreshCw
                size={16}
                color="#C84F4F"
              />

              <Text
                style={
                  styles.retryText
                }
              >
                Retry
              </Text>

            </Pressable>

          </View>
        ) : null}


        {loading ? (

          <View
            style={
              styles.loadingBox
            }
          >

            <ActivityIndicator
              size="large"
              color="#7867D9"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading games...
            </Text>

          </View>

        ) : games.length ===
          0 ? (

          <View
            style={
              styles.emptyCard
            }
          >

            <View
              style={
                styles.emptyIcon
              }
            >
              <Brain
                size={34}
                color="#9387E8"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No custom games yet
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Create your first therapeutic assessment game.
            </Text>

            <Pressable
              onPress={
                handleCreate
              }
              style={({ pressed }) => [
                styles.emptyCreateButton,
                pressed &&
                  styles.buttonPressed,
              ]}
            >

              <Plus
                size={18}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.createButtonText
                }
              >
                Create Game
              </Text>

            </Pressable>

          </View>

        ) : (

          <View
            style={
              styles.gamesList
            }
          >

            {games.map(
              game => {

                const difficulty =
                  getDifficultyColor(
                    game.difficulty
                  );

                const status =
                  getStatusColor(
                    game.status
                  );

                const deleting =
                  deletingId ===
                  game.id;

                return (
                  <View
                    key={
                      game.id
                    }
                    style={
                      styles.gameCard
                    }
                  >

                    <View
                      style={
                        styles.cardTop
                      }
                    >

                      <View
                        style={
                          styles.gameIcon
                        }
                      >
                        <Brain
                          size={26}
                          color="#7867D9"
                        />
                      </View>

                      <View
                        style={
                          styles.badges
                        }
                      >

                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor:
                                status.background,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color:
                                  status.text,
                              },
                            ]}
                          >
                            {
                              game.status ||
                              "draft"
                            }
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor:
                                difficulty.background,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color:
                                  difficulty.text,
                              },
                            ]}
                          >
                            {
                              game.difficulty ||
                              "Easy"
                            }
                          </Text>
                        </View>

                      </View>

                    </View>


                    <Text
                      style={
                        styles.gameTitle
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {
                        game.title
                      }
                    </Text>


                    <Text
                      style={
                        styles.domain
                      }
                      numberOfLines={
                        1
                      }
                    >
                      {
                        game.domain ||
                        "Custom Cognitive Assessment"
                      }
                    </Text>


                    <Text
                      style={
                        styles.description
                      }
                      numberOfLines={
                        3
                      }
                    >
                      {
                        game.description ||
                        "Therapeutic custom game"
                      }
                    </Text>


                    <View
                      style={
                        styles.statsRow
                      }
                    >

                      <View
                        style={
                          styles.stat
                        }
                      >
                        <Text
                          style={
                            styles.statValue
                          }
                        >
                          {
                            Array.isArray(
                              game.objects
                            )
                              ? game.objects
                                  .length
                              : 0
                          }
                        </Text>

                        <Text
                          style={
                            styles.statLabel
                          }
                        >
                          Objects
                        </Text>
                      </View>

                      <View
                        style={
                          styles.statDivider
                        }
                      />

                      <View
                        style={
                          styles.stat
                        }
                      >
                        <Text
                          style={
                            styles.statValue
                          }
                        >
                          {
                            Array.isArray(
                              game.rules
                            )
                              ? game.rules
                                  .length
                              : 0
                          }
                        </Text>

                        <Text
                          style={
                            styles.statLabel
                          }
                        >
                          Rules
                        </Text>
                      </View>

                    </View>


                    <View
                      style={
                        styles.actions
                      }
                    >

                      <Pressable
                        onPress={() =>
                          handleEdit(
                            game
                          )
                        }
                        style={({ pressed }) => [
                          styles.actionButton,
                          styles.editButton,
                          pressed &&
                            styles.buttonPressed,
                        ]}
                      >

                        <Edit3
                          size={17}
                          color="#7867D9"
                        />

                        <Text
                          style={
                            styles.editText
                          }
                        >
                          Edit
                        </Text>

                      </Pressable>


                      <Pressable
                        onPress={() =>
                          handleAssign(
                            game
                          )
                        }
                        style={({ pressed }) => [
                          styles.actionButton,
                          styles.assignButton,
                          pressed &&
                            styles.buttonPressed,
                        ]}
                      >

                        <Send
                          size={17}
                          color="#FFFFFF"
                        />

                        <Text
                          style={
                            styles.assignText
                          }
                        >
                          Assign
                        </Text>

                      </Pressable>


                      <Pressable
                        disabled={
                          deleting
                        }
                        onPress={() =>
                          confirmDelete(
                            game
                          )
                        }
                        style={({ pressed }) => [
                          styles.deleteButton,
                          pressed &&
                            styles.buttonPressed,
                          deleting &&
                            styles.disabledButton,
                        ]}
                      >

                        {
                          deleting
                            ? (
                              <ActivityIndicator
                                size="small"
                                color="#D95757"
                              />
                            )
                            : (
                              <Trash2
                                size={18}
                                color="#D95757"
                              />
                            )
                        }

                      </Pressable>

                    </View>

                  </View>
                );

              }
            )}

          </View>

        )}

      </ScrollView>

   </SafeAreaView>
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
        18,
      paddingTop:
        18,
      paddingBottom:
        40,
    },

    centerPage: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal:
        30,
    },

    lockedIcon: {
      width: 66,
      height: 66,
      borderRadius:
        22,
      backgroundColor:
        "#EEE9FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom:
        16,
    },

    header: {
      marginBottom:
        24,
    },

    headerTextWrap: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    headerCopy: {
      flex: 1,
      marginLeft:
        12,
    },

    headerIcon: {
      width: 56,
      height: 56,
      borderRadius:
        18,
      backgroundColor:
        "#EEE9FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    title: {
      fontSize: 25,
      lineHeight: 31,
      fontWeight:
        "800",
      color:
        "#24243B",
    },

    subtitle: {
      marginTop: 3,
      fontSize: 13,
      lineHeight: 19,
      color:
        "#86889B",
    },

    createButton: {
      height: 48,
      marginTop: 18,
      borderRadius:
        15,
      backgroundColor:
        "#7867D9",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },

    createButtonText: {
      color:
        "#FFFFFF",
      fontSize: 14,
      fontWeight:
        "700",
    },

    buttonPressed: {
      opacity: 0.78,
    },

    errorBox: {
      padding: 14,
      borderRadius:
        14,
      backgroundColor:
        "#FFF0F0",
      borderWidth: 1,
      borderColor:
        "#F4CCCC",
      marginBottom:
        18,
    },

    errorText: {
      color:
        "#B84B4B",
      fontSize: 13,
      lineHeight: 19,
    },

    retryButton: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
      marginTop: 10,
      alignSelf:
        "flex-start",
    },

    retryText: {
      color:
        "#C84F4F",
      fontSize: 13,
      fontWeight:
        "700",
    },

    loadingBox: {
      minHeight: 250,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,
      color:
        "#9294A6",
      fontSize: 14,
    },

    emptyCard: {
      minHeight: 300,
      backgroundColor:
        "#FFFFFF",
      borderRadius:
        24,
      borderWidth: 1,
      borderColor:
        "#E9E9F1",
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 28,
    },

    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius:
        24,
      backgroundColor:
        "#F1EDFF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom:
        18,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight:
        "800",
      color:
        "#303047",
      textAlign:
        "center",
    },

    emptyText: {
      marginTop: 8,
      color:
        "#9698A9",
      fontSize: 13,
      lineHeight: 20,
      textAlign:
        "center",
    },

    emptyCreateButton: {
      minWidth: 160,
      height: 46,
      marginTop: 20,
      borderRadius:
        14,
      backgroundColor:
        "#7867D9",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
      paddingHorizontal:
        18,
    },

    gamesList: {
      gap: 16,
    },

    gameCard: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9E9F1",
      borderRadius:
        22,
      padding: 18,
    },

    cardTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    gameIcon: {
      width: 50,
      height: 50,
      borderRadius:
        16,
      backgroundColor:
        "#EEE9FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    badges: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 7,
    },

    badge: {
      paddingHorizontal:
        10,
      paddingVertical:
        6,
      borderRadius:
        20,
    },

    badgeText: {
      fontSize: 11,
      fontWeight:
        "700",
      textTransform:
        "capitalize",
    },

    gameTitle: {
      marginTop: 16,
      fontSize: 19,
      lineHeight: 25,
      fontWeight:
        "800",
      color:
        "#29293F",
    },

    domain: {
      marginTop: 5,
      color:
        "#7867D9",
      fontSize: 12,
      fontWeight:
        "700",
    },

    description: {
      marginTop: 10,
      color:
        "#85879A",
      fontSize: 13,
      lineHeight: 19,
      minHeight: 38,
    },

    statsRow: {
      flexDirection:
        "row",
      backgroundColor:
        "#F8F8FC",
      borderRadius:
        14,
      marginTop: 16,
      paddingVertical:
        11,
    },

    stat: {
      flex: 1,
      alignItems:
        "center",
    },

    statValue: {
      color:
        "#34344A",
      fontSize: 16,
      fontWeight:
        "800",
    },

    statLabel: {
      marginTop: 2,
      color:
        "#A0A1AF",
      fontSize: 10,
      fontWeight:
        "600",
    },

    statDivider: {
      width: 1,
      backgroundColor:
        "#E3E3EB",
    },

    actions: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
      marginTop: 16,
    },

    actionButton: {
      flex: 1,
      minHeight: 43,
      borderRadius:
        13,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 6,
    },

    editButton: {
      backgroundColor:
        "#F1EDFF",
    },

    editText: {
      color:
        "#7867D9",
      fontSize: 13,
      fontWeight:
        "700",
    },

    assignButton: {
      backgroundColor:
        "#7867D9",
    },

    assignText: {
      color:
        "#FFFFFF",
      fontSize: 13,
      fontWeight:
        "700",
    },

    deleteButton: {
      width: 43,
      height: 43,
      borderRadius:
        13,
      backgroundColor:
        "#FFF0F0",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    disabledButton: {
      opacity: 0.5,
    },

  });