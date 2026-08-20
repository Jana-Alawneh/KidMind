import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  CheckCircle,
  Eye,
  FileText,
} from "lucide-react";

import Card from "../ui/Card";

import {
  getSessions,
} from "../../api/sessionsApi";


const formatDate = (
  value
) => {

  if (!value) {
    return "—";
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
    return "—";
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


const getReportTitle = (
  session
) => {

  if (
    !Array.isArray(
      session.games
    ) ||
    session.games.length === 0
  ) {
    return "Assessment Report";
  }

  const names =
    session.games
      .map(
        (game) =>
          game.game_name
      )
      .filter(Boolean);

  if (
    names.length === 0
  ) {
    return "Assessment Report";
  }

  if (
    names.length === 1
  ) {
    return `${names[0]} Assessment`;
  }

  return "Multi-Game Assessment";

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
    return "No game details";
  }

  return session.games
    .map(
      (game) =>
        game.game_name
    )
    .filter(Boolean)
    .join(" • ");

};


const ReportsTable = () => {

  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();


  const childId =
    Number(id);


  const [
    reports,
    setReports,
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

    const loadReports =
      async () => {

        if (
          !Number.isInteger(
            childId
          ) ||
          childId <= 0
        ) {

          setReports([]);
          setLoading(false);

          return;

        }


        try {

          setLoading(true);

          setError("");


          const sessions =
            await getSessions();


          const completedReports =
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
              .sort(
                (
                  first,
                  second
                ) => {

                  const firstDate =
                    new Date(
                      String(
                        first.ended_at ||
                        first.started_at ||
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
                        second.ended_at ||
                        second.started_at ||
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
              );


          setReports(
            completedReports
          );

        } catch (loadError) {

          console.error(
            "Failed to load reports:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load assessment reports"
          );

        } finally {

          setLoading(false);

        }

      };


    loadReports();

  }, [
    childId,
  ]);


  return (

    <Card>

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:justify-between
          sm:items-center
          gap-4
          mb-8
        "
      >

        <div>

          <h2
            className="
              text-2xl
              font-bold
              text-[#172554]
            "
          >
            Assessment Reports
          </h2>

          <p
            className="
              text-slate-500
              mt-1
            "
          >
            Completed assessment history
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
            bg-[#7B6EF6]
            text-white
            px-5
            py-3
            rounded-xl
            hover:bg-[#6B5AF2]
            transition
            font-semibold
          "
        >
          View All Sessions
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
                w-10
                h-10
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
              Loading reports...
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
            Unable to load reports
          </p>

          <p
            className="
              text-sm
              text-red-600
              mt-1
            "
          >
            {error}
          </p>

        </div>

      )}


      {!loading &&
        !error &&
        reports.length === 0 && (

        <div
          className="
            py-10
            text-center
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-[#F2EEFF]
              flex
              justify-center
              items-center
              mx-auto
            "
          >

            <FileText
              className="
                text-[#7B6EF6]
              "
            />

          </div>

          <h3
            className="
              font-bold
              text-[#172554]
              mt-4
            "
          >
            No reports yet
          </h3>

          <p
            className="
              text-sm
              text-slate-500
              mt-2
            "
          >
            Completed assessment sessions will appear here.
          </p>

        </div>

      )}


      {!loading &&
        !error &&
        reports.length > 0 && (

        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              w-full
              min-w-[760px]
            "
          >

            <thead>

              <tr
                className="
                  border-b
                  text-left
                  text-slate-500
                "
              >

                <th
                  className="
                    pb-4
                    font-semibold
                  "
                >
                  Report
                </th>

                <th
                  className="
                    pb-4
                    font-semibold
                  "
                >
                  Date
                </th>

                <th
                  className="
                    pb-4
                    font-semibold
                  "
                >
                  Score
                </th>

                <th
                  className="
                    pb-4
                    font-semibold
                  "
                >
                  Status
                </th>

                <th
                  className="
                    pb-4
                    font-semibold
                    text-center
                  "
                >
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {reports.map(
                (report) => {

                  const reportDate =
                    report.ended_at ||
                    report.started_at ||
                    report.created_at;


                  return (

                    <tr
                      key={
                        report.id
                      }
                      className="
                        border-b
                        last:border-b-0
                        hover:bg-[#FAFAFD]
                        transition
                      "
                    >

                      <td
                        className="
                          py-5
                          pr-4
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
                              w-12
                              h-12
                              rounded-2xl
                              bg-[#F2EEFF]
                              flex
                              justify-center
                              items-center
                              shrink-0
                            "
                          >

                            <FileText
                              className="
                                text-[#7B6EF6]
                              "
                            />

                          </div>


                          <div>

                            <h3
                              className="
                                font-semibold
                                text-[#172554]
                              "
                            >
                              {getReportTitle(
                                report
                              )}
                            </h3>

                            <p
                              className="
                                text-sm
                                text-slate-400
                                mt-1
                              "
                            >
                              Session #{report.id}
                            </p>

                            <p
                              className="
                                text-xs
                                text-slate-400
                                mt-1
                                max-w-[280px]
                              "
                            >
                              {getGamesText(
                                report
                              )}
                            </p>

                          </div>

                        </div>

                      </td>


                      <td
                        className="
                          pr-4
                          text-slate-600
                        "
                      >
                        {formatDate(
                          reportDate
                        )}
                      </td>


                      <td
                        className="
                          pr-4
                        "
                      >

                        <span
                          className="
                            font-bold
                            text-[#7B6EF6]
                          "
                        >
                          {report.score !==
                            null &&
                          report.score !==
                            undefined
                            ? `${Math.round(
                                Number(
                                  report.score
                                )
                              )}%`
                            : "—"}
                        </span>

                      </td>


                      <td
                        className="
                          pr-4
                        "
                      >

                        <span
                          className="
                            bg-green-100
                            text-green-700
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            flex
                            items-center
                            gap-2
                            w-fit
                            font-semibold
                          "
                        >

                          <CheckCircle
                            size={14}
                          />

                          Completed

                        </span>

                      </td>


                      <td>

                        <div
                          className="
                            flex
                            justify-center
                          "
                        >

                          <button
                            type="button"
                            title="View Report"
                            onClick={() => {
                              navigate(
                                `/sessions/${report.id}`
                              );
                            }}
                            className="
                              w-10
                              h-10
                              rounded-xl
                              bg-blue-100
                              text-blue-600
                              flex
                              justify-center
                              items-center
                              hover:bg-blue-200
                              transition
                            "
                          >

                            <Eye
                              size={18}
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>

      )}

    </Card>

  );

};


export default ReportsTable;