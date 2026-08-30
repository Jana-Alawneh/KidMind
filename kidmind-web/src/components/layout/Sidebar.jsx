import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Gamepad2,
  FileText,
  Bot,
  Settings,
  MessageCircle,
  Bell,
  LogOut,
  Stethoscope,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";


const menu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Children",
    icon: Users,
    path: "/children",
  },
  {
    title: "Sessions",
    icon: CalendarDays,
    path: "/sessions",
  },
  {
    title: "Game Builder",
    icon: Gamepad2,
    path: "/games",
  },
  {
    title: "Reports",
    icon: FileText,
    path: "/reports",
  },
  {
    title: "AI Assistant",
    icon: Bot,
    path: "/ai",
  },
  {
    title: "Therapist Chat",
    icon: MessageCircle,
    path: "/chat",
  },
  {
    title: "Notifications",
    icon: Bell,
    path: "/notifications",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];


const Sidebar = () => {

  const navigate =
    useNavigate();


  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);


  useEffect(
    () => {

      let active =
        true;


      const loadUnreadCount =
        async () => {

          try {

            const response =
              await api.get(
                "/notifications/unread-count"
              );


            if (active) {

              setUnreadCount(
                Number(
                  response.data
                    ?.unread_count ||
                  0
                )
              );

            }

          } catch (
            error
          ) {

            console.error(
              "Failed to load notification count:",
              error
            );

          }

        };


      loadUnreadCount();


      const interval =
        window.setInterval(
          loadUnreadCount,
          30000
        );


      const handleUpdate =
        () => {

          loadUnreadCount();

        };


      window.addEventListener(
        "kidmind-notifications-updated",
        handleUpdate
      );


      return () => {

        active =
          false;

        window.clearInterval(
          interval
        );

        window.removeEventListener(
          "kidmind-notifications-updated",
          handleUpdate
        );

      };

    },
    []
  );


  const handleLogout =
    () => {

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


  return (

    <aside className="therapist-sidebar">

      <div className="therapist-logo">

        <img
          src="/logo.png"
          alt="KidMind"
        />

      </div>


      <div className="therapist-role">

        <div className="therapist-role-icon">

          <Stethoscope
            size={19}
          />

        </div>


        <div>

          <strong>
            Therapist
          </strong>

          <span>
            KidMind Care Center
          </span>

        </div>

      </div>


      <nav>

        {
          menu.map(
            item => {

              const Icon =
                item.icon;


              return (

                <NavLink
                  key={
                    item.path
                  }
                  to={
                    item.path
                  }
                  end={
                    item.path ===
                    "/"
                  }
                  className={({
                    isActive,
                  }) =>
                    isActive
                      ? "therapist-nav-item active"
                      : "therapist-nav-item"
                  }
                >

                  <Icon
                    size={19}
                  />


                  <span className="therapist-nav-title">

                    {
                      item.title
                    }

                  </span>


                  {
                    item.path ===
                      "/notifications" &&
                    unreadCount >
                      0 && (

                      <span className="therapist-nav-badge">

                        {
                          unreadCount >
                          99
                            ? "99+"
                            : unreadCount
                        }

                      </span>

                    )
                  }

                </NavLink>

              );

            }
          )
        }

      </nav>


      <button
        type="button"
        className="therapist-logout"
        onClick={
          handleLogout
        }
      >

        <LogOut
          size={19}
        />

        <span>
          Logout
        </span>

      </button>


      <style>
        {`

        .therapist-sidebar {
          width: 270px;
          height: 100vh;
          flex: 0 0 270px;
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
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          z-index: 30;
        }

        .therapist-logo {
          height: 125px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .therapist-logo img {
          width: 220px;
          height: 150px;
          object-fit: contain;
        }

        .therapist-role {
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

        .therapist-role-icon {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: #7665EE;
          background: white;
        }

        .therapist-role strong {
          display: block;
          color: #37306F;
          font-size: 13px;
          line-height: 1.3;
        }

        .therapist-role span {
          display: block;
          margin-top: 2px;
          color: #989AB0;
          font-size: 10.5px;
        }

        .therapist-sidebar nav {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }

        .therapist-nav-item {
          width: 100%;
          height: 43px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
          margin-bottom: 4px;
          border-radius: 14px;
          color: #8A8EA5;
          text-decoration: none;
          font-size: 13.5px;
          transition:
            background .18s ease,
            color .18s ease,
            transform .18s ease;
        }

        .therapist-nav-item:hover {
          color: #7465E8;
          background: #F8F7FD;
        }

        .therapist-nav-item.active {
          color: #7465E8;
          background: #F0EDFF;
          font-weight: 600;
        }

        .therapist-nav-title {
          min-width: 0;
          flex: 1;
          text-align: left;
        }

        .therapist-nav-badge {
          min-width: 23px;
          height: 23px;
          padding: 0 6px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: #7C6CFF;
          font-size: 10px;
          font-weight: 800;
          line-height: 1;
        }

        .therapist-logout {
          width: 100%;
          height: 44px;
          flex: 0 0 44px;
          border: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
          background: transparent;
          color: #E35469;
          cursor: pointer;
          font-family: inherit;
          font-size: 13.5px;
          transition: .18s ease;
        }

        .therapist-logout:hover {
          background: #FFF2F4;
        }

        @media (max-width: 900px) {

          .therapist-sidebar {
            width: 220px;
            flex-basis: 220px;
          }

        }

        `}
      </style>

    </aside>

  );

};


export default Sidebar;