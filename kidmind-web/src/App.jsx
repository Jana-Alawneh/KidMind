import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Children from "./pages/Children";
import ChildProfile from "./pages/ChildProfile";
import Sessions from "./pages/Sessions";
import Games from "./pages/Games";
import GameBuilder from "./pages/GameBuilder";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import SessionPlayer from "./pages/SessionPlayer";
import GameDetails from "./pages/GameDetails";
import MemoryMatch from "./pages/MemoryMatch";
import FocusFinder from "./pages/FocusFinder";
import AssessmentReport from "./pages/AssessmentReport";


function App() {

  return (

    <Routes>

      {/* Dashboard */}

      <Route
        path="/"
        element={<Dashboard />}
      />


      {/* Children */}

      <Route
        path="/children"
        element={<Children />}
      />


      {/* Single Child Profile */}

      <Route
        path="/children/:id"
        element={<ChildProfile />}
      />


      {/* Sessions */}

      <Route
        path="/sessions"
        element={<Sessions />}
      />


      {/* Games */}

     <Route path="/games" element={<Games />} />


      {/* Reports */}

      <Route
        path="/reports"
        element={<Reports />}
      />


      {/* AI Assistant */}

      <Route
        path="/ai"
        element={<AIAssistant />}
      />


      {/* Settings */}

      <Route
        path="/settings"
        element={<Settings />}
      />


      {/* Wrong URL */}

      <Route
        path="*"
        element={<Dashboard />}
      />
<Route
    path="/sessions/:id"
    element={<SessionPlayer />}
/>



<Route 
    path="/games/:id" 
    element={<GameDetails />} 
/>



<Route 
    path="/games/memory/:id" 
    element={<MemoryMatch />} 
/>



<Route
path="/games/focus/:id"
element={<FocusFinder />}
/>

<Route
path="/assessment-report"
element={<AssessmentReport />}
/>
    </Routes>

  );

}


export default App;