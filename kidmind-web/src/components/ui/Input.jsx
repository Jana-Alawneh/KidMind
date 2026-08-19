const Input = ({
    label,
    ...props
}) => {


return(

<div className="space-y-2">


<label

className="
text-sm
font-medium
text-[#8E91A8]
"

>

{label}

</label>



<input


{...props}



className="

w-full

h-14

px-5


bg-white


rounded-[18px]


border

border-[#ECECF5]


outline-none



focus:border-[#7C6CFF]


focus:ring-4

focus:ring-[#7C6CFF]/10



transition-all

duration-300


"


/>


</div>

)


}


export default Input;