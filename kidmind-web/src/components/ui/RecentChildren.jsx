import Card from "./Card";

const children = [
  {
    name: "Lina Ahmad",
    age: 6,
    score: "92%",
  },
  {
    name: "Omar Ali",
    age: 8,
    score: "87%",
  },
  {
    name: "Sara Mohammed",
    age: 5,
    score: "95%",
  },
];

const RecentChildren = () => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Recent Children</h2>

        <button className="text-[#7B6EF6] font-semibold hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-5">
        {children.map((child) => (
          <div
            key={child.name}
            className="flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${child.name}`}
                className="w-12 h-12 rounded-2xl bg-[#F3F4FF]"
              />

              <div>
                <h3 className="font-semibold">{child.name}</h3>

                <p className="text-sm text-slate-500">
                  Age {child.age}
                </p>
              </div>
            </div>

            <div className="text-[#7B6EF6] font-bold">
              {child.score}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentChildren;