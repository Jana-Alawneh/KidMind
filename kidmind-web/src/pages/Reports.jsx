import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  FileText,
  Gamepad2,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import Sidebar from
  "../components/layout/Sidebar";

import Navbar from
  "../components/layout/Navbar";

import {
  getSessions,
} from "../api/sessionsApi";

import {
  getChildren,
} from "../api/childrenApi";


const REPORTABLE_STATUSES =
  new Set([
    "Completed",
    "Ended",
  ]);


const parseDate = value => {

  if (!value) {
    return null;
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
    return null;
  }


  return date;

};


const getSessionDate =
  session => {

    return (
      parseDate(
        session.ended_at
      ) ||
      parseDate(
        session.started_at
      ) ||
      parseDate(
        session.scheduled_at
      ) ||
      parseDate(
        session.created_at
      )
    );

  };


const getTimestamp = date => {
  return (
    date?.getTime() ??
    0
  );
};


const formatDate = date => {

  if (!date) {
    return "—";
  }


  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

};


const formatTime = date => {

  if (!date) {
    return "—";
  }


  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );

};


const normalizeGameName =
  value => {

    return String(
      value || ""
    )
      .trim()
      .toLowerCase();

  };


const getSessionScore =
  session => {

    const rawScore =
      session?.score;


    if (
      rawScore !== null &&
      rawScore !== undefined &&
      rawScore !== ""
    ) {

      const score =
        Number(
          rawScore
        );


      if (
        Number.isFinite(
          score
        )
      ) {

        return Math.max(
          0,
          Math.min(
            100,
            Math.round(
              score
            )
          )
        );

      }

    }


    const games =
      Array.isArray(
        session?.games
      )
        ? session.games
        : [];


    const scores =
      games
        .filter(
          game =>
            game.status ===
              "Completed" ||
            game.status ===
              "Failed"
        )
        .map(
          game =>
            Number(
              game.score
            )
        )
        .filter(
          score =>
            Number.isFinite(
              score
            )
        );


    if (
      scores.length === 0
    ) {
      return null;
    }


    const total =
      scores.reduce(
        (
          sum,
          score
        ) =>
          sum + score,
        0
      );


    return Math.max(
      0,
      Math.min(
        100,
        Math.round(
          total /
          scores.length
        )
      )
    );

  };


const getGamesText =
  session => {

    const games =
      Array.isArray(
        session?.games
      )
        ? session.games
        : [];


    const names =
      games
        .map(
          game =>
            game.game_name
        )
        .filter(Boolean);


    if (
      names.length === 0
    ) {
      return "Assessment Session";
    }


    if (
      names.length === 1
    ) {
      return names[0];
    }


    return `${names.length} Assessment Games`;

  };


const isSameDay = (
  first,
  second
) => {

  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );

};


const matchesDateFilter = (
  date,
  filter
) => {

  if (
    filter === "all"
  ) {
    return true;
  }


  if (!date) {
    return false;
  }


  const now =
    new Date();


  if (
    filter === "today"
  ) {
    return isSameDay(
      date,
      now
    );
  }


  if (
    filter === "yesterday"
  ) {

    const yesterday =
      new Date(now);

    yesterday.setDate(
      now.getDate() - 1
    );

    return isSameDay(
      date,
      yesterday
    );

  }


  if (
    filter === "last7"
  ) {

    const start =
      new Date(now);

    start.setHours(
      0,
      0,
      0,
      0
    );

    start.setDate(
      start.getDate() - 6
    );

    return (
      date >= start &&
      date <= now
    );

  }


  if (
    filter === "thisMonth"
  ) {

    return (
      date.getFullYear() ===
        now.getFullYear() &&
      date.getMonth() ===
        now.getMonth()
    );

  }


  if (
    filter === "lastMonth"
  ) {

    const previousMonth =
      new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

    return (
      date.getFullYear() ===
        previousMonth.getFullYear() &&
      date.getMonth() ===
        previousMonth.getMonth()
    );

  }


  return true;

};


const Reports = () => {

  const navigate =
    useNavigate();


  const [
    reports,
    setReports,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    childFilter,
    setChildFilter,
  ] = useState("all");

  const [
    gameFilter,
    setGameFilter,
  ] = useState("all");

  const [
    dateFilter,
    setDateFilter,
  ] = useState("all");


  useEffect(
    () => {

      const loadReports =
        async () => {

          try {

            setLoading(true);
            setError("");


            const [
              sessionsData,
              childrenData,
            ] =
              await Promise.all([
                getSessions(),
                getChildren(),
              ]);


            const sessions =
              Array.isArray(
                sessionsData
              )
                ? sessionsData
                : [];

            const children =
              Array.isArray(
                childrenData
              )
                ? childrenData
                : [];


            const mappedReports =
              sessions
                .filter(
                  session =>
                    REPORTABLE_STATUSES
                      .has(
                        session.status
                      )
                )
                .map(
                  session => {

                    const child =
                      children.find(
                        item =>
                          Number(
                            item.id
                          ) ===
                          Number(
                            session.child_id
                          )
                      );

                    const games =
                      Array.isArray(
                        session.games
                      )
                        ? session.games
                        : [];


                    return {
                      ...session,
                      reportDate:
                        getSessionDate(
                          session
                        ),
                      reportChildName:
                        session.child_name ||
                        child?.full_name ||
                        `Child #${session.child_id}`,
                      reportScore:
                        getSessionScore(
                          session
                        ),
                      reportGames:
                        games,
                      reportGamesText:
                        getGamesText(
                          session
                        ),
                    };

                  }
                )
                .sort(
                  (
                    first,
                    second
                  ) =>
                    getTimestamp(
                      second.reportDate
                    ) -
                    getTimestamp(
                      first.reportDate
                    )
                );


            setReports(
              mappedReports
            );

          } catch (
            loadError
          ) {

            console.error(
              "Failed to load reports:",
              loadError
            );

            setError(
              loadError?.message ||
              "Failed to load reports"
            );

          } finally {

            setLoading(false);

          }

        };


      loadReports();

    },
    []
  );


  const childOptions =
    useMemo(
      () => {

        const map =
          new Map();

        reports.forEach(
          report => {
            map.set(
              String(
                report.child_id
              ),
              report.reportChildName
            );
          }
        );

        return Array.from(
          map.entries()
        )
          .map(
            ([id, name]) => ({
              id,
              name,
            })
          )
          .sort(
            (
              first,
              second
            ) =>
              first.name.localeCompare(
                second.name
              )
          );

      },
      [reports]
    );


  const gameOptions =
    useMemo(
      () => {

        const map =
          new Map();

        reports.forEach(
          report => {

            report.reportGames.forEach(
              game => {

                const name =
                  game?.game_name;

                if (!name) {
                  return;
                }

                map.set(
                  normalizeGameName(
                    name
                  ),
                  name
                );

              }
            );

          }
        );

        return Array.from(
          map.entries()
        )
          .map(
            ([value, label]) => ({
              value,
              label,
            })
          )
          .sort(
            (
              first,
              second
            ) =>
              first.label.localeCompare(
                second.label
              )
          );

      },
      [reports]
    );


  const filteredReports =
    useMemo(
      () => {

        return reports.filter(
          report => {

            const matchesChild =
              childFilter === "all" ||
              String(
                report.child_id
              ) === childFilter;

            const matchesGame =
              gameFilter === "all" ||
              report.reportGames.some(
                game =>
                  normalizeGameName(
                    game?.game_name
                  ) === gameFilter
              );

            const matchesDate =
              matchesDateFilter(
                report.reportDate,
                dateFilter
              );


            return (
              matchesChild &&
              matchesGame &&
              matchesDate
            );

          }
        );

      },
      [
        reports,
        childFilter,
        gameFilter,
        dateFilter,
      ]
    );


  const todayCount =
    useMemo(
      () =>
        reports.filter(
          report =>
            matchesDateFilter(
              report.reportDate,
              "today"
            )
        ).length,
      [reports]
    );


  const monthReports =
    useMemo(
      () =>
        reports.filter(
          report =>
            matchesDateFilter(
              report.reportDate,
              "thisMonth"
            )
        ),
      [reports]
    );


  const averageScore =
    useMemo(
      () => {

        const scores =
          reports
            .map(
              report =>
                report.reportScore
            )
            .filter(
              score =>
                typeof score ===
                "number"
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
              score
            ) =>
              sum + score,
            0
          ) /
          scores.length
        );

      },
      [reports]
    );


  const clearFilters = () => {
    setChildFilter("all");
    setGameFilter("all");
    setDateFilter("all");
  };


  return (

    <div className="therapist-reports-page">

      <Sidebar />

      <main className="therapist-reports-main">

        <Navbar />

        <div className="therapist-reports-content">

          <section className="reports-hero">

            <div className="reports-hero-copy">

              <span className="reports-eyebrow">
                ASSESSMENT REPORTING
              </span>

              <h1>
                Reports
              </h1>

              <p>
                Review assessment reports across all children and sessions
              </p>

            </div>

            <div className="reports-hero-icon">
              <FileText size={30} />
            </div>

          </section>


          <div className="reports-summary-grid">

            <SummaryCard
              icon={FileText}
              label="Total Reports"
              value={
                loading
                  ? "..."
                  : reports.length
              }
              tone="purple"
            />

            <SummaryCard
              icon={CalendarDays}
              label="Today"
              value={
                loading
                  ? "..."
                  : todayCount
              }
              tone="blue"
            />

            <SummaryCard
              icon={BarChart3}
              label="This Month"
              value={
                loading
                  ? "..."
                  : monthReports.length
              }
              tone="green"
            />

            <SummaryCard
              icon={Gamepad2}
              label="Average Score"
              value={
                loading
                  ? "..."
                  : averageScore === null
                    ? "—"
                    : `${averageScore}%`
              }
              tone="amber"
            />

          </div>


          <section className="reports-filter-panel">

            <div className="reports-panel-heading">

              <div className="reports-panel-title-wrap">

                <div className="reports-panel-icon soft-purple">
                  <SlidersHorizontal size={19} />
                </div>

                <div>
                  <h2>
                    Filter Reports
                  </h2>

                  <p>
                    Filter by child, assessment game, or date
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="reports-clear-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>


            <div className="reports-filter-grid">

              <FilterSelect
                icon={UserRound}
                label="Child"
                value={childFilter}
                onChange={
                  setChildFilter
                }
              >
                <option value="all">
                  All Children
                </option>

                {childOptions.map(
                  child => (
                    <option
                      key={child.id}
                      value={child.id}
                    >
                      {child.name}
                    </option>
                  )
                )}
              </FilterSelect>


              <FilterSelect
                icon={Gamepad2}
                label="Game"
                value={gameFilter}
                onChange={
                  setGameFilter
                }
              >
                <option value="all">
                  All Games
                </option>

                {gameOptions.map(
                  game => (
                    <option
                      key={game.value}
                      value={game.value}
                    >
                      {game.label}
                    </option>
                  )
                )}
              </FilterSelect>


              <FilterSelect
                icon={CalendarDays}
                label="Date"
                value={dateFilter}
                onChange={
                  setDateFilter
                }
              >
                <option value="all">
                  All Time
                </option>
                <option value="today">
                  Today
                </option>
                <option value="yesterday">
                  Yesterday
                </option>
                <option value="last7">
                  Last 7 Days
                </option>
                <option value="thisMonth">
                  This Month
                </option>
                <option value="lastMonth">
                  Last Month
                </option>
              </FilterSelect>

            </div>

          </section>


          <section className="reports-table-panel">

            <div className="reports-table-heading">

              <div>
                <span>
                  REPORT LIBRARY
                </span>

                <h2>
                  Assessment Reports
                </h2>

                <p>
                  {loading
                    ? "Loading reports..."
                    : `${filteredReports.length} report${filteredReports.length === 1 ? "" : "s"} found`
                  }
                </p>
              </div>

              <div className="reports-result-chip">
                {filteredReports.length}
              </div>

            </div>


            {loading && (
              <div className="reports-state">
                <div className="reports-spinner" />
                <span>
                  Loading reports...
                </span>
              </div>
            )}


            {!loading &&
              error && (
                <div className="reports-state">
                  <div className="reports-error-card">
                    <strong>
                      Unable to load reports
                    </strong>
                    <span>
                      {error}
                    </span>
                  </div>
                </div>
              )}


            {!loading &&
              !error &&
              filteredReports.length === 0 && (
                <div className="reports-state reports-empty-state">
                  <div className="reports-empty-icon">
                    <FileText size={28} />
                  </div>
                  <strong>
                    No reports found
                  </strong>
                  <span>
                    Try changing the selected filters.
                  </span>
                </div>
              )}


            {!loading &&
              !error &&
              filteredReports.length > 0 && (
                <div className="reports-table-scroll">

                  <table className="reports-table">

                    <thead>
                      <tr>
                        <th>Child</th>
                        <th>Session</th>
                        <th>Assessment</th>
                        <th>Score</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th className="align-right">
                          Report
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredReports.map(
                        report => (

                          <tr key={report.id}>

                            <td>
                              <div className="reports-child-cell">
                                <div className="reports-child-icon">
                                  <UserRound size={18} />
                                </div>

                                <div>
                                  <strong>
                                    {report.reportChildName}
                                  </strong>
                                  <span>
                                    ID #{report.child_id}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <strong className="reports-session-id">
                                Session #{report.id}
                              </strong>
                            </td>

                            <td>
                              <div className="reports-assessment-cell">
                                <strong>
                                  {report.reportGamesText}
                                </strong>

                                {report.reportGames.length > 1 && (
                                  <span>
                                    {report.reportGames
                                      .map(
                                        game =>
                                          game.game_name
                                      )
                                      .filter(Boolean)
                                      .join(", ")
                                    }
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <span className="reports-score-pill">
                                {typeof report.reportScore === "number"
                                  ? `${report.reportScore}%`
                                  : "—"
                                }
                              </span>
                            </td>

                            <td>
                              <div className="reports-date-cell">
                                <strong>
                                  {formatDate(
                                    report.reportDate
                                  )}
                                </strong>
                                <span>
                                  {formatTime(
                                    report.reportDate
                                  )}
                                </span>
                              </div>
                            </td>

                            <td>
                              <span
                                className={
                                  report.status === "Completed"
                                    ? "reports-status completed"
                                    : "reports-status ended"
                                }
                              >
                                {report.status}
                              </span>
                            </td>

                            <td className="align-right">
                              <button
                                type="button"
                                className="reports-view-button"
                                onClick={() => {
                                  navigate(
                                    `/assessment-report?sessionId=${report.id}`
                                  );
                                }}
                              >
                                View Report
                                <ArrowRight size={16} />
                              </button>
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>
              )}

          </section>

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

        .therapist-reports-page {
          min-height: 100vh;
          display: flex;
          background: #F7F8FC;
          color: #252852;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .therapist-reports-main {
          flex: 1;
          min-width: 0;
          padding: 0 34px 46px;
          overflow-y: auto;
        }

        .therapist-reports-content {
          max-width: 1240px;
          margin: 30px auto 0;
        }

        .reports-hero {
          min-height: 168px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          padding: 30px 32px;
          border: 1px solid #E8E5F7;
          border-radius: 24px;
          background: linear-gradient(135deg, #FFFFFF 0%, #FAF9FF 56%, #F3EFFF 100%);
          box-shadow: 0 14px 34px rgba(82, 70, 160, .06);
          position: relative;
          overflow: hidden;
        }

        .reports-hero::after {
          content: "";
          position: absolute;
          width: 190px;
          height: 190px;
          right: -54px;
          top: -72px;
          border-radius: 50%;
          background: rgba(124, 108, 255, .08);
        }

        .reports-hero-copy {
          position: relative;
          z-index: 1;
        }

        .reports-eyebrow {
          display: inline-flex;
          align-items: center;
          min-height: 26px;
          padding: 0 10px;
          border-radius: 999px;
          color: #7465E8;
          background: #F0EDFF;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .12em;
        }

        .reports-hero h1 {
          margin: 12px 0 7px;
          color: #292B52;
          font-size: 30px;
          line-height: 1.12;
        }

        .reports-hero p {
          margin: 0;
          max-width: 650px;
          color: #8E91A6;
          font-size: 13.5px;
          line-height: 1.65;
        }

        .reports-hero-icon {
          width: 70px;
          height: 70px;
          flex: 0 0 70px;
          display: grid;
          place-items: center;
          position: relative;
          z-index: 1;
          border-radius: 21px;
          color: #7465E8;
          background: white;
          border: 1px solid #E7E2FF;
          box-shadow: 0 12px 28px rgba(116, 101, 232, .12);
        }

        .reports-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .reports-summary-card {
          min-height: 122px;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 18px;
          border-radius: 20px;
          background: white;
          border: 1px solid #ECECF4;
          box-shadow: 0 8px 24px rgba(55, 54, 96, .035);
        }

        .reports-summary-icon {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: grid;
          place-items: center;
          border-radius: 14px;
        }

        .reports-summary-icon.purple {
          color: #7465E8;
          background: #F0EDFF;
        }

        .reports-summary-icon.blue {
          color: #4F8FD8;
          background: #EDF6FF;
        }

        .reports-summary-icon.green {
          color: #45A27F;
          background: #ECF9F3;
        }

        .reports-summary-icon.amber {
          color: #C88728;
          background: #FFF5E8;
        }

        .reports-summary-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .reports-summary-copy span {
          color: #9194A7;
          font-size: 11px;
        }

        .reports-summary-copy strong {
          margin-top: 3px;
          color: #303255;
          font-size: 24px;
          line-height: 1.1;
        }

        .reports-filter-panel,
        .reports-table-panel {
          margin-top: 20px;
          border-radius: 22px;
          background: white;
          border: 1px solid #ECECF4;
          box-shadow: 0 8px 28px rgba(55, 54, 96, .035);
        }

        .reports-filter-panel {
          padding: 22px;
        }

        .reports-panel-heading,
        .reports-table-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .reports-panel-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reports-panel-icon {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: grid;
          place-items: center;
          border-radius: 12px;
        }

        .reports-panel-icon.soft-purple {
          color: #7465E8;
          background: #F0EDFF;
        }

        .reports-panel-heading h2,
        .reports-table-heading h2 {
          margin: 0;
          color: #333554;
          font-size: 16px;
        }

        .reports-panel-heading p,
        .reports-table-heading p {
          margin: 4px 0 0;
          color: #A0A3B4;
          font-size: 11.5px;
        }

        .reports-clear-button {
          min-height: 38px;
          padding: 0 13px;
          border: 1px solid #E6E1FF;
          border-radius: 11px;
          color: #7465E8;
          background: #FAF9FF;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .reports-clear-button:hover {
          background: #F3F0FF;
        }

        .reports-filter-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 18px;
        }

        .reports-filter-label {
          display: block;
          margin-bottom: 7px;
          color: #6F728A;
          font-size: 10.5px;
          font-weight: 700;
        }

        .reports-select-wrap {
          position: relative;
        }

        .reports-select-wrap svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #A3A5B6;
          pointer-events: none;
        }

        .reports-select-wrap select {
          width: 100%;
          height: 46px;
          padding: 0 36px 0 40px;
          border: 1px solid #E8E8F1;
          border-radius: 13px;
          outline: none;
          color: #4E506A;
          background: #FBFBFD;
          font: inherit;
          font-size: 11.5px;
          cursor: pointer;
          transition: .18s ease;
        }

        .reports-select-wrap select:focus {
          border-color: #CFC8FF;
          background: white;
          box-shadow: 0 0 0 3px rgba(124, 108, 255, .08);
        }

        .reports-table-panel {
          overflow: hidden;
        }

        .reports-table-heading {
          padding: 21px 22px;
          border-bottom: 1px solid #F0F0F5;
        }

        .reports-table-heading > div:first-child > span {
          display: block;
          margin-bottom: 5px;
          color: #8E80E6;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .12em;
        }

        .reports-result-chip {
          min-width: 36px;
          height: 36px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: #7465E8;
          background: #F0EDFF;
          font-size: 12px;
          font-weight: 800;
        }

        .reports-state {
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 10px;
          padding: 28px;
          color: #9497AA;
          font-size: 12px;
          text-align: center;
        }

        .reports-spinner {
          width: 34px;
          height: 34px;
          border: 3px solid #E9E5FF;
          border-top-color: #7465E8;
          border-radius: 50%;
          animation: reportsSpin .8s linear infinite;
        }

        @keyframes reportsSpin {
          to { transform: rotate(360deg); }
        }

        .reports-error-card {
          width: min(440px, 100%);
          padding: 18px;
          border-radius: 15px;
          color: #B7485D;
          background: #FFF3F5;
          border: 1px solid #F5DDE2;
        }

        .reports-error-card strong,
        .reports-error-card span {
          display: block;
        }

        .reports-error-card span {
          margin-top: 5px;
          font-size: 11px;
        }

        .reports-empty-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          color: #7465E8;
          background: #F0EDFF;
        }

        .reports-empty-state strong {
          color: #4C4F69;
          font-size: 14px;
        }

        .reports-table-scroll {
          overflow-x: auto;
        }

        .reports-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .reports-table th {
          padding: 12px 17px;
          color: #A0A3B4;
          background: #FAFAFC;
          border-bottom: 1px solid #EEEEF4;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .reports-table td {
          padding: 15px 17px;
          border-bottom: 1px solid #F1F1F5;
          vertical-align: middle;
        }

        .reports-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .reports-table tbody tr {
          transition: .16s ease;
        }

        .reports-table tbody tr:hover {
          background: #FCFBFF;
        }

        .reports-child-cell {
          min-width: 175px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reports-child-icon {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #7465E8;
          background: #F0EDFF;
        }

        .reports-child-cell strong,
        .reports-child-cell span,
        .reports-assessment-cell strong,
        .reports-assessment-cell span,
        .reports-date-cell strong,
        .reports-date-cell span {
          display: block;
        }

        .reports-child-cell strong,
        .reports-session-id,
        .reports-assessment-cell strong,
        .reports-date-cell strong {
          color: #46485F;
          font-size: 11px;
          font-weight: 700;
        }

        .reports-child-cell span,
        .reports-assessment-cell span,
        .reports-date-cell span {
          margin-top: 3px;
          color: #A3A5B4;
          font-size: 9.5px;
        }

        .reports-assessment-cell {
          min-width: 180px;
          max-width: 240px;
        }

        .reports-assessment-cell span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .reports-score-pill {
          min-width: 54px;
          height: 31px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: #6757CC;
          background: #F1EEFF;
          font-size: 11px;
          font-weight: 800;
        }

        .reports-status {
          min-height: 29px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          font-size: 9.5px;
          font-weight: 700;
        }

        .reports-status.completed {
          color: #37876B;
          background: #EAF8F2;
        }

        .reports-status.ended {
          color: #667086;
          background: #F0F2F6;
        }

        .reports-view-button {
          min-height: 36px;
          padding: 0 13px;
          border: 0;
          border-radius: 11px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: white;
          background: #7465E8;
          font-size: 10.5px;
          font-weight: 700;
          cursor: pointer;
          transition: .18s ease;
          white-space: nowrap;
        }

        .reports-view-button:hover {
          transform: translateY(-1px);
          background: #6959DA;
          box-shadow: 0 8px 18px rgba(116, 101, 232, .18);
        }

        .align-right {
          text-align: right;
        }

        @media (max-width: 1120px) {
          .reports-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .therapist-reports-main {
            padding: 0 22px 38px;
          }

          .reports-filter-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .reports-hero {
            align-items: flex-start;
            padding: 24px;
          }

          .reports-hero-icon {
            display: none;
          }

          .reports-summary-grid {
            grid-template-columns: 1fr;
          }

          .reports-panel-heading {
            align-items: flex-start;
            flex-direction: column;
          }
        }
        `}
      </style>

    </div>

  );

};


const SummaryCard = ({
  icon: Icon,
  label,
  value,
  tone,
}) => {

  return (
    <article className="reports-summary-card">

      <div className={`reports-summary-icon ${tone}`}>
        <Icon size={21} />
      </div>

      <div className="reports-summary-copy">
        <span>
          {label}
        </span>
        <strong>
          {value}
        </strong>
      </div>

    </article>
  );

};


const FilterSelect = ({
  icon: Icon,
  label,
  value,
  onChange,
  children,
}) => {

  return (
    <label>

      <span className="reports-filter-label">
        {label}
      </span>

      <div className="reports-select-wrap">

        <Icon size={17} />

        <select
          value={value}
          onChange={
            event =>
              onChange(
                event.target.value
              )
          }
        >
          {children}
        </select>

      </div>

    </label>
  );

};


export default Reports;