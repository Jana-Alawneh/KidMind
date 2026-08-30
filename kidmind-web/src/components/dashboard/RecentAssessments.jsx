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
  ArrowUpRight,
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
      month: "short",
      day: "numeric",

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
    session.games.length ===
      0
  ) {
    return "Assessment Session";
  }


  if (
    session.games.length ===
    1
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
        game =>
          game.status ===
            "Completed" ||
          game.status ===
            "Failed"
      )
      .map(
        game =>
          Number(
            game.score
          )
      )
      .filter(
        score =>
          Number.isFinite(
            score
          )
      );


  if (
    scores.length ===
    0
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
    session.score !==
      null &&
    session.score !==
      undefined &&
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


const getInitial = (
  name
) => {

  return String(
    name || "C"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

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


  useEffect(
    () => {

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
                  session =>
                    session.status ===
                    "Completed"
                )
                .map(
                  session => {

                    const child =
                      allChildren.find(
                        item =>
                          Number(
                            item.id
                          ) ===
                          Number(
                            session.child_id
                          )
                      );


                    const childName =
                      session.child_name ||
                      child?.full_name ||
                      child?.name ||
                      `Child #${session.child_id}`;


                    return {
                      ...session,

                      dashboardDate:
                        getAssessmentDate(
                          session
                        ),

                      dashboardChildName:
                        childName,

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

          } catch (
            loadError
          ) {

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

    },
    []
  );


  return (

    <Card>

      <div className="assessment-heading">

        <div>

          <h2>
            Recent Assessments
          </h2>

          <p>
            Latest cognitive evaluation results
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/sessions"
            )
          }
        >
          View All
        </button>

      </div>


      {
        loading && (

          <div className="assessment-state">

            <div>

              <div className="assessment-loader" />

              <p>
                Loading assessments...
              </p>

            </div>

          </div>

        )
      }


      {
        !loading &&
        error && (

          <div className="assessment-state">

            <div className="assessment-error">

              <strong>
                Unable to load assessments
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
        assessments.length ===
          0 && (

          <div className="assessment-state">

            <div className="assessment-empty">

              <div className="assessment-empty-icon">

                <FileText
                  size={20}
                />

              </div>

              <strong>
                No completed assessments
              </strong>

              <span>
                Completed assessment results
                will appear here.
              </span>

            </div>

          </div>

        )
      }


      {
        !loading &&
        !error &&
        assessments.length >
          0 && (

          <div className="assessment-table-wrap">

            <table className="assessment-table">

              <thead>

                <tr>

                  <th>
                    Child
                  </th>

                  <th>
                    Activity
                  </th>

                  <th>
                    Score
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th
                    aria-label="Actions"
                  />

                </tr>

              </thead>


              <tbody>

                {
                  assessments.map(
                    item => (

                      <tr
                        key={
                          item.id
                        }
                      >

                        <td>

                          <div className="assessment-child">

                            <div className="assessment-avatar">

                              {
                                getInitial(
                                  item.dashboardChildName
                                )
                              }

                            </div>


                            <div>

                              <strong>

                                {
                                  item.dashboardChildName
                                }

                              </strong>

                              <span>
                                Session #{item.id}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <span className="assessment-activity">

                            {
                              getActivityText(
                                item
                              )
                            }

                          </span>

                        </td>


                        <td>

                          <span className="assessment-score">

                            {
                              typeof item.dashboardScore ===
                                "number"
                                ? `${item.dashboardScore}%`
                                : "—"
                            }

                          </span>

                        </td>


                        <td>

                          <span className="assessment-date">

                            {
                              formatDate(
                                item.dashboardDate
                              )
                            }

                          </span>

                        </td>


                        <td>

                          <span className="assessment-status">
                            Completed
                          </span>

                        </td>


                        <td className="assessment-action-cell">

                          <button
                            type="button"
                            className="assessment-report-button"
                            onClick={() =>
                              navigate(
                                `/sessions/${item.id}`
                              )
                            }
                          >

                            <span>
                              View Report
                            </span>

                            <ArrowUpRight
                              size={14}
                            />

                          </button>

                        </td>

                      </tr>

                    )
                  )
                }

              </tbody>

            </table>

          </div>

        )
      }


      <style>
        {`

        .assessment-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 17px;
        }

        .assessment-heading h2 {
          margin: 0;
          color: #333554;
          font-size: 16px;
          font-weight: 700;
        }

        .assessment-heading p {
          margin: 4px 0 0;
          color: #A0A3B4;
          font-size: 11.5px;
        }

        .assessment-heading button {
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

        .assessment-heading button:hover {
          background: #F3F0FF;
        }

        .assessment-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #EFEFF5;
          border-radius: 16px;
        }

        .assessment-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
          table-layout: auto;
        }

        .assessment-table thead {
          background: #FAFAFC;
        }

        .assessment-table th {
          height: 45px;
          padding: 0 14px;
          color: #999CAD;
          border-bottom: 1px solid #EFEFF5;
          text-align: left;
          white-space: nowrap;
          font-size: 10.5px;
          font-weight: 600;
        }

        .assessment-table th:first-child,
        .assessment-table td:first-child {
          padding-left: 17px;
        }

        .assessment-table th:last-child,
        .assessment-table td:last-child {
          padding-right: 17px;
        }

        .assessment-table td {
          height: 73px;
          padding: 10px 14px;
          border-bottom: 1px solid #F1F1F6;
          vertical-align: middle;
        }

        .assessment-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .assessment-table tbody tr {
          background: white;
          transition: .16s ease;
        }

        .assessment-table tbody tr:hover {
          background: #FCFBFF;
        }

        .assessment-child {
          min-width: 180px;
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .assessment-avatar {
          width: 39px;
          height: 39px;
          flex: 0 0 39px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #B05D9B;
          background: #FFF0FA;
          font-size: 13px;
          font-weight: 800;
        }

        .assessment-child > div:last-child {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .assessment-child strong {
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #373953;
          font-size: 12px;
        }

        .assessment-child span {
          margin-top: 3px;
          color: #A0A3B4;
          font-size: 9.5px;
        }

        .assessment-activity {
          display: block;
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #62657A;
          font-size: 11.5px;
        }

        .assessment-score {
          color: #7566EB;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .assessment-date {
          color: #7B7E91;
          font-size: 11px;
          white-space: nowrap;
        }

        .assessment-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 25px;
          padding: 4px 9px;
          border-radius: 999px;
          color: #3E9E7D;
          background: #ECFAF4;
          font-size: 9.5px;
          font-weight: 700;
          white-space: nowrap;
        }

        .assessment-action-cell {
          text-align: right;
        }

        .assessment-report-button {
          min-width: 104px;
          height: 33px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 11px;
          border: 1px solid #E1DCFF;
          border-radius: 10px;
          color: #7566EB;
          background: #F6F3FF;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          transition: .18s ease;
        }

        .assessment-report-button:hover {
          color: white;
          background: #7968ED;
          border-color: #7968ED;
          transform: translateY(-1px);
        }

        .assessment-state {
          min-height: 180px;
          display: grid;
          place-items: center;
          text-align: center;
        }

        .assessment-loader {
          width: 34px;
          height: 34px;
          margin: auto;
          border: 4px solid #E6E2FF;
          border-top-color: #7B6EF6;
          border-radius: 50%;
          animation:
            assessment-spin .8s
            linear infinite;
        }

        .assessment-state p {
          margin: 10px 0 0;
          color: #A0A3B4;
          font-size: 11.5px;
        }

        .assessment-error {
          max-width: 350px;
          display: flex;
          flex-direction: column;
          padding: 15px 18px;
          border: 1px solid #F6D8DF;
          border-radius: 14px;
          color: #B9415E;
          background: #FFF0F3;
        }

        .assessment-error strong {
          font-size: 12.5px;
        }

        .assessment-error span {
          margin-top: 4px;
          font-size: 11px;
        }

        .assessment-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #999CAD;
        }

        .assessment-empty-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          margin-bottom: 10px;
          border-radius: 13px;
          color: #7566EB;
          background: #F0EDFF;
        }

        .assessment-empty strong {
          color: #62657B;
          font-size: 12.5px;
        }

        .assessment-empty span {
          margin-top: 4px;
          font-size: 11px;
        }

        @keyframes assessment-spin {

          to {
            transform: rotate(360deg);
          }

        }

        `}
      </style>

    </Card>

  );

};


export default RecentAssessments;