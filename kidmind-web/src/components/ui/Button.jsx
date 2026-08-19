const Button = ({
    children,
    className="",
    ...props
}) => {


return(


<button

{...props}


className={`
    
    h-12
    
    px-6
    
    rounded-[18px]
    
    font-semibold
    
    text-white


    bg-gradient-to-r
    
    from-[#7C6CFF]
    
    to-[#A486FF]


    shadow-[0_10px_25px_rgba(124,108,255,0.25)]


    hover:-translate-y-1
    
    hover:shadow-[0_15px_35px_rgba(124,108,255,0.35)]
    
    
    active:scale-95


    transition-all
    
    duration-300


    ${className}

`}


>


{children}


</button>


)


}


export default Button;