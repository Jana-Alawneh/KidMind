import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  BookOpen,
  Brain,
  Database,
  Eye,
  Target,
  Zap,
} from "lucide-react";

import Card from "../ui/Card";

import {
  getSessions,
} from "../../api/sessionsApi";


const domainConfigs = [
  {
    key: "attention",
    title: "Attention",
    gameName: "focus finder",
    color: "bg-[#63B3ED]",
    icon: Eye,
  },
  {
    key: "workingMemory",
    title: "Working Memory",
    gameName: "memory match",
    color: "bg-[#48BB78]",
    icon: Database,
  },
  {
    key: "visualSpatial",
    title: "Visual-Spatial Skills",
    gameName: "puzzle path",
    color: "bg-[#F6AD55]",
    icon: Target,
  },
  {
    key: "reading",
    title: "Reading Skills",
    gameName: "reading adventure",
    color: "bg-[#F56565]",
    icon: BookOpen,
  },
  {
    key: "processingSpeed",
    title: "Processing Speed",
    gameName: "quick match",
    color: "bg-[#38BDF8]",
    icon: Zap,
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


const getTimestamp = (
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


const getLatestGameScore = (
  sessions,
  gameName
) => {

  const matches = [];


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


          const score =
            Number(
              game.score
            );


          if (
            !isFinished ||
            normalizeGameName(
              game.game_name
            ) !== gameName ||
            !Number.isFinite(
              score
            )
          ) {
            return;
          }


          matches.push({
            score:
              Math.max(
                0,
                Math.min(
                  100,
                  Math.round(
                    score
                  )
                )
              ),

            timestamp:
              getTimestamp(
                game,
                session
              ),
          });

        }
      );

    }
  );


  if (
    matches.length === 0
  ) {
    return null;
  }


  matches.sort(
    (
      first,
      second
    ) =>
      second.timestamp -
      first.timestamp
  );


  return matches[0].score;

};


const CognitiveScores = () => {

  const {
    id,
  } = useParams();


  const childId =
    Number(id);


  const [
    scores,
    setScores,
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

    const loadScores =
      async () => {

        if (
          !Number.isInteger(
            childId
          ) ||
          childId <= 0
        ) {

          setScores([]);
          setLoading(false);

          return;

        }


        try {

          setLoading(true);

          setError("");


          const allSessions =
            await getSessions();


          const childSessions =
            allSessions.filter(
              (session) =>
                Number(
                  session.child_id
                ) === childId
            );


          const domainScores =
            domainConfigs.map(
              (domain) => {

                const value =
                  getLatestGameScore(
                    childSessions,
                    domain.gameName
                  );


                return {
                  ...domain,
                  value,
                };

              }
            );


          const availableValues =
            domainScores
              .map(
                (item) =>
                  item.value
              )
              .filter(
                (value) =>
                  typeof value ===
                    "number" &&
                  Number.isFinite(
                    value
                  )
              );


          const overallScore =
            availableValues.length >
            0
              ? Math.round(
                  availableValues.reduce(
                    (
                      total,
                      value
                    ) =>
                      total +
                      value,
                    0
                  ) /
                    availableValues.length
                )
              : null;


          setScores([
            {
              key:
                "overall",

              title:
                "Overall Score",

              value:
                overallScore,

              color:
                "bg-[#7B6EF6]",

              icon:
                Brain,
            },

            ...domainScores,
          ]);

        } catch (loadError) {

          console.error(
            "Failed to load cognitive scores:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load cognitive scores"
          );

        } finally {

          setLoading(false);

        }

      };


    loadScores();

  }, [
    childId,
  ]);


  return (

    <Card className="h-full">

      <div
        className="
          flex
          items-center
          gap-3
          pb-4
          border-b
          border-[#F0F0F5]
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
          "
        >
          <Brain size={18} />
        </div>


        <div>

          <h2
            className="
              text-[16px]
              font-bold
              text-[#333554]
            "
          >
            Cognitive Assessment
          </h2>

          <p
            className="
              text-[10.5px]
              text-[#A0A3B4]
              mt-1
            "
          >
            Latest available score for each cognitive domain
          </p>

        </div>

      </div>


      {loading && (

        <div
          className="
            min-h-[260px]
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
              Loading cognitive scores...
            </p>

          </div>

        </div>

      )}


      {!loading &&
        error && (

        <div
          className="
            min-h-[180px]
            rounded-[14px]
            border
            border-[#F6D8DF]
            bg-[#FFF0F3]
            p-5
            flex
            flex-col
            justify-center
            text-center
            mt-4
          "
        >

          <p
            className="
              font-semibold
              text-[12px]
              text-[#B9415E]
            "
          >
            Unable to load cognitive scores
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

      )}


      {!loading &&
        !error && (

        <div
          className="
            grid
            grid-cols-1
            gap-2.5
            mt-4
          "
        >

          {scores.map(
            (item) => {

              const Icon =
                item.icon;


              const hasScore =
                typeof item.value ===
                  "number" &&
                Number.isFinite(
                  item.value
                );


              const value =
                hasScore
                  ? Math.max(
                      0,
                      Math.min(
                        100,
                        item.value
                      )
                    )
                  : 0;


              return (

                <div
                  key={
                    item.key
                  }
                  className={`
                    rounded-[15px]
                    border
                    p-3.5
                    ${
                      item.key ===
                      "overall"
                        ? "border-[#E5E0FF] bg-[#FAF8FF]"
                        : "border-[#EFEFF5] bg-[#FCFCFE]"
                    }
                  `}
                >

                  <div
                    className="
                      flex
                      justify-between
                      items-center
                      gap-4
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        min-w-0
                      "
                    >

                      <div
                        className={`
                          ${item.color}
                          text-white
                          w-9
                          h-9
                          rounded-[11px]
                          flex
                          justify-center
                          items-center
                          shrink-0
                        `}
                      >

                        <Icon size={16} />

                      </div>


                      <div className="min-w-0">

                        <span
                          className="
                            block
                            text-[11px]
                            font-bold
                            text-[#55586D]
                            truncate
                          "
                        >
                          {item.title}
                        </span>


                        {!hasScore && (

                          <p
                            className="
                              text-[9px]
                              text-[#A7AABB]
                              mt-0.5
                            "
                          >
                            No assessment data yet
                          </p>

                        )}

                      </div>

                    </div>


                    <span
                      className="
                        font-extrabold
                        text-[13px]
                        text-[#454762]
                        whitespace-nowrap
                      "
                    >
                      {hasScore
                        ? `${Math.round(
                            item.value
                          )}%`
                        : "—"}
                    </span>

                  </div>


                  <div
                    className="
                      w-full
                      bg-[#EEEFF4]
                      rounded-full
                      h-[6px]
                      overflow-hidden
                      mt-3
                    "
                  >

                    <div
                      className={`
                        ${item.color}
                        h-full
                        rounded-full
                        transition-all
                        duration-700
                      `}
                      style={{
                        width:
                          `${value}%`,
                      }}
                    />

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}

    </Card>

  );

};


export default CognitiveScores;