import MemoryCard from "./MemoryCard";


const MemoryBoard = ({
    cards,
    handleClick
}) => {


    return (

        <div className="
            grid
            grid-cols-4
            gap-5
        ">


            {
                cards.map(card => (

                    <MemoryCard

                        key={card.id}

                        card={card}

                        onClick={handleClick}

                    />

                ))
            }


        </div>

    );

};


export default MemoryBoard;