import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  RefreshCw,
  Settings,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  X,
  Pencil,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../services/api";
import EditChildModal from "../components/children/EditChildModal";
import ParentSettings from "../components/parent/ParentSettings";

import {
  calculateCognitiveScore,
  domainConfigs,
  getAverageSessionScore,
  getCognitiveDomains,
  getLatestCompletedAssessment,
  normalizeGameName,
} from "../utils/cognitiveScores";




const REPORTABLE_STATUSES =
  new Set([
    "Completed",
    "Ended",
  ]);


const DOMAINS =
  domainConfigs.map(
    domain =>
      domain.label
  );


const menu = [
  {
    key: "overview",
    title: "Overview",
    icon: LayoutDashboard,
  },
  {
    key: "children",
    title: "My Children",
    icon: Users,
  },
  {
    key: "sessions",
    title: "Sessions",
    icon: CalendarDays,
  },
  {
    key: "reports",
    title: "Reports",
    icon: FileText,
  },
  {
    key: "progress",
    title: "Progress",
    icon: BarChart3,
  },
  {
    key: "messages",
    title: "Messages",
    icon: MessageCircle,
  },
  {
    key: "notifications",
    title: "Notifications",
    icon: Bell,
  },
  {
    key: "settings",
    title: "Settings",
    icon: Settings,
  },
];


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
        session.updated_at
      ) ||
      parseDate(
        session.created_at
      )
    );

  };


const formatDate = value => {

  const date =
    parseDate(value);


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


const formatAssessmentDate =
  session => {

    if (!session) {
      return "Not assessed";
    }


    return formatDate(
      session.ended_at ||
      session.updated_at ||
      session.started_at ||
      session.created_at
    );

  };


const formatDuration =
  session => {

    const seconds =
      Number(
        session.duration_seconds ??
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


    return "—";

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
        Number(rawScore);


      if (
        Number.isFinite(
          score
        )
      ) {

        return Math.max(
          0,
          Math.min(
            100,
            Math.round(score)
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


const getDomainName =
  game => {

    const gameName =
      normalizeGameName(
        game?.game_name ||
        game?.name
      );


    const domain =
      domainConfigs.find(
        item =>
          normalizeGameName(
            item.gameName
          ) ===
          gameName
      );


    return domain
      ?.label ||
      null;

  };


const getGameScore =
  game => {

    if (
      game?.score === null ||
      game?.score === undefined ||
      game?.score === ""
    ) {
      return null;
    }


    const score =
      Number(
        game.score
      );


    if (
      !Number.isFinite(
        score
      )
    ) {
      return null;
    }


    return Math.max(
      0,
      Math.min(
        100,
        Math.round(score)
      )
    );

  };


const getStatusClass =
  status => {

    const normalized =
      String(
        status || ""
      ).toLowerCase();


    if (
      normalized ===
      "completed"
    ) {
      return "completed";
    }


    if (
      normalized ===
      "ended"
    ) {
      return "ended";
    }


    if (
      normalized ===
      "cancelled"
    ) {
      return "cancelled";
    }


    if (
      normalized ===
      "in progress"
    ) {
      return "progress";
    }


    if (
      normalized ===
      "paused"
    ) {
      return "paused";
    }


    return "default";

  };


const getInitials =
  name => {

    return String(
      name || "?"
    )
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        part =>
          part[0]
      )
      .join("")
      .toUpperCase();

  };


export default function ParentDashboard() {

  const navigate =
    useNavigate();


  const [
    activeSection,
    setActiveSection,
  ] =
    useState(
      "overview"
    );


  const [
    children,
    setChildren,
  ] =
    useState([]);


  const [
    sessions,
    setSessions,
  ] =
    useState([]);


  const [
    therapists,
    setTherapists,
  ] =
    useState([]);


  const [
    selectedChildId,
    setSelectedChildId,
  ] =
    useState("");


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
  editingChild,
  setEditingChild,
] = useState(null);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    unreadCount,
    setUnreadCount,
  ] =
    useState(0);


  const [
    selectedReport,
    setSelectedReport,
  ] =
    useState(null);


  const [
    currentUser,
    setCurrentUser,
  ] =
    useState(
      () => {

        try {

          return JSON.parse(
            sessionStorage.getItem(
              "kidmind_user"
            ) || "{}"
          );

        } catch {

          return {};

        }

      }
    );


  const loadData =
    async (
      showLoader = true
    ) => {

      try {

        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }


        setError("");


        const [
          childrenResponse,
          sessionsResponse,
          therapistsResponse,
        ] =
          await Promise.all([
            api.get(
              "/users/parent/children"
            ),
            api.get(
              "/sessions/parent"
            ),
            api.get(
              "/users/parent/therapists"
            ),
          ]);


        const loadedChildren =
          Array.isArray(
            childrenResponse.data
          )
            ? childrenResponse.data
            : [];


        const loadedSessions =
          Array.isArray(
            sessionsResponse.data
              ?.sessions
          )
            ? sessionsResponse.data
                .sessions
            : [];


        const loadedTherapists =
          Array.isArray(
            therapistsResponse.data
          )
            ? therapistsResponse.data
            : [];


        setChildren(
          loadedChildren
        );


        setSessions(
          loadedSessions
        );


        setTherapists(
          loadedTherapists
        );


        setSelectedChildId(
          current => {

            if (
              current &&
              loadedChildren.some(
                child =>
                  String(
                    child.id
                  ) ===
                  String(
                    current
                  )
              )
            ) {
              return current;
            }


            return loadedChildren[0]
              ? String(
                  loadedChildren[0]
                    .id
                )
              : "";

          }
        );

      } catch (requestError) {

        console.error(
          requestError
        );


        setError(
          "Unable to load parent dashboard data."
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


  useEffect(
    () => {

      let active =
        true;


      const loadUnreadCount =
        async () => {

          try {

            const response =
              await api.get(
                "/notifications/unread-count"
              );


            if (active) {

              setUnreadCount(
                Number(
                  response.data
                    ?.unread_count ||
                  0
                )
              );

            }

          } catch (
            requestError
          ) {

            console.error(
              "Unable to load notification count:",
              requestError
            );

          }

        };


      loadUnreadCount();


      const interval =
        window.setInterval(
          loadUnreadCount,
          30000
        );


      const handleNotificationUpdate =
        () => {
          loadUnreadCount();
        };


      window.addEventListener(
        "kidmind-notifications-updated",
        handleNotificationUpdate
      );


      return () => {

        active =
          false;

        window.clearInterval(
          interval
        );

        window.removeEventListener(
          "kidmind-notifications-updated",
          handleNotificationUpdate
        );

      };

    },
    []
  );


  const selectedChild =
    useMemo(
      () => {

        return (
          children.find(
            child =>
              String(
                child.id
              ) ===
              String(
                selectedChildId
              )
          ) ||
          children[0] ||
          null
        );

      },
      [
        children,
        selectedChildId,
      ]
    );


  const childSessions =
    useMemo(
      () => {

        if (!selectedChild) {
          return [];
        }


        return sessions
          .filter(
            session =>
              String(
                session.child_id
              ) ===
              String(
                selectedChild.id
              )
          )
          .sort(
            (
              first,
              second
            ) => {

              const firstDate =
                getSessionDate(
                  first
                )
                  ?.getTime() ||
                0;


              const secondDate =
                getSessionDate(
                  second
                )
                  ?.getTime() ||
                0;


              return (
                secondDate -
                firstDate
              );

            }
          );

      },
      [
        sessions,
        selectedChild,
      ]
    );


  const reportableSessions =
    useMemo(
      () => {

        return childSessions.filter(
          session =>
            REPORTABLE_STATUSES.has(
              session.status
            )
        );

      },
      [
        childSessions,
      ]
    );


  const currentCognitiveScore =
    useMemo(
      () =>
        calculateCognitiveScore(
          childSessions
        ),
      [
        childSessions,
      ]
    );


  const averageSessionScore =
    useMemo(
      () =>
        getAverageSessionScore(
          childSessions
        ),
      [
        childSessions,
      ]
    );


  const latestAssessment =
    useMemo(
      () =>
        getLatestCompletedAssessment(
          childSessions
        ),
      [
        childSessions,
      ]
    );


  const currentDomains =
    useMemo(
      () =>
        getCognitiveDomains(
          childSessions
        ),
      [
        childSessions,
      ]
    );


  const childTherapists =
    useMemo(
      () => {

        if (!selectedChild) {
          return [];
        }


        return therapists.filter(
          therapist =>
            String(
              therapist.child_id
            ) ===
            String(
              selectedChild.id
            )
        );

      },
      [
        therapists,
        selectedChild,
      ]
    );


  const availableDomainScores =
    currentDomains.filter(
      item =>
        typeof item.score ===
          "number" &&
        Number.isFinite(
          item.score
        )
    );


  const strongestArea =
    availableDomainScores.length
      ? [
          ...availableDomainScores,
        ].sort(
          (
            first,
            second
          ) =>
            second.score -
            first.score
        )[0]
      : null;


  const areaToWatch =
    availableDomainScores.length
      ? [
          ...availableDomainScores,
        ].sort(
          (
            first,
            second
          ) =>
            first.score -
            second.score
        )[0]
      : null;


  const domainHistory =
    useMemo(
      () => {

        const history = {};


        DOMAINS.forEach(
          domain => {
            history[domain] = [];
          }
        );


        childSessions.forEach(
          session => {

            const games =
              Array.isArray(
                session.games
              )
                ? session.games
                : [];


            games.forEach(
              game => {

                if (
                  game.status !==
                    "Completed" &&
                  game.status !==
                    "Failed"
                ) {
                  return;
                }


                const domain =
                  getDomainName(
                    game
                  );


                const score =
                  getGameScore(
                    game
                  );


                if (
                  !domain ||
                  score === null
                ) {
                  return;
                }


                const date =
                  parseDate(
                    game.ended_at
                  ) ||
                  parseDate(
                    game.started_at
                  ) ||
                  parseDate(
                    game.updated_at
                  ) ||
                  parseDate(
                    game.created_at
                  ) ||
                  getSessionDate(
                    session
                  );


                history[
                  domain
                ].push({
                  score,
                  date,
                  sessionId:
                    session.id,
                });

              }
            );

          }
        );


        DOMAINS.forEach(
          domain => {

            history[
              domain
            ].sort(
              (
                first,
                second
              ) =>
                (
                  second.date
                    ?.getTime() ||
                  0
                ) -
                (
                  first.date
                    ?.getTime() ||
                  0
                )
            );

          }
        );


        return history;

      },
      [
        childSessions,
      ]
    );


  const progressRows =
    useMemo(
      () => {

        return DOMAINS.map(
          domain => {

            const history =
              domainHistory[
                domain
              ] || [];


            const latest =
              history[0]
                ?.score ??
              null;


            const previous =
              history[1]
                ?.score ??
              null;


            const change =
              latest !== null &&
              previous !== null
                ? latest -
                  previous
                : null;


            return {
              domain,
              latest,
              previous,
              change,
            };

          }
        );

      },
      [
        domainHistory,
      ]
    );


  const latestActivity =
    childSessions[0] ||
    null;


  const handleLogout = () => {

    sessionStorage.removeItem(
      "kidmind_token"
    );

    sessionStorage.removeItem(
      "kidmind_user"
    );


    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };


  const renderHeader =
    (
      title,
      subtitle
    ) => {

      return (
        <div className="parent-section-heading">

          <div>
            <h1>
              {title}
            </h1>

            <p>
              {subtitle}
            </p>
          </div>


          <button
            className="parent-refresh-button"
            onClick={() =>
              loadData(false)
            }
            disabled={
              refreshing
            }
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>
      );

    };


  const renderChildSelector =
    () => {

      if (
        children.length <= 1
      ) {
        return null;
      }


      return (
        <div className="child-selector">

          <span>
            Viewing child
          </span>

          <select
            value={
              selectedChildId
            }
            onChange={
              event =>
                setSelectedChildId(
                  event.target.value
                )
            }
          >
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

        </div>
      );

    };


  const renderOverview =
    () => {

      if (!selectedChild) {

        return (
          <div className="empty-state">
            <Users size={34} />

            <h2>
              No children assigned
            </h2>

            <p>
              There are currently no children linked to this parent account.
            </p>
          </div>
        );

      }


      return (
        <>

          {
            renderHeader(
              `Welcome, ${currentUser.full_name || "Parent"}`,
              `Here is ${selectedChild.full_name}'s latest KidMind overview.`
            )
          }


          {
            renderChildSelector()
          }


          <section className="child-hero">

            <div className="child-avatar">
              {
                getInitials(
                  selectedChild
                    .full_name
                )
              }
            </div>


            <div className="child-hero-info">

              <span className="eyebrow">
                Child Profile
              </span>

              <h2>
                {
                  selectedChild.full_name
                }
              </h2>

              <div className="child-meta">

                <span>
                  Age{" "}
                  {
                    selectedChild.age ??
                    "—"
                  }
                </span>

                <span>
                  {
                    selectedChild.gender ||
                    "—"
                  }
                </span>

                <span>
                  {
                    selectedChild.status ||
                    "Active"
                  }
                </span>

                <span>
                  Latest Assessment:{" "}
                  {
                    formatAssessmentDate(
                      latestAssessment
                    )
                  }
                </span>

              </div>

            </div>


            <div className="therapist-summary">

              <span>
                Assigned Therapist
              </span>

              <strong>
                {
                  childTherapists.length
                    ? childTherapists
                        .map(
                          therapist =>
                            therapist.full_name
                        )
                        .join(", ")
                    : "Not assigned"
                }
              </strong>

            </div>

          </section>


          <section className="parent-stats-grid">

            <article className="parent-stat-card">

              <div className="stat-icon purple">
                <Brain size={22} />
              </div>

              <div>
                <span>
                  Current Cognitive Score
                </span>

                <strong>
                  {
                    currentCognitiveScore !==
                    null
                      ? `${currentCognitiveScore}%`
                      : "—"
                  }
                </strong>

                <small>
                  Latest score across cognitive areas
                </small>
              </div>

            </article>


            <article className="parent-stat-card">

              <div className="stat-icon pink">
                <BarChart3
                  size={22}
                />
              </div>

              <div>
                <span>
                  Average Session Score
                </span>

                <strong>
                  {
                    averageSessionScore !==
                    null
                      ? `${averageSessionScore}%`
                      : "—"
                  }
                </strong>

                <small>
                  Historical completed session average
                </small>
              </div>

            </article>


            <article className="parent-stat-card">

              <div className="stat-icon blue">
                <CheckCircle2
                  size={22}
                />
              </div>

              <div>
                <span>
                  Reports
                </span>

                <strong>
                  {
                    reportableSessions.length
                  }
                </strong>

                <small>
                  Completed and ended
                </small>
              </div>

            </article>


            <article className="parent-stat-card">

              <div className="stat-icon green">
                <CalendarDays
                  size={22}
                />
              </div>

              <div>
                <span>
                  Total Sessions
                </span>

                <strong>
                  {
                    childSessions.length
                  }
                </strong>

                <small>
                  Recorded sessions
                </small>
              </div>

            </article>

          </section>


          <section className="snapshot-grid">

            <article className="parent-panel">

              <div className="panel-heading">

                <div>
                  <h2>
                    Child Snapshot
                  </h2>

                  <p>
                    Based on the latest available cognitive-domain scores
                  </p>
                </div>

                <Sparkles
                  size={22}
                />

              </div>


              <div className="snapshot-items">

                <div className="snapshot-item positive">

                  <div className="snapshot-icon">
                    <TrendingUp
                      size={20}
                    />
                  </div>

                  <div>
                    <span>
                      Strongest Area
                    </span>

                    <strong>
                      {
                        strongestArea
                          ? strongestArea.label
                          : "Not enough data"
                      }
                    </strong>

                    {
                      strongestArea &&
                      <small>
                        {
                          strongestArea.score
                        }
                        % latest score
                      </small>
                    }
                  </div>

                </div>


                <div className="snapshot-item attention">

                  <div className="snapshot-icon">
                    <TrendingDown
                      size={20}
                    />
                  </div>

                  <div>
                    <span>
                      Area to Watch
                    </span>

                    <strong>
                      {
                        areaToWatch
                          ? areaToWatch.label
                          : "Not enough data"
                      }
                    </strong>

                    {
                      areaToWatch &&
                      <small>
                        {
                          areaToWatch.score
                        }
                        % latest score
                      </small>
                    }
                  </div>

                </div>

              </div>

            </article>


            <article className="parent-panel">

              <div className="panel-heading">

                <div>
                  <h2>
                    Latest Activity
                  </h2>

                  <p>
                    Most recent recorded session
                  </p>
                </div>

                <Activity
                  size={22}
                />

              </div>


              {
                latestActivity
                  ? (
                    <div className="activity-card">

                      <div>
                        <span>
                          Session #
                          {
                            latestActivity.id
                          }
                        </span>

                        <strong>
                          {
                            latestActivity.status
                          }
                        </strong>
                      </div>


                      <div className="activity-details">

                        <span>
                          <CalendarDays
                            size={15}
                          />

                          {
                            formatDate(
                              latestActivity
                                .ended_at ||
                              latestActivity
                                .started_at ||
                              latestActivity
                                .created_at
                            )
                          }
                        </span>

                        <span>
                          <Clock3
                            size={15}
                          />

                          {
                            formatDuration(
                              latestActivity
                            )
                          }
                        </span>

                      </div>

                    </div>
                  )
                  : (
                    <div className="mini-empty">
                      No activity yet.
                    </div>
                  )
              }

            </article>

          </section>


          <section className="parent-panel recent-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Recent Reports
                </h2>

                <p>
                  Latest completed assessment results
                </p>
              </div>

              <button
                className="text-button"
                onClick={() =>
                  setActiveSection(
                    "reports"
                  )
                }
              >
                View all
              </button>

            </div>


            {
              reportableSessions.length
                ? (
                  <div className="reports-table-wrap">

                    <table className="parent-table">

                      <thead>
                        <tr>
                          <th>
                            Session
                          </th>
                          <th>
                            Date
                          </th>
                          <th>
                            Status
                          </th>
                          <th>
                            Session Score
                          </th>
                          <th>
                            Details
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {
                          reportableSessions
                            .slice(
                              0,
                              5
                            )
                            .map(
                              session => (
                                <tr
                                  key={
                                    session.id
                                  }
                                >

                                  <td>
                                    #
                                    {
                                      session.id
                                    }
                                  </td>

                                  <td>
                                    {
                                      formatDate(
                                        session.ended_at ||
                                        session.started_at ||
                                        session.created_at
                                      )
                                    }
                                  </td>

                                  <td>
                                    <span
                                      className={`status-pill ${getStatusClass(
                                        session.status
                                      )}`}
                                    >
                                      {
                                        session.status
                                      }
                                    </span>
                                  </td>

                                  <td>
                                    <strong>
                                      {
                                        getSessionScore(
                                          session
                                        ) !==
                                        null
                                          ? `${getSessionScore(
                                              session
                                            )}%`
                                          : "—"
                                      }
                                    </strong>
                                  </td>

                                  <td>
                                    <button
                                      className="icon-action"
                                      onClick={() =>
                                        setSelectedReport(
                                          session
                                        )
                                      }
                                    >
                                      <Eye
                                        size={17}
                                      />
                                    </button>
                                  </td>

                                </tr>
                              )
                            )
                        }

                      </tbody>

                    </table>

                  </div>
                )
                : (
                  <div className="mini-empty">
                    No reports are available yet.
                  </div>
                )
            }

          </section>

        </>
      );

    };


  const renderChildren =
    () => {

      return (
        <>

          {
            renderHeader(
              "My Children",
              "View the children linked to your parent account."
            )
          }


          <div className="children-grid">

            {
              children.map(
                child => {

                  const linkedTherapists =
                    therapists.filter(
                      therapist =>
                        String(
                          therapist.child_id
                        ) ===
                        String(
                          child.id
                        )
                    );


                  const sessionsForChild =
                    sessions.filter(
                      session =>
                        String(
                          session.child_id
                        ) ===
                        String(
                          child.id
                        )
                    );


                  const childCurrentScore =
                    calculateCognitiveScore(
                      sessionsForChild
                    );


                  const childLatestAssessment =
                    getLatestCompletedAssessment(
                      sessionsForChild
                    );


                  return (
                    <article
                      className="child-card"
                      key={
                        child.id
                      }
                    >

                      <div className="child-card-top">

                        <div className="child-card-avatar">
                          {
                            getInitials(
                              child.full_name
                            )
                          }
                        </div>


                        <div>
                          <h2>
                            {
                              child.full_name
                            }
                          </h2>

                          <p>
                            Age{" "}
                            {
                              child.age ??
                              "—"
                            }
                            {" · "}
                            {
                              child.gender ||
                              "—"
                            }
                          </p>
                        </div>

                      </div>


                      <div className="child-card-info">

                        <div>
                          <span>
                            Status
                          </span>

                          <strong>
                            {
                              child.status ||
                              "Active"
                            }
                          </strong>
                        </div>


                        <div>
                          <span>
                            Latest Assessment
                          </span>

                          <strong>
                            {
                              formatAssessmentDate(
                                childLatestAssessment
                              )
                            }
                          </strong>
                        </div>


                        <div>
                          <span>
                            Current Score
                          </span>

                          <strong>
                            {
                              childCurrentScore !==
                              null
                                ? `${childCurrentScore}%`
                                : "—"
                            }
                          </strong>
                        </div>


                        <div>
                          <span>
                            Therapist
                          </span>

                          <strong>
                            {
                              linkedTherapists.length
                                ? linkedTherapists
                                    .map(
                                      therapist =>
                                        therapist.full_name
                                    )
                                    .join(", ")
                                : "Not assigned"
                            }
                          </strong>
                        </div>

                      </div>

<div className="child-card-actions">
                      <button
                        className="primary-soft-button"
                        onClick={() => {

                          setSelectedChildId(
                            String(
                              child.id
                            )
                          );

                          setActiveSection(
                            "overview"
                          );

                        }}
                      >
                        View Overview
                      </button>

                      <button
  className="child-edit-button"
  onClick={() =>
    setEditingChild(child)
  }
>
  <Pencil size={17} />
</button>
</div>
                
                    </article>
                  );

                }
              )
            }

          </div>

        </>
      );

    };


  const renderSessions =
    () => {

      return (
        <>

          {
            renderHeader(
              "Sessions",
              "View your child's recorded KidMind sessions."
            )
          }


          {
            renderChildSelector()
          }


          <section className="parent-panel">

            {
              childSessions.length
                ? (
                  <div className="session-list">

                    {
                      childSessions.map(
                        session => {

                          const games =
                            Array.isArray(
                              session.games
                            )
                              ? session.games
                              : [];


                          return (
                            <article
                              className="session-row-card"
                              key={
                                session.id
                              }
                            >

                              <div className="session-row-main">

                                <div className="session-number">
                                  #
                                  {
                                    session.id
                                  }
                                </div>


                                <div>
                                  <h3>
                                    Assessment Session
                                  </h3>

                                  <p>
                                    {
                                      formatDate(
                                        session.ended_at ||
                                        session.started_at ||
                                        session.created_at
                                      )
                                    }
                                  </p>
                                </div>

                              </div>


                              <div className="session-row-details">

                                <div>
                                  <span>
                                    Status
                                  </span>

                                  <strong>
                                    {
                                      session.status
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
                                        session
                                      )
                                    }
                                  </strong>
                                </div>


                                <div>
                                  <span>
                                    Games
                                  </span>

                                  <strong>
                                    {
                                      games.length
                                    }
                                  </strong>
                                </div>


                                <div>
                                  <span>
                                    Session Score
                                  </span>

                                  <strong>
                                    {
                                      getSessionScore(
                                        session
                                      ) !==
                                      null
                                        ? `${getSessionScore(
                                            session
                                          )}%`
                                        : "—"
                                    }
                                  </strong>
                                </div>

                              </div>

                            </article>
                          );

                        }
                      )
                    }

                  </div>
                )
                : (
                  <div className="empty-state">
                    <CalendarDays
                      size={34}
                    />

                    <h2>
                      No sessions yet
                    </h2>

                    <p>
                      No sessions have been recorded for this child.
                    </p>
                  </div>
                )
            }

          </section>

        </>
      );

    };


  const renderReports =
    () => {

      return (
        <>

          {
            renderHeader(
              "Reports",
              "Review completed session results and game details."
            )
          }


          {
            renderChildSelector()
          }


          <div className="reports-cards-grid">

            {
              reportableSessions.map(
                session => {

                  const score =
                    getSessionScore(
                      session
                    );


                  return (
                    <article
                      className="report-card"
                      key={
                        session.id
                      }
                    >

                      <div className="report-card-top">

                        <div className="report-icon">
                          <FileText
                            size={21}
                          />
                        </div>


                        <span
                          className={`status-pill ${getStatusClass(
                            session.status
                          )}`}
                        >
                          {
                            session.status
                          }
                        </span>

                      </div>


                      <h2>
                        Session #
                        {
                          session.id
                        }
                      </h2>


                      <p>
                        {
                          formatDate(
                            session.ended_at ||
                            session.started_at ||
                            session.created_at
                          )
                        }
                      </p>


                      <div className="report-score">

                        <span>
                          Session Score
                        </span>

                        <strong>
                          {
                            score !==
                            null
                              ? `${score}%`
                              : "—"
                          }
                        </strong>

                      </div>


                      <div className="report-meta">

                        <span>
                          <Clock3
                            size={15}
                          />

                          {
                            formatDuration(
                              session
                            )
                          }
                        </span>

                        <span>
                          <Brain
                            size={15}
                          />

                          {
                            Array.isArray(
                              session.games
                            )
                              ? session.games.length
                              : 0
                          }
                          {" "}games
                        </span>

                      </div>


                      <button
                        className="primary-soft-button"
                        onClick={() =>
                          setSelectedReport(
                            session
                          )
                        }
                      >
                        <Eye size={17} />
                        View Report
                      </button>

                    </article>
                  );

                }
              )
            }

          </div>


          {
            reportableSessions.length ===
              0 &&
            <div className="empty-state">
              <FileText
                size={34}
              />

              <h2>
                No reports yet
              </h2>

              <p>
                Completed assessment reports will appear here.
              </p>
            </div>
          }

        </>
      );

    };


  const renderProgress =
    () => {

      return (
        <>

          {
            renderHeader(
              "Progress",
              "Track cognitive score changes from previous results."
            )
          }


          {
            renderChildSelector()
          }


          <section className="parent-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Cognitive Progress
                </h2>

                <p>
                  Latest result compared with the previous result in each area
                </p>
              </div>

              <BarChart3
                size={22}
              />

            </div>


            <div className="progress-list">

              {
                progressRows.map(
                  row => {

                    const positive =
                      row.change !==
                        null &&
                      row.change > 0;


                    const negative =
                      row.change !==
                        null &&
                      row.change < 0;


                    return (
                      <div
                        className="progress-row"
                        key={
                          row.domain
                        }
                      >

                        <div className="progress-title">

                          <strong>
                            {
                              row.domain
                            }
                          </strong>

                          <span>
                            Previous:{" "}
                            {
                              row.previous !==
                              null
                                ? `${row.previous}%`
                                : "—"
                            }
                          </span>

                        </div>


                        <div className="progress-bar-track">

                          <div
                            className="progress-bar-fill"
                            style={{
                              width:
                                `${
                                  row.latest ??
                                  0
                                }%`,
                            }}
                          />

                        </div>


                        <div className="progress-value">

                          <strong>
                            {
                              row.latest !==
                              null
                                ? `${row.latest}%`
                                : "—"
                            }
                          </strong>


                          {
                            row.change !==
                              null &&
                            <span
                              className={
                                positive
                                  ? "change-positive"
                                  : negative
                                    ? "change-negative"
                                    : "change-neutral"
                              }
                            >
                              {
                                positive
                                  ? "+"
                                  : ""
                              }
                              {
                                row.change
                              }
                              %
                            </span>
                          }

                        </div>

                      </div>
                    );

                  }
                )
              }

            </div>

          </section>

        </>
      );

    };


  const renderMessages =
    () => {

      return (
        <>

          {
            renderHeader(
              "Messages",
              "Communicate with therapists assigned to your child."
            )
          }


          {
            renderChildSelector()
          }


          <section className="parent-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Care Team
                </h2>

                <p>
                  Only therapists linked to this child will be available for messaging
                </p>
              </div>

              <MessageCircle
                size={22}
              />

            </div>


            {
              childTherapists.length
                ? (
                  <div className="therapist-list">

                    {
                      childTherapists.map(
                        therapist => (
                          <div
                            className="therapist-card"
                            key={`${therapist.id}-${therapist.child_id}`}
                          >

                            <div className="therapist-avatar">
                              {
                                getInitials(
                                  therapist.full_name
                                )
                              }
                            </div>


                            <div>
                              <strong>
                                {
                                  therapist.full_name
                                }
                              </strong>

                              <span>
                                Assigned Therapist
                              </span>
                            </div>


                            <button
                              disabled
                            >
                              Messages coming next
                            </button>

                          </div>
                        )
                      )
                    }

                  </div>
                )
                : (
                  <div className="mini-empty">
                    No therapist is currently assigned to this child.
                  </div>
                )
            }

          </section>

        </>
      );

    };


  const renderNotifications =
    () => {

      return (
        <>

          {
            renderHeader(
              "Notifications",
              "Updates about reports, sessions, and care team activity."
            )
          }


          <section className="parent-panel">

            <div className="empty-state small">

              <Bell
                size={34}
              />

              <h2>
                Notifications are ready for the next step
              </h2>

              <p>
                New report, completed session, and therapist-message notifications will appear here after the notification backend is connected.
              </p>

            </div>

          </section>

        </>
      );

    };


  const renderSettings =
    () => {

      return (
        <ParentSettings
          onProfileUpdated={
            updatedUser =>
              setCurrentUser(
                previous => ({
                  ...previous,
                  ...updatedUser,
                })
              )
          }
        />
      );

    };

  const renderContent =
    () => {

      switch (
        activeSection
      ) {

        case "children":
          return renderChildren();

        case "sessions":
          return renderSessions();

        case "reports":
          return renderReports();

        case "progress":
          return renderProgress();

        case "messages":
          return renderMessages();

        case "notifications":
          return renderNotifications();

        case "settings":
          return renderSettings();

        default:
          return renderOverview();

      }

    };


  if (loading) {

    return (
      <div className="parent-loading">
        <div className="loading-spinner" />

        <span>
          Loading parent dashboard...
        </span>

        <style>
          {`
          .parent-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            background: #f7f8fc;
            color: #56587a;
            font-family: Inter, Arial, sans-serif;
          }

          .loading-spinner {
            width: 28px;
            height: 28px;
            border: 3px solid #e9e5ff;
            border-top-color: #7867d9;
            border-radius: 50%;
            animation: parentSpin .8s linear infinite;
          }

          @keyframes parentSpin {
            to {
              transform: rotate(360deg);
            }
          }
          `}
        </style>
      </div>
    );

  }


  return (
    <div className="parent-page">

      <aside className="parent-sidebar">

        <div className="parent-logo">
          <img
            src="/logo.png"
            alt="KidMind"
          />
        </div>


        <div className="parent-role-card">

          <div className="parent-role-icon">
            <UserRound
              size={19}
            />
          </div>


          <div>
            <strong>
              Parent Portal
            </strong>

            <span>
              KidMind Family View
            </span>
          </div>

        </div>


        <nav>

          {
            menu.map(
              item => {

                const Icon =
                  item.icon;


                return (
                  <button
                    key={
                      item.key
                    }
                    className={
                      activeSection ===
                      item.key
                        ? "active"
                        : ""
                    }
                    onClick={() => {

                      if (
                        item.key ===
                        "messages"
                      ) {

                        navigate(
                          "/chat"
                        );

                        return;

                      }


                      if (
                        item.key ===
                        "notifications"
                      ) {

                        navigate(
                          "/notifications"
                        );

                        return;

                      }


                      setActiveSection(
                        item.key
                      );

                    }}
                  >
                    <Icon
                      size={19}
                    />

                    <span className="parent-nav-title">
                      {
                        item.title
                      }
                    </span>


                    {
                      item.key ===
                        "notifications" &&
                      unreadCount >
                        0 && (

                        <span className="parent-nav-badge">
                          {
                            unreadCount >
                            99
                              ? "99+"
                              : unreadCount
                          }
                        </span>

                      )
                    }
                  </button>
                );

              }
            )
          }

        </nav>


        <button
          className="parent-logout"
          onClick={
            handleLogout
          }
        >
          <LogOut
            size={19}
          />

          Logout
        </button>

      </aside>


      <main className="parent-main">

        <div className="parent-topbar">

          <div>
            <span>
              Parent Portal
            </span>

            <strong>
              {
                currentUser.full_name ||
                "Parent"
              }
            </strong>
          </div>


          <div className="parent-topbar-actions">

            <button
              className="parent-notification-button"
              onClick={() =>
                navigate(
                  "/notifications"
                )
              }
              aria-label="Open notifications"
            >

              <Bell
                size={20}
              />


              {
                unreadCount >
                  0 && (

                  <span className="parent-topbar-badge">
                    {
                      unreadCount >
                      99
                        ? "99+"
                        : unreadCount
                    }
                  </span>

                )
              }

            </button>


            <div className="topbar-avatar">
              {
                getInitials(
                  currentUser.full_name
                )
              }
            </div>

          </div>

        </div>


        <div className="parent-content">

          {
            error &&
            <div className="parent-error">
              {
                error
              }
            </div>
          }


          {
            renderContent()
          }

        </div>

      </main>

{editingChild && (
  <EditChildModal
    child={editingChild}
    close={() =>
      setEditingChild(null)
    }
    onSuccess={async () => {
      setEditingChild(null);
      await loadData(false);
    }}
  />
)}

      {
        selectedReport &&
        <div
          className="parent-modal-backdrop"
          onMouseDown={() =>
            setSelectedReport(
              null
            )
          }
        >

          <div
            className="report-modal"
            onMouseDown={
              event =>
                event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <span>
                  Assessment Report
                </span>

                <h2>
                  Session #
                  {
                    selectedReport.id
                  }
                </h2>
              </div>


              <button
                onClick={() =>
                  setSelectedReport(
                    null
                  )
                }
              >
                <X
                  size={20}
                />
              </button>

            </div>


            <div className="modal-summary">

              <div>
                <span>
                  Child
                </span>

                <strong>
                  {
                    selectedReport.child_name
                  }
                </strong>
              </div>


              <div>
                <span>
                  Date
                </span>

                <strong>
                  {
                    formatDate(
                      selectedReport.ended_at ||
                      selectedReport.started_at ||
                      selectedReport.created_at
                    )
                  }
                </strong>
              </div>


              <div>
                <span>
                  Status
                </span>

                <strong>
                  {
                    selectedReport.status
                  }
                </strong>
              </div>


              <div>
                <span>
                  Session Score
                </span>

                <strong>
                  {
                    getSessionScore(
                      selectedReport
                    ) !==
                    null
                      ? `${getSessionScore(
                          selectedReport
                        )}%`
                      : "—"
                  }
                </strong>
              </div>

            </div>


            <h3 className="games-title">
              Game Results
            </h3>


            <div className="modal-games">

              {
                Array.isArray(
                  selectedReport.games
                ) &&
                selectedReport.games
                  .length
                  ? selectedReport.games.map(
                      game => (
                        <div
                          className="modal-game"
                          key={
                            game.id
                          }
                        >

                          <div>
                            <strong>
                              {
                                game.game_name
                              }
                            </strong>

                            <span>
                              {
                                getDomainName(
                                  game
                                ) ||
                                "Assessment Game"
                              }
                            </span>
                          </div>


                          <div>
                            <span>
                              Score
                            </span>

                            <strong>
                              {
                                getGameScore(
                                  game
                                ) !==
                                null
                                  ? `${getGameScore(
                                      game
                                    )}%`
                                  : "—"
                              }
                            </strong>
                          </div>


                          <div>
                            <span>
                              Accuracy
                            </span>

                            <strong>
                              {
                                game.accuracy !==
                                  null &&
                                game.accuracy !==
                                  undefined
                                  ? `${Math.round(
                                      Number(
                                        game.accuracy
                                      )
                                    )}%`
                                  : "—"
                              }
                            </strong>
                          </div>


                          <div>
                            <span>
                              Status
                            </span>

                            <strong>
                              {
                                game.status
                              }
                            </strong>
                          </div>

                        </div>
                      )
                    )
                  : (
                    <div className="mini-empty">
                      No game results are available for this session.
                    </div>
                  )
              }

            </div>

          </div>

        </div>
      }


      <style>
        {`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        button,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .parent-page {
          min-height: 100vh;
          display: flex;
          background: #f7f8fc;
          color: #28294f;
          font-family: Inter, Arial, sans-serif;
        }

        .parent-sidebar {
          width: 260px;
          min-height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          padding: 26px 18px 22px;
          background: #ffffff;
          border-right: 1px solid #ececf5;
          z-index: 20;
        }

        .parent-logo {
          height: 74px;
          display: flex;
          align-items: center;
          padding: 0 12px;
        }

        .parent-logo img {
          width: 138px;
          max-height: 60px;
          object-fit: contain;
        }

        .parent-role-card {
          display: flex;
          gap: 11px;
          align-items: center;
          margin: 12px 5px 22px;
          padding: 13px;
          background: linear-gradient(
            135deg,
            #f1efff,
            #fff1f7
          );
          border: 1px solid #ebe5ff;
          border-radius: 16px;
        }

        .parent-role-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #ffffff;
          color: #7565cf;
          box-shadow: 0 6px 16px rgba(
            83,
            67,
            150,
            .09
          );
        }

        .parent-role-card strong,
        .parent-role-card span {
          display: block;
        }

        .parent-role-card strong {
          font-size: 13px;
        }

        .parent-role-card span {
          margin-top: 3px;
          font-size: 10px;
          color: #8a8ba4;
        }

        .parent-sidebar nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .parent-sidebar nav button,
        .parent-logout {
          width: 100%;
          min-height: 44px;
          border: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
          background: transparent;
          color: #777893;
          font-weight: 600;
          transition: .2s ease;
        }

        .parent-sidebar nav button:hover {
          background: #f6f3ff;
          color: #6554c7;
        }

        .parent-sidebar nav button.active {
          background: linear-gradient(
            135deg,
            #7867d9,
            #9a77dc
          );
          color: white;
          box-shadow: 0 8px 22px rgba(
            120,
            103,
            217,
            .22
          );
        }

        .parent-nav-title {
          flex: 1;
          text-align: left;
        }

        .parent-nav-badge {
          min-width: 23px;
          height: 23px;
          padding: 0 6px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: #7C6CFF;
          font-size: 10px;
          font-weight: 800;
          line-height: 1;
        }

        .parent-sidebar nav button.active .parent-nav-badge {
          color: #6D5BC8;
          background: white;
        }

        .parent-logout {
          margin-top: auto;
          color: #c1536e;
        }

        .parent-logout:hover {
          background: #fff2f5;
        }

        .parent-main {
          width: calc(100% - 260px);
          margin-left: 260px;
          min-height: 100vh;
        }

        .parent-topbar {
          height: 76px;
          background: rgba(
            255,
            255,
            255,
            .92
          );
          border-bottom: 1px solid #ededf5;
          padding: 0 34px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 10;
          backdrop-filter: blur(12px);
        }

        .parent-topbar > div:first-child {
          text-align: right;
        }

        .parent-topbar span,
        .parent-topbar strong {
          display: block;
        }

        .parent-topbar span {
          font-size: 11px;
          color: #9898ad;
        }

        .parent-topbar strong {
          margin-top: 2px;
          font-size: 13px;
        }

        .parent-topbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .parent-notification-button {
          width: 41px;
          height: 41px;
          position: relative;
          border: 1px solid #E8E5F4;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #6D5BC8;
          background: white;
          transition: .18s ease;
        }

        .parent-notification-button:hover {
          background: #F6F3FF;
          border-color: #DDD7F7;
        }

        .parent-topbar-badge {
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          position: absolute;
          top: -7px;
          right: -7px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white !important;
          background: #7C6CFF;
          border: 2px solid white;
          font-size: 9px !important;
          font-weight: 800;
          line-height: 1;
        }

        .topbar-avatar {
          width: 41px;
          height: 41px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: #eeeaff;
          color: #6d5bc8;
          font-size: 13px;
          font-weight: 800;
        }

        .parent-content {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
          padding: 34px;
        }

        .parent-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 22px;
        }

        .parent-section-heading h1 {
          margin: 0;
          font-size: 29px;
          letter-spacing: -.7px;
          color: #28294f;
        }

        .parent-section-heading p {
          margin: 7px 0 0;
          color: #9293aa;
          font-size: 13px;
        }

        .parent-refresh-button,
        .text-button {
          border: 1px solid #e5e1f7;
          background: white;
          color: #6b5bc3;
          border-radius: 11px;
          padding: 10px 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
        }

        .text-button {
          border: 0;
          background: #f3f0ff;
        }

        .spin {
          animation: parentSpin .8s linear infinite;
        }

        @keyframes parentSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .parent-error {
          margin-bottom: 18px;
          padding: 13px 15px;
          border-radius: 12px;
          background: #fff0f2;
          color: #b74661;
          font-size: 13px;
        }

        .child-selector {
          margin-bottom: 22px;
          display: inline-flex;
          align-items: center;
          gap: 11px;
          padding: 9px 12px;
          background: #fff;
          border: 1px solid #ececf5;
          border-radius: 13px;
        }

        .child-selector span {
          color: #9293a8;
          font-size: 12px;
          font-weight: 600;
        }

        .child-selector select {
          min-width: 170px;
          border: 0;
          outline: none;
          background: transparent;
          color: #484969;
          font-weight: 700;
        }

        .child-hero {
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 18px;
          background: linear-gradient(
            135deg,
            #ffffff,
            #faf8ff
          );
          border: 1px solid #ebe9f6;
          border-radius: 22px;
          box-shadow: 0 14px 36px rgba(
            62,
            55,
            104,
            .06
          );
          margin-bottom: 22px;
        }

        .child-avatar,
        .child-card-avatar {
          flex: 0 0 auto;
          width: 66px;
          height: 66px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            #e8e2ff,
            #ffe4ef
          );
          color: #6856bd;
          font-size: 20px;
          font-weight: 800;
        }

        .child-hero-info {
          flex: 1;
        }

        .eyebrow {
          color: #988ccf;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .8px;
        }

        .child-hero-info h2 {
          margin: 5px 0 8px;
          font-size: 23px;
        }

        .child-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .child-meta span {
          padding: 5px 9px;
          background: #f5f3fb;
          color: #7c7d97;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
        }

        .therapist-summary {
          min-width: 200px;
          padding: 15px 18px;
          border-left: 1px solid #eceaf5;
        }

        .therapist-summary span,
        .therapist-summary strong {
          display: block;
        }

        .therapist-summary span {
          color: #9a9aae;
          font-size: 11px;
        }

        .therapist-summary strong {
          margin-top: 5px;
          font-size: 13px;
        }

        .parent-stats-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 16px;
          margin-bottom: 20px;
        }

        .parent-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 124px;
          padding: 18px;
          background: white;
          border: 1px solid #ededf5;
          border-radius: 18px;
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
        }

        .stat-icon.purple {
          color: #6f5ec9;
          background: #eeeaff;
        }

        .stat-icon.pink {
          color: #c35e85;
          background: #ffedf4;
        }

        .stat-icon.blue {
          color: #4e80c8;
          background: #eaf3ff;
        }

        .stat-icon.green {
          color: #4d9b7c;
          background: #e9f8f1;
        }

        .parent-stat-card span,
        .parent-stat-card strong,
        .parent-stat-card small {
          display: block;
        }

        .parent-stat-card span {
          color: #9596a9;
          font-size: 11px;
        }

        .parent-stat-card strong {
          margin: 4px 0 3px;
          color: #303158;
          font-size: 23px;
        }

        .parent-stat-card small {
          color: #b0b0bf;
          font-size: 10px;
        }

        .snapshot-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 20px;
        }

        .parent-panel {
          background: white;
          border: 1px solid #ededf5;
          border-radius: 19px;
          padding: 21px;
          box-shadow: 0 10px 26px rgba(
            68,
            59,
            110,
            .035
          );
        }

        .panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
          color: #7563cc;
        }

        .panel-heading h2 {
          margin: 0;
          color: #333459;
          font-size: 16px;
        }

        .panel-heading p {
          margin: 5px 0 0;
          color: #a1a1b2;
          font-size: 11px;
        }

        .snapshot-items {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .snapshot-item {
          display: flex;
          gap: 12px;
          padding: 15px;
          border-radius: 14px;
        }

        .snapshot-item.positive {
          background: #eefaf5;
        }

        .snapshot-item.attention {
          background: #fff4f3;
        }

        .snapshot-icon {
          flex: 0 0 auto;
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: white;
        }

        .positive .snapshot-icon {
          color: #419779;
        }

        .attention .snapshot-icon {
          color: #cf6b72;
        }

        .snapshot-item span,
        .snapshot-item strong,
        .snapshot-item small {
          display: block;
        }

        .snapshot-item span {
          font-size: 10px;
          color: #9293a5;
        }

        .snapshot-item strong {
          margin: 4px 0;
          font-size: 13px;
        }

        .snapshot-item small {
          color: #999aac;
          font-size: 10px;
        }

        .activity-card {
          padding: 15px;
          background: #f8f7fd;
          border-radius: 14px;
        }

        .activity-card > div:first-child {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
        }

        .activity-card > div:first-child span {
          color: #8f90a6;
          font-size: 11px;
        }

        .activity-card > div:first-child strong {
          font-size: 12px;
        }

        .activity-details {
          display: flex;
          gap: 18px;
          color: #83849b;
          font-size: 11px;
        }

        .activity-details span,
        .report-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .recent-panel {
          margin-bottom: 20px;
        }

        .reports-table-wrap {
          overflow-x: auto;
        }

        .parent-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 650px;
        }

        .parent-table th {
          padding: 11px 12px;
          text-align: left;
          color: #999aac;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .4px;
          border-bottom: 1px solid #eeeef5;
        }

        .parent-table td {
          padding: 14px 12px;
          font-size: 12px;
          color: #5f607c;
          border-bottom: 1px solid #f1f1f6;
        }

        .status-pill {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
        }

        .status-pill.completed {
          background: #e9f8f1;
          color: #3e9272;
        }

        .status-pill.ended {
          background: #edf2ff;
          color: #5a73bd;
        }

        .status-pill.cancelled {
          background: #fff0f2;
          color: #c45d70;
        }

        .status-pill.progress {
          background: #fff7df;
          color: #a17b23;
        }

        .status-pill.paused,
        .status-pill.default {
          background: #f1f1f5;
          color: #797a8c;
        }

        .icon-action {
          width: 33px;
          height: 33px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 10px;
          background: #f1eeff;
          color: #6f5bc9;
        }

        .children-grid,
        .reports-cards-grid {
          display: grid;
          grid-template-columns: repeat(
            3,
            minmax(0, 1fr)
          );
          gap: 17px;
        }

        .child-card,
        .report-card {
          padding: 20px;
          background: white;
          border: 1px solid #ededf5;
          border-radius: 19px;
        }

        .child-card-top {
          display: flex;
          align-items: center;
          gap: 13px;
          padding-bottom: 17px;
          border-bottom: 1px solid #f0f0f5;
        }

        .child-card-avatar {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          font-size: 16px;
        }

        .child-card h2 {
          margin: 0 0 5px;
          font-size: 17px;
        }

        .child-card p {
          margin: 0;
          color: #999aac;
          font-size: 11px;
        }

        .child-card-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          padding: 17px 0;
        }

        .child-card-info span,
        .child-card-info strong {
          display: block;
        }

        .child-card-info span {
          color: #a0a1b2;
          font-size: 10px;
        }

        .child-card-info strong {
          margin-top: 4px;
          font-size: 11px;
        }

        .primary-soft-button {
          width: 100%;
          min-height: 40px;
          border: 0;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: #f0edff;
          color: #6d59c8;
          font-weight: 800;
          font-size: 11px;
        }

        .session-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .session-row-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 22px;
          padding: 16px;
          border: 1px solid #eeeef5;
          border-radius: 14px;
        }

        .session-row-main {
          min-width: 220px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .session-number {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #f0edff;
          color: #6a59c1;
          font-size: 11px;
          font-weight: 800;
        }

        .session-row-main h3 {
          margin: 0;
          font-size: 13px;
        }

        .session-row-main p {
          margin: 4px 0 0;
          color: #9a9bad;
          font-size: 10px;
        }

        .session-row-details {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(
            4,
            1fr
          );
          gap: 10px;
        }

        .session-row-details span,
        .session-row-details strong {
          display: block;
        }

        .session-row-details span {
          color: #a0a0b2;
          font-size: 9px;
        }

        .session-row-details strong {
          margin-top: 4px;
          font-size: 11px;
        }

        .report-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .report-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: #705ec9;
          background: #eeeaff;
        }

        .report-card h2 {
          margin: 17px 0 4px;
          font-size: 16px;
        }

        .report-card > p {
          margin: 0 0 18px;
          color: #999aac;
          font-size: 11px;
        }

        .report-score {
          padding: 14px;
          border-radius: 13px;
          background: #f8f7fd;
          margin-bottom: 13px;
        }

        .report-score span,
        .report-score strong {
          display: block;
        }

        .report-score span {
          color: #9697aa;
          font-size: 10px;
        }

        .report-score strong {
          margin-top: 4px;
          font-size: 23px;
          color: #6655bd;
        }

        .report-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          color: #87889c;
          font-size: 10px;
        }

        .progress-list {
          display: flex;
          flex-direction: column;
        }

        .progress-row {
          display: grid;
          grid-template-columns: 190px 1fr 115px;
          gap: 18px;
          align-items: center;
          padding: 17px 0;
          border-bottom: 1px solid #f0f0f5;
        }

        .progress-row:last-child {
          border-bottom: 0;
        }

        .progress-title strong,
        .progress-title span {
          display: block;
        }

        .progress-title strong {
          font-size: 12px;
        }

        .progress-title span {
          margin-top: 4px;
          color: #9a9bad;
          font-size: 10px;
        }

        .progress-bar-track {
          width: 100%;
          height: 9px;
          background: #f0eff6;
          border-radius: 20px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #8b79df,
            #d28cb5
          );
          transition: width .3s ease;
        }

        .progress-value {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .progress-value strong {
          min-width: 37px;
          font-size: 12px;
        }

        .progress-value span {
          padding: 4px 6px;
          border-radius: 7px;
          font-size: 9px;
          font-weight: 800;
        }

        .change-positive {
          color: #3b9271;
          background: #eaf8f1;
        }

        .change-negative {
          color: #c35e6d;
          background: #fff0f2;
        }

        .change-neutral {
          color: #77788c;
          background: #f1f1f5;
        }

        .therapist-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .therapist-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px;
          border: 1px solid #eeeef5;
          border-radius: 14px;
        }

        .therapist-avatar {
          width: 44px;
          height: 44px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #eeeaff;
          color: #6958c0;
          font-size: 12px;
          font-weight: 800;
        }

        .therapist-card > div:nth-child(2) {
          flex: 1;
        }

        .therapist-card strong,
        .therapist-card span {
          display: block;
        }

        .therapist-card strong {
          font-size: 12px;
        }

        .therapist-card span {
          margin-top: 3px;
          color: #9b9cad;
          font-size: 10px;
        }

        .therapist-card button {
          border: 0;
          border-radius: 10px;
          padding: 9px 12px;
          background: #f3f2f7;
          color: #a0a0ae;
          font-size: 10px;
          font-weight: 700;
          cursor: not-allowed;
        }

        .settings-panel {
          display: flex;
          align-items: flex-start;
          gap: 24px;
        }

        .settings-avatar {
          width: 80px;
          height: 80px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 22px;
          background: linear-gradient(
            135deg,
            #e9e3ff,
            #ffe4ef
          );
          color: #6754bc;
          font-size: 22px;
          font-weight: 800;
        }

        .settings-details {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .settings-details > div {
          padding: 14px;
          background: #fafafd;
          border-radius: 12px;
        }

        .settings-details span,
        .settings-details strong {
          display: block;
        }

        .settings-details span {
          color: #9b9bad;
          font-size: 10px;
        }

        .settings-details strong {
          margin-top: 5px;
          font-size: 12px;
        }

        .empty-state {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #a2a2b3;
          background: white;
          border: 1px solid #ededf5;
          border-radius: 18px;
          padding: 30px;
        }

        .empty-state.small {
          min-height: 240px;
          border: 0;
        }

        .empty-state h2 {
          margin: 13px 0 5px;
          color: #4d4e6c;
          font-size: 16px;
        }

        .empty-state p {
          max-width: 470px;
          margin: 0;
          line-height: 1.7;
          font-size: 11px;
        }

        .mini-empty {
          padding: 25px;
          text-align: center;
          color: #a0a1b2;
          font-size: 11px;
        }

        .parent-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(
            30,
            28,
            51,
            .42
          );
          backdrop-filter: blur(5px);
        }

        .report-modal {
          width: min(
            760px,
            100%
          );
          max-height: 88vh;
          overflow-y: auto;
          background: white;
          border-radius: 22px;
          box-shadow: 0 26px 80px rgba(
            35,
            29,
            74,
            .22
          );
          padding: 23px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 17px;
          border-bottom: 1px solid #eeeef5;
        }

        .modal-header span {
          color: #999aad;
          font-size: 10px;
        }

        .modal-header h2 {
          margin: 5px 0 0;
          font-size: 19px;
        }

        .modal-header button {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 11px;
          background: #f4f3f8;
          color: #77788f;
        }

        .modal-summary {
          display: grid;
          grid-template-columns: repeat(
            4,
            1fr
          );
          gap: 10px;
          padding: 17px 0;
        }

        .modal-summary > div {
          padding: 12px;
          border-radius: 11px;
          background: #f8f7fd;
        }

        .modal-summary span,
        .modal-summary strong {
          display: block;
        }

        .modal-summary span {
          color: #9a9bad;
          font-size: 9px;
        }

        .modal-summary strong {
          margin-top: 4px;
          font-size: 11px;
        }

        .games-title {
          margin: 8px 0 12px;
          font-size: 14px;
        }

        .modal-games {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .modal-game {
          display: grid;
          grid-template-columns: 1.7fr 1fr 1fr 1fr;
          align-items: center;
          gap: 12px;
          padding: 13px;
          border: 1px solid #eeeef5;
          border-radius: 12px;
        }

        .modal-game span,
        .modal-game strong {
          display: block;
        }

        .modal-game span {
          margin-top: 3px;
          color: #999aad;
          font-size: 9px;
        }

        .modal-game strong {
          font-size: 11px;
        }

        @media (
          max-width: 1150px
        ) {

          .parent-stats-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .children-grid,
          .reports-cards-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .snapshot-grid {
            grid-template-columns:
              1fr;
          }

          .session-row-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .session-row-details {
            width: 100%;
          }

        }

        @media (
          max-width: 760px
        ) {

          .parent-sidebar {
            width: 78px;
            padding:
              20px 10px;
          }

          .parent-logo {
            padding: 0;
            justify-content: center;
          }

          .parent-logo img {
            width: 58px;
          }

          .parent-role-card {
            justify-content: center;
            padding: 10px;
          }

          .parent-role-card > div:last-child {
            display: none;
          }

          .parent-sidebar nav button,
          .parent-logout {
            justify-content: center;
            padding: 0;
          }

          .parent-sidebar nav button span,
          .parent-logout {
            font-size: 0;
          }

          .parent-logout svg {
            width: 19px;
            height: 19px;
          }

          .parent-main {
            width:
              calc(100% - 78px);
            margin-left: 78px;
          }

          .parent-content {
            padding: 22px 14px;
          }

          .parent-topbar {
            padding: 0 16px;
          }

          .parent-section-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .parent-section-heading h1 {
            font-size: 23px;
          }

          .parent-stats-grid,
          .children-grid,
          .reports-cards-grid,
          .snapshot-items {
            grid-template-columns:
              1fr;
          }

          .child-hero {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .therapist-summary {
            width: 100%;
            border-left: 0;
            border-top:
              1px solid #eceaf5;
            padding:
              14px 0 0;
          }

          .session-row-details {
            grid-template-columns:
              1fr 1fr;
          }

          .progress-row {
            grid-template-columns:
              1fr;
            gap: 8px;
          }

          .progress-value {
            justify-content:
              flex-start;
          }

          .settings-panel {
            flex-direction: column;
          }

          .settings-details,
          .modal-summary {
            width: 100%;
            grid-template-columns:
              1fr 1fr;
          }

          .modal-game {
            grid-template-columns:
              1fr 1fr;
          }

        }
          .child-edit-button {
  width: 42px;
  min-height: 40px;
  border: 0;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: #e8f1ff;
  color: #4f7fd8;
}

.child-card-actions {
  display: flex;
  gap: 9px;
}

.child-card-actions .primary-soft-button {
  flex: 1;
}

        `}
      </style>

    </div>
  );

}