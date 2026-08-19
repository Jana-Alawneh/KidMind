import {
    Plus,
    Search
} from "lucide-react";


const ChildrenHeader = ({onAdd}) => {


    return (

        <div className="flex justify-between items-center mt-8">


            <div>

                <h1 className="text-3xl font-bold">

                    Children

                </h1>


                <p className="text-slate-500 mt-2">

                    Manage children's profiles and assessments

                </p>


            </div>



            <div className="flex items-center gap-4">


                <div
                    className="
                    bg-white
                    h-12
                    px-4
                    rounded-2xl
                    border
                    flex
                    items-center
                    gap-3
                    "
                >

                    <Search
                        size={18}
                        className="text-slate-400"
                    />


                    <input

                        placeholder="Search child..."

                        className="
                        outline-none
                        bg-transparent
                        "

                    />


                </div>



                <button

                    onClick={onAdd}

                    className="
                    bg-[#7B6EF6]
                    text-white
                    px-5
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

                    Add Child


                </button>


            </div>


        </div>

    );

};


export default ChildrenHeader;