
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import api from "./services/api";

import Dashboard from "./pages/Dashboard";
import Children from "./pages/Children";
import ChildProfile from "./pages/ChildProfile";
import Sessions from "./pages/Sessions";
import Games from "./pages/Games";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import SessionPlayer from "./pages/SessionPlayer";
import GameDetails from "./pages/GameDetails";
import GameBuilder from "./pages/GameBuilder";
import CustomGamePlayer from "./pages/CustomGamePlayer";
import MemoryMatch from "./pages/MemoryMatch";
import FocusFinder from "./pages/FocusFinder";
import AssessmentReport from "./pages/AssessmentReport";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";


const sendPresenceOffline =
  token => {

    if (!token) {
      return;
    }


    const baseUrl =
      String(
        api.defaults.baseURL ||
        "http://localhost:5000"
      ).replace(
        /\/$/,
        ""
      );


    fetch(
      `${baseUrl}/users/presence/offline`,
      {
        method:
          "POST",
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
        keepalive:
          true,
      }
    ).catch(
      () => {}
    );

  };


function PresenceTracker() {

  const location =
    useLocation();

  const previousTokenRef =
    useRef(null);


  useEffect(
    () => {

      const token =
        sessionStorage.getItem(
          "kidmind_token"
        );


      const previousToken =
        previousTokenRef.current;


      if (!token) {

        if (
          previousToken
        ) {

          sendPresenceOffline(
            previousToken
          );

        }


        previousTokenRef.current =
          null;

        return;

      }


      previousTokenRef.current =
        token;


      let active =
        true;


      const heartbeat =
        async () => {

          try {

            await api.post(
              "/users/presence/heartbeat"
            );

          } catch (
            error
          ) {

            if (
              active
            ) {

              console.error(
                "Presence heartbeat failed:",
                error
              );

            }

          }

        };


      heartbeat();


      const interval =
        window.setInterval(
          heartbeat,
          30000
        );


      const handlePageHide =
        () => {

          sendPresenceOffline(
            token
          );

        };


      window.addEventListener(
        "pagehide",
        handlePageHide
      );


      return () => {

        active =
          false;

        window.clearInterval(
          interval
        );

        window.removeEventListener(
          "pagehide",
          handlePageHide
        );

      };

    },
    [
      location.pathname,
    ]
  );


  return null;

}


const getHomeByRole = (
  role
) => {

  if (role === "admin") {
    return "/admin";
  }

  if (role === "parent") {
    return "/parent";
  }

  return "/";

};


function LoadingScreen() {

  return (

    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #faf9ff, #f5f1ff)",
        color: "#6f61df",
        fontFamily:
          "Inter, system-ui, sans-serif",
        fontSize: "16px",
        fontWeight: "600",
      }}
    >
      Loading KidMind...
    </div>

  );

}


function ProtectedRoute({
  children,
  allowedRoles,
}) {

  const [
    checking,
    setChecking,
  ] = useState(true);

  const [
    user,
    setUser,
  ] = useState(null);


  useEffect(() => {

    let active = true;


    const checkAuthentication =
      async () => {

        const token =
          sessionStorage.getItem(
            "kidmind_token"
          );


        if (!token) {

          if (active) {

            setUser(null);

            setChecking(false);

          }

          return;

        }


        try {

          const response =
            await api.get(
              "/users/me"
            );


          if (!active) {
            return;
          }


          const currentUser =
            response.data.user;


          sessionStorage.setItem(
            "kidmind_user",
            JSON.stringify(
              currentUser
            )
          );


          setUser(
            currentUser
          );

        } catch {

          sessionStorage.removeItem(
            "kidmind_token"
          );

          sessionStorage.removeItem(
            "kidmind_user"
          );


          if (active) {

            setUser(null);

          }

        } finally {

          if (active) {

            setChecking(false);

          }

        }

      };


    checkAuthentication();


    return () => {

      active = false;

    };

  }, []);


  if (checking) {

    return (
      <LoadingScreen />
    );

  }


  if (!user) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  if (
    Array.isArray(
      allowedRoles
    ) &&
    !allowedRoles.includes(
      user.role
    )
  ) {

    return (

      <Navigate
        to={
          getHomeByRole(
            user.role
          )
        }
        replace
      />

    );

  }


  return children;

}


function App() {

  const therapistOnly = [
    "therapist",
  ];

  const sharedRoles = [
    "therapist",
    "parent",
    "admin",
  ];


  return (

    <>

      <PresenceTracker />

      <Routes>

      <Route
        path="/login"
        element={
          <Login />
        }
      />


      <Route
        path="/"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <Dashboard />

          </ProtectedRoute>
        }
      />


      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={[
              "admin",
            ]}
          >

            <AdminDashboard />

          </ProtectedRoute>
        }
      />


      <Route
        path="/parent"
        element={
          <ProtectedRoute
            allowedRoles={[
              "parent",
            ]}
          >

            <ParentDashboard />

          </ProtectedRoute>
        }
      />


      <Route
        path="/chat"
        element={
          <ProtectedRoute
            allowedRoles={
              sharedRoles
            }
          >

            <Chat />

          </ProtectedRoute>
        }
      />


      <Route
        path="/notifications"
        element={
          <ProtectedRoute
            allowedRoles={
              sharedRoles
            }
          >

            <Notifications />

          </ProtectedRoute>
        }
      />


      <Route
        path="/children"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <Children />

          </ProtectedRoute>
        }
      />


      <Route
        path="/children/:id"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <ChildProfile />

          </ProtectedRoute>
        }
      />


      <Route
        path="/sessions"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <Sessions />

          </ProtectedRoute>
        }
      />


      <Route
        path="/sessions/:id"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <SessionPlayer />

          </ProtectedRoute>
        }
      />


      <Route
        path="/games"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <Games />

          </ProtectedRoute>
        }
      />


      <Route
        path="/games/builder"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <GameBuilder />

          </ProtectedRoute>
        }
      />


      <Route
        path="/games/custom/:id"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <CustomGamePlayer />

          </ProtectedRoute>
        }
      />


      <Route
        path="/games/memory/:id"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <MemoryMatch />

          </ProtectedRoute>
        }
      />


      <Route
        path="/games/focus/:id"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <FocusFinder />

          </ProtectedRoute>
        }
      />


      <Route
        path="/games/:id"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <GameDetails />

          </ProtectedRoute>
        }
      />


      <Route
        path="/reports"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <Reports />

          </ProtectedRoute>
        }
      />


      <Route
        path="/assessment-report"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <AssessmentReport />

          </ProtectedRoute>
        }
      />


      <Route
        path="/ai"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <AIAssistant />

          </ProtectedRoute>
        }
      />


      <Route
        path="/settings"
        element={
          <ProtectedRoute
            allowedRoles={
              therapistOnly
            }
          >

            <Settings />

          </ProtectedRoute>
        }
      />


      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

      </Routes>

    </>

  );

}


export default App;
