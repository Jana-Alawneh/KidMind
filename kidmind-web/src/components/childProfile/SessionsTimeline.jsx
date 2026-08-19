import Card from "../ui/Card";

const sessions = [
  {
    date: "12 Jun 2025",
    game: "Memory Match",
    duration: "20 min"
  },
  {
    date: "20 Jun 2025",
    game: "Attention Focus",
    duration: "25 min"
  },
  {
    date: "02 Jul 2025",
    game: "Reading Adventure",
    duration: "18 min"
  }
];

const SessionsTimeline = () => {
  return (
    <Card>

      <h2 className="text-xl font-bold mb-8">

        Recent Sessions

      </h2>

      <div className="space-y-6">

        {sessions.map((session, index) => (

          <div
            key={index}
            className="flex gap-4"
          >

            <div className="flex flex-col items-center">

              <div className="w-4 h-4 rounded-full bg-[#7B6EF6]" />

              {index !== sessions.length - 1 && (
                <div className="w-1 h-16 bg-[#E6E2FF]" />
              )}

            </div>

            <div>

              <h3 className="font-semibold">

                {session.game}

              </h3>

              <p className="text-sm text-slate-500">

                {session.date}

              </p>

              <span className="text-xs bg-[#F3F0FF] text-[#7B6EF6] px-3 py-1 rounded-full inline-block mt-2">

                {session.duration}

              </span>

            </div>

          </div>

        ))}
      </div>

    </Card>
  );
};

export default SessionsTimeline;