import Card from "../ui/Card";
import { Clock3 } from "lucide-react";

const sessions = [
  {
    child: "Lina Ahmad",
    game: "Attention Assessment",
    time: "09:00 AM",
  },
  {
    child: "Omar Ali",
    game: "Memory Game",
    time: "11:30 AM",
  },
  {
    child: "Sara Mohammed",
    game: "Reading Assessment",
    time: "02:00 PM",
  },
];

const TodaySessions = () => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Today's Sessions</h2>
          <p className="text-slate-400 text-sm">
            Scheduled assessment sessions
          </p>
        </div>

        <button className="text-[#7B6EF6] font-semibold hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map((item) => (
          <div
            key={item.child}
            className="bg-[#F8F9FD] rounded-2xl p-4 flex justify-between items-center hover:bg-[#F1F3FA] transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EEE9FF] flex justify-center items-center">
                <Clock3 className="text-[#7B6EF6]" size={20} />
              </div>

              <div>
                <h3 className="font-semibold">{item.child}</h3>
                <p className="text-sm text-slate-500">{item.game}</p>
              </div>
            </div>

            <span className="font-semibold">{item.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TodaySessions;