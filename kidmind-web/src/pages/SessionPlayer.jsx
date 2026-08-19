import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Brain,
  Clock,
  Pause,
  Play,
  Square,
  Target,
} from "lucide-react";

import Sidebar from
  "../components/layout/Sidebar";

import Navbar from
  "../components/layout/Navbar";

import MemoryMatch from
  "./MemoryMatch";

import FocusFinder from
  "./FocusFinder";

import PuzzlePath from
  "../components/games/puzzle/PuzzlePath";

import ReadingAdventure from
  "../components/games/reading/ReadingAdventure";

import QuickMatch from
  "../components/games/quickMatch/QuickMatch";

import {
  completeSessionGame,
  endSession,
  getSessionById,
  pauseSession,
  resumeSession,
  startSessionGame,
} from "../api/sessionsApi";


const SessionPlayer = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [running, setRunning] =
    useState(false);

  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] = useState(0);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    gameSaving,
    setGameSaving,
  ] = useState(false);

  const [
    gameSaveError,
    setGameSaveError,
  ] = useState("");

  const [
    pendingGameResult,
    setPendingGameResult,
  ] = useState(null);

  const [
    recentlyFinishedGameId,
    setRecentlyFinishedGameId,
  ] = useState(null);


  useEffect(() => {

    const loadSession = async () => {

      try {

        setLoading(true);
        setError("");

        const data =
          await getSessionById(id);

        setSession(data);

        let startingSeconds =
          Number(
            data.duration_seconds
          ) || 0;

        if (
          data.started_at &&
          data.status === "In Progress"
        ) {

          const startedAt =
            new Date(
              String(
                data.started_at
              ).replace(" ", "T")
            ).getTime();

          if (
            Number.isFinite(startedAt)
          ) {

            startingSeconds =
              Math.max(
                startingSeconds,
                Math.floor(
                  (
                    Date.now() -
                    startedAt
                  ) / 1000
                )
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

      } catch (loadError) {

        console.error(
          "Failed to load session:",
          loadError
        );

        setError(
          loadError.message ||
          "Failed to load session"
        );

      } finally {

        setLoading(false);

      }

    };

    if (id) {
      loadSession();
    }

  }, [id]);


  useEffect(() => {

    if (!running) {
      return;
    }

    const timer =
      window.setInterval(
        () => {

          setElapsedSeconds(
            (currentSeconds) =>
              currentSeconds + 1
          );

        },
        1000
      );

    return () => {
      window.clearInterval(timer);
    };

  }, [running]);


  const games =
    Array.isArray(session?.games)
      ? session.games
      : [];


  const currentGame =
    games.find(
      (game) =>
        game.status ===
          "In Progress" ||
        game.status === "Paused"
    ) || null;


  const pendingGame =
    games.find(
      (game) =>
        game.status === "Pending"
    ) || null;


  const finishedGames =
    games.filter(
      (game) =>
        game.status ===
          "Completed" ||
        game.status === "Failed" ||
        game.status === "Ended"
    );


  const recentlyFinishedGame =
    recentlyFinishedGameId
      ? games.find(
          (game) =>
            game.id ===
            recentlyFinishedGameId
        ) || null
      : null;


  const lastFinishedGame =
    recentlyFinishedGame ||
    (
      finishedGames.length > 0
        ? finishedGames[
            finishedGames.length - 1
          ]
        : null
    );


  const isFinished =
    session?.status === "Completed" ||
    session?.status === "Ended" ||
    session?.status === "Cancelled";


  const formatTime = (
    totalSeconds
  ) => {

    const safeSeconds =
      Math.max(
        0,
        Math.floor(
          Number(totalSeconds) || 0
        )
      );

    const minutes =
      Math.floor(
        safeSeconds / 60
      );

    const seconds =
      safeSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(
      2,
      "0"
    )}`;

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

        setActionLoading(true);

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

      } catch (actionError) {

        console.error(
          "Failed to update session:",
          actionError
        );

        window.alert(
          actionError.message ||
          "Failed to update session"
        );

      } finally {

        setActionLoading(false);

      }

    };


  const handleEndSession =
    async () => {

      if (
        !session ||
        actionLoading ||
        gameSaving ||
        isFinished
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to end this session? The session status will become Ended."
        );

      if (!confirmed) {
        return;
      }

      try {

        setActionLoading(true);
        setRunning(false);

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
          ) || elapsedSeconds
        );

        window.alert(
          "Session ended successfully"
        );

      } catch (actionError) {

        console.error(
          "Failed to end session:",
          actionError
        );

        setRunning(
          session.status ===
          "In Progress"
        );

        window.alert(
          actionError.message ||
          "Failed to end session"
        );

      } finally {

        setActionLoading(false);

      }

    };


  const submitGameResult =
    async (
      gameId,
      gameResult
    ) => {

      if (
        !session ||
        gameSaving
      ) {
        return;
      }

      try {

        setGameSaving(true);
        setGameSaveError("");

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

        setPendingGameResult(null);

        if (
          result.all_games_completed
        ) {

          setRunning(false);

          setElapsedSeconds(
            Number(
              result.session
                .duration_seconds
            ) || elapsedSeconds
          );

        }

      } catch (saveError) {

        console.error(
          "Failed to save game result:",
          saveError
        );

        setGameSaveError(
          saveError.message ||
          "Failed to save game result"
        );

      } finally {

        setGameSaving(false);

      }

    };


  const handleGameComplete =
    async (
      gameResult
    ) => {

      if (
        !currentGame ||
        gameSaving
      ) {
        return;
      }

      const pendingResult = {
        gameId: currentGame.id,
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
        pendingGameResult.gameResult
      );

    };


  const handleStartNextGame =
    async () => {

      if (
        !session ||
        !pendingGame ||
        actionLoading ||
        gameSaving ||
        isFinished
      ) {
        return;
      }

      try {

        setActionLoading(true);
        setGameSaveError("");

        if (
          session.status === "Paused"
        ) {

          const resumed =
            await resumeSession(
              session.id,
              elapsedSeconds
            );

          setSession(
            resumed.session
          );

          setRunning(true);

        }

        const result =
          await startSessionGame(
            session.id,
            pendingGame.id
          );

        setSession(
          result.session
        );

        setRecentlyFinishedGameId(
          null
        );

        setPendingGameResult(null);
        setRunning(true);

      } catch (actionError) {

        console.error(
          "Failed to start next game:",
          actionError
        );

        window.alert(
          actionError.message ||
          "Failed to start next game"
        );

      } finally {

        setActionLoading(false);

      }

    };


  const handleViewReport = () => {

    navigate(
      `/assessment-report?sessionId=${session.id}`
    );

  };


  const getGameStatusClasses = (
    status
  ) => {

    if (
      status === "In Progress"
    ) {
      return "bg-green-100 text-green-700";
    }

    if (status === "Paused") {
      return "bg-amber-100 text-amber-700";
    }

    if (
      status === "Completed"
    ) {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "Pending") {
      return "bg-slate-100 text-slate-600";
    }

    return "bg-red-100 text-red-700";

  };


  const renderFinishedSession =
    () => {

      if (
        session?.status ===
        "Completed"
      ) {

        return (

          <div
            className="
              min-h-[330px]
              flex
              items-center
              justify-center
              text-center
            "
          >

            <div>

              <Target
                size={68}
                className="
                  mx-auto
                  text-green-500
                "
              />

              <h2
                className="
                  text-3xl
                  font-bold
                  mt-5
                "
              >
                Session Completed
              </h2>

              <p
                className="
                  text-slate-500
                  mt-2
                "
              >
                All selected games were
                completed and saved.
              </p>

              <p
                className="
                  text-lg
                  font-semibold
                  mt-4
                "
              >
                Final Score:{" "}
                {session.score ?? 0}%
              </p>

              <button
                type="button"
                onClick={
                  handleViewReport
                }
                className="
                  mt-7
                  bg-[#7B6EF6]
                  text-white
                  px-7
                  py-3
                  rounded-xl
                  hover:bg-[#6959F5]
                "
              >
                View Therapist Report
              </button>

            </div>

          </div>

        );

      }


      if (
        session?.status === "Ended"
      ) {

        return (

          <div
            className="
              min-h-[330px]
              flex
              items-center
              justify-center
              text-center
            "
          >

            <div>

              <Square
                size={65}
                className="
                  mx-auto
                  text-red-400
                "
              />

              <h2
                className="
                  text-3xl
                  font-bold
                  mt-5
                "
              >
                Session Ended
              </h2>

              <p
                className="
                  text-slate-500
                  mt-2
                "
              >
                The therapist ended this
                session manually.
              </p>

              <button
                type="button"
                onClick={
                  handleViewReport
                }
                className="
                  mt-7
                  bg-[#7B6EF6]
                  text-white
                  px-7
                  py-3
                  rounded-xl
                "
              >
                View Therapist Report
              </button>

            </div>

          </div>

        );

      }


      return (

        <div
          className="
            min-h-[330px]
            flex
            items-center
            justify-center
            text-center
          "
        >

          <div>

            <Square
              size={65}
              className="
                mx-auto
                text-red-400
              "
            />

            <h2
              className="
                text-3xl
                font-bold
                mt-5
              "
            >
              Session Cancelled
            </h2>

            <p
              className="
                text-slate-500
                mt-2
              "
            >
              This session was cancelled
              before completion.
            </p>

          </div>

        </div>

      );

    };


  const renderBetweenGames =
    () => {

      return (

        <div
          className="
            min-h-[360px]
            flex
            items-center
            justify-center
            text-center
          "
        >

          <div
            className="
              max-w-xl
              w-full
            "
          >

            <Target
              size={66}
              className="
                mx-auto
                text-green-500
              "
            />

            <h2
              className="
                text-3xl
                font-bold
                mt-5
              "
            >
              Game Finished
            </h2>

            {lastFinishedGame && (

              <div
                className="
                  grid
                  grid-cols-3
                  gap-3
                  mt-7
                "
              >

                <div
                  className="
                    bg-white
                    rounded-2xl
                    p-4
                    border
                  "
                >

                  <p
                    className="
                      text-sm
                      text-slate-500
                    "
                  >
                    Game
                  </p>

                  <p
                    className="
                      font-bold
                      mt-1
                    "
                  >
                    {
                      lastFinishedGame
                        .game_name
                    }
                  </p>

                </div>

                <div
                  className="
                    bg-white
                    rounded-2xl
                    p-4
                    border
                  "
                >

                  <p
                    className="
                      text-sm
                      text-slate-500
                    "
                  >
                    Score
                  </p>

                  <p
                    className="
                      font-bold
                      mt-1
                    "
                  >
                    {
                      lastFinishedGame
                        .score ?? 0
                    }%
                  </p>

                </div>

                <div
                  className="
                    bg-white
                    rounded-2xl
                    p-4
                    border
                  "
                >

                  <p
                    className="
                      text-sm
                      text-slate-500
                    "
                  >
                    Game Time
                  </p>

                  <p
                    className="
                      font-bold
                      mt-1
                    "
                  >
                    {formatTime(
                      lastFinishedGame
                        .duration_seconds
                    )}
                  </p>

                </div>

              </div>

            )}

            <p
              className="
                text-slate-500
                mt-6
              "
            >
              {pendingGame
                ? `${pendingGame.game_name} is ready to start. Its game timer will begin from zero, while the session timer continues.`
                : "No pending game remains."
              }
            </p>

            <div
              className="
                flex
                flex-wrap
                justify-center
                gap-4
                mt-7
              "
            >

              <button
                type="button"
                onClick={
                  handleViewReport
                }
                className="
                  bg-slate-200
                  px-6
                  py-3
                  rounded-xl
                "
              >
                View Therapist Report
              </button>

              {pendingGame && (

                <button
                  type="button"
                  onClick={
                    handleStartNextGame
                  }
                  disabled={
                    actionLoading ||
                    gameSaving
                  }
                  className="
                    bg-[#7B6EF6]
                    text-white
                    px-6
                    py-3
                    rounded-xl
                    flex
                    items-center
                    gap-2
                    disabled:opacity-50
                  "
                >

                  <Play size={18} />

                  {actionLoading
                    ? "Starting..."
                    : `Play ${pendingGame.game_name}`
                  }

                </button>

              )}

            </div>

          </div>

        </div>

      );

    };


  const renderSelectedGame = () => {

    if (isFinished) {
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


    if (!currentGame) {

      return (

        <div
          className="
            min-h-[300px]
            flex
            items-center
            justify-center
            text-center
          "
        >

          <div>

            <Brain
              size={70}
              className="
                mx-auto
                text-[#7B6EF6]
              "
            />

            <h2
              className="
                text-2xl
                font-bold
                mt-5
              "
            >
              No Active Game
            </h2>

            <p
              className="
                text-slate-500
                mt-2
              "
            >
              This session does not have
              an active game.
            </p>

          </div>

        </div>

      );

    }


    const gameName =
      currentGame.game_name
        ?.trim()
        .toLowerCase();


    if (
      gameName === "memory match"
    ) {

      return (

        <MemoryMatch
          key={currentGame.id}
          embedded
          difficulty={
            currentGame.difficulty
          }
          paused={
            !running ||
            actionLoading
          }
          onComplete={
            handleGameComplete
          }
        />

      );

    }


    if (
      gameName === "focus finder"
    ) {

      return (

        <FocusFinder
          key={currentGame.id}
          embedded
          difficulty={
            currentGame.difficulty
          }
          paused={
            !running ||
            actionLoading
          }
          onComplete={
            handleGameComplete
          }
        />

      );

    }


    if (
      gameName === "puzzle path"
    ) {

      return (

        <PuzzlePath
          key={currentGame.id}
          embedded
          difficulty={
            currentGame.difficulty
          }
          paused={
            !running ||
            actionLoading
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
          key={currentGame.id}
          embedded
          difficulty={
            currentGame.difficulty
          }
          paused={
            !running ||
            actionLoading
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
          key={currentGame.id}
          embedded
          difficulty={
            currentGame.difficulty
          }
          paused={
            !running ||
            actionLoading
          }
          onComplete={
            handleGameComplete
          }
        />

      );

    }


    return (

      <div
        className="
          min-h-[300px]
          flex
          items-center
          justify-center
          text-center
        "
      >

        <div>

          <Brain
            size={70}
            className="
              mx-auto
              text-[#7B6EF6]
            "
          />

          <h2
            className="
              text-2xl
              font-bold
              mt-5
            "
          >
            {currentGame.game_name}
          </h2>

          <p
            className="
              text-slate-500
              mt-2
            "
          >
            This game is not connected
            yet.
          </p>

        </div>

      </div>

    );

  };


  const displayedScore =
    session?.score ??
    lastFinishedGame?.score ??
    null;


  const displayedDifficulty =
    currentGame?.difficulty ||
    pendingGame?.difficulty ||
    lastFinishedGame?.difficulty ||
    session?.difficulty ||
    "Not set";


  return (

    <div
      className="
        flex
        bg-[#F7F8FC]
        min-h-screen
      "
    >

      <Sidebar />

      <main
        className="
          flex-1
          p-10
          overflow-y-auto
        "
      >

        <Navbar />

        <button
          type="button"
          onClick={() => {
            navigate("/sessions");
          }}
          className="
            flex
            items-center
            gap-2
            text-[#7B6EF6]
            font-medium
            mt-8
            hover:gap-3
            transition-all
          "
        >

          <ArrowLeft size={20} />
          Back to Sessions

        </button>


        {loading && (

          <div
            className="
              min-h-[400px]
              flex
              items-center
              justify-center
            "
          >

            <div className="text-center">

              <div
                className="
                  w-12
                  h-12
                  border-4
                  border-[#E9E5FF]
                  border-t-[#7B6EF6]
                  rounded-full
                  animate-spin
                  mx-auto
                "
              />

              <p
                className="
                  text-slate-500
                  mt-4
                "
              >
                Loading session...
              </p>

            </div>

          </div>

        )}


        {!loading && error && (

          <div
            className="
              mt-8
              bg-red-50
              border
              border-red-200
              text-red-700
              rounded-2xl
              p-6
            "
          >

            <h2
              className="
                font-bold
                text-lg
              "
            >
              Unable to load session
            </h2>

            <p className="mt-2">
              {error}
            </p>

          </div>

        )}


        {!loading &&
          !error &&
          session && (

          <div className="mt-8">

            <div
              className="
                bg-white
                rounded-3xl
                p-8
                border
              "
            >

              <div
                className="
                  flex
                  justify-between
                  items-center
                  gap-6
                "
              >

                <div>

                  <h1
                    className="
                      text-3xl
                      font-bold
                    "
                  >
                    Assessment Session
                  </h1>

                  <p
                    className="
                      text-slate-500
                      mt-2
                    "
                  >
                    Child:{" "}
                    {session.child_name}
                  </p>

                  <p
                    className="
                      text-sm
                      text-slate-400
                      mt-1
                    "
                  >
                    Session ID #
                    {session.id}
                  </p>

                  <span
                    className={`
                      inline-flex
                      mt-3
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      ${
                        session.status ===
                        "In Progress"
                          ? "bg-green-100 text-green-700"
                          : session.status ===
                            "Paused"
                          ? "bg-amber-100 text-amber-700"
                          : session.status ===
                            "Completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {session.status}
                  </span>

                </div>


                <div
                  className="
                    bg-[#EEE9FF]
                    text-[#7B6EF6]
                    px-5
                    py-3
                    rounded-2xl
                    shrink-0
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <Clock size={20} />

                    <span
                      className="
                        text-sm
                        font-semibold
                      "
                    >
                      Session Time
                    </span>

                  </div>

                  <p
                    className="
                      text-2xl
                      font-bold
                      mt-1
                      text-center
                    "
                  >
                    {formatTime(
                      elapsedSeconds
                    )}
                  </p>

                </div>

              </div>


              {games.length > 0 && (

                <div
                  className="
                    flex
                    flex-wrap
                    gap-3
                    mt-7
                  "
                >

                  {games.map(
                    (game, index) => (

                      <div
                        key={game.id}
                        className="
                          border
                          rounded-2xl
                          px-4
                          py-3
                          bg-white
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-slate-400
                          "
                        >
                          Game {index + 1}
                        </p>

                        <p
                          className="
                            font-semibold
                            mt-1
                          "
                        >
                          {game.game_name}
                        </p>

                        <span
                          className={`
                            inline-flex
                            mt-2
                            px-2
                            py-1
                            rounded-full
                            text-xs
                            font-semibold
                            ${getGameStatusClasses(
                              game.status
                            )}
                          `}
                        >
                          {game.status}
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}


              {session.status ===
                "Paused" &&
                !isFinished && (

                <div
                  className="
                    mt-8
                    bg-amber-50
                    border
                    border-amber-200
                    text-amber-700
                    rounded-2xl
                    px-5
                    py-4
                    text-center
                    font-semibold
                  "
                >
                  Session paused
                </div>

              )}


              <div
                className="
                  mt-10
                  rounded-3xl
                  bg-[#F7F5FF]
                  p-4
                  overflow-hidden
                  relative
                "
              >

                {renderSelectedGame()}

                {gameSaving && (

                  <div
                    className="
                      absolute
                      inset-0
                      bg-white/80
                      flex
                      items-center
                      justify-center
                      z-10
                    "
                  >

                    <div
                      className="
                        text-center
                        font-semibold
                        text-[#7B6EF6]
                      "
                    >
                      Saving game result...
                    </div>

                  </div>

                )}

              </div>


              {gameSaveError && (

                <div
                  className="
                    mt-5
                    bg-red-50
                    border
                    border-red-200
                    text-red-700
                    rounded-2xl
                    p-5
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <p>
                    {gameSaveError}
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleRetrySave
                    }
                    disabled={
                      gameSaving
                    }
                    className="
                      bg-red-600
                      text-white
                      px-5
                      py-2
                      rounded-xl
                      disabled:opacity-50
                    "
                  >
                    Retry Saving
                  </button>

                </div>

              )}


              <div
                className="
                  grid
                  grid-cols-3
                  gap-6
                  mt-8
                "
              >

                <div
                  className="
                    bg-[#F1EDFF]
                    rounded-2xl
                    p-5
                  "
                >

                  <Target
                    className="
                      text-[#7B6EF6]
                    "
                  />

                  <p
                    className="
                      text-slate-500
                      mt-3
                    "
                  >
                    Score
                  </p>

                  <h2
                    className="
                      text-3xl
                      font-bold
                    "
                  >
                    {displayedScore !==
                      null
                      ? `${displayedScore}%`
                      : "—"
                    }
                  </h2>

                </div>


                <div
                  className="
                    bg-[#EAF7FF]
                    rounded-2xl
                    p-5
                  "
                >

                  <Clock
                    className="
                      text-blue-400
                    "
                  />

                  <p
                    className="
                      text-slate-500
                      mt-3
                    "
                  >
                    Session Duration
                  </p>

                  <h2
                    className="
                      text-3xl
                      font-bold
                    "
                  >
                    {formatTime(
                      elapsedSeconds
                    )}
                  </h2>

                </div>


                <div
                  className="
                    bg-[#E8FFF5]
                    rounded-2xl
                    p-5
                  "
                >

                  <Brain
                    className="
                      text-green-500
                    "
                  />

                  <p
                    className="
                      text-slate-500
                      mt-3
                    "
                  >
                    Difficulty
                  </p>

                  <h2
                    className="
                      text-3xl
                      font-bold
                    "
                  >
                    {displayedDifficulty}
                  </h2>

                </div>

              </div>


              {!isFinished && (

                <div
                  className="
                    flex
                    justify-center
                    gap-5
                    mt-10
                  "
                >

                  <button
                    type="button"
                    onClick={
                      handlePauseResume
                    }
                    disabled={
                      actionLoading ||
                      gameSaving
                    }
                    title={
                      running
                        ? "Pause Session"
                        : "Resume Session"
                    }
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-[#7B6EF6]
                      text-white
                      flex
                      justify-center
                      items-center
                      hover:bg-[#6959F5]
                      transition
                      disabled:opacity-50
                    "
                  >

                    {running
                      ? <Pause />
                      : <Play />
                    }

                  </button>


                  <button
                    type="button"
                    onClick={
                      handleEndSession
                    }
                    disabled={
                      actionLoading ||
                      gameSaving
                    }
                    title="End Session"
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-red-100
                      text-red-500
                      flex
                      justify-center
                      items-center
                      hover:bg-red-200
                      transition
                      disabled:opacity-50
                    "
                  >
                    <Square />
                  </button>

                </div>

              )}

            </div>

          </div>

        )}

      </main>

    </div>

  );

};


export default SessionPlayer;