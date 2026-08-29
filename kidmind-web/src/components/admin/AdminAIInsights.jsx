import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  CircleGauge,
  Globe2,
  Lightbulb,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserRoundCog,
  Users,
} from "lucide-react";

import {
  getAdminAIInsights,
} from "../../api/adminAiApi";


const clamp = (
  value,
  minimum,
  maximum
) =>
  Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );


const formatValue =
  value => {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(
        Number(value)
      )
    ) {
      return "—";
    }

    return Number(value)
      .toLocaleString();
  };


const EmptyState = ({
  text,
}) => (
  <div className="admin-ai-empty">
    {text}
  </div>
);


function TrendChart({
  points,
}) {
  const chart =
    useMemo(
      () => {
        if (
          !Array.isArray(
            points
          ) ||
          points.length === 0
        ) {
          return null;
        }

        const width = 680;
        const height = 230;

        const padding = {
          left: 42,
          right: 20,
          top: 20,
          bottom: 44,
        };

        const validValues =
          points
            .map(
              point =>
                Number(
                  point.averageScore
                )
            )
            .filter(
              value =>
                Number.isFinite(
                  value
                )
            );

        if (
          validValues.length === 0
        ) {
          return null;
        }

        const rawMin =
          Math.min(
            ...validValues
          );

        const rawMax =
          Math.max(
            ...validValues
          );

        const minimum =
          clamp(
            Math.floor(
              rawMin - 10
            ),
            0,
            90
          );

        const maximum =
          clamp(
            Math.ceil(
              rawMax + 10
            ),
            minimum + 10,
            100
          );

        const innerWidth =
          width -
          padding.left -
          padding.right;

        const innerHeight =
          height -
          padding.top -
          padding.bottom;

        const x =
          index =>
            points.length === 1
              ? padding.left +
                innerWidth / 2
              : padding.left +
                (
                  index /
                  (
                    points.length - 1
                  )
                ) *
                  innerWidth;

        const y =
          value =>
            padding.top +
            (
              (
                maximum -
                value
              ) /
              (
                maximum -
                minimum
              )
            ) *
              innerHeight;

        const coordinates =
          points.map(
            (
              point,
              index
            ) => ({
              ...point,
              x: x(index),
              y: y(
                Number(
                  point.averageScore
                )
              ),
            })
          );

        return {
          width,
          height,
          padding,
          minimum,
          maximum,
          coordinates,
          polyline:
            coordinates
              .map(
                point =>
                  `${point.x},${point.y}`
              )
              .join(" "),
        };
      },
      [
        points,
      ]
    );

  if (!chart) {
    return (
      <EmptyState
        text="No completed scored sessions are available for this chart yet."
      />
    );
  }

  const gridValues = [
    chart.maximum,
    Math.round(
      (
        chart.maximum +
        chart.minimum
      ) / 2
    ),
    chart.minimum,
  ];

  return (
    <div className="admin-ai-chart-wrap">

      <svg
        className="admin-ai-chart"
        viewBox={
          `0 0 ${chart.width} ${chart.height}`
        }
        role="img"
        aria-label="KidMind average platform score over time"
      >

        {gridValues.map(
          value => {
            const y =
              chart.padding.top +
              (
                (
                  chart.maximum -
                  value
                ) /
                (
                  chart.maximum -
                  chart.minimum
                )
              ) *
                (
                  chart.height -
                  chart.padding.top -
                  chart.padding.bottom
                );

            return (
              <g
                key={
                  value
                }
              >
                <line
                  x1={
                    chart.padding.left
                  }
                  x2={
                    chart.width -
                    chart.padding.right
                  }
                  y1={y}
                  y2={y}
                  stroke="#EEEFF5"
                  strokeWidth="1"
                />

                <text
                  x="5"
                  y={
                    y + 4
                  }
                  fontSize="10"
                  fill="#9FA2B5"
                >
                  {value}
                </text>
              </g>
            );
          }
        )}

        <polyline
          points={
            chart.polyline
          }
          fill="none"
          stroke="#7868EF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {chart.coordinates.map(
          point => (
            <g
              key={
                point.period
              }
            >
              <circle
                cx={
                  point.x
                }
                cy={
                  point.y
                }
                r="5"
                fill="#FFFFFF"
                stroke="#7868EF"
                strokeWidth="3"
              />

              <text
                x={
                  point.x
                }
                y={
                  chart.height -
                  15
                }
                textAnchor="middle"
                fontSize="10"
                fill="#8C8FA4"
              >
                {
                  point.label
                }
              </text>

              <title>
                {
                  `${point.label}: ${point.averageScore}% across ${point.sessions} scored sessions`
                }
              </title>
            </g>
          )
        )}

      </svg>

    </div>
  );
}


const getDirectionIcon =
  direction => {
    if (
      direction ===
      "rising"
    ) {
      return (
        <ArrowUpRight
          size={15}
        />
      );
    }

    if (
      direction ===
      "declining"
    ) {
      return (
        <ArrowDownRight
          size={15}
        />
      );
    }

    return (
      <ArrowRight
        size={15}
      />
    );
  };


function InsightGroup({
  title,
  items,
  tone,
}) {
  if (
    !Array.isArray(
      items
    ) ||
    items.length === 0
  ) {
    return null;
  }

  return (
    <div className="admin-ai-insight-group">

      <h3>
        {title}
      </h3>

      <div className="admin-ai-insight-list">

        {items.map(
          (
            item,
            index
          ) => (
            <div
              className={
                `admin-ai-insight-item ${tone}`
              }
              key={
                `${item.title}-${index}`
              }
            >
              <span />

              <div>
                <strong>
                  {
                    item.title
                  }
                </strong>

                <p>
                  {
                    item.description
                  }
                </p>
              </div>
            </div>
          )
        )}

      </div>

    </div>
  );
}


export default function AdminAIInsights() {
  const [
    data,
    setData,
  ] =
    useState(null);

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
    error,
    setError,
  ] =
    useState("");

  const loadInsights =
    useCallback(
      async (
        refresh = false
      ) => {
        try {
          if (refresh) {
            setRefreshing(
              true
            );
          } else {
            setLoading(
              true
            );
          }

          setError("");

          const response =
            await getAdminAIInsights();

          if (
            !response?.success ||
            !response?.data
          ) {
            throw new Error(
              response?.message ||
              "Invalid Admin AI response."
            );
          }

          setData(
            response.data
          );
        } catch (
          requestError
        ) {
          console.error(
            requestError
          );

          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            requestError
              ?.message ||
            "Unable to load Admin AI Insights."
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
      []
    );

  useEffect(
    () => {
      loadInsights();
    },
    [
      loadInsights,
    ]
  );

  if (loading) {
    return (
      <div className="admin-ai-loading">

        <div className="admin-ai-loading-orb">
          <BrainCircuit
            size={30}
          />
        </div>

        <h2>
          Building platform insights
        </h2>

        <p>
          KidMind is calculating verified database statistics first, then asking AI to interpret only the aggregated data.
        </p>

        <div className="admin-ai-loading-line" />

        <style>
          {styles}
        </style>

      </div>
    );
  }

  if (
    error &&
    !data
  ) {
    return (
      <div className="admin-ai-error-page">

        <AlertTriangle
          size={34}
        />

        <h2>
          Unable to load AI Insights
        </h2>

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            loadInsights()
          }
        >
          Try Again
        </button>

        <style>
          {styles}
        </style>

      </div>
    );
  }

  const statistics =
    data?.statistics ||
    {};

  const totals =
    statistics.totals ||
    {};

  const ai =
    data?.ai ||
    {};

  const cards = [
    {
      label:
        "Total Children",
      value:
        totals.totalChildren,
      subtitle:
        "Registered children",
      icon:
        Users,
      tone:
        "purple",
    },
    {
      label:
        "Improved Children",
      value:
        totals.improvedChildren,
      subtitle:
        "Verified score improvement",
      icon:
        TrendingUp,
      tone:
        "green",
    },
    {
      label:
        "Needs Attention",
      value:
        totals.needsAttention,
      subtitle:
        "Administrative follow-up signal",
      icon:
        AlertTriangle,
      tone:
        "orange",
    },
    {
      label:
        "Active Therapists",
      value:
        totals.activeTherapists,
      subtitle:
        `of ${formatValue(
          totals.totalTherapists
        )} therapist accounts`,
      icon:
        UserRoundCog,
      tone:
        "blue",
    },
  ];

  const childrenByRegion =
    statistics
      .childrenByRegion ||
    [];

  const regionMax =
    Math.max(
      1,
      ...childrenByRegion.map(
        item =>
          Number(
            item.count
          ) ||
          0
      )
    );

  const cognitive =
    statistics
      .cognitivePerformance ||
    [];

  const earlySignals =
    statistics
      .earlyTrendSignals ||
    [];

  return (
    <div className="admin-ai-page">

      <div className="admin-ai-hero">

        <div>

          <span className="admin-ai-eyebrow">
            <Sparkles
              size={15}
            />
            PLATFORM-LEVEL AI
          </span>

          <h1>
            AI Insights
          </h1>

          <p>
            KidMind calculates platform statistics from MySQL first. Gemini receives only aggregated, de-identified results and is used only for interpretation, trends, and administrative recommendations.
          </p>

        </div>

        <button
          type="button"
          className="admin-ai-refresh"
          disabled={
            refreshing
          }
          onClick={() =>
            loadInsights(
              true
            )
          }
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "admin-ai-spin"
                : ""
            }
          />

          {
            refreshing
              ? "Refreshing..."
              : "Refresh Insights"
          }
        </button>

      </div>

      {error && (
        <div className="admin-ai-inline-error">
          <AlertTriangle
            size={17}
          />
          {error}
        </div>
      )}

      <div className="admin-ai-stat-grid">

        {cards.map(
          card => {
            const Icon =
              card.icon;

            return (
              <div
                className="admin-ai-stat-card"
                key={
                  card.label
                }
              >
                <div
                  className={
                    `admin-ai-stat-icon ${card.tone}`
                  }
                >
                  <Icon
                    size={21}
                  />
                </div>

                <div>
                  <span>
                    {
                      card.label
                    }
                  </span>

                  <strong>
                    {
                      formatValue(
                        card.value
                      )
                    }
                  </strong>

                  <small>
                    {
                      card.subtitle
                    }
                  </small>
                </div>
              </div>
            );
          }
        )}

      </div>

      <div className="admin-ai-secondary-stats">

        <span>
          <strong>
            {
              formatValue(
                totals
                  .completedAssessmentSessions
              )
            }
          </strong>
          completed assessment sessions
        </span>

        <span>
          <strong>
            {
              formatValue(
                totals
                  .noClearImprovement
              )
            }
          </strong>
          children with no clear score change
        </span>

        <span>
          <strong>
            {
              formatValue(
                totals
                  .childrenWithoutEnoughData
              )
            }
          </strong>
          children without enough longitudinal data
        </span>

      </div>

      <div className="admin-ai-two-column">

        <section className="admin-ai-panel">

          <div className="admin-ai-panel-heading">

            <div className="admin-ai-heading-icon geography">
              <Globe2
                size={19}
              />
            </div>

            <div>
              <h2>
                Children by Country / Region
              </h2>

              <p>
                KidMind currently stores geography in <code>children.region</code>, so these are the actual values from that field.
              </p>
            </div>

          </div>

          {
            childrenByRegion.length ===
              0
              ? (
                <EmptyState
                  text="No geographic data is available yet."
                />
              )
              : (
                <div className="admin-ai-region-list">

                  {childrenByRegion.map(
                    item => (
                      <div
                        className="admin-ai-region-row"
                        key={
                          item.region
                        }
                      >
                        <div className="admin-ai-region-row-top">
                          <span>
                            {
                              item.region
                            }
                          </span>

                          <strong>
                            {
                              formatValue(
                                item.count
                              )
                            }
                          </strong>
                        </div>

                        <div className="admin-ai-track">
                          <div
                            style={{
                              width:
                                `${Math.max(
                                  5,
                                  (
                                    Number(
                                      item.count
                                    ) /
                                    regionMax
                                  ) *
                                    100
                                )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}

                </div>
              )
          }

        </section>

        <section className="admin-ai-panel">

          <div className="admin-ai-panel-heading">

            <div className="admin-ai-heading-icon cognition">
              <CircleGauge
                size={19}
              />
            </div>

            <div>
              <h2>
                Cognitive Performance
              </h2>

              <p>
                Uses KidMind's existing cognitive game mapping rather than invented domains.
              </p>
            </div>

          </div>

          <div className="admin-ai-cognitive-list">

            {cognitive.map(
              item => {
                const score =
                  item.averageScore;

                return (
                  <div
                    className="admin-ai-cognitive-row"
                    key={
                      item.key
                    }
                  >
                    <div className="admin-ai-cognitive-top">
                      <div>
                        <strong>
                          {
                            item.label
                          }
                        </strong>

                        <small>
                          {
                            item.gameName
                          }
                        </small>
                      </div>

                      <span>
                        {
                          score ===
                            null
                            ? "No data"
                            : `${Math.round(
                                score
                              )}%`
                        }
                      </span>
                    </div>

                    <div className="admin-ai-track cognitive">
                      <div
                        style={{
                          width:
                            score ===
                              null
                              ? "0%"
                              : `${clamp(
                                  score,
                                  0,
                                  100
                                )}%`,
                        }}
                      />
                    </div>

                    <div className="admin-ai-cognitive-meta">
                      <span>
                        {
                          formatValue(
                            item.assessments
                          )
                        } assessments
                      </span>

                      <span>
                        {
                          formatValue(
                            item.children
                          )
                        } children
                      </span>

                      <span>
                        Accuracy: {
                          item.averageAccuracy ===
                            null
                            ? "—"
                            : `${Math.round(
                                item.averageAccuracy
                              )}%`
                        }
                      </span>
                    </div>
                  </div>
                );
              }
            )}

          </div>

        </section>

      </div>

      <section className="admin-ai-panel admin-ai-trend-panel">

        <div className="admin-ai-panel-heading">

          <div className="admin-ai-heading-icon trend">
            <TrendingUp
              size={19}
            />
          </div>

          <div>
            <h2>
              Improvement Trends
            </h2>

            <p>
              Average verified score from completed or ended assessment sessions over time.
            </p>
          </div>

        </div>

        <TrendChart
          points={
            statistics
              .improvementTrend ||
            []
          }
        />

      </section>

      <section className="admin-ai-panel admin-ai-trend-panel">

        <div className="admin-ai-panel-heading">

          <div className="admin-ai-heading-icon early">
            <BrainCircuit
              size={19}
            />
          </div>

          <div>
            <h2>
              Early Trend Detection
            </h2>

            <p>
              Backend signals compare the two most recent available periods for each actual KidMind cognitive domain.
            </p>
          </div>

        </div>

        <div className="admin-ai-early-grid">

          {earlySignals.map(
            signal => (
              <div
                className={
                  `admin-ai-early-card ${signal.attentionLevel}`
                }
                key={
                  signal.key
                }
              >
                <div className="admin-ai-early-card-top">
                  <strong>
                    {
                      signal.label
                    }
                  </strong>

                  <span>
                    {
                      getDirectionIcon(
                        signal.direction
                      )
                    }
                    {
                      String(
                        signal.direction
                      )
                        .replace(
                          "_",
                          " "
                        )
                    }
                  </span>
                </div>

                {
                  signal.direction ===
                    "insufficient_data"
                    ? (
                      <p>
                        Not enough period-to-period data is available yet.
                      </p>
                    )
                    : (
                      <div className="admin-ai-early-values">

                        <div>
                          <span>
                            Previous
                          </span>
                          <strong>
                            {
                              Math.round(
                                signal
                                  .previousAverage
                              )
                            }%
                          </strong>
                        </div>

                        <div>
                          <span>
                            Current
                          </span>
                          <strong>
                            {
                              Math.round(
                                signal
                                  .currentAverage
                              )
                            }%
                          </strong>
                        </div>

                        <div>
                          <span>
                            Change
                          </span>
                          <strong>
                            {
                              signal.delta >
                              0
                                ? "+"
                                : ""
                            }{
                              signal.delta
                            }
                          </strong>
                        </div>

                      </div>
                    )
                }
              </div>
            )
          )}

        </div>

      </section>

      <div className="admin-ai-two-column admin-ai-insight-columns">

        <section className="admin-ai-panel">

          <div className="admin-ai-panel-heading">

            <div className="admin-ai-heading-icon generated">
              <Sparkles
                size={19}
              />
            </div>

            <div>
              <h2>
                AI Platform Insights
              </h2>

              <p>
                Gemini interprets aggregated statistics only. Verified numbers remain backend-owned.
              </p>
            </div>

          </div>

          {
            !ai.available && (
              <div className="admin-ai-unavailable">
                <AlertTriangle
                  size={18}
                />

                <div>
                  <strong>
                    AI interpretation unavailable
                  </strong>

                  <p>
                    {
                      ai.error ||
                      ai.summary
                    }
                  </p>
                </div>
              </div>
            )
          }

          {
            ai.summary && (
              <div className="admin-ai-summary">
                <BrainCircuit
                  size={21}
                />

                <p>
                  {
                    ai.summary
                  }
                </p>
              </div>
            )
          }

          <InsightGroup
            title="Key Trends"
            items={
              ai.keyTrends
            }
            tone="purple"
          />

          <InsightGroup
            title="Areas Needing Attention"
            items={
              ai.areasNeedingAttention
            }
            tone="orange"
          />

          <InsightGroup
            title="Positive Trends"
            items={
              ai.positiveTrends
            }
            tone="green"
          />

          <InsightGroup
            title="Emerging Trends"
            items={
              ai.emergingTrends
            }
            tone="blue"
          />

        </section>

        <section className="admin-ai-panel">

          <div className="admin-ai-panel-heading">

            <div className="admin-ai-heading-icon recommendation">
              <Lightbulb
                size={19}
              />
            </div>

            <div>
              <h2>
                AI Recommendations
              </h2>

              <p>
                Administrative actions only — not diagnostic or medical recommendations.
              </p>
            </div>

          </div>

          {
            Array.isArray(
              ai.recommendations
            ) &&
            ai.recommendations.length >
              0
              ? (
                <div className="admin-ai-recommendation-list">

                  {ai.recommendations.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="admin-ai-recommendation-card"
                        key={
                          `${item.title}-${index}`
                        }
                      >
                        <div
                          className={
                            `admin-ai-priority ${item.priority}`
                          }
                        >
                          {
                            item.priority
                          }
                        </div>

                        <strong>
                          {
                            item.title
                          }
                        </strong>

                        <p>
                          {
                            item.description
                          }
                        </p>
                      </div>
                    )
                  )}

                </div>
              )
              : (
                <EmptyState
                  text="No AI recommendations are available yet."
                />
              )
          }

        </section>

      </div>

      <div className="admin-ai-methodology">

        <CheckCircle2
          size={17}
        />

        <div>
          <strong>
            Data integrity rules
          </strong>

          <p>
            Core counts, scores, improvement classifications, region totals, cognitive averages, and early trend signals come from MySQL/Backend. Gemini cannot replace those values, and its narrative is sanitized so it cannot display competing numeric claims.
          </p>
        </div>

      </div>

      <style>
        {styles}
      </style>

    </div>
  );
}


const styles = `
  .admin-ai-page {
    color: #2E3054;
  }

  .admin-ai-hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 28px;
    padding: 28px 30px;
    border-radius: 25px;
    color: white;
    background:
      linear-gradient(
        115deg,
        #7467EE,
        #9471EF 55%,
        #CA78D8
      );
    box-shadow:
      0 18px 40px
      rgba(119,105,242,.16);
  }

  .admin-ai-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .12em;
    opacity: .85;
  }

  .admin-ai-hero h1 {
    margin: 8px 0 6px;
    font-size: 29px;
  }

  .admin-ai-hero p {
    max-width: 760px;
    margin: 0;
    color: rgba(255,255,255,.84);
    font-size: 13px;
    line-height: 1.7;
  }

  .admin-ai-refresh {
    min-width: 150px;
    height: 43px;
    border: 1px solid rgba(255,255,255,.28);
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: white;
    background: rgba(255,255,255,.13);
    cursor: pointer;
    font-size: 11px;
    font-weight: 700;
  }

  .admin-ai-refresh:disabled {
    opacity: .65;
    cursor: default;
  }

  .admin-ai-spin {
    animation:
      admin-ai-spin
      .8s linear infinite;
  }

  @keyframes admin-ai-spin {
    to {
      transform:
        rotate(360deg);
    }
  }

  .admin-ai-inline-error {
    margin-top: 16px;
    padding: 12px 15px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    gap: 9px;
    color: #B84C60;
    background: #FFF0F3;
    border: 1px solid #F5D8DF;
    font-size: 11px;
  }

  .admin-ai-stat-grid {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-top: 20px;
  }

  .admin-ai-stat-card {
    min-height: 125px;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-radius: 20px;
    background: white;
    border: 1px solid #ECECF4;
    box-shadow:
      0 8px 24px
      rgba(68,68,110,.035);
  }

  .admin-ai-stat-icon {
    width: 45px;
    height: 45px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
  }

  .admin-ai-stat-icon.purple {
    color: #7566EB;
    background: #F0EDFF;
  }

  .admin-ai-stat-icon.green {
    color: #42A17A;
    background: #ECFAF4;
  }

  .admin-ai-stat-icon.orange {
    color: #D98B46;
    background: #FFF4E8;
  }

  .admin-ai-stat-icon.blue {
    color: #5595DD;
    background: #EDF6FF;
  }

  .admin-ai-stat-card > div:last-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .admin-ai-stat-card span {
    color: #85899D;
    font-size: 11px;
  }

  .admin-ai-stat-card strong {
    margin: 2px 0;
    color: #2E3054;
    font-size: 25px;
  }

  .admin-ai-stat-card small {
    color: #A0A3B3;
    font-size: 10px;
    line-height: 1.4;
  }

  .admin-ai-secondary-stats {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 12px;
  }

  .admin-ai-secondary-stats > span {
    padding: 12px 15px;
    border-radius: 15px;
    color: #85889B;
    background: rgba(255,255,255,.72);
    border: 1px solid #ECECF4;
    font-size: 10.5px;
  }

  .admin-ai-secondary-stats strong {
    margin-right: 5px;
    color: #4B4D67;
  }

  .admin-ai-two-column {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 18px;
    margin-top: 18px;
  }

  .admin-ai-panel {
    padding: 21px;
    border-radius: 22px;
    background: white;
    border: 1px solid #ECECF4;
    box-shadow:
      0 8px 26px
      rgba(68,68,110,.035);
  }

  .admin-ai-panel-heading {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 18px;
  }

  .admin-ai-heading-icon {
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 12px;
  }

  .admin-ai-heading-icon.geography {
    color: #5595DD;
    background: #EDF6FF;
  }

  .admin-ai-heading-icon.cognition,
  .admin-ai-heading-icon.generated {
    color: #7566EB;
    background: #F0EDFF;
  }

  .admin-ai-heading-icon.trend,
  .admin-ai-heading-icon.recommendation {
    color: #48A784;
    background: #ECFAF4;
  }

  .admin-ai-heading-icon.early {
    color: #C066A7;
    background: #FFF0FA;
  }

  .admin-ai-panel-heading h2 {
    margin: 0;
    color: #353755;
    font-size: 15px;
  }

  .admin-ai-panel-heading p {
    margin: 3px 0 0;
    color: #A0A3B4;
    font-size: 10.5px;
    line-height: 1.45;
  }

  .admin-ai-panel-heading code {
    padding: 1px 4px;
    border-radius: 5px;
    color: #7465E8;
    background: #F3F0FF;
    font-size: 9px;
  }

  .admin-ai-region-list,
  .admin-ai-cognitive-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .admin-ai-region-row-top,
  .admin-ai-cognitive-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .admin-ai-region-row-top span,
  .admin-ai-cognitive-top strong {
    color: #53556C;
    font-size: 11.5px;
  }

  .admin-ai-region-row-top strong,
  .admin-ai-cognitive-top > span {
    color: #333552;
    font-size: 11.5px;
  }

  .admin-ai-track {
    height: 7px;
    margin-top: 7px;
    overflow: hidden;
    border-radius: 999px;
    background: #F0F1F6;
  }

  .admin-ai-track > div {
    height: 100%;
    border-radius: inherit;
    background:
      linear-gradient(
        90deg,
        #8A7BF2,
        #B87CDD
      );
  }

  .admin-ai-track.cognitive > div {
    background:
      linear-gradient(
        90deg,
        #7064E8,
        #9E7DEC
      );
  }

  .admin-ai-cognitive-top > div {
    display: flex;
    flex-direction: column;
  }

  .admin-ai-cognitive-top small {
    margin-top: 2px;
    color: #AAADBD;
    font-size: 9px;
    text-transform: capitalize;
  }

  .admin-ai-cognitive-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 13px;
    margin-top: 6px;
    color: #A1A4B3;
    font-size: 9px;
  }

  .admin-ai-trend-panel {
    margin-top: 18px;
  }

  .admin-ai-chart-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .admin-ai-chart {
    width: 100%;
    min-width: 570px;
    height: auto;
  }

  .admin-ai-early-grid {
    display: grid;
    grid-template-columns:
      repeat(5, minmax(0, 1fr));
    gap: 11px;
  }

  .admin-ai-early-card {
    padding: 14px;
    border-radius: 16px;
    border: 1px solid #ECECF4;
    background: #FCFCFE;
  }

  .admin-ai-early-card.needs_attention {
    background: #FFF9F4;
    border-color: #F7E4D3;
  }

  .admin-ai-early-card.positive {
    background: #F6FCF9;
    border-color: #DDEFE7;
  }

  .admin-ai-early-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .admin-ai-early-card-top strong {
    color: #494B64;
    font-size: 10.5px;
  }

  .admin-ai-early-card-top span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    color: #8C8FA2;
    font-size: 8.5px;
    text-transform: capitalize;
  }

  .admin-ai-early-card p {
    margin: 13px 0 0;
    color: #999CAD;
    font-size: 9px;
    line-height: 1.5;
  }

  .admin-ai-early-values {
    display: grid;
    grid-template-columns:
      repeat(3, 1fr);
    gap: 5px;
    margin-top: 14px;
  }

  .admin-ai-early-values div {
    display: flex;
    flex-direction: column;
  }

  .admin-ai-early-values span {
    color: #B0B2C0;
    font-size: 7.5px;
  }

  .admin-ai-early-values strong {
    margin-top: 2px;
    color: #53556D;
    font-size: 10px;
  }

  .admin-ai-insight-columns {
    align-items: start;
  }

  .admin-ai-summary {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 18px;
    padding: 14px;
    border-radius: 16px;
    color: #6558D7;
    background: #F5F2FF;
  }

  .admin-ai-summary svg {
    flex: 0 0 auto;
  }

  .admin-ai-summary p {
    margin: 0;
    color: #5D6075;
    font-size: 11px;
    line-height: 1.65;
  }

  .admin-ai-unavailable {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 15px;
    padding: 13px;
    border-radius: 14px;
    color: #B66B38;
    background: #FFF8F0;
    border: 1px solid #F6E4D3;
  }

  .admin-ai-unavailable strong {
    display: block;
    color: #8F5E38;
    font-size: 10.5px;
  }

  .admin-ai-unavailable p {
    margin: 3px 0 0;
    color: #A0785D;
    font-size: 9.5px;
    line-height: 1.5;
  }

  .admin-ai-insight-group +
  .admin-ai-insight-group {
    margin-top: 18px;
  }

  .admin-ai-insight-group h3 {
    margin: 0 0 9px;
    color: #6A6C80;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: .08em;
  }

  .admin-ai-insight-list {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .admin-ai-insight-item {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 11px 12px;
    border-radius: 13px;
    background: #FAFAFD;
    border: 1px solid #F0F0F5;
  }

  .admin-ai-insight-item > span {
    width: 7px;
    height: 7px;
    margin-top: 4px;
    flex: 0 0 auto;
    border-radius: 50%;
  }

  .admin-ai-insight-item.purple > span {
    background: #806FED;
  }

  .admin-ai-insight-item.orange > span {
    background: #E49A57;
  }

  .admin-ai-insight-item.green > span {
    background: #4BAA83;
  }

  .admin-ai-insight-item.blue > span {
    background: #5799DD;
  }

  .admin-ai-insight-item strong {
    display: block;
    color: #4A4C64;
    font-size: 10.5px;
  }

  .admin-ai-insight-item p {
    margin: 3px 0 0;
    color: #9699AA;
    font-size: 9.5px;
    line-height: 1.55;
  }

  .admin-ai-recommendation-list {
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .admin-ai-recommendation-card {
    position: relative;
    padding: 15px;
    border-radius: 16px;
    background: #FCFCFE;
    border: 1px solid #ECECF4;
  }

  .admin-ai-priority {
    position: absolute;
    right: 12px;
    top: 12px;
    padding: 4px 7px;
    border-radius: 999px;
    font-size: 7.5px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .admin-ai-priority.high {
    color: #B65D6E;
    background: #FFF0F3;
  }

  .admin-ai-priority.medium {
    color: #B47A3D;
    background: #FFF4E8;
  }

  .admin-ai-priority.low {
    color: #4F9275;
    background: #ECFAF4;
  }

  .admin-ai-recommendation-card > strong {
    display: block;
    padding-right: 50px;
    color: #4B4D65;
    font-size: 11px;
  }

  .admin-ai-recommendation-card p {
    margin: 6px 0 0;
    color: #9699AA;
    font-size: 9.5px;
    line-height: 1.6;
  }

  .admin-ai-methodology {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 18px;
    padding: 15px 17px;
    border-radius: 16px;
    color: #56856E;
    background: #F3FAF6;
    border: 1px solid #DFEFE6;
  }

  .admin-ai-methodology svg {
    flex: 0 0 auto;
  }

  .admin-ai-methodology strong {
    display: block;
    color: #4D765F;
    font-size: 10.5px;
  }

  .admin-ai-methodology p {
    margin: 3px 0 0;
    color: #718A7D;
    font-size: 9.5px;
    line-height: 1.6;
  }

  .admin-ai-empty {
    min-height: 120px;
    display: grid;
    place-items: center;
    color: #A2A5B5;
    font-size: 10.5px;
    text-align: center;
  }

  .admin-ai-loading,
  .admin-ai-error-page {
    min-height:
      calc(
        100vh - 150px
      );
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
    border-radius: 24px;
    background: white;
    border: 1px solid #ECECF4;
  }

  .admin-ai-loading-orb {
    width: 68px;
    height: 68px;
    display: grid;
    place-items: center;
    border-radius: 21px;
    color: #7565E8;
    background: #F0EDFF;
  }

  .admin-ai-loading h2,
  .admin-ai-error-page h2 {
    margin: 17px 0 7px;
    color: #383A58;
    font-size: 21px;
  }

  .admin-ai-loading p,
  .admin-ai-error-page p {
    max-width: 540px;
    margin: 0;
    color: #989BAC;
    font-size: 11.5px;
    line-height: 1.7;
  }

  .admin-ai-loading-line {
    width: 170px;
    height: 5px;
    margin-top: 22px;
    overflow: hidden;
    border-radius: 999px;
    background: #EEEAFD;
  }

  .admin-ai-loading-line::after {
    content: "";
    display: block;
    width: 45%;
    height: 100%;
    border-radius: inherit;
    background: #7969EE;
    animation:
      admin-ai-slide
      1s ease-in-out
      infinite alternate;
  }

  @keyframes admin-ai-slide {
    from {
      transform:
        translateX(0);
    }
    to {
      transform:
        translateX(120%);
    }
  }

  .admin-ai-error-page {
    color: #C1586B;
  }

  .admin-ai-error-page button {
    margin-top: 19px;
    height: 40px;
    padding: 0 17px;
    border: 0;
    border-radius: 13px;
    color: white;
    background: #7868ED;
    cursor: pointer;
    font-size: 10.5px;
    font-weight: 700;
  }

  @media (max-width: 1200px) {
    .admin-ai-stat-grid {
      grid-template-columns:
        repeat(2, 1fr);
    }

    .admin-ai-early-grid {
      grid-template-columns:
        repeat(3, 1fr);
    }
  }

  @media (max-width: 900px) {
    .admin-ai-hero {
      flex-direction: column;
    }

    .admin-ai-two-column,
    .admin-ai-secondary-stats {
      grid-template-columns:
        1fr;
    }

    .admin-ai-early-grid {
      grid-template-columns:
        repeat(2, 1fr);
    }
  }
`;
