import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import {
    Brain,
    Users,
    Target,
    Clock,
    Play,
    ArrowLeft
} from "lucide-react";

import {
    useNavigate,
    useParams
} from "react-router-dom";



const GameDetails = () => {


    const navigate = useNavigate();

    const { id } = useParams();



    const games = {


        1:{

            title:"Memory Match",

            subtitle:
            "Working Memory Assessment Game",

            accuracy:"92%",

            time:"1.4s",

            assigned:"24",

            difficulty:"Level 3",

            metrics:[

                "Memory Recall",
                "Accuracy",
                "Reaction Time",
                "Learning Progress"

            ]

        },



        2:{

            title:"Focus Finder",

            subtitle:
            "Attention Assessment Game",

            accuracy:"88%",

            time:"0.9s",

            assigned:"18",

            difficulty:"Level 2",

            metrics:[

                "Focus Duration",
                "Reaction Time",
                "Mistakes",
                "Target Accuracy"

            ]

        },



        3:{

            title:"Puzzle Path",

            subtitle:
            "Executive Function Assessment Game",

            accuracy:"85%",

            time:"2.1s",

            assigned:"15",

            difficulty:"Level 4",

            metrics:[

                "Planning",
                "Problem Solving",
                "Decision Making",
                "Flexibility"

            ]

        },



        4:{

            title:"Reading Adventure",

            subtitle:
            "Reading Comprehension Assessment Game",

            accuracy:"90%",

            time:"1.8s",

            assigned:"21",

            difficulty:"Level 2",

            metrics:[

                "Reading Accuracy",
                "Vocabulary",
                "Understanding",
                "Speed"

            ]

        },



        5:{

            title:"Quick Match",

            subtitle:
            "Processing Speed Assessment Game",

            accuracy:"86%",

            time:"0.7s",

            assigned:"12",

            difficulty:"Level 3",

            metrics:[

                "Reaction Speed",
                "Accuracy",
                "Decision Making",
                "Response Time"

            ]

        }


    };



    const game = games[id] || games[1];





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





                <button

                    onClick={()=>navigate("/games")}

                    className="
                    flex
                    items-center
                    gap-2
                    text-[#7B6EF6]
                    mt-8
                    font-medium
                    "

                >

                    <ArrowLeft size={18}/>

                    Back to Games


                </button>







                <div className="
                    bg-white
                    rounded-3xl
                    p-8
                    mt-8
                ">




                    <div className="
                        flex
                        justify-between
                        items-center
                    ">



                        <div className="
                            flex
                            gap-5
                            items-center
                        ">




                            <div className="
                                w-16
                                h-16
                                rounded-2xl
                                bg-[#F1EDFF]
                                flex
                                items-center
                                justify-center
                            ">


                                <Brain

                                    size={32}

                                    className="
                                    text-[#7B6EF6]
                                    "

                                />


                            </div>





                            <div>


                                <h1 className="
                                    text-3xl
                                    font-bold
                                ">


                                    {game.title}


                                </h1>




                                <p className="
                                    text-slate-500
                                    mt-2
                                ">


                                    {game.subtitle}


                                </p>


                            </div>



                        </div>






<button

onClick={()=>{


    if(game.title === "Memory Match"){

        navigate(`/games/memory/${id}`);

    }


    else if(game.title === "Focus Finder"){


        navigate(`/games/focus/${id}`);


    }


    else if(game.title === "Puzzle Path"){


        navigate(`/games/puzzle/${id}`);


    }


    else if(game.title === "Reading Adventure"){


        navigate(`/games/reading/${id}`);


    }


    else if(game.title === "Quick Match"){


        navigate(`/games/quick/${id}`);


    }


}}


className="
bg-[#7B6EF6]
text-white
px-6
h-12
rounded-2xl
flex
items-center
gap-2
"

>


                            Start Game



                        </button>



                    </div>









                    <div className="
                        grid
                        grid-cols-4
                        gap-5
                        mt-10
                    ">





                        <div className="
                            bg-[#F1EDFF]
                            rounded-2xl
                            p-5
                        ">


                            <Target
                                className="text-[#7B6EF6]"
                            />


                            <p className="
                                text-slate-500
                                mt-3
                            ">

                                Accuracy

                            </p>


                            <h2 className="
                                text-3xl
                                font-bold
                            ">


                                {game.accuracy}


                            </h2>


                        </div>








                        <div className="
                            bg-[#EAF7FF]
                            rounded-2xl
                            p-5
                        ">


                            <Clock
                                className="text-blue-400"
                            />


                            <p className="
                                text-slate-500
                                mt-3
                            ">

                                Avg Time

                            </p>


                            <h2 className="
                                text-3xl
                                font-bold
                            ">


                                {game.time}


                            </h2>


                        </div>









                        <div className="
                            bg-[#E8FFF5]
                            rounded-2xl
                            p-5
                        ">


                            <Users
                                className="text-green-500"
                            />


                            <p className="
                                text-slate-500
                                mt-3
                            ">

                                Assigned

                            </p>


                            <h2 className="
                                text-3xl
                                font-bold
                            ">


                                {game.assigned}


                            </h2>


                        </div>









                        <div className="
                            bg-[#FFF5DD]
                            rounded-2xl
                            p-5
                        ">


                            <Brain
                                className="text-orange-400"
                            />


                            <p className="
                                text-slate-500
                                mt-3
                            ">

                                Difficulty

                            </p>


                            <h2 className="
                                text-3xl
                                font-bold
                            ">


                                {game.difficulty}


                            </h2>


                        </div>



                    </div>



                </div>









                <div className="
                    grid
                    grid-cols-2
                    gap-6
                    mt-8
                ">




                    <div className="
                        bg-white
                        rounded-3xl
                        p-6
                    ">


                        <h2 className="
                            text-xl
                            font-bold
                        ">


                            Cognitive Metrics


                        </h2>





                        <ul className="
                            mt-5
                            space-y-3
                            text-slate-600
                        ">


                            {

                                game.metrics.map(

                                    (item,index)=>(

                                        <li key={index}>

                                            ✓ {item}

                                        </li>

                                    )

                                )

                            }


                        </ul>


                    </div>









                    <div className="
                        bg-white
                        rounded-3xl
                        p-6
                    ">



                        <h2 className="
                            text-xl
                            font-bold
                        ">


                            Assigned Children


                        </h2>





                        <div className="
                            mt-5
                            space-y-3
                        ">


                            <div className="
                                bg-[#FAFAFD]
                                p-4
                                rounded-xl
                            ">

                                Lina Ahmad

                            </div>



                            <div className="
                                bg-[#FAFAFD]
                                p-4
                                rounded-xl
                            ">

                                Omar Ali

                            </div>



                        </div>



                    </div>




                </div>





            </main>


        </div>


    );


};



export default GameDetails;