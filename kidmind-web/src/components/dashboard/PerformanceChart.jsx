import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Card from "../ui/Card";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  getSessions,
} from "../../api/sessionsApi";


const domainConfigs = [
  {
    key: "attention",
    label: "Attention",
    gameName: "focus finder",
    color: "#7B6EF6",
  },
  {
    key: "memory",
    label: "Working Memory",
    gameName: "memory match",
    color: "#63B3ED",
  },
  {
    key: "reading",
    label: "Reading",
    gameName: "reading adventure",
    color: "#48BB78",
  },
  {
    key: "visualSpatial",
    label: "Visual-Spatial",
    gameName: "puzzle path",
    color: "#F6AD55",
  },
  {
    key: "processingSpeed",
    label: "Processing Speed",
    gameName: "quick match",
    color: "#38BDF8",
  },
];


const normalizeGameName = (
  value
) => {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

};


const getGameDate = (
  game,
  session
) => {

  const value =
    game.ended_at ||
    game.started_at ||
    game.updated_at ||
    game.created_at ||
    session.ended_at ||
    session.started_at ||
    session.scheduled_at ||
    session.created_at;


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


const getWeekNumber = (
  date
) => {

  const day =
    date.getDate();


  if (day <= 7) {
    return 1;
  }


  if (day <= 14) {
    return 2;
  }


  if (day <= 21) {
    return 3;
  }


  return 4;

};


const getSelectedMonth = (
  period
) => {

  const now =
    new Date();


  if (
    period ===
    "last"
  ) {

    return new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

  }


  return new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

};


const PerformanceChart = () => {

  const [
    sessions,
    setSessions,
  ] = useState([]);


  const [
    period,
    setPeriod,
  ] = useState(
    "current"
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {

    const loadPerformance =
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
            "Failed to load dashboard performance:",
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


    loadPerformance();

  }, []);


  const chartData =
    useMemo(
      () => {

        const selectedMonth =
          getSelectedMonth(
            period
          );


        const selectedYear =
          selectedMonth
            .getFullYear();


        const selectedMonthIndex =
          selectedMonth
            .getMonth();


        const weeklyValues = [
          {},
          {},
          {},
          {},
        ];


        sessions.forEach(
          (session) => {

            if (
              !Array.isArray(
                session.games
              )
            ) {
              return;
            }


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
                    selectedYear ||
                  date.getMonth() !==
                    selectedMonthIndex
                ) {
                  return;
                }


                const domain =
                  domainConfigs.find(
                    (item) =>
                      item.gameName ===
                      normalizeGameName(
                        game.game_name
                      )
                  );


                if (!domain) {
                  return;
                }


                const weekIndex =
                  getWeekNumber(
                    date
                  ) - 1;


                if (
                  !weeklyValues[
                    weekIndex
                  ][domain.key]
                ) {

                  weeklyValues[
                    weekIndex
                  ][domain.key] =
                    [];

                }


                weeklyValues[
                  weekIndex
                ][domain.key]
                  .push(
                    Math.max(
                      0,
                      Math.min(
                        100,
                        score
                      )
                    )
                  );

              });

          }
        );


        return weeklyValues.map(
          (
            week,
            index
          ) => {

            const item = {
              week:
                `Week ${index + 1}`,
            };


            domainConfigs.forEach(
              (domain) => {

                const values =
                  week[
                    domain.key
                  ] || [];


                item[
                  domain.key
                ] =
                  values.length > 0
                    ? Math.round(
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
                      )
                    : null;

              }
            );


            return item;

          }
        );

      },
      [
        sessions,
        period,
      ]
    );


  const hasData =
    chartData.some(
      (week) =>
        domainConfigs.some(
          (domain) =>
            typeof week[
              domain.key
            ] === "number"
        )
    );


  return (

    <Card>

      <div
        className="
        flex
        justify-between
        items-center
        mb-8
        gap-4
        "
      >

        <div>

          <h2
            className="
            text-xl
            font-semibold
            "
          >
            Cognitive Performance
          </h2>

          <p
            className="
            text-slate-400
            text-sm
            mt-1
            "
          >
            Children's average cognitive performance by week
          </p>

        </div>


        <select
          value={
            period
          }
          onChange={(
            event
          ) => {
            setPeriod(
              event.target.value
            );
          }}
          className="
          border
          rounded-xl
          px-4
          py-2
          text-sm
          outline-none
          bg-white
          "
        >

          <option
            value="current"
          >
            This Month
          </option>

          <option
            value="last"
          >
            Last Month
          </option>

        </select>

      </div>


      {loading && (

        <div
          className="
          h-[340px]
          flex
          items-center
          justify-center
          "
        >

          <div
            className="
            text-center
            "
          >

            <div
              className="
              w-10
              h-10
              border-4
              border-[#E6E2FF]
              border-t-[#7B6EF6]
              rounded-full
              animate-spin
              mx-auto
              "
            />

            <p
              className="
              text-sm
              text-slate-400
              mt-3
              "
            >
              Loading performance...
            </p>

          </div>

        </div>

      )}


      {!loading &&
        error && (

        <div
          className="
          h-[340px]
          flex
          items-center
          justify-center
          "
        >

          <div
            className="
            text-center
            bg-red-50
            border
            border-red-100
            rounded-2xl
            p-6
            "
          >

            <p
              className="
              font-semibold
              text-red-700
              "
            >
              Unable to load performance
            </p>

            <p
              className="
              text-sm
              text-red-500
              mt-1
              "
            >
              {error}
            </p>

          </div>

        </div>

      )}


      {!loading &&
        !error &&
        !hasData && (

        <div
          className="
          h-[340px]
          flex
          items-center
          justify-center
          "
        >

          <div
            className="
            text-center
            "
          >

            <p
              className="
              font-semibold
              text-slate-600
              "
            >
              No assessment data
            </p>

            <p
              className="
              text-sm
              text-slate-400
              mt-1
              "
            >
              No completed game results are available for this period.
            </p>

          </div>

        </div>

      )}


      {!loading &&
        !error &&
        hasData && (

        <ResponsiveContainer
          width="100%"
          height={340}
        >

          <LineChart
            data={
              chartData
            }
          >

            <CartesianGrid
              stroke="#ECECF5"
              strokeDasharray="5 5"
            />

            <XAxis
              dataKey="week"
            />

            <YAxis
              domain={[
                0,
                100
              ]}
            />

            <Tooltip
              formatter={(
                value
              ) =>
                value ===
                  null ||
                value ===
                  undefined
                  ? "No data"
                  : `${value}%`
              }
            />


            {domainConfigs.map(
              (domain) => (

                <Line
                  key={
                    domain.key
                  }
                  type="monotone"
                  dataKey={
                    domain.key
                  }
                  name={
                    domain.label
                  }
                  stroke={
                    domain.color
                  }
                  strokeWidth={3}
                  connectNulls={
                    false
                  }
                  dot={{
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

              )
            )}

          </LineChart>

        </ResponsiveContainer>

      )}


      <div
        className="
        flex
        gap-6
        mt-6
        flex-wrap
        "
      >

        {domainConfigs.map(
          (domain) => (

            <div
              key={
                domain.key
              }
              className="
              flex
              items-center
              gap-2
              "
            >

              <div
                className="
                w-3
                h-3
                rounded-full
                "
                style={{
                  backgroundColor:
                    domain.color,
                }}
              />

              <span
                className="
                text-sm
                text-slate-500
                "
              >
                {domain.label}
              </span>

            </div>

          )
        )}

      </div>

    </Card>

  );

};


export default PerformanceChart;