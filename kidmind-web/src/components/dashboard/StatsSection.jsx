import {
    useEffect,
    useState
} from "react";

import StatCard from "../ui/StatCard";

import {
    Users,
    CalendarCheck,
    FileText,
    Bot
} from "lucide-react";

import {
    getChildren
} from "../../api/childrenApi";

import {
    getSessions
} from "../../api/sessionsApi";


const getSessionDate = (
    session
) => {

    const value =
        session.created_at ||
        session.scheduled_at ||
        session.started_at ||
        session.ended_at;


    if (!value) {
        return null;
    }


    const date =
        new Date(
            String(value).replace(
                " ",
                "T"
            )
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }


    return date;

};


const StatsSection = () => {

    const [
        childrenCount,
        setChildrenCount
    ] = useState(0);


    const [
        monthSessionsCount,
        setMonthSessionsCount
    ] = useState(0);


    const [
        reportsCount,
        setReportsCount
    ] = useState(0);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState(false);


    useEffect(() => {

        const loadStats =
            async () => {

                try {

                    setLoading(true);
                    setError(false);


                    const [
                        children,
                        sessions
                    ] =
                        await Promise.all([
                            getChildren(),
                            getSessions()
                        ]);


                    const childrenData =
                        Array.isArray(
                            children
                        )
                            ? children
                            : [];


                    const sessionsData =
                        Array.isArray(
                            sessions
                        )
                            ? sessions
                            : [];


                    const now =
                        new Date();


                    const currentYear =
                        now.getFullYear();


                    const currentMonth =
                        now.getMonth();


                    const sessionsThisMonth =
                        sessionsData.filter(
                            (session) => {

                                const date =
                                    getSessionDate(
                                        session
                                    );


                                if (!date) {
                                    return false;
                                }


                                return (
                                    date.getFullYear() ===
                                        currentYear &&
                                    date.getMonth() ===
                                        currentMonth
                                );

                            }
                        );


                    const completedReports =
                        sessionsData.filter(
                            (session) =>
                                session.status ===
                                "Completed"
                        );


                    setChildrenCount(
                        childrenData.length
                    );


                    setMonthSessionsCount(
                        sessionsThisMonth.length
                    );


                    setReportsCount(
                        completedReports.length
                    );

                } catch (loadError) {

                    console.error(
                        "Failed to load dashboard statistics:",
                        loadError
                    );


                    setError(true);

                } finally {

                    setLoading(false);

                }

            };


        loadStats();

    }, []);


    const displayValue = (
        value
    ) => {

        if (loading) {
            return "...";
        }


        if (error) {
            return "—";
        }


        return String(
            value
        );

    };


    const stats = [

        {
            title:
                "Children",

            value:
                displayValue(
                    childrenCount
                ),

            subtitle:
                "Registered children",

            change:
                loading
                    ? "..."
                    : "Live",

            bg:
                "#F1EDFF",

            iconBg:
                "#7B6EF6",

            icon:
                <Users />
        },


        {
            title:
                "Sessions",

            value:
                displayValue(
                    monthSessionsCount
                ),

            subtitle:
                "This month",

            change:
                loading
                    ? "..."
                    : "Live",

            bg:
                "#EAF7FF",

            iconBg:
                "#63B3ED",

            icon:
                <CalendarCheck />
        },


        {
            title:
                "Reports",

            value:
                displayValue(
                    reportsCount
                ),

            subtitle:
                "Completed assessments",

            change:
                loading
                    ? "..."
                    : "Live",

            bg:
                "#FFF4E8",

            iconBg:
                "#F6AD55",

            icon:
                <FileText />
        },


        {
            title:
                "AI Insights",

            value:
                "—",

            subtitle:
                "AI integration pending",

            change:
                "Pending",

            bg:
                "#EEF8E8",

            iconBg:
                "#48BB78",

            icon:
                <Bot />
        }

    ];


    return (

        <div
            className="
            grid
            grid-cols-2
            xl:grid-cols-4
            gap-6
            mt-8
            "
        >

            {stats.map(
                (item) => (

                    <StatCard
                        key={
                            item.title
                        }
                        {...item}
                    />

                )
            )}

        </div>

    );

};


export default StatsSection;