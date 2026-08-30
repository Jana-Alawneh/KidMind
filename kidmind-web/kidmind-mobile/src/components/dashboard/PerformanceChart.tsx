import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Activity,
  ChevronDown,
} from "lucide-react-native";

import {
  LineChart,
} from "react-native-chart-kit";

import {
  getSessions,
} from "@/api/sessionsApi";


type Period =
  | "this"
  | "last";


type Domain = {
  key: string;
  label: string;
  gameName: string;
  color: string;
};


const domains: Domain[] = [
  {
    key:
      "attention",

    label:
      "Attention",

    gameName:
      "focus finder",

    color:
      "#7B6EF6",
  },

  {
    key:
      "memory",

    label:
      "Working Memory",

    gameName:
      "memory match",

    color:
      "#63B3ED",
  },

  {
    key:
      "reading",

    label:
      "Reading",

    gameName:
      "reading adventure",

    color:
      "#48BB78",
  },

  {
    key:
      "visualSpatial",

    label:
      "Visual-Spatial",

    gameName:
      "puzzle path",

    color:
      "#F6AD55",
  },

  {
    key:
      "processingSpeed",

    label:
      "Processing Speed",

    gameName:
      "quick match",

    color:
      "#38BDF8",
  },
];


const normalizeGameName = (
  value: unknown
) => {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

};


const parseDate = (
  value:
    | string
    | null
    | undefined
) => {

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


const getGameDate = (
  game: any,
  session: any
) => {

  return (
    parseDate(
      game?.ended_at
    ) ||
    parseDate(
      game?.started_at
    ) ||
    parseDate(
      game?.updated_at
    ) ||
    parseDate(
      game?.created_at
    ) ||
    parseDate(
      session?.ended_at
    ) ||
    parseDate(
      session?.started_at
    ) ||
    parseDate(
      session?.scheduled_at
    ) ||
    parseDate(
      session?.created_at
    )
  );

};


const getWeekIndex = (
  date: Date
) => {

  const day =
    date.getDate();


  if (day <= 7) {
    return 0;
  }


  if (day <= 14) {
    return 1;
  }


  if (day <= 21) {
    return 2;
  }


  return 3;

};


const PerformanceChart = () => {

  const {
    width,
  } =
    useWindowDimensions();


  const [
    sessions,
    setSessions,
  ] =
    useState<any[]>([]);


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
    period,
    setPeriod,
  ] =
    useState<Period>(
      "this"
    );


  const [
    periodModalOpen,
    setPeriodModalOpen,
  ] =
    useState(false);


  useEffect(
    () => {

      const loadSessions =
        async () => {

          try {

            setLoading(
              true
            );

            setError(
              ""
            );


            const data =
              await getSessions();


            setSessions(
              Array.isArray(
                data
              )
                ? data
                : []
            );

          } catch (
            loadError
          ) {

            console.error(
              "Failed to load performance chart:",
              loadError
            );


            setError(
              loadError instanceof Error
                ? loadError.message
                : "Failed to load performance data"
            );

          } finally {

            setLoading(
              false
            );

          }

        };


      loadSessions();

    },
    []
  );


  const chartValues =
    useMemo(
      () => {

        const now =
          new Date();


        let targetYear =
          now.getFullYear();


        let targetMonth =
          now.getMonth();


        if (
          period ===
          "last"
        ) {

          targetMonth -=
            1;


          if (
            targetMonth <
            0
          ) {

            targetMonth =
              11;

            targetYear -=
              1;

          }

        }


        return domains.map(
          domain => {

            const weeklyScores:
              number[][] = [
                [],
                [],
                [],
                [],
              ];


            sessions.forEach(
              session => {

                const games =
                  Array.isArray(
                    session?.games
                  )
                    ? session.games
                    : [];


                games.forEach(
                  (game: any) => {

                    if (
                      normalizeGameName(
                        game?.game_name
                      ) !==
                      domain.gameName
                    ) {
                      return;
                    }


                    if (
                      game?.status !==
                        "Completed" &&
                      game?.status !==
                        "Failed"
                    ) {
                      return;
                    }


                    const score =
                      Number(
                        game?.score
                      );


                    if (
                      !Number.isFinite(
                        score
                      )
                    ) {
                      return;
                    }


                    const date =
                      getGameDate(
                        game,
                        session
                      );


                    if (!date) {
                      return;
                    }


                    if (
                      date.getFullYear() !==
                        targetYear ||
                      date.getMonth() !==
                        targetMonth
                    ) {
                      return;
                    }


                    const weekIndex =
                      getWeekIndex(
                        date
                      );


                    weeklyScores[
                      weekIndex
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
            );


            const averages =
              weeklyScores.map(
                scores => {

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
                        sum +
                        score,
                      0
                    );


                  return Math.round(
                    total /
                    scores.length
                  );

                }
              );


            return {
              ...domain,
              averages,
            };

          }
        );

      },
      [
        sessions,
        period,
      ]
    );


  const hasAnyData =
    chartValues.some(
      domain =>
        domain.averages.some(
          value =>
            value !==
            null
        )
    );


  const data = {
    labels: [
      "W1",
      "W2",
      "W3",
      "W4",
    ],

    datasets:
      chartValues.map(
        domain => ({
          data:
            domain.averages.map(
              value =>
                value ??
                0
            ),

          color:
            () =>
              domain.color,

          strokeWidth:
            2.5,
        })
      ),
  };


  const chartWidth =
    Math.max(
      290,
      Math.min(
        width -
          72,
        700
      )
    );


  const periodLabel =
    period ===
      "this"
      ? "This Month"
      : "Last Month";


  return (

    <View
      style={
        styles.panel
      }
    >

      <View
        style={
          styles.header
        }
      >

        <View
          style={
            styles.titleGroup
          }
        >

          <View
            style={
              styles.titleIcon
            }
          >

            <Activity
              size={18}
              color="#7465E8"
            />

          </View>


          <View
            style={
              styles.titleSection
            }
          >

            <Text
              style={
                styles.title
              }
            >
              Cognitive Performance
            </Text>


            <Text
              style={
                styles.subtitle
              }
              numberOfLines={
                2
              }
            >
              Average cognitive performance by week
            </Text>

          </View>

        </View>


        <Pressable
          onPress={() => {

            setPeriodModalOpen(
              true
            );

          }}
          style={
            styles.select
          }
        >

          <Text
            style={
              styles.selectText
            }
          >
            {periodLabel}
          </Text>


          <ChevronDown
            size={14}
            color="#74778C"
          />

        </Pressable>

      </View>


      {
        loading && (

          <View
            style={
              styles.stateBox
            }
          >

            <ActivityIndicator
              color="#7B6EF6"
            />


            <Text
              style={
                styles.stateText
              }
            >
              Loading performance...
            </Text>

          </View>

        )
      }


      {
        !loading &&
        error !==
          "" && (

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
              Unable to load performance
            </Text>


            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>

          </View>

        )
      }


      {
        !loading &&
        error ===
          "" &&
        !hasAnyData && (

          <View
            style={
              styles.stateBox
            }
          >

            <Text
              style={
                styles.emptyTitle
              }
            >
              No assessment data
            </Text>


            <Text
              style={
                styles.stateText
              }
            >
              No completed game results are available for this period.
            </Text>

          </View>

        )
      }


      {
        !loading &&
        error ===
          "" &&
        hasAnyData && (

          <>

            <View
              style={
                styles.chartWrapper
              }
            >

              <LineChart
                data={
                  data
                }
                width={
                  chartWidth
                }
                height={
                  245
                }
                fromZero
                segments={
                  4
                }
                yAxisSuffix="%"
                chartConfig={{
                  backgroundGradientFrom:
                    "#FFFFFF",

                  backgroundGradientTo:
                    "#FFFFFF",

                  decimalPlaces:
                    0,

                  color:
                    () =>
                      "#A0A3B4",

                  labelColor:
                    () =>
                      "#9295A8",

                  propsForDots: {
                    r:
                      "3.5",

                    strokeWidth:
                      "1.5",
                  },

                  propsForBackgroundLines: {
                    stroke:
                      "#ECECF5",

                    strokeDasharray:
                      "5 5",
                  },
                }}
                withInnerLines
                withOuterLines={
                  false
                }
                withVerticalLines={
                  false
                }
                bezier
                style={
                  styles.chart
                }
              />

            </View>


            <View
              style={
                styles.legend
              }
            >

              {
                domains.map(
                  domain => (

                    <Legend
                      key={
                        domain.key
                      }
                      color={
                        domain.color
                      }
                      text={
                        domain.label
                      }
                    />

                  )
                )
              }

            </View>

          </>

        )
      }


      <Modal
        transparent
        statusBarTranslucent
        animationType="fade"
        visible={
          periodModalOpen
        }
        onRequestClose={() => {

          setPeriodModalOpen(
            false
          );

        }}
      >

        <SafeAreaView
          style={
            styles.modalSafeArea
          }
          edges={[
            "top",
            "bottom",
          ]}
        >

          <Pressable
            style={
              styles.modalOverlay
            }
            onPress={() => {

              setPeriodModalOpen(
                false
              );

            }}
          >

            <Pressable
              style={
                styles.modalCard
              }
              onPress={() => {}}
            >

              <Text
                style={
                  styles.modalTitle
                }
              >
                Select Period
              </Text>


              <Pressable
                style={[
                  styles.periodOption,

                  period ===
                    "this" &&
                    styles.periodOptionSelected,
                ]}
                onPress={() => {

                  setPeriod(
                    "this"
                  );

                  setPeriodModalOpen(
                    false
                  );

                }}
              >

                <Text
                  style={[
                    styles.periodOptionText,

                    period ===
                      "this" &&
                      styles.periodOptionTextSelected,
                  ]}
                >
                  This Month
                </Text>

              </Pressable>


              <Pressable
                style={[
                  styles.periodOption,

                  period ===
                    "last" &&
                    styles.periodOptionSelected,
                ]}
                onPress={() => {

                  setPeriod(
                    "last"
                  );

                  setPeriodModalOpen(
                    false
                  );

                }}
              >

                <Text
                  style={[
                    styles.periodOptionText,

                    period ===
                      "last" &&
                      styles.periodOptionTextSelected,
                  ]}
                >
                  Last Month
                </Text>

              </Pressable>

            </Pressable>

          </Pressable>

        </SafeAreaView>

      </Modal>

    </View>

  );

};


function Legend({
  color,
  text,
}: {
  color: string;
  text: string;
}) {

  return (

    <View
      style={
        styles.legendItem
      }
    >

      <View
        style={[
          styles.dot,
          {
            backgroundColor:
              color,
          },
        ]}
      />


      <Text
        style={
          styles.legendText
        }
      >
        {text}
      </Text>

    </View>

  );

}


const styles =
  StyleSheet.create({

    panel: {

      padding:
        18,

      borderRadius:
        21,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

      shadowColor:
        "#44446E",

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity:
        0.035,

      shadowRadius:
        12,

      elevation:
        2,

    },


    header: {

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        10,

      marginBottom:
        14,

    },


    titleGroup: {

      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        9,

    },


    titleIcon: {

      width:
        37,

      height:
        37,

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


    titleSection: {

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

      lineHeight:
        19,

      fontWeight:
        "700",

    },


    subtitle: {

      marginTop:
        3,

      color:
        "#A0A3B4",

      fontSize:
        10,

      lineHeight:
        14,

    },


    select: {

      minHeight:
        35,

      paddingHorizontal:
        9,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        4,

      borderRadius:
        10,

      borderWidth:
        1,

      borderColor:
        "#E7E7F0",

      backgroundColor:
        "#FFFFFF",

    },


    selectText: {

      color:
        "#6E7188",

      fontSize:
        10,

      fontWeight:
        "600",

    },


    chartWrapper: {

      alignItems:
        "center",

      overflow:
        "hidden",

    },


    chart: {

      marginLeft:
        -10,

      borderRadius:
        14,

    },


    legend: {

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        11,

      marginTop:
        13,

      paddingTop:
        14,

      borderTopWidth:
        1,

      borderTopColor:
        "#F1F1F6",

    },


    legendItem: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,

    },


    dot: {

      width:
        8,

      height:
        8,

      borderRadius:
        4,

    },


    legendText: {

      color:
        "#888B9E",

      fontSize:
        9.5,

    },


    stateBox: {

      minHeight:
        230,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        20,

    },


    stateText: {

      marginTop:
        8,

      color:
        "#A0A3B4",

      textAlign:
        "center",

      fontSize:
        10.5,

      lineHeight:
        16,

    },


    emptyTitle: {

      color:
        "#62657B",

      fontSize:
        13,

      fontWeight:
        "700",

    },


    errorBox: {

      minHeight:
        190,

      padding:
        18,

      alignItems:
        "center",

      justifyContent:
        "center",

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
        12.5,

      fontWeight:
        "700",

    },


    errorText: {

      marginTop:
        4,

      color:
        "#C55A70",

      textAlign:
        "center",

      fontSize:
        10.5,

    },


    modalSafeArea: {

      flex:
        1,

      backgroundColor:
        "rgba(30,31,50,0.32)",

    },


    modalOverlay: {

      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        20,

    },


    modalCard: {

      width:
        "100%",

      maxWidth:
        350,

      padding:
        20,

      borderRadius:
        21,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

    },


    modalTitle: {

      marginBottom:
        14,

      color:
        "#333554",

      fontSize:
        16,

      fontWeight:
        "700",

    },


    periodOption: {

      height:
        46,

      justifyContent:
        "center",

      paddingHorizontal:
        14,

      marginBottom:
        7,

      borderRadius:
        12,

    },


    periodOptionSelected: {

      backgroundColor:
        "#F0EDFF",

    },


    periodOptionText: {

      color:
        "#62657A",

      fontSize:
        12.5,

    },


    periodOptionTextSelected: {

      color:
        "#7566EB",

      fontWeight:
        "700",

    },

  });


export default PerformanceChart;