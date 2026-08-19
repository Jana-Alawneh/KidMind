import {
    Plus,
    CalendarDays
} from "lucide-react";


const SessionsHeader = () => {


    return (

        <div className="
            flex
            justify-between
            items-center
            mt-8
        ">


            <div>


                <h1 className="
                    text-3xl
                    font-bold
                ">

                    Sessions

                </h1>


                <p className="
                    text-slate-500
                    mt-2
                ">

                    Manage assessment sessions and appointments

                </p>


            </div>



            <button

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

                New Session


            </button>



        </div>

    );

};


export default SessionsHeader;