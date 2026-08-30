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
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
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
    session.games.length ===
      0
  ) {
    return "Assessment Report";
  }


  const names =
    session.games
      .map(
        game =>
          game.game_name
      )
      .filter(
        Boolean
      );


  if (
    names.length ===
    0
  ) {
    return "Assessment Report";
  }


  if (
    names.length ===
    1
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
    session.games.length ===
      0
  ) {
    return "No game details";
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


const ReportsTable = () => {

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
    reports,
    setReports,
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

      const loadReports =
        async () => {

          if (
            !Number.isInteger(
              childId
            ) ||
            childId <=
              0
          ) {

            setReports(
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


            const sessions =
              await getSessions();


            const completedReports =
              sessions
                .filter(
                  session =>
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

          } catch (
            loadError
          ) {

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

            setLoading(
              false
            );

          }

        };


      loadReports();

    },
    [
      childId,
    ]
  );


  return (

    <Card>

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
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
              shrink-0
              rounded-[13px]
              bg-[#F0EDFF]
              text-[#7566EB]
              flex
              items-center
              justify-center
            "
          >

            <FileText
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
              Assessment Reports
            </h2>


            <p
              className="
                text-[10.5px]
                text-[#A0A3B4]
                mt-1
              "
            >
              Completed assessment history
            </p>

          </div>

        </div>


        <button
          type="button"
          onClick={() => {

            navigate(
              "/sessions"
            );

          }}
          className="
            h-9
            px-3.5
            rounded-[11px]
            border
            border-[#E4DFFF]
            bg-[#F7F4FF]
            text-[#7566EB]
            flex
            items-center
            justify-center
            gap-1.5
            text-[10px]
            font-bold
            hover:bg-[#F0ECFF]
            transition
          "
        >

          View All Sessions

          <ArrowUpRight
            size={13}
          />

        </button>

      </div>


      {loading && (

        <div
          className="
            min-h-[210px]
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
              Loading reports...
            </p>

          </div>

        </div>

      )}


      {!loading &&
        error && (

        <div
          className="
            min-h-[150px]
            mt-4
            rounded-[14px]
            bg-[#FFF0F3]
            border
            border-[#F6D8DF]
            p-5
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
              text-[12px]
              text-[#B9415E]
            "
          >
            Unable to load reports
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
        !error &&
        reports.length ===
          0 && (

        <div
          className="
            min-h-[220px]
            flex
            flex-col
            items-center
            justify-center
            text-center
          "
        >

          <div
            className="
              w-12
              h-12
              rounded-[15px]
              bg-[#F0EDFF]
              text-[#7566EB]
              flex
              justify-center
              items-center
            "
          >

            <FileText
              size={20}
            />

          </div>


          <h3
            className="
              font-bold
              text-[13px]
              text-[#55586D]
              mt-3
            "
          >
            No reports yet
          </h3>


          <p
            className="
              text-[10.5px]
              text-[#A0A3B4]
              mt-1.5
            "
          >
            Completed assessment sessions will appear here.
          </p>

        </div>

      )}


      {!loading &&
        !error &&
        reports.length >
          0 && (

        <div
          className="
            mt-4
            rounded-[16px]
            border
            border-[#EFEFF5]
            overflow-hidden
          "
        >

          <div
            className="
              overflow-x-auto
            "
          >

            <table
              className="
                w-full
                min-w-[760px]
                border-collapse
              "
            >

              <thead
                className="
                  bg-[#FAFAFC]
                "
              >

                <tr>

                  <th
                    className="
                      h-[44px]
                      px-4
                      text-left
                      text-[10px]
                      font-semibold
                      text-[#999CAD]
                      border-b
                      border-[#EFEFF5]
                    "
                  >
                    Report
                  </th>


                  <th
                    className="
                      h-[44px]
                      px-4
                      text-left
                      text-[10px]
                      font-semibold
                      text-[#999CAD]
                      border-b
                      border-[#EFEFF5]
                    "
                  >
                    Date
                  </th>


                  <th
                    className="
                      h-[44px]
                      px-4
                      text-left
                      text-[10px]
                      font-semibold
                      text-[#999CAD]
                      border-b
                      border-[#EFEFF5]
                    "
                  >
                    Score
                  </th>


                  <th
                    className="
                      h-[44px]
                      px-4
                      text-left
                      text-[10px]
                      font-semibold
                      text-[#999CAD]
                      border-b
                      border-[#EFEFF5]
                    "
                  >
                    Status
                  </th>


                  <th
                    className="
                      h-[44px]
                      px-4
                      text-center
                      text-[10px]
                      font-semibold
                      text-[#999CAD]
                      border-b
                      border-[#EFEFF5]
                    "
                  >
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {reports.map(
                  report => {

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
                          bg-white
                          hover:bg-[#FCFBFF]
                          transition
                          border-b
                          last:border-b-0
                          border-[#F1F1F6]
                        "
                      >

                        <td
                          className="
                            px-4
                            py-3
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
                                shrink-0
                                rounded-[12px]
                                bg-[#F0EDFF]
                                text-[#7566EB]
                                flex
                                justify-center
                                items-center
                              "
                            >

                              <FileText
                                size={16}
                              />

                            </div>


                            <div
                              className="
                                min-w-0
                              "
                            >

                              <h3
                                className="
                                  text-[11px]
                                  font-bold
                                  text-[#454762]
                                "
                              >
                                {getReportTitle(
                                  report
                                )}
                              </h3>


                              <p
                                className="
                                  text-[9px]
                                  text-[#A0A3B4]
                                  mt-1
                                "
                              >
                                Session #{report.id}
                              </p>


                              <p
                                className="
                                  max-w-[260px]
                                  text-[9px]
                                  text-[#A0A3B4]
                                  mt-1
                                  truncate
                                "
                                title={
                                  getGamesText(
                                    report
                                  )
                                }
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
                            px-4
                            text-[10.5px]
                            text-[#74778B]
                            whitespace-nowrap
                          "
                        >
                          {formatDate(
                            reportDate
                          )}
                        </td>


                        <td
                          className="
                            px-4
                          "
                        >

                          <span
                            className="
                              min-w-[48px]
                              px-2.5
                              py-1.5
                              rounded-[9px]
                              inline-flex
                              items-center
                              justify-center
                              bg-[#F3F0FF]
                              text-[#7566EB]
                              text-[10px]
                              font-extrabold
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
                            px-4
                          "
                        >

                          <span
                            className="
                              px-2.5
                              py-1.5
                              rounded-full
                              inline-flex
                              items-center
                              gap-1.5
                              bg-[#ECFAF4]
                              text-[#3E9E7D]
                              text-[9px]
                              font-bold
                              whitespace-nowrap
                            "
                          >

                            <CheckCircle
                              size={12}
                            />

                            Completed

                          </span>

                        </td>


                        <td
                          className="
                            px-4
                          "
                        >

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
                                w-9
                                h-9
                                rounded-[10px]
                                border
                                border-[#E5E0FF]
                                bg-[#F7F4FF]
                                text-[#7565E6]
                                flex
                                justify-center
                                items-center
                                hover:bg-[#EEE9FF]
                                transition
                              "
                            >

                              <Eye
                                size={15}
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

        </div>

      )}

    </Card>

  );

};


export default ReportsTable;