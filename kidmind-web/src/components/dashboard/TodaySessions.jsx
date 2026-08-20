import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Clock3,
} from "lucide-react";

import Card from "../ui/Card";

import {
  getSessions,
} from "../../api/sessionsApi";

import {
  getChildren,
} from "../../api/childrenApi";


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


const getSessionDate = (
  session
) => {

  return (
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


const formatTime = (
  date
) => {

  if (!date) {
    return "—";
  }


  return date.toLocaleTimeString(
    "en-US",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",

      hour12:
        true,
    }
  );

};


const getActivityText = (
  session
) => {

  if (
    !Array.isArray(
      session.games
    ) ||
    session.games.length === 0
  ) {

    return "Assessment Session";

  }


  if (
    session.games.length === 1
  ) {

    return (
      session.games[0]
        ?.game_name ||
      "Assessment Session"
    );

  }


  return `${session.games.length} Assessment Games`;

};


const getStatusClasses = (
  status
) => {

  if (
    status ===
    "Completed"
  ) {

    return "bg-green-100 text-green-700";

  }


  if (
    status ===
    "In Progress"
  ) {

    return "bg-violet-100 text-violet-700";

  }


  if (
    status ===
    "Paused"
  ) {

    return "bg-amber-100 text-amber-700";

  }


  if (
    status ===
    "Scheduled"
  ) {

    return "bg-sky-100 text-sky-700";

  }


  if (
    status === "Ended"
  ) {

    return "bg-red-100 text-red-700";

  }


  if (
    status ===
    "Cancelled"
  ) {

    return "bg-slate-100 text-slate-600";

  }


  return "bg-slate-100 text-slate-600";

};


const TodaySessions = () => {

  const navigate =
    useNavigate();


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

        try {

          setLoading(true);
          setError("");


          const [
            sessionsData,
            childrenData,
          ] =
            await Promise.all([
              getSessions(),
              getChildren(),
            ]);


          const allSessions =
            Array.isArray(
              sessionsData
            )
              ? sessionsData
              : [];


          const allChildren =
            Array.isArray(
              childrenData
            )
              ? childrenData
              : [];


          const today =
            new Date();


          const todaysSessions =
            allSessions
              .map(
                (session) => {

                  const sessionDate =
                    getSessionDate(
                      session
                    );


                  const child =
                    allChildren.find(
                      (item) =>
                        Number(
                          item.id
                        ) ===
                        Number(
                          session.child_id
                        )
                    );


                  return {
                    ...session,

                    dashboardDate:
                      sessionDate,

                    dashboardChildName:
                      session.child_name ||
                      child?.full_name ||
                      child?.name ||
                      `Child #${session.child_id}`,
                  };

                }
              )
              .filter(
                (session) => {

                  if (
                    !session.dashboardDate
                  ) {
                    return false;
                  }


                  return isSameDay(
                    session.dashboardDate,
                    today
                  );

                }
              )
              .sort(
                (
                  first,
                  second
                ) =>
                  second.dashboardDate
                    .getTime() -
                  first.dashboardDate
                    .getTime()
              )
              .slice(
                0,
                3
              );


          setSessions(
            todaysSessions
          );

        } catch (loadError) {

          console.error(
            "Failed to load today's sessions:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load today's sessions"
          );

        } finally {

          setLoading(false);

        }

      };


    loadSessions();

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

        <div>

          <h2
            className="
            text-xl
            font-semibold
            "
          >
            Today's Sessions
          </h2>


          <p
            className="
            text-slate-400
            text-sm
            "
          >
            Assessment sessions for today
          </p>

        </div>


        <button
          type="button"
          onClick={() => {

            navigate(
              "/sessions"
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
          min-h-[220px]
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
              Loading today's sessions...
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
              Unable to load sessions
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
        sessions.length === 0 && (

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
            text-center
            "
          >

            <div
              className="
              w-12
              h-12
              rounded-2xl
              bg-[#EEE9FF]
              flex
              justify-center
              items-center
              mx-auto
              "
            >

              <Clock3
                className="
                text-[#7B6EF6]
                "
                size={20}
              />

            </div>


            <p
              className="
              font-semibold
              text-slate-600
              mt-3
              "
            >
              No sessions today
            </p>


            <p
              className="
              text-sm
              text-slate-400
              mt-1
              "
            >
              There are no assessment sessions for today.
            </p>

          </div>

        </div>

      )}


      {!loading &&
        !error &&
        sessions.length > 0 && (

        <div
          className="
          space-y-4
          "
        >

          {sessions.map(
            (item) => (

              <button
                key={
                  item.id
                }
                type="button"
                onClick={() => {

                  navigate(
                    `/sessions/${item.id}`
                  );

                }}
                className="
                w-full
                bg-[#F8F9FD]
                rounded-2xl
                p-4
                flex
                justify-between
                items-center
                gap-4
                hover:bg-[#F1F3FA]
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

                  <div
                    className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-[#EEE9FF]
                    flex
                    justify-center
                    items-center
                    shrink-0
                    "
                  >

                    <Clock3
                      className="
                      text-[#7B6EF6]
                      "
                      size={20}
                    />

                  </div>


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
                      {item.dashboardChildName}
                    </h3>


                    <p
                      className="
                      text-sm
                      text-slate-500
                      truncate
                      "
                    >
                      {getActivityText(
                        item
                      )}
                    </p>


                    <span
                      className={`
                      inline-flex
                      mt-2
                      px-2.5
                      py-1
                      rounded-full
                      text-[11px]
                      font-semibold
                      ${getStatusClasses(
                        item.status
                      )}
                      `}
                    >
                      {item.status}
                    </span>

                  </div>

                </div>


                <span
                  className="
                  font-semibold
                  whitespace-nowrap
                  text-sm
                  "
                >
                  {formatTime(
                    item.dashboardDate
                  )}
                </span>

              </button>

            )
          )}

        </div>

      )}

    </Card>

  );

};


export default TodaySessions;