import Card from "../ui/Card";

import {
    Eye,
    Pencil,
    Trash2
} from "lucide-react";

import { useNavigate } from "react-router-dom";


const ChildrenTable = ({ children = [], onDelete }) => {


    const navigate = useNavigate();


    return (

        <Card>


            <div className="flex justify-between items-center mb-8">


                <div>

                    <h2 className="text-2xl font-bold">

                        Children List

                    </h2>

                    <p className="text-slate-500">

                        All registered children

                    </p>


                </div>


                <div className="
                    bg-[#F3F0FF]
                    text-[#7B6EF6]
                    px-4
                    py-2
                    rounded-xl
                    text-sm
                    font-medium
                ">

                    {children.length} Children

                </div>


            </div>



            <div className="overflow-x-auto">


                <table className="w-full">


                    <thead>


                        <tr className="
                            border-b
                            text-left
                            text-slate-500
                        ">


                            <th className="pb-4">
                                Child
                            </th>


                            <th>
                                Age
                            </th>


                            <th>
                                Score
                            </th>


                            <th>
                                Last Assessment
                            </th>


                            <th>
                                Status
                            </th>


                            <th className="text-center">
                                Actions
                            </th>


                        </tr>


                    </thead>



                    <tbody>


                        {children.map((child)=>(


                            <tr
                                key={child.id}
                                className="
                                border-b
                                hover:bg-[#FAFAFD]
                                transition
                                "
                            >


                                <td className="py-5">


                                    <div className="flex items-center gap-3">


                                        <img

                                            src={child.image}

                                            className="
                                            w-12
                                            h-12
                                            rounded-full
                                            "
                                        />


                                        <div>


                                            <h3 className="font-semibold">

                                                {child.name}

                                            </h3>


                                            <p className="text-sm text-slate-500">

                                                {child.gender}

                                            </p>


                                        </div>


                                    </div>


                                </td>



                                <td>

                                    {child.age} Years

                                </td>



                                <td>


                                    <span className="
                                    font-bold
                                    text-[#7B6EF6]
                                    ">

                                        {child.score}

                                    </span>


                                </td>



                                <td>

                                    {child.lastAssessment}

                                </td>




                                <td>


                                    <span className="
                                    bg-green-100
                                    text-green-700
                                    px-3
                                    py-1
                                    rounded-full
                                    text-xs
                                    ">

                                        {child.status}

                                    </span>


                                </td>




                                <td>


                                    <div className="
                                    flex
                                    justify-center
                                    gap-3
                                    ">


                                        <button

                                            onClick={() => navigate(`/children/${child.id}`)}

                                            className="
                                            w-10
                                            h-10
                                            rounded-xl
                                            bg-[#EEE9FF]
                                            text-[#7B6EF6]
                                            flex
                                            justify-center
                                            items-center
                                            hover:bg-[#DDD5FF]
                                            "

                                        >

                                            <Eye size={18}/>

                                        </button>



                                        <button

                                            className="
                                            w-10
                                            h-10
                                            rounded-xl
                                            bg-blue-100
                                            text-blue-600
                                            flex
                                            justify-center
                                            items-center
                                            "

                                        >

                                            <Pencil size={18}/>

                                        </button>



                                        <button
    type="button"
    onClick={() => onDelete(child.id)}
    className="
    w-10
    h-10
    rounded-xl
    bg-red-100
    text-red-500
    flex
    justify-center
    items-center
    hover:bg-red-200
    cursor-pointer
    "
>
    <Trash2 size={18}/>
</button>


                                    </div>


                                </td>


                            </tr>


                        ))}


                    </tbody>


                </table>


            </div>


        </Card>

    );

};

export const deleteChild = async (id) => {
  const response = await API.delete(`/children/${id}`);

  return response.data;
};

export default ChildrenTable;