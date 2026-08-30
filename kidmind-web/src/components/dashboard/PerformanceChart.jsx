import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
} from "lucide-react";

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


  useEffect(
    () => {

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

          } catch (
            loadError
          ) {

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

    },
    []
  );


  const chartData =
    useMemo(
      () => {

        const selectedMonth =
          getSelectedMonth(
            period
          );


        const selectedYear =
          selectedMonth.getFullYear();


        const selectedMonthIndex =
          selectedMonth.getMonth();


        const weeklyValues = [
          {},
          {},
          {},
          {},
        ];


        sessions.forEach(
          session => {

            if (
              !Array.isArray(
                session.games
              )
            ) {
              return;
            }


            session.games.forEach(
              game => {

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
                    item =>
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
                  ][
                    domain.key
                  ]
                ) {

                  weeklyValues[
                    weekIndex
                  ][
                    domain.key
                  ] = [];

                }


                weeklyValues[
                  weekIndex
                ][
                  domain.key
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
              domain => {

                const values =
                  week[
                    domain.key
                  ] || [];


                item[
                  domain.key
                ] =
                  values.length >
                  0
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
      week =>
        domainConfigs.some(
          domain =>
            typeof week[
              domain.key
            ] === "number"
        )
    );


  return (

    <section className="performance-panel">

      <div className="performance-heading">

        <div className="performance-title">

          <div className="performance-icon">

            <Activity
              size={18}
            />

          </div>


          <div>

            <h2>
              Cognitive Performance
            </h2>

            <p>
              Average cognitive performance
              by week
            </p>

          </div>

        </div>


        <select
          value={
            period
          }
          onChange={
            event =>
              setPeriod(
                event.target.value
              )
          }
        >

          <option value="current">
            This Month
          </option>

          <option value="last">
            Last Month
          </option>

        </select>

      </div>


      {
        loading && (

          <div className="performance-state">

            <div>

              <div className="performance-loader" />

              <p>
                Loading performance...
              </p>

            </div>

          </div>

        )
      }


      {
        !loading &&
        error && (

          <div className="performance-state">

            <div className="performance-error">

              <strong>
                Unable to load performance
              </strong>

              <span>
                {error}
              </span>

            </div>

          </div>

        )
      }


      {
        !loading &&
        !error &&
        !hasData && (

          <div className="performance-state">

            <div className="performance-empty">

              <strong>
                No assessment data
              </strong>

              <span>
                No completed game results are
                available for this period.
              </span>

            </div>

          </div>

        )
      }


      {
        !loading &&
        !error &&
        hasData && (

          <div className="performance-chart">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={
                  chartData
                }
                margin={{
                  top: 8,
                  right: 12,
                  left: -15,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  stroke="#ECECF5"
                  strokeDasharray="5 5"
                  vertical={false}
                />


                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#989BAD",
                    fontSize: 11,
                  }}
                />


                <YAxis
                  domain={[
                    0,
                    100,
                  ]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#989BAD",
                    fontSize: 11,
                  }}
                />


                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border:
                      "1px solid #ECECF4",
                    boxShadow:
                      "0 8px 28px rgba(68,68,110,.08)",
                    fontSize: 12,
                  }}
                  formatter={
                    value =>
                      value ===
                        null ||
                      value ===
                        undefined
                        ? "No data"
                        : `${value}%`
                  }
                />


                {
                  domainConfigs.map(
                    domain => (

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
                        strokeWidth={2.5}
                        connectNulls={false}
                        dot={{
                          r: 3.5,
                        }}
                        activeDot={{
                          r: 5,
                        }}
                      />

                    )
                  )
                }

              </LineChart>

            </ResponsiveContainer>

          </div>

        )
      }


      <div className="performance-legend">

        {
          domainConfigs.map(
            domain => (

              <div
                key={
                  domain.key
                }
              >

                <span
                  style={{
                    backgroundColor:
                      domain.color,
                  }}
                />

                {
                  domain.label
                }

              </div>

            )
          )
        }

      </div>


      <style>
        {`

        .performance-panel {
          min-width: 0;
          height: 100%;
          padding: 22px;
          border-radius: 22px;
          background: white;
          border: 1px solid #ECECF4;
          box-shadow:
            0 8px 26px
            rgba(68,68,110,.035);
        }

        .performance-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .performance-title {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .performance-icon {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #7465E8;
          background: #F0EDFF;
        }

        .performance-title h2 {
          margin: 0;
          color: #333554;
          font-size: 16px;
          line-height: 1.3;
        }

        .performance-title p {
          margin: 4px 0 0;
          color: #A0A3B4;
          font-size: 11.5px;
        }

        .performance-heading select {
          height: 37px;
          padding: 0 34px 0 12px;
          border-radius: 11px;
          border: 1px solid #E7E7F0;
          outline: none;
          color: #6E7188;
          background: white;
          font-size: 11.5px;
          cursor: pointer;
        }

        .performance-heading select:focus {
          border-color: #CFC7FF;
        }

        .performance-chart {
          width: 100%;
          min-width: 0;
          padding-top: 7px;
        }

        .performance-state {
          min-height: 300px;
          display: grid;
          place-items: center;
          text-align: center;
        }

        .performance-loader {
          width: 36px;
          height: 36px;
          margin: auto;
          border: 4px solid #E6E2FF;
          border-top-color: #7B6EF6;
          border-radius: 50%;
          animation:
            therapist-spin .8s
            linear infinite;
        }

        .performance-state p {
          margin: 11px 0 0;
          color: #A0A3B4;
          font-size: 12px;
        }

        .performance-error,
        .performance-empty {
          max-width: 360px;
          display: flex;
          flex-direction: column;
        }

        .performance-error {
          padding: 18px 22px;
          border-radius: 15px;
          color: #B9415E;
          background: #FFF0F3;
          border: 1px solid #F6D8DF;
        }

        .performance-error strong,
        .performance-empty strong {
          font-size: 13px;
        }

        .performance-error span,
        .performance-empty span {
          margin-top: 5px;
          font-size: 11px;
          line-height: 1.5;
        }

        .performance-empty {
          color: #8E91A4;
        }

        .performance-empty strong {
          color: #62657B;
        }

        .performance-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 9px 18px;
          margin-top: 13px;
          padding-top: 15px;
          border-top: 1px solid #F1F1F6;
        }

        .performance-legend div {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #888B9E;
          font-size: 10.5px;
        }

        .performance-legend span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        @keyframes therapist-spin {

          to {
            transform: rotate(360deg);
          }

        }

        `}
      </style>

    </section>

  );

};


export default PerformanceChart;