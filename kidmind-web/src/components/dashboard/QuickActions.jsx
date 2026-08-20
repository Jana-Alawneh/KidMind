import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  CalendarPlus,
  FileText,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";

import Card from "../ui/Card";

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
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
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

      } catch (error) {

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
      title:
        "Add Child",

      icon:
        UserPlus,

      color:
        "bg-[#F3EEFF]",

      disabled:
        false,

      onClick:
        () => {

          setAddChildOpen(
            true
          );

        },
    },

    {
      title:
        "Create Session",

      icon:
        CalendarPlus,

      color:
        "bg-[#EAF7FF]",

      disabled:
        false,

      onClick:
        () => {

          setStartSessionOpen(
            true
          );

        },
    },

    {
      title:
        "Generate Report",

      icon:
        FileText,

      color:
        "bg-[#FFF4E8]",

      disabled:
        false,

      onClick:
        openReportModal,
    },

    {
      title:
        "AI Assistant",

      icon:
        Sparkles,

      color:
        "bg-[#EEF8E8]",

      disabled:
        true,

      onClick:
        null,
    },
  ];


  return (

    <>

      <Card>

        <h2
          className="
            text-xl
            font-semibold
            mb-6
          "
        >
          Quick Actions
        </h2>


        <div
          className="
            grid
            grid-cols-2
            gap-4
          "
        >

          {actions.map(
            (action) => {

              const Icon =
                action.icon;


              return (

                <button
                  key={
                    action.title
                  }
                  type="button"
                  disabled={
                    action.disabled
                  }
                  onClick={() => {

                    if (
                      action.disabled ||
                      !action.onClick
                    ) {
                      return;
                    }


                    action.onClick();

                  }}
                  className={`
                    ${action.color}
                    rounded-2xl
                    p-5
                    flex
                    flex-col
                    items-center
                    gap-3
                    transition

                    ${
                      action.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105 cursor-pointer"
                    }
                  `}
                >

                  <Icon
                    size={22}
                  />


                  <span
                    className="
                      font-semibold
                    "
                  >
                    {action.title}
                  </span>


                  {action.disabled && (

                    <span
                      className="
                        text-[10px]
                        text-slate-500
                        font-medium
                      "
                    >
                      Coming Soon
                    </span>

                  )}

                </button>

              );

            }
          )}

        </div>

      </Card>


      {addChildOpen && (

        <AddChildModal
          close={() => {

            setAddChildOpen(
              false
            );

          }}
          onSuccess={async () => {

            setAddChildOpen(
              false
            );

          }}
        />

      )}


      {startSessionOpen && (

        <StartSessionModal
          close={() => {

            setStartSessionOpen(
              false
            );

          }}
          onStarted={
            handleSessionStarted
          }
        />

      )}


      {reportModalOpen && (

        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/30
            flex
            items-center
            justify-center
            p-4
          "
        >

          <div
            className="
              bg-white
              w-full
              max-w-[560px]
              rounded-3xl
              p-8
              shadow-xl
            "
          >

            <div
              className="
                flex
                justify-between
                items-start
                gap-4
                mb-7
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
                    bg-[#FFF4E8]
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FileText
                    size={22}
                  />

                </div>


                <div>

                  <h2
                    className="
                      text-2xl
                      font-bold
                    "
                  >
                    Generate Report
                  </h2>


                  <p
                    className="
                      text-sm
                      text-slate-500
                      mt-1
                    "
                  >
                    Select a completed assessment session.
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={() => {

                  setReportModalOpen(
                    false
                  );

                }}
              >

                <X
                  className="
                    text-slate-400
                  "
                />

              </button>

            </div>


            {reportsLoading && (

              <div
                className="
                  min-h-[150px]
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
                      border-[#FFEBD4]
                      border-t-[#F59E0B]
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
                    Loading completed assessments...
                  </p>

                </div>

              </div>

            )}


            {!reportsLoading &&
              reportsError && (

              <div
                className="
                  bg-red-50
                  border
                  border-red-100
                  rounded-2xl
                  p-4
                  text-sm
                  text-red-600
                "
              >
                {reportsError}
              </div>

            )}


            {!reportsLoading &&
              !reportsError &&
              completedSessions.length ===
                0 && (

              <div
                className="
                  bg-slate-50
                  rounded-2xl
                  p-6
                  text-center
                "
              >

                <p
                  className="
                    font-semibold
                    text-slate-600
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
                  A report can be generated after an assessment session is completed.
                </p>

              </div>

            )}


            {!reportsLoading &&
              !reportsError &&
              completedSessions.length >
                0 && (

              <>

                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-slate-600
                    mb-2
                  "
                >
                  Completed Assessment
                </label>


                <select
                  value={
                    selectedReportSessionId
                  }
                  onChange={(
                    event
                  ) => {

                    setSelectedReportSessionId(
                      event.target.value
                    );

                  }}
                  className="
                    w-full
                    h-12
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    bg-white
                    outline-none
                    focus:border-[#7B6EF6]
                  "
                >

                  <option
                    value=""
                  >
                    Select assessment
                  </option>


                  {completedSessions.map(
                    (session) => (

                      <option
                        key={
                          session.id
                        }
                        value={
                          session.id
                        }
                      >
                        {session.reportChildName}
                        {" — Session #"}
                        {session.id}
                        {" — "}
                        {formatDate(
                          session.reportDate
                        )}
                        {session.score !==
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
                  )}

                </select>


                <div
                  className="
                    flex
                    gap-4
                    mt-7
                  "
                >

                  <button
                    type="button"
                    onClick={() => {

                      setReportModalOpen(
                        false
                      );

                    }}
                    className="
                      flex-1
                      h-12
                      rounded-xl
                      border
                      border-slate-200
                    "
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    onClick={
                      handleGenerateReport
                    }
                    disabled={
                      !selectedReportSessionId
                    }
                    className="
                      flex-1
                      h-12
                      rounded-xl
                      bg-[#7B6EF6]
                      text-white
                      font-semibold
                      hover:bg-[#6959F5]
                      disabled:opacity-50
                    "
                  >
                    Generate Report
                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}

    </>

  );

};


export default QuickActions;