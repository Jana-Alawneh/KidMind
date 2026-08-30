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


const getChildInitial = (
  child
) => {

  return String(
    child?.full_name ||
    "C"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

};


const ChildInfoCard = ({
  child,
  onEdit,
  onStartSession,
}) => {

  return (

    <Card className="h-full">

      <div
        className="
          flex
          items-center
          gap-4
          pb-5
          border-b
          border-[#F0F0F5]
        "
      >

        <div
          className="
            w-[58px]
            h-[58px]
            shrink-0
            rounded-[18px]
            flex
            items-center
            justify-center
            bg-gradient-to-br
            from-[#F0EDFF]
            to-[#FCEEFF]
            text-[#7968E9]
            text-xl
            font-extrabold
          "
        >
          {getChildInitial(child)}
        </div>


        <div className="min-w-0">

          <span
            className="
              text-[9px]
              font-extrabold
              tracking-[0.09em]
              text-[#8172EA]
            "
          >
            CHILD PROFILE
          </span>


          <h2
            className="
              text-[18px]
              leading-6
              font-bold
              text-[#343654]
              mt-1
              truncate
            "
          >
            {child.full_name}
          </h2>


          <p
            className="
              text-[10px]
              text-[#A0A3B4]
              mt-1
            "
          >
            Child ID #{child.id}
          </p>

        </div>

      </div>


      <div
        className="
          grid
          grid-cols-2
          gap-2.5
          mt-5
        "
      >

        <div
          className="
            rounded-[14px]
            bg-[#FAFAFC]
            border
            border-[#F0F0F5]
            p-3
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
              text-[#7B6EF6]
            "
          >
            <Calendar size={15} />

            <span
              className="
                text-[9px]
                font-semibold
                text-[#A0A3B4]
              "
            >
              Age
            </span>
          </div>

          <p
            className="
              text-[12px]
              font-bold
              text-[#55586E]
              mt-2
            "
          >
            {child.age} Years
          </p>

        </div>


        <div
          className="
            rounded-[14px]
            bg-[#FAFAFC]
            border
            border-[#F0F0F5]
            p-3
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <User
              size={15}
              className="text-[#5595DD]"
            />

            <span
              className="
                text-[9px]
                font-semibold
                text-[#A0A3B4]
              "
            >
              Gender
            </span>

          </div>

          <p
            className="
              text-[12px]
              font-bold
              text-[#55586E]
              mt-2
            "
          >
            {child.gender || "—"}
          </p>

        </div>


        <div
          className="
            rounded-[14px]
            bg-[#FAFAFC]
            border
            border-[#F0F0F5]
            p-3
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <Users
              size={15}
              className="text-[#48A784]"
            />

            <span
              className="
                text-[9px]
                font-semibold
                text-[#A0A3B4]
              "
            >
              Parent
            </span>

          </div>

          <p
            className="
              text-[11px]
              font-bold
              text-[#55586E]
              mt-2
              truncate
            "
            title={
              child.parent_name ||
              "Not provided"
            }
          >
            {child.parent_name || "Not provided"}
          </p>

        </div>


        <div
          className="
            rounded-[14px]
            bg-[#FAFAFC]
            border
            border-[#F0F0F5]
            p-3
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <Activity
              size={15}
              className="text-[#D99949]"
            />

            <span
              className="
                text-[9px]
                font-semibold
                text-[#A0A3B4]
              "
            >
              Status
            </span>

          </div>

          <p
            className="
              text-[11px]
              font-bold
              text-[#3E9E7D]
              mt-2
            "
          >
            {child.status || "Active"}
          </p>

        </div>

      </div>


      <div
        className="
          mt-4
          rounded-[15px]
          border
          border-[#EFEFF5]
          bg-[#FCFCFE]
          p-4
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <div
            className="
              w-8
              h-8
              rounded-[10px]
              bg-[#F0EDFF]
              flex
              items-center
              justify-center
            "
          >

            <FileText
              size={15}
              className="text-[#7566EB]"
            />

          </div>


          <span
            className="
              text-[11px]
              font-bold
              text-[#55586D]
            "
          >
            Notes
          </span>

        </div>


        <p
          className="
            text-[#8E91A4]
            text-[10.5px]
            mt-3
            leading-[17px]
            break-words
          "
        >
          {child.notes || "No notes available."}
        </p>

      </div>


      <div
        className="
          grid
          grid-cols-1
          gap-2
          mt-5
        "
      >

        <button
          type="button"
          onClick={
            onStartSession
          }
          className="
            h-[42px]
            bg-[#7969EA]
            hover:bg-[#6959F5]
            text-white
            rounded-[12px]
            flex
            justify-center
            items-center
            gap-2
            text-[11px]
            font-semibold
            transition
          "
        >

          <Play size={15} />

          Start Session

        </button>


        <button
          type="button"
          className="
            h-[42px]
            bg-[#F6F3FF]
            border
            border-[#E4DFFF]
            text-[#7566EB]
            rounded-[12px]
            flex
            justify-center
            items-center
            gap-2
            text-[11px]
            font-semibold
            hover:bg-[#F0ECFF]
            transition
          "
        >

          <FileText size={15} />

          Generate Report

        </button>


        <button
          type="button"
          onClick={
            onEdit
          }
          className="
            h-[42px]
            border
            border-[#E7E7EF]
            text-[#777A8F]
            bg-white
            rounded-[12px]
            flex
            justify-center
            items-center
            gap-2
            text-[11px]
            font-semibold
            hover:bg-[#F9F9FC]
            transition
          "
        >

          <Pencil size={15} />

          Edit Information

        </button>

      </div>

    </Card>

  );

};


export default ChildInfoCard;