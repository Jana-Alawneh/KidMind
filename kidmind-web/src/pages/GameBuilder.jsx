import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    useNavigate,
    useLocation
} from "react-router-dom";

import {
    assignGameBuilderGame,
    createGameBuilderGame,
    getGameBuilderAssignmentOptions,
    getGameBuilderAssignments,
    getGameBuilderGame,
    removeGameBuilderAssignment,
    updateGameBuilderGame
} from "../api/gameBuilderApi";

import {
    ArrowLeft,
    Save,
    Play,
    Plus,
    Trash2,
    Copy,
    Layers,
    Blocks,
    Square,
    Circle,
    Triangle,
    Star,
    Image as ImageIcon,
    Type,
    MousePointer2,
    X,
    GripVertical,
    Palette,
    Target,
    Eye,
    EyeOff,
    Move,
    Calculator,
    Clock,
    Check,
        Upload,
    ChevronDown,
    Link2
} from "lucide-react";


/* =========================================================
   ELEMENTS
========================================================= */

const ELEMENTS = [
    {
        id: "circle",
        name: "Circle",
        type: "shape",
        shape: "circle",
        color: "#7C6CFF"
    },
    {
        id: "square",
        name: "Square",
        type: "shape",
        shape: "square",
        color: "#63B3ED"
    },
    {
        id: "triangle",
        name: "Triangle",
        type: "shape",
        shape: "triangle",
        color: "#F5A623"
    },
    {
        id: "star",
        name: "Star",
        type: "shape",
        shape: "star",
        color: "#EF6A8A"
    },
    {
        id: "diamond",
        name: "Diamond",
        type: "shape",
        shape: "diamond",
        color: "#52C7A8"
    },
    {
        id: "card",
        name: "Card",
        type: "shape",
        shape: "card",
        color: "#9B8AFB"
    },
    {
        id: "button",
        name: "Button",
        type: "button",
        color: "#7C6CFF"
    },
    {
        id: "text",
        name: "Text",
        type: "text",
        color: "#555566"
    },
];


/* =========================================================
   TRIGGERS
========================================================= */

const TRIGGERS = [
    {
        id: "object-clicked",
        label: "Child clicks an object"
    },
    {
        id: "game-start",
        label: "Game starts"
    },
    {
        id: "timer-end",
        label: "Time ends"
    }
];


/* =========================================================
   ACTIONS
========================================================= */

const ACTIONS = [
    {
        id: "add-score",
        label: "Add Score",
        color: "#7C6CFF"
    },
    {
        id: "remove-score",
        label: "Remove Score",
        color: "#EF6A8A"
    },
    {
        id: "hide",
        label: "Hide Objects",
        color: "#F5A623"
    },
    {
        id: "show",
        label: "Show Objects",
        color: "#52C7A8"
    },
    {
        id: "move",
        label: "Move Objects",
        color: "#63B3ED"
    },
    {
        id: "wait",
        label: "Wait",
        color: "#9B8AFB"
    }
];


/* =========================================================
   LEVELS
========================================================= */

const LEVELS = {
    Easy: {
        time: 60,
        lives: 3,
        shuffle: false
    },

    Medium: {
        time: 45,
        lives: 3,
        shuffle: true
    },

    Hard: {
        time: 30,
        lives: 2,
        shuffle: true
    }
};


/* =========================================================
   HELPERS
========================================================= */

const makeId = (prefix = "item") => {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
};


const clamp = (value, min, max) => {
    return Math.min(
        Math.max(value, min),
        max
    );
};


const shuffleArray = (array) => {
    const result = [...array];

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {
        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];
    }

    return result;
};


const calculateAssessmentReport = (
    trials,
    score,
    configuredTime,
    remainingTime,
    gameTitle,
    difficulty
) => {

    const correct = trials.filter(
        (trial) => trial.result === "correct"
    ).length;

    const incorrect = trials.filter(
        (trial) => trial.result === "incorrect"
    ).length;

    const neutral = trials.filter(
        (trial) => trial.result === "neutral"
    ).length;

    const classified =
        correct + incorrect;

    const responseTimes = trials
        .map((trial) => Number(trial.responseTimeMs))
        .filter((value) => Number.isFinite(value) && value >= 0);

    const meanResponseTime = responseTimes.length
        ? responseTimes.reduce(
            (sum, value) => sum + value,
            0
        ) / responseTimes.length
        : 0;

    const sortedResponseTimes = [
        ...responseTimes
    ].sort((a, b) => a - b);

    const medianResponseTime =
        sortedResponseTimes.length
            ? sortedResponseTimes.length % 2 === 0
                ? (
                    sortedResponseTimes[
                        sortedResponseTimes.length / 2 - 1
                    ] +
                    sortedResponseTimes[
                        sortedResponseTimes.length / 2
                    ]
                ) / 2
                : sortedResponseTimes[
                    Math.floor(
                        sortedResponseTimes.length / 2
                    )
                ]
            : 0;

    const fastestResponseTime =
        sortedResponseTimes.length
            ? sortedResponseTimes[0]
            : 0;

    const slowestResponseTime =
        sortedResponseTimes.length
            ? sortedResponseTimes[
                sortedResponseTimes.length - 1
            ]
            : 0;

    const variance = responseTimes.length
        ? responseTimes.reduce(
            (sum, value) =>
                sum +
                Math.pow(
                    value - meanResponseTime,
                    2
                ),
            0
        ) / responseTimes.length
        : 0;

    const responseTimeStdDev = Math.sqrt(
        variance
    );

    const accuracy = classified
        ? (correct / classified) * 100
        : 0;

    const errorRate = classified
        ? (incorrect / classified) * 100
        : 0;

    const elapsedSeconds = Math.max(
        0,
        Number(configuredTime || 0) -
        Number(remainingTime || 0)
    );

    return {
        id: makeId("assessment"),
        gameTitle,
        difficulty,
        completedAt: new Date().toISOString(),
        totalResponses: trials.length,
        correct,
        incorrect,
        neutral,
        classifiedResponses: classified,
        accuracy: Number(accuracy.toFixed(2)),
        errorRate: Number(errorRate.toFixed(2)),
        score: Number(score || 0),
        elapsedSeconds: Number(elapsedSeconds.toFixed(2)),
        meanResponseTimeMs: Number(meanResponseTime.toFixed(2)),
        medianResponseTimeMs: Number(medianResponseTime.toFixed(2)),
        fastestResponseTimeMs: Number(fastestResponseTime.toFixed(2)),
        slowestResponseTimeMs: Number(slowestResponseTime.toFixed(2)),
        responseTimeStdDevMs: Number(responseTimeStdDev.toFixed(2)),
        trials: trials.map((trial, index) => ({
            ...trial,
            trialNumber: index + 1
        }))
    };
};


/* =========================================================
   DEFAULT OBJECT
========================================================= */

const createObjectFromElement = (
    element,
    index,
    canvasWidth = 900,
    canvasHeight = 650
) => {

    const base = {
        id: makeId("object"),
        type: element.type,
        elementId: element.id,
        name: `${element.name} ${index + 1}`,
        x:
            100 +
            (index % 4) * 180,
        y:
            130 +
            Math.floor(index / 4) * 150,
        width:
            element.id === "text"
                ? 150
                : 100,
        height:
            element.id === "text"
                ? 50
                : 100,
        color:
            element.color ||
            "#7C6CFF",
        text:
            element.id === "button"
                ? "Click Me"
                : element.id === "text"
                    ? "Your Text"
                    : "",
        shape:
            element.shape ||
            null,
        image:
            null,
        visible: true,
        rotation: 0
    };

    base.x = clamp(
        base.x,
        10,
        canvasWidth -
            base.width -
            10
    );

    base.y = clamp(
        base.y,
        60,
        canvasHeight -
            base.height -
            10
    );

    return base;
};


/* =========================================================
   DEFAULT RULE
========================================================= */

const createRule = () => ({
    id: makeId("rule"),

    trigger: "object-clicked",

    triggerTargetId: "",

    action: "add-score",

    targetIds: [],

    value: 10,

    wait: 1,

    moveX: 30,

    moveY: 0,

    enabled: true
});

/* =========================================================
   AI GENERATED GAME HELPERS
========================================================= */

const createAIGame = (config) => {
    const report = config?.latestReport || {};
    const accuracy = Number(report.accuracy || 0);
    const errorRate = Number(report.errorRate || 0);
    const meanRT = Number(report.meanResponseTimeMs || 0);
    const title = String(report.gameTitle || "").toLowerCase();

    const domain =
        title.includes("memory")
            ? "memory"
            : title.includes("focus") ||
              title.includes("attention")
                ? "attention"
                : title.includes("reading")
                    ? "reading"
                    : title.includes("puzzle") ||
                      title.includes("sequence")
                        ? "executive"
                        : accuracy < 65 || errorRate > 25
                            ? "attention"
                            : "executive";

    const severity =
        accuracy < 50 || errorRate >= 40 || meanRT >= 5000
            ? "Hard"
            : accuracy < 75 || errorRate >= 20 || meanRT >= 3000
                ? "Medium"
                : "Easy";

    const difficulty = config.difficulty || severity;

    const time =
        Number(config.timeLimit) ||
        (difficulty === "Hard"
            ? 30
            : difficulty === "Medium"
                ? 45
                : 60);

    const lives =
        Number(config.lives) ||
        (difficulty === "Hard" ? 2 : 3);

    const now = Date.now();

    const makeObject = ({
        name,
        shape,
        color,
        x,
        y,
        role,
        width = 90,
        height = 90,
        text = ""
    }) => ({
        id: `ai-${now}-${Math.random().toString(36).slice(2, 7)}`,
        type: shape === "text" ? "text" : "shape",
        elementId: shape,
        name,
        x,
        y,
        width,
        height,
        color,
        text,
        shape: shape === "text" ? null : shape,
        image: null,
        visible: true,
        rotation: 0,
        aiGenerated: true,
        role
    });

    let objects = [];
    let rules = [];
    let gameName = "";
    let description = "";
    let targetSkill = "";
    let gameType = "";

    if (domain === "memory") {
        gameType = "Memory";
        targetSkill = "Working Memory";
        gameName = `${config.childName || "Child"} — Memory Sequence`;
        description =
            `AI-generated memory activity based on the child's latest assessment (${accuracy}% accuracy, ${errorRate}% error rate). The child matches or recalls visual items while the task gradually increases in difficulty.`;

        const colors = [
            "#7C6CFF",
            "#63B3ED",
            "#F5A623",
            "#EF6A8A",
            "#52C7A8",
            "#9B8AFB"
        ];

        objects = Array.from({ length: 6 }, (_, i) =>
            makeObject({
                name: `Memory Card ${i + 1}`,
                shape: "card",
                color: colors[i],
                x: 110 + (i % 3) * 220,
                y: 130 + Math.floor(i / 3) * 190,
                role: "memory-card",
                width: 130,
                height: 130
            })
        );

        rules = objects.map((object, i) => ({
            id: `ai-rule-${now}-${i}`,
            trigger: "object-clicked",
            triggerTargetId: object.id,
            action: "add-score",
            targetIds: [object.id],
            value: 5,
            wait: 0,
            moveX: 0,
            moveY: 0,
            enabled: true,
            aiGenerated: true,
            description: "Correct memory response adds points."
        }));
    } else if (domain === "reading") {
        gameType = "Sequence";
        targetSkill = "Reading / Sequencing";
        gameName = `${config.childName || "Child"} — Reading Sequence`;
        description =
            `AI-generated sequencing activity based on the child's latest assessment. The child selects visual steps in the correct order.`;

        const shapes = [
            ["circle", "#7C6CFF"],
            ["square", "#63B3ED"],
            ["triangle", "#F5A623"],
            ["star", "#EF6A8A"]
        ];

        objects = shapes.map(([shape, color], i) =>
            makeObject({
                name: `Sequence Step ${i + 1}`,
                shape,
                color,
                x: 90 + i * 190,
                y: 250,
                role: "sequence-item",
                text: String(i + 1)
            })
        );

        rules = objects.map((object, i) => ({
            id: `ai-rule-${now}-${i}`,
            trigger: "object-clicked",
            triggerTargetId: object.id,
            action: "add-score",
            targetIds: [object.id],
            value: i === 0 ? 10 : 5,
            wait: 0,
            moveX: 0,
            moveY: 0,
            enabled: true,
            aiGenerated: true,
            description: `Sequence step ${i + 1}.`
        }));
    } else if (domain === "executive") {
        gameType = "Sequence";
        targetSkill = "Executive Functions";
        gameName = `${config.childName || "Child"} — Planning Challenge`;
        description =
            `AI-generated planning and sequencing activity tailored to the child's latest performance. The child follows an ordered visual sequence and receives immediate scoring feedback.`;

        const shapes = [
            ["circle", "#7C6CFF"],
            ["square", "#63B3ED"],
            ["triangle", "#F5A623"],
            ["diamond", "#52C7A8"]
        ];

        objects = shapes.map(([shape, color], i) =>
            makeObject({
                name: `Plan Step ${i + 1}`,
                shape,
                color,
                x: 120 + i * 180,
                y: 240,
                role: "planning-step",
                text: String(i + 1)
            })
        );

        rules = objects.map((object, i) => ({
            id: `ai-rule-${now}-${i}`,
            trigger: "object-clicked",
            triggerTargetId: object.id,
            action: "add-score",
            targetIds: [object.id],
            value: 10,
            wait: 0,
            moveX: 0,
            moveY: 0,
            enabled: true,
            aiGenerated: true,
            description: `Correct planning step ${i + 1}.`
        }));
    } else {
        gameType = "Attention";
        targetSkill = "Visual Attention";
        gameName = `${config.childName || "Child"} — Focus Finder`;
        description =
            `AI-generated visual attention activity tailored to the child's latest assessment (${accuracy}% accuracy, ${errorRate}% error rate, average response time ${meanRT ? Math.round(meanRT) : "N/A"}ms). Find the target while ignoring distractors.`;

        const target = makeObject({
            name: "Target",
            shape: accuracy < 55 ? "star" : "circle",
            color: "#7C6CFF",
            x: 390,
            y: 245,
            role: "target",
            width: 100,
            height: 100
        });

        const distractorData = [
            ["square", "#63B3ED", 100, 120],
            ["triangle", "#F5A623", 270, 100],
            ["star", "#EF6A8A", 560, 120],
            ["diamond", "#52C7A8", 160, 390],
            ["square", "#9B8AFB", 600, 380]
        ];

        const distractors = distractorData.map(
            ([shape, color, x, y], i) =>
                makeObject({
                    name: `Distractor ${i + 1}`,
                    shape,
                    color,
                    x,
                    y,
                    role: "distractor"
                })
        );

        objects = [target, ...distractors];

        rules = [
            {
                id: `ai-correct-${now}`,
                trigger: "object-clicked",
                triggerTargetId: target.id,
                action: "add-score",
                targetIds: [target.id],
                value: accuracy < 60 ? 10 : 8,
                wait: 0,
                moveX: 0,
                moveY: 0,
                enabled: true,
                aiGenerated: true,
                description: "Correct target adds score."
            },
            {
                id: `ai-hide-${now}`,
                trigger: "object-clicked",
                triggerTargetId: target.id,
                action: "hide",
                targetIds: [target.id],
                value: 0,
                wait: 0,
                moveX: 0,
                moveY: 0,
                enabled: true,
                aiGenerated: true,
                description: "Hide the target after a correct response."
            },
            ...distractors.map((object, i) => ({
                id: `ai-wrong-${now}-${i}`,
                trigger: "object-clicked",
                triggerTargetId: object.id,
                action: "remove-score",
                targetIds: [],
                value: 2,
                wait: 0,
                moveX: 0,
                moveY: 0,
                enabled: true,
                aiGenerated: true,
                description: "Distractor click reduces score."
            }))
        ];
    }

    return {
        ...config,
        gameName,
        gameDescription: description,
        gameType,
        targetSkill,
        difficulty,
        timeLimit: time,
        lives,
        levels: difficulty === "Hard" ? 3 : 3,
        objects,
        rules,
        analysis: config.analysis || "",
        generatedAt: new Date().toISOString()
    };
};



/* =========================================================
   SHAPE RENDERER
========================================================= */

const ShapeRenderer = ({
    object
}) => {

    const color =
        object.color ||
        "#7C6CFF";


    if (
        object.shape ===
        "circle"
    ) {

        return (
            <div
                className="
                    w-full
                    h-full
                    rounded-full
                "
                style={{
                    backgroundColor:
                        color
                }}
            />
        );

    }


    if (
        object.shape ===
        "square"
    ) {

        return (
            <div
                className="
                    w-full
                    h-full
                    rounded-2xl
                "
                style={{
                    backgroundColor:
                        color
                }}
            />
        );

    }


    if (
        object.shape ===
        "triangle"
    ) {

        return (
            <div
                className="
                    w-0
                    h-0
                "
                style={{
                    borderLeft:
                        `${object.width / 2}px solid transparent`,
                    borderRight:
                        `${object.width / 2}px solid transparent`,
                    borderBottom:
                        `${object.height}px solid ${color}`
                }}
            />
        );

    }


    if (
        object.shape ===
        "star"
    ) {

        return (
            <div
                className="
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                "
                style={{
                    color
                }}
            >
                <Star
                    size="100%"
                    fill="currentColor"
                    strokeWidth={1}
                />
            </div>
        );

    }


    if (
        object.shape ===
        "diamond"
    ) {

        return (
            <div
                className="
                    w-[70%]
                    h-[70%]
                    rotate-45
                    rounded-xl
                "
                style={{
                    backgroundColor:
                        color
                }}
            />
        );

    }


    if (
        object.shape ===
        "card"
    ) {

        return (
            <div
                className="
                    w-full
                    h-full
                    rounded-2xl
                    border-4
                    bg-white
                    flex
                    items-center
                    justify-center
                "
                style={{
                    borderColor:
                        color
                }}
            >
                <div
                    className="
                        w-8
                        h-8
                        rounded-full
                    "
                    style={{
                        backgroundColor:
                            `${color}22`
                    }}
                />
            </div>
        );

    }


    return (
        <div
            className="
                w-full
                h-full
                rounded-2xl
            "
            style={{
                backgroundColor:
                    color
            }}
        />
    );
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

const GameBuilder = () => {

    const navigate =
        useNavigate();

    const location =
        useLocation();


    /* =====================================================
       GAME INFORMATION
    ===================================================== */

    const [gameName, setGameName] =
        useState(
            "My Therapeutic Game"
        );

    const [gameDescription, setGameDescription] =
        useState(
            "Custom cognitive assessment game."
        );


    const [gameSettings, setGameSettings] =
        useState({
            difficulty: "Easy",
            time: 60,
            lives: 3,
            scoreEnabled: true
        });


    /* =====================================================
       OBJECTS
    ===================================================== */

    const [objects, setObjects] =
        useState([]);


    const [selectedObject, setSelectedObject] =
        useState(null);


    /* =====================================================
       RULES
    ===================================================== */

    const [rules, setRules] =
        useState([]);


    const [selectedRule, setSelectedRule] =
        useState(null);


    /* =====================================================
       UI
    ===================================================== */

    const [activeTab, setActiveTab] =
        useState("objects");

    const [showSettings, setShowSettings] =
        useState(false);

    const [showPreview, setShowPreview] =
        useState(false);

    const [savedMessage, setSavedMessage] =
        useState("");

    const [saveError, setSaveError] =
        useState("");

    const [savingGame, setSavingGame] =
        useState(false);

    const [loadingGame, setLoadingGame] =
        useState(false);

    const [gameMeta, setGameMeta] =
        useState({
            isAiGenerated: false,
            aiChildId: null,
            aiChildName: null,
            aiTargetSkill: null,
            aiAnalysis: ""
        });

            const [currentGameId, setCurrentGameId] =
        useState(null);

    const [showAssignModal, setShowAssignModal] =
        useState(false);

    const [assignmentLoading, setAssignmentLoading] =
        useState(false);

    const [assignmentSaving, setAssignmentSaving] =
        useState(false);

    const [assignmentError, setAssignmentError] =
        useState("");

    const [assignmentMessage, setAssignmentMessage] =
        useState("");

    const [assignmentType, setAssignmentType] =
        useState("child");

    const [assignmentChildId, setAssignmentChildId] =
        useState("");

    const [assignmentSessionId, setAssignmentSessionId] =
        useState("");

    const [assignmentOptions, setAssignmentOptions] =
        useState({
            children: [],
            sessions: []
        });

    const [gameAssignments, setGameAssignments] =
        useState([]);


    const filteredAssignmentSessions =
        useMemo(
            () => {

                if (!assignmentChildId) {
                    return [];
                }

                return (
                    assignmentOptions.sessions ||
                    []
                ).filter(
                    (session) =>
                        Number(
                            session.child_id
                        ) ===
                        Number(
                            assignmentChildId
                        )
                );

            },
            [
                assignmentOptions.sessions,
                assignmentChildId
            ]
        );

    /* =====================================================
       DRAGGING
    ===================================================== */

    const canvasRef =
        useRef(null);

    const dragRef =
        useRef(null);


    /* =====================================================
       PREVIEW STATE
    ===================================================== */

    const [previewObjects, setPreviewObjects] =
        useState([]);

    const [previewScore, setPreviewScore] =
        useState(0);

    const [previewLives, setPreviewLives] =
        useState(3);

    const [previewTime, setPreviewTime] =
        useState(60);


    const [previewTrials, setPreviewTrials] =
        useState([]);


    const [showReport, setShowReport] =
        useState(false);


    const [assessmentReport, setAssessmentReport] =
        useState(null);


    const previewStartRef =
        useRef(null);

    const previewTrialStartRef =
        useRef(null);

    const previewTrialsRef =
        useRef([]);

    const previewScoreRef =
        useRef(0);

    const previewTimeRef =
        useRef(0);

    const reportFinishedRef =
        useRef(false);


    /* =====================================================
       LOAD GAME IF EDITING
    ===================================================== */

    useEffect(() => {

        const params =
            new URLSearchParams(
                location.search
            );

        const editId =
            params.get("edit");


        if (!editId) {
            return;
        }


        let active = true;


        const loadGame =
            async () => {

                try {

                    setLoadingGame(true);
                    setSaveError("");


                    const game =
                        await getGameBuilderGame(
                            editId
                        );


                                        if (!active) {
                        return;
                    }


                    setCurrentGameId(
                        Number(
                            game.id ||
                            editId
                        ) || null
                    );


                    setGameName(
                        game.title ||
                        "My Therapeutic Game"
                    );


                    setGameDescription(
                        game.description ||
                        "Custom cognitive assessment game."
                    );


                    setGameSettings({
                        difficulty:
                            game.difficulty ||
                            "Easy",
                        time:
                            Number(
                                game.time_seconds
                            ) || 60,
                        lives:
                            Number(
                                game.lives
                            ) || 3,
                        scoreEnabled:
                            Boolean(
                                game.score_enabled
                            )
                    });


                    setObjects(
                        Array.isArray(
                            game.objects
                        )
                            ? game.objects
                            : []
                    );


                    setRules(
                        Array.isArray(
                            game.rules
                        )
                            ? game.rules
                            : []
                    );


                    setGameMeta({
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
                        aiAnalysis:
                            game.ai_analysis ||
                            ""
                    });

                } catch (error) {

                    console.error(
                        "Could not load game:",
                        error
                    );


                    if (active) {

                        setSaveError(
                            error?.response?.data?.message ||
                            "Could not load the game."
                        );

                    }

                } finally {

                    if (active) {
                        setLoadingGame(false);
                    }

                }

            };


        loadGame();


        return () => {
            active = false;
        };

    }, [location.search]);


    /* =====================================================
       APPLY AI GENERATED GAME
    ===================================================== */

    useEffect(() => {

        const aiConfig =
            location.state?.gameConfig;

        const fromAI =
            location.state?.fromAI;

        const params =
            new URLSearchParams(
                location.search
            );

        const aiTest =
            params.get("aiTest") === "1";

        const editId =
            params.get("edit");

        if (editId || (!fromAI && !aiTest)) {
            return;
        }

        const testConfig = aiTest
            ? {
                childName: "Test Child",
                difficulty: "Easy",
                timeLimit: 60,
                lives: 3,
                latestReport: {
                    gameTitle: "Focus Finder",
                    accuracy: 52,
                    errorRate: 38,
                    meanResponseTimeMs: 4200
                },
                analysis: "Test configuration for verifying AI-to-GameBuilder mapping before connecting the real AI and database."
            }
            : aiConfig;

        if (!testConfig) {
            return;
        }

        const generated =
            Array.isArray(testConfig.objects) &&
            Array.isArray(testConfig.rules)
                ? testConfig
                : createAIGame(testConfig);

        const difficulty =
            ["Easy", "Medium", "Hard"].includes(
                generated.difficulty
            )
                ? generated.difficulty
                : "Easy";

        setGameName(
            generated.gameName ||
            "AI Recommended Therapeutic Game"
        );

        setGameDescription(
            generated.gameDescription ||
            generated.description ||
            `AI-generated ${generated.gameType || "cognitive"} activity.`
        );

        setGameSettings({
            difficulty,
            time:
                Number(generated.timeLimit) > 0
                    ? Number(generated.timeLimit)
                    : LEVELS[difficulty].time,
            lives:
                Number(generated.lives) > 0
                    ? Number(generated.lives)
                    : LEVELS[difficulty].lives,
            scoreEnabled: true
        });

        setObjects(
            Array.isArray(generated.objects)
                ? generated.objects
                : []
        );

        setRules(
            Array.isArray(generated.rules)
                ? generated.rules
                : []
        );

        setGameMeta({
            isAiGenerated: true,
            aiChildId:
                generated.childId ||
                testConfig.childId ||
                null,
            aiChildName:
                generated.childName ||
                testConfig.childName ||
                null,
            aiTargetSkill:
                generated.targetSkill ||
                testConfig.targetSkill ||
                null,
            aiAnalysis:
                generated.analysis ||
                testConfig.analysis ||
                ""
        });

        setSelectedObject(
            generated.objects?.[0]?.id || null
        );

        setSelectedRule(
            generated.rules?.[0]?.id || null
        );

        setActiveTab("objects");

        setSavedMessage(
            `AI created a complete ${generated.gameType || "cognitive"} game for ${generated.childName || "the selected child"}. Review it before saving.`
        );

        /*
         * Replace the state so refreshing the builder does not
         * regenerate another game from stale navigation state.
         */
        window.history.replaceState(
            {
                ...window.history.state,
                usr: {
                    ...(window.history.state?.usr || {}),
                    fromAI: false,
                    gameConfig: null
                }
            },
            "",
            window.location.href
        );

    }, [location.state, location.search]);


    /* =====================================================
       SELECTED OBJECT
    ===================================================== */

    const selectedObjectData =
        useMemo(
            () =>
                objects.find(
                    (object) =>
                        object.id ===
                        selectedObject
                ) || null,
            [
                objects,
                selectedObject
            ]
        );


    /* =====================================================
       SELECTED RULE
    ===================================================== */

    const selectedRuleData =
        useMemo(
            () =>
                rules.find(
                    (rule) =>
                        rule.id ===
                        selectedRule
                ) || null,
            [
                rules,
                selectedRule
            ]
        );


    /* =====================================================
       ADD ELEMENT
    ===================================================== */

    const addElement = (
        element
    ) => {

        const newObject =
            createObjectFromElement(
                element,
                objects.length
            );


        setObjects(
            (previous) => [
                ...previous,
                newObject
            ]
        );


        setSelectedObject(
            newObject.id
        );

        setSelectedRule(
            null
        );

        setActiveTab(
            "objects"
        );
    };


    /* =====================================================
       ADD IMAGE
    ===================================================== */

    const addImageFromFile = (
        event
    ) => {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please select an image file."
            );

            return;
        }


        const reader =
            new FileReader();


        reader.onload = () => {

            const imageElement = {
                id: "image",
                name: "Picture",
                type: "image",
                color: "#63B3ED"
            };

            const newObject =
                createObjectFromElement(
                    imageElement,
                    objects.length
                );


            newObject.image =
                reader.result;


            newObject.name =
                file.name
                    .replace(
                        /\.[^/.]+$/,
                        ""
                    )
                    .slice(
                        0,
                        30
                    );


            newObject.width =
                140;

            newObject.height =
                110;


            setObjects(
                (previous) => [
                    ...previous,
                    newObject
                ]
            );


            setSelectedObject(
                newObject.id
            );

            setSelectedRule(
                null
            );

            setActiveTab(
                "objects"
            );

        };


        reader.readAsDataURL(
            file
        );


        event.target.value =
            "";
    };


    /* =====================================================
       UPDATE OBJECT
    ===================================================== */

    const updateObject = (
        objectId,
        field,
        value
    ) => {

        setObjects(
            (previous) =>
                previous.map(
                    (object) =>
                        object.id ===
                        objectId
                            ? {
                                ...object,
                                [field]:
                                    value
                            }
                            : object
                )
        );

    };


    /* =====================================================
       DELETE OBJECT
    ===================================================== */

    const deleteObject = () => {

        if (!selectedObject) {
            return;
        }


        const deletedId =
            selectedObject;


        setObjects(
            (previous) =>
                previous.filter(
                    (object) =>
                        object.id !==
                        deletedId
                )
        );


        setRules(
            (previous) =>
                previous.map(
                    (rule) => ({
                        ...rule,

                        triggerTargetId:
                            rule.triggerTargetId ===
                            deletedId
                                ? ""
                                : rule.triggerTargetId,

                        targetIds:
                            Array.isArray(
                                rule.targetIds
                            )
                                ? rule.targetIds.filter(
                                    (id) =>
                                        id !==
                                        deletedId
                                )
                                : []
                    })
                )
        );


        setSelectedObject(
            null
        );

    };


    /* =====================================================
       DUPLICATE OBJECT
    ===================================================== */

    const duplicateObject = () => {

        if (!selectedObjectData) {
            return;
        }


        const duplicate = {
            ...selectedObjectData,

            id:
                makeId(
                    "object"
                ),

            name:
                `${selectedObjectData.name} Copy`,

            x:
                selectedObjectData.x +
                30,

            y:
                selectedObjectData.y +
                30
        };


        setObjects(
            (previous) => [
                ...previous,
                duplicate
            ]
        );


        setSelectedObject(
            duplicate.id
        );

    };


    /* =====================================================
       ADD RULE
    ===================================================== */

    const addRule = (
        action = "add-score"
    ) => {

        const rule =
            createRule();


        rule.action =
            action;


        if (
            action ===
            "hide" ||
            action ===
            "show" ||
            action ===
            "move"
        ) {

            rule.targetIds =
                objects.length
                    ? [
                        objects[0].id
                    ]
                    : [];

        }


        if (
            action ===
            "object-clicked" &&
            objects.length
        ) {

            rule.triggerTargetId =
                objects[0].id;

        }


        setRules(
            (previous) => [
                ...previous,
                rule
            ]
        );


        setSelectedRule(
            rule.id
        );


        setSelectedObject(
            null
        );


        setActiveTab(
            "logic"
        );

    };


    /* =====================================================
       UPDATE RULE
    ===================================================== */

    const updateRule = (
        ruleId,
        field,
        value
    ) => {

        setRules(
            (previous) =>
                previous.map(
                    (rule) =>
                        rule.id ===
                        ruleId
                            ? {
                                ...rule,
                                [field]:
                                    value
                            }
                            : rule
                )
        );

    };


    /* =====================================================
       DELETE RULE
    ===================================================== */

    const deleteRule = (
        ruleId
    ) => {

        setRules(
            (previous) =>
                previous.filter(
                    (rule) =>
                        rule.id !==
                        ruleId
                )
        );


        setSelectedRule(
            null
        );

    };


    /* =====================================================
       TOGGLE TARGET
    ===================================================== */

    const toggleTarget = (
        ruleId,
        objectId
    ) => {

        setRules(
            (previous) =>
                previous.map(
                    (rule) => {

                        if (
                            rule.id !==
                            ruleId
                        ) {
                            return rule;
                        }


                        const current =
                            Array.isArray(
                                rule.targetIds
                            )
                                ? rule.targetIds
                                : [];


                        const exists =
                            current.includes(
                                objectId
                            );


                        return {
                            ...rule,

                            targetIds:
                                exists
                                    ? current.filter(
                                        (id) =>
                                            id !==
                                            objectId
                                    )
                                    : [
                                        ...current,
                                        objectId
                                    ]
                        };

                    }
                )
        );

    };


    /* =====================================================
       SHUFFLE OBJECT POSITIONS
    ===================================================== */

    const shuffleObjectPositions = () => {

        if (
            objects.length ===
            0
        ) {
            return;
        }


        const positions =
            objects.map(
                (object) => ({
                    x: object.x,
                    y: object.y
                })
            );


        const shuffled =
            shuffleArray(
                positions
            );


        setObjects(
            (previous) =>
                previous.map(
                    (
                        object,
                        index
                    ) => ({
                        ...object,

                        x:
                            shuffled[
                                index
                            ].x,

                        y:
                            shuffled[
                                index
                            ].y
                    })
                )
        );

    };


    /* =====================================================
       LEVEL CHANGE
    ===================================================== */

    const handleDifficultyChange = (
        difficulty
    ) => {

        const config =
            LEVELS[
                difficulty
            ];


        setGameSettings(
            (previous) => ({
                ...previous,

                difficulty,

                time:
                    config.time,

                lives:
                    config.lives
            })
        );


        if (
            config.shuffle
        ) {

            setTimeout(
                () =>
                    shuffleObjectPositions(),
                0
            );

        }

    };


    /* =====================================================
       DRAG START
    ===================================================== */

    const handlePointerDown = (
        event,
        object
    ) => {

        if (
            event.button !==
            0
        ) {
            return;
        }


        const canvas =
            canvasRef.current;


        if (!canvas) {
            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        dragRef.current = {
            objectId:
                object.id,

            offsetX:
                event.clientX -
                rect.left -
                object.x,

            offsetY:
                event.clientY -
                rect.top -
                object.y
        };


        setSelectedObject(
            object.id
        );

        setSelectedRule(
            null
        );


        event.currentTarget.setPointerCapture?.(
            event.pointerId
        );

    };


    /* =====================================================
       DRAG MOVE
    ===================================================== */
const handlePointerMove = (event) => {

    const drag = dragRef.current;

    if (!drag) {
        return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
        return;
    }

    const rect = canvas.getBoundingClientRect();

    const objectId = drag.objectId;
    const offsetX = drag.offsetX;
    const offsetY = drag.offsetY;

    const newX =
        event.clientX -
        rect.left -
        offsetX;

    const newY =
        event.clientY -
        rect.top -
        offsetY;

    setObjects((previous) =>
        previous.map((object) => {

            if (object.id !== objectId) {
                return object;
            }

            return {
                ...object,

                x: clamp(
                    newX,
                    5,
                    Math.max(
                        5,
                        rect.width -
                        object.width -
                        5
                    )
                ),

                y: clamp(
                    newY,
                    50,
                    Math.max(
                        50,
                        rect.height -
                        object.height -
                        5
                    )
                )
            };

        })
    );
};
    /* =====================================================
       DRAG END
    ===================================================== */

    const handlePointerUp = () => {

        dragRef.current =
            null;

    };


    /* =====================================================
       RENDER OBJECT
    ===================================================== */

    const renderObject = (
        object
    ) => {

        if (
            object.type ===
            "image"
        ) {

            return object.image ? (
                <img
                    src={object.image}
                    alt=""
                    draggable={false}
                    className="
                        w-full
                        h-full
                        object-cover
                        rounded-2xl
                    "
                />
            ) : (
                <div
                    className="
                        w-full
                        h-full
                        rounded-2xl
                        bg-[#EAF7FF]
                        flex
                        items-center
                        justify-center
                    "
                >
                    <ImageIcon
                        size={30}
                        className="
                            text-[#63B3ED]
                        "
                    />
                </div>
            );

        }


        if (
            object.type ===
            "text"
        ) {

            return (
                <div
                    className="
                        w-full
                        h-full
                        rounded-xl
                        bg-white
                        border
                        border-[#E5E5EE]
                        flex
                        items-center
                        justify-center
                        px-3
                        text-center
                        font-bold
                        text-[#303044]
                    "
                >
                    {object.text}
                </div>
            );

        }


        if (
            object.type ===
            "button"
        ) {

            return (
                <div
                    className="
                        w-full
                        h-full
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        px-3
                        font-bold
                        text-white
                        shadow-sm
                    "
                    style={{
                        backgroundColor:
                            object.color
                    }}
                >
                    {object.text}
                </div>
            );

        }


        return (
            <ShapeRenderer
                object={object}
            />
        );

    };

    const persistGame = async (redirectAfterSave = false) => {
        setSaveError("");
        setSavedMessage("");

        if (!gameName.trim()) {
            setSaveError("Please enter a game name.");
            return null;
        }

        if (objects.length === 0) {
            setSaveError("Add at least one object before saving.");
            return null;
        }

        try {
            setSavingGame(true);

            const editId =
                new URLSearchParams(
                    location.search
                ).get("edit");

            const existingId =
                currentGameId ||
                (
                    editId
                        ? Number(editId)
                        : null
                );

            const payload = {
                title: gameName.trim(),
                description: gameDescription.trim(),
                domain: "Custom Cognitive Assessment",
                difficulty: gameSettings.difficulty,
                time_seconds: Number(gameSettings.time),
                lives: Number(gameSettings.lives),
                score_enabled: Boolean(gameSettings.scoreEnabled),
                color: "#F1EDFF",
                icon_name: "Puzzle",

                objects: objects.map(
                    (object) => ({
                        ...object
                    })
                ),

                rules: rules.map(
                    (rule) => ({
                        ...rule,
                        targetIds:
                            Array.isArray(
                                rule.targetIds
                            )
                                ? [
                                    ...rule.targetIds
                                ]
                                : []
                    })
                ),

                is_ai_generated:
                    Boolean(
                        gameMeta.isAiGenerated
                    ),

                ai_child_id:
                    gameMeta.aiChildId ||
                    null,

                ai_target_skill:
                    gameMeta.aiTargetSkill ||
                    null,

                ai_analysis:
                    gameMeta.aiAnalysis ||
                    "",

                status: "draft"
            };

            let result;

            if (existingId) {
                result =
                    await updateGameBuilderGame(
                        existingId,
                        payload
                    );
            } else {
                result =
                    await createGameBuilderGame(
                        payload
                    );
            }

            const savedGame =
                result?.game ||
                result;

            const savedId =
                Number(
                    savedGame?.id ||
                    existingId
                );

            if (
                !Number.isInteger(savedId) ||
                savedId <= 0
            ) {
                throw new Error(
                    "Invalid game ID returned by the server"
                );
            }

            setCurrentGameId(
                savedId
            );

            setSavedMessage(
                "Game saved successfully."
            );

            if (redirectAfterSave) {
                setTimeout(
                    () => {
                        navigate(
                            "/games"
                        );
                    },
                    700
                );
            }

            return savedId;

        } catch (error) {
            console.error(
                "Save game error:",
                error
            );

            setSaveError(
                error?.response?.data?.message ||
                error?.message ||
                "Could not save the game. Please try again."
            );

            return null;

        } finally {
            setSavingGame(false);
        }
    };


    const saveGame = async () => {
        await persistGame(true);
    };


    const loadAssignmentData = async (gameId) => {
        try {
            setAssignmentLoading(true);
            setAssignmentError("");

            const [
                options,
                assignments
            ] =
                await Promise.all([
                    getGameBuilderAssignmentOptions(
                        gameId
                    ),
                    getGameBuilderAssignments(
                        gameId
                    )
                ]);

            const children =
                Array.isArray(
                    options?.children
                )
                    ? options.children
                    : [];

            const sessions =
                Array.isArray(
                    options?.sessions
                )
                    ? options.sessions
                    : [];

            setAssignmentOptions({
                children,
                sessions
            });

            setGameAssignments(
                Array.isArray(
                    assignments
                )
                    ? assignments
                    : []
            );

            setAssignmentChildId(
                (previous) => {
                    const exists =
                        children.some(
                            (child) =>
                                Number(
                                    child.id
                                ) ===
                                Number(
                                    previous
                                )
                        );

                    if (exists) {
                        return previous;
                    }

                    return children[0]
                        ? String(
                            children[0].id
                        )
                        : "";
                }
            );

            setAssignmentSessionId("");

        } catch (error) {
            console.error(
                "Could not load assignment options:",
                error
            );

            setAssignmentError(
                error?.response?.data?.message ||
                "Could not load assignment options."
            );

        } finally {
            setAssignmentLoading(false);
        }
    };


    const openAssignGame = async () => {
        setAssignmentError("");
        setAssignmentMessage("");

        const gameId =
            await persistGame(false);

        if (!gameId) {
            return;
        }

        setShowAssignModal(true);

        await loadAssignmentData(
            gameId
        );
    };


    const closeAssignGame = () => {
        if (assignmentSaving) {
            return;
        }

        setShowAssignModal(false);
    };


    const handleAssignmentChildChange = (value) => {
        setAssignmentChildId(value);
        setAssignmentSessionId("");
        setAssignmentError("");
        setAssignmentMessage("");
    };


    const handleAssignmentTypeChange = (value) => {
        setAssignmentType(value);
        setAssignmentSessionId("");
        setAssignmentError("");
        setAssignmentMessage("");
    };


    const handleAssignGame = async () => {
        if (!currentGameId) {
            setAssignmentError(
                "Save the game before assigning it."
            );
            return;
        }

        const childId =
            Number(
                assignmentChildId
            );

        if (
            !Number.isInteger(childId) ||
            childId <= 0
        ) {
            setAssignmentError(
                "Please select a child."
            );
            return;
        }

        let sessionId = null;

        if (
            assignmentType ===
            "session"
        ) {
            sessionId =
                Number(
                    assignmentSessionId
                );

            if (
                !Number.isInteger(sessionId) ||
                sessionId <= 0
            ) {
                setAssignmentError(
                    "Please select a session."
                );
                return;
            }
        }

        try {
            setAssignmentSaving(true);
            setAssignmentError("");
            setAssignmentMessage("");

            const result =
                await assignGameBuilderGame(
                    currentGameId,
                    {
                        assignment_type:
                            assignmentType,

                        child_id:
                            childId,

                        session_id:
                            assignmentType ===
                                "session"
                                ? sessionId
                                : null
                    }
                );

            setAssignmentMessage(
                result?.message ||
                "Game assigned successfully."
            );

            setAssignmentSessionId("");

            const assignments =
                await getGameBuilderAssignments(
                    currentGameId
                );

            setGameAssignments(
                Array.isArray(
                    assignments
                )
                    ? assignments
                    : []
            );

        } catch (error) {
            console.error(
                "Assign game error:",
                error
            );

            setAssignmentError(
                error?.response?.data?.message ||
                "Could not assign the game."
            );

        } finally {
            setAssignmentSaving(false);
        }
    };


    const handleRemoveAssignment = async (assignmentId) => {
        if (!currentGameId) {
            return;
        }

        const confirmed =
            window.confirm(
                "Remove this game assignment?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setAssignmentSaving(true);
            setAssignmentError("");
            setAssignmentMessage("");

            await removeGameBuilderAssignment(
                currentGameId,
                assignmentId
            );

            setGameAssignments(
                (previous) =>
                    previous.filter(
                        (assignment) =>
                            Number(
                                assignment.id
                            ) !==
                            Number(
                                assignmentId
                            )
                    )
            );

            setAssignmentMessage(
                "Game assignment removed successfully."
            );

        } catch (error) {
            console.error(
                "Remove game assignment error:",
                error
            );

            setAssignmentError(
                error?.response?.data?.message ||
                "Could not remove the assignment."
            );

        } finally {
            setAssignmentSaving(false);
        }
    };
    
    const startPreview = () => {

        setShowReport(false);

        setAssessmentReport(null);

        reportFinishedRef.current = false;

        previewTrialsRef.current = [];

        previewScoreRef.current = 0;

        previewStartRef.current =
            performance.now();

        previewTrialStartRef.current =
            previewStartRef.current;

        previewTimeRef.current =
            Number(gameSettings.time || 0);

        setPreviewTrials([]);

        setPreviewObjects(
            objects.map(
                (object) => ({
                    ...object,
                    visible:
                        object.visible !==
                        false
                })
            )
        );

        setPreviewScore(0);

        setPreviewLives(
            gameSettings.lives
        );

        setPreviewTime(
            gameSettings.time
        );

        setShowPreview(true);
    };


    /* =====================================================
       PREVIEW CLICK
    ===================================================== */

    const handlePreviewObjectClick = (
        objectId
    ) => {

        if (reportFinishedRef.current) {
            return;
        }

        const object =
            previewObjects.find(
                (item) =>
                    item.id === objectId
            );

        if (!object) {
            return;
        }

        let newObjects =
            [...previewObjects];

        let newScore =
            previewScoreRef.current;

        const matchingRules =
            rules.filter(
                (rule) =>
                    rule.enabled !== false &&
                    rule.trigger ===
                        "object-clicked" &&
                    rule.triggerTargetId ===
                        objectId
            );

        let scoreDelta = 0;

        matchingRules.forEach(
            (rule) => {

                const targetIds =
                    Array.isArray(
                        rule.targetIds
                    )
                        ? rule.targetIds
                        : [];

                if (
                    rule.action ===
                    "add-score"
                ) {
                    if (
                        gameSettings.scoreEnabled
                    ) {
                        const value = Number(
                            rule.value || 0
                        );

                        newScore += value;
                        scoreDelta += value;
                    }
                }

                if (
                    rule.action ===
                    "remove-score"
                ) {
                    if (
                        gameSettings.scoreEnabled
                    ) {
                        const value = Number(
                            rule.value || 0
                        );

                        newScore -= value;
                        scoreDelta -= value;
                    }
                }

                if (
                    rule.action === "hide"
                ) {
                    newObjects =
                        newObjects.map(
                            (item) =>
                                targetIds.includes(
                                    item.id
                                )
                                    ? {
                                        ...item,
                                        visible: false
                                    }
                                    : item
                        );
                }

                if (
                    rule.action === "show"
                ) {
                    newObjects =
                        newObjects.map(
                            (item) =>
                                targetIds.includes(
                                    item.id
                                )
                                    ? {
                                        ...item,
                                        visible: true
                                    }
                                    : item
                        );
                }

                if (
                    rule.action === "move"
                ) {
                    newObjects =
                        newObjects.map(
                            (item) =>
                                targetIds.includes(
                                    item.id
                                )
                                    ? {
                                        ...item,
                                        x:
                                            item.x +
                                            Number(
                                                rule.moveX ||
                                                0
                                            ),
                                        y:
                                            item.y +
                                            Number(
                                                rule.moveY ||
                                                0
                                            )
                                    }
                                    : item
                        );
                }
            }
        );

        const now = performance.now();

        const responseTimeMs =
            previewTrialStartRef.current === null
                ? 0
                : now -
                  previewTrialStartRef.current;

        const result =
            scoreDelta > 0
                ? "correct"
                : scoreDelta < 0
                    ? "incorrect"
                    : "neutral";

        const trial = {
            id: makeId("trial"),
            objectId,
            objectName: object.name,
            result,
            scoreDelta,
            responseTimeMs: Number(
                Math.max(
                    0,
                    responseTimeMs
                ).toFixed(2)
            ),
            timestamp:
                new Date().toISOString()
        };

        const updatedTrials = [
            ...previewTrialsRef.current,
            trial
        ];

        previewTrialsRef.current =
            updatedTrials;

        previewScoreRef.current =
            newScore;

        previewTrialStartRef.current =
            now;

        setPreviewTrials(
            updatedTrials
        );

        setPreviewObjects(
            newObjects
        );

        setPreviewScore(
            newScore
        );
    };


    const finishPreview = () => {

        if (reportFinishedRef.current) {
            return;
        }

        reportFinishedRef.current = true;

        const baseReport =
            calculateAssessmentReport(
                previewTrialsRef.current,
                previewScoreRef.current,
                gameSettings.time,
                previewTimeRef.current,
                gameName,
                gameSettings.difficulty
            );

        const report = {
            ...baseReport,
            childId:
                location.state?.gameConfig?.childId ||
                null,
            childName:
                location.state?.gameConfig?.childName ||
                null,
            targetSkill:
                location.state?.gameConfig?.targetSkill ||
                null,
            sourceGameId:
                location.state?.gameConfig?.gameId ||
                null
        };

        try {
            const savedReports =
                JSON.parse(
                    localStorage.getItem(
                        "customAssessmentResults"
                    ) || "[]"
                );

            localStorage.setItem(
                "customAssessmentResults",
                JSON.stringify([
                    ...savedReports,
                    report
                ])
            );

            window.dispatchEvent(
                new Event(
                    "assessment-results-updated"
                )
            );
        } catch (error) {
            console.error(
                "Assessment result save error:",
                error
            );
        }

        setAssessmentReport(report);
        setShowPreview(false);
        setShowReport(true);
        previewStartRef.current = null;
        previewTrialStartRef.current = null;
    };


    /* =====================================================
       PREVIEW TIMER
    ===================================================== */

    useEffect(() => {

        if (!showPreview) {
            return;
        }

        const timer =
            setInterval(() => {

                setPreviewTime(
                    (previous) => {

                        if (previous <= 1) {

                            clearInterval(timer);

                            previewTimeRef.current = 0;

                            setTimeout(() => {
                                finishPreview();
                            }, 0);

                            return 0;
                        }

                        const next =
                            previous - 1;

                        previewTimeRef.current =
                            next;

                        return next;
                    }
                );
            }, 1000);

        return () =>
            clearInterval(timer);

    }, [showPreview]);


    /* =====================================================
       RESET PREVIEW
    ===================================================== */

    const resetPreview = () => {

        startPreview();

    };


    /* =====================================================
       TARGET LABELS
    ===================================================== */

    const getTargetNames = (
        ids
    ) => {

        if (
            !Array.isArray(ids) ||
            ids.length === 0
        ) {

            return "No target selected";

        }


        const names =
            ids
                .map(
                    (id) =>
                        objects.find(
                            (object) =>
                                object.id ===
                                id
                        )?.name
                )
                .filter(Boolean);


        return names.length
            ? names.join(
                ", "
            )
            : "No target selected";
    };


    /* =====================================================
       UI
    ===================================================== */

    return (
        <div
            className="
                min-h-screen
                bg-[#F7F8FC]
                flex
                flex-col
            "
        >

            {/* =================================================
               HEADER
            ================================================= */}

            <header
                className="
                    h-[72px]
                    bg-white
                    border-b
                    border-[#E8E8F0]
                    px-6
                    flex
                    items-center
                    justify-between
                    shrink-0
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-4
                    "
                >

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/games"
                            )
                        }
                        className="
                            w-10
                            h-10
                            rounded-xl
                            bg-[#F7F7FA]
                            flex
                            items-center
                            justify-center
                            text-[#66667A]
                            hover:bg-[#EEEEF5]
                        "
                    >
                        <ArrowLeft
                            size={17}
                        />
                    </button>


                    <div>

                        <input
                            value={
                                gameName
                            }
                            onChange={(
                                event
                            ) =>
                                setGameName(
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="
                                text-lg
                                font-bold
                                text-[#303044]
                                bg-transparent
                                outline-none
                                border-none
                                w-[280px]
                            "
                        />

                        <input
                            value={
                                gameDescription
                            }
                            onChange={(
                                event
                            ) =>
                                setGameDescription(
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="
                                block
                                mt-0.5
                                text-[11px]
                                text-[#9999AA]
                                bg-transparent
                                outline-none
                                border-none
                                w-[350px]
                            "
                        />

                    </div>

                </div>


                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    {savedMessage && (
                        <div
                            className="
                                px-3
                                py-2
                                rounded-xl
                                bg-[#EAF8F2]
                                text-[#3A9A74]
                                text-xs
                                font-semibold
                                flex
                                items-center
                                gap-1.5
                            "
                        >
                            <Check
                                size={14}
                            />
                            {savedMessage}
                        </div>
                    )}


                    {saveError && (
                        <div
                            className="
                                px-3
                                py-2
                                rounded-xl
                                bg-[#FFF0F3]
                                text-[#D85C70]
                                text-xs
                                font-semibold
                            "
                        >
                            {saveError}
                        </div>
                    )}


                    <button
                        type="button"
                        onClick={() =>
                            setShowSettings(
                                true
                            )
                        }
                        className="
                            h-10
                            px-4
                            rounded-xl
                            border
                            border-[#E4E4ED]
                            bg-white
                            text-xs
                            font-semibold
                            text-[#555566]
                        "
                    >
                        Settings
                    </button>


                    <button
                        type="button"
                        onClick={
                            startPreview
                        }
                        className="
                            h-10
                            px-4
                            rounded-xl
                            bg-[#F1EDFF]
                            text-[#7C6CFF]
                            text-xs
                            font-semibold
                            flex
                            items-center
                            gap-2
                        "
                    >
                        <Play
                            size={15}
                        />
                        Preview
                    </button>

                    <button
                        type="button"
                        onClick={
                            openAssignGame
                        }
                        disabled={
                            savingGame ||
                            loadingGame
                        }
                        className="
                            h-10
                            px-4
                            rounded-xl
                            border
                            border-[#DCD6FF]
                            bg-white
                            text-[#7566E8]
                            text-xs
                            font-semibold
                            flex
                            items-center
                            gap-2
                            hover:bg-[#F7F5FF]
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                    >
                        <Link2
                            size={15}
                        />
                        Assign Game
                    </button>

                    <button
                        type="button"
                        onClick={
                            saveGame
                        }
                        disabled={
                            savingGame ||
                            loadingGame
                        }
                        className="
                            h-10
                            px-5
                            rounded-xl
                            bg-[#7C6CFF]
                            text-white
                            text-xs
                            font-semibold
                            flex
                            items-center
                            gap-2
                            hover:bg-[#6F60F0]
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                    >
                        <Save
                            size={15}
                        />
                        {
                            savingGame
                                ? "Saving..."
                                : loadingGame
                                    ? "Loading..."
                                    : "Save Game"
                        }
                    </button>

                </div>

            </header>


            {/* =================================================
               MAIN
            ================================================= */}

            <div
                className="
                    flex
                    flex-1
                    min-h-0
                "
            >

                {/* =================================================
                   LEFT PANEL
                ================================================= */}

                <aside
                    className="
                        w-[280px]
                        bg-white
                        border-r
                        border-[#E8E8F0]
                        p-5
                        overflow-y-auto
                        shrink-0
                    "
                >

                    <div
                        className="
                            flex
                            p-1
                            rounded-xl
                            bg-[#F7F8FC]
                            mb-5
                        "
                    >

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab(
                                    "objects"
                                )
                            }
                            className={`
                                flex-1
                                h-9
                                rounded-lg
                                text-xs
                                font-semibold
                                flex
                                items-center
                                justify-center
                                gap-2
                                ${
                                    activeTab ===
                                    "objects"
                                        ? "bg-white text-[#7C6CFF] shadow-sm"
                                        : "text-[#888899]"
                                }
                            `}
                        >
                            <Layers
                                size={14}
                            />
                            Objects
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab(
                                    "logic"
                                )
                            }
                            className={`
                                flex-1
                                h-9
                                rounded-lg
                                text-xs
                                font-semibold
                                flex
                                items-center
                                justify-center
                                gap-2
                                ${
                                    activeTab ===
                                    "logic"
                                        ? "bg-white text-[#7C6CFF] shadow-sm"
                                        : "text-[#888899]"
                                }
                            `}
                        >
                            <Blocks
                                size={14}
                            />
                            Logic
                        </button>

                    </div>


                    {/* =================================================
                       OBJECTS TAB
                    ================================================= */}

                    {activeTab ===
                        "objects" && (
                        <>

                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-bold
                                        text-[#303044]
                                    "
                                >
                                    Elements
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-[#9999AA]
                                    "
                                >
                                    Add objects to your game
                                </p>


                                <div
                                    className="
                                        grid
                                        grid-cols-2
                                        gap-2
                                        mt-4
                                    "
                                >

                                    {ELEMENTS.map(
                                        (
                                            element
                                        ) => {

                                            let Icon =
                                                Square;


                                            if (
                                                element.id ===
                                                "circle"
                                            ) {
                                                Icon =
                                                    Circle;
                                            }

                                            if (
                                                element.id ===
                                                "triangle"
                                            ) {
                                                Icon =
                                                    Triangle;
                                            }

                                            if (
                                                element.id ===
                                                "star"
                                            ) {
                                                Icon =
                                                    Star;
                                            }

                                            if (
                                                element.id ===
                                                "image"
                                            ) {
                                                Icon =
                                                    ImageIcon;
                                            }

                                            if (
                                                element.id ===
                                                "text"
                                            ) {
                                                Icon =
                                                    Type;
                                            }

                                            if (
                                                element.id ===
                                                "button"
                                            ) {
                                                Icon =
                                                    MousePointer2;
                                            }


                                            return (
                                                <button
                                                    key={
                                                        element.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        addElement(
                                                            element
                                                        )
                                                    }
                                                    className="
                                                        h-[76px]
                                                        rounded-2xl
                                                        border
                                                        border-[#E8E8F0]
                                                        bg-white
                                                        flex
                                                        flex-col
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        hover:border-[#D3CDFB]
                                                        hover:bg-[#FAF9FF]
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            w-8
                                                            h-8
                                                            rounded-xl
                                                            flex
                                                            items-center
                                                            justify-center
                                                        "
                                                        style={{
                                                            backgroundColor:
                                                                `${element.color}18`
                                                        }}
                                                    >

                                                        <Icon
                                                            size={
                                                                16
                                                            }
                                                            style={{
                                                                color:
                                                                    element.color
                                                            }}
                                                        />

                                                    </div>


                                                    <span
                                                        className="
                                                            text-[10px]
                                                            font-semibold
                                                            text-[#555566]
                                                        "
                                                    >
                                                        {
                                                            element.name
                                                        }
                                                    </span>

                                                </button>
                                            );

                                        }
                                    )}

                                </div>


                                {/* IMAGE UPLOAD */}

                                <label
                                    className="
                                        mt-3
                                        w-full
                                        h-11
                                        rounded-xl
                                        border
                                        border-dashed
                                        border-[#D6D3EA]
                                        bg-[#FAF9FF]
                                        text-[#7C6CFF]
                                        text-xs
                                        font-semibold
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        cursor-pointer
                                    "
                                >

                                    <Upload
                                        size={15}
                                    />

                                    Upload Picture

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={
                                            addImageFromFile
                                        }
                                    />

                                </label>

                            </div>


                            {/* OBJECT LIST */}

                            <div
                                className="
                                    mt-7
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        mb-3
                                    "
                                >

                                    <p
                                        className="
                                            text-sm
                                            font-bold
                                            text-[#303044]
                                        "
                                    >
                                        Objects
                                    </p>

                                    <span
                                        className="
                                            text-xs
                                            text-[#9999AA]
                                        "
                                    >
                                        {
                                            objects.length
                                        }
                                    </span>

                                </div>


                                <div
                                    className="
                                        space-y-2
                                    "
                                >

                                    {objects.length ===
                                        0 && (
                                        <div
                                            className="
                                                rounded-2xl
                                                border
                                                border-dashed
                                                border-[#DCDCE7]
                                                p-5
                                                text-center
                                            "
                                        >
                                            <p
                                                className="
                                                    text-xs
                                                    text-[#9999AA]
                                                "
                                            >
                                                No objects yet
                                            </p>
                                        </div>
                                    )}


                                    {objects.map(
                                        (
                                            object
                                        ) => (

                                            <button
                                                key={
                                                    object.id
                                                }
                                                type="button"
                                                onClick={() => {

                                                    setSelectedObject(
                                                        object.id
                                                    );

                                                    setSelectedRule(
                                                        null
                                                    );

                                                }}
                                                className={`
                                                    w-full
                                                    p-3
                                                    rounded-xl
                                                    border
                                                    flex
                                                    items-center
                                                    gap-3
                                                    text-left
                                                    ${
                                                        selectedObject ===
                                                        object.id
                                                            ? "border-[#CFC8FF] bg-[#F8F6FF]"
                                                            : "border-[#E9E9F0] bg-white"
                                                    }
                                                `}
                                            >

                                                <div
                                                    className="
                                                        w-8
                                                        h-8
                                                        rounded-lg
                                                        bg-[#F3F1FF]
                                                        flex
                                                        items-center
                                                        justify-center
                                                        shrink-0
                                                    "
                                                >

                                                    {object.type ===
                                                    "image" ? (
                                                        <ImageIcon
                                                            size={
                                                                15
                                                            }
                                                            className="
                                                                text-[#63B3ED]
                                                            "
                                                        />
                                                    ) : object.type ===
                                                      "text" ? (
                                                        <Type
                                                            size={
                                                                15
                                                            }
                                                            className="
                                                                text-[#7C6CFF]
                                                            "
                                                        />
                                                    ) : (
                                                        <Square
                                                            size={
                                                                15
                                                            }
                                                            className="
                                                                text-[#7C6CFF]
                                                            "
                                                        />
                                                    )}

                                                </div>


                                                <div
                                                    className="
                                                        min-w-0
                                                        flex-1
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-xs
                                                            font-semibold
                                                            text-[#303044]
                                                            truncate
                                                        "
                                                    >
                                                        {
                                                            object.name
                                                        }
                                                    </p>

                                                    <p
                                                        className="
                                                            text-[10px]
                                                            text-[#9999AA]
                                                        "
                                                    >
                                                        {
                                                            object.type
                                                        }
                                                    </p>

                                                </div>


                                                <GripVertical
                                                    size={
                                                        14
                                                    }
                                                    className="
                                                        text-[#B5B5C3]
                                                    "
                                                />

                                            </button>

                                        )
                                    )}

                                </div>

                            </div>

                        </>
                    )}


                    {/* =================================================
                       LOGIC TAB
                    ================================================= */}

                    {activeTab ===
                        "logic" && (
                        <>

                            <div
                                className="
                                    mb-5
                                "
                            >

                                <p
                                    className="
                                        text-sm
                                        font-bold
                                        text-[#303044]
                                    "
                                >
                                    Game Logic
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        leading-5
                                        text-[#9999AA]
                                    "
                                >
                                    Create one rule and apply it
                                    to multiple objects.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    addRule(
                                        "add-score"
                                    )
                                }
                                className="
                                    w-full
                                    h-11
                                    rounded-xl
                                    bg-[#7C6CFF]
                                    text-white
                                    text-sm
                                    font-semibold
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    mb-5
                                "
                            >

                                <Plus
                                    size={16}
                                />

                                Add Logic Rule

                            </button>


                            <div
                                className="
                                    space-y-2
                                "
                            >

                                {rules.length ===
                                    0 && (
                                    <div
                                        className="
                                            p-5
                                            rounded-2xl
                                            border
                                            border-dashed
                                            border-[#DCDCE7]
                                            text-center
                                        "
                                    >

                                        <Blocks
                                            size={22}
                                            className="
                                                mx-auto
                                                text-[#B2ABC9]
                                            "
                                        />

                                        <p
                                            className="
                                                mt-3
                                                text-xs
                                                font-semibold
                                                text-[#555566]
                                            "
                                        >
                                            No logic rules
                                        </p>

                                    </div>
                                )}


                                {rules.map(
                                    (
                                        rule,
                                        index
                                    ) => {

                                        const action =
                                            ACTIONS.find(
                                                (
                                                    item
                                                ) =>
                                                    item.id ===
                                                    rule.action
                                            );

                                        const trigger =
                                            TRIGGERS.find(
                                                (
                                                    item
                                                ) =>
                                                    item.id ===
                                                    rule.trigger
                                            );


                                        return (
                                            <button
                                                key={
                                                    rule.id
                                                }
                                                type="button"
                                                onClick={() => {

                                                    setSelectedRule(
                                                        rule.id
                                                    );

                                                    setSelectedObject(
                                                        null
                                                    );

                                                }}
                                                className={`
                                                    w-full
                                                    text-left
                                                    p-3
                                                    rounded-xl
                                                    border
                                                    ${
                                                        selectedRule ===
                                                        rule.id
                                                            ? "border-[#CFC8FF] bg-[#F8F6FF]"
                                                            : "border-[#E8E8F0] bg-white"
                                                    }
                                                `}
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            w-6
                                                            h-6
                                                            rounded-lg
                                                            bg-[#F1EEFF]
                                                            flex
                                                            items-center
                                                            justify-center
                                                            text-[10px]
                                                            font-bold
                                                            text-[#7C6CFF]
                                                        "
                                                    >
                                                        {
                                                            index +
                                                            1
                                                        }
                                                    </span>


                                                    <div
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                text-[11px]
                                                                font-semibold
                                                                text-[#555566]
                                                                truncate
                                                            "
                                                        >
                                                            {
                                                                trigger?.label
                                                            }
                                                        </p>

                                                        <p
                                                            className="
                                                                mt-1
                                                                text-[10px]
                                                                text-[#9999AA]
                                                                truncate
                                                            "
                                                        >
                                                            {
                                                                action?.label
                                                            }
                                                            {" · "}
                                                            {
                                                                rule.targetIds?.length ||
                                                                0
                                                            }
                                                            {" targets"}
                                                        </p>

                                                    </div>

                                                </div>

                                            </button>
                                        );

                                    }
                                )}

                            </div>

                        </>
                    )}

                </aside>


                {/* =================================================
                   CENTER WORKSPACE
                ================================================= */}

                <main
                    className="
                        flex-1
                        min-w-0
                        flex
                        flex-col
                    "
                >

                    <div
                        className="
                            h-14
                            bg-white
                            border-b
                            border-[#E8E8F0]
                            px-5
                            flex
                            items-center
                            justify-between
                            shrink-0
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <span
                                className="
                                    text-xs
                                    font-semibold
                                    text-[#555566]
                                "
                            >
                                Workspace
                            </span>

                            <span
                                className="
                                    text-[10px]
                                    text-[#AAAAAA]
                                "
                            >
                                /
                            </span>

                            <span
                                className="
                                    text-[10px]
                                    text-[#9999AA]
                                "
                            >
                                {
                                    objects.length
                                }{" "}
                                objects
                            </span>

                        </div>


                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <button
                                type="button"
                                onClick={
                                    shuffleObjectPositions
                                }
                                className="
                                    h-8
                                    px-3
                                    rounded-lg
                                    bg-[#F7F5FF]
                                    text-[#7C6CFF]
                                    text-[10px]
                                    font-semibold
                                "
                            >
                                Shuffle Positions
                            </button>


                            <div
                                className="
                                    px-3
                                    py-1.5
                                    rounded-lg
                                    bg-[#F7F5FF]
                                    text-[10px]
                                    font-semibold
                                    text-[#7C6CFF]
                                "
                            >
                                {
                                    rules.length
                                }{" "}
                                logic rules
                            </div>

                        </div>

                    </div>


                    <div
                        className="
                            flex-1
                            overflow-auto
                            p-8
                        "
                    >

                        <div
                            ref={
                                canvasRef
                            }
                            onPointerMove={
                                handlePointerMove
                            }
                            onPointerUp={
                                handlePointerUp
                            }
                            onPointerCancel={
                                handlePointerUp
                            }
                            className="
                                relative
                                w-[1620px]
                                h-[820px]
                                bg-white
                                rounded-[28px]
                                border
                                border-[#E2E2EC]
                                overflow-hidden
                                shadow-[0_15px_50px_rgba(30,30,60,0.05)]
                            "
                        >

                            <div
                                className="
                                    absolute
                                    inset-0
                                    pointer-events-none
                                    opacity-40
                                "
                                style={{
                                    backgroundImage:
                                        "radial-gradient(#D8D8E5 1px, transparent 1px)",
                                    backgroundSize:
                                        "24px 24px"
                                }}
                            />


                            <div
                                className="
                                    absolute
                                    top-5
                                    left-6
                                    z-30
                                    px-3
                                    py-1.5
                                    rounded-lg
                                    bg-white
                                    border
                                    border-[#E7E7EF]
                                    text-[10px]
                                    font-semibold
                                    text-[#888899]
                                "
                            >
                                Game Canvas
                            </div>


                            {objects.map(
                                (
                                    object
                                ) => (

                                    <div
                                        key={
                                            object.id
                                        }
                                        onPointerDown={(
                                            event
                                        ) =>
                                            handlePointerDown(
                                                event,
                                                object
                                            )
                                        }
                                        className={`
                                            absolute
                                            z-10
                                            select-none
                                            touch-none
                                            cursor-grab
                                            active:cursor-grabbing
                                            ${
                                                selectedObject ===
                                                object.id
                                                    ? "ring-2 ring-[#7C6CFF] ring-offset-2"
                                                    : ""
                                            }
                                        `}
                                        style={{
                                            left:
                                                `${object.x}px`,
                                            top:
                                                `${object.y}px`,
                                            width:
                                                `${object.width}px`,
                                            height:
                                                `${object.height}px`,
                                            transform:
                                                `rotate(${object.rotation || 0}deg)`,
                                            display:
                                                object.visible ===
                                                false
                                                    ? "none"
                                                    : "block"
                                        }}
                                    >

                                        {renderObject(
                                            object
                                        )}

                                    </div>

                                )
                            )}


                            {objects.length ===
                                0 && (
                                <div
                                    className="
                                        absolute
                                        inset-0
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >

                                    <div
                                        className="
                                            text-center
                                            max-w-sm
                                        "
                                    >

                                        <div
                                            className="
                                                w-16
                                                h-16
                                                rounded-2xl
                                                bg-[#F2EFFF]
                                                flex
                                                items-center
                                                justify-center
                                                mx-auto
                                            "
                                        >

                                            <Palette
                                                size={
                                                    28
                                                }
                                                className="
                                                    text-[#7C6CFF]
                                                "
                                            />

                                        </div>


                                        <h2
                                            className="
                                                mt-5
                                                text-lg
                                                font-bold
                                                text-[#303044]
                                            "
                                        >
                                            Start building
                                            your game
                                        </h2>


                                        <p
                                            className="
                                                mt-2
                                                text-sm
                                                leading-6
                                                text-[#9999AA]
                                            "
                                        >
                                            Add shapes, text,
                                            buttons or your own
                                            pictures.
                                        </p>

                                    </div>

                                </div>
                            )}

                        </div>

                    </div>

                </main>


                {/* =================================================
                   RIGHT INSPECTOR
                ================================================= */}

                <aside
                    className="
                        w-[330px]
                        bg-white
                        border-l
                        border-[#E8E8F0]
                        p-5
                        overflow-y-auto
                        shrink-0
                    "
                >

                    {/* =================================================
                       RULE INSPECTOR
                    ================================================= */}

                    {selectedRuleData ? (

                        <div>

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-5
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            font-bold
                                            text-[#303044]
                                        "
                                    >
                                        Logic Rule
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            text-[10px]
                                            text-[#9999AA]
                                        "
                                    >
                                        Define exactly what
                                        happens.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedRule(
                                            null
                                        )
                                    }
                                    className="
                                        w-8
                                        h-8
                                        rounded-lg
                                        hover:bg-[#F7F7FA]
                                        flex
                                        items-center
                                        justify-center
                                        text-[#9999AA]
                                    "
                                >
                                    <X
                                        size={15}
                                    />
                                </button>

                            </div>


                            {/* WHEN */}

                            <div
                                className="
                                    rounded-2xl
                                    bg-[#F8F7FC]
                                    p-4
                                    mb-3
                                "
                            >

                                <label
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-[#9999AA]
                                    "
                                >
                                    WHEN
                                </label>


                                <select
                                    value={
                                        selectedRuleData.trigger
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateRule(
                                            selectedRuleData.id,
                                            "trigger",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="
                                        mt-2
                                        w-full
                                        h-10
                                        px-3
                                        rounded-xl
                                        border
                                        border-[#E2E2EA]
                                        bg-white
                                        text-xs
                                        font-semibold
                                        text-[#444456]
                                        outline-none
                                    "
                                >

                                    {TRIGGERS.map(
                                        (
                                            trigger
                                        ) => (
                                            <option
                                                key={
                                                    trigger.id
                                                }
                                                value={
                                                    trigger.id
                                                }
                                            >
                                                {
                                                    trigger.label
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* CLICK OBJECT */}

                            {selectedRuleData.trigger ===
                                "object-clicked" && (

                                <div
                                    className="
                                        rounded-2xl
                                        bg-[#F8F7FC]
                                        p-4
                                        mb-3
                                    "
                                >

                                    <label
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-[#9999AA]
                                        "
                                    >
                                        CHILD CLICKS
                                    </label>


                                    <select
                                        value={
                                            selectedRuleData.triggerTargetId ||
                                            ""
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateRule(
                                                selectedRuleData.id,
                                                "triggerTargetId",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="
                                            mt-2
                                            w-full
                                            h-10
                                            px-3
                                            rounded-xl
                                            border
                                            border-[#E2E2EA]
                                            bg-white
                                            text-xs
                                            font-semibold
                                            text-[#444456]
                                            outline-none
                                        "
                                    >

                                        <option value="">
                                            Select clicked object
                                        </option>

                                        {objects.map(
                                            (
                                                object
                                            ) => (
                                                <option
                                                    key={
                                                        object.id
                                                    }
                                                    value={
                                                        object.id
                                                    }
                                                >
                                                    {
                                                        object.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            )}


                            {/* ACTION */}

                            <div
                                className="
                                    rounded-2xl
                                    bg-[#F8F7FC]
                                    p-4
                                    mb-3
                                "
                            >

                                <label
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-[#9999AA]
                                    "
                                >
                                    DO
                                </label>


                                <select
                                    value={
                                        selectedRuleData.action
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateRule(
                                            selectedRuleData.id,
                                            "action",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="
                                        mt-2
                                        w-full
                                        h-10
                                        px-3
                                        rounded-xl
                                        border
                                        border-[#E2E2EA]
                                        bg-white
                                        text-xs
                                        font-semibold
                                        text-[#444456]
                                        outline-none
                                    "
                                >

                                    {ACTIONS.map(
                                        (
                                            action
                                        ) => (
                                            <option
                                                key={
                                                    action.id
                                                }
                                                value={
                                                    action.id
                                                }
                                            >
                                                {
                                                    action.label
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* MULTIPLE TARGETS */}

                            {[
                                "show",
                                "hide",
                                "move"
                            ].includes(
                                selectedRuleData.action
                            ) && (

                                <div
                                    className="
                                        rounded-2xl
                                        bg-[#F8F7FC]
                                        p-4
                                        mb-3
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                        "
                                    >

                                        <label
                                            className="
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-wider
                                                text-[#9999AA]
                                            "
                                        >
                                            TARGET OBJECTS
                                        </label>


                                        <span
                                            className="
                                                text-[10px]
                                                font-semibold
                                                text-[#7C6CFF]
                                            "
                                        >
                                            {
                                                selectedRuleData.targetIds?.length ||
                                                0
                                            }{" "}
                                            selected
                                        </span>

                                    </div>


                                    <div
                                        className="
                                            mt-2
                                            max-h-44
                                            overflow-y-auto
                                            space-y-1.5
                                        "
                                    >

                                        {objects.length ===
                                            0 ? (

                                            <p
                                                className="
                                                    text-xs
                                                    text-[#9999AA]
                                                "
                                            >
                                                Add objects first.
                                            </p>

                                        ) : (

                                            objects.map(
                                                (
                                                    object
                                                ) => {

                                                    const checked =
                                                        selectedRuleData
                                                            .targetIds
                                                            ?.includes(
                                                                object.id
                                                            );


                                                    return (
                                                        <button
                                                            key={
                                                                object.id
                                                            }
                                                            type="button"
                                                            onClick={() =>
                                                                toggleTarget(
                                                                    selectedRuleData.id,
                                                                    object.id
                                                                )
                                                            }
                                                            className={`
                                                                w-full
                                                                flex
                                                                items-center
                                                                gap-2
                                                                p-2.5
                                                                rounded-xl
                                                                border
                                                                text-left
                                                                ${
                                                                    checked
                                                                        ? "border-[#CFC8FF] bg-white"
                                                                        : "border-[#E8E8F0] bg-white"
                                                                }
                                                            `}
                                                        >

                                                            <div
                                                                className={`
                                                                    w-5
                                                                    h-5
                                                                    rounded-md
                                                                    flex
                                                                    items-center
                                                                    justify-center
                                                                    border
                                                                    ${
                                                                        checked
                                                                            ? "bg-[#7C6CFF] border-[#7C6CFF]"
                                                                            : "bg-white border-[#DADAE4]"
                                                                    }
                                                                `}
                                                            >

                                                                {checked && (
                                                                    <Check
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="
                                                                            text-white
                                                                        "
                                                                    />
                                                                )}

                                                            </div>


                                                            <span
                                                                className="
                                                                    text-xs
                                                                    font-semibold
                                                                    text-[#555566]
                                                                    truncate
                                                                "
                                                            >
                                                                {
                                                                    object.name
                                                                }
                                                            </span>

                                                        </button>
                                                    );

                                                }
                                            )

                                        )}

                                    </div>


                                    <p
                                        className="
                                            mt-2
                                            text-[10px]
                                            leading-4
                                            text-[#9999AA]
                                        "
                                    >
                                        Select multiple objects.
                                        This one rule will apply
                                        the action to all of them.
                                    </p>

                                </div>

                            )}


                            {/* SCORE */}

                            {[
                                "add-score",
                                "remove-score"
                            ].includes(
                                selectedRuleData.action
                            ) && (

                                <div
                                    className="
                                        rounded-2xl
                                        bg-[#F8F7FC]
                                        p-4
                                        mb-3
                                    "
                                >

                                    <label
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-[#9999AA]
                                        "
                                    >
                                        SCORE VALUE
                                    </label>


                                    <input
                                        type="number"
                                        value={
                                            selectedRuleData.value
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateRule(
                                                selectedRuleData.id,
                                                "value",
                                                Number(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            )
                                        }
                                        className="
                                            mt-2
                                            w-full
                                            h-10
                                            px-3
                                            rounded-xl
                                            border
                                            border-[#E2E2EA]
                                            bg-white
                                            text-xs
                                            font-semibold
                                            text-[#444456]
                                            outline-none
                                        "
                                    />

                                </div>

                            )}


                            {/* WAIT */}

                            {selectedRuleData.action ===
                                "wait" && (

                                <div
                                    className="
                                        rounded-2xl
                                        bg-[#F8F7FC]
                                        p-4
                                        mb-3
                                    "
                                >

                                    <label
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-[#9999AA]
                                        "
                                    >
                                        WAIT SECONDS
                                    </label>


                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={
                                            selectedRuleData.wait
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateRule(
                                                selectedRuleData.id,
                                                "wait",
                                                Number(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            )
                                        }
                                        className="
                                            mt-2
                                            w-full
                                            h-10
                                            px-3
                                            rounded-xl
                                            border
                                            border-[#E2E2EA]
                                            bg-white
                                            text-xs
                                            font-semibold
                                            outline-none
                                        "
                                    />

                                </div>

                            )}


                            {/* MOVE */}

                            {selectedRuleData.action ===
                                "move" && (

                                <div
                                    className="
                                        rounded-2xl
                                        bg-[#F8F7FC]
                                        p-4
                                        mb-3
                                    "
                                >

                                    <label
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-[#9999AA]
                                        "
                                    >
                                        MOVEMENT
                                    </label>


                                    <div
                                        className="
                                            grid
                                            grid-cols-2
                                            gap-2
                                            mt-2
                                        "
                                    >

                                        <input
                                            type="number"
                                            value={
                                                selectedRuleData.moveX
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateRule(
                                                    selectedRuleData.id,
                                                    "moveX",
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                )
                                            }
                                            placeholder="X"
                                            className="
                                                h-10
                                                px-3
                                                rounded-xl
                                                border
                                                border-[#E2E2EA]
                                                bg-white
                                                text-xs
                                                outline-none
                                            "
                                        />


                                        <input
                                            type="number"
                                            value={
                                                selectedRuleData.moveY
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateRule(
                                                    selectedRuleData.id,
                                                    "moveY",
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                )
                                            }
                                            placeholder="Y"
                                            className="
                                                h-10
                                                px-3
                                                rounded-xl
                                                border
                                                border-[#E2E2EA]
                                                bg-white
                                                text-xs
                                                outline-none
                                            "
                                        />

                                    </div>

                                </div>

                            )}


                            {/* ENABLE */}

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-[#E8E8F0]
                                    p-4
                                    mb-3
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            text-xs
                                            font-semibold
                                            text-[#444456]
                                        "
                                    >
                                        Enable Rule
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            text-[10px]
                                            text-[#9999AA]
                                        "
                                    >
                                        Rule runs in Preview.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        updateRule(
                                            selectedRuleData.id,
                                            "enabled",
                                            !selectedRuleData.enabled
                                        )
                                    }
                                    className={`
                                        w-11
                                        h-6
                                        rounded-full
                                        p-1
                                        ${
                                            selectedRuleData.enabled
                                                ? "bg-[#7C6CFF]"
                                                : "bg-[#D7D7E2]"
                                        }
                                    `}
                                >

                                    <div
                                        className={`
                                            w-4
                                            h-4
                                            rounded-full
                                            bg-white
                                            transition
                                            ${
                                                selectedRuleData.enabled
                                                    ? "translate-x-5"
                                                    : "translate-x-0"
                                            }
                                        `}
                                    />

                                </button>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    deleteRule(
                                        selectedRuleData.id
                                    )
                                }
                                className="
                                    w-full
                                    h-10
                                    rounded-xl
                                    border
                                    border-[#F0D7DC]
                                    text-[#D85C70]
                                    text-xs
                                    font-semibold
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                "
                            >

                                <Trash2
                                    size={14}
                                />

                                Delete Rule

                            </button>

                        </div>

                    ) : selectedObjectData ? (

                        /* =================================================
                           OBJECT INSPECTOR
                        ================================================= */

                        <div>

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-5
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            font-bold
                                            text-[#303044]
                                        "
                                    >
                                        Object
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            text-[10px]
                                            text-[#9999AA]
                                        "
                                    >
                                        Edit selected object.
                                    </p>

                                </div>

                            </div>


                            {/* NAME */}

                            <div
                                className="
                                    rounded-2xl
                                    bg-[#F8F7FC]
                                    p-4
                                    mb-3
                                "
                            >

                                <label
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-[#9999AA]
                                    "
                                >
                                    NAME
                                </label>


                                <input
                                    value={
                                        selectedObjectData.name
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateObject(
                                            selectedObjectData.id,
                                            "name",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="
                                        mt-2
                                        w-full
                                        h-10
                                        px-3
                                        rounded-xl
                                        border
                                        border-[#E2E2EA]
                                        bg-white
                                        text-xs
                                        font-semibold
                                        outline-none
                                    "
                                />

                            </div>


                            {/* TEXT */}

                            {[
                                "text",
                                "button"
                            ].includes(
                                selectedObjectData.type
                            ) && (

                                <div
                                    className="
                                        rounded-2xl
                                        bg-[#F8F7FC]
                                        p-4
                                        mb-3
                                    "
                                >

                                    <label
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-[#9999AA]
                                        "
                                    >
                                        TEXT
                                    </label>


                                    <input
                                        value={
                                            selectedObjectData.text
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateObject(
                                                selectedObjectData.id,
                                                "text",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="
                                            mt-2
                                            w-full
                                            h-10
                                            px-3
                                            rounded-xl
                                            border
                                            border-[#E2E2EA]
                                            bg-white
                                            text-xs
                                            outline-none
                                        "
                                    />

                                </div>

                            )}


                            {/* COLOR */}

                            <div
                                className="
                                    rounded-2xl
                                    bg-[#F8F7FC]
                                    p-4
                                    mb-3
                                "
                            >

                                <label
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-[#9999AA]
                                    "
                                >
                                    COLOR
                                </label>


                                <div
                                    className="
                                        mt-2
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <input
                                        type="color"
                                        value={
                                            selectedObjectData.color ||
                                            "#7C6CFF"
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateObject(
                                                selectedObjectData.id,
                                                "color",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="
                                            w-11
                                            h-10
                                            rounded-xl
                                            border
                                            border-[#E2E2EA]
                                            bg-white
                                            cursor-pointer
                                        "
                                    />


                                    <input
                                        value={
                                            selectedObjectData.color ||
                                            "#7C6CFF"
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateObject(
                                                selectedObjectData.id,
                                                "color",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="
                                            flex-1
                                            h-10
                                            px-3
                                            rounded-xl
                                            border
                                            border-[#E2E2EA]
                                            bg-white
                                            text-xs
                                            outline-none
                                        "
                                    />

                                </div>

                            </div>


                            {/* POSITION */}

                            <div
                                className="
                                    rounded-2xl
                                    bg-[#F8F7FC]
                                    p-4
                                    mb-3
                                "
                            >

                                <label
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-[#9999AA]
                                    "
                                >
                                    POSITION
                                </label>


                                <div
                                    className="
                                        grid
                                        grid-cols-2
                                        gap-2
                                        mt-2
                                    "
                                >

                                    <input
                                        type="number"
                                        value={
                                            selectedObjectData.x
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateObject(
                                                selectedObjectData.id,
                                                "x",
                                                Number(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            )
                                        }
                                        placeholder="X"
                                        className="
                                            h-10
                                            px-3
                                            rounded-xl
                                            border
                                            border-[#E2E2EA]
                                            bg-white
                                            text-xs
                                            outline-none
                                        "
                                    />


                                    <input
                                        type="number"
                                        value={
                                            selectedObjectData.y
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateObject(
                                                selectedObjectData.id,
                                                "y",
                                                Number(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            )
                                        }
                                        placeholder="Y"
                                        className="
                                            h-10
                                            px-3
                                            rounded-xl
                                            border
                                            border-[#E2E2EA]
                                            bg-white
                                            text-xs
                                            outline-none
                                        "
                                    />

                                </div>

                            </div>


                            {/* SIZE */}

                            <div
                                className="
                                    rounded-2xl
                                    bg-[#F8F7FC]
                                    p-4
                                    mb-3
                                "
                            >

                                <label
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-[#9999AA]
                                    "
                                >
                                    SIZE
                                </label>


                                <div
                                    className="
                                        grid
                                        grid-cols-2
                                        gap-2
                                        mt-2
                                    "
                                >

                                    <input
                                        type="number"
                                        min="20"
                                        value={
                                            selectedObjectData.width
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateObject(
                                                selectedObjectData.id,
                                                "width",
                                                Math.max(
                                                    20,
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                )
                                            )
                                        }
                                        placeholder="Width"
                                        className="
                                            h-10
                                            px-3
                                            rounded-xl
                                            border
                                            border-[#E2E2EA]
                                            bg-white
                                            text-xs
                                            outline-none
                                        "
                                    />


                                    <input
                                        type="number"
                                        min="20"
                                        value={
                                            selectedObjectData.height
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateObject(
                                                selectedObjectData.id,
                                                "height",
                                                Math.max(
                                                    20,
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                )
                                            )
                                        }
                                        placeholder="Height"
                                        className="
                                            h-10
                                            px-3
                                            rounded-xl
                                            border
                                            border-[#E2E2EA]
                                            bg-white
                                            text-xs
                                            outline-none
                                        "
                                    />

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-2
                                    mb-3
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        duplicateObject
                                    }
                                    className="
                                        h-10
                                        rounded-xl
                                        border
                                        border-[#E5E5EE]
                                        text-xs
                                        font-semibold
                                        text-[#555566]
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                    "
                                >

                                    <Copy
                                        size={14}
                                    />

                                    Duplicate

                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        deleteObject
                                    }
                                    className="
                                        h-10
                                        rounded-xl
                                        border
                                        border-[#F0D7DC]
                                        text-xs
                                        font-semibold
                                        text-[#D85C70]
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                    "
                                >

                                    <Trash2
                                        size={14}
                                    />

                                    Delete

                                </button>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    addRule(
                                        "hide"
                                    )
                                }
                                className="
                                    w-full
                                    h-11
                                    rounded-xl
                                    bg-[#F2EFFF]
                                    text-[#7C6CFF]
                                    text-xs
                                    font-bold
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                "
                            >

                                <Blocks
                                    size={15}
                                />

                                Create Logic

                            </button>

                        </div>

                    ) : (

                        /* =================================================
                           EMPTY
                        ================================================= */

                        <div
                            className="
                                h-full
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <div
                                className="
                                    text-center
                                    max-w-[220px]
                                "
                            >

                                <div
                                    className="
                                        w-14
                                        h-14
                                        rounded-2xl
                                        bg-[#F5F3FF]
                                        flex
                                        items-center
                                        justify-center
                                        mx-auto
                                    "
                                >

                                    <MousePointer2
                                        size={23}
                                        className="
                                            text-[#7C6CFF]
                                        "
                                    />

                                </div>


                                <p
                                    className="
                                        mt-4
                                        text-sm
                                        font-bold
                                        text-[#444456]
                                    "
                                >
                                    Select something
                                </p>


                                <p
                                    className="
                                        mt-2
                                        text-xs
                                        leading-5
                                        text-[#9999AA]
                                    "
                                >
                                    Select an object or
                                    a Logic Rule to edit it.
                                </p>

                            </div>

                        </div>

                    )}

                </aside>

            </div>

            {showAssignModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[180]
                        bg-black/25
                        flex
                        items-center
                        justify-center
                        p-6
                    "
                    onMouseDown={
                        (event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeAssignGame();
                            }

                        }
                    }
                >

                    <div
                        className="
                            w-full
                            max-w-xl
                            max-h-[86vh]
                            overflow-y-auto
                            bg-white
                            rounded-[28px]
                            shadow-2xl
                            p-6
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

                            <div>

                                <h2
                                    className="
                                        text-lg
                                        font-bold
                                        text-[#303044]
                                    "
                                >
                                    Assign Game
                                </h2>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-[#9999AA]
                                    "
                                >
                                    Assign this game to one of your children or to one of their active sessions.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeAssignGame
                                }
                                disabled={
                                    assignmentSaving
                                }
                                className="
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-[#F5F5F9]
                                    text-[#777A8B]
                                    flex
                                    items-center
                                    justify-center
                                    hover:bg-[#ECECF3]
                                    disabled:opacity-50
                                "
                            >
                                <X
                                    size={18}
                                />
                            </button>

                        </div>


                        {assignmentLoading ? (

                            <div
                                className="
                                    min-h-[220px]
                                    flex
                                    items-center
                                    justify-center
                                    text-sm
                                    text-[#9999AA]
                                "
                            >
                                Loading assignment options...
                            </div>

                        ) : (

                            <>

                                <div className="mt-6">

                                    <label
                                        className="
                                            block
                                            text-xs
                                            font-semibold
                                            text-[#555566]
                                            mb-2
                                        "
                                    >
                                        Child
                                    </label>


                                    <select
                                        value={
                                            assignmentChildId
                                        }
                                        onChange={
                                            (event) =>
                                                handleAssignmentChildChange(
                                                    event.target.value
                                                )
                                        }
                                        disabled={
                                            assignmentSaving
                                        }
                                        className="
                                            w-full
                                            h-11
                                            px-3
                                            rounded-xl
                                            border
                                            border-[#E1E1EA]
                                            bg-[#FBFBFD]
                                            text-sm
                                            text-[#555566]
                                            outline-none
                                            focus:border-[#7C6CFF]
                                            disabled:opacity-50
                                        "
                                    >
                                        <option value="">
                                            Select Child
                                        </option>

                                        {
                                            (
                                                assignmentOptions.children ||
                                                []
                                            ).map(
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
                                            )
                                        }
                                    </select>

                                </div>


                                <div className="mt-5">

                                    <p
                                        className="
                                            text-xs
                                            font-semibold
                                            text-[#555566]
                                            mb-2
                                        "
                                    >
                                        Assign To
                                    </p>


                                    <div
                                        className="
                                            grid
                                            grid-cols-2
                                            gap-3
                                        "
                                    >

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleAssignmentTypeChange(
                                                    "child"
                                                )
                                            }
                                            className={`
                                                h-11
                                                rounded-xl
                                                border
                                                text-sm
                                                font-semibold
                                                transition
                                                ${
                                                    assignmentType ===
                                                    "child"
                                                        ? "border-[#7C6CFF] bg-[#F1EDFF] text-[#6D5EEA]"
                                                        : "border-[#E4E4ED] bg-white text-[#77778A]"
                                                }
                                            `}
                                        >
                                            Child
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleAssignmentTypeChange(
                                                    "session"
                                                )
                                            }
                                            className={`
                                                h-11
                                                rounded-xl
                                                border
                                                text-sm
                                                font-semibold
                                                transition
                                                ${
                                                    assignmentType ===
                                                    "session"
                                                        ? "border-[#7C6CFF] bg-[#F1EDFF] text-[#6D5EEA]"
                                                        : "border-[#E4E4ED] bg-white text-[#77778A]"
                                                }
                                            `}
                                        >
                                            Session
                                        </button>

                                    </div>

                                </div>


                                {
                                    assignmentType ===
                                    "session" && (

                                        <div className="mt-5">

                                            <label
                                                className="
                                                    block
                                                    text-xs
                                                    font-semibold
                                                    text-[#555566]
                                                    mb-2
                                                "
                                            >
                                                Session
                                            </label>


                                            <select
                                                value={
                                                    assignmentSessionId
                                                }
                                                onChange={
                                                    (event) =>
                                                        setAssignmentSessionId(
                                                            event.target.value
                                                        )
                                                }
                                                disabled={
                                                    assignmentSaving ||
                                                    !assignmentChildId
                                                }
                                                className="
                                                    w-full
                                                    h-11
                                                    px-3
                                                    rounded-xl
                                                    border
                                                    border-[#E1E1EA]
                                                    bg-[#FBFBFD]
                                                    text-sm
                                                    text-[#555566]
                                                    outline-none
                                                    focus:border-[#7C6CFF]
                                                    disabled:opacity-50
                                                "
                                            >
                                                <option value="">
                                                    Select Session
                                                </option>

                                                {
                                                    filteredAssignmentSessions.map(
                                                        (session) => (

                                                            <option
                                                                key={
                                                                    session.id
                                                                }
                                                                value={
                                                                    session.id
                                                                }
                                                            >
                                                                Session #{session.id} — {session.status}
                                                            </option>

                                                        )
                                                    )
                                                }
                                            </select>


                                            {
                                                assignmentChildId &&
                                                filteredAssignmentSessions.length ===
                                                0 && (

                                                    <p
                                                        className="
                                                            mt-2
                                                            text-xs
                                                            text-[#A0A2B2]
                                                        "
                                                    >
                                                        No active sessions are available for this child.
                                                    </p>

                                                )
                                            }

                                        </div>

                                    )
                                }


                                {assignmentError && (

                                    <div
                                        className="
                                            mt-5
                                            px-4
                                            py-3
                                            rounded-xl
                                            bg-[#FFF0F3]
                                            text-[#D85C70]
                                            text-xs
                                            font-semibold
                                        "
                                    >
                                        {assignmentError}
                                    </div>

                                )}


                                {assignmentMessage && (

                                    <div
                                        className="
                                            mt-5
                                            px-4
                                            py-3
                                            rounded-xl
                                            bg-[#EAF8F2]
                                            text-[#3A9A74]
                                            text-xs
                                            font-semibold
                                        "
                                    >
                                        {assignmentMessage}
                                    </div>

                                )}


                                <button
                                    type="button"
                                    onClick={
                                        handleAssignGame
                                    }
                                    disabled={
                                        assignmentSaving ||
                                        !assignmentChildId ||
                                        (
                                            assignmentType ===
                                            "session" &&
                                            !assignmentSessionId
                                        )
                                    }
                                    className="
                                        mt-6
                                        w-full
                                        h-11
                                        rounded-xl
                                        bg-[#7C6CFF]
                                        text-white
                                        font-semibold
                                        text-sm
                                        hover:bg-[#6F60F0]
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    {
                                        assignmentSaving
                                            ? "Assigning..."
                                            : assignmentType ===
                                                "session"
                                                ? "Assign to Session"
                                                : "Assign to Child"
                                    }
                                </button>


                                <div
                                    className="
                                        mt-7
                                        pt-6
                                        border-t
                                        border-[#ECECF3]
                                    "
                                >

                                    <div>

                                        <h3
                                            className="
                                                text-sm
                                                font-bold
                                                text-[#3D3D50]
                                            "
                                        >
                                            Current Assignments
                                        </h3>

                                        <p
                                            className="
                                                mt-1
                                                text-xs
                                                text-[#9999AA]
                                            "
                                        >
                                            {gameAssignments.length} assignment{gameAssignments.length === 1 ? "" : "s"}
                                        </p>

                                    </div>


                                    {
                                        gameAssignments.length ===
                                        0
                                            ? (

                                                <div
                                                    className="
                                                        mt-4
                                                        rounded-2xl
                                                        border
                                                        border-dashed
                                                        border-[#DEDEEA]
                                                        bg-[#FAFAFC]
                                                        p-5
                                                        text-center
                                                        text-xs
                                                        text-[#9999AA]
                                                    "
                                                >
                                                    This game is not assigned yet.
                                                </div>

                                            )
                                            : (

                                                <div
                                                    className="
                                                        mt-4
                                                        space-y-3
                                                    "
                                                >

                                                    {
                                                        gameAssignments.map(
                                                            (assignment) => (

                                                                <div
                                                                    key={
                                                                        assignment.id
                                                                    }
                                                                    className="
                                                                        flex
                                                                        items-center
                                                                        justify-between
                                                                        gap-4
                                                                        rounded-2xl
                                                                        border
                                                                        border-[#E9E9F1]
                                                                        bg-[#FAFAFC]
                                                                        px-4
                                                                        py-3
                                                                    "
                                                                >

                                                                    <div className="min-w-0">

                                                                        <p
                                                                            className="
                                                                                text-sm
                                                                                font-semibold
                                                                                text-[#444456]
                                                                                truncate
                                                                            "
                                                                        >
                                                                            {assignment.child_name}
                                                                        </p>

                                                                        <p
                                                                            className="
                                                                                mt-1
                                                                                text-xs
                                                                                text-[#9999AA]
                                                                            "
                                                                        >
                                                                            {
                                                                                assignment.assignment_type ===
                                                                                "session"
                                                                                    ? `Session #${assignment.session_id} · ${assignment.session_status || "Active"}`
                                                                                    : "Assigned to child"
                                                                            }
                                                                        </p>

                                                                    </div>


                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleRemoveAssignment(
                                                                                assignment.id
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            assignmentSaving
                                                                        }
                                                                        className="
                                                                            px-3
                                                                            h-8
                                                                            rounded-lg
                                                                            border
                                                                            border-[#F0DADF]
                                                                            bg-white
                                                                            text-[#D85C70]
                                                                            text-xs
                                                                            font-semibold
                                                                            hover:bg-[#FFF5F7]
                                                                            disabled:opacity-50
                                                                        "
                                                                    >
                                                                        Remove
                                                                    </button>

                                                                </div>

                                                            )
                                                        )
                                                    }

                                                </div>

                                            )
                                    }

                                </div>

                            </>

                        )}

                    </div>

                </div>

            )}

            {/* =================================================
               SETTINGS MODAL
            ================================================= */}

            {showSettings && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[100]
                        bg-black/20
                        flex
                        items-center
                        justify-center
                        p-6
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-md
                            bg-white
                            rounded-[28px]
                            shadow-2xl
                            p-6
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-lg
                                        font-bold
                                        text-[#303044]
                                    "
                                >
                                    Game Settings
                                </h2>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-[#9999AA]
                                    "
                                >
                                    Configure the therapeutic
                                    exercise.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowSettings(
                                        false
                                    )
                                }
                                className="
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-[#F7F7FA]
                                    flex
                                    items-center
                                    justify-center
                                    text-[#777788]
                                "
                            >
                                <X
                                    size={16}
                                />
                            </button>

                        </div>


                        <div
                            className="
                                mt-6
                                space-y-4
                            "
                        >

                            <div>

                                <label
                                    className="
                                        text-xs
                                        font-semibold
                                        text-[#555566]
                                    "
                                >
                                    Difficulty
                                </label>


                                <select
                                    value={
                                        gameSettings.difficulty
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        handleDifficultyChange(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="
                                        mt-2
                                        w-full
                                        h-11
                                        px-3
                                        rounded-xl
                                        border
                                        border-[#E5E5EE]
                                        text-sm
                                        outline-none
                                    "
                                >

                                    <option>
                                        Easy
                                    </option>

                                    <option>
                                        Medium
                                    </option>

                                    <option>
                                        Hard
                                    </option>

                                </select>

                            </div>


                            <div>

                                <label
                                    className="
                                        text-xs
                                        font-semibold
                                        text-[#555566]
                                    "
                                >
                                    Time
                                </label>


                                <input
                                    type="number"
                                    min="5"
                                    value={
                                        gameSettings.time
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setGameSettings(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                time:
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                            })
                                        )
                                    }
                                    className="
                                        mt-2
                                        w-full
                                        h-11
                                        px-3
                                        rounded-xl
                                        border
                                        border-[#E5E5EE]
                                        text-sm
                                        outline-none
                                    "
                                />

                            </div>


                            <div>

                                <label
                                    className="
                                        text-xs
                                        font-semibold
                                        text-[#555566]
                                    "
                                >
                                    Lives
                                </label>


                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        gameSettings.lives
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setGameSettings(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                lives:
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                            })
                                        )
                                    }
                                    className="
                                        mt-2
                                        w-full
                                        h-11
                                        px-3
                                        rounded-xl
                                        border
                                        border-[#E5E5EE]
                                        text-sm
                                        outline-none
                                    "
                                />

                            </div>


                            <div
                                className="
                                    p-4
                                    rounded-2xl
                                    bg-[#F8F7FC]
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            font-semibold
                                            text-[#444456]
                                        "
                                    >
                                        Score Enabled
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-[#9999AA]
                                        "
                                    >
                                        Allow rules to change score.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setGameSettings(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                scoreEnabled:
                                                    !previous.scoreEnabled
                                            })
                                        )
                                    }
                                    className={`
                                        w-11
                                        h-6
                                        rounded-full
                                        p-1
                                        ${
                                            gameSettings.scoreEnabled
                                                ? "bg-[#7C6CFF]"
                                                : "bg-[#D7D7E2]"
                                        }
                                    `}
                                >

                                    <div
                                        className={`
                                            w-4
                                            h-4
                                            bg-white
                                            rounded-full
                                            transition
                                            ${
                                                gameSettings.scoreEnabled
                                                    ? "translate-x-5"
                                                    : ""
                                            }
                                        `}
                                    />

                                </button>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setShowSettings(
                                    false
                                )
                            }
                            className="
                                mt-6
                                w-full
                                h-11
                                rounded-xl
                                bg-[#7C6CFF]
                                text-white
                                font-semibold
                                text-sm
                            "
                        >
                            Done
                        </button>

                    </div>

                </div>

            )}


            {/* =================================================
               PREVIEW MODAL
            ================================================= */}

            {showPreview && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[200]
                        bg-[#151522]/70
                        flex
                        items-center
                        justify-center
                        p-6
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-[1100px]
                            bg-white
                            rounded-[30px]
                            overflow-hidden
                            shadow-2xl
                        "
                    >

                        <div
                            className="
                                h-16
                                px-6
                                border-b
                                border-[#E8E8F0]
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-bold
                                        text-[#303044]
                                    "
                                >
                                    Game Preview
                                </p>

                                <p
                                    className="
                                        text-[10px]
                                        text-[#9999AA]
                                    "
                                >
                                    Test your game before saving.
                                </p>

                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <div
                                    className="
                                        px-3
                                        py-2
                                        rounded-xl
                                        bg-[#F7F5FF]
                                        text-xs
                                        font-bold
                                        text-[#7C6CFF]
                                    "
                                >
                                    Score:{" "}
                                    {
                                        previewScore
                                    }
                                </div>


                                <div
                                    className="
                                        px-3
                                        py-2
                                        rounded-xl
                                        bg-[#FFF5DD]
                                        text-xs
                                        font-bold
                                        text-[#A57922]
                                    "
                                >
                                    Time:{" "}
                                    {
                                        previewTime
                                    }s
                                </div>


                                <div
                                    className="
                                        px-3
                                        py-2
                                        rounded-xl
                                        bg-[#FFF0F3]
                                        text-xs
                                        font-bold
                                        text-[#D85C70]
                                    "
                                >
                                    Lives:{" "}
                                    {
                                        previewLives
                                    }
                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPreview(
                                            false
                                        )
                                    }
                                    className="
                                        w-9
                                        h-9
                                        rounded-xl
                                        bg-[#F7F7FA]
                                        flex
                                        items-center
                                        justify-center
                                        text-[#777788]
                                    "
                                >
                                    <X
                                        size={16}
                                    />
                                </button>

                            </div>

                        </div>


                        <div
                            className="
                                p-6
                                bg-[#F7F8FC]
                            "
                        >

                            <div
                                className="
                                    relative
                                    mx-auto
                                    w-full
                                    max-w-[900px]
                                    aspect-[900/650]
                                    bg-white
                                    rounded-[28px]
                                    border
                                    border-[#E2E2EC]
                                    overflow-hidden
                                    shadow-[0_15px_50px_rgba(30,30,60,0.05)]
                                "
                            >

                                <div
                                    className="
                                        absolute
                                        inset-0
                                        pointer-events-none
                                        opacity-30
                                    "
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(#D8D8E5 1px, transparent 1px)",
                                        backgroundSize:
                                            "24px 24px"
                                    }}
                                />


                                {previewObjects.map(
                                    (
                                        object
                                    ) => {

                                        if (
                                            object.visible ===
                                            false
                                        ) {
                                            return null;
                                        }


                                        return (
                                            <button
                                                key={
                                                    object.id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handlePreviewObjectClick(
                                                        object.id
                                                    )
                                                }
                                                className="
                                                    absolute
                                                    border-none
                                                    bg-transparent
                                                    p-0
                                                    cursor-pointer
                                                "
                                                style={{
                                                    left:
                                                        `${(object.x / 900) * 100}%`,
                                                    top:
                                                        `${(object.y / 650) * 100}%`,
                                                    width:
                                                        `${(object.width / 900) * 100}%`,
                                                    height:
                                                        `${(object.height / 650) * 100}%`,
                                                    transform:
                                                        `rotate(${object.rotation || 0}deg)`
                                                }}
                                            >

                                                {renderObject(
                                                    object
                                                )}

                                            </button>
                                        );

                                    }
                                )}


                                {previewObjects.length ===
                                    0 && (

                                    <div
                                        className="
                                            absolute
                                            inset-0
                                            flex
                                            items-center
                                            justify-center
                                            text-sm
                                            text-[#9999AA]
                                        "
                                    >
                                        No objects in this game.
                                    </div>

                                )}

                            </div>

                        </div>


                        <div
                            className="
                                px-6
                                py-4
                                border-t
                                border-[#E8E8F0]
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    text-[#9999AA]
                                "
                            >
                                Click objects to test your
                                Logic Rules.
                            </p>


                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        resetPreview
                                    }
                                    className="
                                        h-10
                                        px-4
                                        rounded-xl
                                        bg-[#F1EDFF]
                                        text-[#7C6CFF]
                                        text-xs
                                        font-semibold
                                    "
                                >
                                    Reset Preview
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        finishPreview
                                    }
                                    className="
                                        h-10
                                        px-4
                                        rounded-xl
                                        bg-[#7C6CFF]
                                        text-white
                                        text-xs
                                        font-semibold
                                    "
                                >
                                    Finish & Report
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {showReport && assessmentReport && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[300]
                        bg-[#151522]/70
                        flex
                        items-center
                        justify-center
                        p-6
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-[1000px]
                            max-h-[90vh]
                            overflow-y-auto
                            bg-white
                            rounded-[30px]
                            shadow-2xl
                            p-6
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                mb-6
                            "
                        >

                            <div>
                                <p
                                    className="
                                        text-lg
                                        font-bold
                                        text-[#303044]
                                    "
                                >
                                    Assessment Report
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-[#9999AA]
                                    "
                                >
                                    {assessmentReport.gameTitle}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowReport(false)
                                }
                                className="
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-[#F7F7FA]
                                    flex
                                    items-center
                                    justify-center
                                    text-[#777788]
                                "
                            >
                                <X size={16} />
                            </button>

                        </div>


                        <div
                            className="
                                grid
                                grid-cols-2
                                md:grid-cols-4
                                gap-3
                            "
                        >

                            {[
                                ["Total Responses", assessmentReport.totalResponses],
                                ["Correct", assessmentReport.correct],
                                ["Incorrect", assessmentReport.incorrect],
                                ["Accuracy", `${assessmentReport.accuracy}%`]
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="
                                        rounded-2xl
                                        bg-[#F8F7FC]
                                        p-4
                                    "
                                >
                                    <p
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-[#9999AA]
                                        "
                                    >
                                        {label}
                                    </p>
                                    <p
                                        className="
                                            mt-2
                                            text-xl
                                            font-bold
                                            text-[#303044]
                                        "
                                    >
                                        {value}
                                    </p>
                                </div>
                            ))}

                        </div>


                        <div
                            className="
                                grid
                                grid-cols-2
                                md:grid-cols-4
                                gap-3
                                mt-3
                            "
                        >

                            {[
                                ["Score", assessmentReport.score],
                                ["Mean Response", `${assessmentReport.meanResponseTimeMs} ms`],
                                ["Median Response", `${assessmentReport.medianResponseTimeMs} ms`],
                                ["Response Variability", `${assessmentReport.responseTimeStdDevMs} ms`]
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="
                                        rounded-2xl
                                        border
                                        border-[#E8E8F0]
                                        p-4
                                    "
                                >
                                    <p
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-[#9999AA]
                                        "
                                    >
                                        {label}
                                    </p>
                                    <p
                                        className="
                                            mt-2
                                            text-lg
                                            font-bold
                                            text-[#303044]
                                        "
                                    >
                                        {value}
                                    </p>
                                </div>
                            ))}

                        </div>


                        <div
                            className="
                                grid
                                grid-cols-2
                                md:grid-cols-4
                                gap-3
                                mt-3
                            "
                        >

                            {[
                                ["Fastest", `${assessmentReport.fastestResponseTimeMs} ms`],
                                ["Slowest", `${assessmentReport.slowestResponseTimeMs} ms`],
                                ["Error Rate", `${assessmentReport.errorRate}%`],
                                ["Elapsed Time", `${assessmentReport.elapsedSeconds}s`]
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="
                                        rounded-2xl
                                        border
                                        border-[#E8E8F0]
                                        p-4
                                    "
                                >
                                    <p
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-[#9999AA]
                                        "
                                    >
                                        {label}
                                    </p>
                                    <p
                                        className="
                                            mt-2
                                            text-lg
                                            font-bold
                                            text-[#303044]
                                        "
                                    >
                                        {value}
                                    </p>
                                </div>
                            ))}

                        </div>


                        <div
                            className="
                                mt-6
                                rounded-2xl
                                border
                                border-[#E8E8F0]
                                overflow-hidden
                            "
                        >

                            <div
                                className="
                                    px-4
                                    py-3
                                    bg-[#F8F7FC]
                                    border-b
                                    border-[#E8E8F0]
                                "
                            >
                                <p
                                    className="
                                        text-xs
                                        font-bold
                                        text-[#303044]
                                    "
                                >
                                    Trial Results
                                </p>
                            </div>

                            <div className="max-h-64 overflow-y-auto">
                                {assessmentReport.trials.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-[#9999AA]">
                                        No responses were recorded.
                                    </div>
                                ) : (
                                    assessmentReport.trials.map((trial) => (
                                        <div
                                            key={trial.id}
                                            className="
                                                grid
                                                grid-cols-[60px_1fr_100px_110px]
                                                gap-3
                                                px-4
                                                py-3
                                                border-b
                                                border-[#F0F0F5]
                                                text-xs
                                            "
                                        >
                                            <span className="font-semibold text-[#555566]">
                                                #{trial.trialNumber}
                                            </span>
                                            <span className="truncate text-[#555566]">
                                                {trial.objectName}
                                            </span>
                                            <span
                                                className={`font-semibold ${
                                                    trial.result === "correct"
                                                        ? "text-[#3A9A74]"
                                                        : trial.result === "incorrect"
                                                            ? "text-[#D85C70]"
                                                            : "text-[#9999AA]"
                                                }`}
                                            >
                                                {trial.result}
                                            </span>
                                            <span className="text-[#777788]">
                                                {trial.responseTimeMs} ms
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>


                        <div
                            className="
                                mt-5
                                flex
                                items-center
                                justify-end
                                gap-2
                            "
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setShowReport(false);
                                    startPreview();
                                }}
                                className="
                                    h-10
                                    px-4
                                    rounded-xl
                                    bg-[#F1EDFF]
                                    text-[#7C6CFF]
                                    text-xs
                                    font-semibold
                                "
                            >
                                Run Again
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowReport(false)
                                }
                                className="
                                    h-10
                                    px-5
                                    rounded-xl
                                    bg-[#7C6CFF]
                                    text-white
                                    text-xs
                                    font-semibold
                                "
                            >
                                Done
                            </button>
                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default GameBuilder;