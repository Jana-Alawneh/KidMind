import {
    Play,
    Users,
    BarChart3
} from "lucide-react";

import { useNavigate } from "react-router-dom";


const GameCard = ({game,index}) => {


    const navigate = useNavigate();



    return (

        <div className="
            bg-white
            rounded-3xl
            p-6
            border
            hover:shadow-lg
            transition
        ">



            <div className="
                flex
                justify-between
                items-start
            ">


                <div

                    style={{
                        backgroundColor:game.color
                    }}

                    className="
                    w-14
                    h-14
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    "

                >

                    {game.icon}


                </div>


                <span className="
                    bg-[#F1EDFF]
                    text-[#7B6EF6]
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-medium
                ">

                    {game.domain}

                </span>


            </div>





            <h2 className="
                text-xl
                font-bold
                mt-6
            ">

                {game.title}

            </h2>



            <p className="
                text-slate-500
                text-sm
                mt-2
                leading-6
            ">

                {game.description}

            </p>





            <div className="
                flex
                gap-5
                mt-5
                text-sm
                text-slate-400
            ">


                <span className="
                    flex
                    items-center
                    gap-1
                ">

                    <Users size={16}/>

                    {game.players} Kids

                </span>



                <span className="
                    flex
                    items-center
                    gap-1
                ">

                    <BarChart3 size={16}/>

                    {game.level}

                </span>


            </div>





            <button

                onClick={() => navigate(`/games/${index + 1}`)}

                className="
                    mt-6
                    w-full
                    h-11
                    rounded-xl
                    bg-[#EEE9FF]
                    text-[#7B6EF6]
                    flex
                    justify-center
                    items-center
                    gap-2
                    hover:bg-[#DDD5FF]
                    transition
                "

            >

                <Play size={18}/>

                Open Game


            </button>



        </div>

    );

};


export default GameCard;