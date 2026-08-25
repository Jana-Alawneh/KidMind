import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import TherapistSettings from "../components/therapist/TherapistSettings";

const Settings = () => {
  return (
    <div className="flex bg-[#F7F8FC] min-h-screen">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        <Navbar />

        <div className="mt-8">
          <TherapistSettings />
        </div>
      </main>
    </div>
  );
};

export default Settings;
