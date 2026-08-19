import Card from "./Card";


const StatCard = ({
    title,
    value,
    subtitle,
    trend,
    icon,
    theme = {
        icon: "bg-[#EEE9FF] text-[#7C6CFF]",
        glow: "bg-[#C4B5FD]"
    }
}) => {


return (

<Card

className="
relative
overflow-hidden

h-[165px]

rounded-2xl

bg-white

border
border-[#ECECF5]

shadow-sm

hover:shadow-xl
hover:-translate-y-2
hover:scale-[1.03]

transition-all
duration-300
ease-out

cursor-pointer
group

"

>


{/* Big background icon */}

<div

className={`

absolute

right-[-25px]

top-1/2

-translate-y-1/2


w-36

h-36


rounded-2xl


flex

items-center

justify-center


opacity-20


transition-all
duration-500


group-hover:translate-x-3
group-hover:rotate-6


${theme.icon}

`}

>


<div

className="
scale-[3]

transition-transform
duration-500

group-hover:scale-[3.3]

"

>

{icon}

</div>


</div>





{/* Content */}

<div

className="
relative
z-10
pr-10
"

>


<p

className="
text-sm
font-medium
text-[#8E91A8]

whitespace-nowrap

"

>

{title}

</p>



<h2

className="
text-3xl
font-bold

text-[#2B2E4A]

mt-3

"

>

{value}

</h2>




<p

className="
text-xs
text-[#8E91A8]

mt-2

"

>

{subtitle}

</p>




<div

className="
mt-5

flex
items-center
gap-2

"

>


<span

className="
text-sm
font-semibold
text-[#64D2A3]

"

>

↑ {trend}

</span>


<span

className="
text-xs
text-[#8E91A8]

"

>

compared to last week

</span>


</div>



</div>



</Card>


)


}


export default StatCard;