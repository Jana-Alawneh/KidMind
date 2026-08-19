import { Bell } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "Lina completed Attention Assessment",
    time: "5 min ago",
  },
  {
    id: 2,
    title: "AI generated a new recommendation",
    time: "20 min ago",
  },
  {
    id: 3,
    title: "New child added successfully",
    time: "1 hour ago",
  },
];

const Notifications = () => {
  return (
    <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-xl border z-50 overflow-hidden">

      <div className="px-6 py-5 border-b">

        <h2 className="font-bold text-lg">

          Notifications

        </h2>

      </div>

      {notifications.map((item) => (

        <div
          key={item.id}
          className="px-6 py-4 hover:bg-[#F8F8FD] transition cursor-pointer"
        >

          <div className="flex gap-3">

            <div className="w-10 h-10 rounded-xl bg-[#EEE9FF] flex justify-center items-center">

              <Bell
                size={18}
                className="text-[#7B6EF6]"
              />

            </div>

            <div>

              <p className="font-medium text-sm">

                {item.title}

              </p>

              <p className="text-xs text-slate-400 mt-1">

                {item.time}

              </p>

            </div>

          </div>

        </div>

      ))}

    </div>
  );
};

export default Notifications;