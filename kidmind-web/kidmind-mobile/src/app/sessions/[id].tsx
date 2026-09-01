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
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useEffect,
  useState,
} from "react";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  ArrowLeft,
  Brain,
  Clock,
  Download,
  Pause,
  Play,
  Square,
  Target,
} from "lucide-react-native";

import Navbar from
  "@/components/layout/Navbar";

import Sidebar from
  "@/components/layout/Sidebar";

import {
  downloadTherapistReportPdf,
} from "@/utils/reportPdf";

import MemoryMatch from
  "@/components/games/memory/MemoryMatch";

import FocusFinder from
  "@/components/games/focus/FocusFinder";

import PuzzlePath from
  "@/components/games/puzzle/PuzzlePath";

import ReadingAdventure from
  "@/components/games/reading/ReadingAdventure";

import QuickMatch from
  "@/components/games/quickMatch/QuickMatch";

import CustomGamePlayer from
  "@/components/games/custom/CustomGamePlayer";

import {
  completeSessionGame,
  endSession,
  getSessionById,
  pauseSession,
  resumeSession,
  startSessionGame,
} from "@/api/sessionsApi";

import type {
  CompleteGamePayload,
  Session,
  SessionGameStatus,
} from "@/api/sessionsApi";


type GameResult =
  Omit<
    CompleteGamePayload,
    "session_duration_seconds"
  >;


type PendingGameResult = {
  gameId: number;
  gameResult: GameResult;
};


const formatTime = (
  totalSeconds: number
) => {

  const safeSeconds =
    Math.max(
      0,
      Math.floor(
        Number(
          totalSeconds
        ) || 0
      )
    );


  const minutes =
    Math.floor(
      safeSeconds / 60
    );


  const seconds =
    safeSeconds % 60;


  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;

};


const formatDate = (
  value: unknown
) => {

  if (
    !value
  ) {
    return "—";
  }


  const date =
    new Date(
      String(
        value
      ).replace(
        " ",
        "T"
      )
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }


  return date.toLocaleString(
    "en-US",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    }
  );

};


const formatPercent = (
  value: unknown
) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }


  const numericValue =
    Number(
      value
    );


  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return "—";
  }


  return `${Math.round(
    numericValue
  )}%`;

};


const formatMetricNumber = (
  value: unknown
) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }


  const numericValue =
    Number(
      value
    );


  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return "—";
  }


  return String(
    Math.round(
      numericValue
    )
  );

};


const formatReactionTime = (
  value: unknown
) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }


  const numericValue =
    Number(
      value
    );


  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return "—";
  }


  return `${numericValue.toFixed(
    2
  )}s`;

};


const getStatusColors = (
  status: SessionGameStatus
) => {

  if (
    status ===
    "In Progress"
  ) {

    return {
      backgroundColor:
        "#DCFCE7",

      color:
        "#15803D",
    };

  }


  if (
    status ===
    "Pending"
  ) {

    return {
      backgroundColor:
        "#F1F5F9",

      color:
        "#475569",
    };

  }


  if (
    status ===
    "Paused"
  ) {

    return {
      backgroundColor:
        "#FEF3C7",

      color:
        "#B45309",
    };

  }


  if (
    status ===
    "Completed"
  ) {

    return {
      backgroundColor:
        "#DBEAFE",

      color:
        "#1D4ED8",
    };

  }


  return {
    backgroundColor:
      "#FEE2E2",

    color:
      "#B91C1C",
  };

};


export default function SessionPage() {

  const params =
    useLocalSearchParams<{
      id?:
        | string
        | string[];
    }>();


  const idValue =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;


  const sessionId =
    Number(
      idValue
    );


  const [
    sidebarVisible,
    setSidebarVisible,
  ] =
    useState(
      false
    );


  const [
    session,
    setSession,
  ] =
    useState<Session | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] =
    useState(
      0
    );


  const [
    running,
    setRunning,
  ] =
    useState(
      false
    );


  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(
      false
    );


  const [
    gameSaving,
    setGameSaving,
  ] =
    useState(
      false
    );


  const [
    gameSaveError,
    setGameSaveError,
  ] =
    useState(
      ""
    );


  const [
    reportDownloading,
    setReportDownloading,
  ] =
    useState(
      false
    );


  const [
    pendingGameResult,
    setPendingGameResult,
  ] =
    useState<
      PendingGameResult | null
    >(
      null
    );


  const [
    recentlyFinishedGameId,
    setRecentlyFinishedGameId,
  ] =
    useState<
      number | null
    >(
      null
    );


  const [
    preparedGameId,
    setPreparedGameId,
  ] =
    useState<
      number | null
    >(
      null
    );


  const [
    launchedGameId,
    setLaunchedGameId,
  ] =
    useState<
      number | null
    >(
      null
    );


  useEffect(
    () => {

      const loadSession =
        async () => {

          if (
            !Number.isInteger(
              sessionId
            ) ||
            sessionId <= 0
          ) {

            setError(
              "Invalid session ID"
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


            const data =
              await getSessionById(
                sessionId
              );


            setSession(
              data
            );


            let startingSeconds =
              Number(
                data.duration_seconds
              ) || 0;


            if (
              data.started_at &&
              data.status ===
                "In Progress"
            ) {

              const startedAt =
                new Date(
                  String(
                    data.started_at
                  ).replace(
                    " ",
                    "T"
                  )
                ).getTime();


              if (
                Number.isFinite(
                  startedAt
                )
              ) {

                const elapsedFromStart =
                  Math.max(
                    0,
                    Math.floor(
                      (
                        Date.now() -
                        startedAt
                      ) / 1000
                    )
                  );


                startingSeconds =
                  Math.max(
                    startingSeconds,
                    elapsedFromStart
                  );

              }

            }


            setElapsedSeconds(
              startingSeconds
            );


            setRunning(
              data.status ===
                "In Progress"
            );


            setGameSaveError(
              ""
            );


            setPendingGameResult(
              null
            );


            setRecentlyFinishedGameId(
              null
            );


            setPreparedGameId(
              null
            );


            setLaunchedGameId(
              null
            );

          } catch (
            loadError
          ) {

            console.error(
              "Failed to load session:",
              loadError
            );


            setError(
              loadError instanceof Error
                ? loadError.message
                : "Failed to load session"
            );

          } finally {

            setLoading(
              false
            );

          }

        };


      loadSession();

    },
    [
      sessionId,
    ]
  );


  useEffect(
    () => {

      if (
        !running
      ) {
        return;
      }


      const timer =
        setInterval(
          () => {

            setElapsedSeconds(
              currentSeconds =>
                currentSeconds + 1
            );

          },
          1000
        );


      return () => {

        clearInterval(
          timer
        );

      };

    },
    [
      running,
    ]
  );


  const games =
    Array.isArray(
      session?.games
    )
      ? session.games
      : [];


  const currentGame =
    games.find(
      game =>
        game.status ===
          "In Progress" ||
        game.status ===
          "Paused"
    ) || null;


  const pendingGame =
    games.find(
      game =>
        game.status ===
        "Pending"
    ) || null;


  const finishedGames =
    games.filter(
      game =>
        game.status ===
          "Completed" ||
        game.status ===
          "Failed" ||
        game.status ===
          "Ended"
    );


  const recentlyFinishedGame =
    recentlyFinishedGameId
      ? games.find(
          game =>
            game.id ===
            recentlyFinishedGameId
        ) || null
      : null;


  const lastFinishedGame =
    recentlyFinishedGame ||
    (
      finishedGames.length > 0
        ? finishedGames[
            finishedGames.length -
            1
          ]
        : null
    );


  const isFinished =
    session?.status ===
      "Completed" ||
    session?.status ===
      "Ended" ||
    session?.status ===
      "Cancelled";


  const isCustomGame = (
    game: any
  ) => {

    const customGameId =
      Number(
        game?.custom_game_id
      );


    return (
      Number.isInteger(
        customGameId
      ) &&
      customGameId > 0
    );

  };


  const displayedScore =
    session?.score ??
    lastFinishedGame?.score ??
    null;


  const displayedDifficulty =
    currentGame?.difficulty ||
    pendingGame?.difficulty ||
    lastFinishedGame
      ?.difficulty ||
    session?.difficulty ||
    "Not set";


  const goBackToChild =
    () => {

      if (
        session
      ) {

        router.push({
          pathname:
            "/children/[id]",

          params: {
            id:
              String(
                session.child_id
              ),
          },
        });


        return;

      }


      router.back();

    };


  const handlePauseResume =
    async () => {

      if (
        !session ||
        actionLoading ||
        gameSaving ||
        isFinished
      ) {
        return;
      }


      try {

        setActionLoading(
          true
        );


        const result =
          running
            ? await pauseSession(
                session.id,
                elapsedSeconds
              )
            : await resumeSession(
                session.id,
                elapsedSeconds
              );


        setSession(
          result.session
        );


        setRunning(
          result.session.status ===
            "In Progress"
        );

      } catch (
        actionError
      ) {

        console.error(
          "Failed to update session:",
          actionError
        );


        Alert.alert(
          "Session Error",
          actionError instanceof Error
            ? actionError.message
            : "Failed to update session"
        );

      } finally {

        setActionLoading(
          false
        );

      }

    };


  const performEndSession =
    async () => {

      if (
        !session ||
        actionLoading ||
        gameSaving ||
        isFinished
      ) {
        return;
      }


      try {

        setActionLoading(
          true
        );

        setRunning(
          false
        );


        const result =
          await endSession(
            session.id,
            elapsedSeconds
          );


        setSession(
          result.session
        );


        setElapsedSeconds(
          Number(
            result.session
              .duration_seconds
          ) ||
          elapsedSeconds
        );


        setPendingGameResult(
          null
        );


        setPreparedGameId(
          null
        );


        setLaunchedGameId(
          null
        );


        setGameSaveError(
          ""
        );


        Alert.alert(
          "Session Ended",
          "Session ended successfully."
        );

      } catch (
        actionError
      ) {

        console.error(
          "Failed to end session:",
          actionError
        );


        setRunning(
          session.status ===
            "In Progress"
        );


        Alert.alert(
          "Session Error",
          actionError instanceof Error
            ? actionError.message
            : "Failed to end session"
        );

      } finally {

        setActionLoading(
          false
        );

      }

    };


  const handleEndSession =
    () => {

      if (
        !session ||
        actionLoading ||
        gameSaving ||
        isFinished
      ) {
        return;
      }


      Alert.alert(
        "End Session",
        "Are you sure you want to end this session? The session status will become Ended.",
        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "End Session",

            style:
              "destructive",

            onPress:
              () => {
                void performEndSession();
              },
          },
        ]
      );

    };


  const submitGameResult =
    async (
      gameId: number,
      gameResult: GameResult
    ) => {

      if (
        !session ||
        gameSaving
      ) {
        return;
      }


      try {

        setGameSaving(
          true
        );

        setGameSaveError(
          ""
        );


        const result =
          await completeSessionGame(
            session.id,
            gameId,
            {
              ...gameResult,

              session_duration_seconds:
                elapsedSeconds,
            }
          );


        setSession(
          result.session
        );


        setRecentlyFinishedGameId(
          gameId
        );


        setPendingGameResult(
          null
        );


        setPreparedGameId(
          null
        );


        setLaunchedGameId(
          null
        );


        if (
          result.all_games_completed
        ) {

          setRunning(
            false
          );


          setElapsedSeconds(
            Number(
              result.session
                .duration_seconds
            ) ||
            elapsedSeconds
          );

        } else {

          setRunning(
            result.session.status ===
              "In Progress"
          );

        }

      } catch (
        saveError
      ) {

        console.error(
          "Failed to save game result:",
          saveError
        );


        setGameSaveError(
          saveError instanceof Error
            ? saveError.message
            : "Failed to save game result"
        );

      } finally {

        setGameSaving(
          false
        );

      }

    };


  const handleGameComplete =
    async (
      gameResult: GameResult
    ) => {

      if (
        !currentGame ||
        gameSaving
      ) {
        return;
      }


      const pendingResult:
        PendingGameResult = {

        gameId:
          currentGame.id,

        gameResult,

      };


      setPendingGameResult(
        pendingResult
      );


      await submitGameResult(
        pendingResult.gameId,
        pendingResult.gameResult
      );

    };


  const handleRetrySave =
    async () => {

      if (
        !pendingGameResult ||
        gameSaving
      ) {
        return;
      }


      await submitGameResult(
        pendingGameResult.gameId,
        pendingGameResult
          .gameResult
      );

    };


  const startPendingGameNow =
    async (
      game: any
    ) => {

      if (
        !session ||
        !game ||
        actionLoading ||
        gameSaving ||
        isFinished
      ) {
        return;
      }


      try {

        setActionLoading(
          true
        );


        setGameSaveError(
          ""
        );


        let activeSession =
          session;


        if (
          session.status ===
          "Paused"
        ) {

          const resumed =
            await resumeSession(
              session.id,
              elapsedSeconds
            );


          activeSession =
            resumed.session;


          setSession(
            resumed.session
          );


          setRunning(
            true
          );

        }


        const result =
          await startSessionGame(
            activeSession.id,
            game.id
          );


        setSession(
          result.session
        );


        setRecentlyFinishedGameId(
          null
        );


        setPendingGameResult(
          null
        );


        setPreparedGameId(
          null
        );


        setLaunchedGameId(
          Number(
            game.id
          )
        );


        setRunning(
          result.session.status ===
            "In Progress"
        );

      } catch (
        actionError
      ) {

        console.error(
          "Failed to start next game:",
          actionError
        );


        Alert.alert(
          "Game Error",
          actionError instanceof Error
            ? actionError.message
            : "Failed to start next game"
        );

      } finally {

        setActionLoading(
          false
        );

      }

    };


  const handlePlayNextGame =
    () => {

      if (
        !session ||
        !pendingGame ||
        actionLoading ||
        gameSaving ||
        isFinished
      ) {
        return;
      }


      setGameSaveError(
        ""
      );


      if (
        isCustomGame(
          pendingGame
        )
      ) {

        void startPendingGameNow(
          pendingGame
        );

        return;

      }


      setPreparedGameId(
        Number(
          pendingGame.id
        )
      );

    };


  const handleConfirmPreparedGame =
    async () => {

      if (
        !pendingGame ||
        Number(
          pendingGame.id
        ) !==
          Number(
            preparedGameId
          )
      ) {
        return;
      }


      await startPendingGameNow(
        pendingGame
      );

    };


  const handleLaunchCurrentGame =
    async () => {

      if (
        !session ||
        !currentGame ||
        actionLoading ||
        gameSaving ||
        isFinished
      ) {
        return;
      }


      try {

        if (
          session.status ===
          "Paused"
        ) {

          setActionLoading(
            true
          );


          const resumed =
            await resumeSession(
              session.id,
              elapsedSeconds
            );


          setSession(
            resumed.session
          );


          setRunning(
            true
          );

        }


        setLaunchedGameId(
          Number(
            currentGame.id
          )
        );

      } catch (
        actionError
      ) {

        console.error(
          "Failed to launch game:",
          actionError
        );


        Alert.alert(
          "Game Error",
          actionError instanceof Error
            ? actionError.message
            : "Failed to launch game"
        );

      } finally {

        setActionLoading(
          false
        );

      }

    };


  const renderFinishedSession =
    () => {

      if (
        !session
      ) {
        return null;
      }


      const sessionDetails =
        session as Session & {
          ended_at?:
            | string
            | null;

          scheduled_at?:
            | string
            | null;

          created_at?:
            | string
            | null;
        };


      const reportDate =
        sessionDetails.ended_at ||
        session.started_at ||
        sessionDetails.scheduled_at ||
        sessionDetails.created_at;


      const completed =
        session.status ===
        "Completed";


      const reportTitle =
        completed
          ? "Session Completed"
          : session.status ===
              "Ended"
            ? "Session Ended"
            : "Session Cancelled";


      const reportText =
        completed
          ? "All selected games were completed and the results were saved."
          : session.status ===
              "Ended"
            ? "This session was ended manually. Results completed before the session ended are shown below."
            : "This session was cancelled before completion. Any saved game results are shown below.";


      const handleDownloadReport =
        async () => {

          try {

            setReportDownloading(
              true
            );


            await downloadTherapistReportPdf(
              session,
              elapsedSeconds
            );

          } catch (
            downloadError
          ) {

            Alert.alert(
              "PDF Error",
              downloadError instanceof
                Error
                ? downloadError.message
                : "Unable to create the PDF report."
            );

          } finally {

            setReportDownloading(
              false
            );

          }

        };


      return (

        <View
          style={
            styles.finishedReportDocument
          }
        >

          <View
            style={
              styles.finishedReportTopbar
            }
          >

            <View
              style={
                styles.finishedReportBrand
              }
            >

              <Text
                style={
                  styles.finishedReportBrandName
                }
              >
                KIDMIND
              </Text>


              <Text
                style={
                  styles.finishedReportBrandSubtitle
                }
              >
                Therapist Assessment Report
              </Text>

            </View>


            <TouchableOpacity
              activeOpacity={
                0.85
              }
              style={[
                styles.finishedReportDownloadButton,

                reportDownloading &&
                  styles.disabledButton,
              ]}
              disabled={
                reportDownloading
              }
              onPress={() => {

                void handleDownloadReport();

              }}
            >

              {
                reportDownloading
                  ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  )
                  : (
                    <Download
                      size={18}
                      color="#FFFFFF"
                    />
                  )
              }


              <Text
                style={
                  styles.finishedReportDownloadText
                }
              >
                {
                  reportDownloading
                    ? "Preparing..."
                    : "PDF"
                }
              </Text>

            </TouchableOpacity>

          </View>


          <View
            style={
              styles.finishedReportHero
            }
          >

            <View
              style={
                styles.finishedReportHeroCopy
              }
            >

              <Text
                style={
                  styles.finishedReportEyebrow
                }
              >
                THERAPIST ASSESSMENT REPORT
              </Text>


              <Text
                style={
                  styles.finishedReportChildName
                }
              >
                {
                  session.child_name ||
                  "Child"
                }
              </Text>


              <Text
                style={
                  styles.finishedReportSessionId
                }
              >
                Session #{session.id}
              </Text>

            </View>


            <View
              style={
                styles.finishedReportScorePanel
              }
            >

              <Text
                style={
                  styles.finishedReportScoreLabel
                }
              >
                Overall Score
              </Text>


              <Text
                style={
                  styles.finishedReportScoreValue
                }
              >
                {
                  displayedScore !==
                  null
                    ? `${displayedScore}%`
                    : "—"
                }
              </Text>


              <Text
                style={
                  styles.finishedReportScoreCaption
                }
              >
                Recorded result
              </Text>

            </View>

          </View>


          <View
            style={
              styles.finishedReportFacts
            }
          >

            <View
              style={
                styles.finishedReportFactRow
              }
            >
              <Text
                style={
                  styles.finishedReportFactLabel
                }
              >
                Child
              </Text>

              <Text
                style={
                  styles.finishedReportFactValue
                }
              >
                {
                  session.child_name ||
                  "—"
                }
              </Text>
            </View>


            <View
              style={
                styles.finishedReportFactRow
              }
            >
              <Text
                style={
                  styles.finishedReportFactLabel
                }
              >
                Session Duration
              </Text>

              <Text
                style={
                  styles.finishedReportFactValue
                }
              >
                {
                  formatTime(
                    elapsedSeconds
                  )
                }
              </Text>
            </View>


            <View
              style={
                styles.finishedReportFactRow
              }
            >
              <Text
                style={
                  styles.finishedReportFactLabel
                }
              >
                Difficulty
              </Text>

              <Text
                style={
                  styles.finishedReportFactValue
                }
              >
                {
                  displayedDifficulty
                }
              </Text>
            </View>


            <View
              style={
                styles.finishedReportFactRow
              }
            >
              <Text
                style={
                  styles.finishedReportFactLabel
                }
              >
                Games
              </Text>

              <Text
                style={
                  styles.finishedReportFactValue
                }
              >
                {finishedGames.length}
                /
                {games.length}
              </Text>
            </View>


            <View
              style={[
                styles.finishedReportFactRow,
                styles.finishedReportFactRowLast,
              ]}
            >
              <Text
                style={
                  styles.finishedReportFactLabel
                }
              >
                Assessment Date
              </Text>

              <Text
                style={
                  styles.finishedReportFactValue
                }
              >
                {
                  formatDate(
                    reportDate
                  )
                }
              </Text>
            </View>

          </View>


          <View
            style={
              styles.finishedReportNarrative
            }
          >

            <View
              style={[
                styles.finishedReportNarrativeIcon,

                completed
                  ? styles.finishedReportNarrativeIconCompleted
                  : styles.finishedReportNarrativeIconStopped,
              ]}
            >

              {
                completed
                  ? (
                    <Target
                      size={22}
                      color="#4A9476"
                    />
                  )
                  : (
                    <Square
                      size={19}
                      color="#C15B6E"
                    />
                  )
              }

            </View>


            <View
              style={
                styles.finishedReportNarrativeCopy
              }
            >

              <Text
                style={
                  styles.finishedReportNarrativeTitle
                }
              >
                {reportTitle}
              </Text>


              <Text
                style={
                  styles.finishedReportNarrativeText
                }
              >
                {reportText}
              </Text>

            </View>

          </View>


          <View
            style={
              styles.finishedReportGamesSection
            }
          >

            <View
              style={
                styles.finishedReportSectionHeading
              }
            >

              <View
                style={
                  styles.finishedReportSectionCopy
                }
              >

                <Text
                  style={
                    styles.finishedReportSectionEyebrow
                  }
                >
                  SESSION BREAKDOWN
                </Text>


                <Text
                  style={
                    styles.finishedReportSectionTitle
                  }
                >
                  Game Results
                </Text>


                <Text
                  style={
                    styles.finishedReportSectionSubtitle
                  }
                >
                  Detailed results saved for each selected game.
                </Text>

              </View>


              <View
                style={
                  styles.finishedReportGameCount
                }
              >
                <Text
                  style={
                    styles.finishedReportGameCountText
                  }
                >
                  {games.length} Games
                </Text>
              </View>

            </View>


            <View
              style={
                styles.finishedReportGamesList
              }
            >

              {
                games.map(
                  (
                    game,
                    index
                  ) => {

                    const colors =
                      getStatusColors(
                        game.status
                      );


                    const reportGame =
                      game as typeof game & {

                        accuracy?:
                          | number
                          | string
                          | null;

                        mistakes?:
                          | number
                          | string
                          | null;

                        reaction_time?:
                          | number
                          | string
                          | null;

                      };


                    return (

                      <View
                        key={
                          game.id
                        }
                        style={
                          styles.finishedReportGameCard
                        }
                      >

                        <View
                          style={
                            styles.finishedReportGameHeader
                          }
                        >

                          <View
                            style={
                              styles.finishedReportGameIdentity
                            }
                          >

                            <View
                              style={
                                styles.finishedReportGameNumber
                              }
                            >
                              <Text
                                style={
                                  styles.finishedReportGameNumberText
                                }
                              >
                                {
                                  String(
                                    index + 1
                                  ).padStart(
                                    2,
                                    "0"
                                  )
                                }
                              </Text>
                            </View>


                            <View
                              style={
                                styles.finishedReportGameCopy
                              }
                            >

                              <Text
                                style={
                                  styles.finishedReportGameName
                                }
                              >
                                {game.game_name}
                              </Text>


                              <Text
                                style={
                                  styles.finishedReportGameDifficulty
                                }
                              >
                                {
                                  game.difficulty ||
                                  "No difficulty"
                                }
                              </Text>

                            </View>

                          </View>


                          <View
                            style={[
                              styles.finishedReportGameStatus,
                              {
                                backgroundColor:
                                  colors.backgroundColor,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.finishedReportGameStatusText,
                                {
                                  color:
                                    colors.color,
                                },
                              ]}
                            >
                              {game.status}
                            </Text>
                          </View>

                        </View>


                        <View
                          style={
                            styles.finishedReportMetrics
                          }
                        >

                          <View
                            style={
                              styles.finishedReportMetricRow
                            }
                          >
                            <Text
                              style={
                                styles.finishedReportMetricLabel
                              }
                            >
                              Score
                            </Text>

                            <Text
                              style={
                                styles.finishedReportMetricValue
                              }
                            >
                              {
                                formatPercent(
                                  game.score
                                )
                              }
                            </Text>
                          </View>


                          <View
                            style={
                              styles.finishedReportMetricRow
                            }
                          >
                            <Text
                              style={
                                styles.finishedReportMetricLabel
                              }
                            >
                              Accuracy
                            </Text>

                            <Text
                              style={
                                styles.finishedReportMetricValue
                              }
                            >
                              {
                                formatPercent(
                                  reportGame.accuracy
                                )
                              }
                            </Text>
                          </View>


                          <View
                            style={
                              styles.finishedReportMetricRow
                            }
                          >
                            <Text
                              style={
                                styles.finishedReportMetricLabel
                              }
                            >
                              Mistakes
                            </Text>

                            <Text
                              style={
                                styles.finishedReportMetricValue
                              }
                            >
                              {
                                formatMetricNumber(
                                  reportGame.mistakes
                                )
                              }
                            </Text>
                          </View>


                          <View
                            style={
                              styles.finishedReportMetricRow
                            }
                          >
                            <Text
                              style={
                                styles.finishedReportMetricLabel
                              }
                            >
                              Reaction Time
                            </Text>

                            <Text
                              style={
                                styles.finishedReportMetricValue
                              }
                            >
                              {
                                formatReactionTime(
                                  reportGame.reaction_time
                                )
                              }
                            </Text>
                          </View>


                          <View
                            style={[
                              styles.finishedReportMetricRow,
                              styles.finishedReportMetricRowLast,
                            ]}
                          >
                            <Text
                              style={
                                styles.finishedReportMetricLabel
                              }
                            >
                              Game Time
                            </Text>

                            <Text
                              style={
                                styles.finishedReportMetricValue
                              }
                            >
                              {
                                formatTime(
                                  game.duration_seconds
                                )
                              }
                            </Text>
                          </View>

                        </View>

                      </View>

                    );

                  }
                )
              }

            </View>


            {
              games.length ===
                0 && (

                <View
                  style={
                    styles.finishedReportEmpty
                  }
                >
                  <Text
                    style={
                      styles.finishedReportEmptyText
                    }
                  >
                    No game results are available for this session.
                  </Text>
                </View>

              )
            }

          </View>


          <View
            style={
              styles.finishedReportFooter
            }
          >

            <Text
              style={
                styles.finishedReportFooterText
              }
            >
              KidMind Therapist Assessment Report
            </Text>


            <Text
              style={
                styles.finishedReportFooterText
              }
            >
              Session #{session.id}
            </Text>

          </View>


          <View
            style={
              styles.finishedReportActions
            }
          >

            <TouchableOpacity
              style={
                styles.backToSessionsButton
              }
              onPress={() => {

                router.push(
                  "/sessions"
                );

              }}
            >

              <Text
                style={
                  styles.backToSessionsButtonText
                }
              >
                Back to Sessions
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={
                styles.backToChildButton
              }
              onPress={
                goBackToChild
              }
            >

              <Text
                style={
                  styles.backToChildButtonText
                }
              >
                Back to Child Profile
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      );

    };


  const renderGameStartGate =
    (
      game: any,
      onStart: () => void
    ) => {

      return (

        <View
          style={
            styles.startGateContainer
          }
        >

          <View
            style={
              styles.startGateCard
            }
          >

            <View
              style={
                styles.startGateIcon
              }
            >

              <Play
                size={28}
                color="#7566EB"
              />

            </View>


            <Text
              style={
                styles.startGateEyebrow
              }
            >
              READY TO START
            </Text>


            <Text
              style={
                styles.startGateTitle
              }
            >
              {game.game_name}
            </Text>


            <Text
              style={
                styles.startGateText
              }
            >
              Prepare the child and scroll to this area before beginning the game.
            </Text>


            <Text
              style={
                styles.startGateHint
              }
            >
              The game is not loaded yet, so its interaction and reaction timing has not started.
            </Text>


            {!!game.difficulty && (

              <View
                style={
                  styles.startGateDifficulty
                }
              >

                <Text
                  style={
                    styles.startGateDifficultyText
                  }
                >
                  Difficulty:{" "}
                  {game.difficulty}
                </Text>

              </View>

            )}


            <TouchableOpacity
              activeOpacity={
                0.85
              }
              style={[
                styles.startGateButton,

                (
                  actionLoading ||
                  gameSaving
                ) &&
                  styles.disabledButton,
              ]}
              disabled={
                actionLoading ||
                gameSaving
              }
              onPress={
                onStart
              }
            >

              {actionLoading ? (

                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

              ) : (

                <Play
                  size={19}
                  color="#FFFFFF"
                />

              )}


              <Text
                style={
                  styles.startGateButtonText
                }
              >
                {actionLoading
                  ? "Starting..."
                  : `Start ${game.game_name}`}
              </Text>

            </TouchableOpacity>


            <Text
              style={
                styles.startGateFooter
              }
            >
              Game timing begins after pressing Start.
            </Text>

          </View>

        </View>

      );

    };


  const renderBetweenGames =
    () => {

      const pendingGamePrepared =
        pendingGame &&
        !isCustomGame(
          pendingGame
        ) &&
        Number(
          preparedGameId
        ) ===
          Number(
            pendingGame.id
          );


      if (
        pendingGamePrepared &&
        pendingGame
      ) {

        return renderGameStartGate(
          pendingGame,
          () => {

            void handleConfirmPreparedGame();

          }
        );

      }


      return (

        <View
          style={
            styles.betweenGamesContainer
          }
        >

          <View
            style={
              styles.finishedIcon
            }
          >

            <Target
              size={39}
              color="#16A34A"
            />

          </View>


          <Text
            style={
              styles.finishedTitle
            }
          >
            Game Finished
          </Text>


          {lastFinishedGame && (

            <View
              style={
                styles.finishedGameSummary
              }
            >

              <View
                style={
                  styles.finishedGameMetric
                }
              >

                <Text
                  style={
                    styles.finishedGameLabel
                  }
                >
                  Game
                </Text>


                <Text
                  style={
                    styles.finishedGameValueSmall
                  }
                >
                  {
                    lastFinishedGame
                      .game_name
                  }
                </Text>

              </View>


              <View
                style={
                  styles.finishedGameMetric
                }
              >

                <Text
                  style={
                    styles.finishedGameLabel
                  }
                >
                  Score
                </Text>


                <Text
                  style={
                    styles.finishedGameValue
                  }
                >
                  {
                    lastFinishedGame
                      .score ?? 0
                  }%
                </Text>

              </View>


              <View
                style={
                  styles.finishedGameMetric
                }
              >

                <Text
                  style={
                    styles.finishedGameLabel
                  }
                >
                  Game Time
                </Text>


                <Text
                  style={
                    styles.finishedGameValue
                  }
                >
                  {formatTime(
                    lastFinishedGame
                      .duration_seconds
                  )}
                </Text>

              </View>

            </View>

          )}


          {pendingGame ? (

            <>

              <View
                style={
                  styles.nextGameCard
                }
              >

                <Text
                  style={
                    styles.nextGameLabel
                  }
                >
                  NEXT GAME
                </Text>


                <Text
                  style={
                    styles.nextGameName
                  }
                >
                  {
                    pendingGame
                      .game_name
                  }
                </Text>


                <Text
                  style={
                    styles.nextGameDifficulty
                  }
                >
                  {
                    pendingGame
                      .difficulty ||
                    "Level 1"
                  }
                </Text>


                <Text
                  style={
                    styles.nextGameText
                  }
                >
                  Press Play to prepare the next game. You will still get a separate Start button before the game itself appears.
                </Text>

              </View>


              <TouchableOpacity
                style={[
                  styles.nextGameButton,

                  (
                    actionLoading ||
                    gameSaving
                  ) &&
                    styles.disabledButton,
                ]}
                disabled={
                  actionLoading ||
                  gameSaving
                }
                onPress={
                  handlePlayNextGame
                }
              >

                {actionLoading ? (

                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                ) : (

                  <Play
                    size={19}
                    color="#FFFFFF"
                  />

                )}


                <Text
                  style={
                    styles.nextGameButtonText
                  }
                >
                  {actionLoading
                    ? "Starting..."
                    : `Play ${pendingGame.game_name}`}
                </Text>

              </TouchableOpacity>

            </>

          ) : (

            <Text
              style={
                styles.finishedText
              }
            >
              No pending game remains.
            </Text>

          )}

        </View>

      );

    };


  const renderSelectedGame =
    () => {

      if (
        isFinished
      ) {

        return renderFinishedSession();

      }


      if (
        !currentGame &&
        (
          pendingGame ||
          lastFinishedGame
        )
      ) {

        return renderBetweenGames();

      }


      if (
        !currentGame
      ) {

        return (

          <View
            style={
              styles.noGameContainer
            }
          >

            <Brain
              size={52}
              color="#7B6EF6"
            />


            <Text
              style={
                styles.noGameTitle
              }
            >
              No Active Game
            </Text>


            <Text
              style={
                styles.noGameText
              }
            >
              This session does not have an active game.
            </Text>

          </View>

        );

      }


      if (
        !isCustomGame(
          currentGame
        ) &&
        Number(
          launchedGameId
        ) !==
          Number(
            currentGame.id
          )
      ) {

        return renderGameStartGate(
          currentGame,
          () => {

            void handleLaunchCurrentGame();

          }
        );

      }


      const gameName =
        currentGame
          .game_name
          ?.trim()
          .toLowerCase();


      const gameDifficulty =
        currentGame
          .difficulty ||
        "Level 1";


      const gamePaused =
        !running ||
        actionLoading;


      if (
        isCustomGame(
          currentGame
        )
      ) {

        return (

          <CustomGamePlayer
            key={
              currentGame.id
            }
            customGameId={
              Number(
                currentGame
                  .custom_game_id
              )
            }
            paused={
              gamePaused
            }
            onComplete={
              handleGameComplete
            }
          />

        );

      }


      if (
        gameName ===
        "memory match"
      ) {

        return (

          <MemoryMatch
            key={
              currentGame.id
            }
            embedded
            difficulty={
              gameDifficulty
            }
            paused={
              gamePaused
            }
            onComplete={
              handleGameComplete
            }
          />

        );

      }


      if (
        gameName ===
        "focus finder"
      ) {

        return (

          <FocusFinder
            key={
              currentGame.id
            }
            embedded
            difficulty={
              gameDifficulty
            }
            paused={
              gamePaused
            }
            onComplete={
              handleGameComplete
            }
          />

        );

      }


      if (
        gameName ===
        "puzzle path"
      ) {

        return (

          <PuzzlePath
            key={
              currentGame.id
            }
            embedded
            difficulty={
              gameDifficulty
            }
            paused={
              gamePaused
            }
            onComplete={
              handleGameComplete
            }
          />

        );

      }


      if (
        gameName ===
        "reading adventure"
      ) {

        return (

          <ReadingAdventure
            key={
              currentGame.id
            }
            embedded
            difficulty={
              gameDifficulty
            }
            paused={
              gamePaused
            }
            onComplete={
              handleGameComplete
            }
          />

        );

      }


      if (
        gameName ===
        "quick match"
      ) {

        return (

          <QuickMatch
            key={
              currentGame.id
            }
            embedded
            difficulty={
              gameDifficulty
            }
            paused={
              gamePaused
            }
            onComplete={
              handleGameComplete
            }
          />

        );

      }


      return (

        <View
          style={
            styles.noGameContainer
          }
        >

          <Brain
            size={52}
            color="#7B6EF6"
          />


          <Text
            style={
              styles.noGameTitle
            }
          >
            {
              currentGame
                .game_name
            }
          </Text>


          <Text
            style={
              styles.noGameText
            }
          >
            This game is not connected yet.
          </Text>

        </View>

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

          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={
              goBackToChild
            }
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
              Back to Child Profile
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
                Loading session...
              </Text>

            </View>

          )}


          {!loading &&
            error !== "" && (

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
                Unable to load session
              </Text>


              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>

            </View>

          )}


          {!loading &&
            !error &&
            session && (

            <>

              {!isFinished && (

                <>

              <View
                style={
                  styles.headerCard
                }
              >

                <View
                  style={
                    styles.headerTop
                  }
                >

                  <View
                    style={
                      styles.headerTextBox
                    }
                  >

                    <Text
                      style={
                        styles.title
                      }
                    >
                      {isFinished
                        ? "Session Report"
                        : "Assessment Session"}
                    </Text>


                    <Text
                      style={
                        styles.subtitle
                      }
                    >
                      Child:{" "}
                      {
                        session
                          .child_name
                      }
                    </Text>


                    <Text
                      style={
                        styles.sessionId
                      }
                    >
                      Session #
                      {session.id}
                    </Text>

                  </View>


                  <View
                    style={
                      styles.timerCard
                    }
                  >

                    <Clock
                      size={19}
                      color="#7B6EF6"
                    />


                    <Text
                      style={
                        styles.timerLabel
                      }
                    >
                      Session Time
                    </Text>


                    <Text
                      style={
                        styles.timerValue
                      }
                    >
                      {formatTime(
                        elapsedSeconds
                      )}
                    </Text>

                  </View>

                </View>


                <View
                  style={[
                    styles.sessionStatus,

                    session.status ===
                      "In Progress"
                      ? styles.sessionStatusRunning
                      : session.status ===
                          "Paused"
                        ? styles.sessionStatusPaused
                        : session.status ===
                            "Completed"
                          ? styles.sessionStatusCompleted
                          : styles.sessionStatusOther,
                  ]}
                >

                  <Text
                    style={[
                      styles.sessionStatusText,

                      session.status ===
                        "In Progress"
                        ? styles.sessionStatusTextRunning
                        : session.status ===
                            "Paused"
                          ? styles.sessionStatusTextPaused
                          : session.status ===
                              "Completed"
                            ? styles.sessionStatusTextCompleted
                            : styles.sessionStatusTextOther,
                    ]}
                  >
                    {session.status}
                  </Text>

                </View>

              </View>


              <View
                style={
                  styles.summaryRow
                }
              >

                <View
                  style={
                    styles.summaryCard
                  }
                >

                  <Target
                    size={24}
                    color="#7B6EF6"
                  />


                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Games
                  </Text>


                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    {finishedGames.length}
                    /
                    {games.length}
                  </Text>

                </View>


                <View
                  style={
                    styles.summaryCard
                  }
                >

                  <Brain
                    size={24}
                    color="#16A34A"
                  />


                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Difficulty
                  </Text>


                  <Text
                    style={
                      styles.summaryValueSmall
                    }
                  >
                    {displayedDifficulty}
                  </Text>

                </View>

              </View>


              <View
                style={
                  styles.summaryRow
                }
              >

                <View
                  style={[
                    styles.summaryCard,
                    styles.scoreSummaryCard,
                  ]}
                >

                  <Target
                    size={24}
                    color="#7B6EF6"
                  />


                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Score
                  </Text>


                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    {displayedScore !==
                      null
                      ? `${displayedScore}%`
                      : "—"}
                  </Text>

                </View>


                <View
                  style={[
                    styles.summaryCard,
                    styles.durationSummaryCard,
                  ]}
                >

                  <Clock
                    size={24}
                    color="#3B82F6"
                  />


                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Duration
                  </Text>


                  <Text
                    style={
                      styles.summaryValueSmall
                    }
                  >
                    {formatTime(
                      elapsedSeconds
                    )}
                  </Text>

                </View>

              </View>


                </>

              )}


              {!isFinished && (

                <View
                  style={
                    styles.gamesSection
                  }
                >

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Selected Games
                  </Text>


                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    The active game is marked In Progress. The remaining games stay Pending until their turn.
                  </Text>


                  <View
                    style={
                      styles.gamesList
                    }
                  >

                    {games.map(
                      (
                        game,
                        index
                      ) => {

                        const colors =
                          getStatusColors(
                            game.status
                          );


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
                                styles.gameNumberBox
                              }
                            >

                              <Text
                                style={
                                  styles.gameNumberText
                                }
                              >
                                {index + 1}
                              </Text>

                            </View>


                            <View
                              style={
                                styles.gameTextBox
                              }
                            >

                              <Text
                                style={
                                  styles.gameName
                                }
                              >
                                {
                                  game
                                    .game_name
                                }
                              </Text>


                              <Text
                                style={
                                  styles.gameDifficulty
                                }
                              >
                                {
                                  game.difficulty ||
                                  "No difficulty"
                                }
                              </Text>

                            </View>


                            <View
                              style={[
                                styles.gameStatus,

                                {
                                  backgroundColor:
                                    colors.backgroundColor,
                                },
                              ]}
                            >

                              <Text
                                style={[
                                  styles.gameStatusText,

                                  {
                                    color:
                                      colors.color,
                                  },
                                ]}
                              >
                                {game.status}
                              </Text>

                            </View>

                          </View>

                        );

                      }
                    )}

                  </View>

                </View>

              )}


              {session.status ===
                "Paused" &&
                !isFinished && (

                <View
                  style={
                    styles.sessionPausedBox
                  }
                >

                  <Pause
                    size={19}
                    color="#B45309"
                  />


                  <Text
                    style={
                      styles.sessionPausedText
                    }
                  >
                    Session Paused
                  </Text>

                </View>

              )}


              <View
                style={
                  styles.playerSection
                }
              >

                {renderSelectedGame()}


                {gameSaving && (

                  <View
                    style={
                      styles.savingOverlay
                    }
                  >

                    <View
                      style={
                        styles.savingCard
                      }
                    >

                      <ActivityIndicator
                        size="large"
                        color="#7B6EF6"
                      />


                      <Text
                        style={
                          styles.savingText
                        }
                      >
                        Saving game result...
                      </Text>

                    </View>

                  </View>

                )}

              </View>


              {gameSaveError !==
                "" && (

                <View
                  style={
                    styles.gameSaveErrorBox
                  }
                >

                  <Text
                    style={
                      styles.gameSaveErrorText
                    }
                  >
                    {gameSaveError}
                  </Text>


                  <TouchableOpacity
                    style={[
                      styles.retryButton,

                      gameSaving &&
                        styles.disabledButton,
                    ]}
                    disabled={
                      gameSaving
                    }
                    onPress={
                      handleRetrySave
                    }
                  >

                    {gameSaving ? (

                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />

                    ) : (

                      <Text
                        style={
                          styles.retryButtonText
                        }
                      >
                        Retry Saving
                      </Text>

                    )}

                  </TouchableOpacity>

                </View>

              )}


              {!isFinished && (

                <View
                  style={
                    styles.controlsContainer
                  }
                >

                  <TouchableOpacity
                    style={[
                      styles.pauseButton,

                      (
                        actionLoading ||
                        gameSaving
                      ) &&
                        styles.disabledButton,
                    ]}
                    disabled={
                      actionLoading ||
                      gameSaving
                    }
                    onPress={
                      handlePauseResume
                    }
                  >

                    {actionLoading ? (

                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />

                    ) : running ? (

                      <Pause
                        size={25}
                        color="#FFFFFF"
                      />

                    ) : (

                      <Play
                        size={25}
                        color="#FFFFFF"
                      />

                    )}

                  </TouchableOpacity>


                  <TouchableOpacity
                    style={[
                      styles.endButton,

                      (
                        actionLoading ||
                        gameSaving
                      ) &&
                        styles.disabledButton,
                    ]}
                    disabled={
                      actionLoading ||
                      gameSaving
                    }
                    onPress={
                      handleEndSession
                    }
                  >

                    <Square
                      size={25}
                      color="#EF4444"
                    />

                  </TouchableOpacity>

                </View>

              )}

            </>

          )}

        </ScrollView>


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

      flex:
        1,

      backgroundColor:
        "#FFFFFF",

    },


    container: {

      flex:
        1,

      backgroundColor:
        "#F7F8FC",

    },


    content: {

      paddingHorizontal:
        18,

      paddingTop:
        18,

      paddingBottom:
        60,

      gap:
        20,

    },


    backButton: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        8,

      marginTop:
        6,

      minHeight:
        44,

    },


    backText: {

      color:
        "#7B6EF6",

      fontWeight:
        "700",

    },


    loadingBox: {

      minHeight:
        380,

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        14,

    },


    loadingText: {

      color:
        "#64748B",

    },


    errorBox: {

      padding:
        22,

      borderRadius:
        18,

      backgroundColor:
        "#FEF2F2",

      borderWidth:
        1,

      borderColor:
        "#FECACA",

    },


    errorTitle: {

      color:
        "#B91C1C",

      fontSize:
        18,

      fontWeight:
        "800",

    },


    errorText: {

      color:
        "#B91C1C",

      marginTop:
        7,

    },


    headerCard: {

      padding:
        20,

      borderRadius:
        24,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E2E8F0",

    },


    headerTop: {

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        14,

    },


    headerTextBox: {

      flex:
        1,

    },


    title: {

      color:
        "#172554",

      fontSize:
        23,

      fontWeight:
        "800",

    },


    subtitle: {

      color:
        "#64748B",

      marginTop:
        6,

    },


    sessionId: {

      color:
        "#94A3B8",

      fontSize:
        12,

      marginTop:
        4,

    },


    timerCard: {

      minWidth:
        115,

      padding:
        12,

      borderRadius:
        16,

      backgroundColor:
        "#EEE9FF",

      alignItems:
        "center",

      gap:
        3,

    },


    timerLabel: {

      color:
        "#6D5CE7",

      fontSize:
        11,

      fontWeight:
        "700",

    },


    timerValue: {

      color:
        "#5B4BD8",

      fontSize:
        21,

      fontWeight:
        "800",

    },


    sessionStatus: {

      alignSelf:
        "flex-start",

      marginTop:
        16,

      paddingHorizontal:
        12,

      paddingVertical:
        7,

      borderRadius:
        20,

    },


    sessionStatusRunning: {

      backgroundColor:
        "#DCFCE7",

    },


    sessionStatusPaused: {

      backgroundColor:
        "#FEF3C7",

    },


    sessionStatusCompleted: {

      backgroundColor:
        "#DBEAFE",

    },


    sessionStatusOther: {

      backgroundColor:
        "#FEE2E2",

    },


    sessionStatusText: {

      fontSize:
        12,

      fontWeight:
        "800",

    },


    sessionStatusTextRunning: {

      color:
        "#15803D",

    },


    sessionStatusTextPaused: {

      color:
        "#B45309",

    },


    sessionStatusTextCompleted: {

      color:
        "#1D4ED8",

    },


    sessionStatusTextOther: {

      color:
        "#B91C1C",

    },


    summaryRow: {

      flexDirection:
        "row",

      gap:
        12,

    },


    summaryCard: {

      flex:
        1,

      minHeight:
        120,

      padding:
        17,

      borderRadius:
        20,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E2E8F0",

    },


    scoreSummaryCard: {

      backgroundColor:
        "#F7F5FF",

      borderColor:
        "#E5E1FF",

    },


    durationSummaryCard: {

      backgroundColor:
        "#F0F9FF",

      borderColor:
        "#DBEAFE",

    },


    summaryLabel: {

      color:
        "#64748B",

      marginTop:
        10,

    },


    summaryValue: {

      color:
        "#172554",

      fontSize:
        28,

      fontWeight:
        "800",

      marginTop:
        3,

    },


    summaryValueSmall: {

      color:
        "#172554",

      fontSize:
        17,

      fontWeight:
        "800",

      marginTop:
        5,

    },


    gamesSection: {

      padding:
        20,

      borderRadius:
        24,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E2E8F0",

    },


    sectionTitle: {

      color:
        "#172554",

      fontSize:
        20,

      fontWeight:
        "800",

    },


    sectionSubtitle: {

      color:
        "#64748B",

      lineHeight:
        20,

      marginTop:
        4,

    },


    gamesList: {

      gap:
        12,

      marginTop:
        17,

    },


    gameCard: {

      padding:
        15,

      borderRadius:
        18,

      backgroundColor:
        "#F8FAFC",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        11,

    },


    gameNumberBox: {

      width:
        37,

      height:
        37,

      borderRadius:
        12,

      backgroundColor:
        "#EEE9FF",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    gameNumberText: {

      color:
        "#6D5CE7",

      fontWeight:
        "800",

    },


    gameTextBox: {

      flex:
        1,

    },


    gameName: {

      color:
        "#172554",

      fontSize:
        16,

      fontWeight:
        "800",

    },


    gameDifficulty: {

      color:
        "#64748B",

      fontSize:
        13,

      marginTop:
        3,

    },


    gameStatus: {

      paddingHorizontal:
        10,

      paddingVertical:
        6,

      borderRadius:
        20,

      maxWidth:
        105,

    },


    gameStatusText: {

      fontSize:
        11,

      fontWeight:
        "800",

      textAlign:
        "center",

    },


    sessionPausedBox: {

      padding:
        14,

      borderRadius:
        18,

      backgroundColor:
        "#FEF3C7",

      borderWidth:
        1,

      borderColor:
        "#FDE68A",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        8,

    },


    sessionPausedText: {

      color:
        "#B45309",

      fontSize:
        14,

      fontWeight:
        "800",

    },


    playerSection: {

      width:
        "100%",

      borderRadius:
        26,

      backgroundColor:
        "#F7F5FF",

      padding:
        8,

      position:
        "relative",

      overflow:
        "hidden",

    },


    savingOverlay: {

      position:
        "absolute",

      top:
        0,

      left:
        0,

      right:
        0,

      bottom:
        0,

      backgroundColor:
        "rgba(255,255,255,0.88)",

      alignItems:
        "center",

      justifyContent:
        "center",

      zIndex:
        20,

      elevation:
        20,

    },


    savingCard: {

      paddingVertical:
        22,

      paddingHorizontal:
        28,

      borderRadius:
        20,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E5E1FF",

      alignItems:
        "center",

      gap:
        12,

    },


    savingText: {

      color:
        "#6D5CE7",

      fontWeight:
        "800",

    },


    gameSaveErrorBox: {

      padding:
        17,

      borderRadius:
        18,

      backgroundColor:
        "#FEF2F2",

      borderWidth:
        1,

      borderColor:
        "#FECACA",

      gap:
        13,

    },


    gameSaveErrorText: {

      color:
        "#B91C1C",

      lineHeight:
        20,

      fontWeight:
        "600",

    },


    retryButton: {

      minHeight:
        44,

      paddingHorizontal:
        18,

      borderRadius:
        13,

      backgroundColor:
        "#DC2626",

      alignItems:
        "center",

      justifyContent:
        "center",

      alignSelf:
        "flex-start",

    },


    retryButtonText: {

      color:
        "#FFFFFF",

      fontWeight:
        "800",

    },


    controlsContainer: {

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        18,

      paddingVertical:
        8,

    },


    pauseButton: {

      width:
        58,

      height:
        58,

      borderRadius:
        18,

      backgroundColor:
        "#7B6EF6",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    endButton: {

      width:
        58,

      height:
        58,

      borderRadius:
        18,

      backgroundColor:
        "#FEE2E2",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    disabledButton: {

      opacity:
        0.5,

    },


    finishedContainer: {

      width:
        "100%",

      minHeight:
        330,

      padding:
        22,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        22,

    },


    reportContainer: {

      width:
        "100%",

      gap:
        16,

    },


    reportHero: {

      width:
        "100%",

      padding:
        22,

      borderRadius:
        22,

      alignItems:
        "center",

      borderWidth:
        1,

    },


    reportHeroCompleted: {

      backgroundColor:
        "#F0FDF4",

      borderColor:
        "#BBF7D0",

    },


    reportHeroStopped: {

      backgroundColor:
        "#FFF7F7",

      borderColor:
        "#FECACA",

    },


    reportIcon: {

      width:
        68,

      height:
        68,

      borderRadius:
        22,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    reportIconCompleted: {

      backgroundColor:
        "#DCFCE7",

    },


    reportIconStopped: {

      backgroundColor:
        "#FEE2E2",

    },


    reportTitle: {

      color:
        "#172554",

      fontSize:
        24,

      fontWeight:
        "800",

      textAlign:
        "center",

      marginTop:
        14,

    },


    reportText: {

      color:
        "#64748B",

      textAlign:
        "center",

      lineHeight:
        21,

      marginTop:
        7,

    },


    reportDateCard: {

      width:
        "100%",

      marginTop:
        18,

      padding:
        14,

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E2E8F0",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

    },


    reportDateTextBox: {

      flex:
        1,

    },


    reportDateLabel: {

      color:
        "#94A3B8",

      fontSize:
        11,

      fontWeight:
        "700",

    },


    reportDateValue: {

      color:
        "#172554",

      fontSize:
        14,

      fontWeight:
        "800",

      marginTop:
        3,

    },


    reportGamesSection: {

      width:
        "100%",

      padding:
        20,

      borderRadius:
        22,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E2E8F0",

    },


    reportSectionTitle: {

      color:
        "#172554",

      fontSize:
        20,

      fontWeight:
        "800",

    },


    reportSectionSubtitle: {

      color:
        "#64748B",

      lineHeight:
        20,

      marginTop:
        4,

    },


    reportGamesList: {

      gap:
        14,

      marginTop:
        17,

    },


    reportGameCard: {

      width:
        "100%",

      padding:
        15,

      borderRadius:
        18,

      backgroundColor:
        "#F8FAFC",

      borderWidth:
        1,

      borderColor:
        "#E2E8F0",

    },


    reportGameHeader: {

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        10,

    },


    reportGameIdentity: {

      flex:
        1,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

    },


    reportGameNumber: {

      width:
        38,

      height:
        38,

      borderRadius:
        12,

      backgroundColor:
        "#EEE9FF",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    reportGameNumberText: {

      color:
        "#6D5CE7",

      fontWeight:
        "800",

    },


    reportGameTextBox: {

      flex:
        1,

    },


    reportGameName: {

      color:
        "#172554",

      fontSize:
        16,

      fontWeight:
        "800",

    },


    reportGameDifficulty: {

      color:
        "#64748B",

      fontSize:
        12,

      marginTop:
        3,

    },


    reportGameStatus: {

      paddingHorizontal:
        9,

      paddingVertical:
        6,

      borderRadius:
        18,

      maxWidth:
        100,

    },


    reportGameStatusText: {

      fontSize:
        10,

      fontWeight:
        "800",

      textAlign:
        "center",

    },


    reportMetricsGrid: {

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        8,

      marginTop:
        15,

    },


    reportMetricCard: {

      width:
        "48%",

      minHeight:
        72,

      padding:
        10,

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E2E8F0",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    reportMetricCardWide: {

      width:
        "100%",

    },


    reportMetricLabel: {

      color:
        "#94A3B8",

      fontSize:
        10,

      fontWeight:
        "700",

      textAlign:
        "center",

    },


    reportMetricValue: {

      color:
        "#172554",

      fontSize:
        20,

      fontWeight:
        "800",

      marginTop:
        4,

    },


    reportMetricValueSmall: {

      color:
        "#172554",

      fontSize:
        16,

      fontWeight:
        "800",

      marginTop:
        4,

    },


    reportEmptyBox: {

      marginTop:
        16,

      padding:
        18,

      borderRadius:
        16,

      backgroundColor:
        "#F8FAFC",

    },


    reportEmptyText: {

      color:
        "#64748B",

      textAlign:
        "center",

      lineHeight:
        20,

    },


    reportActions: {

      width:
        "100%",

      gap:
        10,

    },


    backToSessionsButton: {

      minHeight:
        50,

      paddingHorizontal:
        22,

      borderRadius:
        15,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#D8D3FF",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    backToSessionsButtonText: {

      color:
        "#6D5CE7",

      fontWeight:
        "800",

    },


    betweenGamesContainer: {

      width:
        "100%",

      minHeight:
        360,

      padding:
        22,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        22,

    },


    finishedIcon: {

      width:
        72,

      height:
        72,

      borderRadius:
        24,

      backgroundColor:
        "#DCFCE7",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    finishedIconRed: {

      backgroundColor:
        "#FEE2E2",

    },


    finishedTitle: {

      color:
        "#172554",

      fontSize:
        25,

      fontWeight:
        "800",

      textAlign:
        "center",

      marginTop:
        17,

    },


    finishedText: {

      color:
        "#64748B",

      textAlign:
        "center",

      lineHeight:
        21,

      marginTop:
        8,

    },


    finishedScore: {

      color:
        "#172554",

      fontSize:
        18,

      fontWeight:
        "800",

      marginTop:
        14,

    },


    backToChildButton: {

      minHeight:
        48,

      paddingHorizontal:
        24,

      borderRadius:
        15,

      backgroundColor:
        "#7B6EF6",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        22,

    },


    backToChildButtonText: {

      color:
        "#FFFFFF",

      fontWeight:
        "800",

    },


    finishedGameSummary: {

      width:
        "100%",

      flexDirection:
        "row",

      gap:
        8,

      marginTop:
        20,

    },


    finishedGameMetric: {

      flex:
        1,

      minHeight:
        90,

      padding:
        10,

      borderRadius:
        16,

      backgroundColor:
        "#F8FAFC",

      borderWidth:
        1,

      borderColor:
        "#E2E8F0",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    finishedGameLabel: {

      color:
        "#94A3B8",

      fontSize:
        10,

      textAlign:
        "center",

    },


    finishedGameValue: {

      color:
        "#172554",

      fontSize:
        17,

      fontWeight:
        "800",

      textAlign:
        "center",

      marginTop:
        5,

    },


    finishedGameValueSmall: {

      color:
        "#172554",

      fontSize:
        13,

      fontWeight:
        "800",

      textAlign:
        "center",

      marginTop:
        5,

    },


    nextGameCard: {

      width:
        "100%",

      padding:
        18,

      borderRadius:
        20,

      backgroundColor:
        "#F7F5FF",

      borderWidth:
        1,

      borderColor:
        "#E5E1FF",

      alignItems:
        "center",

      marginTop:
        20,

    },


    nextGameLabel: {

      color:
        "#7B6EF6",

      fontSize:
        11,

      fontWeight:
        "800",

    },


    nextGameName: {

      color:
        "#172554",

      fontSize:
        21,

      fontWeight:
        "800",

      textAlign:
        "center",

      marginTop:
        6,

    },


    nextGameDifficulty: {

      color:
        "#6D5CE7",

      fontSize:
        14,

      fontWeight:
        "700",

      marginTop:
        4,

    },


    nextGameText: {

      color:
        "#64748B",

      textAlign:
        "center",

      lineHeight:
        20,

      marginTop:
        10,

    },


    nextGameButton: {

      width:
        "100%",

      minHeight:
        52,

      borderRadius:
        16,

      backgroundColor:
        "#7B6EF6",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        9,

      marginTop:
        18,

    },


    nextGameButtonText: {

      color:
        "#FFFFFF",

      fontSize:
        15,

      fontWeight:
        "800",

    },


    startGateContainer: {

      width:
        "100%",

      minHeight:
        430,

      padding:
        14,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F7F5FF",

    },


    startGateCard: {

      width:
        "100%",

      paddingVertical:
        28,

      paddingHorizontal:
        20,

      borderRadius:
        22,

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E5E1FF",

    },


    startGateIcon: {

      width:
        64,

      height:
        64,

      borderRadius:
        20,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F0EDFF",

    },


    startGateEyebrow: {

      marginTop:
        20,

      color:
        "#8172EA",

      fontSize:
        10,

      fontWeight:
        "800",

      letterSpacing:
        1.1,

    },


    startGateTitle: {

      marginTop:
        7,

      color:
        "#303253",

      fontSize:
        23,

      lineHeight:
        29,

      fontWeight:
        "800",

      textAlign:
        "center",

    },


    startGateText: {

      marginTop:
        11,

      maxWidth:
        290,

      color:
        "#777A8F",

      fontSize:
        12,

      lineHeight:
        18,

      textAlign:
        "center",

    },


    startGateHint: {

      marginTop:
        7,

      maxWidth:
        300,

      color:
        "#A0A3B4",

      fontSize:
        11,

      lineHeight:
        16,

      textAlign:
        "center",

    },


    startGateDifficulty: {

      marginTop:
        16,

      paddingHorizontal:
        13,

      paddingVertical:
        7,

      borderRadius:
        999,

      backgroundColor:
        "#F7F4FF",

      borderWidth:
        1,

      borderColor:
        "#E5E0FF",

    },


    startGateDifficultyText: {

      color:
        "#7566EB",

      fontSize:
        10,

      fontWeight:
        "700",

    },


    startGateButton: {

      width:
        "100%",

      minHeight:
        52,

      marginTop:
        20,

      paddingHorizontal:
        16,

      borderRadius:
        15,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        8,

      backgroundColor:
        "#7969EA",

    },


    startGateButtonText: {

      flexShrink:
        1,

      color:
        "#FFFFFF",

      fontSize:
        13,

      fontWeight:
        "800",

      textAlign:
        "center",

    },


    startGateFooter: {

      marginTop:
        11,

      color:
        "#A0A3B4",

      fontSize:
        10,

      textAlign:
        "center",

    },


    noGameContainer: {

      minHeight:
        300,

      padding:
        20,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        22,

    },


    noGameTitle: {

      color:
        "#172554",

      fontSize:
        22,

      fontWeight:
        "800",

      textAlign:
        "center",

      marginTop:
        15,

    },


    noGameText: {

      color:
        "#64748B",

      textAlign:
        "center",

      lineHeight:
        20,

      marginTop:
        7,

    },


    finishedReportDocument: {

      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        "#E7E7EF",

      borderRadius:
        24,

      backgroundColor:
        "#FFFFFF",

    },


    finishedReportTopbar: {

      minHeight:
        66,

      paddingHorizontal:
        18,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        12,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#ECECF4",

      backgroundColor:
        "#FFFFFF",

    },


    finishedReportBrand: {

      flex:
        1,

      minWidth:
        0,

    },


    finishedReportBrandName: {

      color:
        "#7465E8",

      fontSize:
        9,

      fontWeight:
        "800",

      letterSpacing:
        1,

    },


    finishedReportBrandSubtitle: {

      marginTop:
        3,

      color:
        "#7A7D91",

      fontSize:
        10,

      fontWeight:
        "700",

    },


    finishedReportDownloadButton: {

      minHeight:
        41,

      paddingHorizontal:
        13,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        7,

      borderRadius:
        12,

      backgroundColor:
        "#7465E8",

    },


    finishedReportDownloadText: {

      color:
        "#FFFFFF",

      fontSize:
        10,

      fontWeight:
        "800",

    },


    finishedReportHero: {

      padding:
        18,

      flexDirection:
        "row",

      alignItems:
        "stretch",

      gap:
        13,

      backgroundColor:
        "#FCFCFF",

    },


    finishedReportHeroCopy: {

      flex:
        1,

      minWidth:
        0,

      justifyContent:
        "center",

    },


    finishedReportEyebrow: {

      color:
        "#8B7CE3",

      fontSize:
        8.5,

      fontWeight:
        "800",

      letterSpacing:
        0.8,

    },


    finishedReportChildName: {

      marginTop:
        7,

      color:
        "#2E3054",

      fontSize:
        22,

      lineHeight:
        27,

      fontWeight:
        "800",

    },


    finishedReportSessionId: {

      marginTop:
        5,

      color:
        "#999CAD",

      fontSize:
        9.5,

      fontWeight:
        "600",

    },


    finishedReportScorePanel: {

      width:
        118,

      flexShrink:
        0,

      paddingHorizontal:
        14,

      paddingVertical:
        15,

      justifyContent:
        "center",

      borderRadius:
        18,

      backgroundColor:
        "#7968ED",

    },


    finishedReportScoreLabel: {

      color:
        "rgba(255,255,255,0.78)",

      fontSize:
        8.5,

      fontWeight:
        "700",

    },


    finishedReportScoreValue: {

      marginTop:
        4,

      color:
        "#FFFFFF",

      fontSize:
        29,

      lineHeight:
        33,

      fontWeight:
        "800",

    },


    finishedReportScoreCaption: {

      marginTop:
        5,

      color:
        "rgba(255,255,255,0.66)",

      fontSize:
        7.5,

    },


    finishedReportFacts: {

      marginHorizontal:
        18,

      marginTop:
        15,

      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        "#E9E8F0",

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",

    },


    finishedReportFactRow: {

      minHeight:
        49,

      paddingHorizontal:
        14,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        14,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#EFEFF4",

    },


    finishedReportFactRowLast: {

      borderBottomWidth:
        0,

    },


    finishedReportFactLabel: {

      color:
        "#999CAD",

      fontSize:
        9,

      fontWeight:
        "650",

    },


    finishedReportFactValue: {

      flex:
        1,

      color:
        "#454760",

      fontSize:
        10.5,

      lineHeight:
        15,

      fontWeight:
        "700",

      textAlign:
        "right",

    },


    finishedReportNarrative: {

      marginHorizontal:
        18,

      marginTop:
        12,

      padding:
        14,

      flexDirection:
        "row",

      gap:
        11,

      borderWidth:
        1,

      borderColor:
        "#E9E5FA",

      borderRadius:
        16,

      backgroundColor:
        "#FAF9FF",

    },


    finishedReportNarrativeIcon: {

      width:
        42,

      height:
        42,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        13,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

    },


    finishedReportNarrativeIconCompleted: {

      borderColor:
        "#DCEFE7",

    },


    finishedReportNarrativeIconStopped: {

      borderColor:
        "#F1DDE1",

    },


    finishedReportNarrativeCopy: {

      flex:
        1,

      minWidth:
        0,

    },


    finishedReportNarrativeTitle: {

      color:
        "#3D3F5C",

      fontSize:
        11.5,

      fontWeight:
        "800",

    },


    finishedReportNarrativeText: {

      marginTop:
        5,

      color:
        "#74778C",

      fontSize:
        9.5,

      lineHeight:
        15,

    },


    finishedReportGamesSection: {

      marginTop:
        21,

      paddingHorizontal:
        18,

      paddingBottom:
        18,

    },


    finishedReportSectionHeading: {

      flexDirection:
        "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",

      gap:
        12,

      marginBottom:
        13,

    },


    finishedReportSectionCopy: {

      flex:
        1,

      minWidth:
        0,

    },


    finishedReportSectionEyebrow: {

      color:
        "#8B7CE3",

      fontSize:
        8,

      fontWeight:
        "800",

      letterSpacing:
        0.8,

    },


    finishedReportSectionTitle: {

      marginTop:
        5,

      color:
        "#343653",

      fontSize:
        17,

      fontWeight:
        "800",

    },


    finishedReportSectionSubtitle: {

      marginTop:
        4,

      color:
        "#999CAD",

      fontSize:
        9,

      lineHeight:
        14,

    },


    finishedReportGameCount: {

      minHeight:
        30,

      paddingHorizontal:
        10,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        999,

      backgroundColor:
        "#F0EDFF",

    },


    finishedReportGameCountText: {

      color:
        "#7465E8",

      fontSize:
        8.5,

      fontWeight:
        "800",

    },


    finishedReportGamesList: {

      gap:
        10,

    },


    finishedReportGameCard: {

      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        "#E8E8F0",

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",

    },


    finishedReportGameHeader: {

      padding:
        13,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        10,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#EFEFF4",

      backgroundColor:
        "#FCFCFE",

    },


    finishedReportGameIdentity: {

      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

    },


    finishedReportGameNumber: {

      width:
        34,

      height:
        34,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,

      backgroundColor:
        "#F0EDFF",

    },


    finishedReportGameNumberText: {

      color:
        "#7465E8",

      fontSize:
        9,

      fontWeight:
        "800",

    },


    finishedReportGameCopy: {

      flex:
        1,

      minWidth:
        0,

    },


    finishedReportGameName: {

      color:
        "#3F415C",

      fontSize:
        11,

      fontWeight:
        "800",

    },


    finishedReportGameDifficulty: {

      marginTop:
        3,

      color:
        "#999CAD",

      fontSize:
        8.5,

    },


    finishedReportGameStatus: {

      paddingHorizontal:
        8,

      paddingVertical:
        5,

      borderRadius:
        999,

    },


    finishedReportGameStatusText: {

      fontSize:
        8,

      fontWeight:
        "800",

    },


    finishedReportMetrics: {

      paddingHorizontal:
        13,

    },


    finishedReportMetricRow: {

      minHeight:
        43,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        12,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#F0F0F4",

    },


    finishedReportMetricRowLast: {

      borderBottomWidth:
        0,

    },


    finishedReportMetricLabel: {

      color:
        "#999CAD",

      fontSize:
        9,

    },


    finishedReportMetricValue: {

      color:
        "#44465F",

      fontSize:
        10,

      fontWeight:
        "800",

    },


    finishedReportEmpty: {

      padding:
        24,

      alignItems:
        "center",

      borderRadius:
        15,

      backgroundColor:
        "#F8F8FB",

    },


    finishedReportEmptyText: {

      color:
        "#999CAD",

      fontSize:
        10,

      textAlign:
        "center",

    },


    finishedReportFooter: {

      minHeight:
        49,

      paddingHorizontal:
        18,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        12,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEEEF4",

      backgroundColor:
        "#FAFAFC",

    },


    finishedReportFooterText: {

      color:
        "#A0A3B4",

      fontSize:
        8,

      fontWeight:
        "650",

    },


    finishedReportActions: {

      padding:
        16,

      gap:
        9,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEEEF4",

      backgroundColor:
        "#FFFFFF",

    },

  });