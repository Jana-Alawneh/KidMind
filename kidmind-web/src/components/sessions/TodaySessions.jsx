import Card from "../ui/Card";

import {
    Clock,
    Play
} from "lucide-react";

import { useNavigate } from "react-router-dom";


const sessions = [

    {
        child:"Lina Ahmad",
        game:"Memory Match",
        time:"10:00 AM",
        duration:"25 min"
    },

    {
        child:"Omar Ali",
        game:"Attention Focus",
        time:"12:30 PM",
        duration:"20 min"
    },

    {
        child:"Sara Khaled",
        game:"Reading Adventure",
        time:"03:00 PM",
        duration:"30 min"
    }

];



const TodaySessions = () => {


    const navigate = useNavigate();



    return (

        <Card>


            <h2 className="
                text-xl
                font-bold
                mb-6
            ">

                Today's Sessions

            </h2>



            <div className="space-y-5">


                {
                    sessions.map((session,index)=>(


                        <div

                            key={index}

                            className="
                            bg-[#FAFAFD]
                            rounded-2xl
                            p-5
                            flex
                            justify-between
                            items-center
                            "

                        >


                            <div>


                                <h3 className="font-semibold">

                                    {session.child}

                                </h3>


                                <p className="
                                    text-sm
                                    text-slate-500
                                    mt-1
                                ">

                                    {session.game}

                                </p>



                                <div className="
                                    flex
                                    gap-2
                                    items-center
                                    mt-3
                                    text-sm
                                    text-slate-400
                                ">


                                    <Clock size={15}/>


                                    {session.time}

                                    -

                                    {session.duration}


                                </div>


                            </div>




                            <button

                                onClick={() => navigate(`/sessions/${index + 1}`)}

                                className="
                                w-12
                                h-12
                                rounded-xl
                                bg-[#EEE9FF]
                                text-[#7B6EF6]
                                flex
                                justify-center
                                items-center
                                hover:bg-[#DDD5FF]
                                transition
                                "

                            >

                                <Play size={18}/>

                            </button>



                        </div>


                    ))
                }


            </div>


        </Card>

    );

};


export default TodaySessions;