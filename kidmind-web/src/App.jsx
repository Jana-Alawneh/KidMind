import {
  useEffect,
  useState,
} from "react";

import {
  Routes,
  Route,
  Navigate,
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
import MemoryMatch from "./pages/MemoryMatch";
import FocusFinder from "./pages/FocusFinder";
import AssessmentReport from "./pages/AssessmentReport";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";


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


function ParentPlaceholder() {

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "#f8f7ff",
        padding: "60px",
        fontFamily:
          "Inter, system-ui, sans-serif",
      }}
    >

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "white",
          borderRadius: "28px",
          padding: "48px",
          boxShadow:
            "0 15px 50px rgba(124,108,255,.10)",
          border:
            "1px solid #eceaf8",
        }}
      >

        <img
          src="/logo.png"
          alt="KidMind"
          style={{
            width: "220px",
            marginBottom: "30px",
          }}
        />

        <h1
          style={{
            margin: "0 0 12px",
            color: "#30286f",
            fontSize: "38px",
          }}
        >
          Parent Portal
        </h1>

        <p
          style={{
            margin: 0,
            color: "#81859b",
            fontSize: "17px",
          }}
        >
          Parent dashboard will
          be built later.
        </p>

      </div>

    </div>

  );

}


function App() {

  const therapistOnly = [
    "therapist",
  ];


  return (

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

            <ParentPlaceholder />

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

  );

}


export default App;