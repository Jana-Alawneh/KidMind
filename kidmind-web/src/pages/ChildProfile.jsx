import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import ChildInfoCard from "../components/childProfile/ChildInfoCard";
import CognitiveScores from "../components/childProfile/CognitiveScores";
import ProgressChart from "../components/childProfile/ProgressChart";
import SessionsTimeline from "../components/childProfile/SessionsTimeline";
import ReportsTable from "../components/childProfile/ReportsTable";
import AIInsights from "../components/childProfile/AIInsights";

import EditChildModal from "../components/children/EditChildModal";
import StartSessionModal
  from "../components/sessions/StartSessionModal";

import {
  getChildById,
} from "../api/childrenApi";


const ChildProfile = () => {

  const navigate = useNavigate();

  const { id } = useParams();

  const [child, setChild] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [editModalOpen, setEditModalOpen] =
    useState(false);

    const [
  startSessionModalOpen,
  setStartSessionModalOpen,
] = useState(false);

  const loadChild = useCallback(
    async () => {

      try {

        setLoading(true);
        setError("");

        const childData =
          await getChildById(id);

        setChild(childData);

      } catch (loadError) {

        console.error(
          "Failed to load child:",
          loadError
        );

        setError(
          loadError.response?.data?.message ||
          "Failed to load child information"
        );

      } finally {

        setLoading(false);

      }

    },
    [id]
  );


  useEffect(() => {

    if (id) {
      loadChild();
    }

  }, [id, loadChild]);


  return (

    <div className="flex bg-[#F7F8FC] min-h-screen">

      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto">

        <Navbar />


        <button
          onClick={() => navigate("/children")}
          className="
            flex
            items-center
            gap-2
            text-[#7B6EF6]
            font-medium
            mt-8
            hover:gap-3
            transition-all
          "
        >

          <ArrowLeft size={20} />

          Back to Children

        </button>


        {loading && (

          <div className="
            flex
            justify-center
            items-center
            min-h-[400px]
          ">

            <div className="text-center">

              <div className="
                w-12
                h-12
                border-4
                border-[#E9E5FF]
                border-t-[#7B6EF6]
                rounded-full
                animate-spin
                mx-auto
              " />

              <p className="text-slate-500 mt-4">

                Loading child information...

              </p>

            </div>

          </div>

        )}


        {!loading && error && (

          <div className="
            bg-red-50
            border
            border-red-200
            text-red-700
            rounded-2xl
            p-6
            mt-8
          ">

            <h2 className="font-bold text-lg">

              Unable to load child

            </h2>

            <p className="mt-2">

              {error}

            </p>

            <button
              onClick={() => navigate("/children")}
              className="
                mt-5
                bg-red-600
                text-white
                px-5
                py-2
                rounded-xl
                hover:bg-red-700
                transition
              "
            >

              Return to Children

            </button>

          </div>

        )}


        {!loading && !error && child && (

          <>

            <div className="grid grid-cols-3 gap-6 mt-8">

              <ChildInfoCard
  child={child}
  onEdit={() => {
    setEditModalOpen(true);
  }}
  onStartSession={() => {
    setStartSessionModalOpen(true);
  }}
/>

              <CognitiveScores />

            </div>


            <div className="grid grid-cols-3 gap-6 mt-8">

              <div className="col-span-2">

                <ProgressChart />

              </div>

              <AIInsights />

            </div>


            <div className="grid grid-cols-3 gap-6 mt-8">

              <div className="col-span-2">

                <ReportsTable />

              </div>

              <SessionsTimeline />

            </div>

          </>

        )}


        {editModalOpen && child && (

          <EditChildModal
            child={child}
            close={() => {
              setEditModalOpen(false);
            }}
            onSuccess={loadChild}
          />

        )}

        {startSessionModalOpen && child && (

  <StartSessionModal
    child={child}
    close={() => {
      setStartSessionModalOpen(false);
    }}
    onStarted={(session) => {

      navigate(
        `/sessions/${session.id}`
      );

    }}
  />

)}

      </main>

    </div>

  );

};


export default ChildProfile;