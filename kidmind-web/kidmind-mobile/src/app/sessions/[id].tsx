import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from "react-native";
import { useEffect, useState, } from "react";
import { router, useLocalSearchParams, } from "expo-router";
import { ArrowLeft, Brain, Clock, Pause, Play, Square, Target, } from "lucide-react-native";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import MemoryMatch from "@/components/games/memory/MemoryMatch";
import FocusFinder from "@/components/games/focus/FocusFinder";
import PuzzlePath from "@/components/games/puzzle/PuzzlePath";
import ReadingAdventure from "@/components/games/reading/ReadingAdventure";
import QuickMatch from "@/components/games/quickMatch/QuickMatch";
import { completeSessionGame, endSession, getSessionById, pauseSession, resumeSession, startSessionGame, } from "@/api/sessionsApi";
import type { CompleteGamePayload, Session, SessionGameStatus, } from "@/api/sessionsApi";
import CustomGamePlayer from "@/components/games/custom/CustomGamePlayer";

type GameResult = Omit<CompleteGamePayload, "session_duration_seconds">;
type PendingGameResult = {
    gameId: number;
    gameResult: GameResult;
};
const formatTime = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
const formatDate = (value: unknown) => {
    if (!value) {
        return "—";
    }
    const date = new Date(String(value).replace(" ", "T"));
    if (Number.isNaN(date.getTime())) {
        return "—";
    }
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};
const formatPercent = (value: unknown) => {
    if (value === null ||
        value === undefined ||
        value === "") {
        return "—";
    }
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return "—";
    }
    return `${Math.round(numericValue)}%`;
};
const formatMetricNumber = (value: unknown) => {
    if (value === null ||
        value === undefined ||
        value === "") {
        return "—";
    }
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return "—";
    }
    return String(Math.round(numericValue));
};
const formatReactionTime = (value: unknown) => {
    if (value === null ||
        value === undefined ||
        value === "") {
        return "—";
    }
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return "—";
    }
    return `${numericValue.toFixed(2)}s`;
};
const getStatusColors = (status: SessionGameStatus) => {
    if (status ===
        "In Progress") {
        return {
            backgroundColor: "#DCFCE7",
            color: "#15803D",
        };
    }
    if (status ===
        "Pending") {
        return {
            backgroundColor: "#F1F5F9",
            color: "#475569",
        };
    }
    if (status ===
        "Paused") {
        return {
            backgroundColor: "#FEF3C7",
            color: "#B45309",
        };
    }
    if (status ===
        "Completed") {
        return {
            backgroundColor: "#DBEAFE",
            color: "#1D4ED8",
        };
    }
    return {
        backgroundColor: "#FEE2E2",
        color: "#B91C1C",
    };
};
export default function SessionPage() {
    const params = useLocalSearchParams<{
        id?: string | string[];
    }>();
    const idValue = Array.isArray(params.id)
        ? params.id[0]
        : params.id;
    const sessionId = Number(idValue);
    const [sidebarVisible, setSidebarVisible,] = useState(false);
    const [session, setSession,] = useState<Session | null>(null);
    const [loading, setLoading,] = useState(true);
    const [error, setError,] = useState("");
    const [elapsedSeconds, setElapsedSeconds,] = useState(0);
    const [running, setRunning,] = useState(false);
    const [actionLoading, setActionLoading,] = useState(false);
    const [gameSaving, setGameSaving,] = useState(false);
    const [gameSaveError, setGameSaveError,] = useState("");
    const [pendingGameResult, setPendingGameResult,] = useState<PendingGameResult | null>(null);
    const [recentlyFinishedGameId, setRecentlyFinishedGameId,] = useState<number | null>(null);
    useEffect(() => {
        const loadSession = async () => {
            if (!Number.isInteger(sessionId) ||
                sessionId <= 0) {
                setError("Invalid session ID");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError("");
                const data = await getSessionById(sessionId);
                setSession(data);
                let startingSeconds = Number(data.duration_seconds) || 0;
                if (data.started_at &&
                    data.status ===
                        "In Progress") {
                    const startedAt = new Date(String(data.started_at).replace(" ", "T")).getTime();
                    if (Number.isFinite(startedAt)) {
                        const elapsedFromStart = Math.max(0, Math.floor((Date.now() -
                            startedAt) / 1000));
                        startingSeconds =
                            Math.max(startingSeconds, elapsedFromStart);
                    }
                }
                setElapsedSeconds(startingSeconds);
                setRunning(data.status ===
                    "In Progress");
                setGameSaveError("");
                setPendingGameResult(null);
                setRecentlyFinishedGameId(null);
            }
            catch (loadError) {
                console.error("Failed to load session:", loadError);
                setError(loadError instanceof Error
                    ? loadError.message
                    : "Failed to load session");
            }
            finally {
                setLoading(false);
            }
        };
        loadSession();
    }, [
        sessionId,
    ]);
    useEffect(() => {
        if (!running) {
            return;
        }
        const timer = setInterval(() => {
            setElapsedSeconds((currentSeconds) => currentSeconds + 1);
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, [
        running,
    ]);
    const games = Array.isArray(session?.games)
        ? session.games
        : [];
    const currentGame = games.find((game) => game.status ===
        "In Progress" ||
        game.status ===
            "Paused") || null;
    const pendingGame = games.find((game) => game.status ===
        "Pending") || null;
    const finishedGames = games.filter((game) => game.status ===
        "Completed" ||
        game.status ===
            "Failed" ||
        game.status ===
            "Ended");
    const recentlyFinishedGame = recentlyFinishedGameId
        ? games.find((game) => game.id ===
            recentlyFinishedGameId) || null
        : null;
    const lastFinishedGame = recentlyFinishedGame ||
        (finishedGames.length > 0
            ? finishedGames[finishedGames.length -
                1]
            : null);
    const isFinished = session?.status ===
        "Completed" ||
        session?.status ===
            "Ended" ||
        session?.status ===
            "Cancelled";
    const displayedScore = session?.score ??
        lastFinishedGame?.score ??
        null;
    const displayedDifficulty = currentGame?.difficulty ||
        pendingGame?.difficulty ||
        lastFinishedGame
            ?.difficulty ||
        session?.difficulty ||
        "Not set";
    const goBackToChild = () => {
        if (session) {
            router.push({
                pathname: "/children/[id]",
                params: {
                    id: String(session.child_id),
                },
            });
            return;
        }
        router.back();
    };
    const handlePauseResume = async () => {
        if (!session ||
            actionLoading ||
            gameSaving ||
            isFinished) {
            return;
        }
        try {
            setActionLoading(true);
            const result = running
                ? await pauseSession(session.id, elapsedSeconds)
                : await resumeSession(session.id, elapsedSeconds);
            setSession(result.session);
            setRunning(result.session.status ===
                "In Progress");
        }
        catch (actionError) {
            console.error("Failed to update session:", actionError);
            Alert.alert("Session Error", actionError instanceof Error
                ? actionError.message
                : "Failed to update session");
        }
        finally {
            setActionLoading(false);
        }
    };
    const performEndSession = async () => {
        if (!session ||
            actionLoading ||
            gameSaving ||
            isFinished) {
            return;
        }
        try {
            setActionLoading(true);
            setRunning(false);
            const result = await endSession(session.id, elapsedSeconds);
            setSession(result.session);
            setElapsedSeconds(Number(result.session
                .duration_seconds) ||
                elapsedSeconds);
            setPendingGameResult(null);
            setGameSaveError("");
            Alert.alert("Session Ended", "Session ended successfully.");
        }
        catch (actionError) {
            console.error("Failed to end session:", actionError);
            setRunning(session.status ===
                "In Progress");
            Alert.alert("Session Error", actionError instanceof Error
                ? actionError.message
                : "Failed to end session");
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleEndSession = () => {
        if (!session ||
            actionLoading ||
            gameSaving ||
            isFinished) {
            return;
        }
        Alert.alert("End Session", "Are you sure you want to end this session? The session status will become Ended.", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "End Session",
                style: "destructive",
                onPress: () => {
                    void performEndSession();
                },
            },
        ]);
    };
    const submitGameResult = async (gameId: number, gameResult: GameResult) => {
        if (!session ||
            gameSaving) {
            return;
        }
        try {
            setGameSaving(true);
            setGameSaveError("");
            const result = await completeSessionGame(session.id, gameId, {
                ...gameResult,
                session_duration_seconds: elapsedSeconds,
            });
            setSession(result.session);
            setRecentlyFinishedGameId(gameId);
            setPendingGameResult(null);
            if (result.all_games_completed) {
                setRunning(false);
                setElapsedSeconds(Number(result.session
                    .duration_seconds) ||
                    elapsedSeconds);
            }
            else {
                setRunning(result.session.status ===
                    "In Progress");
            }
        }
        catch (saveError) {
            console.error("Failed to save game result:", saveError);
            setGameSaveError(saveError instanceof Error
                ? saveError.message
                : "Failed to save game result");
        }
        finally {
            setGameSaving(false);
        }
    };
    const handleGameComplete = async (gameResult: GameResult) => {
        if (!currentGame ||
            gameSaving) {
            return;
        }
        const pendingResult: PendingGameResult = {
            gameId: currentGame.id,
            gameResult,
        };
        setPendingGameResult(pendingResult);
        await submitGameResult(pendingResult.gameId, pendingResult.gameResult);
    };
    const handleRetrySave = async () => {
        if (!pendingGameResult ||
            gameSaving) {
            return;
        }
        await submitGameResult(pendingGameResult.gameId, pendingGameResult
            .gameResult);
    };
    const handleStartNextGame = async () => {
        if (!session ||
            !pendingGame ||
            actionLoading ||
            gameSaving ||
            isFinished) {
            return;
        }
        try {
            setActionLoading(true);
            setGameSaveError("");
            let activeSession = session;
            if (session.status ===
                "Paused") {
                const resumed = await resumeSession(session.id, elapsedSeconds);
                activeSession =
                    resumed.session;
                setSession(resumed.session);
                setRunning(true);
            }
            const result = await startSessionGame(activeSession.id, pendingGame.id);
            setSession(result.session);
            setRecentlyFinishedGameId(null);
            setPendingGameResult(null);
            setRunning(result.session.status ===
                "In Progress");
        }
        catch (actionError) {
            console.error("Failed to start next game:", actionError);
            Alert.alert("Game Error", actionError instanceof Error
                ? actionError.message
                : "Failed to start next game");
        }
        finally {
            setActionLoading(false);
        }
    };
    const renderFinishedSession = () => {
        if (!session) {
            return null;
        }
        const sessionDetails = session as Session & {
            ended_at?: string | null;
            scheduled_at?: string | null;
            created_at?: string | null;
        };
        const reportDate = sessionDetails.ended_at ||
            session.started_at ||
            sessionDetails.scheduled_at ||
            sessionDetails.created_at;
        const completed = session.status ===
            "Completed";
        const reportTitle = completed
            ? "Session Completed"
            : session.status ===
                "Ended"
                ? "Session Ended"
                : "Session Cancelled";
        const reportText = completed
            ? "All selected games were completed and the results were saved."
            : session.status ===
                "Ended"
                ? "This session was ended manually. Results completed before the session ended are shown below."
                : "This session was cancelled before completion. Any saved game results are shown below.";
        return (<View style={styles.reportContainer}>

          <View style={[
                styles.reportHero,
                completed
                    ? styles.reportHeroCompleted
                    : styles.reportHeroStopped,
            ]}>

            <View style={[
                styles.reportIcon,
                completed
                    ? styles.reportIconCompleted
                    : styles.reportIconStopped,
            ]}>

              {completed ? (<Target size={36} color="#16A34A"/>) : (<Square size={31} color="#EF4444"/>)}

            </View>


            <Text style={styles.reportTitle}>
              {reportTitle}
            </Text>


            <Text style={styles.reportText}>
              {reportText}
            </Text>


            <View style={styles.reportDateCard}>

              <Clock size={17} color="#7B6EF6"/>


              <View style={styles.reportDateTextBox}>

                <Text style={styles.reportDateLabel}>
                  Session Date
                </Text>


                <Text style={styles.reportDateValue}>
                  {formatDate(reportDate)}
                </Text>

              </View>

            </View>

          </View>


          <View style={styles.reportGamesSection}>

            <Text style={styles.reportSectionTitle}>
              Game Results
            </Text>


            <Text style={styles.reportSectionSubtitle}>
              Detailed results saved for each selected game.
            </Text>


            <View style={styles.reportGamesList}>

              {games.map((game, index) => {
                const colors = getStatusColors(game.status);
                const reportGame = game as typeof game & {
                    accuracy?: number | string | null;
                    mistakes?: number | string | null;
                    reaction_time?: number | string | null;
                };
                return (<View key={game.id} style={styles.reportGameCard}>

                      <View style={styles.reportGameHeader}>

                        <View style={styles.reportGameIdentity}>

                          <View style={styles.reportGameNumber}>

                            <Text style={styles.reportGameNumberText}>
                              {index + 1}
                            </Text>

                          </View>


                          <View style={styles.reportGameTextBox}>

                            <Text style={styles.reportGameName}>
                              {game.game_name}
                            </Text>


                            <Text style={styles.reportGameDifficulty}>
                              {game.difficulty ||
                        "No difficulty"}
                            </Text>

                          </View>

                        </View>


                        <View style={[
                        styles.reportGameStatus,
                        {
                            backgroundColor: colors.backgroundColor,
                        },
                    ]}>

                          <Text style={[
                        styles.reportGameStatusText,
                        {
                            color: colors.color,
                        },
                    ]}>
                            {game.status}
                          </Text>

                        </View>

                      </View>


                      <View style={styles.reportMetricsGrid}>

                        <View style={styles.reportMetricCard}>

                          <Text style={styles.reportMetricLabel}>
                            Score
                          </Text>


                          <Text style={styles.reportMetricValue}>
                            {formatPercent(game.score)}
                          </Text>

                        </View>


                        <View style={styles.reportMetricCard}>

                          <Text style={styles.reportMetricLabel}>
                            Accuracy
                          </Text>


                          <Text style={styles.reportMetricValue}>
                            {formatPercent(reportGame.accuracy)}
                          </Text>

                        </View>


                        <View style={styles.reportMetricCard}>

                          <Text style={styles.reportMetricLabel}>
                            Mistakes
                          </Text>


                          <Text style={styles.reportMetricValue}>
                            {formatMetricNumber(reportGame.mistakes)}
                          </Text>

                        </View>


                        <View style={styles.reportMetricCard}>

                          <Text style={styles.reportMetricLabel}>
                            Reaction Time
                          </Text>


                          <Text style={styles.reportMetricValueSmall}>
                            {formatReactionTime(reportGame
                        .reaction_time)}
                          </Text>

                        </View>


                        <View style={[
                        styles.reportMetricCard,
                        styles.reportMetricCardWide,
                    ]}>

                          <Text style={styles.reportMetricLabel}>
                            Game Time
                          </Text>


                          <Text style={styles.reportMetricValueSmall}>
                            {formatTime(game
                        .duration_seconds)}
                          </Text>

                        </View>

                      </View>

                    </View>);
            })}

            </View>


            {games.length ===
                0 && (<View style={styles.reportEmptyBox}>

                <Text style={styles.reportEmptyText}>
                  No game results are available for this session.
                </Text>

              </View>)}

          </View>


          <View style={styles.reportActions}>

            <TouchableOpacity style={styles.backToSessionsButton} onPress={() => {
                router.push("/sessions");
            }}>

              <Text style={styles.backToSessionsButtonText}>
                Back to Sessions
              </Text>

            </TouchableOpacity>


            <TouchableOpacity style={styles.backToChildButton} onPress={goBackToChild}>

              <Text style={styles.backToChildButtonText}>
                Back to Child Profile
              </Text>

            </TouchableOpacity>

          </View>

        </View>);
    };
    const renderBetweenGames = () => {
        return (<View style={styles.betweenGamesContainer}>

          <View style={styles.finishedIcon}>

            <Target size={39} color="#16A34A"/>

          </View>


          <Text style={styles.finishedTitle}>
            Game Finished
          </Text>


          {lastFinishedGame && (<View style={styles.finishedGameSummary}>

              <View style={styles.finishedGameMetric}>

                <Text style={styles.finishedGameLabel}>
                  Game
                </Text>


                <Text style={styles.finishedGameValueSmall}>
                  {lastFinishedGame
                    .game_name}
                </Text>

              </View>


              <View style={styles.finishedGameMetric}>

                <Text style={styles.finishedGameLabel}>
                  Score
                </Text>


                <Text style={styles.finishedGameValue}>
                  {lastFinishedGame
                    .score ?? 0}%
                </Text>

              </View>


              <View style={styles.finishedGameMetric}>

                <Text style={styles.finishedGameLabel}>
                  Game Time
                </Text>


                <Text style={styles.finishedGameValue}>
                  {formatTime(lastFinishedGame
                    .duration_seconds)}
                </Text>

              </View>

            </View>)}


          {pendingGame ? (<>

              <View style={styles.nextGameCard}>

                <Text style={styles.nextGameLabel}>
                  NEXT GAME
                </Text>


                <Text style={styles.nextGameName}>
                  {pendingGame
                    .game_name}
                </Text>


                <Text style={styles.nextGameDifficulty}>
                  {pendingGame
                    .difficulty ||
                    "Level 1"}
                </Text>


                <Text style={styles.nextGameText}>
                  The next game timer will begin from zero while the session timer continues.
                </Text>

              </View>


              <TouchableOpacity style={[
                    styles.nextGameButton,
                    (actionLoading ||
                        gameSaving) &&
                        styles.disabledButton,
                ]} disabled={actionLoading ||
                    gameSaving} onPress={handleStartNextGame}>

                {actionLoading ? (<ActivityIndicator size="small" color="#FFFFFF"/>) : (<Play size={19} color="#FFFFFF"/>)}


                <Text style={styles.nextGameButtonText}>
                  {actionLoading
                    ? "Starting..."
                    : `Play ${pendingGame.game_name}`}
                </Text>

              </TouchableOpacity>

            </>) : (<Text style={styles.finishedText}>
              No pending game remains.
            </Text>)}

        </View>);
    };
    const renderSelectedGame = () => {
        if (isFinished) {
            return renderFinishedSession();
        }
        if (!currentGame &&
            (pendingGame ||
                lastFinishedGame)) {
            return renderBetweenGames();
        }
        if (!currentGame) {
            return (<View style={styles.noGameContainer}>

            <Brain size={52} color="#7B6EF6"/>


            <Text style={styles.noGameTitle}>
              No Active Game
            </Text>


            <Text style={styles.noGameText}>
              This session does not have an active game.
            </Text>

          </View>);
        }
        const gameName = currentGame
            .game_name
            ?.trim()
            .toLowerCase();
        const gameDifficulty = currentGame
            .difficulty ||
            "Level 1";
        const gamePaused = !running ||
            actionLoading;

        
        if (
  currentGame.custom_game_id
) {

  return (
    <CustomGamePlayer
      key={
        currentGame.id
      }
      customGameId={
        Number(
          currentGame.custom_game_id
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
        if (gameName ===
            "memory match") {
            return (<MemoryMatch key={currentGame.id} embedded difficulty={gameDifficulty} paused={gamePaused} onComplete={handleGameComplete}/>);
        }
        if (gameName ===
            "focus finder") {
            return (<FocusFinder key={currentGame.id} embedded difficulty={gameDifficulty} paused={gamePaused} onComplete={handleGameComplete}/>);
        }
        if (gameName ===
            "puzzle path") {
            return (<PuzzlePath key={currentGame.id} embedded difficulty={gameDifficulty} paused={gamePaused} onComplete={handleGameComplete}/>);
        }
        if (gameName ===
            "reading adventure") {
            return (<ReadingAdventure key={currentGame.id} embedded difficulty={gameDifficulty} paused={gamePaused} onComplete={handleGameComplete}/>);
        }
        if (gameName ===
            "quick match") {
            return (<QuickMatch key={currentGame.id} embedded difficulty={gameDifficulty} paused={gamePaused} onComplete={handleGameComplete}/>);
        }
        return (<View style={styles.noGameContainer}>

          <Brain size={52} color="#7B6EF6"/>


          <Text style={styles.noGameTitle}>
            {currentGame
                .game_name}
          </Text>


          <Text style={styles.noGameText}>
            This game is not connected yet.
          </Text>

        </View>);
    };
    return (<View style={styles.container}>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <Navbar onMenuPress={() => {
            setSidebarVisible(true);
        }}/>


        <TouchableOpacity style={styles.backButton} onPress={goBackToChild}>

          <ArrowLeft size={20} color="#7B6EF6"/>


          <Text style={styles.backText}>
            Back to Child Profile
          </Text>

        </TouchableOpacity>


        {loading && (<View style={styles.loadingBox}>

            <ActivityIndicator size="large" color="#7B6EF6"/>


            <Text style={styles.loadingText}>
              Loading session...
            </Text>

          </View>)}


        {!loading &&
            error && (<View style={styles.errorBox}>

            <Text style={styles.errorTitle}>
              Unable to load session
            </Text>


            <Text style={styles.errorText}>
              {error}
            </Text>

          </View>)}


        {!loading &&
            !error &&
            session && (<>

            <View style={styles.headerCard}>

              <View style={styles.headerTop}>

                <View style={styles.headerTextBox}>

                  <Text style={styles.title}>
                    {isFinished
                ? "Session Report"
                : "Assessment Session"}
                  </Text>


                  <Text style={styles.subtitle}>
                    Child:{" "}
                    {session
                .child_name}
                  </Text>


                  <Text style={styles.sessionId}>
                    Session #
                    {session.id}
                  </Text>

                </View>


                <View style={styles.timerCard}>

                  <Clock size={19} color="#7B6EF6"/>


                  <Text style={styles.timerLabel}>
                    Session Time
                  </Text>


                  <Text style={styles.timerValue}>
                    {formatTime(elapsedSeconds)}
                  </Text>

                </View>

              </View>


              <View style={[
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
            ]}>

                <Text style={[
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
            ]}>
                  {session.status}
                </Text>

              </View>

            </View>


            <View style={styles.summaryRow}>

              <View style={styles.summaryCard}>

                <Target size={24} color="#7B6EF6"/>


                <Text style={styles.summaryLabel}>
                  Games
                </Text>


                <Text style={styles.summaryValue}>
                  {finishedGames.length}
                  /
                  {games.length}
                </Text>

              </View>


              <View style={styles.summaryCard}>

                <Brain size={24} color="#16A34A"/>


                <Text style={styles.summaryLabel}>
                  Difficulty
                </Text>


                <Text style={styles.summaryValueSmall}>
                  {displayedDifficulty}
                </Text>

              </View>

            </View>


            <View style={styles.summaryRow}>

              <View style={[
                styles.summaryCard,
                styles.scoreSummaryCard,
            ]}>

                <Target size={24} color="#7B6EF6"/>


                <Text style={styles.summaryLabel}>
                  Score
                </Text>


                <Text style={styles.summaryValue}>
                  {displayedScore !==
                null
                ? `${displayedScore}%`
                : "—"}
                </Text>

              </View>


              <View style={[
                styles.summaryCard,
                styles.durationSummaryCard,
            ]}>

                <Clock size={24} color="#3B82F6"/>


                <Text style={styles.summaryLabel}>
                  Duration
                </Text>


                <Text style={styles.summaryValueSmall}>
                  {formatTime(elapsedSeconds)}
                </Text>

              </View>

            </View>


            {!isFinished && (<View style={styles.gamesSection}>

              <Text style={styles.sectionTitle}>
                Selected Games
              </Text>


              <Text style={styles.sectionSubtitle}>
                The active game is marked In Progress. The remaining games stay Pending until their turn.
              </Text>


              <View style={styles.gamesList}>

                {games.map((game, index) => {
                    const colors = getStatusColors(game.status);
                    return (<View key={game.id} style={styles.gameCard}>

                        <View style={styles.gameNumberBox}>

                          <Text style={styles.gameNumberText}>
                            {index + 1}
                          </Text>

                        </View>


                        <View style={styles.gameTextBox}>

                          <Text style={styles.gameName}>
                            {game
                            .game_name}
                          </Text>


                          <Text style={styles.gameDifficulty}>
                            {game.difficulty ||
                            "No difficulty"}
                          </Text>

                        </View>


                        <View style={[
                            styles.gameStatus,
                            {
                                backgroundColor: colors.backgroundColor,
                            },
                        ]}>

                          <Text style={[
                            styles.gameStatusText,
                            {
                                color: colors.color,
                            },
                        ]}>
                            {game.status}
                          </Text>

                        </View>

                      </View>);
                })}

              </View>

            </View>)}


            {session.status ===
                "Paused" &&
                !isFinished && (<View style={styles.sessionPausedBox}>

                <Pause size={19} color="#B45309"/>


                <Text style={styles.sessionPausedText}>
                  Session Paused
                </Text>

              </View>)}


            <View style={styles.playerSection}>

              {renderSelectedGame()}


              {gameSaving && (<View style={styles.savingOverlay}>

                  <View style={styles.savingCard}>

                    <ActivityIndicator size="large" color="#7B6EF6"/>


                    <Text style={styles.savingText}>
                      Saving game result...
                    </Text>

                  </View>

                </View>)}

            </View>


            {gameSaveError !==
                "" && (<View style={styles.gameSaveErrorBox}>

                <Text style={styles.gameSaveErrorText}>
                  {gameSaveError}
                </Text>


                <TouchableOpacity style={[
                    styles.retryButton,
                    gameSaving &&
                        styles.disabledButton,
                ]} disabled={gameSaving} onPress={handleRetrySave}>

                  {gameSaving ? (<ActivityIndicator size="small" color="#FFFFFF"/>) : (<Text style={styles.retryButtonText}>
                      Retry Saving
                    </Text>)}

                </TouchableOpacity>

              </View>)}


            {!isFinished && (<View style={styles.controlsContainer}>

                <TouchableOpacity style={[
                    styles.pauseButton,
                    (actionLoading ||
                        gameSaving) &&
                        styles.disabledButton,
                ]} disabled={actionLoading ||
                    gameSaving} onPress={handlePauseResume}>

                  {actionLoading ? (<ActivityIndicator size="small" color="#FFFFFF"/>) : running ? (<Pause size={25} color="#FFFFFF"/>) : (<Play size={25} color="#FFFFFF"/>)}

                </TouchableOpacity>


                <TouchableOpacity style={[
                    styles.endButton,
                    (actionLoading ||
                        gameSaving) &&
                        styles.disabledButton,
                ]} disabled={actionLoading ||
                    gameSaving} onPress={handleEndSession}>

                  <Square size={25} color="#EF4444"/>

                </TouchableOpacity>

              </View>)}

          </>)}

      </ScrollView>


      <Sidebar visible={sidebarVisible} onClose={() => {
            setSidebarVisible(false);
        }}/>

    </View>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F8FC",
    },
    content: {
        padding: 20,
        paddingBottom: 60,
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
        fontWeight: "700",
    },
    loadingBox: {
        minHeight: 380,
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
    },
    loadingText: {
        color: "#64748B",
    },
    errorBox: {
        padding: 22,
        borderRadius: 18,
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    errorTitle: {
        color: "#B91C1C",
        fontSize: 18,
        fontWeight: "800",
    },
    errorText: {
        color: "#B91C1C",
        marginTop: 7,
    },
    headerCard: {
        padding: 20,
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 14,
    },
    headerTextBox: {
        flex: 1,
    },
    title: {
        color: "#172554",
        fontSize: 23,
        fontWeight: "800",
    },
    subtitle: {
        color: "#64748B",
        marginTop: 6,
    },
    sessionId: {
        color: "#94A3B8",
        fontSize: 12,
        marginTop: 4,
    },
    timerCard: {
        minWidth: 115,
        padding: 12,
        borderRadius: 16,
        backgroundColor: "#EEE9FF",
        alignItems: "center",
        gap: 3,
    },
    timerLabel: {
        color: "#6D5CE7",
        fontSize: 11,
        fontWeight: "700",
    },
    timerValue: {
        color: "#5B4BD8",
        fontSize: 21,
        fontWeight: "800",
    },
    sessionStatus: {
        alignSelf: "flex-start",
        marginTop: 16,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },
    sessionStatusRunning: {
        backgroundColor: "#DCFCE7",
    },
    sessionStatusPaused: {
        backgroundColor: "#FEF3C7",
    },
    sessionStatusCompleted: {
        backgroundColor: "#DBEAFE",
    },
    sessionStatusOther: {
        backgroundColor: "#FEE2E2",
    },
    sessionStatusText: {
        fontSize: 12,
        fontWeight: "800",
    },
    sessionStatusTextRunning: {
        color: "#15803D",
    },
    sessionStatusTextPaused: {
        color: "#B45309",
    },
    sessionStatusTextCompleted: {
        color: "#1D4ED8",
    },
    sessionStatusTextOther: {
        color: "#B91C1C",
    },
    summaryRow: {
        flexDirection: "row",
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        minHeight: 120,
        padding: 17,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    scoreSummaryCard: {
        backgroundColor: "#F7F5FF",
        borderColor: "#E5E1FF",
    },
    durationSummaryCard: {
        backgroundColor: "#F0F9FF",
        borderColor: "#DBEAFE",
    },
    summaryLabel: {
        color: "#64748B",
        marginTop: 10,
    },
    summaryValue: {
        color: "#172554",
        fontSize: 28,
        fontWeight: "800",
        marginTop: 3,
    },
    summaryValueSmall: {
        color: "#172554",
        fontSize: 17,
        fontWeight: "800",
        marginTop: 5,
    },
    gamesSection: {
        padding: 20,
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    sectionTitle: {
        color: "#172554",
        fontSize: 20,
        fontWeight: "800",
    },
    sectionSubtitle: {
        color: "#64748B",
        lineHeight: 20,
        marginTop: 4,
    },
    gamesList: {
        gap: 12,
        marginTop: 17,
    },
    gameCard: {
        padding: 15,
        borderRadius: 18,
        backgroundColor: "#F8FAFC",
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
    },
    gameNumberBox: {
        width: 37,
        height: 37,
        borderRadius: 12,
        backgroundColor: "#EEE9FF",
        alignItems: "center",
        justifyContent: "center",
    },
    gameNumberText: {
        color: "#6D5CE7",
        fontWeight: "800",
    },
    gameTextBox: {
        flex: 1,
    },
    gameName: {
        color: "#172554",
        fontSize: 16,
        fontWeight: "800",
    },
    gameDifficulty: {
        color: "#64748B",
        fontSize: 13,
        marginTop: 3,
    },
    gameStatus: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        maxWidth: 105,
    },
    gameStatusText: {
        fontSize: 11,
        fontWeight: "800",
        textAlign: "center",
    },
    sessionPausedBox: {
        padding: 14,
        borderRadius: 18,
        backgroundColor: "#FEF3C7",
        borderWidth: 1,
        borderColor: "#FDE68A",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    sessionPausedText: {
        color: "#B45309",
        fontSize: 14,
        fontWeight: "800",
    },
    playerSection: {
        width: "100%",
        borderRadius: 26,
        backgroundColor: "#F7F5FF",
        padding: 8,
        position: "relative",
        overflow: "hidden",
    },
    savingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255,255,255,0.88)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
        elevation: 20,
    },
    savingCard: {
        paddingVertical: 22,
        paddingHorizontal: 28,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E1FF",
        alignItems: "center",
        gap: 12,
    },
    savingText: {
        color: "#6D5CE7",
        fontWeight: "800",
    },
    gameSaveErrorBox: {
        padding: 17,
        borderRadius: 18,
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
        gap: 13,
    },
    gameSaveErrorText: {
        color: "#B91C1C",
        lineHeight: 20,
        fontWeight: "600",
    },
    retryButton: {
        minHeight: 44,
        paddingHorizontal: 18,
        borderRadius: 13,
        backgroundColor: "#DC2626",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-start",
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontWeight: "800",
    },
    controlsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        paddingVertical: 8,
    },
    pauseButton: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: "#7B6EF6",
        alignItems: "center",
        justifyContent: "center",
    },
    endButton: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
    },
    disabledButton: {
        opacity: 0.5,
    },
    finishedContainer: {
        width: "100%",
        minHeight: 330,
        padding: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
    },
    reportContainer: {
        width: "100%",
        gap: 16,
    },
    reportHero: {
        width: "100%",
        padding: 22,
        borderRadius: 22,
        alignItems: "center",
        borderWidth: 1,
    },
    reportHeroCompleted: {
        backgroundColor: "#F0FDF4",
        borderColor: "#BBF7D0",
    },
    reportHeroStopped: {
        backgroundColor: "#FFF7F7",
        borderColor: "#FECACA",
    },
    reportIcon: {
        width: 68,
        height: 68,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    reportIconCompleted: {
        backgroundColor: "#DCFCE7",
    },
    reportIconStopped: {
        backgroundColor: "#FEE2E2",
    },
    reportTitle: {
        color: "#172554",
        fontSize: 24,
        fontWeight: "800",
        textAlign: "center",
        marginTop: 14,
    },
    reportText: {
        color: "#64748B",
        textAlign: "center",
        lineHeight: 21,
        marginTop: 7,
    },
    reportDateCard: {
        width: "100%",
        marginTop: 18,
        padding: 14,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    reportDateTextBox: {
        flex: 1,
    },
    reportDateLabel: {
        color: "#94A3B8",
        fontSize: 11,
        fontWeight: "700",
    },
    reportDateValue: {
        color: "#172554",
        fontSize: 14,
        fontWeight: "800",
        marginTop: 3,
    },
    reportGamesSection: {
        width: "100%",
        padding: 20,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    reportSectionTitle: {
        color: "#172554",
        fontSize: 20,
        fontWeight: "800",
    },
    reportSectionSubtitle: {
        color: "#64748B",
        lineHeight: 20,
        marginTop: 4,
    },
    reportGamesList: {
        gap: 14,
        marginTop: 17,
    },
    reportGameCard: {
        width: "100%",
        padding: 15,
        borderRadius: 18,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    reportGameHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
    },
    reportGameIdentity: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    reportGameNumber: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "#EEE9FF",
        alignItems: "center",
        justifyContent: "center",
    },
    reportGameNumberText: {
        color: "#6D5CE7",
        fontWeight: "800",
    },
    reportGameTextBox: {
        flex: 1,
    },
    reportGameName: {
        color: "#172554",
        fontSize: 16,
        fontWeight: "800",
    },
    reportGameDifficulty: {
        color: "#64748B",
        fontSize: 12,
        marginTop: 3,
    },
    reportGameStatus: {
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 18,
        maxWidth: 100,
    },
    reportGameStatusText: {
        fontSize: 10,
        fontWeight: "800",
        textAlign: "center",
    },
    reportMetricsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 15,
    },
    reportMetricCard: {
        width: "48%",
        minHeight: 72,
        padding: 10,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        alignItems: "center",
        justifyContent: "center",
    },
    reportMetricCardWide: {
        width: "100%",
    },
    reportMetricLabel: {
        color: "#94A3B8",
        fontSize: 10,
        fontWeight: "700",
        textAlign: "center",
    },
    reportMetricValue: {
        color: "#172554",
        fontSize: 20,
        fontWeight: "800",
        marginTop: 4,
    },
    reportMetricValueSmall: {
        color: "#172554",
        fontSize: 16,
        fontWeight: "800",
        marginTop: 4,
    },
    reportEmptyBox: {
        marginTop: 16,
        padding: 18,
        borderRadius: 16,
        backgroundColor: "#F8FAFC",
    },
    reportEmptyText: {
        color: "#64748B",
        textAlign: "center",
        lineHeight: 20,
    },
    reportActions: {
        width: "100%",
        gap: 10,
    },
    backToSessionsButton: {
        minHeight: 50,
        paddingHorizontal: 22,
        borderRadius: 15,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D8D3FF",
        alignItems: "center",
        justifyContent: "center",
    },
    backToSessionsButtonText: {
        color: "#6D5CE7",
        fontWeight: "800",
    },
    betweenGamesContainer: {
        width: "100%",
        minHeight: 360,
        padding: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
    },
    finishedIcon: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: "#DCFCE7",
        alignItems: "center",
        justifyContent: "center",
    },
    finishedIconRed: {
        backgroundColor: "#FEE2E2",
    },
    finishedTitle: {
        color: "#172554",
        fontSize: 25,
        fontWeight: "800",
        textAlign: "center",
        marginTop: 17,
    },
    finishedText: {
        color: "#64748B",
        textAlign: "center",
        lineHeight: 21,
        marginTop: 8,
    },
    finishedScore: {
        color: "#172554",
        fontSize: 18,
        fontWeight: "800",
        marginTop: 14,
    },
    backToChildButton: {
        minHeight: 48,
        paddingHorizontal: 24,
        borderRadius: 15,
        backgroundColor: "#7B6EF6",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 22,
    },
    backToChildButtonText: {
        color: "#FFFFFF",
        fontWeight: "800",
    },
    finishedGameSummary: {
        width: "100%",
        flexDirection: "row",
        gap: 8,
        marginTop: 20,
    },
    finishedGameMetric: {
        flex: 1,
        minHeight: 90,
        padding: 10,
        borderRadius: 16,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        alignItems: "center",
        justifyContent: "center",
    },
    finishedGameLabel: {
        color: "#94A3B8",
        fontSize: 10,
        textAlign: "center",
    },
    finishedGameValue: {
        color: "#172554",
        fontSize: 17,
        fontWeight: "800",
        textAlign: "center",
        marginTop: 5,
    },
    finishedGameValueSmall: {
        color: "#172554",
        fontSize: 13,
        fontWeight: "800",
        textAlign: "center",
        marginTop: 5,
    },
    nextGameCard: {
        width: "100%",
        padding: 18,
        borderRadius: 20,
        backgroundColor: "#F7F5FF",
        borderWidth: 1,
        borderColor: "#E5E1FF",
        alignItems: "center",
        marginTop: 20,
    },
    nextGameLabel: {
        color: "#7B6EF6",
        fontSize: 11,
        fontWeight: "800",
    },
    nextGameName: {
        color: "#172554",
        fontSize: 21,
        fontWeight: "800",
        textAlign: "center",
        marginTop: 6,
    },
    nextGameDifficulty: {
        color: "#6D5CE7",
        fontSize: 14,
        fontWeight: "700",
        marginTop: 4,
    },
    nextGameText: {
        color: "#64748B",
        textAlign: "center",
        lineHeight: 20,
        marginTop: 10,
    },
    nextGameButton: {
        width: "100%",
        minHeight: 52,
        borderRadius: 16,
        backgroundColor: "#7B6EF6",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        marginTop: 18,
    },
    nextGameButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "800",
    },
    noGameContainer: {
        minHeight: 300,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
    },
    noGameTitle: {
        color: "#172554",
        fontSize: 22,
        fontWeight: "800",
        textAlign: "center",
        marginTop: 15,
    },
    noGameText: {
        color: "#64748B",
        textAlign: "center",
        lineHeight: 20,
        marginTop: 7,
    },
});