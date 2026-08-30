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
    session => {

      const games =
        Array.isArray(
          session.games
        )
          ? session.games
          : [];


      games.forEach(
        game => {

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
    score =>
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


const getChildName = (
  child
) => {

  return (
    child.full_name ||
    child.name ||
    `Child ${child.id}`
  );

};


const getChildInitial = (
  child
) => {

  return String(
    getChildName(
      child
    ) || "C"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

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


  useEffect(
    () => {

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
                  child => {

                    const childSessions =
                      allSessions.filter(
                        session =>
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

          } catch (
            loadError
          ) {

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

    },
    []
  );


  return (

    <Card>

      <div className="recent-children-heading">

        <div>

          <h2>
            Recent Children
          </h2>

          <p>
            Recently added children in your care
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/children"
            )
          }
        >
          View All
        </button>

      </div>


      {
        loading && (

          <div className="recent-children-state">

            <div>

              <div className="recent-children-loader" />

              <p>
                Loading children...
              </p>

            </div>

          </div>

        )
      }


      {
        !loading &&
        error && (

          <div className="recent-children-state">

            <div className="recent-children-error">

              <strong>
                Unable to load children
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
        children.length ===
          0 && (

          <div className="recent-children-state">

            <div className="recent-children-empty">

              <strong>
                No children yet
              </strong>

              <span>
                Registered children will
                appear here.
              </span>

            </div>

          </div>

        )
      }


      {
        !loading &&
        !error &&
        children.length >
          0 && (

          <div className="recent-children-list">

            {
              children.map(
                child => (

                  <button
                    key={
                      child.id
                    }
                    type="button"
                    className="recent-child-row"
                    onClick={() =>
                      navigate(
                        `/children/${child.id}`
                      )
                    }
                  >

                    <div className="recent-child-main">

                      <div className="recent-child-avatar">

                        {
                          getChildInitial(
                            child
                          )
                        }

                      </div>


                      <div className="recent-child-info">

                        <strong>

                          {
                            getChildName(
                              child
                            )
                          }

                        </strong>


                        <span>

                          Age {
                            child.age ??
                            "—"
                          }

                          {"  •  "}

                          ID #{child.id}

                        </span>

                      </div>

                    </div>


                    <div
                      className={
                        typeof child.dashboardScore ===
                        "number"
                          ? "recent-child-score"
                          : "recent-child-score empty"
                      }
                    >

                      {
                        typeof child.dashboardScore ===
                          "number"
                          ? `${child.dashboardScore}%`
                          : "—"
                      }

                    </div>

                  </button>

                )
              )
            }

          </div>

        )
      }


      <style>
        {`

        .recent-children-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 14px;
        }

        .recent-children-heading h2 {
          margin: 0;
          color: #333554;
          font-size: 16px;
          font-weight: 700;
        }

        .recent-children-heading p {
          margin: 4px 0 0;
          color: #A0A3B4;
          font-size: 11.5px;
        }

        .recent-children-heading button {
          flex: 0 0 auto;
          border: 0;
          padding: 6px 9px;
          border-radius: 9px;
          color: #7566EB;
          background: transparent;
          cursor: pointer;
          font-size: 11.5px;
          font-weight: 700;
          transition: .18s ease;
        }

        .recent-children-heading button:hover {
          background: #F3F0FF;
        }

        .recent-children-list {
          border-top: 1px solid #F1F1F6;
        }

        .recent-child-row {
          width: 100%;
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 12px 10px;
          border: 0;
          border-bottom: 1px solid #F1F1F6;
          border-radius: 0;
          color: inherit;
          background: transparent;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: .18s ease;
        }

        .recent-child-row:last-child {
          border-bottom: 0;
        }

        .recent-child-row:hover {
          padding-left: 13px;
          padding-right: 13px;
          border-radius: 14px;
          background: #FAF9FF;
        }

        .recent-child-main {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .recent-child-avatar {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #B05D9B;
          background: #FFF0FA;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .recent-child-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .recent-child-info strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #373953;
          font-size: 12.5px;
          font-weight: 700;
        }

        .recent-child-info span {
          margin-top: 3px;
          color: #9DA0B1;
          font-size: 10.5px;
        }

        .recent-child-score {
          min-width: 54px;
          flex: 0 0 auto;
          padding: 7px 10px;
          border-radius: 10px;
          color: #7566EB;
          background: #F3F0FF;
          text-align: center;
          font-size: 12px;
          font-weight: 800;
        }

        .recent-child-score.empty {
          color: #A4A6B6;
          background: #F5F5F8;
        }

        .recent-children-state {
          min-height: 180px;
          display: grid;
          place-items: center;
          text-align: center;
        }

        .recent-children-loader {
          width: 34px;
          height: 34px;
          margin: auto;
          border: 4px solid #E6E2FF;
          border-top-color: #7B6EF6;
          border-radius: 50%;
          animation:
            recent-children-spin .8s
            linear infinite;
        }

        .recent-children-state p {
          margin: 10px 0 0;
          color: #A0A3B4;
          font-size: 11.5px;
        }

        .recent-children-error,
        .recent-children-empty {
          max-width: 340px;
          display: flex;
          flex-direction: column;
        }

        .recent-children-error {
          padding: 15px 18px;
          border: 1px solid #F6D8DF;
          border-radius: 14px;
          color: #B9415E;
          background: #FFF0F3;
        }

        .recent-children-error strong,
        .recent-children-empty strong {
          font-size: 12.5px;
        }

        .recent-children-error span,
        .recent-children-empty span {
          margin-top: 4px;
          font-size: 11px;
        }

        .recent-children-empty {
          color: #999CAD;
        }

        .recent-children-empty strong {
          color: #62657B;
        }

        @keyframes recent-children-spin {

          to {
            transform: rotate(360deg);
          }

        }

        `}
      </style>

    </Card>

  );

};


export default RecentChildren;