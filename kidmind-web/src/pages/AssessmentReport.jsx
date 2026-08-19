import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Brain,
  Clock,
  FileText,
  Gauge,
  Target,
  TimerReset,
  UserRound,
  XCircle,
} from "lucide-react";

import Sidebar from
  "../components/layout/Sidebar";

import Navbar from
  "../components/layout/Navbar";

import {
  getSessionById,
} from "../api/sessionsApi";


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


const formatDate = (
  value
) => {

  if (!value) {
    return "—";
  }

  const date =
    new Date(
      String(value).replace(
        " ",
        "T"
      )
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString();

};


const parseResultData = (
  value
) => {

  if (!value) {
    return {};
  }

  if (
    typeof value === "object"
  ) {
    return value;
  }

  try {

    return JSON.parse(value);

  } catch {

    return {};

  }

};


const getGameDomain = (
  game
) => {

  const resultData =
    parseResultData(
      game.result_data
    );

  if (resultData.domain) {
    return resultData.domain;
  }

  const gameName =
    String(
      game.game_name || ""
    ).toLowerCase();

  if (
    gameName.includes("memory")
  ) {
    return "Working Memory";
  }

  if (
    gameName.includes("focus")
  ) {
    return "Attention";
  }

  return "Cognitive Assessment";

};


const getPerformance = (
  accuracy
) => {

  if (
    accuracy === null ||
    accuracy === undefined
  ) {

    return {
      label:
        "Insufficient Data",

      description:
        "There is not enough accuracy data to evaluate this game.",

      classes:
        "bg-slate-100 text-slate-700",
    };

  }

  const value =
    Number(accuracy);

  if (value >= 85) {

    return {
      label:
        "Good Performance",

      description:
        "The child demonstrated strong accuracy during this assessment.",

      classes:
        "bg-green-100 text-green-700",
    };

  }

  if (value >= 70) {

    return {
      label:
        "Monitor Progress",

      description:
        "The result is acceptable, with room for continued practice and monitoring.",

      classes:
        "bg-amber-100 text-amber-700",
    };

  }

  return {
    label:
      "Needs Further Assessment",

    description:
      "The recorded result may benefit from further observation and follow-up assessment.",

    classes:
      "bg-red-100 text-red-700",
  };

};


const getStatusClasses = (
  status
) => {

  if (
    status === "Completed"
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    status === "In Progress"
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (
    status === "Paused"
  ) {
    return "bg-amber-100 text-amber-700";
  }

  if (
    status === "Pending"
  ) {
    return "bg-slate-100 text-slate-600";
  }

  return "bg-red-100 text-red-700";

};


const MetricCard = ({
  icon,
  title,
  value,
}) => {

  return (

    <div
      className="
        bg-[#F7F8FC]
        border
        border-slate-100
        rounded-2xl
        p-5
      "
    >

      <div
        className="
          flex
          items-center
          gap-2
          text-[#7B6EF6]
        "
      >

        {icon}

        <p
          className="
            text-sm
            text-slate-500
            font-medium
          "
        >
          {title}
        </p>

      </div>

      <h3
        className="
          text-2xl
          font-bold
          mt-3
          break-words
        "
      >
        {value}
      </h3>

    </div>

  );

};


const AssessmentReport = () => {

  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const sessionId =
    searchParams.get(
      "sessionId"
    );


  const [session, setSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const loadReport =
      async () => {

        if (!sessionId) {

          setError(
            "No session ID was provided."
          );

          setLoading(false);

          return;

        }

        try {

          setLoading(true);
          setError("");

          const data =
            await getSessionById(
              sessionId
            );

          setSession(data);

        } catch (loadError) {

          console.error(
            "Failed to load report:",
            loadError
          );

          setError(
            loadError.message ||
            "Failed to load assessment report"
          );

        } finally {

          setLoading(false);

        }

      };


    loadReport();

  }, [sessionId]);


  const games =
    useMemo(
      () =>
        Array.isArray(
          session?.games
        )
          ? session.games
          : [],
      [session]
    );


  const recordedGames =
    useMemo(
      () =>
        games.filter(
          (game) =>
            game.status ===
              "Completed" ||
            game.status ===
              "Failed" ||
            game.status ===
              "Ended"
        ),
      [games]
    );


  const averageAccuracy =
    useMemo(
      () => {

        const values =
          recordedGames
            .filter(
              (game) =>
                game.accuracy !==
                  null &&
                game.accuracy !==
                  undefined
            )
            .map(
              (game) =>
                Number(
                  game.accuracy
                )
            )
            .filter(
              (value) =>
                Number.isFinite(
                  value
                )
            );

        if (
          values.length === 0
        ) {
          return null;
        }

        return Math.round(
          values.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
          values.length
        );

      },
      [recordedGames]
    );


  const calculatedScore =
    useMemo(
      () => {

        const scores =
          recordedGames
            .filter(
              (game) =>
                game.score !== null &&
                game.score !==
                  undefined
            )
            .map(
              (game) =>
                Number(game.score)
            )
            .filter(
              (value) =>
                Number.isFinite(
                  value
                )
            );

        if (
          scores.length === 0
        ) {
          return null;
        }

        return Math.round(
          scores.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
          scores.length
        );

      },
      [recordedGames]
    );


  const totalMistakes =
    useMemo(
      () =>
        recordedGames.reduce(
          (total, game) =>
            total +
            (
              Number(
                game.mistakes
              ) || 0
            ),
          0
        ),
      [recordedGames]
    );


  const overallScore =
    session?.score !== null &&
    session?.score !== undefined
      ? session.score
      : calculatedScore;


  const sessionPerformance =
    getPerformance(
      averageAccuracy
    );


  return (

    <div
      className="
        flex
        min-h-screen
        bg-[#F7F8FC]
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
            mt-8
            text-[#7B6EF6]
            font-semibold
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
              min-h-[450px]
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
                Loading therapist report...
              </p>

            </div>

          </div>

        )}


        {!loading &&
          error && (

          <div
            className="
              max-w-4xl
              mx-auto
              mt-10
              bg-white
              border
              border-red-200
              rounded-3xl
              p-8
              text-center
            "
          >

            <AlertCircle
              size={60}
              className="
                text-red-500
                mx-auto
              "
            />

            <h1
              className="
                text-2xl
                font-bold
                mt-5
              "
            >
              Unable to Load Report
            </h1>

            <p
              className="
                text-slate-500
                mt-2
              "
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                navigate("/sessions");
              }}
              className="
                bg-[#7B6EF6]
                text-white
                px-6
                py-3
                rounded-xl
                mt-6
              "
            >
              Return to Sessions
            </button>

          </div>

        )}


        {!loading &&
          !error &&
          session && (

          <div
            className="
              max-w-6xl
              mx-auto
              mt-8
              space-y-7
            "
          >

            {/* Report header */}

            <section
              className="
                bg-white
                border
                rounded-3xl
                p-8
              "
            >

              <div
                className="
                  flex
                  flex-wrap
                  items-start
                  justify-between
                  gap-6
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >

                  <div
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-[#EEE9FF]
                      text-[#7B6EF6]
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <FileText size={28} />

                  </div>

                  <div>

                    <h1
                      className="
                        text-3xl
                        font-bold
                      "
                    >
                      Therapist Assessment Report
                    </h1>

                    <p
                      className="
                        text-slate-500
                        mt-1
                      "
                    >
                      Session #{session.id}
                    </p>

                  </div>

                </div>


                <span
                  className={`
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-bold
                    ${getStatusClasses(
                      session.status
                    )}
                  `}
                >
                  {session.status}
                </span>

              </div>


              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  lg:grid-cols-4
                  gap-5
                  mt-8
                "
              >

                <MetricCard
                  icon={
                    <UserRound
                      size={20}
                    />
                  }
                  title="Child"
                  value={
                    session.child_name ||
                    "—"
                  }
                />

                <MetricCard
                  icon={
                    <Brain
                      size={20}
                    />
                  }
                  title="Age"
                  value={
                    session.child_age ??
                    "—"
                  }
                />

                <MetricCard
                  icon={
                    <Clock
                      size={20}
                    />
                  }
                  title="Session Duration"
                  value={formatTime(
                    session
                      .duration_seconds
                  )}
                />

                <MetricCard
                  icon={
                    <Target
                      size={20}
                    />
                  }
                  title="Overall Score"
                  value={
                    overallScore !== null
                      ? `${overallScore}%`
                      : "—"
                  }
                />

              </div>


              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-3
                  gap-5
                  mt-5
                "
              >

                <MetricCard
                  icon={
                    <Gauge
                      size={20}
                    />
                  }
                  title="Average Accuracy"
                  value={
                    averageAccuracy !==
                    null
                      ? `${averageAccuracy}%`
                      : "—"
                  }
                />

                <MetricCard
                  icon={
                    <XCircle
                      size={20}
                    />
                  }
                  title="Total Mistakes"
                  value={totalMistakes}
                />

                <MetricCard
                  icon={
                    <Clock
                      size={20}
                    />
                  }
                  title="Assessment Date"
                  value={formatDate(
                    session.created_at
                  )}
                />

              </div>

            </section>


            {/* Clinical summary */}

            <section
              className="
                bg-white
                border
                rounded-3xl
                p-8
              "
            >

              <h2
                className="
                  text-2xl
                  font-bold
                "
              >
                Clinical Summary
              </h2>


              <div
                className="
                  bg-[#F7F5FF]
                  rounded-2xl
                  p-6
                  mt-5
                "
              >

                <span
                  className={`
                    inline-flex
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-bold
                    ${
                      sessionPerformance
                        .classes
                    }
                  `}
                >
                  {
                    sessionPerformance
                      .label
                  }
                </span>

                <p
                  className="
                    text-slate-600
                    leading-7
                    mt-4
                  "
                >
                  {
                    sessionPerformance
                      .description
                  }
                </p>

                <p
                  className="
                    text-sm
                    text-slate-500
                    leading-6
                    mt-4
                  "
                >
                  This summary is generated
                  from the recorded game
                  results to support therapist
                  review. It should not be
                  treated as a standalone
                  medical diagnosis.
                </p>

              </div>

            </section>


            {/* Games */}

            <section
              className="
                bg-white
                border
                rounded-3xl
                p-8
              "
            >

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-4
                "
              >

                <div>

                  <h2
                    className="
                      text-2xl
                      font-bold
                    "
                  >
                    Game Results
                  </h2>

                  <p
                    className="
                      text-slate-500
                      mt-1
                    "
                  >
                    Individual results for
                    every game in this session.
                  </p>

                </div>

                <span
                  className="
                    bg-[#EEE9FF]
                    text-[#7B6EF6]
                    px-4
                    py-2
                    rounded-full
                    font-semibold
                  "
                >
                  {games.length} Games
                </span>

              </div>


              {games.length === 0 ? (

                <div
                  className="
                    bg-slate-50
                    text-slate-500
                    text-center
                    rounded-2xl
                    p-8
                    mt-6
                  "
                >
                  No game results were found.
                </div>

              ) : (

                <div
                  className="
                    space-y-5
                    mt-6
                  "
                >

                  {games.map(
                    (game, index) => {

                      const performance =
                        getPerformance(
                          game.accuracy
                        );

                      const resultData =
                        parseResultData(
                          game.result_data
                        );

                      return (

                        <article
                          key={game.id}
                          className="
                            border
                            rounded-3xl
                            p-6
                          "
                        >

                          <div
                            className="
                              flex
                              flex-wrap
                              items-start
                              justify-between
                              gap-4
                            "
                          >

                            <div>

                              <p
                                className="
                                  text-sm
                                  text-slate-400
                                "
                              >
                                Game {index + 1}
                              </p>

                              <h3
                                className="
                                  text-xl
                                  font-bold
                                  mt-1
                                "
                              >
                                {game.game_name}
                              </h3>

                              <p
                                className="
                                  text-slate-500
                                  mt-1
                                "
                              >
                                {getGameDomain(
                                  game
                                )}
                              </p>

                            </div>


                            <span
                              className={`
                                px-3
                                py-1
                                rounded-full
                                text-xs
                                font-bold
                                ${getStatusClasses(
                                  game.status
                                )}
                              `}
                            >
                              {game.status}
                            </span>

                          </div>


                          <div
                            className="
                              grid
                              grid-cols-2
                              md:grid-cols-3
                              lg:grid-cols-6
                              gap-4
                              mt-6
                            "
                          >

                            <MetricCard
                              icon={
                                <Target
                                  size={18}
                                />
                              }
                              title="Score"
                              value={
                                game.score !==
                                  null &&
                                game.score !==
                                  undefined
                                  ? `${game.score}%`
                                  : "—"
                              }
                            />

                            <MetricCard
                              icon={
                                <Gauge
                                  size={18}
                                />
                              }
                              title="Accuracy"
                              value={
                                game.accuracy !==
                                  null &&
                                game.accuracy !==
                                  undefined
                                  ? `${game.accuracy}%`
                                  : "—"
                              }
                            />

                            <MetricCard
                              icon={
                                <XCircle
                                  size={18}
                                />
                              }
                              title="Mistakes"
                              value={
                                game.mistakes ??
                                "—"
                              }
                            />

                            <MetricCard
                              icon={
                                <TimerReset
                                  size={18}
                                />
                              }
                              title="Game Time"
                              value={formatTime(
                                game
                                  .duration_seconds
                              )}
                            />

                            <MetricCard
                              icon={
                                <Clock
                                  size={18}
                                />
                              }
                              title="Reaction Time"
                              value={
                                game.reaction_time !==
                                  null &&
                                game.reaction_time !==
                                  undefined
                                  ? `${Number(
                                      game.reaction_time
                                    ).toFixed(
                                      2
                                    )}s`
                                  : "—"
                              }
                            />

                            <MetricCard
                              icon={
                                <Brain
                                  size={18}
                                />
                              }
                              title="Difficulty"
                              value={
                                game.difficulty ||
                                "—"
                              }
                            />

                          </div>


                          <div
                            className="
                              bg-slate-50
                              rounded-2xl
                              p-5
                              mt-5
                            "
                          >

                            <div
                              className="
                                flex
                                flex-wrap
                                justify-between
                                items-center
                                gap-4
                              "
                            >

                              <div>

                                <h4
                                  className="
                                    font-bold
                                  "
                                >
                                  Game Summary
                                </h4>

                                <p
                                  className="
                                    text-sm
                                    text-slate-500
                                    mt-1
                                  "
                                >
                                  {
                                    performance
                                      .description
                                  }
                                </p>

                              </div>


                              <span
                                className={`
                                  px-3
                                  py-1
                                  rounded-full
                                  text-xs
                                  font-bold
                                  ${
                                    performance
                                      .classes
                                  }
                                `}
                              >
                                {
                                  performance
                                    .label
                                }
                              </span>

                            </div>


                            <div
                              className="
                                flex
                                flex-wrap
                                gap-2
                                mt-4
                              "
                            >

                              {resultData.moves !==
                                undefined && (

                                <span
                                  className="
                                    bg-white
                                    border
                                    px-3
                                    py-1
                                    rounded-full
                                    text-sm
                                  "
                                >
                                  Moves:{" "}
                                  {
                                    resultData
                                      .moves
                                  }
                                </span>

                              )}


                              {resultData.correct_answers !==
                                undefined && (

                                <span
                                  className="
                                    bg-white
                                    border
                                    px-3
                                    py-1
                                    rounded-full
                                    text-sm
                                  "
                                >
                                  Correct Answers:{" "}
                                  {
                                    resultData
                                      .correct_answers
                                  }
                                </span>

                              )}


                              {resultData.total_rounds !==
                                undefined && (

                                <span
                                  className="
                                    bg-white
                                    border
                                    px-3
                                    py-1
                                    rounded-full
                                    text-sm
                                  "
                                >
                                  Total Rounds:{" "}
                                  {
                                    resultData
                                      .total_rounds
                                  }
                                </span>

                              )}

                            </div>

                          </div>

                        </article>

                      );

                    }
                  )}

                </div>

              )}

            </section>


            <div
              className="
                flex
                justify-center
                pb-8
              "
            >

              <button
                type="button"
                onClick={() => {
                  navigate("/sessions");
                }}
                className="
                  bg-[#7B6EF6]
                  text-white
                  px-8
                  py-3
                  rounded-xl
                  font-semibold
                  hover:bg-[#6959F5]
                "
              >
                Back to Sessions
              </button>

            </div>

          </div>

        )}

      </main>

    </div>

  );

};


export default AssessmentReport;