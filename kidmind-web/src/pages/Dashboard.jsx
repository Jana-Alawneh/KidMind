import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import StatsSection from "../components/dashboard/StatsSection";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import TodaySessions from "../components/dashboard/TodaySessions";
import RecentAssessments from "../components/dashboard/RecentAssessments";
import QuickActions from "../components/dashboard/QuickActions";

import RecentChildren from "../components/ui/RecentChildren";
import AIRecommendation from "../components/ui/AIRecommendation";

const Dashboard = () => {

    return (

        <div className="flex bg-[#F7F8FC] min-h-screen">

            <Sidebar />

            <main className="flex-1 p-10 overflow-y-auto">

                {/* Navbar */}
                <Navbar />

                {/* Statistics Cards */}
                <StatsSection />

                {/* Performance + Quick Actions */}
                <div className="grid grid-cols-3 gap-6 mt-8">

                    <div className="col-span-2">

                        <PerformanceChart />

                    </div>

                    <QuickActions />

                </div>

                {/* Sessions + AI */}
                <div className="grid grid-cols-2 gap-6 mt-8">

                    <TodaySessions />

                    <AIRecommendation />

                </div>

                {/* Recent Children */}
                <div className="mt-8">

                    <RecentChildren />

                </div>

                {/* Recent Assessments */}
                <div className="mt-8">

                    <RecentAssessments />

                </div>

            </main>

        </div>

    );

};

export default Dashboard;