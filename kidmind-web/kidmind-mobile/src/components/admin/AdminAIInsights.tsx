import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import Svg, {
  Circle,
  Line,
  Polyline,
  Text as SvgText,
} from "react-native-svg";

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
} from "lucide-react-native";

import {
  getAdminAIInsights,
  type AdminAIEarlySignal,
  type AdminAIInsightsData,
  type AdminAIRecommendation,
  type AdminAITrend,
  type AdminAITrendPoint,
} from "@/api/adminAiApi";


const clamp = (
  value: number,
  minimum: number,
  maximum: number
) =>
  Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );


const formatValue = (
  value: unknown
) => {
  const number =
    Number(value);

  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(
      number
    )
  ) {
    return "—";
  }

  return number
    .toLocaleString();
};


const scoreLabel = (
  value:
    | number
    | null
    | undefined
) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(
      Number(value)
    )
  ) {
    return "No data";
  }

  return `${Math.round(
    Number(value)
  )}%`;
};


function TrendChart({
  points,
}: {
  points:
    AdminAITrendPoint[];
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
          top: 18,
          bottom: 42,
        };

        const values =
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
          values.length === 0
        ) {
          return null;
        }

        const rawMin =
          Math.min(
            ...values
          );

        const rawMax =
          Math.max(
            ...values
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
          (index: number) =>
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
          (value: number) =>
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
              x:
                x(index),
              y:
                y(
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
      <EmptyBlock
        text="No completed scored sessions are available for the trend chart yet."
      />
    );
  }

  const gridValues = [
    chart.maximum,
    Math.round(
      (
        chart.maximum +
        chart.minimum
      ) /
        2
    ),
    chart.minimum,
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
    >
      <Svg
        width={
          chart.width
        }
        height={
          chart.height
        }
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
              <Fragment
                key={
                  value
                }
              >
                <Line
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
                  strokeWidth={1}
                />

                <SvgText
                  x={4}
                  y={
                    y + 4
                  }
                  fontSize={10}
                  fill="#9FA2B5"
                >
                  {value}
                </SvgText>
              </Fragment>
            );
          }
        )}

        <Polyline
          points={
            chart.polyline
          }
          fill="none"
          stroke="#7868EF"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {chart.coordinates.map(
          point => (
            <Fragment
              key={
                point.period
              }
            >
              <Circle
                cx={
                  point.x
                }
                cy={
                  point.y
                }
                r={5}
                fill="#FFFFFF"
                stroke="#7868EF"
                strokeWidth={3}
              />

              <SvgText
                x={
                  point.x
                }
                y={
                  chart.height -
                  14
                }
                textAnchor="middle"
                fontSize={10}
                fill="#8C8FA4"
              >
                {
                  point.label
                }
              </SvgText>
            </Fragment>
          )
        )}
      </Svg>
    </ScrollView>
  );
}


function EmptyBlock({
  text,
}: {
  text: string;
}) {
  return (
    <View
      style={
        styles.emptyBlock
      }
    >
      <Text
        style={
          styles.emptyText
        }
      >
        {text}
      </Text>
    </View>
  );
}


function InsightGroup({
  title,
  items,
  tone,
}: {
  title: string;
  items:
    AdminAITrend[];
  tone:
    | "purple"
    | "orange"
    | "green"
    | "blue";
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
    <View
      style={
        styles.insightGroup
      }
    >
      <Text
        style={
          styles.insightGroupTitle
        }
      >
        {title}
      </Text>

      {items.map(
        (
          item,
          index
        ) => (
          <View
            style={
              styles.insightItem
            }
            key={
              `${item.title}-${index}`
            }
          >
            <View
              style={[
                styles.insightDot,
                tone ===
                  "purple" &&
                  styles.dotPurple,
                tone ===
                  "orange" &&
                  styles.dotOrange,
                tone ===
                  "green" &&
                  styles.dotGreen,
                tone ===
                  "blue" &&
                  styles.dotBlue,
              ]}
            />

            <View
              style={
                styles.insightBody
              }
            >
              <Text
                style={
                  styles.insightTitle
                }
              >
                {
                  item.title
                }
              </Text>

              <Text
                style={
                  styles.insightText
                }
              >
                {
                  item.description
                }
              </Text>
            </View>
          </View>
        )
      )}
    </View>
  );
}


function RecommendationCard({
  item,
}: {
  item:
    AdminAIRecommendation;
}) {
  return (
    <View
      style={
        styles.recommendationCard
      }
    >
      <View
        style={[
          styles.priorityPill,
          item.priority ===
            "high" &&
            styles.priorityHigh,
          item.priority ===
            "medium" &&
            styles.priorityMedium,
          item.priority ===
            "low" &&
            styles.priorityLow,
        ]}
      >
        <Text
          style={[
            styles.priorityText,
            item.priority ===
              "high" &&
              styles.priorityHighText,
            item.priority ===
              "medium" &&
              styles.priorityMediumText,
            item.priority ===
              "low" &&
              styles.priorityLowText,
          ]}
        >
          {
            item.priority
              .toUpperCase()
          }
        </Text>
      </View>

      <Text
        style={
          styles.recommendationTitle
        }
      >
        {item.title}
      </Text>

      <Text
        style={
          styles.recommendationText
        }
      >
        {
          item.description
        }
      </Text>
    </View>
  );
}


function DirectionIcon({
  signal,
}: {
  signal:
    AdminAIEarlySignal;
}) {
  if (
    signal.direction ===
    "rising"
  ) {
    return (
      <ArrowUpRight
        size={15}
        color="#4A9C79"
      />
    );
  }

  if (
    signal.direction ===
    "declining"
  ) {
    return (
      <ArrowDownRight
        size={15}
        color="#C56D53"
      />
    );
  }

  return (
    <ArrowRight
      size={15}
      color="#8B8EA2"
    />
  );
}


export default function AdminAIInsights() {
  const [
    data,
    setData,
  ] =
    useState<
      AdminAIInsightsData |
      null
    >(null);

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

          setData(
            response
          );
        } catch (
          requestError: any
        ) {
          console.error(
            "Load Admin AI Insights error:",
            requestError
          );

          setError(
            requestError?.message ||
            "Unable to load Admin AI Insights."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
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
      <View
        style={
          styles.loadingCard
        }
      >
        <View
          style={
            styles.loadingIcon
          }
        >
          <BrainCircuit
            size={28}
            color="#7565E8"
          />
        </View>

        <ActivityIndicator
          size="small"
          color="#7565E8"
          style={
            styles.loadingSpinner
          }
        />

        <Text
          style={
            styles.loadingTitle
          }
        >
          Building platform insights
        </Text>

        <Text
          style={
            styles.loadingText
          }
        >
          KidMind calculates verified statistics first, then sends only aggregated data to Gemini.
        </Text>
      </View>
    );
  }

  if (
    !data
  ) {
    return (
      <View
        style={
          styles.loadingCard
        }
      >
        <AlertTriangle
          size={31}
          color="#C35C70"
        />

        <Text
          style={
            styles.loadingTitle
          }
        >
          Unable to load AI Insights
        </Text>

        <Text
          style={
            styles.loadingText
          }
        >
          {
            error ||
            "No Admin AI data was returned."
          }
        </Text>

        <Pressable
          style={
            styles.retryButton
          }
          onPress={() =>
            loadInsights()
          }
        >
          <Text
            style={
              styles.retryButtonText
            }
          >
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  const statistics =
    data.statistics;

  const totals =
    statistics.totals;

  const ai =
    data.ai;

  const regionMax =
    Math.max(
      1,
      ...statistics
        .childrenByRegion
        .map(
          item =>
            Number(
              item.count
            ) ||
            0
        )
    );

  const statCards = [
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
        )} therapists`,
      icon:
        UserRoundCog,
      tone:
        "blue",
    },
  ] as const;

  return (
    <View>
      <View
        style={
          styles.hero
        }
      >
        <View
          style={
            styles.heroTop
          }
        >
          <View
            style={
              styles.heroIcon
            }
          >
            <Sparkles
              size={24}
              color="#FFFFFF"
            />
          </View>

          <Pressable
            disabled={
              refreshing
            }
            style={
              styles.refreshButton
            }
            onPress={() =>
              loadInsights(
                true
              )
            }
          >
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <RefreshCw
                size={16}
                color="#FFFFFF"
              />
            )}

            <Text
              style={
                styles.refreshText
              }
            >
              Refresh
            </Text>
          </Pressable>
        </View>

        <Text
          style={
            styles.heroEyebrow
          }
        >
          PLATFORM-LEVEL AI
        </Text>

        <Text
          style={
            styles.heroTitle
          }
        >
          AI Insights
        </Text>

        <Text
          style={
            styles.heroText
          }
        >
          Verified KidMind statistics come from MySQL. Gemini receives only aggregated, de-identified platform data for interpretation and recommendations.
        </Text>
      </View>

      {error ? (
        <View
          style={
            styles.inlineError
          }
        >
          <AlertTriangle
            size={16}
            color="#B84C60"
          />

          <Text
            style={
              styles.inlineErrorText
            }
          >
            {error}
          </Text>
        </View>
      ) : null}

      <View
        style={
          styles.statsGrid
        }
      >
        {statCards.map(
          item => {
            const Icon =
              item.icon;

            return (
              <View
                key={
                  item.label
                }
                style={
                  styles.statCard
                }
              >
                <View
                  style={[
                    styles.statIcon,
                    item.tone ===
                      "purple" &&
                      styles.statPurple,
                    item.tone ===
                      "green" &&
                      styles.statGreen,
                    item.tone ===
                      "orange" &&
                      styles.statOrange,
                    item.tone ===
                      "blue" &&
                      styles.statBlue,
                  ]}
                >
                  <Icon
                    size={20}
                    color={
                      item.tone ===
                      "purple"
                        ? "#7566EB"
                        : item.tone ===
                          "green"
                          ? "#48A784"
                          : item.tone ===
                            "orange"
                            ? "#D98B46"
                            : "#5595DD"
                    }
                  />
                </View>

                <Text
                  style={
                    styles.statLabel
                  }
                >
                  {item.label}
                </Text>

                <Text
                  style={
                    styles.statValue
                  }
                >
                  {
                    formatValue(
                      item.value
                    )
                  }
                </Text>

                <Text
                  style={
                    styles.statSubtitle
                  }
                >
                  {
                    item.subtitle
                  }
                </Text>
              </View>
            );
          }
        )}
      </View>

      <View
        style={
          styles.secondaryStats
        }
      >
        <MiniStat
          value={
            totals.completedAssessmentSessions
          }
          label="Completed assessments"
        />

        <MiniStat
          value={
            totals.noClearImprovement
          }
          label="No clear improvement"
        />

        <MiniStat
          value={
            totals.childrenWithoutEnoughData
          }
          label="Not enough longitudinal data"
        />
      </View>

      <Section
        icon={
          <Globe2
            size={18}
            color="#5595DD"
          />
        }
        iconTone="blue"
        title="Children by Country / Region"
        subtitle="Uses the actual children.region field currently stored by KidMind."
      >
        {statistics
          .childrenByRegion
          .length === 0 ? (
          <EmptyBlock
            text="No geographic data is available yet."
          />
        ) : (
          <View
            style={
              styles.listGap
            }
          >
            {statistics
              .childrenByRegion
              .map(
                item => (
                  <View
                    key={
                      item.region
                    }
                  >
                    <View
                      style={
                        styles.rowBetween
                      }
                    >
                      <Text
                        style={
                          styles.rowLabel
                        }
                      >
                        {
                          item.region
                        }
                      </Text>

                      <Text
                        style={
                          styles.rowValue
                        }
                      >
                        {
                          formatValue(
                            item.count
                          )
                        }
                      </Text>
                    </View>

                    <ProgressBar
                      value={
                        Number(
                          item.count
                        ) /
                        regionMax
                      }
                    />
                  </View>
                )
              )}
          </View>
        )}
      </Section>

      <Section
        icon={
          <CircleGauge
            size={18}
            color="#7566EB"
          />
        }
        iconTone="purple"
        title="Cognitive Performance"
        subtitle="Uses the cognitive game mapping already present in KidMind."
      >
        <View
          style={
            styles.listGap
          }
        >
          {statistics
            .cognitivePerformance
            .map(
              item => (
                <View
                  key={
                    item.key
                  }
                  style={
                    styles.cognitiveRow
                  }
                >
                  <View
                    style={
                      styles.rowBetween
                    }
                  >
                    <View
                      style={
                        styles.flexOne
                      }
                    >
                      <Text
                        style={
                          styles.cognitiveTitle
                        }
                      >
                        {
                          item.label
                        }
                      </Text>

                      <Text
                        style={
                          styles.cognitiveGame
                        }
                      >
                        {
                          item.gameName
                        }
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.rowValue
                      }
                    >
                      {
                        scoreLabel(
                          item.averageScore
                        )
                      }
                    </Text>
                  </View>

                  <ProgressBar
                    value={
                      item.averageScore ===
                        null
                        ? 0
                        : Number(
                            item.averageScore
                          ) /
                          100
                    }
                  />

                  <View
                    style={
                      styles.cognitiveMeta
                    }
                  >
                    <Text
                      style={
                        styles.metaText
                      }
                    >
                      {
                        formatValue(
                          item.assessments
                        )
                      } assessments
                    </Text>

                    <Text
                      style={
                        styles.metaText
                      }
                    >
                      {
                        formatValue(
                          item.children
                        )
                      } children
                    </Text>

                    <Text
                      style={
                        styles.metaText
                      }
                    >
                      Accuracy: {
                        scoreLabel(
                          item.averageAccuracy
                        )
                      }
                    </Text>
                  </View>
                </View>
              )
            )}
        </View>
      </Section>

      <Section
        icon={
          <TrendingUp
            size={18}
            color="#48A784"
          />
        }
        iconTone="green"
        title="Improvement Trends"
        subtitle="Average score from completed or ended assessment sessions over time."
      >
        <TrendChart
          points={
            statistics
              .improvementTrend
          }
        />
      </Section>

      <Section
        icon={
          <BrainCircuit
            size={18}
            color="#C066A7"
          />
        }
        iconTone="pink"
        title="Early Trend Detection"
        subtitle="Backend signals compare the latest two available periods for each real KidMind domain."
      >
        <View
          style={
            styles.earlyGrid
          }
        >
          {statistics
            .earlyTrendSignals
            .map(
              signal => (
                <View
                  key={
                    signal.key
                  }
                  style={[
                    styles.earlyCard,
                    signal.attentionLevel ===
                      "positive" &&
                      styles.earlyPositive,
                    signal.attentionLevel ===
                      "needs_attention" &&
                      styles.earlyNeedsAttention,
                  ]}
                >
                  <View
                    style={
                      styles.rowBetween
                    }
                  >
                    <Text
                      style={
                        styles.earlyTitle
                      }
                    >
                      {
                        signal.label
                      }
                    </Text>

                    <View
                      style={
                        styles.direction
                      }
                    >
                      <DirectionIcon
                        signal={
                          signal
                        }
                      />

                      <Text
                        style={
                          styles.directionText
                        }
                      >
                        {
                          signal.direction
                            .replace(
                              "_",
                              " "
                            )
                        }
                      </Text>
                    </View>
                  </View>

                  {signal.direction ===
                    "insufficient_data" ? (
                    <Text
                      style={
                        styles.earlyEmpty
                      }
                    >
                      Not enough period-to-period data is available yet.
                    </Text>
                  ) : (
                    <View
                      style={
                        styles.earlyValues
                      }
                    >
                      <SmallValue
                        label="Previous"
                        value={
                          scoreLabel(
                            signal.previousAverage
                          )
                        }
                      />

                      <SmallValue
                        label="Current"
                        value={
                          scoreLabel(
                            signal.currentAverage
                          )
                        }
                      />

                      <SmallValue
                        label="Change"
                        value={
                          signal.delta ===
                            null
                            ? "—"
                            : `${
                                signal.delta >
                                0
                                  ? "+"
                                  : ""
                              }${signal.delta}`
                        }
                      />
                    </View>
                  )}
                </View>
              )
            )}
        </View>
      </Section>

      <Section
        icon={
          <Sparkles
            size={18}
            color="#7566EB"
          />
        }
        iconTone="purple"
        title="AI Platform Insights"
        subtitle="Gemini interprets aggregated statistics only; verified numbers stay backend-owned."
      >
        {!ai.available ? (
          <View
            style={
              styles.aiUnavailable
            }
          >
            <AlertTriangle
              size={17}
              color="#B66B38"
            />

            <View
              style={
                styles.flexOne
              }
            >
              <Text
                style={
                  styles.aiUnavailableTitle
                }
              >
                AI interpretation unavailable
              </Text>

              <Text
                style={
                  styles.aiUnavailableText
                }
              >
                {
                  ai.error ||
                  ai.summary
                }
              </Text>
            </View>
          </View>
        ) : null}

        {ai.summary ? (
          <View
            style={
              styles.aiSummary
            }
          >
            <BrainCircuit
              size={19}
              color="#6A5CDC"
            />

            <Text
              style={
                styles.aiSummaryText
              }
            >
              {ai.summary}
            </Text>
          </View>
        ) : null}

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
      </Section>

      <Section
        icon={
          <Lightbulb
            size={18}
            color="#48A784"
          />
        }
        iconTone="green"
        title="AI Recommendations"
        subtitle="Administrative actions only — not medical or diagnostic advice."
      >
        {ai.recommendations
          .length === 0 ? (
          <EmptyBlock
            text="No AI recommendations are available yet."
          />
        ) : (
          <View
            style={
              styles.listGap
            }
          >
            {ai.recommendations.map(
              (
                item,
                index
              ) => (
                <RecommendationCard
                  item={item}
                  key={
                    `${item.title}-${index}`
                  }
                />
              )
            )}
          </View>
        )}
      </Section>

      <View
        style={
          styles.integrityBox
        }
      >
        <CheckCircle2
          size={17}
          color="#56856E"
        />

        <View
          style={
            styles.flexOne
          }
        >
          <Text
            style={
              styles.integrityTitle
            }
          >
            Data integrity rules
          </Text>

          <Text
            style={
              styles.integrityText
            }
          >
            Core counts, scores, classifications, region totals, cognitive averages, and early trend signals come from MySQL/Backend. Gemini cannot replace those verified values.
          </Text>
        </View>
      </View>
    </View>
  );
}


function Section({
  icon,
  iconTone,
  title,
  subtitle,
  children,
}: {
  icon:
    ReactNode;
  iconTone:
    | "purple"
    | "green"
    | "blue"
    | "pink";
  title: string;
  subtitle: string;
  children:
    ReactNode;
}) {
  return (
    <View
      style={
        styles.section
      }
    >
      <View
        style={
          styles.sectionHeading
        }
      >
        <View
          style={[
            styles.sectionIcon,
            iconTone ===
              "purple" &&
              styles.sectionPurple,
            iconTone ===
              "green" &&
              styles.sectionGreen,
            iconTone ===
              "blue" &&
              styles.sectionBlue,
            iconTone ===
              "pink" &&
              styles.sectionPink,
          ]}
        >
          {icon}
        </View>

        <View
          style={
            styles.flexOne
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {title}
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            {subtitle}
          </Text>
        </View>
      </View>

      {children}
    </View>
  );
}


function ProgressBar({
  value,
}: {
  value: number;
}) {
  return (
    <View
      style={
        styles.track
      }
    >
      <View
        style={[
          styles.trackFill,
          {
            width:
              `${clamp(
                value,
                0,
                1
              ) * 100}%`,
          },
        ]}
      />
    </View>
  );
}


function MiniStat({
  value,
  label,
}: {
  value: unknown;
  label: string;
}) {
  return (
    <View
      style={
        styles.miniStat
      }
    >
      <Text
        style={
          styles.miniValue
        }
      >
        {
          formatValue(
            value
          )
        }
      </Text>

      <Text
        style={
          styles.miniLabel
        }
      >
        {label}
      </Text>
    </View>
  );
}


function SmallValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={
        styles.smallValue
      }
    >
      <Text
        style={
          styles.smallValueLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.smallValueNumber
        }
      >
        {value}
      </Text>
    </View>
  );
}


const styles =
  StyleSheet.create({
    hero: {
      padding: 20,
      borderRadius: 22,
      backgroundColor:
        "#7C6CFF",
      marginBottom: 15,
    },

    heroTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 15,
    },

    heroIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "rgba(255,255,255,.15)",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,.18)",
    },

    refreshButton: {
      minHeight: 38,
      paddingHorizontal: 12,
      borderRadius: 12,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
      backgroundColor:
        "rgba(255,255,255,.14)",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,.20)",
    },

    refreshText: {
      fontSize: 10,
      fontWeight:
        "800",
      color:
        "#FFFFFF",
    },

    heroEyebrow: {
      fontSize: 9.5,
      letterSpacing: 1.2,
      fontWeight:
        "800",
      color:
        "rgba(255,255,255,.75)",
    },

    heroTitle: {
      marginTop: 5,
      fontSize: 27,
      fontWeight:
        "800",
      color:
        "#FFFFFF",
    },

    heroText: {
      marginTop: 7,
      fontSize: 11.5,
      lineHeight: 18,
      color:
        "rgba(255,255,255,.84)",
    },

    inlineError: {
      padding: 12,
      borderRadius: 13,
      marginBottom: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
      backgroundColor:
        "#FFF0F3",
      borderWidth: 1,
      borderColor:
        "#F5D8DF",
    },

    inlineErrorText: {
      flex: 1,
      fontSize: 10,
      color:
        "#B84C60",
    },

    statsGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 10,
      marginBottom: 10,
    },

    statCard: {
      width: "48%",
      minHeight: 132,
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#ECECF4",
    },

    statIcon: {
      width: 39,
      height: 39,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom: 10,
    },

    statPurple: {
      backgroundColor:
        "#F0EDFF",
    },

    statGreen: {
      backgroundColor:
        "#ECFAF4",
    },

    statOrange: {
      backgroundColor:
        "#FFF4E8",
    },

    statBlue: {
      backgroundColor:
        "#EDF6FF",
    },

    statLabel: {
      fontSize: 9.5,
      color:
        "#85899D",
    },

    statValue: {
      marginTop: 2,
      fontSize: 23,
      fontWeight:
        "800",
      color:
        "#2E3054",
    },

    statSubtitle: {
      marginTop: 2,
      fontSize: 8.5,
      lineHeight: 12,
      color:
        "#A0A3B3",
    },

    secondaryStats: {
      gap: 7,
      marginBottom: 14,
    },

    miniStat: {
      minHeight: 53,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#ECECF4",
    },

    miniValue: {
      fontSize: 15,
      fontWeight:
        "800",
      color:
        "#4B4D67",
    },

    miniLabel: {
      flex: 1,
      fontSize: 9.5,
      color:
        "#8D90A3",
    },

    section: {
      padding: 17,
      borderRadius: 20,
      marginBottom: 14,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#ECECF4",
    },

    sectionHeading: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
      marginBottom: 16,
    },

    sectionIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    sectionPurple: {
      backgroundColor:
        "#F0EDFF",
    },

    sectionGreen: {
      backgroundColor:
        "#ECFAF4",
    },

    sectionBlue: {
      backgroundColor:
        "#EDF6FF",
    },

    sectionPink: {
      backgroundColor:
        "#FFF0FA",
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight:
        "800",
      color:
        "#353755",
    },

    sectionSubtitle: {
      marginTop: 3,
      fontSize: 9,
      lineHeight: 13,
      color:
        "#A0A3B4",
    },

    listGap: {
      gap: 13,
    },

    rowBetween: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 9,
    },

    rowLabel: {
      flex: 1,
      fontSize: 10.5,
      color:
        "#53556C",
    },

    rowValue: {
      fontSize: 10.5,
      fontWeight:
        "800",
      color:
        "#333552",
    },

    track: {
      height: 7,
      marginTop: 7,
      overflow: "hidden",
      borderRadius: 999,
      backgroundColor:
        "#F0F1F6",
    },

    trackFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor:
        "#7C6CFF",
    },

    cognitiveRow: {
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F1F5",
    },

    cognitiveTitle: {
      fontSize: 10.5,
      fontWeight:
        "700",
      color:
        "#53556C",
    },

    cognitiveGame: {
      marginTop: 2,
      fontSize: 8,
      color:
        "#AAADBD",
      textTransform:
        "capitalize",
    },

    cognitiveMeta: {
      flexDirection:
        "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 6,
    },

    metaText: {
      fontSize: 8,
      color:
        "#A1A4B3",
    },

    flexOne: {
      flex: 1,
    },

    earlyGrid: {
      gap: 9,
    },

    earlyCard: {
      padding: 13,
      borderRadius: 15,
      backgroundColor:
        "#FCFCFE",
      borderWidth: 1,
      borderColor:
        "#ECECF4",
    },

    earlyPositive: {
      backgroundColor:
        "#F6FCF9",
      borderColor:
        "#DDEFE7",
    },

    earlyNeedsAttention: {
      backgroundColor:
        "#FFF9F4",
      borderColor:
        "#F7E4D3",
    },

    earlyTitle: {
      flex: 1,
      fontSize: 10.5,
      fontWeight:
        "700",
      color:
        "#494B64",
    },

    direction: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 3,
    },

    directionText: {
      fontSize: 8,
      color:
        "#8C8FA2",
      textTransform:
        "capitalize",
    },

    earlyValues: {
      flexDirection:
        "row",
      marginTop: 13,
      gap: 7,
    },

    smallValue: {
      flex: 1,
      padding: 8,
      borderRadius: 11,
      backgroundColor:
        "rgba(255,255,255,.70)",
    },

    smallValueLabel: {
      fontSize: 7.5,
      color:
        "#B0B2C0",
    },

    smallValueNumber: {
      marginTop: 2,
      fontSize: 10.5,
      fontWeight:
        "800",
      color:
        "#53556D",
    },

    earlyEmpty: {
      marginTop: 11,
      fontSize: 9,
      lineHeight: 14,
      color:
        "#999CAD",
    },

    aiUnavailable: {
      padding: 12,
      borderRadius: 13,
      flexDirection:
        "row",
      gap: 8,
      marginBottom: 12,
      backgroundColor:
        "#FFF8F0",
      borderWidth: 1,
      borderColor:
        "#F6E4D3",
    },

    aiUnavailableTitle: {
      fontSize: 9.5,
      fontWeight:
        "800",
      color:
        "#8F5E38",
    },

    aiUnavailableText: {
      marginTop: 3,
      fontSize: 8.5,
      lineHeight: 13,
      color:
        "#A0785D",
    },

    aiSummary: {
      padding: 13,
      borderRadius: 14,
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 8,
      marginBottom: 14,
      backgroundColor:
        "#F5F2FF",
    },

    aiSummaryText: {
      flex: 1,
      fontSize: 9.5,
      lineHeight: 15,
      color:
        "#5D6075",
    },

    insightGroup: {
      marginTop: 14,
    },

    insightGroupTitle: {
      marginBottom: 8,
      fontSize: 9,
      fontWeight:
        "800",
      letterSpacing: .8,
      color:
        "#6A6C80",
      textTransform:
        "uppercase",
    },

    insightItem: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 8,
      padding: 11,
      borderRadius: 13,
      marginBottom: 7,
      backgroundColor:
        "#FAFAFD",
      borderWidth: 1,
      borderColor:
        "#F0F0F5",
    },

    insightDot: {
      width: 7,
      height: 7,
      borderRadius: 7,
      marginTop: 4,
    },

    dotPurple: {
      backgroundColor:
        "#806FED",
    },

    dotOrange: {
      backgroundColor:
        "#E49A57",
    },

    dotGreen: {
      backgroundColor:
        "#4BAA83",
    },

    dotBlue: {
      backgroundColor:
        "#5799DD",
    },

    insightBody: {
      flex: 1,
    },

    insightTitle: {
      fontSize: 9.5,
      fontWeight:
        "800",
      color:
        "#4A4C64",
    },

    insightText: {
      marginTop: 3,
      fontSize: 8.5,
      lineHeight: 13,
      color:
        "#9699AA",
    },

    recommendationCard: {
      position: "relative",
      padding: 13,
      borderRadius: 15,
      backgroundColor:
        "#FCFCFE",
      borderWidth: 1,
      borderColor:
        "#ECECF4",
    },

    priorityPill: {
      alignSelf:
        "flex-start",
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 999,
      marginBottom: 8,
    },

    priorityHigh: {
      backgroundColor:
        "#FFF0F3",
    },

    priorityMedium: {
      backgroundColor:
        "#FFF4E8",
    },

    priorityLow: {
      backgroundColor:
        "#ECFAF4",
    },

    priorityText: {
      fontSize: 7,
      fontWeight:
        "800",
    },

    priorityHighText: {
      color:
        "#B65D6E",
    },

    priorityMediumText: {
      color:
        "#B47A3D",
    },

    priorityLowText: {
      color:
        "#4F9275",
    },

    recommendationTitle: {
      fontSize: 10.5,
      fontWeight:
        "800",
      color:
        "#4B4D65",
    },

    recommendationText: {
      marginTop: 5,
      fontSize: 8.8,
      lineHeight: 14,
      color:
        "#9699AA",
    },

    integrityBox: {
      padding: 14,
      borderRadius: 15,
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 8,
      marginBottom: 10,
      backgroundColor:
        "#F3FAF6",
      borderWidth: 1,
      borderColor:
        "#DFEFE6",
    },

    integrityTitle: {
      fontSize: 9.5,
      fontWeight:
        "800",
      color:
        "#4D765F",
    },

    integrityText: {
      marginTop: 3,
      fontSize: 8.5,
      lineHeight: 13,
      color:
        "#718A7D",
    },

    emptyBlock: {
      minHeight: 100,
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 16,
    },

    emptyText: {
      fontSize: 9.5,
      lineHeight: 14,
      color:
        "#A2A5B5",
      textAlign:
        "center",
    },

    loadingCard: {
      minHeight: 380,
      padding: 28,
      borderRadius: 22,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#ECECF4",
    },

    loadingIcon: {
      width: 62,
      height: 62,
      borderRadius: 19,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F0EDFF",
    },

    loadingSpinner: {
      marginTop: 16,
    },

    loadingTitle: {
      marginTop: 13,
      fontSize: 17,
      fontWeight:
        "800",
      color:
        "#383A58",
      textAlign:
        "center",
    },

    loadingText: {
      marginTop: 6,
      fontSize: 10,
      lineHeight: 16,
      color:
        "#989BAC",
      textAlign:
        "center",
    },

    retryButton: {
      minHeight: 40,
      marginTop: 17,
      paddingHorizontal: 17,
      borderRadius: 13,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#7868ED",
    },

    retryButtonText: {
      fontSize: 10,
      fontWeight:
        "800",
      color:
        "#FFFFFF",
    },
  });
