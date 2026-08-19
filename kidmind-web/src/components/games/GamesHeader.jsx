import {
    Plus,
    Gamepad2
} from "lucide-react";

import { useNavigate } from "react-router-dom";


const GamesHeader = () => {


    const navigate = useNavigate();


    return (

        <div className="
            flex
            justify-between
            items-center
            mt-8
        ">


            <div className="
                flex
                items-center
                gap-4
            ">


                <div className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-[#EEE9FF]
                    flex
                    items-center
                    justify-center
                ">


                    <Gamepad2
                        size={28}
                        className="text-[#7B6EF6]"
                    />


                </div>



                <div>


                    <h1 className="
                        text-3xl
                        font-bold
                    ">

                        Cognitive Games

                    </h1>



                    <p className="
                        text-slate-500
                        mt-1
                    ">

                        Create and manage children's assessment games

                    </p>


                </div>


            </div>





            <button

                onClick={() => navigate("/games/builder")}

                className="
                    bg-[#7B6EF6]
                    text-white
                    px-6
                    h-12
                    rounded-2xl
                    flex
                    items-center
                    gap-2
                    hover:bg-[#6959F5]
                    transition
                "

            >


                <Plus size={20}/>


                Create Game


            </button>



        </div>

    );

};


export default GamesHeader;