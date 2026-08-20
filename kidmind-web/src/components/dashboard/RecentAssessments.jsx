import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Card from "../ui/Card";

import {
  FileText,
} from "lucide-react";

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


const getAssessmentDate = (
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


const formatDate = (
  date
) => {

  if (!date) {
    return "—";
  }


  const today =
    new Date();


  const yesterday =
    new Date();


  yesterday.setDate(
    today.getDate() - 1
  );


  if (
    isSameDay(
      date,
      today
    )
  ) {
    return "Today";
  }


  if (
    isSameDay(
      date,
      yesterday
    )
  ) {
    return "Yesterday";
  }


  return date.toLocaleDateString(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        date.getFullYear() !==
        today.getFullYear()
          ? "numeric"
          : undefined,
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


const getFallbackScore = (
  session
) => {

  if (
    !Array.isArray(
      session.games
    )
  ) {
    return null;
  }


  const scores =
    session.games
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
    scores.length === 0
  ) {
    return null;
  }


  return Math.round(
    scores.reduce(
      (
        total,
        score
      ) =>
        total + score,
      0
    ) /
      scores.length
  );

};


const getSessionScore = (
  session
) => {

  const sessionScore =
    Number(
      session.score
    );


  if (
    session.score !== null &&
    session.score !== undefined &&
    Number.isFinite(
      sessionScore
    )
  ) {

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(
          sessionScore
        )
      )
    );

  }


  return getFallbackScore(
    session
  );

};


const RecentAssessments = () => {

  const navigate =
    useNavigate();


  const [
    assessments,
    setAssessments,
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

    const loadAssessments =
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


          const completedAssessments =
            allSessions
              .filter(
                (session) =>
                  session.status ===
                  "Completed"
              )
              .map(
                (session) => {

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
                      getAssessmentDate(
                        session
                      ),

                    dashboardChildName:
                      session.child_name ||
                      child?.full_name ||
                      child?.name ||
                      `Child #${session.child_id}`,

                    dashboardScore:
                      getSessionScore(
                        session
                      ),
                  };

                }
              )
              .sort(
                (
                  first,
                  second
                ) => {

                  const firstTime =
                    first.dashboardDate
                      ?.getTime() ||
                    0;


                  const secondTime =
                    second.dashboardDate
                      ?.getTime() ||
                    0;


                  return (
                    secondTime -
                    firstTime
                  );

                }
              )
              .slice(
                0,
                3
              );


          setAssessments(
            completedAssessments
          );

        } catch (loadError) {

          console.error(
            "Failed to load recent assessments:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load recent assessments"
          );

        } finally {

          setLoading(false);

        }

      };


    loadAssessments();

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
            Recent Assessments
          </h2>


          <p
            className="
            text-sm
            text-slate-400
            mt-1
            "
          >
            Latest cognitive evaluation results
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
          text-sm
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
              Loading assessments...
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
              Unable to load assessments
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
        assessments.length === 0 && (

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
              w-12
              h-12
              rounded-2xl
              bg-[#EEE9FF]
              flex
              items-center
              justify-center
              mx-auto
              "
            >

              <FileText
                size={20}
                className="
                text-[#7B6EF6]
                "
              />

            </div>


            <p
              className="
              font-semibold
              text-slate-600
              mt-3
              "
            >
              No completed assessments
            </p>


            <p
              className="
              text-sm
              text-slate-400
              mt-1
              "
            >
              Completed assessment results will appear here.
            </p>

          </div>

        </div>

      )}


      {!loading &&
        !error &&
        assessments.length > 0 && (

        <div
          className="
          overflow-x-auto
          "
        >

          <table
            className="
            w-full
            "
          >

            <thead>

              <tr
                className="
                text-left
                text-sm
                text-slate-400
                "
              >

                <th
                  className="
                  pb-4
                  "
                >
                  Child
                </th>

                <th
                  className="
                  pb-4
                  "
                >
                  Activity
                </th>

                <th
                  className="
                  pb-4
                  "
                >
                  Score
                </th>

                <th
                  className="
                  pb-4
                  "
                >
                  Date
                </th>

                <th
                  className="
                  pb-4
                  "
                >
                  Status
                </th>

                <th />

              </tr>

            </thead>


            <tbody>

              {assessments.map(
                (item) => (

                  <tr
                    key={
                      item.id
                    }
                    className="
                    border-t
                    border-gray-100
                    hover:bg-[#FAFAFF]
                    transition
                    "
                  >

                    <td
                      className="
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
                          rounded-2xl
                          bg-[#EEE9FF]
                          flex
                          items-center
                          justify-center
                          "
                        >

                          <FileText
                            size={18}
                            className="
                            text-[#7B6EF6]
                            "
                          />

                        </div>


                        <div>

                          <span
                            className="
                            font-semibold
                            block
                            "
                          >
                            {item.dashboardChildName}
                          </span>


                          <span
                            className="
                            text-xs
                            text-slate-400
                            "
                          >
                            Session #{item.id}
                          </span>

                        </div>

                      </div>

                    </td>


                    <td
                      className="
                      text-slate-600
                      "
                    >
                      {getActivityText(
                        item
                      )}
                    </td>


                    <td>

                      <span
                        className="
                        font-bold
                        text-[#7B6EF6]
                        "
                      >
                        {typeof item.dashboardScore ===
                        "number"
                          ? `${item.dashboardScore}%`
                          : "—"}
                      </span>

                    </td>


                    <td
                      className="
                      text-slate-500
                      "
                    >
                      {formatDate(
                        item.dashboardDate
                      )}
                    </td>


                    <td>

                      <span
                        className="
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        bg-[#E8FFF5]
                        text-[#38B2AC]
                        "
                      >
                        Completed
                      </span>

                    </td>


                    <td>

                      <button
                        type="button"
                        onClick={() => {

                          navigate(
                            `/sessions/${item.id}`
                          );

                        }}
                        className="
                        bg-[#7B6EF6]
                        text-white
                        px-4
                        py-2
                        rounded-xl
                        text-xs
                        hover:bg-[#6657EF]
                        transition
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

    </Card>

  );

};


export default RecentAssessments;