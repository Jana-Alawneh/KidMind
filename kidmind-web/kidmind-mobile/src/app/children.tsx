import {
  ActivityIndicator,
  Alert,
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
  useFocusEffect,
} from "expo-router";

import {
  deleteChild,
  getChildren,
} from "@/api/childrenApi";

import {
  getSessions,
} from "@/api/sessionsApi";

import AddChildModal from "@/components/children/AddChildModal";
import ChildrenHeader from "@/components/children/ChildrenHeader";
import ChildrenTable from "@/components/children/ChildrenTable";
import EditChildModal from "@/components/children/EditChildModal";

import type {
  Child,
} from "@/api/childrenApi";

import type {
  Session,
} from "@/api/sessionsApi";


const gameNames = [
  "focus finder",
  "memory match",
  "puzzle path",
  "reading adventure",
  "quick match",
];


const normalizeGameName = (
  value: unknown
) => {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

};


const getGameTimestamp = (
  game: Session["games"][number],
  session: Session
) => {

  const value =
    game.ended_at ||
    game.started_at ||
    game.updated_at ||
    game.created_at ||
    session.ended_at ||
    session.started_at ||
    session.created_at;


  if (!value) {
    return 0;
  }


  const timestamp =
    new Date(
      String(value).replace(
        " ",
        "T"
      )
    ).getTime();


  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : 0;

};


const getSessionTimestamp = (
  session: Session
) => {

  const value =
    session.ended_at ||
    session.started_at ||
    session.created_at;


  if (!value) {
    return 0;
  }


  const timestamp =
    new Date(
      String(value).replace(
        " ",
        "T"
      )
    ).getTime();


  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : 0;

};


const getLatestGameScore = (
  sessions: Session[],
  gameName: string
) => {

  const matches: {
    score: number;
    timestamp: number;
  }[] = [];


  sessions.forEach(
    (session) => {

      if (
        !Array.isArray(
          session.games
        )
      ) {
        return;
      }


      session.games.forEach(
        (game) => {

          const isFinished =
            game.status ===
              "Completed" ||
            game.status ===
              "Failed";


          const score =
            Number(
              game.score
            );


          if (
            !isFinished ||
            normalizeGameName(
              game.game_name
            ) !== gameName ||
            !Number.isFinite(
              score
            )
          ) {
            return;
          }


          matches.push({
            score:
              Math.max(
                0,
                Math.min(
                  100,
                  Math.round(
                    score
                  )
                )
              ),

            timestamp:
              getGameTimestamp(
                game,
                session
              ),
          });

        }
      );

    }
  );


  if (
    matches.length === 0
  ) {
    return null;
  }


  matches.sort(
    (
      first,
      second
    ) =>
      second.timestamp -
      first.timestamp
  );


  return matches[0].score;

};


const getOverallScore = (
  sessions: Session[]
) => {

  const scores =
    gameNames
      .map(
        (gameName) =>
          getLatestGameScore(
            sessions,
            gameName
          )
      )
      .filter(
        (
          score
        ): score is number =>
          typeof score ===
            "number" &&
          Number.isFinite(
            score
          )
      );


  if (
    scores.length === 0
  ) {
    return null;
  }


  return Math.round(
    scores.reduce(
      (
        total,
        score
      ) =>
        total + score,
      0
    ) /
      scores.length
  );

};


const getLastAssessment = (
  sessions: Session[]
) => {

  const completedSessions =
    sessions
      .filter(
        (session) =>
          session.status ===
            "Completed"
      )
      .map(
        (session) => ({
          session,
          timestamp:
            getSessionTimestamp(
              session
            ),
        })
      )
      .filter(
        (item) =>
          item.timestamp > 0
      )
      .sort(
        (
          first,
          second
        ) =>
          second.timestamp -
          first.timestamp
      );


  if (
    completedSessions.length === 0
  ) {
    return "Not assessed";
  }


  const date =
    new Date(
      completedSessions[0]
        .timestamp
    );


  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

};


export default function Children() {

  const [
    openModal,
    setOpenModal,
  ] = useState(false);

  const [
    editingChild,
    setEditingChild,
  ] = useState<Child | null>(
    null
  );

  const [
    children,
    setChildren,
  ] = useState<Child[]>([]);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const loadChildren =
    useCallback(
      async () => {

        try {

          const [
            childrenData,
            sessionsData,
          ] =
            await Promise.all([
              getChildren(),
              getSessions(),
            ]);


          const enrichedChildren =
            childrenData.map(
              (child) => {

                const childSessions =
                  sessionsData.filter(
                    (session) =>
                      Number(
                        session.child_id
                      ) ===
                      Number(
                        child.id
                      )
                  );


                const overallScore =
                  getOverallScore(
                    childSessions
                  );


                const lastAssessment =
                  getLastAssessment(
                    childSessions
                  );


                return {
                  ...child,

                  score:
                    overallScore,

                  last_assessment:
                    lastAssessment,

                  lastAssessment:
                    lastAssessment,
                };

              }
            );


          setChildren(
            enrichedChildren
          );

        } catch (error) {

          console.error(
            "Failed to load children:",
            error
          );


          Alert.alert(
            "Connection Error",
            error instanceof Error
              ? error.message
              : "Failed to load children"
          );

        } finally {

          setLoading(false);
          setRefreshing(false);

        }

      },
      []
    );


  useFocusEffect(
    useCallback(
      () => {

        void loadChildren();

      },
      [
        loadChildren,
      ]
    )
  );


  const handleRefresh =
    () => {

      setRefreshing(true);

      void loadChildren();

    };


  const handleDelete = (
    child: Child
  ) => {

    Alert.alert(
      "Delete Child",
      `Are you sure you want to delete ${child.full_name}?`,
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
            async () => {

              try {

                await deleteChild(
                  child.id
                );

                await loadChildren();


                Alert.alert(
                  "Success",
                  "Child deleted successfully"
                );

              } catch (error) {

                console.error(
                  "Failed to delete child:",
                  error
                );


                Alert.alert(
                  "Error",
                  error instanceof Error
                    ? error.message
                    : "Failed to delete child"
                );

              }

            },
        },
      ]
    );

  };


  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();


  const idSearch =
    normalizedSearch.startsWith(
      "#"
    )
      ? normalizedSearch.slice(
          1
        )
      : normalizedSearch;


  const filteredChildren =
    normalizedSearch
      ? children.filter(
          (child) => {

            const childId =
              String(
                child.id ?? ""
              ).toLowerCase();

            const childName =
              String(
                child.full_name ?? ""
              ).toLowerCase();

            const parentName =
              String(
                child.parent_name ?? ""
              ).toLowerCase();

            const region =
              String(
                child.region ?? ""
              ).toLowerCase();


            return (
              childId.includes(
                idSearch
              ) ||
              childName.includes(
                normalizedSearch
              ) ||
              parentName.includes(
                normalizedSearch
              ) ||
              region.includes(
                normalizedSearch
              )
            );

          }
        )
      : children;


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
        refreshControl={

          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            colors={[
              "#7B6EF6"
            ]}
          />

        }
      >

        <ChildrenHeader
          onAdd={() => {
            setOpenModal(
              true
            );
          }}
          searchQuery={
            searchQuery
          }
          onSearchChange={
            setSearchQuery
          }
        />


        <View
          style={
            styles.tableContainer
          }
        >

          {loading ? (

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
                Loading children...
              </Text>

            </View>

          ) : (

            <ChildrenTable
              children={
                filteredChildren
              }
              onEdit={(
                child
              ) => {
                setEditingChild(
                  child
                );
              }}
              onDelete={
                handleDelete
              }
            />

          )}

        </View>


        {openModal && (

          <AddChildModal
            close={() => {
              setOpenModal(
                false
              );
            }}
            onSuccess={
              loadChildren
            }
          />

        )}


        {editingChild && (

          <EditChildModal
            child={
              editingChild
            }
            close={() => {
              setEditingChild(
                null
              );
            }}
            onSuccess={
              loadChildren
            }
          />

        )}

      </ScrollView>

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
      paddingTop: 100,
      paddingBottom: 50,
    },

    tableContainer: {
      marginTop: 30,
    },

    loadingBox: {
      alignItems:
        "center",
      paddingVertical: 50,
      gap: 12,
    },

    loadingText: {
      color:
        "#64748B",
    },

  });