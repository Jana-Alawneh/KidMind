import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    Activity,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Target,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import {
    getSessions,
} from "../api/sessionsApi";


const formatDuration = (
    seconds
) => {

    const totalSeconds =
        Number(seconds) || 0;

    const minutes =
        Math.floor(
            totalSeconds / 60
        );

    const remainingSeconds =
        totalSeconds % 60;

    if (minutes === 0) {
        return `${remainingSeconds}s`;
    }

    return `${minutes}m ${remainingSeconds}s`;

};


const parseDate = (
    value
) => {

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


const formatDate = (
    value
) => {

    const date =
        parseDate(
            value
        );

    if (!date) {
        return "No date";
    }

    return date.toLocaleString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }
    );

};


const isSameDay = (
    first,
    second
) => {

    return (
        first.getFullYear() ===
            second.getFullYear() &&
        first.getMonth() ===
            second.getMonth() &&
        first.getDate() ===
            second.getDate()
    );

};


const matchesDateFilter = (
    date,
    filter
) => {

    if (
        filter ===
        "all"
    ) {
        return true;
    }

    if (!date) {
        return false;
    }

    const now =
        new Date();

    if (
        filter ===
        "today"
    ) {

        return isSameDay(
            date,
            now
        );

    }

    if (
        filter ===
        "yesterday"
    ) {

        const yesterday =
            new Date(
                now
            );

        yesterday.setDate(
            now.getDate() - 1
        );

        return isSameDay(
            date,
            yesterday
        );

    }

    if (
        filter ===
        "last7"
    ) {

        const start =
            new Date(
                now
            );

        start.setHours(
            0,
            0,
            0,
            0
        );

        start.setDate(
            start.getDate() - 6
        );

        return (
            date >= start &&
            date <= now
        );

    }

    if (
        filter ===
        "thisMonth"
    ) {

        return (
            date.getFullYear() ===
                now.getFullYear() &&
            date.getMonth() ===
                now.getMonth()
        );

    }

    if (
        filter ===
        "lastMonth"
    ) {

        const previousMonth =
            new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );

        return (
            date.getFullYear() ===
                previousMonth.getFullYear() &&
            date.getMonth() ===
                previousMonth.getMonth()
        );

    }

    return true;

};


const getSessionDate = (
    session
) => {

    return parseDate(
        session.started_at ||
        session.scheduled_at ||
        session.created_at
    );

};


const getStatusStyle = (
    status
) => {

    switch (status) {

        case "Completed":
            return {
                background:
                    "bg-[#E7F8EF]",
                text:
                    "text-[#2E9B63]",
                dot:
                    "bg-[#2E9B63]",
            };

        case "In Progress":
            return {
                background:
                    "bg-[#EEEAFE]",
                text:
                    "text-[#6F5CE7]",
                dot:
                    "bg-[#7B6EF6]",
            };

        case "Paused":
            return {
                background:
                    "bg-[#FFF4DF]",
                text:
                    "text-[#C78320]",
                dot:
                    "bg-[#E5A23E]",
            };

        case "Ended":
            return {
                background:
                    "bg-[#FFE8E8]",
                text:
                    "text-[#D95757]",
                dot:
                    "bg-[#E36464]",
            };

        case "Cancelled":
            return {
                background:
                    "bg-[#F1F2F6]",
                text:
                    "text-[#777C8C]",
                dot:
                    "bg-[#8B8F9C]",
            };

        case "Scheduled":
            return {
                background:
                    "bg-[#EAF4FF]",
                text:
                    "text-[#4388D0]",
                dot:
                    "bg-[#4D9AE8]",
            };

        default:
            return {
                background:
                    "bg-[#F1F2F6]",
                text:
                    "text-[#777C8C]",
                dot:
                    "bg-[#8B8F9C]",
            };

    }

};


const getGamesText = (
    games
) => {

    if (
        !Array.isArray(games) ||
        games.length === 0
    ) {
        return "No games";
    }

    return games
        .map(
            (game) =>
                game.game_name
        )
        .filter(Boolean)
        .join(" • ");

};


const Sessions = () => {

    const navigate =
        useNavigate();

    const [
        sessions,
        setSessions,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        childFilter,
        setChildFilter,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("all");

    const [
        dateFilter,
        setDateFilter,
    ] = useState("all");


    const loadSessions = async (
        refresh = false
    ) => {

        try {

            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data =
                await getSessions();

            setSessions(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (loadError) {

            console.error(
                "Failed to load sessions:",
                loadError
            );

            setError(
                loadError?.message ||
                "Failed to load sessions"
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    useEffect(() => {

        loadSessions();

    }, []);


    const stats =
        useMemo(() => {

            const total =
                sessions.length;

            const active =
                sessions.filter(
                    (session) =>
                        session.status ===
                            "In Progress" ||
                        session.status ===
                            "Paused"
                ).length;

            const completed =
                sessions.filter(
                    (session) =>
                        session.status ===
                        "Completed"
                ).length;

            return {
                total,
                active,
                completed,
            };

        }, [sessions]);


    const children =
        useMemo(() => {

            const map =
                new Map();

            sessions.forEach(
                (session) => {

                    const id =
                        Number(
                            session.child_id
                        );

                    if (
                        !Number.isInteger(id) ||
                        id <= 0
                    ) {
                        return;
                    }

                    if (
                        !map.has(id)
                    ) {

                        map.set(
                            id,
                            {
                                id,
                                full_name:
                                    session.child_name ||
                                    `Child #${id}`,
                            }
                        );

                    }

                }
            );

            return Array.from(
                map.values()
            ).sort(
                (
                    first,
                    second
                ) =>
                    first.full_name.localeCompare(
                        second.full_name
                    )
            );

        }, [sessions]);


    const statuses =
        useMemo(() => {

            return Array.from(
                new Set(
                    sessions
                        .map(
                            (session) =>
                                session.status
                        )
                        .filter(Boolean)
                )
            ).sort();

        }, [sessions]);


    const filteredSessions =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();

            return sessions.filter(
                (session) => {

                    if (
                        childFilter &&
                        Number(
                            session.child_id
                        ) !==
                        Number(
                            childFilter
                        )
                    ) {
                        return false;
                    }

                    if (
                        statusFilter !==
                            "all" &&
                        session.status !==
                            statusFilter
                    ) {
                        return false;
                    }

                    if (
                        !matchesDateFilter(
                            getSessionDate(
                                session
                            ),
                            dateFilter
                        )
                    ) {
                        return false;
                    }

                    if (!query) {
                        return true;
                    }

                    const searchable =
                        [
                            session.child_name,
                            session.child_region,
                            session.id,
                            session.status,
                            getGamesText(
                                session.games
                            ),
                        ]
                            .filter(
                                (value) =>
                                    value !==
                                        null &&
                                    value !==
                                        undefined
                            )
                            .join(" ")
                            .toLowerCase();

                    return searchable.includes(
                        query
                    );

                }
            );

        }, [
            sessions,
            search,
            childFilter,
            statusFilter,
            dateFilter,
        ]);


    return (

        <div className="flex bg-[#F7F8FC] min-h-screen">

            <Sidebar />

            <main className="flex-1 p-10 overflow-y-auto">

                <Navbar />

                <div
                    className="
                        mt-8
                        flex
                        items-center
                        justify-between
                        gap-5
                        flex-wrap
                    "
                >

                    <div>

                        <h1
                            className="
                                text-[30px]
                                font-bold
                                text-[#25263A]
                            "
                        >
                            Assessment Sessions
                        </h1>

                        <p
                            className="
                                text-[#8A8DA0]
                                mt-1
                            "
                        >
                            View and manage child assessment sessions
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() => {
                            loadSessions(true);
                        }}
                        disabled={refreshing}
                        className="
                            flex
                            items-center
                            gap-2
                            bg-white
                            border
                            border-[#E8E9F1]
                            text-[#6F63E8]
                            font-semibold
                            px-5
                            py-3
                            rounded-xl
                            hover:bg-[#F7F5FF]
                            transition
                            disabled:opacity-60
                        "
                    >

                        <RefreshCw
                            size={18}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </div>


                <div
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-3
                        gap-5
                        mt-8
                    "
                >

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-[#ECECF3]
                            p-6
                            flex
                            items-center
                            gap-4
                        "
                    >

                        <div
                            className="
                                w-12
                                h-12
                                rounded-xl
                                bg-[#EEEAFE]
                                flex
                                items-center
                                justify-center
                                text-[#7B6EF6]
                            "
                        >
                            <Target size={23} />
                        </div>

                        <div>

                            <p className="text-sm text-[#8B8E9E]">
                                Total Sessions
                            </p>

                            <p
                                className="
                                    text-2xl
                                    font-bold
                                    text-[#25263A]
                                    mt-1
                                "
                            >
                                {stats.total}
                            </p>

                        </div>

                    </div>


                    <div
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-[#ECECF3]
                            p-6
                            flex
                            items-center
                            gap-4
                        "
                    >

                        <div
                            className="
                                w-12
                                h-12
                                rounded-xl
                                bg-[#FFF3E4]
                                flex
                                items-center
                                justify-center
                                text-[#D99132]
                            "
                        >
                            <Activity size={23} />
                        </div>

                        <div>

                            <p className="text-sm text-[#8B8E9E]">
                                Active
                            </p>

                            <p
                                className="
                                    text-2xl
                                    font-bold
                                    text-[#25263A]
                                    mt-1
                                "
                            >
                                {stats.active}
                            </p>

                        </div>

                    </div>


                    <div
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-[#ECECF3]
                            p-6
                            flex
                            items-center
                            gap-4
                        "
                    >

                        <div
                            className="
                                w-12
                                h-12
                                rounded-xl
                                bg-[#E7F8EF]
                                flex
                                items-center
                                justify-center
                                text-[#2E9B63]
                            "
                        >
                            <CheckCircle2
                                size={23}
                            />
                        </div>

                        <div>

                            <p className="text-sm text-[#8B8E9E]">
                                Completed
                            </p>

                            <p
                                className="
                                    text-2xl
                                    font-bold
                                    text-[#25263A]
                                    mt-1
                                "
                            >
                                {stats.completed}
                            </p>

                        </div>

                    </div>

                </div>


                <section className="sessions-filter-panel">

                    <div className="sessions-filter-heading">

                        <div>

                            <h2>
                                Assessment History
                            </h2>

                            <p>
                                Search and review assessment sessions.
                            </p>

                        </div>

                        <SlidersHorizontal
                            size={21}
                        />

                    </div>


                    <div className="sessions-toolbar">

                        <div className="sessions-search">

                            <Search
                                size={17}
                            />

                            <input
                                value={
                                    search
                                }
                                onChange={
                                    (event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                }
                                placeholder="Search child, region, session or game..."
                            />

                        </div>


                        <select
                            value={
                                childFilter
                            }
                            onChange={
                                (event) =>
                                    setChildFilter(
                                        event.target.value
                                    )
                            }
                        >

                            <option value="">
                                All Children
                            </option>

                            {children.map(
                                (child) => (

                                    <option
                                        key={
                                            child.id
                                        }
                                        value={
                                            child.id
                                        }
                                    >
                                        {child.full_name}
                                    </option>

                                )
                            )}

                        </select>


                        <select
                            value={
                                statusFilter
                            }
                            onChange={
                                (event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                            }
                        >

                            <option value="all">
                                All Statuses
                            </option>

                            {statuses.map(
                                (status) => (

                                    <option
                                        key={
                                            status
                                        }
                                        value={
                                            status
                                        }
                                    >
                                        {status}
                                    </option>

                                )
                            )}

                        </select>


                        <select
                            value={
                                dateFilter
                            }
                            onChange={
                                (event) =>
                                    setDateFilter(
                                        event.target.value
                                    )
                            }
                        >

                            <option value="all">
                                All Time
                            </option>

                            <option value="today">
                                Today
                            </option>

                            <option value="yesterday">
                                Yesterday
                            </option>

                            <option value="last7">
                                Last 7 Days
                            </option>

                            <option value="thisMonth">
                                This Month
                            </option>

                            <option value="lastMonth">
                                Last Month
                            </option>

                        </select>

                    </div>

                </section>


                <div className="mt-8">

                    {loading && (

                        <div
                            className="
                                bg-white
                                border
                                border-[#ECECF3]
                                rounded-2xl
                                min-h-[320px]
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <div className="text-center">

                                <div
                                    className="
                                        w-11
                                        h-11
                                        border-4
                                        border-[#E9E5FF]
                                        border-t-[#7B6EF6]
                                        rounded-full
                                        animate-spin
                                        mx-auto
                                    "
                                />

                                <p className="text-[#8A8DA0] mt-4">
                                    Loading sessions...
                                </p>

                            </div>

                        </div>

                    )}


                    {!loading && error && (

                        <div
                            className="
                                bg-white
                                border
                                border-[#ECECF3]
                                rounded-2xl
                                min-h-[280px]
                                flex
                                items-center
                                justify-center
                                text-center
                                p-8
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-[#D95757]
                                        font-semibold
                                        text-lg
                                    "
                                >
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        loadSessions();
                                    }}
                                    className="
                                        mt-5
                                        bg-[#7B6EF6]
                                        text-white
                                        px-6
                                        py-3
                                        rounded-xl
                                        font-semibold
                                        hover:bg-[#6A5DE5]
                                        transition
                                    "
                                >
                                    Try Again
                                </button>

                            </div>

                        </div>

                    )}


                    {!loading &&
                        !error &&
                        sessions.length === 0 && (

                            <div
                                className="
                                    bg-white
                                    border
                                    border-[#ECECF3]
                                    rounded-2xl
                                    min-h-[280px]
                                    flex
                                    items-center
                                    justify-center
                                    text-center
                                    p-8
                                "
                            >

                                <div>

                                    <Target
                                        size={42}
                                        className="
                                            text-[#B7B1EC]
                                            mx-auto
                                        "
                                    />

                                    <h2
                                        className="
                                            text-xl
                                            font-bold
                                            text-[#25263A]
                                            mt-4
                                        "
                                    >
                                        No sessions yet
                                    </h2>

                                    <p className="text-[#8A8DA0] mt-2">
                                        Assessment sessions will appear here once they are created.
                                    </p>

                                </div>

                            </div>

                        )}


                    {!loading &&
                        !error &&
                        sessions.length > 0 &&
                        filteredSessions.length === 0 && (

                            <div
                                className="
                                    bg-white
                                    border
                                    border-[#ECECF3]
                                    rounded-2xl
                                    min-h-[280px]
                                    flex
                                    items-center
                                    justify-center
                                    text-center
                                    p-8
                                "
                            >

                                <div>

                                    <Search
                                        size={40}
                                        className="
                                            text-[#B7B1EC]
                                            mx-auto
                                        "
                                    />

                                    <h2
                                        className="
                                            text-xl
                                            font-bold
                                            text-[#25263A]
                                            mt-4
                                        "
                                    >
                                        No sessions found
                                    </h2>

                                    <p className="text-[#8A8DA0] mt-2">
                                        Try changing the search or filters.
                                    </p>

                                </div>

                            </div>

                        )}


                    {!loading &&
                        !error &&
                        filteredSessions.length > 0 && (

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    xl:grid-cols-2
                                    gap-5
                                "
                            >

                                {filteredSessions.map(
                                    (session) => {

                                        const statusStyle =
                                            getStatusStyle(
                                                session.status
                                            );

                                        const displayDate =
                                            session.started_at ||
                                            session.scheduled_at ||
                                            session.created_at;

                                        return (

                                            <button
                                                key={
                                                    session.id
                                                }
                                                type="button"
                                                onClick={() => {
                                                    navigate(
                                                        `/sessions/${session.id}`
                                                    );
                                                }}
                                                className="
                                                    bg-white
                                                    border
                                                    border-[#ECECF3]
                                                    rounded-2xl
                                                    p-6
                                                    text-left
                                                    hover:border-[#CFC9FF]
                                                    hover:shadow-md
                                                    transition-all
                                                    group
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-start
                                                        justify-between
                                                        gap-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-4
                                                            min-w-0
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                w-12
                                                                h-12
                                                                min-w-12
                                                                rounded-full
                                                                bg-[#EEEAFE]
                                                                text-[#7B6EF6]
                                                                flex
                                                                items-center
                                                                justify-center
                                                                font-bold
                                                                text-lg
                                                            "
                                                        >
                                                            {session
                                                                .child_name
                                                                ?.charAt(0)
                                                                ?.toUpperCase() ||
                                                                "C"}
                                                        </div>

                                                        <div className="min-w-0">

                                                            <h2
                                                                className="
                                                                    text-lg
                                                                    font-bold
                                                                    text-[#25263A]
                                                                    truncate
                                                                "
                                                            >
                                                                {session.child_name ||
                                                                    "Child"}
                                                            </h2>

                                                            <p
                                                                className="
                                                                    text-sm
                                                                    text-[#9699A9]
                                                                    mt-1
                                                                "
                                                            >
                                                                Session #{session.id}
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <div
                                                        className={`
                                                            flex
                                                            items-center
                                                            gap-2
                                                            px-3
                                                            py-2
                                                            rounded-full
                                                            text-xs
                                                            font-semibold
                                                            ${statusStyle.background}
                                                            ${statusStyle.text}
                                                        `}
                                                    >

                                                        <span
                                                            className={`
                                                                w-2
                                                                h-2
                                                                rounded-full
                                                                ${statusStyle.dot}
                                                            `}
                                                        />

                                                        {session.status}

                                                    </div>

                                                </div>


                                                <div
                                                    className="
                                                        mt-5
                                                        bg-[#F8F8FC]
                                                        rounded-xl
                                                        px-4
                                                        py-3
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-xs
                                                            font-semibold
                                                            text-[#A0A2B0]
                                                            uppercase
                                                        "
                                                    >
                                                        Games
                                                    </p>

                                                    <p
                                                        className="
                                                            text-sm
                                                            font-medium
                                                            text-[#55586B]
                                                            mt-1
                                                            leading-6
                                                        "
                                                    >
                                                        {getGamesText(
                                                            session.games
                                                        )}
                                                    </p>

                                                </div>


                                                <div
                                                    className="
                                                        grid
                                                        grid-cols-3
                                                        gap-3
                                                        mt-5
                                                    "
                                                >

                                                    <div>

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-1.5
                                                                text-[#A0A2B0]
                                                                text-xs
                                                            "
                                                        >
                                                            <CalendarDays
                                                                size={14}
                                                            />
                                                            Date
                                                        </div>

                                                        <p
                                                            className="
                                                                text-sm
                                                                font-semibold
                                                                text-[#55586B]
                                                                mt-2
                                                            "
                                                        >
                                                            {formatDate(
                                                                displayDate
                                                            )}
                                                        </p>

                                                    </div>


                                                    <div>

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-1.5
                                                                text-[#A0A2B0]
                                                                text-xs
                                                            "
                                                        >
                                                            <Clock3
                                                                size={14}
                                                            />
                                                            Duration
                                                        </div>

                                                        <p
                                                            className="
                                                                text-sm
                                                                font-semibold
                                                                text-[#55586B]
                                                                mt-2
                                                            "
                                                        >
                                                            {formatDuration(
                                                                session.duration_seconds
                                                            )}
                                                        </p>

                                                    </div>


                                                    <div>

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-1.5
                                                                text-[#A0A2B0]
                                                                text-xs
                                                            "
                                                        >
                                                            <Target
                                                                size={14}
                                                            />
                                                            Score
                                                        </div>

                                                        <p
                                                            className="
                                                                text-sm
                                                                font-semibold
                                                                text-[#55586B]
                                                                mt-2
                                                            "
                                                        >
                                                            {session.score !==
                                                                null &&
                                                            session.score !==
                                                                undefined
                                                                ? `${Math.round(
                                                                      Number(
                                                                          session.score
                                                                      )
                                                                  )}%`
                                                                : "--"}
                                                        </p>

                                                    </div>

                                                </div>


                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        justify-end
                                                        gap-2
                                                        text-[#7B6EF6]
                                                        font-semibold
                                                        text-sm
                                                        mt-6
                                                    "
                                                >
                                                    View Session

                                                    <ChevronRight
                                                        size={18}
                                                        className="
                                                            group-hover:translate-x-1
                                                            transition-transform
                                                        "
                                                    />
                                                </div>

                                            </button>

                                        );

                                    }
                                )}

                            </div>

                        )}

                </div>


                <style>{`
                    .sessions-filter-panel {
                        margin-top: 18px;
                        padding: 19px;
                        border: 1px solid #ECECF4;
                        border-radius: 20px;
                        background: white;
                        box-shadow:
                            0 7px 22px
                            rgba(52, 53, 85, .025);
                    }

                    .sessions-filter-heading {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        gap: 14px;
                        color: #7869E6;
                    }

                    .sessions-filter-heading h2 {
                        margin: 0;
                        color: #3D3F5C;
                        font-size: 15px;
                        font-weight: 600;
                    }

                    .sessions-filter-heading p {
                        margin: 4px 0 0;
                        color: #A0A3B3;
                        font-size: 10.5px;
                    }

                    .sessions-toolbar {
                        display: grid;
                        grid-template-columns:
                            minmax(0, 1fr)
                            175px
                            150px
                            160px;
                        gap: 10px;
                        margin-top: 16px;
                    }

                    .sessions-search {
                        height: 42px;
                        padding: 0 13px;
                        border: 1px solid #E7E7EF;
                        border-radius: 12px;
                        background: #FAFAFC;
                        color: #A0A2B2;
                        display: flex;
                        align-items: center;
                        gap: 9px;
                    }

                    .sessions-search input {
                        width: 100%;
                        height: 100%;
                        border: 0;
                        outline: 0;
                        background: transparent;
                        color: #42445E;
                        font-size: 11px;
                    }

                    .sessions-toolbar select {
                        width: 100%;
                        height: 42px;
                        padding: 0 10px;
                        border: 1px solid #E1E1EA;
                        border-radius: 11px;
                        outline: 0;
                        background: #FBFBFD;
                        color: #57596E;
                        font-size: 10px;
                    }

                    @media (max-width: 1050px) {
                        .sessions-toolbar {
                            grid-template-columns:
                                minmax(0, 1fr)
                                155px
                                140px
                                145px;
                        }
                    }

                    @media (max-width: 850px) {
                        .sessions-toolbar {
                            grid-template-columns:
                                1fr
                                1fr;
                        }
                    }

                    @media (max-width: 560px) {
                        .sessions-toolbar {
                            grid-template-columns:
                                1fr;
                        }
                    }
                `}</style>

            </main>

        </div>

    );

};


export default Sessions;
