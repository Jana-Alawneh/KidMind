const Card = ({
  children,
  className = "",
}) => {

  return (

    <div
      className={`
        bg-white
        rounded-[22px]
        border
        border-[#ECECF4]
        shadow-[0_8px_26px_rgba(68,68,110,0.035)]
        p-[22px]
        transition-shadow
        duration-200
        ${className}
      `}
    >

      {children}

    </div>

  );

};


export default Card;