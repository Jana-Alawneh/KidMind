import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import GameCard from "./GameCard";

import {
    Brain,
    Target,
    Puzzle,
    BookOpen,
    Zap,
    Gamepad2,
} from "lucide-react";

import {
    deleteGameBuilderGame,
    getGameBuilderGames,
} from "../../api/gameBuilderApi";


const defaultGames = [
    {
        id: "memory",
        title: "Memory Match",
        route: "memory",
        domain: "Working Memory",
        description:
            "Train visual memory, recall ability and learning speed.",
        color: "#F1EDFF",
        icon: Brain,
        players: 24,
        level: "Level 3",
        isCustom: false,
    },
    {
        id: "focus",
        title: "Focus Finder",
        route: "focus",
        domain: "Attention",
        description:
            "Measure focus, accuracy and reaction time.",
        color: "#EAF7FF",
        icon: Target,
        players: 18,
        level: "Level 2",
        isCustom: false,
    },
    {
        id: "puzzle",
        title: "Puzzle Path",
        route: "puzzle",
        domain: "Executive Function",
        description:
            "Develop planning and decision making.",
        color: "#E8FFF5",
        icon: Puzzle,
        players: 15,
        level: "Level 4",
        isCustom: false,
    },
    {
        id: "reading",
        title: "Reading Adventure",
        route: "reading",
        domain: "Reading",
        description:
            "Evaluate reading comprehension.",
        color: "#FFF5DD",
        icon: BookOpen,
        players: 21,
        level: "Level 2",
        isCustom: false,
    },
    {
        id: "quick-match",
        title: "Quick Match",
        route: "quick-match",
        domain: "Processing Speed",
        description:
            "Test response speed.",
        color: "#FEEBEC",
        icon: Zap,
        players: 12,
        level: "Level 3",
        isCustom: false,
    },
];


const getLevelFromDifficulty =
    (difficulty) => {

        if (
            difficulty ===
            "Hard"
        ) {
            return "Level 3";
        }

        if (
            difficulty ===
            "Medium"
        ) {
            return "Level 2";
        }

        return "Level 1";

    };


const GameLibrary = () => {

    const navigate =
        useNavigate();

    const [
        games,
        setGames,
    ] =
        useState(
            defaultGames
        );

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const [
        error,
        setError,
    ] =
        useState("");


    const loadGames =
        useCallback(
            async () => {

                try {

                    setLoading(true);
                    setError("");

                    const saved =
                        await getGameBuilderGames();

                    const customGames =
                        Array.isArray(saved)
                            ? saved.map(
                                  game => ({
                                      id:
                                          Number(
                                              game.id
                                          ),
                                      title:
                                          game.title,
                                      route:
                                          `/games/custom/${game.id}`,
                                      domain:
                                          game.domain ||
                                          "Custom Cognitive Assessment",
                                      description:
                                          game.description ||
                                          "Custom cognitive assessment game.",
                                      color:
                                          game.color ||
                                          "#F1EDFF",
                                      icon:
                                          null,
                                      players:
                                          0,
                                      level:
                                          getLevelFromDifficulty(
                                              game.difficulty
                                          ),
                                      difficulty:
                                          game.difficulty,
                                      time:
                                          Number(
                                              game.time_seconds ||
                                              60
                                          ),
                                      lives:
                                          Number(
                                              game.lives ||
                                              3
                                          ),
                                      scoreEnabled:
                                          Boolean(
                                              game.score_enabled
                                          ),
                                      isCustom:
                                          true,
                                      isAiGenerated:
                                          Boolean(
                                              game.is_ai_generated
                                          ),
                                      aiChildId:
                                          game.ai_child_id ||
                                          null,
                                      aiChildName:
                                          game.ai_child_name ||
                                          null,
                                      aiTargetSkill:
                                          game.ai_target_skill ||
                                          null,
                                      status:
                                          game.status ||
                                          "draft",
                                      createdAt:
                                          game.created_at,
                                      updatedAt:
                                          game.updated_at,
                                  })
                              )
                            : [];

                    setGames([
                        ...defaultGames,
                        ...customGames,
                    ]);

                } catch (
                    requestError
                ) {

                    console.error(
                        "Could not load custom games:",
                        requestError
                    );

                    setGames(
                        defaultGames
                    );

                    setError(
                        requestError
                            ?.response
                            ?.data
                            ?.message ||
                        "Could not load custom games."
                    );

                } finally {

                    setLoading(false);

                }

            },
            []
        );


    useEffect(
        () => {

            loadGames();

        },
        [
            loadGames,
        ]
    );


    const handlePlay =
        game => {

            if (
                game.isCustom
            ) {

                navigate(
                    `/games/custom/${game.id}`
                );

                return;

            }

            if (
                game.route
            ) {

                navigate(
                    `/games/${game.route}`
                );

            }

        };


    const handleEdit =
        game => {

            if (
                !game.isCustom
            ) {
                return;
            }

            navigate(
                `/games/builder?edit=${game.id}`
            );

        };


    const handleDelete =
        async (
            gameId
        ) => {

            try {

                setError("");

                await deleteGameBuilderGame(
                    gameId
                );

                setGames(
                    previous =>
                        previous.filter(
                            game =>
                                !(
                                    game.isCustom &&
                                    Number(
                                        game.id
                                    ) ===
                                    Number(
                                        gameId
                                    )
                                )
                        )
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Could not delete game:",
                    requestError
                );

                setError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    "Could not delete the game."
                );

            }

        };


    return (

        <div>

            <div
                className="
                    mb-5
                    flex
                    items-start
                    justify-between
                    gap-4
                "
            >

                <div>

                    <h2
                        className="
                            text-lg
                            font-bold
                            text-[#202033]
                        "
                    >
                        Game Library
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-[#9999AA]
                        "
                    >
                        {
                            loading
                                ? "Loading games..."
                                : `${games.length} games available`
                        }
                    </p>

                </div>


                <button
                    type="button"
                    onClick={
                        loadGames
                    }
                    disabled={
                        loading
                    }
                    className="
                        h-9
                        px-4
                        rounded-xl
                        border
                        border-[#E5E1FF]
                        bg-white
                        text-[#7566E8]
                        text-xs
                        font-semibold
                        disabled:opacity-50
                    "
                >
                    Refresh
                </button>

            </div>


            {
                error && (

                    <div
                        className="
                            mb-5
                            rounded-2xl
                            border
                            border-[#F3D7DE]
                            bg-[#FFF4F6]
                            px-4
                            py-3
                            text-xs
                            text-[#C3556B]
                        "
                    >
                        {error}
                    </div>

                )
            }


            {
                loading &&
                games.length ===
                defaultGames.length
                    ? (

                        <div
                            className="
                                min-h-[260px]
                                rounded-[28px]
                                bg-white
                                border
                                border-[#E8E8F0]
                                flex
                                items-center
                                justify-center
                                text-sm
                                text-[#9999AA]
                            "
                        >
                            Loading games...
                        </div>

                    )
                    : games.length ===
                      0
                        ? (

                            <div
                                className="
                                    min-h-[300px]
                                    rounded-[28px]
                                    bg-white
                                    border
                                    border-[#E8E8F0]
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    text-center
                                    p-8
                                "
                            >

                                <Gamepad2
                                    size={48}
                                    className="text-[#B4AFEC]"
                                />

                                <h3
                                    className="
                                        mt-4
                                        text-lg
                                        font-bold
                                        text-[#303044]
                                    "
                                >
                                    No games yet
                                </h3>

                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        text-[#9999AA]
                                    "
                                >
                                    Create your first custom game.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/games/builder"
                                        )
                                    }
                                    className="
                                        mt-5
                                        px-5
                                        h-10
                                        rounded-xl
                                        bg-[#7C6CFF]
                                        text-white
                                        text-sm
                                        font-semibold
                                    "
                                >
                                    Create Game
                                </button>

                            </div>

                        )
                        : (

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-2
                                    xl:grid-cols-3
                                    gap-6
                                "
                            >

                                {
                                    games.map(
                                        game => (

                                            <GameCard
                                                key={
                                                    game.id
                                                }
                                                game={
                                                    game
                                                }
                                                onPlay={() =>
                                                    handlePlay(
                                                        game
                                                    )
                                                }
                                                onEdit={
                                                    game.isCustom
                                                        ? () =>
                                                              handleEdit(
                                                                  game
                                                              )
                                                        : undefined
                                                }
                                                onDelete={
                                                    game.isCustom
                                                        ? () =>
                                                              handleDelete(
                                                                  game.id
                                                              )
                                                        : undefined
                                                }
                                            />

                                        )
                                    )
                                }

                            </div>

                        )
            }

        </div>

    );

};


export default GameLibrary;