import Card from "../ui/Card";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

const data = [

    {
        session: "S1",
        attention: 65,
        memory: 58,
        executive: 60,
        reading: 55
    },

    {
        session: "S2",
        attention: 70,
        memory: 65,
        executive: 68,
        reading: 60
    },

    {
        session: "S3",
        attention: 76,
        memory: 71,
        executive: 75,
        reading: 67
    },

    {
        session: "S4",
        attention: 82,
        memory: 78,
        executive: 80,
        reading: 73
    },

    {
        session: "S5",
        attention: 87,
        memory: 83,
        executive: 88,
        reading: 81
    },

    {
        session: "S6",
        attention: 91,
        memory: 87,
        executive: 94,
        reading: 88
    }

];

const ProgressChart = () => {

    return (

        <Card>

            <div className="flex justify-between items-center mb-8">

                <div>

                    <h2 className="text-2xl font-bold">

                        Cognitive Progress

                    </h2>

                    <p className="text-slate-500 mt-1">

                        Last 6 assessment sessions

                    </p>

                </div>

                <div className="bg-[#F4F1FF] text-[#7B6EF6] px-4 py-2 rounded-xl text-sm font-medium">

                    Improving

                </div>

            </div>

            <div className="h-[380px]">

                <ResponsiveContainer width="100%" height="100%">

                    <LineChart data={data}>

                        <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="#ECECEC"
                        />

                        <XAxis dataKey="session" />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="attention"
                            stroke="#7B6EF6"
                            strokeWidth={4}
                        />

                        <Line
                            type="monotone"
                            dataKey="memory"
                            stroke="#63B3ED"
                            strokeWidth={4}
                        />

                        <Line
                            type="monotone"
                            dataKey="executive"
                            stroke="#48BB78"
                            strokeWidth={4}
                        />

                        <Line
                            type="monotone"
                            dataKey="reading"
                            stroke="#F6AD55"
                            strokeWidth={4}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

        </Card>

    );

};

export default ProgressChart;