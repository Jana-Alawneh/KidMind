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
  ChevronDown,
} from "lucide-react-native";

import {
  LineChart,
} from "react-native-chart-kit";

import Card from "../ui/Card";

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
  ] = useState<any[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


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
  ] = useState(false);


  useEffect(() => {

    const loadSessions =
      async () => {

        try {

          setLoading(true);
          setError("");


          const data =
            await getSessions();


          setSessions(
            Array.isArray(
              data
            )
              ? data
              : []
          );

        } catch (loadError) {

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

          setLoading(false);

        }

      };


    loadSessions();

  }, []);


  const chartValues =
    useMemo(() => {

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
        (domain) => {

          const weeklyScores: number[][] =
            [
              [],
              [],
              [],
              [],
            ];


          sessions.forEach(
            (session) => {

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
              (
                scores
              ) => {

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

    }, [
      sessions,
      period,
    ]);


  const hasAnyData =
    chartValues.some(
      (domain) =>
        domain.averages.some(
          (value) =>
            value !==
            null
        )
    );


  const data = {
    labels: [
      "Week 1",
      "Week 2",
      "Week 3",
      "Week 4",
    ],

    datasets:
      chartValues.map(
        (
          domain
        ) => ({
          data:
            domain.averages.map(
              (value) =>
                value ??
                0
            ),

          color:
            () =>
              domain.color,

          strokeWidth:
            3,
        })
      ),
  };


  const chartWidth =
    Math.max(
      300,
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

    <Card>

      <View
        style={
          styles.header
        }
      >

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
          >
            Average performance across all children
          </Text>

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
            size={16}
            color="#64748B"
          />

        </Pressable>

      </View>


      {loading && (

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

      )}


      {!loading &&
        error !== "" && (

        <View
          style={
            styles.errorBox
          }
        >

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
        error === "" &&
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
            No performance data
          </Text>


          <Text
            style={
              styles.stateText
            }
          >
            No completed assessment games were found for this period.
          </Text>

        </View>

      )}


      {!loading &&
        error === "" &&
        hasAnyData && (

        <>

          <LineChart

            data={
              data
            }

            width={
              chartWidth
            }

            height={
              260
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
                  "#64748B",

              labelColor:
                () =>
                  "#64748B",

              propsForDots: {

                r:
                  "4",

                strokeWidth:
                  "2",

              },

            }}

            withInnerLines

            withOuterLines={
              false
            }

            bezier

            style={
              styles.chart
            }

          />


          <View
            style={
              styles.legend
            }
          >

            {domains.map(
              (domain) => (

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
            )}

          </View>

        </>

      )}


      <Modal
        transparent
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

      </Modal>

    </Card>

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

    header: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap:
        12,

      marginBottom:
        25,

    },


    titleSection: {

      flex:
        1,

    },


    title: {

      fontSize:
        20,

      fontWeight:
        "700",

    },


    subtitle: {

      fontSize:
        13,

      color:
        "#94A3B8",

      marginTop:
        5,

    },


    select: {

      borderWidth:
        1,

      borderColor:
        "#E5E7EB",

      borderRadius:
        12,

      paddingHorizontal:
        12,

      paddingVertical:
        8,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,

      backgroundColor:
        "#FFFFFF",

    },


    selectText: {

      fontSize:
        13,

      color:
        "#475569",

      fontWeight:
        "500",

    },


    chart: {

      marginLeft:
        -20,

      borderRadius:
        16,

    },


    legend: {

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        15,

      marginTop:
        20,

    },


    legendItem: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,

    },


    dot: {

      width:
        10,

      height:
        10,

      borderRadius:
        5,

    },


    legendText: {

      fontSize:
        12,

      color:
        "#64748B",

    },


    stateBox: {

      minHeight:
        220,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        20,

    },


    stateText: {

      fontSize:
        13,

      color:
        "#94A3B8",

      textAlign:
        "center",

      marginTop:
        10,

    },


    emptyTitle: {

      fontSize:
        16,

      fontWeight:
        "700",

      color:
        "#475569",

    },


    errorBox: {

      minHeight:
        180,

      backgroundColor:
        "#FEF2F2",

      borderRadius:
        16,

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        20,

    },


    errorText: {

      color:
        "#DC2626",

      textAlign:
        "center",

      fontSize:
        13,

    },


    modalOverlay: {

      flex:
        1,

      backgroundColor:
        "rgba(0,0,0,0.3)",

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
        360,

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        24,

      padding:
        22,

    },


    modalTitle: {

      fontSize:
        18,

      fontWeight:
        "700",

      marginBottom:
        16,

      color:
        "#1E293B",

    },


    periodOption: {

      height:
        50,

      justifyContent:
        "center",

      paddingHorizontal:
        16,

      borderRadius:
        12,

      marginBottom:
        8,

    },


    periodOptionSelected: {

      backgroundColor:
        "#F3EEFF",

    },


    periodOptionText: {

      fontSize:
        15,

      color:
        "#475569",

    },


    periodOptionTextSelected: {

      color:
        "#7B6EF6",

      fontWeight:
        "700",

    },

  });


export default PerformanceChart;