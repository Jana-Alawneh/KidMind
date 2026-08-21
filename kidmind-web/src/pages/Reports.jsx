import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  CalendarDays,
  FileText,
  Gamepad2,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import { getSessions } from "../api/sessionsApi";
import { getChildren } from "../api/childrenApi";


const REPORTABLE_STATUSES =
  new Set([
    "Completed",
    "Ended",
  ]);


const parseDate = (value) => {

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
  session
) => {

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


const getTimestamp = (
  date
) => {

  return (
    date?.getTime() ??
    0
  );

};


const formatDate = (
  date
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
  date
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
  value
) => {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

};


const getSessionScore = (
  session
) => {

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
        (game) =>
          game.status ===
            "Completed" ||
          game.status ===
            "Failed"
      )
      .map(
        (game) =>
          Number(
            game.score
          )
      )
      .filter(
        (score) =>
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


const getGamesText = (
  session
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
        (game) =>
          game.game_name
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
                  (session) =>
                    REPORTABLE_STATUSES.has(
                      session.status
                    )
                )
                .map(
                  (session) => {

                    const child =
                      children.find(
                        (item) =>
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

          } catch (loadError) {

            console.error(
              "Failed to load reports:",
              loadError
            );


            setError(
              loadError?.message ||
              "Failed to load reports"
            );

          } finally {

            setLoading(
              false
            );

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
          (report) => {

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
            (
              [
                id,
                name,
              ]
            ) => ({
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
      [
        reports,
      ]
    );


  const gameOptions =
    useMemo(
      () => {

        const map =
          new Map();


        reports.forEach(
          (report) => {

            report.reportGames.forEach(
              (game) => {

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
          );

      },
      [
        reports,
      ]
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
                (game) =>
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
      () =>
        reports.filter(
          (report) =>
            matchesDateFilter(
              report.reportDate,
              "today"
            )
        ).length,
      [
        reports,
      ]
    );


  const monthReports =
    useMemo(
      () =>
        reports.filter(
          (report) =>
            matchesDateFilter(
              report.reportDate,
              "thisMonth"
            )
        ),
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
              (score) =>
                typeof score ===
                "number"
            );


        if (
          scores.length ===
          0
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
      [
        reports,
      ]
    );


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


  return (

    <div
      className="
        flex
        bg-[#F7F8FC]
        min-h-screen
      "
    >

      <Sidebar />


      <main
        className="
          flex-1
          p-10
          overflow-y-auto
        "
      >

        <Navbar />


        <div
          className="
            flex
            items-start
            justify-between
            gap-6
            mt-8
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-[#EEE9FF]
                  flex
                  items-center
                  justify-center
                "
              >

                <FileText
                  size={24}
                  className="
                    text-[#7B6EF6]
                  "
                />

              </div>


              <div>

                <h1
                  className="
                    text-3xl
                    font-bold
                    text-slate-900
                  "
                >
                  Reports
                </h1>


                <p
                  className="
                    text-slate-500
                    mt-1
                  "
                >
                  Review assessment reports across all children and sessions
                </p>

              </div>

            </div>

          </div>

        </div>


        <div
          className="
            grid
            grid-cols-4
            gap-5
            mt-8
          "
        >

          <SummaryCard
            icon={FileText}
            label="Total Reports"
            value={
              loading
                ? "..."
                : reports.length
            }
            background="#EEE9FF"
            color="#7B6EF6"
          />


          <SummaryCard
            icon={CalendarDays}
            label="Today"
            value={
              loading
                ? "..."
                : todayCount
            }
            background="#EAF7FF"
            color="#3B82F6"
          />


          <SummaryCard
            icon={BarChart3}
            label="This Month"
            value={
              loading
                ? "..."
                : monthReports.length
            }
            background="#EEF8E8"
            color="#16A34A"
          />


          <SummaryCard
            icon={Gamepad2}
            label="Average Score"
            value={
              loading
                ? "..."
                : averageScore ===
                    null
                ? "—"
                : `${averageScore}%`
            }
            background="#FFF4E8"
            color="#F59E0B"
          />

        </div>


        <div
          className="
            bg-white
            rounded-2xl
            border
            border-slate-100
            shadow-sm
            p-6
            mt-8
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              mb-5
            "
          >

            <div>

              <h2
                className="
                  text-lg
                  font-semibold
                  text-slate-900
                "
              >
                Filter Reports
              </h2>


              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                "
              >
                Filter by child, assessment game, or date
              </p>

            </div>


            <button
              type="button"
              onClick={
                clearFilters
              }
              className="
                text-sm
                font-semibold
                text-[#7B6EF6]
                hover:text-[#6959F5]
              "
            >
              Clear Filters
            </button>

          </div>


          <div
            className="
              grid
              grid-cols-3
              gap-4
            "
          >

            <FilterSelect
              icon={UserRound}
              label="Child"
              value={
                childFilter
              }
              onChange={
                setChildFilter
              }
            >

              <option value="all">
                All Children
              </option>


              {childOptions.map(
                (child) => (

                  <option
                    key={
                      child.id
                    }
                    value={
                      child.id
                    }
                  >
                    {child.name}
                  </option>

                )
              )}

            </FilterSelect>


            <FilterSelect
              icon={Gamepad2}
              label="Game"
              value={
                gameFilter
              }
              onChange={
                setGameFilter
              }
            >

              <option value="all">
                All Games
              </option>


              {gameOptions.map(
                (game) => (

                  <option
                    key={
                      game.value
                    }
                    value={
                      game.value
                    }
                  >
                    {game.label}
                  </option>

                )
              )}

            </FilterSelect>


            <FilterSelect
              icon={CalendarDays}
              label="Date"
              value={
                dateFilter
              }
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

        </div>


        <div
          className="
            bg-white
            rounded-2xl
            border
            border-slate-100
            shadow-sm
            mt-8
            overflow-hidden
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              px-6
              py-5
              border-b
              border-slate-100
            "
          >

            <div>

              <h2
                className="
                  text-xl
                  font-semibold
                  text-slate-900
                "
              >
                Assessment Reports
              </h2>


              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                "
              >
                {loading
                  ? "Loading reports..."
                  : `${filteredReports.length} report${filteredReports.length === 1 ? "" : "s"} found`
                }
              </p>

            </div>

          </div>


          {loading && (

            <div
              className="
                min-h-[280px]
                flex
                items-center
                justify-center
                text-slate-400
              "
            >
              Loading reports...
            </div>

          )}


          {!loading &&
            error && (

            <div
              className="
                min-h-[260px]
                flex
                items-center
                justify-center
                p-8
              "
            >

              <div
                className="
                  bg-red-50
                  border
                  border-red-100
                  rounded-2xl
                  px-8
                  py-6
                  text-center
                "
              >

                <p
                  className="
                    text-red-600
                    font-semibold
                  "
                >
                  Unable to load reports
                </p>


                <p
                  className="
                    text-red-500
                    text-sm
                    mt-2
                  "
                >
                  {error}
                </p>

              </div>

            </div>

          )}


          {!loading &&
            !error &&
            filteredReports.length ===
              0 && (

            <div
              className="
                min-h-[300px]
                flex
                items-center
                justify-center
                text-center
                p-8
              "
            >

              <div>

                <div
                  className="
                    w-16
                    h-16
                    rounded-2xl
                    bg-[#F3F0FF]
                    flex
                    items-center
                    justify-center
                    mx-auto
                  "
                >

                  <FileText
                    size={30}
                    className="
                      text-[#7B6EF6]
                    "
                  />

                </div>


                <h3
                  className="
                    text-lg
                    font-semibold
                    text-slate-700
                    mt-4
                  "
                >
                  No reports found
                </h3>


                <p
                  className="
                    text-sm
                    text-slate-400
                    mt-2
                  "
                >
                  Try changing the selected filters.
                </p>

              </div>

            </div>

          )}


          {!loading &&
            !error &&
            filteredReports.length >
              0 && (

            <div
              className="
                overflow-x-auto
              "
            >

              <table
                className="
                  w-full
                  text-left
                "
              >

                <thead
                  className="
                    bg-slate-50
                    text-xs
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >

                  <tr>

                    <th className="px-6 py-4">
                      Child
                    </th>

                    <th className="px-6 py-4">
                      Session
                    </th>

                    <th className="px-6 py-4">
                      Assessment
                    </th>

                    <th className="px-6 py-4">
                      Score
                    </th>

                    <th className="px-6 py-4">
                      Date
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right">
                      Report
                    </th>

                  </tr>

                </thead>


                <tbody
                  className="
                    divide-y
                    divide-slate-100
                  "
                >

                  {filteredReports.map(
                    (report) => (

                      <tr
                        key={
                          report.id
                        }
                        className="
                          hover:bg-slate-50/70
                          transition-colors
                        "
                      >

                        <td
                          className="
                            px-6
                            py-5
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-3
                            "
                          >

                            <div
                              className="
                                w-10
                                h-10
                                rounded-xl
                                bg-[#EEE9FF]
                                flex
                                items-center
                                justify-center
                                shrink-0
                              "
                            >

                              <UserRound
                                size={19}
                                className="
                                  text-[#7B6EF6]
                                "
                              />

                            </div>


                            <div>

                              <p
                                className="
                                  font-semibold
                                  text-slate-800
                                "
                              >
                                {report.reportChildName}
                              </p>


                              <p
                                className="
                                  text-xs
                                  text-slate-400
                                  mt-1
                                "
                              >
                                ID #{report.child_id}
                              </p>

                            </div>

                          </div>

                        </td>


                        <td
                          className="
                            px-6
                            py-5
                          "
                        >

                          <p
                            className="
                              font-semibold
                              text-slate-700
                            "
                          >
                            Session #{report.id}
                          </p>

                        </td>


                        <td
                          className="
                            px-6
                            py-5
                            max-w-[240px]
                          "
                        >

                          <p
                            className="
                              text-sm
                              font-medium
                              text-slate-700
                            "
                          >
                            {report.reportGamesText}
                          </p>


                          {report.reportGames.length >
                            1 && (

                            <p
                              className="
                                text-xs
                                text-slate-400
                                mt-1
                                truncate
                              "
                            >
                              {report.reportGames
                                .map(
                                  (game) =>
                                    game.game_name
                                )
                                .filter(
                                  Boolean
                                )
                                .join(
                                  ", "
                                )
                              }
                            </p>

                          )}

                        </td>


                        <td
                          className="
                            px-6
                            py-5
                          "
                        >

                          <span
                            className="
                              inline-flex
                              items-center
                              justify-center
                              min-w-[58px]
                              px-3
                              py-1.5
                              rounded-xl
                              bg-[#F3F0FF]
                              text-[#6D5CE7]
                              font-bold
                            "
                          >
                            {typeof report.reportScore ===
                            "number"
                              ? `${report.reportScore}%`
                              : "—"
                            }
                          </span>

                        </td>


                        <td
                          className="
                            px-6
                            py-5
                          "
                        >

                          <p
                            className="
                              text-sm
                              font-medium
                              text-slate-700
                            "
                          >
                            {formatDate(
                              report.reportDate
                            )}
                          </p>


                          <p
                            className="
                              text-xs
                              text-slate-400
                              mt-1
                            "
                          >
                            {formatTime(
                              report.reportDate
                            )}
                          </p>

                        </td>


                        <td
                          className="
                            px-6
                            py-5
                          "
                        >

                          <span
                            className={`
                              inline-flex
                              px-3
                              py-1.5
                              rounded-full
                              text-xs
                              font-semibold
                              ${
                                report.status ===
                                "Completed"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }
                            `}
                          >
                            {report.status}
                          </span>

                        </td>


                        <td
                          className="
                            px-6
                            py-5
                            text-right
                          "
                        >

                          <button
                            type="button"
                            onClick={() => {

                              navigate(
                                `/assessment-report?sessionId=${report.id}`
                              );

                            }}
                            className="
                              bg-[#7B6EF6]
                              hover:bg-[#6959F5]
                              text-white
                              text-sm
                              font-semibold
                              px-4
                              py-2.5
                              rounded-xl
                              transition-colors
                              whitespace-nowrap
                            "
                          >
                            View Report
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>

  );

};


const SummaryCard = ({
  icon: Icon,
  label,
  value,
  background,
  color,
}) => {

  return (

    <div
      className="
        bg-white
        border
        border-slate-100
        rounded-2xl
        p-5
        shadow-sm
      "
    >

      <div
        className="
          flex
          items-center
          gap-4
        "
      >

        <div
          className="
            w-12
            h-12
            rounded-2xl
            flex
            items-center
            justify-center
          "
          style={{
            backgroundColor:
              background,
          }}
        >

          <Icon
            size={22}
            style={{
              color,
            }}
          />

        </div>


        <div>

          <p
            className="
              text-sm
              text-slate-500
            "
          >
            {label}
          </p>


          <p
            className="
              text-2xl
              font-bold
              text-slate-900
              mt-1
            "
          >
            {value}
          </p>

        </div>

      </div>

    </div>

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

      <span
        className="
          block
          text-sm
          font-medium
          text-slate-600
          mb-2
        "
      >
        {label}
      </span>


      <div
        className="
          relative
        "
      >

        <Icon
          size={18}
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-slate-400
            pointer-events-none
          "
        />


        <select
          value={
            value
          }
          onChange={
            (event) =>
              onChange(
                event.target.value
              )
          }
          className="
            w-full
            h-12
            pl-11
            pr-4
            rounded-xl
            border
            border-slate-200
            bg-white
            text-sm
            text-slate-700
            outline-none
            focus:border-[#7B6EF6]
            focus:ring-2
            focus:ring-[#7B6EF6]/10
          "
        >
          {children}
        </select>

      </div>

    </label>

  );

};


export default Reports;