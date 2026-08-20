import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import ChildrenHeader from "../components/children/ChildrenHeader";
import ChildrenTable from "../components/children/ChildrenTable";
import AddChildModal from "../components/children/AddChildModal";
import EditChildModal from "../components/children/EditChildModal";

import {
    useEffect,
    useState
} from "react";

import {
    deleteChild,
    getChildren
} from "../api/childrenApi";

import {
    getSessions
} from "../api/sessionsApi";


const domainConfigs = [
    {
        gameName: "focus finder",
    },
    {
        gameName: "memory match",
    },
    {
        gameName: "puzzle path",
    },
    {
        gameName: "reading adventure",
    },
    {
        gameName: "quick match",
    },
];


const normalizeGameName = (
    value
) => {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();

};


const getTimestamp = (
    game,
    session
) => {

    const value =
        game?.ended_at ||
        game?.started_at ||
        game?.updated_at ||
        game?.created_at ||
        session?.ended_at ||
        session?.started_at ||
        session?.updated_at ||
        session?.created_at;


    if (!value) {
        return 0;
    }


    const timestamp =
        new Date(
            String(value).replace(
                " ",
                "T"
            )
        ).getTime();


    return Number.isFinite(
        timestamp
    )
        ? timestamp
        : 0;

};


const getLatestGameScore = (
    sessions,
    gameName
) => {

    const matches = [];


    sessions.forEach(
        (session) => {

            if (
                !Array.isArray(
                    session.games
                )
            ) {
                return;
            }


            session.games.forEach(
                (game) => {

                    const isFinished =
                        game.status ===
                            "Completed" ||
                        game.status ===
                            "Failed";


                    const score =
                        Number(
                            game.score
                        );


                    if (
                        !isFinished ||
                        normalizeGameName(
                            game.game_name
                        ) !== gameName ||
                        !Number.isFinite(
                            score
                        )
                    ) {
                        return;
                    }


                    matches.push({
                        score:
                            Math.max(
                                0,
                                Math.min(
                                    100,
                                    Math.round(
                                        score
                                    )
                                )
                            ),

                        timestamp:
                            getTimestamp(
                                game,
                                session
                            ),
                    });

                }
            );

        }
    );


    if (
        matches.length === 0
    ) {
        return null;
    }


    matches.sort(
        (
            first,
            second
        ) =>
            second.timestamp -
            first.timestamp
    );


    return matches[0].score;

};


const calculateOverallScore = (
    sessions
) => {

    const domainScores =
        domainConfigs.map(
            (domain) =>
                getLatestGameScore(
                    sessions,
                    domain.gameName
                )
        );


    const availableValues =
        domainScores.filter(
            (value) =>
                typeof value ===
                    "number" &&
                Number.isFinite(
                    value
                )
        );


    if (
        availableValues.length === 0
    ) {
        return null;
    }


    return Math.round(
        availableValues.reduce(
            (
                total,
                value
            ) =>
                total +
                value,
            0
        ) /
        availableValues.length
    );

};


const getSessionTimestamp = (
    session
) => {

    const value =
        session?.ended_at ||
        session?.updated_at ||
        session?.started_at ||
        session?.created_at;


    if (!value) {
        return 0;
    }


    const timestamp =
        new Date(
            String(value).replace(
                " ",
                "T"
            )
        ).getTime();


    return Number.isFinite(
        timestamp
    )
        ? timestamp
        : 0;

};


const formatAssessmentDate = (
    timestamp
) => {

    if (!timestamp) {
        return "Not assessed";
    }


    const date =
        new Date(
            timestamp
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Not assessed";
    }


    return date.toLocaleDateString(
        "en-US",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );

};


const getLastAssessment = (
    sessions
) => {

    const assessedSessions =
        sessions.filter(
            (session) =>
                session.status ===
                "Completed"
        );


    if (
        assessedSessions.length === 0
    ) {
        return "Not assessed";
    }


    const latestTimestamp =
        Math.max(
            ...assessedSessions.map(
                getSessionTimestamp
            )
        );


    return formatAssessmentDate(
        latestTimestamp
    );

};


const Children = () => {

    const [
        openModal,
        setOpenModal
    ] = useState(false);

    const [
        editingChild,
        setEditingChild
    ] = useState(null);

    const [
        children,
        setChildren
    ] = useState([]);

    const [
        searchQuery,
        setSearchQuery
    ] = useState("");


    const loadChildren =
        async () => {

            try {

                const [
                    childrenData,
                    sessionsData,
                ] =
                    await Promise.all([
                        getChildren(),
                        getSessions(),
                    ]);


                const allSessions =
                    Array.isArray(
                        sessionsData
                    )
                        ? sessionsData
                        : [];


                const formattedChildren =
                    childrenData.map(
                        (child) => {

                            const childSessions =
                                allSessions.filter(
                                    (session) =>
                                        Number(
                                            session.child_id
                                        ) ===
                                        Number(
                                            child.id
                                        )
                                );


                            const overallScore =
                                calculateOverallScore(
                                    childSessions
                                );


                            const lastAssessment =
                                getLastAssessment(
                                    childSessions
                                );


                            return {

                                ...child,

                                name:
                                    child.full_name ||
                                    child.name ||
                                    "Unnamed Child",

                                image:
                                    child.image ||
                                    `https://i.pravatar.cc/100?u=kidmind-${child.id}`,

                                score:
                                    typeof overallScore ===
                                        "number"
                                        ? `${overallScore}%`
                                        : "—",

                                lastAssessment,

                                status:
                                    child.status ||
                                    "Active",

                                region:
                                    child.region ||
                                    "",

                            };

                        }
                    );


                setChildren(
                    formattedChildren
                );

            } catch (error) {

                console.error(
                    "Failed to load children:",
                    error
                );

            }

        };


    useEffect(() => {

        loadChildren();

    }, []);


    const handleEdit = (
        child
    ) => {

        setEditingChild(
            child
        );

    };


    const handleDelete = async (
        id
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this child?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteChild(
                id
            );

            await loadChildren();

        } catch (error) {

            console.error(
                "Failed to delete child:",
                error
            );


            window.alert(
                "Failed to delete the child. Please try again."
            );

        }

    };


    const normalizedSearch =
        searchQuery
            .trim()
            .toLowerCase();


    const idSearch =
        normalizedSearch.startsWith(
            "#"
        )
            ? normalizedSearch.slice(1)
            : normalizedSearch;


    const filteredChildren =
        normalizedSearch
            ? children.filter(
                (child) => {

                    const childId =
                        String(
                            child.id ?? ""
                        ).toLowerCase();

                    const childName =
                        String(
                            child.full_name ||
                            child.name ||
                            ""
                        ).toLowerCase();

                    const parentName =
                        String(
                            child.parent_name ||
                            ""
                        ).toLowerCase();

                    const region =
                        String(
                            child.region ||
                            ""
                        ).toLowerCase();


                    return (
                        childId.includes(
                            idSearch
                        ) ||
                        childName.includes(
                            normalizedSearch
                        ) ||
                        parentName.includes(
                            normalizedSearch
                        ) ||
                        region.includes(
                            normalizedSearch
                        )
                    );

                }
            )
            : children;


    return (

        <div
            className="
            flex
            bg-[#F7F8FC]
            min-h-screen
            "
        >

            <Sidebar />


            <main
                className="
                flex-1
                p-10
                overflow-y-auto
                "
            >

                <Navbar />


                <ChildrenHeader
                    onAdd={() => {
                        setOpenModal(
                            true
                        );
                    }}
                    searchQuery={
                        searchQuery
                    }
                    onSearchChange={
                        setSearchQuery
                    }
                />


                <div
                    className="
                    mt-8
                    "
                >

                    <ChildrenTable
                        children={
                            filteredChildren
                        }
                        onDelete={
                            handleDelete
                        }
                        onEdit={
                            handleEdit
                        }
                    />

                </div>


                {openModal && (

                    <AddChildModal
                        close={() => {
                            setOpenModal(
                                false
                            );
                        }}
                        onSuccess={
                            loadChildren
                        }
                    />

                )}


                {editingChild && (

                    <EditChildModal
                        child={
                            editingChild
                        }
                        close={() => {
                            setEditingChild(
                                null
                            );
                        }}
                        onSuccess={
                            loadChildren
                        }
                    />

                )}

            </main>

        </div>

    );

};


export default Children;