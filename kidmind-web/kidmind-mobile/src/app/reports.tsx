import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Gamepad2,
  UserRound,
  X,
} from "lucide-react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

import {
  getSessions,
} from "@/api/sessionsApi";

import {
  getChildren,
} from "@/api/childrenApi";


const REPORTABLE_STATUSES =
  new Set([
    "Completed",
    "Ended",
  ]);


type FilterOption = {
  value: string;
  label: string;
};


type FilterModalType =
  | "child"
  | "game"
  | "date"
  | null;


const parseDate = (
  value:
    | string
    | null
    | undefined
): Date | null => {

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


const getSessionDate = (
  session: any
): Date | null => {

  return (
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


const getTimestamp = (
  date: Date | null
) => {

  return (
    date?.getTime() ??
    0
  );

};


const formatDate = (
  date: Date | null
) => {

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


const formatTime = (
  date: Date | null
) => {

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


const normalizeGameName = (
  value: unknown
) => {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

};


const getSessionScore = (
  session: any
): number | null => {

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
        (game: any) =>
          game?.status ===
            "Completed" ||
          game?.status ===
            "Failed"
      )
      .map(
        (game: any) =>
          Number(
            game?.score
          )
      )
      .filter(
        (score: number) =>
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
        sum: number,
        score: number
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


const getGamesText = (
  session: any
) => {

  const games =
    Array.isArray(
      session?.games
    )
      ? session.games
      : [];


  const names =
    games
      .map(
        (game: any) =>
          game?.game_name
      )
      .filter(
        Boolean
      );


  if (
    names.length ===
    0
  ) {
    return "Assessment Session";
  }


  if (
    names.length ===
    1
  ) {
    return names[0];
  }


  return `${names.length} Assessment Games`;

};


const isSameDay = (
  first: Date,
  second: Date
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
  date: Date | null,
  filter: string
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


export default function Reports() {

  const [
    sidebarVisible,
    setSidebarVisible,
  ] = useState(false);


  const [
    reports,
    setReports,
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


  const [
    filterModal,
    setFilterModal,
  ] =
    useState<FilterModalType>(
      null
    );


  const loadReports =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError(
            ""
          );


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
                (session: any) =>
                  REPORTABLE_STATUSES.has(
                    session?.status
                  )
              )
              .map(
                (session: any) => {

                  const child =
                    children.find(
                      (item: any) =>
                        Number(
                          item?.id
                        ) ===
                        Number(
                          session?.child_id
                        )
                    );


                  const games =
                    Array.isArray(
                      session?.games
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
                      session?.child_name ||
                      child?.full_name ||
                      `Child #${session?.child_id}`,

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
                  first: any,
                  second: any
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

        } catch (loadError) {

          console.error(
            "Failed to load reports:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load reports"
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      []
    );


  useFocusEffect(
    useCallback(
      () => {

        loadReports();

      },
      [
        loadReports,
      ]
    )
  );


  const childOptions =
    useMemo<FilterOption[]>(
      () => {

        const map =
          new Map<
            string,
            string
          >();


        reports.forEach(
          (report) => {

            map.set(
              String(
                report.child_id
              ),
              report.reportChildName
            );

          }
        );


        return [
          {
            value: "all",
            label: "All Children",
          },

          ...Array.from(
            map.entries()
          )
            .map(
              (
                [
                  value,
                  label,
                ]
              ) => ({
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
            ),
        ];

      },
      [
        reports,
      ]
    );


  const gameOptions =
    useMemo<FilterOption[]>(
      () => {

        const map =
          new Map<
            string,
            string
          >();


        reports.forEach(
          (report) => {

            report.reportGames.forEach(
              (game: any) => {

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


        return [
          {
            value: "all",
            label: "All Games",
          },

          ...Array.from(
            map.entries()
          )
            .map(
              (
                [
                  value,
                  label,
                ]
              ) => ({
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
            ),
        ];

      },
      [
        reports,
      ]
    );


  const dateOptions =
    useMemo<FilterOption[]>(
      () => [
        {
          value: "all",
          label: "All Time",
        },
        {
          value: "today",
          label: "Today",
        },
        {
          value: "yesterday",
          label: "Yesterday",
        },
        {
          value: "last7",
          label: "Last 7 Days",
        },
        {
          value: "thisMonth",
          label: "This Month",
        },
        {
          value: "lastMonth",
          label: "Last Month",
        },
      ],
      []
    );


  const filteredReports =
    useMemo(
      () => {

        return reports.filter(
          (report) => {

            const matchesChild =
              childFilter ===
                "all" ||
              String(
                report.child_id
              ) ===
                childFilter;


            const matchesGame =
              gameFilter ===
                "all" ||
              report.reportGames.some(
                (game: any) =>
                  normalizeGameName(
                    game?.game_name
                  ) ===
                  gameFilter
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
      () => {

        return reports.filter(
          (report) =>
            matchesDateFilter(
              report.reportDate,
              "today"
            )
        ).length;

      },
      [
        reports,
      ]
    );


  const thisMonthCount =
    useMemo(
      () => {

        return reports.filter(
          (report) =>
            matchesDateFilter(
              report.reportDate,
              "thisMonth"
            )
        ).length;

      },
      [
        reports,
      ]
    );


  const averageScore =
    useMemo(
      () => {

        const scores =
          reports
            .map(
              (report) =>
                report.reportScore
            )
            .filter(
              (
                score
              ): score is number =>
                typeof score ===
                "number"
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


        return Math.round(
          total /
          scores.length
        );

      },
      [
        reports,
      ]
    );


  const getSelectedLabel =
    (
      options: FilterOption[],
      value: string
    ) => {

      return (
        options.find(
          (option) =>
            option.value ===
            value
        )?.label ||
        "All"
      );

    };


  const clearFilters =
    () => {

      setChildFilter(
        "all"
      );

      setGameFilter(
        "all"
      );

      setDateFilter(
        "all"
      );

    };


  const currentModalOptions =
    filterModal ===
      "child"
      ? childOptions
      : filterModal ===
        "game"
      ? gameOptions
      : dateOptions;


  const currentModalValue =
    filterModal ===
      "child"
      ? childFilter
      : filterModal ===
        "game"
      ? gameFilter
      : dateFilter;


  const currentModalTitle =
    filterModal ===
      "child"
      ? "Select Child"
      : filterModal ===
        "game"
      ? "Select Game"
      : "Select Date";


  const handleFilterSelection =
    (
      value: string
    ) => {

      if (
        filterModal ===
        "child"
      ) {

        setChildFilter(
          value
        );

      }


      if (
        filterModal ===
        "game"
      ) {

        setGameFilter(
          value
        );

      }


      if (
        filterModal ===
        "date"
      ) {

        setDateFilter(
          value
        );

      }


      setFilterModal(
        null
      );

    };


  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      <View
        style={
          styles.screen
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >

          <Navbar
            onMenuPress={() => {

              setSidebarVisible(
                true
              );

            }}
          />


          <View
            style={
              styles.pageHeader
            }
          >

            <View
              style={
                styles.pageIcon
              }
            >

              <FileText
                size={25}
                color="#7B6EF6"
              />

            </View>


            <View
              style={
                styles.pageHeaderText
              }
            >

              <Text
                style={
                  styles.pageTitle
                }
              >
                Reports
              </Text>


              <Text
                style={
                  styles.pageSubtitle
                }
              >
                Review assessment reports across all children and sessions
              </Text>

            </View>

          </View>


          <View
            style={
              styles.statsGrid
            }
          >

            <SummaryCard
              icon={
                FileText
              }
              title="Total Reports"
              value={
                loading
                  ? "..."
                  : String(
                      reports.length
                    )
              }
              backgroundColor="#EEE9FF"
              iconColor="#7B6EF6"
            />


            <SummaryCard
              icon={
                CalendarDays
              }
              title="Today"
              value={
                loading
                  ? "..."
                  : String(
                      todayCount
                    )
              }
              backgroundColor="#EAF7FF"
              iconColor="#3B82F6"
            />


            <SummaryCard
              icon={
                BarChart3
              }
              title="This Month"
              value={
                loading
                  ? "..."
                  : String(
                      thisMonthCount
                    )
              }
              backgroundColor="#EEF8E8"
              iconColor="#16A34A"
            />


            <SummaryCard
              icon={
                Gamepad2
              }
              title="Average Score"
              value={
                loading
                  ? "..."
                  : averageScore ===
                      null
                  ? "—"
                  : `${averageScore}%`
              }
              backgroundColor="#FFF4E8"
              iconColor="#F59E0B"
            />

          </View>


          <View
            style={
              styles.filterCard
            }
          >

            <View
              style={
                styles.filterHeader
              }
            >

              <View
                style={
                  styles.filterHeaderText
                }
              >

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Filter Reports
                </Text>


                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Filter by child, assessment game, or date
                </Text>

              </View>


              <TouchableOpacity
                onPress={
                  clearFilters
                }
              >

                <Text
                  style={
                    styles.clearText
                  }
                >
                  Clear
                </Text>

              </TouchableOpacity>

            </View>


            <FilterSelect
              icon={
                UserRound
              }
              label="Child"
              value={
                getSelectedLabel(
                  childOptions,
                  childFilter
                )
              }
              onPress={() => {

                setFilterModal(
                  "child"
                );

              }}
            />


            <FilterSelect
              icon={
                Gamepad2
              }
              label="Game"
              value={
                getSelectedLabel(
                  gameOptions,
                  gameFilter
                )
              }
              onPress={() => {

                setFilterModal(
                  "game"
                );

              }}
            />


            <FilterSelect
              icon={
                CalendarDays
              }
              label="Date"
              value={
                getSelectedLabel(
                  dateOptions,
                  dateFilter
                )
              }
              onPress={() => {

                setFilterModal(
                  "date"
                );

              }}
            />

          </View>


          <View
            style={
              styles.reportsHeader
            }
          >

            <View>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Assessment Reports
              </Text>


              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                {loading
                  ? "Loading reports..."
                  : `${filteredReports.length} report${
                      filteredReports.length ===
                      1
                        ? ""
                        : "s"
                    } found`}
              </Text>

            </View>

          </View>


          {loading && (

            <View
              style={
                styles.stateCard
              }
            >

              <ActivityIndicator
                size="large"
                color="#7B6EF6"
              />


              <Text
                style={
                  styles.stateText
                }
              >
                Loading reports...
              </Text>

            </View>

          )}


          {!loading &&
            error !== "" && (

            <View
              style={
                styles.errorCard
              }
            >

              <Text
                style={
                  styles.errorTitle
                }
              >
                Unable to load reports
              </Text>


              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>


              <TouchableOpacity
                style={
                  styles.retryButton
                }
                onPress={
                  loadReports
                }
              >

                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  Try Again
                </Text>

              </TouchableOpacity>

            </View>

          )}


          {!loading &&
            error === "" &&
            filteredReports.length ===
              0 && (

            <View
              style={
                styles.emptyCard
              }
            >

              <View
                style={
                  styles.emptyIcon
                }
              >

                <FileText
                  size={30}
                  color="#7B6EF6"
                />

              </View>


              <Text
                style={
                  styles.emptyTitle
                }
              >
                No reports found
              </Text>


              <Text
                style={
                  styles.emptyText
                }
              >
                Try changing the selected filters.
              </Text>

            </View>

          )}


          {!loading &&
            error === "" &&
            filteredReports.map(
              (report) => (

                <TouchableOpacity
                  key={
                    report.id
                  }
                  activeOpacity={
                    0.92
                  }
                  style={
                    styles.reportCard
                  }
                  onPress={() => {

                    router.push({
                      pathname:
                        "/sessions/[id]",

                      params: {
                        id:
                          String(
                            report.id
                          ),
                      },
                    });

                  }}
                >

                  <View
                    style={
                      styles.reportTop
                    }
                  >

                    <View
                      style={
                        styles.childInfo
                      }
                    >

                      <View
                        style={
                          styles.childIcon
                        }
                      >

                        <UserRound
                          size={20}
                          color="#7B6EF6"
                        />

                      </View>


                      <View
                        style={
                          styles.childText
                        }
                      >

                        <Text
                          style={
                            styles.childName
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {report.reportChildName}
                        </Text>


                        <Text
                          style={
                            styles.childId
                          }
                        >
                          ID #{report.child_id}
                        </Text>

                      </View>

                    </View>


                    <View
                      style={
                        report.status ===
                        "Completed"
                          ? styles.completedBadge
                          : styles.endedBadge
                      }
                    >

                      <Text
                        style={
                          report.status ===
                          "Completed"
                            ? styles.completedText
                            : styles.endedText
                        }
                      >
                        {report.status}
                      </Text>

                    </View>

                  </View>


                  <View
                    style={
                      styles.divider
                    }
                  />


                  <View
                    style={
                      styles.sessionRow
                    }
                  >

                    <Text
                      style={
                        styles.sessionNumber
                      }
                    >
                      Session #{report.id}
                    </Text>


                    <View
                      style={
                        styles.scoreBadge
                      }
                    >

                      <Text
                        style={
                          styles.scoreText
                        }
                      >
                        {typeof report.reportScore ===
                        "number"
                          ? `${report.reportScore}%`
                          : "—"}
                      </Text>

                    </View>

                  </View>


                  <View
                    style={
                      styles.assessmentBox
                    }
                  >

                    <View
                      style={
                        styles.assessmentTitleRow
                      }
                    >

                      <Gamepad2
                        size={17}
                        color="#7B6EF6"
                      />


                      <Text
                        style={
                          styles.assessmentTitle
                        }
                      >
                        {report.reportGamesText}
                      </Text>

                    </View>


                    {report.reportGames.length >
                      1 && (

                      <Text
                        style={
                          styles.gamesList
                        }
                        numberOfLines={
                          2
                        }
                      >
                        {report.reportGames
                          .map(
                            (
                              game: any
                            ) =>
                              game?.game_name
                          )
                          .filter(
                            Boolean
                          )
                          .join(
                            " • "
                          )}
                      </Text>

                    )}

                  </View>


                  <View
                    style={
                      styles.dateRow
                    }
                  >

                    <View
                      style={
                        styles.dateItem
                      }
                    >

                      <CalendarDays
                        size={16}
                        color="#94A3B8"
                      />


                      <Text
                        style={
                          styles.dateText
                        }
                      >
                        {formatDate(
                          report.reportDate
                        )}
                      </Text>

                    </View>


                    <View
                      style={
                        styles.dateItem
                      }
                    >

                      <Clock3
                        size={16}
                        color="#94A3B8"
                      />


                      <Text
                        style={
                          styles.dateText
                        }
                      >
                        {formatTime(
                          report.reportDate
                        )}
                      </Text>

                    </View>

                  </View>


                  <TouchableOpacity
                    activeOpacity={
                      0.85
                    }
                    style={
                      styles.viewReportButton
                    }
                    onPress={() => {

                      router.push({
                        pathname:
                          "/sessions/[id]",

                        params: {
                          id:
                            String(
                              report.id
                            ),
                        },
                      });

                    }}
                  >

                    <FileText
                      size={17}
                      color="#FFFFFF"
                    />


                    <Text
                      style={
                        styles.viewReportText
                      }
                    >
                      View Report
                    </Text>

                  </TouchableOpacity>

                </TouchableOpacity>

              )
            )}

        </ScrollView>


        <Sidebar
          visible={
            sidebarVisible
          }
          onClose={() => {

            setSidebarVisible(
              false
            );

          }}
        />


        <Modal
          visible={
            filterModal !==
            null
          }
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => {

            setFilterModal(
              null
            );

          }}
        >

          <View
            style={
              styles.modalOverlay
            }
          >

            <View
              style={
                styles.modalCard
              }
            >

              <View
                style={
                  styles.modalHeader
                }
              >

                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  {currentModalTitle}
                </Text>


                <TouchableOpacity
                  onPress={() => {

                    setFilterModal(
                      null
                    );

                  }}
                >

                  <X
                    size={23}
                    color="#64748B"
                  />

                </TouchableOpacity>

              </View>


              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                style={
                  styles.modalList
                }
              >

                {currentModalOptions.map(
                  (option) => {

                    const selected =
                      option.value ===
                      currentModalValue;


                    return (

                      <TouchableOpacity
                        key={
                          option.value
                        }
                        activeOpacity={
                          0.8
                        }
                        style={[
                          styles.modalOption,

                          selected &&
                            styles.modalOptionSelected,
                        ]}
                        onPress={() => {

                          handleFilterSelection(
                            option.value
                          );

                        }}
                      >

                        <Text
                          style={[
                            styles.modalOptionText,

                            selected &&
                              styles.modalOptionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>


                        {selected && (

                          <View
                            style={
                              styles.checkBox
                            }
                          >

                            <Check
                              size={15}
                              color="#FFFFFF"
                            />

                          </View>

                        )}

                      </TouchableOpacity>

                    );

                  }
                )}

              </ScrollView>

            </View>

          </View>

        </Modal>

      </View>

    </SafeAreaView>

  );

}


type SummaryCardProps = {
  icon: any;
  title: string;
  value: string;
  backgroundColor: string;
  iconColor: string;
};


const SummaryCard = ({
  icon: Icon,
  title,
  value,
  backgroundColor,
  iconColor,
}: SummaryCardProps) => {

  return (

    <View
      style={
        styles.summaryCard
      }
    >

      <View
        style={[
          styles.summaryIcon,

          {
            backgroundColor,
          },
        ]}
      >

        <Icon
          size={21}
          color={
            iconColor
          }
        />

      </View>


      <Text
        style={
          styles.summaryLabel
        }
      >
        {title}
      </Text>


      <Text
        style={
          styles.summaryValue
        }
      >
        {value}
      </Text>

    </View>

  );

};


type FilterSelectProps = {
  icon: any;
  label: string;
  value: string;
  onPress: () => void;
};


const FilterSelect = ({
  icon: Icon,
  label,
  value,
  onPress,
}: FilterSelectProps) => {

  return (

    <View
      style={
        styles.filterField
      }
    >

      <Text
        style={
          styles.filterLabel
        }
      >
        {label}
      </Text>


      <TouchableOpacity
        activeOpacity={
          0.8
        }
        style={
          styles.selectButton
        }
        onPress={
          onPress
        }
      >

        <View
          style={
            styles.selectLeft
          }
        >

          <Icon
            size={18}
            color="#94A3B8"
          />


          <Text
            style={
              styles.selectValue
            }
            numberOfLines={
              1
            }
          >
            {value}
          </Text>

        </View>


        <ChevronDown
          size={18}
          color="#94A3B8"
        />

      </TouchableOpacity>

    </View>

  );

};


const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        "#F7F8FC",

    },


    screen: {

      flex: 1,

    },


    content: {

      paddingHorizontal:
        20,

      paddingBottom:
        40,

    },


    pageHeader: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        13,

      marginTop:
        26,

      marginBottom:
        25,

    },


    pageIcon: {

      width: 52,

      height: 52,

      borderRadius:
        17,

      backgroundColor:
        "#EEE9FF",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    pageHeaderText: {

      flex: 1,

    },


    pageTitle: {

      fontSize: 29,

      fontWeight:
        "800",

      color:
        "#0F172A",

    },


    pageSubtitle: {

      marginTop: 4,

      color:
        "#64748B",

      fontSize: 13,

      lineHeight: 19,

    },


    statsGrid: {

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "space-between",

      gap: 12,

    },


    summaryCard: {

      width: "48%",

      minHeight: 145,

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        20,

      borderWidth: 1,

      borderColor:
        "#F1F5F9",

      padding: 17,

    },


    summaryIcon: {

      width: 43,

      height: 43,

      borderRadius:
        14,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    summaryLabel: {

      color:
        "#64748B",

      fontSize: 12,

      marginTop: 14,

    },


    summaryValue: {

      color:
        "#0F172A",

      fontSize: 24,

      fontWeight:
        "800",

      marginTop: 4,

    },


    filterCard: {

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#F1F5F9",

      borderRadius:
        22,

      padding: 19,

      marginTop: 22,

    },


    filterHeader: {

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap: 12,

      marginBottom: 19,

    },


    filterHeaderText: {

      flex: 1,

    },


    sectionTitle: {

      color:
        "#0F172A",

      fontSize: 19,

      fontWeight:
        "700",

    },


    sectionSubtitle: {

      color:
        "#64748B",

      fontSize: 12,

      marginTop: 4,

      lineHeight: 18,

    },


    clearText: {

      color:
        "#7B6EF6",

      fontWeight:
        "700",

      fontSize: 13,

      paddingVertical: 4,

    },


    filterField: {

      marginBottom: 15,

    },


    filterLabel: {

      color:
        "#475569",

      fontSize: 13,

      fontWeight:
        "600",

      marginBottom: 7,

    },


    selectButton: {

      minHeight: 50,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",

      paddingHorizontal:
        14,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

    },


    selectLeft: {

      flex: 1,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 10,

    },


    selectValue: {

      flex: 1,

      color:
        "#334155",

      fontSize: 14,

      fontWeight:
        "500",

    },


    reportsHeader: {

      marginTop: 28,

      marginBottom: 14,

    },


    stateCard: {

      minHeight: 200,

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        20,

      borderWidth: 1,

      borderColor:
        "#F1F5F9",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    stateText: {

      color:
        "#94A3B8",

      fontSize: 13,

      marginTop: 11,

    },


    errorCard: {

      minHeight: 190,

      borderRadius:
        20,

      backgroundColor:
        "#FEF2F2",

      borderWidth: 1,

      borderColor:
        "#FECACA",

      alignItems:
        "center",

      justifyContent:
        "center",

      padding: 22,

    },


    errorTitle: {

      color:
        "#B91C1C",

      fontSize: 17,

      fontWeight:
        "700",

    },


    errorText: {

      color:
        "#DC2626",

      fontSize: 13,

      marginTop: 7,

      textAlign:
        "center",

    },


    retryButton: {

      marginTop: 17,

      minHeight: 42,

      paddingHorizontal:
        19,

      borderRadius:
        12,

      backgroundColor:
        "#DC2626",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    retryButtonText: {

      color:
        "#FFFFFF",

      fontWeight:
        "700",

    },


    emptyCard: {

      minHeight: 230,

      borderRadius:
        20,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#F1F5F9",

      alignItems:
        "center",

      justifyContent:
        "center",

      padding: 25,

    },


    emptyIcon: {

      width: 62,

      height: 62,

      borderRadius:
        20,

      backgroundColor:
        "#F3F0FF",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    emptyTitle: {

      color:
        "#475569",

      fontSize: 17,

      fontWeight:
        "700",

      marginTop: 15,

    },


    emptyText: {

      color:
        "#94A3B8",

      fontSize: 13,

      marginTop: 6,

      textAlign:
        "center",

    },


    reportCard: {

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        22,

      borderWidth: 1,

      borderColor:
        "#F1F5F9",

      padding: 18,

      marginBottom: 15,

    },


    reportTop: {

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap: 10,

    },


    childInfo: {

      flex: 1,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 11,

    },


    childIcon: {

      width: 43,

      height: 43,

      borderRadius:
        14,

      backgroundColor:
        "#EEE9FF",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    childText: {

      flex: 1,

    },


    childName: {

      color:
        "#1E293B",

      fontSize: 16,

      fontWeight:
        "700",

    },


    childId: {

      color:
        "#94A3B8",

      fontSize: 11,

      marginTop: 3,

    },


    completedBadge: {

      paddingHorizontal:
        10,

      paddingVertical: 6,

      borderRadius:
        999,

      backgroundColor:
        "#F0FDF4",

    },


    completedText: {

      color:
        "#15803D",

      fontSize: 11,

      fontWeight:
        "700",

    },


    endedBadge: {

      paddingHorizontal:
        10,

      paddingVertical: 6,

      borderRadius:
        999,

      backgroundColor:
        "#F1F5F9",

    },


    endedText: {

      color:
        "#64748B",

      fontSize: 11,

      fontWeight:
        "700",

    },


    divider: {

      height: 1,

      backgroundColor:
        "#F1F5F9",

      marginVertical: 16,

    },


    sessionRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

    },


    sessionNumber: {

      color:
        "#475569",

      fontSize: 14,

      fontWeight:
        "700",

    },


    scoreBadge: {

      minWidth: 58,

      paddingHorizontal:
        12,

      paddingVertical: 7,

      borderRadius:
        12,

      backgroundColor:
        "#F3F0FF",

      alignItems:
        "center",

    },


    scoreText: {

      color:
        "#6D5CE7",

      fontSize: 14,

      fontWeight:
        "800",

    },


    assessmentBox: {

      marginTop: 15,

      borderRadius:
        15,

      backgroundColor:
        "#F8FAFC",

      padding: 13,

    },


    assessmentTitleRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,

    },


    assessmentTitle: {

      flex: 1,

      color:
        "#334155",

      fontSize: 13,

      fontWeight:
        "700",

    },


    gamesList: {

      color:
        "#94A3B8",

      fontSize: 11,

      lineHeight: 17,

      marginTop: 7,

    },


    dateRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap: 10,

      marginTop: 15,

    },


    dateItem: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,

    },


    dateText: {

      color:
        "#64748B",

      fontSize: 11,

    },


    viewReportButton: {

      minHeight: 48,

      marginTop: 17,

      borderRadius:
        14,

      backgroundColor:
        "#7B6EF6",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 8,

    },


    viewReportText: {

      color:
        "#FFFFFF",

      fontSize: 14,

      fontWeight:
        "700",

    },


    modalOverlay: {

      flex: 1,

      backgroundColor:
        "rgba(15, 23, 42, 0.42)",

      justifyContent:
        "center",

      padding: 20,

    },


    modalCard: {

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        24,

      padding: 20,

      maxHeight: "76%",

    },


    modalHeader: {

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom: 17,

    },


    modalTitle: {

      color:
        "#0F172A",

      fontSize: 20,

      fontWeight:
        "800",

    },


    modalList: {

      maxHeight: 420,

    },


    modalOption: {

      minHeight: 52,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      borderRadius:
        14,

      marginBottom: 9,

      paddingHorizontal:
        14,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

    },


    modalOptionSelected: {

      borderColor:
        "#7B6EF6",

      backgroundColor:
        "#F8F6FF",

    },


    modalOptionText: {

      flex: 1,

      color:
        "#475569",

      fontSize: 14,

      fontWeight:
        "600",

    },


    modalOptionTextSelected: {

      color:
        "#6D5CE7",

    },


    checkBox: {

      width: 26,

      height: 26,

      borderRadius: 9,

      backgroundColor:
        "#7B6EF6",

      alignItems:
        "center",

      justifyContent:
        "center",

    },

  });