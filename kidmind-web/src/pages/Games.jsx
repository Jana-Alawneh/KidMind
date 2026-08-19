import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import GamesHeader from "../components/games/GamesHeader";
import GameFilters from "../components/games/GameFilters";
import GameLibrary from "../components/games/GameLibrary";


const Games = () => {


    return (

        <div className="
            flex
            bg-[#F7F8FC]
            min-h-screen
        ">


            <Sidebar />


            <main className="
                flex-1
                p-10
                overflow-y-auto
            ">


                <Navbar />


                <GamesHeader />


                <GameFilters />


                <div className="mt-8">


                    <GameLibrary />


                </div>


            </main>


        </div>

    );

};


export default Games;