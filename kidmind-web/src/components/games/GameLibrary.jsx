import GameCard from "./GameCard";


import {
    Brain,
    Target,
    Puzzle,
    BookOpen,
    Zap
} from "lucide-react";



const games = [

    {
        title:"Memory Match",

        domain:"Working Memory",

        description:
        "Train visual memory, recall ability and learning speed.",

        color:"#F1EDFF",

        icon:
        <Brain
            size={28}
            className="text-[#7B6EF6]"
        />,

        players:24,

        level:"Level 3"

    },



    {
        title:"Focus Finder",

        domain:"Attention",

        description:
        "Measure focus, accuracy and reaction time.",

        color:"#EAF7FF",

        icon:
        <Target
            size={28}
            className="text-[#63B3ED]"
        />,

        players:18,

        level:"Level 2"

    },



    {
        title:"Puzzle Path",

        domain:"Executive Function",

        description:
        "Develop planning, problem solving and decision making.",

        color:"#E8FFF5",

        icon:
        <Puzzle
            size={28}
            className="text-[#38B2AC]"
        />,

        players:15,

        level:"Level 4"

    },



    {
        title:"Reading Adventure",

        domain:"Reading",

        description:
        "Evaluate reading comprehension and language skills.",

        color:"#FFF5DD",

        icon:
        <BookOpen
            size={28}
            className="text-[#F6AD55]"
        />,

        players:21,

        level:"Level 2"

    },



    {
        title:"Quick Match",

        domain:"Processing Speed",

        description:
        "Test response speed and cognitive flexibility.",

        color:"#FEEBEC",

        icon:
        <Zap
            size={28}
            className="text-[#F56565]"
        />,

        players:12,

        level:"Level 3"

    }

];




const GameLibrary = () => {


    return (

        <div className="
            grid
            grid-cols-3
            gap-6
        ">


            {
                games.map((game,index)=>(
<GameCard

    key={index}

    game={game}

    index={index}

/>

                ))
            }


        </div>

    );

};


export default GameLibrary;