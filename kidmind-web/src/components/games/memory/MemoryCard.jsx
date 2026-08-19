const MemoryCard = ({
    card,
    onClick
}) => {


    return (

        <button

            onClick={() => onClick(card)}

            disabled={card.matched}

            className={`
                w-28
                h-28
                rounded-2xl
                text-4xl
                font-bold
                transition-all
                duration-300
                flex
                items-center
                justify-center


                ${
                    card.flipped || card.matched

                    ?

                    "bg-[#7B6EF6] text-white shadow-lg scale-105"

                    :

                    "bg-[#EEE9FF] text-transparent hover:scale-105"

                }


                ${
                    card.matched
                    ?
                    "bg-[#48BB78]"
                    :
                    ""
                }

            `}

        >


            {
                card.flipped || card.matched

                ?

                card.icon

                :

                "?"
            }


        </button>

    );

};


export default MemoryCard;