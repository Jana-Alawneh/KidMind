import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  TrendingUp,
} from "lucide-react";

import Card from "../ui/Card";

import {
  getSessions,
} from "../../api/sessionsApi";


const gameDomainMap = {
  "focus finder": "attention",
  "memory match": "memory",
  "puzzle path": "visualSpatial",
  "reading adventure": "reading",
  "quick match": "processingSpeed",
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


const getSessionTimestamp = (
  session
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


const getDomainScores = (
  session
) => {

  const values = {
    attention: [],
    memory: [],
    visualSpatial: [],
    reading: [],
    processingSpeed: [],
  };


  if (
    !Array.isArray(
      session.games
    )
  ) {
    return values;
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


  return values;

};


const getAverage = (
  values
) => {

  if (
    !Array.isArray(values) ||
    values.length === 0
  ) {
    return null;
  }


  return Math.round(
    values.reduce(
      (
        total,
        value
      ) =>
        total + value,
      0
    ) /
      values.length
  );

};


const buildSessionPoint = (
  session
) => {

  const domainScores =
    getDomainScores(
      session
    );


  const attention =
    getAverage(
      domainScores.attention
    );

  const memory =
    getAverage(
      domainScores.memory
    );

  const visualSpatial =
    getAverage(
      domainScores.visualSpatial
    );

  const reading =
    getAverage(
      domainScores.reading
    );

  const processingSpeed =
    getAverage(
      domainScores.processingSpeed
    );


  const availableScores = [
    attention,
    memory,
    visualSpatial,
    reading,
    processingSpeed,
  ].filter(
    (value) =>
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
              total + value,
            0
          ) /
            availableScores.length
        )
      : null;


  return {
    session:
      `#${session.id}`,

    sessionId:
      session.id,

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
  data
) => {

  const scoredSessions =
    data.filter(
      (item) =>
        typeof item.overall ===
          "number" &&
        Number.isFinite(
          item.overall
        )
    );


  if (
    scoredSessions.length < 2
  ) {
    return {
      label:
        "Not enough data",

      className:
        "bg-[#F5F5F8] text-[#777A8F]",
    };
  }


  const first =
    scoredSessions[0]
      .overall;

  const last =
    scoredSessions[
      scoredSessions.length - 1
    ].overall;


  const difference =
    last - first;


  if (
    difference > 2
  ) {
    return {
      label:
        "Improving",

      className:
        "bg-[#ECFAF4] text-[#3E9E7D]",
    };
  }


  if (
    difference < -2
  ) {
    return {
      label:
        "Declining",

      className:
        "bg-[#FFF0F3] text-[#C4556C]",
    };
  }


  return {
    label:
      "Stable",

    className:
      "bg-[#F3F0FF] text-[#7566EB]",
  };

};


const ProgressChart = () => {

  const {
    id,
  } = useParams();


  const childId =
    Number(id);


  const [
    data,
    setData,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {

    const loadProgress =
      async () => {

        if (
          !Number.isInteger(
            childId
          ) ||
          childId <= 0
        ) {

          setData([]);
          setLoading(false);

          return;

        }


        try {

          setLoading(true);

          setError("");


          const sessions =
            await getSessions();


          const childCompletedSessions =
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
                (session) =>
                  typeof session.overall ===
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
            childCompletedSessions
          );

        } catch (loadError) {

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

          setLoading(false);

        }

      };


    loadProgress();

  }, [
    childId,
  ]);


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


  return (

    <Card>

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:justify-between
          sm:items-start
          gap-4
          pb-4
          border-b
          border-[#F0F0F5]
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
              rounded-[13px]
              bg-[#F0EDFF]
              text-[#7566EB]
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <TrendingUp size={18} />
          </div>


          <div>

            <h2
              className="
                text-[16px]
                font-bold
                text-[#333554]
              "
            >
              Cognitive Progress
            </h2>

            <p
              className="
                text-[10.5px]
                text-[#A0A3B4]
                mt-1
              "
            >
              Last 6 completed assessment sessions
            </p>

          </div>

        </div>


        {!loading &&
          !error &&
          data.length > 0 && (

          <div
            className={`
              px-3
              h-8
              rounded-[10px]
              text-[10px]
              font-bold
              flex
              items-center
              w-fit
              ${trend.className}
            `}
          >
            {trend.label}
          </div>

        )}

      </div>


      {loading && (

        <div
          className="
            h-[290px]
            flex
            items-center
            justify-center
          "
        >

          <div className="text-center">

            <div
              className="
                w-9
                h-9
                rounded-full
                border-[3px]
                border-[#E6E2FF]
                border-t-[#7B6EF6]
                animate-spin
                mx-auto
              "
            />

            <p
              className="
                text-[10.5px]
                text-[#A0A3B4]
                mt-3
              "
            >
              Loading progress...
            </p>

          </div>

        </div>

      )}


      {!loading &&
        error && (

        <div
          className="
            min-h-[220px]
            flex
            items-center
            justify-center
          "
        >

          <div
            className="
              bg-[#FFF0F3]
              border
              border-[#F6D8DF]
              rounded-[14px]
              p-5
              text-center
              w-full
            "
          >

            <p
              className="
                font-semibold
                text-[12px]
                text-[#B9415E]
              "
            >
              Unable to load progress
            </p>

            <p
              className="
                text-[10.5px]
                text-[#C55A70]
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
        data.length === 0 && (

        <div
          className="
            h-[250px]
            flex
            items-center
            justify-center
            text-center
          "
        >

          <div>

            <p
              className="
                font-semibold
                text-[13px]
                text-[#55586D]
              "
            >
              No progress data yet
            </p>

            <p
              className="
                text-[10.5px]
                text-[#A0A3B4]
                mt-2
              "
            >
              Completed assessment sessions will appear here.
            </p>

          </div>

        </div>

      )}


      {!loading &&
        !error &&
        data.length > 0 && (

        <div
          className="
            h-[340px]
            mt-5
            rounded-[15px]
            border
            border-[#EFEFF5]
            bg-[#FCFCFE]
            pt-4
            pr-3
            pb-2
          "
        >

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={
                data
              }
              margin={{
                top: 10,
                right: 20,
                left: -10,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#ECECF3"
                vertical={false}
              />


              <XAxis
                dataKey="session"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#9295A7",
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
                  fontSize: 10,
                  fill: "#9295A7",
                }}
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
                contentStyle={{
                  borderRadius:
                    "12px",
                  border:
                    "1px solid #ECECF4",
                  boxShadow:
                    "0 8px 26px rgba(68,68,110,.08)",
                  fontSize:
                    "11px",
                }}
              />


              <Legend
                wrapperStyle={{
                  fontSize:
                    "10px",
                  paddingTop:
                    "12px",
                }}
              />


              <Line
                type="monotone"
                dataKey="attention"
                name="Attention"
                stroke="#63B3ED"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                connectNulls
              />


              <Line
                type="monotone"
                dataKey="memory"
                name="Working Memory"
                stroke="#48BB78"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                connectNulls
              />


              <Line
                type="monotone"
                dataKey="visualSpatial"
                name="Visual-Spatial"
                stroke="#F6AD55"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                connectNulls
              />


              <Line
                type="monotone"
                dataKey="reading"
                name="Reading"
                stroke="#F56565"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                connectNulls
              />


              <Line
                type="monotone"
                dataKey="processingSpeed"
                name="Processing Speed"
                stroke="#38BDF8"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                connectNulls
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      )}

    </Card>

  );

};


export default ProgressChart;