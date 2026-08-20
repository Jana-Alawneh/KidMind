import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Card from "./Card";

import {
  getChildren,
} from "../../api/childrenApi";

import {
  getSessions,
} from "../../api/sessionsApi";


const gameNames = {
  attention:
    "focus finder",

  workingMemory:
    "memory match",

  visualSpatial:
    "puzzle path",

  reading:
    "reading adventure",

  processingSpeed:
    "quick match",
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


const parseDate = (
  value
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


const getGameTimestamp = (
  game,
  session
) => {

  const value =
    game?.ended_at ||
    game?.started_at ||
    game?.updated_at ||
    game?.created_at ||
    session?.ended_at ||
    session?.started_at ||
    session?.scheduled_at ||
    session?.created_at;


  const date =
    parseDate(
      value
    );


  return date
    ? date.getTime()
    : 0;

};


const getLatestGameScore = (
  sessions,
  gameName
) => {

  const matchingGames =
    [];


  sessions.forEach(
    (session) => {

      const games =
        Array.isArray(
          session.games
        )
          ? session.games
          : [];


      games.forEach(
        (game) => {

          const status =
            game.status;


          const score =
            Number(
              game.score
            );


          if (
            normalizeGameName(
              game.game_name
            ) !==
              gameName ||
            (
              status !==
                "Completed" &&
              status !==
                "Failed"
            ) ||
            !Number.isFinite(
              score
            )
          ) {
            return;
          }


          matchingGames.push({
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
              getGameTimestamp(
                game,
                session
              ),
          });

        }
      );

    }
  );


  if (
    matchingGames.length ===
    0
  ) {
    return null;
  }


  matchingGames.sort(
    (
      first,
      second
    ) =>
      second.timestamp -
      first.timestamp
  );


  return matchingGames[0]
    .score;

};


const getOverallScore = (
  sessions
) => {

  const domainScores = [
    getLatestGameScore(
      sessions,
      gameNames.attention
    ),

    getLatestGameScore(
      sessions,
      gameNames.workingMemory
    ),

    getLatestGameScore(
      sessions,
      gameNames.visualSpatial
    ),

    getLatestGameScore(
      sessions,
      gameNames.reading
    ),

    getLatestGameScore(
      sessions,
      gameNames.processingSpeed
    ),
  ].filter(
    (score) =>
      typeof score ===
      "number"
  );


  if (
    domainScores.length ===
    0
  ) {
    return null;
  }


  return Math.round(
    domainScores.reduce(
      (
        total,
        score
      ) =>
        total + score,
      0
    ) /
      domainScores.length
  );

};


const getChildTimestamp = (
  child
) => {

  const date =
    parseDate(
      child.created_at
    );


  if (date) {
    return date.getTime();
  }


  return Number(
    child.id
  ) || 0;

};


const RecentChildren = () => {

  const navigate =
    useNavigate();


  const [
    children,
    setChildren,
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

    const loadChildren =
      async () => {

        try {

          setLoading(true);
          setError("");


          const [
            childrenData,
            sessionsData,
          ] =
            await Promise.all([
              getChildren(),
              getSessions(),
            ]);


          const allChildren =
            Array.isArray(
              childrenData
            )
              ? childrenData
              : [];


          const allSessions =
            Array.isArray(
              sessionsData
            )
              ? sessionsData
              : [];


          const recentChildren =
            allChildren
              .map(
                (child) => {

                  const childSessions =
                    allSessions.filter(
                      (session) =>
                        Number(
                          session.child_id
                        ) ===
                        Number(
                          child.id
                        )
                    );


                  return {
                    ...child,

                    dashboardScore:
                      getOverallScore(
                        childSessions
                      ),
                  };

                }
              )
              .sort(
                (
                  first,
                  second
                ) =>
                  getChildTimestamp(
                    second
                  ) -
                  getChildTimestamp(
                    first
                  )
              )
              .slice(
                0,
                3
              );


          setChildren(
            recentChildren
          );

        } catch (loadError) {

          console.error(
            "Failed to load recent children:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load recent children"
          );

        } finally {

          setLoading(false);

        }

      };


    loadChildren();

  }, []);


  return (

    <Card>

      <div
        className="
          flex
          justify-between
          items-center
          mb-6
        "
      >

        <h2
          className="
            text-xl
            font-semibold
          "
        >
          Recent Children
        </h2>


        <button
          type="button"
          onClick={() => {

            navigate(
              "/children"
            );

          }}
          className="
            text-[#7B6EF6]
            font-semibold
            hover:underline
          "
        >
          View All
        </button>

      </div>


      {loading && (

        <div
          className="
            min-h-[180px]
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
                w-9
                h-9
                rounded-full
                border-4
                border-[#E6E2FF]
                border-t-[#7B6EF6]
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
              Loading children...
            </p>

          </div>

        </div>

      )}


      {!loading &&
        error && (

        <div
          className="
            min-h-[180px]
            flex
            items-center
            justify-center
          "
        >

          <div
            className="
              bg-red-50
              border
              border-red-100
              rounded-2xl
              p-5
              text-center
            "
          >

            <p
              className="
                font-semibold
                text-red-700
              "
            >
              Unable to load children
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
        children.length ===
          0 && (

        <div
          className="
            min-h-[180px]
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
              No children yet
            </p>


            <p
              className="
                text-sm
                text-slate-400
                mt-1
              "
            >
              Registered children will appear here.
            </p>

          </div>

        </div>

      )}


      {!loading &&
        !error &&
        children.length >
          0 && (

        <div
          className="
            space-y-5
          "
        >

          {children.map(
            (child) => (

              <button
                key={
                  child.id
                }
                type="button"
                onClick={() => {

                  navigate(
                    `/children/${child.id}`
                  );

                }}
                className="
                  w-full
                  flex
                  justify-between
                  items-center
                  rounded-2xl
                  p-2
                  hover:bg-[#F8F8FD]
                  transition
                  text-left
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-4
                    min-w-0
                  "
                >

                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                      child.full_name ||
                      child.name ||
                      `Child ${child.id}`
                    )}`}
                    alt={
                      child.full_name ||
                      child.name ||
                      "Child"
                    }
                    className="
                      w-12
                      h-12
                      rounded-2xl
                      bg-[#F3F4FF]
                      shrink-0
                    "
                  />


                  <div
                    className="
                      min-w-0
                    "
                  >

                    <h3
                      className="
                        font-semibold
                        truncate
                      "
                    >
                      {child.full_name ||
                        child.name}
                    </h3>


                    <p
                      className="
                        text-sm
                        text-slate-500
                      "
                    >
                      Age {child.age}
                      {" · "}
                      ID #{child.id}
                    </p>

                  </div>

                </div>


                <div
                  className="
                    text-[#7B6EF6]
                    font-bold
                    ml-4
                    whitespace-nowrap
                  "
                >
                  {typeof child.dashboardScore ===
                  "number"
                    ? `${child.dashboardScore}%`
                    : "—"}
                </div>

              </button>

            )
          )}

        </div>

      )}

    </Card>

  );

};


export default RecentChildren;