import Card from "../ui/Card";

import {
  AlertCircle,
  Bot,
  Brain,
  Gamepad2,
  Sparkles,
  TrendingUp,
} from "lucide-react";


const AIInsights = () => {

  return (

    <Card className="h-full">

      <div
        className="
          flex
          items-center
          gap-3
          pb-4
          border-b
          border-[#F0F0F5]
        "
      >

        <div
          className="
            w-10
            h-10
            rounded-[13px]
            bg-[#F0EDFF]
            text-[#7566EB]
            flex
            items-center
            justify-center
          "
        >

          <Bot
            size={18}
          />

        </div>


        <div>

          <h2
            className="
              text-[16px]
              font-bold
              text-[#333554]
            "
          >
            AI Insights
          </h2>


          <p
            className="
              text-[10.5px]
              text-[#A0A3B4]
              mt-1
            "
          >
            Smart analysis
          </p>

        </div>

      </div>


      <div
        className="
          mt-4
          rounded-[16px]
          border
          border-[#E8E3FF]
          bg-gradient-to-br
          from-[#F7F4FF]
          to-[#FCFAFF]
          p-4
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >

          <div>

            <p
              className="
                text-[9px]
                font-bold
                tracking-[0.06em]
                text-[#9A95B7]
                uppercase
              "
            >
              AI Confidence
            </p>


            <h2
              className="
                text-[27px]
                leading-[34px]
                font-extrabold
                text-[#7566EB]
                mt-1
              "
            >
              96%
            </h2>

          </div>


          <div
            className="
              w-11
              h-11
              rounded-[14px]
              bg-white
              border
              border-[#E8E3FF]
              flex
              items-center
              justify-center
              text-[#7566EB]
            "
          >

            <Sparkles
              size={19}
            />

          </div>

        </div>

      </div>


      <div
        className="
          mt-3
          rounded-[15px]
          border
          border-[#E7F2EC]
          bg-[#F7FCF9]
          p-3.5
        "
      >

        <div
          className="
            flex
            gap-3
          "
        >

          <div
            className="
              w-9
              h-9
              shrink-0
              rounded-[11px]
              bg-[#ECFAF4]
              text-[#48A784]
              flex
              items-center
              justify-center
            "
          >

            <Brain
              size={16}
            />

          </div>


          <div>

            <h3
              className="
                text-[10.5px]
                font-bold
                text-[#55586D]
              "
            >
              Recommendation
            </h3>


            <p
              className="
                text-[9.5px]
                text-[#8E91A4]
                mt-1
                leading-[15px]
              "
            >
              Increase memory difficulty by one level during the next assessment.
            </p>

          </div>

        </div>

      </div>


      <div
        className="
          mt-2.5
          rounded-[15px]
          border
          border-[#F4EAD5]
          bg-[#FFFBF3]
          p-3.5
        "
      >

        <div
          className="
            flex
            gap-3
          "
        >

          <div
            className="
              w-9
              h-9
              shrink-0
              rounded-[11px]
              bg-[#FFF3DA]
              text-[#D99949]
              flex
              items-center
              justify-center
            "
          >

            <AlertCircle
              size={16}
            />

          </div>


          <div>

            <h3
              className="
                text-[10.5px]
                font-bold
                text-[#55586D]
              "
            >
              Risk Level
            </h3>


            <p
              className="
                text-[9.5px]
                text-[#8E91A4]
                mt-1
              "
            >
              Low Risk
            </p>

          </div>

        </div>

      </div>


      <div
        className="
          mt-2.5
          rounded-[15px]
          border
          border-[#DDEBF6]
          bg-[#F6FAFD]
          p-3.5
        "
      >

        <div
          className="
            flex
            gap-3
          "
        >

          <div
            className="
              w-9
              h-9
              shrink-0
              rounded-[11px]
              bg-[#EDF6FF]
              text-[#5595DD]
              flex
              items-center
              justify-center
            "
          >

            <TrendingUp
              size={16}
            />

          </div>


          <div>

            <h3
              className="
                text-[10.5px]
                font-bold
                text-[#55586D]
              "
            >
              Progress
            </h3>


            <p
              className="
                text-[9.5px]
                text-[#8E91A4]
                mt-1
                leading-[15px]
              "
            >
              +14% improvement compared to last month.
            </p>

          </div>

        </div>

      </div>


      <div
        className="
          mt-3
          rounded-[15px]
          border
          border-[#F2E7D5]
          bg-[#FFFBF4]
          p-4
        "
      >

        <div
          className="
            flex
            gap-2.5
            items-center
          "
        >

          <div
            className="
              w-8
              h-8
              rounded-[10px]
              bg-[#FFF3DA]
              text-[#D99949]
              flex
              items-center
              justify-center
            "
          >

            <Gamepad2
              size={15}
            />

          </div>


          <h3
            className="
              text-[10.5px]
              font-bold
              text-[#55586D]
            "
          >
            Suggested Games
          </h3>

        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-1.5
            mt-3
          "
        >

          {[
            "Memory Match",
            "Attention Focus",
            "Reading Adventure",
            "Executive Puzzle",
          ].map(
            game => (

              <div
                key={
                  game
                }
                className="
                  min-h-[31px]
                  px-3
                  rounded-[9px]
                  bg-white
                  border
                  border-[#F1E8D9]
                  flex
                  items-center
                  gap-2
                  text-[9.5px]
                  text-[#6E7183]
                  font-medium
                "
              >

                <span
                  className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-[#D99949]
                  "
                />

                {game}

              </div>

            )
          )}

        </div>

      </div>

    </Card>

  );

};


export default AIInsights;