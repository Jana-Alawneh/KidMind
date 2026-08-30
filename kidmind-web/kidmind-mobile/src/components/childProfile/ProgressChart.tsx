import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import {
  TrendingUp,
} from "lucide-react-native";

import Svg, {
  Circle,
  Line,
  Path,
  Text as SvgText,
} from "react-native-svg";

import Card from "../ui/Card";

import {
  getSessions,
} from "@/api/sessionsApi";

import type {
  Session,
} from "@/api/sessionsApi";


type ProgressPoint = {
  session: string;
  sessionId: number;
  attention: number | null;
  memory: number | null;
  visualSpatial: number | null;
  reading: number | null;
  processingSpeed: number | null;
  overall: number | null;
  timestamp: number;
};


type DomainKey =
  | "attention"
  | "memory"
  | "visualSpatial"
  | "reading"
  | "processingSpeed";


const series: {
  key: DomainKey;
  label: string;
  color: string;
}[] = [
  {
    key: "attention",
    label: "Attention",
    color: "#63B3ED",
  },
  {
    key: "memory",
    label: "Working Memory",
    color: "#48BB78",
  },
  {
    key: "visualSpatial",
    label: "Visual-Spatial",
    color: "#F6AD55",
  },
  {
    key: "reading",
    label: "Reading",
    color: "#F56565",
  },
  {
    key: "processingSpeed",
    label: "Processing Speed",
    color: "#38BDF8",
  },
];


const gameDomainMap: Record<
  string,
  DomainKey
> = {
  "focus finder":
    "attention",

  "memory match":
    "memory",

  "puzzle path":
    "visualSpatial",

  "reading adventure":
    "reading",

  "quick match":
    "processingSpeed",
};


const normalizeGameName = (
  value: unknown
) => {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

};


const getSessionTimestamp = (
  session: Session
) => {

  const value =
    session.ended_at ||
    session.started_at ||
    session.created_at;


  if (!value) {
    return 0;
  }


  const timestamp =
    new Date(
      String(value).replace(
        " ",
        "T"
      )
    ).getTime();


  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : 0;

};


const getAverage = (
  values: number[]
) => {

  if (
    values.length ===
    0
  ) {
    return null;
  }


  return Math.round(
    values.reduce(
      (
        total,
        value
      ) =>
        total +
        value,
      0
    ) /
      values.length
  );

};


const buildSessionPoint = (
  session: Session
): ProgressPoint => {

  const values: Record<
    DomainKey,
    number[]
  > = {
    attention: [],
    memory: [],
    visualSpatial: [],
    reading: [],
    processingSpeed: [],
  };


  if (
    Array.isArray(
      session.games
    )
  ) {

    session.games.forEach(
      (game) => {

        const isFinished =
          game.status ===
            "Completed" ||
          game.status ===
            "Failed";


        if (!isFinished) {
          return;
        }


        const domain =
          gameDomainMap[
            normalizeGameName(
              game.game_name
            )
          ];


        if (!domain) {
          return;
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
          return;
        }


        values[
          domain
        ].push(
          Math.max(
            0,
            Math.min(
              100,
              score
            )
          )
        );

      }
    );

  }


  const attention =
    getAverage(
      values.attention
    );


  const memory =
    getAverage(
      values.memory
    );


  const visualSpatial =
    getAverage(
      values.visualSpatial
    );


  const reading =
    getAverage(
      values.reading
    );


  const processingSpeed =
    getAverage(
      values.processingSpeed
    );


  const availableScores = [
    attention,
    memory,
    visualSpatial,
    reading,
    processingSpeed,
  ].filter(
    (
      value
    ): value is number =>
      typeof value ===
        "number" &&
      Number.isFinite(
        value
      )
  );


  const overall =
    availableScores.length >
    0
      ? Math.round(
          availableScores.reduce(
            (
              total,
              value
            ) =>
              total +
              value,
            0
          ) /
            availableScores.length
        )
      : null;


  return {
    session:
      `#${session.id}`,

    sessionId:
      Number(
        session.id
      ),

    attention,
    memory,
    visualSpatial,
    reading,
    processingSpeed,
    overall,

    timestamp:
      getSessionTimestamp(
        session
      ),
  };

};


const getTrend = (
  data: ProgressPoint[]
) => {

  const scored =
    data.filter(
      (item) =>
        typeof item.overall ===
          "number" &&
        Number.isFinite(
          item.overall
        )
    );


  if (
    scored.length <
    2
  ) {
    return {
      label:
        "Not enough data",

      backgroundColor:
        "#F5F5F8",

      textColor:
        "#777A8F",
    };
  }


  const first =
    scored[0]
      .overall as number;


  const last =
    scored[
      scored.length - 1
    ].overall as number;


  const difference =
    last -
    first;


  if (
    difference >
    2
  ) {
    return {
      label:
        "Improving",

      backgroundColor:
        "#ECFAF4",

      textColor:
        "#3E9E7D",
    };
  }


  if (
    difference <
    -2
  ) {
    return {
      label:
        "Declining",

      backgroundColor:
        "#FFF0F3",

      textColor:
        "#C4556C",
    };
  }


  return {
    label:
      "Stable",

    backgroundColor:
      "#F3F0FF",

    textColor:
      "#7566EB",
  };

};


export default function ProgressChart() {

  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();


  const idValue =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;


  const childId =
    Number(
      idValue
    );


  const [
    data,
    setData,
  ] =
    useState<ProgressPoint[]>(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    chartWidth,
    setChartWidth,
  ] =
    useState(320);


  const loadProgress =
    useCallback(
      async () => {

        if (
          !Number.isInteger(
            childId
          ) ||
          childId <=
            0
        ) {

          setData(
            []
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


          const sessions =
            await getSessions();


          const progress =
            sessions
              .filter(
                (session) =>
                  Number(
                    session.child_id
                  ) ===
                    childId &&
                  session.status ===
                    "Completed"
              )
              .map(
                buildSessionPoint
              )
              .filter(
                (item) =>
                  typeof item.overall ===
                    "number"
              )
              .sort(
                (
                  first,
                  second
                ) =>
                  first.timestamp -
                  second.timestamp
              )
              .slice(
                -6
              );


          setData(
            progress
          );

        } catch (
          loadError
        ) {

          console.error(
            "Failed to load progress:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load cognitive progress"
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      [
        childId,
      ]
    );


  useFocusEffect(
    useCallback(
      () => {

        void loadProgress();

      },
      [
        loadProgress,
      ]
    )
  );


  const trend =
    useMemo(
      () =>
        getTrend(
          data
        ),
      [
        data,
      ]
    );


  const chartHeight =
    260;


  const leftPadding =
    34;


  const rightPadding =
    10;


  const topPadding =
    15;


  const bottomPadding =
    34;


  const plotWidth =
    Math.max(
      1,
      chartWidth -
        leftPadding -
        rightPadding
    );


  const plotHeight =
    chartHeight -
    topPadding -
    bottomPadding;


  const getX = (
    index: number
  ) => {

    if (
      data.length <=
      1
    ) {

      return (
        leftPadding +
        plotWidth / 2
      );

    }


    return (
      leftPadding +
      (
        index /
        (
          data.length -
          1
        )
      ) *
        plotWidth
    );

  };


  const getY = (
    value: number
  ) => {

    return (
      topPadding +
      (
        (
          100 -
          value
        ) /
        100
      ) *
        plotHeight
    );

  };


  const getPath = (
    key: DomainKey
  ) => {

    const points =
      data
        .map(
          (
            item,
            index
          ) => {

            const value =
              item[key];


            if (
              typeof value !==
                "number" ||
              !Number.isFinite(
                value
              )
            ) {
              return null;
            }


            return {
              x:
                getX(
                  index
                ),

              y:
                getY(
                  value
                ),
            };

          }
        )
        .filter(
          (
            point
          ): point is {
            x: number;
            y: number;
          } =>
            point !==
            null
        );


    if (
      points.length ===
      0
    ) {
      return "";
    }


    return points
      .map(
        (
          point,
          index
        ) =>
          `${
            index === 0
              ? "M"
              : "L"
          } ${point.x} ${point.y}`
      )
      .join(" ");

  };


  return (

    <Card>

      <View
        style={
          styles.header
        }
      >

        <View
          style={
            styles.headingGroup
          }
        >

          <View
            style={
              styles.headerIcon
            }
          >

            <TrendingUp
              size={18}
              color="#7566EB"
            />

          </View>


          <View
            style={
              styles.headerText
            }
          >

            <Text
              style={
                styles.title
              }
            >
              Cognitive Progress
            </Text>


            <Text
              style={
                styles.subtitle
              }
            >
              Last 6 completed assessment sessions
            </Text>

          </View>

        </View>


        {!loading &&
          !error &&
          data.length >
            0 && (

          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  trend.backgroundColor,
              },
            ]}
          >

            <Text
              style={[
                styles.badgeText,
                {
                  color:
                    trend.textColor,
                },
              ]}
            >
              {trend.label}
            </Text>

          </View>

        )}

      </View>


      <View
        style={
          styles.divider
        }
      />


      {loading && (

        <View
          style={
            styles.loadingBox
          }
        >

          <ActivityIndicator
            size="small"
            color="#7B6EF6"
          />


          <Text
            style={
              styles.loadingText
            }
          >
            Loading progress...
          </Text>

        </View>

      )}


      {!loading &&
        error && (

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
            Unable to load progress
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
        data.length ===
          0 && (

        <View
          style={
            styles.emptyBox
          }
        >

          <Text
            style={
              styles.emptyTitle
            }
          >
            No progress data yet
          </Text>


          <Text
            style={
              styles.emptyText
            }
          >
            Completed assessment sessions will appear here.
          </Text>

        </View>

      )}


      {!loading &&
        !error &&
        data.length >
          0 && (

        <>

          <View
            style={
              styles.chartShell
            }
          >

            <View
              style={
                styles.chartContainer
              }
              onLayout={(
                event
              ) => {

                const width =
                  event.nativeEvent
                    .layout.width;


                if (
                  width >
                  0
                ) {

                  setChartWidth(
                    width
                  );

                }

              }}
            >

              <Svg
                width={
                  chartWidth
                }
                height={
                  chartHeight
                }
              >

                {[
                  0,
                  25,
                  50,
                  75,
                  100,
                ].map(
                  (
                    value
                  ) => {

                    const y =
                      getY(
                        value
                      );


                    return (

                      <Line
                        key={
                          `line-${value}`
                        }
                        x1={
                          leftPadding
                        }
                        y1={
                          y
                        }
                        x2={
                          chartWidth -
                          rightPadding
                        }
                        y2={
                          y
                        }
                        stroke="#ECECF3"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                      />

                    );

                  }
                )}


                {[
                  0,
                  25,
                  50,
                  75,
                  100,
                ].map(
                  (
                    value
                  ) => {

                    const y =
                      getY(
                        value
                      );


                    return (

                      <SvgText
                        key={
                          `label-${value}`
                        }
                        x={2}
                        y={
                          y +
                          3
                        }
                        fontSize="8"
                        fill="#999CAD"
                      >
                        {value}
                      </SvgText>

                    );

                  }
                )}


                {series.map(
                  (
                    item
                  ) => {

                    const path =
                      getPath(
                        item.key
                      );


                    if (!path) {
                      return null;
                    }


                    return (

                      <Path
                        key={
                          item.key
                        }
                        d={
                          path
                        }
                        fill="none"
                        stroke={
                          item.color
                        }
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                    );

                  }
                )}


                {series.flatMap(
                  (
                    item
                  ) =>
                    data.map(
                      (
                        point,
                        index
                      ) => {

                        const value =
                          point[
                            item.key
                          ];


                        if (
                          typeof value !==
                            "number" ||
                          !Number.isFinite(
                            value
                          )
                        ) {
                          return null;
                        }


                        return (

                          <Circle
                            key={
                              `${item.key}-${point.sessionId}`
                            }
                            cx={
                              getX(
                                index
                              )
                            }
                            cy={
                              getY(
                                value
                              )
                            }
                            r={3}
                            fill="#FFFFFF"
                            stroke={
                              item.color
                            }
                            strokeWidth={2}
                          />

                        );

                      }
                    )
                )}


                {data.map(
                  (
                    point,
                    index
                  ) => (

                    <SvgText
                      key={
                        point.sessionId
                      }
                      x={
                        getX(
                          index
                        )
                      }
                      y={
                        chartHeight -
                        9
                      }
                      fontSize="8"
                      fill="#8E91A4"
                      textAnchor="middle"
                    >
                      {point.session}
                    </SvgText>

                  )
                )}

              </Svg>

            </View>

          </View>


          <View
            style={
              styles.legend
            }
          >

            {series.map(
              (
                item
              ) => {

                const hasData =
                  data.some(
                    (
                      point
                    ) =>
                      typeof point[
                        item.key
                      ] ===
                        "number"
                  );


                return (

                  <View
                    key={
                      item.key
                    }
                    style={[
                      styles.legendItem,

                      !hasData
                        ? styles.legendItemDisabled
                        : null,
                    ]}
                  >

                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor:
                            item.color,
                        },
                      ]}
                    />


                    <Text
                      style={[
                        styles.legendText,

                        !hasData
                          ? styles.legendTextDisabled
                          : null,
                      ]}
                    >
                      {item.label}
                    </Text>

                  </View>

                );

              }
            )}

          </View>

        </>

      )}

    </Card>

  );

}


const styles =
  StyleSheet.create({

    header: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "flex-start",

      gap:
        8,

    },


    headingGroup: {

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


    headerIcon: {

      width:
        39,

      height:
        39,

      flexShrink:
        0,

      borderRadius:
        12,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F0EDFF",

    },


    headerText: {

      flex:
        1,

      minWidth:
        0,

    },


    title: {

      color:
        "#333554",

      fontSize:
        15,

      fontWeight:
        "700",

    },


    subtitle: {

      marginTop:
        3,

      color:
        "#A0A3B4",

      fontSize:
        9.5,

      lineHeight:
        14,

    },


    badge: {

      maxWidth:
        88,

      paddingHorizontal:
        8,

      paddingVertical:
        6,

      borderRadius:
        9,

    },


    badgeText: {

      fontSize:
        8,

      fontWeight:
        "700",

      textAlign:
        "center",

    },


    divider: {

      height:
        1,

      marginTop:
        14,

      backgroundColor:
        "#F0F0F5",

    },


    loadingBox: {

      minHeight:
        220,

      justifyContent:
        "center",

      alignItems:
        "center",

      gap:
        9,

    },


    loadingText: {

      color:
        "#A0A3B4",

      fontSize:
        10,

    },


    errorBox: {

      minHeight:
        170,

      marginTop:
        14,

      justifyContent:
        "center",

      alignItems:
        "center",

      padding:
        14,

      borderRadius:
        14,

      backgroundColor:
        "#FFF0F3",

      borderWidth:
        1,

      borderColor:
        "#F6D8DF",

    },


    errorTitle: {

      color:
        "#B9415E",

      fontSize:
        11,

      fontWeight:
        "700",

      textAlign:
        "center",

    },


    errorText: {

      marginTop:
        4,

      color:
        "#C55A70",

      fontSize:
        9.5,

      textAlign:
        "center",

    },


    emptyBox: {

      minHeight:
        200,

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    emptyTitle: {

      color:
        "#55586D",

      fontSize:
        12,

      fontWeight:
        "700",

    },


    emptyText: {

      marginTop:
        5,

      maxWidth:
        230,

      color:
        "#A0A3B4",

      fontSize:
        9.5,

      lineHeight:
        15,

      textAlign:
        "center",

    },


    chartShell: {

      marginTop:
        14,

      borderRadius:
        14,

      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        "#EFEFF5",

      backgroundColor:
        "#FCFCFE",

    },


    chartContainer: {

      width:
        "100%",

      overflow:
        "hidden",

    },


    legend: {

      marginTop:
        11,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        8,

    },


    legendItem: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        4,

    },


    legendItemDisabled: {

      opacity:
        0.35,

    },


    legendDot: {

      width:
        7,

      height:
        7,

      borderRadius:
        4,

    },


    legendText: {

      color:
        "#6E7183",

      fontSize:
        8,

      fontWeight:
        "500",

    },


    legendTextDisabled: {

      color:
        "#A0A3B4",

    },

  });