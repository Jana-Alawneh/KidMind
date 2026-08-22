import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Eye,
  FileText,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react-native";

import {
  authRequest,
} from "@/api/authApi";

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


const domainLabels:
  Record<
    string,
    string
  > = {
    "focus finder":
      "Focus",

    focus:
      "Focus",

    "memory match":
      "Memory",

    memory:
      "Memory",

    "puzzle path":
      "Problem Solving",

    puzzle:
      "Problem Solving",

    "reading adventure":
      "Reading",

    reading:
      "Reading",

    "quick match":
      "Processing Speed",

    matching:
      "Processing Speed",
  };


type ChildItem = {
  id: number;
  full_name: string;
  region?:
    | string
    | null;
  parent_name?:
    | string
    | null;
};


type GameItem = {
  id?: number;

  game_name?:
    | string
    | null;

  name?:
    | string
    | null;

  game_type?:
    | string
    | null;

  type?:
    | string
    | null;

  domain?:
    | string
    | null;

  cognitive_domain?:
    | string
    | null;

  status?:
    | string
    | null;

  score?:
    | number
    | string
    | null;

  percentage?:
    | number
    | string
    | null;

  result_score?:
    | number
    | string
    | null;

  final_score?:
    | number
    | string
    | null;
};


type SessionItem = {
  id: number;

  child_id: number;

  status?:
    | string
    | null;

  score?:
    | number
    | string
    | null;

  overall_score?:
    | number
    | string
    | null;

  average_score?:
    | number
    | string
    | null;

  assessment_score?:
    | number
    | string
    | null;

  duration_seconds?:
    | number
    | string
    | null;

  duration?:
    | number
    | string
    | null;

  started_at?:
    | string
    | null;

  completed_at?:
    | string
    | null;

  ended_at?:
    | string
    | null;

  scheduled_at?:
    | string
    | null;

  created_at?:
    | string
    | null;

  updated_at?:
    | string
    | null;

  games?:
    GameItem[];

  session_games?:
    GameItem[];

  results?:
    GameItem[];
};


type AssignmentItem = {
  child_id: number;
  user_id: number;

  role:
    | "parent"
    | "therapist";

  user_name?:
    | string
    | null;
};


type ReportItem = {
  session:
    SessionItem;

  child?:
    ChildItem;

  score:
    number | null;

  status:
    string;

  date:
    Date | null;

  hasFailedGame:
    boolean;

  therapists:
    string[];
};


type DomainResult = {
  label:
    string;

  score:
    number;
};


type StatusFilter =
  | "all"
  | "completed"
  | "ended"
  | "failed";


type DateFilter =
  | "all"
  | "today"
  | "yesterday"
  | "last7"
  | "thisMonth"
  | "lastMonth";


type PickerOption = {
  value:
    string;

  label:
    string;
};


const parseDate = (
  value:
    | string
    | Date
    | null
    | undefined
) => {

  if (!value) {
    return null;
  }


  if (
    value instanceof Date
  ) {

    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;

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


const getSessionDate = (
  session:
    SessionItem
) => {

  return (
    parseDate(
      session.completed_at
    ) ||
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
  first:
    Date,

  second:
    Date
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
  date:
    Date | null,

  filter:
    DateFilter
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


const formatDate = (
  value:
    | Date
    | string
    | null
    | undefined
) => {

  if (!value) {

    return "—";

  }


  const date =
    value instanceof Date
      ? value
      : parseDate(
          value
        );


  if (!date) {

    return "—";

  }


  return date.toLocaleDateString(
    "en-US",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    }
  );

};


const formatDuration = (
  session:
    SessionItem
) => {

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
    parseDate(
      session.started_at
    )?.getTime() ??
    null;


  const end =
    parseDate(
      session.completed_at ||
      session.ended_at ||
      session.updated_at
    )?.getTime() ??
    null;


  if (
    !start ||
    !end ||
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


const extractGames = (
  session:
    SessionItem
) => {

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


const normalizeGameName = (
  game:
    GameItem
) => {

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


const getGameScore = (
  game:
    GameItem
) => {

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


const isCompletedGame = (
  game:
    GameItem
) => {

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


const hasFailedGame = (
  session:
    SessionItem
) => {

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


const getSessionScore = (
  session:
    SessionItem
) => {

  const rawScore =
    session.score;


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
      session.games
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

const getDomainResults = (
  session:
    SessionItem
): DomainResult[] => {

  const games =
    extractGames(
      session
    ).filter(
      isCompletedGame
    );


  const latestByDomain:
    Record<
      string,
      number
    > = {};


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
          : String(
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
  ] =
    useState<ChildItem[]>(
      []
    );


  const [
    sessions,
    setSessions,
  ] =
    useState<SessionItem[]>(
      []
    );


  const [
    assignments,
    setAssignments,
  ] =
    useState<AssignmentItem[]>(
      []
    );


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


  const [
    search,
    setSearch,
  ] =
    useState("");


  const [
    childFilter,
    setChildFilter,
  ] =
    useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      "all"
    );


  const [
    dateFilter,
    setDateFilter,
  ] =
    useState<DateFilter>(
      "all"
    );


  const [
    selectedReport,
    setSelectedReport,
  ] =
    useState<ReportItem | null>(
      null
    );


  const loadData =
    async (
      manual = false
    ) => {

      try {

        if (manual) {

          setRefreshing(
            true
          );

        } else {

          setLoading(
            true
          );

        }


        setError(
          ""
        );


        const [
          sessionsData,
          childrenData,
          assignmentsData,
        ] =
          await Promise.all([
            getSessions(),
            getChildren(),

            authRequest<
              AssignmentItem[]
            >(
              "/users/assignments"
            ),
          ]);


        setSessions(
          Array.isArray(
            sessionsData
          )
            ? sessionsData as SessionItem[]
            : []
        );


        setChildren(
          Array.isArray(
            childrenData
          )
            ? childrenData as ChildItem[]
            : []
        );


        setAssignments(
          Array.isArray(
            assignmentsData
          )
            ? assignmentsData
            : []
        );

      } catch (
        requestError
      ) {

        console.error(
          "Failed to load admin reports:",
          requestError
        );


        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load reports."
        );

      } finally {

        setLoading(
          false
        );


        setRefreshing(
          false
        );

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

        const map:
          Record<
            number,
            ChildItem
          > = {};


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

        const map:
          Record<
            number,
            string[]
          > = {};


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
                assignment.user_name ||
                `Therapist #${assignment.user_id}`
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
                String(
                  session.status ||
                  ""
                ).trim()
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
              } satisfies ReportItem;

            }
          )
          .sort(
            (
              first,
              second
            ) => {

              const firstDate =
                first.date
                  ? first.date.getTime()
                  : 0;


              const secondDate =
                second.date
                  ? second.date.getTime()
                  : 0;


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
    useMemo(
      () =>
        reports.filter(
          report =>
            report.status ===
            "completed"
        ),
      [
        reports,
      ]
    );


  const scoredReports =
    useMemo(
      () =>
        reports.filter(
          report =>
            report.score !==
            null
        ),
      [
        reports,
      ]
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
              Number(
                report.score
              ),
            0
          ) /
          scoredReports.length
        )
      : 0;


  const assessedChildren =
    useMemo(
      () =>
        new Set(
          reports.map(
            report =>
              Number(
                report.session
                  .child_id
              )
          )
        ).size,
      [
        reports,
      ]
    );


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
                report.session
                  .child_id
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


  const selectedDomains =
    selectedReport
      ? getDomainResults(
          selectedReport.session
        )
      : [];


  const childOptions:
    PickerOption[] = [
      {
        value:
          "",

        label:
          "All Children",
      },

      ...children
        .map(
          child => ({
            value:
              String(
                child.id
              ),

            label:
              child.full_name,
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


  const statusOptions:
    PickerOption[] = [
      {
        value:
          "all",

        label:
          "All Statuses",
      },

      {
        value:
          "completed",

        label:
          "Completed",
      },

      {
        value:
          "ended",

        label:
          "Ended",
      },

      {
        value:
          "failed",

        label:
          "Failed Game",
      },
    ];


  const dateOptions:
    PickerOption[] = [
      {
        value:
          "all",

        label:
          "All Time",
      },

      {
        value:
          "today",

        label:
          "Today",
      },

      {
        value:
          "yesterday",

        label:
          "Yesterday",
      },

      {
        value:
          "last7",

        label:
          "Last 7 Days",
      },

      {
        value:
          "thisMonth",

        label:
          "This Month",
      },

      {
        value:
          "lastMonth",

        label:
          "Last Month",
      },
    ];


  return (

    <View
      style={
        styles.page
      }
    >

      <View
        style={
          styles.heading
        }
      >

        <View
          style={
            styles.headingMain
          }
        >

          <Text
            style={
              styles.eyebrow
            }
          >
            ASSESSMENT REPORTING
          </Text>


          <Text
            style={
              styles.title
            }
          >
            Reports
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Review child assessment
            sessions, scores, cognitive
            results and therapist coverage
            from the administration area.
          </Text>

        </View>


        <Pressable
          disabled={
            refreshing
          }
          style={[
            styles.refreshButton,

            refreshing &&
              styles.disabled,
          ]}
          onPress={() =>
            loadData(
              true
            )
          }
        >

          {
            refreshing
              ? (

                <ActivityIndicator
                  size="small"
                  color="#7164D8"
                />

              )
              : (

                <RefreshCw
                  size={17}
                  color="#7164D8"
                />

              )
          }

        </Pressable>

      </View>


      <View
        style={
          styles.statsGrid
        }
      >

        <StatCard
          icon={
            <FileText
              size={20}
              color="#7868E6"
            />
          }
          label="Total Reports"
          value={
            loading
              ? "—"
              : String(
                  reports.length
                )
          }
          tone="purple"
        />


        <StatCard
          icon={
            <CheckCircle2
              size={20}
              color="#48A784"
            />
          }
          label="Completed"
          value={
            loading
              ? "—"
              : String(
                  completedReports.length
                )
          }
          tone="green"
        />


        <StatCard
          icon={
            <TrendingUp
              size={20}
              color="#4D8CCB"
            />
          }
          label="Average Score"
          value={
            loading
              ? "—"
              : scoredReports.length >
                0
                ? `${averageScore}%`
                : "—"
          }
          tone="blue"
        />


        <StatCard
          icon={
            <Users
              size={20}
              color="#C85E9F"
            />
          }
          label="Children Assessed"
          value={
            loading
              ? "—"
              : String(
                  assessedChildren
                )
          }
          tone="pink"
        />

      </View>


      {
        Boolean(
          error
        ) && (

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

        )
      }


      <View
        style={
          styles.panel
        }
      >

        <View
          style={
            styles.panelHeading
          }
        >

          <View
            style={
              styles.panelHeadingMain
            }
          >

            <Text
              style={
                styles.panelTitle
              }
            >
              Assessment History
            </Text>


            <Text
              style={
                styles.panelSubtitle
              }
            >
              Search and review all
              assessment sessions.
            </Text>

          </View>


          <View
            style={
              styles.panelIcon
            }
          >

            <ClipboardList
              size={21}
              color="#7869E6"
            />

          </View>

        </View>


        <View
          style={
            styles.searchBox
          }
        >

          <Search
            size={17}
            color="#A0A2B2"
          />


          <TextInput
            value={
              search
            }
            onChangeText={
              setSearch
            }
            placeholder="Search child, therapist, region or session..."
            placeholderTextColor="#A0A2B2"
            autoCorrect={false}
            style={
              styles.searchInput
            }
          />

        </View>


        <View
          style={
            styles.filters
          }
        >

          <PickerField
            value={
              childFilter
            }
            placeholder="All Children"
            options={
              childOptions
            }
            onSelect={
              setChildFilter
            }
          />


          <PickerField
            value={
              statusFilter
            }
            placeholder="All Statuses"
            options={
              statusOptions
            }
            onSelect={
              value =>
                setStatusFilter(
                  value as StatusFilter
                )
            }
          />


          <PickerField
            value={
              dateFilter
            }
            placeholder="All Time"
            options={
              dateOptions
            }
            onSelect={
              value =>
                setDateFilter(
                  value as DateFilter
                )
            }
          />

        </View>


        {
          loading
            ? (

              <View
                style={
                  styles.stateBox
                }
              >

                <ActivityIndicator
                  size="large"
                  color="#796AE7"
                />


                <Text
                  style={
                    styles.stateText
                  }
                >
                  Loading reports...
                </Text>

              </View>

            )
            : filteredReports.length ===
              0
              ? (

                <View
                  style={
                    styles.stateBox
                  }
                >

                  <FileText
                    size={36}
                    color="#796AE7"
                  />


                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    No reports found
                  </Text>


                  <Text
                    style={
                      styles.stateText
                    }
                  >
                    Try changing the
                    search or filters.
                  </Text>

                </View>

              )
              : (

                <View
                  style={
                    styles.reportList
                  }
                >

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

                          <View
                            key={
                              report.session.id
                            }
                            style={
                              styles.reportCard
                            }
                          >

                            <View
                              style={
                                styles.reportTop
                              }
                            >

                              <View
                                style={
                                  styles.avatar
                                }
                              >

                                <Text
                                  style={
                                    styles.avatarText
                                  }
                                >
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
                                </Text>

                              </View>


                              <View
                                style={
                                  styles.reportChildMain
                                }
                              >

                                <Text
                                  numberOfLines={
                                    1
                                  }
                                  style={
                                    styles.childName
                                  }
                                >
                                  {
                                    report.child
                                      ?.full_name ||
                                    `Child #${report.session.child_id}`
                                  }
                                </Text>


                                <Text
                                  numberOfLines={
                                    1
                                  }
                                  style={
                                    styles.childRegion
                                  }
                                >
                                  {
                                    report.child
                                      ?.region ||
                                    "No region"
                                  }
                                </Text>

                              </View>


                              <StatusPill
                                status={
                                  completed
                                    ? "completed"
                                    : ended
                                      ? "ended"
                                      : report.status
                                }
                              />

                            </View>


                            <View
                              style={
                                styles.reportMetaGrid
                              }
                            >

                              <MetaItem
                                label="Session"
                                value={`#${report.session.id}`}
                                subvalue={
                                  formatDuration(
                                    report.session
                                  )
                                }
                              />


                              <MetaItem
                                label="Date"
                                value={
                                  formatDate(
                                    report.date
                                  )
                                }
                              />


                              <MetaItem
                                label="Therapist"
                                value={
                                  report.therapists.length >
                                  0
                                    ? report.therapists.join(
                                        ", "
                                      )
                                    : "Unassigned"
                                }
                              />


                              <View
                                style={
                                  styles.scoreMeta
                                }
                              >

                                <Text
                                  style={
                                    styles.metaLabel
                                  }
                                >
                                  Score
                                </Text>


                                <ScorePill
                                  score={
                                    report.score
                                  }
                                />

                              </View>

                            </View>


                            {
                              report.hasFailedGame && (

                                <View
                                  style={
                                    styles.failedFlag
                                  }
                                >

                                  <Text
                                    style={
                                      styles.failedFlagText
                                    }
                                  >
                                    Contains Failed Game
                                  </Text>

                                </View>

                              )
                            }


                            <Pressable
                              style={
                                styles.viewButton
                              }
                              onPress={() =>
                                setSelectedReport(
                                  report
                                )
                              }
                            >

                              <Eye
                                size={15}
                                color="#7264D9"
                              />


                              <Text
                                style={
                                  styles.viewButtonText
                                }
                              >
                                View Report
                              </Text>

                            </Pressable>

                          </View>

                        );

                      }
                    )
                  }

                </View>

              )
        }

      </View>


      <Modal
        visible={
          selectedReport !==
          null
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        presentationStyle="overFullScreen"
        onRequestClose={() =>
          setSelectedReport(
            null
          )
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <Pressable
            style={
              styles.modalBackdrop
            }
            onPress={() =>
              setSelectedReport(
                null
              )
            }
          />


          {
            selectedReport && (

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

                  <View
                    style={
                      styles.modalHeaderMain
                    }
                  >

                    <Text
                      style={
                        styles.modalEyebrow
                      }
                    >
                      ASSESSMENT REPORT
                    </Text>


                    <Text
                      style={
                        styles.modalTitle
                      }
                    >
                      {
                        selectedReport.child
                          ?.full_name ||
                        `Child #${selectedReport.session.child_id}`
                      }
                    </Text>


                    <Text
                      style={
                        styles.modalSubtitle
                      }
                    >
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
                    </Text>

                  </View>


                  <Pressable
                    style={
                      styles.closeButton
                    }
                    onPress={() =>
                      setSelectedReport(
                        null
                      )
                    }
                  >

                    <X
                      size={20}
                      color="#818497"
                    />

                  </Pressable>

                </View>


                <ScrollView
                  showsVerticalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.modalContent
                  }
                >

                  <View
                    style={
                      styles.modalSummary
                    }
                  >

                    <SummaryItem
                      label="Overall Score"
                      value={
                        selectedReport.score ===
                        null
                          ? "—"
                          : `${selectedReport.score}%`
                      }
                    />


                    <SummaryItem
                      label="Duration"
                      value={
                        formatDuration(
                          selectedReport.session
                        )
                      }
                    />


                    <SummaryItem
                      label="Therapist"
                      value={
                        selectedReport.therapists.length >
                        0
                          ? selectedReport.therapists.join(
                              ", "
                            )
                          : "Unassigned"
                      }
                    />


                    <SummaryItem
                      label="Status"
                      value={
                        selectedReport.status ===
                        "completed"
                          ? "Completed"
                          : selectedReport.status ===
                            "ended"
                            ? "Ended"
                            : selectedReport.status ||
                              "Unknown"
                      }
                    />

                  </View>


                  <View
                    style={
                      styles.domainSection
                    }
                  >

                    <View
                      style={
                        styles.domainHeading
                      }
                    >

                      <BarChart3
                        size={18}
                        color="#7868E6"
                      />


                      <Text
                        style={
                          styles.domainTitle
                        }
                      >
                        Cognitive Results
                      </Text>

                    </View>


                    {
                      selectedDomains.length >
                      0
                        ? (

                          <View
                            style={
                              styles.domainList
                            }
                          >

                            {
                              selectedDomains.map(
                                domain => {

                                  const width =
                                    Math.max(
                                      0,
                                      Math.min(
                                        100,
                                        Number(
                                          domain.score
                                        )
                                      )
                                    );


                                  return (

                                    <View
                                      key={
                                        domain.label
                                      }
                                      style={
                                        styles.domainCard
                                      }
                                    >

                                      <View
                                        style={
                                          styles.domainTop
                                        }
                                      >

                                        <Text
                                          style={
                                            styles.domainLabel
                                          }
                                        >
                                          {
                                            domain.label
                                          }
                                        </Text>


                                        <Text
                                          style={
                                            styles.domainScore
                                          }
                                        >
                                          {
                                            Math.round(
                                              Number(
                                                domain.score
                                              )
                                            )
                                          }
                                          %
                                        </Text>

                                      </View>


                                      <View
                                        style={
                                          styles.domainTrack
                                        }
                                      >

                                        <View
                                          style={[
                                            styles.domainFill,

                                            {
                                              width:
                                                `${width}%`,
                                            },
                                          ]}
                                        />

                                      </View>

                                    </View>

                                  );

                                }
                              )
                            }

                          </View>

                        )
                        : (

                          <View
                            style={
                              styles.noDomain
                            }
                          >

                            <Text
                              style={
                                styles.noDomainText
                              }
                            >
                              No detailed game results
                              are available in this
                              session response.
                            </Text>

                          </View>

                        )
                    }

                  </View>


                  <View
                    style={
                      styles.childDetails
                    }
                  >

                    <DetailItem
                      label="Child"
                      value={
                        selectedReport.child
                          ?.full_name ||
                        "—"
                      }
                    />


                    <DetailItem
                      label="Region"
                      value={
                        selectedReport.child
                          ?.region ||
                        "—"
                      }
                    />


                    <DetailItem
                      label="Parent Record"
                      value={
                        selectedReport.child
                          ?.parent_name ||
                        "—"
                      }
                    />

                  </View>

                </ScrollView>

              </View>

            )
          }

        </View>

      </Modal>

    </View>

  );

}


function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon:
    ReactNode;

  label:
    string;

  value:
    string;

  tone:
    | "purple"
    | "green"
    | "blue"
    | "pink";
}) {

  return (

    <View
      style={
        styles.statCard
      }
    >

      <View
        style={[
          styles.statIcon,

          tone ===
            "purple" &&
            styles.statPurple,

          tone ===
            "green" &&
            styles.statGreen,

          tone ===
            "blue" &&
            styles.statBlue,

          tone ===
            "pink" &&
            styles.statPink,
        ]}
      >

        {icon}

      </View>


      <Text
        style={
          styles.statLabel
        }
      >
        {label}
      </Text>


      <Text
        style={
          styles.statValue
        }
      >
        {value}
      </Text>

    </View>

  );

}


function MetaItem({
  label,
  value,
  subvalue,
}: {
  label:
    string;

  value:
    string;

  subvalue?:
    string;
}) {

  return (

    <View
      style={
        styles.metaItem
      }
    >

      <Text
        style={
          styles.metaLabel
        }
      >
        {label}
      </Text>


      <Text
        numberOfLines={
          2
        }
        style={
          styles.metaValue
        }
      >
        {value}
      </Text>


      {
        Boolean(
          subvalue
        ) && (

          <Text
            style={
              styles.metaSubvalue
            }
          >
            {subvalue}
          </Text>

        )
      }

    </View>

  );

}


function ScorePill({
  score,
}: {
  score:
    number | null;
}) {

  const type =
    score ===
    null
      ? "empty"
      : score >=
        70
        ? "good"
        : score >=
          50
          ? "medium"
          : "low";


  return (

    <View
      style={[
        styles.scorePill,

        type ===
          "good" &&
          styles.scoreGood,

        type ===
          "medium" &&
          styles.scoreMedium,

        type ===
          "low" &&
          styles.scoreLow,

        type ===
          "empty" &&
          styles.scoreEmpty,
      ]}
    >

      <Text
        style={[
          styles.scorePillText,

          type ===
            "good" &&
            styles.scoreGoodText,

          type ===
            "medium" &&
            styles.scoreMediumText,

          type ===
            "low" &&
            styles.scoreLowText,

          type ===
            "empty" &&
            styles.scoreEmptyText,
        ]}
      >
        {
          score ===
          null
            ? "—"
            : `${score}%`
        }
      </Text>

    </View>

  );

}


function StatusPill({
  status,
}: {
  status:
    string;
}) {

  const normalized =
    String(
      status ||
      ""
    )
      .trim()
      .toLowerCase();


  const label =
    normalized ===
    "completed"
      ? "Completed"
      : normalized ===
        "ended"
        ? "Ended"
        : normalized ||
          "Unknown";


  return (

    <View
      style={[
        styles.statusPill,

        normalized ===
          "completed" &&
          styles.statusCompleted,

        normalized ===
          "ended" &&
          styles.statusEnded,

        normalized !==
          "completed" &&
        normalized !==
          "ended" &&
          styles.statusUnknown,
      ]}
    >

      <Text
        style={[
          styles.statusPillText,

          normalized ===
            "completed" &&
            styles.statusCompletedText,

          normalized ===
            "ended" &&
            styles.statusEndedText,

          normalized !==
            "completed" &&
          normalized !==
            "ended" &&
            styles.statusUnknownText,
        ]}
      >
        {label}
      </Text>

    </View>

  );

}


function SummaryItem({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {

  return (

    <View
      style={
        styles.summaryItem
      }
    >

      <Text
        style={
          styles.summaryLabel
        }
      >
        {label}
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

}


function DetailItem({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {

  return (

    <View
      style={
        styles.detailItem
      }
    >

      <Text
        style={
          styles.detailLabel
        }
      >
        {label}
      </Text>


      <Text
        style={
          styles.detailValue
        }
      >
        {value}
      </Text>

    </View>

  );

}


function PickerField({
  value,
  placeholder,
  options,
  onSelect,
}: {
  value:
    string;

  placeholder:
    string;

  options:
    PickerOption[];

  onSelect:
    (
      value:
        string
    ) => void;
}) {

  const [
    visible,
    setVisible,
  ] =
    useState(false);


  const selected =
    options.find(
      option =>
        option.value ===
        value
    );


  return (

    <>

      <Pressable
        style={
          styles.pickerField
        }
        onPress={() =>
          setVisible(
            true
          )
        }
      >

        <Text
          numberOfLines={
            1
          }
          style={
            styles.pickerFieldText
          }
        >
          {
            selected
              ?.label ||
            placeholder
          }
        </Text>


        <ChevronDown
          size={17}
          color="#8D90A2"
        />

      </Pressable>


      <Modal
        visible={
          visible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        presentationStyle="overFullScreen"
        onRequestClose={() =>
          setVisible(
            false
          )
        }
      >

        <View
          style={
            styles.pickerOverlay
          }
        >

          <Pressable
            style={
              styles.pickerBackdrop
            }
            onPress={() =>
              setVisible(
                false
              )
            }
          />


          <View
            style={
              styles.pickerCard
            }
          >

            <View
              style={
                styles.pickerHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.pickerEyebrow
                  }
                >
                  FILTER
                </Text>


                <Text
                  style={
                    styles.pickerTitle
                  }
                >
                  {placeholder}
                </Text>

              </View>


              <Pressable
                style={
                  styles.closeButton
                }
                onPress={() =>
                  setVisible(
                    false
                  )
                }
              >

                <X
                  size={20}
                  color="#818497"
                />

              </Pressable>

            </View>


            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              style={
                styles.pickerOptions
              }
            >

              {
                options.map(
                  option => {

                    const active =
                      option.value ===
                      value;


                    return (

                      <Pressable
                        key={
                          option.value ||
                          "__all__"
                        }
                        style={[
                          styles.pickerOption,

                          active &&
                            styles.pickerOptionActive,
                        ]}
                        onPress={() => {

                          onSelect(
                            option.value
                          );


                          setVisible(
                            false
                          );

                        }}
                      >

                        <Text
                          style={[
                            styles.pickerOptionText,

                            active &&
                              styles.pickerOptionTextActive,
                          ]}
                        >
                          {
                            option.label
                          }
                        </Text>


                        {
                          active && (

                            <Check
                              size={17}
                              color="#7868E6"
                            />

                          )
                        }

                      </Pressable>

                    );

                  }
                )
              }

            </ScrollView>

          </View>

        </View>

      </Modal>

    </>

  );

}


const styles =
  StyleSheet.create({

    page: {
      width:
        "100%",
    },


    heading: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        12,
    },


    headingMain: {
      flex:
        1,
    },


    eyebrow: {
      color:
        "#8172EA",

      fontSize:
        10,

      fontWeight:
        "800",

      letterSpacing:
        1,
    },


    title: {
      marginTop:
        6,

      color:
        "#303253",

      fontSize:
        28,

      fontWeight:
        "800",
    },


    subtitle: {
      marginTop:
        5,

      color:
        "#9699AC",

      fontSize:
        13,

      lineHeight:
        19,
    },


    refreshButton: {
      width:
        42,

      height:
        42,

      borderWidth:
        1,

      borderColor:
        "#E7E6F0",

      borderRadius:
        13,

      backgroundColor:
        "#FFFFFF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    disabled: {
      opacity:
        0.5,
    },


    statsGrid: {
      marginTop:
        22,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        10,
    },


    statCard: {
      width:
        "48%",

      minHeight:
        106,

      padding:
        14,

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

      borderRadius:
        18,

      backgroundColor:
        "#FFFFFF",
    },


    statIcon: {
      width:
        35,

      height:
        35,

      borderRadius:
        11,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    statPurple: {
      backgroundColor:
        "#F1EEFF",
    },


    statGreen: {
      backgroundColor:
        "#ECFAF4",
    },


    statBlue: {
      backgroundColor:
        "#EDF6FF",
    },


    statPink: {
      backgroundColor:
        "#FFF0FA",
    },


    statLabel: {
      marginTop:
        9,

      color:
        "#9194A6",

      fontSize:
        10.5,
    },


    statValue: {
      marginTop:
        3,

      color:
        "#383A57",

      fontSize:
        21,

      fontWeight:
        "800",
    },


    errorBox: {
      marginTop:
        14,

      paddingHorizontal:
        14,

      paddingVertical:
        11,

      borderWidth:
        1,

      borderColor:
        "#F3D3DA",

      borderRadius:
        12,

      backgroundColor:
        "#FFF1F4",
    },


    errorText: {
      color:
        "#B74860",

      fontSize:
        11,
    },


    panel: {
      marginTop:
        18,

      padding:
        18,

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

      borderRadius:
        20,

      backgroundColor:
        "#FFFFFF",
    },


    panelHeading: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        12,
    },


    panelHeadingMain: {
      flex:
        1,
    },


    panelTitle: {
      color:
        "#3D3F5C",

      fontSize:
        15,

      fontWeight:
        "800",
    },


    panelSubtitle: {
      marginTop:
        4,

      color:
        "#A0A3B3",

      fontSize:
        10.5,
    },


    panelIcon: {
      width:
        38,

      height:
        38,

      borderRadius:
        12,

      backgroundColor:
        "#F3F0FF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    searchBox: {
      height:
        44,

      marginTop:
        16,

      paddingHorizontal:
        13,

      borderWidth:
        1,

      borderColor:
        "#E7E7EF",

      borderRadius:
        12,

      backgroundColor:
        "#FAFAFC",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        9,
    },


    searchInput: {
      flex:
        1,

      height:
        "100%",

      color:
        "#42445E",

      fontSize:
        11,
    },


    filters: {
      marginTop:
        10,

      gap:
        8,
    },


    pickerField: {
      minHeight:
        44,

      paddingHorizontal:
        12,

      borderWidth:
        1,

      borderColor:
        "#E1E1EA",

      borderRadius:
        11,

      backgroundColor:
        "#FBFBFD",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        8,
    },


    pickerFieldText: {
      flex:
        1,

      color:
        "#57596E",

      fontSize:
        10,
    },


    stateBox: {
      minHeight:
        280,

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        10,
    },


    stateText: {
      color:
        "#999CAB",

      fontSize:
        11,

      textAlign:
        "center",
    },


    emptyTitle: {
      color:
        "#484A66",

      fontSize:
        15,

      fontWeight:
        "800",
    },


    reportList: {
      marginTop:
        15,

      gap:
        11,
    },


    reportCard: {
      padding:
        14,

      borderWidth:
        1,

      borderColor:
        "#EFEFF5",

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",
    },


    reportTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        9,
    },


    avatar: {
      width:
        40,

      height:
        40,

      borderRadius:
        12,

      backgroundColor:
        "#F0EDFF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    avatarText: {
      color:
        "#7465E8",

      fontSize:
        12,

      fontWeight:
        "800",
    },


    reportChildMain: {
      flex:
        1,

      minWidth:
        0,
    },


    childName: {
      color:
        "#41435D",

      fontSize:
        11,

      fontWeight:
        "800",
    },


    childRegion: {
      marginTop:
        3,

      color:
        "#A1A4B4",

      fontSize:
        8.5,
    },


    statusPill: {
      paddingHorizontal:
        8,

      paddingVertical:
        6,

      borderRadius:
        999,
    },


    statusPillText: {
      fontSize:
        8,

      fontWeight:
        "800",
    },


    statusCompleted: {
      backgroundColor:
        "#EDF9F3",
    },


    statusCompletedText: {
      color:
        "#438868",
    },


    statusEnded: {
      backgroundColor:
        "#F2EEFF",
    },


    statusEndedText: {
      color:
        "#7A65C9",
    },


    statusUnknown: {
      backgroundColor:
        "#F1F2F6",
    },


    statusUnknownText: {
      color:
        "#8D90A0",
    },


    reportMetaGrid: {
      marginTop:
        14,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        8,
    },


    metaItem: {
      width:
        "48%",

      minHeight:
        67,

      padding:
        10,

      borderRadius:
        12,

      backgroundColor:
        "#F9F9FC",
    },


    scoreMeta: {
      width:
        "48%",

      minHeight:
        67,

      padding:
        10,

      borderRadius:
        12,

      backgroundColor:
        "#F9F9FC",
    },


    metaLabel: {
      color:
        "#9B9EAE",

      fontSize:
        8.5,
    },


    metaValue: {
      marginTop:
        5,

      color:
        "#55576D",

      fontSize:
        10,

      fontWeight:
        "700",

      lineHeight:
        14,
    },


    metaSubvalue: {
      marginTop:
        2,

      color:
        "#A1A3B2",

      fontSize:
        8,
    },


    scorePill: {
      alignSelf:
        "flex-start",

      marginTop:
        6,

      paddingHorizontal:
        9,

      paddingVertical:
        6,

      borderRadius:
        999,
    },


    scorePillText: {
      fontSize:
        9,

      fontWeight:
        "800",
    },


    scoreGood: {
      backgroundColor:
        "#EDF9F3",
    },


    scoreGoodText: {
      color:
        "#438868",
    },


    scoreMedium: {
      backgroundColor:
        "#FFF7E9",
    },


    scoreMediumText: {
      color:
        "#A77935",
    },


    scoreLow: {
      backgroundColor:
        "#FFF0F2",
    },


    scoreLowText: {
      color:
        "#B95667",
    },


    scoreEmpty: {
      backgroundColor:
        "#F1F2F6",
    },


    scoreEmptyText: {
      color:
        "#8D90A0",
    },


    failedFlag: {
      alignSelf:
        "flex-start",

      marginTop:
        10,

      paddingHorizontal:
        9,

      paddingVertical:
        5,

      borderRadius:
        999,

      backgroundColor:
        "#FFF0F2",
    },


    failedFlagText: {
      color:
        "#B95667",

      fontSize:
        8,

      fontWeight:
        "700",
    },


    viewButton: {
      height:
        39,

      marginTop:
        12,

      borderWidth:
        1,

      borderColor:
        "#E9E8F2",

      borderRadius:
        11,

      backgroundColor:
        "#F9F8FF",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        6,
    },


    viewButtonText: {
      color:
        "#7264D9",

      fontSize:
        9.5,

      fontWeight:
        "700",
    },


    modalOverlay: {
      flex:
        1,

      padding:
        18,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    modalBackdrop: {
      position:
        "absolute",

      top:
        0,

      right:
        0,

      bottom:
        0,

      left:
        0,

      backgroundColor:
        "rgba(37,35,64,.40)",
    },


    modalCard: {
      width:
        "100%",

      maxWidth:
        720,

      maxHeight:
        "88%",

      padding:
        20,

      borderRadius:
        22,

      backgroundColor:
        "#FFFFFF",

      elevation:
        15,
    },


    modalHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        15,

      paddingBottom:
        16,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#EFEFF5",
    },


    modalHeaderMain: {
      flex:
        1,
    },


    modalEyebrow: {
      color:
        "#7C6BE5",

      fontSize:
        9,

      fontWeight:
        "800",

      letterSpacing:
        1,
    },


    modalTitle: {
      marginTop:
        6,

      color:
        "#3E405B",

      fontSize:
        20,

      fontWeight:
        "800",
    },


    modalSubtitle: {
      marginTop:
        4,

      color:
        "#989BAC",

      fontSize:
        10,
    },


    closeButton: {
      width:
        36,

      height:
        36,

      borderRadius:
        11,

      backgroundColor:
        "#F5F5F9",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    modalContent: {
      paddingBottom:
        24,
    },


    modalSummary: {
      marginTop:
        17,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        9,
    },


    summaryItem: {
      width:
        "48%",

      minHeight:
        73,

      padding:
        12,

      borderRadius:
        13,

      backgroundColor:
        "#F9F9FC",
    },


    summaryLabel: {
      color:
        "#9B9EAE",

      fontSize:
        8.5,
    },


    summaryValue: {
      marginTop:
        6,

      color:
        "#4B4D66",

      fontSize:
        11,

      lineHeight:
        15,

      fontWeight:
        "700",
    },


    domainSection: {
      marginTop:
        18,
    },


    domainHeading: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        7,

      marginBottom:
        11,
    },


    domainTitle: {
      color:
        "#51536B",

      fontSize:
        12,

      fontWeight:
        "800",
    },


    domainList: {
      gap:
        8,
    },


    domainCard: {
      padding:
        11,

      borderWidth:
        1,

      borderColor:
        "#EFEFF4",

      borderRadius:
        12,
    },


    domainTop: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap:
        10,
    },


    domainLabel: {
      color:
        "#74778B",

      fontSize:
        9.5,
    },


    domainScore: {
      color:
        "#5D55B8",

      fontSize:
        10,

      fontWeight:
        "800",
    },


    domainTrack: {
      height:
        7,

      marginTop:
        8,

      overflow:
        "hidden",

      borderRadius:
        999,

      backgroundColor:
        "#ECECF4",
    },


    domainFill: {
      height:
        "100%",

      borderRadius:
        999,

      backgroundColor:
        "#7868E7",
    },


    noDomain: {
      padding:
        18,

      borderRadius:
        12,

      backgroundColor:
        "#F9F9FC",
    },


    noDomainText: {
      color:
        "#A0A2B1",

      textAlign:
        "center",

      fontSize:
        9.5,

      lineHeight:
        14,
    },


    childDetails: {
      marginTop:
        17,

      paddingTop:
        17,

      borderTopWidth:
        1,

      borderTopColor:
        "#EFEFF5",

      gap:
        9,
    },


    detailItem: {
      padding:
        11,

      borderRadius:
        11,

      backgroundColor:
        "#FAFAFC",
    },


    detailLabel: {
      color:
        "#A0A2B1",

      fontSize:
        8.5,
    },


    detailValue: {
      marginTop:
        4,

      color:
        "#5A5C73",

      fontSize:
        10,

      fontWeight:
        "700",
    },


    pickerOverlay: {
      flex:
        1,

      padding:
        22,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    pickerBackdrop: {
      position:
        "absolute",

      top:
        0,

      right:
        0,

      bottom:
        0,

      left:
        0,

      backgroundColor:
        "rgba(37,35,64,.46)",
    },


    pickerCard: {
      width:
        "100%",

      maxWidth:
        500,

      maxHeight:
        "70%",

      padding:
        18,

      borderRadius:
        21,

      backgroundColor:
        "#FFFFFF",

      elevation:
        15,
    },


    pickerHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingBottom:
        14,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#EFEFF5",
    },


    pickerEyebrow: {
      color:
        "#7C6BE5",

      fontSize:
        8.5,

      fontWeight:
        "800",

      letterSpacing:
        1,
    },


    pickerTitle: {
      marginTop:
        4,

      color:
        "#3E405B",

      fontSize:
        18,

      fontWeight:
        "800",
    },


    pickerOptions: {
      marginTop:
        10,
    },


    pickerOption: {
      minHeight:
        52,

      paddingHorizontal:
        12,

      marginBottom:
        7,

      borderRadius:
        12,

      backgroundColor:
        "#F9F9FC",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        10,
    },


    pickerOptionActive: {
      backgroundColor:
        "#F1EEFF",
    },


    pickerOptionText: {
      color:
        "#55576D",

      fontSize:
        10.5,

      fontWeight:
        "700",
    },


    pickerOptionTextActive: {
      color:
        "#7465DE",
    },

  });