import Card from "../ui/Card";
import {
  Eye,
  Download,
  FileText,
  CheckCircle
} from "lucide-react";

const reports = [
  {
    id: 1,
    title: "Initial Assessment",
    date: "12 Jun 2025",
    score: "78%",
    status: "Completed"
  },
  {
    id: 2,
    title: "Attention Assessment",
    date: "22 Jun 2025",
    score: "85%",
    status: "Completed"
  },
  {
    id: 3,
    title: "Memory Assessment",
    date: "02 Jul 2025",
    score: "91%",
    status: "Completed"
  },
  {
    id: 4,
    title: "Executive Functions",
    date: "08 Jul 2025",
    score: "94%",
    status: "AI Generated"
  }
];

const ReportsTable = () => {

  return (

    <Card>

      <div className="flex justify-between items-center mb-8">

        <div>

          <h2 className="text-2xl font-bold">

            Assessment Reports

          </h2>

          <p className="text-slate-500">

            Previous assessment history

          </p>

        </div>

        <button
          className="
          bg-[#7B6EF6]
          text-white
          px-5
          py-3
          rounded-xl
          hover:bg-[#6B5AF2]
          transition
          "
        >

          Generate New Report

        </button>

      </div>

      <table className="w-full">

        <thead>

          <tr className="border-b text-left text-slate-500">

            <th className="pb-4">Report</th>

            <th>Date</th>

            <th>Score</th>

            <th>Status</th>

            <th className="text-center">Actions</th>

          </tr>

        </thead>

        <tbody>

          {reports.map((report) => (

            <tr
              key={report.id}
              className="border-b hover:bg-[#FAFAFD] transition"
            >

              <td className="py-5">

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-2xl bg-[#F2EEFF] flex justify-center items-center">

                    <FileText className="text-[#7B6EF6]" />

                  </div>

                  <div>

                    <h3 className="font-semibold">

                      {report.title}

                    </h3>

                    <p className="text-sm text-slate-400">

                      Report #{report.id}

                    </p>

                  </div>

                </div>

              </td>

              <td>

                {report.date}

              </td>

              <td>

                <span className="font-bold text-[#7B6EF6]">

                  {report.score}

                </span>

              </td>

              <td>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs flex items-center gap-2 w-fit">

                  <CheckCircle size={14}/>

                  {report.status}

                </span>

              </td>

              <td>

                <div className="flex justify-center gap-3">

                  <button
                    className="
                    w-10
                    h-10
                    rounded-xl
                    bg-blue-100
                    text-blue-600
                    flex
                    justify-center
                    items-center
                    hover:bg-blue-200
                    "
                  >

                    <Eye size={18}/>

                  </button>

                  <button
                    className="
                    w-10
                    h-10
                    rounded-xl
                    bg-[#EEE9FF]
                    text-[#7B6EF6]
                    flex
                    justify-center
                    items-center
                    hover:bg-[#DDD5FF]
                    "
                  >

                    <Download size={18}/>

                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </Card>

  );

};

export default ReportsTable;