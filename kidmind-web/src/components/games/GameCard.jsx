import {
    Play,
    Trash2,
    Users,
    BarChart3,
    Pencil
} from "lucide-react";


const GameCard = ({
    game,
    onPlay,
    onDelete,
    onEdit
}) => {

    const Icon =
        game.icon;


    const handleDelete = (
        event
    ) => {

        event.stopPropagation();

        if (!onDelete) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete "${game.title}"?`
            );

        if (!confirmed) {
            return;
        }

        onDelete();

    };


    const handleEdit = (
        event
    ) => {

        event.stopPropagation();

        if (onEdit) {
            onEdit();
        }

    };


    const handlePlay = (
        event
    ) => {

        event.stopPropagation();

        if (onPlay) {
            onPlay();
        }

    };


    return (

        <div
            className="
                relative
                bg-white
                rounded-[24px]
                border
                border-[#ECECF4]
                p-5
                shadow-[0_8px_30px_rgba(30,30,60,0.04)]
                hover:shadow-[0_12px_35px_rgba(30,30,60,0.08)]
                hover:-translate-y-0.5
                transition-all
                duration-200
            "
        >

            {game.isCustom && (

                <div
                    className="
                        absolute
                        top-4
                        right-4
                        flex
                        items-center
                        gap-2
                        z-10
                    "
                >

                    {onEdit && (

                        <button
                            type="button"
                            onClick={
                                handleEdit
                            }
                            title="Edit game"
                            className="
                                w-9
                                h-9
                                rounded-xl
                                bg-[#F1EDFF]
                                text-[#7C6CFF]
                                flex
                                items-center
                                justify-center
                                hover:bg-[#E6E0FF]
                                transition
                            "
                        >

                            <Pencil
                                size={16}
                            />

                        </button>

                    )}


                    {onDelete && (

                        <button
                            type="button"
                            onClick={
                                handleDelete
                            }
                            title="Delete game"
                            className="
                                w-9
                                h-9
                                rounded-xl
                                bg-[#FFF0F3]
                                text-[#EF6A8A]
                                flex
                                items-center
                                justify-center
                                hover:bg-[#FFE2E9]
                                transition
                            "
                        >

                            <Trash2
                                size={16}
                            />

                        </button>

                    )}

                </div>

            )}


            {game.image ? (

                <div
                    className="
                        w-14
                        h-14
                        rounded-2xl
                        overflow-hidden
                        bg-[#F1EDFF]
                    "
                >

                    <img
                        src={
                            game.image
                        }
                        alt={
                            game.title
                        }
                        className="
                            w-full
                            h-full
                            object-cover
                        "
                    />

                </div>

            ) : (

                <div
                    className="
                        w-14
                        h-14
                        rounded-2xl
                        flex
                        items-center
                        justify-center
                    "
                    style={{
                        backgroundColor:
                            game.color ||
                            "#F1EDFF"
                    }}
                >

                    {Icon ? (

                        <Icon
                            size={27}
                            className="
                                text-[#7C6CFF]
                            "
                        />

                    ) : (

                        <BarChart3
                            size={27}
                            className="
                                text-[#7C6CFF]
                            "
                        />

                    )}

                </div>

            )}


            <div
                className="
                    mt-5
                    pr-20
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-2
                        flex-wrap
                    "
                >

                    <h3
                        className="
                            text-lg
                            font-bold
                            text-[#202033]
                        "
                    >

                        {
                            game.title
                        }

                    </h3>


                    {game.isCustom && (

                        <span
                            className="
                                px-2
                                py-1
                                rounded-lg
                                bg-[#F1EDFF]
                                text-[#7C6CFF]
                                text-[10px]
                                font-bold
                            "
                        >

                            CUSTOM

                        </span>

                    )}

                </div>


                <p
                    className="
                        mt-1
                        text-xs
                        font-semibold
                        text-[#7C6CFF]
                    "
                >

                    {
                        game.domain
                    }

                </p>

            </div>


            <p
                className="
                    mt-4
                    text-sm
                    leading-6
                    text-[#88889A]
                    min-h-[48px]
                "
            >

                {
                    game.description
                }

            </p>


            <div
                className="
                    mt-5
                    flex
                    items-center
                    justify-between
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-[#88889A]
                    "
                >

                    <Users
                        size={14}
                    />

                    {
                        game.players ||
                        0
                    } players

                </div>


                <span
                    className="
                        px-3
                        py-1.5
                        rounded-lg
                        bg-[#F7F7FA]
                        text-xs
                        font-semibold
                        text-[#66667A]
                    "
                >

                    {
                        game.level ||
                        "Custom"
                    }

                </span>

            </div>


            <button
                type="button"
                onClick={
                    handlePlay
                }
                className="
                    mt-5
                    w-full
                    h-11
                    rounded-xl
                    bg-[#7C6CFF]
                    text-white
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-sm
                    font-semibold
                    hover:bg-[#6F60F0]
                    transition
                "
            >

                <Play
                    size={16}
                    fill="currentColor"
                />

                Play Game

            </button>

        </div>

    );

};


export default GameCard;