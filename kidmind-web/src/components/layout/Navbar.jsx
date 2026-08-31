import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  ChevronDown,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";
import ProfileMenu from "./ProfileMenu";
import UserAvatar from "../common/UserAvatar";


const Navbar = () => {

  const navigate =
    useNavigate();


  const [
    showProfile,
    setShowProfile,
  ] = useState(false);


  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);


  const [
    currentUser,
    setCurrentUser,
  ] = useState(
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

    }
  );


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


  useEffect(
    () => {

      const handleStorage =
        () => {

          try {

            setCurrentUser(
              JSON.parse(
                sessionStorage.getItem(
                  "kidmind_user"
                ) || "{}"
              )
            );

          } catch {

            setCurrentUser({});

          }

        };


      window.addEventListener(
        "kidmind-user-updated",
        handleStorage
      );


      return () => {

        window.removeEventListener(
          "kidmind-user-updated",
          handleStorage
        );

      };

    },
    []
  );


  return (

    <header className="therapist-header">

      <div className="therapist-header-identity">

        <span className="therapist-header-label">
          KidMind Therapist Portal
        </span>

        <strong>

          {
            currentUser.full_name ||
            "Therapist"
          }

        </strong>

      </div>


      <div className="therapist-header-actions">

        <button
          type="button"
          className="therapist-notification-button"
          onClick={() => {

            setShowProfile(
              false
            );

            navigate(
              "/notifications"
            );

          }}
          aria-label="Open notifications"
        >

          <Bell
            size={20}
          />


          {
            unreadCount >
              0 && (

              <span className="therapist-header-badge">

                {
                  unreadCount >
                  99
                    ? "99+"
                    : unreadCount
                }

              </span>

            )
          }

        </button>


        <div className="therapist-profile-wrapper">

          <button
            type="button"
            className="therapist-profile-button"
            onClick={() =>
              setShowProfile(
                previous =>
                  !previous
              )
            }
          >

            <UserAvatar
  user={
    currentUser
  }
  className="therapist-profile-icon"
/>


            <div className="therapist-profile-copy">

              <strong>

                {
                  currentUser.full_name ||
                  "Therapist"
                }

              </strong>

              <span>
                Therapist
              </span>

            </div>


            <ChevronDown
              size={16}
              className={
                showProfile
                  ? "profile-chevron open"
                  : "profile-chevron"
              }
            />

          </button>


          {
            showProfile && (

              <ProfileMenu />

            )
          }

        </div>

      </div>


      <style>
        {`

        .therapist-header {
          height: 72px;
          width: 100%;
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
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .therapist-header-identity {
          display: flex;
          flex-direction: column;
        }

        .therapist-header-label {
          color: #A0A3B5;
          font-size: 10.5px;
          line-height: 1.3;
        }

        .therapist-header-identity strong {
          margin-top: 2px;
          color: #343654;
          font-size: 14px;
          line-height: 1.35;
        }

        .therapist-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .therapist-notification-button {
          width: 42px;
          height: 42px;
          position: relative;
          border-radius: 13px;
          border: 1px solid #ECECF4;
          display: grid;
          place-items: center;
          color: #757991;
          background: white;
          cursor: pointer;
          transition: .18s ease;
        }

        .therapist-notification-button:hover {
          color: #7465E8;
          background: #F8F6FF;
          border-color: #DED8FF;
        }

        .therapist-header-badge {
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          position: absolute;
          top: -7px;
          right: -7px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: #7C6CFF;
          border: 2px solid white;
          font-size: 9px;
          font-weight: 800;
          line-height: 1;
        }

        .therapist-profile-wrapper {
          position: relative;
        }

        .therapist-profile-button {
          min-width: 168px;
          height: 42px;
          border: 1px solid #ECECF4;
          border-radius: 13px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 10px;
          color: #757991;
          background: white;
          cursor: pointer;
          font-family: inherit;
          transition: .18s ease;
        }

        .therapist-profile-button:hover {
          border-color: #DED8FF;
          background: #FAF9FF;
        }

        .therapist-profile-icon {
          width: 29px;
          height: 29px;
          flex: 0 0 29px;
          border-radius: 9px;
          display: grid;
          place-items: center;
          color: #7566EB;
          background: #F0EDFF;
        }

        .therapist-profile-copy {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .therapist-profile-copy strong {
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #3E405E;
          font-size: 11.5px;
          line-height: 1.25;
        }

        .therapist-profile-copy span {
          margin-top: 1px;
          color: #A0A3B5;
          font-size: 9.5px;
          line-height: 1.2;
        }

        .profile-chevron {
          transition:
            transform .18s ease;
        }

        .profile-chevron.open {
          transform:
            rotate(180deg);
        }

        @media (max-width: 900px) {

          .therapist-header {
            padding: 0 22px;
          }

          .therapist-profile-button {
            min-width: 145px;
          }

        }

        `}
      </style>

    </header>

  );

};


export default Navbar;