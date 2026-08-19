const Card = ({
    children,
    className=""
}) => {


return(

<div

className={`
    
    bg-white
    
    rounded-[24px]
    
    border
    
    border-[#ECECF5]
    
    shadow-[0_10px_40px_rgba(124,108,255,0.08)]
    
    hover:shadow-[0_18px_45px_rgba(124,108,255,0.14)]
    
    transition-all
    
    duration-300
    
    ${className}

`}

>


{children}


</div>

)


}


export default Card;