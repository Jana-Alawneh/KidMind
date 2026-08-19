import Card from "../ui/Card";
import {
  Bot,
  Brain,
  TrendingUp,
  Gamepad2,
  AlertCircle
} from "lucide-react";

const AIInsights = () => {
  return (
    <Card>

      <div className="flex items-center gap-3 mb-8">

        <div className="w-12 h-12 rounded-2xl bg-[#EEE9FF] flex items-center justify-center">

          <Bot className="text-[#7B6EF6]" />

        </div>

        <div>

          <h2 className="text-xl font-bold">

            AI Insights

          </h2>

          <p className="text-slate-500 text-sm">

            Smart analysis

          </p>

        </div>

      </div>

      {/* AI Score */}

      <div className="bg-[#F6F3FF] rounded-2xl p-5 mb-5">

        <p className="text-slate-500 text-sm">

          AI Confidence

        </p>

        <h2 className="text-4xl font-bold text-[#7B6EF6] mt-2">

          96%

        </h2>

      </div>

      {/* Recommendation */}

      <div className="flex gap-3 mb-5">

        <Brain className="text-[#48BB78]" />

        <div>

          <h3 className="font-semibold">

            Recommendation

          </h3>

          <p className="text-sm text-slate-500 mt-1">

            Increase memory difficulty by one level during the next assessment.

          </p>

        </div>

      </div>

      {/* Risk */}

      <div className="flex gap-3 mb-5">

        <AlertCircle className="text-[#F6AD55]" />

        <div>

          <h3 className="font-semibold">

            Risk Level

          </h3>

          <p className="text-sm text-slate-500 mt-1">

            Low Risk

          </p>

        </div>

      </div>

      {/* Progress */}

      <div className="flex gap-3 mb-5">

        <TrendingUp className="text-[#63B3ED]" />

        <div>

          <h3 className="font-semibold">

            Progress

          </h3>

          <p className="text-sm text-slate-500 mt-1">

            +14% improvement compared to last month.

          </p>

        </div>

      </div>

      {/* Suggested Games */}

      <div className="bg-[#FFF7E8] rounded-2xl p-5">

        <div className="flex gap-3 items-center mb-3">

          <Gamepad2 className="text-[#F6AD55]" />

          <h3 className="font-semibold">

            Suggested Games

          </h3>

        </div>

        <ul className="space-y-2 text-sm text-slate-600">

          <li>• Memory Match</li>

          <li>• Attention Focus</li>

          <li>• Reading Adventure</li>

          <li>• Executive Puzzle</li>

        </ul>

      </div>

    </Card>
  );
};

export default AIInsights;