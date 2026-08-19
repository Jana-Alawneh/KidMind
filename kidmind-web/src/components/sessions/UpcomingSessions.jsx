import Card from "../ui/Card";

import {
    CalendarDays,
    Clock,
    MoreVertical
} from "lucide-react";


const upcoming = [

    {
        child:"Adam Hassan",
        game:"Executive Puzzle",
        date:"15 Jul 2025",
        time:"11:00 AM",
        status:"Scheduled"
    },

    {
        child:"Maya Ali",
        game:"Memory Training",
        date:"17 Jul 2025",
        time:"02:30 PM",
        status:"Scheduled"
    },

    {
        child:"Lina Ahmad",
        game:"Reading Skills",
        date:"20 Jul 2025",
        time:"09:30 AM",
        status:"Scheduled"
    }

];


const UpcomingSessions = () => {


    return (

        <Card>


            <div className="
                flex
                justify-between
                items-center
                mb-6
            ">

                <div>

                    <h2 className="
                        text-xl
                        font-bold
                    ">

                        Upcoming Sessions

                    </h2>


                    <p className="
                        text-sm
                        text-slate-500
                        mt-1
                    ">

                        Next scheduled assessments

                    </p>


                </div>


                <CalendarDays
                    className="text-[#7B6EF6]"
                />


            </div>



            <div className="space-y-5">


                {
                    upcoming.map((session,index)=>(


                        <div

                            key={index}

                            className="
                            border
                            rounded-2xl
                            p-5
                            flex
                            justify-between
                            items-center
                            hover:bg-[#FAFAFD]
                            transition
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
                                    items-center
                                    gap-4
                                    mt-3
                                    text-sm
                                    text-slate-400
                                ">


                                    <span className="
                                        flex
                                        items-center
                                        gap-1
                                    ">

                                        <CalendarDays size={15}/>

                                        {session.date}

                                    </span>



                                    <span className="
                                        flex
                                        items-center
                                        gap-1
                                    ">

                                        <Clock size={15}/>

                                        {session.time}

                                    </span>


                                </div>


                            </div>



                            <div className="flex items-center gap-3">


                                <span className="
                                    bg-[#E8FFF5]
                                    text-[#38B2AC]
                                    px-3
                                    py-1
                                    rounded-full
                                    text-xs
                                ">

                                    {session.status}

                                </span>


                                <button>

                                    <MoreVertical
                                        size={20}
                                        className="text-slate-400"
                                    />

                                </button>


                            </div>


                        </div>


                    ))
                }


            </div>


        </Card>

    );

};


export default UpcomingSessions;