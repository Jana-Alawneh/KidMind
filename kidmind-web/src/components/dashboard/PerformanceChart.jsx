import Card from "../ui/Card";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const data = [
  {
    week: "Week 1",
    attention: 65,
    memory: 58,
    reading: 70,
    executive: 55,
  },
  {
    week: "Week 2",
    attention: 72,
    memory: 65,
    reading: 74,
    executive: 61,
  },
  {
    week: "Week 3",
    attention: 80,
    memory: 73,
    reading: 82,
    executive: 70,
  },
  {
    week: "Week 4",
    attention: 91,
    memory: 85,
    reading: 89,
    executive: 81,
  },
];

const PerformanceChart = () => {
  return (
    <Card>

      <div className="flex justify-between items-center mb-8">

        <div>

          <h2 className="text-xl font-semibold">
            Cognitive Performance
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Children's progress over the last four weeks
          </p>

        </div>

        <select
          className="
          border
          rounded-xl
          px-4
          py-2
          text-sm
          outline-none
          bg-white
          "
        >
          <option>This Month</option>
          <option>Last Month</option>
        </select>

      </div>

      <ResponsiveContainer
        width="100%"
        height={340}
      >

        <LineChart data={data}>

          <CartesianGrid
            stroke="#ECECF5"
            strokeDasharray="5 5"
          />

          <XAxis dataKey="week" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="attention"
            stroke="#7B6EF6"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="memory"
            stroke="#63B3ED"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="reading"
            stroke="#48BB78"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="executive"
            stroke="#F6AD55"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

      <div className="flex gap-6 mt-6 flex-wrap">

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#7B6EF6]" />
          <span className="text-sm text-slate-500">
            Attention
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#63B3ED]" />
          <span className="text-sm text-slate-500">
            Working Memory
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#48BB78]" />
          <span className="text-sm text-slate-500">
            Reading
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#F6AD55]" />
          <span className="text-sm text-slate-500">
            Executive Functions
          </span>
        </div>

      </div>

    </Card>
  );
};

export default PerformanceChart;