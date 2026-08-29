import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertCircle,
    ArrowRight,
    Brain,
    CheckCircle2,
    Clock3,
    Gamepad2,
    RefreshCw,
    Sparkles,
    Target,
    UserRound,
    Zap,
} from "lucide-react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import api from "../services/api";


/* =========================================================
   HELPERS
========================================================= */

const toNumber = (
    value,
    fallback = 0
) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
};


/* =========================================================
   CHILD NORMALIZATION
========================================================= */

const normalizeChild = (child) => {
    const results =
        child?.results ||
        child?.assessmentResults ||
        child?.latestResults ||
        child?.latestAssessment ||
        {};

    return {
        id:
            child?.id ??
            child?.childId ??
            child?._id ??
            child?.uuid ??
            null,

        name:
            child?.name ||
            child?.childName ||
            child?.full_name ||
            child?.fullName ||
            `${child?.firstName || ""} ${
                child?.lastName || ""
            }`.trim() ||
            "Unknown Child",

        age: toNumber(
            child?.age ??
            child?.childAge ??
            0
        ),

        results: {
            attention: toNumber(
                results?.attention ??
                results?.Attention ??
                child?.attention ??
                0
            ),

            workingMemory: toNumber(
                results?.workingMemory ??
                results?.working_memory ??
                results?.WorkingMemory ??
                child?.workingMemory ??
                0
            ),

            executiveFunctions: toNumber(
                results?.executiveFunctions ??
                results?.executive_functions ??
                results?.ExecutiveFunctions ??
                child?.executiveFunctions ??
                0
            ),

            accuracy: toNumber(
                results?.accuracy ??
                child?.accuracy ??
                0
            ),

            errors: toNumber(
                results?.errors ??
                child?.errors ??
                0
            ),

            responseTime: toNumber(
                results?.responseTime ??
                results?.response_time ??
                child?.responseTime ??
                0
            ),

            impulsivity: toNumber(
                results?.impulsivity ??
                child?.impulsivity ??
                0
            ),
        },
    };
};


/* =========================================================
   LOAD CHILDREN
========================================================= */

const extractChildren = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.children)) {
        return data.children;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.data?.children)) {
        return data.data.children;
    }

    return [];
};


const loadChildrenFromApi = async () => {
    const response =
        await api.get(
            "/children"
        );

    return extractChildren(
        response.data
    )
        .map(normalizeChild)
        .filter(
            (child) =>
                child.id !== null
        );
};


/* =========================================================
   BUILDER OBJECT CONVERSION
========================================================= */

const SHAPES = [
    "circle",
    "square",
    "triangle",
    "star",
    "diamond",
    "card",
];


const COLORS = [
    "#7C6CFF",
    "#63B3ED",
    "#F5A623",
    "#EF6A8A",
    "#52C7A8",
    "#9B8AFB",
];


const getShapeForObject = (
    object,
    index
) => {
    const type =
        String(
            object?.type ||
            ""
        ).toLowerCase();

    const properties =
        object?.properties || {};

    const requestedShape =
        properties?.shape ||
        object?.shape;

    if (
        requestedShape &&
        SHAPES.includes(
            String(requestedShape).toLowerCase()
        )
    ) {
        return String(
            requestedShape
        ).toLowerCase();
    }

    if (
        type === "card" ||
        type === "memory-card"
    ) {
        return "card";
    }

    if (
        type === "target"
    ) {
        return "circle";
    }

    if (
        type === "text"
    ) {
        return "circle";
    }

    return SHAPES[
        index % SHAPES.length
    ];
};


const getColorForObject = (
    object,
    index
) => {
    const properties =
        object?.properties || {};

    return (
        properties?.color ||
        object?.color ||
        COLORS[
            index % COLORS.length
        ]
    );
};


const convertAIObjectsToBuilderObjects = (
    objects
) => {
    if (!Array.isArray(objects)) {
        return [];
    }

    return objects.map(
        (object, index) => {
            const shape =
                getShapeForObject(
                    object,
                    index
                );

            const type =
                String(
                    object?.type ||
                    ""
                ).toLowerCase();

            const properties =
                object?.properties || {};

            const isText =
                type === "text";

            const isButton =
                type === "button";

            const width =
                toNumber(
                    properties?.width,
                    isText ? 170 : 100
                );

            const height =
                toNumber(
                    properties?.height,
                    isText ? 55 : 100
                );

            const x =
                toNumber(
                    properties?.x,
                    80 +
                    (index % 4) * 190
                );

            const y =
                toNumber(
                    properties?.y,
                    120 +
                    Math.floor(
                        index / 4
                    ) * 150
                );

            let text = "";

            if (isText) {
                text =
                    object?.name ||
                    object?.description ||
                    "Game Text";
            }

            if (isButton) {
                text =
                    object?.name ||
                    "Click Me";
            }

            return {
                id:
                    object?.id ||
                    `ai-object-${Date.now()}-${index}`,

                type:
                    isText
                        ? "text"
                        : isButton
                            ? "button"
                            : "shape",

                elementId:
                    isText
                        ? "text"
                        : isButton
                            ? "button"
                            : shape,

                name:
                    object?.name ||
                    `AI Object ${index + 1}`,

                x,
                y,

                width,
                height,

                color:
                    getColorForObject(
                        object,
                        index
                    ),

                text,

                shape:
                    isText || isButton
                        ? null
                        : shape,

                image:
                    properties?.image ||
                    object?.image ||
                    null,

                visible: true,

                rotation: 0,

                aiGenerated: true,

                aiDescription:
                    object?.description ||
                    "",

                aiType:
                    object?.type ||
                    "",

                aiProperties:
                    properties,
            };
        }
    );
};


/* =========================================================
   FIND OBJECT
========================================================= */

const findObjectByReference = (
    objects,
    reference
) => {
    if (
        !reference ||
        !Array.isArray(objects)
    ) {
        return null;
    }

    const value =
        String(reference)
            .trim()
            .toLowerCase();

    return (
        objects.find(
            (object) =>
                String(
                    object?.id || ""
                ).toLowerCase() === value
        ) ||
        objects.find(
            (object) =>
                String(
                    object?.name || ""
                ).toLowerCase() === value
        ) ||
        null
    );
};


/* =========================================================
   BUILDER RULE CONVERSION
========================================================= */

const normalizeTrigger = (
    trigger
) => {
    const value =
        String(
            trigger || ""
        ).toLowerCase();

    if (
        value.includes("start")
    ) {
        return "game-start";
    }

    if (
        value.includes("time") ||
        value.includes("timer")
    ) {
        return "timer-end";
    }

    return "object-clicked";
};


const normalizeAction = (
    action
) => {
    const value =
        String(
            action || ""
        ).toLowerCase();

    if (
        value.includes("remove") ||
        value.includes("subtract") ||
        value.includes("penalty")
    ) {
        return "remove-score";
    }

    if (
        value.includes("hide")
    ) {
        return "hide";
    }

    if (
        value.includes("show")
    ) {
        return "show";
    }

    if (
        value.includes("move")
    ) {
        return "move";
    }

    if (
        value.includes("wait")
    ) {
        return "wait";
    }

    return "add-score";
};


const convertAIRulesToBuilderRules = (
    rules,
    builderObjects
) => {
    if (!Array.isArray(rules)) {
        return [];
    }

    return rules.map(
        (rule, index) => {
            const targetReference =
                rule?.targetId ||
                rule?.triggerTargetId ||
                rule?.objectId ||
                rule?.target ||
                "";

            const targetObject =
                findObjectByReference(
                    builderObjects,
                    targetReference
                );

            const trigger =
                normalizeTrigger(
                    rule?.trigger
                );

            const action =
                normalizeAction(
                    rule?.action
                );

            const points =
                toNumber(
                    rule?.points,
                    0
                );

            return {
                id:
                    rule?.id ||
                    `ai-rule-${Date.now()}-${index}`,

                trigger,

                triggerTargetId:
                    targetObject?.id ||
                    "",

                action,

                targetIds:
                    targetObject
                        ? [targetObject.id]
                        : [],

                value:
                    points,

                wait: 1,

                moveX: 30,

                moveY: 0,

                enabled: true,

                aiGenerated: true,

                description:
                    rule?.description ||
                    "",

                aiTrigger:
                    rule?.trigger ||
                    "",

                aiAction:
                    rule?.action ||
                    "",
            };
        }
    );
};


/* =========================================================
   PREPARE BUILDER CONFIG
========================================================= */

const prepareBuilderConfig = (
    aiGame,
    child
) => {
    const builderObjects =
        convertAIObjectsToBuilderObjects(
            aiGame?.objects
        );

    const builderRules =
        convertAIRulesToBuilderRules(
            aiGame?.rules,
            builderObjects
        );

    const difficulty =
        [
            "Easy",
            "Medium",
            "Hard",
        ].includes(
            aiGame?.difficulty
        )
            ? aiGame.difficulty
            : "Medium";

    const timeSeconds =
        toNumber(
            aiGame?.timeSeconds,
            difficulty === "Hard"
                ? 30
                : difficulty === "Medium"
                    ? 45
                    : 60
        );

    const lives =
        toNumber(
            aiGame?.lives,
            difficulty === "Hard"
                ? 2
                : 3
        );

    return {
        source:
            "GEMINI_AI",

        aiGenerated:
            true,

        childId:
            child?.id ??
            null,

        childName:
            child?.name ??
            null,

        childAge:
            child?.age ??
            null,

        gameName:
            aiGame?.gameName ||
            `${child?.name || "Child"} — AI Game`,

        gameDescription:
            aiGame?.gameDescription ||
            "AI-generated personalized cognitive game.",

        gameType:
            aiGame?.domain ||
            "Cognitive",

        domain:
            aiGame?.domain ||
            "Cognitive",

        targetSkill:
            aiGame?.targetSkill ||
            "Cognitive Skills",

        secondaryConcern:
            aiGame?.secondaryConcern ||
            "",

        difficulty,

        timeLimit:
            timeSeconds,

        lives,

        scoreEnabled:
            aiGame?.scoreEnabled !== false,

        levels: 3,

        progressiveDifficulty:
            true,

        analysis:
            aiGame?.analysis ||
            "",

        therapyPlan:
            aiGame?.therapyPlan ||
            "",

        sourceReport:
            aiGame?.sourceReport ||
            null,

        objects:
            builderObjects,

        rules:
            builderRules,

        aiOriginalObjects:
            Array.isArray(
                aiGame?.objects
            )
                ? aiGame.objects
                : [],

        aiOriginalRules:
            Array.isArray(
                aiGame?.rules
            )
                ? aiGame.rules
                : [],

        generatedAt:
            new Date().toISOString(),
    };
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

function AIAssistant() {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const [
        children,
        setChildren
    ] = useState([]);

    const [
        selectedId,
        setSelectedId
    ] = useState("");

    const [
        loadingChildren,
        setLoadingChildren
    ] = useState(true);

    const [
        generating,
        setGenerating
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const [
        generated,
        setGenerated
    ] = useState(null);


    const selectedChild =
        useMemo(
            () =>
                children.find(
                    (child) =>
                        String(
                            child.id
                        ) ===
                        String(
                            selectedId
                        )
                ) || null,
            [
                children,
                selectedId
            ]
        );


    /* =====================================================
       LOAD
    ===================================================== */

    const loadChildren = async () => {
        try {
            setLoadingChildren(true);
            setError("");

            const loaded =
                await loadChildrenFromApi();

            setChildren(
                loaded
            );

            const stateChild =
                location.state?.child;

            if (
                stateChild
            ) {
                const normalized =
                    normalizeChild(
                        stateChild
                    );

                const exists =
                    loaded.find(
                        (child) =>
                            String(
                                child.id
                            ) ===
                            String(
                                normalized.id
                            )
                    );

                if (exists) {
                    setSelectedId(
                        exists.id
                    );
                } else if (
                    normalized.id
                ) {
                    setChildren(
                        (previous) => [
                            normalized,
                            ...previous,
                        ]
                    );

                    setSelectedId(
                        normalized.id
                    );
                }
            } else if (
                loaded.length > 0
            ) {
                setSelectedId(
                    loaded[0].id
                );
            }
        } catch (err) {
            console.error(
                "Load children error:",
                err
            );

            setError(
                err?.message ||
                "Unable to load children."
            );
        } finally {
            setLoadingChildren(
                false
            );
        }
    };


    useEffect(() => {
        loadChildren();
    }, []);


    /* =====================================================
       GENERATE GAME
    ===================================================== */

    const generateGame =
        async () => {
            if (!selectedChild) {
                setError(
                    "Please select a child first."
                );

                return;
            }

            setGenerating(true);
            setGenerated(null);
            setError("");

            try {
                const response =
                    await api.post(
                        "/ai/generate-game",
                        {
                            child_id:
                                selectedChild.id,
                        }
                    );

                const data =
                    response.data;

                if (
                    !data?.success ||
                    !data?.data?.game
                ) {
                    throw new Error(
                        data?.message ||
                        "AI returned incomplete game data."
                    );
                }

                const builderConfig =
                    prepareBuilderConfig(
                        data.data.game,
                        selectedChild
                    );

                setGenerated({
                    primarySkill:
                        data.data.primarySkill ||
                        data.data.game.targetSkill,

                    secondaryConcern:
                        data.data.secondaryConcern ||
                        data.data.game.secondaryConcern ||
                        "",

                    analysis:
                        data.data.analysis ||
                        data.data.game.analysis ||
                        "",

                    therapyPlan:
                        data.data.therapyPlan ||
                        data.data.game.therapyPlan ||
                        "",

                    sourceReport:
                        data.data.sourceReport ||
                        null,

                    game:
                        {
                            ...builderConfig,

                            therapyPlan:
                                data.data.therapyPlan ||
                                data.data.game.therapyPlan ||
                                "",

                            sourceReport:
                                data.data.sourceReport ||
                                null,
                        },
                });
            } catch (err) {
                console.error(
                    "Generate game error:",
                    err
                );

                setError(
                    err?.message ||
                    "Something went wrong while generating the game."
                );
            } finally {
                setGenerating(
                    false
                );
            }
        };


    /* =====================================================
       OPEN BUILDER
    ===================================================== */

    const openBuilder =
        () => {
            if (
                !generated?.game
            ) {
                return;
            }

            const config =
                generated.game;

            /*
             * Keep a temporary copy as backup.
             */
            localStorage.setItem(
                "aiGeneratedGame",
                JSON.stringify(
                    generated
                )
            );

            navigate(
                "/games/builder",
                {
                    state: {
                        fromAI:
                            true,

                        gameConfig:
                            config,
                    },
                }
            );
        };


    /* =====================================================
       LOADING
    ===================================================== */

    if (
        loadingChildren
    ) {
        return (
            <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
                <div className="text-center">
                    <Loader />
                    <p className="mt-4 text-sm text-gray-500">
                        Loading children...
                    </p>
                </div>
            </div>
        );
    }


    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="min-h-screen bg-[#F7F8FC] p-5 md:p-7">
            <div className="mx-auto max-w-7xl">

                {/* HEADER */}

                <div className="mb-7">
                    <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEE9FF]">
                            <Sparkles
                                size={24}
                                className="text-[#7C6CFF]"
                            />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#7C6CFF]">
                                AI Assistant
                            </p>

                            <h1 className="text-2xl font-bold text-[#303044]">
                                Personalized Game Generator
                            </h1>
                        </div>

                    </div>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#858594]">
                        Select a child and let the AI analyze
                        the assessment results to generate a
                        personalized game configuration for
                        the Game Builder.
                    </p>
                </div>


                {/* ERROR */}

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">

                        <AlertCircle
                            size={20}
                            className="text-red-500 shrink-0"
                        />

                        <div>
                            <p className="font-semibold text-red-700">
                                AI Assistant Error
                            </p>

                            <p className="mt-1 text-sm text-red-600">
                                {error}
                            </p>
                        </div>

                    </div>
                )}


                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">

                    {/* LEFT */}

                    <aside className="rounded-[24px] border border-[#ECEBF2] bg-white p-6 shadow-sm">

                        <div className="mb-5 flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1EDFF]">
                                    <UserRound
                                        size={19}
                                        className="text-[#7C6CFF]"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-sm font-bold text-[#303044]">
                                        Select Child
                                    </h2>

                                    <p className="text-xs text-[#9999AA]">
                                        Assessment profile
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    loadChildren
                                }
                                disabled={
                                    loadingChildren
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F7FA] text-[#777788] hover:bg-[#EEE9FF] hover:text-[#7C6CFF]"
                            >
                                <RefreshCw
                                    size={15}
                                    className={
                                        loadingChildren
                                            ? "animate-spin"
                                            : ""
                                    }
                                />
                            </button>

                        </div>


                        {children.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#DDDCE7] bg-[#FAFAFD] p-5 text-center">

                                <UserRound
                                    size={28}
                                    className="mx-auto text-[#AAAAB6]"
                                />

                                <p className="mt-3 text-sm font-semibold text-[#555566]">
                                    No children found
                                </p>

                                <p className="mt-2 text-xs leading-5 text-[#9999A6]">
                                    Add a child first, then return
                                    here to generate an AI game.
                                </p>

                            </div>
                        ) : (
                            <select
                                value={
                                    selectedId
                                }
                                onChange={(
                                    event
                                ) => {
                                    setSelectedId(
                                        event.target.value
                                    );

                                    setGenerated(
                                        null
                                    );

                                    setError(
                                        ""
                                    );
                                }}
                                className="w-full rounded-2xl border border-[#E7E6EF] bg-[#FAFAFD] px-4 py-3.5 text-sm font-semibold text-[#303044] outline-none focus:border-[#7C6CFF]"
                            >

                                {children.map(
                                    (
                                        child
                                    ) => (
                                        <option
                                            key={
                                                child.id
                                            }
                                            value={
                                                child.id
                                            }
                                        >
                                            {child.name}
                                            {child.age
                                                ? ` — ${child.age} years`
                                                : ""}
                                        </option>
                                    )
                                )}

                            </select>
                        )}


                        {selectedChild && (
                            <>
                                {/* CHILD */}

                                <div className="mt-5 rounded-2xl bg-[#F8F7FC] p-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C6CFF] text-white font-bold">
                                            {selectedChild.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-[#303044]">
                                                {
                                                    selectedChild.name
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-[#9999AA]">
                                                {selectedChild.age
                                                    ? `${selectedChild.age} years old`
                                                    : "Age not provided"}
                                            </p>
                                        </div>

                                    </div>

                                </div>


                                {/* GENERATE */}

                                <button
                                    type="button"
                                    onClick={
                                        generateGame
                                    }
                                    disabled={
                                        generating
                                    }
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7C6CFF] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(124,108,255,0.2)] hover:bg-[#6E60EA] disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {generating ? (
                                        <>
                                            <RefreshCw
                                                size={17}
                                                className="animate-spin"
                                            />
                                            AI is analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles
                                                size={17}
                                            />
                                            Analyze & Generate Game
                                        </>
                                    )}

                                </button>
                            </>
                        )}

                    </aside>


                    {/* RIGHT */}

                    <main className="rounded-[24px] border border-[#ECEBF2] bg-white p-6 shadow-sm">

                        {!selectedChild &&
                            !generating && (
                                <EmptyState />
                            )}


                        {selectedChild &&
                            !generated &&
                            !generating && (
                                <ReadyState
                                    child={
                                        selectedChild
                                    }
                                    onGenerate={
                                        generateGame
                                    }
                                />
                            )}


                        {generating && (
                            <LoadingState
                                child={
                                    selectedChild
                                }
                            />
                        )}


                        {generated &&
                            !generating && (
                                <GeneratedGame
                                    data={
                                        generated
                                    }
                                    child={
                                        selectedChild
                                    }
                                    onOpenBuilder={
                                        openBuilder
                                    }
                                    onRegenerate={
                                        generateGame
                                    }
                                    generating={
                                        generating
                                    }
                                />
                            )}

                    </main>

                </div>

            </div>
        </div>
    );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
    return (
        <div className="flex min-h-[600px] flex-col items-center justify-center text-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#F1EDFF]">
                <Brain
                    size={36}
                    className="text-[#7C6CFF]"
                />
            </div>

            <h2 className="mt-6 text-xl font-bold text-[#303044]">
                Personalized AI Games
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-[#8B8B99]">
                Select a child to analyze their assessment
                results and generate a complete game draft
                for the Game Builder.
            </p>

        </div>
    );
}


/* =========================================================
   READY STATE
========================================================= */

function ReadyState({
    child,
    onGenerate,
}) {
    const metrics =
        child?.results || {};

    return (
        <div>

            <div className="mb-6">
                <p className="text-sm font-semibold text-[#7C6CFF]">
                    READY
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#303044]">
                    Analyze {child.name}
                </h2>

                <p className="mt-2 text-sm text-[#858594]">
                    Gemini will analyze the available
                    assessment profile and create a
                    personalized game.
                </p>
            </div>


            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                <Metric
                    icon={
                        <Target size={17} />
                    }
                    label="Attention"
                    value={
                        `${metrics.attention || 0}%`
                    }
                />

                <Metric
                    icon={
                        <Brain size={17} />
                    }
                    label="Working Memory"
                    value={
                        `${metrics.workingMemory || 0}%`
                    }
                />

                <Metric
                    icon={
                        <Activity size={17} />
                    }
                    label="Executive"
                    value={
                        `${metrics.executiveFunctions || 0}%`
                    }
                />

                <Metric
                    icon={
                        <CheckCircle2 size={17} />
                    }
                    label="Accuracy"
                    value={
                        `${metrics.accuracy || 0}%`
                    }
                />

                <Metric
                    icon={
                        <AlertCircle size={17} />
                    }
                    label="Errors"
                    value={
                        metrics.errors || 0
                    }
                />

                <Metric
                    icon={
                        <Clock3 size={17} />
                    }
                    label="Response Time"
                    value={
                        `${metrics.responseTime || 0}s`
                    }
                />

                <Metric
                    icon={
                        <Zap size={17} />
                    }
                    label="Impulsivity"
                    value={
                        `${metrics.impulsivity || 0}%`
                    }
                />

            </div>


            <button
                type="button"
                onClick={
                    onGenerate
                }
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7C6CFF] px-5 py-4 text-sm font-semibold text-white hover:bg-[#6E60EA]"
            >
                <Sparkles size={18} />
                Analyze & Generate Personalized Game
                <ArrowRight size={17} />
            </button>

        </div>
    );
}


/* =========================================================
   LOADING
========================================================= */

function LoadingState({
    child,
}) {
    return (
        <div className="flex min-h-[600px] flex-col items-center justify-center text-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#F1EDFF]">
                <Sparkles
                    size={36}
                    className="animate-pulse text-[#7C6CFF]"
                />
            </div>

            <h2 className="mt-6 text-xl font-bold text-[#303044]">
                AI is analyzing {child?.name}
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#90909D]">
                Gemini is analyzing the child's results
                and generating objects, rules, difficulty,
                timing and the target cognitive skill.
            </p>

            <div className="mt-7 flex items-center gap-2 text-sm font-medium text-[#7C6CFF]">
                <RefreshCw
                    size={17}
                    className="animate-spin"
                />
                Generating game configuration...
            </div>

        </div>
    );
}


/* =========================================================
   GENERATED GAME
========================================================= */

function GeneratedGame({
    data,
    child,
    onOpenBuilder,
    onRegenerate,
    generating,
}) {
    const game =
        data?.game || {};

    const objects =
        Array.isArray(
            game.objects
        )
            ? game.objects
            : [];

    const rules =
        Array.isArray(
            game.rules
        )
            ? game.rules
            : [];

    return (
        <div>

            {/* ANALYSIS */}

            <section className="mb-6 rounded-2xl bg-[#F8F7FC] p-5">

                <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7C6CFF] text-white">
                        <Sparkles size={22} />
                    </div>

                    <div className="min-w-0">

                        <p className="text-xs font-bold uppercase tracking-wider text-[#7C6CFF]">
                            AI Analysis
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-[#303044]">
                            {data.primarySkill ||
                                game.targetSkill}
                        </h2>

                        <p className="mt-1 text-sm text-[#9999AA]">
                            Personalized for{" "}
                            {child?.name}
                        </p>

                    </div>

                </div>


                <div className="mt-5 rounded-2xl border border-[#E6E1FF] bg-white p-4">

                    <p className="text-sm leading-7 text-[#555566]">
                        {data.analysis ||
                            game.analysis ||
                            "The AI generated this game based on the child's assessment results."}
                    </p>

                </div>


                {data.sourceReport && (
                    <div className="mt-4 rounded-2xl border border-[#E7E5F0] bg-white p-4">

                        <div className="flex items-center justify-between gap-3">

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9999AA]">
                                    Source Report
                                </p>

                                <p className="mt-1 text-sm font-semibold text-[#40404C]">
                                    Latest completed report — Session #{data.sourceReport.sessionId}
                                </p>
                            </div>

                            <span className="rounded-lg bg-[#EEE9FF] px-2.5 py-1 text-[10px] font-bold text-[#7062E8]">
                                {data.sourceReport.status}
                            </span>

                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">

                            {[
                                [
                                    "Score",
                                    data.sourceReport.score !== null &&
                                    data.sourceReport.score !== undefined
                                        ? `${Math.round(data.sourceReport.score)}%`
                                        : "—"
                                ],
                                [
                                    "Accuracy",
                                    data.sourceReport.averageAccuracy !== null &&
                                    data.sourceReport.averageAccuracy !== undefined
                                        ? `${Math.round(data.sourceReport.averageAccuracy)}%`
                                        : "—"
                                ],
                                [
                                    "Mistakes",
                                    data.sourceReport.totalMistakes ?? "—"
                                ],
                                [
                                    "Reaction",
                                    data.sourceReport.averageReactionTime !== null &&
                                    data.sourceReport.averageReactionTime !== undefined
                                        ? `${Number(data.sourceReport.averageReactionTime).toFixed(2)}s`
                                        : "—"
                                ],
                            ].map(
                                ([label, value]) => (
                                    <div
                                        key={label}
                                        className="rounded-xl bg-[#F8F7FC] p-3"
                                    >
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#A0A0AF]">
                                            {label}
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-[#303044]">
                                            {value}
                                        </p>
                                    </div>
                                )
                            )}

                        </div>

                    </div>
                )}


                {data.therapyPlan && (
                    <div className="mt-4 rounded-2xl border border-[#DDEFE8] bg-[#F5FBF8] p-4">

                        <div className="flex items-start gap-3">

                            <Target
                                size={18}
                                className="mt-0.5 shrink-0 text-[#4EAA83]"
                            />

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[#4EAA83]">
                                    Strengthening Plan
                                </p>

                                <p className="mt-2 text-sm leading-7 text-[#4C5A55]">
                                    {data.therapyPlan}
                                </p>
                            </div>

                        </div>

                    </div>
                )}


                {data.secondaryConcern && (
                    <div className="mt-4 flex items-center gap-2 text-sm">

                        <AlertCircle
                            size={16}
                            className="text-[#9999AA]"
                        />

                        <span className="text-[#9999AA]">
                            Secondary concern:
                        </span>

                        <span className="font-semibold text-[#40404C]">
                            {
                                data.secondaryConcern
                            }
                        </span>

                    </div>
                )}

            </section>


            {/* GAME */}

            <section className="rounded-2xl border border-[#E6E1FF] bg-[#FBFAFF] p-6">

                <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEE9FF]">
                        <Gamepad2
                            size={23}
                            className="text-[#7C6CFF]"
                        />
                    </div>

                    <div>

                        <span className="inline-flex rounded-lg bg-[#EEE9FF] px-2.5 py-1 text-[10px] font-bold text-[#7062E8]">
                            AI GENERATED GAME
                        </span>

                        <h2 className="mt-2 text-2xl font-bold text-[#303044]">
                            {game.gameName}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#777788]">
                            {game.gameDescription}
                        </p>

                    </div>

                </div>


                {/* SETTINGS */}

                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">

                    <Config
                        label="Domain"
                        value={
                            game.domain
                        }
                    />

                    <Config
                        label="Target Skill"
                        value={
                            game.targetSkill
                        }
                    />

                    <Config
                        label="Difficulty"
                        value={
                            game.difficulty
                        }
                    />

                    <Config
                        label="Levels"
                        value={
                            game.levels || 3
                        }
                    />

                    <Config
                        label="Time"
                        value={
                            `${game.timeLimit || 60}s`
                        }
                    />

                    <Config
                        label="Lives"
                        value={
                            game.lives || 3
                        }
                    />

                    <Config
                        label="Objects"
                        value={
                            objects.length
                        }
                    />

                    <Config
                        label="Rules"
                        value={
                            rules.length
                        }
                    />

                </div>


                {/* OBJECTS */}

                <div className="mt-6">

                    <div className="mb-3 flex items-center justify-between">

                        <h3 className="text-sm font-bold text-[#303044]">
                            Generated Objects
                        </h3>

                        <span className="text-xs text-[#9999AA]">
                            {objects.length} objects
                        </span>

                    </div>


                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                        {objects.map(
                            (
                                object,
                                index
                            ) => (
                                <div
                                    key={
                                        object.id ||
                                        index
                                    }
                                    className="rounded-2xl border border-[#ECEBF2] bg-white p-4"
                                >

                                    <div className="flex items-start gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEE9FF] text-sm font-bold text-[#7C6CFF]">
                                            {index + 1}
                                        </div>

                                        <div className="min-w-0">

                                            <p className="text-sm font-semibold text-[#303044]">
                                                {
                                                    object.name
                                                }
                                            </p>

                                            <p className="mt-1 text-[11px] text-[#7C6CFF]">
                                                {
                                                    object.aiType ||
                                                    object.type
                                                }
                                            </p>

                                            {object.aiDescription && (
                                                <p className="mt-2 text-xs leading-5 text-[#9999AA]">
                                                    {
                                                        object.aiDescription
                                                    }
                                                </p>
                                            )}

                                        </div>

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </div>


                {/* RULES */}

                <div className="mt-6">

                    <div className="mb-3 flex items-center justify-between">

                        <h3 className="text-sm font-bold text-[#303044]">
                            Generated Rules
                        </h3>

                        <span className="text-xs text-[#9999AA]">
                            {rules.length} rules
                        </span>

                    </div>


                    <div className="space-y-3">

                        {rules.map(
                            (
                                rule,
                                index
                            ) => (
                                <div
                                    key={
                                        rule.id ||
                                        index
                                    }
                                    className="rounded-2xl border border-[#ECEBF2] bg-white p-4"
                                >

                                    <div className="flex items-start gap-3">

                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1EDFF] text-xs font-bold text-[#7C6CFF]">
                                            {index + 1}
                                        </div>

                                        <div>

                                            <p className="text-sm font-semibold text-[#303044]">
                                                {
                                                    rule.description ||
                                                    `Rule ${index + 1}`
                                                }
                                            </p>

                                            {rule.aiTrigger && (
                                                <p className="mt-1 text-xs text-[#9999AA]">
                                                    <strong>
                                                        Trigger:
                                                    </strong>{" "}
                                                    {
                                                        rule.aiTrigger
                                                    }
                                                </p>
                                            )}

                                            {rule.aiAction && (
                                                <p className="mt-1 text-xs text-[#9999AA]">
                                                    <strong>
                                                        Action:
                                                    </strong>{" "}
                                                    {
                                                        rule.aiAction
                                                    }
                                                </p>
                                            )}

                                            {rule.value !== undefined && (
                                                <p className="mt-2 text-xs font-semibold text-[#7C6CFF]">
                                                    Points:{" "}
                                                    {
                                                        rule.value
                                                    }
                                                </p>
                                            )}

                                        </div>

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </div>


                {/* ACTIONS */}

                <div className="mt-6 border-t border-[#E9E7F3] pt-5">

                    <div className="flex flex-col gap-3 sm:flex-row">

                        <button
                            type="button"
                            onClick={
                                onOpenBuilder
                            }
                            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#7C6CFF] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#6E60EA]"
                        >
                            <Gamepad2
                                size={18}
                            />

                            Open Complete Game in Builder

                            <ArrowRight
                                size={17}
                            />
                        </button>


                        <button
                            type="button"
                            onClick={
                                onRegenerate
                            }
                            disabled={
                                generating
                            }
                            className="flex items-center justify-center gap-2 rounded-2xl border border-[#E4E2EB] bg-white px-5 py-3.5 text-sm font-semibold text-[#555566] hover:bg-[#FAFAFD] disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    generating
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Regenerate
                        </button>

                    </div>


                    <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#9999AA]">

                        <CheckCircle2
                            size={14}
                        />

                        Therapist reviews the AI-generated
                        game before saving or assigning it.

                    </p>

                </div>

            </section>

        </div>
    );
}


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Metric({
    icon,
    label,
    value,
}) {
    return (
        <div className="rounded-2xl border border-[#ECEBF2] bg-white p-4">

            <div className="flex items-center gap-2 text-[#9999AA]">
                {icon}

                <span className="text-[10px] font-bold uppercase tracking-wider">
                    {label}
                </span>
            </div>

            <p className="mt-2 text-lg font-bold text-[#303044]">
                {value}
            </p>

        </div>
    );
}


function Config({
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-[#ECEBF2] bg-white p-3">

            <p className="text-[10px] font-medium text-[#9999AA]">
                {label}
            </p>

            <p className="mt-1 text-sm font-bold text-[#40404C]">
                {value}
            </p>

        </div>
    );
}


function Loader() {
    return (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEE9FF]">
            <RefreshCw
                size={28}
                className="animate-spin text-[#7C6CFF]"
            />
        </div>
    );
}


export default AIAssistant;