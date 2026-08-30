import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
} from "lucide-react";

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


  if (
    minutes ===
    0
  ) {
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
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
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
    session.games.length ===
      0
  ) {
    return "No games";
  }


  return session.games
    .map(
      game =>
        game.game_name
    )
    .filter(
      Boolean
    )
    .join(" • ");

};


const getStatusStyle = (
  status
) => {

  if (
    status ===
    "Completed"
  ) {
    return {
      background:
        "bg-[#ECFAF4]",

      text:
        "text-[#3E9E7D]",
    };
  }


  if (
    status ===
    "In Progress"
  ) {
    return {
      background:
        "bg-[#F0EDFF]",

      text:
        "text-[#7566EB]",
    };
  }


  if (
    status ===
    "Paused"
  ) {
    return {
      background:
        "bg-[#FFF7E8]",

      text:
        "text-[#C48432]",
    };
  }


  if (
    status ===
    "Ended"
  ) {
    return {
      background:
        "bg-[#FFF0F3]",

      text:
        "text-[#C4556C]",
    };
  }


  if (
    status ===
    "Cancelled"
  ) {
    return {
      background:
        "bg-[#F5F5F8]",

      text:
        "text-[#777A8F]",
    };
  }


  return {
    background:
      "bg-[#EDF6FF]",

    text:
      "text-[#5595DD]",
  };

};


const SessionsTimeline = () => {

  const {
    id,
  } =
    useParams();


  const navigate =
    useNavigate();


  const childId =
    Number(
      id
    );


  const [
    sessions,
    setSessions,
  ] =
    useState([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(
    () => {

      const loadSessions =
        async () => {

          if (
            !Number.isInteger(
              childId
            ) ||
            childId <=
              0
          ) {

            setSessions(
              []
            );

            setLoading(
              false
            );

            return;

          }


          try {

            setLoading(
              true
            );

            setError(
              ""
            );


            const allSessions =
              await getSessions();


            const childSessions =
              allSessions
                .filter(
                  session =>
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
                  3
                );


            setSessions(
              childSessions
            );

          } catch (
            loadError
          ) {

            console.error(
              "Failed to load child sessions:",
              loadError
            );


            setError(
              loadError?.message ||
              "Failed to load sessions"
            );

          } finally {

            setLoading(
              false
            );

          }

        };


      loadSessions();

    },
    [
      childId,
    ]
  );


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

          <CalendarDays
            size={18}
          />

        </div>


        <div>

          <h2
            className="
              text-[16px]
              font-bold
              text-[#333554]
            "
          >
            Recent Sessions
          </h2>


          <p
            className="
              text-[10.5px]
              text-[#A0A3B4]
              mt-1
            "
          >
            Latest child assessment activity
          </p>

        </div>

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
              Loading sessions...
            </p>

          </div>

        </div>

      )}


      {!loading &&
        error && (

        <div
          className="
            min-h-[130px]
            mt-4
            rounded-[14px]
            bg-[#FFF0F3]
            border
            border-[#F6D8DF]
            p-4
            flex
            items-center
            justify-center
          "
        >

          <p
            className="
              text-[10.5px]
              text-[#B9415E]
              text-center
            "
          >
            {error}
          </p>

        </div>

      )}


      {!loading &&
        !error &&
        sessions.length ===
          0 && (

        <div
          className="
            min-h-[180px]
            flex
            flex-col
            items-center
            justify-center
            text-center
          "
        >

          <p
            className="
              font-semibold
              text-[13px]
              text-[#55586D]
            "
          >
            No sessions yet
          </p>


          <p
            className="
              text-[10.5px]
              text-[#A0A3B4]
              mt-2
              max-w-[220px]
              leading-[16px]
            "
          >
            This child does not have any assessment sessions yet.
          </p>

        </div>

      )}


      {!loading &&
        !error &&
        sessions.length >
          0 && (

        <div
          className="
            mt-4
            space-y-2.5
          "
        >

          {sessions.map(
            session => {

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
                    w-full
                    text-left
                    rounded-[15px]
                    border
                    border-[#EFEFF5]
                    bg-[#FCFCFE]
                    p-3.5
                    hover:border-[#DED9FA]
                    hover:bg-[#FBFAFF]
                    transition
                    group
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

                    <div
                      className="
                        min-w-0
                      "
                    >

                      <span
                        className="
                          text-[9px]
                          font-semibold
                          text-[#A0A3B4]
                        "
                      >
                        Session #{session.id}
                      </span>


                      <h3
                        className="
                          text-[11px]
                          font-bold
                          text-[#55586D]
                          mt-1.5
                          truncate
                          group-hover:text-[#7566EB]
                          transition
                        "
                        title={
                          getGamesText(
                            session
                          )
                        }
                      >
                        {getGamesText(
                          session
                        )}
                      </h3>

                    </div>


                    <ArrowUpRight
                      size={14}
                      className="
                        shrink-0
                        text-[#B0B2C1]
                        group-hover:text-[#7566EB]
                        transition
                      "
                    />

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                      mt-2.5
                      text-[#9295A7]
                    "
                  >

                    <CalendarDays
                      size={12}
                    />


                    <span
                      className="
                        text-[9.5px]
                      "
                    >
                      {formatDate(
                        dateValue
                      )}
                    </span>

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      flex-wrap
                      gap-2
                      mt-3
                    "
                  >

                    <span
                      className={`
                        px-2.5
                        py-1
                        rounded-full
                        text-[8.5px]
                        font-bold
                        whitespace-nowrap
                        ${statusStyle.background}
                        ${statusStyle.text}
                      `}
                    >
                      {session.status}
                    </span>


                    <div
                      className="
                        flex
                        items-center
                        flex-wrap
                        justify-end
                        gap-1.5
                      "
                    >

                      <span
                        className="
                          px-2
                          py-1
                          rounded-[8px]
                          bg-[#F3F0FF]
                          text-[#7566EB]
                          text-[8.5px]
                          font-semibold
                          flex
                          items-center
                          gap-1
                        "
                      >

                        <Clock3
                          size={10}
                        />

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
                            px-2
                            py-1
                            rounded-[8px]
                            bg-[#ECFAF4]
                            text-[#3E9E7D]
                            text-[8.5px]
                            font-bold
                          "
                        >
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