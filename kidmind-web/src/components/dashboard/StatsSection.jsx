import {
  useEffect,
  useState,
} from "react";

import {
  Users,
  CalendarCheck,
  FileText,
  Activity,
} from "lucide-react";

import {
  getChildren,
} from "../../api/childrenApi";

import {
  getSessions,
} from "../../api/sessionsApi";


const getSessionDate = (
  session
) => {

  const value =
    session.created_at ||
    session.scheduled_at ||
    session.started_at ||
    session.ended_at;


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


const StatsSection = () => {

  const [
    childrenCount,
    setChildrenCount,
  ] = useState(0);


  const [
    monthSessionsCount,
    setMonthSessionsCount,
  ] = useState(0);


  const [
    reportsCount,
    setReportsCount,
  ] = useState(0);


  const [
    totalSessionsCount,
    setTotalSessionsCount,
  ] = useState(0);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState(false);


  useEffect(
    () => {

      const loadStats =
        async () => {

          try {

            setLoading(true);
            setError(false);


            const [
              children,
              sessions,
            ] =
              await Promise.all([
                getChildren(),
                getSessions(),
              ]);


            const childrenData =
              Array.isArray(
                children
              )
                ? children
                : [];


            const sessionsData =
              Array.isArray(
                sessions
              )
                ? sessions
                : [];


            const now =
              new Date();


            const currentYear =
              now.getFullYear();


            const currentMonth =
              now.getMonth();


            const sessionsThisMonth =
              sessionsData.filter(
                session => {

                  const date =
                    getSessionDate(
                      session
                    );


                  if (!date) {
                    return false;
                  }


                  return (
                    date.getFullYear() ===
                      currentYear &&
                    date.getMonth() ===
                      currentMonth
                  );

                }
              );


            const completedReports =
              sessionsData.filter(
                session =>
                  session.status ===
                  "Completed"
              );


            setChildrenCount(
              childrenData.length
            );


            setMonthSessionsCount(
              sessionsThisMonth.length
            );


            setReportsCount(
              completedReports.length
            );


            setTotalSessionsCount(
              sessionsData.length
            );

          } catch (
            loadError
          ) {

            console.error(
              "Failed to load dashboard statistics:",
              loadError
            );


            setError(true);

          } finally {

            setLoading(false);

          }

        };


      loadStats();

    },
    []
  );


  const displayValue =
    value => {

      if (loading) {
        return "—";
      }


      if (error) {
        return "—";
      }


      return String(
        value
      );

    };


  const stats = [
    {
      title: "Children",
      value:
        displayValue(
          childrenCount
        ),
      subtitle:
        "Assigned children",
      icon: Users,
      className: "purple",
    },
    {
      title: "Sessions",
      value:
        displayValue(
          monthSessionsCount
        ),
      subtitle:
        "Sessions this month",
      icon: CalendarCheck,
      className: "blue",
    },
    {
      title: "Reports",
      value:
        displayValue(
          reportsCount
        ),
      subtitle:
        "Completed assessments",
      icon: FileText,
      className: "pink",
    },
    {
      title: "All Sessions",
      value:
        displayValue(
          totalSessionsCount
        ),
      subtitle:
        "Total session records",
      icon: Activity,
      className: "green",
    },
  ];


  return (

    <div className="therapist-stats">

      {
        stats.map(
          item => {

            const Icon =
              item.icon;


            return (

              <div
                key={
                  item.title
                }
                className="therapist-stat-card"
              >

                <div
                  className={
                    `therapist-stat-icon ${item.className}`
                  }
                >

                  <Icon
                    size={22}
                  />

                </div>


                <div className="therapist-stat-info">

                  <span className="therapist-stat-label">

                    {
                      item.title
                    }

                  </span>


                  <strong>

                    {
                      item.value
                    }

                  </strong>


                  <small>

                    {
                      item.subtitle
                    }

                  </small>

                </div>

              </div>

            );

          }
        )
      }


      <style>
        {`

        .therapist-stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 17px;
          margin-top: 22px;
        }

        .therapist-stat-card {
          min-height: 126px;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 19px;
          border-radius: 20px;
          background: white;
          border: 1px solid #ECECF4;
          box-shadow:
            0 8px 26px
            rgba(68,68,110,.04);
        }

        .therapist-stat-icon {
          width: 47px;
          height: 47px;
          flex: 0 0 47px;
          display: grid;
          place-items: center;
          border-radius: 14px;
        }

        .therapist-stat-icon.purple {
          color: #7566EB;
          background: #F0EDFF;
        }

        .therapist-stat-icon.blue {
          color: #5595DD;
          background: #EDF6FF;
        }

        .therapist-stat-icon.pink {
          color: #D867B4;
          background: #FFF0FA;
        }

        .therapist-stat-icon.green {
          color: #48A784;
          background: #ECFAF4;
        }

        .therapist-stat-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .therapist-stat-label {
          color: #85899D;
          font-size: 11.5px;
        }

        .therapist-stat-info strong {
          margin: 2px 0;
          color: #2E3054;
          font-size: 25px;
          line-height: 1.2;
        }

        .therapist-stat-info small {
          color: #A0A3B3;
          font-size: 10.5px;
        }

        @media (max-width: 1150px) {

          .therapist-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

        }

        @media (max-width: 650px) {

          .therapist-stats {
            grid-template-columns: 1fr;
          }

        }

        `}
      </style>

    </div>

  );

};


export default StatsSection;