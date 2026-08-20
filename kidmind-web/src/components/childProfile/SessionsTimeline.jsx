import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Card from "../ui/Card";

import {
  getSessions,
} from "../../api/sessionsApi";


const formatDuration = (
  seconds
) => {

  const totalSeconds =
    Math.max(
      0,
      Number(seconds) || 0
    );

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const remainingSeconds =
    totalSeconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;

};


const formatDate = (
  value
) => {

  if (!value) {
    return "No date";
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
    return "No date";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

};


const getGamesText = (
  session
) => {

  if (
    !Array.isArray(
      session.games
    ) ||
    session.games.length === 0
  ) {
    return "No games";
  }

  return session.games
    .map(
      (game) =>
        game.game_name
    )
    .filter(Boolean)
    .join(" • ");

};


const getStatusStyle = (
  status
) => {

  if (
    status === "Completed"
  ) {
    return {
      background:
        "bg-green-100",
      text:
        "text-green-700",
    };
  }

  if (
    status === "In Progress"
  ) {
    return {
      background:
        "bg-violet-100",
      text:
        "text-violet-700",
    };
  }

  if (
    status === "Paused"
  ) {
    return {
      background:
        "bg-amber-100",
      text:
        "text-amber-700",
    };
  }

  if (
    status === "Ended"
  ) {
    return {
      background:
        "bg-red-100",
      text:
        "text-red-700",
    };
  }

  if (
    status === "Cancelled"
  ) {
    return {
      background:
        "bg-slate-100",
      text:
        "text-slate-600",
    };
  }

  return {
    background:
      "bg-sky-100",
    text:
      "text-sky-700",
  };

};


const SessionsTimeline = () => {

  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();


  const childId =
    Number(id);


  const [
    sessions,
    setSessions,
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

    const loadSessions =
      async () => {

        if (
          !Number.isInteger(
            childId
          ) ||
          childId <= 0
        ) {

          setSessions([]);
          setLoading(false);

          return;

        }


        try {

          setLoading(true);

          setError("");


          const allSessions =
            await getSessions();


          const childSessions =
            allSessions
              .filter(
                (session) =>
                  Number(
                    session.child_id
                  ) ===
                  childId
              )
              .sort(
                (
                  first,
                  second
                ) => {

                  const firstDate =
                    new Date(
                      String(
                        first.started_at ||
                        first.scheduled_at ||
                        first.created_at ||
                        ""
                      ).replace(
                        " ",
                        "T"
                      )
                    ).getTime();


                  const secondDate =
                    new Date(
                      String(
                        second.started_at ||
                        second.scheduled_at ||
                        second.created_at ||
                        ""
                      ).replace(
                        " ",
                        "T"
                      )
                    ).getTime();


                  return (
                    (
                      Number.isFinite(
                        secondDate
                      )
                        ? secondDate
                        : 0
                    ) -
                    (
                      Number.isFinite(
                        firstDate
                      )
                        ? firstDate
                        : 0
                    )
                  );

                }
              )
              .slice(
                0,
                5
              );


          setSessions(
            childSessions
          );

        } catch (loadError) {

          console.error(
            "Failed to load child sessions:",
            loadError
          );


          setError(
            loadError?.message ||
            "Failed to load sessions"
          );

        } finally {

          setLoading(false);

        }

      };


    loadSessions();

  }, [
    childId,
  ]);


  return (

    <Card>

      <h2
        className="
          text-xl
          font-bold
          mb-8
          text-[#172554]
        "
      >
        Recent Sessions
      </h2>


      {loading && (

        <div
          className="
            min-h-[140px]
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
                text-slate-500
                mt-3
              "
            >
              Loading sessions...
            </p>

          </div>

        </div>

      )}


      {!loading &&
        error && (

        <div
          className="
            rounded-xl
            bg-red-50
            border
            border-red-100
            p-4
          "
        >

          <p
            className="
              text-sm
              text-red-700
              text-center
            "
          >
            {error}
          </p>

        </div>

      )}


      {!loading &&
        !error &&
        sessions.length === 0 && (

        <div
          className="
            py-8
            text-center
          "
        >

          <p
            className="
              font-semibold
              text-[#172554]
            "
          >
            No sessions yet
          </p>

          <p
            className="
              text-sm
              text-slate-500
              mt-2
            "
          >
            This child does not have any assessment sessions yet.
          </p>

        </div>

      )}


      {!loading &&
        !error &&
        sessions.length > 0 && (

        <div
          className="
            space-y-6
          "
        >

          {sessions.map(
            (
              session,
              index
            ) => {

              const statusStyle =
                getStatusStyle(
                  session.status
                );


              const dateValue =
                session.started_at ||
                session.scheduled_at ||
                session.created_at;


              return (

                <button
                  key={
                    session.id
                  }
                  type="button"
                  onClick={() => {

                    navigate(
                      `/sessions/${session.id}`
                    );

                  }}
                  className="
                    flex
                    gap-4
                    w-full
                    text-left
                    group
                  "
                >

                  <div
                    className="
                      flex
                      flex-col
                      items-center
                    "
                  >

                    <div
                      className="
                        w-4
                        h-4
                        rounded-full
                        bg-[#7B6EF6]
                        group-hover:scale-110
                        transition
                      "
                    />


                    {index !==
                      sessions.length -
                        1 && (

                      <div
                        className="
                          w-1
                          flex-1
                          min-h-24
                          bg-[#E6E2FF]
                        "
                      />

                    )}

                  </div>


                  <div
                    className="
                      flex-1
                      min-w-0
                      pb-2
                    "
                  >

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >

                      <span
                        className="
                          text-xs
                          font-semibold
                          text-slate-400
                        "
                      >
                        Session #{session.id}
                      </span>


                      <span
                        className={`
                          text-[11px]
                          font-semibold
                          px-3
                          py-1
                          rounded-full
                          whitespace-nowrap
                          ${statusStyle.background}
                          ${statusStyle.text}
                        `}
                      >
                        {session.status}
                      </span>

                    </div>


                    <h3
                      className="
                        font-semibold
                        text-[#172554]
                        mt-2
                        leading-6
                        group-hover:text-[#7B6EF6]
                        transition
                      "
                    >
                      {getGamesText(
                        session
                      )}
                    </h3>


                    <p
                      className="
                        text-sm
                        text-slate-500
                        mt-1
                      "
                    >
                      {formatDate(
                        dateValue
                      )}
                    </p>


                    <div
                      className="
                        flex
                        items-center
                        flex-wrap
                        gap-2
                        mt-3
                      "
                    >

                      <span
                        className="
                          text-xs
                          bg-[#F3F0FF]
                          text-[#7B6EF6]
                          px-3
                          py-1.5
                          rounded-full
                          inline-block
                          font-semibold
                        "
                      >
                        {formatDuration(
                          session.duration_seconds
                        )}
                      </span>


                      {session.score !==
                        null &&
                        session.score !==
                          undefined && (

                        <span
                          className="
                            text-xs
                            bg-green-100
                            text-green-700
                            px-3
                            py-1.5
                            rounded-full
                            inline-block
                            font-semibold
                          "
                        >
                          Score{" "}
                          {Math.round(
                            Number(
                              session.score
                            )
                          )}%
                        </span>

                      )}

                    </div>

                  </div>

                </button>

              );

            }
          )}

        </div>

      )}

    </Card>

  );

};


export default SessionsTimeline;