import Card from "../ui/Card";
import {
  Brain,
  Eye,
  BookOpen,
  Target,
  Database
} from "lucide-react";

const scores = [

  {
    title: "Overall Score",
    value: 92,
    color: "bg-[#7B6EF6]",
    icon: <Brain size={18}/>
  },

  {
    title: "Attention",
    value: 90,
    color: "bg-[#63B3ED]",
    icon: <Eye size={18}/>
  },

  {
    title: "Working Memory",
    value: 87,
    color: "bg-[#48BB78]",
    icon: <Database size={18}/>
  },

  {
    title: "Executive Functions",
    value: 95,
    color: "bg-[#F6AD55]",
    icon: <Target size={18}/>
  },

  {
    title: "Reading Skills",
    value: 89,
    color: "bg-[#F56565]",
    icon: <BookOpen size={18}/>
  }

];

const CognitiveScores = () => {

  return (

    <Card className="col-span-2">

      <h2 className="text-2xl font-bold mb-8">

        Cognitive Assessment

      </h2>

      <div className="space-y-6">

        {scores.map((item) => (

          <div key={item.title}>

            <div className="flex justify-between mb-2">

              <div className="flex items-center gap-3">

                <div
                  className={`${item.color} text-white w-10 h-10 rounded-xl flex justify-center items-center`}
                >
                  {item.icon}
                </div>

                <span className="font-semibold">

                  {item.title}

                </span>

              </div>

              <span className="font-bold text-lg">

                {item.value}%

              </span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">

              <div
                className={`${item.color} h-3 rounded-full transition-all duration-700`}
                style={{ width: `${item.value}%` }}
              />

            </div>

          </div>

        ))}

      </div>

    </Card>

  );

};

export default CognitiveScores;