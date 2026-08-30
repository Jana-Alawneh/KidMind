import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  CalendarPlus,
  FileText,
  UserPlus,
  X,
  ArrowUpRight,
  Zap,
} from "lucide-react";

import AddChildModal from "../children/AddChildModal";
import StartSessionModal from "../sessions/StartSessionModal";

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


const formatDate = (
  date
) => {

  if (!date) {
    return "—";
  }


  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

};


const QuickActions = () => {

  const navigate =
    useNavigate();


  const [
    addChildOpen,
    setAddChildOpen,
  ] = useState(false);


  const [
    startSessionOpen,
    setStartSessionOpen,
  ] = useState(false);


  const [
    reportModalOpen,
    setReportModalOpen,
  ] = useState(false);


  const [
    completedSessions,
    setCompletedSessions,
  ] = useState([]);


  const [
    selectedReportSessionId,
    setSelectedReportSessionId,
  ] = useState("");


  const [
    reportsLoading,
    setReportsLoading,
  ] = useState(false);


  const [
    reportsError,
    setReportsError,
  ] = useState("");


  const handleSessionStarted = (
    session
  ) => {

    const sessionId =
      Number(
        session?.id
      );


    if (
      !Number.isInteger(
        sessionId
      ) ||
      sessionId <= 0
    ) {

      window.alert(
        "Session was created, but the session ID is invalid."
      );

      return;

    }


    setStartSessionOpen(
      false
    );


    navigate(
      `/sessions/${sessionId}`
    );

  };


  const openReportModal =
    async () => {

      try {

        setReportModalOpen(
          true
        );

        setReportsLoading(
          true
        );

        setReportsError(
          ""
        );

        setSelectedReportSessionId(
          ""
        );


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


        const reports =
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


                return {
                  ...session,

                  reportDate:
                    getSessionDate(
                      session
                    ),

                  reportChildName:
                    session.child_name ||
                    child?.full_name ||
                    child?.name ||
                    `Child #${session.child_id}`,
                };

              }
            )
            .sort(
              (
                first,
                second
              ) => {

                const firstTime =
                  first.reportDate
                    ?.getTime() ||
                  0;


                const secondTime =
                  second.reportDate
                    ?.getTime() ||
                  0;


                return (
                  secondTime -
                  firstTime
                );

              }
            );


        setCompletedSessions(
          reports
        );

      } catch (
        error
      ) {

        console.error(
          "Failed to load completed sessions:",
          error
        );


        setReportsError(
          error instanceof Error
            ? error.message
            : "Failed to load completed sessions"
        );

      } finally {

        setReportsLoading(
          false
        );

      }

    };


  const handleGenerateReport =
    () => {

      const sessionId =
        Number(
          selectedReportSessionId
        );


      if (
        !Number.isInteger(
          sessionId
        ) ||
        sessionId <= 0
      ) {

        window.alert(
          "Please select a completed assessment."
        );

        return;

      }


      setReportModalOpen(
        false
      );


      navigate(
        `/assessment-report?sessionId=${sessionId}`
      );

    };


  const actions = [
    {
      title: "Add Child",
      description:
        "Register a child in your care workspace.",
      icon: UserPlus,
      className: "purple",
      onClick: () =>
        setAddChildOpen(
          true
        ),
    },
    {
      title: "Create Session",
      description:
        "Start a new cognitive assessment session.",
      icon: CalendarPlus,
      className: "blue",
      onClick: () =>
        setStartSessionOpen(
          true
        ),
    },
    {
      title: "Generate Report",
      description:
        "Create a report from a completed assessment.",
      icon: FileText,
      className: "pink",
      onClick:
        openReportModal,
    },
  ];


  return (

    <>

      <section className="quick-panel">

        <div className="quick-heading">

          <div className="quick-heading-icon">

            <Zap
              size={18}
            />

          </div>


          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Common therapist tasks
            </p>

          </div>

        </div>


        <div className="quick-list">

          {
            actions.map(
              action => {

                const Icon =
                  action.icon;


                return (

                  <button
                    key={
                      action.title
                    }
                    type="button"
                    className="quick-action"
                    onClick={
                      action.onClick
                    }
                  >

                    <div
                      className={
                        `quick-action-icon ${action.className}`
                      }
                    >

                      <Icon
                        size={19}
                      />

                    </div>


                    <div className="quick-action-copy">

                      <strong>
                        {
                          action.title
                        }
                      </strong>

                      <span>
                        {
                          action.description
                        }
                      </span>

                    </div>


                    <ArrowUpRight
                      size={17}
                      className="quick-action-arrow"
                    />

                  </button>

                );

              }
            )
          }

        </div>

      </section>


      {
        addChildOpen && (

          <AddChildModal
            close={() =>
              setAddChildOpen(
                false
              )
            }
            onSuccess={async () => {

              setAddChildOpen(
                false
              );

            }}
          />

        )
      }


      {
        startSessionOpen && (

          <StartSessionModal
            close={() =>
              setStartSessionOpen(
                false
              )
            }
            onStarted={
              handleSessionStarted
            }
          />

        )
      }


      {
        reportModalOpen && (

          <div className="report-modal-backdrop">

            <div className="report-modal">

              <div className="report-modal-heading">

                <div className="report-modal-title">

                  <div className="report-modal-icon">

                    <FileText
                      size={21}
                    />

                  </div>


                  <div>

                    <h2>
                      Generate Report
                    </h2>

                    <p>
                      Select a completed
                      assessment session.
                    </p>

                  </div>

                </div>


                <button
                  type="button"
                  className="report-close"
                  onClick={() =>
                    setReportModalOpen(
                      false
                    )
                  }
                >

                  <X
                    size={19}
                  />

                </button>

              </div>


              {
                reportsLoading && (

                  <div className="report-loading">

                    <div className="report-loader" />

                    <p>
                      Loading completed assessments...
                    </p>

                  </div>

                )
              }


              {
                !reportsLoading &&
                reportsError && (

                  <div className="report-error">

                    {
                      reportsError
                    }

                  </div>

                )
              }


              {
                !reportsLoading &&
                !reportsError &&
                completedSessions.length ===
                  0 && (

                  <div className="report-empty">

                    <strong>
                      No completed assessments
                    </strong>

                    <p>
                      A report can be generated
                      after an assessment session
                      is completed.
                    </p>

                  </div>

                )
              }


              {
                !reportsLoading &&
                !reportsError &&
                completedSessions.length >
                  0 && (

                  <>

                    <label className="report-label">
                      Completed Assessment
                    </label>


                    <select
                      value={
                        selectedReportSessionId
                      }
                      onChange={
                        event =>
                          setSelectedReportSessionId(
                            event.target.value
                          )
                      }
                      className="report-select"
                    >

                      <option value="">
                        Select assessment
                      </option>


                      {
                        completedSessions.map(
                          session => (

                            <option
                              key={
                                session.id
                              }
                              value={
                                session.id
                              }
                            >

                              {
                                session.reportChildName
                              }

                              {" — Session #"}

                              {
                                session.id
                              }

                              {" — "}

                              {
                                formatDate(
                                  session.reportDate
                                )
                              }

                              {
                                session.score !==
                                  null &&
                                session.score !==
                                  undefined
                                  ? ` — ${Math.round(
                                      Number(
                                        session.score
                                      )
                                    )}%`
                                  : ""
                              }

                            </option>

                          )
                        )
                      }

                    </select>


                    <div className="report-actions">

                      <button
                        type="button"
                        className="report-cancel"
                        onClick={() =>
                          setReportModalOpen(
                            false
                          )
                        }
                      >
                        Cancel
                      </button>


                      <button
                        type="button"
                        className="report-generate"
                        onClick={
                          handleGenerateReport
                        }
                        disabled={
                          !selectedReportSessionId
                        }
                      >
                        Generate Report
                      </button>

                    </div>

                  </>

                )
              }

            </div>

          </div>

        )
      }


      <style>
        {`

        .quick-panel {
          height: 100%;
          padding: 22px;
          border-radius: 22px;
          background: white;
          border: 1px solid #ECECF4;
          box-shadow:
            0 8px 26px
            rgba(68,68,110,.035);
        }

        .quick-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 18px;
        }

        .quick-heading-icon {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #7465E8;
          background: #F0EDFF;
        }

        .quick-heading h2 {
          margin: 0;
          color: #333554;
          font-size: 16px;
        }

        .quick-heading p {
          margin: 4px 0 0;
          color: #A0A3B4;
          font-size: 11.5px;
        }

        .quick-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .quick-action {
          width: 100%;
          min-height: 78px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px;
          border-radius: 16px;
          border: 1px solid #EFEFF5;
          background: #FCFCFE;
          cursor: pointer;
          text-align: left;
          transition: .18s ease;
          font-family: inherit;
        }

        .quick-action:hover {
          transform: translateY(-1px);
          border-color: #DED8FF;
          background: #FBFAFF;
          box-shadow:
            0 7px 18px
            rgba(117,102,232,.06);
        }

        .quick-action-icon {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
        }

        .quick-action-icon.purple {
          color: #7566EB;
          background: #F0EDFF;
        }

        .quick-action-icon.blue {
          color: #5595DD;
          background: #EDF6FF;
        }

        .quick-action-icon.pink {
          color: #D867B4;
          background: #FFF0FA;
        }

        .quick-action-copy {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .quick-action-copy strong {
          color: #3B3D5B;
          font-size: 12.5px;
        }

        .quick-action-copy span {
          margin-top: 4px;
          color: #9A9DAF;
          font-size: 10.5px;
          line-height: 1.4;
        }

        .quick-action-arrow {
          flex: 0 0 auto;
          color: #B0B2C1;
          transition: .18s ease;
        }

        .quick-action:hover
        .quick-action-arrow {
          color: #7566EB;
          transform: translate(2px,-2px);
        }

        .report-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(30,31,50,.32);
          backdrop-filter: blur(4px);
        }

        .report-modal {
          width: 100%;
          max-width: 560px;
          padding: 25px;
          border-radius: 22px;
          background: white;
          border: 1px solid #ECECF4;
          box-shadow:
            0 24px 70px
            rgba(35,36,67,.16);
        }

        .report-modal-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 23px;
        }

        .report-modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .report-modal-icon {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: #D867B4;
          background: #FFF0FA;
        }

        .report-modal-title h2 {
          margin: 0;
          color: #333554;
          font-size: 18px;
        }

        .report-modal-title p {
          margin: 4px 0 0;
          color: #9EA1B3;
          font-size: 11.5px;
        }

        .report-close {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 10px;
          display: grid;
          place-items: center;
          color: #A1A4B5;
          background: #F8F8FB;
          cursor: pointer;
        }

        .report-loading {
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .report-loader {
          width: 34px;
          height: 34px;
          border: 4px solid #E6E2FF;
          border-top-color: #7B6EF6;
          border-radius: 50%;
          animation:
            report-spin .8s
            linear infinite;
        }

        .report-loading p {
          margin: 11px 0 0;
          color: #A0A3B4;
          font-size: 11.5px;
        }

        .report-error {
          padding: 14px 16px;
          border-radius: 14px;
          color: #B9415E;
          background: #FFF0F3;
          border: 1px solid #F6D8DF;
          font-size: 12px;
        }

        .report-empty {
          padding: 24px;
          border-radius: 16px;
          text-align: center;
          background: #F8F8FB;
        }

        .report-empty strong {
          color: #5D6077;
          font-size: 13px;
        }

        .report-empty p {
          margin: 5px 0 0;
          color: #9DA0B1;
          font-size: 11.5px;
          line-height: 1.5;
        }

        .report-label {
          display: block;
          margin-bottom: 7px;
          color: #676A80;
          font-size: 11.5px;
          font-weight: 600;
        }

        .report-select {
          width: 100%;
          height: 45px;
          padding: 0 13px;
          border: 1px solid #E4E5ED;
          border-radius: 12px;
          outline: none;
          color: #5C5F76;
          background: white;
          font-size: 12px;
        }

        .report-select:focus {
          border-color: #CFC7FF;
        }

        .report-actions {
          display: flex;
          gap: 11px;
          margin-top: 20px;
        }

        .report-actions button {
          height: 43px;
          flex: 1;
          border-radius: 12px;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
        }

        .report-cancel {
          color: #73768B;
          background: white;
          border: 1px solid #E4E5ED;
        }

        .report-generate {
          color: white;
          background: #7968ED;
          border: 1px solid #7968ED;
        }

        .report-generate:hover:not(:disabled) {
          background: #6D5CE3;
        }

        .report-generate:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        @keyframes report-spin {

          to {
            transform: rotate(360deg);
          }

        }

        `}
      </style>

    </>

  );

};


export default QuickActions;