import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Trophy, Timer, RotateCcw, Star, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getGameBuilderGame } from "../api/gameBuilderApi";
const RESULTS_STORAGE_KEY = "customAssessmentResults";
const makeId = (prefix = "item") => {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
};
const normalizeSessionScore = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return 0;
    }
    return Math.max(0, Math.min(100, Math.round(numericValue)));
};
const calculateAssessmentReport = (trials, score, configuredTime, remainingTime, gameTitle, difficulty) => {
    const correct = trials.filter((trial) => trial.result ===
        "correct").length;
    const incorrect = trials.filter((trial) => trial.result ===
        "incorrect").length;
    const neutral = trials.filter((trial) => trial.result ===
        "neutral").length;
    const classified = correct + incorrect;
    const responseTimes = trials
        .map((trial) => Number(trial.responseTimeMs))
        .filter((value) => Number.isFinite(value) &&
        value >= 0);
    const meanResponseTime = responseTimes.length
        ? responseTimes.reduce((sum, value) => sum + value, 0) /
            responseTimes.length
        : 0;
    const sortedResponseTimes = [
        ...responseTimes
    ].sort((a, b) => a - b);
    const medianResponseTime = sortedResponseTimes.length
        ? sortedResponseTimes.length %
            2 ===
            0
            ? (sortedResponseTimes[sortedResponseTimes.length /
                2 -
                1] +
                sortedResponseTimes[sortedResponseTimes.length /
                    2]) /
                2
            : sortedResponseTimes[Math.floor(sortedResponseTimes.length /
                2)]
        : 0;
    const fastestResponseTime = sortedResponseTimes.length
        ? sortedResponseTimes[0]
        : 0;
    const slowestResponseTime = sortedResponseTimes.length
        ? sortedResponseTimes[sortedResponseTimes.length -
            1]
        : 0;
    const variance = responseTimes.length
        ? responseTimes.reduce((sum, value) => sum +
            Math.pow(value -
                meanResponseTime, 2), 0) /
            responseTimes.length
        : 0;
    const responseTimeStdDev = Math.sqrt(variance);
    const accuracy = classified
        ? (correct /
            classified) *
            100
        : 0;
    const errorRate = classified
        ? (incorrect /
            classified) *
            100
        : 0;
    const elapsedSeconds = Math.max(0, Number(configuredTime || 0) -
        Number(remainingTime || 0));
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
        score: normalizeSessionScore(score),
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
const CustomGamePlayer = ({ gameId = null, embedded = false, paused = false, onComplete = null }) => {
    const navigate = useNavigate();
    const { id: routeId } = useParams();
    const id = gameId ||
        routeId;
    const [game, setGame] = useState(null);
    const [loadingGame, setLoadingGame] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [objects, setObjects] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [started, setStarted] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [assessmentReport, setAssessmentReport] = useState(null);
    const [trials, setTrials] = useState([]);
    const timerRef = useRef(null);
    const trialStartRef = useRef(null);
    const trialsRef = useRef([]);
    const scoreRef = useRef(0);
    const timeRef = useRef(0);
    const reportFinishedRef = useRef(false);
    useEffect(() => {
        let active = true;
        const loadGame = async () => {
            try {
                setLoadingGame(true);
                setLoadError("");
                const loaded = await getGameBuilderGame(id);
                if (!active) {
                    return;
                }
                const normalized = {
                    ...loaded,
                    settings: {
                        difficulty: loaded.difficulty ||
                            "Easy",
                        time: Number(loaded.time_seconds ||
                            60),
                        lives: Number(loaded.lives ||
                            3),
                        scoreEnabled: loaded.score_enabled !==
                            false
                    },
                    objects: Array.isArray(loaded.objects)
                        ? loaded.objects
                        : [],
                    rules: Array.isArray(loaded.rules)
                        ? loaded.rules
                        : [],
                    blocks: Array.isArray(loaded.blocks)
                        ? loaded.blocks
                        : []
                };
                setGame(normalized);
                setObjects(normalized.objects);
                setTimeLeft(normalized.settings.time);
                timeRef.current =
                    normalized.settings.time;
            }
            catch (error) {
                if (!active) {
                    return;
                }
                console.error("Could not load game:", error);
                setGame(null);
                setLoadError(error
                    ?.response
                    ?.data
                    ?.message ||
                    "Could not load this custom game.");
            }
            finally {
                if (active) {
                    setLoadingGame(false);
                }
            }
        };
        loadGame();
        return () => {
            active = false;
        };
    }, [id]);
    const saveAssessmentReport = (report) => {
        try {
            const savedReports = JSON.parse(localStorage.getItem(RESULTS_STORAGE_KEY) || "[]");
            localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify([
                ...savedReports,
                report
            ]));
            window.dispatchEvent(new Event("assessment-results-updated"));
        }
        catch (error) {
            console.error("Assessment result save error:", error);
        }
    };
    const finishGame = () => {
        if (reportFinishedRef.current) {
            return;
        }
        reportFinishedRef.current =
            true;
        clearInterval(timerRef.current);
        setCompleted(true);
        const finalTrials = trialsRef.current;
        const finalScore = scoreRef.current;
        const finalTime = timeRef.current;
        const report = calculateAssessmentReport(finalTrials, finalScore, Number(game?.settings?.time ||
            60), finalTime, game?.title ||
            "Custom Game", game?.settings
            ?.difficulty ||
            "Easy");
        setAssessmentReport(report);
        if (embedded &&
            typeof onComplete ===
                "function") {
            const result = {
                status: "Completed",
                duration_seconds: report.elapsedSeconds,
                score: report.score,
                accuracy: report.accuracy,
                mistakes: report.incorrect,
                reaction_time: report.meanResponseTimeMs,
                result_data: {
                    custom_game_id: Number(id),
                    game_title: report.gameTitle,
                    domain: game?.domain ||
                        "Custom Cognitive Assessment",
                    difficulty: report.difficulty,
                    total_responses: report.totalResponses,
                    classified_responses: report.classifiedResponses,
                    correct: report.correct,
                    incorrect: report.incorrect,
                    neutral: report.neutral,
                    error_rate: report.errorRate,
                    mean_response_time_ms: report.meanResponseTimeMs,
                    median_response_time_ms: report.medianResponseTimeMs,
                    fastest_response_time_ms: report.fastestResponseTimeMs,
                    slowest_response_time_ms: report.slowestResponseTimeMs,
                    response_time_std_dev_ms: report.responseTimeStdDevMs,
                    trials: report.trials
                }
            };
            try {
                const completion = onComplete(result);
                Promise.resolve(completion).catch((error) => {
                    console.error("Could not complete custom session game:", error);
                });
            }
            catch (error) {
                console.error("Could not complete custom session game:", error);
            }
            return;
        }
        saveAssessmentReport(report);
        setShowReport(true);
    };
    useEffect(() => {
        if (!started ||
            completed ||
            paused) {
            return;
        }
        if (timeLeft <= 0) {
            finishGame();
            return;
        }
        timerRef.current =
            setInterval(() => {
                setTimeLeft((previous) => {
                    const next = previous -
                        1;
                    timeRef.current =
                        next;
                    if (next <=
                        0) {
                        setTimeout(() => {
                            finishGame();
                        }, 0);
                        return 0;
                    }
                    return next;
                });
            }, 1000);
        return () => {
            clearInterval(timerRef.current);
        };
    }, [
        started,
        completed,
        paused
    ]);
    const runBlocks = async (blocks) => {
        if (!blocks?.length) {
            return;
        }
        for (let index = 0; index <
            blocks.length; index++) {
            const block = blocks[index];
            switch (block.type) {
                case "when-start":
                    setStarted(true);
                    break;
                case "when-click":
                    break;
                case "show":
                    setObjects((previous) => previous.map((object) => ({
                        ...object,
                        visible: true
                    })));
                    break;
                case "hide":
                    setObjects((previous) => previous.map((object) => {
                        if (Array.isArray(block.targetIds) &&
                            block.targetIds.length >
                                0) {
                            return block.targetIds.includes(object.id)
                                ? {
                                    ...object,
                                    visible: false
                                }
                                : object;
                        }
                        return {
                            ...object,
                            visible: false
                        };
                    }));
                    break;
                case "move":
                    setObjects((previous) => previous.map((object) => {
                        if (Array.isArray(block.targetIds) &&
                            block.targetIds.length >
                                0 &&
                            !block.targetIds.includes(object.id)) {
                            return object;
                        }
                        return {
                            ...object,
                            x: object.x +
                                Number(block.moveX ||
                                    30),
                            y: object.y +
                                Number(block.moveY ||
                                    20)
                        };
                    }));
                    break;
                case "wait":
                    await new Promise((resolve) => setTimeout(resolve, Number(block.wait ||
                        1) *
                        1000));
                    break;
                case "add-score": {
                    const rawAmount = Number(block.value ?? 10);
                    const amount = Number.isFinite(rawAmount)
                        ? rawAmount
                        : 0;
                    const nextScore = normalizeSessionScore(scoreRef.current +
                        amount);
                    scoreRef.current =
                        nextScore;
                    setScore(nextScore);
                    break;
                }
                case "remove-score": {
                    const rawAmount = Number(block.value ?? 10);
                    const amount = Number.isFinite(rawAmount)
                        ? rawAmount
                        : 0;
                    const nextScore = normalizeSessionScore(scoreRef.current -
                        amount);
                    scoreRef.current =
                        nextScore;
                    setScore(nextScore);
                    break;
                }
                case "next":
                    setObjects((previous) => previous.map((object) => ({
                        ...object,
                        visible: true
                    })));
                    break;
                default:
                    break;
            }
        }
    };
    const startGame = async () => {
        if (!game) {
            return;
        }
        clearInterval(timerRef.current);
        reportFinishedRef.current =
            false;
        setScore(0);
        scoreRef.current =
            0;
        setTrials([]);
        trialsRef.current =
            [];
        setCompleted(false);
        setShowReport(false);
        setAssessmentReport(null);
        const initialTime = Number(game.settings?.time ||
            60);
        setObjects(Array.isArray(game.objects)
            ? game.objects.map((object) => ({
                ...object,
                visible: object.visible !==
                    false
            }))
            : []);
        setTimeLeft(initialTime);
        timeRef.current =
            initialTime;
        setStarted(true);
        trialStartRef.current =
            performance.now();
        await runBlocks(game.blocks ||
            []);
    };
    useEffect(() => {
        if (!embedded ||
            !game ||
            started ||
            completed ||
            paused) {
            return;
        }
        startGame();
    }, [
        embedded,
        game,
        started,
        completed,
        paused
    ]);
    const handleObjectClick = async (object) => {
        if (!started ||
            completed ||
            paused ||
            reportFinishedRef.current) {
            return;
        }
        const now = performance.now();
        const responseTimeMs = trialStartRef.current ===
            null
            ? 0
            : now -
                trialStartRef.current;
        const blocks = game?.blocks ||
            [];
        const matchingRules = Array.isArray(game?.rules)
            ? game.rules.filter((rule) => {
                if (rule.enabled ===
                    false) {
                    return false;
                }
                if (rule.trigger !==
                    "object-clicked") {
                    return false;
                }
                if (!rule.triggerTargetId) {
                    return true;
                }
                return (rule.triggerTargetId ===
                    object.id);
            })
            : [];
        let scoreDelta = 0;
        matchingRules.forEach((rule) => {
            if (rule.action ===
                "add-score") {
                scoreDelta +=
                    Number(rule.value ||
                        10);
            }
            if (rule.action ===
                "remove-score") {
                scoreDelta -=
                    Number(rule.value ||
                        10);
            }
        });
        const result = scoreDelta > 0
            ? "correct"
            : scoreDelta < 0
                ? "incorrect"
                : "neutral";
        const trial = {
            id: makeId("trial"),
            objectId: object.id,
            objectName: object.name ||
                "Object",
            result,
            scoreDelta,
            responseTimeMs: Number(Math.max(0, responseTimeMs).toFixed(2)),
            timestamp: new Date().toISOString()
        };
        const updatedTrials = [
            ...trialsRef.current,
            trial
        ];
        trialsRef.current =
            updatedTrials;
        setTrials(updatedTrials);
        for (const rule of matchingRules) {
            await runBlocks([
                {
                    type: rule.action,
                    targetIds: rule.targetIds,
                    value: rule.value,
                    wait: rule.wait,
                    moveX: rule.moveX,
                    moveY: rule.moveY
                }
            ]);
        }
        const clickIndex = blocks.findIndex((block) => block.type ===
            "when-click");
        if (clickIndex !==
            -1) {
            await runBlocks(blocks.slice(clickIndex +
                1));
        }
        trialStartRef.current =
            performance.now();
    };
    const resetGame = () => {
        clearInterval(timerRef.current);
        reportFinishedRef.current =
            false;
        setObjects(Array.isArray(game?.objects)
            ? game.objects.map((object) => ({
                ...object,
                visible: true
            }))
            : []);
        setScore(0);
        scoreRef.current =
            0;
        setTrials([]);
        trialsRef.current =
            [];
        setCompleted(false);
        setStarted(false);
        setShowReport(false);
        setAssessmentReport(null);
        const initialTime = Number(game?.settings?.time ||
            60);
        setTimeLeft(initialTime);
        timeRef.current =
            initialTime;
    };
    const renderShape = (object) => {
        const color = object.color ||
            "#7C6CFF";
        if (object.shape ===
            "circle") {
            return (<div className="
                            w-full
                            h-full
                            rounded-full
                        " style={{
                    backgroundColor: color
                }}/>);
        }
        if (object.shape ===
            "square") {
            return (<div className="
                            w-full
                            h-full
                            rounded-2xl
                        " style={{
                    backgroundColor: color
                }}/>);
        }
        if (object.shape ===
            "triangle") {
            return (<div className="
                            w-full
                            h-full
                            flex
                            items-center
                            justify-center
                        ">

                        <div className="
                                w-0
                                h-0
                            " style={{
                    borderLeft: `${object.width / 2}px solid transparent`,
                    borderRight: `${object.width / 2}px solid transparent`,
                    borderBottom: `${object.height}px solid ${color}`
                }}/>

                    </div>);
        }
        if (object.shape ===
            "star") {
            return (<div className="
                            w-full
                            h-full
                            flex
                            items-center
                            justify-center
                        " style={{
                    color
                }}>

                        <Star size="100%" fill="currentColor" strokeWidth={1}/>

                    </div>);
        }
        if (object.shape ===
            "diamond") {
            return (<div className="
                            w-full
                            h-full
                            flex
                            items-center
                            justify-center
                        ">

                        <div className="
                                w-[65%]
                                h-[65%]
                                rotate-45
                                rounded-xl
                            " style={{
                    backgroundColor: color
                }}/>

                    </div>);
        }
        if (object.shape ===
            "card") {
            return (<div className="
                            w-full
                            h-full
                            rounded-2xl
                            border-4
                            bg-white
                            flex
                            items-center
                            justify-center
                        " style={{
                    borderColor: color
                }}>

                        <div className="
                                w-8
                                h-8
                                rounded-full
                            " style={{
                    backgroundColor: `${color}22`
                }}/>

                    </div>);
        }
        return (<div className="
                        w-full
                        h-full
                        rounded-2xl
                    " style={{
                backgroundColor: color
            }}/>);
    };
    const renderObject = (object) => {
        if (object.type ===
            "shape") {
            return renderShape(object);
        }
        if (object.type ===
            "text") {
            return (<div className="
                            w-full
                            h-full
                            flex
                            items-center
                            justify-center
                            font-bold
                            text-xl
                            text-[#202033]
                            text-center
                            px-2
                        ">

                        {object.text ||
                    "Your Text"}

                    </div>);
        }
        if (object.type ===
            "button") {
            return (<div className="
                            w-full
                            h-full
                            rounded-2xl
                            flex
                            items-center
                            justify-center
                            text-white
                            font-semibold
                            shadow-sm
                            px-3
                        " style={{
                    backgroundColor: object.color ||
                        "#7C6CFF"
                }}>

                        {object.text ||
                    "Click Me"}

                    </div>);
        }
        if (object.type ===
            "image") {
            if (object.image) {
                return (<img src={object.image} alt={object.name ||
                        "Game image"} className="
                                w-full
                                h-full
                                object-contain
                                rounded-2xl
                            "/>);
            }
            return (<div className="
                            w-full
                            h-full
                            rounded-2xl
                            bg-[#F1EDFF]
                            flex
                            items-center
                            justify-center
                            text-[#7C6CFF]
                            font-semibold
                        ">
                        Image
                    </div>);
        }
        if (object.type ===
            "timer") {
            return (<div className="
                            w-full
                            h-full
                            rounded-2xl
                            bg-[#EEF9EE]
                            flex
                            items-center
                            justify-center
                            font-bold
                            text-[#303044]
                        ">

                        {timeLeft}s

                    </div>);
        }
        if (object.type ===
            "score") {
            return (<div className="
                            w-full
                            h-full
                            rounded-2xl
                            bg-[#FFF5E8]
                            flex
                            items-center
                            justify-center
                            font-bold
                            text-[#303044]
                        ">

                        Score: {score}

                    </div>);
        }
        return (<div className="
                        w-full
                        h-full
                        rounded-2xl
                        bg-[#F1EDFF]
                        flex
                        items-center
                        justify-center
                        text-[#7C6CFF]
                        text-xs
                        font-semibold
                    ">

                    {object.name ||
                "Object"}

                </div>);
    };
    if (loadingGame) {
        return (<div className={embedded
                ? "min-h-[300px] w-full flex items-center justify-center p-6"
                : "min-h-screen bg-[#F7F8FC] flex items-center justify-center p-6"}>

                <div className="
                        bg-white
                        rounded-[28px]
                        p-10
                        text-center
                        shadow-lg
                        max-w-md
                        w-full
                    ">

                    <p className="
                            text-sm
                            font-semibold
                            text-[#7C6CFF]
                        ">
                        Loading game...
                    </p>

                </div>

            </div>);
    }
    if (!game) {
        return (<div className={embedded
                ? "min-h-[300px] w-full flex items-center justify-center p-6"
                : "min-h-screen bg-[#F7F8FC] flex items-center justify-center p-6"}>

                <div className="
                        bg-white
                        rounded-[28px]
                        p-10
                        text-center
                        shadow-lg
                        max-w-md
                        w-full
                    ">

                    <h1 className="
                            text-2xl
                            font-bold
                            text-[#202033]
                        ">
                        Game Not Found
                    </h1>


                    <p className="
                            mt-3
                            text-sm
                            text-[#9999AA]
                        ">
                        {loadError ||
                "This custom game no longer exists."}
                    </p>


                    {!embedded && (<button type="button" onClick={() => navigate(-1)} className="
                                mt-6
                                w-full
                                h-11
                                rounded-xl
                                bg-[#7C6CFF]
                                text-white
                                font-semibold
                            ">
                            Back to Games
                        </button>)}

                </div>

            </div>);
    }
    return (<div className={embedded
            ? "w-full bg-transparent"
            : "min-h-screen bg-[#F7F8FC] flex flex-col"}>

            

            {!embedded && (<header className="
                    h-16
                    bg-white
                    border-b
                    border-[#E8E8F0]
                    px-5
                    flex
                    items-center
                    justify-between
                ">

                <div className="
                        flex
                        items-center
                        gap-3
                    ">

                    <button type="button" onClick={() => navigate(-1)} className="
                            w-10
                            h-10
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            hover:bg-[#F3F2FA]
                        ">

                        <ArrowLeft size={19}/>

                    </button>


                    <div>

                        <p className="
                                text-[10px]
                                font-bold
                                text-[#7C6CFF]
                                tracking-wider
                            ">
                            CUSTOM GAME
                        </p>


                        <h1 className="
                                text-lg
                                font-bold
                                text-[#202033]
                            ">
                            {game.title}
                        </h1>

                    </div>

                </div>


                <div className="
                        flex
                        items-center
                        gap-3
                    ">

                    <div className="
                            h-10
                            px-4
                            rounded-xl
                            bg-[#FFF5E8]
                            flex
                            items-center
                            gap-2
                            text-sm
                            font-bold
                            text-[#444456]
                        ">

                        <Trophy size={16} className="
                                text-[#F6A65A]
                            "/>

                        {score}

                    </div>


                    <div className="
                            h-10
                            px-4
                            rounded-xl
                            bg-[#EEF9EE]
                            flex
                            items-center
                            gap-2
                            text-sm
                            font-bold
                            text-[#444456]
                        ">

                        <Timer size={16} className="
                                text-[#64D2A3]
                            "/>

                        {timeLeft}s

                    </div>

                </div>

            </header>)}


            {embedded && (<div className="w-full max-w-[900px] mx-auto px-2 pt-2">
                <div className="
                        w-full
                        rounded-2xl
                        border
                        border-[#E8E8F0]
                        bg-white
                        px-4
                        py-3
                        flex
                        items-center
                        justify-between
                        gap-3
                    ">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold tracking-wider text-[#7C6CFF]">
                            CUSTOM GAME
                        </p>
                        <p className="truncate text-base font-bold text-[#303044]">
                            {game.title}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="h-10 px-4 rounded-xl bg-[#FFF5E8] flex items-center gap-2 text-sm font-bold text-[#444456]">
                            <Trophy size={16} className="text-[#F6A65A]"/>
                            Score {score}
                        </div>
                        <div className="h-10 px-4 rounded-xl bg-[#EEF9EE] flex items-center gap-2 text-sm font-bold text-[#444456]">
                            <Timer size={16} className="text-[#64D2A3]"/>
                            {timeLeft}s
                        </div>
                    </div>
                </div>
            </div>)}


            

            <main className={embedded
            ? "w-full p-2 flex items-center justify-center"
            : "flex-1 p-8 flex items-center justify-center"}>

                <div className="
                        relative
                        w-full
                        max-w-[900px]
                        h-[650px]
                        bg-white
                        rounded-[28px]
                        border
                        border-[#E3E3EC]
                        shadow-[0_15px_45px_rgba(30,30,60,0.06)]
                        overflow-hidden
                    ">

                    <div className="
                            absolute
                            inset-0
                            pointer-events-none
                            opacity-40
                        " style={{
            backgroundImage: "radial-gradient(#D8D8E5 1px, transparent 1px)",
            backgroundSize: "24px 24px"
        }}/>


                    {objects.map((object) => {
            if (object.visible ===
                false) {
                return null;
            }
            return (<div key={object.id} onClick={() => handleObjectClick(object)} className={`
                                        absolute
                                        select-none
                                        ${paused
                    ? "cursor-not-allowed"
                    : "cursor-pointer"}
                                    `} style={{
                    left: `${object.x}px`,
                    top: `${object.y}px`,
                    width: `${object.width}px`,
                    height: `${object.height}px`,
                    transform: `rotate(${object.rotation || 0}deg)`
                }}>

                                    {renderObject(object)}

                                </div>);
        })}


                    {objects.length ===
            0 && (<div className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                text-sm
                                text-[#9999AA]
                            ">
                            No objects in this game.
                        </div>)}


                    

                    {!started &&
            !completed &&
            !showReport && (<div className="
                                absolute
                                inset-0
                                bg-white/90
                                backdrop-blur-sm
                                flex
                                items-center
                                justify-center
                            ">

                            <div className="
                                    text-center
                                    max-w-md
                                    px-6
                                ">

                                <div className="
                                        mx-auto
                                        w-16
                                        h-16
                                        rounded-2xl
                                        bg-[#F1EDFF]
                                        flex
                                        items-center
                                        justify-center
                                    ">

                                    <Trophy size={28} className="
                                            text-[#7C6CFF]
                                        "/>

                                </div>


                                <h2 className="
                                        mt-5
                                        text-3xl
                                        font-bold
                                        text-[#202033]
                                    ">
                                    {game.title}
                                </h2>


                                <p className="
                                        mt-2
                                        text-sm
                                        text-[#9999AA]
                                        leading-6
                                    ">
                                    {game.description ||
                "Ready to start?"}
                                </p>


                                <button type="button" onClick={startGame} disabled={paused} className="
                                        mt-6
                                        h-12
                                        px-8
                                        rounded-xl
                                        bg-[#7C6CFF]
                                        text-white
                                        font-semibold
                                        hover:bg-[#6F60F0]
                                        transition
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                    ">
                                    Start Game
                                </button>

                            </div>

                        </div>)}


                    

                    {!embedded &&
            completed &&
            !showReport && (<div className="
                                absolute
                                inset-0
                                bg-white/95
                                flex
                                items-center
                                justify-center
                            ">

                            <div className="
                                    text-center
                                ">

                                <div className="
                                        mx-auto
                                        w-16
                                        h-16
                                        rounded-2xl
                                        bg-[#F1EDFF]
                                        flex
                                        items-center
                                        justify-center
                                    ">

                                    <Trophy size={30} className="
                                            text-[#7C6CFF]
                                        "/>

                                </div>


                                <h2 className="
                                        mt-5
                                        text-2xl
                                        font-bold
                                        text-[#202033]
                                    ">
                                    Game Complete
                                </h2>


                                <p className="
                                        mt-2
                                        text-sm
                                        text-[#9999AA]
                                    ">
                                    Final Score
                                </p>


                                <p className="
                                        mt-1
                                        text-4xl
                                        font-bold
                                        text-[#7C6CFF]
                                    ">
                                    {score}
                                </p>


                                <button type="button" onClick={resetGame} className="
                                        mt-6
                                        h-11
                                        px-6
                                        rounded-xl
                                        bg-[#7C6CFF]
                                        text-white
                                        font-semibold
                                        flex
                                        items-center
                                        gap-2
                                        mx-auto
                                    ">

                                    <RotateCcw size={16}/>

                                    Play Again

                                </button>

                            </div>

                        </div>)}

                </div>

            </main>


            

            {!embedded &&
            showReport &&
            assessmentReport && (<div className="
                        fixed
                        inset-0
                        z-[300]
                        bg-[#151522]/70
                        flex
                        items-center
                        justify-center
                        p-6
                    ">

                    <div className="
                            w-full
                            max-w-[1000px]
                            max-h-[90vh]
                            overflow-y-auto
                            bg-white
                            rounded-[30px]
                            shadow-2xl
                            p-6
                        ">

                        

                        <div className="
                                flex
                                items-center
                                justify-between
                                mb-6
                            ">

                            <div>

                                <p className="
                                        text-lg
                                        font-bold
                                        text-[#303044]
                                    ">
                                    Assessment Report
                                </p>


                                <p className="
                                        mt-1
                                        text-xs
                                        text-[#9999AA]
                                    ">
                                    {assessmentReport.gameTitle}
                                </p>

                            </div>


                            <button type="button" onClick={() => setShowReport(false)} className="
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-[#F7F7FA]
                                    flex
                                    items-center
                                    justify-center
                                    text-[#777788]
                                ">

                                <X size={16}/>

                            </button>

                        </div>


                        

                        <div className="
                                grid
                                grid-cols-2
                                md:grid-cols-4
                                gap-3
                            ">

                            {[
                [
                    "Total Responses",
                    assessmentReport.totalResponses
                ],
                [
                    "Correct",
                    assessmentReport.correct
                ],
                [
                    "Incorrect",
                    assessmentReport.incorrect
                ],
                [
                    "Accuracy",
                    `${assessmentReport.accuracy}%`
                ]
            ].map(([label, value]) => (<div key={label} className="
                                            rounded-2xl
                                            bg-[#F8F7FC]
                                            p-4
                                        ">

                                        <p className="
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-wider
                                                text-[#9999AA]
                                            ">
                                            {label}
                                        </p>


                                        <p className="
                                                mt-2
                                                text-xl
                                                font-bold
                                                text-[#303044]
                                            ">
                                            {value}
                                        </p>

                                    </div>))}

                        </div>


                        

                        <div className="
                                grid
                                grid-cols-2
                                md:grid-cols-4
                                gap-3
                                mt-3
                            ">

                            {[
                [
                    "Score",
                    assessmentReport.score
                ],
                [
                    "Mean Response",
                    `${assessmentReport.meanResponseTimeMs} ms`
                ],
                [
                    "Median Response",
                    `${assessmentReport.medianResponseTimeMs} ms`
                ],
                [
                    "Response Variability",
                    `${assessmentReport.responseTimeStdDevMs} ms`
                ]
            ].map(([label, value]) => (<div key={label} className="
                                            rounded-2xl
                                            border
                                            border-[#E8E8F0]
                                            p-4
                                        ">

                                        <p className="
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-wider
                                                text-[#9999AA]
                                            ">
                                            {label}
                                        </p>


                                        <p className="
                                                mt-2
                                                text-lg
                                                font-bold
                                                text-[#303044]
                                            ">
                                            {value}
                                        </p>

                                    </div>))}

                        </div>


                        

                        <div className="
                                grid
                                grid-cols-2
                                md:grid-cols-4
                                gap-3
                                mt-3
                            ">

                            {[
                [
                    "Fastest",
                    `${assessmentReport.fastestResponseTimeMs} ms`
                ],
                [
                    "Slowest",
                    `${assessmentReport.slowestResponseTimeMs} ms`
                ],
                [
                    "Error Rate",
                    `${assessmentReport.errorRate}%`
                ],
                [
                    "Elapsed Time",
                    `${assessmentReport.elapsedSeconds}s`
                ]
            ].map(([label, value]) => (<div key={label} className="
                                            rounded-2xl
                                            border
                                            border-[#E8E8F0]
                                            p-4
                                        ">

                                        <p className="
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-wider
                                                text-[#9999AA]
                                            ">
                                            {label}
                                        </p>


                                        <p className="
                                                mt-2
                                                text-lg
                                                font-bold
                                                text-[#303044]
                                            ">
                                            {value}
                                        </p>

                                    </div>))}

                        </div>


                        

                        <div className="
                                mt-6
                                rounded-2xl
                                border
                                border-[#E8E8F0]
                                overflow-hidden
                            ">

                            <div className="
                                    px-4
                                    py-3
                                    bg-[#F8F7FC]
                                    border-b
                                    border-[#E8E8F0]
                                ">

                                <p className="
                                        text-xs
                                        font-bold
                                        text-[#303044]
                                    ">
                                    Trial Results
                                </p>

                            </div>


                            <div className="
                                    max-h-64
                                    overflow-y-auto
                                ">

                                {assessmentReport.trials.length ===
                0 ? (<div className="
                                            p-6
                                            text-center
                                            text-xs
                                            text-[#9999AA]
                                        ">
                                        No responses were
                                        recorded.
                                    </div>) : (assessmentReport.trials.map((trial) => (<div key={trial.id} className="
                                                    grid
                                                    grid-cols-[60px_1fr_100px_110px]
                                                    gap-3
                                                    px-4
                                                    py-3
                                                    border-b
                                                    border-[#F0F0F5]
                                                    text-xs
                                                ">

                                                <span className="
                                                        font-semibold
                                                        text-[#555566]
                                                    ">
                                                    #
                                                    {trial.trialNumber}
                                                </span>


                                                <span className="
                                                        truncate
                                                        text-[#555566]
                                                    ">
                                                    {trial.objectName}
                                                </span>


                                                <span className={`
                                                        font-semibold
                                                        ${trial.result ===
                    "correct"
                    ? "text-[#3A9A74]"
                    : trial.result ===
                        "incorrect"
                        ? "text-[#D85C70]"
                        : "text-[#9999AA]"}
                                                    `}>
                                                    {trial.result}
                                                </span>


                                                <span className="
                                                        text-[#777788]
                                                    ">
                                                    {trial.responseTimeMs}{" "}
                                                    ms
                                                </span>

                                            </div>)))}

                            </div>

                        </div>


                        

                        <div className="
                                mt-5
                                flex
                                items-center
                                justify-end
                                gap-2
                            ">

                            <button type="button" onClick={() => {
                setShowReport(false);
                resetGame();
            }} className="
                                    h-10
                                    px-4
                                    rounded-xl
                                    bg-[#F1EDFF]
                                    text-[#7C6CFF]
                                    text-xs
                                    font-semibold
                                ">
                                Run Again
                            </button>


                            <button type="button" onClick={() => navigate("/games")} className="
                                    h-10
                                    px-5
                                    rounded-xl
                                    bg-[#7C6CFF]
                                    text-white
                                    text-xs
                                    font-semibold
                                ">
                                Done
                            </button>

                        </div>

                    </div>

                </div>)}

        </div>);
};
export default CustomGamePlayer;
