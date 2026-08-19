import Card from "../ui/Card";
import { FileText } from "lucide-react";


const assessments = [

    {
        child: "Lina Ahmad",
        activity: "Attention Game",
        score: "92%",
        date: "Today",
        status: "Completed"
    },

    {
        child: "Omar Ali",
        activity: "Memory Assessment",
        score: "85%",
        date: "Yesterday",
        status: "Completed"
    },

    {
        child: "Sara Mohammed",
        activity: "Reading Test",
        score: "95%",
        date: "July 7",
        status: "Pending"
    }

];


const RecentAssessments = () => {


    return (

        <Card>


            <div className="flex justify-between items-center mb-6">


                <div>

                    <h2 className="text-xl font-semibold">

                        Recent Assessments

                    </h2>


                    <p className="text-sm text-slate-400 mt-1">

                        Latest cognitive evaluation results

                    </p>

                </div>


                <button

                    className="
                    text-[#7B6EF6]
                    font-semibold
                    text-sm
                    hover:underline
                    "

                >

                    View All

                </button>


            </div>



            <div className="overflow-x-auto">


                <table className="w-full">


                    <thead>

                        <tr className="text-left text-sm text-slate-400">


                            <th className="pb-4">
                                Child
                            </th>


                            <th className="pb-4">
                                Activity
                            </th>


                            <th className="pb-4">
                                Score
                            </th>


                            <th className="pb-4">
                                Date
                            </th>


                            <th className="pb-4">
                                Status
                            </th>


                            <th></th>


                        </tr>


                    </thead>



                    <tbody>


                    {

                        assessments.map((item)=>(


                            <tr

                                key={item.child}

                                className="
                                border-t
                                border-gray-100
                                hover:bg-[#FAFAFF]
                                transition
                                "

                            >


                                <td className="py-5">


                                    <div className="flex items-center gap-3">


                                        <div

                                            className="
                                            w-10
                                            h-10
                                            rounded-2xl
                                            bg-[#EEE9FF]
                                            flex
                                            items-center
                                            justify-center
                                            "

                                        >

                                            <FileText

                                                size={18}

                                                className="text-[#7B6EF6]"

                                            />


                                        </div>


                                        <span className="font-semibold">

                                            {item.child}

                                        </span>


                                    </div>


                                </td>



                                <td className="text-slate-600">

                                    {item.activity}

                                </td>



                                <td>

                                    <span

                                        className="
                                        font-bold
                                        text-[#7B6EF6]
                                        "

                                    >

                                        {item.score}

                                    </span>


                                </td>



                                <td className="text-slate-500">

                                    {item.date}

                                </td>



                                <td>


                                    <span

                                        className={`
                                        px-3
                                        py-1
                                        rounded-full
                                        text-xs
                                        font-semibold

                                        ${
                                            item.status === "Completed"

                                            ?

                                            "bg-[#E8FFF5] text-[#38B2AC]"

                                            :

                                            "bg-[#FFF5DD] text-[#F6AD55]"
                                        }
                                        `}

                                    >

                                        {item.status}

                                    </span>


                                </td>



                                <td>


                                    <button

                                        className="
                                        bg-[#7B6EF6]
                                        text-white
                                        px-4
                                        py-2
                                        rounded-xl
                                        text-xs
                                        hover:bg-[#6657EF]
                                        transition
                                        "

                                    >

                                        View Report

                                    </button>


                                </td>


                            </tr>


                        ))

                    }


                    </tbody>


                </table>


            </div>


        </Card>


    );

};


export default RecentAssessments;