import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  UserRoundCog,
  Link2,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../services/api";
import AdminChildren from "../components/admin/AdminChildren";
import AdminParents from "../components/admin/AdminParents";
import AdminTherapists from "../components/admin/AdminTherapists";
import AdminAssignments from "../components/admin/AdminAssignments";
import AdminReports from "../components/admin/AdminReports";


const menu = [
  {
    key: "overview",
    title: "Overview",
    icon: LayoutDashboard,
  },
  {
    key: "children",
    title: "Children",
    icon: Users,
  },
  {
    key: "parents",
    title: "Parents",
    icon: UserRound,
  },
  {
    key: "therapists",
    title: "Therapists",
    icon: UserRoundCog,
  },
  {
    key: "assignments",
    title: "Care Coordination",
    icon: Link2,
  },
  {
    key: "reports",
    title: "Reports",
    icon: FileText,
  },
  {
    key: "messages",
    title: "Messages",
    icon: MessageCircle,
  },
  {
    key: "feedback",
    title: "Feedback",
    icon: ClipboardList,
  },
  {
    key: "settings",
    title: "Settings",
    icon: Settings,
  },
];


const roleLabel = {
  admin: "Admin",
  therapist: "Therapist",
  parent: "Parent",
};


const formatDate = (
  value
) => {

  if (!value) {
    return "—";
  }


  const date =
    new Date(value);


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
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

};


export default function AdminDashboard() {

  const navigate =
    useNavigate();


  const [
    activeSection,
    setActiveSection,
  ] = useState("overview");


  const [
    users,
    setUsers,
  ] = useState([]);


  const [
    children,
    setChildren,
  ] = useState([]);


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


  const currentUser =
    useMemo(
      () => {

        try {

          return JSON.parse(
            sessionStorage.getItem(
              "kidmind_user"
            ) || "{}"
          );

        } catch {

          return {};

        }

      },
      []
    );


  useEffect(
    () => {

      let active = true;


      const loadDashboard =
        async () => {

          try {

            setLoading(true);

            setError("");


            const [
              usersResponse,
              childrenResponse,
              sessionsResponse,
            ] =
              await Promise.all([
                api.get(
                  "/users"
                ),
                api.get(
                  "/children"
                ),
                api.get(
                  "/sessions"
                ),
              ]);


            if (!active) {
              return;
            }


            setUsers(
              Array.isArray(
                usersResponse.data
              )
                ? usersResponse.data
                : []
            );


            setChildren(
              Array.isArray(
                childrenResponse.data
              )
                ? childrenResponse.data
                : []
            );


            setSessions(
              Array.isArray(
                sessionsResponse.data
              )
                ? sessionsResponse.data
                : []
            );

          } catch (requestError) {

            console.error(
              requestError
            );


            if (active) {

              setError(
                "Unable to load admin dashboard data."
              );

            }

          } finally {

            if (active) {

              setLoading(false);

            }

          }

        };


      loadDashboard();


      return () => {

        active = false;

      };

    },
    []
  );


  const parents =
    useMemo(
      () =>
        users.filter(
          user =>
            user.role ===
            "parent"
        ),
      [
        users,
      ]
    );


  const therapists =
    useMemo(
      () =>
        users.filter(
          user =>
            user.role ===
            "therapist"
        ),
      [
        users,
      ]
    );


  const completedAssessments =
    useMemo(
      () =>
        sessions.filter(
          session => {

            const status =
              String(
                session.status ||
                ""
              ).toLowerCase();


            return (
              status ===
                "completed" ||
              status ===
                "ended"
            );

          }
        ).length,
      [
        sessions,
      ]
    );


  const recentUsers =
    useMemo(
      () => {

        return [
          ...users,
        ]
          .sort(
            (
              first,
              second
            ) => {

              const firstDate =
                new Date(
                  first.created_at ||
                  0
                ).getTime();

              const secondDate =
                new Date(
                  second.created_at ||
                  0
                ).getTime();


              return (
                secondDate -
                firstDate
              );

            }
          )
          .slice(
            0,
            5
          );

      },
      [
        users,
      ]
    );


  const recentChildren =
    useMemo(
      () => {

        return [
          ...children,
        ]
          .sort(
            (
              first,
              second
            ) => {

              const firstDate =
                first.created_at
                  ? new Date(
                      first.created_at
                    ).getTime()
                  : Number(
                      first.id ||
                      0
                    );

              const secondDate =
                second.created_at
                  ? new Date(
                      second.created_at
                    ).getTime()
                  : Number(
                      second.id ||
                      0
                    );


              return (
                secondDate -
                firstDate
              );

            }
          )
          .slice(
            0,
            5
          );

      },
      [
        children,
      ]
    );


  const handleLogout = () => {

    sessionStorage.removeItem(
      "kidmind_token"
    );

    sessionStorage.removeItem(
      "kidmind_user"
    );


    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };


  const stats = [
    {
      title:
        "Children",
      value:
        children.length,
      subtitle:
        "Registered children",
      icon:
        Users,
      className:
        "purple",
    },
    {
      title:
        "Parents",
      value:
        parents.length,
      subtitle:
        "Parent accounts",
      icon:
        UserRound,
      className:
        "pink",
    },
    {
      title:
        "Therapists",
      value:
        therapists.length,
      subtitle:
        "Therapist accounts",
      icon:
        UserRoundCog,
      className:
        "blue",
    },
    {
      title:
        "Assessments",
      value:
        completedAssessments,
      subtitle:
        "Completed sessions",
      icon:
        FileText,
      className:
        "green",
    },
  ];


  const renderOverview =
    () => {

      return (

        <>

          <div className="admin-welcome">

            <div>

              <span className="admin-eyebrow">
                ADMIN CONTROL CENTER
              </span>

              <h1>
                Welcome back,
                {" "}
                {currentUser.full_name ||
                  "Admin"}
              </h1>

              <p>
                Monitor KidMind users,
                children, assessments,
                and system activity from
                one place.
              </p>

            </div>


            <div className="admin-welcome-icon">

              <ShieldCheck
                size={34}
              />

            </div>

          </div>


          {
            error && (

              <div className="admin-error">
                {error}
              </div>

            )
          }


          <div className="admin-stats">

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
                      className="admin-stat-card"
                    >

                      <div
                        className={
                          `stat-icon ${item.className}`
                        }
                      >

                        <Icon
                          size={22}
                        />

                      </div>


                      <div>

                        <span className="stat-label">
                          {item.title}
                        </span>

                        <strong>
                          {
                            loading
                              ? "—"
                              : item.value
                          }
                        </strong>

                        <small>
                          {item.subtitle}
                        </small>

                      </div>

                    </div>

                  );

                }
              )
            }

          </div>


          <div className="admin-grid">

            <section className="admin-panel">

              <div className="panel-heading">

                <div>

                  <h2>
                    Recent Users
                  </h2>

                  <p>
                    Latest accounts added
                    to KidMind
                  </p>

                </div>

              </div>


              {
                loading
                  ? (

                    <div className="admin-empty">
                      Loading users...
                    </div>

                  )
                  : recentUsers.length ===
                    0
                    ? (

                      <div className="admin-empty">
                        No users yet.
                      </div>

                    )
                    : (

                      <div className="admin-user-list">

                        {
                          recentUsers.map(
                            user => (

                              <div
                                key={
                                  user.id
                                }
                                className="admin-user-row"
                              >

                                <div className="user-avatar">

                                  {
                                    String(
                                      user.full_name ||
                                      "U"
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()
                                  }

                                </div>


                                <div className="user-main">

                                  <strong>
                                    {
                                      user.full_name
                                    }
                                  </strong>

                                  <span>
                                    {
                                      user.email
                                    }
                                  </span>

                                </div>


                                <div
                                  className={
                                    `role-pill ${user.role}`
                                  }
                                >

                                  {
                                    roleLabel[
                                      user.role
                                    ] ||
                                    user.role
                                  }

                                </div>


                                <span
                                  className={
                                    user.is_active
                                      ? "status-dot active"
                                      : "status-dot inactive"
                                  }
                                  title={
                                    user.is_active
                                      ? "Active"
                                      : "Inactive"
                                  }
                                />

                              </div>

                            )
                          )
                        }

                      </div>

                    )
              }

            </section>


            <section className="admin-panel">

              <div className="panel-heading">

                <div>

                  <h2>
                    Recent Children
                  </h2>

                  <p>
                    Latest registered
                    children
                  </p>

                </div>

              </div>


              {
                loading
                  ? (

                    <div className="admin-empty">
                      Loading children...
                    </div>

                  )
                  : recentChildren.length ===
                    0
                    ? (

                      <div className="admin-empty">
                        No children yet.
                      </div>

                    )
                    : (

                      <div className="admin-child-list">

                        {
                          recentChildren.map(
                            child => (

                              <div
                                key={
                                  child.id
                                }
                                className="admin-child-row"
                              >

                                <div className="child-avatar">

                                  {
                                    String(
                                      child.full_name ||
                                      "C"
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()
                                  }

                                </div>


                                <div className="child-main">

                                  <strong>
                                    {
                                      child.full_name
                                    }
                                  </strong>

                                  <span>

                                    {
                                      child.region ||
                                      "No region"
                                    }

                                  </span>

                                </div>


                                <div className="child-meta">

                                  <span>
                                    Parent
                                  </span>

                                  <strong>
                                    {
                                      child.parent_name ||
                                      "—"
                                    }
                                  </strong>

                                </div>

                              </div>

                            )
                          )
                        }

                      </div>

                    )
              }

            </section>

          </div>


          <section className="admin-panel admin-management">

            <div className="panel-heading">

              <div>

                <h2>
                  Administration
                </h2>

                <p>
                  Manage the main areas
                  of the KidMind system
                </p>

              </div>

            </div>


            <div className="management-grid">

              <button
                onClick={() =>
                  setActiveSection(
                    "children"
                  )
                }
              >

                <Users
                  size={23}
                />

                <span>
                  Manage Children
                </span>

                <small>
                  View children,
                  results and care
                  relationships
                </small>

              </button>


              <button
                onClick={() =>
                  setActiveSection(
                    "parents"
                  )
                }
              >

                <UserRound
                  size={23}
                />

                <span>
                  Manage Parents
                </span>

                <small>
                  Create and manage
                  parent accounts
                </small>

              </button>


              <button
                onClick={() =>
                  setActiveSection(
                    "therapists"
                  )
                }
              >

                <UserRoundCog
                  size={23}
                />

                <span>
                  Manage Therapists
                </span>

                <small>
                  Review therapists
                  and assigned children
                </small>

              </button>


              <button
                onClick={() =>
                  setActiveSection(
                    "assignments"
                  )
                }
              >

                <Link2
                  size={23}
                />

                <span>
                  Care Coordination
                </span>

                <small>
                  Connect children
                  with parents and
                  therapists
                </small>

              </button>

            </div>

          </section>

        </>

      );

    };


  const renderPlaceholder =
    () => {

      const item =
        menu.find(
          menuItem =>
            menuItem.key ===
            activeSection
        );


      const Icon =
        item?.icon ||
        LayoutDashboard;


      return (

        <div className="admin-placeholder">

          <div className="placeholder-icon">

            <Icon
              size={32}
            />

          </div>


          <h1>
            {
              item?.title ||
              "Admin"
            }
          </h1>


          <p>
            We will build this
            administration module
            next.
          </p>


          <button
            onClick={() =>
              setActiveSection(
                "overview"
              )
            }
          >
            Back to Overview
          </button>

        </div>

      );

    };


  return (

    <div className="admin-page">


      <aside className="admin-sidebar">

        <div className="admin-logo">

          <img
            src="/logo.png"
            alt="KidMind"
          />

        </div>


        <div className="admin-role">

          <div className="admin-role-icon">

            <ShieldCheck
              size={19}
            />

          </div>


          <div>

            <strong>
              Administrator
            </strong>

            <span>
              KidMind Control Center
            </span>

          </div>

        </div>


        <nav>

          {
            menu.map(
              item => {

                const Icon =
                  item.icon;

                const active =
                  activeSection ===
                  item.key;


                return (

                  <button
                    key={
                      item.key
                    }
                    className={
                      active
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveSection(
                        item.key
                      )
                    }
                  >

                    <Icon
                      size={19}
                    />

                    <span>
                      {item.title}
                    </span>

                  </button>

                );

              }
            )
          }

        </nav>


        <button
          className="admin-logout"
          onClick={
            handleLogout
          }
        >

          <LogOut
            size={19}
          />

          Logout

        </button>

      </aside>


      <main className="admin-main">

        <header className="admin-header">

          <div>

            <span className="header-label">
              KidMind Administration
            </span>

            <strong>
              {
                currentUser.full_name ||
                "Administrator"
              }
            </strong>

          </div>


          <button className="notification-button">

            <Bell
              size={20}
            />

          </button>

        </header>


        <div className="admin-content">

          {
  activeSection === "overview"
    ? renderOverview()
    : activeSection === "children"
      ? <AdminChildren />
      : activeSection === "parents"
        ? <AdminParents />
        : activeSection === "therapists"
          ? <AdminTherapists />
          : activeSection === "assignments"
            ? <AdminAssignments />
            : activeSection === "reports"
              ? <AdminReports />
              : renderPlaceholder()
}

        </div>

      </main>


      <style>
        {`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .admin-page {
          min-height: 100vh;
          display: flex;
          background: #F7F8FC;
          color: #252852;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .admin-sidebar {
          width: 270px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 18px 18px 16px;
          background: rgba(255,255,255,.94);
          border-right: 1px solid #ECECF5;
          box-shadow:
            8px 0 35px
            rgba(124,108,255,.05);
        }

        .admin-logo {
          display: flex;
          justify-content: center;
          height: 125px;
          overflow: hidden;
        }

        .admin-logo img {
          width: 220px;
          height: 150px;
          object-fit: contain;
        }

        .admin-role {
          display: flex;
          align-items: center;
          gap: 11px;
          margin: 3px 4px 17px;
          padding: 12px;
          border-radius: 16px;
          background:
            linear-gradient(
              135deg,
              #F2EEFF,
              #FBF3FF
            );
          border: 1px solid #EBE5FF;
        }

        .admin-role-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: #7665EE;
          background: white;
        }

        .admin-role strong {
          display: block;
          font-size: 13px;
          color: #37306F;
        }

        .admin-role span {
          display: block;
          margin-top: 2px;
          font-size: 10.5px;
          color: #989AB0;
        }

        .admin-sidebar nav {
          flex: 1;
          overflow-y: auto;
        }

        .admin-sidebar nav button {
          width: 100%;
          height: 43px;
          border: 0;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
          margin-bottom: 4px;
          border-radius: 14px;
          color: #8A8EA5;
          cursor: pointer;
          font-size: 13.5px;
          transition: .18s ease;
        }

        .admin-sidebar nav button:hover {
          color: #7465E8;
          background: #F8F7FD;
        }

        .admin-sidebar nav button.active {
          color: #7465E8;
          background: #F0EDFF;
          font-weight: 600;
        }

        .admin-logout {
          height: 44px;
          border: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
          background: transparent;
          color: #E35469;
          cursor: pointer;
          font-size: 13.5px;
        }

        .admin-logout:hover {
          background: #FFF2F4;
        }

        .admin-main {
          flex: 1;
          min-width: 0;
        }

        .admin-header {
          height: 72px;
          position: sticky;
          z-index: 20;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 34px;
          background: rgba(255,255,255,.88);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid #EEEFF5;
        }

        .admin-header > div {
          display: flex;
          flex-direction: column;
        }

        .header-label {
          color: #A0A3B5;
          font-size: 10.5px;
        }

        .admin-header strong {
          margin-top: 2px;
          font-size: 14px;
          color: #343654;
        }

        .notification-button {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          border: 1px solid #ECECF4;
          display: grid;
          place-items: center;
          color: #757991;
          background: white;
          cursor: pointer;
        }

        .admin-content {
          padding: 32px 34px 45px;
        }

        .admin-welcome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          padding: 29px 31px;
          border-radius: 25px;
          color: white;
          background:
            linear-gradient(
              110deg,
              #7769F2,
              #9870EE,
              #D276D7
            );
          box-shadow:
            0 18px 40px
            rgba(119,105,242,.18);
        }

        .admin-eyebrow {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .1em;
          opacity: .8;
        }

        .admin-welcome h1 {
          margin: 8px 0 7px;
          font-size: 29px;
        }

        .admin-welcome p {
          margin: 0;
          max-width: 630px;
          color: rgba(255,255,255,.82);
          font-size: 13.5px;
          line-height: 1.6;
        }

        .admin-welcome-icon {
          width: 68px;
          height: 68px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 20px;
          color: white;
          background: rgba(255,255,255,.15);
          border: 1px solid rgba(255,255,255,.2);
        }

        .admin-error {
          margin-top: 17px;
          padding: 13px 16px;
          border-radius: 14px;
          color: #B9415E;
          background: #FFF0F3;
          border: 1px solid #F6D8DF;
          font-size: 13px;
        }

        .admin-stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 17px;
          margin-top: 22px;
        }

        .admin-stat-card {
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

        .stat-icon {
          width: 47px;
          height: 47px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 14px;
        }

        .stat-icon.purple {
          color: #7566EB;
          background: #F0EDFF;
        }

        .stat-icon.pink {
          color: #D867B4;
          background: #FFF0FA;
        }

        .stat-icon.blue {
          color: #5595DD;
          background: #EDF6FF;
        }

        .stat-icon.green {
          color: #48A784;
          background: #ECFAF4;
        }

        .admin-stat-card > div:last-child {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          color: #85899D;
          font-size: 11.5px;
        }

        .admin-stat-card strong {
          margin: 2px 0;
          color: #2E3054;
          font-size: 25px;
        }

        .admin-stat-card small {
          color: #A0A3B3;
          font-size: 10.5px;
        }

        .admin-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .admin-panel {
          background: white;
          border: 1px solid #ECECF4;
          border-radius: 22px;
          padding: 22px;
          box-shadow:
            0 8px 26px
            rgba(68,68,110,.035);
        }

        .panel-heading {
          display: flex;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .panel-heading h2 {
          margin: 0;
          color: #333554;
          font-size: 16px;
        }

        .panel-heading p {
          margin: 4px 0 0;
          color: #A0A3B4;
          font-size: 11.5px;
        }

        .admin-empty {
          min-height: 190px;
          display: grid;
          place-items: center;
          color: #A1A4B5;
          font-size: 12px;
        }

        .admin-user-row,
        .admin-child-row {
          min-height: 62px;
          display: flex;
          align-items: center;
          gap: 11px;
          border-bottom: 1px solid #F1F1F6;
        }

        .admin-user-row:last-child,
        .admin-child-row:last-child {
          border-bottom: 0;
        }

        .user-avatar,
        .child-avatar {
          width: 38px;
          height: 38px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #7465E8;
          background: #F0EDFF;
          font-size: 13px;
          font-weight: 700;
        }

        .child-avatar {
          color: #B05D9B;
          background: #FFF0FA;
        }

        .user-main,
        .child-main {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .user-main strong,
        .child-main strong {
          color: #373953;
          font-size: 12.5px;
        }

        .user-main span,
        .child-main span {
          max-width: 185px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-top: 2px;
          color: #A1A4B4;
          font-size: 10.5px;
        }

        .role-pill {
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 9.5px;
          font-weight: 600;
        }

        .role-pill.admin {
          color: #755FDC;
          background: #F0EDFF;
        }

        .role-pill.therapist {
          color: #4589C7;
          background: #EDF6FF;
        }

        .role-pill.parent {
          color: #C257A4;
          background: #FFF0FA;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.active {
          background: #4AC494;
        }

        .status-dot.inactive {
          background: #D7D8E2;
        }

        .child-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .child-meta span {
          color: #AAADBC;
          font-size: 9px;
        }

        .child-meta strong {
          max-width: 110px;
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #686B80;
          font-size: 10.5px;
          font-weight: 600;
        }

        .admin-management {
          margin-top: 20px;
        }

        .management-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .management-grid button {
          min-height: 125px;
          padding: 17px;
          border-radius: 17px;
          border: 1px solid #ECEAF6;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          color: #7566E8;
          background: #FBFAFF;
          cursor: pointer;
          text-align: left;
          transition: .18s ease;
        }

        .management-grid button:hover {
          transform: translateY(-2px);
          border-color: #DED8FF;
          box-shadow:
            0 8px 20px
            rgba(117,102,232,.08);
        }

        .management-grid button span {
          margin-top: 10px;
          color: #3C3E5D;
          font-size: 12.5px;
          font-weight: 700;
        }

        .management-grid button small {
          margin-top: 5px;
          color: #A0A2B2;
          font-size: 10.5px;
          line-height: 1.45;
        }

        .admin-placeholder {
          min-height: calc(100vh - 145px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          border-radius: 25px;
          text-align: center;
          background: white;
          border: 1px solid #ECECF4;
        }

        .placeholder-icon {
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          border-radius: 19px;
          color: #7565E8;
          background: #F0EDFF;
        }

        .admin-placeholder h1 {
          margin: 17px 0 7px;
          color: #34365A;
          font-size: 25px;
        }

        .admin-placeholder p {
          margin: 0;
          color: #989BAD;
          font-size: 13px;
        }

        .admin-placeholder button {
          margin-top: 23px;
          padding: 11px 18px;
          border: 0;
          border-radius: 13px;
          color: white;
          background: #7968ED;
          cursor: pointer;
        }

        @media (max-width: 1150px) {

          .admin-stats {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .management-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        @media (max-width: 900px) {

          .admin-sidebar {
            width: 220px;
          }

          .admin-grid {
            grid-template-columns:
              1fr;
          }

          .admin-content {
            padding:
              25px 22px 40px;
          }

          .admin-header {
            padding: 0 22px;
          }

        }

        `}
      </style>

    </div>

  );

}