import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  RefreshCw,
  Search,
  TrendingUp,
  UserRoundCog,
  Users,
  X,
} from "lucide-react";

import api from "../../services/api";

import {
  getSessions,
} from "../../api/sessionsApi";

import {
  getChildren,
} from "../../api/childrenApi";


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
    return null;
  }


  return date;

};


const getSessionDate = session => {

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
    filter ===
    "all"
  ) {
    return true;
  }


  if (!date) {
    return false;
  }


  const now =
    new Date();


  if (
    filter ===
    "today"
  ) {

    return isSameDay(
      date,
      now
    );

  }


  if (
    filter ===
    "yesterday"
  ) {

    const yesterday =
      new Date(
        now
      );


    yesterday.setDate(
      now.getDate() - 1
    );


    return isSameDay(
      date,
      yesterday
    );

  }


  if (
    filter ===
    "last7"
  ) {

    const start =
      new Date(
        now
      );


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
    filter ===
    "thisMonth"
  ) {

    return (
      date.getFullYear() ===
        now.getFullYear() &&
      date.getMonth() ===
        now.getMonth()
    );

  }


  if (
    filter ===
    "lastMonth"
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


const domainLabels = {
  "focus finder": "Focus",
  focus: "Focus",
  "memory match": "Memory",
  memory: "Memory",
  "puzzle path": "Problem Solving",
  puzzle: "Problem Solving",
  "reading adventure": "Reading",
  reading: "Reading",
  "quick match": "Processing Speed",
  matching: "Processing Speed",
};


const formatDate = value => {

  if (!value) {
    return "—";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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


const formatDuration = session => {

  const seconds =
    Number(
      session.duration_seconds ??
      session.duration ??
      0
    );


  if (
    Number.isFinite(
      seconds
    ) &&
    seconds > 0
  ) {

    const minutes =
      Math.floor(
        seconds / 60
      );

    const remaining =
      Math.round(
        seconds % 60
      );


    return `${minutes}m ${remaining}s`;

  }


  const start =
    session.started_at
      ? new Date(
          session.started_at
        ).getTime()
      : null;


  const endValue =
    session.completed_at ||
    session.ended_at ||
    session.updated_at;


  const end =
    endValue
      ? new Date(
          endValue
        ).getTime()
      : null;


  if (
    !start ||
    !end ||
    Number.isNaN(
      start
    ) ||
    Number.isNaN(
      end
    ) ||
    end <= start
  ) {
    return "—";
  }


  const totalSeconds =
    Math.round(
      (
        end -
        start
      ) /
      1000
    );


  const minutes =
    Math.floor(
      totalSeconds /
      60
    );


  const remaining =
    totalSeconds %
    60;


  return `${minutes}m ${remaining}s`;

};


const extractGames = session => {

  if (
    Array.isArray(
      session.games
    )
  ) {
    return session.games;
  }


  if (
    Array.isArray(
      session.session_games
    )
  ) {
    return session.session_games;
  }


  if (
    Array.isArray(
      session.results
    )
  ) {
    return session.results;
  }


  return [];

};


const normalizeGameName = game => {

  return String(
    game.game_name ??
    game.name ??
    game.game_type ??
    game.type ??
    ""
  )
    .trim()
    .toLowerCase();

};


const getGameScore = game => {

  const value =
    Number(
      game.score ??
      game.percentage ??
      game.result_score ??
      game.final_score ??
      0
    );


  return Number.isFinite(
    value
  )
    ? value
    : 0;

};


const isCompletedGame = game => {

  const status =
    String(
      game.status ||
      ""
    )
      .trim()
      .toLowerCase();


  if (!status) {
    return true;
  }


  return (
    status ===
      "completed" ||
    status ===
      "failed" ||
    status ===
      "ended"
  );

};


const hasFailedGame = session => {

  return extractGames(
    session
  ).some(
    game =>
      String(
        game.status ||
        ""
      )
        .trim()
        .toLowerCase() ===
      "failed"
  );

};


const getSessionScore = session => {

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
    scores.length ===
    0
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

const getDomainResults = session => {

  const games =
    extractGames(
      session
    )
      .filter(
        isCompletedGame
      );


  const latestByDomain =
    {};


  games.forEach(
    game => {

      const name =
        normalizeGameName(
          game
        );


      const matchedKey =
        Object.keys(
          domainLabels
        ).find(
          key =>
            name.includes(
              key
            )
        );


      const label =
        matchedKey
          ? domainLabels[
              matchedKey
            ]
          : (
              game.domain ||
              game.cognitive_domain ||
              game.game_name ||
              game.name ||
              "Game"
            );


      latestByDomain[
        label
      ] =
        getGameScore(
          game
        );

    }
  );


  return Object.entries(
    latestByDomain
  )
    .map(
      (
        [
          label,
          score,
        ]
      ) => ({
        label,
        score,
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

};


export default function AdminReports() {

  const [
    children,
    setChildren,
  ] = useState([]);


  const [
    sessions,
    setSessions,
  ] = useState([]);


  const [
    assignments,
    setAssignments,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    childFilter,
    setChildFilter,
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


  const [
    dateFilter,
    setDateFilter,
  ] = useState("all");


  const [
    selectedReport,
    setSelectedReport,
  ] = useState(null);


  const loadData =
    async (
      manual = false
    ) => {

      try {

        if (manual) {

          setRefreshing(true);

        } else {

          setLoading(true);

        }


        setError("");


        const [
          sessionsData,
          childrenData,
        ] =
          await Promise.all([
            getSessions(),
            getChildren(),
          ]);


        setSessions(
          Array.isArray(
            sessionsData
          )
            ? sessionsData
            : []
        );


        setChildren(
          Array.isArray(
            childrenData
          )
            ? childrenData
            : []
        );


        try {

          const assignmentsResponse =
            await api.get(
              "/users/assignments"
            );


          setAssignments(
            Array.isArray(
              assignmentsResponse.data
            )
              ? assignmentsResponse.data
              : []
          );

        } catch (
          assignmentsError
        ) {

          console.error(
            assignmentsError
          );


          setAssignments(
            []
          );

        }

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );


        setError(
          requestError
            ?.message ||
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to load reports."
        );

      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    };


  useEffect(
    () => {

      loadData();

    },
    []
  );


  const childMap =
    useMemo(
      () => {

        const map = {};


        children.forEach(
          child => {

            map[
              Number(
                child.id
              )
            ] =
              child;

          }
        );


        return map;

      },
      [
        children,
      ]
    );


  const therapistsByChild =
    useMemo(
      () => {

        const map = {};


        assignments
          .filter(
            assignment =>
              assignment.role ===
              "therapist"
          )
          .forEach(
            assignment => {

              const childId =
                Number(
                  assignment.child_id
                );


              if (
                !map[
                  childId
                ]
              ) {

                map[
                  childId
                ] = [];

              }


              map[
                childId
              ].push(
                assignment.user_name
              );

            }
          );


        return map;

      },
      [
        assignments,
      ]
    );


  const reports =
    useMemo(
      () => {

        return sessions
          .filter(
            session =>
              REPORTABLE_STATUSES.has(
                session.status
              )
          )
          .map(
            session => {

              const child =
                childMap[
                  Number(
                    session.child_id
                  )
                ];


              const score =
                getSessionScore(
                  session
                );


              const status =
                String(
                  session.status ||
                  ""
                )
                  .trim()
                  .toLowerCase();


              const date =
                getSessionDate(
                  session
                );


              return {
                session,
                child,
                score,
                status,
                date,
                hasFailedGame:
                  hasFailedGame(
                    session
                  ),
                therapists:
                  therapistsByChild[
                    Number(
                      session.child_id
                    )
                  ] || [],
              };

            }
          )
          .sort(
            (
              first,
              second
            ) => {

              const firstDate =
                new Date(
                  first.date ||
                  0
                ).getTime();


              const secondDate =
                new Date(
                  second.date ||
                  0
                ).getTime();


              return (
                secondDate -
                firstDate
              );

            }
          );

      },
      [
        sessions,
        childMap,
        therapistsByChild,
      ]
    );


  const completedReports =
    reports.filter(
      report =>
        report.status ===
        "completed"
    );


  const scoredReports =
    reports.filter(
      report =>
        report.score !==
        null
    );


  const averageScore =
    scoredReports.length > 0
      ? Math.round(
          scoredReports.reduce(
            (
              total,
              report
            ) =>
              total +
              report.score,
            0
          ) /
          scoredReports.length
        )
      : 0;


  const assessedChildren =
    new Set(
      reports.map(
        report =>
          Number(
            report.session.child_id
          )
      )
    ).size;


  const filteredReports =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();


        return reports.filter(
          report => {

            if (
              childFilter &&
              Number(
                report.session.child_id
              ) !==
              Number(
                childFilter
              )
            ) {

              return false;

            }


            if (
              statusFilter !==
              "all"
            ) {

              if (
                statusFilter ===
                "failed"
              ) {

                if (
                  !report.hasFailedGame
                ) {

                  return false;

                }

              } else if (
                report.status !==
                statusFilter
              ) {

                return false;

              }

            }


            if (
              !matchesDateFilter(
                report.date,
                dateFilter
              )
            ) {

              return false;

            }


            if (!query) {
              return true;
            }


            const searchable =
              [
                report.child
                  ?.full_name,
                report.child
                  ?.region,
                report.session.id,
                report.status,
                report.therapists.join(
                  " "
                ),
              ]
                .filter(
                  value =>
                    value !==
                      null &&
                    value !==
                      undefined
                )
                .join(
                  " "
                )
                .toLowerCase();


            return searchable.includes(
              query
            );

          }
        );

      },
      [
        reports,
        search,
        childFilter,
        statusFilter,
        dateFilter,
      ]
    );


  const openReport =
    report => {

      setSelectedReport(
        report
      );

    };


  const closeReport =
    () => {

      setSelectedReport(
        null
      );

    };


  const selectedDomains =
    selectedReport
      ? getDomainResults(
          selectedReport.session
        )
      : [];


  return (

    <div className="admin-reports-page">

      <div className="reports-heading">

        <div>

          <span>
            ASSESSMENT REPORTING
          </span>

          <h1>
            Reports
          </h1>

          <p>
            Review child assessment
            sessions, scores, cognitive
            results and therapist coverage
            from the administration area.
          </p>

        </div>


        <button
          className="reports-refresh"
          onClick={() =>
            loadData(
              true
            )
          }
          disabled={
            refreshing
          }
        >

          <RefreshCw
            size={16}
            className={
              refreshing
                ? "reports-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>


      <div className="reports-stats">

        <div className="purple">

          <FileText
            size={21}
          />

          <span>
            Total Reports
          </span>

          <strong>
            {
              reports.length
            }
          </strong>

        </div>


        <div className="green">

          <CheckCircle2
            size={21}
          />

          <span>
            Completed
          </span>

          <strong>
            {
              completedReports.length
            }
          </strong>

        </div>


        <div className="blue">

          <TrendingUp
            size={21}
          />

          <span>
            Average Score
          </span>

          <strong>
            {
              scoredReports.length >
              0
                ? `${averageScore}%`
                : "—"
            }
          </strong>

        </div>


        <div className="pink">

          <Users
            size={21}
          />

          <span>
            Children Assessed
          </span>

          <strong>
            {
              assessedChildren
            }
          </strong>

        </div>

      </div>


      {
        error && (

          <div className="reports-message error">
            {error}
          </div>

        )
      }


      <section className="reports-panel">

        <div className="reports-panel-heading">

          <div>

            <h2>
              Assessment History
            </h2>

            <p>
              Search and review all
              assessment sessions.
            </p>

          </div>


          <ClipboardList
            size={21}
          />

        </div>


        <div className="reports-toolbar">

          <div className="reports-search">

            <Search
              size={17}
            />

            <input
              value={
                search
              }
              onChange={
                event =>
                  setSearch(
                    event.target.value
                  )
              }
              placeholder="Search child, therapist, region or session..."
            />

          </div>


          <select
            value={
              childFilter
            }
            onChange={
              event =>
                setChildFilter(
                  event.target.value
                )
            }
          >

            <option value="">
              All Children
            </option>

            {
              children.map(
                child => (

                  <option
                    key={
                      child.id
                    }
                    value={
                      child.id
                    }
                  >
                    {
                      child.full_name
                    }
                  </option>

                )
              )
            }

          </select>


          <select
            value={
              statusFilter
            }
            onChange={
              event =>
                setStatusFilter(
                  event.target.value
                )
            }
          >

            <option value="all">
              All Statuses
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="ended">
              Ended
            </option>

            <option value="failed">
              Failed Game
            </option>

          </select>


          <select
            value={
              dateFilter
            }
            onChange={
              event =>
                setDateFilter(
                  event.target.value
                )
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

          </select>

        </div>


        {
          loading
            ? (

              <div className="reports-loading">
                Loading reports...
              </div>

            )
            : filteredReports.length ===
              0
              ? (

                <div className="reports-empty">

                  <FileText
                    size={36}
                  />

                  <h3>
                    No reports found
                  </h3>

                  <p>
                    Try changing the
                    search or filters.
                  </p>

                </div>

              )
              : (

                <div className="reports-table-wrap">

                  <div className="reports-table">

                    <div className="reports-table-header">

                      <span>
                        Child
                      </span>

                      <span>
                        Session
                      </span>

                      <span>
                        Date
                      </span>

                      <span>
                        Therapist
                      </span>

                      <span>
                        Score
                      </span>

                      <span>
                        Status
                      </span>

                      <span />

                    </div>


                    {
                      filteredReports.map(
                        report => {

                          const completed =
                            report.status ===
                              "completed";

                          const ended =
                            report.status ===
                              "ended";


                          return (

                            <div
                              className="reports-row"
                              key={
                                report.session.id
                              }
                            >

                              <div className="report-child">

                                <div>

                                  {
                                    String(
                                      report.child
                                        ?.full_name ||
                                      "C"
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()
                                  }

                                </div>


                                <span>

                                  <strong>
                                    {
                                      report.child
                                        ?.full_name ||
                                      `Child #${report.session.child_id}`
                                    }
                                  </strong>

                                  <small>
                                    {
                                      report.child
                                        ?.region ||
                                      "No region"
                                    }
                                  </small>

                                </span>

                              </div>


                              <div className="report-session-id">

                                <strong>
                                  #
                                  {
                                    report.session.id
                                  }
                                </strong>

                                <small>
                                  {
                                    formatDuration(
                                      report.session
                                    )
                                  }
                                </small>

                              </div>


                              <div className="report-date">

                                <CalendarDays
                                  size={14}
                                />

                                <span>
                                  {
                                    formatDate(
                                      report.date
                                    )
                                  }
                                </span>

                              </div>


                              <div className="report-therapists">

                                <UserRoundCog
                                  size={14}
                                />

                                <span>
                                  {
                                    report.therapists.length >
                                    0
                                      ? report.therapists.join(
                                          ", "
                                        )
                                      : "Unassigned"
                                  }
                                </span>

                              </div>


                              <div>

                                <span
                                  className={
                                    report.score ===
                                    null
                                      ? "report-score empty"
                                      : report.score >=
                                        70
                                        ? "report-score good"
                                        : report.score >=
                                          50
                                          ? "report-score medium"
                                          : "report-score low"
                                  }
                                >

                                  {
                                    report.score ===
                                    null
                                      ? "—"
                                      : `${report.score}%`
                                  }

                                </span>

                              </div>


                              <div>

                                <span
                                  className={
                                    completed
                                      ? "report-status completed"
                                      : ended
                                        ? "report-status ended"
                                        : `report-status ${report.status || "unknown"}`
                                  }
                                >

                                  {
                                    completed
                                      ? "Completed"
                                      : ended
                                        ? "Ended"
                                        : report.status ||
                                          "Unknown"
                                  }

                                </span>

                              </div>


                              <button
                                className="view-report-button"
                                onClick={() =>
                                  openReport(
                                    report
                                  )
                                }
                              >

                                <Eye
                                  size={15}
                                />

                                View

                              </button>

                            </div>

                          );

                        }
                      )
                    }

                  </div>

                </div>

              )
        }

      </section>


      {
        selectedReport && (

          <div
            className="report-modal-overlay"
            onMouseDown={
              event => {

                if (
                  event.target ===
                  event.currentTarget
                ) {

                  closeReport();

                }

              }
            }
          >

            <div className="report-modal">

              <div className="report-modal-header">

                <div>

                  <span>
                    ASSESSMENT REPORT
                  </span>

                  <h2>
                    {
                      selectedReport.child
                        ?.full_name ||
                      `Child #${selectedReport.session.child_id}`
                    }
                  </h2>

                  <p>
                    Session #
                    {
                      selectedReport.session.id
                    }
                    {" • "}
                    {
                      formatDate(
                        selectedReport.date
                      )
                    }
                  </p>

                </div>


                <button
                  onClick={
                    closeReport
                  }
                >

                  <X
                    size={20}
                  />

                </button>

              </div>


              <div className="report-modal-summary">

                <div>

                  <span>
                    Overall Score
                  </span>

                  <strong>
                    {
                      selectedReport.score ===
                      null
                        ? "—"
                        : `${selectedReport.score}%`
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Duration
                  </span>

                  <strong>
                    {
                      formatDuration(
                        selectedReport.session
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Therapist
                  </span>

                  <strong>
                    {
                      selectedReport.therapists.length >
                      0
                        ? selectedReport.therapists.join(
                            ", "
                          )
                        : "Unassigned"
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    {
                      selectedReport.status ===
                        "completed"
                        ? "Completed"
                        : selectedReport.status ===
                          "ended"
                          ? "Ended"
                          : selectedReport.status ||
                            "Unknown"
                    }
                  </strong>

                </div>

              </div>


              <div className="report-domain-section">

                <h3>
                  Cognitive Results
                </h3>


                {
                  selectedDomains.length >
                  0
                    ? (

                      <div className="report-domain-list">

                        {
                          selectedDomains.map(
                            domain => (

                              <div
                                className="report-domain-row"
                                key={
                                  domain.label
                                }
                              >

                                <div>

                                  <span>
                                    {
                                      domain.label
                                    }
                                  </span>

                                  <strong>
                                    {
                                      domain.score
                                    }
                                    %
                                  </strong>

                                </div>


                                <div className="report-domain-track">

                                  <span
                                    style={{
                                      width:
                                        `${Math.max(
                                          0,
                                          Math.min(
                                            100,
                                            domain.score
                                          )
                                        )}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            )
                          )
                        }

                      </div>

                    )
                    : (

                      <div className="report-no-domain-data">

                        No detailed game results
                        are available in this
                        session response.

                      </div>

                    )
                }

              </div>


              <div className="report-child-details">

                <div>

                  <span>
                    Child
                  </span>

                  <strong>
                    {
                      selectedReport.child
                        ?.full_name ||
                      "—"
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Region
                  </span>

                  <strong>
                    {
                      selectedReport.child
                        ?.region ||
                      "—"
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Parent Record
                  </span>

                  <strong>
                    {
                      selectedReport.child
                        ?.parent_name ||
                      "—"
                    }
                  </strong>

                </div>

              </div>

            </div>

          </div>

        )
      }


      <style>
        {`

        .admin-reports-page {
          width: 100%;
        }

        .reports-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .reports-heading > div > span {
          color: #8172EA;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .1em;
        }

        .reports-heading h1 {
          margin: 6px 0 5px;
          color: #303253;
          font-size: 28px;
        }

        .reports-heading p {
          margin: 0;
          max-width: 610px;
          color: #9699AC;
          font-size: 13px;
          line-height: 1.55;
        }

        .reports-refresh {
          height: 41px;
          padding: 0 14px;
          border: 1px solid #E7E6F0;
          border-radius: 13px;
          background: white;
          color: #7164D8;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 650;
        }

        .reports-refresh:disabled {
          opacity: .6;
        }

        .reports-spin {
          animation: reportsSpin .8s linear infinite;
        }

        @keyframes reportsSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .reports-stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 22px;
        }

        .reports-stats > div {
          min-height: 88px;
          padding: 16px;
          border: 1px solid #ECECF4;
          border-radius: 18px;
          background: white;
          display: grid;
          grid-template-columns:
            34px 1fr auto;
          gap: 10px;
          align-items: center;
        }

        .reports-stats span {
          color: #9194A6;
          font-size: 11px;
        }

        .reports-stats strong {
          color: #383A57;
          font-size: 21px;
        }

        .reports-stats .purple {
          color: #7868E6;
        }

        .reports-stats .green {
          color: #48A784;
        }

        .reports-stats .blue {
          color: #4D8CCB;
        }

        .reports-stats .pink {
          color: #C85E9F;
        }

        .reports-message {
          margin-top: 14px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 11px;
        }

        .reports-message.error {
          border: 1px solid #F3D3DA;
          background: #FFF1F4;
          color: #B74860;
        }

        .reports-panel {
          margin-top: 18px;
          padding: 19px;
          border: 1px solid #ECECF4;
          border-radius: 20px;
          background: white;
          box-shadow:
            0 7px 22px
            rgba(52,53,85,.025);
        }

        .reports-panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          color: #7869E6;
        }

        .reports-panel-heading h2 {
          margin: 0;
          color: #3D3F5C;
          font-size: 15px;
        }

        .reports-panel-heading p {
          margin: 4px 0 0;
          color: #A0A3B3;
          font-size: 10.5px;
        }

        .reports-toolbar {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            175px
            150px
            160px;
          gap: 10px;
          margin-top: 16px;
        }

        .reports-search {
          height: 42px;
          padding: 0 13px;
          border: 1px solid #E7E7EF;
          border-radius: 12px;
          background: #FAFAFC;
          color: #A0A2B2;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .reports-search input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #42445E;
          font-size: 11px;
        }

        .reports-toolbar select {
          width: 100%;
          height: 42px;
          padding: 0 10px;
          border: 1px solid #E1E1EA;
          border-radius: 11px;
          outline: 0;
          background: #FBFBFD;
          color: #57596E;
          font-size: 10px;
        }

        .reports-loading,
        .reports-empty {
          min-height: 310px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #999CAB;
          font-size: 12px;
        }

        .reports-empty svg {
          color: #796AE7;
        }

        .reports-empty h3 {
          margin: 11px 0 4px;
          color: #484A66;
          font-size: 15px;
        }

        .reports-empty p {
          margin: 0;
        }

        .reports-table-wrap {
          margin-top: 15px;
          overflow-x: auto;
        }

        .reports-table {
          min-width: 980px;
        }

        .reports-table-header,
        .reports-row {
          display: grid;
          grid-template-columns:
            1.25fr
            .65fr
            .9fr
            1.1fr
            .55fr
            .7fr
            72px;
          gap: 12px;
          align-items: center;
        }

        .reports-table-header {
          min-height: 39px;
          padding: 0 10px;
          border-radius: 11px;
          color: #8F92A5;
          background: #F8F8FB;
          font-size: 9px;
          font-weight: 700;
        }

        .reports-row {
          min-height: 70px;
          padding: 10px;
          border-bottom: 1px solid #F0F0F5;
        }

        .reports-row:last-child {
          border-bottom: 0;
        }

        .report-child {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .report-child > div {
          width: 38px;
          height: 38px;
          flex: 0 0 auto;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: #7465E8;
          background: #F0EDFF;
          font-size: 12px;
          font-weight: 800;
        }

        .report-child > span {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .report-child strong {
          color: #41435D;
          font-size: 10.5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .report-child small {
          margin-top: 3px;
          color: #A1A4B4;
          font-size: 8.5px;
        }

        .report-session-id,
        .report-date,
        .report-therapists {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #828598;
        }

        .report-session-id {
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .report-session-id strong {
          color: #55576D;
          font-size: 9.5px;
        }

        .report-session-id small {
          color: #A1A3B2;
          font-size: 8px;
        }

        .report-date span,
        .report-therapists span {
          font-size: 9px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .report-score {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 8.5px;
          font-weight: 750;
        }

        .report-score.good {
          color: #438868;
          background: #EDF9F3;
        }

        .report-score.medium {
          color: #A77935;
          background: #FFF7E9;
        }

        .report-score.low {
          color: #B95667;
          background: #FFF0F2;
        }

        .report-score.empty {
          color: #8D90A0;
          background: #F1F2F6;
        }

        .report-status {
          display: inline-flex;
          max-width: 100%;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .report-status.completed {
          color: #438868;
          background: #EDF9F3;
        }

        .report-status.ended {
          color: #7A65C9;
          background: #F2EEFF;
        }

        .report-status.active,
        .report-status.in_progress {
          color: #4D84B8;
          background: #EDF6FF;
        }

        .report-status.failed {
          color: #B95667;
          background: #FFF0F2;
        }

        .report-status.unknown {
          color: #8D90A0;
          background: #F1F2F6;
        }

        .view-report-button {
          height: 34px;
          border: 1px solid #E9E8F2;
          border-radius: 10px;
          background: #F9F8FF;
          color: #7264D9;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          font-size: 8.5px;
        }

        .report-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          padding: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(37,35,64,.38);
          backdrop-filter: blur(5px);
        }

        .report-modal {
          width: min(720px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          padding: 23px;
          border-radius: 22px;
          background: white;
          box-shadow:
            0 28px 80px
            rgba(35,33,72,.22);
        }

        .report-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          padding-bottom: 16px;
          border-bottom: 1px solid #EFEFF5;
        }

        .report-modal-header span {
          color: #7C6BE5;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .1em;
        }

        .report-modal-header h2 {
          margin: 6px 0 0;
          color: #3E405B;
          font-size: 20px;
        }

        .report-modal-header p {
          margin: 4px 0 0;
          color: #989BAC;
          font-size: 10px;
        }

        .report-modal-header > button {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 11px;
          background: #F5F5F9;
          color: #818497;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .report-modal-summary {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 9px;
          margin-top: 17px;
        }

        .report-modal-summary > div {
          min-height: 73px;
          padding: 12px;
          border-radius: 13px;
          background: #F9F9FC;
          display: flex;
          flex-direction: column;
        }

        .report-modal-summary span {
          color: #9B9EAE;
          font-size: 8.5px;
        }

        .report-modal-summary strong {
          margin-top: 6px;
          color: #4B4D66;
          font-size: 12px;
          line-height: 1.4;
        }

        .report-domain-section {
          margin-top: 18px;
        }

        .report-domain-section h3 {
          margin: 0 0 11px;
          color: #51536B;
          font-size: 12px;
        }

        .report-domain-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .report-domain-row {
          padding: 10px 12px;
          border: 1px solid #EFEFF4;
          border-radius: 12px;
        }

        .report-domain-row > div:first-child {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .report-domain-row span {
          color: #74778B;
          font-size: 9.5px;
        }

        .report-domain-row strong {
          color: #5D55B8;
          font-size: 10px;
        }

        .report-domain-track {
          height: 7px;
          margin-top: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: #ECECF4;
        }

        .report-domain-track span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #7868E7,
              #A077E7
            );
        }

        .report-no-domain-data {
          padding: 18px;
          border-radius: 12px;
          background: #F9F9FC;
          color: #A0A2B1;
          text-align: center;
          font-size: 9.5px;
        }

        .report-child-details {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 9px;
          margin-top: 17px;
          padding-top: 17px;
          border-top: 1px solid #EFEFF5;
        }

        .report-child-details > div {
          display: flex;
          flex-direction: column;
        }

        .report-child-details span {
          color: #A0A2B1;
          font-size: 8.5px;
        }

        .report-child-details strong {
          margin-top: 4px;
          color: #5A5C73;
          font-size: 10px;
        }

        @media (max-width: 1100px) {

          .reports-stats {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        @media (max-width: 850px) {

          .reports-toolbar {
            grid-template-columns:
              1fr;
          }

          .report-modal-summary {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .report-child-details {
            grid-template-columns:
              1fr;
          }

        }

        `}
      </style>

    </div>

  );

}
