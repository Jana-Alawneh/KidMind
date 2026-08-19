import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import SessionsHeader from "../components/sessions/SessionsHeader";
import TodaySessions from "../components/sessions/TodaySessions";
import UpcomingSessions from "../components/sessions/UpcomingSessions";


const Sessions = () => {


    return (

        <div className="flex bg-[#F7F8FC] min-h-screen">


            <Sidebar />


            <main className="flex-1 p-10 overflow-y-auto">


                <Navbar />


                <SessionsHeader />


                <div className="
                    grid
                    grid-cols-2
                    gap-6
                    mt-8
                ">


                    <TodaySessions />


                    <UpcomingSessions />


                </div>



            </main>


        </div>

    );

};


export default Sessions;