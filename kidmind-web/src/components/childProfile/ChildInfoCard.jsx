import Card from "../ui/Card";

import {
  User,
  Calendar,
  Users,
  Activity,
  Play,
  FileText,
  Pencil,
} from "lucide-react";


const ChildInfoCard = ({
  child,
   onEdit,
}) => {

  const childImage =
    child.image ||
    `https://i.pravatar.cc/200?u=kidmind-${child.id}`;


  return (

    <Card className="col-span-1">

      <div className="flex flex-col items-center">

        <img
          src={childImage}
          alt={child.full_name}
          className="
            w-28
            h-28
            rounded-full
            border-4
            border-[#EEE9FF]
            object-cover
          "
        />

        <h2 className="text-2xl font-bold mt-5 text-center">

          {child.full_name}

        </h2>

        <p className="text-slate-500">

          Child ID #{child.id}

        </p>

      </div>


      <div className="space-y-5 mt-8">

        <div className="flex justify-between gap-4">

          <div className="flex gap-3 items-center">

            <Calendar
              size={18}
              className="text-[#7B6EF6]"
            />

            <span>Age</span>

          </div>

          <span className="font-semibold text-right">

            {child.age} Years

          </span>

        </div>


        <div className="flex justify-between gap-4">

          <div className="flex gap-3 items-center">

            <User
              size={18}
              className="text-[#63B3ED]"
            />

            <span>Gender</span>

          </div>

          <span className="font-semibold text-right">

            {child.gender}

          </span>

        </div>


        <div className="flex justify-between gap-4">

          <div className="flex gap-3 items-center">

            <Users
              size={18}
              className="text-[#48BB78]"
            />

            <span>Parent</span>

          </div>

          <span className="
            font-semibold
            text-right
            max-w-[160px]
          ">

            {child.parent_name || "Not provided"}

          </span>

        </div>


        <div className="flex justify-between gap-4">

          <div className="flex gap-3 items-center">

            <Activity
              size={18}
              className="text-[#F6AD55]"
            />

            <span>Status</span>

          </div>

          <span className="
            font-semibold
            text-green-600
          ">

            {child.status || "Active"}

          </span>

        </div>


        <div className="
          bg-[#F8FAFC]
          rounded-xl
          p-4
        ">

          <div className="flex gap-2 items-center">

            <FileText
              size={18}
              className="text-[#7B6EF6]"
            />

            <span className="font-semibold">

              Notes

            </span>

          </div>

          <p className="
            text-slate-500
            text-sm
            mt-2
            leading-6
            break-words
          ">

            {child.notes || "No notes available."}

          </p>

        </div>

      </div>


      <div className="grid grid-cols-1 gap-3 mt-10">

        <button
          className="
            bg-[#7B6EF6]
            hover:bg-[#6959F5]
            text-white
            rounded-xl
            py-3
            flex
            justify-center
            items-center
            gap-2
            transition
          "
        >

          <Play size={18} />

          Start Session

        </button>


        <button
          className="
            bg-[#F3F0FF]
            text-[#7B6EF6]
            rounded-xl
            py-3
            flex
            justify-center
            items-center
            gap-2
            hover:bg-[#ECE7FF]
            transition
          "
        >

          <FileText size={18} />

          Generate Report

        </button>


<button
  type="button"
  onClick={onEdit}
  className="
    border
    rounded-xl
    py-3
    flex
    justify-center
    items-center
    gap-2
    hover:bg-gray-50
    transition
  "
>

          <Pencil size={18} />

          Edit Information

        </button>

      </div>

    </Card>

  );

};


export default ChildInfoCard;