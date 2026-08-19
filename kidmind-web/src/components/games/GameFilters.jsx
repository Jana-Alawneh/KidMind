import {
    Search
} from "lucide-react";


const filters = [

    "All",
    "Attention",
    "Working Memory",
    "Executive Function",
    "Reading"

];


const GameFilters = () => {


    return (

        <div className="
            mt-8
            flex
            justify-between
            items-center
        ">


            <div className="
                flex
                gap-3
                flex-wrap
            ">


                {
                    filters.map((filter,index)=>(

                        <button

                            key={index}

                            className={`
                                px-5
                                py-2.5
                                rounded-xl
                                text-sm
                                font-medium
                                transition

                                ${
                                    index === 0
                                    ?
                                    "bg-[#7B6EF6] text-white"
                                    :
                                    "bg-white text-slate-600 hover:bg-[#EEE9FF]"
                                }

                            `}

                        >

                            {filter}


                        </button>


                    ))
                }


            </div>




            <div className="
                bg-white
                rounded-xl
                h-12
                w-72
                flex
                items-center
                gap-3
                px-4
                border
            ">


                <Search
                    size={18}
                    className="text-slate-400"
                />


                <input

                    placeholder="Search games..."

                    className="
                        outline-none
                        w-full
                        text-sm
                    "

                />


            </div>



        </div>

    );

};


export default GameFilters;