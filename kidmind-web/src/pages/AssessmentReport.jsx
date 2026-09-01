import {
  useEffect,
  useMemo,
  useRef,
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
  Download,
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

import {
  downloadElementAsPdf,
} from "../utils/downloadElementAsPdf";


const formatTime =
  totalSeconds => {

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


const formatDate = value => {

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


const parseResultData =
  value => {

    if (!value) {
      return {};
    }

    if (
      typeof value ===
      "object"
    ) {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch {
      return {};
    }

  };


const getGameDomain = game => {

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
    gameName.includes(
      "memory"
    )
  ) {
    return "Working Memory";
  }

  if (
    gameName.includes(
      "focus"
    )
  ) {
    return "Attention";
  }

  return "Cognitive Assessment";

};


const getPerformance =
  accuracy => {

    if (
      accuracy === null ||
      accuracy === undefined
    ) {
      return {
        label:
          "Insufficient Data",
        description:
          "There is not enough accuracy data to evaluate this game.",
        tone:
          "neutral",
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
        tone:
          "good",
      };
    }

    if (value >= 70) {
      return {
        label:
          "Monitor Progress",
        description:
          "The result is acceptable, with room for continued practice and monitoring.",
        tone:
          "monitor",
      };
    }

    return {
      label:
        "Needs Further Assessment",
      description:
        "The recorded result may benefit from further observation and follow-up assessment.",
      tone:
        "attention",
    };

  };


const getStatusClass = status => {

  if (
    status === "Completed"
  ) {
    return "completed";
  }

  if (
    status === "In Progress"
  ) {
    return "progress";
  }

  if (
    status === "Paused"
  ) {
    return "paused";
  }

  if (
    status === "Pending"
  ) {
    return "pending";
  }

  return "failed";

};


const MetricCard = ({
  icon,
  title,
  value,
  featured = false,
}) => {

  return (
    <div
      className={
        featured
          ? "assessment-metric featured"
          : "assessment-metric"
      }
    >

      <div className="assessment-metric-label">
        <span className="assessment-metric-icon">
          {icon}
        </span>
        <span>
          {title}
        </span>
      </div>

      <strong>
        {value}
      </strong>

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

  const reportRef =
    useRef(null);


  const [
    session,
    setSession,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    downloadingPdf,
    setDownloadingPdf,
  ] = useState(false);

  const [
    pdfError,
    setPdfError,
  ] = useState("");


  useEffect(
    () => {

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

          } catch (
            loadError
          ) {

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

    },
    [sessionId]
  );


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
          game =>
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
              game =>
                game.accuracy !== null &&
                game.accuracy !== undefined
            )
            .map(
              game =>
                Number(
                  game.accuracy
                )
            )
            .filter(
              value =>
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
            (
              sum,
              value
            ) =>
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
              game =>
                game.score !== null &&
                game.score !== undefined
            )
            .map(
              game =>
                Number(
                  game.score
                )
            )
            .filter(
              value =>
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
            (
              sum,
              value
            ) =>
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
          (
            total,
            game
          ) =>
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


  const handleDownloadPdf =
    async () => {

      if (
        !session ||
        !reportRef.current ||
        downloadingPdf
      ) {
        return;
      }

      try {

        setDownloadingPdf(true);
        setPdfError("");

        await downloadElementAsPdf({
          element:
            reportRef.current,
          filename:
            `KidMind-Assessment-Report-${session.child_name || "Child"}-Session-${session.id}.pdf`,
        });

      } catch (
        downloadError
      ) {

        console.error(
          "Failed to download report PDF:",
          downloadError
        );

        setPdfError(
          downloadError?.message ||
          "Unable to download the report PDF."
        );

      } finally {
        setDownloadingPdf(false);
      }

    };


  return (

    <div className="assessment-report-page">

      <Sidebar />

      <main className="assessment-report-main">

        <Navbar />

        <div className="assessment-report-shell">

          <div className="assessment-report-toolbar">

            <button
              type="button"
              className="assessment-back-button"
              onClick={() => {
                navigate(
                  "/sessions"
                );
              }}
            >
              <ArrowLeft size={18} />
              Back to Sessions
            </button>


            {!loading &&
              !error &&
              session && (
                <button
                  type="button"
                  className="assessment-download-button"
                  onClick={
                    handleDownloadPdf
                  }
                  disabled={
                    downloadingPdf
                  }
                >
                  <Download size={17} />
                  {downloadingPdf
                    ? "Preparing PDF..."
                    : "Download PDF"
                  }
                </button>
              )}

          </div>


          {pdfError && (
            <div className="assessment-pdf-error">
              {pdfError}
            </div>
          )}


          {loading && (
            <div className="assessment-loading-state">
              <div className="assessment-spinner" />
              <p>
                Loading therapist report...
              </p>
            </div>
          )}


          {!loading &&
            error && (
              <div className="assessment-error-state">
                <AlertCircle size={52} />
                <h1>
                  Unable to Load Report
                </h1>
                <p>
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigate(
                      "/sessions"
                    );
                  }}
                >
                  Return to Sessions
                </button>
              </div>
            )}


          {!loading &&
            !error &&
            session && (

              <div
                ref={reportRef}
                className="assessment-document"
              >

                <section className="assessment-cover">

                  <div className="assessment-brand-row">

                    <div className="assessment-brand">
                      <img
                        src="/logo.png"
                        alt="KidMind"
                      />

                      <div>
                        <span>
                          KIDMIND
                        </span>

                        <strong>
                          Cognitive Assessment Platform
                        </strong>
                      </div>
                    </div>


                    <span
                      className={`assessment-status ${getStatusClass(
                        session.status
                      )}`}
                    >
                      {session.status}
                    </span>

                  </div>


                  <div className="assessment-hero">

                    <div className="assessment-hero-copy">

                      <span className="assessment-document-label">
                        THERAPIST ASSESSMENT REPORT
                      </span>

                      <h1>
                        Therapist Assessment Report
                      </h1>

                      <div className="assessment-session-reference">
                        <FileText size={15} />
                        <span>
                          Session #{session.id}
                        </span>
                      </div>

                    </div>


                    <div className="assessment-score-block">

                      <span>
                        Overall Score
                      </span>

                      <strong>
                        {
                          overallScore !== null &&
                          overallScore !== undefined
                            ? `${overallScore}%`
                            : "—"
                        }
                      </strong>

                      <small>
                        Recorded session result
                      </small>

                    </div>

                  </div>


                  <div className="assessment-overview-panel">

                    <div className="assessment-child-profile">

                      <div className="assessment-child-avatar">
                        <UserRound size={25} />
                      </div>

                      <div className="assessment-child-copy">
                        <span>
                          Child
                        </span>

                        <strong>
                          {
                            session.child_name ||
                            "—"
                          }
                        </strong>

                        <p>
                          Age{" "}
                          {
                            session.child_age ??
                            "—"
                          }
                        </p>
                      </div>

                    </div>


                    <div className="assessment-facts">

                      <div className="assessment-fact">
                        <div>
                          <Clock size={17} />
                        </div>

                        <span>
                          Session Duration
                        </span>

                        <strong>
                          {
                            formatTime(
                              session.duration_seconds
                            )
                          }
                        </strong>
                      </div>


                      <div className="assessment-fact">
                        <div>
                          <Gauge size={17} />
                        </div>

                        <span>
                          Average Accuracy
                        </span>

                        <strong>
                          {
                            averageAccuracy !== null
                              ? `${averageAccuracy}%`
                              : "—"
                          }
                        </strong>
                      </div>


                      <div className="assessment-fact">
                        <div>
                          <XCircle size={17} />
                        </div>

                        <span>
                          Total Mistakes
                        </span>

                        <strong>
                          {totalMistakes}
                        </strong>
                      </div>


                      <div className="assessment-fact assessment-fact-date">
                        <div>
                          <Clock size={17} />
                        </div>

                        <span>
                          Assessment Date
                        </span>

                        <strong>
                          {
                            formatDate(
                              session.created_at
                            )
                          }
                        </strong>
                      </div>

                    </div>

                  </div>

                </section>


                <section className="assessment-section assessment-clinical-section">

                  <div className="assessment-section-heading">

                    <div>
                      <span>
                        CLINICAL OVERVIEW
                      </span>

                      <h2>
                        Clinical Summary
                      </h2>
                    </div>

                  </div>


                  <div className="assessment-clinical-card">

                    <div className="assessment-clinical-accent">
                      <Brain size={22} />
                    </div>


                    <div className="assessment-clinical-content">

                      <div className="assessment-clinical-head">

                        <h3>
                          Session Performance
                        </h3>

                        <span
                          className={`assessment-performance ${sessionPerformance.tone}`}
                        >
                          {sessionPerformance.label}
                        </span>

                      </div>


                      <p className="assessment-clinical-main">
                        {sessionPerformance.description}
                      </p>


                      <p className="assessment-disclaimer">
                        This summary is generated from the recorded game results to support therapist review. It should not be treated as a standalone medical diagnosis.
                      </p>

                    </div>

                  </div>

                </section>


                <section className="assessment-section assessment-games-section">

                  <div className="assessment-section-heading game-heading">

                    <div>
                      <span>
                        SESSION BREAKDOWN
                      </span>

                      <h2>
                        Game Results
                      </h2>

                      <p>
                        Individual results for every game in this session.
                      </p>
                    </div>


                    <div className="assessment-game-count">
                      {games.length} Games
                    </div>

                  </div>


                  {
                    games.length === 0
                      ? (
                        <div className="assessment-empty-games">
                          No game results were found.
                        </div>
                      )
                      : (
                        <div className="assessment-games-list">

                          {
                            games.map(
                              (
                                game,
                                index
                              ) => {

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
                                    className="assessment-game-card"
                                  >

                                    <div className="assessment-game-top">

                                      <div className="assessment-game-title-wrap">

                                        <div className="assessment-game-number">
                                          {
                                            String(
                                              index + 1
                                            ).padStart(
                                              2,
                                              "0"
                                            )
                                          }
                                        </div>


                                        <div>
                                          <span>
                                            GAME {index + 1}
                                          </span>

                                          <h3>
                                            {game.game_name}
                                          </h3>

                                          <p>
                                            {
                                              getGameDomain(
                                                game
                                              )
                                            }
                                          </p>
                                        </div>

                                      </div>


                                      <span
                                        className={`assessment-status small ${getStatusClass(
                                          game.status
                                        )}`}
                                      >
                                        {game.status}
                                      </span>

                                    </div>


                                    <div className="assessment-game-data-grid">

                                      <div className="assessment-data-item">
                                        <Target size={16} />
                                        <span>
                                          Score
                                        </span>
                                        <strong>
                                          {
                                            game.score !== null &&
                                            game.score !== undefined
                                              ? `${game.score}%`
                                              : "—"
                                          }
                                        </strong>
                                      </div>


                                      <div className="assessment-data-item">
                                        <Gauge size={16} />
                                        <span>
                                          Accuracy
                                        </span>
                                        <strong>
                                          {
                                            game.accuracy !== null &&
                                            game.accuracy !== undefined
                                              ? `${game.accuracy}%`
                                              : "—"
                                          }
                                        </strong>
                                      </div>


                                      <div className="assessment-data-item">
                                        <XCircle size={16} />
                                        <span>
                                          Mistakes
                                        </span>
                                        <strong>
                                          {
                                            game.mistakes ??
                                            "—"
                                          }
                                        </strong>
                                      </div>


                                      <div className="assessment-data-item">
                                        <TimerReset size={16} />
                                        <span>
                                          Game Time
                                        </span>
                                        <strong>
                                          {
                                            formatTime(
                                              game.duration_seconds
                                            )
                                          }
                                        </strong>
                                      </div>


                                      <div className="assessment-data-item">
                                        <Clock size={16} />
                                        <span>
                                          Reaction Time
                                        </span>
                                        <strong>
                                          {
                                            game.reaction_time !== null &&
                                            game.reaction_time !== undefined
                                              ? `${Number(
                                                  game.reaction_time
                                                ).toFixed(2)}s`
                                              : "—"
                                          }
                                        </strong>
                                      </div>


                                      <div className="assessment-data-item">
                                        <Brain size={16} />
                                        <span>
                                          Difficulty
                                        </span>
                                        <strong>
                                          {
                                            game.difficulty ||
                                            "—"
                                          }
                                        </strong>
                                      </div>

                                    </div>


                                    <div className="assessment-game-summary">

                                      <div className="assessment-game-summary-head">

                                        <div>
                                          <span>
                                            PERFORMANCE NOTE
                                          </span>

                                          <h4>
                                            Game Summary
                                          </h4>
                                        </div>


                                        <span
                                          className={`assessment-performance ${performance.tone}`}
                                        >
                                          {performance.label}
                                        </span>

                                      </div>


                                      <p>
                                        {performance.description}
                                      </p>


                                      <div className="assessment-result-tags">

                                        {
                                          resultData.moves !== undefined &&
                                          (
                                            <span>
                                              Moves: {resultData.moves}
                                            </span>
                                          )
                                        }


                                        {
                                          resultData.correct_answers !== undefined &&
                                          (
                                            <span>
                                              Correct Answers: {resultData.correct_answers}
                                            </span>
                                          )
                                        }


                                        {
                                          resultData.total_rounds !== undefined &&
                                          (
                                            <span>
                                              Total Rounds: {resultData.total_rounds}
                                            </span>
                                          )
                                        }

                                      </div>

                                    </div>

                                  </article>

                                );

                              }
                            )
                          }

                        </div>
                      )
                  }

                </section>


                <footer className="assessment-document-footer">

                  <span>
                    KidMind Assessment Report
                  </span>

                  <span>
                    Session #{session.id}
                  </span>

                </footer>

              </div>
            )}


          {!loading &&
            !error &&
            session && (
              <div className="assessment-bottom-action">
                <button
                  type="button"
                  onClick={() => {
                    navigate(
                      "/sessions"
                    );
                  }}
                >
                  Back to Sessions
                </button>
              </div>
            )}

        </div>

      </main>


      <style>
        {`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .assessment-report-page {
          min-height: 100vh;
          display: flex;
          background: #F7F8FC;
          color: #252852;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .assessment-report-main {
          flex: 1;
          min-width: 0;
          padding: 0 34px 48px;
          overflow-y: auto;
        }

        .assessment-report-shell {
          max-width: 1080px;
          margin: 28px auto 0;
        }

        .assessment-report-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .assessment-back-button,
        .assessment-download-button,
        .assessment-bottom-action button,
        .assessment-error-state button {
          min-height: 42px;
          padding: 0 15px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font: inherit;
          font-size: 11px;
          font-weight: 750;
          cursor: pointer;
          transition: .18s ease;
        }

        .assessment-back-button {
          border: 1px solid #E7E5F1;
          color: #696C83;
          background: white;
        }

        .assessment-back-button:hover {
          color: #7465E8;
          border-color: #DCD6FF;
          background: #FAF9FF;
        }

        .assessment-download-button {
          border: 0;
          color: white;
          background: #7465E8;
          box-shadow: 0 9px 22px rgba(116, 101, 232, .18);
        }

        .assessment-download-button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #6959DA;
        }

        .assessment-download-button:disabled {
          opacity: .65;
          cursor: wait;
        }

        .assessment-pdf-error {
          margin-bottom: 14px;
          padding: 12px 14px;
          border: 1px solid #F3DCE1;
          border-radius: 12px;
          color: #B8495F;
          background: #FFF5F6;
          font-size: 11px;
        }

        .assessment-loading-state {
          min-height: 450px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          color: #9093A6;
        }

        .assessment-spinner {
          width: 38px;
          height: 38px;
          border: 3px solid #E9E5FF;
          border-top-color: #7465E8;
          border-radius: 50%;
          animation: assessmentSpin .8s linear infinite;
        }

        @keyframes assessmentSpin {
          to { transform: rotate(360deg); }
        }

        .assessment-error-state {
          min-height: 380px;
          padding: 42px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          color: #B84C60;
          background: white;
          border: 1px solid #F1DDE1;
        }

        .assessment-error-state h1 {
          margin: 16px 0 7px;
          color: #373952;
          font-size: 22px;
        }

        .assessment-error-state p {
          margin: 0;
          color: #9295A7;
          font-size: 12px;
        }

        .assessment-error-state button,
        .assessment-bottom-action button {
          margin-top: 20px;
          border: 0;
          color: white;
          background: #7465E8;
        }

        .assessment-document {
          width: 100%;
          overflow: hidden;
          border-radius: 24px;
          background: #FFFFFF;
          border: 1px solid #E7E7EF;
          box-shadow: 0 18px 52px rgba(50, 49, 86, .08);
        }

        .assessment-cover {
          padding: 30px 32px 32px;
          background:
            radial-gradient(
              circle at 92% 18%,
              rgba(116, 101, 232, .08),
              transparent 28%
            ),
            linear-gradient(
              180deg,
              #FFFFFF 0%,
              #FCFCFF 100%
            );
          border-bottom: 1px solid #ECECF4;
        }

        .assessment-brand-row,
        .assessment-hero,
        .assessment-game-top,
        .assessment-game-summary-head,
        .assessment-clinical-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .assessment-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .assessment-brand img {
          width: 92px;
          height: 48px;
          object-fit: contain;
        }

        .assessment-brand > div {
          padding-left: 12px;
          border-left: 1px solid #E6E2F5;
        }

        .assessment-brand span,
        .assessment-brand strong {
          display: block;
        }

        .assessment-brand span {
          color: #7465E8;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .15em;
        }

        .assessment-brand strong {
          margin-top: 3px;
          color: #777A90;
          font-size: 10px;
          font-weight: 650;
        }

        .assessment-status {
          min-height: 31px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          font-size: 9.5px;
          font-weight: 800;
          white-space: nowrap;
        }

        .assessment-status.completed {
          color: #37866A;
          background: #E8F8F1;
        }

        .assessment-status.progress {
          color: #4B7EC1;
          background: #EDF5FF;
        }

        .assessment-status.paused {
          color: #A97924;
          background: #FFF5DF;
        }

        .assessment-status.pending {
          color: #697286;
          background: #EEF1F5;
        }

        .assessment-status.failed {
          color: #B94C61;
          background: #FFF0F3;
        }

        .assessment-status.small {
          min-height: 28px;
          padding: 0 10px;
          font-size: 9px;
        }

        .assessment-hero {
          align-items: stretch;
          margin-top: 24px;
          padding-top: 26px;
          border-top: 1px solid #ECE9F7;
        }

        .assessment-hero-copy {
          min-width: 0;
          padding: 10px 0;
        }

        .assessment-document-label,
        .assessment-section-heading > div > span,
        .assessment-game-summary-head > div > span,
        .assessment-game-title-wrap > div:last-child > span {
          color: #8B7CE3;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .12em;
        }

        .assessment-hero h1 {
          margin: 8px 0 8px;
          color: #292B52;
          font-size: 31px;
          line-height: 1.12;
          letter-spacing: -.025em;
        }

        .assessment-session-reference {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #8D90A2;
          font-size: 11px;
          font-weight: 650;
        }

        .assessment-score-block {
          width: 190px;
          flex: 0 0 190px;
          padding: 18px 20px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background:
            linear-gradient(
              145deg,
              #7566EA 0%,
              #8C78F0 100%
            );
          box-shadow: 0 14px 30px rgba(116, 101, 232, .19);
        }

        .assessment-score-block span {
          color: rgba(255,255,255,.78);
          font-size: 9.5px;
          font-weight: 750;
        }

        .assessment-score-block strong {
          margin-top: 4px;
          color: white;
          font-size: 34px;
          line-height: 1;
          letter-spacing: -.035em;
        }

        .assessment-score-block small {
          margin-top: 8px;
          color: rgba(255,255,255,.66);
          font-size: 8.5px;
        }

        .assessment-overview-panel {
          display: grid;
          grid-template-columns: minmax(210px, .9fr) minmax(0, 2.1fr);
          gap: 0;
          margin-top: 24px;
          overflow: hidden;
          border-radius: 20px;
          background: white;
          border: 1px solid #E7E7EF;
          box-shadow: 0 8px 24px rgba(50, 49, 86, .035);
        }

        .assessment-child-profile {
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 126px;
          padding: 20px;
          background:
            linear-gradient(
              145deg,
              #F7F5FF,
              #FBFAFF
            );
          border-right: 1px solid #E9E7F3;
        }

        .assessment-child-avatar {
          width: 54px;
          height: 54px;
          flex: 0 0 54px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          color: #7465E8;
          background: white;
          border: 1px solid #E4DFFF;
          box-shadow: 0 8px 18px rgba(116, 101, 232, .08);
        }

        .assessment-child-copy span {
          display: block;
          color: #999CAD;
          font-size: 9px;
          font-weight: 700;
        }

        .assessment-child-copy strong {
          display: block;
          margin-top: 4px;
          color: #303252;
          font-size: 18px;
          line-height: 1.2;
        }

        .assessment-child-copy p {
          margin: 6px 0 0;
          color: #7F8297;
          font-size: 10px;
          font-weight: 650;
        }

        .assessment-facts {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          min-width: 0;
        }

        .assessment-fact {
          min-width: 0;
          padding: 19px 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-left: 1px solid #EFEFF4;
        }

        .assessment-fact:first-child {
          border-left: 0;
        }

        .assessment-fact > div {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          color: #7465E8;
          background: #F0EDFF;
        }

        .assessment-fact span {
          margin-top: 10px;
          color: #999CAD;
          font-size: 8.8px;
          font-weight: 650;
        }

        .assessment-fact strong {
          margin-top: 4px;
          color: #3A3C59;
          font-size: 13px;
          line-height: 1.3;
          overflow-wrap: anywhere;
        }

        .assessment-fact-date strong {
          font-size: 10.5px;
        }

        .assessment-section {
          padding: 30px 32px;
          border-bottom: 1px solid #EEEEF4;
        }

        .assessment-section-heading h2 {
          margin: 6px 0 0;
          color: #303252;
          font-size: 20px;
          letter-spacing: -.015em;
        }

        .assessment-section-heading p {
          margin: 5px 0 0;
          color: #989BAC;
          font-size: 10.5px;
        }

        .assessment-clinical-section {
          background: #FFFFFF;
        }

        .assessment-clinical-card {
          display: grid;
          grid-template-columns: 58px minmax(0, 1fr);
          gap: 17px;
          margin-top: 18px;
          padding: 20px;
          border-radius: 18px;
          background: #FAF9FF;
          border: 1px solid #E9E5FA;
        }

        .assessment-clinical-accent {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          color: #7465E8;
          background: white;
          border: 1px solid #E5E0FF;
        }

        .assessment-clinical-content {
          min-width: 0;
        }

        .assessment-clinical-head {
          align-items: flex-start;
        }

        .assessment-clinical-head h3 {
          margin: 2px 0 0;
          color: #3B3D59;
          font-size: 13px;
        }

        .assessment-performance {
          min-height: 29px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          font-size: 9.2px;
          font-weight: 800;
          white-space: nowrap;
        }

        .assessment-performance.good {
          color: #37866A;
          background: #E7F7F0;
        }

        .assessment-performance.monitor {
          color: #A87825;
          background: #FFF4DF;
        }

        .assessment-performance.attention {
          color: #B84A60;
          background: #FFF0F3;
        }

        .assessment-performance.neutral {
          color: #687185;
          background: #EEF1F5;
        }

        .assessment-clinical-main {
          margin: 11px 0 0;
          color: #565972;
          font-size: 11.5px;
          line-height: 1.72;
        }

        .assessment-disclaimer {
          margin: 12px 0 0;
          padding-top: 11px;
          border-top: 1px solid #E8E4F5;
          color: #989BAC;
          font-size: 9.5px;
          line-height: 1.65;
        }

        .assessment-section-heading.game-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
        }

        .assessment-game-count {
          min-height: 32px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          color: #7465E8;
          background: #F0EDFF;
          font-size: 9.5px;
          font-weight: 800;
          white-space: nowrap;
        }

        .assessment-empty-games {
          margin-top: 18px;
          padding: 30px;
          border-radius: 16px;
          color: #9396A8;
          background: #F8F8FB;
          text-align: center;
          font-size: 11px;
        }

        .assessment-games-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 19px;
        }

        .assessment-game-card {
          overflow: hidden;
          border-radius: 18px;
          background: white;
          border: 1px solid #E7E7EF;
          box-shadow: 0 6px 18px rgba(52, 50, 91, .025);
        }

        .assessment-game-top {
          padding: 17px 18px;
          background: #FCFCFE;
          border-bottom: 1px solid #ECECF3;
        }

        .assessment-game-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .assessment-game-number {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #7465E8;
          background: #F0EDFF;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: .04em;
        }

        .assessment-game-title-wrap h3 {
          margin: 4px 0 2px;
          color: #343653;
          font-size: 15px;
        }

        .assessment-game-title-wrap p {
          margin: 0;
          color: #9699AA;
          font-size: 9.5px;
        }

        .assessment-game-data-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          padding: 4px 18px;
          background: white;
        }

        .assessment-data-item {
          min-width: 0;
          min-height: 72px;
          padding: 14px 13px;
          display: grid;
          grid-template-columns: 22px minmax(0, 1fr);
          grid-template-rows: auto auto;
          column-gap: 7px;
          align-items: center;
          border-right: 1px solid #EFEFF4;
          border-bottom: 1px solid #EFEFF4;
        }

        .assessment-data-item:nth-child(3n) {
          border-right: 0;
        }

        .assessment-data-item:nth-last-child(-n+3) {
          border-bottom: 0;
        }

        .assessment-data-item svg {
          grid-row: 1 / span 2;
          color: #7465E8;
        }

        .assessment-data-item span {
          color: #999CAD;
          font-size: 8.5px;
          font-weight: 650;
        }

        .assessment-data-item strong {
          color: #41435D;
          font-size: 12px;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .assessment-game-summary {
          margin: 0 18px 18px;
          padding: 15px 16px;
          border-radius: 14px;
          background: #F8F7FD;
          border: 1px solid #ECEAF6;
        }

        .assessment-game-summary h4 {
          margin: 4px 0 0;
          color: #444660;
          font-size: 11.5px;
        }

        .assessment-game-summary > p {
          margin: 9px 0 0;
          color: #777A8E;
          font-size: 10px;
          line-height: 1.6;
        }

        .assessment-result-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 11px;
        }

        .assessment-result-tags > span {
          min-height: 27px;
          padding: 0 9px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          color: #66697D;
          background: white;
          border: 1px solid #E7E7EF;
          font-size: 8.8px;
          font-weight: 650;
        }

        .assessment-document-footer {
          min-height: 56px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          color: #A0A3B4;
          background: #FAFAFC;
          font-size: 9px;
          font-weight: 650;
        }

        .assessment-bottom-action {
          display: flex;
          justify-content: center;
          padding-bottom: 10px;
        }

        @media (max-width: 900px) {
          .assessment-report-main {
            padding: 0 22px 40px;
          }

          .assessment-overview-panel {
            grid-template-columns: 1fr;
          }

          .assessment-child-profile {
            border-right: 0;
            border-bottom: 1px solid #E9E7F3;
          }

          .assessment-facts {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .assessment-fact:nth-child(3) {
            border-left: 0;
          }

          .assessment-fact:nth-child(-n+2) {
            border-bottom: 1px solid #EFEFF4;
          }

          .assessment-game-data-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .assessment-data-item:nth-child(3n) {
            border-right: 1px solid #EFEFF4;
          }

          .assessment-data-item:nth-child(2n) {
            border-right: 0;
          }

          .assessment-data-item:nth-last-child(-n+3) {
            border-bottom: 1px solid #EFEFF4;
          }

          .assessment-data-item:nth-last-child(-n+2) {
            border-bottom: 0;
          }
        }

        @media (max-width: 620px) {
          .assessment-report-toolbar,
          .assessment-brand-row,
          .assessment-title-row,
          .assessment-game-top,
          .assessment-game-summary-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .assessment-cover,
          .assessment-section {
            padding: 22px;
          }

          .assessment-brand div {
            display: none;
          }

          .assessment-hero {
            flex-direction: column;
          }

          .assessment-score-block {
            width: 100%;
            flex-basis: auto;
          }

          .assessment-facts,
          .assessment-game-data-grid {
            grid-template-columns: 1fr;
          }

          .assessment-fact,
          .assessment-fact:nth-child(3),
          .assessment-data-item,
          .assessment-data-item:nth-child(2n),
          .assessment-data-item:nth-child(3n) {
            border-left: 0;
            border-right: 0;
            border-bottom: 1px solid #EFEFF4;
          }

          .assessment-fact:last-child,
          .assessment-data-item:last-child {
            border-bottom: 0;
          }

          .assessment-title-icon {
            display: none;
          }
        }
        `}
      </style>

    </div>
  );

};


export default AssessmentReport;
